# Cryptography and Blockchain

Educational campus with theory, interactive simulations, guided routes, glossaries, quizzes, and locally executed security experiments. The main material is written in Spanish.

## Quick access

- [Interactive campus](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/)
- [Module 3: Modern cryptography](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-03/)
- [ChaCha20 verified laboratory](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-03/chacha20.html)
- [Module 3 theory](docs/criptografia/03-criptografia-moderna.md)
- [Module 3 PDF](docs/criptografia/pdf/modulo-03-criptografia-moderna.pdf)
- [Spanish README](README.md)

## Coverage

The learning path covers classical cryptography, mathematical and modern foundations, symmetric encryption, AES, ChaCha20, modes of operation, padding, hashes, MACs, password KDFs, RSA, elliptic-curve cryptography, hybrid encryption, session keys, blockchain, privacy protocols, post-quantum migration, and applied security.

Module 3 includes a standalone ChaCha20 implementation for education. It validates the RFC 8439 quarter-round and block vectors, visualizes the 4 by 4 state, performs local encryption and recovery, and demonstrates the danger of nonce reuse. Production systems should use maintained cryptographic libraries and an authenticated construction such as ChaCha20-Poly1305.

## Run locally

```bash
git clone https://github.com/sgevatschnaider/CriptografiayBlockchain.git
cd CriptografiayBlockchain
python -m http.server 8000
```

Open `http://localhost:8000/`.

## Validation

```bash
node scripts/validate-simulators.mjs
node scripts/validate-module-03.mjs
node scripts/validate-chacha20-integration.mjs
python -m unittest -v tests.test_afin
```

GitHub Actions validates HTML structure, local links, JavaScript syntax, cryptographic round trips, the FIPS AES vector, the RFC 8439 ChaCha20 vectors, and the Python affine-cipher tests before GitHub Pages deployment.

## Educational scope

Historical ciphers, small groups, password attacks, and simplified protocols use fictitious data and bounded workloads. They are teaching models, not production security tools.

Material prepared by Professor Sergio Gevatschnaider.
