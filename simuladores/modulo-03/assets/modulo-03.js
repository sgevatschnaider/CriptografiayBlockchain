(() => {
  'use strict';

  const STORAGE_KEY = 'criptografia-modulo-03-progreso';
  const CURRICULUM = Object.freeze([
    'fundamentos',
    'bloques-flujo',
    'kdf',
    'aes-aead',
    'archivos',
    'hash-mac-firma',
    'oraculo-padding',
    'clave-publica',
    'glosario',
    'cuestionario'
  ]);

  const pageId = document.body.dataset.modulePage || '';
  let toastTimer = 0;

  function emptyProgress() {
    return { visited: [], completed: [], bestQuiz: 0, updatedAt: null };
  }

  function readProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!parsed || typeof parsed !== 'object') return emptyProgress();
      return {
        visited: Array.isArray(parsed.visited) ? parsed.visited : [],
        completed: Array.isArray(parsed.completed) ? parsed.completed : [],
        bestQuiz: Number(parsed.bestQuiz) || 0,
        updatedAt: parsed.updatedAt || null
      };
    } catch {
      return emptyProgress();
    }
  }

  function writeProgress(progress) {
    const next = {
      visited: [...new Set(progress.visited || [])].filter((id) => CURRICULUM.includes(id)),
      completed: [...new Set(progress.completed || [])].filter((id) => CURRICULUM.includes(id)),
      bestQuiz: Math.max(0, Math.min(100, Number(progress.bestQuiz) || 0)),
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // El recorrido sigue disponible si el navegador bloquea localStorage.
    }
    updateProgressUi(next);
    return next;
  }

  function markVisited(id) {
    if (!CURRICULUM.includes(id)) return readProgress();
    const progress = readProgress();
    progress.visited.push(id);
    return writeProgress(progress);
  }

  function setCompleted(id, complete = true) {
    if (!CURRICULUM.includes(id)) return readProgress();
    const progress = readProgress();
    progress.visited.push(id);
    progress.completed = complete
      ? [...progress.completed, id]
      : progress.completed.filter((item) => item !== id);
    return writeProgress(progress);
  }

  function setBestQuiz(score) {
    const progress = readProgress();
    progress.bestQuiz = Math.max(progress.bestQuiz, Number(score) || 0);
    if (score >= 70) progress.completed.push('cuestionario');
    return writeProgress(progress);
  }

  function updateProgressUi(progress = readProgress()) {
    const completed = new Set(progress.completed);
    const percent = Math.round((completed.size / CURRICULUM.length) * 100);

    document.querySelectorAll('[data-module-progress]').forEach((root) => {
      const bar = root.querySelector('[data-progress-bar]');
      const label = root.querySelector('[data-progress-label]');
      const count = root.querySelector('[data-progress-count]');
      if (bar) bar.style.width = `${percent}%`;
      if (label) label.textContent = `${percent}%`;
      if (count) count.textContent = `${completed.size}/${CURRICULUM.length}`;
      root.setAttribute('aria-label', `Progreso del Módulo 3: ${completed.size} de ${CURRICULUM.length}`);
    });

    document.querySelectorAll('[data-module-station]').forEach((checkbox) => {
      checkbox.checked = completed.has(checkbox.dataset.moduleStation);
    });

    document.querySelectorAll('[data-complete-page]').forEach((button) => {
      const id = button.dataset.completePage || pageId;
      const isComplete = completed.has(id);
      button.setAttribute('aria-pressed', String(isComplete));
      button.textContent = isComplete ? '✓ Recurso completado' : 'Marcar como completado';
    });

    document.querySelectorAll('[data-best-quiz]').forEach((element) => {
      element.textContent = `${progress.bestQuiz}%`;
    });
  }

  function announce(message, type = 'good') {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.append(toast);
    }
    toast.dataset.type = type;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 3200);
  }

  function initCompleteButtons() {
    document.querySelectorAll('[data-complete-page]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.completePage || pageId;
        const completed = readProgress().completed.includes(id);
        setCompleted(id, !completed);
        announce(completed ? 'El recurso volvió a quedar pendiente.' : 'Recurso guardado como completado.');
      });
    });
  }

  function safeText(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function randomInt(max) {
    if (!Number.isInteger(max) || max <= 0) throw new RangeError('El máximo debe ser un entero positivo.');
    const limit = Math.floor(0x1_0000_0000 / max) * max;
    const value = new Uint32Array(1);
    do crypto.getRandomValues(value); while (value[0] >= limit);
    return value[0] % max;
  }

  function shuffle(values) {
    const result = values.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const other = randomInt(index + 1);
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  function popcount(value) {
    let current = value >>> 0;
    let count = 0;
    while (current) {
      current &= current - 1;
      count += 1;
    }
    return count;
  }

  function hammingBytes(a, b) {
    const length = Math.min(a.length, b.length);
    let distance = Math.abs(a.length - b.length) * 8;
    for (let index = 0; index < length; index += 1) distance += popcount(a[index] ^ b[index]);
    return distance;
  }

  if (pageId) markVisited(pageId);
  else updateProgressUi();
  initCompleteButtons();
  window.addEventListener('storage', () => updateProgressUi());

  window.Module03 = Object.freeze({
    curriculum: CURRICULUM,
    readProgress,
    writeProgress,
    markVisited,
    setCompleted,
    setBestQuiz,
    updateProgressUi,
    announce,
    safeText,
    randomInt,
    shuffle,
    randomBytes,
    hammingBytes
  });
})();
