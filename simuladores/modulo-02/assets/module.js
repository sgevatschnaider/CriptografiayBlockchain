(() => {
  'use strict';

  const STORAGE_KEY = 'criptografia-modulo-02-progreso';
  const CURRICULUM = Object.freeze([
    'salto-moderno',
    'teoria',
    'entropia',
    'secreto-perfecto',
    'pseudoaleatoriedad',
    'confusion-difusion',
    'juego-seguridad',
    'complejidad',
    'algebra',
    'xor-flujo',
    'mapas',
    'glosario',
    'cuestionario'
  ]);

  const isEmbedded = window.self !== window.top;
  if (isEmbedded) {
    document.documentElement.classList.add('module-embedded');
    document.body.classList.add('module-embedded');
  }

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
      ...progress,
      visited: [...new Set(progress.visited)].filter((id) => CURRICULUM.includes(id)),
      completed: [...new Set(progress.completed)].filter((id) => CURRICULUM.includes(id)),
      bestQuiz: Math.max(0, Math.min(100, Number(progress.bestQuiz) || 0)),
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // El módulo continúa funcionando aunque el navegador bloquee almacenamiento local.
    }
    updateProgressUi(next);
    return next;
  }

  function markVisited(id) {
    if (!CURRICULUM.includes(id)) return readProgress();
    const progress = readProgress();
    if (!progress.visited.includes(id)) progress.visited.push(id);
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
    });

    document.querySelectorAll('[data-route-page]').forEach((card) => {
      card.dataset.complete = String(completed.has(card.dataset.routePage));
    });

    document.querySelectorAll('[data-complete-page]').forEach((button) => {
      const id = button.dataset.completePage || pageId;
      const isComplete = completed.has(id);
      button.setAttribute('aria-pressed', String(isComplete));
      button.textContent = isComplete ? '✓ Lección completada' : 'Marcar como completada';
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
        const progress = readProgress();
        const nextState = !progress.completed.includes(id);
        setCompleted(id, nextState);
        announce(nextState ? 'Lección guardada como completada.' : 'La lección volvió a quedar pendiente.');
      });
    });
  }

  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach((root) => {
      const buttons = [...root.querySelectorAll('[role="tab"]')];
      const panels = [...root.querySelectorAll('[role="tabpanel"]')];
      if (!buttons.length || !panels.length) return;

      function activate(button, focus = false) {
        const target = button.getAttribute('aria-controls');
        buttons.forEach((item) => {
          const active = item === button;
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
        });
        panels.forEach((panel) => {
          panel.hidden = panel.id !== target;
        });
        if (focus) button.focus();
      }

      buttons.forEach((button, index) => {
        button.addEventListener('click', () => activate(button));
        button.addEventListener('keydown', (event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          let next = index;
          if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
          if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = buttons.length - 1;
          activate(buttons[next], true);
        });
      });
      activate(buttons.find((button) => button.getAttribute('aria-selected') === 'true') || buttons[0]);
    });
  }

  function initCopyButtons() {
    document.querySelectorAll('[data-copy-target]').forEach((button) => {
      button.addEventListener('click', async () => {
        const target = document.querySelector(button.dataset.copyTarget);
        if (!target) return;
        const value = 'value' in target ? target.value : target.textContent;
        try {
          await navigator.clipboard.writeText(value);
          announce('Contenido copiado al portapapeles.');
        } catch {
          announce('No se pudo copiar automáticamente.', 'warn');
        }
      });
    });
  }

  function initTableOfContents() {
    const toc = document.querySelector('[data-toc]');
    if (!toc) return;
    const links = [...toc.querySelectorAll('a[href^="#"]')];
    const sections = links
      .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
      .filter(Boolean);
    if (!('IntersectionObserver' in window) || !sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      links.forEach((link) => {
        link.classList.toggle('active', link.hash === `#${visible.target.id}`);
      });
    }, { rootMargin: '-18% 0px -70% 0px', threshold: 0 });

    sections.forEach((section) => observer.observe(section));
  }

  function observeResponsiveCanvas(canvas, draw) {
    if (!canvas || typeof draw !== 'function') return () => {};
    const target = canvas.parentElement || canvas;
    let animationFrame = 0;
    let previousWidth = -1;
    let previousHeight = -1;

    function schedule() {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        const rect = target.getBoundingClientRect();
        const width = Math.round(rect.width * 100) / 100;
        const height = Math.round(rect.height * 100) / 100;
        if (width === previousWidth && height === previousHeight) return;
        previousWidth = width;
        previousHeight = height;
        draw();
      });
    }

    let observer = null;
    if ('ResizeObserver' in window) {
      observer = new ResizeObserver(schedule);
      observer.observe(target);
    } else {
      window.addEventListener('resize', schedule, { passive: true });
    }
    schedule();

    return () => {
      if (observer) observer.disconnect();
      else window.removeEventListener('resize', schedule);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }

  function entropy(probabilities) {
    return probabilities.reduce((sum, value) => {
      const p = Number(value);
      return p > 0 ? sum - p * Math.log2(p) : sum;
    }, 0);
  }

  function popcount(value) {
    let x = value >>> 0;
    let count = 0;
    while (x) {
      x &= x - 1;
      count += 1;
    }
    return count;
  }

  function hammingBytes(a, b) {
    const length = Math.min(a.length, b.length);
    let distance = 0;
    for (let index = 0; index < length; index += 1) {
      distance += popcount(a[index] ^ b[index]);
    }
    return distance + Math.abs(a.length - b.length) * 8;
  }

  function toHex(bytes, separator = ' ') {
    return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join(separator);
  }

  function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function formatPercent(value, digits = 1) {
    return `${(Number(value) * 100).toFixed(digits)}%`;
  }

  function safeText(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  if (pageId) markVisited(pageId);
  else updateProgressUi();
  initCompleteButtons();
  initTabs();
  initCopyButtons();
  initTableOfContents();
  window.addEventListener('storage', () => updateProgressUi());

  window.Module02 = Object.freeze({
    curriculum: CURRICULUM,
    readProgress,
    writeProgress,
    markVisited,
    setCompleted,
    setBestQuiz,
    updateProgressUi,
    announce,
    isEmbedded,
    observeResponsiveCanvas,
    entropy,
    popcount,
    hammingBytes,
    toHex,
    randomBytes,
    clamp,
    formatPercent,
    safeText
  });
})();
