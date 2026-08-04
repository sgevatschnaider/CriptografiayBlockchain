(() => {
  'use strict';
  const THEMES = ['nocturno','claro','contraste','oceano'];
  const KEY = 'crypto-modern-theme';
  const root = document.documentElement;
  const progress = document.querySelector('[data-reading-progress]');

  function applyTheme(value) {
    const theme = THEMES.includes(value) ? value : 'nocturno';
    root.dataset.theme = theme;
    root.style.colorScheme = theme === 'claro' ? 'light' : 'dark';
    document.querySelectorAll('[data-theme-select]').forEach((select) => { select.value = theme; });
    try { localStorage.setItem(KEY, theme); } catch {}
  }

  function updateProgress() {
    if (!progress) return;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.width = `${Math.min(100, Math.max(0, scrollY / max * 100))}%`;
  }

  function initMap() {
    const detail = document.querySelector('[data-map-detail]');
    if (!detail) return;
    document.querySelectorAll('[data-map-node]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-map-node]').forEach((node) => node.classList.toggle('active', node === button));
        detail.innerHTML = `<h3>${button.dataset.title}</h3><p>${button.dataset.detail}</p>`;
      });
    });
  }

  function initReveal() {
    const items = [...document.querySelectorAll('.reveal')];
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    items.forEach((item) => observer.observe(item));
  }

  document.addEventListener('DOMContentLoaded', () => {
    let theme = 'nocturno';
    try { theme = localStorage.getItem(KEY) || theme; } catch {}
    applyTheme(theme);
    document.querySelectorAll('[data-theme-select]').forEach((select) => {
      select.addEventListener('change', () => applyTheme(select.value));
    });
    initMap();
    initReveal();
    updateProgress();
  }, { once: true });
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);
})();
