import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const htmlPath = resolve(
  root,
  "simuladores/modulo-03/integridad-autenticidad-laboratorio.html",
);
const indexPath = resolve(root, "simuladores/modulo-03/index.html");
const scriptPath = resolve(
  root,
  "simuladores/modulo-03/assets/hash-laboratorio.js",
);
const stylePath = resolve(
  root,
  "simuladores/modulo-03/assets/hash-laboratorio.css",
);

const [html, index, script, style] = await Promise.all([
  readFile(htmlPath, "utf8"),
  readFile(indexPath, "utf8"),
  readFile(scriptPath, "utf8"),
  readFile(stylePath, "utf8"),
]);

await import(`${pathToFileURL(scriptPath).href}?validation=${Date.now()}`);
const cryptoLab = globalThis.HashLabCrypto;
if (!cryptoLab)
  throw new Error("HashLabCrypto no quedó disponible para validación.");

const vectors = [
  [
    "SHA-256 vacío",
    cryptoLab.sha256Digest(""),
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  ],
  [
    "SHA-256 abc",
    cryptoLab.sha256Trace("abc").digest,
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  ],
  [
    "SHA3-256 vacío",
    cryptoLab.sha3_256("").digest,
    "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
  ],
  [
    "SHA3-256 abc",
    cryptoLab.sha3_256("abc").digest,
    "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532",
  ],
];

for (const [name, value, expected] of vectors) {
  const observed = cryptoLab.hex(value);
  if (observed !== expected)
    throw new Error(`${name}: ${observed} != ${expected}`);
}

if (cryptoLab.padSha256("abc").length !== 64)
  throw new Error("Padding SHA-256 incorrecto para abc.");
if (cryptoLab.padSha3("abc").length !== 136)
  throw new Error("Padding SHA3-256 incorrecto para abc.");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length)
  throw new Error(
    `IDs HTML duplicados: ${[...new Set(duplicates)].join(", ")}`,
  );

for (let station = 1; station <= 8; station += 1) {
  if (!html.includes(`data-hash-station="${station}"`))
    throw new Error(`Falta el control H${station}.`);
  if (!html.includes(`id="hash-station-${station}"`))
    throw new Error(`Falta el panel H${station}.`);
}

const staticReferences = [...script.matchAll(/byId\("([^"]+)"\)/g)].map(
  (match) => match[1],
);
const missingReferences = [...new Set(staticReferences)].filter(
  (id) => !ids.includes(id),
);
if (missingReferences.length)
  throw new Error(
    `IDs usados por JavaScript pero ausentes en HTML: ${missingReferences.join(", ")}`,
  );

for (const token of [
  "hash-station-nav",
  "hash-station-panel",
  "keccak-state",
  "merkle-tree",
]) {
  if (!style.includes(`.${token}`))
    throw new Error(`Falta el estilo principal .${token}.`);
}

if (!html.includes('src="assets/hash-laboratorio.js"'))
  throw new Error("El laboratorio no carga hash-laboratorio.js.");
if (!html.includes('href="assets/hash-laboratorio.css"'))
  throw new Error("El laboratorio no carga hash-laboratorio.css.");
if (
  !index.includes(
    'href="integridad-autenticidad-laboratorio.html#lab-hash"',
  ) ||
  !index.includes("Laboratorio hash · 8 estaciones")
)
  throw new Error(
    "La portada del Módulo 3 no ofrece un acceso explícito al laboratorio hash.",
  );

console.log(
  "Validación hash correcta: acceso visible, 8 estaciones, IDs completos y vectores SHA-256/SHA3-256 verificados.",
);
