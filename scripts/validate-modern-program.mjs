import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const moduleDir=path.join(root,'simuladores','modulo-03');
const errors=[];
const requiredPages=[
  'teoria-programa.html',
  'clasificacion-criptosistemas.html',
  'algoritmos-simetricos.html',
  'cifrado-hibrido-sesion.html',
  'ataque-contrasenas.html',
  'mapas-programa.html',
  'glosario-programa.html',
  'cuestionario-programa.html'
];
const requiredAssets=['assets/programa-moderno.css','assets/programa-moderno.js','assets/programa-glosario-data.js','assets/programa-cuestionario-data.js'];
const fail=(message)=>errors.push(message);
const read=(relative)=>{
  const file=path.join(moduleDir,relative);
  if(!fs.existsSync(file)){fail(`Falta simuladores/modulo-03/${relative}`);return '';}
  return fs.readFileSync(file,'utf8');
};

for(const file of [...requiredPages,...requiredAssets]) read(file);

for(const page of requiredPages){
  const html=read(page);
  if(!html)continue;
  const label=`simuladores/modulo-03/${page}`;
  const checks=[
    ['doctype HTML5',/<!doctype html>/i],
    ['idioma español',/<html[^>]+lang=["']es["']/i],
    ['UTF-8',/<meta[^>]+charset=["']?utf-8/i],
    ['viewport',/name=["']viewport["']/i],
    ['descripción',/name=["']description["']/i],
    ['título',/<title>[^<]{12,}<\/title>/i],
    ['contenido principal',/<main\b/i],
    ['salto al contenido',/class=["'][^"']*skip-link/i],
    ['selector multitema',/data-theme-select/i],
    ['estilos del programa',/assets\/programa-moderno\.css/i],
    ['script del programa',/assets\/programa-moderno\.js/i],
    ['atribución docente',/Material elaborado por el profesor Sergio Gevatschnaider/i]
  ];
  for(const [what,pattern] of checks)if(!pattern.test(html))fail(`${label}: falta ${what}`);
  if(/versi[oó]n\s*2(?:\.0)?/i.test(html))fail(`${label}: no debe mostrar una etiqueta de versión`);
  const ids=[...html.matchAll(/\sid=["']([^"']+)["']/gi)].map(m=>m[1]);
  const duplicates=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
  if(duplicates.length)fail(`${label}: IDs duplicados: ${duplicates.join(', ')}`);
  const refs=[...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)].map(m=>m[1]).filter(r=>!/^(?:https?:|mailto:|data:|javascript:|#)/i.test(r));
  for(const ref of refs){
    const clean=decodeURIComponent(ref.split('#')[0].split('?')[0]);
    if(!clean)continue;
    const target=path.resolve(path.dirname(path.join(moduleDir,page)),clean);
    if(!fs.existsSync(target))fail(`${label}: referencia local inexistente: ${ref}`);
  }
}

const theory=read('teoria-programa.html');
const requiredTheory=[
 'Fundamentos de la criptografía moderna','Clasificación de criptosistemas modernos',
 'Criptografía simétrica','Bits de seguridad','Cifrado por bloques y por flujo',
 'Modos de operación','Padding','Algoritmos de cifrado simétrico',
 'Criptografía asimétrica','RSA y curvas elípticas','Claves de sesión',
 'Vulneración de contraseñas'
];
for(const concept of requiredTheory)if(!theory.includes(concept))fail(`teoria-programa.html: falta ${concept}`);

const classification=read('clasificacion-criptosistemas.html');
for(const concept of ['Hash','Simétrica','Asimétrica','MAC','Firma','KDF','Matriz de propiedades'])if(!classification.includes(concept))fail(`clasificacion-criptosistemas.html: falta ${concept}`);

const symmetric=read('algoritmos-simetricos.html');
for(const concept of ['AES-GCM','ChaCha20-Poly1305','PKCS#7','ECB','CBC','CTR','GCM','XTS'])if(!symmetric.includes(concept))fail(`algoritmos-simetricos.html: falta ${concept}`);

const hybrid=read('cifrado-hibrido-sesion.html');
for(const concept of ['RSA-OAEP','RSA-PSS','ECDH','X25519','ECIES','HPKE','HKDF','AES-GCM','man-in-the-middle'])if(!hybrid.includes(concept))fail(`cifrado-hibrido-sesion.html: falta ${concept}`);

const password=read('ataque-contrasenas.html');
for(const concept of ['ataque offline','PBKDF2','Diccionario','Máscara','PIN','contraseñas ficticias'])if(!password.toLocaleLowerCase('es').includes(concept.toLocaleLowerCase('es')))fail(`ataque-contrasenas.html: falta ${concept}`);
if(/<input[^>]+type=["']password/i.test(password))fail('ataque-contrasenas.html: no debe aceptar contraseñas reales');
if(!password.includes('No introduzcas contraseñas reales'))fail('ataque-contrasenas.html: falta advertencia de seguridad');

const script=read('assets/programa-moderno.js');
try{new Function(script);}catch(error){fail(`programa-moderno.js: error de sintaxis: ${error.message}`);}
for(const concept of ['THEMES','pbkdf2Hex','PBKDF2','TERMS','QUESTIONS','initPasswordAttack','initQuiz'])if(!script.includes(concept))fail(`programa-moderno.js: falta ${concept}`);
if(/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/.test(script))fail('programa-moderno.js: no debe transmitir datos');
const glossaryData=read('assets/programa-glosario-data.js');
const questionData=read('assets/programa-cuestionario-data.js');
const termsMatch=glossaryData.match(/window\.ModernTerms\s*=\s*(\[[\s\S]*\]);/);
const questionsMatch=questionData.match(/window\.ModernQuestions\s*=\s*(\[[\s\S]*\]);/);
let termCount=0,questionCount=0;
try{termCount=JSON.parse(termsMatch?.[1]||'[]').length;}catch(error){fail(`Glosario: JSON inválido: ${error.message}`);}
try{questionCount=JSON.parse(questionsMatch?.[1]||'[]').length;}catch(error){fail(`Cuestionario: JSON inválido: ${error.message}`);}
if(termCount<85)fail(`Glosario: se esperaban al menos 85 términos y se detectaron ${termCount}`);
if(questionCount<40)fail(`Cuestionario: se esperaban al menos 40 preguntas y se detectaron ${questionCount}`);

const catalogPath=path.join(root,'simuladores','catalogo.json');
try{
  const catalog=JSON.parse(fs.readFileSync(catalogPath,'utf8'));
  const module=catalog.modulos?.find(item=>item.id==='modulo-03');
  for(const page of requiredPages){
    const file=`modulo-03/${page}`;
    if(!module?.simulaciones?.some(item=>item.archivo===file&&item.estado==='disponible'))fail(`catalogo.json: no registra ${file}`);
  }
}catch(error){fail(`catalogo.json: ${error.message}`);}

const index=fs.readFileSync(path.join(moduleDir,'index.html'),'utf8');
for(const page of requiredPages)if(!index.includes(page))fail(`index.html: no enlaza ${page}`);
const docs=fs.readFileSync(path.join(root,'docs','criptografia','03-criptografia-moderna.md'),'utf8');
for(const heading of ['## 1. Fundamentos','## 12. Laboratorio: vulnerar contraseña'])if(!docs.includes(heading))fail(`03-criptografia-moderna.md: falta ${heading}`);

if(errors.length){
  console.error('\nValidación de la ampliación del programa fallida:\n');
  errors.forEach(error=>console.error(`- ${error}`));
  process.exit(1);
}
console.log('Validación correcta: 12 puntos teóricos, 4 simulaciones nuevas, mapas, 85+ términos, 40+ preguntas y selector multitema.');
