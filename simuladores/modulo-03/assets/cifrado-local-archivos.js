(() => {
  'use strict';

  const {
    encoder,
    decoder,
    randomBytes,
    bytesToHex,
    bytesToBase64,
    base64ToBytes,
    concatBytes,
    clampIterations,
    deriveAesGcmKey,
    splitGcmResult,
    formatDuration,
    safeFileName,
    downloadBlob
  } = Class3Crypto;
  const { setStatus } = Lab;
  const $ = (selector) => document.querySelector(selector);
  const MAX_SOURCE_BYTES = 5 * 1024 * 1024;
  const MAX_PACKAGE_BYTES = 8 * 1024 * 1024;
  const FORMAT = 'CBB-AES-GCM-1';

  const state = {
    sourceFile: null,
    package: null,
    recoveredBlob: null,
    recoveredName: null
  };

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
    return `${(bytes / 1024 ** 2).toFixed(2)} MiB`;
  }

  function sourceMetadata(file) {
    return {
      name: safeFileName(file.name, 'archivo.bin'),
      type: file.type || 'application/octet-stream',
      size: file.size,
      lastModified: Number.isFinite(file.lastModified) ? file.lastModified : 0
    };
  }

  function selectSource(file) {
    if (!file) return;
    if (file.size > MAX_SOURCE_BYTES) {
      state.sourceFile = null;
      throw new Error(`El archivo mide ${formatBytes(file.size)} y supera el límite educativo de 5 MiB.`);
    }
    state.sourceFile = file;
    $('#source-summary').innerHTML = '';
    const name = document.createElement('strong');
    name.textContent = file.name;
    $('#source-summary').append(name, document.createTextNode(` · ${formatBytes(file.size)} · ${file.type || 'tipo no declarado'}`));
    $('#original-bytes').textContent = file.size.toLocaleString('es-AR');
    setStatus($('#encrypt-status'), 'Archivo listo. La lectura comenzará solamente al presionar “Cifrar”.', 'good');
  }

  function packageToText(pack) {
    return JSON.stringify(pack, null, 2);
  }

  function validatePackage(input) {
    const pack = typeof input === 'string' ? JSON.parse(input) : input;
    if (!pack || typeof pack !== 'object') throw new Error('El paquete debe ser un objeto JSON.');
    if (pack.format !== FORMAT) throw new Error('Formato de paquete no compatible.');
    if (pack.algorithm !== 'AES-256-GCM') throw new Error('El algoritmo declarado no es AES-256-GCM.');
    if (!pack.kdf || pack.kdf.name !== 'PBKDF2' || pack.kdf.hash !== 'SHA-256' || pack.kdf.normalization !== 'NFC') {
      throw new Error('Los parámetros KDF no son compatibles.');
    }
    if (!Number.isSafeInteger(pack.kdf.iterations) || pack.kdf.iterations < 10_000 || pack.kdf.iterations > 1_000_000) {
      throw new Error('La cantidad de iteraciones está fuera del perfil del laboratorio.');
    }
    const salt = base64ToBytes(pack.kdf.salt);
    const iv = base64ToBytes(pack.iv);
    const ciphertext = base64ToBytes(pack.ciphertext);
    const tag = base64ToBytes(pack.tag);
    const aad = base64ToBytes(pack.aad);
    if (salt.length !== 16) throw new Error('La salt debe tener 16 bytes.');
    if (iv.length !== 12) throw new Error('El IV debe tener 12 bytes.');
    if (tag.length !== 16) throw new Error('El tag debe tener 16 bytes.');
    if (ciphertext.length > MAX_SOURCE_BYTES) throw new Error('El contenido cifrado supera el límite del laboratorio.');

    let metadata;
    try {
      metadata = JSON.parse(decoder.decode(aad));
    } catch {
      throw new Error('El AAD no contiene metadatos JSON válidos.');
    }
    if (!metadata || typeof metadata.name !== 'string' || !Number.isSafeInteger(metadata.size) || metadata.size < 0 || metadata.size > MAX_SOURCE_BYTES) {
      throw new Error('Los metadatos autenticados no son válidos.');
    }
    return { pack, salt, iv, ciphertext, tag, aad, metadata };
  }

  function renderPackage(pack) {
    const parsed = validatePackage(pack);
    state.package = parsed.pack;
    $('#package-json').value = packageToText(parsed.pack);
    $('#salt-view').textContent = bytesToHex(parsed.salt, ' ');
    $('#iv-view').textContent = bytesToHex(parsed.iv, ' ');
    const cipherPreview = bytesToHex(parsed.ciphertext.slice(0, 64), ' ');
    $('#ciphertext-view').textContent = `${cipherPreview}${parsed.ciphertext.length > 64 ? ' …' : ''} (${parsed.ciphertext.length.toLocaleString('es-AR')} bytes)`;
    $('#tag-view').textContent = bytesToHex(parsed.tag, ' ');
    $('#aad-view').textContent = decoder.decode(parsed.aad);
    $('#original-bytes').textContent = parsed.metadata.size.toLocaleString('es-AR');
    $('#package-state').textContent = 'Estructura válida; autenticación pendiente';
    $('#download-package').disabled = false;
    $('#download-plain').disabled = true;
    state.recoveredBlob = null;
    state.recoveredName = null;
    return parsed;
  }

  async function encryptFile() {
    const button = $('#encrypt-file');
    button.disabled = true;
    try {
      if (!state.sourceFile) throw new Error('Seleccioná un archivo o generá el archivo de demostración.');
      const password = $('#file-password').value;
      if (!password.length) throw new Error('Ingresá una contraseña ficticia.');
      const iterations = clampIterations($('#file-iterations').value);
      $('#file-iterations').value = iterations;

      const fileBytes = new Uint8Array(await state.sourceFile.arrayBuffer());
      const metadata = sourceMetadata(state.sourceFile);
      const aad = encoder.encode(JSON.stringify(metadata));
      const salt = randomBytes(16);
      const iv = randomBytes(12);

      const deriveStart = performance.now();
      const key = await deriveAesGcmKey(password, salt, iterations);
      const deriveMs = performance.now() - deriveStart;
      const cipherStart = performance.now();
      const encrypted = new Uint8Array(await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 },
        key,
        fileBytes
      ));
      const cipherMs = performance.now() - cipherStart;
      const { ciphertext, tag } = splitGcmResult(encrypted);

      const pack = {
        format: FORMAT,
        algorithm: 'AES-256-GCM',
        tagBits: 128,
        kdf: {
          name: 'PBKDF2',
          hash: 'SHA-256',
          iterations,
          normalization: 'NFC',
          salt: bytesToBase64(salt)
        },
        iv: bytesToBase64(iv),
        aad: bytesToBase64(aad),
        ciphertext: bytesToBase64(ciphertext),
        tag: bytesToBase64(tag)
      };

      renderPackage(pack);
      $('#derived-time').textContent = formatDuration(deriveMs);
      $('#cipher-time').textContent = formatDuration(cipherMs);
      $('#package-state').textContent = 'Cifrado; autenticación lista para verificar';
      setStatus(
        $('#encrypt-status'),
        `Archivo cifrado localmente: ${fileBytes.length.toLocaleString('es-AR')} bytes de entrada, ${ciphertext.length.toLocaleString('es-AR')} bytes de ciphertext y 16 bytes de tag.`,
        'good'
      );
      setStatus($('#decrypt-status'), 'Paquete generado. Ahora descifralo o alterá un bit para probar la autenticación.', '');
    } catch (error) {
      setStatus($('#encrypt-status'), error.message, 'bad');
      $('#package-state').textContent = 'Error';
    } finally {
      button.disabled = false;
    }
  }

  async function decryptFile() {
    const button = $('#decrypt-file');
    button.disabled = true;
    try {
      const parsed = renderPackage($('#package-json').value);
      const password = $('#file-password').value;
      if (!password.length) throw new Error('Ingresá la contraseña ficticia utilizada al cifrar.');
      const deriveStart = performance.now();
      const key = await deriveAesGcmKey(password, parsed.salt, parsed.pack.kdf.iterations);
      const deriveMs = performance.now() - deriveStart;
      const cipherStart = performance.now();
      const plaintext = new Uint8Array(await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: parsed.iv, additionalData: parsed.aad, tagLength: 128 },
        key,
        concatBytes(parsed.ciphertext, parsed.tag)
      ));
      const cipherMs = performance.now() - cipherStart;
      if (plaintext.length !== parsed.metadata.size) throw new Error('El tamaño recuperado no coincide con los metadatos autenticados.');

      state.recoveredBlob = new Blob([plaintext], { type: parsed.metadata.type || 'application/octet-stream' });
      state.recoveredName = safeFileName(parsed.metadata.name, 'archivo-recuperado.bin');
      $('#download-plain').disabled = false;
      $('#derived-time').textContent = formatDuration(deriveMs);
      $('#cipher-time').textContent = formatDuration(cipherMs);
      $('#package-state').textContent = 'Autenticación válida; archivo recuperado';
      setStatus(
        $('#decrypt-status'),
        `Autenticación válida. Se recuperaron ${plaintext.length.toLocaleString('es-AR')} bytes y el archivo está listo para descargar.`,
        'good'
      );
    } catch {
      state.recoveredBlob = null;
      state.recoveredName = null;
      $('#download-plain').disabled = true;
      $('#package-state').textContent = 'Paquete rechazado';
      setStatus(
        $('#decrypt-status'),
        'No fue posible autenticar el paquete. La contraseña o alguno de sus componentes no coincide; no se entrega ningún archivo.',
        'bad'
      );
    } finally {
      button.disabled = false;
    }
  }

  function tamperPackage() {
    try {
      const parsed = validatePackage($('#package-json').value);
      if (parsed.ciphertext.length) parsed.ciphertext[0] ^= 1;
      else parsed.tag[0] ^= 1;
      parsed.pack.ciphertext = bytesToBase64(parsed.ciphertext);
      parsed.pack.tag = bytesToBase64(parsed.tag);
      $('#package-json').value = packageToText(parsed.pack);
      state.package = parsed.pack;
      state.recoveredBlob = null;
      $('#download-plain').disabled = true;
      $('#ciphertext-view').textContent = `${bytesToHex(parsed.ciphertext.slice(0, 64), ' ')}${parsed.ciphertext.length > 64 ? ' …' : ''} (${parsed.ciphertext.length.toLocaleString('es-AR')} bytes)`;
      $('#package-state').textContent = 'Modificado; autenticación pendiente';
      setStatus($('#decrypt-status'), 'Se alteró un bit del paquete. Intentá descifrarlo: GCM debería rechazarlo.', 'warn');
    } catch (error) {
      setStatus($('#decrypt-status'), error.message, 'bad');
    }
  }

  async function importPackage(file) {
    if (!file) return;
    if (file.size > MAX_PACKAGE_BYTES) throw new Error('El paquete JSON supera el límite de 8 MiB.');
    const text = await file.text();
    const parsed = renderPackage(text);
    $('#package-summary').textContent = `${file.name} · ${formatBytes(file.size)} · ${parsed.metadata.name}`;
    setStatus($('#decrypt-status'), 'Paquete importado y estructura validada. Falta verificar contraseña y tag.', 'good');
  }

  $('#source-file').addEventListener('change', (event) => {
    try {
      selectSource(event.target.files[0]);
    } catch (error) {
      setStatus($('#encrypt-status'), error.message, 'bad');
    }
  });
  $('#demo-file').addEventListener('click', () => {
    const content = [
      'Criptografía y Blockchain · Clase 3',
      'Este archivo es completamente ficticio.',
      'Objetivo: cifrar, exportar, importar y verificar una alteración con AES-GCM.'
    ].join('\n');
    selectSource(new File([content], 'demostracion-clase-3.txt', { type: 'text/plain;charset=utf-8', lastModified: Date.now() }));
  });
  $('#encrypt-file').addEventListener('click', encryptFile);
  $('#decrypt-file').addEventListener('click', decryptFile);
  $('#tamper-package').addEventListener('click', tamperPackage);
  $('#package-file').addEventListener('change', async (event) => {
    try {
      await importPackage(event.target.files[0]);
    } catch (error) {
      setStatus($('#decrypt-status'), error.message, 'bad');
    }
  });
  $('#package-json').addEventListener('input', () => {
    state.recoveredBlob = null;
    $('#download-plain').disabled = true;
    $('#package-state').textContent = 'Editado; validación pendiente';
  });
  $('#download-package').addEventListener('click', () => {
    try {
      const parsed = validatePackage($('#package-json').value);
      const name = `${safeFileName(parsed.metadata.name)}.cifrado.json`;
      downloadBlob(name, new Blob([packageToText(parsed.pack)], { type: 'application/json;charset=utf-8' }));
    } catch (error) {
      setStatus($('#decrypt-status'), error.message, 'bad');
    }
  });
  $('#download-plain').addEventListener('click', () => {
    if (!state.recoveredBlob || !state.recoveredName) {
      setStatus($('#decrypt-status'), 'Primero autenticá y descifrá el paquete.', 'bad');
      return;
    }
    downloadBlob(state.recoveredName, state.recoveredBlob);
  });

  $('#uploaded-bytes').textContent = '0';
})();
