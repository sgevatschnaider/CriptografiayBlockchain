<div align="center">

# 🌐 Language / Idioma

[![🇪🇸 Español](https://img.shields.io/badge/🇪🇸-Español-red?style=for-the-badge&labelColor=white&color=red)](./README.md)
[![🇬🇧 English](https://img.shields.io/badge/🇬🇧-English-blue?style=for-the-badge&labelColor=white&color=blue)](./README.en.md)

</div>

---

# ⛓️ Mastering Cryptography and Blockchain: From Zero to dApp

<p align="center">
  <img src="https://img.shields.io/github/stars/sgevatschnaider/CriptografiayBlockchain?style=for-the-badge&logo=github&color=ffca28" alt="GitHub Stars">
  <img src="https://img.shields.io/github/forks/sgevatschnaider/CriptografiayBlockchain?style=for-the-badge&logo=github&color=3d5afe" alt="GitHub Forks">
  <img src="https://img.shields.io/github/last-commit/sgevatschnaider/CriptografiayBlockchain?style=for-the-badge&logo=github&color=4caf50" alt="Last Commit">
  <img src="https://img.shields.io/github/license/sgevatschnaider/CriptografiayBlockchain?style=for-the-badge&color=ef5350" alt="License">
</p>

Welcome to the ultimate knowledge hub in Spanish for **building the future of the decentralized web**!

This repository is not just a code collection; it's a **structured and practical roadmap** to dive deep into the universe of digital trust. It has been designed for developers, students, and innovators seeking to master the pillars of Cryptography and Blockchain technology, from mathematical foundations to deploying your first Decentralized Application (dApp).

**Our mission:** empower you with the tools to not only use technology, but understand and create it.

---

## 🗺️ Knowledge Roadmap (Index)

Navigate directly to the section that interests you most:

*   [Conceptual Vision: Mathematical Beauty](#-beyond-the-code-the-mathematical-beauty-of-cryptography)
*   [Getting Started: Your Environment in Minutes](#-getting-started-your-development-environment-in-minutes)
*   [Thematic Structure: Your Learning Journey](#-thematic-structure-your-learning-journey)
*   [Repository Architecture](#-repository-architecture)
*   [Tools and Technologies](#️-tools-and-technologies-used)
*   [How to Contribute](#-how-to-contribute)
*   [License](#-license)

---

✨ Beyond the Code: The Mathematical Beauty of Cryptography

The following animation, "Steganographic Laboratory V3," simulates a cinematic battle between a defender and an attacker in the complex plane. It uses the Julia set as a steganographic channel, hiding bits of a message in the high-entropy (chaotic) regions of the fractal. Each bit is a particle that travels to a position determined by a master key.
The simulation is a dynamic, real-time 'cyberwar.' A secret message (colored particles) is hidden in the digital terrain (the blue fractal). An attacker attempts to find this data, while the defenses resist. The yellow (in transit), cyan/magenta (hidden), and red (compromised) particles show the state of the battle, while the status bars reflect the defense's integrity and the attacker's pressure.
<p align="center">
<img src="https://github.com/sgevatschnaider/CriptografiayBlockchain/blob/41ff2c3aef64a71d61b1a9a4d99200c5ad3022f3/assets/ataque%20y%20defensa%20julia%20.gif?raw=true" alt="Animation of steganographic cyberwar on a Julia set fractal" width="600"/>
</p>

##  Getting Started: Your Development Environment in Minutes

To start experimenting with the examples and projects, follow these simple steps:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/sgevatschnaider/CriptografiayBlockchain.git
    cd CriptografiayBlockchain
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Run Tests (Recommended):**
    ```bash
    npx hardhat test
    ```

Ready! You can now explore, modify and deploy contracts and scripts.

---

## 📚 Thematic Structure: Your Learning Journey

This repository is organized in progressive modules. We recommend following the order to build a solid foundation.

| Module                                          | Description                                                                                                                                                                                                                                                                         | Key Technologies          |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 🔐 **1. Cryptography: The Pillars**             | <details><summary>Understand the fundamentals that make blockchain security possible. You'll learn about hashing, asymmetric encryption, and digital signatures.</summary><p>We'll explore practical implementations to solidify these concepts.</p></details> | `JavaScript`, `ethers.js`  |
| 🔗 **2. Blockchain Fundamentals**               | <details><summary>Discover the anatomy of a blockchain. You'll assemble the structure of a block, implement basic Proof-of-Work, and analyze consensus mechanisms.</summary><p>This module will give you a clear mental model of how a blockchain works internally.</p></details>    | `TypeScript`, `Hardhat`    |
| 📝 **3. Smart Contracts** | <details><summary>Dive into the programmable logic of blockchain. You'll write, test, and deploy your first smart contracts, learning security best practices.</summary><p>We'll focus on the complete lifecycle of Smart Contract development.</p></details>     | `Solidity`, `Hardhat`, `Chai` |
| 🏦 **4. DeFi Protocols**      | <details><summary>Explore the financial ecosystem of the future. We'll analyze the mechanisms behind decentralized exchanges (DEX), lending protocols, and scalability solutions.</summary><p>Real use cases and DeFi design patterns will be studied.</p></details> | `Solidity`, `TypeScript`   |
| ⚙️ **5. Ecosystem Tools**           | <details><summary>Master the blockchain developer's arsenal. We'll guide you through using professional tools like Hardhat, Remix, Truffle, and Ganache.</summary><p>The goal is to make you comfortable in a professional development environment.</p></details>           | `Hardhat`, `Remix`, `Truffle`|

---

## 📂 Repository Architecture

To facilitate navigation, the project is structured as follows:

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

## 🛠️ Tools and Technologies Used

This project is built on the industry standard for development in the EVM ecosystem:

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

### 🔬 Interactive Laboratory: Implementing Secure Cryptography in Neural Networks

This section is directly inspired by the seminal paper by Gerault, Ronen and Shamir. The research exposes a fundamental security gap when cryptography, designed for the **digital domain (bits)**, is implemented in neural networks, which operate in the **analog domain (real numbers)**.

> 📄 **Reference Paper:** [**How to Securely Implement Cryptography in Deep Neural Networks**](https://eprint.iacr.org/2025/288) (Gerault, D. et al., IACR ePrint Archive).

Through these visualizations, you can explore this battlefield, simulate the "domain extension" attack and apply the proposed defenses to neutralize the threat.

| 📄 Resource                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 📥 Access                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Visualization: The Cryptographic Hypercube** <br><br> <details><summary><strong>Summary:</strong> <em>(click to expand)</em></summary><p>The paper is based on the discrepancy between the discrete domain of cryptography and the continuous domain of DNNs. This visualization explores the "Boolean Hypercube", where the vertices are the valid binary inputs. The space *between* the vertices is the continuous domain that an attacker can exploit. Understanding this geometric structure is key to understanding the attack vector.</p></details>                                               | [![View Website](https://img.shields.io/badge/Explore-Hypercube-brightgreen?style=for-the-badge&logo=html5)](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/hipercubo_criptografico.html)                                                                                                                                                                                |
| **Attack and Defense Simulator (Crypto-DNN)** <br><br> <details><summary><strong>Summary:</strong> <em>(click to expand)</em></summary><p>This is the core of the paper in action. The simulator first demonstrates the vulnerability: how an attacker, by injecting real-valued (non-binary) inputs, can perform differential cryptanalysis to extract the secret key from a DNN. Then, you can activate the defense proposed in the paper: a security *wrapper* with **"sanitization"** and **"masking"** layers that neutralize the attack, ensuring secure implementation.</p></details> | [![View Website](https://img.shields.io/badge/Start-Simulator-orange?style=for-the-badge&logo=html5)](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/ataque_%20y_%20defensa.html) |
| **Artistic Gallery: Julia Fractals** <br><br> <details><summary><strong>Summary:</strong> <em>(click to expand)</em></summary><p>A fundamental property of cryptographic primitives is high non-linearity and sensitivity to initial conditions (avalanche effect). Julia fractals are a beautiful visual analogy of this concept. They demonstrate how simple iterative functions in the complex plane can generate infinite complexity, a principle that, in spirit, protects the algorithms that the paper seeks to implement securely.</p></details>  | [![View Website](https://img.shields.io/badge/View-Gallery-blueviolet?style=for-the-badge&logo=html5)](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/visualizaci%C3%B3n_%20art%C3%ADstica_julia.html) |
| **Artistic Gallery: Finite Polynomial Fields** <br><br> <details><summary><strong>Summary:</strong> <em>(click to expand)</em></summary><p>The paper attacks an AES implementation, whose operations (like the S-Box) are defined over finite fields (Galois Fields). This artistic visualization explores the structure of these polynomial fields. It serves as a reminder that the algorithms we implement in DNNs are not black boxes, but are based on deep mathematical structures whose integrity we must preserve when changing computational domains.</p></details> | [![View Website](https://img.shields.io/badge/View-Gallery-blueviolet?style=for-the-badge&logo=html5)](https://sgevatschnaider.github.io/CriptografiayBlockchain/recursos/visualizacion_%20artistica_polinomio%20.html) |

## 🤝 How to Contribute

This is a living project and your help is key to making it even better!

1.  **Fork** the project.
2.  Create a new branch: `git checkout -b feature/my-improvement`.
3.  Make your changes and commits.
4.  Send a **Pull Request** to the `main` branch.

## 📄 License

This project is distributed under the **MIT License**. See the `LICENSE` file for more details.
