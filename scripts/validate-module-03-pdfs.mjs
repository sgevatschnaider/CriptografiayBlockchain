import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pdfDir = path.join(root, 'docs', 'criptografia', 'pdf', 'modulo-03');
const comprehensive = path.join(root, 'docs', 'criptografia', 'pdf', 'modulo-03-criptografia-moderna.pdf');
const errors = [];
const topics = [
  ['01-fundamentos.pdf', 'Fundamentos'],
  ['02-clasificacion-criptosistemas.pdf', 'Clasificación de criptosistemas modernos'],
  ['03-criptografia-simetrica.pdf', 'Criptografía simétrica'],
  ['04-bits-de-seguridad.pdf', 'Bits de seguridad'],
  ['05-cifrado-bloque-y-flujo.pdf', 'Cifrado por bloque y por flujo'],
  ['06-modos-de-operacion.pdf', 'Modos de operación'],
  ['07-padding.pdf', 'Padding'],
  ['08-algoritmos-simetricos.pdf', 'Algoritmos de cifrado simétrico'],
  ['09-criptografia-asimetrica.pdf', 'Criptografía asimétrica'],
  ['10-rsa-y-curvas-elipticas.pdf', 'RSA y curvas elípticas'],
  ['11-claves-de-sesion.pdf', 'Claves de sesión'],
  ['12-laboratorio-contrasenas.pdf', 'Laboratorio: vulnerar contraseñas'],
  ['13-chacha20.pdf', 'ChaCha20']
];

function fail(message) {
  errors.push(message);
}

function readText(relative) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) {
    fail(`Falta ${relative}`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

function inspectPdf(absolute, label, minimumPages) {
  if (!fs.existsSync(absolute)) {
    fail(`Falta ${label}`);
    return;
  }
  const buffer = fs.readFileSync(absolute);
  const raw = buffer.toString('latin1');
  if (!raw.startsWith('%PDF-')) fail(`${label}: cabecera PDF inválida`);
  if (!raw.trimEnd().endsWith('%%EOF')) fail(`${label}: marcador EOF ausente`);
  if (buffer.length < 50_000) fail(`${label}: tamaño anormalmente pequeño (${buffer.length} bytes)`);
  const pages = (raw.match(/\/Type\s*\/Page\b/g) || []).length;
  if (pages < minimumPages) fail(`${label}: se esperaban al menos ${minimumPages} páginas y hay ${pages}`);
}

const catalog = readText('docs/criptografia/pdf/modulo-03/README.md');
const moduleIndex = readText('simuladores/modulo-03/index.html');
const theory = readText('simuladores/modulo-03/teoria-programa.html');
const generator = readText('scripts/build-module-03-topic-pdfs.py');
const publicCatalogText = readText('simuladores/catalogo.json');

for (const [filename, title] of topics) {
  inspectPdf(path.join(pdfDir, filename), `docs/criptografia/pdf/modulo-03/${filename}`, 4);
  for (const [label, source] of [
    ['catálogo Markdown', catalog],
    ['índice del módulo', moduleIndex],
    ['teoría del programa', theory],
    ['catálogo público', publicCatalogText]
  ]) {
    if (!source.includes(filename)) fail(`${label}: falta ${filename}`);
  }
  if (!catalog.includes(title)) fail(`catálogo Markdown: falta el tema ${title}`);
  if (!generator.includes(`"slug": "${filename.slice(0, -4)}"`)) fail(`generador: falta ${filename}`);
}

inspectPdf(comprehensive, 'docs/criptografia/pdf/modulo-03-criptografia-moderna.pdf', 15);
if (!moduleIndex.includes('modulo-03-criptografia-moderna.pdf')) fail('índice del módulo: falta el manual integral');
if (!theory.includes('modulo-03-criptografia-moderna.pdf')) fail('teoría del programa: falta el manual integral');

let parsedCatalog;
try {
  parsedCatalog = JSON.parse(publicCatalogText);
} catch (error) {
  fail(`simuladores/catalogo.json: JSON inválido (${error.message})`);
}
if (parsedCatalog) {
  if (parsedCatalog.version < 15) fail('catálogo público: la versión debe reflejar la biblioteca PDF');
  const module03 = parsedCatalog.modulos?.find((module) => module.id === 'modulo-03');
  if (!module03) {
    fail('catálogo público: falta modulo-03');
  } else if (!Array.isArray(module03.documentos_pdf) || module03.documentos_pdf.length !== 14) {
    fail('catálogo público: se esperaban el manual integral y 13 dossiers PDF');
  }
}

const forbidden = `${catalog}\n${moduleIndex}\n${theory}`;
if (/versión\s+superior/i.test(forbidden)) fail('La biblioteca no debe mostrar la etiqueta "versión superior"');

if (errors.length) {
  console.error('\nValidación de la biblioteca PDF del Módulo 3 fallida:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Validación correcta: manual integral y 13 dossiers PDF completos, catalogados y enlazados.');
