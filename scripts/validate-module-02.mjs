import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const moduleDir = path.join(root, 'simuladores', 'modulo-02');
const errors = [];
const expectedCurriculum = [
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
];
const requiredPages = [
  'index.html',
  'ruta-guiada.html',
  'introduccion-interactiva.html',
  'teoria.html',
  'entropia-shannon.html',
  'secreto-perfecto.html',
  'flujo-pseudoaleatorio.html',
  'confusion-difusion.html',
  'juego-seguridad.html',
  'espacio-claves-complejidad.html',
  'estructuras-algebraicas.html',
  'laboratorio-xor-flujo.html',
  'mapas-mentales.html',
  'glosario.html',
  'cuestionario.html'
];
const requiredAssets = [
  'assets/module.css',
  'assets/module.js',
  'assets/confusion-difusion.css',
  'assets/confusion-difusion.js',
  'assets/pseudoaleatoriedad.css',
  'assets/pseudoaleatoriedad.js',
  'assets/introducciones.css',
  'assets/introduccion.js',
  'assets/xor-flujo.js',
  'assets/ruta-guiada.css',
  'assets/ruta-guiada.js',
  'assets/tres-pilares.svg',
  'assets/glosario-data.js',
  'assets/glosario.js',
  'assets/cuestionario-data.js',
  'assets/cuestionario.js'
];

function fail(message) {
  errors.push(message);
}

function collectFiles(directory, extension) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(absolute, extension);
    return entry.name.endsWith(extension) ? [absolute] : [];
  });
}

function relativeLabel(absolute) {
  return path.relative(root, absolute).split(path.sep).join('/');
}

function validateJavaScript(absolute) {
  try {
    new Function(fs.readFileSync(absolute, 'utf8'));
  } catch (error) {
    fail(`${relativeLabel(absolute)}: error de sintaxis JavaScript: ${error.message}`);
  }
}

for (const relative of [...requiredPages, ...requiredAssets]) {
  if (!fs.existsSync(path.join(moduleDir, relative))) {
    fail(`Falta simuladores/modulo-02/${relative}`);
  }
}

