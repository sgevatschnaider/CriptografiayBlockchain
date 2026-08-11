import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const moduleDir = path.join(root, "simuladores", "modulo-03");
const errors = [];
const requiredPages = [
  "index.html",
  "ruta-modulo.html",
  "ruta-guiada.html",
  "contrasena-salt-kdf.html",
  "chacha20.html",
  "bloques-vs-flujo.html",
  "modos-aes-aead.html",
  "cifrado-local-archivos.html",
  "hash-hmac-firmas.html",
  "padding-oracle.html",
  "rsa-ecdh-hibrido.html",
  "asimetria-teoria-completa.html",
  "asimetria-laboratorio-integral.html",
  "ruta-clase-asimetria.html",
  "integridad-autenticidad-teoria.html",
  "integridad-autenticidad-laboratorio.html",
  "ruta-clase-integridad-autenticidad.html",
  "presentaciones-docentes.html",
  "glosario.html",
  "cuestionario.html",
];
const requiredAssets = [
  "assets/clase-03.css",
  "assets/crypto-lab.js",
  "assets/modulo-03.js",
  "assets/ruta-modulo.js",
  "assets/ruta-guiada.js",
  "assets/chacha20-core.js",
  "assets/chacha20-laboratorio.js",
  "assets/bloques-vs-flujo.js",
  "assets/modos-aes-aead.js",
  "assets/cifrado-local-archivos.js",
  "assets/hash-hmac-firmas.js",
  "assets/padding-oracle.js",
  "assets/rsa-ecdh-hibrido.js",
  "assets/asimetria-core.js",
  "assets/asimetria-teoria-completa.js",
  "assets/asimetria-laboratorio-integral.js",
  "assets/ruta-clase-asimetria.js",
  "assets/integridad-autenticidad.css",
  "assets/integridad-autenticidad-laboratorio.js",
  "assets/ruta-clase-integridad-autenticidad.js",
  "assets/programa-glosario-data.js",
  "assets/programa-glosario-vernam-data.js",
  "assets/programa-cuestionario-data.js",
  "assets/glosario-data.js",
  "assets/glosario.js",
  "assets/cuestionario-data.js",
  "assets/cuestionario.js",
];

function fail(message) {
  errors.push(message);
}

