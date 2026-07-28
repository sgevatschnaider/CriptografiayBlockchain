import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const moduleRoot = path.join(root, 'simuladores', 'fundamentos-matematicos');
const requiredFiles = [
  'index.html',
  'aritmetica-modular-visual.html',
  'representacion-digital-xor.html',
  'assets/representacion-digital.css',
  'assets/representacion-digital.js'
];
const errors = [];

function fail(message) {
  errors.push(message);
}

function read(relative) {
  const absolute = path.join(moduleRoot, relative);
  if (!fs.existsSync(absolute)) {
    fail(`Falta simuladores/fundamentos-matematicos/${relative}`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

for (const relative of requiredFiles) read(relative);

const page = read('representacion-digital-xor.html');
const index = read('index.html');
const styles = read('assets/representacion-digital.css');
const script = read('assets/representacion-digital.js');

const htmlRequirements = [
  ['doctype HTML5', /<!doctype html>/i],
  ['idioma español', /<html[^>]+\blang=["']es["']/i],
  ['codificación UTF-8', /<meta[^>]+\bcharset=["']?utf-8/i],
  ['viewport responsive', /<meta[^>]+\bname=["']viewport["']/i],
  ['descripción', /<meta[^>]+\bname=["']description["']/i],
  ['hoja compartida', /\.\.\/assets\/lab\.css/],
  ['hoja específica', /assets\/representacion-digital\.css/],
  ['utilidades compartidas', /\.\.\/assets\/lab\.js/],
  ['lógica específica', /assets\/representacion-digital\.js/],
  ['contenido principal', /<main\b[^>]*\bid=["']contenido["']/i],
  ['salto al contenido', /class=["'][^"']*skip-link/],
  ['estado accesible', /aria-live=["']polite["']/],
  ['desafío formativo', /id=["']desafios["']/],
  ['glosario', /id=["']glosario["']/]
];

for (const [description, pattern] of htmlRequirements) {
  if (!pattern.test(page)) fail(`representacion-digital-xor.html: falta ${description}`);
}

const requiredIds = [
  'messageInput',
  'unicodeOutput',
  'decimalOutput',
  'hexOutput',
  'binaryOutput',
  'base64Output',
  'characterRows',
  'byteBitStrip',
  'operationSelect',
  'truthTableBody',
  'xorMessage',
  'xorKey',
  'xorCipherHex',
  'xorRecoveredText',
  'xorRows',
  'decodeFormat',
  'decodeInput',
  'decodedText',
  'endianInput',
  'challengeProgress'
];

for (const id of requiredIds) {
  if (!page.includes(`id="${id}"`)) fail(`representacion-digital-xor.html: falta #${id}`);
}

const requiredConcepts = [
  /Unicode/i,
  /UTF-8/i,
  /binario/i,
  /decimal/i,
  /hexadecimal/i,
  /Base64/i,
  /\bAND\b/,
  /\bOR\b/,
  /\bXOR\b/,
  /\bNOT\b/,
  /endianness/i,
  /representar no es cifrar/i,
  /\(M ⊕ K\) ⊕ K = M/
];

for (const concept of requiredConcepts) {
  if (!concept.test(page)) fail(`representacion-digital-xor.html: falta el concepto ${concept}`);
}

if (/versi[oó]n\s*2(?:\.0)?/i.test(`${page}\n${index}\n${script}\n${styles}`)) {
  fail('El módulo no debe mostrar una etiqueta de versión.');
}

const ids = [...page.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
const duplicatedIds = [...new Set(ids.filter((id, position) => ids.indexOf(id) !== position))];
if (duplicatedIds.length) fail(`Identificadores duplicados: ${duplicatedIds.join(', ')}`);

const localReferences = [...page.matchAll(/(?:href|src)=["']([^"']+)["']/gi)]
  .map((match) => match[1])
  .filter((reference) =>
    !reference.startsWith('#') &&
    !reference.startsWith('http://') &&
    !reference.startsWith('https://') &&
    !reference.startsWith('mailto:') &&
    !reference.startsWith('data:')
  );

for (const reference of localReferences) {
  const cleanReference = decodeURIComponent(reference.split('#')[0].split('?')[0]);
  if (!cleanReference) continue;
  const target = path.resolve(moduleRoot, cleanReference);
  if (!fs.existsSync(target)) fail(`Enlace local inexistente en representacion-digital-xor.html: ${reference}`);
}

try {
  new Function(script);
} catch (error) {
  fail(`representacion-digital.js: error de sintaxis: ${error.message}`);
}

const scriptRequirements = [
  ['TextEncoder para UTF-8', /\bte\.encode\(/],
  ['segmentación de grafemas', /Intl\.Segmenter/],
  ['conversión binaria', /\.toString\(2\)/],
  ['conversión hexadecimal', /\.toString\(16\)/],
  ['Base64', /bytesToB64/],
  ['XOR byte a byte', /\^\s*b\[index\]/],
  ['recuperación mediante segundo XOR', /xorArrays\(cipherBytes,\s*expandedKey\)/],
  ['decodificación UTF-8 estricta', /TextDecoder\(['"]utf-8['"],\s*\{\s*fatal:\s*true\s*\}\)/],
  ['aleatoriedad del navegador', /crypto\.getRandomValues/],
  ['contenido seguro mediante textContent', /\.textContent\s*=/]
];

for (const [description, pattern] of scriptRequirements) {
  if (!pattern.test(script)) fail(`representacion-digital.js: falta ${description}`);
}

if (/\.innerHTML\s*=/.test(script)) {
  fail('representacion-digital.js no debe insertar contenido mediante innerHTML.');
}

const braceBalance = [...styles].reduce((balance, character) => {
  if (character === '{') return balance + 1;
  if (character === '}') return balance - 1;
  return balance;
}, 0);
if (braceBalance !== 0) fail(`representacion-digital.css: llaves desbalanceadas (${braceBalance})`);
if (!/@media\s*\(max-width:\s*620px\)/.test(styles)) fail('representacion-digital.css: falta adaptación para pantallas pequeñas');
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(styles)) fail('representacion-digital.css: falta respeto por movimiento reducido');

if (!/href=["']representacion-digital-xor\.html["']/.test(index)) {
  fail('El índice de fundamentos no enlaza el laboratorio de representación digital.');
}

const catalogPath = path.join(root, 'simuladores', 'catalogo.json');
try {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const area = catalog.areas_transversales?.find((item) => item.id === 'fundamentos-matematicos');
  const simulation = area?.simulaciones?.find(
    (item) => item.archivo === 'fundamentos-matematicos/representacion-digital-xor.html'
  );
  if (!simulation || simulation.estado !== 'disponible') {
    fail('catalogo.json no registra el laboratorio como disponible en fundamentos matemáticos.');
  }
} catch (error) {
  fail(`catalogo.json no es JSON válido: ${error.message}`);
}

const campus = fs.readFileSync(path.join(root, 'simuladores', 'index.html'), 'utf8');
if (!campus.includes('fundamentos-matematicos/representacion-digital-xor.html')) {
  fail('El campus principal no enlaza el laboratorio de representación digital.');
}

const theory = fs.readFileSync(path.join(root, 'docs', 'criptografia', '02-fundamentos-matematicos.md'), 'utf8');
if (!theory.includes('../../simuladores/fundamentos-matematicos/representacion-digital-xor.html')) {
  fail('La teoría de fundamentos no enlaza el nuevo laboratorio.');
}

if (errors.length) {
  console.error('\nValidación de fundamentos matemáticos fallida:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Validación correcta: representación digital, operaciones booleanas, XOR, navegación y catálogo.');
