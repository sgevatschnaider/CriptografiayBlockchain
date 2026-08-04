(() => {
  'use strict';

  const encoder = new TextEncoder();
  const progress = document.querySelector('[data-reading-progress]');
  const stateRoot = document.getElementById('theory-state');
  const textInput = document.getElementById('theory-text');
  const hexOutput = document.getElementById('theory-hex');
  const status = document.getElementById('theory-encoding-status');

  function toHex(bytes) {
    return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join(' ');
  }

  function fitBlock(bytes) {
    const block = new Uint8Array(16);
    block.set(bytes.slice(0, 16));
    return block;
  }

  function renderState(bytes) {
    stateRoot.replaceChildren();
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        const index = row + (4 * column);
        const cell = document.createElement('div');
        cell.className = 'aes-byte';
        cell.textContent = bytes[index].toString(16).padStart(2, '0').toUpperCase();
        cell.title = `b${index} = ${bytes[index]} decimal`;
        stateRoot.append(cell);
      }
    }
  }

  function encodeCurrentText() {
    const raw = encoder.encode(textInput.value);
    const block = fitBlock(raw);
    renderState(block);
    hexOutput.textContent = `UTF-8 (${raw.length} bytes): ${toHex(raw)}\nBloque AES (16 bytes): ${toHex(block)}`;
    const note = raw.length > 16
      ? 'La entrada excedía 16 bytes y fue truncada para esta visualización de un solo bloque.'
      : raw.length < 16
        ? `Se completaron ${16 - raw.length} bytes con 00 únicamente para visualizar el estado. Esto no representa por sí solo un esquema de padding de producción.`
        : 'La entrada ocupa exactamente un bloque AES.';
    status.textContent = note;
    status.dataset.kind = raw.length === 16 ? 'good' : 'warn';
  }

  document.getElementById('encode-theory').addEventListener('click', encodeCurrentText);
  document.getElementById('use-vector-theory').addEventListener('click', () => {
    const vector = Uint8Array.from({ length: 16 }, (_, index) => (index * 0x11) & 0xff);
    textInput.value = 'Vector FIPS 197';
    renderState(vector);
    hexOutput.textContent = `Vector hexadecimal: ${toHex(vector)}\nOrden por columnas conforme al estado AES.`;
    status.textContent = 'Se cargó el bloque 00 11 22 33 44 55 66 77 88 99 aa bb cc dd ee ff utilizado en ejemplos conocidos de AES.';
    status.dataset.kind = 'good';
  });

  document.querySelectorAll('.aes-term button').forEach((button) => {
    button.addEventListener('click', () => {
      const term = button.closest('.aes-term');
      const expanded = term.getAttribute('aria-expanded') === 'true';
      term.setAttribute('aria-expanded', String(!expanded));
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal-on-scroll').forEach((section) => observer.observe(section));

  function updateReadingProgress() {
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = documentHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / documentHeight) * 100)) : 0;
    progress.style.width = `${percentage}%`;
  }
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  window.addEventListener('resize', updateReadingProgress);

  encodeCurrentText();
  updateReadingProgress();
})();
