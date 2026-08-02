# 02 · Fundamentos de la criptografía moderna

La criptografía moderna no se define por “usar computadoras” ni por transformar letras en bits. Su cambio central es metodológico: una construcción se considera segura sólo después de precisar **qué propiedad protege, frente a qué adversario, con qué recursos y bajo qué supuesto**.

Este módulo organiza esa forma de pensar en tres pilares:

1. **Teoría de la información:** define límites ideales y cuantifica incertidumbre.
2. **Complejidad computacional:** modela el costo del mejor ataque conocido.
3. **Teoría de números y álgebra:** aporta las estructuras donde viven las operaciones y los problemas difíciles.

## Pregunta rectora

> ¿Cómo se transforma la incertidumbre en una construcción cuya ruptura resulte inviable para un adversario definido?

## Objetivos de aprendizaje

- Interpretar entropía, sorpresa, redundancia e información mutua.
- Distinguir secreto perfecto, seguridad asintótica y seguridad concreta.
- Explicar por qué el one-time pad funciona y por qué reutilizar su clave lo destruye.
- Separar aleatoriedad estadística de impredecibilidad criptográfica.
- Leer un juego de seguridad y la ventaja de un adversario.
- Relacionar parámetro de seguridad, trabajo, tiempo, memoria y paralelización.
- Comprender qué demuestra una reducción y por qué P frente a NP no “prueba” la seguridad de los cifrados.
- Reconocer grupos, cuerpos finitos, curvas elípticas y retículos en primitivas reales.
- Analizar con cuidado el impacto de Grover y Shor.
- Distinguir cifrado por desplazamiento, cifrado por bloques y cifrado por flujo.
- Comprobar la reversibilidad de XOR y el fallo producido por reutilizar un contador en CTR.

> **Recorrido interactivo:** la [ruta guiada del Módulo 2](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-02/ruta-guiada.html) organiza estos contenidos en trece estaciones. La apertura compara César, OTP y AES-GCM; el laboratorio de cierre conecta XOR con AES-CTR y prepara el paso al Módulo 3.

## 1. El cambio metodológico

| Pregunta | Enfoque informal | Enfoque moderno |
|---|---|---|
| ¿Qué se protege? | “El mensaje” | Confidencialidad, integridad, autenticidad, anonimato u otra propiedad explícita |
| ¿Contra quién? | “Un atacante” | Un adversario con capacidades y acceso definidos |
| ¿Cuándo gana? | “Cuando rompe el cifrado” | Cuando satisface una condición de victoria medible |
| ¿Cuánto puede gastar? | No se especifica | Tiempo, memoria, consultas, datos y cómputo |
| ¿De qué depende la prueba? | Del secreto del algoritmo | De una clave, una definición y supuestos públicos |

El principio de Kerckhoffs sigue vigente: el algoritmo puede ser público. La seguridad no debe depender de ocultar su diseño.

## 2. Pilar I · Teoría de la información

### 2.1 Sorpresa y entropía

Si un evento \(x\) tiene probabilidad \(p(x)\), su sorpresa es:

```text
I(x) = -log₂ p(x)
```

Un evento improbable aporta más información cuando ocurre. La entropía de una variable aleatoria discreta \(X\) es la sorpresa promedio:

```text
H(X) = -Σ p(x) log₂ p(x)
```

Para una variable binaria con probabilidades \(p\) y \(1-p\):

```text
H₂(p) = -p log₂(p) - (1-p) log₂(1-p)
```

La incertidumbre es máxima en \(p=1/2\). Si una salida es casi segura, su entropía se aproxima a cero.

> **Precisión importante:** entropía no es sinónimo de seguridad. Describe una distribución; no demuestra que un generador sea impredecible ni que un protocolo resista ataques.

### 2.2 Redundancia

