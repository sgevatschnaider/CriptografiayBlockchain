(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const Core = globalThis.ChaCha20Core;
  const RFC_KEY = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
  const RFC_NONCE = '000000090000004a00000000';
  const RFC_BLOCK = [
    '10f1e7e4d13b5915500fdd1fa32071c4',
    'c7d1f4c733c068030422aa9ac3d46c4e',
    'd2826446079faa0914c2d705d98b02a2',
    'b5129cd1de164eb9cbd083e8a2503c4e'
  ].join('');

  function inputs() {
    return {
      key: Core.fromHex(byId('chacha-key').value, 32),
      nonce: Core.fromHex(byId('chacha-nonce').value, 12),
      counter: Number(byId('chacha-counter').value)
    };
  }

  function formatHex(hex) {
    return hex.replace(/(.{32})/g, '$1\n').trim();
  }

  function renderState(container, words) {
    container.replaceChildren();
    [...words].forEach((word, index) => {
      const cell = document.createElement('code');
      cell.className = 'chacha-word';
      cell.textContent = Core.wordHex(word);
      cell.setAttribute('aria-label', `Palabra ${index}: ${cell.textContent}`);
      container.append(cell);
    });
  }

  function runVector() {
    byId('chacha-key').value = RFC_KEY;
    byId('chacha-nonce').value = RFC_NONCE;
    byId('chacha-counter').value = '1';
    const key = Core.fromHex(RFC_KEY, 32);
    const nonce = Core.fromHex(RFC_NONCE, 12);
    const result = Core.block(key, 1, nonce, true);
    const obtained = Core.toHex(result.bytes);
    const matches = obtained === RFC_BLOCK;
    byId('vector-obtained').textContent = formatHex(obtained);
    byId('vector-expected').textContent = formatHex(RFC_BLOCK);
    byId('double-round-count').textContent = result.rounds.length;
    renderState(byId('initial-state'), result.initial);
    renderState(byId('final-state'), result.finalState);
    Lab.setStatus(byId('vector-status'), matches
      ? 'Vector RFC 8439 correcto: el bloque de 64 bytes coincide exactamente.'
      : 'El resultado no coincide con RFC 8439.', matches ? 'good' : 'bad');
  }

  function runCipher() {
    try {
      const { key, nonce, counter } = inputs();
      const plaintext = Lab.te.encode(byId('chacha-message').value);
      const ciphertext = Core.encrypt(key, nonce, counter, plaintext);
      const recovered = Core.encrypt(key, nonce, counter, ciphertext);
      const firstBlock = Core.block(key, counter, nonce).bytes;
      byId('chacha-ciphertext').value = formatHex(Core.toHex(ciphertext));
      byId('chacha-recovered').value = Lab.td.decode(recovered);
      byId('chacha-keystream').textContent = formatHex(Core.toHex(firstBlock));
      byId('message-bytes').textContent = plaintext.length;
      byId('stream-blocks').textContent = Math.ceil(plaintext.length / 64);
      byId('sent-bytes').textContent = '0';
      Lab.setStatus(byId('cipher-status'),
        'ChaCha20 cifró y recuperó el mensaje localmente. La misma operación XOR se usa en ambos sentidos.', 'good');
    } catch (error) {
      Lab.setStatus(byId('cipher-status'), error.message, 'bad');
    }
  }

  function randomize() {
    const key = Module03.randomBytes(32);
    const nonce = Module03.randomBytes(12);
    byId('chacha-key').value = Core.toHex(key);
    byId('chacha-nonce').value = Core.toHex(nonce);
    byId('chacha-counter').value = '1';
    runCipher();
  }

  function runReuse() {
    try {
      const { key, nonce, counter } = inputs();
      const messageA = Lab.te.encode(byId('reuse-message-a').value);
      const messageB = Lab.te.encode(byId('reuse-message-b').value);
      const cipherA = Core.encrypt(key, nonce, counter, messageA);
      const cipherB = Core.encrypt(key, nonce, counter, messageB);
      const plainXor = Lab.xorBytes(messageA, messageB);
      const cipherXor = Lab.xorBytes(cipherA, cipherB);
      const equal = Core.toHex(plainXor) === Core.toHex(cipherXor);
      byId('reuse-plain-xor').textContent = formatHex(Core.toHex(plainXor)) || '—';
      byId('reuse-cipher-xor').textContent = formatHex(Core.toHex(cipherXor)) || '—';
      byId('reuse-equality').textContent = equal ? 'Sí: el keystream se canceló' : 'No';
      Lab.setStatus(byId('reuse-status'), equal
        ? 'Reutilizar clave, nonce y contador repitió el keystream: C₁ XOR C₂ = M₁ XOR M₂.'
        : 'No se obtuvo la igualdad esperada.', equal ? 'bad' : 'good');
    } catch (error) {
      Lab.setStatus(byId('reuse-status'), error.message, 'bad');
    }
  }

  byId('run-rfc-vector').addEventListener('click', runVector);
  byId('run-chacha').addEventListener('click', runCipher);
  byId('randomize-chacha').addEventListener('click', randomize);
  byId('run-reuse').addEventListener('click', runReuse);
  runVector();
  runCipher();
  runReuse();
})();
