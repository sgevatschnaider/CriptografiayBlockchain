(() => {
  'use strict';

  const { parseHex, toHex, clone, hamming, encryptBlock128, decryptBlock128 } = window.AESCore;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  function renderState(root, bytes, previous = null) {
    root.replaceChildren();
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        const index = row + (4 * column);
        const cell = document.createElement('div');
        cell.className = 'aes-byte';
        if (previous && previous[index] !== bytes[index]) cell.classList.add('changed');
        cell.textContent = bytes[index].toString(16).padStart(2, '0').toUpperCase();
        cell.title = `b${index}: ${bytes[index]}`;
        root.append(cell);
      }
    }
  }

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];
  function activateTab(tab) {
    tabs.forEach((candidate) => candidate.setAttribute('aria-selected', String(candidate === tab)));
    panels.forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
  }
  tabs.forEach((tab) => tab.addEventListener('click', () => activateTab(tab)));

  let trace = [];
  let traceIndex = 0;
  let playTimer = 0;
  const traceState = document.getElementById('round-state');
  const traceSlider = document.getElementById('trace-slider');
  const traceStrip = document.getElementById('round-strip');

  function renderTrace() {
    if (!trace.length) return;
    const item = trace[traceIndex];
    const previous = traceIndex > 0 ? trace[traceIndex - 1].state : item.state;
    renderState(traceState, item.state, previous);
    document.getElementById('trace-round').textContent = item.round;
    document.getElementById('trace-operation').textContent = item.operation;
    document.getElementById('trace-index').textContent = `${traceIndex + 1}/${trace.length}`;
    document.getElementById('trace-hamming').textContent = hamming(item.state, previous);
    document.getElementById('round-state-hex').textContent = toHex(item.state, ' ');
    document.getElementById('round-key-hex').textContent = item.key ? toHex(item.key, ' ') : 'No corresponde';
    traceSlider.value = String(traceIndex);
    [...traceStrip.children].forEach((card, index) => card.classList.toggle('active', index === traceIndex));
    const active = traceStrip.children[traceIndex];
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }

  function buildTrace() {
    clearInterval(playTimer);
    try {
      const plaintext = parseHex(document.getElementById('round-plaintext').value);
      const key = parseHex(document.getElementById('round-key').value);
      trace = encryptBlock128(plaintext, key, true).trace;
      traceIndex = 0;
      traceSlider.max = String(trace.length - 1);
      traceStrip.replaceChildren();
      trace.forEach((item, index) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'aes-round-step';
        card.innerHTML = `<strong>Ronda ${item.round}</strong><small>${item.operation}</small>`;
        card.addEventListener('click', () => { traceIndex = index; renderTrace(); });
        traceStrip.append(card);
      });
      const ciphertext = trace.at(-1).state;
      const traceStatus = document.getElementById('trace-status');
      traceStatus.textContent = `Traza construida: ${trace.length} estados. Ciphertext final ${toHex(ciphertext)}.`;
      traceStatus.dataset.kind = 'good';
      renderTrace();
    } catch (error) {
      const traceStatus = document.getElementById('trace-status');
      traceStatus.textContent = error.message;
      traceStatus.dataset.kind = 'bad';
    }
  }

  document.getElementById('build-trace').addEventListener('click', buildTrace);
  document.getElementById('previous-step').addEventListener('click', () => { if (trace.length) { traceIndex = Math.max(0, traceIndex - 1); renderTrace(); } });
  document.getElementById('next-step').addEventListener('click', () => { if (trace.length) { traceIndex = Math.min(trace.length - 1, traceIndex + 1); renderTrace(); } });
  traceSlider.addEventListener('input', () => { traceIndex = Number(traceSlider.value); renderTrace(); });
  document.getElementById('play-trace').addEventListener('click', (event) => {
    if (!trace.length) buildTrace();
    if (playTimer) {
      clearInterval(playTimer); playTimer = 0; event.currentTarget.textContent = 'Reproducir'; return;
    }
    event.currentTarget.textContent = 'Pausar';
    playTimer = window.setInterval(() => {
      if (traceIndex >= trace.length - 1) {
        clearInterval(playTimer); playTimer = 0; event.currentTarget.textContent = 'Reproducir'; return;
      }
      traceIndex += 1; renderTrace();
    }, 430);
  });

  document.getElementById('run-vector').addEventListener('click', () => {
    const plaintext = parseHex('00112233445566778899aabbccddeeff');
    const key = parseHex('000102030405060708090a0b0c0d0e0f');
    const expected = '69c4e0d86a7b0430d8cdb78070b4c55a';
    const encrypted = encryptBlock128(plaintext, key).ciphertext;
    const decrypted = decryptBlock128(encrypted, key);
    const encryptedHex = toHex(encrypted);
    const decryptOk = toHex(decrypted) === toHex(plaintext);
    const encryptOk = encryptedHex === expected;
    document.getElementById('vector-result').textContent = `Obtenido:  ${encryptedHex}\nEsperado:  ${expected}\nRecuperado: ${toHex(decrypted)}`;
    const vectorStatus = document.getElementById('vector-status');
    vectorStatus.textContent = encryptOk && decryptOk
      ? 'Prueba correcta: el cifrado coincide y el descifrado recupera exactamente la entrada.'
      : 'La prueba no coincide. Revisar implementación antes de utilizar la traza.';
    vectorStatus.dataset.kind = encryptOk && decryptOk ? 'good' : 'bad';
  });

  const avalancheBit = document.getElementById('avalanche-bit');
  const avalancheMap = document.getElementById('avalanche-map');
  function createBitMap() {
    avalancheMap.replaceChildren();
    for (let index = 0; index < 128; index += 1) {
      const bit = document.createElement('span');
      bit.className = 'aes-bit';
      bit.title = `Bit ${index}`;
      avalancheMap.append(bit);
    }
  }
  avalancheBit.addEventListener('input', () => { document.getElementById('avalanche-bit-label').textContent = avalancheBit.value; });
  document.getElementById('random-avalanche').addEventListener('click', () => {
    const random = new Uint8Array(1); crypto.getRandomValues(random);
    avalancheBit.value = String(random[0] % 128);
    avalancheBit.dispatchEvent(new Event('input'));
  });
  document.getElementById('run-avalanche').addEventListener('click', () => {
    const plaintextA = parseHex(document.getElementById('round-plaintext').value);
    const plaintextB = clone(plaintextA);
    const bitIndex = Number(avalancheBit.value);
    const byteIndex = Math.floor(bitIndex / 8);
    plaintextB[byteIndex] ^= 1 << (7 - (bitIndex % 8));
    const key = parseHex(document.getElementById('round-key').value);
    const cipherA = encryptBlock128(plaintextA, key).ciphertext;
    const cipherB = encryptBlock128(plaintextB, key).ciphertext;
    const distance = hamming(cipherA, cipherB);
    document.getElementById('avalanche-distance').textContent = `${distance}/128`;
    document.getElementById('avalanche-percent').textContent = `${((distance / 128) * 100).toFixed(2)}%`;
    document.getElementById('avalanche-a').textContent = toHex(cipherA, ' ');
    document.getElementById('avalanche-b').textContent = toHex(cipherB, ' ');
    [...avalancheMap.children].forEach((cell, index) => {
      const byte = Math.floor(index / 8);
      const mask = 1 << (7 - (index % 8));
      cell.classList.toggle('on', Boolean((cipherA[byte] ^ cipherB[byte]) & mask));
    });
    const avalancheStatus = document.getElementById('avalanche-status');
    avalancheStatus.textContent = `Se cambió el bit ${bitIndex} del plaintext. La salida modificó ${distance} bits.`;
    avalancheStatus.dataset.kind = distance >= 48 && distance <= 80 ? 'good' : 'warn';
  });

  let gcm = null;
  function bytesToBase64(bytes) {
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }
  function renderGcmPackage() {
    const output = document.getElementById('gcm-package');
    if (!gcm) { output.textContent = 'Sin paquete.'; return; }
    output.textContent = `Algoritmo: AES-GCM-256\nNonce: ${toHex(gcm.nonce)}\nAAD (hex): ${toHex(gcm.aad)}\nCiphertext + tag: ${bytesToBase64(gcm.ciphertext)}`;
    document.getElementById('gcm-nonce-size').textContent = gcm.nonce.length;
    document.getElementById('gcm-cipher-size').textContent = gcm.ciphertext.length;
    document.getElementById('gcm-aad-size').textContent = gcm.aad.length;
  }
  document.getElementById('gcm-generate').addEventListener('click', async () => {
    const statusNode = document.getElementById('gcm-status');
    try {
      const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      const nonce = crypto.getRandomValues(new Uint8Array(12));
      const message = encoder.encode(document.getElementById('gcm-message').value);
      const aad = encoder.encode(document.getElementById('gcm-aad').value);
      const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, additionalData: aad, tagLength: 128 }, key, message));
      gcm = { key, nonce, aad, ciphertext: encrypted, originalAad: clone(aad), originalCiphertext: clone(encrypted), originalMessage: document.getElementById('gcm-message').value };
      renderGcmPackage();
      statusNode.textContent = 'Cifrado correcto. El resultado contiene ciphertext seguido por el tag de 128 bits.';
      statusNode.dataset.kind = 'good';
    } catch (error) {
      statusNode.textContent = `No se pudo cifrar: ${error.message}`;
      statusNode.dataset.kind = 'bad';
    }
  });
  document.getElementById('gcm-decrypt').addEventListener('click', async () => {
    const statusNode = document.getElementById('gcm-status');
    if (!gcm) { statusNode.textContent = 'Primero generá un paquete.'; statusNode.dataset.kind = 'warn'; return; }
    try {
      const recovered = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: gcm.nonce, additionalData: gcm.aad, tagLength: 128 }, gcm.key, gcm.ciphertext);
      statusNode.textContent = `Autenticación válida. Texto recuperado: “${decoder.decode(recovered)}”`;
      statusNode.dataset.kind = 'good';
    } catch {
      statusNode.textContent = 'Autenticación fallida: Web Crypto rechazó el paquete y no entregó texto.';
      statusNode.dataset.kind = 'bad';
    }
  });
  document.getElementById('tamper-cipher').addEventListener('click', () => {
    if (!gcm) return;
    gcm.ciphertext = clone(gcm.originalCiphertext);
    gcm.ciphertext[0] ^= 0x01;
    renderGcmPackage();
    const statusNode = document.getElementById('gcm-status');
    statusNode.textContent = 'Se modificó un bit del ciphertext. Intentá descifrar y verificar.';
    statusNode.dataset.kind = 'warn';
  });
  document.getElementById('tamper-aad').addEventListener('click', () => {
    if (!gcm) return;
    gcm.aad = clone(gcm.originalAad);
    if (gcm.aad.length) gcm.aad[0] ^= 0x01;
    renderGcmPackage();
    const statusNode = document.getElementById('gcm-status');
    statusNode.textContent = 'Se modificó un bit del AAD. Aunque sea visible, su autenticación debe fallar.';
    statusNode.dataset.kind = 'warn';
  });
  document.getElementById('restore-gcm').addEventListener('click', () => {
    if (!gcm) return;
    gcm.ciphertext = clone(gcm.originalCiphertext);
    gcm.aad = clone(gcm.originalAad);
    renderGcmPackage();
    const statusNode = document.getElementById('gcm-status');
    statusNode.textContent = 'Paquete restaurado a su estado auténtico.';
    statusNode.dataset.kind = 'good';
  });

  createBitMap();
  buildTrace();
  document.getElementById('run-vector').click();
})();
