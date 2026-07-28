# 02 · Fundamentos matemáticos de la criptografía

La criptografía moderna transforma problemas matemáticos difíciles en garantías de seguridad. Este módulo presenta las estructuras mínimas necesarias para comprender los algoritmos sin convertir el curso en una exposición puramente abstracta.

## 1. Representación digital y álgebra booleana

Antes de aplicar una primitiva criptográfica, el mensaje debe convertirse en datos. Unicode asigna puntos de código a los caracteres y una codificación como UTF-8 los transforma en bytes. Cada byte puede escribirse en binario, decimal o hexadecimal sin que cambie su valor:

```text
01000001₂ = 65₁₀ = 41₁₆ = byte de la letra A en UTF-8
```

Hexadecimal y Base64 son representaciones reversibles; no proporcionan confidencialidad. El cifrado comienza cuando una transformación controlada por una clave opera sobre esos bytes.

Las operaciones booleanas actúan posición por posición:

- **AND** conserva un bit cuando ambas entradas valen 1;
- **OR** activa un bit cuando al menos una entrada vale 1;
- **NOT** invierte los bits dentro del tamaño establecido;
- **XOR** vale 1 cuando las entradas son diferentes.

XOR aparece en cifradores de flujo y modos como CTR porque la misma operación permite combinar y recuperar:

```text
C = M ⊕ K
(M ⊕ K) ⊕ K = M
```

La reversibilidad no implica seguridad: la garantía depende de cómo se genera, protege y utiliza `K`.

[Abrir el laboratorio de representación digital y XOR](../../simuladores/fundamentos-matematicos/representacion-digital-xor.html)

## 2. Aritmética modular

Trabajar módulo `n` significa considerar equivalentes dos enteros cuando dejan el mismo resto al dividir por `n`:

```text
a ≡ b (mod n) ⇔ n divide a − b
```

Es la aritmética natural de relojes, contadores cíclicos y muchas primitivas criptográficas.

Conceptos esenciales:

- clases de equivalencia;
- suma y producto modular;
- máximo común divisor;
- inverso multiplicativo;
- algoritmo extendido de Euclides.

Un número `a` tiene inverso módulo `n` si y solo si `mcd(a,n)=1`.

## 3. Números primos y factorización

Los primos son bloques fundamentales de los enteros. RSA se apoya en que multiplicar dos primos grandes es sencillo, mientras que recuperar los factores a partir del producto es computacionalmente difícil para computadoras clásicas cuando los parámetros son adecuados.

Teoremas y herramientas:

- teorema fundamental de la aritmética;
- pequeño teorema de Fermat;
- función φ de Euler;
- teorema de Euler;
- test probabilísticos de primalidad.

## 4. Grupos

Un grupo es un conjunto con una operación que cumple cierre, asociatividad, identidad e inversos. En criptografía interesa especialmente el grupo cíclico generado por un elemento `g`.

La dificultad del **logaritmo discreto** sostiene familias como Diffie–Hellman, DSA y varias construcciones sobre curvas elípticas:

```text
dado g y g^x, encontrar x
```

La operación directa es eficiente; invertirla debe ser difícil.

## 5. Campos finitos

Un campo finito permite sumar, restar, multiplicar y dividir —excepto por cero— dentro de un conjunto finito.

Aplicaciones:

- AES opera con bytes interpretados en `GF(2^8)`;
- las curvas elípticas suelen definirse sobre campos primos o binarios;
- códigos correctores y sistemas poscuánticos usan estructuras algebraicas relacionadas.

## 6. Curvas elípticas

Sobre un campo finito, una curva elíptica tiene una ecuación del tipo:

```text
y² = x³ + ax + b
```

Los puntos de la curva, junto con una operación de suma geométrica-algebraica, forman un grupo. La seguridad proviene del problema del logaritmo discreto en curvas elípticas.

Ventaja práctica: ECC logra niveles de seguridad comparables a RSA con claves mucho más pequeñas, aunque la implementación y la elección de curvas exigen cuidado.

## 7. Probabilidad, entropía e información

La criptografía depende de la imprevisibilidad.

- **Entropía:** medida de incertidumbre de una fuente.
- **Min-entropía:** se concentra en el resultado más probable y es muy relevante para seguridad.
- **Generador pseudoaleatorio:** expande una semilla corta e impredecible en una secuencia que debe parecer aleatoria.
- **Nonce:** valor que debe ser único o impredecible según el protocolo; no es necesariamente secreto.
- **Salt:** valor público y aleatorio que evita que contraseñas iguales produzcan el mismo derivado.

Una clave de 256 bits generada con una fuente débil no ofrece 256 bits reales de seguridad.

## 8. Complejidad y reducción

Las afirmaciones criptográficas no suelen decir que un ataque es imposible, sino que requeriría recursos inalcanzables bajo ciertos supuestos.

Conceptos:

- tiempo polinómico;
- ataque de fuerza bruta;
- reducción de seguridad;
- seguridad computacional;
- seguridad de información;
- adversario probabilístico.

## 9. Seguridad en bits

Los bits de seguridad aproximan el costo del mejor ataque conocido. No deben confundirse automáticamente con el tamaño de la clave.

Ejemplos conceptuales:

- una clave simétrica de `k` bits ofrece como máximo `k` bits contra fuerza bruta clásica;
- ataques de colisión sobre hashes de `n` bits suelen tener costo cercano a `2^(n/2)` por el fenómeno del cumpleaños;
- RSA y ECC requieren tamaños diferentes para alcanzar niveles comparables.

## Actividades sugeridas

- Convertir un mensaje con tildes o emojis a UTF-8, hexadecimal y binario, y reconstruirlo.
- Verificar byte a byte que `(M ⊕ K) ⊕ K = M` y explicar por qué reutilizar `K` es peligroso.
- Calcular inversos con Euclides extendido.
- Implementar exponenciación modular rápida.
- Simular Diffie–Hellman con números pequeños y luego discutir por qué esos parámetros no son seguros.
- Visualizar la paradoja del cumpleaños aplicada a colisiones.
- Explorar suma de puntos en una curva elíptica didáctica.

---

[⬅️ Criptografía clásica](./01-criptografia-clasica.md) · [Campus](./README.md) · [Criptografía moderna ➡️](./03-criptografia-moderna.md)
