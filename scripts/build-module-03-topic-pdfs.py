"""Generate one polished PDF dossier for every topic in Module 3."""

from __future__ import annotations

import hashlib
import importlib.util
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, PageBreak, Paragraph, Spacer
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "criptografia" / "03-criptografia-moderna.md"
OUTPUT_DIR = ROOT / "docs" / "criptografia" / "pdf" / "modulo-03"

spec = importlib.util.spec_from_file_location("module03_pdf", ROOT / "scripts" / "build-module-03-pdf.py")
pdf = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(pdf)


TOPICS = [
    {
        "number": 1,
        "slug": "01-fundamentos",
        "title": "Fundamentos de criptografía moderna",
        "section": 1,
        "focus": "De una intuición de secreto a una afirmación verificable sobre adversarios, recursos y supuestos.",
        "objectives": [
            "formular una propiedad de seguridad y una condición de victoria",
            "distinguir secreto perfecto de seguridad computacional",
            "aplicar Kerckhoffs y reconocer seguridad por oscuridad",
        ],
        "advanced": """
La práctica profesional no pregunta solamente si un algoritmo parece complejo. Pregunta qué experimento podría ejecutar un adversario, qué información recibe, qué consultas puede realizar y qué ventaja obtiene frente al azar. Las nociones IND-CPA, IND-CCA y EUF-CMA formalizan objetivos distintos; ninguna etiqueta sustituye el análisis de la construcción y del protocolo.

El supuesto criptográfico debe separarse del supuesto operativo. Una reducción puede apoyarse en un problema matemático difícil y aun así el sistema fallar por aleatoriedad predecible, exposición de claves, metadatos, canales laterales o errores distinguibles. La afirmación completa une modelo, parámetros, implementación y ciclo de vida.

| Pregunta | Evidencia esperada | Señal de riesgo |
|---|---|---|
| ¿Qué se protege? | Propiedad definida | "Todo está seguro" |
| ¿Frente a quién? | Capacidades y recursos | Adversario implícito |
| ¿Durante cuánto? | Horizonte y período de clave | Seguridad atemporal |
| ¿Bajo qué supuesto? | Problema y operación | Algoritmo secreto |
""",
        "case": "Un equipo afirma que un formato propietario es seguro porque nadie conoce su codificación. Reescriba la afirmación suponiendo que el diseño es público y determine qué secretos, propiedades y pruebas siguen siendo necesarios.",
        "pitfalls": ["confundir complejidad visual con seguridad", "omitir el modelo de amenaza", "tratar una demostración matemática como garantía de implementación"],
        "questions": ["¿Qué cambia entre IND-CPA e IND-CCA?", "¿Por qué el principio de Kerckhoffs facilita una evaluación independiente?", "¿Qué recursos del adversario deben medirse?"],
        "refs": ["NIST SP 800-57 Part 1 Rev. 5 - https://doi.org/10.6028/NIST.SP.800-57pt1r5", "Katz y Lindell, Introduction to Modern Cryptography"],
    },
    {
        "number": 2,
        "slug": "02-clasificacion-criptosistemas",
        "title": "Clasificación de criptosistemas modernos",
        "section": 2,
        "focus": "Clasificar por modelo de claves, propiedad y capa evita elegir una primitiva correcta para el problema equivocado.",
        "objectives": ["separar primitiva, esquema, protocolo y sistema", "distinguir cifrado, hash, MAC, firma, KDF y KEM", "justificar una composición híbrida"],
        "advanced": """
Una taxonomía útil tiene al menos tres ejes. El primero es el modelo de claves: sin clave, secreto compartido o par pública/privada. El segundo es la propiedad: confidencialidad, autenticidad, integridad, derivación o establecimiento de secretos. El tercero es la capa: una primitiva se integra en un esquema, el esquema en un protocolo y el protocolo en un sistema operado.

RSA-OAEP transporta material elegido por el emisor; ECDH/X25519 acuerda material a partir de contribuciones; un KEM encapsula un secreto mediante una interfaz específica. Agruparlos como si fueran idénticos oculta diferencias de autenticación, secreto hacia adelante y manejo de errores.

| Elemento | Clasificación | Garantía que no aporta por sí solo |
|---|---|---|
| SHA-256 | Hash sin clave | Autenticidad frente a atacante activo |
| HMAC | MAC simétrico | Verificación pública |
| RSA-PSS | Firma | Confidencialidad |
| HKDF | KDF | Entropía para contraseñas débiles |
""",
        "case": "Clasifique una aplicación que usa X25519, HKDF y ChaCha20-Poly1305. Para cada componente indique entrada, salida, propiedad y dependencia de autenticación.",
        "pitfalls": ["llamar cifrado a toda operación criptográfica", "confundir firma con MAC", "presentar un hash público como autenticación"],
        "questions": ["¿Por qué AES y AES-GCM pertenecen a capas distintas?", "¿Qué diferencia hay entre KDF de contraseña y HKDF?", "¿Dónde se establece la identidad de una clave pública?"],
        "refs": ["RFC 9180: Hybrid Public Key Encryption - https://www.rfc-editor.org/rfc/rfc9180", "RFC 5869: HKDF - https://www.rfc-editor.org/rfc/rfc5869"],
    },
    {
        "number": 3,
        "slug": "03-criptografia-simetrica",
        "title": "Criptografía simétrica",
        "section": 3,
        "focus": "La velocidad del cifrado simétrico solo se convierte en seguridad cuando la clave y los nonces se gestionan correctamente.",
        "objectives": ["explicar el modelo de secreto compartido", "diseñar el ciclo de vida de una clave", "elegir AEAD para datos voluminosos"],
        "advanced": """
La criptografía simétrica domina la protección de datos por su eficiencia, pero desplaza el problema hacia la custodia del secreto. Un diseño debe definir generación con CSPRNG, distribución autenticada, almacenamiento, identificadores, separación por propósito, rotación, revocación, respaldo y destrucción.

La clave no debe reutilizarse entre construcciones con semánticas distintas. Una KDF con etiquetas de contexto permite derivar subclaves para cada dirección, función o versión. El nonce puede ser público, pero su política debe sobrevivir reinicios, concurrencia y múltiples emisores.

| Control | Objetivo | Evidencia auditable |
|---|---|---|
| CSPRNG | Clave impredecible | API y fuente documentadas |
| Separación | Evitar uso cruzado | Etiquetas de KDF |
| Rotación | Limitar exposición | Período y versión de clave |
| Destrucción | Reducir recuperación | Procedimiento y alcance |
""",
        "case": "Diseñe la protección de copias de seguridad con una clave maestra en un gestor, subclaves por archivo, AEAD y metadatos autenticados. Indique qué información puede permanecer pública.",
        "pitfalls": ["usar una contraseña directamente como clave", "registrar secretos o texto claro", "reutilizar clave y nonce"],
        "questions": ["¿Qué aporta la separación por propósito?", "¿Por qué rotar no corrige una filtración previa?", "¿Qué metadatos conviene autenticar como AAD?"],
        "refs": ["NIST SP 800-57 Part 1 Rev. 5 - https://doi.org/10.6028/NIST.SP.800-57pt1r5", "OWASP Cryptographic Storage Cheat Sheet"],
    },
    {
        "number": 4,
        "slug": "04-bits-de-seguridad",
        "title": "Bits de seguridad",
        "section": 4,
        "focus": "Los bits de seguridad aproximan el costo del mejor ataque conocido, no la longitud visible de un parámetro.",
        "objectives": ["interpretar 2^k y costo medio", "comparar seguridad de claves, hashes y contraseñas", "incorporar horizonte y transición"],
        "advanced": """
Para búsqueda exhaustiva ideal, k bits implican 2^k candidatos y aproximadamente 2^(k-1) pruebas en promedio. En hashes, la resistencia a colisiones de una salida de n bits se aproxima a 2^(n/2) por el efecto cumpleaños, mientras preimagen se aproxima a 2^n bajo el modelo ideal.

Los tamaños nominales no son comparables entre familias: RSA-3072, una curva de 256 bits y AES-128 pueden perseguir un orden clásico semejante mediante supuestos y ataques diferentes. Las contraseñas dependen de distribución humana, no del ancho de la salida de la KDF.

Grover ofrece una aceleración cuadrática idealizada para búsqueda no estructurada; no equivale a dividir mecánicamente toda métrica del sistema. Shor cambia cualitativamente RSA, DH y ECC. El inventario y la vida útil del dato deben preceder la migración.
""",
        "case": "Compare un PIN de seis dígitos derivado a 256 bits, AES-128 y un hash de 256 bits frente a preimagen y colisión. Explique por qué los números visibles no son una medida común.",
        "pitfalls": ["igualar longitud con entropía", "ignorar ataques estructurales", "presentar 112 bits como recomendación eterna"],
        "questions": ["¿Por qué colisión y preimagen tienen costos distintos?", "¿Qué significa seguridad efectiva?", "¿Cómo cambia la decisión si el dato debe permanecer secreto veinte años?"],
        "refs": ["NIST SP 800-57 Part 1 Rev. 5 - https://doi.org/10.6028/NIST.SP.800-57pt1r5", "NIST SP 800-131A Rev. 2 - https://doi.org/10.6028/NIST.SP.800-131Ar2"],
    },
    {
        "number": 5,
        "slug": "05-cifrado-bloque-y-flujo",
        "title": "Cifrado por bloque y por flujo",
        "section": 5,
        "focus": "Bloque y flujo describen interfaces internas distintas; la seguridad real depende de la construcción que las usa.",
        "objectives": ["distinguir bloque fijo y keystream", "explicar XOR y reutilización", "relacionar AES-CTR y ChaCha20"],
        "advanced": """
Un cifrador por bloques es una permutación con clave sobre bloques fijos. AES transforma 128 bits cada vez; un modo define cómo proteger mensajes arbitrarios. Un cifrador de flujo produce bytes pseudoaleatorios que se combinan con el mensaje por XOR.

CTR convierte un cifrador por bloques en una fuente de flujo al cifrar valores de contador. ChaCha20 genera el flujo mediante operaciones ARX. En ambos casos, repetir el estado de generación repite la máscara y produce C1 XOR C2 = M1 XOR M2.

La confidencialidad de flujo no detecta alteraciones: un cambio en el ciphertext provoca un cambio controlable en el texto recuperado. Por eso se emplea AEAD o una composición Encrypt-then-MAC con claves separadas.
""",
        "case": "Analice dos paquetes cifrados con el mismo contador CTR. Identifique la igualdad observable, el papel de formatos conocidos y por qué cambiar solamente el IV después del incidente no repara los datos expuestos.",
        "pitfalls": ["tratar AES como modo", "reutilizar contador", "confundir descifrado correcto con autenticidad"],
        "questions": ["¿Qué convierte AES en flujo?", "¿Por qué XOR cancela el keystream repetido?", "¿Qué agrega un tag?"],
        "refs": ["NIST SP 800-38A - https://doi.org/10.6028/NIST.SP.800-38A", "RFC 8439 - https://www.rfc-editor.org/rfc/rfc8439"],
    },
    {
        "number": 6,
        "slug": "06-modos-de-operacion",
        "title": "Modos de operación",
        "section": 6,
        "focus": "El modo determina cómo una primitiva protege mensajes, qué exige del nonce y si aporta autenticidad.",
        "objectives": ["comparar ECB, CBC, CTR, GCM y XTS", "elegir AEAD", "diseñar nonce, AAD y tratamiento del tag"],
        "advanced": """
ECB filtra igualdad de bloques y no debe utilizarse para mensajes. CBC y CTR aportan confidencialidad bajo condiciones precisas, pero no autenticidad. GCM combina CTR con autenticación polinómica; XTS protege sectores y no reemplaza una interfaz AEAD general.

El nonce de GCM debe ser único bajo una clave. La AAD vincula metadatos visibles, como versión, dirección, identificador de sesión y tipo de mensaje. El receptor debe rechazar antes de usar cualquier texto cuando el tag falla.

| Construcción | Padding | Autenticidad | Uso típico |
|---|---|---|---|
| CBC | Sí | Requiere MAC separado | Compatibilidad controlada |
| CTR | No | Requiere MAC separado | Flujo con contador |
| GCM | No | Sí, AEAD | Datos y protocolos |
| XTS | No tradicional | No general | Sectores de disco |
""",
        "case": "Defina un formato de paquete AES-GCM con versión, identificador de clave, salt opcional, nonce, AAD, ciphertext y tag. Explique qué campos se autentican y cuáles deben ser únicos.",
        "pitfalls": ["usar ECB", "procesar texto antes de verificar el tag", "generar nonces sin considerar reinicios"],
        "questions": ["¿Por qué XTS no sustituye GCM?", "¿Qué diferencia hay entre AAD y ciphertext?", "¿Qué ocurre al repetir nonce en GCM?"],
        "refs": ["NIST SP 800-38A - https://doi.org/10.6028/NIST.SP.800-38A", "NIST SP 800-38D - https://doi.org/10.6028/NIST.SP.800-38D"],
    },
    {
        "number": 7,
        "slug": "07-padding",
        "title": "Padding criptográfico",
        "section": 7,
        "focus": "El relleno resuelve alineación; no aporta autenticidad y puede convertirse en un oráculo si el error es observable.",
        "objectives": ["aplicar PKCS#7", "explicar el bloque completo de padding", "analizar y mitigar padding oracles"],
        "advanced": """
PKCS#7 agrega n bytes con valor n. Para un bloque de 16 bytes, una entrada de 11 bytes recibe cinco bytes 05. Una entrada ya alineada recibe dieciséis bytes 10; sin ese bloque no sería posible distinguir datos terminados en un valor parecido al padding.

Un padding oracle aparece cuando el atacante puede distinguir si el relleno recuperado es válido. Mediante ciphertexts adaptativos, esa señal permite inferir texto sin conocer la clave. El problema no es PKCS#7 aislado, sino una composición sin autenticación y una interfaz que filtra estados internos.

La defensa preferida es AEAD. En compatibilidad heredada deben autenticarse los datos antes de procesarlos, usar claves separadas, errores uniformes y una implementación analizada frente a diferencias temporales.
""",
        "case": "Una API devuelve 400 para padding inválido y 401 para MAC inválido. Modele el oráculo, describa la información filtrada y rediseñe el orden de verificación y la respuesta.",
        "pitfalls": ["creer que padding cifra", "distinguir errores internos", "desrellenar antes de autenticar"],
        "questions": ["¿Por qué se agrega un bloque completo cuando la entrada ya está alineada?", "¿Qué necesita observar el atacante?", "¿Por qué AEAD reduce esta clase de errores?"],
        "refs": ["NIST SP 800-38A - https://doi.org/10.6028/NIST.SP.800-38A", "Vaudenay, Security Flaws Induced by CBC Padding"],
    },
    {
        "number": 8,
        "slug": "08-algoritmos-simetricos",
        "title": "Algoritmos de cifrado simétrico",
        "section": 8,
        "focus": "AES y ChaCha20 son opciones modernas cuando se integran en construcciones autenticadas y con parámetros correctos.",
        "objectives": ["comparar AES y ChaCha20", "seleccionar construcción según entorno", "justificar el retiro de DES y TDEA"],
        "advanced": """
AES usa una estructura de sustitución y permutación sobre bloques de 128 bits y admite claves de 128, 192 y 256 bits. ChaCha20 es un cifrador de flujo ARX con clave de 256 bits. La comparación no se reduce a longitud de clave: importan plataforma, aceleración, biblioteca, protocolo y resistencia de implementación.

Para datos generales se prefieren AES-GCM o ChaCha20-Poly1305. AES-XTS responde a almacenamiento por sectores y no autentica un mensaje general. DES es inseguro por su clave efectiva de 56 bits. TDEA/3DES no debe proteger datos nuevos; su presencia se limita a descifrado y migración heredada.

| Entorno | Opción | Condición |
|---|---|---|
| CPU con AES acelerado | AES-GCM | Nonce único y tag verificado |
| Software general | ChaCha20-Poly1305 | Nonce único por clave |
| Disco por sectores | AES-XTS | Integridad por otra capa |
| Legado TDEA | Migrar | No crear protección nueva |
""",
        "case": "Prepare una matriz de decisión para una aplicación móvil, un servidor con AES-NI y un volumen de disco. Justifique algoritmo, construcción, nonce y límites.",
        "pitfalls": ["decir solamente AES", "comparar por longitud nominal", "mantener 3DES como opción de protección nueva"],
        "questions": ["¿Qué diferencia estructural hay entre AES y ChaCha20?", "¿Cuándo XTS es apropiado?", "¿Qué controles son comunes a ambos AEAD?"],
        "refs": ["FIPS 197 - https://doi.org/10.6028/NIST.FIPS.197-upd1", "RFC 8439 - https://www.rfc-editor.org/rfc/rfc8439", "NIST SP 800-131A Rev. 2 - https://doi.org/10.6028/NIST.SP.800-131Ar2"],
    },
    {
        "number": 9,
        "slug": "09-criptografia-asimetrica",
        "title": "Criptografía asimétrica",
        "section": 9,
        "focus": "La clave pública facilita establecimiento y firmas, pero necesita identidad, validación y composición híbrida.",
        "objectives": ["explicar el par pública/privada", "distinguir confidencialidad y firma", "analizar autenticación de claves públicas"],
        "advanced": """
La publicación de una clave no demuestra a quién pertenece. Certificados, huellas verificadas, claves precompartidas, registros o firmas dentro de un protocolo establecen la vinculación de identidad. Sin ese paso, un acuerdo matemáticamente correcto puede sufrir MITM.

La asimétrica protege material pequeño, establece secretos o produce firmas. Los datos voluminosos se cifran con una clave simétrica de sesión. Esta arquitectura híbrida reduce costo, simplifica límites de tamaño y permite separar identidad, establecimiento y datos.

La validación incluye algoritmo, parámetros, uso autorizado, vigencia, revocación y formato. También debe contemplar canales laterales, errores uniformes y agilidad para migrar algoritmos.
""",
        "case": "Analice una aplicación que descarga una clave pública desde el mismo canal no autenticado que intenta proteger. Modele MITM y proponga dos raíces de confianza.",
        "pitfalls": ["cifrar archivos completos con RSA", "suponer que pública significa auténtica", "usar la misma clave para cifrado y firma sin política"],
        "questions": ["¿Qué resuelve y qué no resuelve una clave pública?", "¿Por qué se usa cifrado híbrido?", "¿Qué verifica un certificado?"],
        "refs": ["RFC 5280: Internet X.509 PKI Certificate Profile - https://www.rfc-editor.org/rfc/rfc5280", "NIST SP 800-57 Part 1 Rev. 5 - https://doi.org/10.6028/NIST.SP.800-57pt1r5"],
    },
    {
        "number": 10,
        "slug": "10-rsa-y-curvas-elipticas",
        "title": "RSA y curvas elípticas",
        "section": 10,
        "focus": "RSA y EC se apoyan en problemas diferentes y deben utilizarse mediante esquemas definidos, no operaciones de libro.",
        "objectives": ["distinguir RSA-OAEP y RSA-PSS", "separar ECDH/X25519 de ECDSA/EdDSA", "comparar transporte, acuerdo y KEM"],
        "advanced": """
RSA-OAEP cifra material pequeño o transporta una clave aleatoria al receptor; RSA-PSS firma. Textbook RSA es determinista y carece de las transformaciones necesarias. La seguridad operativa requiere tamaño de módulo apropiado, validación, protección de privada y resistencia a canales laterales.

En curvas elípticas, ECDH/X25519 acuerda secretos y ECDSA/EdDSA firma. ECIES describe una familia híbrida. HPKE define KEM, KDF y AEAD; no debe resumirse como una curva que cifra archivos.

Un acuerdo efímero autenticado puede aportar secreto hacia adelante cuando se destruyen los secretos efímeros. El transporte RSA-OAEP hacia una clave privada estática no aporta esa propiedad por sí mismo.
""",
        "case": "Compare dos diseños: RSA-OAEP con pública estática y X25519 efímero autenticado. Evalúe identidad, contribución de las partes, exposición histórica y tratamiento del secreto resultante.",
        "pitfalls": ["usar RSA de libro", "confundir ECDH con firma", "atribuir secreto hacia adelante a RSA estático"],
        "questions": ["¿Qué esquema RSA corresponde a firma?", "¿Qué produce ECDH?", "¿Por qué los bits de RSA y EC no se comparan directamente?"],
        "refs": ["RFC 8017: PKCS #1 v2.2 - https://www.rfc-editor.org/rfc/rfc8017", "RFC 7748: Elliptic Curves for Security - https://www.rfc-editor.org/rfc/rfc7748", "RFC 9180 - https://www.rfc-editor.org/rfc/rfc9180"],
    },
    {
        "number": 11,
        "slug": "11-claves-de-sesion",
        "title": "Claves de sesión",
        "section": 11,
        "focus": "Una sesión segura une autenticación, establecimiento, contexto, separación, AEAD, rotación y destrucción.",
        "objectives": ["construir una sesión híbrida", "usar HKDF con contexto", "definir condiciones de secreto hacia adelante"],
        "advanced": """
El secreto compartido bruto no debe utilizarse directamente como todas las claves. HKDF extrae y expande material de alta entropía; sus etiquetas deben vincular versión, roles, transcript, dirección y propósito. Emisor y receptor derivan claves distintas para evitar reflexión y uso cruzado.

Los números de secuencia pueden participar en nonces y control de repetición. El protocolo debe especificar límites de mensajes, renovación, cierre, errores y eliminación. Una clave de sesión corta limita exposición, pero no garantiza por sí sola secreto hacia adelante.

| Etapa | Control | Falla evitada |
|---|---|---|
| Autenticación | Certificado, firma, PSK o huella | MITM |
| Establecimiento | Transporte, acuerdo o KEM | Secreto compartido incorrecto |
| Derivación | HKDF y contexto | Uso cruzado |
| Datos | AEAD y secuencia | Alteración y repetición |
""",
        "case": "Diseñe una sesión bidireccional con X25519, transcript firmado, HKDF y ChaCha20-Poly1305. Defina etiquetas, claves por dirección, nonces, rotación y destrucción.",
        "pitfalls": ["usar el secreto ECDH directamente", "derivar ambos sentidos con la misma etiqueta", "guardar secretos efímeros indefinidamente"],
        "questions": ["¿Qué debe entrar al contexto de HKDF?", "¿Qué condiciones dan secreto hacia adelante?", "¿Cómo se evita repetir nonces entre emisores?"],
        "refs": ["RFC 5869: HKDF - https://www.rfc-editor.org/rfc/rfc5869", "RFC 8446: TLS 1.3 - https://www.rfc-editor.org/rfc/rfc8446"],
    },
    {
        "number": 12,
        "slug": "12-laboratorio-contrasenas",
        "title": "Laboratorio: vulnerar contraseñas",
        "section": 12,
        "focus": "El ataque offline revela la diferencia entre entropía humana, salt pública y costo de una KDF.",
        "objectives": ["modelar un ataque offline", "medir diccionario, máscara y fuerza bruta acotada", "calibrar una KDF de contraseña"],
        "advanced": """
Cuando un atacante obtiene salt, parámetros y verificador puede probar candidatos sin bloqueos del servidor. La salt evita precálculo compartido y verificadores iguales entre usuarios; no impide probar cada candidato. Una KDF costosa multiplica tiempo y memoria por intento, pero no crea entropía.

Argon2id permite ajustar memoria, iteraciones y paralelismo. RFC 9106 ofrece perfiles de referencia; la aplicación debe medir su plataforma, contemplar concurrencia, almacenar parámetros y admitir actualización. PBKDF2 puede ser necesario por compatibilidad, pero su costo es principalmente computacional.

El laboratorio seguro utiliza identidades y contraseñas ficticias, un espacio acotado, ejecución local y ausencia de exportación. No se prueba contra cuentas ni datos reales.
""",
        "case": "Compare una contraseña humana predecible bajo un hash rápido y bajo Argon2id. Analice tasa de intentos, memoria, salt, pepper opcional, MFA y estrategia de actualización al iniciar sesión.",
        "pitfalls": ["atacar credenciales reales", "usar SHA-256 directo para almacenamiento", "copiar parámetros sin medir la plataforma"],
        "questions": ["¿Por qué la salt no es secreta?", "¿Qué diferencia hay entre ataque online y offline?", "¿Cómo se migran parámetros sin conocer la contraseña?"],
        "refs": ["RFC 9106: Argon2 - https://www.rfc-editor.org/rfc/rfc9106", "NIST SP 800-63B-4 - https://doi.org/10.6028/NIST.SP.800-63B-4"],
    },
    {
        "number": 13,
        "slug": "13-chacha20",
        "title": "ChaCha20",
        "subsection": "ChaCha20",
        "focus": "ChaCha20 transforma un estado de 16 palabras mediante ARX y debe combinarse con autenticación y nonces únicos.",
        "objectives": ["reconstruir el estado IETF 4 x 4", "verificar quarter round y bloque RFC 8439", "demostrar el riesgo de reutilizar nonce"],
        "advanced": """
El estado contiene cuatro constantes, ocho palabras de clave, un contador de 32 bits y tres palabras de nonce. Cada quarter round usa sumas módulo 2^32, XOR y rotaciones 16, 12, 8 y 7. Cuatro operaciones por columnas y cuatro por diagonales forman una ronda doble; diez rondas dobles producen ChaCha20.

El estado transformado se suma al inicial y se serializa little-endian para obtener 64 bytes. El contador cambia por bloque y no puede desbordarse. Repetir clave, nonce y contador repite el keystream; entonces C1 XOR C2 = M1 XOR M2.

ChaCha20 aislado es maleable. ChaCha20-Poly1305 autentica AAD, ciphertext y longitudes con un formato preciso. El receptor verifica el tag antes de entregar texto claro. La implementación didáctica del módulo se valida con los vectores de RFC 8439, pero producción debe usar una biblioteca mantenida.

| Componente | Tamaño IETF | Función |
|---|---:|---|
| Clave | 256 bits | Secreto |
| Nonce | 96 bits | Único por clave |
| Contador | 32 bits | Selecciona bloque |
| Salida | 64 bytes | Keystream por bloque |
""",
        "case": "Ejecute el vector RFC del laboratorio, cambie un bit de clave y compare la salida. Luego reutilice nonce con dos mensajes y explique qué información se cancela y qué no se recupera automáticamente.",
        "pitfalls": ["repetir nonce", "usar ChaCha20 sin autenticación", "ignorar el desbordamiento del contador"],
        "questions": ["¿Qué significa ARX?", "¿Por qué se suma el estado inicial al final?", "¿Qué propiedad agrega Poly1305?"],
        "refs": ["RFC 8439: ChaCha20 and Poly1305 - https://www.rfc-editor.org/rfc/rfc8439", "RFC 7539 historical predecessor - https://www.rfc-editor.org/rfc/rfc7539"],
    },
]


