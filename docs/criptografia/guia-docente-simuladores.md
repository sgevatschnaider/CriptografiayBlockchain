# Guía docente para los laboratorios interactivos

## Propósito

Los simuladores complementan la ruta teórica con experimentos observables. No buscan reemplazar demostraciones matemáticas, estándares ni bibliotecas profesionales. Su función es volver visibles los supuestos, propiedades y fallas de cada mecanismo.

## Formato sugerido de clase

Una sesión de 75 a 90 minutos puede organizarse así:

1. **Activación conceptual — 10 minutos.** Presentar la pregunta rectora y pedir una predicción.
2. **Demostración guiada — 15 minutos.** Ejecutar un caso simple y explicar las métricas.
3. **Exploración en parejas — 25 minutos.** Modificar parámetros con una variable por vez.
4. **Ataque o falla — 15 minutos.** Provocar un resultado inseguro o inconsistente.
5. **Puesta en común — 10 minutos.** Comparar explicaciones, no solo resultados.
6. **Cierre evaluativo — 10 minutos.** Responder una pregunta de transferencia.

## Módulo 1 — Criptografía clásica

**Pregunta rectora:** ¿por qué un cifrado puede parecer ilegible y seguir siendo fácil de romper?

**Objetivos**

- Diferenciar sustitución monoalfabética y polialfabética.
- Relacionar redundancia lingüística con criptoanálisis.
- Comprender por qué un espacio de claves pequeño permite fuerza bruta.

**Actividad central**

1. Cifrar un párrafo con César.
2. Comparar histogramas del texto claro y cifrado.
3. Ejecutar el ataque de 26 claves.
4. Repetir con Vigenère y discutir qué información adicional necesitaría el atacante.

**Evidencia de aprendizaje:** explicación escrita de por qué preservar frecuencias debilita una sustitución simple.

## Módulo 2 — Fundamentos de la criptografía moderna

**Pregunta rectora:** ¿cómo se transforma una intuición de secreto en una propiedad medible frente a un adversario definido?

**Objetivos**

- Distinguir seguridad informal, secreto perfecto y seguridad computacional.
- Relacionar entropía, redundancia e información mutua con el modelo de Shannon.
- Distinguir fuente de entropía, PRNG de propósito general y CSPRNG o DRBG.
- Formular propiedad, adversario, condición de victoria y recursos.
- Explicar la reversibilidad de XOR y diferenciar desplazamiento, bloques y flujo.
- Comprobar por qué reutilizar un contador o keystream expone relaciones entre mensajes.
- Conectar complejidad y estructuras algebraicas con primitivas modernas.

**Actividad central — apertura y puente aplicado**

1. Comparar el mismo mensaje con César, one-time pad y AES-GCM.
2. Antes de revelar la respuesta, predecir cuál puede ofrecer secreto perfecto y bajo qué condiciones.
3. Enumerar las 25 claves de César y discutir por qué “parece ilegible” no es una definición.
4. Comparar un PRNG lineal con un CSPRNG, repetir la semilla y predecir la salida del generador débil.
5. Contrastar la entropía efectiva de un PIN, una marca temporal y 128 bits producidos por el sistema.
6. Manipular dos bytes con AND, OR y XOR; aplicar XOR por segunda vez para recuperar el mensaje.
7. Ejecutar AES-CTR con el mismo contador para dos mensajes y verificar \(C_1 \oplus C_2 = M_1 \oplus M_2\).
8. Repetir con contadores distintos y separar confidencialidad de autenticación.

**Evidencia de aprendizaje:** explicación oral o escrita que compare César, OTP y AES-GCM mediante cuatro elementos explícitos —propiedad, adversario, victoria y recursos—, distinga apariencia estadística de impredecibilidad e interprete la igualdad observada al reutilizar el contador.

**Extensión:** la ruta guiada de trece estaciones permite distribuir teoría, simulaciones, mapas, glosario y cuestionario en varias clases o utilizarlos como trabajo autónomo.

## Módulo 3 — Criptografía moderna

**Clase guiada disponible:** [De la contraseña a AES-GCM](./clase-03-kdf-aes-gcm.md) · [Abrir recorrido interactivo](../../simuladores/modulo-03/ruta-guiada.html)

**Pregunta rectora:** ¿cómo se transforma una contraseña humana en una clave utilizable y cómo detecta el receptor una modificación?

**Objetivos**

- Diferenciar contraseña, clave y entropía.
- Usar PBKDF2 y comprender el papel de salt, costo y normalización NFC.
- Distinguir el bloque AES de la longitud de clave.
- Comparar CBC, CTR, GCM y XTS.
- Cifrar un archivo local y verificar el tag.
- Reconstruir conceptualmente la arquitectura de VeraCrypt.

**Actividad central**

1. Derivar dos veces con los mismos parámetros y comparar claves.
2. Cambiar solamente la salt y repetir.
3. Ejecutar AES-CBC, AES-CTR y AES-GCM con Web Crypto.
4. Alterar ciphertext, IV o nonce, AAD y tag.
5. Cifrar, exportar, importar y recuperar un archivo ficticio.
6. Alterar un bit del paquete y observar el rechazo de GCM.

