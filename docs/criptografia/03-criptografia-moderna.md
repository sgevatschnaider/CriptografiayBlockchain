# 03 · Criptografía moderna

La criptografía moderna combina primitivas matemáticas, protocolos y prácticas de ingeniería. El objetivo no es solamente ocultar un mensaje, sino proporcionar propiedades precisas: **confidencialidad, integridad, autenticidad, no repudio y derivación segura de claves**.

> **Recorrido interactivo:** [ruta completa del Módulo 3](../../simuladores/modulo-03/ruta-modulo.html) · [Clase 3: de la contraseña a AES-GCM](../../simuladores/modulo-03/ruta-guiada.html) · [glosario](../../simuladores/modulo-03/glosario.html) · [cuestionario](../../simuladores/modulo-03/cuestionario.html)

## 1. Cifrado simétrico

Usa la misma clave secreta para cifrar y descifrar. Es rápido y adecuado para grandes volúmenes de datos.

### AES

AES es un cifrador por bloques de 128 bits con claves de 128, 192 o 256 bits. No debe usarse “solo”: necesita un modo de operación.

| Modo | Propósito | Observación |
|---|---|---|
| ECB | Cifra bloques independientemente | No preserva confidencialidad estructural; evitar |
| CBC | Encadena bloques | Requiere IV impredecible y autenticación separada |
| CTR | Convierte el bloque en flujo | Nunca reutilizar nonce/contador con la misma clave |
| GCM | Cifrado autenticado | Proporciona confidencialidad e integridad; exige nonce único |

La recomendación general es preferir **AEAD** —Authenticated Encryption with Associated Data—, por ejemplo AES-GCM o ChaCha20-Poly1305.

## 2. Cifradores de flujo

Generan un flujo pseudoaleatorio que se combina con el mensaje mediante XOR. ChaCha20 es un ejemplo moderno, eficiente en software y ampliamente usado junto con Poly1305 para autenticación.

Reutilizar el mismo flujo con dos mensajes produce el mismo problema conceptual que reutilizar un One-Time Pad.

## 3. Funciones hash

Una función hash transforma una entrada arbitraria en una salida de tamaño fijo.

Propiedades buscadas:

- resistencia a preimagen;
- resistencia a segunda preimagen;
- resistencia a colisiones;
- efecto avalancha;
- distribución uniforme.

Familias relevantes: SHA-2, SHA-3 y BLAKE2/BLAKE3 según el contexto. MD5 y SHA-1 no son adecuados para seguridad de colisiones.

## 4. MAC y autenticación

Un **Message Authentication Code** verifica integridad y autenticidad usando una clave compartida.

```text
Tag = MAC(K, mensaje)
```

HMAC combina una función hash con una construcción robusta. No debe confundirse con una firma digital: ambas partes conocen la misma clave y cualquiera podría producir el tag.

## 5. Contraseñas y derivación de claves

Las contraseñas tienen poca entropía y no deben almacenarse con un hash rápido simple.

Se usan funciones deliberadamente costosas:

- Argon2id;
- scrypt;
- bcrypt;
- PBKDF2 en entornos que requieren compatibilidad normativa.

Elementos clave:

- salt único y aleatorio;
- parámetros de costo actualizables;
- comparación en tiempo constante;
- protección adicional con pepper cuando la arquitectura lo justifique.

Una **KDF** también sirve para derivar varias claves independientes desde un secreto maestro. HKDF es una construcción habitual basada en HMAC.

## 6. Criptografía asimétrica

Usa un par de claves: pública y privada.

### RSA

Puede utilizarse para cifrado o firmas, pero requiere esquemas de relleno seguros:

- RSA-OAEP para cifrado;
- RSA-PSS para firmas.

“RSA puro” o textbook RSA es inseguro.

### Diffie–Hellman

Permite acordar un secreto sobre un canal público. Por sí solo no autentica a las partes, por lo que puede sufrir un ataque man-in-the-middle.

