# ⛓️ Dominando Criptografía y Blockchain: De Cero a dApp

<p align="center">
  <img src="https://img.shields.io/github/stars/sgevatschnaider/CriptografiayBlockchain?style=for-the-badge&logo=github&color=ffca28" alt="GitHub Stars">
  <img src="https://img.shields.io/github/forks/sgevatschnaider/CriptografiayBlockchain?style=for-the-badge&logo=github&color=3d5afe" alt="GitHub Forks">
  <img src="https://img.shields.io/github/last-commit/sgevatschnaider/CriptografiayBlockchain?style=for-the-badge&logo=github&color=4caf50" alt="Last Commit">
  <img src="https://img.shields.io/github/license/sgevatschnaider/CriptografiayBlockchain?style=for-the-badge&color=ef5350" alt="Licencia">
</p>

¡Bienvenido al centro de conocimiento definitivo en español para **construir el futuro de la web descentralizada**!

Este repositorio no es solo una colección de código; es una **hoja de ruta estructurada y práctica** para adentrarse en el universo de la confianza digital. Ha sido diseñado para desarrolladores, estudiantes e innovadores que buscan dominar los pilares de la Criptografía y la tecnología Blockchain, desde los fundamentos matemáticos hasta el despliegue de su primera Aplicación Descentralizada (dApp).

Aquí desmitificaremos conceptos como las firmas digitales, exploraremos la elegancia de los algoritmos de consenso y escribiremos contratos inteligentes seguros y eficientes. **Nuestra misión: empoderarte con las herramientas para que no solo uses la tecnología, sino que la entiendas y la crees.**

---

### ✨ Más Allá del Código: La Belleza Matemática de la Criptografía

La seguridad de Blockchain se apoya en profundos y elegantes conceptos matemáticos. La siguiente animación del Grafo de Petersen, relacionado con los límites de Ramanujan, es una representación visual de la complejidad y belleza estructural que subyace en muchos algoritmos criptográficos modernos, como los que se exploran en las pruebas de conocimiento cero (Zero-Knowledge Proofs).

<p align="center">
  <img src="https://github.com/sgevatschnaider/CriptografiayBlockchain/blob/main/assets/petersen_ramanujan_animation.gif?raw=true" alt="Animación del Grafo de Petersen" width="600"/>
</p>

---

## 🚀 Puesta en Marcha: Tu Entorno de Desarrollo en Minutos

Para empezar a experimentar con los ejemplos y proyectos, sigue estos sencillos pasos:

1.  **Clona el Repositorio:**
    ```bash
    git clone https://github.com/sgevatschnaider/CriptografiayBlockchain.git
    cd CriptografiayBlockchain
    ```
2.  **Instala las Dependencias:**
    Asegúrate de tener [Node.js](https://nodejs.org/) (v16 o superior) instalado.
    ```bash
    npm install
    ```
3.  **Ejecuta las Pruebas (Recomendado):**
    Verifica que todo está configurado correctamente ejecutando el set de pruebas de ejemplo.
    ```bash
    npx hardhat test
    ```

¡Listo! Ya puedes explorar, modificar y desplegar los contratos y scripts.

---

## 🗺️ Hoja de Ruta Temática: Tu Viaje de Aprendizaje

Este repositorio está organizado en módulos progresivos. Te recomendamos seguir el orden para construir una base sólida.

| Módulo                                          | Descripción                                                                                                                                                                                                           | Tecnologías Clave          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 🔐 **1. Criptografía: Los Pilares de la Confianza** | Comprende los fundamentos que hacen posible la seguridad en blockchain. Aprenderás sobre hashing para garantizar la integridad, cifrado asimétrico para la propiedad y firmas digitales para la autenticidad. | `JavaScript`, `ethers.js`  |
| 🔗 **2. Fundamentos de Blockchain**               | Descubre la anatomía de una blockchain. Ensamblarás la estructura de un bloque, implementarás una prueba de trabajo (Proof-of-Work) básica y analizarás los mecanismos de consenso que dan vida a la red.    | `TypeScript`, `Hardhat`    |
| 📝 **3. Contratos Inteligentes (Smart Contracts)** | Adéntrate en la lógica programable de la blockchain. Escribirás, probarás y desplegarás tus primeros contratos inteligentes, aprendiendo las mejores prácticas de seguridad para evitar vulnerabilidades.     | `Solidity`, `Hardhat`, `Chai` |
| 🏦 **4. Protocolos DeFi Descentralizados**      | Explora el ecosistema financiero del futuro. Analizaremos los mecanismos detrás de los intercambios descentralizados (DEX), los protocolos de préstamos y las soluciones de escalabilidad como los Rollups. | `Solidity`, `TypeScript`   |
| ⚙️ **5. Herramientas del Ecosistema**           | Domina el arsenal del desarrollador blockchain. Te guiaremos en la configuración y uso de herramientas profesionales como Hardhat, Remix, Truffle y Ganache para un flujo de trabajo eficiente.           | `Hardhat`, `Remix`, `Truffle`|

---

## 📂 Arquitectura del Repositorio

Para facilitar la navegación, el proyecto se estructura de la siguiente manera:

```plaintext
.
├── 1-cryptography/
│   ├── hashing/
│   ├── encryption/
│   └── signatures/
├── 2-blockchain-fundamentals/
│   ├── block-structure/
│   └── consensus/
├── 3-smart-contracts/
│   ├── contracts/        # Ejemplos en Solidity
│   ├── scripts/          # Scripts de despliegue y interacción
│   └── test/             # Pruebas automatizadas
├── 4-defi-protocols/
│   ├── dex/
│   ├── lending/
│   └── scalability/
├── hardhat.config.js     # Configuración del entorno de desarrollo
├── package.json
└── README.md
```

---

## 🛠️ Herramientas y Tecnologías Utilizadas

Este proyecto se construye sobre el estándar de la industria para el desarrollo en el ecosistema EVM:

![Solidity](https://img.shields.io/badge/Solidity-E6E6E6?style=for-the-badge&logo=solidity&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-FFF670?style=for-the-badge&logo=hardhat&logoColor=black)
![Ethers.js](https://img.shields.io/badge/Ethers.js-2535A0?style=for-the-badge&logo=ethereum&logoColor=white)


---

## 🤝 Cómo Contribuir

¡Este es un proyecto vivo y tu ayuda es clave para hacerlo aún mejor! Las contribuciones son bienvenidas, ya sea corrigiendo errores, añadiendo ejemplos o mejorando la documentación.

1.  **Haz un Fork** del proyecto.
2.  Crea una nueva rama descriptiva: `git checkout -b feature/mi-increible-mejora`.
3.  Haz tus cambios y realiza commits claros y concisos.
4.  Envía un **Pull Request** a la rama `main` explicando qué problema solucionas o qué funcionalidad añades.

Para más detalles, consulta nuestras `DIRECTRICES DE CONTRIBUCIÓN` (próximamente).

## 📄 Licencia

Este proyecto se distribuye bajo la **Licencia MIT**. Consulta el archivo `LICENSE` en la raíz del repositorio para más detalles.

---

<p align="center">
  Creado con 💻 y pasión por la descentralización. Si te ha sido útil, ¡considera darle una ⭐️ al repositorio!
</p>
```