function read(relative) {
  const absolute = path.join(moduleDir, relative);
  if (!fs.existsSync(absolute)) {
    fail(`Falta simuladores/modulo-03/${relative}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function localReferences(html) {
  return [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter(
      (reference) =>
        !/^(?:https?:|mailto:|data:|javascript:|#)/i.test(reference),
    );
}

for (const relative of [...requiredPages, ...requiredAssets]) read(relative);

for (const relative of requiredPages) {
  const html = read(relative);
  if (!html) continue;
  const label = `simuladores/modulo-03/${relative}`;
  const requirements = [
    ["doctype HTML5", /<!doctype html>/i],
    ["idioma español", /<html[^>]+\blang=["']es["']/i],
    ["codificación UTF-8", /<meta[^>]+\bcharset=["']?utf-8/i],
    ["viewport responsive", /<meta[^>]+\bname=["']viewport["']/i],
    [
      "descripción",
      /<meta[^>]+\bname=["']description["'][^>]+\bcontent=["'][^"']{20,}/i,
    ],
    ["título descriptivo", /<title>[^<]{12,}<\/title>/i],
    ["contenido principal", /<main\b/i],
    ["salto al contenido", /class=["'][^"']*\bskip-link\b/i],
    ["hoja de estilos común", /\.\.\/assets\/lab\.css/i],
    [
      "atribución docente",
      /Material elaborado por el profesor Sergio Gevatschnaider\./i,
    ],
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

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map(
    (match) => match[1],
  );
  const duplicates = [
    ...new Set(ids.filter((id, index) => ids.indexOf(id) !== index)),
  ];
  if (duplicates.length)
    fail(`${label}: IDs duplicados: ${duplicates.join(", ")}`);

  const anchors = [...html.matchAll(/\bhref=["']#([^"']+)["']/gi)].map(
    (match) => decodeURIComponent(match[1]),
  );
  for (const anchor of anchors) {
    if (!ids.includes(anchor)) fail(`${label}: ancla sin destino: #${anchor}`);
  }

  for (const reference of localReferences(html)) {
    const clean = decodeURIComponent(reference.split("#")[0].split("?")[0]);
    if (!clean) continue;
    const target = path.resolve(
      path.dirname(path.join(moduleDir, relative)),
      clean,
    );
    if (!fs.existsSync(target))
      fail(`${label}: referencia local inexistente: ${reference}`);
  }
}

for (const relative of requiredAssets.filter((file) => file.endsWith(".js"))) {
  const script = read(relative);
  try {
    new Function(script);
  } catch (error) {
    fail(
      `simuladores/modulo-03/${relative}: error de sintaxis: ${error.message}`,
    );
  }
  if (/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/.test(script)) {
    fail(
      `simuladores/modulo-03/${relative}: no debe transmitir contraseñas o archivos`,
    );
  }
}

const kdfPage = read("contrasena-salt-kdf.html");
for (const token of [
  'id="password"',
  'id="salt"',
  'id="iterations"',
  'id="log"',
  'id="cmillion"',
]) {
  if (!kdfPage.includes(token))
    fail(`contrasena-salt-kdf.html: falta ${token}`);
}
for (const concept of [
  'normalize("NFC")',
  "PBKDF2",
  "deriveBits",
  "1e6",
  "Repetir exactamente igual",
]) {
  if (!kdfPage.includes(concept))
    fail(`contrasena-salt-kdf.html: falta el concepto ${concept}`);
}

const blocksPage = read("bloques-vs-flujo.html");
const blocksScript = read("assets/bloques-vs-flujo.js");
for (const token of [
  'id="block-message"',
  "PKCS#7",
  'id="reuse-stream"',
  "C₁ ⊕ C₂ = M₁ ⊕ M₂",
]) {
  if (!blocksPage.includes(token))
    fail(`bloques-vs-flujo.html: falta ${token}`);
}
for (const concept of [
  "Module03.randomBytes",
  "Lab.xorBytes",
  "plainXor",
  "cipherXor",
]) {
  if (!blocksScript.includes(concept))
    fail(`bloques-vs-flujo.js: falta ${concept}`);
}

const modesPage = read("modos-aes-aead.html");
const modesScript = read("assets/modos-aes-aead.js");
for (const token of [
  "AES-CBC",
  "AES-CTR",
  "AES-GCM",
  "Modelo conceptual",
  'id="tamper-data"',
  'id="tamper-context"',
]) {
  if (!modesPage.includes(token)) fail(`modos-aes-aead.html: falta ${token}`);
}
if (/function\s+toy\b|\btoy\s*\(/.test(`${modesPage}\n${modesScript}`)) {
  fail(
    "modos-aes-aead: conserva una función de cifrado didáctico que puede confundirse con AES real",
  );
}
for (const concept of [
  "name: 'AES-CBC'",
  "name: 'AES-CTR'",
  "name: 'AES-GCM'",
  "splitGcmResult",
  "crypto.subtle.encrypt",
  "crypto.subtle.decrypt",
]) {
  if (!modesScript.includes(concept))
    fail(`modos-aes-aead.js: falta ejecución verificable ${concept}`);
}

const filePage = read("cifrado-local-archivos.html");
const fileScript = read("assets/cifrado-local-archivos.js");
for (const token of [
  'id="source-file"',
  'id="package-file"',
  'id="package-json"',
  'id="tamper-package"',
  "bytes enviados",
]) {
  if (!filePage.includes(token))
    fail(`cifrado-local-archivos.html: falta ${token}`);
}
for (const concept of [
  "CBB-AES-GCM-1",
  "5 * 1024 * 1024",
  "deriveAesGcmKey",
  "splitGcmResult",
  "tagLength: 128",
  "downloadBlob",
]) {
  if (!fileScript.includes(concept))
    fail(`cifrado-local-archivos.js: falta ${concept}`);
}

const hashPage = read("hash-hmac-firmas.html");
const hashScript = read("assets/hash-hmac-firmas.js");
for (const token of [
  'id="hash-message-a"',
  'id="hmac-message"',
  'id="signed-document"',
  "ECDSA P-256",
]) {
  if (!hashPage.includes(token)) fail(`hash-hmac-firmas.html: falta ${token}`);
}
if (!hashPage.includes("../modulo-02/confusion-difusion.html")) {
  fail(
    "hash-hmac-firmas.html: falta el prerrequisito de confusión, difusión y avalancha",
  );
}
for (const concept of [
  "crypto.subtle.digest('SHA-256'",
  "name: 'HMAC'",
  "name: 'ECDSA'",
  "crypto.subtle.verify",
]) {
  if (!hashScript.includes(concept))
    fail(`hash-hmac-firmas.js: falta ${concept}`);
}

const integrityTheory = read("integridad-autenticidad-teoria.html");
for (const token of [
  'id="hash"',
  'id="mac"',
  'id="kdf"',
  'id="firmas"',
  'id="algoritmos-firma"',
  "Argon2id",
  "RSA-PSS",
  "ML-DSA",
  "SLH-DSA",
]) {
  if (!integrityTheory.includes(token))
    fail(`integridad-autenticidad-teoria.html: falta ${token}`);
}

const integrityLab = read("integridad-autenticidad-laboratorio.html");
const integrityScript = read("assets/integridad-autenticidad-laboratorio.js");
for (const token of [
  'id="lab-hash"',
  'id="lab-mac"',
  'id="lab-kdf"',
  'id="lab-firmas"',
  'id="signature-wrong-key"',
  "este laboratorio no inventa",
]) {
  if (!integrityLab.includes(token))
    fail(`integridad-autenticidad-laboratorio.html: falta ${token}`);
}
for (const concept of [
  "crypto.subtle.digest",
  'name: "HMAC"',
  'name: "PBKDF2"',
  'name: "HKDF"',
  'name: "RSA-PSS"',
  'name: "ECDSA"',
  'name: "Ed25519"',
  "crypto.subtle.verify",
]) {
  if (!integrityScript.includes(concept))
    fail(`integridad-autenticidad-laboratorio.js: falta ${concept}`);
}

const integrityRoute = read("ruta-clase-integridad-autenticidad.html");
const integrityStations = [
  ...integrityRoute.matchAll(/data-route-station=["'](\d+)["']/g),
].map((match) => match[1]);
if (integrityStations.join("|") !== "0|1|2|3|4|5|6|7")
  fail("ruta-clase-integridad-autenticidad.html: faltan estaciones 0 a 7");
for (const question of ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"]) {
  if (!integrityRoute.includes(`name="${question}"`))
    fail(
      `ruta-clase-integridad-autenticidad.html: falta la pregunta ${question}`,
    );
}

const presentations = read("presentaciones-docentes.html");
for (const anchor of [
  "intro-aes",
  "familias",
  "bits",
  "aes",
  "hash",
  "cumpleanos",
  "mac",
  "kdf",
  "firmas",
  "algoritmos-firma",
]) {
  if (!presentations.includes(`id="${anchor}"`))
    fail(`presentaciones-docentes.html: falta la tarjeta #${anchor}`);
}
for (const slideId of [
  "17r_-2txh1VyXrsSrSc1iU-edu_3sGt8o28Dj1uPEwAA",
  "1C2twCstLb0CGoq6eH4PL2E-rhVo4xDi7Dz67jjcJL6c",
  "1v9LUtIS3tHOrjgdF9qgINcxPJJNvAPocy0PStu0xq2Y",
  "1zj-vBaeVFjfauZD1AY7-k1ZtujMJCuVtpnnGS_qx5ms",
  "19pbow3l6U068sd4w5FxDMW4mP_s-_Ip6LKD-h1Ps-OA",
]) {
  if (!presentations.includes(`/presentation/d/${slideId}/`))
    fail(`presentaciones-docentes.html: falta la presentación ${slideId}`);
}

const oraclePage = read("padding-oracle.html");
const oracleScript = read("assets/padding-oracle.js");
for (const token of [
  "AES-CBC real",
  'id="query-leaky-oracle"',
  'id="scan-oracle"',
  "PKCS#7",
]) {
  if (!oraclePage.includes(token)) fail(`padding-oracle.html: falta ${token}`);
}
for (const concept of [
  "name: 'AES-CBC'",
  "for (let delta = 1; delta <= 255",
  "^ 0x01",
  "crypto.subtle.decrypt",
]) {
  if (!oracleScript.includes(concept))
    fail(`padding-oracle.js: falta ${concept}`);
}

const publicKeyPage = read("rsa-ecdh-hibrido.html");
const publicKeyScript = read("assets/rsa-ecdh-hibrido.js");
for (const token of [
  "RSA-OAEP 2048",
  "ECDH P-256",
  'id="simulate-mitm"',
  "ECDH → HKDF → AES-GCM",
]) {
  if (!publicKeyPage.includes(token))
    fail(`rsa-ecdh-hibrido.html: falta ${token}`);
}
for (const concept of [
  "name: 'RSA-OAEP'",
  "name: 'ECDH'",
  "name: 'HKDF'",
  "name: 'AES-GCM'",
  "deriveBits",
  "hybridAad",
]) {
  if (!publicKeyScript.includes(concept))
    fail(`rsa-ecdh-hibrido.js: falta ${concept}`);
}

const moduleRoute = read("ruta-modulo.html");
const moduleStations = [
  ...moduleRoute.matchAll(/data-module-station=["']([^"']+)["']/g),
].map((match) => match[1]);
const expectedStations = [
  "fundamentos",
  "bloques-flujo",
  "kdf",
  "aes-aead",
  "archivos",
  "hash-mac-firma",
  "oraculo-padding",
  "clave-publica",
  "glosario",
  "cuestionario",
];
if (moduleStations.join("|") !== expectedStations.join("|"))
  fail("ruta-modulo.html: las diez estaciones no están completas y ordenadas");
if (!moduleRoute.includes("../modulo-02/confusion-difusion.html"))
  fail(
    "ruta-modulo.html: falta el puente explícito al laboratorio de avalancha",
  );

const glossaryData = read("assets/glosario-data.js");
const glossaryCount = [...glossaryData.matchAll(/\bterm:\s*'/g)].length;
if (glossaryCount < 60)
  fail(
    `glosario-data.js: se esperaban al menos 60 términos y hay ${glossaryCount}`,
  );
try {
  const scope = {};
  new Function("window", glossaryData)(scope);
  const terms = scope.Module03Glossary;
  if (!Array.isArray(terms) || terms.length !== glossaryCount)
    throw new Error(
      "la colección exportada no coincide con el banco declarado",
    );
  const names = terms.map((term) => term.term);
  if (new Set(names).size !== names.length)
    throw new Error("hay términos duplicados");
  for (const [index, term] of terms.entries()) {
    for (const field of [
      "term",
      "category",
      "definition",
      "example",
      "contrast",
    ]) {
      if (typeof term[field] !== "string" || !term[field].trim())
        throw new Error(`el término ${index + 1} no tiene ${field}`);
    }
  }
} catch (error) {
  fail(`glosario-data.js: ${error.message}`);
}
for (const token of [
  'id="glossary-search"',
  'id="glossary-category"',
  'id="glossary-status"',
  'id="glossary-grid"',
]) {
  if (!read("glosario.html").includes(token))
    fail(`glosario.html: falta ${token}`);
}

const questionData = read("assets/cuestionario-data.js");
const questionCount = [...questionData.matchAll(/\bprompt:\s*'/g)].length;
if (questionCount < 30)
  fail(
    `cuestionario-data.js: se esperaban al menos 30 preguntas y hay ${questionCount}`,
  );
try {
  const scope = {};
  new Function("window", questionData)(scope);
  const questions = scope.Module03Questions;
  if (!Array.isArray(questions) || questions.length !== questionCount)
    throw new Error(
      "la colección exportada no coincide con el banco declarado",
    );
  const prompts = questions.map((question) => question.prompt);
  if (new Set(prompts).size !== prompts.length)
    throw new Error("hay preguntas duplicadas");
  const categories = new Set(questions.map((question) => question.category));
  const levels = new Set(questions.map((question) => question.level));
  if (categories.size !== 6)
    throw new Error(`se esperaban 6 categorías y hay ${categories.size}`);
  if (
    [...levels].sort().join("|") !==
    ["Aplicado", "Base", "Diagnóstico"].join("|")
  )
    throw new Error("los niveles no son Base, Aplicado y Diagnóstico");
  for (const [index, question] of questions.entries()) {
    if (!Array.isArray(question.options) || question.options.length < 3)
      throw new Error(`la pregunta ${index + 1} no tiene al menos 3 opciones`);
    if (
      !Number.isInteger(question.answer) ||
      question.answer < 0 ||
      question.answer >= question.options.length
    )
      throw new Error(`la pregunta ${index + 1} tiene una respuesta inválida`);
    if (
      typeof question.explanation !== "string" ||
      !question.explanation.trim()
    )
      throw new Error(`la pregunta ${index + 1} no tiene explicación`);
  }
} catch (error) {
  fail(`cuestionario-data.js: ${error.message}`);
}
for (const token of [
  'id="quiz-category"',
  'id="quiz-level"',
  'id="quiz-mode"',
  'id="quiz-summary"',
]) {
  if (!read("cuestionario.html").includes(token))
    fail(`cuestionario.html: falta ${token}`);
}

try {
  const scope = {};
  new Function("window", read("assets/programa-glosario-data.js"))(scope);
  new Function("window", read("assets/programa-glosario-vernam-data.js"))(
    scope,
  );
  const terms = scope.ModernTerms;
  if (!Array.isArray(terms) || terms.length !== 124)
    throw new Error(
      `se esperaban 124 términos integrales y hay ${terms?.length ?? 0}`,
    );
  const names = terms.map((term) => term[0]);
  if (new Set(names).size !== names.length)
    throw new Error("hay términos integrales duplicados");
  for (const [index, term] of terms.entries()) {
    if (
      !Array.isArray(term) ||
      term.length !== 4 ||
      term.some((field) => !String(field).trim())
    )
      throw new Error(
        `el término integral ${index + 1} no tiene sus cuatro campos`,
      );
  }
} catch (error) {
  fail(`glosario integral: ${error.message}`);
}

try {
  const scope = {};
  new Function("window", read("assets/programa-cuestionario-data.js"))(scope);
  const questions = scope.ModernQuestions;
  if (!Array.isArray(questions) || questions.length !== 55)
    throw new Error(
      `se esperaban 55 preguntas integrales y hay ${questions?.length ?? 0}`,
    );
  for (const [index, question] of questions.entries()) {
    if (!Array.isArray(question) || question.length !== 5)
      throw new Error(
        `la pregunta integral ${index + 1} no tiene cinco campos`,
      );
    const [, prompt, options, answer, explanation] = question;
    if (!String(prompt).trim() || !Array.isArray(options) || options.length < 3)
      throw new Error(`la pregunta integral ${index + 1} está incompleta`);
    if (!Number.isInteger(answer) || answer < 0 || answer >= options.length)
      throw new Error(
        `la pregunta integral ${index + 1} tiene respuesta inválida`,
      );
    if (!String(explanation).trim())
      throw new Error(`la pregunta integral ${index + 1} no tiene explicación`);
  }
  for (const category of ["Hash", "MAC", "KDF", "Firmas", "Poscuántica"]) {
    if (!questions.some((question) => question[0] === category))
      throw new Error(`falta la categoría ${category}`);
  }
} catch (error) {
  fail(`cuestionario integral: ${error.message}`);
}

const moduleIndex = read("index.html");
for (const token of [
  "124",
  "55",
  "integridad-autenticidad-teoria.html",
  "ruta-clase-integridad-autenticidad.html",
]) {
  if (!moduleIndex.includes(token))
    fail(`index.html: falta la integración ${token}`);
}

const routePage = read("ruta-guiada.html");
const stations = [...routePage.matchAll(/data-station=["'](\d+)["']/g)].map(
  (match) => match[1],
);
if (stations.join("|") !== "0|1|2|3|4|5")
  fail("ruta-guiada.html: la ruta debe contener seis estaciones en orden");
for (const question of ["q1", "q2", "q3", "q4", "q5"]) {
  if (!routePage.includes(`name="${question}"`))
    fail(`ruta-guiada.html: falta la pregunta ${question}`);
}

const css = read("assets/clase-03.css");
const braceBalance = [...css].reduce((balance, character) => {
  if (character === "{") return balance + 1;
  if (character === "}") return balance - 1;
  return balance;
}, 0);
if (braceBalance !== 0)
  fail(`clase-03.css: llaves desbalanceadas (${braceBalance})`);
if (!/@media\s*\(max-width:\s*640px\)/.test(css))
  fail("clase-03.css: falta adaptación móvil");
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css))
  fail("clase-03.css: falta respeto por movimiento reducido");

const integrityCss = read("assets/integridad-autenticidad.css");
const integrityBraceBalance = [...integrityCss].reduce((balance, character) => {
  if (character === "{") return balance + 1;
  if (character === "}") return balance - 1;
  return balance;
}, 0);
if (integrityBraceBalance !== 0)
  fail(
    `integridad-autenticidad.css: llaves desbalanceadas (${integrityBraceBalance})`,
  );
if (!/@media\s*\(max-width:\s*640px\)/.test(integrityCss))
  fail("integridad-autenticidad.css: falta adaptación móvil");
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(integrityCss))
  fail("integridad-autenticidad.css: falta respeto por movimiento reducido");

try {
  const catalog = JSON.parse(
    fs.readFileSync(path.join(root, "simuladores", "catalogo.json"), "utf8"),
  );
  const module = catalog.modulos?.find((item) => item.id === "modulo-03");
  const expected = [
    "modulo-03/ruta-modulo.html",
    "modulo-03/ruta-guiada.html",
    "modulo-03/contrasena-salt-kdf.html",
    "modulo-03/chacha20.html",
    "modulo-03/bloques-vs-flujo.html",
    "modulo-03/modos-aes-aead.html",
    "modulo-03/cifrado-local-archivos.html",
    "modulo-03/hash-hmac-firmas.html",
    "modulo-03/padding-oracle.html",
    "modulo-03/rsa-ecdh-hibrido.html",
    "modulo-03/asimetria-teoria-completa.html",
    "modulo-03/asimetria-laboratorio-integral.html",
    "modulo-03/ruta-clase-asimetria.html",
    "modulo-03/integridad-autenticidad-teoria.html",
    "modulo-03/integridad-autenticidad-laboratorio.html",
    "modulo-03/ruta-clase-integridad-autenticidad.html",
    "modulo-03/glosario.html",
    "modulo-03/cuestionario.html",
  ];
  for (const file of expected) {
    const entry = module?.simulaciones?.find((item) => item.archivo === file);
    if (!entry || entry.estado !== "disponible")
      fail(`catalogo.json: no registra ${file} como disponible`);
  }
  if (module?.ruta_guiada !== "modulo-03/ruta-modulo.html")
    fail("catalogo.json: falta la ruta completa del Módulo 3");
  if (module?.ruta_clase_03 !== "modulo-03/ruta-guiada.html")
    fail("catalogo.json: falta la ruta específica de la Clase 3");
  if (
    module?.ruta_clase_integridad_autenticidad !==
    "modulo-03/ruta-clase-integridad-autenticidad.html"
  )
    fail("catalogo.json: falta la ruta de integridad y autenticidad");
} catch (error) {
  fail(`catalogo.json: JSON inválido: ${error.message}`);
}

const campus = fs.readFileSync(
  path.join(root, "simuladores", "index.html"),
  "utf8",
);
if (!campus.includes("modulo-03/ruta-guiada.html"))
  fail("El campus no enlaza la Clase 3");
if (!campus.includes("modulo-03/ruta-modulo.html"))
  fail("El campus no enlaza la ruta completa del Módulo 3");
const guide = fs.readFileSync(
  path.join(root, "docs", "criptografia", "guia-docente-simuladores.md"),
  "utf8",
);
if (!guide.includes("clase-03-kdf-aes-gcm.md"))
  fail("La guía docente no enlaza la planificación de Clase 3");
if (!guide.includes("modulo-03/ruta-modulo.html"))
  fail("La guía docente no enlaza la ruta completa del Módulo 3");

async function validateCryptoRoundTrips() {
  try {
    globalThis.isSecureContext = true;
    await import(
      `${pathToFileURL(path.join(moduleDir, "assets", "crypto-lab.js")).href}?validation=1`
    );
    const cryptoLab = globalThis.Class3Crypto;
    if (!cryptoLab) throw new Error("crypto-lab.js no exportó Class3Crypto");

    const saltA = new Uint8Array(16);
    const saltB = new Uint8Array(16);
    saltB[0] = 1;
    const composed = await cryptoLab.derivePbkdf2Bits("mañana", saltA, 10_000);
    const decomposed = await cryptoLab.derivePbkdf2Bits(
      "man\u0303ana",
      saltA,
      10_000,
    );
    const otherSalt = await cryptoLab.derivePbkdf2Bits("mañana", saltB, 10_000);
    if (cryptoLab.bytesToHex(composed) !== cryptoLab.bytesToHex(decomposed)) {
      throw new Error(
        "NFC no igualó dos contraseñas canónicamente equivalentes",
      );
    }
    if (cryptoLab.bytesToHex(composed) === cryptoLab.bytesToHex(otherSalt)) {
      throw new Error(
        "dos salts distintas produjeron la misma salida de prueba",
      );
    }

    const plaintext = cryptoLab.encoder.encode(
      "Archivo ficticio de la Clase 3.",
    );
    const aad = cryptoLab.encoder.encode('{"name":"demo.txt"}');
    const iv = new Uint8Array(12);
    iv[0] = 7;
    const key = await cryptoLab.deriveAesGcmKey(
      "contraseña ficticia",
      saltA,
      10_000,
    );
    const encrypted = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: "AES-GCM", iv, additionalData: aad, tagLength: 128 },
        key,
        plaintext,
      ),
    );
    const { ciphertext, tag } = cryptoLab.splitGcmResult(encrypted);
    const recovered = new Uint8Array(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv, additionalData: aad, tagLength: 128 },
        key,
        cryptoLab.concatBytes(ciphertext, tag),
      ),
    );
    if (
      cryptoLab.decoder.decode(recovered) !==
      cryptoLab.decoder.decode(plaintext)
    ) {
      throw new Error("AES-GCM no recuperó el texto de prueba");
    }
    ciphertext[0] ^= 1;
    let rejected = false;
    try {
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv, additionalData: aad, tagLength: 128 },
        key,
        cryptoLab.concatBytes(ciphertext, tag),
      );
    } catch {
      rejected = true;
    }
    if (!rejected) throw new Error("AES-GCM aceptó un criptograma alterado");

    for (const algorithm of ["AES-CBC", "AES-CTR"]) {
      const rawKey = new Uint8Array(32);
      rawKey[0] = algorithm === "AES-CBC" ? 3 : 5;
      const aesKey = await cryptoLab.importAesKey(rawKey, algorithm);
      const parameter = new Uint8Array(16);
      parameter[0] = 9;
      const params =
        algorithm === "AES-CBC"
          ? { name: algorithm, iv: parameter }
          : { name: algorithm, counter: parameter, length: 64 };
      const cipher = await crypto.subtle.encrypt(params, aesKey, plaintext);
      const plain = await crypto.subtle.decrypt(params, aesKey, cipher);
      if (
        cryptoLab.decoder.decode(plain) !== cryptoLab.decoder.decode(plaintext)
      ) {
        throw new Error(`${algorithm} no completó el round trip`);
      }
    }

    const hmacKey = await crypto.subtle.importKey(
      "raw",
      new Uint8Array(32).fill(7),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
    const hmacMessage = cryptoLab.encoder.encode("mensaje autenticado");
    const hmacTag = await crypto.subtle.sign("HMAC", hmacKey, hmacMessage);
    if (!(await crypto.subtle.verify("HMAC", hmacKey, hmacTag, hmacMessage))) {
      throw new Error("HMAC no verificó su propio tag");
    }
    if (
      await crypto.subtle.verify(
        "HMAC",
        hmacKey,
        hmacTag,
        cryptoLab.encoder.encode("mensaje alterado"),
      )
    ) {
      throw new Error("HMAC aceptó un mensaje alterado");
    }

    const ecdsa = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign", "verify"],
    );
    const signedMessage = cryptoLab.encoder.encode("documento firmado");
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      ecdsa.privateKey,
      signedMessage,
    );
    if (
      !(await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        ecdsa.publicKey,
        signature,
        signedMessage,
      ))
    ) {
      throw new Error("ECDSA no verificó su propia firma");
    }
    if (
      await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        ecdsa.publicKey,
        signature,
        cryptoLab.encoder.encode("documento alterado"),
      )
    ) {
      throw new Error("ECDSA aceptó un documento alterado");
    }

    const rsa = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      false,
      ["encrypt", "decrypt"],
    );
    const rsaPlain = cryptoLab.encoder.encode("clave de sesión");
    const rsaCipher = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      rsa.publicKey,
      rsaPlain,
    );
    const rsaRecovered = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      rsa.privateKey,
      rsaCipher,
    );
    if (cryptoLab.decoder.decode(rsaRecovered) !== "clave de sesión")
      throw new Error("RSA-OAEP no completó el round trip");

    const [alice, bob] = await Promise.all([
      crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, false, [
        "deriveBits",
      ]),
      crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, false, [
        "deriveBits",
      ]),
    ]);
    const [aliceSecret, bobSecret] = await Promise.all([
      crypto.subtle.deriveBits(
        { name: "ECDH", public: bob.publicKey },
        alice.privateKey,
        256,
      ),
      crypto.subtle.deriveBits(
        { name: "ECDH", public: alice.publicKey },
        bob.privateKey,
        256,
      ),
    ]);
    if (cryptoLab.bytesToHex(aliceSecret) !== cryptoLab.bytesToHex(bobSecret))
      throw new Error("ECDH no produjo el mismo secreto");

    const hybridSalt = new Uint8Array(16).fill(13);
    const hybridInfo = cryptoLab.encoder.encode("modulo-03|prueba|v1");
    const hybridIv = new Uint8Array(12).fill(17);
    const hybridAad = cryptoLab.encoder.encode(
      '{"suite":"ECDH-P-256|HKDF-SHA-256|AES-256-GCM"}',
    );
    async function deriveHybridKey(secret) {
      const material = await crypto.subtle.importKey(
        "raw",
        secret,
        "HKDF",
        false,
        ["deriveKey"],
      );
      return crypto.subtle.deriveKey(
        { name: "HKDF", hash: "SHA-256", salt: hybridSalt, info: hybridInfo },
        material,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      );
    }
    const [aliceHybridKey, bobHybridKey] = await Promise.all([
      deriveHybridKey(aliceSecret),
      deriveHybridKey(bobSecret),
    ]);
    const hybridPlain = cryptoLab.encoder.encode("mensaje híbrido autenticado");
    const hybridCipher = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: hybridIv,
        additionalData: hybridAad,
        tagLength: 128,
      },
      aliceHybridKey,
      hybridPlain,
    );
    const hybridRecovered = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: hybridIv,
        additionalData: hybridAad,
        tagLength: 128,
      },
      bobHybridKey,
      hybridCipher,
    );
    if (
      cryptoLab.decoder.decode(hybridRecovered) !==
      cryptoLab.decoder.decode(hybridPlain)
    ) {
      throw new Error("ECDH + HKDF + AES-GCM no completó el round trip");
    }
    let hybridRejected = false;
    try {
      await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: hybridIv,
          additionalData: cryptoLab.encoder.encode("metadatos alterados"),
          tagLength: 128,
        },
        bobHybridKey,
        hybridCipher,
      );
    } catch {
      hybridRejected = true;
    }
    if (!hybridRejected)
      throw new Error("el cifrado híbrido aceptó AAD alterado");

    const oracleKey = await crypto.subtle.importKey(
      "raw",
      new Uint8Array(32).fill(11),
      { name: "AES-CBC" },
      false,
      ["encrypt", "decrypt"],
    );
    const oracleIv = new Uint8Array(16);
    const oracleMessage = cryptoLab.encoder.encode("SECRETO DEMO");
    const oracleCipher = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv: oracleIv },
      oracleKey,
      oracleMessage,
    );
    const forcedIv = new Uint8Array(oracleIv);
    const padding = 16 - oracleMessage.length;
    forcedIv[15] ^= padding ^ 1;
    await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: forcedIv },
      oracleKey,
      oracleCipher,
    );
  } catch (error) {
    fail(`Pruebas criptográficas: ${error.message}`);
  }
}

await validateCryptoRoundTrips();

if (errors.length) {
  console.error("\nValidación del Módulo 3 fallida:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  "Validación correcta: rutas, 124 términos integrales, 55 preguntas, presentaciones y round trips SHA-256, KDF, AES, HMAC, ECDSA, RSA, ECDH, HKDF y oráculo CBC.",
);
