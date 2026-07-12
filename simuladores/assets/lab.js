(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const te = new TextEncoder();
  const td = new TextDecoder();

  function mod(value, modulus) {
    const n = Number(modulus);
    return ((Number(value) % n) + n) % n;
  }

  function gcd(a, b) {
    a = Math.abs(Number(a));
    b = Math.abs(Number(b));
    while (b) [a, b] = [b, a % b];
    return a;
  }

  function egcd(a, b) {
    let [oldR, r] = [Number(a), Number(b)];
    let [oldS, s] = [1, 0];
    let [oldT, t] = [0, 1];

    while (r) {
      const quotient = Math.floor(oldR / r);
      [oldR, r] = [r, oldR - quotient * r];
      [oldS, s] = [s, oldS - quotient * s];
      [oldT, t] = [t, oldT - quotient * t];
    }

    return { g: oldR, x: oldS, y: oldT };
  }

  function powMod(base, exponent, modulus) {
    let b = BigInt(mod(base, modulus));
    let e = BigInt(exponent);
    const m = BigInt(modulus);
    let result = 1n;

    while (e > 0n) {
      if (e & 1n) result = (result * b) % m;
      b = (b * b) % m;
      e >>= 1n;
    }

    return Number(result);
  }

  function randomInt(min, max) {
    if (!globalThis.crypto?.getRandomValues) {
      throw new Error('El navegador no ofrece una fuente criptográfica de aleatoriedad.');
    }

    min = Math.ceil(Number(min));
    max = Math.floor(Number(max));
    if (max < min) throw new RangeError('Rango aleatorio inválido.');

    const span = max - min + 1;
    const limit = Math.floor(0x1_0000_0000 / span) * span;
    const buffer = new Uint32Array(1);
    let value;

    do {
      crypto.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= limit);

    return min + (value % span);
  }

  function bytesToHex(bytes) {
    return [...new Uint8Array(bytes)]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  function hexToBytes(hex) {
    const normalized = String(hex).trim();
    if (!/^(?:[0-9a-fA-F]{2})*$/.test(normalized)) {
      throw new Error('Cadena hexadecimal inválida.');
    }

    const output = new Uint8Array(normalized.length / 2);
    for (let index = 0; index < output.length; index += 1) {
      output[index] = Number.parseInt(normalized.slice(index * 2, index * 2 + 2), 16);
    }
    return output;
  }

  function bytesToB64(bytes) {
    let binary = '';
    for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  function b64ToBytes(value) {
    const raw = atob(String(value));
    return Uint8Array.from(raw, (character) => character.charCodeAt(0));
  }

  async function sha256(value) {
    if (!crypto?.subtle) throw new Error('Web Crypto no está disponible en este contexto.');
    const digest = await crypto.subtle.digest('SHA-256', te.encode(String(value)));
    return bytesToHex(digest);
  }

  function bitDifference(hexA, hexB) {
    let difference = 0;
    const length = Math.min(hexA.length, hexB.length);

    for (let index = 0; index < length; index += 1) {
      let xor = Number.parseInt(hexA[index], 16) ^ Number.parseInt(hexB[index], 16);
      while (xor) {
        difference += xor & 1;
        xor >>= 1;
      }
    }

    return difference;
  }

  function setStatus(element, message, type = '') {
    if (!element) return;
    element.textContent = message;
    element.className = `status ${type}`.trim();
    element.setAttribute('role', type === 'bad' ? 'alert' : 'status');
    element.setAttribute('aria-live', type === 'bad' ? 'assertive' : 'polite');
    element.setAttribute('aria-atomic', 'true');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    })[character]);
  }

  function downloadText(name, text, type = 'text/plain') {
    const anchor = document.createElement('a');
    const url = URL.createObjectURL(new Blob([text], { type }));
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function xorBytes(a, b) {
    const length = Math.min(a.length, b.length);
    const output = new Uint8Array(length);
    for (let index = 0; index < length; index += 1) output[index] = a[index] ^ b[index];
    return output;
  }

  function entropyOfText(text) {
    if (!text.length) return 0;
    const frequencies = new Map();
    for (const character of text) {
      frequencies.set(character, (frequencies.get(character) ?? 0) + 1);
    }

    let entropy = 0;
    for (const count of frequencies.values()) {
      const probability = count / text.length;
      entropy -= probability * Math.log2(probability);
    }
    return entropy;
  }

  function isProbablePrime(value) {
    const n = Number(value);
    if (!Number.isSafeInteger(n) || n < 2) return false;
    if (n % 2 === 0) return n === 2;
    for (let divisor = 3; divisor * divisor <= n; divisor += 2) {
      if (n % divisor === 0) return false;
    }
    return true;
  }

  function nav() {
    return `
      <a class="skip-link" href="#contenido">Saltar al contenido</a>
      <header class="topbar">
        <div class="brand">
          <a href="index.html" aria-label="Ir al campus de laboratorios">🔐 Laboratorios de Criptografía</a>
        </div>
        <nav class="nav" aria-label="Navegación principal">
          <a href="index.html">Todos los módulos</a>
          <a href="https://github.com/sgevatschnaider/CriptografiayBlockchain" target="_blank" rel="noopener noreferrer">Repositorio ↗</a>
        </nav>
      </header>
      <div id="contenido" tabindex="-1"></div>`;
  }

  function footer() {
    return `
      <footer class="footer">
        <p><strong>Laboratorio educativo.</strong> Los algoritmos simplificados y parámetros pequeños no deben utilizarse para proteger información real.</p>
        <p class="capability" data-capability></p>
      </footer>`;
  }

  function associateLabels() {
    $$('.control').forEach((control) => {
      const label = $('label', control);
      const field = $('input, textarea, select, output', control);
      if (!label || !field) return;
      if (!field.id) field.id = `campo-${crypto.getRandomValues(new Uint32Array(1))[0].toString(16)}`;
      if (!label.htmlFor) label.htmlFor = field.id;
    });
  }

  function enhanceAccessibility() {
    associateLabels();

    $$('button').forEach((button) => {
      if (!button.hasAttribute('type')) button.type = 'button';
    });

    $$('.status, .output').forEach((element) => {
      if (!element.hasAttribute('aria-live')) element.setAttribute('aria-live', 'polite');
      element.setAttribute('aria-atomic', 'true');
    });

    $$('canvas').forEach((canvas) => {
      canvas.setAttribute('role', 'img');
      if (!canvas.hasAttribute('aria-label')) canvas.setAttribute('aria-label', 'Visualización interactiva del laboratorio');
    });

    $$('a[target="_blank"]').forEach((anchor) => {
      anchor.rel = 'noopener noreferrer';
    });

    const capability = $('[data-capability]');
    if (capability) {
      const webCrypto = Boolean(globalThis.crypto?.subtle && globalThis.isSecureContext);
      capability.textContent = webCrypto
        ? 'Entorno seguro detectado: Web Crypto disponible.'
        : 'Web Crypto requiere HTTPS o localhost; algunas operaciones modernas pueden estar deshabilitadas.';
      capability.classList.toggle('warning-text', !webCrypto);
    }
  }

  function showRuntimeError(error) {
    const message = error?.message || String(error);
    let banner = $('#runtime-error');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'runtime-error';
      banner.className = 'runtime-error';
      banner.setAttribute('role', 'alert');
      document.body.prepend(banner);
    }
    banner.textContent = `La simulación encontró un error: ${message}`;
  }

  window.addEventListener('error', (event) => showRuntimeError(event.error || event.message));
  window.addEventListener('unhandledrejection', (event) => showRuntimeError(event.reason));
  window.addEventListener('DOMContentLoaded', enhanceAccessibility, { once: true });

  window.Lab = Object.freeze({
    $,
    $$,
    te,
    td,
    mod,
    gcd,
    egcd,
    powMod,
    randomInt,
    bytesToHex,
    hexToBytes,
    bytesToB64,
    b64ToBytes,
    sha256,
    bitDifference,
    setStatus,
    escapeHtml,
    downloadText,
    xorBytes,
    entropyOfText,
    isProbablePrime,
    nav,
    footer,
    enhanceAccessibility
  });
})();
