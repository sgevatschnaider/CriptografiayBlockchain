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

## Módulo 2 — Fundamentos matemáticos

**Pregunta rectora:** ¿qué estructuras convierten operaciones reversibles para el dueño de una clave en problemas difíciles para un atacante?

**Objetivos**

- Operar con congruencias e inversos.
- Reconocer la condición de coprimalidad.
- Comprender el flujo lógico de Diffie–Hellman.
- Diferenciar entropía estadística y seguridad efectiva.

**Actividad central**

- Encontrar inversos módulo 26.
- Simular Diffie–Hellman con un primo pequeño.
- Cambiar parámetros y detectar configuraciones problemáticas.

**Evidencia de aprendizaje:** justificar por qué un multiplicador no coprimo invalida un cifrado afín.

## Módulo 3 — Criptografía moderna

**Pregunta rectora:** ¿por qué hash, cifrado autenticado y firma digital resuelven problemas diferentes?

**Objetivos**

- Observar el efecto avalancha.
- Usar AES-GCM y comprender el papel de sal, IV y tag.
- Firmar y verificar un documento.
- Identificar fallas de composición.

**Actividad central**

1. Comparar dos hashes con un carácter de diferencia.
2. Cifrar dos veces el mismo mensaje.
3. Alterar el criptograma y observar el fallo de autenticación.
4. Modificar un documento firmado y volver a verificar.

**Evidencia de aprendizaje:** matriz que asigne confidencialidad, integridad y autenticidad a cada primitiva.

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
