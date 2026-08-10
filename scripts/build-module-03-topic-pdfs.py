"""Generate one polished PDF dossier for every topic in Module 3."""

from __future__ import annotations

import argparse
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
        "title": "Criptografía asimétrica integral",
        "section": 9,
        "focus": "La clave pública habilita cifrado acotado, firmas y establecimiento de secretos, pero solo un protocolo autenticado y operado correctamente convierte esas primitivas en seguridad.",
        "objectives": [
            "explicar el par pública/privada y sus supuestos matemáticos",
            "distinguir cifrado, firma, acuerdo, KEM, KDF y AEAD",
            "reconstruir RSA y ECC con ejemplos inspeccionables",
            "analizar autenticación de claves públicas, PKI y cadenas de confianza",
            "diseñar una sesión híbrida con secreto hacia adelante",
        ],
        "advanced": """
La publicación de una clave no demuestra a quién pertenece. Certificados, huellas verificadas, claves precompartidas, registros o firmas dentro de un protocolo establecen la vinculación de identidad. Sin ese paso, un acuerdo matemáticamente correcto puede sufrir MITM.

La asimétrica protege material pequeño, establece secretos o produce firmas. Los datos voluminosos se cifran con una clave simétrica de sesión. Esta arquitectura híbrida reduce costo, simplifica límites de tamaño y permite separar identidad, establecimiento y datos.

La validación incluye algoritmo, parámetros, uso autorizado, vigencia, revocación y formato. También debe contemplar canales laterales, errores uniformes y agilidad para migrar algoritmos.
""",
        "extra": """
## 1. Modelo funcional: cinco operaciones que no deben confundirse

La criptografía asimétrica no es una sola operación invertida. Un sistema moderno combina interfaces con objetivos diferentes. El cifrado de clave pública recibe una clave pública y un mensaje acotado; solo la privada correspondiente puede recuperar el mensaje. La firma recibe una clave privada y produce evidencia verificable con la pública. El acuerdo de clave recibe una clave privada local y una pública remota; ambos extremos calculan el mismo secreto, pero no lo transmiten. Un KEM encapsula un secreto y entrega un ciphertext de encapsulación. Una PKI distribuye afirmaciones firmadas sobre identidades y autorizaciones.

| Operación | Entrada sensible | Salida principal | Propiedad | Riesgo si se usa aislada |
|---|---|---|---|---|
| RSA-OAEP | Privada del receptor al descifrar | Mensaje acotado | Confidencialidad | Clave pública no autenticada |
| RSA-PSS / ECDSA / EdDSA | Privada del firmante | Firma | Autenticidad e integridad | Contexto o identidad ambiguos |
| ECDH / X25519 | Privada local | Secreto compartido | Acuerdo | MITM sin autenticación |
| KEM | Privada del receptor al desencapsular | Secreto compartido | Establecimiento | Ciphertext o identidad sin vincular |
| Certificado | Privada de la CA al emitir | Credencial verificable | Vinculación y autorización | Validación parcial de la cadena |

La clave privada debe quedar confinada al propósito autorizado. Publicar la clave pública permite verificación o establecimiento, pero no prueba quién la controla. La identidad se obtiene mediante una raíz de confianza, una huella verificada por otro canal, una clave precompartida o una firma validada dentro de un protocolo.

## 2. Fundamentos matemáticos y supuestos de dificultad

Un esquema asimétrico parte de una operación eficiente en la dirección legítima y de un problema que se considera difícil sin información secreta. En RSA, el módulo n es el producto de primos grandes. La seguridad no se resume en factorizar: depende del esquema de codificación, del tamaño, de la generación de primos, de la protección de operaciones privadas y de no filtrar errores. En ECC, los puntos forman un grupo; calcular Q = dG es eficiente, mientras recuperar d desde G y Q se relaciona con el logaritmo discreto elíptico.

El supuesto es una afirmación condicionada, no una prueba eterna. Debe registrarse junto con el nivel de seguridad, el horizonte de confidencialidad, la capacidad del adversario y la posibilidad de una computadora cuántica a gran escala. Shor afectaría de manera cualitativa a RSA, DH y ECC; por ello inventario, agilidad y migración poscuántica son partes del diseño.

No se comparan familias por la longitud visible de sus claves. Un módulo RSA, una clave EC y una clave AES expresan estructuras diferentes. Los bits de seguridad aproximan el costo del mejor ataque conocido contra la configuración completa. La selección debe seguir el perfil del protocolo y las normas aplicables, no una tabla aislada copiada sin contexto.

## 3. RSA inspeccionable: del inverso modular a la operación segura

El ejemplo educativo usa p = 61, q = 53 y e = 17. Entonces n = pq = 3233 y phi(n) = (p - 1)(q - 1) = 3120. Como mcd(17, 3120) = 1, existe d = e^(-1) mod phi(n) = 2753. Para m = 65:

- Cifrado de libro: c = m^e mod n = 2790.
- Recuperación: m = c^d mod n = 65.
- Clave pública: (n, e).
- Secreto esencial: d y los factores que permiten calcularlo.

Este vector solo demuestra la aritmética. Es inseguro porque el módulo se factoriza de inmediato, la operación es determinista y el mensaje carece de codificación resistente a ataques. En una implementación real, la exponenciación modular se realiza con algoritmos eficientes, la operación privada se protege frente a canales laterales y el descifrado no revela por sus errores qué parte de la codificación falló.

RSAES-OAEP aleatoriza y estructura el mensaje antes de la primitiva RSA. El límite de entrada para un módulo de k octetos y un hash de hLen octetos es k - 2hLen - 2. Con RSA 2048 y SHA-256, k = 256 y hLen = 32, por lo que el máximo es 190 octetos. Este límite es una razón práctica para cifrar una clave aleatoria o usar un KEM, no archivos completos.

RSASSA-PSS es una firma probabilística. La verificación reconstruye restricciones sobre el hash, la máscara y la sal. Cifrar con la privada no es una definición correcta de firma: omite codificación, dominio, formato y modelo de seguridad. OAEP y PSS tienen propósitos distintos aunque compartan la primitiva RSA.

## 4. Curvas elípticas sobre cuerpos finitos

Una curva corta de Weierstrass sobre un primo p puede escribirse como y^2 = x^3 + ax + b mod p, con discriminante no nulo. Los puntos que satisfacen la ecuación, junto con el punto al infinito, forman un grupo. La suma P + Q se define mediante pendientes modulares; duplicar P usa otra expresión para la pendiente. La multiplicación escalar dG repite sumas de forma eficiente mediante duplicar y sumar.

Para la curva didáctica y^2 = x^3 + 2x + 2 mod 17 y G = (5,1), se obtiene un grupo pequeño donde es posible enumerar puntos y seguir 2G, 3G y sucesivos múltiplos. Esa transparencia permite verificar la ley de grupo, pero destruye la seguridad: el escalar privado se recupera enumerando posibilidades. Las curvas reales usan parámetros estandarizados y órdenes suficientemente grandes.

Una implementación debe validar la clave pública y sus parámetros antes de usarla. Importar bytes no convierte automáticamente una entrada hostil en un punto autorizado. Según el formato y el protocolo pueden ser necesarias validación de pertenencia, comprobación de orden, rechazo de valores especiales, formato canónico y confirmación de clave. Las bibliotecas de alto nivel deben concentrar estas reglas.

X25519 usa una interfaz de coordenada x sobre Curve25519 diseñada para acuerdo de clave y comportamiento robusto. P-256 ECDH y X25519 no comparten formato ni deben tratarse como nombres intercambiables. ECDSA y EdDSA son firmas; ECDH y X25519 son acuerdos. La semejanza de nombres no autoriza reutilizar claves entre propósitos.

## 5. Firmas digitales: mensaje, contexto y unicidad

Una firma protege una representación exacta del mensaje. Cambiar un bit, verificar con otra clave o interpretar los mismos bytes bajo otro contexto debe provocar rechazo. La aplicación debe definir qué se firma: versión, tipo de objeto, identificador de protocolo, identidad esperada, algoritmo, clave efímera y datos relevantes. Firmar solo un campo visible puede permitir sustitución o reinterpretación.

ECDSA calcula una firma (r,s) a partir del hash del mensaje, la clave privada d y un secreto por mensaje k. Reutilizar k en dos firmas o generarlo de forma predecible puede revelar d. Una biblioteca vigente debe encargarse de la generación determinista o aleatoria conforme al perfil elegido. EdDSA emplea otra construcción y reglas de codificación; no es simplemente ECDSA sobre una curva Edwards.

RSA-PSS, ECDSA y EdDSA permiten verificación pública, pero una verificación válida solo demuestra que la clave correspondiente produjo la firma sobre esos bytes. Para atribuir la acción a una persona, servicio o rol se necesitan políticas de identidad, protección de la clave, registro, autorizaciones, marca temporal cuando corresponda y tratamiento de compromiso o revocación.

| Verificación | Pregunta respondida | Pregunta todavía abierta |
|---|---|---|
| Firma matemática | ¿Coinciden mensaje, firma y clave? | ¿A quién pertenece la clave? |
| Certificado válido | ¿Una cadena autorizada vinculó nombre y clave? | ¿La política acepta esa raíz y uso? |
| Registro de auditoría | ¿Cuándo y dónde se observó la operación? | ¿El dispositivo estaba bajo control legítimo? |

## 6. ECDH autenticado y resistencia a MITM

Alice genera a y publica A = aG. Bob genera b y publica B = bG. Alice calcula aB = abG y Bob calcula bA = abG. Un observador no debería recuperar abG a partir de G, A y B bajo el supuesto del logaritmo discreto. Sin embargo, Mallory puede reemplazar A y B, establecer un secreto con cada extremo y retransmitir datos. El acuerdo funcionará, pero con la contraparte equivocada.

La defensa vincula la clave efímera con una identidad y con la transcripción. Por ejemplo, Bob firma una estructura canónica que contiene versión, suite, roles, contexto de aplicación, identificador de sesión y su clave efímera. Alice valida la credencial de Bob, verifica la firma y solo entonces deriva claves. Si Mallory cambia la clave, la firma deja de validar. Si copia la firma a otro protocolo o rol, el contexto incluido evita la reutilización.

Autenticar una sola clave no basta si la transcripción permite downgrade o confusión de algoritmos. La suite negociada, los parámetros y las contribuciones deben quedar incluidos directa o indirectamente en el transcript hash. La confirmación explícita de clave demuestra que ambos extremos derivaron el mismo material y vieron la misma sesión.

## 7. Del secreto compartido a claves utilizables: HKDF

El resultado bruto de ECDH no debe usarse directamente como clave para todas las funciones. HKDF separa extracción y expansión. Extract recibe salt e input keying material y produce una pseudorandom key. Expand combina esa clave con información de contexto para obtener tantos octetos como requiere cada propósito.

Un diseño puede derivar claves distintas con etiquetas inequívocas:

- `modulo03/v1/alice-a-bob/aead-key`
- `modulo03/v1/bob-a-alice/aead-key`
- `modulo03/v1/alice-a-bob/nonce-base`
- `modulo03/v1/exporter`

La etiqueta evita que el mismo secreto se interprete como clave de cifrado, MAC, exportador o tráfico en ambas direcciones. El salt no reemplaza la entropía del secreto y la información de contexto no necesita ser secreta. Debe ser estable, canónica y conocida por ambos extremos. Las claves derivadas deben limitarse a los usos necesarios y eliminarse cuando termina la sesión.

## 8. Arquitectura híbrida: establecimiento, derivación y AEAD

Los datos voluminosos se protegen con AEAD porque el cifrado simétrico es eficiente y puede autenticar ciphertext y metadatos. El flujo completo es:

1. Validar identidad y parámetros de la contraparte.
2. Ejecutar acuerdo o desencapsulación.
3. Derivar claves y nonces con una KDF contextual.
4. Cifrar cada registro con AES-GCM o ChaCha20-Poly1305.
5. Autenticar como AAD versión, dirección, contador y encabezados relevantes.
6. Rechazar el registro completo si el tag falla.
7. Rotar y destruir claves según límites de sesión.

HPKE formaliza combinaciones de KEM, KDF y AEAD para cifrado híbrido de clave pública. Sus modos base y autenticados tienen garantías diferentes. Elegir una suite HPKE no reemplaza la autenticación de aplicación cuando el modo seleccionado no aporta la identidad requerida. Tampoco reemplaza la protección frente a replay, el orden de mensajes o la semántica de autorización.

Un paquete educativo puede contener suite, clave encapsulada o pública efímera, salt, nonce, AAD, ciphertext y tag. El paquete real debe usar un formato canónico, longitudes verificadas y selección de algoritmo no ambigua. Nunca debe aceptar parámetros suministrados por el atacante sin comprobar que pertenecen al perfil permitido.

## 9. Claves efímeras, sesiones y secreto hacia adelante

El secreto hacia adelante busca que el compromiso futuro de una clave de identidad de largo plazo no revele automáticamente sesiones pasadas. Una construcción típica usa ECDH efímero autenticado: las claves de identidad firman la transcripción, mientras los escalares efímeros producen el secreto de sesión y luego se eliminan.

No alcanza con llamar "de sesión" a una clave. Si una clave simétrica fue transportada bajo RSA estático y un atacante guardó el ciphertext, el compromiso posterior de la privada RSA puede permitir recuperar esa sesión. Tampoco hay secreto hacia adelante si los escalares efímeros se registran, respaldan o reutilizan. La propiedad depende de protocolo, autenticación, generación fresca, eliminación y horizonte de compromiso.

La reanudación de sesiones introduce nuevos secretos y tickets. Debe analizarse si hereda, renueva o reduce la propiedad. Los contadores, límites de registros y políticas de rekey evitan usar una clave más allá de los márgenes del AEAD. El diseño debe poder identificar qué clave protegió cada registro sin publicar secretos.

## 10. PKI X.509 y validación de cadenas

Un certificado vincula una clave pública con un sujeto y restricciones mediante la firma de un emisor. Una cadena típica contiene una entidad final, una o más CA intermedias y una raíz que el verificador ya confía por configuración local. La raíz no se vuelve confiable porque se autofirme; la autofirma prueba consistencia, mientras la confianza proviene del almacén y de la política.

Validar una cadena requiere más que verificar firmas:

- construir una ruta hasta un ancla aceptada;
- verificar firmas y codificaciones;
- comprobar vigencia en el instante pertinente;
- aplicar Basic Constraints y límites de longitud;
- aplicar Key Usage y Extended Key Usage;
- verificar el nombre o identidad esperada;
- procesar políticas y restricciones de nombre cuando correspondan;
- considerar revocación o mecanismos equivalentes según el entorno;
- rechazar algoritmos, tamaños y parámetros fuera de política.

La simulación del módulo usa objetos JSON firmados para hacer visible esta lógica, pero no pretende analizar DER, ASN.1 ni certificados X.509. La diferencia se declara porque una demostración de firmas encadenadas no cubre todas las reglas de RFC 5280.

## 11. Ataques y fallos de ingeniería

| Fallo | Consecuencia | Control principal |
|---|---|---|
| Clave pública sin autenticar | MITM | Firma, certificado, huella o PSK verificada |
| RSA sin OAEP/PSS | Determinismo, maleabilidad o forgery | Esquema estandarizado y biblioteca mantenida |
| Nonce ECDSA repetido | Recuperación de privada | Generación conforme a estándar |
| Punto o clave no validada | Subgrupos, resultados inválidos | Importación y validación estrictas |
| Error de descifrado distinguible | Oráculo adaptativo | Errores uniformes y protocolo CCA-seguro |
| Clave para varios propósitos | Ataques cruzados | Separación por KDF y política |
| Efímeras conservadas | Pérdida de secreto hacia adelante | Eliminación y no registro |
| Cadena validada parcialmente | Suplantación | Validador completo y política explícita |
| Algoritmo negociable sin transcript | Downgrade | Autenticar negociación y versión |
| Operación variable en tiempo | Canal lateral | Implementación resistente y aislamiento |

Los mensajes de error deben ser útiles para operación sin convertirse en señales criptográficas. Internamente se registra una categoría segura; externamente se evita revelar si falló padding, clave, formato o tag. Los límites de tamaño y tiempo se aplican antes de operaciones costosas para reducir denegación de servicio.

## 12. Ciclo de vida, custodia y agilidad

La clave privada de identidad suele requerir mayor protección y vida más larga que una clave efímera. Puede residir en un HSM, TPM, enclave o almacén de claves del sistema. Exportabilidad, respaldo, recuperación, rotación y destrucción deben responder a la función. Una clave de firma de CA requiere controles diferentes de una clave ECDH efímera de navegador.

El inventario debe registrar algoritmo, parámetros, biblioteca, propietario, ubicación, propósito, dependencias, fecha de expiración y datos protegidos. La agilidad no significa aceptar cualquier algoritmo anunciado: significa poder migrar dentro de una lista controlada, con negociación autenticada, telemetría y retirada verificable.

La transición poscuántica exige localizar dónde se usan RSA, DH y ECC, cuánto tiempo deben permanecer secretos los datos y qué interfaces soportan reemplazo o esquemas híbridos. FIPS 203 estandariza ML-KEM para establecimiento poscuántico, pero su integración requiere perfiles, bibliotecas y protocolos concretos. Una migración híbrida combina supuestos solo si el combiner y el protocolo preservan las propiedades esperadas.

NIST publicó SP 800-56A Rev. 3 en 2018 y anunció en enero de 2026 que la actualizará, entre otros objetivos, para alinear requisitos de curvas y contemplar implementaciones de coordenada x. Por eso el material distingue principios estables de perfiles que deben revisarse al implementar.

## 13. Procedimiento de diseño y revisión

1. Definir activos, propiedad, adversario y duración.
2. Elegir si se necesita cifrado, firma, acuerdo, KEM o varias funciones.
3. Seleccionar un protocolo y perfil interoperable, no primitivas sueltas.
4. Definir raíz de confianza y proceso de enrolamiento.
5. Autenticar negociación, roles, claves efímeras y transcript.
6. Derivar subclaves con contexto y separación de direcciones.
7. Proteger registros con AEAD y política de nonce.
8. Especificar errores, replay, rekey, límites y eliminación.
9. Usar vectores conocidos, pruebas negativas y revisión de interoperabilidad.
10. Inventariar dependencias y planificar migración.

La evidencia mínima incluye pruebas de OAEP y PSS, firmas válidas e inválidas, acuerdo coincidente, rechazo de una clave efímera sustituida, derivación contextual, rechazo de ciphertext o AAD alterados, cadena válida, cadena modificada y raíz incorrecta. La prueba positiva demuestra funcionamiento; las negativas demuestran que el sistema falla de manera segura.

## 14. Guía de lectura del laboratorio integral

El experimento RSA separa pares OAEP y PSS, muestra huellas y permite alterar entrada. El experimento ECDSA compara mensaje original, mensaje alterado y clave equivocada. El experimento ECDH firma la pública efímera de Bob, verifica el contexto, deriva con HKDF y protege el mensaje con AES-GCM. Las acciones MITM y alteración evidencian qué control produce el rechazo.

X25519 se ejecuta cuando el motor Web Crypto lo ofrece y muestra hashes truncados del secreto solo para comprobar igualdad sin exponerlo como una clave reutilizable. La cadena educativa genera raíz, intermedia y entidad final, firma estructuras canónicas y comprueba emisor, vigencia, restricciones y firmas. No reemplaza un validador X.509.

Cada ejecución usa claves nuevas y datos ficticios en memoria local. Recargar descarta el estado. El objetivo es observar contratos criptográficos, no producir material para un sistema real.
""",
        "case": "Analice una aplicación que descarga una clave pública desde el mismo canal no autenticado que intenta proteger. Modele MITM y proponga dos raíces de confianza.",
        "pitfalls": [
            "cifrar archivos completos con RSA",
            "suponer que pública significa auténtica",
            "usar la misma clave para cifrado y firma sin política",
            "usar el secreto ECDH directamente sin KDF ni contexto",
            "verificar firmas de certificados sin validar nombre, vigencia, usos y ancla",
            "atribuir secreto hacia adelante a cualquier clave de sesión",
        ],
        "questions": [
            "¿Qué resuelve y qué no resuelve una clave pública?",
            "¿Por qué se usa cifrado híbrido?",
            "¿Qué diferencia OAEP de PSS?",
            "¿Cómo evita una firma contextual la sustitución de una clave ECDH efímera?",
            "¿Qué verifica una cadena y de dónde proviene la confianza de la raíz?",
            "¿Qué condiciones hacen posible el secreto hacia adelante?",
        ],
        "refs": [
            "RFC 8017: PKCS #1 v2.2 - https://www.rfc-editor.org/rfc/rfc8017",
            "FIPS 186-5: Digital Signature Standard - https://doi.org/10.6028/NIST.FIPS.186-5",
            "NIST SP 800-56A Rev. 3: Key Establishment - https://doi.org/10.6028/NIST.SP.800-56Ar3",
            "NIST SP 800-186: Elliptic Curve Domain Parameters - https://doi.org/10.6028/NIST.SP.800-186",
            "RFC 7748: Elliptic Curves for Security - https://www.rfc-editor.org/rfc/rfc7748",
            "RFC 8032: EdDSA - https://www.rfc-editor.org/rfc/rfc8032",
            "RFC 5280: Internet X.509 PKI Certificate Profile - https://www.rfc-editor.org/rfc/rfc5280",
            "RFC 5869: HKDF - https://www.rfc-editor.org/rfc/rfc5869",
            "RFC 9180: Hybrid Public Key Encryption - https://www.rfc-editor.org/rfc/rfc9180",
            "RFC 8446: TLS 1.3 - https://www.rfc-editor.org/rfc/rfc8446",
            "FIPS 203: Module-Lattice-Based KEM - https://doi.org/10.6028/NIST.FIPS.203",
            "NIST SP 800-57 Part 1 Rev. 5: Key Management - https://doi.org/10.6028/NIST.SP.800-57pt1r5",
            "NIST SP 800-131A Rev. 2: Algorithm Transitions - https://doi.org/10.6028/NIST.SP.800-131Ar2",
            "RFC 6979: Deterministic DSA and ECDSA - https://www.rfc-editor.org/rfc/rfc6979",
            "RFC 6960: Online Certificate Status Protocol - https://www.rfc-editor.org/rfc/rfc6960",
            "RFC 8555: Automatic Certificate Management Environment - https://www.rfc-editor.org/rfc/rfc8555",
            "RFC 9162: Certificate Transparency Version 2.0 - https://www.rfc-editor.org/rfc/rfc9162",
            "NIST planning note, January 2026: update of SP 800-56A - https://csrc.nist.gov/news/2026/nist-to-revise-key-establishment-recommendations",
        ],
        "appendix": """
## Rúbrica de dominio y evidencias

| Dimensión | Dominio observable | Evidencia insuficiente |
|---|---|---|
| Propiedades | Separa cifrado, firma, acuerdo, KEM, KDF y AEAD | Llama cifrado a toda operación |
| Matemática | Reconstruye RSA pequeño y explica la ley de grupo EC | Copia resultados sin justificar inversos o puntos |
| Autenticación | Vincula identidad, efímera, roles, suite y transcript | Confía en una pública por haberla recibido |
| Sesión | Deriva subclaves contextuales y autentica registros | Usa directamente el secreto ECDH |
| PKI | Valida ruta, firma, nombre, vigencia, usos y ancla | Comprueba únicamente una firma |
| Operación | Define custodia, rotación, errores, borrado y migración | Trata el algoritmo como único control |

La demostración debe incluir pruebas negativas. Se espera rechazo al cambiar un mensaje firmado, usar otra clave pública, sustituir una efímera, modificar el contexto, alterar un ciphertext, presentar una cadena modificada o cambiar el ancla de confianza. Un resultado positivo muestra que el mecanismo funciona; un rechazo controlado muestra que falla de manera segura.

### Recursos interactivos asociados

- `simuladores/modulo-03/asimetria-teoria-completa.html`: modelo RSA y curva finita inspeccionables, doce secciones y glosario.
- `simuladores/modulo-03/asimetria-laboratorio-integral.html`: RSA-OAEP/PSS, ECDSA, ECDH autenticado, X25519 y cadena firmada.
- `simuladores/modulo-03/ruta-clase-asimetria.html`: recorrido de 100 minutos, progreso local y evaluación de salida.
- `simuladores/modulo-03/rsa-ecdh-hibrido.html`: laboratorio aplicado anterior preservado para comparación.
- `simuladores/modulo-03/cifrado-hibrido-sesion.html`: arquitectura conceptual RSA, ECC, HPKE, HKDF y AEAD.
""",
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

