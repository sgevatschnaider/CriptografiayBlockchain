import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

const root = process.cwd();
const moduleDir = path.join(root, 'simuladores', 'modulo-03');
const errors = [];
const required = [
  'asimetria-teoria-completa.html',
  'asimetria-laboratorio-integral.html',
  'ruta-clase-asimetria.html',
  'assets/asimetria-completa.css',
  'assets/asimetria-core.js',
  'assets/asimetria-teoria-completa.js',
  'assets/asimetria-laboratorio-integral.js',
  'assets/ruta-clase-asimetria.js'
];

function fail(message) { errors.push(message); }
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

for (const file of required) read(file);

for (const page of ['asimetria-teoria-completa.html', 'asimetria-laboratorio-integral.html', 'ruta-clase-asimetria.html']) {
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
  for (const reference of localReferences(html)) {
    const clean = decodeURIComponent(reference.split('#')[0].split('?')[0]);
    if (!clean) continue;
    const target = path.resolve(path.dirname(path.join(moduleDir, page)), clean);
    if (!fs.existsSync(target)) fail(`${label}: referencia local inexistente ${reference}`);
  }
}

const theory = read('asimetria-teoria-completa.html');
for (const token of [
  'RSA-OAEP', 'RSA-PSS', 'ECDSA', 'EdDSA', 'ECDH', 'X25519', 'HKDF', 'AES-GCM',
  'HPKE', 'PKI', 'certificado', 'secreto hacia adelante', 'man-in-the-middle', 'FIPS 186-5',
  'NIST SP 800-56A', 'RFC 8017', 'RFC 9180', 'FIPS 203'
]) if (!theory.includes(token)) fail(`asimetria-teoria-completa.html: falta ${token}`);
for (const id of ['modelo', 'matematica', 'rsa', 'esquemas-rsa', 'curvas', 'acuerdo', 'firmas', 'pki', 'hibrido', 'sesiones', 'ataques', 'fuentes']) {
  if (!theory.includes(`id="${id}"`)) fail(`asimetria-teoria-completa.html: falta la sección ${id}`);
}
for (const control of ['rsa-theory-p', 'rsa-theory-q', 'rsa-theory-e', 'rsa-theory-message', 'rsa-theory-run', 'ecc-scalar', 'ecc-result', 'ecc-trace', 'ecc-curve-plot']) {
  if (!theory.includes(`id="${control}"`)) fail(`asimetria-teoria-completa.html: falta el control ${control}`);
}

