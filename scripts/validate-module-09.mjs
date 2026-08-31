import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const moduleDir = path.join(root, "simuladores", "modulo-09");
const credit = "Material elaborado por el profesor Sergio Gevatschnaider";
const simulations = [
  "01-viaje-transaccion-bitcoin.html",
  "02-doble-gasto-reorganizacion.html",
  "03-sybil-prueba-trabajo.html",
  "04-claves-direcciones-wallet-hd.html",
  "05-constructor-utxo.html",
  "06-bitcoin-script.html",
  "08-privacidad-heuristicas.html",
  "09-mineria-prueba-trabajo.html",
  "10-arbol-merkle.html",
  "11-tiempo-entre-bloques.html",
  "12-ajuste-dificultad.html",
  "13-mineria-pools.html",
];
const studyResources = [
  "glosario-interactivo-bitcoin.html",
  "cuestionario-interactivo-bitcoin-20-preguntas.html",
];
const decks = [
  ["deck-01", "bitcoin-01-fundamentos-historia.pptx", "1Leu8lgUTgfJfQzh3vYScwk942JW3r45l79JhDXwiFwg"],
  ["deck-02", "bitcoin-02-claves-wallets-transacciones.pptx", "1ljGY3GK09oSAMmFfgzQEkEf0u8TIWiHLrByeRc5qppM"],
  ["deck-03", "bitcoin-03-bloques-mineria-consenso.pptx", "1hOU-LJXJKPakaBg1TUQn3qapQ-r70zIbWkD6-eHfKtE"],
  ["deck-04", "bitcoin-04-economia-seguridad-escalabilidad.pptx", "16uEry1ec_DwMBelUKcoueaoiQMB72YfS7FPbDiwekH4"],
];
const errors = [];

function fail(message) {
  errors.push(message);
}

function exists(relative) {
  const absolute = path.join(moduleDir, relative);
  if (!fs.existsSync(absolute)) fail(`Falta simuladores/modulo-09/${relative}`);
  return fs.existsSync(absolute);
}

function read(relative) {
  return fs.readFileSync(path.join(moduleDir, relative), "utf8");
}

for (const relative of [
  "index.html",
  "presentaciones.html",
  "modulo-09.css",
  "modulo-09.js",
  "presentaciones.js",
  "README.md",
  ...simulations,
  ...studyResources,
]) exists(relative);

for (const relative of ["index.html", "presentaciones.html", ...simulations, ...studyResources]) {
  if (!exists(relative)) continue;
  const html = read(relative);
  const label = `simuladores/modulo-09/${relative}`;
  for (const [description, pattern] of [
    ["doctype HTML5", /<!doctype html>/i],
    ["idioma español", /<html[^>]+lang=["']es["']/i],
    ["charset UTF-8", /<meta[^>]+charset=["']?utf-8/i],
    ["viewport responsive", /<meta[^>]+name=["']viewport["']/i],
    ["título", /<title>[^<]+<\/title>/i],
  ]) {
    if (!pattern.test(html)) fail(`${label}: falta ${description}`);
  }
  if (!html.includes(credit)) fail(`${label}: falta la autoría`);
}

for (const relative of [...simulations, ...studyResources]) {
  if (!exists(relative)) continue;
  const html = read(relative);
  if (!/class=["']module-back["'][^>]+href=["']index\.html["']|href=["']index\.html["'][^>]+class=["']module-back["']/.test(html)) {
    fail(`${relative}: falta el regreso al índice del módulo`);
  }
}

if (exists("index.html")) {
  const index = read("index.html");
  const cards = (index.match(/class=["'][^"']*resource-card/g) || []).length;
  if (cards !== 15) fail(`index.html: se esperaban 15 tarjetas de recursos y hay ${cards}`);
  for (const relative of ["presentaciones.html", ...simulations, ...studyResources]) {
    if (!index.includes(`href="${relative}"`)) fail(`index.html: falta el enlace ${relative}`);
  }
  if (index.includes("simulaciones-bitcoin-individuales/")) fail("index.html: conserva una ruta obsoleta de laboratorios");
}

for (const [directory, pptx, googleSlidesId] of decks) {
  const pptxRelative = path.join("presentaciones", pptx);
  if (exists(pptxRelative)) {
    const pptxPath = path.join(moduleDir, pptxRelative);
    if (fs.statSync(pptxPath).size < 40_000) fail(`${pptx}: el archivo parece incompleto`);
    try {
      const entries = execFileSync("unzip", ["-Z1", pptxPath], { encoding: "utf8" })
        .split("\n")
        .filter((entry) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(entry));
      for (const entry of entries) {
        const xml = execFileSync("unzip", ["-p", pptxPath, entry], { encoding: "utf8" });
        const text = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
          .map((match) => match[1])
          .join("")
          .trim();
        if (text) fail(`${pptx}: contiene notas del orador en ${entry}`);
      }
    } catch (error) {
      fail(`${pptx}: no se pudo inspeccionar el contenido PPTX (${error.message})`);
    }
  }

  for (let slide = 1; slide <= 16; slide += 1) {
    const png = path.join("presentaciones", directory, `slide-${String(slide).padStart(2, "0")}.png`);
    if (exists(png) && fs.statSync(path.join(moduleDir, png)).size < 10_000) fail(`${png}: imagen incompleta`);
  }

  for (const relative of ["index.html", "presentaciones.js"]) {
    if (exists(relative) && !read(relative).includes(googleSlidesId)) fail(`${relative}: falta el ID de Google Slides ${googleSlidesId}`);
  }
}

for (const relative of ["modulo-09.js", "presentaciones.js"]) {
  if (!exists(relative)) continue;
  try {
    new Function(read(relative));
  } catch (error) {
    fail(`${relative}: JavaScript inválido (${error.message})`);
  }
}

if (exists("modulo-09.js") && !read("modulo-09.js").includes("criptografia-modulo-09-bitcoin-progreso-v1")) {
  fail("modulo-09.js: clave de progreso incorrecta");
}

const catalogPath = path.join(root, "simuladores", "catalogo.json");
if (fs.existsSync(catalogPath)) {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const module = catalog.modulos?.find((entry) => entry.id === "modulo-09");
  if (!module) fail("catalogo.json: falta modulo-09");
  else {
    if (module.pagina !== "modulo-09/index.html") fail("catalogo.json: página incorrecta para modulo-09");
    if (module.presentaciones?.length !== 4) fail("catalogo.json: se esperaban 4 presentaciones");
    if (module.simulaciones?.length !== 12) fail("catalogo.json: se esperaban 12 simulaciones");
  }
}

if (errors.length) {
  console.error("\nValidación del Módulo 9 fallida:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Validación correcta del Módulo 9: 4 presentaciones sin notas, 64 diapositivas, 12 simulaciones, glosario, cuestionario, navegación y catálogo.");
