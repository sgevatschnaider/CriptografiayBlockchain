(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  let sharedStream = null;
  let streamA = null;
  let streamB = null;

  function bytesToHex(bytes) {
    return Lab.bytesToHex(bytes).replace(/(..)/g, '$1 ').trim();
  }

  function readable(bytes) {
    return [...bytes].map((byte) => (byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '·')).join('');
  }

  function renderBlock(container, bytes, index, originalLength, blockSize) {
    const card = document.createElement('div');
    card.className = 'byte-card';
    const title = document.createElement('strong');
    title.textContent = `Bloque ${index + 1}`;
    const hex = document.createElement('code');
    hex.textContent = bytesToHex(bytes);
    const text = document.createElement('code');
    text.textContent = readable(bytes);
    const range = document.createElement('span');
    range.className = 'small muted';
    const start = index * blockSize;
    range.textContent = start >= originalLength ? 'Solo padding' : `Offset ${start}–${start + bytes.length - 1}`;
    card.append(title, hex, text, range);
    container.append(card);
  }

  function analyzeBlocks() {
    const source = Lab.te.encode(byId('block-message').value);
    const size = Number(byId('block-size').value);
    const usePadding = byId('padding-mode').value === 'pkcs7';
    let padding = 0;
    let prepared = source;

    if (usePadding) {
      padding = size - (source.length % size);
      prepared = new Uint8Array(source.length + padding);
      prepared.set(source);
      prepared.fill(padding, source.length);
    }

    const container = byId('block-output');
    container.replaceChildren();
    const count = Math.ceil(prepared.length / size);
    for (let index = 0; index < count; index += 1) {
      const start = index * size;
      renderBlock(container, prepared.slice(start, start + size), index, source.length, size);
    }

    byId('source-byte-count').textContent = source.length;
    byId('padding-byte-count').textContent = padding;
    byId('block-count').textContent = count;
    byId('block-width').textContent = size * 8;

    if (!usePadding && source.length % size !== 0) {
      Lab.setStatus(byId('block-status'), `Quedó un bloque parcial de ${source.length % size} bytes. AES-CBC necesita una regla de padding; CTR y GCM pueden procesar una longitud no múltiplo del bloque.`, 'warn');
      return;
    }
    Lab.setStatus(byId('block-status'), usePadding
      ? `PKCS#7 agregó ${padding} byte(s), cada uno con valor hexadecimal ${padding.toString(16).padStart(2, '0')}.`
      : 'La longitud ya es múltiplo del tamaño elegido; no se agregó padding.', 'good');
  }

  function createStreamCard(label, bytes) {
    const card = document.createElement('div');
    card.className = 'byte-card';
    const title = document.createElement('strong');
    title.textContent = label;
    const code = document.createElement('code');
    code.textContent = bytesToHex(bytes);
    card.append(title, code);
    return card;
  }

  function runStreamExperiment(reuse) {
    const messageA = Lab.te.encode(byId('stream-message-a').value);
    const messageB = Lab.te.encode(byId('stream-message-b').value);
    const length = Math.max(messageA.length, messageB.length);
    if (!length) {
      Lab.setStatus(byId('stream-status'), 'Ingresá al menos un mensaje.', 'bad');
      return;
    }

    if (!sharedStream || sharedStream.length < length) sharedStream = Module03.randomBytes(length);
    if (!streamA || streamA.length < length) streamA = Module03.randomBytes(length);
    if (!streamB || streamB.length < length) streamB = Module03.randomBytes(length);
    const keyA = reuse ? sharedStream : streamA;
    const keyB = reuse ? sharedStream : streamB;
    const cipherA = Lab.xorBytes(messageA, keyA);
    const cipherB = Lab.xorBytes(messageB, keyB);
    const plainXor = Lab.xorBytes(messageA, messageB);
    const cipherXor = Lab.xorBytes(cipherA, cipherB);
    const equal = Lab.bytesToHex(plainXor) === Lab.bytesToHex(cipherXor);

    byId('plain-xor').textContent = bytesToHex(plainXor) || '—';
    byId('cipher-xor').textContent = bytesToHex(cipherXor) || '—';
    byId('xor-equality').textContent = equal ? 'Sí' : 'No';
    byId('compared-bytes').textContent = Math.min(messageA.length, messageB.length);

    const output = byId('stream-output');
    output.replaceChildren(
      createStreamCard('M₁', messageA),
      createStreamCard('M₂', messageB),
      createStreamCard('KS₁', keyA.slice(0, messageA.length)),
      createStreamCard('KS₂', keyB.slice(0, messageB.length)),
      createStreamCard('C₁', cipherA),
      createStreamCard('C₂', cipherB)
    );

    Lab.setStatus(byId('stream-status'), reuse
      ? 'Se reutilizó el flujo: C₁ ⊕ C₂ coincide exactamente con M₁ ⊕ M₂. El keystream se canceló.'
      : 'Los flujos son independientes: C₁ ⊕ C₂ ya no elimina el material secreto.', reuse ? 'bad' : 'good');
  }

  byId('analyze-blocks').addEventListener('click', analyzeBlocks);
  byId('reuse-stream').addEventListener('click', () => runStreamExperiment(true));
  byId('separate-streams').addEventListener('click', () => runStreamExperiment(false));
  byId('new-stream').addEventListener('click', () => {
    sharedStream = null;
    streamA = null;
    streamB = null;
    byId('plain-xor').textContent = '—';
    byId('cipher-xor').textContent = '—';
    byId('xor-equality').textContent = '—';
    byId('stream-output').replaceChildren();
    Lab.setStatus(byId('stream-status'), 'Se descartó el material anterior. Ejecutá un nuevo experimento.', 'good');
  });

  analyzeBlocks();
  runStreamExperiment(true);
})();
