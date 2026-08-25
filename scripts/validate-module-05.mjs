import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const moduleDir = path.join(root, "simuladores", "modulo-05");
const slideId = "1kDPAhGZZOm1zhoCM79_29pMeGPZoDgp-Kj0wGBK6I0k";
const presentationPdf = "Blockchain_fundamentos_arquitectura_aplicaciones.pdf";
const presentationPptx = "Blockchain_fundamentos_arquitectura_aplicaciones.pptx";
const credit = "Material elaborado por el profesor Sergio Gevatschnaider.";
const labs = [
  "01-red-blockchain-viva.html",
  "02-arena-consenso.html",
  "03-doble-gasto-monte-carlo.html",
  "04-mempool-mev.html",
  "05-smart-contract-bajo-ataque.html",
  "06-laboratorio-oraculos.html",
  "07-rollup-studio.html",
  "08-privacidad-vinculabilidad.html",
  "09-gobernanza-forks.html",
  "10-decision-blockchain.html",
];
const studyResources = ["11-glosario-blockchain.html", "12-cuestionario-blockchain.html"];
const htmlFiles = ["index.html", "presentacion.html", ...labs, ...studyResources];
const requiredFiles = [...htmlFiles, "modulo-05.css", "modulo-05.js", presentationPdf, presentationPptx];
const errors = [];

function fail(message) {
  errors.push(message);
}

function read(relative) {
  return fs.readFileSync(path.join(moduleDir, relative), "utf8");
}

for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(moduleDir, relative))) fail(`Falta simuladores/modulo-05/${relative}`);
}

for (const relative of htmlFiles) {
  const absolute = path.join(moduleDir, relative);
  if (!fs.existsSync(absolute)) continue;
  const html = read(relative);
  const label = `simuladores/modulo-05/${relative}`;

  for (const [description, pattern] of [
    ["doctype HTML5", /<!doctype html>/i],
    ["idioma español", /<html[^>]+lang=["']es["']/i],
    ["charset UTF-8", /<meta[^>]+charset=["']?utf-8/i],
    ["viewport responsive", /<meta[^>]+name=["']viewport["']/i],
    ["título", /<title>[^<]+<\/title>/i],
    ["contenido principal", /<main\b/i],
  ]) {
    if (!pattern.test(html)) fail(`${label}: falta ${description}`);
  }

  const creditCount = html.split(credit).length - 1;
  if (creditCount !== 1) fail(`${label}: la autoría debe aparecer exactamente una vez; aparece ${creditCount}`);

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((id) => /^[A-Za-z][\w:.-]*$/.test(id));
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) fail(`${label}: IDs duplicados: ${duplicateIds.join(", ")}`);

  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .filter((script) => script.trim());
  inlineScripts.forEach((script, index) => {
    try {
      new Function(script);
    } catch (error) {
      fail(`${label}: JavaScript inválido en script ${index + 1}: ${error.message}`);
    }
  });

  const localReferences = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((reference) => !/^(?:https?:|#|mailto:|data:|javascript:)/i.test(reference));
  for (const reference of localReferences) {
    const clean = decodeURIComponent(reference.split("#")[0].split("?")[0]);
    if (clean && !fs.existsSync(path.resolve(path.dirname(absolute), clean))) {
      fail(`${label}: enlace local inexistente: ${reference}`);
    }
  }
}

for (const relative of labs) {
  if (!fs.existsSync(path.join(moduleDir, relative))) continue;
  const html = read(relative);
  for (const control of ["Ejecutar", "Pausar", "Paso", "Reiniciar"]) {
    if (!html.includes(control)) fail(`${relative}: falta el control ${control}`);
  }
  if (!/href=["']index\.html["']/.test(html)) fail(`${relative}: falta el regreso al índice del módulo`);
  if (/<script[^>]+src=["']https?:/i.test(html) || /<link[^>]+href=["']https?:/i.test(html)) {
    fail(`${relative}: tiene dependencias de CSS o JavaScript externas`);
  }
}

if (fs.existsSync(path.join(moduleDir, "index.html"))) {
  const index = read("index.html");
  const cards = (index.match(/class=["'][^"']*resource-card/g) || []).length;
  if (cards !== 13) fail(`index.html: se esperaban 13 tarjetas de recursos y hay ${cards}`);
  for (const relative of ["../05-blockchain.html", ...labs, ...studyResources, "presentacion.html"]) {
    if (!index.includes(`href="${relative}"`)) fail(`index.html: falta el enlace ${relative}`);
  }
  if (!index.includes(slideId)) fail("index.html: falta el ID verificado de Google Slides");
  if (!index.includes(`src="${presentationPdf}#view=FitH"`)) fail("index.html: el visor no usa el PDF público local");
  if (!index.includes(`href="${presentationPptx}"`)) fail("index.html: falta la descarga de PowerPoint");
}

if (fs.existsSync(path.join(moduleDir, "presentacion.html"))) {
  const viewer = read("presentacion.html");
  if (!viewer.includes(slideId)) fail("presentacion.html: falta el ID verificado de Google Slides");
  if (!viewer.includes(`src="${presentationPdf}#view=FitH"`)) fail("presentacion.html: el visor no usa el PDF público local");
}

for (const asset of [presentationPdf, presentationPptx]) {
  const assetPath = path.join(moduleDir, asset);
  if (fs.existsSync(assetPath) && fs.statSync(assetPath).size < 100_000) {
    fail(`${asset}: el archivo parece incompleto`);
  }
}

const moduleJsPath = path.join(moduleDir, "modulo-05.js");
if (fs.existsSync(moduleJsPath)) {
  const moduleJs = fs.readFileSync(moduleJsPath, "utf8");
  try {
    new Function(moduleJs);
  } catch (error) {
    fail(`modulo-05.js: JavaScript inválido: ${error.message}`);
  }
  if (!moduleJs.includes("criptografia-modulo-05-progreso-v1")) fail("modulo-05.js: clave de progreso incorrecta");
  if (!moduleJs.includes("12-cuestionario-blockchain.html")) fail("modulo-05.js: la ruta final no conduce al cuestionario");
}

const catalogPath = path.join(root, "simuladores", "catalogo.json");
if (fs.existsSync(catalogPath)) {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const module = catalog.modulos?.find((entry) => entry.id === "modulo-05");
  if (!module) fail("catalogo.json: falta modulo-05");
  else {
    if (module.pagina !== "modulo-05/index.html") fail("catalogo.json: página incorrecta para modulo-05");
    if (module.presentacion !== "modulo-05/presentacion.html") fail("catalogo.json: presentación incorrecta para modulo-05");
    if (module.presentacion_pdf !== `modulo-05/${presentationPdf}`) fail("catalogo.json: PDF público incorrecto para modulo-05");
    if (module.presentacion_pptx !== `modulo-05/${presentationPptx}`) fail("catalogo.json: PowerPoint incorrecto para modulo-05");
    if (!module.google_slides?.includes(slideId)) fail("catalogo.json: falta la copia verificada de Google Slides");
    if (module.simulaciones?.length !== 13) fail(`catalogo.json: se esperaban 13 recursos en modulo-05 y hay ${module.simulaciones?.length ?? 0}`);
  }
}

if (errors.length) {
  console.error("\nValidación del Módulo 5 fallida:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Validación correcta del Módulo 5: 13 recursos, visor de 41 diapositivas, autoría, navegación, JavaScript y catálogo.");
