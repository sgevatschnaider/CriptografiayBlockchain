# 07 · Criptografía poscuántica y criptografía cuántica

**Criptografía poscuántica (PQC)** y **criptografía cuántica** no son sinónimos.

- La criptografía poscuántica usa algoritmos clásicos diseñados para resistir ataques de computadoras cuánticas.
- La criptografía cuántica usa propiedades físicas cuánticas, por ejemplo para distribución de claves.

Esta distinción es esencial para evitar confusiones conceptuales y decisiones tecnológicas incorrectas.

## 1. Qué amenaza cambia con la computación cuántica

### Algoritmo de Shor

Un computador cuántico suficientemente grande y tolerante a fallos podría resolver eficientemente factorización y logaritmos discretos. Esto amenaza:

- RSA;
- Diffie–Hellman clásico;
- DSA;
- ECDH;
- ECDSA y otras firmas sobre curvas elípticas.

### Algoritmo de Grover

Ofrece una aceleración cuadrática para búsquedas exhaustivas. Afecta de forma más moderada a criptografía simétrica y hashes.

Interpretación aproximada:

```text
búsqueda clásica: 2^k
búsqueda con Grover: 2^(k/2)
```

Por ello, claves simétricas más largas —por ejemplo AES-256 en escenarios de larga duración— proporcionan margen frente a este tipo de amenaza.

## 2. Harvest now, decrypt later

Un adversario puede capturar hoy información cifrada y conservarla para intentar descifrarla en el futuro. Por eso la transición no debe comenzar únicamente cuando exista una máquina capaz de romper RSA o ECC.

La prioridad depende de:

- vida útil del secreto;
- exposición actual del tráfico;
- tiempo necesario para migrar sistemas;
- dependencia de proveedores y hardware;
- dificultad para rotar certificados, claves y formatos.

## 3. Familias poscuánticas

### Basadas en retículos

Utilizan problemas como Learning With Errors y variantes modulares. Ofrecen buen rendimiento y constituyen la base de estándares centrales.

### Basadas en hashes

Construyen firmas a partir de propiedades de funciones hash. Suelen tener fundamentos conservadores, aunque los tamaños y costos varían.

### Basadas en códigos

Se apoyan en problemas de decodificación de códigos. Algunas propuestas tienen claves públicas grandes, pero ofrecen diversidad matemática.

### Multivariadas y otras familias

Usan sistemas de polinomios multivariados u otros problemas. La historia reciente demuestra que la diversidad de supuestos y el criptoanálisis público son indispensables.

## 4. Estándares NIST publicados

En agosto de 2024 NIST publicó los primeros tres estándares federales de criptografía poscuántica:

| Estándar | Algoritmo | Función |
|---|---|---|
| FIPS 203 | ML-KEM | Encapsulación de claves |
| FIPS 204 | ML-DSA | Firma digital basada en retículos |
| FIPS 205 | SLH-DSA | Firma digital basada en hashes |

Referencias oficiales:

- [NIST FIPS 203 — ML-KEM](https://csrc.nist.gov/pubs/fips/203/final)
- [NIST FIPS 204 — ML-DSA](https://csrc.nist.gov/pubs/fips/204/final)
- [NIST FIPS 205 — SLH-DSA](https://csrc.nist.gov/pubs/fips/205/final)
- [Proyecto de Criptografía Poscuántica de NIST](https://csrc.nist.gov/projects/post-quantum-cryptography)

## 5. KEM no es cifrado directo

ML-KEM es un **Key Encapsulation Mechanism**. Su función principal es establecer un secreto compartido que luego alimenta una KDF y un cifrado simétrico autenticado.

Flujo conceptual:

```text
ML-KEM → secreto compartido → KDF → clave AEAD → datos cifrados
```

No debe presentarse como un reemplazo directo de AES.

## 6. Migración híbrida

Durante la transición pueden combinarse mecanismos clásicos y poscuánticos. Una construcción híbrida busca que el secreto permanezca protegido mientras al menos uno de los componentes sea seguro.

Sin embargo, combinar algoritmos no es simplemente concatenarlos. Deben usarse combinadores y protocolos bien especificados, con:

- derivación de claves correcta;
- separación de dominios;
- negociación resistente a downgrade;
- formatos versionados;
- pruebas de interoperabilidad;
- inventario y rotación de activos criptográficos.

## 7. Crypto-agility

La agilidad criptográfica es la capacidad de reemplazar algoritmos y parámetros sin rediseñar todo el sistema.

Plan recomendado:

1. inventariar dónde se usa criptografía;
2. clasificar datos por vida útil y criticidad;
3. eliminar algoritmos obsoletos;
4. desacoplar identidad, protocolo y algoritmo;
5. probar formatos y certificados poscuánticos;
6. medir impacto en ancho de banda, latencia y almacenamiento;
7. planificar rotación y recuperación;
8. monitorear estándares oficiales.

## 8. Criptografía cuántica y QKD

Quantum Key Distribution permite que dos partes generen material secreto y detecten ciertas formas de espionaje gracias a propiedades de medición cuántica.

### BB84

BB84 utiliza estados preparados en bases diferentes. La medición de un espía altera estadísticas observables, permitiendo estimar la tasa de error y decidir si la clave debe descartarse.

QKD no reemplaza por sí sola:

- autenticación de las partes;
- protección de endpoints;
- cifrado de datos;
- gestión de claves;
- seguridad del hardware;
- disponibilidad de la red.

Además, requiere infraestructura física especializada y enfrenta límites de distancia, costo, integración y ataques de implementación.

## 9. Aleatoriedad cuántica

Los generadores cuánticos de números aleatorios intentan obtener entropía de fenómenos cuánticos. Aun así, un sistema seguro requiere:

- caracterización de la fuente;
- extracción de aleatoriedad;
- pruebas de salud;
- protección frente a fallos o manipulación;
- integración correcta con DRBG y gestión de claves.

“Cuántico” no equivale automáticamente a “seguro”.

## 10. Impacto en blockchain

La transición poscuántica en blockchain afecta:

- firmas de transacciones;
- esquemas de direcciones;
- tamaños de bloques y pruebas;
- hardware wallets;
- contratos ya desplegados;
- activos inmovilizados;
- mecanismos multisig y puentes;
- gobernanza de upgrades.

Una migración puede requerir firmas híbridas, nuevos tipos de cuenta, ventanas de movimiento de fondos y reglas para claves antiguas.

## Laboratorios sugeridos

- Comparar tamaños y funciones de ML-KEM, ML-DSA y SLH-DSA.
- Diseñar un inventario de dependencias RSA/ECC en una organización.
- Modelar un handshake híbrido clásico-poscuántico.
- Simular conceptualmente BB84 y medir cómo la intercepción aumenta la tasa de error.
- Elaborar un plan de crypto-agility para una wallet o una PKI.

> La transición poscuántica es un problema de arquitectura y gestión de riesgos, no solo de sustitución algorítmica.

---

[⬅️ Privacidad y protocolos](./06-protocolos-privacidad.md) · [Campus](./README.md) · [Seguridad aplicada ➡️](./08-seguridad-aplicada.md)