def clean_dashes(text: str) -> str:
    return text.translate({ord(char): "-" for char in "‐‑‒–—―"}).replace("→", "->")


def extract_numbered_section(source: str, number: int) -> str:
    pattern = rf"^## {number}\. .+?$([\s\S]*?)(?=^## \d+\.|\Z)"
    match = re.search(pattern, source, flags=re.MULTILINE)
    if not match:
        raise ValueError(f"No se encontró la sección {number}")
    return match.group(1).strip()


def extract_subsection(source: str, name: str) -> str:
    pattern = rf"^### {re.escape(name)}\s*$([\s\S]*?)(?=^### |^## |\Z)"
    match = re.search(pattern, source, flags=re.MULTILINE)
    if not match:
        raise ValueError(f"No se encontró la subsección {name}")
    return match.group(1).strip()


def topic_markdown(topic: dict, source: str) -> str:
    core = extract_subsection(source, topic["subsection"]) if "subsection" in topic else extract_numbered_section(source, topic["section"])
    objectives = "\n".join(f"{index}. {item}." for index, item in enumerate(topic["objectives"], 1))
    pitfalls = "\n".join(f"- {item}." for item in topic["pitfalls"])
    questions = "\n".join(f"{index}. {item}" for index, item in enumerate(topic["questions"], 1))
    refs = "\n".join(f"{index}. {item}" for index, item in enumerate(topic["refs"], 1))
    checklist = "\n".join([
        "- Puedo definir la propiedad y el adversario.",
        "- Puedo explicar parámetros, límites y supuestos.",
        "- Puedo detectar al menos tres configuraciones inseguras.",
        "- Puedo justificar una decisión de arquitectura.",
        "- Puedo relacionar el tema con una norma o especificación primaria.",
    ])
    return clean_dashes(f"""
## Propósito

{topic['focus']}

## Resultados de aprendizaje

{objectives}

## Núcleo teórico

{core}

## Profundización y criterio profesional

{topic['advanced'].strip()}

## Caso de análisis

{topic['case']}

### Entrega esperada

Documente activos, actores, propiedad, parámetros, flujo, condición de fallo y decisión recomendada. Separe siempre la garantía criptográfica de la garantía operativa.

## Riesgos y errores frecuentes

{pitfalls}

## Actividades de dominio

{questions}

## Lista de comprobación

{checklist}

## Referencias seleccionadas

{refs}
""")


