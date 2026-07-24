# Clase 2 · De Shannon al cifrado simétrico moderno

## Pregunta rectora

**¿Cómo se pasa de ocultar letras a diseñar sistemas que protegen bits frente a adversarios computacionales?**

## Resultados de aprendizaje

Al finalizar, el estudiante podrá:

- distinguir criptografía clásica y moderna sin reducir la diferencia a «letras frente a bits»;
- interpretar entropía, redundancia, confusión y difusión;
- diferenciar longitud de clave, espacio de claves y bits de seguridad;
- explicar el papel de un PRNG y la exigencia adicional de un CSPRNG;
- distinguir cifrado por bloques y por flujo;
- explicar por qué AES necesita una construcción o modo de operación;
- comparar ECB, CBC, CTR y GCM;
- reconocer que confidencialidad e integridad son propiedades distintas.

## Secuencia de 90 minutos

| Tiempo | Actividad |
|---:|---|
| 0–8 | Recuperación: clásico, moderno, codificación y cifrado |
| 8–20 | Seguridad moderna: propiedades, modelos y adversarios |
| 20–37 | Shannon: entropía, redundancia, confusión y difusión |
| 37–48 | Complejidad, espacio de claves y bits de seguridad |
| 48–60 | Criptografía simétrica y problema de distribución de claves |
| 60–70 | Bloques frente a flujos |
| 70–84 | ECB, CBC, CTR, GCM y AEAD |
| 84–90 | Ticket de salida |

## 1. Criptografía clásica y moderna

La criptografía moderna no se define únicamente por operar sobre bits. Se caracteriza por propiedades explícitas, modelos de amenaza, algoritmos públicos, claves protegidas, análisis probabilístico y costos computacionales.

| Clásica | Moderna |
|---|---|
| Letras y símbolos | Bits, bytes y estructuras algebraicas |
| Ataques lingüísticos y estadísticos | Ataques computacionales, protocolarios y físicos |
| Seguridad frecuentemente informal | Objetivos y supuestos explícitos |
| Confidencialidad predominante | Confidencialidad, integridad, autenticidad y derivación |

## 2. Entropía y redundancia

Para una variable aleatoria discreta:

```text
H(X) = - Σ p(x) log2 p(x)
```

La entropía mide incertidumbre media. No debe identificarse automáticamente con seguridad: una fuente puede tener buena distribución estadística y seguir siendo predecible si el generador o la semilla son conocidos.

La redundancia del lenguaje explica por qué los cifrados clásicos filtran estructura y pueden atacarse mediante frecuencias, periodicidad y texto probable.

## 3. Confusión y difusión

- **Confusión:** vuelve compleja la relación entre clave y criptograma.
- **Difusión:** dispersa la influencia de cada bit del mensaje sobre muchos bits de salida.
- **Avalancha:** un cambio pequeño produce numerosos cambios en la salida.

La avalancha es deseable, pero no prueba por sí sola seguridad.

## 4. Complejidad y bits de seguridad

Para una clave ideal de `k` bits hay `2^k` candidatos. El costo medio de fuerza bruta es aproximadamente `2^(k-1)` pruebas.

Deben distinguirse:

- tamaño de clave;
- tamaño de bloque;
- espacio de claves;
- costo del mejor ataque conocido;
- seguridad de la implementación.

## 5. PRNG y CSPRNG

Un PRNG produce secuencias reproducibles a partir de un estado o semilla. Un CSPRNG agrega requisitos de impredecibilidad y resistencia a reconstrucción del estado.

Las simulaciones del repositorio usan generadores didácticos para estudiar distribución y reproducibilidad. No deben utilizarse para generar claves, nonces o secretos.

## 6. Cifrado simétrico

```text
C = E(K, M)
M = D(K, C)
```

La misma clave secreta se utiliza para cifrar y descifrar. Es eficiente para grandes volúmenes, pero exige resolver generación, distribución, almacenamiento, rotación y revocación de claves.

## 7. Bloques y flujos

- Un cifrador por bloques transforma bloques fijos. AES usa bloques de 128 bits y claves de 128, 192 o 256 bits.
- Un cifrador por flujo genera un keystream que se combina mediante XOR.

Los cifradores de flujo no son inherentemente menos seguros. La reutilización de nonce o keystream sí puede destruir la confidencialidad.

## 8. Modos y AEAD

| Modo | Característica | Riesgo o requisito |
|---|---|---|
| ECB | Bloques independientes | Filtra patrones; evitar para datos generales |
| CBC | Encadenamiento | IV impredecible, padding y autenticación separada |
| CTR | Nonce + contador | Nunca reutilizar con la misma clave |
| GCM | CTR + autenticación | Nonce único y validación del tag |

Para sistemas nuevos se prefieren construcciones AEAD, como AES-GCM o ChaCha20-Poly1305.

## Laboratorios asociados

### Fundamentos matemáticos

- Entropía de Shannon.
- Flujo pseudoaleatorio.
- Confusión, difusión y avalancha.
- Espacio de claves y complejidad.

### Criptografía moderna

- Bloques frente a flujo.
- Modos AES y AEAD.
- Laboratorio integral con SHA-256, PBKDF2, AES-GCM, HKDF y ECDSA.

## Ticket de salida

1. ¿Por qué una secuencia visualmente aleatoria puede no ser criptográficamente segura?
2. ¿Qué diferencia existe entre longitud de clave y bits de seguridad?
3. ¿Por qué ECB revela patrones?
4. ¿Qué agrega GCM además de confidencialidad?
5. ¿Qué diferencia existe entre nonce, IV, clave y tag?

> **Regla profesional:** no diseñar cifrados propios ni trasladar implementaciones didácticas a producción. Usar bibliotecas mantenidas, APIs de alto nivel y construcciones autenticadas.

---

Material elaborado por el profesor Sergio Gevatschnaider.