const htmlFiles = fs.existsSync(moduleDir) ? collectFiles(moduleDir, '.html') : [];
for (const absolute of htmlFiles) {
  const html = fs.readFileSync(absolute, 'utf8');
  const label = relativeLabel(absolute);
  const checks = [
    ['doctype HTML5', /<!doctype html>/i],
    ['idioma español', /<html[^>]+\blang=["']es["']/i],
    ['codificación UTF-8', /<meta[^>]+\bcharset=["']?utf-8/i],
    ['meta viewport', /<meta[^>]+\bname=["']viewport["']/i],
    ['descripción', /<meta[^>]+\bname=["']description["'][^>]+\bcontent=["'][^"']{20,}/i],
    ['título descriptivo', /<title>[^<]{12,}<\/title>/i],
    ['contenido principal', /<main\b/i],
    ['enlace para saltar contenido', /class=["'][^"']*\bskip-link\b/i],
    ['hoja de estilos común', /\.\.\/assets\/lab\.css/i],
    ['sistema visual del módulo', /assets\/module\.css/i],
    ['controlador común del módulo', /assets\/module\.js/i]
  ];

  for (const [description, pattern] of checks) {
    if (!pattern.test(html)) fail(`${label}: falta ${description}`);
  }

  if (/\son(?:click|change|input|submit)=/i.test(html)) {
    fail(`${label}: contiene manejadores inline; usar addEventListener`);
  }

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) fail(`${label}: IDs duplicados: ${duplicateIds.join(', ')}`);

  const samePageAnchors = [...html.matchAll(/\bhref=["']#([^"']+)["']/gi)]
    .map((match) => decodeURIComponent(match[1]));
  for (const anchor of samePageAnchors) {
    if (!ids.includes(anchor)) fail(`${label}: ancla local sin destino: #${anchor}`);
  }

  const localReferences = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((reference) =>
      !/^(?:https?:|mailto:|data:|javascript:|#)/i.test(reference)
    );
  for (const reference of localReferences) {
    const clean = decodeURIComponent(reference.split('#')[0].split('?')[0]);
    if (!clean) continue;
    const target = path.resolve(path.dirname(absolute), clean);
    if (!fs.existsSync(target)) fail(`${label}: referencia local inexistente: ${reference}`);
  }

  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .filter((script) => script.trim());
  inlineScripts.forEach((script, index) => {
    try {
      new Function(script);
    } catch (error) {
      fail(`${label}: error en script inline ${index + 1}: ${error.message}`);
    }
  });
}

for (const absolute of collectFiles(path.join(moduleDir, 'assets'), '.js')) {
  validateJavaScript(absolute);
}

const experienceContracts = [
  {
    file: 'introduccion-interactiva.html',
    snippets: [
      'data-module-page="salto-moderno"',
      'id="caesar-output"',
      'id="otp-output"',
      'id="modern-output"',
      'data-prediction="otp"',
      'assets/introduccion.js'
    ]
  },
  {
    file: 'flujo-pseudoaleatorio.html',
    snippets: [
      'data-module-page="pseudoaleatoriedad"',
      'id="entropy-source"',
      'id="generate-streams"',
      'id="lcg-pair-chart"',
      'id="crypto-pair-chart"',
      'id="weak-observations"',
      'id="predict-weak"',
      'id="rng-quiz"',
      'assets/pseudoaleatoriedad.css',
      'assets/pseudoaleatoriedad.js'
    ]
  },
  {
    file: 'confusion-difusion.html',
    snippets: [
      'data-module-page="confusion-difusion"',
      'id="perturb-target"',
      'id="layer-comparison"',
      'id="run-statistical-analysis"',
      'id="influence-heatmap"',
      'Criterio estricto de avalancha',
      'Criterio de independencia de bits',
      'Completitud',
      'Material elaborado por el profesor Sergio Gevatschnaider',
      'assets/confusion-difusion.css',
      'assets/confusion-difusion.js'
    ]
  },
  {
    file: 'laboratorio-xor-flujo.html',
    snippets: [
      'data-module-page="xor-flujo"',
      'data-operation="xor"',
      'id="reuse-counter"',
      'id="cipher-xor"',
      'id="message-xor"',
      'id="classification-grid"',
      'assets/xor-flujo.js'
    ]
  }
];

for (const contract of experienceContracts) {
  const absolute = path.join(moduleDir, contract.file);
  if (!fs.existsSync(absolute)) continue;
  const html = fs.readFileSync(absolute, 'utf8');
  for (const snippet of contract.snippets) {
    if (!html.includes(snippet)) {
      fail(`simuladores/modulo-02/${contract.file}: falta el contrato interactivo ${snippet}`);
    }
  }
}

const pseudoScriptPath = path.join(moduleDir, 'assets', 'pseudoaleatoriedad.js');
if (fs.existsSync(pseudoScriptPath)) {
  const pseudoScript = fs.readFileSync(pseudoScriptPath, 'utf8');
  if (/\bMath\.random\s*\(/.test(pseudoScript)) {
    fail('simuladores/modulo-02/assets/pseudoaleatoriedad.js: no usar Math.random para material criptográfico');
  }
  for (const concept of ['getRandomValues', 'predictedState', 'entropyModels', 'evaluateQuiz']) {
    if (!pseudoScript.includes(concept)) {
      fail(`simuladores/modulo-02/assets/pseudoaleatoriedad.js: falta el concepto verificable ${concept}`);
    }
  }
}

const confusionScriptPath = path.join(moduleDir, 'assets', 'confusion-difusion.js');
if (fs.existsSync(confusionScriptPath)) {
  const confusionScript = fs.readFileSync(confusionScriptPath, 'utf8');
  const confusionHtml = fs.readFileSync(path.join(moduleDir, 'confusion-difusion.html'), 'utf8');
  const confusionIds = new Set([...confusionHtml.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]));
  const referencedIds = new Set([...confusionScript.matchAll(/\$\('([^']+)'\)/g)].map((match) => match[1]));
  for (const id of referencedIds) {
    if (!confusionIds.has(id)) fail(`simuladores/modulo-02/confusion-difusion.html: falta el ID requerido por JavaScript #${id}`);
  }
  if (/\bMath\.random\s*\(/.test(confusionScript)) {
    fail('simuladores/modulo-02/assets/confusion-difusion.js: el análisis debe ser reproducible y no usar Math.random');
  }
  for (const concept of ['ANALYSIS_CONTEXTS', 'differenceBits', 'pairCounts', 'phiCoefficient', 'sampledOutputPairs', 'contextVariant', 'renderHeatmap']) {
    if (!confusionScript.includes(concept)) {
      fail(`simuladores/modulo-02/assets/confusion-difusion.js: falta el concepto verificable ${concept}`);
    }
  }
}

if (fs.existsSync(confusionScriptPath)) {
  try {
    delete globalThis.ConfusionDiffusionCore;
    await import(`${pathToFileURL(confusionScriptPath).href}?validation=${Date.now()}`);
    const core = globalThis.ConfusionDiffusionCore;
    if (!core) throw new Error('no exportó el núcleo verificable');

    const input = core.blockFromText('CRIPTOGRAFIA').block;
    const key = core.keyFromText('SHANNON');
    const flipped = core.flipBit(input, 0);
    const xorOriginal = core.finalState(input, key, 4, 'key');
    const xorModified = core.finalState(flipped, key, 4, 'key');
    const xorDistance = core.differenceBits(xorOriginal, xorModified).reduce((sum, bit) => sum + bit, 0);
    if (xorDistance !== 1 || core.changedByteCount(xorOriginal, xorModified) !== 1) {
      throw new Error('XOR solo no conservó una diferencia de un bit');
    }

    const fullOriginal = core.finalState(input, key, 4, 'full');
    const fullModified = core.finalState(flipped, key, 4, 'full');
    const fullDistance = core.differenceBits(fullOriginal, fullModified).reduce((sum, bit) => sum + bit, 0);
    if (fullDistance < 40 || fullDistance > 88 || core.changedByteCount(fullOriginal, fullModified) !== 16) {
      throw new Error(`la red completa no propagó la perturbación esperada (${fullDistance}/128)`);
    }

    const experiment = { originalInput: input, originalKey: key, target: 'message' };
    const linear = core.analyzeConfiguration(experiment, 4, 'key');
    if (Math.abs(linear.globalMean - 1 / 128) > Number.EPSILON || Math.abs(linear.coverage - 1 / 128) > Number.EPSILON) {
      throw new Error('el diagnóstico lineal no identificó la influencia diagonal');
    }
    const complete = core.analyzeConfiguration(experiment, 4, 'full');
    if (complete.globalMean < 0.45 || complete.globalMean > 0.55) {
      throw new Error(`la avalancha media de la red completa quedó fuera del rango de control (${complete.globalMean})`);
    }
    if (complete.coverage < 0.99 || complete.sacDeviation > 0.12 || complete.bicProxy > 0.08) {
      throw new Error('el análisis estadístico no distinguió adecuadamente la red completa');
    }
    const keySensitivity = core.analyzeConfiguration({ originalInput: input, originalKey: key, target: 'key' }, 4, 'full');
    if (keySensitivity.globalMean < 0.45 || keySensitivity.globalMean > 0.55 || keySensitivity.coverage < 0.99) {
      throw new Error('el análisis de sensibilidad a la clave no propagó los 128 bits');
    }

    const first = Uint8Array.from([0, 0, 1, 1]);
    const independent = Uint8Array.from([0, 1, 0, 1]);
    if (Math.abs(core.phiCoefficient(first, independent)) > Number.EPSILON) {
      throw new Error('el coeficiente phi no reconoció el patrón independiente de control');
    }
    delete globalThis.ConfusionDiffusionCore;
  } catch (error) {
    fail(`simuladores/modulo-02/assets/confusion-difusion.js: prueba lógica fallida: ${error.message}`);
  }
}

const indexPath = path.join(moduleDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const routeCards = [...indexHtml.matchAll(/\bdata-route-page=["']([^"']+)["']/g)]
    .map((match) => match[1]);
  if (routeCards.length !== expectedCurriculum.length) {
    fail(`simuladores/modulo-02/index.html: se esperaban 13 estaciones y hay ${routeCards.length}`);
  }
  if (routeCards.join('|') !== expectedCurriculum.join('|')) {
    fail('simuladores/modulo-02/index.html: las estaciones no coinciden con el currículo esperado');
  }
  if (!indexHtml.includes('Cuarenta y dos preguntas') || /Treinta y seis preguntas/i.test(indexHtml)) {
    fail('simuladores/modulo-02/index.html: el conteo visible del cuestionario no coincide con el banco de 42 preguntas');
  }
}

const moduleJsPath = path.join(moduleDir, 'assets', 'module.js');
if (fs.existsSync(moduleJsPath)) {
  const moduleJs = fs.readFileSync(moduleJsPath, 'utf8');
  for (const id of expectedCurriculum) {
    if (!moduleJs.includes(`'${id}'`)) {
      fail(`simuladores/modulo-02/assets/module.js: falta la estación ${id}`);
    }
  }
  for (const contract of ['window.self !== window.top', "classList.add('module-embedded')", 'observeResponsiveCanvas']) {
    if (!moduleJs.includes(contract)) {
      fail(`simuladores/modulo-02/assets/module.js: falta la estabilización embebida ${contract}`);
    }
  }
}

const moduleCssPath = path.join(moduleDir, 'assets', 'module.css');
if (fs.existsSync(moduleCssPath)) {
  const moduleCss = fs.readFileSync(moduleCssPath, 'utf8');
  for (const selector of [
    'html.module-embedded',
    'body.module-02.module-embedded::before',
    'body.module-02.module-embedded .module-topbar'
  ]) {
    if (!moduleCss.includes(selector)) {
      fail(`simuladores/modulo-02/assets/module.css: falta la regla estable ${selector}`);
    }
  }
}

for (const chartScript of ['entropia.js', 'complejidad.js']) {
  const absolute = path.join(moduleDir, 'assets', chartScript);
  if (!fs.existsSync(absolute)) continue;
  const content = fs.readFileSync(absolute, 'utf8');
  if (!content.includes('Module02.observeResponsiveCanvas(canvas, drawChart)')) {
    fail(`simuladores/modulo-02/assets/${chartScript}: el gráfico no usa el observador estable`);
  }
  if (/new ResizeObserver\(drawChart\)\.observe\(canvas\)/.test(content)) {
    fail(`simuladores/modulo-02/assets/${chartScript}: no observar el canvas que el propio dibujo redimensiona`);
  }
}

const routeJsPath = path.join(moduleDir, 'assets', 'ruta-guiada.js');
if (fs.existsSync(routeJsPath)) {
  const routeJs = fs.readFileSync(routeJsPath, 'utf8');
  const routeBlock = routeJs.match(/const route = Object\.freeze\(\[([\s\S]+?)\]\);/)?.[1] || '';
  const routeIds = [...routeBlock.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]);
  if (routeIds.join('|') !== expectedCurriculum.join('|')) {
    fail('simuladores/modulo-02/assets/ruta-guiada.js: la ruta no contiene las 13 estaciones esperadas en orden');
  }
  for (const contract of ['EMBED_REVISION', "searchParams.set('embed'", 'embeddedUrl.href']) {
    if (!routeJs.includes(contract)) {
      fail(`simuladores/modulo-02/assets/ruta-guiada.js: falta la renovación del recurso embebido ${contract}`);
    }
  }
}

function loadData(relative, globalName) {
  const absolute = path.join(moduleDir, relative);
  if (!fs.existsSync(absolute)) return [];
  const context = { window: {} };
  vm.createContext(context);
  try {
    vm.runInContext(fs.readFileSync(absolute, 'utf8'), context);
    return context.window[globalName] || [];
  } catch (error) {
    fail(`simuladores/modulo-02/${relative}: no se pudieron cargar los datos: ${error.message}`);
    return [];
  }
}

const glossary = loadData('assets/glosario-data.js', 'Module02Glossary');
if (glossary.length !== 78) fail(`Glosario: se esperaban 78 términos y hay ${glossary.length}`);
if (new Set(glossary.map((item) => item.id)).size !== glossary.length) fail('Glosario: hay IDs duplicados');
glossary.forEach((item, index) => {
  for (const field of ['id', 'term', 'category', 'definition', 'example', 'related']) {
    if (!item[field]) fail(`Glosario, entrada ${index + 1}: falta ${field}`);
  }
});

const questions = loadData('assets/cuestionario-data.js', 'Module02Questions');
if (questions.length !== 42) fail(`Cuestionario: se esperaban 42 preguntas y hay ${questions.length}`);
if (new Set(questions.map((item) => item.id)).size !== questions.length) fail('Cuestionario: hay IDs duplicados');
questions.forEach((item, index) => {
  if (!Array.isArray(item.options) || item.options.length !== 4) {
    fail(`Cuestionario, pregunta ${index + 1}: debe tener cuatro opciones`);
  }
  if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= (item.options?.length || 0)) {
    fail(`Cuestionario, pregunta ${index + 1}: índice de respuesta inválido`);
  }
  for (const field of ['category', 'level', 'prompt', 'explanation']) {
    if (!item[field]) fail(`Cuestionario, pregunta ${index + 1}: falta ${field}`);
  }
});

for (const absolute of [
  ...collectFiles(moduleDir, '.html'),
  ...collectFiles(path.join(moduleDir, 'assets'), '.js'),
  ...collectFiles(path.join(moduleDir, 'assets'), '.css')
]) {
  const content = fs.readFileSync(absolute, 'utf8');
  if (/versi[oó]n\s+2\.0/i.test(content)) {
    fail(`${relativeLabel(absolute)}: no debe exhibir una etiqueta de versión`);
  }
}

try {
  JSON.parse(fs.readFileSync(path.join(root, 'simuladores', 'catalogo.json'), 'utf8'));
} catch (error) {
  fail(`simuladores/catalogo.json: JSON inválido: ${error.message}`);
}

if (errors.length) {
  console.error('\nValidación del Módulo 2 fallida:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Módulo 2 validado: ${htmlFiles.length} páginas, 13 estaciones, 78 términos y 42 preguntas.`);
