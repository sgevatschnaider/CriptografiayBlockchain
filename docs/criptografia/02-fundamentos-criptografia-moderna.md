# 02 · Fundamentos de la criptografía moderna

La transición desde la criptografía clásica hacia la moderna no consiste únicamente en pasar de letras a bits. El cambio central es metodológico: la seguridad deja de evaluarse por la apariencia del criptograma y pasa a formularse mediante **propiedades precisas, modelos de amenaza, probabilidad, complejidad computacional y gestión de claves**.

## Pregunta rectora

> ¿Cómo se transforma la incertidumbre de una fuente en una construcción criptográfica cuya ruptura resulte computacionalmente inviable?

## Objetivos

- Diferenciar criptografía clásica y moderna sin reducir la comparación a letras frente a bits.
- Interpretar entropía, redundancia y pseudoaleatoriedad.
- Comprender confusión, difusión y efecto avalancha.
- Distinguir longitud de clave, espacio de claves y bits de seguridad.
- Explicar el modelo del cifrado simétrico.
- Comparar cifradores por bloques y por flujo.
- Reconocer la función de los modos ECB, CBC, CTR y GCM.
- Explicar por qué la confidencialidad no garantiza integridad.

## 1. De la criptografía clásica a la moderna

| Dimensión | Criptografía clásica | Criptografía moderna |
|---|---|---|
| Unidad habitual | Letras y símbolos | Bits, bytes y estructuras algebraicas |
| Ataques característicos | Frecuencias, patrones, periodicidad | Algoritmos, protocolos, implementaciones y canales laterales |
| Seguridad | Frecuentemente informal | Propiedades y juegos de seguridad explícitos |
| Claves | Pequeñas o estructuradas | Espacios diseñados para ser computacionalmente inabarcables |
| Objetivos | Principalmente confidencialidad | Confidencialidad, integridad, autenticidad y derivación de claves |

Kerckhoffs ya había anticipado una regla esencial: el algoritmo puede ser público; la seguridad debe descansar en la clave y en supuestos explícitos.

## 2. Teoría de la información de Shannon

### Entropía

Para una variable aleatoria discreta \(X\):

```text
H(X) = -Σ p(x) log₂ p(x)
```

La entropía mide incertidumbre media. No equivale automáticamente a seguridad criptográfica.

### Redundancia

El lenguaje natural no distribuye todos sus símbolos de forma uniforme. Esa redundancia hace posibles el análisis de frecuencias, Kasiski, las cribas y otras formas de inferencia.

### Confusión

Busca volver compleja la relación entre clave, texto claro y texto cifrado. Las sustituciones no lineales contribuyen a esta propiedad.

### Difusión

Busca dispersar la influencia de cada bit del mensaje sobre muchos bits del criptograma. Las permutaciones y mezclas lineales contribuyen a esta propiedad.

### Efecto avalancha

Un cambio mínimo en la entrada debería producir numerosos cambios en la salida. Es una propiedad deseable, pero no constituye por sí sola una prueba de seguridad.

## 3. Aleatoriedad, PRNG y CSPRNG

Una secuencia puede parecer aleatoria y seguir siendo reproducible si fue generada por un algoritmo determinista.

- **PRNG:** generador pseudoaleatorio general.
- **CSPRNG:** generador diseñado para resistir predicción y reconstrucción de estado.

Para claves, nonces y secretos se necesitan fuentes criptográficamente seguras.

## 4. Complejidad y bits de seguridad

### Longitud de clave

Cantidad de bits utilizados para representar una clave.

### Espacio de claves

Para una clave ideal de \(k\) bits:

```text
2^k claves posibles
```

### Bits de seguridad

Logaritmo base dos del costo aproximado del mejor ataque conocido. No siempre coincide con la longitud nominal de la clave.

La seguridad real también depende de:

- calidad de la generación de claves;
- modo de operación;
- reutilización de nonces;
- implementación;
- protocolo;
- canales laterales;
- custodia y rotación.

## 5. Criptografía simétrica

Un cifrado simétrico utiliza una clave secreta compartida:

```text
C = E_K(M)
M = D_K(C)
```

Ventajas:

- alta velocidad;
- buena eficiencia para archivos y grandes volúmenes;
- claves relativamente compactas.

Desafío principal:

> distribuir y proteger la clave sin exponerla al adversario.

## 6. Cifradores por bloques y por flujo

### Por bloques

Transforman bloques de tamaño fijo. AES utiliza bloques de 128 bits y claves de 128, 192 o 256 bits.

### Por flujo

Generan un flujo pseudoaleatorio que se combina mediante XOR:

```text
C = M XOR KS
```

No son inherentemente menos seguros. Su seguridad depende del algoritmo y del uso correcto de claves y nonces.

## 7. Modos de operación

| Modo | Idea | Propiedad crítica |
|---|---|---|
| ECB | Cifra bloques independientemente | Filtra patrones; evitar |
| CBC | Encadena bloques | Necesita IV impredecible y autenticación separada |
| CTR | Cifra nonce y contador | Nunca reutilizar nonce con la misma clave |
| GCM | CTR + autenticación | AEAD; genera tag y exige nonce único |

## 8. AEAD

El cifrado autenticado con datos asociados proporciona:

- confidencialidad;
- integridad;
- autenticidad del criptograma;
- protección de metadatos asociados no cifrados.

Ejemplos:

- AES-GCM;
- ChaCha20-Poly1305.

## 9. Errores frecuentes

- creer que una salida aparentemente aleatoria es segura;
- confundir PRNG con CSPRNG;
- usar AES sin especificar un modo;
- reutilizar nonces;
- usar ECB para archivos o imágenes;
- asumir que CBC autentica;
- comparar seguridad únicamente por tamaño de clave;
- afirmar que los cifradores por flujo son menos seguros por definición.

## Laboratorios

- Entropía de Shannon.
- Flujo pseudoaleatorio y semillas.
- Confusión, difusión y distancia de Hamming.
- Espacio de claves y fuerza bruta.
- Bloques frente a flujo.
- ECB, CBC, CTR y AES-GCM.

> **Regla profesional:** utilizar bibliotecas mantenidas, APIs de alto nivel y construcciones AEAD. Las implementaciones educativas no deben trasladarse directamente a producción.

---

[⬅️ Criptografía clásica](./01-criptografia-clasica.md) · [Fundamentos matemáticos](./02-fundamentos-matematicos.md) · [Criptografía moderna aplicada ➡️](./03-criptografia-moderna.md)
