(() => {
  'use strict';
  const STORAGE_KEY = 'criptografia-clase-asimetria-progreso';
  const boxes = [...document.querySelectorAll('[data-class-station]')];
  const count = document.getElementById('asym-class-count');
  const percent = document.getElementById('asym-class-percent');
  const bar = document.getElementById('asym-class-bar');
  const progress = document.querySelector('[data-class-progress] .route-progress');

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return new Set(Array.isArray(value) ? value.map(String) : []);
    } catch {
      return new Set();
    }
  }

  function update() {
    const completed = boxes.filter((box) => box.checked).length;
    const value = Math.round((completed / boxes.length) * 100);
    count.textContent = completed;
    percent.textContent = `${value}%`;
    bar.style.width = `${value}%`;
    progress.setAttribute('aria-valuenow', String(value));
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boxes.filter((box) => box.checked).map((box) => box.dataset.classStation)));
    } catch {}
    update();
  }

  const stored = read();
  boxes.forEach((box) => {
    box.checked = stored.has(box.dataset.classStation);
    box.addEventListener('change', save);
  });
  update();

  document.getElementById('reset-asym-class').addEventListener('click', () => {
    boxes.forEach((box) => { box.checked = false; });
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    update();
  });

  document.getElementById('asym-class-ticket').addEventListener('submit', (event) => {
    event.preventDefault();
    const expected = { q1: 'b', q2: 'a', q3: 'b', q4: 'a', q5: 'b', q6: 'b' };
    const data = new FormData(event.currentTarget);
    const missing = Object.keys(expected).filter((key) => !data.get(key));
    const status = document.getElementById('asym-class-status');
    if (missing.length) {
      status.textContent = `Faltan ${missing.length} respuesta${missing.length === 1 ? '' : 's'}.`;
      status.dataset.kind = 'warn';
      return;
    }
    const score = Object.entries(expected).reduce((total, [key, value]) => total + (data.get(key) === value ? 1 : 0), 0);
    status.textContent = score === 6
      ? '6/6. Integraste primitivas, autenticación, sesión híbrida y confianza.'
      : `${score}/6. Revisá OAEP/PSS, autenticación de ECDH, HKDF, PFS y validación PKI.`;
    status.dataset.kind = score === 6 ? 'good' : 'warn';
    if (score === 6) {
      const finalStation = document.querySelector('[data-class-station="6"]');
      finalStation.checked = true;
      save();
    }
  });
})();
