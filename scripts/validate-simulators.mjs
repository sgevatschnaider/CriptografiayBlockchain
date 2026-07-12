import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const simulatorDir = path.join(root, 'simuladores');
const requiredFiles = [
  'index.html',
  '01-criptografia-clasica.html',
  '02-fundamentos-matematicos.html',
  '03-criptografia-moderna.html',
  '04-esteganografia.html',
  '05-blockchain.html',
  '06-protocolos-privacidad.html',
  '07-poscuantica-cuantica.html',
  '08-seguridad-aplicada.html',
  'assets/lab.css',
  'assets/lab.js'
];

const errors = [];

function fail(message) {
  errors.push(message);
}

for (const relative of requiredFiles) {
  const absolute = path.join(simulatorDir, relative);
  if (!fs.existsSync(absolute)) fail(`Falta el archivo: simuladores/${relative}`);
}

if (!fs.existsSync(path.join(root, 'index.html'))) {
  fail('Falta index.html en la raíz para abrir el sitio directamente desde GitHub Pages.');
}

if (!fs.existsSync(path.join(root, '.nojekyll'))) {
  fail('Falta .nojekyll para servir el repositorio como sitio estático sin transformaciones.');
}

const htmlFiles = requiredFiles.filter((file) => file.endsWith('.html'));

for (const relative of htmlFiles) {
  const absolute = path.join(simulatorDir, relative);
  if (!fs.existsSync(absolute)) continue;

  const html = fs.readFileSync(absolute, 'utf8');
  const label = `simuladores/${relative}`;

  const requiredPatterns = [
    ['doctype HTML5', /<!doctype html>/i],
    ['atributo lang="es"', /<html[^>]+lang=["']es["']/i],
    ['meta charset UTF-8', /<meta[^>]+charset=["']?utf-8/i],
    ['meta viewport', /<meta[^>]+name=["']viewport["']/i],
    ['título descriptivo', /<title>[^<]{8,}<\/title>/i],
    ['elemento main', /<main\b/i]
  ];

  for (const [description, pattern] of requiredPatterns) {
    if (!pattern.test(html)) fail(`${label}: falta ${description}`);
  }

  if (relative !== 'index.html') {
    if (!/assets\/lab\.css/.test(html)) fail(`${label}: no carga assets/lab.css`);
    if (!/assets\/lab\.js/.test(html)) fail(`${label}: no carga assets/lab.js`);
    if (!/id=["']app["']/.test(html)) fail(`${label}: falta el contenedor #app`);
    if (!/class=["'][^"']*hero/.test(html)) fail(`${label}: falta una introducción pedagógica .hero`);
    if (!/class=["'][^"']*status/.test(html)) fail(`${label}: falta retroalimentación visible de estado`);
    if (!/Desaf[ií]o/i.test(html)) fail(`${label}: falta una actividad o desafío de transferencia`);
  }

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) {
    fail(`${label}: identificadores duplicados: ${[...new Set(duplicateIds)].join(', ')}`);
  }

  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .filter((script) => script.trim());

  inlineScripts.forEach((script, index) => {
    try {
      new Function(script);
    } catch (error) {
      fail(`${label}: error de sintaxis JavaScript en script ${index + 1}: ${error.message}`);
    }
  });

  if (/\$\$\s*\(/.test(html) && !/const\s*\{[^}]*\$\$[^}]*\}\s*=\s*Lab/.test(html)) {
    fail(`${label}: usa $$ sin importarlo desde Lab`);
  }

  const localReferences = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((reference) =>
      !reference.startsWith('http://') &&
      !reference.startsWith('https://') &&
      !reference.startsWith('#') &&
      !reference.startsWith('mailto:') &&
      !reference.startsWith('data:') &&
      !reference.startsWith('javascript:')
    );

  for (const reference of localReferences) {
    const cleanReference = decodeURIComponent(reference.split('#')[0].split('?')[0]);
    if (!cleanReference) continue;
    const target = path.resolve(path.dirname(absolute), cleanReference);
    if (!fs.existsSync(target)) fail(`${label}: enlace local inexistente: ${reference}`);
  }
}

const commonJsPath = path.join(simulatorDir, 'assets/lab.js');
if (fs.existsSync(commonJsPath)) {
  const commonJs = fs.readFileSync(commonJsPath, 'utf8');
  try {
    new Function(commonJs);
  } catch (error) {
    fail(`simuladores/assets/lab.js: error de sintaxis: ${error.message}`);
  }

  const sharedRequirements = [
    ['encapsulación estricta', /\(\(\)\s*=>\s*\{[\s\S]*['"]use strict['"]/],
    ['mejora de accesibilidad', /function\s+enhanceAccessibility/],
    ['manejo de errores de ejecución', /unhandledrejection/],
    ['regiones de estado accesibles', /aria-live/],
    ['exportación inmutable de Lab', /Object\.freeze/]
  ];

  for (const [description, pattern] of sharedRequirements) {
    if (!pattern.test(commonJs)) fail(`simuladores/assets/lab.js: falta ${description}`);
  }
}

if (errors.length) {
  console.error('\nValidación fallida:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validación correcta: ${htmlFiles.length} páginas HTML, recursos compartidos y publicación estática.`);