### Curvas elípticas

ECC permite intercambio y firma con claves compactas:

- ECDH/X25519 para acuerdo de claves;
- ECDSA o EdDSA/Ed25519 para firmas.

La seguridad depende de parámetros correctos, validación de claves y nonces seguros.

## 7. Firmas digitales

Una firma ofrece autenticidad, integridad y verificabilidad pública.

Flujo conceptual:

```text
firma = Sign(clave_privada, mensaje)
Verify(clave_pública, mensaje, firma)
```

La clave privada debe protegerse rigurosamente. En ECDSA, reutilizar o predecir el nonce puede revelar la clave privada.

## 8. Certificados y PKI

La criptografía asimétrica no resuelve por sí sola quién controla una clave pública. Una infraestructura de clave pública vincula identidades con claves mediante certificados, autoridades certificantes, cadenas de confianza, revocación y políticas.

## 9. Protocolos seguros

TLS 1.3 integra acuerdo de claves, autenticación, derivación y cifrado autenticado. La seguridad surge de la composición correcta de primitivas, no de un único algoritmo.

## 10. Errores frecuentes

- diseñar algoritmos propios;
- reutilizar nonces;
- usar cifrado sin autenticación;
- hardcodear claves;
- almacenar contraseñas con SHA-256 directo;
- confundir encoding con cifrado;
- ignorar rotación y revocación;
- no validar certificados o claves públicas;
- elegir parámetros obsoletos.

## Laboratorios del módulo

1. [Bloques frente a flujo](../../simuladores/modulo-03/bloques-vs-flujo.html): partición, PKCS#7, keystream y reutilización.
2. [Contraseña, salt y KDF](../../simuladores/modulo-03/contrasena-salt-kdf.html): NFC, UTF-8, PBKDF2 y costo offline.
3. [Modos AES y AEAD](../../simuladores/modulo-03/modos-aes-aead.html): CBC, CTR, GCM, AAD y tag.
4. [Cifrado local de archivos](../../simuladores/modulo-03/cifrado-local-archivos.html): composición PBKDF2 + AES-256-GCM.
5. [Hash, HMAC y firma](../../simuladores/modulo-03/hash-hmac-firmas.html): SHA-256, HMAC-SHA-256 y ECDSA P-256.
6. [Padding y oráculo controlado](../../simuladores/modulo-03/padding-oracle.html): respuestas distinguibles sobre AES-CBC.
7. [RSA, ECDH y cifrado híbrido](../../simuladores/modulo-03/rsa-ecdh-hibrido.html): RSA-OAEP, MITM y ECDH → HKDF → AES-GCM.

## Referencias técnicas primarias

- [W3C · Web Cryptography API](https://www.w3.org/TR/webcrypto/): operaciones y algoritmos disponibles en el navegador.
- [NIST SP 800-38D · GCM y GMAC](https://csrc.nist.gov/pubs/sp/800/38/d/final): cifrado autenticado con datos asociados.
- [NIST SP 800-132 · derivación basada en contraseñas](https://csrc.nist.gov/pubs/sp/800/132/final): salts y factores de iteración para datos almacenados.
- [RFC 5869 · HKDF](https://www.rfc-editor.org/info/rfc5869): extracción, expansión y separación contextual.
- [RFC 8017 · PKCS #1](https://www.rfc-editor.org/info/rfc8017): RSA-OAEP y RSA-PSS.
- [RFC 9846 · TLS 1.3](https://www.rfc-editor.org/info/rfc9846): ejemplo de composición protocolar de acuerdo, autenticación, KDF y AEAD.

> **Regla de producción:** usar bibliotecas mantenidas, estándares vigentes y APIs de alto nivel. La implementación didáctica no debe trasladarse directamente a sistemas reales.

---

[⬅️ Fundamentos matemáticos](./02-fundamentos-matematicos.md) · [Campus](./README.md) · [Esteganografía ➡️](./04-esteganografia.md)
