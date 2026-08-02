# Clase 3 · De la contraseña a AES-GCM

**Duración:** 90 minutos  
**Pregunta rectora:** ¿cómo se transforma una contraseña humana en una clave utilizable y cómo puede el receptor detectar que un criptograma fue modificado?

## Resultados de aprendizaje

Al finalizar la clase, el estudiante podrá:

- diferenciar contraseña, clave criptográfica y entropía;
- explicar el papel de la salt y de una KDF;
- reconocer que PBKDF2 aumenta el costo, pero no crea entropía;
- distinguir el bloque de 128 bits de AES de la longitud de su clave;
- comparar ECB, CBC, CTR, GCM y XTS según su propósito;
- separar ciphertext, IV o nonce, AAD y tag;
- cifrar y recuperar un archivo local con AES-256-GCM;
- explicar por qué GCM rechaza un paquete alterado;
- reconstruir conceptualmente la arquitectura de VeraCrypt.

## Secuencia

| Tiempo | Estación | Recurso | Evidencia observable |
|---:|---|---|---|
| 0–10 min | Corrección de apertura | [Espacio de claves](../../simuladores/modulo-02/espacio-claves-complejidad.html) | Diferencia entre límite ideal y contraseña humana |
| 10–30 min | Contraseña, salt y costo | [Laboratorio KDF](../../simuladores/modulo-03/contrasena-salt-kdf.html) | Igualdad con mismos parámetros y cambio con otra salt |
| 30–55 min | Modos AES | [AES y AEAD](../../simuladores/modulo-03/modos-aes-aead.html) | CBC/CTR descifran alteraciones; GCM las rechaza |
| 55–75 min | Archivo local | [Cifrado de archivos](../../simuladores/modulo-03/cifrado-local-archivos.html) | Exportación, importación, recuperación y rechazo |
| 75–82 min | Puente con VeraCrypt | [Ruta guiada](../../simuladores/modulo-03/ruta-guiada.html) | Ubicación de KDF, encabezado, claves maestras y XTS |
| 82–90 min | Evaluación de salida | [Exit ticket](../../simuladores/modulo-03/ruta-guiada.html#salida) | Cinco respuestas justificadas |

## Correcciones conceptuales de apertura

1. Para un alfabeto de (N) símbolos, cada elección uniforme aporta 
   \(\log_2(N)\) bits ideales. El resultado es **por carácter**, no para toda la contraseña.
2. La fórmula \(L\log_2(N)\) supone elecciones independientes y uniformes. No estima correctamente una frase humana.
3. AES-256 utiliza una clave de 256 bits, pero el bloque de AES siempre mide 128 bits.
4. Derivar 256 bits desde una contraseña débil no convierte la entrada en un secreto de 256 bits.
5. Una KDF aumenta el costo de cada intento; la salt evita precálculo y reutilización entre registros, pero no es secreta.

## Experimentos mínimos

### KDF

1. Misma contraseña + misma salt + mismas iteraciones → misma clave.
2. Misma contraseña + otra salt → otra clave.
3. Más iteraciones → mayor tiempo local.
4. Entrada humana predecible + KDF costosa → candidato todavía predecible, aunque cada prueba cueste más.

### AES

1. Cifrar dos veces con la misma clave y parámetros únicos.
2. Alterar ciphertext en CTR.
3. Alterar IV o ciphertext en CBC.
4. Alterar ciphertext, nonce, AAD y tag en GCM.
5. Comparar “produjo texto” con “autenticó el paquete”.

### Archivo

1. Crear el archivo ficticio de demostración.
2. Cifrarlo localmente y descargar el JSON.
3. Importarlo y recuperar el original.
4. Alterar un bit y comprobar el rechazo.
5. Probar una contraseña incorrecta y mantener un mensaje de error general.

## Relación con VeraCrypt

La práctica obligatoria trabaja la cadena conceptual:

```text
contraseña + salt + costo → KDF → clave → AES-GCM → ciphertext + tag
```

VeraCrypt queda como extensión para operaciones que una página web no reproduce:

```text
contraseña + PIM/keyfiles → KDF → encabezado protegido → claves maestras → sectores con XTS
```

El laboratorio de archivos no monta unidades, no cifra sectores de forma aleatoria y no implementa volúmenes ocultos.

## Criterio de evaluación

El estudiante aprueba la evidencia de salida si puede explicar, sin apoyarse solo en nombres de algoritmos:

1. qué dato permanece secreto;
2. qué parámetros son públicos;
3. qué aporta la KDF;
4. qué aporta el modo de cifrado;
5. qué evidencia permite rechazar una alteración.

---

Material elaborado por el profesor Sergio Gevatschnaider.

[Abrir la ruta de la Clase 3](../../simuladores/modulo-03/ruta-guiada.html) · [Volver al Módulo 3](./03-criptografia-moderna.md)
