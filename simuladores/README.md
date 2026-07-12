# 🔬 Laboratorios interactivos de criptografía

Esta carpeta reúne ocho simuladores HTML autónomos que complementan los módulos teóricos del repositorio.

## Acceso

- [Abrir el campus interactivo](./index.html)
- En GitHub Pages: `https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/`

## Laboratorios

| Módulo | Simulador | Experimentos principales |
|---|---|---|
| 1 | [Criptografía clásica](./01-criptografia-clasica.html) | César, Vigenère, frecuencias y fuerza bruta |
| 2 | [Fundamentos matemáticos](./02-fundamentos-matematicos.html) | Congruencias, inversos, Diffie–Hellman y entropía |
| 3 | [Criptografía moderna](./03-criptografia-moderna.html) | SHA-256, AES-GCM, PBKDF2 y ECDSA |
| 4 | [Esteganografía](./04-esteganografia.html) | Inserción LSB, extracción, capacidad y distorsión |
| 5 | [Blockchain](./05-blockchain.html) | Minería, encadenamiento, validación y Merkle trees |
| 6 | [Protocolos y privacidad](./06-protocolos-privacidad.html) | Shamir, commitments y Schnorr simplificado |
| 7 | [Poscuántica y cuántica](./07-poscuantica-cuantica.html) | Grover, BB84, estándares NIST y migración |
| 8 | [Seguridad aplicada](./08-seguridad-aplicada.html) | Nonces, CSPRNG, secretos, amenazas y claves |

## Diseño pedagógico

Cada laboratorio sigue cinco momentos:

1. **Predicción:** anticipar el resultado antes de ejecutar.
2. **Experimentación:** modificar parámetros de forma controlada.
3. **Interpretación:** relacionar métricas con propiedades de seguridad.
4. **Ataque o falla:** explorar el límite del mecanismo.
5. **Transferencia:** conectar el hallazgo con sistemas reales.

## Arquitectura técnica

```text
simuladores/
├── index.html
├── 01-criptografia-clasica.html
├── 02-fundamentos-matematicos.html
├── 03-criptografia-moderna.html
├── 04-esteganografia.html
├── 05-blockchain.html
├── 06-protocolos-privacidad.html
├── 07-poscuantica-cuantica.html
├── 08-seguridad-aplicada.html
└── assets/
    ├── lab.css
    └── lab.js
```

Los laboratorios no requieren instalación. Las funciones criptográficas reales de los módulos modernos utilizan la Web Cryptography API y, por lo tanto, deben ejecutarse en un contexto seguro, como GitHub Pages mediante HTTPS o un servidor local.

## Alcance de seguridad

- Los cifrados clásicos, Diffie–Hellman con números pequeños, Schnorr simplificado, blockchain didáctica y reutilización de flujo son modelos educativos.
- AES-GCM, PBKDF2, SHA-256, ECDSA y el generador aleatorio se invocan mediante las primitivas del navegador, pero la interfaz sigue siendo material docente y no una aplicación de producción.
- El módulo poscuántico describe estándares y migración; no implementa ML-KEM, ML-DSA ni SLH-DSA.
- No deben introducirse secretos, claves o datos reales en estos laboratorios.

## Material docente

La [guía docente](../docs/criptografia/guia-docente-simuladores.md) contiene objetivos, tiempos, consignas y criterios de evaluación por módulo.
