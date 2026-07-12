# 05 · Criptografía aplicada a blockchain

Blockchain no es una primitiva criptográfica aislada. Es una arquitectura distribuida que combina hashes, firmas, estructuras autenticadas, redes P2P, reglas de consenso e incentivos. La criptografía aporta integridad y autorización; el consenso aporta acuerdo sobre el estado.

## 1. Hashes y encadenamiento

Cada bloque referencia criptográficamente al anterior. Si cambia un bloque histórico, cambia su hash y se rompe la continuidad posterior.

Esto proporciona **evidencia de manipulación**, pero no vuelve mágicamente inmutable a una base de datos. La resistencia efectiva depende también del consenso, la distribución de validadores y el costo de reescribir la historia.

## 2. Árboles de Merkle

Un árbol de Merkle resume muchas transacciones en una raíz hash.

Ventajas:

- pruebas de inclusión compactas;
- verificación sin descargar todos los datos;
- detección de alteraciones;
- escalabilidad de estructuras autenticadas.

Una prueba contiene los hashes hermanos necesarios para reconstruir el camino hasta la raíz.

## 3. Firmas y autorización

Las firmas digitales demuestran que quien controla una clave privada autorizó una operación.

En una transacción típica:

1. se construye un mensaje canónico;
2. se calcula su representación firmable;
3. se firma con la clave privada;
4. los nodos verifican con la clave pública;
5. las reglas del protocolo determinan si la operación es válida.

La firma no demuestra identidad civil por sí sola. Demuestra control de una clave.

## 4. Wallets, claves y direcciones

Una wallet administra secretos y construye transacciones. La cadena almacena el estado; la wallet no “guarda monedas” en sentido literal.

Conceptos:

- clave privada;
- clave pública;
- dirección derivada;
- frase semilla;
- derivación jerárquica determinista;
- cuentas y rutas de derivación;
- hardware wallets;
- backups y recuperación.

La frase semilla es un secreto maestro. Fotografiarla, enviarla por mensajería o almacenarla en la nube puede comprometer todas las cuentas derivadas.

## 5. Nonces y prevención de repetición

El término nonce aparece con significados distintos:

- en cuentas, puede ser un contador de transacciones;
- en minería, un valor que se modifica para buscar un hash válido;
- en cifrado, un valor que debe cumplir reglas estrictas de unicidad o imprevisibilidad.

Confundir estos usos conduce a errores de diseño.

## 6. Proof of Work y Proof of Stake

### Proof of Work

Usa una búsqueda computacional para demostrar gasto de recursos. El hash actúa como función de prueba, pero la seguridad económica depende de la distribución del poder de cómputo y de las reglas de selección de cadena.

### Proof of Stake

Usa capital bloqueado, selección de validadores y penalizaciones. Las firmas autentican votos y propuestas; la seguridad depende de supuestos económicos y de tolerancia bizantina.

La criptografía autentica mensajes. No reemplaza el modelo de consenso.

## 7. Smart contracts

Los contratos inteligentes ejecutan reglas deterministas, pero pueden contener vulnerabilidades:

- reentrancy;
- control de acceso defectuoso;
- errores de firma o replay;
- manipulación de oráculos;
- frontrunning y MEV;
- desbordamientos o errores de precisión;
- dependencia de timestamps;
- upgrades inseguros;
- exposición de secretos en una cadena pública.

Nunca debe asumirse que cifrar datos antes de publicarlos elimina todos los riesgos: los ciphertexts quedan disponibles y pueden ser analizados o descifrados en el futuro si las claves se comprometen.

## 8. Multisig y criptografía umbral

- **Multisig:** varias firmas independientes deben aprobar una acción.
- **Threshold signature:** varias partes cooperan para producir una única firma sin reconstruir necesariamente la clave completa.

Estas técnicas reducen puntos únicos de falla, pero exigen políticas claras de recuperación, quórum y rotación.

## 9. Compromisos y pruebas de conocimiento cero

Un compromiso permite “sellar” un valor y revelarlo después:

- hiding: oculta el valor;
- binding: impide cambiarlo.

Las pruebas de conocimiento cero permiten demostrar una afirmación sin revelar toda la información subyacente. En blockchain se usan para privacidad, escalabilidad y verificación de cómputos.

## 10. Oráculos y confianza externa

Una blockchain no conoce por sí sola precios, clima, identidades ni resultados externos. Los oráculos introducen datos del mundo real y, con ellos, nuevas superficies de ataque.

La firma de un proveedor garantiza procedencia, pero no garantiza que el dato sea verdadero. Se requieren agregación, incentivos, redundancia y mecanismos de disputa.

## 11. Amenazas cuánticas para blockchain

Las firmas basadas en RSA o curvas elípticas serían vulnerables a un computador cuántico criptográficamente relevante. Los hashes se ven menos afectados: Grover reduce aproximadamente la seguridad de búsqueda, lo que puede compensarse con salidas más largas y parámetros adecuados.

La migración blockchain es especialmente compleja por:

- activos asociados a claves antiguas;
- contratos inmutables;
- direcciones con claves públicas expuestas;
- coordinación social y de protocolo;
- compatibilidad entre firmas clásicas y poscuánticas.

## Laboratorios sugeridos

- Construir un árbol de Merkle y verificar una prueba de inclusión.
- Firmar una transacción didáctica y modificar un campo para observar el fallo.
- Comparar multisig con firma umbral.
- Modelar un ataque de replay y su mitigación.
- Analizar qué propiedades son criptográficas y cuáles dependen del consenso.

---

[⬅️ Esteganografía](./04-esteganografia.md) · [Campus](./README.md) · [Privacidad y protocolos ➡️](./06-protocolos-privacidad.md)
