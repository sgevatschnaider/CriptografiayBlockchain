(() => {
  'use strict';

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  function assertWebCrypto() {
    if (!globalThis.crypto?.subtle) {
      throw new Error('Web Crypto no está disponible en este navegador.');
    }
    if (!globalThis.isSecureContext) {
      throw new Error('Web Crypto requiere HTTPS o localhost. Abrí el laboratorio desde GitHub Pages.');
    }
  }

  function randomBytes(length) {
    assertWebCrypto();
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  function bytesToHex(value, separator = '') {
    return [...new Uint8Array(value)]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join(separator);
  }

  function hexToBytes(value) {
    const normalized = String(value).replace(/\s+/g, '');
    if (!/^(?:[0-9a-fA-F]{2})*$/.test(normalized)) {
      throw new Error('El valor hexadecimal no es válido.');
    }
    const bytes = new Uint8Array(normalized.length / 2);
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Number.parseInt(normalized.slice(index * 2, index * 2 + 2), 16);
    }
    return bytes;
  }

  function bytesToBase64(value) {
    let binary = '';
    for (const byte of new Uint8Array(value)) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  function base64ToBytes(value) {
    const binary = atob(String(value));
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  }

  function concatBytes(...values) {
    const arrays = values.map((value) => new Uint8Array(value));
    const result = new Uint8Array(arrays.reduce((total, item) => total + item.length, 0));
    let offset = 0;
    for (const item of arrays) {
      result.set(item, offset);
      offset += item.length;
    }
    return result;
  }

  function normalizePassword(value) {
    return String(value).normalize('NFC');
  }

  function clampIterations(value, minimum = 10_000, maximum = 1_000_000) {
    const parsed = Math.round(Number(value));
    if (!Number.isFinite(parsed)) return minimum;
    return Math.max(minimum, Math.min(maximum, parsed));
  }

  async function sha256Bytes(value) {
    assertWebCrypto();
    const bytes = typeof value === 'string' ? encoder.encode(value) : new Uint8Array(value);
    return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  }

  async function importPassword(value) {
    assertWebCrypto();
    const normalized = normalizePassword(value);
    if (!normalized.length) throw new Error('Ingresá una contraseña ficticia para continuar.');
    return crypto.subtle.importKey('raw', encoder.encode(normalized), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
  }

  async function derivePbkdf2Bits(password, salt, iterations, bitLength = 256) {
    const keyMaterial = await importPassword(password);
    return new Uint8Array(await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: new Uint8Array(salt),
        iterations: clampIterations(iterations)
      },
      keyMaterial,
      bitLength
    ));
  }

  async function deriveAesGcmKey(password, salt, iterations) {
    const keyMaterial = await importPassword(password);
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: new Uint8Array(salt),
        iterations: clampIterations(iterations)
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function importAesKey(rawKey, algorithm, usages = ['encrypt', 'decrypt']) {
    assertWebCrypto();
    return crypto.subtle.importKey('raw', new Uint8Array(rawKey), { name: algorithm }, false, usages);
  }

  function splitGcmResult(value, tagLength = 16) {
    const bytes = new Uint8Array(value);
    if (bytes.length < tagLength) throw new Error('El resultado GCM no contiene un tag completo.');
    return {
      ciphertext: bytes.slice(0, -tagLength),
      tag: bytes.slice(-tagLength)
    };
  }

  function splitBlocks(value, size = 16) {
    const bytes = new Uint8Array(value);
    const blocks = [];
    for (let offset = 0; offset < bytes.length; offset += size) {
      blocks.push(bytes.slice(offset, offset + size));
    }
    return blocks;
  }

  function pkcs7PaddingLength(byteLength, blockSize = 16) {
    const remainder = byteLength % blockSize;
    return remainder === 0 ? blockSize : blockSize - remainder;
  }

  function formatDuration(milliseconds) {
    if (!Number.isFinite(milliseconds)) return '—';
    if (milliseconds < 1) return `${milliseconds.toFixed(2)} ms`;
    if (milliseconds < 1_000) return `${milliseconds.toFixed(1)} ms`;
    const seconds = milliseconds / 1_000;
    if (seconds < 60) return `${seconds.toFixed(2)} s`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${minutes.toFixed(1)} min`;
    const hours = minutes / 60;
    if (hours < 48) return `${hours.toFixed(1)} h`;
    const days = hours / 24;
    if (days < 730) return `${days.toFixed(1)} días`;
    return `${(days / 365.25).toFixed(1)} años`;
  }

  function describeText(value) {
    const source = String(value);
    const normalized = normalizePassword(source);
    const codePoints = [...source].length;
    const graphemes = globalThis.Intl?.Segmenter
      ? [...new Intl.Segmenter('es', { granularity: 'grapheme' }).segment(source)].length
      : codePoints;
    return {
      source,
      normalized,
      changedByNormalization: source !== normalized,
      utf16Units: source.length,
      codePoints,
      graphemes,
      utf8Bytes: encoder.encode(normalized).length
    };
  }

  function safeFileName(value, fallback = 'archivo') {
    const cleaned = String(value || fallback)
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned || fallback;
  }

  function downloadBlob(name, blob) {
    const anchor = document.createElement('a');
    const url = URL.createObjectURL(blob);
    anchor.href = url;
    anchor.download = safeFileName(name);
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }

  globalThis.Class3Crypto = Object.freeze({
    encoder,
    decoder,
    assertWebCrypto,
    randomBytes,
    bytesToHex,
    hexToBytes,
    bytesToBase64,
    base64ToBytes,
    concatBytes,
    normalizePassword,
    clampIterations,
    sha256Bytes,
    derivePbkdf2Bits,
    deriveAesGcmKey,
    importAesKey,
    splitGcmResult,
    splitBlocks,
    pkcs7PaddingLength,
    formatDuration,
    describeText,
    safeFileName,
    downloadBlob
  });
})();