def topic_story(topic: dict, markdown: str, digest: str):
    styles = pdf.STYLES
    story = [
        Spacer(1, 31 * mm),
        Paragraph(f"MÓDULO 3 · DOSSIER {topic['number']:02d}", styles["cover_kicker"]),
        Paragraph(pdf.inline_markup(topic["title"]), styles["cover_title"]),
        HRFlowable(width="52%", thickness=2.2, color=pdf.TEAL, spaceBefore=5, spaceAfter=18),
        Paragraph(pdf.inline_markup(topic["focus"]), styles["cover_subtitle"]),
        Spacer(1, 23 * mm),
        Paragraph("Material elaborado por el profesor Sergio Gevatschnaider", styles["cover_subtitle"]),
        Spacer(1, 14 * mm),
        Paragraph(f"Fuente curricular verificable · SHA-256 {digest}", styles["small"]),
        PageBreak(),
        Paragraph("Contenido", styles["toc_title"]),
    ]
    toc = TableOfContents()
    toc.levelStyles = [
        pdf.ParagraphStyle("TopicTOC0", fontName=pdf.FONT_BOLD, fontSize=9.5, leading=14, leftIndent=0, textColor=pdf.NAVY, spaceBefore=3),
        pdf.ParagraphStyle("TopicTOC1", fontName=pdf.FONT, fontSize=8.5, leading=12, leftIndent=14, textColor=pdf.MUTED),
    ]
    story.extend([toc, PageBreak()])
    story.extend(pdf.markdown_story(markdown))
    return story


def build_all():
    source = SOURCE.read_text(encoding="utf-8")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    outputs = []
    for topic in TOPICS:
        markdown = topic_markdown(topic, source)
        digest = hashlib.sha256(markdown.encode("utf-8")).hexdigest()[:12]
        output = OUTPUT_DIR / f"{topic['slug']}.pdf"
        document = pdf.CourseDocument(
            str(output),
            title=f"{topic['title']} - Módulo 3",
            subject=topic["focus"],
            footer=f"Módulo 3 · {topic['title']}",
        )
        document.multiBuild(topic_story(topic, markdown, digest))
        outputs.append(output)
        print(f"PDF generado: {output}")
    print(f"Colección generada: {len(outputs)} documentos")


if __name__ == "__main__":
    build_all()
