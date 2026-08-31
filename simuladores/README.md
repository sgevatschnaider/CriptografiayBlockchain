# 🔬 Laboratorios interactivos de criptografía

Esta carpeta reúne el campus ejecutable del repositorio. Cada módulo posee:

1. un **laboratorio integral**;
2. una **página de catálogo modular**;
3. simulaciones especializadas independientes;
4. teoría, scripts, notebooks y recursos complementarios.

## Acceso web directo

- [Abrir la portada del proyecto](https://sgevatschnaider.github.io/CriptografiayBlockchain/)
- [Abrir el campus interactivo](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/)

## Catálogos por módulo

### Área transversal

- [Fundamentos matemáticos](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/fundamentos-matematicos/): representación digital, UTF-8, binario, hexadecimal, XOR, aritmética modular, álgebra, entropía y complejidad.

| Módulo | Catálogo | Laboratorio integral |
|---|---|---|
| 1 | [Criptografía clásica](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-01/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/01-criptografia-clasica.html) |
| 2 | [Fundamentos de la criptografía moderna](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-02/) | [Ruta guiada](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-02/ruta-guiada.html) · [S-Boxes y DDT](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-02/sbox-criptoanalisis-diferencial.html) |
| 3 | [Criptografía moderna](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-03/) | [Ruta completa](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-03/ruta-modulo.html) · [ChaCha20](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-03/chacha20.html) · [13 dossiers PDF](../docs/criptografia/pdf/modulo-03/README.md) · [Clase 3](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-03/ruta-guiada.html) |
| 4 | [Esteganografía](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-04/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/04-esteganografia.html) |
| 5 | [Blockchain](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-05/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/05-blockchain.html) |
| 6 | [Protocolos y privacidad](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-06/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/06-protocolos-privacidad.html) |
| 7 | [Poscuántica y cuántica](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-07/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/07-poscuantica-cuantica.html) |
| 8 | [Seguridad aplicada](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-08/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/08-seguridad-aplicada.html) |
| 9 | [Bitcoin](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-09/) | [Visor de 64 diapositivas](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-09/presentaciones.html) · [12 simulaciones](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-09/#recursos) |

## Arquitectura

```text
simuladores/
├── index.html
├── README.md
├── catalogo.json
├── 01-criptografia-clasica.html
├── 01a-cifrado-cesar-castellano.html
├── 02-fundamentos-matematicos.html
├── 03-criptografia-moderna.html
├── 04-esteganografia.html
├── 05-blockchain.html
├── 06-protocolos-privacidad.html
├── 07-poscuantica-cuantica.html
├── 08-seguridad-aplicada.html
├── fundamentos-matematicos/
│   ├── index.html
│   ├── representacion-digital-xor.html
│   ├── aritmetica-modular-visual.html
│   └── assets/
├── modulo-01/
│   └── index.html
├── modulo-02/
│   ├── index.html
│   ├── ruta-guiada.html
│   ├── introduccion-interactiva.html
│   ├── teoria.html
│   ├── confusion-difusion.html
│   ├── sbox-criptoanalisis-diferencial.html
│   ├── laboratorio-xor-flujo.html
│   ├── mapas-mentales.html
│   ├── glosario.html
│   ├── cuestionario.html
│   └── assets/
├── modulo-03/
│   ├── index.html
│   ├── ruta-modulo.html
│   ├── asimetria-teoria-completa.html
│   ├── asimetria-laboratorio-integral.html
│   ├── ruta-clase-asimetria.html
│   ├── chacha20.html
│   ├── ruta-guiada.html
│   ├── contrasena-salt-kdf.html
│   ├── bloques-vs-flujo.html
│   ├── modos-aes-aead.html
│   ├── cifrado-local-archivos.html
│   ├── hash-hmac-firmas.html
│   ├── padding-oracle.html
│   ├── rsa-ecdh-hibrido.html
│   ├── glosario.html
│   ├── cuestionario.html
│   └── assets/
├── ...
├── modulo-08/
│   └── index.html
├── modulo-09/
│   ├── index.html
│   ├── presentaciones.html
│   ├── 12 simulaciones HTML
│   ├── glosario-interactivo-bitcoin.html
│   ├── cuestionario-interactivo-bitcoin-20-preguntas.html
│   └── presentaciones/
└── assets/
    ├── lab.css
    └── lab.js
```

## Cómo agregar una simulación nueva

1. Crear el archivo HTML dentro de la carpeta del módulo, por ejemplo:

   ```text
   simuladores/modulo-01/cifrado-afin.html
   ```

2. Usar nombres sin espacios, tildes ni paréntesis.
3. Enlazar la simulación desde `simuladores/modulo-01/index.html`.
4. Registrar el recurso en `simuladores/catalogo.json`.
5. Incluir navegación de regreso al módulo y al campus.
6. Probar localmente con:

   ```bash
   python -m http.server 8000
   ```

7. Abrir un Pull Request y verificar los checks antes del merge.

## Estructura pedagógica común

Cada simulación debería incluir:

1. pregunta rectora;
2. definición y objetivo de seguridad;
3. modelo matemático;
4. controles experimentales;
5. visualización o métricas;
6. ataque, falla o límite;
7. interpretación;
8. transferencia a un sistema real;
9. advertencia de alcance;
10. desafío final.

## Diseño pedagógico

Cada laboratorio sigue cinco momentos:

1. **Predicción:** anticipar el resultado antes de ejecutar.
2. **Experimentación:** modificar parámetros de forma controlada.
3. **Interpretación:** relacionar métricas con propiedades de seguridad.
4. **Ataque o falla:** explorar el límite del mecanismo.
5. **Transferencia:** conectar el hallazgo con sistemas reales.

## Calidad técnica común

Los laboratorios comparten `assets/lab.css` y `assets/lab.js`, que proporcionan diseño responsivo, navegación consistente, controles accesibles, regiones de estado, manejo visible de errores y utilidades matemáticas o criptográficas.

## Validación

El script `scripts/validate-simulators.mjs` revisa la estructura común de los laboratorios. Las validaciones especializadas recorren los recursos de Fundamentos matemáticos y de los módulos 2 y 3, comprueban contenido, enlaces, sintaxis, accesibilidad e integración en el catálogo. `scripts/validate-chacha20-integration.mjs` verifica quarter round, bloque RFC 8439, round trip y reutilización de nonce. La acción `.github/workflows/pages.yml` ejecuta las validaciones en cada Pull Request y publica el sitio después de actualizar `main`.

## Alcance de seguridad

- Los cifrados clásicos, grupos pequeños y protocolos simplificados son modelos educativos.
- No deben introducirse secretos, claves o datos reales.
- Los ejemplos no sustituyen bibliotecas auditadas ni una revisión profesional.

## Material docente

La [guía docente](../docs/criptografia/guia-docente-simuladores.md) contiene objetivos, tiempos, consignas y criterios de evaluación por módulo.