const lab = read('asimetria-laboratorio-integral.html');
const labIds = [
  'asym-rsa-generate', 'asym-rsa-encrypt', 'asym-rsa-decrypt', 'asym-rsa-sign', 'asym-rsa-verify', 'asym-rsa-tamper',
  'asym-ecdsa-generate', 'asym-ecdsa-sign', 'asym-ecdsa-verify', 'asym-ecdsa-tamper', 'asym-ecdsa-wrong',
  'asym-auth-generate', 'asym-auth-verify', 'asym-auth-encrypt', 'asym-auth-decrypt', 'asym-auth-tamper-key', 'asym-auth-tamper-package', 'asym-auth-mitm',
  'asym-x25519-run', 'asym-pki-generate', 'asym-pki-validate', 'asym-pki-tamper', 'asym-pki-wrong-root'
];
for (const id of labIds) if (!lab.includes(`id="${id}"`)) fail(`asimetria-laboratorio-integral.html: falta ${id}`);
const tabPanels = [...lab.matchAll(/class=["'][^"']*\basym-panel\b[^"']*["']/g)].length;
if (tabPanels !== 5) fail(`asimetria-laboratorio-integral.html: se esperaban 5 experimentos y hay ${tabPanels}`);

for (const script of ['assets/asimetria-core.js', 'assets/asimetria-teoria-completa.js', 'assets/asimetria-laboratorio-integral.js', 'assets/ruta-clase-asimetria.js']) {
  const source = read(script);
  try { new Function(source); } catch (error) { fail(`${script}: sintaxis inválida: ${error.message}`); }
  if (/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/.test(source)) fail(`${script}: contiene transmisión de red`);
}

const labScript = read('assets/asimetria-laboratorio-integral.js');
for (const token of [
  "name: 'RSA-OAEP'", "name: 'RSA-PSS'", "name: 'ECDSA'", "name: 'ECDH'", "name: 'HKDF'", "name: 'AES-GCM'",
  "name: 'X25519'", 'crypto.subtle.sign', 'crypto.subtle.verify', 'crypto.subtle.deriveBits', 'tagLength: 128', 'keyCertSign'
]) if (!labScript.includes(token)) fail(`asimetria-laboratorio-integral.js: falta ${token}`);

try {
  const context = vm.createContext({ Math, Number, String, Object, Array, Error, RangeError, BigInt, Uint8Array, window: {} });
  vm.runInContext(read('assets/asimetria-core.js'), context);
  const core = context.window.AsymmetryCore;
  if (!core) throw new Error('AsymmetryCore no fue exportado');
  const vector = core.rsaTrace(61, 53, 17, 65);
  const expected = { n: 3233, phi: 3120, d: 2753, ciphertext: 2790, recovered: 65 };
  for (const [field, value] of Object.entries(expected)) if (vector[field] !== value) throw new Error(`vector RSA ${field}=${vector[field]}, se esperaba ${value}`);
  const curve = { a: 2, b: 2, p: 17, g: { x: 5, y: 1 } };
  const points = core.enumerateCurve(curve.a, curve.b, curve.p);
  if (points.length !== 18) throw new Error(`la curva educativa debe tener 18 puntos afines y tiene ${points.length}`);
  const orderCheck = core.ecMultiply(19, curve.g, curve.a, curve.b, curve.p).point;
  if (orderCheck !== null) throw new Error('19G debe ser el punto al infinito');
  const seven = core.ecMultiply(7, curve.g, curve.a, curve.b, curve.p).point;
  if (!core.isOnCurve(seven, curve.a, curve.b, curve.p)) throw new Error('7G no pertenece a la curva');
} catch (error) { fail(`asimetria-core.js: ${error.message}`); }

async function verifyRealCryptography() {
  const subtle = webcrypto.subtle;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const message = encoder.encode('vector-integracion-asimetrica');

  const oaep = await subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    false,
    ['encrypt', 'decrypt']
  );
  const ciphertext = await subtle.encrypt({ name: 'RSA-OAEP' }, oaep.publicKey, message);
  const recovered = await subtle.decrypt({ name: 'RSA-OAEP' }, oaep.privateKey, ciphertext);
  if (decoder.decode(recovered) !== decoder.decode(message)) throw new Error('RSA-OAEP no recuperó el mensaje');

  const pss = await subtle.generateKey(
    { name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  const pssSignature = await subtle.sign({ name: 'RSA-PSS', saltLength: 32 }, pss.privateKey, message);
  if (!(await subtle.verify({ name: 'RSA-PSS', saltLength: 32 }, pss.publicKey, pssSignature, message))) throw new Error('RSA-PSS válido fue rechazado');
  if (await subtle.verify({ name: 'RSA-PSS', saltLength: 32 }, pss.publicKey, pssSignature, encoder.encode('alterado'))) throw new Error('RSA-PSS aceptó un mensaje alterado');

  const identity = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
  const identitySignature = await subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, identity.privateKey, message);
  if (!(await subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, identity.publicKey, identitySignature, message))) throw new Error('ECDSA válido fue rechazado');

  const [alice, bob] = await Promise.all([
    subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']),
    subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits'])
  ]);
  const [aliceSecret, bobSecret] = await Promise.all([
    subtle.deriveBits({ name: 'ECDH', public: bob.publicKey }, alice.privateKey, 256),
    subtle.deriveBits({ name: 'ECDH', public: alice.publicKey }, bob.privateKey, 256)
  ]);
  if (!Buffer.from(aliceSecret).equals(Buffer.from(bobSecret))) throw new Error('ECDH produjo secretos distintos');

  const bobRaw = new Uint8Array(await subtle.exportKey('raw', bob.publicKey));
  const signedEphemeral = await subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, identity.privateKey, bobRaw);
  if (!(await subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, identity.publicKey, signedEphemeral, bobRaw))) throw new Error('la efímera firmada fue rechazada');
  const modifiedRaw = bobRaw.slice(); modifiedRaw[modifiedRaw.length - 1] ^= 1;
  if (await subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, identity.publicKey, signedEphemeral, modifiedRaw)) throw new Error('la firma aceptó una efímera sustituida');

  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const info = encoder.encode('modulo-03|sesion-autenticada|v1');
  async function deriveAes(secret) {
    const material = await subtle.importKey('raw', secret, 'HKDF', false, ['deriveKey']);
    return subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt, info }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  const [aliceAes, bobAes] = await Promise.all([deriveAes(aliceSecret), deriveAes(bobSecret)]);
  const aad = encoder.encode('transcript-autenticado');
  const protectedData = await subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 }, aliceAes, message);
  const opened = await subtle.decrypt({ name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 }, bobAes, protectedData);
  if (decoder.decode(opened) !== decoder.decode(message)) throw new Error('ECDH-HKDF-AES-GCM no recuperó el mensaje');
  const tampered = new Uint8Array(protectedData); tampered[0] ^= 1;
  let rejected = false;
  try { await subtle.decrypt({ name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 }, bobAes, tampered); } catch { rejected = true; }
  if (!rejected) throw new Error('AES-GCM aceptó un ciphertext alterado');

  try {
    const [xAlice, xBob] = await Promise.all([
      subtle.generateKey({ name: 'X25519' }, false, ['deriveBits']),
      subtle.generateKey({ name: 'X25519' }, false, ['deriveBits'])
    ]);
    const [xA, xB] = await Promise.all([
      subtle.deriveBits({ name: 'X25519', public: xBob.publicKey }, xAlice.privateKey, 256),
      subtle.deriveBits({ name: 'X25519', public: xAlice.publicKey }, xBob.privateKey, 256)
    ]);
    if (!Buffer.from(xA).equals(Buffer.from(xB))) throw new Error('X25519 produjo secretos distintos');
  } catch (error) {
    if (!/NotSupported|Unrecognized|not supported/i.test(`${error.name} ${error.message}`)) throw error;
  }
}

