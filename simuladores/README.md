# 🔬 Laboratorios interactivos de criptografía

Esta carpeta reúne ocho simuladores HTML que complementan los módulos teóricos del repositorio.

## Acceso web directo

GitHub muestra el código fuente cuando se abre un archivo `.html` desde la vista del repositorio. Para **ejecutar** los laboratorios se utiliza GitHub Pages:

- [Abrir la portada del proyecto](https://sgevatschnaider.github.io/CriptografiayBlockchain/)
- [Abrir el campus interactivo](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/)

## Laboratorios

| Módulo | Simulación ejecutable | Experimentos principales |
|---|---|---|
| 1 | [Criptografía clásica](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/01-criptografia-clasica.html) | César, Vigenère, frecuencias, índice de coincidencia y fuerza bruta |
| 2 | [Fundamentos matemáticos](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/02-fundamentos-matematicos.html) | Congruencias, inversos, Euclides extendido, Diffie–Hellman y entropía |
| 3 | [Criptografía moderna](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/03-criptografia-moderna.html) | SHA-256, AES-GCM, PBKDF2 y ECDSA mediante Web Crypto |
| 4 | [Esteganografía](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/04-esteganografia.html) | Inserción LSB, extracción, capacidad, PSNR y distorsión |
| 5 | [Blockchain](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/05-blockchain.html) | Prueba de trabajo, encadenamiento, validación y Merkle trees |
| 6 | [Protocolos y privacidad](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/06-protocolos-privacidad.html) | Shamir, compromisos hash y Schnorr simplificado |
| 7 | [Poscuántica y cuántica](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/07-poscuantica-cuantica.html) | Grover, BB84, estándares NIST y estrategia de migración |
| 8 | [Seguridad aplicada](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/08-seguridad-aplicada.html) | Nonces, CSPRNG, secretos, amenazas y ciclo de vida de claves |

## Diseño pedagógico

Cada laboratorio sigue cinco momentos:

1. **Predicción:** anticipar el resultado antes de ejecutar.
2. **Experimentación:** modificar parámetros de forma controlada.
3. **Interpretación:** relacionar métricas con propiedades de seguridad.
4. **Ataque o falla:** explorar el límite del mecanismo.
5. **Transferencia:** conectar el hallazgo con sistemas reales.

## Calidad técnica común

Los laboratorios comparten `assets/lab.css` y `assets/lab.js`, que proporcionan:

- diseño responsivo para escritorio y dispositivos móviles;
- navegación consistente y controles aptos para teclado;
- asociación entre etiquetas y campos;
- regiones accesibles para resultados y errores;
- detección de Web Crypto y contexto HTTPS;
- manejo visible de excepciones y promesas rechazadas;
- utilidades criptográficas y matemáticas encapsuladas;
- generación aleatoria sin sesgo modular para los rangos didácticos.

## Arquitectura

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

Los laboratorios no requieren instalación. Las funciones criptográficas modernas deben ejecutarse en un contexto seguro, como GitHub Pages mediante HTTPS o un servidor local.

## Validación

El script `scripts/validate-simulators.mjs` revisa automáticamente:

- existencia de todos los archivos;
- estructura HTML básica;
- sintaxis de JavaScript;
- enlaces locales;
- identificadores duplicados;
- importación de utilidades compartidas;
- presencia de elementos pedagógicos y de retroalimentación.

La acción `.github/workflows/pages.yml` ejecuta esta validación en cada pull request y publica el sitio después de actualizar `main`.

## Alcance de seguridad

- Los cifrados clásicos, Diffie–Hellman con números pequeños, Schnorr simplificado, blockchain didáctica y reutilización de flujo son modelos educativos.
- AES-GCM, PBKDF2, SHA-256, ECDSA y el generador aleatorio se invocan mediante primitivas del navegador, pero la interfaz no es una aplicación de producción.
- El módulo poscuántico describe estándares y migración; no implementa ML-KEM, ML-DSA ni SLH-DSA.
- No deben introducirse secretos, claves o datos reales en estos laboratorios.

## Material docente

La [guía docente](../docs/criptografia/guia-docente-simuladores.md) contiene objetivos, tiempos, consignas y criterios de evaluación por módulo.
