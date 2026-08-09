((root) => {
  'use strict';

  const CONSTANTS = new Uint32Array([
    0x61707865, 0x3320646e, 0x79622d32, 0x6b206574
  ]);

  function assertBytes(value, length, label) {
    if (!(value instanceof Uint8Array) || value.length !== length) {
      throw new TypeError(`${label} debe contener ${length} bytes.`);
    }
  }

  function rotateLeft(value, distance) {
    return ((value << distance) | (value >>> (32 - distance))) >>> 0;
  }

  function quarterRound(state, a, b, c, d) {
    state[a] = (state[a] + state[b]) >>> 0;
    state[d] = rotateLeft(state[d] ^ state[a], 16);
    state[c] = (state[c] + state[d]) >>> 0;
    state[b] = rotateLeft(state[b] ^ state[c], 12);
    state[a] = (state[a] + state[b]) >>> 0;
    state[d] = rotateLeft(state[d] ^ state[a], 8);
    state[c] = (state[c] + state[d]) >>> 0;
    state[b] = rotateLeft(state[b] ^ state[c], 7);
  }

  function readUint32LE(bytes, offset) {
    return (
      bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)
    ) >>> 0;
  }

  function writeUint32LE(value, bytes, offset) {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >>> 8) & 0xff;
    bytes[offset + 2] = (value >>> 16) & 0xff;
    bytes[offset + 3] = (value >>> 24) & 0xff;
  }

  function createState(key, counter, nonce) {
    assertBytes(key, 32, 'La clave');
    assertBytes(nonce, 12, 'El nonce');
    if (!Number.isInteger(counter) || counter < 0 || counter > 0xffffffff) {
      throw new RangeError('El contador debe ser un entero entre 0 y 2^32 - 1.');
    }

    const state = new Uint32Array(16);
    state.set(CONSTANTS, 0);
    for (let index = 0; index < 8; index += 1) {
      state[4 + index] = readUint32LE(key, index * 4);
    }
    state[12] = counter >>> 0;
    state[13] = readUint32LE(nonce, 0);
    state[14] = readUint32LE(nonce, 4);
    state[15] = readUint32LE(nonce, 8);
    return state;
  }

  function block(key, counter, nonce, captureRounds = false) {
    const initial = createState(key, counter, nonce);
    const working = new Uint32Array(initial);
    const rounds = [];

    for (let doubleRound = 0; doubleRound < 10; doubleRound += 1) {
      quarterRound(working, 0, 4, 8, 12);
      quarterRound(working, 1, 5, 9, 13);
      quarterRound(working, 2, 6, 10, 14);
      quarterRound(working, 3, 7, 11, 15);
      quarterRound(working, 0, 5, 10, 15);
      quarterRound(working, 1, 6, 11, 12);
      quarterRound(working, 2, 7, 8, 13);
      quarterRound(working, 3, 4, 9, 14);
      if (captureRounds) rounds.push(new Uint32Array(working));
    }

    const finalState = new Uint32Array(16);
    const output = new Uint8Array(64);
    for (let index = 0; index < 16; index += 1) {
      finalState[index] = (working[index] + initial[index]) >>> 0;
      writeUint32LE(finalState[index], output, index * 4);
    }
    return { bytes: output, initial, finalState, rounds };
  }

  function encrypt(key, nonce, counter, input) {
    assertBytes(key, 32, 'La clave');
    assertBytes(nonce, 12, 'El nonce');
    if (!(input instanceof Uint8Array)) throw new TypeError('La entrada debe ser Uint8Array.');
    const output = new Uint8Array(input.length);
    const blockCount = Math.ceil(input.length / 64);
    if (blockCount && counter > 0xffffffff - (blockCount - 1)) {
      throw new RangeError('El contador se desbordaría para esta entrada.');
    }
    for (let blockIndex = 0; blockIndex < blockCount; blockIndex += 1) {
      const stream = block(key, counter + blockIndex, nonce).bytes;
      const offset = blockIndex * 64;
      const length = Math.min(64, input.length - offset);
      for (let index = 0; index < length; index += 1) {
        output[offset + index] = input[offset + index] ^ stream[index];
      }
    }
    return output;
  }

  function toHex(bytes) {
    return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
  }

  function fromHex(value, expectedLength) {
    const normalized = String(value).replace(/\s+/g, '');
    if (!/^(?:[0-9a-fA-F]{2})+$/.test(normalized)) throw new Error('Hexadecimal inválido.');
    const bytes = new Uint8Array(normalized.length / 2);
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Number.parseInt(normalized.slice(index * 2, index * 2 + 2), 16);
    }
    if (expectedLength && bytes.length !== expectedLength) {
      throw new Error(`Se esperaban ${expectedLength} bytes y se recibieron ${bytes.length}.`);
    }
    return bytes;
  }

  function wordHex(value) {
    return (value >>> 0).toString(16).padStart(8, '0');
  }

  root.ChaCha20Core = Object.freeze({
    rotateLeft,
    quarterRound,
    createState,
    block,
    encrypt,
    toHex,
    fromHex,
    wordHex
  });
})(globalThis);
