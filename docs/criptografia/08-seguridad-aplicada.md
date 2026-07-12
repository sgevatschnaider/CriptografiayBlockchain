# 08 · Seguridad criptográfica aplicada

Los incidentes criptográficos rara vez ocurren porque alguien “rompió AES” matemáticamente. Con mayor frecuencia surgen por claves expuestas, nonces reutilizados, protocolos mal compuestos, validaciones omitidas, side channels o configuraciones obsoletas.

## 1. Modelo de amenaza

Antes de elegir algoritmos debe definirse:

- qué activos se protegen;
- quiénes son los adversarios;
- qué capacidades tienen;
- cuánto tiempo debe durar la protección;
- qué ocurre si se compromete una clave;
- qué metadata también debe protegerse;
- cuáles son los costos aceptables de error.

Sin un modelo de amenaza, “usar criptografía fuerte” es una afirmación incompleta.

## 2. Ciclo de vida de claves

Una clave atraviesa etapas:

1. generación;
2. distribución o establecimiento;
3. almacenamiento;
4. uso;
5. rotación;
6. revocación;
7. backup y recuperación;
8. destrucción.

Cada etapa puede introducir riesgos diferentes.

Buenas prácticas:

- usar CSPRNG del sistema operativo;
- separar claves por propósito;
- aplicar mínimo privilegio;
- evitar secretos en código, logs o repositorios;
- usar HSM, TPM o hardware wallets cuando el riesgo lo justifique;
- registrar uso y rotación sin registrar material secreto;
- diseñar recuperación antes de que ocurra una pérdida.

## 3. Nonces, IV, salts y contadores

No son equivalentes.

| Valor | Regla principal |
|---|---|
| Clave | Debe permanecer secreta |
| Nonce | Debe ser único o impredecible según el esquema |
| IV | Requisitos dependen del modo de cifrado |
| Salt | Público, aleatorio y único para derivación de contraseñas |
| Contador | Evita repetición y ordena estados |

Reutilizar un nonce en GCM o en determinados cifradores de flujo puede destruir confidencialidad e integridad.

## 4. Aleatoriedad

La generación de claves depende de fuentes de entropía y generadores criptográficamente seguros.

Problemas frecuentes:

- semillas predecibles;
- máquinas virtuales clonadas;
- dispositivos embebidos con poco ruido inicial;
- uso de generadores no criptográficos;
- fallas silenciosas de hardware;
- exportación de snapshots con estado repetido.

La aleatoriedad debe tratarse como un componente crítico y monitoreable.

## 5. Side channels

Un algoritmo correcto puede filtrar secretos mediante su ejecución física.

Canales:

- tiempo;
- consumo eléctrico;
- emisiones electromagnéticas;
- patrones de caché;
- acceso a memoria;
- mensajes de error;
- tamaño y frecuencia de tráfico.

Mitigaciones:

- operaciones en tiempo constante;
- blinding;
- aislamiento de claves;
- reducción de observables;
- bibliotecas auditadas;
- pruebas específicas de plataforma;
- diseño resistente a fallos inducidos.

## 6. Ataques de protocolo

Algunos fallos no rompen la primitiva, sino la forma en que se usa:

- downgrade;
- replay;
- reflection;
- oracle attacks;
- confusion de algoritmos;
- canonicalización ambigua;
- validación incompleta de certificados;
- firma de mensajes sin contexto;
- cross-protocol attacks.

La **separación de dominios** agrega etiquetas o contextos distintos para impedir que un valor válido en un protocolo se reutilice en otro.

## 7. Gestión de errores

Los mensajes de error pueden transformarse en oráculos. Un sistema debe evitar revelar diferencias explotables entre:

- padding incorrecto;
- firma inválida;
- usuario inexistente;
- contraseña incorrecta;
- token expirado;
- formato malformado.

Las respuestas externas pueden uniformarse, mientras que el registro interno conserva detalle suficiente para operación segura.

## 8. Dependencias y cadena de suministro

La seguridad depende de:

- bibliotecas criptográficas;
- compiladores;
- paquetes;
- firmware;
- hardware;
- proveedores de identidad;
- autoridades certificantes;
- servicios de custodia.

Prácticas:

- fijar versiones y verificar firmas;
- mantener SBOM;
- revisar vulnerabilidades y advisories;
- retirar dependencias abandonadas;
- probar actualizaciones;
- evitar implementaciones caseras.

## 9. Crypto-agility operacional

Un sistema ágil debe poder:

- identificar algoritmos activos;
- negociar versiones sin downgrade;
- rotar claves masivamente;
- admitir formatos nuevos;
- mantener compatibilidad temporal;
- revocar parámetros vulnerables;
- auditar dónde persisten datos cifrados antiguos.

La agilidad no significa aceptar cualquier algoritmo. Significa cambiar de forma controlada y verificable.

## 10. Auditoría criptográfica

Lista de revisión:

- [ ] ¿Está definido el objetivo de seguridad?
- [ ] ¿Se usa AEAD para cifrado de datos?
- [ ] ¿Las claves están separadas por función?
- [ ] ¿Los nonces cumplen los requisitos del algoritmo?
- [ ] ¿Las contraseñas usan una KDF apropiada?
- [ ] ¿La comparación de secretos es constante en tiempo?
- [ ] ¿Se validan certificados, firmas y claves públicas?
- [ ] ¿Existe rotación, revocación y recuperación?
- [ ] ¿Se evitan algoritmos y parámetros obsoletos?
- [ ] ¿Se analizaron side channels y metadata?
- [ ] ¿El protocolo resiste replay y downgrade?
- [ ] ¿Existe inventario para migración poscuántica?

## 11. Diseño de laboratorios seguros

Los ejercicios educativos deben:

- operar con datos sintéticos;
- ejecutarse en entornos aislados;
- explicar explícitamente qué partes son inseguras;
- evitar claves o credenciales reales;
- diferenciar demostración de implementación productiva;
- incluir pruebas negativas y análisis de fallos.

## Proyecto integrador sugerido

Diseñar una aplicación que:

1. derive una clave desde una contraseña mediante Argon2id;
2. cifre datos con AEAD;
3. firme un manifiesto con una clave separada;
4. construya un árbol de Merkle para integridad por bloques;
5. proteja las claves mediante una política de rotación;
6. documente el modelo de amenaza;
7. proponga una ruta de migración poscuántica.

El valor del proyecto está en justificar cada decisión y analizar qué ocurriría si un componente falla.

---

[⬅️ Poscuántica y cuántica](./07-poscuantica-y-cuantica.md) · [Campus](./README.md) · [README principal ➡️](../../README.md)
