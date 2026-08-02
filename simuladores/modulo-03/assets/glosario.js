(() => {
  'use strict';

  const STORAGE_KEY = 'criptografia-modulo-03-glosario-dominados';
  const terms = window.Module03Glossary || [];
  const byId = (id) => document.getElementById(id);
  let known = readKnown();

  function readKnown() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const allowed = new Set(terms.map((term) => term.term));
      return new Set(Array.isArray(parsed) ? parsed.filter((term) => allowed.has(term)) : []);
    } catch {
      return new Set();
    }
  }

  function writeKnown() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...known]));
    } catch {
      // El glosario sigue funcionando sin persistencia.
    }
  }

  function normalize(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function visibleTerms() {
    const query = normalize(byId('glossary-search').value.trim());
    const category = byId('glossary-category').value;
    const status = byId('glossary-status').value;
    return terms.filter((term) => {
      const haystack = normalize([term.term, term.definition, term.example, term.contrast].join(' '));
      const matchesQuery = !query || haystack.includes(query);
      const matchesCategory = category === 'all' || term.category === category;
      const isKnown = known.has(term.term);
      const matchesStatus = status === 'all' || (status === 'known' ? isKnown : !isKnown);
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }

  function paragraph(label, value, className) {
    const element = document.createElement('p');
    element.className = className;
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    element.append(strong, document.createTextNode(value));
    return element;
  }

  function createCard(term) {
    const card = document.createElement('article');
    card.className = 'term-card';
    card.dataset.term = term.term;
    card.dataset.known = String(known.has(term.term));
    const category = document.createElement('span');
    category.className = 'term-category';
    category.textContent = term.category;
    const title = document.createElement('h3');
    title.textContent = term.term;
    const definition = document.createElement('p');
    definition.textContent = term.definition;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary';
    button.textContent = known.has(term.term) ? '✓ Dominado' : 'Marcar como dominado';
    button.setAttribute('aria-pressed', String(known.has(term.term)));
    button.addEventListener('click', () => {
      if (known.has(term.term)) known.delete(term.term);
      else known.add(term.term);
      writeKnown();
      render();
    });
    card.append(
      category,
      title,
      definition,
      paragraph('Ejemplo', term.example, 'term-example'),
      paragraph('No confundir con', term.contrast, 'term-contrast'),
      button
    );
    return card;
  }

  function render() {
    const visible = visibleTerms();
    const grid = byId('glossary-grid');
    grid.replaceChildren(...visible.map(createCard));
    byId('glossary-empty').hidden = visible.length > 0;
    byId('known-count').textContent = known.size;
    byId('glossary-status-text').textContent = `Mostrando ${visible.length} de ${terms.length} términos. ${known.size} marcados como dominados.`;
  }

  const categories = [...new Set(terms.map((term) => term.category))].sort((a, b) => a.localeCompare(b, 'es'));
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    byId('glossary-category').append(option);
  });
  byId('glossary-total').textContent = terms.length;
  byId('glossary-search').addEventListener('input', render);
  byId('glossary-category').addEventListener('change', render);
  byId('glossary-status').addEventListener('change', render);
  byId('random-term').addEventListener('click', () => {
    const visible = visibleTerms();
    if (!visible.length) return;
    const selected = visible[Module03.randomInt(visible.length)];
    const card = [...document.querySelectorAll('.term-card')].find((item) => item.dataset.term === selected.term);
    card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card?.querySelector('button')?.focus({ preventScroll: true });
  });
  byId('clear-known').addEventListener('click', () => {
    if (!window.confirm('¿Querés borrar todas las marcas de términos dominados?')) return;
    known = new Set();
    writeKnown();
    render();
  });

  render();
})();
