# Plan de desarrollo de simuladores

Este documento organiza la ampliación del laboratorio académico-profesional. El repositorio no representa un curso particular: ofrece recursos reutilizables para docencia, investigación, divulgación y portfolio técnico.

## Criterio común

Cada simulador debe contener ocho capas:

1. **Pregunta rectora.** Qué problema de seguridad intenta responder.
2. **Modelo.** Supuestos, alfabeto, dominio matemático y parámetros.
3. **Transformación.** Ejecución visible paso a paso.
4. **Métrica.** Evidencia cuantitativa relevante.
5. **Ataque o falla.** Condición que debilita el mecanismo.
6. **Interpretación.** Qué demuestra y qué no demuestra.
7. **Transferencia.** Relación con protocolos y sistemas reales.
8. **Alcance.** Advertencia explícita cuando el modelo es educativo.

## Estado y prioridades

| Prioridad | Simulador | Experimento central | Métricas o evidencia |
|---|---|---|---|
| Alta | César castellano | Cifrar, descifrar y probar 27 claves | χ², espacio de claves, traza modular |
| Alta | Cifrado afín | Explorar coprimalidad y fuerza bruta | mcd, inverso, 312 claves válidas |
| Alta | Transposición y escítala | Cambiar posiciones sin alterar símbolos | frecuencias preservadas, permutación |
| Alta | Vigenère | Variar longitud y reutilización de clave | IC, Kasiski, análisis por columnas |
| Alta | Vernam/OTP | Reutilizar una clave sobre dos mensajes | `C1 XOR C2 = M1 XOR M2` |
| Media | Enigma | Rotores, reflector, plugboard y criba | espacio de configuración, restricciones |
| Media | Hashes | Alterar un bit y observar avalancha | distancia de Hamming |
| Media | AES-GCM | Reutilización de nonce y alteración del tag | autenticación, fallo de verificación |
| Media | Contraseñas y KDF | Cambiar sal, costo e iteraciones | tiempo, memoria, entropía estimada |
| Media | RSA/DH/ECC | Comparar funciones y parámetros | tamaño, costo, objetivo criptográfico |
| Alta | Blockchain y Merkle | Alterar transacciones y bloques | hashes, raíz Merkle, validez de cadena |
| Media | Consenso | Comparar PoW, PoS y fallas bizantinas | seguridad, energía, supuestos |
| Media | Firmas y wallets | Firmar, verificar y derivar direcciones | autenticidad, integridad, custodia |
| Media | Shamir y Schnorr | Umbral e identificación | conocimiento distribuido, probabilidad de engaño |
| Media | Poscuántica | Inventario y migración híbrida | vida del dato, prioridad, crypto-agility |

## Reglas técnicas

- No reconstruir información que el cifrado eliminó. Por ejemplo, un texto clásico sin espacios no permite recuperar inequívocamente las fronteras originales entre palabras.
- No ocultar excepciones ni reutilizar valores calculados previamente.
- Validar dominios matemáticos antes de ejecutar: inversos, coprimalidad, tamaños y nonces.
- Diferenciar resultados exactos de rankings probabilísticos.
- Incorporar pruebas automatizadas para ejemplos conocidos y casos límite.
- Mantener compatibilidad con teclado, lectores de pantalla y `prefers-reduced-motion`.
- Evitar dependencias externas cuando no sean necesarias; usar Web Crypto para primitivas modernas.

## Convención de alfabetos

Los laboratorios deben declarar el alfabeto y el módulo de forma visible:

- **Modelo internacional normalizado:** `A–Z`, `m = 26`, tildes y Ñ normalizadas.
- **Modelo castellano:** `A–Z + Ñ`, `m = 27`.

No deben mezclarse ejemplos calculados con módulos distintos. Un mismo cifrado puede ofrecer ambos modelos, pero cada resultado debe indicar cuál se utilizó.

## Integración con videos

Cada módulo puede incorporar una sección `Ver antes / Ver después / Preguntas de observación`. Los enlaces deben revisarse antes de publicarse para confirmar:

- disponibilidad;
- autoría y fuente;
- duración;
- idioma y subtítulos;
- correspondencia con el contenido del módulo;
- ausencia de afirmaciones técnicas desactualizadas.

No se encontraron enlaces de video en el repositorio al crear esta hoja de ruta. Deben incorporarse únicamente después de su revisión individual.
