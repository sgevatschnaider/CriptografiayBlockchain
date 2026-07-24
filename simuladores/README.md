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

| Módulo | Catálogo | Laboratorio integral |
|---|---|---|
| 1 | [Criptografía clásica](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-01/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/01-criptografia-clasica.html) |
| 2 | [Fundamentos matemáticos](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-02/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/02-fundamentos-matematicos.html) |
| 3 | [Criptografía moderna](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-03/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/03-criptografia-moderna.html) |
| 4 | [Esteganografía](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-04/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/04-esteganografia.html) |
| 5 | [Blockchain](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-05/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/05-blockchain.html) |
| 6 | [Protocolos y privacidad](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-06/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/06-protocolos-privacidad.html) |
| 7 | [Poscuántica y cuántica](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-07/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/07-poscuantica-cuantica.html) |
| 8 | [Seguridad aplicada](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/modulo-08/) | [Abrir](https://sgevatschnaider.github.io/CriptografiayBlockchain/simuladores/08-seguridad-aplicada.html) |

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
├── modulo-01/
│   └── index.html
├── modulo-02/
│   └── index.html
├── ...
├── modulo-08/
│   └── index.html
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

El script `scripts/validate-simulators.mjs` revisa la estructura HTML, la sintaxis de JavaScript, enlaces locales, identificadores duplicados y la existencia de los laboratorios obligatorios. La acción `.github/workflows/pages.yml` ejecuta la validación en cada Pull Request y publica el sitio después de actualizar `main`.

## Alcance de seguridad

- Los cifrados clásicos, grupos pequeños y protocolos simplificados son modelos educativos.
- No deben introducirse secretos, claves o datos reales.
- Los ejemplos no sustituyen bibliotecas auditadas ni una revisión profesional.

## Material docente

La [guía docente](../docs/criptografia/guia-docente-simuladores.md) contiene objetivos, tiempos, consignas y criterios de evaluación por módulo.
