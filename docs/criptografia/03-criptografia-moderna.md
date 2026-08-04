# 03 · Criptografía moderna — programa completo

La criptografía moderna combina primitivas matemáticas, esquemas, protocolos e ingeniería de seguridad. El objetivo no es únicamente ocultar datos: debe declarar qué propiedad protege, frente a qué adversario, con qué recursos, bajo qué supuestos y durante cuánto tiempo.

> **Recorrido ampliado:** [índice del Módulo 3](../../simuladores/modulo-03/index.html) · [teoría HTML](../../simuladores/modulo-03/teoria-programa.html) · [mapas mentales](../../simuladores/modulo-03/mapas-programa.html) · [glosario integral](../../simuladores/modulo-03/glosario-programa.html) · [cuestionario integral](../../simuladores/modulo-03/cuestionario-programa.html)

## 1. Fundamentos

Una definición moderna de seguridad debe especificar:

1. **Propiedad:** confidencialidad, integridad, autenticidad, no repudio, anonimato u otra.
2. **Adversario:** capacidades, acceso, información auxiliar y oráculos.
3. **Condición de victoria:** distinguir, recuperar, falsificar, alterar o correlacionar.
4. **Recursos:** tiempo, memoria, datos, consultas, energía y paralelización.
5. **Supuesto:** problema difícil, modelo de aleatoriedad, custodia de claves y entorno de ejecución.

El principio de Kerckhoffs establece que el algoritmo puede ser público. La seguridad no debe depender de ocultar el diseño.

### Seguridad perfecta y computacional

- **Secreto perfecto:** observar el criptograma no modifica la distribución del mensaje. El one-time pad lo alcanza solo con clave uniforme, secreta, de longitud suficiente y utilizada una vez.
- **Seguridad computacional:** un ataque puede existir en teoría, pero su ventaja debe ser despreciable para adversarios eficientes con recursos acotados.

## 2. Clasificación de criptosistemas modernos

| Familia | Modelo de clave | Propiedad | Ejemplos |
|---|---|---|---|
| Cifrado simétrico | Secreto compartido | Confidencialidad; con AEAD también integridad | AES-GCM, ChaCha20-Poly1305 |
| Cifrado/acuerdo asimétrico | Par pública/privada | Encapsulación, acuerdo o protección de material pequeño | RSA-OAEP, ECDH, X25519, HPKE |
| Firma digital | Privada firma; pública verifica | Autenticidad e integridad verificables públicamente | RSA-PSS, ECDSA, EdDSA |
| Hash | Sin clave | Huella fija y componente de protocolos | SHA-256, SHA-3 |
| MAC | Secreto compartido | Integridad y autenticación simétrica | HMAC, Poly1305 |
| KDF | Secreto o contraseña | Derivación, endurecimiento y separación de claves | HKDF, PBKDF2, Argon2id |
| KEM | Par pública/privada | Encapsulación de un secreto compartido | ML-KEM, componente de HPKE |

También debe distinguirse entre **primitiva**, **esquema**, **protocolo** y **sistema**. AES es una primitiva; AES-GCM es una construcción AEAD; TLS 1.3 es un protocolo; una aplicación con identidad, almacenamiento y operación es un sistema.

## 3. Criptografía simétrica

La misma clave secreta cifra y descifra. Es rápida y adecuada para datos voluminosos, pero exige resolver generación, distribución, almacenamiento, rotación, revocación y destrucción de claves.

### AES

AES es un cifrador por bloques de **128 bits**. Sus claves pueden medir 128, 192 o 256 bits. El tamaño de bloque no cambia con la longitud de la clave.

### ChaCha20

ChaCha20 es un cifrador de flujo con clave de 256 bits. Se utiliza normalmente junto con Poly1305 como construcción AEAD.

## 4. Bits de seguridad

Para una clave ideal de \(k\) bits existen \(2^k\) candidatos. Una búsqueda exhaustiva clásica necesita, en promedio, aproximadamente \(2^{k-1}\) pruebas.

Los bits de seguridad representan el costo logarítmico del mejor ataque conocido. No tienen por qué coincidir con:

- longitud nominal de clave;
- longitud de una contraseña;
- tamaño de una salida hash;
- cantidad de caracteres;
- parámetros de un algoritmo.

Una contraseña humana larga puede tener poca entropía si sigue patrones. Derivar 256 bits desde ella no crea 256 bits de incertidumbre.

### Impacto cuántico

Grover ofrece una aceleración cuadrática idealizada para búsqueda no estructurada. Shor amenaza factorización y logaritmo discreto, por lo que afecta RSA, DH y ECC.

## 5. Cifrado por bloques y por flujo

### Bloques

Un cifrador por bloques transforma unidades fijas. Para mensajes largos necesita un modo de operación.

### Flujo

Un cifrador de flujo genera un keystream que se combina con el mensaje mediante XOR.

Si se reutiliza el mismo flujo:

```text
C1 = M1 XOR K
C2 = M2 XOR K
C1 XOR C2 = M1 XOR M2
```

La clave desaparece de la ecuación y se expone una relación entre mensajes.

## 6. Modos de operación

| Modo | Garantía | Condición crítica |
|---|---|---|
| ECB | No oculta estructura repetida | Evitar |
| CBC | Confidencialidad si se usa correctamente | IV apropiado y MAC separado |
| CTR | Confidencialidad tipo flujo | Contador/nonce no repetido |
| GCM | AEAD: confidencialidad, integridad y AAD | Nonce único por clave |
| XTS | Protección de sectores | No sustituye AEAD general |

