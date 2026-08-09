import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const moduleDir = path.join(root, 'simuladores', 'modulo-03');
const errors = [];
const fail = (message) => errors.push(message);
const read = (relative) => {
  const target = path.join(moduleDir, relative);
  if (!fs.existsSync(target)) {
    fail(`Falta simuladores/modulo-03/${relative}`);
    return '';
  }
  return fs.readFileSync(target, 'utf8');
};

const page = read('chacha20.html');
const core = read('assets/chacha20-core.js');
const ui = read('assets/chacha20-laboratorio.js');

for (const [label, pattern] of [
  ['doctype HTML5', /<!doctype html>/i],
  ['idioma español', /<html[^>]+lang=["']es["']/i],
  ['viewport', /name=["']viewport["']/i],
  ['descripción', /name=["']description["']/i],
  ['contenido principal', /<main\b/i],
  ['salto al contenido', /skip-link/i],
  ['estilos compartidos', /\.\.\/assets\/lab\.css/i],
  ['vector RFC 8439', /RFC 8439/i],
  ['estado 4 por 4', /estado 4.{0,5}4/is],
  ['quarter round', /quarter round/i],
  ['reutilización de nonce', /reutilizaci[oó]n[^<]{0,40}nonce/i],
  ['límite de autenticación', /ChaCha20 solo no autentica/i],
  ['atribución docente', /Material elaborado por el profesor Sergio Gevatschnaider\./i]
]) if (!pattern.test(page)) fail(`chacha20.html: falta ${label}`);

if (/versi[oó]n\s*(?:2|superior)/i.test(page)) fail('chacha20.html: muestra una etiqueta de versión no permitida');
if (/\son(?:click|input|change|submit)=/i.test(page)) fail('chacha20.html: contiene manejadores inline');

for (const match of page.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
  const reference = match[1];
  if (/^(?:https?:|mailto:|data:|javascript:|#)/i.test(reference)) continue;
  const target = path.resolve(moduleDir, reference.split(/[?#]/)[0]);
  if (!fs.existsSync(target)) fail(`chacha20.html: referencia local inexistente ${reference}`);
}

for (const [name, source] of [['chacha20-core.js', core], ['chacha20-laboratorio.js', ui]]) {
  try { new Function(source); } catch (error) { fail(`${name}: sintaxis inválida: ${error.message}`); }
  if (/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/.test(source)) fail(`${name}: contiene transmisión de red`);
}

try {
  const context = vm.createContext({ Uint8Array, Array, Object, Number, String, TypeError, Error, RangeError, Math, globalThis: {} });
  context.globalThis = context;
  vm.runInContext(core, context);
  const chacha = context.ChaCha20Core;
  if (!chacha) throw new Error('ChaCha20Core no fue exportado');

  const quarter = new Uint32Array([0x11111111, 0x01020304, 0x9b8d6f43, 0x01234567]);
  chacha.quarterRound(quarter, 0, 1, 2, 3);
  const quarterExpected = ['ea2a92f4', 'cb1cf8ce', '4581472e', '5881c4bb'];
  if ([...quarter].map(chacha.wordHex).join('|') !== quarterExpected.join('|')) throw new Error('quarter round RFC 8439 incorrecto');

  const key = chacha.fromHex('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f', 32);
  const nonce = chacha.fromHex('000000090000004a00000000', 12);
  const expected = '10f1e7e4d13b5915500fdd1fa32071c4c7d1f4c733c068030422aa9ac3d46c4ed2826446079faa0914c2d705d98b02a2b5129cd1de164eb9cbd083e8a2503c4e';
  const obtained = chacha.toHex(chacha.block(key, 1, nonce).bytes);
  if (obtained !== expected) throw new Error(`vector de bloque RFC 8439 incorrecto: ${obtained}`);

  const messageA = new Uint8Array([1, 2, 3, 4, 5]);
  const messageB = new Uint8Array([7, 8, 9, 10, 11]);
  const cipherA = chacha.encrypt(key, nonce, 1, messageA);
  const cipherB = chacha.encrypt(key, nonce, 1, messageB);
  const recovered = chacha.encrypt(key, nonce, 1, cipherA);
  if (chacha.toHex(recovered) !== chacha.toHex(messageA)) throw new Error('el cifrado no completa el round trip');
  const xor = (a, b) => Uint8Array.from(a, (value, index) => value ^ b[index]);
  if (chacha.toHex(xor(cipherA, cipherB)) !== chacha.toHex(xor(messageA, messageB))) throw new Error('la demostración de reutilización de nonce es inconsistente');
} catch (error) {
  fail(`chacha20-core.js: ${error.message}`);
}

for (const relative of ['index.html', 'ruta-modulo.html', 'algoritmos-simetricos.html', 'teoria-programa.html']) {
  if (!read(relative).includes('chacha20.html')) fail(`${relative}: no integra chacha20.html`);
}

try {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'simuladores', 'catalogo.json'), 'utf8'));
  const module = catalog.modulos.find((item) => item.id === 'modulo-03');
  const entry = module?.simulaciones?.find((item) => item.archivo === 'modulo-03/chacha20.html');
  if (!entry || entry.estado !== 'disponible') fail('catalogo.json: ChaCha20 no figura disponible');
  if (module?.simulaciones?.length !== 25) fail(`catalogo.json: se esperaban 25 recursos y hay ${module?.simulaciones?.length ?? 0}`);
} catch (error) {
  fail(`catalogo.json: ${error.message}`);
}

if (errors.length) {
  console.error(`Validación ChaCha20: ${errors.length} error(es)`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Validación ChaCha20 correcta: RFC 8439, round trip, reutilización de nonce, integración y catálogo.');
