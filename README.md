<div align="center">

# ⛓️ Criptografía y Blockchain

### De los cifrados clásicos a la seguridad poscuántica, los protocolos de privacidad y las aplicaciones descentralizadas

[![Abrir sitio](https://img.shields.io/badge/Abrir-Sitio%20interactivo-0ea5e9?style=for-the-badge&logo=html5&logoColor=white)](https://sgevatschnaider.github.io/CriptografiayBlockchain/)
[![Campus](https://img.shields.io/badge/Abrir-Laboratorios-2563eb?style=for-the-badge&logo=googlescholar&logoColor=white)](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/)
[![Guía docente](https://img.shields.io/badge/Leer-Guía%20docente-7c3aed?style=for-the-badge&logo=readthedocs&logoColor=white)](docs/criptografia/guia-docente-simuladores.md)

![GitHub Stars](https://img.shields.io/github/stars/sgevatschnaider/CriptografiayBlockchain?style=flat-square&logo=github)
![GitHub Forks](https://img.shields.io/github/forks/sgevatschnaider/CriptografiayBlockchain?style=flat-square&logo=github)
![Last Commit](https://img.shields.io/github/last-commit/sgevatschnaider/CriptografiayBlockchain?style=flat-square&logo=github)
![Licencia](https://img.shields.io/github/license/sgevatschnaider/CriptografiayBlockchain?style=flat-square)

</div>

Este repositorio es una ruta de aprendizaje teórica, matemática y práctica para comprender cómo se construye la confianza digital. Integra criptografía clásica, criptografía moderna, esteganografía, privacidad avanzada, blockchain, contratos inteligentes, seguridad poscuántica y fundamentos de criptografía cuántica.

> **Principio rector:** un algoritmo criptográfico no es seguro únicamente por su matemática. También importan el protocolo, la generación y custodia de claves, la implementación, el entorno de ejecución y el modelo de amenazas.

---

## 🌐 Visualización directa

Los laboratorios se publican automáticamente mediante **GitHub Pages**. Al pulsar los enlaces de la tabla, el navegador ejecuta el HTML; no se muestra el código fuente del archivo.

**Sitio principal:** https://sgevatschnaider.github.io/CriptografiayBlockchain/

| Módulo | Abrir simulación | Experimentos principales |
|---|---|---|
| **1. Criptografía clásica** | [Ejecutar laboratorio](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/01-criptografia-clasica.html) | César, Vigenère, frecuencias, índice de coincidencia y fuerza bruta |
| **2. Fundamentos matemáticos** | [Ejecutar laboratorio](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/02-fundamentos-matematicos.html) | Congruencias, inversos, Euclides extendido, Diffie–Hellman y entropía |
| **3. Criptografía moderna** | [Ejecutar laboratorio](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/03-criptografia-moderna.html) | SHA-256, PBKDF2, AES-GCM y ECDSA mediante Web Crypto |
| **4. Esteganografía** | [Ejecutar laboratorio](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/04-esteganografia.html) | LSB, extracción, capacidad, PSNR y estegoanálisis básico |
| **5. Blockchain** | [Ejecutar laboratorio](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/05-blockchain.html) | Prueba de trabajo, cadena de hashes, manipulación y árboles de Merkle |
| **6. Protocolos y privacidad** | [Ejecutar laboratorio](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/06-protocolos-privacidad.html) | Shamir, compromisos hash e identificación de Schnorr |
| **7. Poscuántica y cuántica** | [Ejecutar laboratorio](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/07-poscuantica-cuantica.html) | Grover, BB84, estándares NIST e inventario de migración |
| **8. Seguridad aplicada** | [Ejecutar laboratorio](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/08-seguridad-aplicada.html) | Nonces, CSPRNG, secretos, amenazas y ciclo de vida de claves |

---

## 🔬 Criterio de diseño de los laboratorios

Cada simulación combina cinco capas:

1. **Concepto:** qué objetivo de seguridad se estudia.
2. **Experimento:** variables que el usuario puede modificar.
3. **Métricas:** resultados numéricos y evidencia observable.
4. **Ataque o límite:** supuesto que debilita o rompe el mecanismo.
5. **Transferencia:** relación con protocolos y sistemas reales.

La interfaz común incorpora diseño responsivo, navegación por teclado, regiones de estado accesibles, manejo visible de errores y detección de disponibilidad de Web Crypto.

### Alcance de seguridad

- Los cifrados históricos, grupos pequeños y protocolos simplificados son **modelos educativos**.
- SHA-256, PBKDF2, AES-GCM y ECDSA se ejecutan mediante la **Web Cryptography API**.
- Web Crypto requiere HTTPS o localhost, condición satisfecha por GitHub Pages.
- Los ejemplos no reemplazan bibliotecas auditadas, parámetros vigentes ni una evaluación profesional de seguridad.

---

## 🗺️ Hoja de ruta

| Etapa | Núcleo conceptual | Contenidos principales | Resultado esperado |
|---|---|---|---|
| **1** | Criptografía clásica | Sustitución, transposición, César, Vigenère y criptoanálisis | Entender la relación entre diseño y ataque |
| **2** | Fundamentos matemáticos | Aritmética modular, grupos, cuerpos finitos, probabilidad y entropía | Comprender el lenguaje matemático de la criptografía |
| **3** | Criptografía moderna | AES, ChaCha20, hashes, MAC, AEAD, RSA, DH, ECC y firmas | Diferenciar primitivas y combinarlas correctamente |
| **4** | Esteganografía | LSB, imágenes, audio, canales encubiertos y estegoanálisis | Separar ocultamiento de existencia y cifrado de contenido |
| **5** | Blockchain | Hashes, Merkle trees, firmas, wallets, consenso, contratos y DeFi | Comprender qué aporta realmente la criptografía a una blockchain |
| **6** | Protocolos y privacidad | PKI, commitments, secret sharing, ZKP, MPC y cifrado homomórfico | Analizar seguridad a nivel de protocolo |
| **7** | Poscuántica y cuántica | Shor, Grover, ML-KEM, ML-DSA, SLH-DSA, migración y QKD | Diseñar una estrategia de transición criptográfica |
| **8** | Seguridad aplicada | Gestión de claves, HSM, side channels, nonces, CSPRNG y threat modeling | Evitar fallas de implementación y operación |

El material teórico completo se encuentra en [`docs/criptografia`](docs/criptografia/README.md).

---

## 🎨 Visualizaciones anteriores conservadas

| Recurso | Acceso web |
|---|---|
| Hipercubo criptográfico | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/hipercubo_criptografico.html) |
| Ataque y defensa Cripto-DNN | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/ataque_%20y_%20defensa.html) |
| Fractales de Julia | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/visualizaci%C3%B3n_%20art%C3%ADstica_julia.html) |
| Campos de polinomios finitos | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/visualizacion_%20artistica_polinomio%20.html) |
| Anatomía de SHA-256 | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/cryptocube.html) |
| Grafo de Petersen y teoría espectral | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/spectral-graph-visualizer.html) |
| Protocolo Fiat–Shamir | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/protocolo_fiat_shamir.html) |

---

## 🚀 Uso local

```bash
git clone https://github.com/sgevatschnaider/CriptografiayBlockchain.git
cd CriptografiayBlockchain
python -m http.server 8000
```

Luego abrí `http://localhost:8000/`.

Para los proyectos de blockchain y contratos inteligentes:

```bash
npm install
npx hardhat test
```

---

## ✅ Validación y publicación

El workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml):

- valida la existencia de los ocho laboratorios;
- revisa sintaxis JavaScript y enlaces locales;
- detecta identificadores HTML duplicados y utilidades no importadas;
- publica automáticamente el repositorio en GitHub Pages al actualizar `main`.

---

## 📂 Arquitectura principal

```text
.
├── index.html
├── simuladores/
│   ├── index.html
│   ├── 01-criptografia-clasica.html
│   ├── 02-fundamentos-matematicos.html
│   ├── 03-criptografia-moderna.html
│   ├── 04-esteganografia.html
│   ├── 05-blockchain.html
│   ├── 06-protocolos-privacidad.html
│   ├── 07-poscuantica-cuantica.html
│   ├── 08-seguridad-aplicada.html
│   └── assets/
├── docs/criptografia/
├── recursos/
├── scripts/validate-simulators.mjs
└── .github/workflows/pages.yml
```

## 📄 Licencia

Este proyecto se distribuye bajo la [Licencia MIT](LICENSE).
