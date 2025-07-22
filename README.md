<div align="center">

# 🌐 Idioma / Language

[![🇪🇸 Español](https://img.shields.io/badge/🇪🇸-Español-red?style=for-the-badge&labelColor=white&color=red)](./README.md)
[![🇬🇧 English](https://img.shields.io/badge/🇬🇧-English-blue?style=for-the-badge&labelColor=white&color=blue)](./README.en.md)

</div>

# ⛓️ Dominando Criptografía y Blockchain: De Cero a dApp

<p align="center">
  <img src="https://img.shields.io/github/stars/sgevatschnaider/CriptografiayBlockchain?style=for-the-badge&logo=github&color=ffca28" alt="GitHub Stars">
  <img src="https://img.shields.io/github/forks/sgevatschnaider/CriptografiayBlockchain?style=for-the-badge&logo=github&color=3d5afe" alt="GitHub Forks">
  <img src="https://img.shields.io/github/last-commit/sgevatschnaider/CriptografiayBlockchain?style=for-the-badge&logo=github&color=4caf50" alt="Last Commit">
  <img src="https://img.shields.io/github/license/sgevatschnaider/CriptografiayBlockchain?style=for-the-badge&color=ef5350" alt="Licencia">
</p>

¡Bienvenido al centro de conocimiento definitivo en español para **construir el futuro de la web descentralizada**!

Este repositorio no es solo una colección de código; es una **hoja de ruta estructurada y práctica** para adentrarse en el universo de la confianza digital. Ha sido diseñado para desarrolladores, estudiantes e innovadores que buscan dominar los pilares de la Criptografía y la tecnología Blockchain, desde los fundamentos matemáticos hasta el despliegue de su primera Aplicación Descentralizada (dApp).

**Nuestra misión:** empoderarte con las herramientas para que no solo uses la tecnología, sino que la entiendas y la crees.

---

## 🗺️ Hoja de Ruta del Conocimiento (Índice)

Navega directamente a la sección que más te interese:

*   [Visión Conceptual: La Belleza Matemática](#-más-allá-del-código-la-belleza-matemática-de-la-criptografía)
*   [Puesta en Marcha: Tu Entorno en Minutos](#-puesta-en-marcha-tu-entorno-de-desarrollo-en-minutos)
*   [Estructura Temática: Tu Viaje de Aprendizaje](#-estructura-temática-tu-viaje-de-aprendizaje)
*   [Arquitectura del Repositorio](#-arquitectura-del-repositorio)
*   [Herramientas y Tecnologías](#️-herramientas-y-tecnologías-utilizadas)
*   [Cómo Contribuir](#-cómo-contribuir)
*   [Licencia](#-licencia)

---

### ✨ Más Allá del Código: La Belleza Matemática de la Criptografía

La siguiente animación, "Laboratorio Esteganográfico V3", simula una batalla cinemática entre un defensor y un atacante en el espacio complejo. Utiliza el conjunto de Julia como canal esteganográfico, ocultando bits de un mensaje en las regiones de alta entropía (caos) del fractal. Cada bit es una partícula que viaja a una posición determinada por una clave maestra.

La simulación es una "ciberguerra" dinámica en tiempo real. Un mensaje secreto (partículas de colores) se oculta en el terreno digital (el fractal azul). Un atacante intenta encontrar esos datos, mientras las defensas resisten. Las partículas amarillas (en tránsito), cian/magenta (ocultas) y rojas (comprometidas) muestran el estado de la batalla, mientras que las barras de estado reflejan la integridad de la defensa y la presión del ataque.

<p align="center">
  <img src="https://github.com/sgevatschnaider/CriptografiayBlockchain/blob/41ff2c3aef64a71d61b1a9a4d99200c5ad3022f3/assets/ataque%20y%20defensa%20julia%20.gif?raw=true" alt="Animación de ciberguerra esteganográfica en un fractal de Julia" width="600"/>
</p>

---


##  Puesta en Marcha: Tu Entorno de Desarrollo en Minutos

Para empezar a experimentar con los ejemplos y proyectos, sigue estos sencillos pasos:

1.  **Clona el Repositorio:**
    ```bash
    git clone https://github.com/sgevatschnaider/CriptografiayBlockchain.git
    cd CriptografiayBlockchain
    ```
2.  **Instala las Dependencias:**
    ```bash
    npm install
    ```
3.  **Ejecuta las Pruebas (Recomendado):**
    ```bash
    npx hardhat test
    ```

¡Listo! Ya puedes explorar, modificar y desplegar los contratos y scripts.

---

## 📚 Estructura Temática: Tu Viaje de Aprendizaje

Este repositorio está organizado en módulos progresivos. Te recomendamos seguir el orden para construir una base sólida.

| Módulo                                          | Descripción                                                                                                                                                                                                                                                                         | Tecnologías Clave          |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 🔐 **1. Criptografía: Los Pilares**             | <details><summary>Comprende los fundamentos que hacen posible la seguridad en blockchain. Aprenderás sobre hashing, cifrado asimétrico y firmas digitales.</summary><p>Exploraremos implementaciones prácticas para solidificar estos conceptos.</p></details> | `JavaScript`, `ethers.js`  |
| 🔗 **2. Fundamentos de Blockchain**               | <details><summary>Descubre la anatomía de una blockchain. Ensamblarás la estructura de un bloque, implementarás una prueba de trabajo (Proof-of-Work) básica y analizarás los mecanismos de consenso.</summary><p>Este módulo te dará un modelo mental claro de cómo funciona una cadena de bloques por dentro.</p></details>    | `TypeScript`, `Hardhat`    |
| 📝 **3. Contratos Inteligentes** | <details><summary>Adéntrate en la lógica programable de la blockchain. Escribirás, probarás y desplegarás tus primeros contratos inteligentes, aprendiendo las mejores prácticas de seguridad.</summary><p>Nos enfocaremos en el ciclo de vida completo del desarrollo de un Smart Contract.</p></details>     | `Solidity`, `Hardhat`, `Chai` |
| 🏦 **4. Protocolos DeFi**      | <details><summary>Explora el ecosistema financiero del futuro. Analizaremos los mecanismos detrás de los intercambios descentralizados (DEX), los protocolos de préstamos y las soluciones de escalabilidad.</summary><p>Se estudiarán casos de uso reales y patrones de diseño de DeFi.</p></details> | `Solidity`, `TypeScript`   |
| ⚙️ **5. Herramientas del Ecosistema**           | <details><summary>Domina el arsenal del desarrollador blockchain. Te guiaremos en el uso de herramientas profesionales como Hardhat, Remix, Truffle y Ganache.</summary><p>El objetivo es que te sientas cómodo en un entorno de desarrollo profesional.</p></details>           | `Hardhat`, `Remix`, `Truffle`|
| ⚛️ **6. Anatomía Visual de un Hash**   | <details><summary>Sumérgete en una experiencia interactiva que traduce conceptos abstractos como la distribución uniforme y la entropía en una visualización de datos dinámica.</summary><p>A través de un hipercubo 4D, observarás en tiempo real cómo cada byte de un hash SHA-256 contribuye al caos determinista. Este módulo conecta la teoría criptográfica con el arte del código creativo.</p></details> | `HTML`, `CSS`, `JavaScript`, `three.js` |
---
| 📈 **7. Teoría Espectral de Grafos** | <details><summary>Explora la conexión profunda entre la estructura de una red y sus propiedades algebraicas a través de la teoría espectral.</summary><p>Se analiza interactivamente el Grafo de Petersen, un famoso ejemplo de un 'grafo de Ramanujan' —redes con conectividad casi óptima. Estos conceptos son fundamentales para el diseño de redes P2P robustas y algoritmos criptográficos avanzados.</p></details> | `HTML`, `CSS`, `JavaScript`, `three.js`, `Plotly.js` |

## 📂 Arquitectura del Repositorio

Para facilitar la navegación, el proyecto se estructura de la siguiente manera:

```plaintext
.
├── 1-cryptography/
├── 2-blockchain-fundamentals/
├── 3-smart-contracts/
├── 4-defi-protocols/
├── 5-ecosystem-tools/
├── assets/
├── hardhat.config.ts
├── package.json
└── README.md
```

---

## 🛠️ Herramientas y Tecnologías Utilizadas

Este proyecto se construye sobre el estándar de la industria para el desarrollo en el ecosistema EVM:

<p align="center">
  <img src="https://img.shields.io/badge/Solidity-E6E6E6?style=for-the-badge&logo=solidity&logoColor=black" alt="Solidity">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Hardhat-FFF670?style=for-the-badge&logo=hardhat&logoColor=black" alt="Hardhat">
  <img src="https://img.shields.io/badge/Ethers.js-2535A0?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethers.js">
</p>

---

---

### 🔬 Laboratorio Interactivo: Implementando Criptografía Segura en Redes Neuronales

Esta sección se inspira directamente en el paper seminal de Gerault, Ronen y Shamir. La investigación expone una brecha de seguridad fundamental cuando la criptografía, diseñada para el **dominio digital (bits)**, se implementa en redes neuronales, que operan en el **dominio analógico (números reales)**.

> 📄 **Reference Paper:** [**How to Securely Implement Cryptography in Deep Neural Networks**](https://eprint.iacr.org/2025/288) (Gerault, D. et al., IACR ePrint Archive).

A través de estas visualizaciones, podrás explorar este campo de batalla, simular el ataque de "extensión de dominio" y aplicar las defensas propuestas para neutralizar la amenaza.

| 📄 Recurso                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 📥 Acceso                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Visualización: El Hipercubo Criptográfico** <br><br> <details><summary><strong>Resumen:</strong> <em>(haz clic para expandir)</em></summary><p>El paper se fundamenta en la discrepancia entre el dominio discreto de la criptografía y el dominio continuo de las DNNs. Esta visualización explora el "Hipercubo Booleano", donde los vértices son las entradas binarias válidas. El espacio *entre* los vértices es el dominio continuo que un atacante puede explotar. Comprender esta estructura geométrica es clave para entender el vector de ataque.</p></details>                                               | [![Ver Página Web](https://img.shields.io/badge/Explorar-Hipercubo-brightgreen?style=for-the-badge&logo=html5)](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/hipercubo_criptografico.html)                                                                                                                                                                                |
| **Simulador de Ataque y Defensa (Cripto-DNN)** <br><br> <details><summary><strong>Resumen:</strong> <em>(haz clic para expandir)</em></summary><p>Este es el núcleo del paper en acción. El simulador primero demuestra la vulnerabilidad: cómo un atacante, al inyectar entradas de valores reales (no binarios), puede realizar un criptoanálisis diferencial para extraer la clave secreta de una DNN. Luego, podrás activar la defensa propuesta en el paper: un *wrapper* de seguridad con capas de **"sanitización"** y **"enmascaramiento"** que neutraliza el ataque, garantizando una implementación segura.</p></details> | [![Ver Página Web](https://img.shields.io/badge/Iniciar-Simulador-orange?style=for-the-badge&logo=html5)](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/ataque_%20y_%20defensa.html) |
| **Galería Artística: Fractales de Julia** <br><br> <details><summary><strong>Resumen:</strong> <em>(haz clic para expandir)</em></summary><p>Una propiedad fundamental de las primitivas criptográficas es la alta no linealidad y la sensibilidad a las condiciones iniciales (efecto avalancha). Los fractales de Julia son una bella analogía visual de este concepto. Demuestran cómo funciones iterativas simples en el plano complejo pueden generar una complejidad infinita, un principio que, en espíritu, protege a los algoritmos que el paper busca implementar de forma segura.</p></details>  | [![Ver Página Web](https://img.shields.io/badge/Ver-Galer%C3%ADa-blueviolet?style=for-the-badge&logo=html5)](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/visualizaci%C3%B3n_%20art%C3%ADstica_julia.html) |
| **Galería Artística: Campos de Polinomios Finitos** <br><br> <details><summary><strong>Resumen:</strong> <em>(haz clic para expandir)</em></summary><p>El paper ataca una implementación de AES, cuyas operaciones (como el S-Box) se definen sobre campos finitos (Campos de Galois). Esta visualización artística explora la estructura de estos campos polinomiales. Sirve como un recordatorio de que los algoritmos que implementamos en DNNs no son cajas negras, sino que se basan en estructuras matemáticas profundas cuya integridad debemos preservar al cambiar de dominio computacional.</p></details> | [![Ver Página Web](https://img.shields.io/badge/Ver-Galer%C3%ADa-blueviolet?style=for-the-badge&logo=html5)](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/visualizacion_%20artistica_polinomio%20.html) |
| **Laboratorio Interactivo: Anatomía de SHA-256** <br><br> <details><summary><strong>Resumen:</strong> <em>(haz clic para expandir)</em></summary><p>Esta herramienta traduce los conceptos criptográficos abstractos de un hash SHA-256 en una experiencia visual e interactiva. Mediante un hipercubo 4D renderizado en tiempo real, se puede observar la uniformidad, entropía y el efecto avalancha de los datos. Sirve como una poderosa demostración de por qué SHA-256 es seguro, convirtiendo la matemática pura en una escultura de datos dinámica.</p></details> | [![Ver Laboratorio](https://img.shields.io/badge/Ver-Laboratorio-blue?style=for-the-badge&logo=html5)](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/cryptocube.html) |
| **Explorador Espectral del Grafo de Petersen** <br><br> <details><summary><strong>Resumen:</strong> <em>(haz clic para expandir)</em></summary><p>Esta herramienta descompone el Grafo de Petersen, un objeto matemático fundamental. Permite explorar la relación directa entre su matriz de adyacencia, la visualización 3D interactiva y su espectro de autovalores. Se demuestra visualmente por qué es un 'grafo de Ramanujan', un concepto clave en el diseño de redes de comunicación óptimas y algoritmos criptográficos.</p></details> | [![Explorar Grafo](https://img.shields.io/badge/Explorar-Grafo-darkgreen?style=for-the-badge&logo=html5)](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/spectral-graph-visualizer.html) |
| **Explorador Interactivo del Protocolo Fiat-Shamir** <br><br>
<details><summary><strong>Resumen:</strong> <em>(haz clic para expandir)</em></summary><p>
Esta herramienta ilustra, paso a paso, el protocolo de conocimiento cero de Fiat-Shamir, esencial en la criptografía moderna. Permite explorar la secuencia entre probador y verificador, comprender visualmente cómo se protege el secreto y experimentar tanto con el modelo interactivo como con la heurística no interactiva (funciones hash). Destaca su relevancia en autenticación, firmas digitales y privacidad en blockchain.
</p></details>
| [![Explorar Fiat-Shamir](https://img.shields.io/badge/Explorar-Fiats_Shamir-blueviolet?style=for-the-badge&logo=html5)](https://github.com/sgevatschnaider/CriptografiayBlockchain/blob/ef9d7a25d381df3e83308e0d8b4ecb6a817c4ed9/recursos/protocolo_fiat-shamir.html) |



## 🤝 Cómo Contribuir

¡Este es un proyecto vivo y tu ayuda es clave para hacerlo aún mejor!

1.  **Haz un Fork** del proyecto.
2.  Crea una nueva rama: `git checkout -b feature/mi-mejora`.
3.  Haz tus cambios y commits.
4.  Envía un **Pull Request** a la rama `main`.

## 📄 Licencia

Este proyecto se distribuye bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más detalles.
