# 🔐 Campus de Criptografía

> Ruta pedagógica ampliada: de los cifrados históricos a la seguridad poscuántica, la criptografía cuántica y las aplicaciones blockchain.

Este campus complementa —sin reemplazar— los contenidos existentes del repositorio. Su objetivo es ofrecer una visión ordenada de la criptografía como disciplina matemática, ingeniería de seguridad y tecnología de confianza.

## Navegación rápida

<p align="center">
  <a href="./01-criptografia-clasica.md"><img src="https://img.shields.io/badge/01-Criptografía_clásica-8B5CF6?style=for-the-badge" alt="Criptografía clásica"></a>
  <a href="./02-fundamentos-matematicos.md"><img src="https://img.shields.io/badge/02-Fundamentos_matemáticos-2563EB?style=for-the-badge" alt="Fundamentos matemáticos"></a>
  <a href="./03-criptografia-moderna.md"><img src="https://img.shields.io/badge/03-Criptografía_moderna-059669?style=for-the-badge" alt="Criptografía moderna"></a>
  <a href="./04-esteganografia.md"><img src="https://img.shields.io/badge/04-Esteganografía-D97706?style=for-the-badge" alt="Esteganografía"></a>
</p>

<p align="center">
  <a href="./05-criptografia-blockchain.md"><img src="https://img.shields.io/badge/05-Criptografía_y_blockchain-111827?style=for-the-badge&logo=ethereum" alt="Criptografía y blockchain"></a>
  <a href="./06-protocolos-privacidad.md"><img src="https://img.shields.io/badge/06-Privacidad_y_protocolos-DB2777?style=for-the-badge" alt="Privacidad y protocolos"></a>
  <a href="./07-poscuantica-y-cuantica.md"><img src="https://img.shields.io/badge/07-Poscuántica_y_cuántica-0891B2?style=for-the-badge" alt="Criptografía poscuántica y cuántica"></a>
  <a href="./08-seguridad-aplicada.md"><img src="https://img.shields.io/badge/08-Seguridad_aplicada-DC2626?style=for-the-badge" alt="Seguridad aplicada"></a>
</p>

## Mapa de aprendizaje

| Etapa | Pregunta rectora | Contenidos centrales | Resultado esperado |
|---|---|---|---|
| 1. Historia y criptoanálisis | ¿Cómo se ocultaba información antes de la computación? | Sustitución, transposición, César, afín, Vigenère, análisis de frecuencias | Comprender la relación entre diseño y ataque |
| 2. Matemática | ¿Qué estructuras hacen posible la criptografía? | Aritmética modular, grupos, campos finitos, probabilidad, entropía | Leer algoritmos con rigor conceptual |
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

Cada módulo puede trabajarse en cuatro capas:

- **Concepto:** definición y objetivo de seguridad.
- **Matemática:** estructura que sustenta el mecanismo.
- **Implementación:** bibliotecas, formatos y protocolos.
- **Análisis crítico:** ataques, límites, errores frecuentes y decisiones de diseño.

## Referencias normativas y técnicas

- NIST Computer Security Resource Center: estándares FIPS y publicaciones especiales.
- IETF: especificaciones de TLS, firmas, intercambio de claves y formatos interoperables.
- IACR Cryptology ePrint Archive: investigación criptográfica abierta.
- OWASP: riesgos de implementación y gestión de secretos.

---

[⬅️ Volver al README principal](../../README.md)
