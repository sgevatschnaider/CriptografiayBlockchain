import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const moduleDir = path.join(root, 'simuladores', 'modulo-03');
const errors = [];
const required = [
  'aes-teoria-completa.html',
  'aes-laboratorio-integral.html',
  'ruta-clase-aes.html',
  'assets/aes-completo.css',
  'assets/aes-core.js',
  'assets/aes-teoria-completa.js',
  'assets/aes-laboratorio-integral.js',
  'assets/ruta-clase-aes.js'
];
function fail(message) { errors.push(message); }
function read(relative) {
  const absolute = path.join(moduleDir, relative);
  if (!fs.existsSync(absolute)) { fail(`Falta simuladores/modulo-03/${relative}`); return ''; }
  return fs.readFileSync(absolute, 'utf8');
}
for (const file of required) read(file);

for (const page of ['aes-teoria-completa.html', 'aes-laboratorio-integral.html', 'ruta-clase-aes.html']) {
  const html = read(page);
  const label = `simuladores/modulo-03/${page}`;
  for (const [description, pattern] of [
    ['doctype HTML5', /<!doctype html>/i],
    ['idioma español', /<html[^>]+lang=["']es["']/i],
    ['viewport', /name=["']viewport["']/i],
    ['descripción', /name=["']description["']/i],
    ['salto al contenido', /skip-link/i],
    ['estilos compartidos', /\.\.\/assets\/lab\.css/i],
    ['atribución docente', /Material elaborado por el profesor Sergio Gevatschnaider\./i]
  ]) if (!pattern.test(html)) fail(`${label}: falta ${description}`);
  if (/versi[oó]n\s*(?:2|superior)/i.test(html)) fail(`${label}: muestra una etiqueta de versión no permitida`);
  if (/\son(?:click|input|change|submit)=/i.test(html)) fail(`${label}: contiene manejadores inline`);
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicate = ids.find((id, index) => ids.indexOf(id) !== index);
  if (duplicate) fail(`${label}: ID duplicado ${duplicate}`);
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|data:|javascript:|#)/i.test(reference)) continue;
    const clean = decodeURIComponent(reference.split('#')[0].split('?')[0]);
    if (!clean) continue;
    const target = path.resolve(path.dirname(path.join(moduleDir, page)), clean);
    if (!fs.existsSync(target)) fail(`${label}: referencia local inexistente ${reference}`);
  }
}

const theory = read('aes-teoria-completa.html');
for (const token of ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey', 'GF(2⁸)', 'expansión de clave', 'InvMixColumns', 'AES-GCM', 'FIPS 197', 'NIST SP 800-38D']) {
  if (!theory.includes(token)) fail(`aes-teoria-completa.html: falta ${token}`);
}
for (const link of ['../modulo-01/index.html', '../modulo-02/confusion-difusion.html', 'vernam-a-criptografia-moderna.html', 'aes-laboratorio-integral.html', 'modos-aes-aead.html', 'cifrado-local-archivos.html']) {
  if (!theory.includes(link)) fail(`aes-teoria-completa.html: falta el enlace ${link}`);
}

const lab = read('aes-laboratorio-integral.html');
for (const token of ['id="round-plaintext"', 'id="round-key"', 'id="run-vector"', 'id="run-avalanche"', 'id="gcm-generate"', 'id="tamper-cipher"', 'id="tamper-aad"']) {
  if (!lab.includes(token)) fail(`aes-laboratorio-integral.html: falta ${token}`);
}
const labScript = read('assets/aes-laboratorio-integral.js');
for (const token of ["name: 'AES-GCM'", 'crypto.subtle.encrypt', 'crypto.subtle.decrypt', 'tagLength: 128', 'crypto.getRandomValues']) {
  if (!labScript.includes(token)) fail(`aes-laboratorio-integral.js: falta ${token}`);
}
for (const script of ['assets/aes-core.js', 'assets/aes-teoria-completa.js', 'assets/aes-laboratorio-integral.js', 'assets/ruta-clase-aes.js']) {
  const source = read(script);
  try { new Function(source); } catch (error) { fail(`${script}: sintaxis inválida: ${error.message}`); }
  if (/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/.test(source)) fail(`${script}: contiene transmisión de red`);
}

try {
  const context = vm.createContext({ Uint8Array, Array, Object, Number, String, Error, RangeError, Math, globalThis: {} });
  context.globalThis = context;
  vm.runInContext(read('assets/aes-core.js'), context);
  const aes = context.AESCore;
  if (!aes) throw new Error('AESCore no fue exportado');
  const plaintext = aes.parseHex('00112233445566778899aabbccddeeff');
  const key = aes.parseHex('000102030405060708090a0b0c0d0e0f');
  const result = aes.encryptBlock128(plaintext, key, true);
  const cipher = aes.toHex(result.ciphertext);
  if (cipher !== '69c4e0d86a7b0430d8cdb78070b4c55a') throw new Error(`vector FIPS incorrecto: ${cipher}`);
  const recovered = aes.toHex(aes.decryptBlock128(result.ciphertext, key));
  if (recovered !== aes.toHex(plaintext)) throw new Error('el descifrado no recupera el bloque');
  if (result.roundKeys.length !== 11) throw new Error(`se esperaban 11 subclaves y hay ${result.roundKeys.length}`);
  if (result.trace.length !== 41) throw new Error(`se esperaban 41 estados y hay ${result.trace.length}`);
} catch (error) { fail(`aes-core.js: ${error.message}`); }

const route = read('ruta-clase-aes.html');
const stations = [...route.matchAll(/data-class-station=["'](\d+)["']/g)].map((match) => match[1]);
if (stations.join('|') !== '0|1|2|3|4|5') fail('ruta-clase-aes.html: deben existir seis estaciones ordenadas');
for (const question of ['q1','q2','q3','q4','q5']) if (!route.includes(`name="${question}"`)) fail(`ruta-clase-aes.html: falta ${question}`);
for (const time of ['10 min','15 min','20 min','22 min','8 min']) if (!route.includes(time)) fail(`ruta-clase-aes.html: falta tiempo ${time}`);

const index = read('index.html');
const preservedResources = [
  'vernam-a-criptografia-moderna.html','clasificacion-criptosistemas.html','teoria-programa.html','algoritmos-simetricos.html','chacha20.html','bloques-vs-flujo.html','modos-aes-aead.html','padding-oracle.html','contrasena-salt-kdf.html','ataque-contrasenas.html','cifrado-local-archivos.html','ruta-guiada.html','hash-hmac-firmas.html','cifrado-hibrido-sesion.html','rsa-ecdh-hibrido.html','mapas-programa.html','glosario-programa.html','glosario.html','cuestionario-programa.html','cuestionario.html','ruta-modulo.html'
];
for (const resource of preservedResources) if (!index.includes(resource)) fail(`index.html: el recurso existente ${resource} dejó de estar integrado`);
for (const resource of ['aes-teoria-completa.html','aes-laboratorio-integral.html','ruta-clase-aes.html']) if (!index.includes(resource)) fail(`index.html: falta el recurso nuevo ${resource}`);

const moduleRoute = read('ruta-modulo.html');
const moduleStations = [...moduleRoute.matchAll(/data-module-station=["']([^"']+)["']/g)].map((match) => match[1]);
const expected = ['fundamentos','bloques-flujo','kdf','aes-aead','archivos','hash-mac-firma','oraculo-padding','clave-publica','glosario','cuestionario'];
if (moduleStations.join('|') !== expected.join('|')) fail('ruta-modulo.html: se alteraron las diez claves de progreso');
for (const resource of ['aes-teoria-completa.html','aes-laboratorio-integral.html','chacha20.html','ruta-clase-aes.html','../modulo-02/confusion-difusion.html']) if (!moduleRoute.includes(resource)) fail(`ruta-modulo.html: falta ${resource}`);

try {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'simuladores', 'catalogo.json'), 'utf8'));
  if (catalog.version < 14) fail('catalogo.json: la versión debe ser al menos 14');
  const module = catalog.modulos.find((item) => item.id === 'modulo-03');
  if (!module) fail('catalogo.json: falta modulo-03');
  else {
    const files = new Set(module.simulaciones.map((item) => item.archivo));
    for (const file of ['modulo-03/aes-teoria-completa.html','modulo-03/aes-laboratorio-integral.html','modulo-03/chacha20.html','modulo-03/ruta-clase-aes.html']) if (!files.has(file)) fail(`catalogo.json: falta ${file}`);
    if (module.simulaciones.length !== 28) fail(`catalogo.json: se esperaban 28 recursos del Módulo 3 y hay ${module.simulaciones.length}`);
  }
} catch (error) { fail(`catalogo.json: ${error.message}`); }

const css = read('assets/aes-completo.css');
const balance = [...css].reduce((value, character) => value + (character === '{' ? 1 : character === '}' ? -1 : 0), 0);
if (balance !== 0) fail(`aes-completo.css: llaves desbalanceadas (${balance})`);

if (errors.length) {
  console.error(`Validación AES: ${errors.length} error(es)`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('Validación AES correcta: teoría, laboratorio, ruta, vector FIPS, integración y catálogo.');
