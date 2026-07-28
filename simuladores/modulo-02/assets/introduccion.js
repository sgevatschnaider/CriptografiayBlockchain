(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const encoder = new TextEncoder();
  const examples = [
    'LA SEGURIDAD NECESITA UN MODELO',
    'UN CRIPTOGRAMA NO ES UNA PRUEBA',
    'EL ADVERSARIO TAMBIEN TIENE REGLAS',
    'UNA CLAVE NO CORRIGE UN MAL PROTOCOLO'
  ];
  let exampleIndex = 0;

  function caesar(text, shift) {
    const amount = ((Number(shift) % 26) + 26) % 26;
    return String(text).toUpperCase().replace(/[A-Z]/g, (letter) => {
      const code = letter.charCodeAt(0) - 65;
      return String.fromCharCode(65 + ((code + amount) % 26));
    });
  }

  function compactHex(bytes, limit = 28) {
    const visible = bytes.slice(0, limit);
    const suffix = bytes.length > limit ? ` … (${bytes.length} bytes)` : '';
    return `${Module02.toHex(visible)}${suffix}`;
  }

  function xorBytes(left, right) {
    return Uint8Array.from(left, (value, index) => value ^ right[index]);
  }

  async function aesGcmTwice(messageBytes) {
    if (!globalThis.crypto?.subtle) {
      throw new Error('Web Crypto no está disponible en este contexto.');
    }
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    const ivA = Module02.randomBytes(12);
    const ivB = Module02.randomBytes(12);
    const cipherA = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: ivA },
      key,
      messageBytes
    ));
    const cipherB = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: ivB },
      key,
      messageBytes
    ));
    return { ivA, ivB, cipherA, cipherB };
  }

  function renderCaesar(message, shift) {
    const cipher = caesar(message, shift);
    byId('caesar-output').textContent = [
      `M: ${message.toUpperCase()}`,
      `C: ${cipher}`,
      `k: desplazamiento ${shift}`,
      'Espacio de claves útil: 25'
    ].join('\n');
  }

  function renderOtp(messageBytes) {
    const key = Module02.randomBytes(messageBytes.length);
    const cipher = xorBytes(messageBytes, key);
    byId('otp-output').textContent = [
      `M (UTF-8): ${compactHex(messageBytes)}`,
      `K uniforme: ${compactHex(key)}`,
      `C = M⊕K:   ${compactHex(cipher)}`,
      `Longitud K: ${key.length} bytes · un solo uso`
    ].join('\n');
  }

  async function renderModern(messageBytes) {
    byId('modern-output').textContent = 'Generando una clave AES-GCM y dos nonces…';
    try {
      const result = await aesGcmTwice(messageBytes);
      const different = Module02.toHex(result.cipherA, '') !== Module02.toHex(result.cipherB, '');
      byId('modern-output').textContent = [
        `Nonce A: ${Module02.toHex(result.ivA, '')}`,
        `C+tag A: ${compactHex(result.cipherA)}`,
        `Nonce B: ${Module02.toHex(result.ivB, '')}`,
        `C+tag B: ${compactHex(result.cipherB)}`,
        `¿Salidas distintas?: ${different ? 'sí' : 'no'}`
      ].join('\n');
    } catch (error) {
      byId('modern-output').textContent = `No se pudo ejecutar AES-GCM: ${error.message}`;
    }
  }

  async function compare() {
    const button = byId('run-comparison');
    const message = byId('intro-message').value.trim() || examples[0];
    const shift = Module02.clamp(Number(byId('caesar-shift').value) || 3, 1, 25);
    const messageBytes = encoder.encode(message);

    byId('caesar-shift').value = String(shift);
    button.disabled = true;
    byId('comparison-status').textContent = 'Ejecutando los tres experimentos…';
    renderCaesar(message, shift);
    renderOtp(messageBytes);
    await renderModern(messageBytes);
    button.disabled = false;
    byId('comparison-status').textContent = 'Comparación lista: mirá las condiciones, no solo la apariencia.';
  }

  function showCaesarCandidates() {
    const message = byId('intro-message').value.trim() || examples[0];
    const secretShift = Module02.clamp(Number(byId('caesar-shift').value) || 3, 1, 25);
    const cipher = caesar(message, secretShift);
    const lines = [];
    for (let candidate = 1; candidate <= 25; candidate += 1) {
      const marker = candidate === secretShift ? ' ← texto original' : '';
      lines.push(`k=${String(candidate).padStart(2, '0')}: ${caesar(cipher, -candidate)}${marker}`);
    }
    byId('caesar-output').textContent = lines.join('\n');
    byId('comparison-status').textContent =
      `Ataque completo: desde C = ${cipher}, el texto original apareció entre solo 25 candidatos.`;
  }

  function choosePrediction(button) {
    document.querySelectorAll('[data-prediction]').forEach((item) => {
      item.dataset.selected = String(item === button);
    });
    const correct = button.dataset.prediction === 'otp';
    byId('prediction-feedback').textContent = correct
      ? 'Correcto. El OTP ofrece secreto perfecto solo si la clave es uniforme, independiente, tan larga como el mensaje, secreta y de un único uso.'
      : 'No. César se rompe por enumeración; AES-GCM ofrece seguridad computacional. La garantía incondicional corresponde al OTP bajo todas sus condiciones.';
    byId('prediction-feedback').dataset.type = correct ? 'good' : 'warn';
  }

  byId('run-comparison').addEventListener('click', compare);
  byId('crack-caesar').addEventListener('click', showCaesarCandidates);
  byId('new-example').addEventListener('click', () => {
    exampleIndex = (exampleIndex + 1) % examples.length;
    byId('intro-message').value = examples[exampleIndex];
    compare();
  });
  document.querySelectorAll('[data-prediction]').forEach((button) => {
    button.addEventListener('click', () => choosePrediction(button));
  });

  compare();
})();