**Evidencia de aprendizaje:** explicación que distinga KDF, clave, modo y tag; identifique los campos públicos del paquete y justifique por qué “descifrar” no equivale a “autenticar”.

**Extensión:** el laboratorio integral conserva SHA-256, HKDF y ECDSA para ampliar la clase o trabajar de manera autónoma.

## Módulo 4 — Esteganografía

**Pregunta rectora:** ¿ocultar la existencia de un mensaje equivale a proteger su contenido?

**Objetivos**

- Insertar y extraer datos mediante LSB.
- Medir capacidad y distorsión.
- Reconocer fragilidad ante transformaciones.
- Diferenciar esteganografía, cifrado y marcas de agua.

**Actividad central**

- Ocultar un mensaje, descargar el PNG y recuperarlo.
- Alterar la imagen y analizar la extracción.
- Diseñar una secuencia cifrar–autenticar–ocultar.

**Evidencia de aprendizaje:** explicación de por qué una imagen visualmente idéntica puede ser estadísticamente sospechosa.

## Módulo 5 — Criptografía y blockchain

**Pregunta rectora:** ¿qué garantiza una cadena de bloques y qué queda fuera de su alcance?

**Objetivos**

- Comprender el encadenamiento por hashes.
- Observar el costo de Proof-of-Work.
- Detectar manipulación histórica.
- Construir y comparar raíces de Merkle.

**Actividad central**

1. Minar tres bloques.
2. Alterar un bloque intermedio.
3. Validar la cadena.
4. Modificar una transacción y recalcular la raíz Merkle.

**Evidencia de aprendizaje:** distinguir integridad interna, consenso, autorización y veracidad de datos externos.

## Módulo 6 — Protocolos y privacidad

**Pregunta rectora:** ¿cómo distribuir confianza o demostrar conocimiento sin revelar un secreto?

**Objetivos**

- Reconstruir un secreto con un umbral.
- Comprender binding y hiding en commitments.
- Seguir una ronda de identificación de Schnorr.
- Diferenciar ZKP, MPC, secret sharing y cifrado homomórfico.

**Actividad central**

- Crear un esquema 3 de 5.
- Intentar reconstruir con dos y con tres fragmentos.
- Comprometer un valor y alterar la apertura.
- Comparar rondas honestas e intentos de impostor.

**Evidencia de aprendizaje:** tabla que indique qué información conoce cada participante en cada protocolo.

## Módulo 7 — Criptografía poscuántica y cuántica

**Pregunta rectora:** ¿qué debe migrarse, por qué y con qué prioridad?

**Objetivos**

- Diferenciar Shor y Grover.
- Separar criptografía poscuántica de QKD.
- Reconocer ML-KEM, ML-DSA y SLH-DSA por función.
- Priorizar activos según vida del dato y exposición.

**Actividad central**

1. Comparar seguridad simétrica de 128 y 256 bits frente a Grover idealizado.
2. Ejecutar BB84 con y sin interceptación.
3. Reordenar el inventario de migración.
4. Diseñar una estrategia híbrida y reversible.

**Evidencia de aprendizaje:** plan de migración de una página con inventario, riesgo, prueba y rollback.

## Módulo 8 — Seguridad aplicada

**Pregunta rectora:** ¿por qué sistemas con algoritmos correctos fallan en producción?

**Objetivos**

- Comprender el daño de reutilizar nonces o flujos.
- Distinguir CSPRNG y aleatoriedad no criptográfica.
- Evaluar limitaciones de estimadores de contraseñas.
- Integrar amenaza, impacto, exposición y rotación.

**Actividad central**

- Recuperar un mensaje cuando se reutiliza el flujo.
- Repetir con material independiente.
- Evaluar un activo de alto impacto.
- Diseñar un ciclo de rotación y revocación.

**Evidencia de aprendizaje:** checklist técnico-operacional que incluya generación, almacenamiento, uso, rotación, revocación y destrucción.

## Evaluación sugerida

### Rúbrica breve sobre 10 puntos

| Criterio | Puntos |
|---|---:|
| Predicción fundamentada | 2 |
| Ejecución controlada del experimento | 2 |
| Interpretación de métricas | 2 |
| Identificación de supuestos y límites | 2 |
| Transferencia a un caso real | 2 |

### Preguntas integradoras

1. ¿Por qué una primitiva segura puede producir un protocolo inseguro?
2. ¿Qué diferencia existe entre confidencialidad, integridad, autenticidad y ocultamiento?
3. ¿Qué decisiones pertenecen al algoritmo y cuáles a la operación?
4. ¿Cómo cambia el análisis cuando el secreto debe conservarse durante veinte años?
5. ¿Qué componentes deben ser reemplazables para lograr agilidad criptográfica?

## Recomendaciones de seguridad

- No utilizar secretos, credenciales o datos personales reales.
- Ejecutar los laboratorios modernos mediante HTTPS o un servidor local seguro.
- Tratar los parámetros pequeños y protocolos simplificados como modelos didácticos.
- No presentar los simuladores como implementaciones certificadas o aptas para producción.
- Consultar estándares y documentación oficial antes de diseñar un sistema real.

---

[⬅️ Volver al campus teórico](./README.md) · [Abrir simuladores](../../simuladores/index.html)
