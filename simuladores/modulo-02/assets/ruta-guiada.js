(() => {
  'use strict';

  const LAST_STEP_KEY = 'criptografia-modulo-02-ruta-ultimo-paso';
  const route = Object.freeze([
    {
      id: 'salto-moderno',
      title: 'Del cifrado clásico al modelo moderno',
      family: 'Apertura comparativa',
      level: 'Inicial',
      time: '20 min',
      objective: 'Distinguir apariencia, garantía ideal y seguridad computacional mediante tres experimentos.',
      evidence: 'Comparás César, OTP y AES-GCM usando propiedad, adversario, victoria y recursos.',
      url: 'introduccion-interactiva.html'
    },
    {
      id: 'teoria',
      title: 'Teoría integrada',
      family: 'Marco conceptual',
      level: 'Base',
      time: '35 min',
      objective: 'Organizar los tres pilares y distinguir qué pregunta responde cada uno.',
      evidence: 'Podés explicar seguridad perfecta, computacional y concreta sin tratarlas como sinónimos.',
      url: 'teoria.html'
    },
    {
      id: 'entropia',
      title: 'Entropía de Shannon',
      family: 'Teoría de la información',
      level: 'Inicial',
      time: '20 min',
      objective: 'Relacionar probabilidad, sorpresa, entropía y redundancia.',
      evidence: 'Predecís dónde H(p) alcanza su máximo y contrastás el cálculo con una muestra empírica.',
      url: 'entropia-shannon.html'
    },
    {
      id: 'secreto-perfecto',
      title: 'Secreto perfecto y OTP',
      family: 'Teoría de la información',
      level: 'Intermedio',
      time: '25 min',
      objective: 'Comprobar cuándo el criptograma no cambia la distribución del mensaje.',
      evidence: 'Interpretás I(M;C)=0 y mostrás por qué sesgar o reutilizar la clave rompe la condición.',
      url: 'secreto-perfecto.html'
    },
    {
      id: 'pseudoaleatoriedad',
      title: 'PRNG frente a CSPRNG',
      family: 'Aleatoriedad',
      level: 'Intermedio',
      time: '25 min',
      objective: 'Separar apariencia estadística, reproducibilidad e impredecibilidad.',
      evidence: 'Comparás balance, corridas y correlación sin presentar pruebas simples como garantía criptográfica.',
      url: 'flujo-pseudoaleatorio.html'
    },
    {
      id: 'confusion-difusion',
      title: 'Confusión, difusión y avalancha',
      family: 'Diseño simétrico',
      level: 'Intermedio',
      time: '25 min',
      objective: 'Observar cómo sustitución y mezcla dispersan un cambio de un bit.',
      evidence: 'Leés la distancia de Hamming por capa y explicás por qué la avalancha no demuestra seguridad.',
      url: 'confusion-difusion.html'
    },
    {
      id: 'juego-seguridad',
      title: 'Juego de indistinguibilidad',
      family: 'Definiciones de seguridad',
      level: 'Intermedio',
      time: '25 min',
      objective: 'Pensar la seguridad como un experimento entre desafiante y adversario.',
      evidence: 'Calculás la ventaja y reconocés la señal que deja un flujo reutilizado.',
      url: 'juego-seguridad.html'
    },
    {
      id: 'complejidad',
      title: 'Espacio de claves y costo',
      family: 'Complejidad computacional',
      level: 'Intermedio',
      time: '25 min',
      objective: 'Traducir bits de seguridad en trabajo, tiempo y supuestos del modelo.',
      evidence: 'Diferenciás fuerza bruta clásica, paralelización y la idealización cuadrática de Grover.',
      url: 'espacio-claves-complejidad.html'
    },
    {
      id: 'algebra',
      title: 'Laboratorio de estructuras',
      family: 'Álgebra y teoría de números',
      level: 'Avanzado',
      time: '35 min',
      objective: 'Reconocer operaciones y problemas difíciles en cuatro estructuras finitas.',
      evidence: 'Relacionás GF(2⁸), grupos, curvas y LWE con familias concretas de primitivas.',
      url: 'estructuras-algebraicas.html'
    },
    {
      id: 'xor-flujo',
      title: 'XOR y cifrado por flujo',
      family: 'Puente a la aplicación',
      level: 'Intermedio',
      time: '30 min',
      objective: 'Comprobar la reversibilidad de XOR y el riesgo de reutilizar un contador o keystream.',
      evidence: 'Manipulás bits, ejecutás AES-CTR y verificás cuándo C₁⊕C₂ coincide con M₁⊕M₂.',
      url: 'laboratorio-xor-flujo.html'
    },
    {
      id: 'mapas',
      title: 'Mapas mentales',
      family: 'Síntesis visual',
      level: 'Repaso',
      time: '15 min',
      objective: 'Reconstruir relaciones entre definiciones, supuestos y primitivas.',
      evidence: 'Podés recorrer cada mapa y justificar cada enlace con una frase.',
      url: 'mapas-mentales.html'
    },
    {
      id: 'glosario',
      title: 'Glosario activo',
      family: 'Vocabulario',
      level: 'Repaso',
      time: 'Flexible',
      objective: 'Consolidar el lenguaje preciso que exige el análisis criptográfico.',
      evidence: 'Filtrás, relacionás y marcás como dominados los conceptos que ya podés explicar.',
      url: 'glosario.html'
    },
    {
      id: 'cuestionario',
      title: 'Evaluación formativa',
      family: 'Integración',
      level: 'Evaluación',
      time: '30 min',
      objective: 'Transferir los conceptos a casos, cálculos y decisiones de diseño.',
      evidence: 'Alcanzás al menos 70% y revisás la explicación de cada respuesta.',
      url: 'cuestionario.html'
    }
  ]);

  const byId = (id) => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);
  const requestedStep = Number(params.get('paso') || localStorage.getItem(LAST_STEP_KEY) || 1);
  let current = Module02.clamp(Number.isFinite(requestedStep) ? requestedStep : 1, 1, route.length);

  function progress() {
    return Module02.readProgress();
  }

  function renderList() {
    const complete = new Set(progress().completed);
    byId('route-list').innerHTML = route.map((step, index) => {
      const active = index + 1 === current;
      const done = complete.has(step.id);
      return `
        <button class="guided-item${active ? ' active' : ''}${done ? ' done' : ''}"
          type="button" data-step="${index + 1}"${active ? ' aria-current="step"' : ''}>
          <span class="item-number">${String(index + 1).padStart(2, '0')}</span>
          <span><strong>${Module02.safeText(step.title)}</strong><small>${Module02.safeText(step.family)}</small></span>
          <span class="done-mark" aria-label="${done ? 'Completada' : 'Pendiente'}">✓</span>
        </button>`;
    }).join('');

    document.querySelectorAll('[data-step]').forEach((button) => {
      button.addEventListener('click', () => go(Number(button.dataset.step)));
    });
  }

  function render() {
    const step = route[current - 1];
    const completed = progress().completed.includes(step.id);

    byId('step-number').textContent = String(current).padStart(2, '0');
    byId('step-family').textContent = step.family;
    byId('step-level').textContent = step.level;
    byId('step-time').textContent = step.time;
    byId('step-title').textContent = step.title;
    byId('step-objective').textContent = step.objective;
    byId('step-evidence').textContent = step.evidence;
    byId('position-label').textContent = `${current}/${route.length}`;
    byId('open-direct').href = step.url;
    byId('lesson-frame').title = `Estación ${current}: ${step.title}`;
    byId('frame-loading').classList.remove('hidden');
    byId('lesson-frame').src = step.url;

    const previous = byId('prev');
    const next = byId('next');
    previous.disabled = current === 1;
    previous.textContent = current === 1 ? 'Inicio' : `← ${route[current - 2].title}`;
    next.textContent = current === route.length
      ? (completed ? 'Ruta completada ✓' : 'Completar la ruta')
      : `Completar y seguir →`;
    next.disabled = current === route.length && completed;
    byId('mark-done').textContent = completed ? '✓ Estación completada' : 'Completar estación';
    byId('mark-done').setAttribute('aria-pressed', String(completed));

    localStorage.setItem(LAST_STEP_KEY, String(current));
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('paso', String(current));
    history.replaceState(null, '', nextUrl);

    Module02.updateProgressUi();
    renderList();
  }

  function go(step) {
    current = Module02.clamp(step, 1, route.length);
    render();
    byId('estacion').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function completeCurrent(andAdvance = false) {
    const step = route[current - 1];
    Module02.setCompleted(step.id, true);
    Module02.announce(`Estación ${current} completada.`);
    if (andAdvance && current < route.length) {
      go(current + 1);
      return;
    }
    render();
  }

  byId('prev').addEventListener('click', () => go(current - 1));
  byId('next').addEventListener('click', () => completeCurrent(true));
  byId('mark-done').addEventListener('click', () => completeCurrent(false));
  byId('reset-progress').addEventListener('click', () => {
    const confirmed = window.confirm('¿Reiniciar el progreso de las trece estaciones y el mejor puntaje?');
    if (!confirmed) return;
    Module02.writeProgress({ visited: [], completed: [], bestQuiz: 0, updatedAt: null });
    localStorage.removeItem(LAST_STEP_KEY);
    current = 1;
    render();
    Module02.announce('Progreso reiniciado.', 'warn');
  });
  byId('lesson-frame').addEventListener('load', () => byId('frame-loading').classList.add('hidden'));
  window.addEventListener('storage', render);
  document.addEventListener('keydown', (event) => {
    if (!event.altKey) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(current - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(current + 1);
    }
  });

  render();
})();
