(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const state = {
    message: 0x48,
    key: 0xb5,
    operation: 'xor'
  };

  const operations = Object.freeze({
    xor: {
      label: 'XOR',
      apply: (left, right) => left ^ right,
      rule: 'produce 1 cuando los bits son diferentes.'
    },
    and: {
      label: 'AND',
      apply: (left, right) => left & right,
      rule: 'produce 1 únicamente cuando ambos bits son 1.'
    },
    or: {
      label: 'OR',
      apply: (left, right) => left | right,
      rule: 'produce 1 cuando al menos uno de los bits es 1.'
    }
  });

  function byteBits(value) {
    return value.toString(2).padStart(8, '0');
  }

  function byteLabel(value) {
    return `${value} · 0x${value.toString(16).padStart(2, '0')}`;
  }

  function renderInputBits(container, value, field) {
    container.replaceChildren();
    for (let position = 7; position >= 0; position -= 1) {
      const bit = (value >> position) & 1;
      const button = document.createElement('button');
      button.className = 'bit-button';
      button.type = 'button';
      button.textContent = String(bit);
      button.setAttribute('aria-label', `${field === 'message' ? 'Mensaje' : 'Clave'}, bit ${position}: ${bit}`);
      button.setAttribute('aria-pressed', String(Boolean(bit)));
      button.addEventListener('click', () => {
        state[field] ^= 1 << position;
        renderBits();
      });
      container.append(button);
    }
  }

  function renderOutputBits(container, value) {
    container.replaceChildren();
    for (let position = 7; position >= 0; position -= 1) {
      const bit = (value >> position) & 1;
      const cell = document.createElement('span');
      cell.className = 'bit-output';
      cell.dataset.bit = String(bit);
      cell.textContent = String(bit);
      container.append(cell);
    }
  }

  function renderTruthTable() {
    const operation = operations[state.operation];
    byId('truth-operation').textContent = `A ${operation.label} B`;
    byId('truth-body').replaceChildren();
    [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([left, right]) => {
      const row = document.createElement('tr');
      [left, right, operation.apply(left, right)].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = String(value);
        row.append(cell);
      });
      byId('truth-body').append(row);
    });
    byId('operation-rule').replaceChildren();
    const strong = document.createElement('strong');
    strong.textContent = `${operation.label}: `;
    byId('operation-rule').append(strong, document.createTextNode(operation.rule));
  }

  function renderBits() {
    const operation = operations[state.operation];
    const result = operation.apply(state.message, state.key) & 0xff;
    renderInputBits(byId('message-bits'), state.message, 'message');
    renderInputBits(byId('key-bits'), state.key, 'key');
    renderOutputBits(byId('result-bits'), result);
    byId('message-value').textContent = byteLabel(state.message);
    byId('key-value').textContent = byteLabel(state.key);
    byId('result-value').textContent = byteLabel(result);
    byId('bit-equation-output').textContent =
      `${byteBits(state.message)} ${operation.label} ${byteBits(state.key)} = ${byteBits(result)}`;
    byId('bit-status').textContent = state.operation === 'xor'
      ? `${byteBits(result)} XOR ${byteBits(state.key)} = ${byteBits(state.message)}. La misma clave revierte la operación.`
      : `${operation.label} ayuda a comprender la lógica binaria, pero no posee la reversibilidad de XOR con la misma segunda entrada.`;
    renderTruthTable();
  }

  function selectOperation(button) {
    state.operation = button.dataset.operation;
    document.querySelectorAll('[data-operation]').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    renderBits();
  }

  function parseCounter(value) {
    const clean = String(value).replace(/\s+/g, '').toLowerCase();
    if (!/^[0-9a-f]{32}$/.test(clean)) {
      throw new Error('El contador debe contener exactamente 32 dígitos hexadecimales.');
    }
    return Uint8Array.from(clean.match(/.{2}/g), (pair) => Number.parseInt(pair, 16));
  }

  function xorBytes(left, right) {
    const length = Math.min(left.length, right.length);
    return Uint8Array.from({ length }, (_, index) => left[index] ^ right[index]);
  }

  function bytesEqual(left, right) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
  }

  function compactHex(bytes, limit = 48) {
    const visible = bytes.slice(0, limit);
    const suffix = bytes.length > limit ? ` … (${bytes.length} bytes)` : '';
    return `${Module02.toHex(visible)}${suffix}`;
  }

  async function deriveKey(secret) {
    if (!globalThis.crypto?.subtle) {
      throw new Error('Web Crypto no está disponible en este contexto.');
    }
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(secret)));
    return crypto.subtle.importKey('raw', digest, { name: 'AES-CTR' }, false, ['encrypt', 'decrypt']);
  }

  async function encryptCtr(key, counter, bytes) {
    return new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-CTR', counter, length: 64 },
      key,
      bytes
    ));
  }

  async function decryptCtr(key, counter, bytes) {
    return new Uint8Array(await crypto.subtle.decrypt(
      { name: 'AES-CTR', counter, length: 64 },
      key,
      bytes
    ));
  }

  function setCounter(bytes) {
    byId('stream-counter').value = Module02.toHex(bytes, '');
  }

  async function runStream() {
    const button = byId('run-stream');
    const messageA = encoder.encode(byId('stream-message-a').value);
    const messageB = encoder.encode(byId('stream-message-b').value);
    const secret = byId('stream-key').value;
    const reuse = byId('reuse-counter').checked;

    button.disabled = true;
    byId('stream-status').textContent = 'Derivando la clave y ejecutando AES-CTR…';
    try {
      if (!messageA.length || !messageB.length) throw new Error('Los dos mensajes deben contener al menos un carácter.');
      if (secret.length < 6) throw new Error('Usá un secreto didáctico de al menos seis caracteres.');

      const counterA = parseCounter(byId('stream-counter').value);
      const counterB = reuse ? counterA.slice() : Module02.randomBytes(16);
      const key = await deriveKey(secret);
      const [cipherA, cipherB] = await Promise.all([
        encryptCtr(key, counterA, messageA),
        encryptCtr(key, counterB, messageB)
      ]);
      const recovered = await decryptCtr(key, counterA, cipherA);
      const keystreamA = xorBytes(messageA, cipherA);
      const cipherXor = xorBytes(cipherA, cipherB);
      const messageXor = xorBytes(messageA, messageB);
      const match = bytesEqual(cipherXor, messageXor);

      byId('counter-a-output').textContent = Module02.toHex(counterA, '');
      byId('counter-b-output').textContent = Module02.toHex(counterB, '');
      byId('lane-message').textContent = compactHex(messageA);
      byId('lane-keystream').textContent = compactHex(keystreamA);
      byId('lane-cipher').textContent = compactHex(cipherA);
      byId('lane-recovered').textContent = `${decoder.decode(recovered)} · ${compactHex(recovered)}`;
      byId('cipher-xor').textContent = compactHex(cipherXor);
      byId('message-xor').textContent = compactHex(messageXor);
      byId('proof-ciphers').dataset.match = String(match);
      byId('proof-messages').dataset.match = String(match);

      if (match) {
        byId('reuse-equation').textContent =
          `Coincidencia exacta en ${cipherXor.length} bytes: C₁⊕C₂ = M₁⊕M₂. El keystream se canceló.`;
        byId('stream-status').textContent =
          'Fallo reproducido: la reutilización del contador generó el mismo keystream para ambos mensajes.';
        byId('stream-status').dataset.type = 'warn';
      } else {
        byId('reuse-equation').textContent =
          `Los ${cipherXor.length} bytes comparados no coinciden: KS₁ ≠ KS₂ porque los contadores son diferentes.`;
        byId('stream-status').textContent =
          'Los contadores independientes evitaron esta relación directa. CTR todavía necesita autenticación.';
        byId('stream-status').dataset.type = 'good';
      }
    } catch (error) {
      byId('stream-status').textContent = `No se pudo ejecutar: ${error.message}`;
      byId('stream-status').dataset.type = 'warn';
    } finally {
      button.disabled = false;
    }
  }

  function checkClassification() {
    const cards = [...document.querySelectorAll('.classification-card')];
    let score = 0;
    cards.forEach((card) => {
      const select = card.querySelector('select');
      const correct = select.value === card.dataset.answer;
      if (correct) score += 1;
      card.dataset.result = correct ? 'correct' : 'wrong';
    });
    byId('classification-status').textContent =
      score === cards.length
        ? `Clasificación completa: ${score}/${cards.length}. Separaste propiedades, requisitos y errores.`
        : `Resultado: ${score}/${cards.length}. Revisá las tarjetas resaltadas y volvé a comprobar.`;
    byId('classification-status').dataset.type = score === cards.length ? 'good' : 'warn';
  }

  function resetClassification() {
    document.querySelectorAll('.classification-card').forEach((card) => {
      card.querySelector('select').value = '';
      delete card.dataset.result;
    });
    byId('classification-status').textContent = 'Clasificación reiniciada.';
    delete byId('classification-status').dataset.type;
  }

  document.querySelectorAll('[data-operation]').forEach((button) => {
    button.addEventListener('click', () => selectOperation(button));
  });
  byId('run-stream').addEventListener('click', runStream);
  byId('random-counter').addEventListener('click', () => {
    setCounter(Module02.randomBytes(16));
    byId('stream-status').textContent = 'Contador nuevo generado localmente.';
  });
  byId('check-classification').addEventListener('click', checkClassification);
  byId('reset-classification').addEventListener('click', resetClassification);

  renderBits();
  runStream();
})();
