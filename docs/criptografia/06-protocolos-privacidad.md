# 06 · Protocolos de privacidad y criptografía avanzada

Las primitivas básicas —hashes, cifrado, MAC y firmas— se combinan para resolver problemas más complejos: demostrar conocimiento sin revelar secretos, calcular sobre datos protegidos o distribuir confianza entre varias partes.

## 1. Compromisos criptográficos

Un esquema de compromiso tiene dos fases:

1. **commit:** una parte fija un valor sin revelarlo;
2. **open:** más tarde revela el valor y la información necesaria para verificarlo.

Propiedades:

- **hiding:** el compromiso no revela el valor;
- **binding:** quien se comprometió no puede cambiarlo después.

Aplicaciones: votación, subastas, protocolos de sorteo, pruebas de conocimiento cero y esquemas commit-reveal en blockchain.

## 2. Compartición de secretos

Secret sharing divide un secreto en fragmentos. En el esquema de Shamir, cualquier conjunto de al menos `t` participantes entre `n` puede reconstruirlo, mientras que menos de `t` no obtiene información suficiente.

```text
(t,n)-threshold
```

Se basa en interpolación polinómica sobre un campo finito. Es útil para recuperación de claves, custodia institucional y eliminación de puntos únicos de falla.

## 3. Criptografía umbral

A diferencia de reconstruir el secreto y usarlo, la criptografía umbral permite que varias partes cooperen para firmar o descifrar sin que la clave completa exista en un único lugar.

Aplicaciones:

- custodios de activos digitales;
- autoridades certificantes;
- infraestructura crítica;
- validadores y puentes blockchain;
- administración descentralizada.

## 4. Pruebas de conocimiento cero

Una Zero-Knowledge Proof permite demostrar que una afirmación es verdadera sin revelar el secreto que la hace verdadera.

Propiedades clásicas:

- **completitud:** una afirmación verdadera puede demostrarse;
- **solidez:** una afirmación falsa no debería aceptarse salvo probabilidad despreciable;
- **conocimiento cero:** el verificador no aprende información adicional relevante.

Tipos y familias:

- pruebas interactivas;
- Fiat–Shamir para transformar ciertos protocolos en no interactivos;
- zk-SNARKs;
- zk-STARKs;
- Bulletproofs;
- sistemas basados en polinomios y compromisos.

No existe una tecnología universalmente mejor: cambian tamaño de prueba, tiempo de generación, verificación, confianza inicial, transparencia y supuestos criptográficos.

## 5. Multi-Party Computation

MPC permite que varias partes calculen una función conjunta sin revelar sus entradas privadas.

Ejemplo conceptual: varias empresas calculan un promedio salarial sectorial sin compartir sus bases individuales.

Técnicas relacionadas:

- circuitos garbled;
- secret sharing;
- oblivious transfer;
- protocolos honest-majority o dishonest-majority;
- seguridad semi-honesta o maliciosa.

El modelo de amenaza debe indicar cuántas partes pueden coludirse y qué comportamiento adversario se admite.

## 6. Cifrado homomórfico

Permite realizar operaciones sobre ciphertexts y obtener, al descifrar, el resultado equivalente a operar sobre los datos claros.

Categorías:

- parcialmente homomórfico;
- somewhat homomorphic;
- fully homomorphic encryption.

FHE ofrece gran expresividad, pero presenta costos de cómputo, memoria y complejidad. Es una herramienta especializada, no una sustitución automática de todos los sistemas de datos.

## 7. Private Set Intersection

PSI permite determinar la intersección entre conjuntos sin revelar elementos que no pertenecen a la intersección.

Aplicaciones:

- detección de fraude entre instituciones;
- comparación de listas de riesgo;
- medición publicitaria con privacidad;
- descubrimiento de contactos;
- investigación médica colaborativa.

## 8. Oblivious Transfer y PIR

- **Oblivious Transfer:** el receptor obtiene uno de varios mensajes sin que el emisor sepa cuál eligió, y sin aprender los demás.
- **Private Information Retrieval:** permite consultar una base sin revelar qué elemento se está buscando.

Son componentes importantes de protocolos más amplios de privacidad.

## 9. Credenciales y divulgación selectiva

Las credenciales verificables pueden permitir demostrar atributos específicos —por ejemplo, ser mayor de edad— sin revelar toda la identidad o fecha de nacimiento.

La privacidad real requiere analizar:

- correlación entre presentaciones;
- identificadores persistentes;
- revocación;
- metadata de red;
- confianza en emisores;
- posibilidad de vinculación entre transacciones.

## 10. Límites de la privacidad criptográfica

La criptografía protege contenidos y relaciones formales, pero no elimina automáticamente:

- filtraciones por metadatos;
- inferencias estadísticas;
- errores de endpoint;
- coerción del usuario;
- claves comprometidas;
- datos incorrectos de origen;
- sesgos del modelo o del protocolo.

## Laboratorios sugeridos

- Construir un compromiso hash con salt y fase de apertura.
- Simular Shamir Secret Sharing con parámetros pequeños.
- Explorar el protocolo Fiat–Shamir ya presente en el repositorio.
- Comparar zk-SNARK, zk-STARK y Bulletproofs mediante una matriz de trade-offs.
- Diseñar conceptualmente un PSI entre dos organizaciones.

---

[⬅️ Criptografía y blockchain](./05-criptografia-blockchain.md) · [Campus](./README.md) · [Poscuántica y cuántica ➡️](./07-poscuantica-y-cuantica.md)
