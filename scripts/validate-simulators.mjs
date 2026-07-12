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

for (const relative of requiredFiles) {
  const absolute = path.join(simulatorDir, relative);
  if (!fs.existsSync(absolute)) errors.push(`Falta el archivo: simuladores/${relative}`);
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
    ['título', /<title>[^<]+<\/title>/i]
  ];

  for (const [description, pattern] of requiredPatterns) {
    if (!pattern.test(html)) errors.push(`${label}: falta ${description}`);
  }

  if (relative !== 'index.html') {
    if (!/assets\/lab\.css/.test(html)) errors.push(`${label}: no carga assets/lab.css`);
    if (!/assets\/lab\.js/.test(html)) errors.push(`${label}: no carga assets/lab.js`);
    if (!/<noscript>/i.test(html)) errors.push(`${label}: falta mensaje <noscript>`);
    if (!/aria-live=["']polite["']/i.test(html)) errors.push(`${label}: falta una región aria-live para resultados`);
  }

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) {
    errors.push(`${label}: identificadores duplicados: ${[...new Set(duplicateIds)].join(', ')}`);
  }

  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .filter((script) => script.trim());

  inlineScripts.forEach((script, index) => {
    try {
      new Function(script);
    } catch (error) {
      errors.push(`${label}: error de sintaxis JavaScript en script ${index + 1}: ${error.message}`);
    }
  });

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
    if (!fs.existsSync(target)) errors.push(`${label}: enlace local inexistente: ${reference}`);
  }
}

const commonJsPath = path.join(simulatorDir, 'assets/lab.js');
if (fs.existsSync(commonJsPath)) {
  const commonJs = fs.readFileSync(commonJsPath, 'utf8');
  try {
    new Function(commonJs);
  } catch (error) {
    errors.push(`simuladores/assets/lab.js: error de sintaxis: ${error.message}`);
  }
}

for (const relative of ['06-protocolos-privacidad.html', '07-poscuantica-cuantica.html']) {
  const absolute = path.join(simulatorDir, relative);
  if (!fs.existsSync(absolute)) continue;
  const html = fs.readFileSync(absolute, 'utf8');
  if (/\$\$\s*\(/.test(html) && !/const\s*\{[^}]*\$\$[^}]*\}\s*=\s*Lab/.test(html)) {
    errors.push(`simuladores/${relative}: usa $$ sin importarlo desde Lab`);
  }
}

if (errors.length) {
  console.error('\nValidación fallida:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validación correcta: ${htmlFiles.length} páginas HTML y recursos compartidos.`);
