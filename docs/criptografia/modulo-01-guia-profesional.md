# Módulo 1 · Criptografía clásica y nacimiento del criptoanálisis

## Propósito

Este módulo no presenta los cifrados clásicos como mecanismos vigentes de protección, sino como un laboratorio para comprender la relación entre **clave, transformación, estructura y ataque**.

## Pregunta rectora

> ¿Por qué un mensaje que parece ilegible puede seguir siendo fácil de romper?

## Resultados de aprendizaje

Al finalizar, el visitante debería poder:

1. Diferenciar codificación, cifrado, hash y esteganografía.
2. Distinguir sustitución, transposición, sustitución poligráfica y sustitución polialfabética.
3. Explicar el principio moderno derivado de Kerckhoffs: el algoritmo puede ser público; la seguridad debe depender de la clave y de supuestos explícitos.
4. Aplicar aritmética modular a César y al cifrado afín.
5. Reconocer qué información estadística conserva cada familia.
6. Ejecutar fuerza bruta, análisis de frecuencias, Kasiski e índice de coincidencia.
7. Explicar las condiciones del secreto perfecto en One-Time Pad.
8. Describir el funcionamiento de Enigma y el papel de las cribas en su criptoanálisis.

## Ruta conceptual

### 1. Lenguaje criptográfico

- texto claro y texto cifrado;
- algoritmo y clave;
- cifrado y descifrado;
- criptoanálisis;
- esteganografía y estegoanálisis;
- confidencialidad, integridad, autenticación y evidencia de origen.

### 2. Familias clásicas

| Familia | Qué transforma | Qué suele conservar | Ataque didáctico |
|---|---|---|---|
| Transposición | Posiciones | Frecuencias de símbolos | Reconstrucción de grilla o ruta |
| Sustitución monoalfabética | Símbolos | Patrón estadístico del idioma | Frecuencias y patrones |
| Sustitución poligráfica | Grupos de símbolos | Parte de la estructura local | Análisis de dígrafos |
| Sustitución polialfabética | Alfabetos según posición | Periodicidad de la clave | Kasiski e índice de coincidencia |
| Rotor | Sustitución cambiante | Restricciones mecánicas | Cribas y búsqueda estructurada |

### 3. Sistemas estudiados

- Atbash y Albam;
- escítala y transposición;
- Polibio;
- César;
- afín;
- sustitución monoalfabética;
- Playfair;
- Vigenère;
- Vernam y One-Time Pad;
- Enigma.

## Convenciones de alfabeto

Cada laboratorio debe declarar su convención. No deben mezclarse silenciosamente:

- A–Z: módulo 26;
- A–Z más Ñ: módulo 27;
- Polibio 5×5: combinación I/J u otra convención explícita;
- Vernam histórico: alfabetos telegráficos; versión informática: bytes y XOR.

## Kerckhoffs: lectura histórica y moderna

Los seis principios de 1883 deben presentarse en su contexto militar. La formulación moderna central es:

> Un sistema debe seguir siendo seguro aunque el adversario conozca su diseño; lo que debe protegerse es la clave y su ciclo de vida.

Esto no elimina la importancia de la implementación, la generación aleatoria, los protocolos, la gestión de claves ni el modelo de amenaza.

## Secuencia experimental común

Cada simulación debe seguir este ciclo:

1. Predecir.
2. Configurar el sistema.
3. Observar la transformación.
4. Medir qué estructura se conserva.
5. Ejecutar el ataque o explorar la falla.
6. Interpretar el resultado.
7. Transferir la lección a criptografía moderna.

## Errores frecuentes

- llamar cifrado a Base64;
- creer que ocultar un algoritmo reemplaza la seguridad de la clave;
- confundir bloques tipográficos con palabras originales;
- usar valores de `a` sin inverso en el cifrado afín;
- mezclar módulo 26 y 27;
- creer que Vigenère elimina toda estructura;
- reutilizar una clave One-Time Pad;
- atribuir la ruptura de Enigma a una sola persona;
- confundir Enigma con la Bombe.

## Alcance profesional

Este módulo sirve como base para:

- docencia y divulgación;
- fundamentos de ciberseguridad;
- análisis de patrones y señales;
- diseño de laboratorios reproducibles;
- transición conceptual hacia criptografía simétrica, asimétrica, protocolos y blockchain.

> **Advertencia:** los cifrados clásicos de este módulo son modelos educativos. No deben utilizarse para proteger información real.