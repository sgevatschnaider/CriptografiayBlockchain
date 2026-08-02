(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  let key = null;
  let baselineIv = null;
  let baselineCiphertext = null;
  let candidateIv = null;
  let candidateCiphertext = null;
  let queryCount = 0;

  function assertWebCrypto() {
    if (!globalThis.crypto?.subtle || !globalThis.isSecureContext) throw new Error('Web Crypto requiere HTTPS o localhost.');
  }

  function clone(bytes) {
    return new Uint8Array(bytes);
  }

  function renderPacket(state = 'Listo') {
    byId('oracle-iv').textContent = candidateIv ? Lab.bytesToHex(candidateIv) : '—';
    byId('oracle-ciphertext').textContent = candidateCiphertext ? Lab.bytesToHex(candidateCiphertext) : '—';
    byId('oracle-iv-last').textContent = candidateIv ? `0x${candidateIv.at(-1).toString(16).padStart(2, '0')}` : '—';
    byId('oracle-packet-state').textContent = state;
  }

  function updateQueryCount() {
    byId('oracle-query-count').textContent = queryCount;
  }

  async function encryptMessage() {
    try {
      assertWebCrypto();
      const message = Lab.te.encode(byId('oracle-message').value);
      if (message.length < 1 || message.length > 15) throw new Error(`El mensaje ocupa ${message.length} bytes; debe ocupar entre 1 y 15.`);
      key = await crypto.subtle.generateKey({ name: 'AES-CBC', length: 256 }, false, ['encrypt', 'decrypt']);
      baselineIv = Module03.randomBytes(16);
      baselineCiphertext = new Uint8Array(await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: baselineIv },
        key,
        message
      ));
      candidateIv = clone(baselineIv);
      candidateCiphertext = clone(baselineCiphertext);
      queryCount = 0;
      const padding = 16 - (message.length % 16);
      byId('oracle-message-bytes').textContent = message.length;
      byId('oracle-padding-bytes').textContent = `${padding} · 0x${padding.toString(16).padStart(2, '0')}`;
      byId('oracle-cipher-bytes').textContent = baselineCiphertext.length;
      byId('oracle-blocks').textContent = baselineCiphertext.length / 16;
      byId('oracle-delta').textContent = '—';
      byId('oracle-recovered-byte').textContent = '—';
      byId('oracle-recovered-meaning').textContent = '—';
      byId('oracle-scan-queries').textContent = '0';
      renderPacket('Original');
      updateQueryCount();
      Lab.setStatus(byId('oracle-build-status'), `Paquete creado. Web Crypto añadió ${padding} byte(s) PKCS#7 antes de cifrar.`, 'good');
      Lab.setStatus(byId('oracle-scan-status'), 'El paquete original es válido. Ejecutá la búsqueda controlada.', 'good');
    } catch (error) {
      Lab.setStatus(byId('oracle-build-status'), error.message, 'bad');
    }
  }

  async function oracle(iv = candidateIv, ciphertext = candidateCiphertext, count = true) {
    if (!key || !iv || !ciphertext) throw new Error('Generá un paquete primero.');
    if (count) {
      queryCount += 1;
      updateQueryCount();
    }
    try {
      const plaintext = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, ciphertext);
      return { valid: true, plaintext: new Uint8Array(plaintext) };
    } catch {
      return { valid: false, plaintext: null };
    }
  }

  async function queryLeaky() {
    try {
      const result = await oracle();
      Lab.setStatus(byId('leaky-oracle-status'), result.valid
        ? '200 · PADDING_VALIDO: el receptor continuaría procesando.'
        : '500 · ERROR_PADDING: el receptor reveló la condición exacta.', result.valid ? 'good' : 'bad');
    } catch (error) {
      Lab.setStatus(byId('leaky-oracle-status'), error.message, 'bad');
    }
  }

  async function queryUniform() {
    try {
      const result = await oracle();
      Lab.setStatus(byId('uniform-oracle-status'), result.valid
        ? 'Paquete aceptado.'
        : 'No se pudo procesar el paquete.', result.valid ? 'good' : 'bad');
    } catch (error) {
      Lab.setStatus(byId('uniform-oracle-status'), 'No se pudo procesar el paquete.', 'bad');
    }
  }

  function restorePacket() {
    if (!baselineIv || !baselineCiphertext) {
      Lab.setStatus(byId('oracle-build-status'), 'Generá un paquete antes de restaurarlo.', 'warn');
      return;
    }
    candidateIv = clone(baselineIv);
    candidateCiphertext = clone(baselineCiphertext);
    renderPacket('Restaurado');
    Lab.setStatus(byId('oracle-build-status'), 'Se restauraron IV y ciphertext originales.', 'good');
  }

  async function scanOracle() {
    try {
      if (!baselineIv || !baselineCiphertext) throw new Error('Generá un paquete válido primero.');
      let found = null;
      let scanQueries = 0;
      for (let delta = 1; delta <= 255; delta += 1) {
        const modified = clone(baselineIv);
        modified[15] ^= delta;
        const result = await oracle(modified, baselineCiphertext, true);
        scanQueries += 1;
        if (result.valid) {
          found = { delta, modified };
          break;
        }
      }
      if (!found) throw new Error('No se encontró una modificación válida; regenerá el paquete y repetí.');
      const recovered = found.modified[15] ^ baselineIv[15] ^ 0x01;
      candidateIv = found.modified;
      candidateCiphertext = clone(baselineCiphertext);
      byId('oracle-delta').textContent = `0x${found.delta.toString(16).padStart(2, '0')}`;
      byId('oracle-recovered-byte').textContent = `0x${recovered.toString(16).padStart(2, '0')} · ${recovered}`;
      byId('oracle-recovered-meaning').textContent = `PKCS#7 esperaba ${recovered} byte(s) de padding`;
      byId('oracle-scan-queries').textContent = scanQueries;
      renderPacket('IV modificado con padding válido');
      Lab.setStatus(byId('oracle-scan-status'), `Una respuesta distinguible permitió inferir el byte 0x${recovered.toString(16).padStart(2, '0')} sin conocer la clave.`, 'good');
    } catch (error) {
      Lab.setStatus(byId('oracle-scan-status'), error.message, 'bad');
    }
  }

  byId('encrypt-oracle-message').addEventListener('click', encryptMessage);
  byId('restore-oracle-packet').addEventListener('click', restorePacket);
  byId('flip-oracle-iv').addEventListener('click', () => {
    if (!candidateIv) return Lab.setStatus(byId('oracle-build-status'), 'Generá un paquete primero.', 'warn');
    candidateIv[15] ^= 1;
    renderPacket('IV alterado');
  });
  byId('flip-oracle-ciphertext').addEventListener('click', () => {
    if (!candidateCiphertext) return Lab.setStatus(byId('oracle-build-status'), 'Generá un paquete primero.', 'warn');
    candidateCiphertext[candidateCiphertext.length - 1] ^= 1;
    renderPacket('Ciphertext alterado');
  });
  byId('query-leaky-oracle').addEventListener('click', queryLeaky);
  byId('query-uniform-oracle').addEventListener('click', queryUniform);
  byId('scan-oracle').addEventListener('click', scanOracle);

  encryptMessage();
})();