{topic.get('extra', '').strip()}

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

{topic.get('appendix', '').strip()}
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
        pdf.ParagraphStyle("TopicTOC0", fontName=pdf.FONT_BOLD, fontSize=8.3, leading=10.5, leftIndent=0, textColor=pdf.NAVY, spaceBefore=1),
        pdf.ParagraphStyle("TopicTOC1", fontName=pdf.FONT, fontSize=7.6, leading=9.4, leftIndent=12, textColor=pdf.MUTED),
    ]
    story.extend([toc, PageBreak()])
    story.extend(pdf.markdown_story(markdown))
    return story


def build_all(selected_slugs: set[str] | None = None):
    source = SOURCE.read_text(encoding="utf-8")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    outputs = []
    selected = [topic for topic in TOPICS if not selected_slugs or topic["slug"] in selected_slugs]
    if selected_slugs:
        missing = selected_slugs - {topic["slug"] for topic in selected}
        if missing:
            raise ValueError(f"Temas desconocidos: {', '.join(sorted(missing))}")
    for topic in selected:
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
    print(f"Colección generada: {len(outputs)} documento(s)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Genera dossiers PDF del Módulo 3.")
    parser.add_argument("slugs", nargs="*", help="Slugs concretos; sin argumentos genera toda la colección.")
    arguments = parser.parse_args()
    build_all(set(arguments.slugs) or None)
