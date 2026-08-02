(() => {
  'use strict';

  const {
    encoder,
    decoder,
    randomBytes,
    bytesToHex,
    concatBytes,
    sha256Bytes,
    importAesKey,
    splitGcmResult,
    splitBlocks,
    pkcs7PaddingLength
  } = Class3Crypto;
  const { setStatus } = Lab;
  const $ = (selector) => document.querySelector(selector);

  const state = {
    rawKey: null,
    keyLength: 0,
    package: null,
    previousCiphertext: null,
    tamperRows: []
  };

  function cloneBytes(value) {
    return new Uint8Array(value);
  }

  function renderBlocks(container, bytes, prefix) {
    container.replaceChildren();
    const blocks = splitBlocks(bytes);
    if (!blocks.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'Sin bytes para mostrar.';
      container.append(empty);
      return;
    }
    blocks.forEach((block, index) => {
      const card = document.createElement('div');
      card.className = 'byte-block';
      const title = document.createElement('b');
      title.textContent = `${prefix} ${index + 1} · ${block.length} byte${block.length === 1 ? '' : 's'}`;
      const code = document.createElement('code');
      code.textContent = bytesToHex(block, ' ');
      card.append(title, code);
      container.append(card);
    });
  }

  function renderEcbPattern() {
    const parts = $('#ecb-message').value.split('|').map((part) => part.trim());
    const output = $('#ecb-pattern');
    output.replaceChildren();
    const labels = new Map();
    let nextLabel = 1;
    let repeated = false;
    let allSixteen = true;

    parts.forEach((part) => {
      const byteLength = encoder.encode(part).length;
      if (byteLength !== 16) allSixteen = false;
      if (!labels.has(part)) labels.set(part, nextLabel++);
      else repeated = true;

      const block = document.createElement('div');
      block.className = `pattern-block ${parts.filter((item) => item === part).length > 1 ? 'same' : ''}`;
      block.textContent = `E${labels.get(part)} · ${byteLength} B`;
      block.title = `Bloque claro: ${part}`;
      output.append(block);
    });

    setStatus(
      $('#ecb-status'),
      `${repeated ? 'El patrón repetido permanece visible' : 'No hay bloques repetidos en esta entrada'}. ${allSixteen ? 'Todos los segmentos miden 16 bytes.' : 'Algún segmento no mide 16 bytes; ajustalo para modelar un bloque AES completo.'} Las etiquetas no son criptogramas reales.`,
      repeated && allSixteen ? 'warn' : 'good'
    );
  }

  async function ensureSessionKey(force = false) {
    const requestedLength = Number($('#key-length').value);
    if (force || !state.rawKey || state.keyLength !== requestedLength) {
      state.rawKey = randomBytes(requestedLength / 8);
      state.keyLength = requestedLength;
      state.package = null;
      state.previousCiphertext = null;
    }
    const fingerprint = await sha256Bytes(state.rawKey);
    $('#key-fingerprint').textContent = `${bytesToHex(fingerprint.slice(0, 12), ' ')} …`;
    $('#key-bits').textContent = requestedLength;
  }

  function currentConfig() {
    const mode = $('#mode').value;
    if (mode === 'AES-CBC') {
      return { mode, parameter: randomBytes(16), parameterName: 'IV', parameterBits: 128 };
    }
    if (mode === 'AES-CTR') {
      return { mode, parameter: randomBytes(16), parameterName: 'Contador inicial', parameterBits: 128 };
    }
    return { mode, parameter: randomBytes(12), parameterName: 'Nonce', parameterBits: 96 };
  }

  async function decryptPackage(pack) {
    const key = await importAesKey(state.rawKey, pack.mode);
    if (pack.mode === 'AES-CBC') {
      return crypto.subtle.decrypt({ name: 'AES-CBC', iv: pack.parameter }, key, pack.ciphertext);
    }
    if (pack.mode === 'AES-CTR') {
      return crypto.subtle.decrypt({ name: 'AES-CTR', counter: pack.parameter, length: 64 }, key, pack.ciphertext);
    }
    return crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: pack.parameter, additionalData: pack.aad, tagLength: 128 },
      key,
      concatBytes(pack.ciphertext, pack.tag)
    );
  }

  function renderPackage(pack, plaintextBytes) {
    $('#parameter-label').textContent = pack.parameterName;
    $('#parameter-output').textContent = bytesToHex(pack.parameter, ' ');
    $('#ciphertext-output').textContent = bytesToHex(pack.ciphertext, ' ');
    $('#tag-output').textContent = pack.tag ? bytesToHex(pack.tag, ' ') : 'Este modo no produce tag.';
    $('#aad-output').textContent = pack.mode === 'AES-GCM' ? decoder.decode(pack.aad) || '(AAD vacío)' : 'No se utiliza en este modo.';
    $('#iv-bits').textContent = pack.parameterBits;
    $('#auth-state').textContent = pack.mode === 'AES-GCM' ? 'Válida' : 'No incluida';
    $('#tamper-output').textContent = 'Paquete original verificado correctamente.';

    let visualPlaintext = plaintextBytes;
    if (pack.mode === 'AES-CBC') {
      const paddingLength = pkcs7PaddingLength(plaintextBytes.length);
      visualPlaintext = concatBytes(plaintextBytes, new Uint8Array(paddingLength).fill(paddingLength));
      $('#padding-description').textContent = `PKCS#7 agrega ${paddingLength} byte${paddingLength === 1 ? '' : 's'} con valor hexadecimal ${paddingLength.toString(16).padStart(2, '0')}.`;
    } else {
      $('#padding-description').textContent = `${pack.mode} no necesita padding; procesa exactamente ${plaintextBytes.length} bytes de texto.`;
    }
    renderBlocks($('#plain-blocks'), visualPlaintext, 'P');
    renderBlocks($('#cipher-blocks'), pack.ciphertext, 'C');
  }

  async function encrypt(repeated = false) {
    const buttons = [$('#encrypt'), $('#repeat-encryption'), $('#new-key'), $('#tamper-data'), $('#tamper-context')];
    buttons.forEach((button) => { button.disabled = true; });
    try {
      await ensureSessionKey();
      const plaintext = encoder.encode($('#message').value);
      if (!plaintext.length) throw new Error('Ingresá un mensaje para cifrar.');
      const aad = encoder.encode($('#aad').value);
      const config = currentConfig();
      const key = await importAesKey(state.rawKey, config.mode);
      let ciphertext;
      let tag = null;

      if (config.mode === 'AES-CBC') {
        ciphertext = new Uint8Array(await crypto.subtle.encrypt(
          { name: 'AES-CBC', iv: config.parameter },
          key,
          plaintext
        ));
      } else if (config.mode === 'AES-CTR') {
        ciphertext = new Uint8Array(await crypto.subtle.encrypt(
          { name: 'AES-CTR', counter: config.parameter, length: 64 },
          key,
          plaintext
        ));
      } else {
        const encrypted = new Uint8Array(await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: config.parameter, additionalData: aad, tagLength: 128 },
          key,
          plaintext
        ));
        ({ ciphertext, tag } = splitGcmResult(encrypted));
      }

      const previous = state.package;
      state.previousCiphertext = previous ? bytesToHex(previous.ciphertext) : null;
      state.package = {
        ...config,
        ciphertext,
        tag,
        aad,
        originalPlaintext: plaintext
      };
      const verification = new Uint8Array(await decryptPackage(state.package));
      if (bytesToHex(verification) !== bytesToHex(plaintext)) throw new Error('La verificación interna no recuperó el mensaje original.');
      renderPackage(state.package, plaintext);

      const changed = previous && bytesToHex(previous.ciphertext) !== bytesToHex(ciphertext);
      setStatus(
        $('#mode-status'),
        repeated && previous
          ? `${config.mode} volvió a cifrar con la misma clave y un ${config.parameterName.toLowerCase()} nuevo: el criptograma ${changed ? 'cambió como se esperaba' : 'no cambió; revisá la unicidad del parámetro'}.`
          : `${config.mode} ejecutado y descifrado correctamente con una clave AES de ${state.keyLength} bits.`,
        changed || !repeated ? 'good' : 'bad'
      );
    } catch (error) {
      setStatus($('#mode-status'), error.message, 'bad');
      $('#auth-state').textContent = 'Error';
    } finally {
      buttons.forEach((button) => { button.disabled = false; });
    }
  }

  function addTamperRow(mode, decrypted, authenticated, interpretation) {
    state.tamperRows.unshift({ mode, decrypted, authenticated, interpretation });
    state.tamperRows = state.tamperRows.slice(0, 6);
    const body = $('#tamper-history');
    body.replaceChildren();
    for (const rowData of state.tamperRows) {
      const row = document.createElement('tr');
      for (const value of [rowData.mode, rowData.decrypted, rowData.authenticated, rowData.interpretation]) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      }
      body.append(row);
    }
  }

  async function tamper(kind) {
    if (!state.package) {
      setStatus($('#mode-status'), 'Primero cifrá un mensaje.', 'bad');
      return;
    }
    const original = state.package;
    const altered = {
      ...original,
      parameter: cloneBytes(original.parameter),
      ciphertext: cloneBytes(original.ciphertext),
      tag: original.tag ? cloneBytes(original.tag) : null,
      aad: cloneBytes(original.aad)
    };

    if (kind === 'data') {
      if (altered.ciphertext.length) altered.ciphertext[0] ^= 1;
      else if (altered.tag) altered.tag[0] ^= 1;
    } else if (altered.mode === 'AES-GCM') {
      altered.aad = concatBytes(altered.aad, encoder.encode(';alterado=1'));
    } else {
      altered.parameter[0] ^= 1;
    }

    try {
      const plaintext = new Uint8Array(await decryptPackage(altered));
      const recovered = decoder.decode(plaintext);
      $('#tamper-output').textContent = recovered;
      $('#auth-state').textContent = 'No disponible';
      const target = kind === 'data' ? 'datos cifrados' : altered.parameterName.toLowerCase();
      setStatus(
        $('#mode-status'),
        `${altered.mode} produjo una salida después de alterar ${target}. No existe un tag que certifique que el resultado sea auténtico.`,
        'warn'
      );
      addTamperRow(altered.mode, 'Sí', 'No disponible', 'La corrupción no fue autenticada. “Descifrar” no prueba integridad.');
    } catch {
      if (altered.mode === 'AES-GCM') {
        $('#tamper-output').textContent = 'Paquete rechazado: la verificación del tag falló.';
        $('#auth-state').textContent = 'Rechazada';
        setStatus($('#mode-status'), 'AES-GCM detectó la alteración y rechazó el paquete antes de entregar texto claro.', 'good');
        addTamperRow(altered.mode, 'No', 'Sí', 'El tag cubre ciphertext, nonce y AAD.');
      } else {
        $('#tamper-output').textContent = 'El descifrado produjo un error de formato o padding.';
        $('#auth-state').textContent = 'No disponible';
        setStatus($('#mode-status'), 'El error no constituye autenticación: CBC o CTR no poseen un tag que pruebe integridad.', 'warn');
        addTamperRow(altered.mode, 'No', 'No', 'Un error incidental no equivale a verificación criptográfica.');
      }
    }
  }

  $('#show-ecb').addEventListener('click', renderEcbPattern);
  $('#encrypt').addEventListener('click', () => encrypt(false));
  $('#repeat-encryption').addEventListener('click', () => encrypt(true));
  $('#new-key').addEventListener('click', async () => {
    try {
      await ensureSessionKey(true);
      $('#parameter-output').textContent = '—';
      $('#ciphertext-output').textContent = '—';
      $('#tag-output').textContent = 'Cifrá para obtener el tag.';
      $('#auth-state').textContent = 'Pendiente';
      setStatus($('#mode-status'), 'Se generó una nueva clave de sesión. Cifrá para crear un paquete.', 'good');
    } catch (error) {
      setStatus($('#mode-status'), error.message, 'bad');
    }
  });
  $('#tamper-data').addEventListener('click', () => tamper('data'));
  $('#tamper-context').addEventListener('click', () => tamper('context'));
  $('#mode').addEventListener('change', () => {
    state.package = null;
    const mode = $('#mode').value;
    $('#aad').disabled = mode !== 'AES-GCM';
    $('#iv-bits').textContent = mode === 'AES-GCM' ? '96' : '128';
    $('#auth-state').textContent = 'Pendiente';
    setStatus($('#mode-status'), `${mode} seleccionado. Ejecutá un cifrado para generar parámetros nuevos.`, '');
  });
  $('#key-length').addEventListener('change', () => {
    state.rawKey = null;
    state.package = null;
    $('#key-bits').textContent = $('#key-length').value;
    $('#key-fingerprint').textContent = 'Se generará al cifrar.';
  });

  try {
    renderEcbPattern();
    $('#aad').disabled = false;
  } catch (error) {
    setStatus($('#mode-status'), error.message, 'bad');
  }
})();
