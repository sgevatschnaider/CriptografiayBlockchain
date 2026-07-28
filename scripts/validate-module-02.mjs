import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const moduleDir = path.join(root, 'simuladores', 'modulo-02');
const errors = [];
const expectedCurriculum = [
  'teoria',
  'entropia',
  'secreto-perfecto',
  'pseudoaleatoriedad',
  'confusion-difusion',
  'juego-seguridad',
  'complejidad',
  'algebra',
  'mapas',
  'glosario',
  'cuestionario'
];
const requiredPages = [
  'index.html',
  'ruta-guiada.html',
  'teoria.html',
  'entropia-shannon.html',
  'secreto-perfecto.html',
  'flujo-pseudoaleatorio.html',
  'confusion-difusion.html',
  'juego-seguridad.html',
  'espacio-claves-complejidad.html',
  'estructuras-algebraicas.html',
  'mapas-mentales.html',
  'glosario.html',
  'cuestionario.html'
];
const requiredAssets = [
  'assets/module.css',
  'assets/module.js',
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

const indexPath = path.join(moduleDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const routeCards = [...indexHtml.matchAll(/\bdata-route-page=["']([^"']+)["']/g)]
    .map((match) => match[1]);
  if (routeCards.length !== expectedCurriculum.length) {
    fail(`simuladores/modulo-02/index.html: se esperaban 11 estaciones y hay ${routeCards.length}`);
  }
  if (routeCards.join('|') !== expectedCurriculum.join('|')) {
    fail('simuladores/modulo-02/index.html: las estaciones no coinciden con el currículo esperado');
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
}

const routeJsPath = path.join(moduleDir, 'assets', 'ruta-guiada.js');
if (fs.existsSync(routeJsPath)) {
  const routeJs = fs.readFileSync(routeJsPath, 'utf8');
  const routeBlock = routeJs.match(/const route = Object\.freeze\(\[([\s\S]+?)\]\);/)?.[1] || '';
  const routeIds = [...routeBlock.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]);
  if (routeIds.join('|') !== expectedCurriculum.join('|')) {
    fail('simuladores/modulo-02/assets/ruta-guiada.js: la ruta no contiene las 11 estaciones esperadas en orden');
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
if (glossary.length !== 72) fail(`Glosario: se esperaban 72 términos y hay ${glossary.length}`);
if (new Set(glossary.map((item) => item.id)).size !== glossary.length) fail('Glosario: hay IDs duplicados');
glossary.forEach((item, index) => {
  for (const field of ['id', 'term', 'category', 'definition', 'example', 'related']) {
    if (!item[field]) fail(`Glosario, entrada ${index + 1}: falta ${field}`);
  }
});

const questions = loadData('assets/cuestionario-data.js', 'Module02Questions');
if (questions.length !== 36) fail(`Cuestionario: se esperaban 36 preguntas y hay ${questions.length}`);
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

console.log(`Módulo 2 validado: ${htmlFiles.length} páginas, 11 estaciones, 72 términos y 36 preguntas.`);