La recomendación general para datos y protocolos es preferir AEAD, por ejemplo AES-GCM o ChaCha20-Poly1305.

## 7. Padding

PKCS#7 completa el último bloque agregando \(n\) bytes cuyo valor es \(n\). Si faltan cinco bytes, se añaden cinco bytes `05`.

El padding no autentica. Una aplicación que revela si el relleno es válido puede crear un **padding oracle**. Las defensas incluyen:

- preferir AEAD;
- verificar autenticidad antes de procesar;
- uniformar errores;
- evitar diferencias temporales observables.

## 8. Algoritmos simétricos

### AES

- bloque fijo de 128 bits;
- claves de 128, 192 o 256 bits;
- adecuado con GCM para AEAD;
- XTS para almacenamiento por sectores;
- no usar ECB.

### ChaCha20-Poly1305

- cifrador de flujo + autenticador;
- eficiente en software;
- habitual en móviles y protocolos;
- nonce único por clave.

### DES y 3DES

Deben tratarse como antecedentes históricos o legado en migración. DES posee una clave efectiva demasiado pequeña y 3DES tiene bloques de 64 bits y margen insuficiente para diseños nuevos.

## 9. Criptografía asimétrica

Usa un par de claves pública y privada. Su costo hace que normalmente se utilice para:

- acuerdo de claves;
- encapsulación;
- firmas;
- autenticación;
- protección de claves de sesión.

No se utiliza normalmente para cifrar archivos completos.

## 10. RSA y curvas elípticas

### RSA

- **RSA-OAEP:** cifrado o encapsulación de material pequeño.
- **RSA-PSS:** firma.
- **Textbook RSA:** inseguro y determinista.

### ECC

- **ECDH/X25519:** acuerdo de claves.
- **ECDSA/EdDSA:** firma.
- **ECIES:** familia de composiciones híbridas basadas en acuerdo EC, KDF y cifrado simétrico.
- **HPKE:** KEM + KDF + AEAD.

La expresión “cifrado EC” debe interpretarse como una composición híbrida, no como una operación de curva que cifra directamente grandes volúmenes.

## 11. Claves de sesión

Una clave de sesión es efímera y se limita a una conexión, archivo o intercambio. El patrón moderno es:

```text
autenticación de claves públicas
→ acuerdo o KEM
→ KDF
→ clave de sesión
→ AEAD
```

Ejemplos:

```text
ECDH → HKDF → AES-GCM
X25519 → HKDF → ChaCha20-Poly1305
KEM → KDF → AEAD
```

ECDH sin autenticación es vulnerable a man-in-the-middle. La identidad se establece mediante certificados, firmas, huellas verificadas, PSK u otro canal autenticado.

## 12. Laboratorio: vulnerar contraseña

Una contraseña humana no es una clave uniforme. Un atacante offline puede probar candidatos sin consultar al servidor cuando posee:

- salt;
- parámetros;
- hash o clave derivada;
- información sobre hábitos humanos.

### Estrategias

- diccionario;
- reglas y sustituciones;
- palabras + años;
- máscaras;
- PIN;
- fuerza bruta acotada.

### Salt

La salt es pública, única y aleatoria. Evita precálculo compartido y hashes idénticos entre usuarios, pero no impide probar candidatos.

### KDF de contraseña

PBKDF2, bcrypt, scrypt o Argon2id elevan el costo de cada intento. No crean entropía inexistente.

### Cadena de ataque

```text
candidato
→ normalización y codificación
→ KDF con la misma salt y parámetros
→ comparación con objetivo
```

### Recomendaciones

- Argon2id cuando sea posible;
- parámetros actualizables;
- salts únicas;
- gestor de contraseñas;
- MFA;
- límites y detección para ataques online;
- protección adicional de secretos de servidor cuando corresponda.

## Recursos interactivos nuevos

1. [Clasificación de criptosistemas modernos](../../simuladores/modulo-03/clasificacion-criptosistemas.html)
2. [AES, ChaCha20, modos y padding](../../simuladores/modulo-03/algoritmos-simetricos.html)
3. [RSA, ECC, HPKE y claves de sesión](../../simuladores/modulo-03/cifrado-hibrido-sesion.html)
4. [Ataque offline controlado a contraseñas ficticias](../../simuladores/modulo-03/ataque-contrasenas.html)
5. [Mapas mentales del programa](../../simuladores/modulo-03/mapas-programa.html)
6. [Glosario integral](../../simuladores/modulo-03/glosario-programa.html)
7. [Cuestionario integral](../../simuladores/modulo-03/cuestionario-programa.html)

## Recursos interactivos existentes

1. [Bloques frente a flujo](../../simuladores/modulo-03/bloques-vs-flujo.html)
2. [Contraseña, salt y KDF](../../simuladores/modulo-03/contrasena-salt-kdf.html)
3. [Modos AES y AEAD](../../simuladores/modulo-03/modos-aes-aead.html)
4. [Cifrado local de archivos](../../simuladores/modulo-03/cifrado-local-archivos.html)
5. [Hash, HMAC y firma](../../simuladores/modulo-03/hash-hmac-firmas.html)
6. [Padding oracle](../../simuladores/modulo-03/padding-oracle.html)
7. [RSA, ECDH y cifrado híbrido](../../simuladores/modulo-03/rsa-ecdh-hibrido.html)

> **Regla profesional:** utilizar estándares vigentes, APIs de alto nivel, bibliotecas mantenidas, generación segura de claves, gestión de nonces y revisión de protocolo. Los laboratorios son educativos.

---

Material elaborado por el profesor Sergio Gevatschnaider.