Una fuente es redundante cuando sus símbolos o bloques no son equiprobables. El lenguaje natural, los formatos de archivo y los protocolos tienen estructura predecible. La criptografía clásica filtraba mucha de esa estructura; la moderna intenta ocultarla dentro de un modelo de seguridad explícito.

### 2.3 Información mutua

La información mutua mide cuánto reduce una variable la incertidumbre de otra:

```text
I(M;C) = H(M) - H(M|C)
```

Si observar el criptograma \(C\) no cambia lo que el adversario sabe sobre el mensaje \(M\), entonces:

```text
I(M;C) = 0
```

### 2.4 Secreto perfecto

Un esquema tiene secreto perfecto si, para todo mensaje \(m\) y criptograma posible \(c\):

```text
P(M=m | C=c) = P(M=m)
```

La observación del criptograma no modifica la distribución a priori del mensaje.

El **one-time pad** es la construcción canónica:

```text
C = M XOR K
M = C XOR K
```

Alcanza secreto perfecto si la clave:

- es uniformemente aleatoria;
- tiene al menos la longitud del mensaje;
- permanece secreta;
- se utiliza una sola vez.

No corresponde afirmar que es “el único esquema posible” con secreto perfecto. Sí ilustra el costo inevitable de esa garantía: la clave debe aportar tanta incertidumbre como el mensaje que protege.

### 2.5 Reutilización: el error fatal

Si se reutiliza la misma clave:

```text
C₁ = M₁ XOR K
C₂ = M₂ XOR K
```

entonces:

```text
C₁ XOR C₂ = M₁ XOR M₂
```

La clave desaparece de la ecuación y queda expuesta una relación entre mensajes. La confidencialidad puede fallar aunque cada criptograma aislado “parezca ruido”.

### 2.6 Confusión, difusión y avalancha

Son conceptos relacionados, pero responden preguntas diferentes:

- **Confusión:** vuelve compleja, especialmente no lineal, la relación entre clave, entrada y salida. Las S-boxes aportan no linealidad; XOR y las transformaciones lineales no bastan por sí solos.
- **Difusión:** distribuye la influencia estadística de cada parte del texto claro sobre muchas posiciones del criptograma. Permutaciones y mezclas lineales conectan las salidas de distintas sustituciones entre rondas.
- **Efecto avalancha:** describe la sensibilidad observable de la salida. Al invertir un bit de entrada, una transformación equilibrada de `n` bits debería modificar, en promedio, aproximadamente `n/2` bits de salida.

La medida básica es la **distancia de Hamming**:

```text
dH(a,b) = cantidad de posiciones donde a y b difieren
avalancha = dH(F(x), F(x XOR e_i)) / n
```

Una **S-box** sustituye grupos pequeños de bits y aporta no linealidad. Una **P-box** solo permuta posiciones: conserva el peso y la distancia de Hamming. En AES, `ShiftRows` permuta bytes y `MixColumns` los combina linealmente; la difusión se acumula al alternar estas capas con `SubBytes` y la incorporación de subclaves durante varias rondas.

Tres criterios refinan la observación visual:

- **Criterio estricto de avalancha (SAC):** para cada bit de entrada `i` y cada bit de salida `j`, la probabilidad de que `j` cambie al invertir `i` debe aproximarse a `1/2`. Un promedio global de 50% no alcanza.
- **Criterio de independencia de bits (BIC):** para cada perturbación de entrada, los cambios de pares de bits de salida deben comportarse de manera aproximadamente independiente. Dos bits pueden cambiar cada uno 50% de las veces y aun estar correlacionados.
- **Completitud:** cada bit de salida depende de todos los bits de entrada en algún contexto. No significa que todos los bits deban cambiar en cada ejecución.

El número de rondas determina cómo se acumulan confusión y difusión y también aporta margen frente al mejor ataque conocido. Una variante de rondas reducidas puede mostrar avalancha cercana a 50% y, sin embargo, ser vulnerable.