try { await verifyRealCryptography(); } catch (error) { fail(`Web Crypto asimétrica: ${error.message}`); }

const route = read('ruta-clase-asimetria.html');
const stations = [...route.matchAll(/data-class-station=["'](\d+)["']/g)].map((match) => match[1]);
if (stations.join('|') !== '0|1|2|3|4|5|6') fail('ruta-clase-asimetria.html: deben existir siete estaciones ordenadas');
for (const question of ['q1', 'q2', 'q3', 'q4', 'q5', 'q6']) if (!route.includes(`name="${question}"`)) fail(`ruta-clase-asimetria.html: falta ${question}`);
for (const resource of ['asimetria-teoria-completa.html', 'asimetria-laboratorio-integral.html', 'rsa-ecdh-hibrido.html', 'cifrado-hibrido-sesion.html', '09-criptografia-asimetrica.pdf']) {
  if (!route.includes(resource)) fail(`ruta-clase-asimetria.html: falta ${resource}`);
}

for (const container of ['index.html', 'ruta-modulo.html', 'teoria-programa.html', 'rsa-ecdh-hibrido.html', 'cifrado-hibrido-sesion.html']) {
  const content = read(container);
  for (const resource of ['asimetria-teoria-completa.html', 'asimetria-laboratorio-integral.html']) {
    if (!content.includes(resource)) fail(`${container}: falta integrar ${resource}`);
  }
}
for (const container of ['index.html', 'ruta-modulo.html', 'teoria-programa.html', 'rsa-ecdh-hibrido.html', 'cifrado-hibrido-sesion.html']) {
  if (!read(container).includes('ruta-clase-asimetria.html')) fail(`${container}: falta integrar ruta-clase-asimetria.html`);
}

try {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'simuladores', 'catalogo.json'), 'utf8'));
  if (catalog.version < 16) fail('catalogo.json: la versión debe ser al menos 16');
  const module = catalog.modulos?.find((item) => item.id === 'modulo-03');
  if (!module) fail('catalogo.json: falta modulo-03');
  else {
    const files = new Set(module.simulaciones.map((item) => item.archivo));
    for (const file of [
      'modulo-03/asimetria-teoria-completa.html',
      'modulo-03/asimetria-laboratorio-integral.html',
      'modulo-03/ruta-clase-asimetria.html'
    ]) if (!files.has(file)) fail(`catalogo.json: falta ${file}`);
    if (module.ruta_clase_asimetria !== 'modulo-03/ruta-clase-asimetria.html') fail('catalogo.json: falta ruta_clase_asimetria');
    if (module.simulaciones.length !== 31) fail(`catalogo.json: se esperaban 31 recursos del Módulo 3 y hay ${module.simulaciones.length}`);
  }
} catch (error) { fail(`catalogo.json: ${error.message}`); }

const css = read('assets/asimetria-completa.css');
const balance = [...css].reduce((value, character) => value + (character === '{' ? 1 : character === '}' ? -1 : 0), 0);
if (balance !== 0) fail(`asimetria-completa.css: llaves desbalanceadas (${balance})`);
if (!/@media\s*\(max-width:\s*720px\)/.test(css)) fail('asimetria-completa.css: falta adaptación móvil');

if (errors.length) {
  console.error(`Validación asimétrica: ${errors.length} error(es)`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('Validación asimétrica correcta: teoría, matemática, RSA, ECC, firmas, sesión autenticada, X25519, PKI, ruta, PDF e integración.');
