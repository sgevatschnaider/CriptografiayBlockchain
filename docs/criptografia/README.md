# 🔐 Campus de Criptografía

> Ruta pedagógica ampliada: de los cifrados históricos a la seguridad poscuántica, la criptografía cuántica y las aplicaciones blockchain.

Este campus complementa —sin reemplazar— los contenidos existentes del repositorio. Su objetivo es ofrecer una visión ordenada de la criptografía como disciplina matemática, ingeniería de seguridad y tecnología de confianza.

## Navegación rápida

<p align="center">
  <a href="./01-criptografia-clasica.md"><img src="https://img.shields.io/badge/01-Criptografía_clásica-8B5CF6?style=for-the-badge" alt="Criptografía clásica"></a>
  <a href="./02-fundamentos-criptografia-moderna.md"><img src="https://img.shields.io/badge/02-Fundamentos_modernos-2563EB?style=for-the-badge" alt="Fundamentos de la criptografía moderna"></a>
  <a href="./03-criptografia-moderna.md"><img src="https://img.shields.io/badge/03-Criptografía_moderna-059669?style=for-the-badge" alt="Criptografía moderna"></a>
  <a href="./pdf/modulo-03-criptografia-moderna.pdf"><img src="https://img.shields.io/badge/PDF-Módulo_3-047857?style=for-the-badge" alt="PDF del Módulo 3"></a>
  <a href="./pdf/modulo-03/README.md"><img src="https://img.shields.io/badge/PDF-13_dossiers-0F766E?style=for-the-badge" alt="Biblioteca PDF del Módulo 3"></a>
  <a href="./04-esteganografia.md"><img src="https://img.shields.io/badge/04-Esteganografía-D97706?style=for-the-badge" alt="Esteganografía"></a>
</p>

<p align="center">
  <a href="./02-fundamentos-matematicos.md"><img src="https://img.shields.io/badge/BASE-Fundamentos_matemáticos-475569?style=for-the-badge" alt="Base de fundamentos matemáticos"></a>
  <a href="./05-criptografia-blockchain.md"><img src="https://img.shields.io/badge/05-Criptografía_y_blockchain-111827?style=for-the-badge&logo=ethereum" alt="Criptografía y blockchain"></a>
  <a href="./06-protocolos-privacidad.md"><img src="https://img.shields.io/badge/06-Privacidad_y_protocolos-DB2777?style=for-the-badge" alt="Privacidad y protocolos"></a>
  <a href="./07-poscuantica-y-cuantica.md"><img src="https://img.shields.io/badge/07-Poscuántica_y_cuántica-0891B2?style=for-the-badge" alt="Criptografía poscuántica y cuántica"></a>
  <a href="./08-seguridad-aplicada.md"><img src="https://img.shields.io/badge/08-Seguridad_aplicada-DC2626?style=for-the-badge" alt="Seguridad aplicada"></a>
</p>

## 🔬 Laboratorios ejecutables

Los enlaces siguientes apuntan a **GitHub Pages**. Al abrirlos, el navegador ejecuta la simulación HTML directamente en un contexto HTTPS compatible con Web Crypto.

<p align="center">
  <a href="https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/"><img src="https://img.shields.io/badge/Abrir-Campus_interactivo-0EA5E9?style=for-the-badge&logo=html5&logoColor=white" alt="Laboratorios interactivos"></a>
  <a href="./guia-docente-simuladores.md"><img src="https://img.shields.io/badge/Abrir-Guía_docente-7C3AED?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Guía docente"></a>
</p>

| Módulo | Simulación web | Pregunta experimental |
|---|---|---|
| 1 | [César, Vigenère y frecuencias](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/01-criptografia-clasica.html) | ¿Por qué un texto ilegible puede seguir siendo fácil de atacar? |
| 2 | [Fundamentos modernos: ruta guiada](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-02/ruta-guiada.html) | ¿Cómo se transforma la incertidumbre en seguridad frente a un adversario definido? |
| 3 | [Ruta completa](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-03/ruta-modulo.html) · [AES integral](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-03/aes-laboratorio-integral.html) · [Asimetría integral](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-03/asimetria-laboratorio-integral.html) · [ChaCha20](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-03/chacha20.html) | ¿Cómo se eligen, combinan y validan primitivas modernas? |
| 4 | [Ocultamiento LSB](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/04-esteganografia.html) | ¿Ocultar la existencia equivale a proteger el contenido? |
| 5 | [Blockchain y Merkle trees](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/05-blockchain.html) | ¿Qué detecta el encadenamiento y qué no garantiza? |
| 6 | [Shamir, commitments y Schnorr](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/06-protocolos-privacidad.html) | ¿Cómo distribuir confianza o demostrar conocimiento sin revelar? |
| 7 | [Grover, BB84 y migración](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/07-poscuantica-cuantica.html) | ¿Qué debe migrarse y con qué prioridad? |
| 8 | [Nonces, amenazas y claves](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/08-seguridad-aplicada.html) | ¿Por qué fallan sistemas con algoritmos correctos? |

