import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const moduleDir = path.join(root, 'simuladores', 'modulo-03');
const errors = [];
const requiredPages = [
  'index.html',
  'ruta-guiada.html',
  'contrasena-salt-kdf.html',
  'modos-aes-aead.html',
  'cifrado-local-archivos.html'
];
const requiredAssets = [
  'assets/clase-03.css',
  'assets/crypto-lab.js',
  'assets/ruta-guiada.js',
  'assets/contrasena-salt-kdf.js',
  'assets/modos-aes-aead.js',
  'assets/cifrado-local-archivos.js'
];

function fail(message) {
  errors.push(message);
}

function read(relative) {
  const absolute = path.join(moduleDir, relative);
  if (!fs.existsSync(absolute)) {
    fail(`Falta simuladores/modulo-03/${relative}`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

function localReferences(html) {
  return [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((reference) => !/^(?:https?:|mailto:|data:|javascript:|#)/i.test(reference));
}

for (const relative of [...requiredPages, ...requiredAssets]) read(relative);

for (const relative of requiredPages) {
  const html = read(relative);
  if (!html) continue;
  const label = `simuladores/modulo-03/${relative}`;
  const requirements = [
    ['doctype HTML5', /<!doctype html>/i],
    ['idioma español', /<html[^>]+\blang=["']es["']/i],
    ['codificación UTF-8', /<meta[^>]+\bcharset=["']?utf-8/i],
    ['viewport responsive', /<meta[^>]+\bname=["']viewport["']/i],
    ['descripción', /<meta[^>]+\bname=["']description["'][^>]+\bcontent=["'][^"']{20,}/i],
    ['título descriptivo', /<title>[^<]{12,}<\/title>/i],
    ['contenido principal', /<main\b/i],
    ['salto al contenido', /class=["'][^"']*\bskip-link\b/i],
    ['hoja de estilos común', /\.\.\/assets\/lab\.css/i],
    ['atribución docente', /Material elaborado por el profesor Sergio Gevatschnaider\./i]
  ];
  for (const [description, pattern] of requirements) {
    if (!pattern.test(html)) fail(`${label}: falta ${description}`);
  }

  if (/versi[oó]n\s*2(?:\.0)?/i.test(html)) {
    fail(`${label}: no debe mostrar una etiqueta de versión`);
  }
  if (/\son(?:click|change|input|submit)=/i.test(html)) {
    fail(`${label}: contiene manejadores inline`);
  }

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) fail(`${label}: IDs duplicados: ${duplicates.join(', ')}`);

  const anchors = [...html.matchAll(/\bhref=["']#([^"']+)["']/gi)].map((match) => decodeURIComponent(match[1]));
  for (const anchor of anchors) {
    if (!ids.includes(anchor)) fail(`${label}: ancla sin destino: #${anchor}`);
  }

  for (const reference of localReferences(html)) {
    const clean = decodeURIComponent(reference.split('#')[0].split('?')[0]);
    if (!clean) continue;
    const target = path.resolve(path.dirname(path.join(moduleDir, relative)), clean);
    if (!fs.existsSync(target)) fail(`${label}: referencia local inexistente: ${reference}`);
  }
}

for (const relative of requiredAssets.filter((file) => file.endsWith('.js'))) {
  const script = read(relative);
  try {
    new Function(script);
  } catch (error) {
    fail(`simuladores/modulo-03/${relative}: error de sintaxis: ${error.message}`);
  }
  if (/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/.test(script)) {
    fail(`simuladores/modulo-03/${relative}: no debe transmitir contraseñas o archivos`);
  }
}

const kdfPage = read('contrasena-salt-kdf.html');
const kdfScript = read('assets/contrasena-salt-kdf.js');
for (const token of ['id="password"', 'id="salt"', 'id="iterations"', 'id="experiment-log"', 'id="cost-million"']) {
  if (!kdfPage.includes(token)) fail(`contrasena-salt-kdf.html: falta ${token}`);
}
for (const concept of ['normalizePassword', 'derivePbkdf2Bits', 'describeText', 'Salt diferente', '1_000_000']) {
  if (!kdfScript.includes(concept)) fail(`contrasena-salt-kdf.js: falta ${concept}`);
}

const modesPage = read('modos-aes-aead.html');
const modesScript = read('assets/modos-aes-aead.js');
for (const token of ['AES-CBC', 'AES-CTR', 'AES-GCM', 'Modelo conceptual', 'id="tamper-data"', 'id="tamper-context"']) {
  if (!modesPage.includes(token)) fail(`modos-aes-aead.html: falta ${token}`);
}
if (/function\s+toy\b|\btoy\s*\(/.test(`${modesPage}\n${modesScript}`)) {
  fail('modos-aes-aead: conserva una función de cifrado didáctico que puede confundirse con AES real');
}
for (const concept of ["name: 'AES-CBC'", "name: 'AES-CTR'", "name: 'AES-GCM'", 'splitGcmResult', 'crypto.subtle.encrypt', 'crypto.subtle.decrypt']) {
  if (!modesScript.includes(concept)) fail(`modos-aes-aead.js: falta ejecución verificable ${concept}`);
}

const filePage = read('cifrado-local-archivos.html');
const fileScript = read('assets/cifrado-local-archivos.js');
for (const token of ['id="source-file"', 'id="package-file"', 'id="package-json"', 'id="tamper-package"', 'bytes enviados']) {
  if (!filePage.includes(token)) fail(`cifrado-local-archivos.html: falta ${token}`);
}
for (const concept of ['CBB-AES-GCM-1', '5 * 1024 * 1024', 'deriveAesGcmKey', 'splitGcmResult', 'tagLength: 128', 'downloadBlob']) {
  if (!fileScript.includes(concept)) fail(`cifrado-local-archivos.js: falta ${concept}`);
}

const routePage = read('ruta-guiada.html');
const stations = [...routePage.matchAll(/data-station=["'](\d+)["']/g)].map((match) => match[1]);
if (stations.join('|') !== '0|1|2|3|4|5') fail('ruta-guiada.html: la ruta debe contener seis estaciones en orden');
for (const question of ['q1', 'q2', 'q3', 'q4', 'q5']) {
  if (!routePage.includes(`name="${question}"`)) fail(`ruta-guiada.html: falta la pregunta ${question}`);
}

const css = read('assets/clase-03.css');
const braceBalance = [...css].reduce((balance, character) => {
  if (character === '{') return balance + 1;
  if (character === '}') return balance - 1;
  return balance;
}, 0);
if (braceBalance !== 0) fail(`clase-03.css: llaves desbalanceadas (${braceBalance})`);
if (!/@media\s*\(max-width:\s*640px\)/.test(css)) fail('clase-03.css: falta adaptación móvil');
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css)) fail('clase-03.css: falta respeto por movimiento reducido');

try {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'simuladores', 'catalogo.json'), 'utf8'));
  const module = catalog.modulos?.find((item) => item.id === 'modulo-03');
  const expected = [
    'modulo-03/ruta-guiada.html',
    'modulo-03/contrasena-salt-kdf.html',
    'modulo-03/modos-aes-aead.html',
    'modulo-03/cifrado-local-archivos.html'
  ];
  for (const file of expected) {
    const entry = module?.simulaciones?.find((item) => item.archivo === file);
    if (!entry || entry.estado !== 'disponible') fail(`catalogo.json: no registra ${file} como disponible`);
  }
  if (module?.ruta_guiada !== 'modulo-03/ruta-guiada.html') fail('catalogo.json: falta la ruta guiada del Módulo 3');
} catch (error) {
  fail(`catalogo.json: JSON inválido: ${error.message}`);
}

const campus = fs.readFileSync(path.join(root, 'simuladores', 'index.html'), 'utf8');
if (!campus.includes('modulo-03/ruta-guiada.html')) fail('El campus no enlaza la Clase 3');
const guide = fs.readFileSync(path.join(root, 'docs', 'criptografia', 'guia-docente-simuladores.md'), 'utf8');
if (!guide.includes('clase-03-kdf-aes-gcm.md')) fail('La guía docente no enlaza la planificación de Clase 3');

async function validateCryptoRoundTrips() {
  try {
    globalThis.isSecureContext = true;
    await import(`${pathToFileURL(path.join(moduleDir, 'assets', 'crypto-lab.js')).href}?validation=1`);
    const cryptoLab = globalThis.Class3Crypto;
    if (!cryptoLab) throw new Error('crypto-lab.js no exportó Class3Crypto');

    const saltA = new Uint8Array(16);
    const saltB = new Uint8Array(16);
    saltB[0] = 1;
    const composed = await cryptoLab.derivePbkdf2Bits('mañana', saltA, 10_000);
    const decomposed = await cryptoLab.derivePbkdf2Bits('man\u0303ana', saltA, 10_000);
    const otherSalt = await cryptoLab.derivePbkdf2Bits('mañana', saltB, 10_000);
    if (cryptoLab.bytesToHex(composed) !== cryptoLab.bytesToHex(decomposed)) {
      throw new Error('NFC no igualó dos contraseñas canónicamente equivalentes');
    }
    if (cryptoLab.bytesToHex(composed) === cryptoLab.bytesToHex(otherSalt)) {
      throw new Error('dos salts distintas produjeron la misma salida de prueba');
    }

    const plaintext = cryptoLab.encoder.encode('Archivo ficticio de la Clase 3.');
    const aad = cryptoLab.encoder.encode('{"name":"demo.txt"}');
    const iv = new Uint8Array(12);
    iv[0] = 7;
    const key = await cryptoLab.deriveAesGcmKey('contraseña ficticia', saltA, 10_000);
    const encrypted = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 },
      key,
      plaintext
    ));
    const { ciphertext, tag } = cryptoLab.splitGcmResult(encrypted);
    const recovered = new Uint8Array(await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 },
      key,
      cryptoLab.concatBytes(ciphertext, tag)
    ));
    if (cryptoLab.decoder.decode(recovered) !== cryptoLab.decoder.decode(plaintext)) {
      throw new Error('AES-GCM no recuperó el texto de prueba');
    }
    ciphertext[0] ^= 1;
    let rejected = false;
    try {
      await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 },
        key,
        cryptoLab.concatBytes(ciphertext, tag)
      );
    } catch {
      rejected = true;
    }
    if (!rejected) throw new Error('AES-GCM aceptó un criptograma alterado');

    for (const algorithm of ['AES-CBC', 'AES-CTR']) {
      const rawKey = new Uint8Array(32);
      rawKey[0] = algorithm === 'AES-CBC' ? 3 : 5;
      const aesKey = await cryptoLab.importAesKey(rawKey, algorithm);
      const parameter = new Uint8Array(16);
      parameter[0] = 9;
      const params = algorithm === 'AES-CBC'
        ? { name: algorithm, iv: parameter }
        : { name: algorithm, counter: parameter, length: 64 };
      const cipher = await crypto.subtle.encrypt(params, aesKey, plaintext);
      const plain = await crypto.subtle.decrypt(params, aesKey, cipher);
      if (cryptoLab.decoder.decode(plain) !== cryptoLab.decoder.decode(plaintext)) {
        throw new Error(`${algorithm} no completó el round trip`);
      }
    }
  } catch (error) {
    fail(`Pruebas criptográficas: ${error.message}`);
  }
}

await validateCryptoRoundTrips();

if (errors.length) {
  console.error('\nValidación del Módulo 3 fallida:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Validación correcta: ruta de Clase 3, KDF, AES-CBC/CTR/GCM, archivos, catálogo y round trips criptográficos.');
