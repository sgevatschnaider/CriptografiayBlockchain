(() => {
  'use strict';

  const STORAGE_KEY = 'criptografia-clase-03-progreso';
  const checkboxes = [...document.querySelectorAll('[data-station]')];
  const progress = document.querySelector('.route-progress');
  const bar = document.querySelector('#progress-bar');
  const completed = document.querySelector('#completed-count');
  const percentLabel = document.querySelector('#progress-percent');
  const { setStatus } = Lab;

  function readProgress() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return new Set(Array.isArray(stored) ? stored.map(String) : []);
    } catch {
      return new Set();
    }
  }

  function saveProgress() {
    const selected = checkboxes.filter((box) => box.checked).map((box) => box.dataset.station);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch {
      // El progreso sigue funcionando durante la sesión aunque el almacenamiento esté bloqueado.
    }
    updateProgress();
  }

  function updateProgress() {
    const count = checkboxes.filter((box) => box.checked).length;
    const percentage = Math.round((count / checkboxes.length) * 100);
    completed.textContent = count;
    percentLabel.textContent = `${percentage} %`;
    bar.style.width = `${percentage}%`;
    progress.setAttribute('aria-valuenow', String(percentage));
  }

  const stored = readProgress();
  checkboxes.forEach((box) => {
    box.checked = stored.has(box.dataset.station);
    box.addEventListener('change', saveProgress);
  });
  updateProgress();

  document.querySelector('#reset-progress').addEventListener('click', () => {
    checkboxes.forEach((box) => { box.checked = false; });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // No hay acción adicional si el navegador bloquea localStorage.
    }
    updateProgress();
  });

  document.querySelector('#exit-ticket').addEventListener('submit', (event) => {
    event.preventDefault();
    const answers = { q1: 'b', q2: 'b', q3: 'a', q4: 'a', q5: 'b' };
    const data = new FormData(event.currentTarget);
    const missing = Object.keys(answers).filter((name) => !data.get(name));
    if (missing.length) {
      setStatus(document.querySelector('#ticket-status'), `Faltan ${missing.length} respuesta${missing.length === 1 ? '' : 's'}.`, 'warn');
      return;
    }
    const score = Object.entries(answers).reduce((total, [name, expected]) => total + (data.get(name) === expected ? 1 : 0), 0);
    setStatus(
      document.querySelector('#ticket-status'),
      score === 5
        ? '5/5. La secuencia conceptual está integrada: contraseña, KDF, modo y autenticación cumplen funciones distintas.'
        : `${score}/5. Revisá las respuestas: la KDF no crea entropía, la salt no es secreta y solo GCM aporta autenticación en esta comparación.`,
      score === 5 ? 'good' : 'warn'
    );
    if (score === 5) {
      const finalStation = document.querySelector('[data-station="5"]');
      finalStation.checked = true;
      saveProgress();
    }
  });
})();