## Mapa de aprendizaje

| Etapa | Pregunta rectora | Contenidos centrales | Resultado esperado |
|---|---|---|---|
| 1. Historia y criptoanálisis | ¿Cómo se ocultaba información antes de la computación? | Sustitución, transposición, César, afín, Vigenère, análisis de frecuencias | Comprender la relación entre diseño y ataque |
| 2. Fundamentos modernos | ¿Qué significa seguridad y cuánto cuesta romperla? | Shannon, secreto perfecto, juegos, complejidad, grupos, cuerpos, curvas y retículos | Razonar con definiciones, adversarios, supuestos y estructuras |
| Base transversal | ¿Qué lenguaje matemático requiere cada módulo? | Aritmética modular, Euclides, inversos, grupos y probabilidad | Reforzar herramientas antes o durante la ruta |
| 3. Criptografía moderna | ¿Cómo se protege información en sistemas reales? | AES, AEAD, hashes, MAC, KDF, RSA, DH, ECC, firmas | Elegir primitivas según el objetivo de seguridad |
| 4. Esteganografía | ¿Cómo se oculta la existencia de un mensaje? | LSB, transformadas, estegoanálisis, marcas de agua | Distinguir secreto criptográfico de ocultamiento |
| 5. Blockchain | ¿Cómo se construye confianza sin autoridad central? | Hashes, Merkle, firmas, wallets, consenso, ZK | Relacionar primitivas con protocolos descentralizados |
| 6. Privacidad avanzada | ¿Cómo demostrar o calcular sin revelar? | Compromisos, secret sharing, MPC, ZKP, FHE | Entender protocolos de privacidad y cooperación segura |
| 7. Era cuántica | ¿Qué cambia con una computadora cuántica? | Shor, Grover, ML-KEM, ML-DSA, SLH-DSA, QKD | Separar criptografía poscuántica de criptografía cuántica |
| 8. Ingeniería segura | ¿Por qué fallan sistemas con algoritmos correctos? | RNG, claves, nonces, side channels, protocolos, crypto-agility | Diseñar y auditar sistemas de forma responsable |

## Principios rectores

1. **La criptografía no es solamente cifrado.** También incluye integridad, autenticación, firmas, compromiso, privacidad y gestión de claves.
2. **Una primitiva segura puede producir un sistema inseguro.** El protocolo, la implementación y la operación importan tanto como el algoritmo.
3. **No se diseña criptografía de producción desde cero.** Se emplean estándares, bibliotecas auditadas y configuraciones verificadas.
4. **El modelo de amenaza precede a la herramienta.** Antes de elegir AES, RSA, una prueba de conocimiento cero o QKD, debe definirse qué se protege, frente a quién y durante cuánto tiempo.
5. **La agilidad criptográfica es estratégica.** Los sistemas deben permitir reemplazar algoritmos, claves y parámetros sin reconstruir toda la infraestructura.

## Modalidad sugerida

Cada módulo puede trabajarse en cinco capas:

- **Concepto:** definición y objetivo de seguridad.
- **Matemática:** estructura que sustenta el mecanismo.
- **Implementación:** bibliotecas, formatos y protocolos.
- **Experimentación:** predecir, ejecutar y observar métricas.
- **Análisis crítico:** ataques, límites, errores frecuentes y decisiones de diseño.

## Referencias normativas y técnicas

- NIST Computer Security Resource Center: estándares FIPS y publicaciones especiales.
- IETF: especificaciones de TLS, firmas, intercambio de claves y formatos interoperables.
- IACR Cryptology ePrint Archive: investigación criptográfica abierta.
- OWASP: riesgos de implementación y gestión de secretos.

---

[⬅️ Volver al README principal](../../README.md) · [🔬 Abrir simuladores](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/)
