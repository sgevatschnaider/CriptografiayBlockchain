(() => {
  'use strict';

  const {
    $,
    $$,
    te,
    td,
    bytesToB64,
    b64ToBytes,
    setStatus
  } = window.Lab;

  const state = {
    messageBytes: new Uint8Array(),
    byteValue: 65,
    xorMessageBytes: new Uint8Array(),
    xorKeyBytes: new Uint8Array(),
    xorExpandedKey: new Uint8Array(),
    xorCipherBytes: new Uint8Array(),
    xorRecoveredBytes: new Uint8Array(),
    randomKeyGenerated: false,
    solvedChallenges: new Set()
  };

  const operationDefinitions = {
    xor: {
      name: 'XOR',
      symbol: '⊕',
      title: 'Diferencia controlada',
      description: 'XOR produce 1 cuando los bits son diferentes. Es reversible con la misma entrada: (A ⊕ B) ⊕ B = A.',
      apply: (a, b) => a ^ b
    },
    and: {
      name: 'AND',
      symbol: '∧',
      title: 'Máscara de selección',
      description: 'AND conserva un 1 únicamente cuando ambas entradas tienen 1. Se usa para aislar posiciones mediante máscaras.',
      apply: (a, b) => a & b
    },
    or: {
      name: 'OR',
      symbol: '∨',
      title: 'Activación de posiciones',
      description: 'OR produce 1 cuando al menos una entrada tiene 1. Permite encender bits sin apagar los que ya estaban activos.',
      apply: (a, b) => a | b
    },
    not: {
      name: 'NOT',
      symbol: '¬',
      title: 'Complemento dentro del byte',
      description: 'NOT invierte los ocho bits de A. La máscara & 255 limita el resultado al rango de un byte.',
      apply: (a) => (~a) & 0xff
    }
  };

  const challengeFeedback = [
    'Hexadecimal y Base64 solo cambian la forma de escribir o transportar los bytes. Cualquiera puede revertirlos sin una clave.',
    'El emoji 🔐 corresponde a U+1F510 y UTF-8 lo representa mediante cuatro bytes.',
    'XOR vale 1 exactamente cuando los bits de entrada son diferentes.',
    'La misma K se cancela porque K ⊕ K = 0 y M ⊕ 0 = M.'
  ];

  function clampByte(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.min(255, Math.max(0, Math.trunc(number)));
  }

  function byteToBinary(value) {
    return clampByte(value).toString(2).padStart(8, '0');
  }

  function byteToHex(value) {
    return clampByte(value).toString(16).padStart(2, '0').toUpperCase();
  }

  function bytesToHexGroups(bytes) {
    return [...bytes].map(byteToHex).join(' ');
  }

  function bytesToDecimalGroups(bytes) {
    return [...bytes].join(' ');
  }

  function bytesToBinaryGroups(bytes) {
    return [...bytes].map(byteToBinary).join(' ');
  }

  function codePointLabel(character) {
    return `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;
  }

  function visibleCharacter(character) {
    const labels = {
      ' ': '␠',
      '\n': '↵',
      '\r': '␍',
      '\t': '⇥',
      '\u0000': '␀'
    };
    return labels[character] ?? character;
  }

  function characterDescription(character) {
    const descriptions = {
      ' ': 'espacio',
      '\n': 'salto de línea',
      '\r': 'retorno',
      '\t': 'tabulación',
      '\u0000': 'nulo'
    };
    return descriptions[character] ?? '';
  }

  function countGraphemes(text) {
    if (globalThis.Intl?.Segmenter) {
      const segmenter = new Intl.Segmenter('es', { granularity: 'grapheme' });
      return [...segmenter.segment(text)].length;
    }
    return Array.from(text).length;
  }

  function appendCell(row, content, className = '') {
    const cell = document.createElement('td');
    if (className) cell.className = className;
    if (content instanceof Node) cell.append(content);
    else cell.textContent = content;
    row.append(cell);
    return cell;
  }

  function renderCharacterRows(text) {
    const body = $('#characterRows');
    body.replaceChildren();
    const characters = Array.from(text);

    if (!characters.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 6;
      cell.className = 'muted center';
      cell.textContent = 'Escribí un mensaje para observar sus puntos de código y bytes.';
      row.append(cell);
      body.append(row);
      return;
    }

    characters.slice(0, 80).forEach((character, index) => {
      const bytes = te.encode(character);
      const row = document.createElement('tr');
      if (bytes.length > 1) row.classList.add('multi-byte-row');

      appendCell(row, String(index + 1));

      const characterBox = document.createElement('span');
      characterBox.textContent = visibleCharacter(character);
      const description = characterDescription(character);
      if (description) {
        const small = document.createElement('small');
        small.textContent = description;
        characterBox.append(small);
      }
      appendCell(row, characterBox, 'character-cell');
      appendCell(row, codePointLabel(character));
      appendCell(row, `${bytesToHexGroups(bytes)} · ${bytes.length} ${bytes.length === 1 ? 'byte' : 'bytes'}`);
      appendCell(row, bytesToDecimalGroups(bytes));
      appendCell(row, bytesToBinaryGroups(bytes));
      body.append(row);
    });

    if (characters.length > 80) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 6;
      cell.className = 'muted';
      cell.textContent = `La tabla muestra los primeros 80 de ${characters.length} puntos de código para mantener una lectura clara.`;
      row.append(cell);
      body.append(row);
    }
  }

  function renderMessage() {
    const text = $('#messageInput').value;
    const bytes = te.encode(text);
    const codePoints = Array.from(text);
    const graphemes = countGraphemes(text);
    state.messageBytes = bytes;

    $('#graphemeCount').textContent = graphemes;
    $('#codePointCount').textContent = codePoints.length;
    $('#byteCount').textContent = bytes.length;
    $('#bitCount').textContent = bytes.length * 8;
    $('#unicodeOutput').textContent = codePoints.length ? codePoints.map(codePointLabel).join(' ') : '—';
    $('#decimalOutput').textContent = bytes.length ? bytesToDecimalGroups(bytes) : '—';
    $('#hexOutput').textContent = bytes.length ? bytesToHexGroups(bytes) : '—';
    $('#binaryOutput').textContent = bytes.length ? bytesToBinaryGroups(bytes) : '—';
    $('#base64Output').textContent = bytes.length ? bytesToB64(bytes) : '—';
    renderCharacterRows(text);

    if (!text.length) {
      setStatus($('#encodingStatus'), 'Escribí al menos un carácter para comenzar la conversión.', 'warn');
      return;
    }

    const multiByteCharacters = codePoints.filter((character) => te.encode(character).length > 1).length;
    const normalizationChanged = text.normalize('NFC') !== text;
    const differences = [];

    if (graphemes !== codePoints.length) {
      differences.push(`${graphemes} caracteres percibidos y ${codePoints.length} puntos de código`);
    }
    if (multiByteCharacters) {
      differences.push(`${multiByteCharacters} ${multiByteCharacters === 1 ? 'símbolo usa' : 'símbolos usan'} más de un byte`);
    }
    if (normalizationChanged) {
      differences.push('la forma NFC cambiaría la secuencia de puntos de código');
    }

    const summary = `${graphemes} ${graphemes === 1 ? 'carácter percibido' : 'caracteres percibidos'} → ${bytes.length} ${bytes.length === 1 ? 'byte' : 'bytes'} → ${bytes.length * 8} bits.`;
    setStatus(
      $('#encodingStatus'),
      differences.length ? `${summary} Observación: ${differences.join('; ')}.` : `${summary} En este caso las distintas capas coinciden sin sorpresas.`,
      differences.length ? 'warn' : 'good'
    );
  }

  function renderBitStrip(container, value, options = {}) {
    const { interactive = false, onToggle = null } = options;
    container.replaceChildren();

    byteToBinary(value).split('').forEach((bit, index) => {
      const element = document.createElement(interactive ? 'button' : 'span');
      element.className = `bit ${bit === '1' ? 'on' : ''}`.trim();
      element.textContent = bit;
      element.dataset.bitIndex = String(index);
      element.setAttribute('aria-label', `Bit ${7 - index}, peso ${2 ** (7 - index)}, valor ${bit}`);

      if (interactive) {
        element.type = 'button';
        element.setAttribute('aria-pressed', bit === '1' ? 'true' : 'false');
        element.addEventListener('click', () => onToggle?.(index));
      }
      container.append(element);
    });
  }

  function describeByteCharacter(value) {
    if (value >= 32 && value <= 126) {
      return { character: String.fromCharCode(value), label: 'ASCII imprimible' };
    }

    const controlLabels = {
      0: ['␀', 'carácter nulo'],
      9: ['⇥', 'tabulación'],
      10: ['↵', 'salto de línea'],
      13: ['␍', 'retorno de carro'],
      32: ['␠', 'espacio']
    };
    if (controlLabels[value]) {
      return { character: controlLabels[value][0], label: controlLabels[value][1] };
    }
    if (value < 32 || value === 127) {
      return { character: '·', label: 'byte de control' };
    }
    return { character: '∗', label: 'byte no ASCII; aislado no define un carácter UTF-8' };
  }

  function setByteValue(value) {
    state.byteValue = clampByte(value);
    $('#byteRange').value = String(state.byteValue);
    $('#byteDecimal').value = String(state.byteValue);
    $('#byteHex').value = byteToHex(state.byteValue);
    $('#byteBinarySummary').textContent = byteToBinary(state.byteValue);
    $('#byteDecimalSummary').textContent = String(state.byteValue);
    $('#byteHexSummary').textContent = byteToHex(state.byteValue);

    const character = describeByteCharacter(state.byteValue);
    $('#byteCharacter').textContent = character.character;
    $('#byteCharacterLabel').textContent = character.label;

    renderBitStrip($('#byteBitStrip'), state.byteValue, {
      interactive: true,
      onToggle: (index) => setByteValue(state.byteValue ^ (1 << (7 - index)))
    });

    const activeWeights = [];
    for (let index = 0; index < 8; index += 1) {
      const weight = 2 ** (7 - index);
      if (state.byteValue & weight) activeWeights.push(weight);
    }
    $('#byteEquation').textContent = activeWeights.length
      ? `${activeWeights.join(' + ')} = ${state.byteValue}`
      : 'Todos los bits están apagados: valor 0';
  }

  function readOperand(selector) {
    const input = $(selector);
    const value = clampByte(input.value);
    input.value = String(value);
    return value;
  }

  function renderTruthTable(operation) {
    const definition = operationDefinitions[operation];
    const body = $('#truthTableBody');
    body.replaceChildren();
    $('#truthResultHeader').textContent = operation === 'not' ? 'NOT A' : `A ${definition.name} B`;

    const inputs = operation === 'not'
      ? [[0, null], [1, null]]
      : [[0, 0], [0, 1], [1, 0], [1, 1]];

    inputs.forEach(([a, b]) => {
      const row = document.createElement('tr');
      appendCell(row, String(a));
      appendCell(row, b === null ? '—' : String(b));
      appendCell(row, String(definition.apply(a, b) & 1));
      body.append(row);
    });
  }

  function renderBooleanOperation() {
    const a = readOperand('#operandA');
    const b = readOperand('#operandB');
    const operation = $('#operationSelect').value;
    const definition = operationDefinitions[operation];
    const result = clampByte(definition.apply(a, b));
    const unary = operation === 'not';

    $('#operandBRow').classList.toggle('hidden', unary);
    $('#operationSymbol').textContent = definition.symbol;
    $('#operandAValue').textContent = `${a} · 0x${byteToHex(a)}`;
    $('#operandBValue').textContent = `${b} · 0x${byteToHex(b)}`;
    $('#operationResultValue').textContent = `${result} · 0x${byteToHex(result)}`;
    renderBitStrip($('#operandABits'), a);
    renderBitStrip($('#operandBBits'), b);
    renderBitStrip($('#operationResultBits'), result);

    const explanation = $('#operationExplanation');
    explanation.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = definition.title;
    const paragraph = document.createElement('p');
    paragraph.textContent = definition.description;
    explanation.append(title, paragraph);

    const expression = unary
      ? `${definition.name} ${a} = ${result}`
      : `${a} ${definition.symbol} ${b} = ${result}`;
    setStatus(
      $('#operationStatus'),
      `${expression}. En binario: ${byteToBinary(result)}; en hexadecimal: ${byteToHex(result)}.`,
      operation === 'xor' ? 'good' : ''
    );
    renderTruthTable(operation);
  }

  function parseHexBytes(value, expectedLength = null) {
    const normalized = String(value)
      .replace(/0x/gi, '')
      .replace(/[\s,;:_-]+/g, '');

    if (!normalized.length) throw new Error('No hay bytes hexadecimales para interpretar.');
    if (!/^[0-9a-f]+$/i.test(normalized)) throw new Error('Hexadecimal solo admite dígitos 0–9 y letras A–F.');
    if (normalized.length % 2 !== 0) throw new Error('Cada byte hexadecimal necesita exactamente dos dígitos.');

    const bytes = new Uint8Array(normalized.length / 2);
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Number.parseInt(normalized.slice(index * 2, index * 2 + 2), 16);
    }
    if (expectedLength !== null && bytes.length !== expectedLength) {
      throw new Error(`Se esperaban ${expectedLength} bytes y se recibieron ${bytes.length}.`);
    }
    return bytes;
  }

  function parseBinaryBytes(value) {
    const normalized = String(value).replace(/0b/gi, '').replace(/[\s,;:_-]+/g, '');
    if (!normalized.length) throw new Error('No hay bits para interpretar.');
    if (!/^[01]+$/.test(normalized)) throw new Error('Binario solo admite los dígitos 0 y 1.');
    if (normalized.length % 8 !== 0) throw new Error('La cantidad de bits debe ser múltiplo de ocho.');

    const bytes = new Uint8Array(normalized.length / 8);
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Number.parseInt(normalized.slice(index * 8, index * 8 + 8), 2);
    }
    return bytes;
  }

  function parseDecimalBytes(value) {
    const tokens = String(value).trim().split(/[\s,;:_-]+/).filter(Boolean);
    if (!tokens.length) throw new Error('No hay valores decimales para interpretar.');
    const numbers = tokens.map((token) => Number(token));
    if (!numbers.every((number) => Number.isInteger(number) && number >= 0 && number <= 255)) {
      throw new Error('Cada valor decimal debe ser un entero entre 0 y 255.');
    }
    return Uint8Array.from(numbers);
  }

  function parseBase64Bytes(value) {
    const normalized = String(value).replace(/\s+/g, '');
    if (!normalized.length) throw new Error('No hay datos Base64 para interpretar.');
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) {
      throw new Error('La cadena no tiene una estructura Base64 válida.');
    }
    return b64ToBytes(normalized);
  }

  function parseKey() {
    const value = $('#xorKey').value;
    return $('#keyFormat').value === 'hex' ? parseHexBytes(value) : te.encode(value);
  }

  function expandKey(key, messageLength, repeat) {
    if (!key.length) throw new Error('La clave debe contener al menos un byte.');
    if (!repeat && key.length < messageLength) {
      throw new Error('La clave es más corta que el mensaje. Activá la repetición o usá una clave de igual longitud.');
    }

    const output = new Uint8Array(messageLength);
    for (let index = 0; index < messageLength; index += 1) {
      output[index] = repeat ? key[index % key.length] : key[index];
    }
    return output;
  }

  function xorArrays(a, b) {
    return Uint8Array.from(a, (value, index) => value ^ b[index]);
  }

  function byteDisplay(byte) {
    const character = byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '·';
    return `${character} · ${byte} · ${byteToBinary(byte)}`;
  }

  function renderXorTable() {
    const body = $('#xorRows');
    body.replaceChildren();
    const limit = Math.min(state.xorMessageBytes.length, 64);

    for (let index = 0; index < limit; index += 1) {
      const row = document.createElement('tr');
      appendCell(row, String(index + 1));
      appendCell(row, byteDisplay(state.xorMessageBytes[index]));
      appendCell(row, byteDisplay(state.xorExpandedKey[index]));
      appendCell(row, `${byteToHex(state.xorCipherBytes[index])} · ${byteToBinary(state.xorCipherBytes[index])}`);
      appendCell(row, `${byteToHex(state.xorRecoveredBytes[index])} · ${byteToBinary(state.xorRecoveredBytes[index])}`);
      body.append(row);
    }

    if (state.xorMessageBytes.length > limit) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.className = 'muted';
      cell.textContent = `Se muestran los primeros ${limit} de ${state.xorMessageBytes.length} bytes.`;
      row.append(cell);
      body.append(row);
    }
  }

  function renderXorInspector() {
    if (!state.xorMessageBytes.length) return;
    const index = Math.min(
      state.xorMessageBytes.length - 1,
      Math.max(0, Number($('#xorByteIndex').value) || 0)
    );
    const message = state.xorMessageBytes[index];
    const key = state.xorExpandedKey[index];
    const cipher = state.xorCipherBytes[index];

    $('#xorByteIndex').value = String(index);
    $('#xorByteIndexLabel').textContent = `${index + 1} de ${state.xorMessageBytes.length}`;
    renderBitStrip($('#xorMessageBits'), message);
    renderBitStrip($('#xorKeyBits'), key);
    renderBitStrip($('#xorCipherBits'), cipher);
    $('#xorMessageByte').textContent = `${message} · 0x${byteToHex(message)}`;
    $('#xorKeyByte').textContent = `${key} · 0x${byteToHex(key)}`;
    $('#xorCipherByte').textContent = `${cipher} · 0x${byteToHex(cipher)}`;
    $('#xorByteEquation').textContent =
      `${byteToBinary(message)} ⊕ ${byteToBinary(key)} = ${byteToBinary(cipher)}; ` +
      `${byteToBinary(cipher)} ⊕ ${byteToBinary(key)} = ${byteToBinary(message)}`;
  }

  function runXor() {
    try {
      const messageBytes = te.encode($('#xorMessage').value);
      if (!messageBytes.length) throw new Error('El mensaje debe contener al menos un byte.');

      const keyBytes = parseKey();
      const repeat = $('#repeatKey').checked;
      const expandedKey = expandKey(keyBytes, messageBytes.length, repeat);
      const cipherBytes = xorArrays(messageBytes, expandedKey);
      const recoveredBytes = xorArrays(cipherBytes, expandedKey);

      state.xorMessageBytes = messageBytes;
      state.xorKeyBytes = keyBytes;
      state.xorExpandedKey = expandedKey;
      state.xorCipherBytes = cipherBytes;
      state.xorRecoveredBytes = recoveredBytes;

      $('#xorCipherHex').textContent = bytesToHexGroups(cipherBytes);
      $('#xorRecoveredText').textContent = td.decode(recoveredBytes);
      $('#xorIdentity').textContent = '(M ⊕ K) ⊕ K = M ✓';
      $('#xorByteIndex').min = '0';
      $('#xorByteIndex').max = String(Math.max(0, messageBytes.length - 1));
      $('#xorByteIndex').value = '0';
      renderXorInspector();
      renderXorTable();

      const repeated = repeat && keyBytes.length < messageBytes.length;
      if (repeated) {
        setStatus(
          $('#xorStatus'),
          `La clave de ${keyBytes.length} bytes se repitió hasta cubrir ${messageBytes.length} bytes. La reversibilidad funciona, pero la periodicidad es insegura.`,
          'warn'
        );
      } else if (state.randomKeyGenerated && keyBytes.length === messageBytes.length) {
        setStatus(
          $('#xorStatus'),
          'La clave aleatoria tiene el mismo largo que el mensaje. Para ser un One-Time Pad también debe mantenerse secreta y no reutilizarse jamás.',
          'good'
        );
      } else {
        setStatus(
          $('#xorStatus'),
          `Se combinaron ${messageBytes.length} bytes. La operación es reversible; eso no demuestra que la clave tenga suficiente entropía.`,
          'warn'
        );
      }
    } catch (error) {
      state.xorMessageBytes = new Uint8Array();
      $('#xorCipherHex').textContent = '—';
      $('#xorRecoveredText').textContent = '—';
      $('#xorIdentity').textContent = '—';
      $('#xorRows').replaceChildren();
      setStatus($('#xorStatus'), error.message, 'bad');
    }
  }

  function generateRandomKey() {
    const messageBytes = te.encode($('#xorMessage').value);
    if (!messageBytes.length) {
      setStatus($('#xorStatus'), 'Escribí un mensaje antes de generar la clave.', 'bad');
      return;
    }
    if (!globalThis.crypto?.getRandomValues) {
      setStatus($('#xorStatus'), 'El navegador no ofrece una fuente criptográfica de aleatoriedad.', 'bad');
      return;
    }

    const key = globalThis.crypto.getRandomValues(new Uint8Array(messageBytes.length));
    $('#xorKey').value = bytesToHexGroups(key);
    $('#keyFormat').value = 'hex';
    $('#repeatKey').checked = false;
    state.randomKeyGenerated = true;
    runXor();
  }

  function decodeBytes() {
    try {
      const format = $('#decodeFormat').value;
      const value = $('#decodeInput').value;
      const parsers = {
        hex: parseHexBytes,
        binary: parseBinaryBytes,
        decimal: parseDecimalBytes,
        base64: parseBase64Bytes
      };
      const bytes = parsers[format](value);
      const decoder = new TextDecoder('utf-8', { fatal: true });
      const text = decoder.decode(bytes);
      $('#decodedText').textContent = text || '(cadena vacía)';
      setStatus(
        $('#decodeStatus'),
        `${bytes.length} ${bytes.length === 1 ? 'byte interpretado' : 'bytes interpretados'} correctamente como UTF-8.`,
        'good'
      );
    } catch (error) {
      $('#decodedText').textContent = 'No se pudo reconstruir texto UTF-8.';
      setStatus($('#decodeStatus'), error.message, 'bad');
    }
  }

  function useCurrentMessage() {
    if (!state.messageBytes.length) {
      setStatus($('#decodeStatus'), 'El mensaje actual no contiene bytes.', 'warn');
      return;
    }

    const format = $('#decodeFormat').value;
    const formatters = {
      hex: bytesToHexGroups,
      binary: bytesToBinaryGroups,
      decimal: bytesToDecimalGroups,
      base64: bytesToB64
    };
    $('#decodeInput').value = formatters[format](state.messageBytes);
    decodeBytes();
  }

  function renderEndianBytes(container, bytes) {
    container.replaceChildren();
    bytes.forEach((byte) => {
      const element = document.createElement('span');
      element.className = 'endian-byte';
      element.textContent = byteToHex(byte);
      container.append(element);
    });
  }

  function calculateEndian() {
    try {
      const bytes = parseHexBytes($('#endianInput').value, 4);
      const bigEndian = [...bytes].reduce((value, byte) => value * 256 + byte, 0);
      const littleEndian = [...bytes].reduce((value, byte, index) => value + byte * (256 ** index), 0);
      const reversed = Uint8Array.from([...bytes].reverse());

      renderEndianBytes($('#bigEndianBytes'), bytes);
      renderEndianBytes($('#littleEndianBytes'), reversed);
      $('#bigEndianValue').textContent = `0x${bytesToHexGroups(bytes).replaceAll(' ', '')} = ${bigEndian.toLocaleString('es-AR')}`;
      $('#littleEndianValue').textContent = `0x${bytesToHexGroups(reversed).replaceAll(' ', '')} = ${littleEndian.toLocaleString('es-AR')}`;
      setStatus(
        $('#endianStatus'),
        `La memoria contiene ${bytesToHexGroups(bytes)}. La convención decide qué peso recibe cada posición.`,
        'good'
      );
    } catch (error) {
      $('#bigEndianBytes').replaceChildren();
      $('#littleEndianBytes').replaceChildren();
      $('#bigEndianValue').textContent = '—';
      $('#littleEndianValue').textContent = '—';
      setStatus($('#endianStatus'), error.message, 'bad');
    }
  }

  function checkChallenge(challenge, index) {
    const selected = $('input:checked', challenge);
    const feedback = $('.challenge-feedback', challenge);
    if (!selected) {
      challenge.classList.remove('correct');
      challenge.classList.add('incorrect');
      feedback.textContent = 'Seleccioná una respuesta antes de comprobar.';
      return;
    }

    const correct = selected.value === challenge.dataset.answer;
    challenge.classList.toggle('correct', correct);
    challenge.classList.toggle('incorrect', !correct);
    feedback.textContent = correct ? challengeFeedback[index] : `Revisá la experiencia. Pista: ${challengeFeedback[index]}`;

    if (correct) state.solvedChallenges.add(index);
    else state.solvedChallenges.delete(index);
    const score = state.solvedChallenges.size;
    $('#challengeScore').textContent = `${score} de 4`;
    $('#challengeProgress').style.width = `${score * 25}%`;
  }

  function bindEvents() {
    $('#encodeButton').addEventListener('click', renderMessage);
    $('#messageInput').addEventListener('input', renderMessage);
    $('#clearMessageButton').addEventListener('click', () => {
      $('#messageInput').value = '';
      renderMessage();
      $('#messageInput').focus();
    });
    $$('.preset-button').forEach((button) => {
      button.addEventListener('click', () => {
        $('#messageInput').value = button.dataset.preset;
        renderMessage();
      });
    });

    $('#byteRange').addEventListener('input', (event) => setByteValue(event.target.value));
    $('#byteDecimal').addEventListener('input', (event) => setByteValue(event.target.value));
    $('#byteHex').addEventListener('input', (event) => {
      const value = event.target.value.trim();
      if (/^[0-9a-f]{1,2}$/i.test(value)) setByteValue(Number.parseInt(value, 16));
    });

    $('#operandA').addEventListener('input', renderBooleanOperation);
    $('#operandB').addEventListener('input', renderBooleanOperation);
    $('#operationSelect').addEventListener('change', renderBooleanOperation);

    $('#runXorButton').addEventListener('click', () => {
      state.randomKeyGenerated = false;
      runXor();
    });
    $('#randomKeyButton').addEventListener('click', generateRandomKey);
    $('#xorByteIndex').addEventListener('input', renderXorInspector);
    $('#keyFormat').addEventListener('change', () => {
      state.randomKeyGenerated = false;
      setStatus(
        $('#xorStatus'),
        $('#keyFormat').value === 'hex'
          ? 'Ingresá pares hexadecimales separados por espacios, por ejemplo: 2A FF 01.'
          : 'La clave de texto se convertirá a bytes UTF-8 antes de aplicar XOR.',
        ''
      );
    });

    $('#decodeButton').addEventListener('click', decodeBytes);
    $('#useCurrentButton').addEventListener('click', useCurrentMessage);
    $('#decodeFormat').addEventListener('change', () => {
      setStatus(
        $('#decodeStatus'),
        'Podés cargar automáticamente la representación correspondiente del mensaje actual.',
        ''
      );
    });

    $('#calculateEndianButton').addEventListener('click', calculateEndian);
    $('#endianInput').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') calculateEndian();
    });

    $$('.challenge').forEach((challenge, index) => {
      $('.check-challenge', challenge).addEventListener('click', () => checkChallenge(challenge, index));
    });
  }

  function initialize() {
    bindEvents();
    renderMessage();
    setByteValue(65);
    renderBooleanOperation();
    runXor();
    calculateEndian();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
