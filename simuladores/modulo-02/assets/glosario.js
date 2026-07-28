(() => {
  'use strict';

  const STORAGE_KEY = 'criptografia-modulo-02-glosario';
  const terms = window.Module02Glossary || [];
  const $ = (id) => document.getElementById(id);
  let known = readKnown();
  let visible = [];

  function readKnown() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  }

  function saveKnown() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...known]));
    } catch {
      // La interfaz continúa aunque el almacenamiento esté bloqueado.
    }
  }

  function normalize(value) {
    return String(value).toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function matches(term) {
    const query = normalize($('glossary-search').value.trim());
    const category = $('glossary-category').value;
    const status = $('glossary-status').value;
    const searchable = normalize(`${term.term} ${term.definition} ${term.example} ${term.related} ${term.category}`);
    const queryMatch = !query || query.split(/\s+/).every((part) => searchable.includes(part));
    const categoryMatch = category === 'all' || term.category === category;
    const knownTerm = known.has(term.id);
    const statusMatch = status === 'all' || (status === 'known' ? knownTerm : !knownTerm);
    return queryMatch && categoryMatch && statusMatch;
  }

  function render() {
    visible = terms.filter(matches);
    $('glossary-grid').innerHTML = visible.map((term) => `
      <article class="term-card ${known.has(term.id) ? 'known' : ''}" id="term-${Module02.safeText(term.id)}">
        <div class="term-head">
          <div>
            <span class="micro-tag">${Module02.safeText(term.category)}</span>
            <h2>${Module02.safeText(term.term)}</h2>
          </div>
          <button class="known-toggle" type="button" data-known-id="${Module02.safeText(term.id)}" aria-pressed="${known.has(term.id)}">${known.has(term.id) ? '✓ Dominado' : 'Marcar'}</button>
        </div>
        <p>${Module02.safeText(term.definition)}</p>
        <div class="example-box"><p><strong>Ejemplo:</strong> ${Module02.safeText(term.example)}</p></div>
        <div class="term-related"><strong>Relacionados:</strong> ${Module02.safeText(term.related)}</div>
      </article>
    `).join('');
    $('glossary-empty').hidden = visible.length > 0;
    document.querySelectorAll('[data-known-id]').forEach((button) => {
      button.addEventListener('click', () => toggleKnown(button.dataset.knownId));
    });
    updateStats();
  }

  function toggleKnown(id) {
    if (known.has(id)) known.delete(id);
    else known.add(id);
    saveKnown();
    render();
  }

  function updateStats() {
    const percent = terms.length ? Math.round(known.size / terms.length * 100) : 0;
    $('total-terms').textContent = String(terms.length);
    $('visible-terms').textContent = String(visible.length);
    $('known-terms').textContent = String(known.size);
    $('known-percent').textContent = `${percent}%`;
    $('known-count').textContent = `${known.size}/${terms.length}`;
    $('glossary-status-text').textContent = `Mostrando ${visible.length} de ${terms.length} términos. ${known.size} marcados como dominados.`;
  }

  function randomTerm() {
    if (!visible.length) return;
    const bytes = Module02.randomBytes(4);
    const value = new DataView(bytes.buffer).getUint32(0);
    const term = visible[value % visible.length];
    const card = document.getElementById(`term-${term.id}`);
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.animate([
      { boxShadow: '0 0 0 0 rgba(99,213,255,0)' },
      { boxShadow: '0 0 0 5px rgba(99,213,255,.28)' },
      { boxShadow: '0 0 0 0 rgba(99,213,255,0)' }
    ], { duration: 900 });
  }

  const categories = [...new Set(terms.map((term) => term.category))];
  $('glossary-category').insertAdjacentHTML('beforeend', categories.map((category) => `<option value="${Module02.safeText(category)}">${Module02.safeText(category)}</option>`).join(''));
  $('glossary-search').addEventListener('input', render);
  $('glossary-category').addEventListener('change', render);
  $('glossary-status').addEventListener('change', render);
  $('random-term').addEventListener('click', randomTerm);
  render();
})();
