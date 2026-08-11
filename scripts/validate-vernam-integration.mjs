import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const errors = [];
const fail = (message) => errors.push(message);
const read = (relative) => {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    fail(`Falta ${relative}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
};

const files = {
  m1Theory: 'simuladores/modulo-01/vernam-one-time-pad.html',
  m1Route: 'simuladores/modulo-01/ruta-guiada.html',
  m3Bridge: 'simuladores/modulo-03/vernam-a-criptografia-moderna.html',
  m3Index: 'simuladores/modulo-03/index.html',
  m3Route: 'simuladores/modulo-03/ruta-modulo.html',
  glossaryPage: 'simuladores/modulo-03/glosario-programa.html',
  baseTerms: 'simuladores/modulo-03/assets/programa-glosario-data.js',
  extraTerms: 'simuladores/modulo-03/assets/programa-glosario-vernam-data.js',
  css: 'simuladores/assets/vernam-theory.css',
  js: 'simuladores/assets/vernam-theory.js',
  catalog: 'simuladores/catalogo.json'
};

const content = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, read(file)]));

for (const [key, html] of [['m1Theory', content.m1Theory], ['m3Bridge', content.m3Bridge]]) {
  const label = files[key];
  const checks = [
    ['doctype HTML5', /<!doctype html>/i],
    ['idioma español', /<html[^>]+lang=["']es["']/i],
    ['viewport', /name=["']viewport["']/i],
    ['descripción', /name=["']description["']/i],
    ['salto al contenido', /class=["'][^"']*skip-link/i],
    ['selector multitema', /data-theme-select/i],
    ['estilo compartido', /vernam-theory\.css/i],
    ['script compartido', /vernam-theory\.js/i],
    ['atribución docente', /Material elaborado por el profesor Sergio Gevatschnaider/i]
  ];
  for (const [what, pattern] of checks) if (!pattern.test(html)) fail(`${label}: falta ${what}`);
  if (/versi[oó]n\s*2(?:\.0)?/i.test(html)) fail(`${label}: no debe mostrar una etiqueta de versión`);
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) fail(`${label}: IDs duplicados: ${duplicates.join(', ')}`);
  const refs = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)].map((match) => match[1]).filter((ref) => !/^(?:https?:|mailto:|data:|javascript:|#)/i.test(ref));
  for (const ref of refs) {
    const clean = decodeURIComponent(ref.split('#')[0].split('?')[0]);
    if (!clean) continue;
    const target = path.resolve(path.dirname(path.join(root, label)), clean);
    if (!fs.existsSync(target)) fail(`${label}: referencia local inexistente: ${ref}`);
  }
}

for (const concept of ['Vernam describe el mecanismo','Uniformidad','Impredecibilidad','Independencia','Entropía','Secreto perfecto','Two-Time Pad','P(M=m | C=c) = P(M=m)']) {
  if (!content.m1Theory.includes(concept)) fail(`${files.m1Theory}: falta ${concept}`);
}
for (const concept of ['Vernam aporta una estructura operacional','seguridad computacional','ChaCha20','AES-CTR','nonce','Two-Time Pad','Maleabilidad','AEAD','Forward secrecy','Vernam → One-Time Pad → flujo pseudoaleatorio → nonce → AEAD']) {
  if (!content.m3Bridge.toLocaleLowerCase('es').includes(concept.toLocaleLowerCase('es'))) fail(`${files.m3Bridge}: falta ${concept}`);
}

try { new Function(content.js); } catch (error) { fail(`${files.js}: error de sintaxis: ${error.message}`); }
if (/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/.test(content.js)) fail(`${files.js}: no debe transmitir datos`);
for (const token of ['THEMES','data-map-node','IntersectionObserver','data-reading-progress']) if (!content.js.includes(token)) fail(`${files.js}: falta ${token}`);

const context = { window: {} };
vm.createContext(context);
try {
  vm.runInContext(content.baseTerms, context, { filename: files.baseTerms });
  vm.runInContext(content.extraTerms, context, { filename: files.extraTerms });
} catch (error) {
  fail(`Glosario: no se pudieron evaluar los datos: ${error.message}`);
}
const terms = Array.isArray(context.window.ModernTerms) ? context.window.ModernTerms : [];
const names = terms.map((term) => String(term[0]).toLocaleLowerCase('es'));
const duplicatedTerms = [...new Set(names.filter((name, index) => names.indexOf(name) !== index))];
if (terms.length !== 124) fail(`Glosario: se esperaban 124 términos y se detectaron ${terms.length}`);
if (duplicatedTerms.length) fail(`Glosario: términos duplicados: ${duplicatedTerms.join(', ')}`);
for (const required of ['Vernam','One-Time Pad','Two-Time Pad','Uniformidad','Impredecibilidad','Independencia','Maleabilidad','Forward secrecy','PRF']) {
  if (!names.includes(required.toLocaleLowerCase('es'))) fail(`Glosario: falta ${required}`);
}
if (!/programa-glosario-data\.js[\s\S]*programa-glosario-vernam-data\.js[\s\S]*programa-moderno\.js/.test(content.glossaryPage)) fail(`${files.glossaryPage}: orden de scripts incorrecto`);
for (const snippet of ['124 conceptos','vernam-a-criptografia-moderna.html']) if (!content.glossaryPage.includes(snippet)) fail(`${files.glossaryPage}: falta ${snippet}`);
for (const [label, html] of [[files.m3Index, content.m3Index], [files.m3Route, content.m3Route]]) {
  for (const snippet of ['vernam-a-criptografia-moderna.html','124']) if (!html.includes(snippet)) fail(`${label}: falta ${snippet}`);
}
if (!content.m1Route.includes('vernam-one-time-pad.html')) fail(`${files.m1Route}: no enlaza el centro teórico`);

try {
  const catalog = JSON.parse(content.catalog);
  if (catalog.version < 12) fail(`${files.catalog}: la versión debe ser 12 o superior`);
  const module1 = catalog.modulos?.find((item) => item.id === 'modulo-01');
  const module3 = catalog.modulos?.find((item) => item.id === 'modulo-03');
  if (!module1?.simulaciones?.some((item) => item.archivo === 'modulo-01/vernam-one-time-pad.html')) fail(`${files.catalog}: no registra la teoría de Vernam y OTP`);
  if (!module3?.simulaciones?.some((item) => item.archivo === 'modulo-03/vernam-a-criptografia-moderna.html')) fail(`${files.catalog}: no registra el puente moderno`);
} catch (error) {
  fail(`${files.catalog}: JSON inválido: ${error.message}`);
}

if (errors.length) {
  console.error('\nValidación de integración Vernam–OTP fallida:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('Validación correcta: teoría Vernam/OTP, puente moderno, 124 términos, enlaces, temas y catálogo.');