La avalancha es deseable, pero no prueba seguridad, SAC, BIC ni completitud por sí sola. Una función defectuosa también puede producir salidas visualmente caóticas. El [laboratorio de confusión, difusión y avalancha](../../simuladores/modulo-02/confusion-difusion.html) permite separar una prueba individual de un diagnóstico estadístico comparativo.

### 2.7 PRNG y CSPRNG

La cadena comienza antes del generador. Una **fuente de entropía** aporta incertidumbre a partir de observaciones del entorno y del sistema operativo; un proceso de acondicionamiento combina esas observaciones; la semilla inicializa el estado y el generador lo expande en una secuencia más larga.

- Un **PRNG de propósito general** prioriza velocidad y propiedades estadísticas para simulación o muestreo. No tiene por qué resistir a un adversario que conoce el algoritmo y observa salidas.
- Un **CSPRNG o DRBG** suele ser determinista una vez sembrado, pero está diseñado para que resulte computacionalmente inviable predecir salidas futuras o reconstruir el estado a partir de la salida disponible.
- El **resembrado** incorpora entropía nueva. La protección y actualización del estado buscan limitar el impacto de una exposición, aunque las garantías exactas dependen de la construcción.

Por lo tanto, la diferencia no es simplemente «determinista frente a no determinista». La seguridad depende de la calidad y cantidad de entropía inicial, el diseño del generador, la protección del estado y el uso correcto de los bytes producidos.

Las pruebas simples de frecuencia, corridas o correlación detectan defectos obvios. Aprobarlas no certifica seguridad: una secuencia puede estar perfectamente balanceada y ser completamente predecible.

Los requisitos también dependen del objeto:

- una **clave** debe ser impredecible y secreta;
- un **nonce o IV** suele ser público y debe ser único, impredecible o ambas cosas según el esquema;
- un **salt** es público y debe evitar repeticiones entre derivaciones;
- un **token** debe ser impracticable de adivinar mientras sea válido.

Una salida de 256 bits creada desde un PIN uniforme de cuatro cifras no posee 256 bits reales de incertidumbre: el adversario puede enumerar solo 10 000 semillas posibles. Esta diferencia entre longitud y entropía efectiva se explora en el [laboratorio de aleatoriedad criptográfica](../../simuladores/modulo-02/flujo-pseudoaleatorio.html).

## 3. Pilar II · Complejidad computacional

### 3.1 De lo imposible a lo inviable

La mayoría de los sistemas modernos no oculta toda información de forma incondicional. Busca que cualquier adversario eficiente tenga una probabilidad de éxito despreciable.

La seguridad se parametriza con \(\lambda\), el **parámetro de seguridad**. Una función \(\mu(\lambda)\) es despreciable si decrece más rápido que el inverso de cualquier polinomio, a partir de un punto suficientemente grande.

### 3.2 Seguridad asintótica y concreta

- **Asintótica:** estudia cómo escala la ventaja cuando crece \(\lambda\).
- **Concreta:** estima la ventaja real para parámetros, datos, tiempo y consultas determinados.

Decir “AES-128” no alcanza para describir un sistema. También importan el modo, los nonces, la autenticación, la generación de claves, la implementación y el protocolo.

### 3.3 Juegos de seguridad

Una definición moderna suele formular un experimento:

1. el desafiante genera una clave;
2. el adversario elige o consulta información permitida;
3. el desafiante oculta un bit \(b\) en una respuesta;
4. el adversario produce una estimación \(b'\);
5. se mide cuánto supera al azar.

Una convención habitual para la ventaja es:

```text
Adv = |P[b' = b] - 1/2|
```

El valor exacto puede cambiar por un factor constante según la convención. Lo importante es especificarlo.

### 3.4 Funciones unidireccionales

Una función unidireccional debería ser:

- eficiente de evaluar;
- difícil de invertir en una entrada aleatoria.

Estas funciones son un bloque conceptual central. Sin embargo, su existencia no está demostrada de manera incondicional: depende de supuestos de complejidad.

### 3.5 Reducciones

Una reducción transforma un atacante contra la construcción en un algoritmo contra un problema supuesto difícil:

```text
ataque a Q  →  algoritmo para resolver P
```

Si la transformación es correcta, romper \(Q\) eficientemente implicaría resolver \(P\) eficientemente. La conclusión es condicional: la reducción no demuestra por sí sola que \(P\) sea difícil.

### 3.6 P, NP y un error frecuente

- **P:** problemas de decisión resolubles en tiempo polinómico.
- **NP:** problemas cuyas soluciones se verifican en tiempo polinómico.
- **NP-completo:** los problemas más difíciles de NP bajo reducciones apropiadas.

La pregunta P frente a NP permanece abierta. Tampoco se debe decir que la criptografía “funciona porque P≠NP”:

- factorización y logaritmo discreto no son problemas conocidos como NP-completos;
- la existencia de funciones unidireccionales requiere supuestos más específicos;
- una primitiva puede fallar por protocolo o implementación aun si el problema subyacente es difícil.

### 3.7 Bits de seguridad y fuerza bruta

Para una clave ideal de \(k\) bits hay:

```text
2^k claves posibles
```

En promedio, una búsqueda exhaustiva clásica prueba aproximadamente \(2^{k-1}\) claves. Los **bits de seguridad** expresan, en escala logarítmica, el costo del mejor ataque conocido; no tienen por qué coincidir con la longitud nominal de la clave.

Paralelizar divide el tiempo de pared, no elimina el trabajo total. También aparecen costos de memoria, comunicación y energía.

### 3.8 El modelo cuántico

El algoritmo de Grover ofrece una aceleración cuadrática ideal para búsqueda no estructurada:

```text
2^k  →  aproximadamente 2^(k/2) consultas
```

Decir que “reduce a la mitad los bits” es una primera aproximación, no una estimación física completa.

El algoritmo de Shor resuelve factorización y logaritmo discreto en tiempo polinómico en un computador cuántico adecuado. Esto amenaza RSA, Diffie–Hellman clásico y ECC, pero no implica que toda la criptografía quede inutilizada.

## 4. Pilar III · Teoría de números y álgebra

### 4.1 Grupos cíclicos

Un grupo combina una operación asociativa, una identidad y un inverso para cada elemento. Si un elemento \(g\) genera todos los elementos mediante potencias, el grupo es cíclico.

Para un primo \(p\), el grupo multiplicativo:

```text
ℤp* = {1, 2, ..., p-1}
```

tiene orden \(p-1\), no \(p\). Diffie–Hellman suele trabajar en un subgrupo de orden primo \(q\) que divide \(p-1\). La dificultad relevante es recuperar \(x\) a partir de:

```text
y = g^x
```

Este es el problema del logaritmo discreto.

### 4.2 Cuerpos finitos

Un cuerpo permite sumar, restar, multiplicar y dividir por elementos no nulos. AES opera sobre bytes interpretados como elementos de:

```text
GF(2^8)
```

La suma es XOR. La multiplicación se realiza con polinomios binarios reducidos por un polinomio irreducible. Esta estructura hace precisas e invertibles las transformaciones del cifrador.

### 4.3 Curvas elípticas

Sobre un cuerpo finito, una curva corta de Weierstrass tiene la forma:

```text
y² = x³ + ax + b
```

con una condición que evita singularidades. Sus puntos y el punto en el infinito forman un grupo. La multiplicación escalar:

```text
Q = kP
```

es eficiente; recuperar \(k\) a partir de \(P\) y \(Q\) es el problema del logaritmo discreto en curvas elípticas.

### 4.4 Retículos y LWE

Un retículo es el conjunto de combinaciones enteras de vectores base. Varios problemas geométricos en retículos sustentan construcciones poscuánticas.

Learning With Errors (LWE) oculta un secreto \(s\) mediante ecuaciones modulares ruidosas:

```text
b = A·s + e mod q
```

Sin el error \(e\), resolver el sistema sería álgebra lineal modular ordinaria. El ruido controlado cambia la naturaleza del problema.

## 5. Cómo se conectan los pilares

| Primitiva o idea | Información | Complejidad | Estructura |
|---|---|---|---|
| One-time pad | Secreto perfecto | No depende de límite de cómputo | XOR |
| Cifrado por bloques | Oculta patrones dentro de un modelo | Resistencia a adversarios eficientes | Cuerpos finitos, permutaciones |
| Diffie–Hellman | Establece material secreto | Supuesto de logaritmo discreto | Grupo cíclico |
| ECC | Intercambio y firma | Logaritmo discreto elíptico | Grupo de puntos de una curva |
| ML-KEM / ML-DSA | Encapsulación / firma | Supuestos basados en módulos y retículos | Aritmética modular y retículos |

Ningún pilar reemplaza a los demás:

- la teoría de la información define qué se revela;
- la complejidad limita lo que el atacante puede calcular;
- el álgebra construye el espacio operativo;
- la ingeniería determina si el sistema real conserva esas propiedades.

## 6. Amenazas fuera del modelo matemático

Una prueba de seguridad no corrige automáticamente:

- nonces repetidos;
- claves débiles o filtradas;
- comparación de tags vulnerable;
- errores de protocolo;
- canales laterales de tiempo, potencia o caché;
- fallos de memoria;
- dependencia insegura;
- mala gestión del ciclo de vida de claves.

> **Regla profesional:** usar estándares vigentes, APIs de alto nivel y bibliotecas mantenidas. Los laboratorios de este módulo son modelos educativos, no implementaciones para producción.

## 7. Ruta de estudio

1. Leer la teoría integrada.
2. Explorar entropía y secreto perfecto.
3. Comparar PRNG y CSPRNG.
4. Observar confusión, difusión y avalancha.
5. Jugar el experimento de indistinguibilidad.
6. Traducir bits de seguridad en costos.
7. Operar con cuerpos, grupos, curvas y LWE.
8. Reconstruir los mapas mentales.
9. Repasar el glosario.
10. Resolver la evaluación formativa.

[Abrir el Módulo 2 interactivo](../../simuladores/modulo-02/) · [Comenzar la ruta guiada](../../simuladores/modulo-02/ruta-guiada.html) · [Reforzar fundamentos matemáticos](../../simuladores/fundamentos-matematicos/)

## 8. Fuentes primarias y estándares

- [C. E. Shannon, Communication Theory of Secrecy Systems](https://ieeexplore.ieee.org/document/6769090)
- [Stephen Cook, The P versus NP Problem](https://www.claymath.org/wp-content/uploads/2022/06/pvsnp.pdf)
- [Peter Shor, Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer](https://arxiv.org/abs/quant-ph/9508027)
- [Oded Regev, On Lattices, Learning with Errors, Random Linear Codes, and Cryptography](https://cims.nyu.edu/~regev/papers/qcrypto.pdf)
- [NIST FIPS 197, Advanced Encryption Standard](https://csrc.nist.gov/pubs/fips/197/final)
- [NIST FIPS 203, Module-Lattice-Based Key-Encapsulation Mechanism Standard](https://csrc.nist.gov/pubs/fips/203/final)
- [NIST FIPS 204, Module-Lattice-Based Digital Signature Standard](https://csrc.nist.gov/pubs/fips/204/final)
- [NIST SP 800-90A Rev. 1, Deterministic Random Bit Generators](https://csrc.nist.gov/pubs/sp/800/90/a/r1/final)

---

[⬅️ Criptografía clásica](./01-criptografia-clasica.md) · [Fundamentos matemáticos](./02-fundamentos-matematicos.md) · [Criptografía moderna aplicada ➡️](./03-criptografia-moderna.md)
