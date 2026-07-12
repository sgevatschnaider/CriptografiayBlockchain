# 01 · Criptografía clásica y nacimiento del criptoanálisis

La criptografía clásica estudia métodos anteriores a la computación moderna. Su valor actual no está en usarlos para proteger información real, sino en comprender tres ideas fundamentales: **clave**, **transformación** y **ataque**.

## Objetivos

- Diferenciar sustitución y transposición.
- Comprender cómo la redundancia del lenguaje permite atacar cifrados.
- Relacionar espacio de claves, distribución de frecuencias y seguridad.
- Introducir el principio de Kerckhoffs: la seguridad debe depender de la clave, no del secreto del algoritmo.

## 1. Sustitución

En un cifrado por sustitución, cada símbolo del texto claro se reemplaza por otro.

### Cifrado César

Desplaza cada letra una cantidad fija `k` dentro del alfabeto:

```text
E_k(x) = (x + k) mod m
D_k(y) = (y - k) mod m
```

Su debilidad es el pequeño espacio de claves. Un atacante puede probar todos los desplazamientos.

### Cifrado afín

Generaliza a César:

```text
E(x) = (a·x + b) mod m
```

Para poder descifrar, `a` debe tener inverso módulo `m`; es decir, `mcd(a,m)=1`.

### Sustitución monoalfabética

Usa una permutación completa del alfabeto. Aunque el espacio de claves es grande, conserva la distribución estadística del idioma. Por eso puede atacarse mediante frecuencias de letras, bigramas y patrones de palabras.

## 2. Sustitución polialfabética

### Vigenère

Usa una palabra clave para aplicar desplazamientos diferentes a lo largo del mensaje. Históricamente fue importante porque difumina las frecuencias simples.

Ataques clásicos:

- método de Kasiski;
- índice de coincidencia;
- análisis de frecuencias por columnas una vez estimada la longitud de clave.

La lección central es que **reutilizar una clave periódica crea estructura explotable**.

## 3. Transposición

La transposición no cambia los símbolos: cambia sus posiciones. Ejemplos:

- escítala;
- transposición por columnas;
- rutas sobre grillas;
- permutaciones definidas por una clave.

La distribución de frecuencias permanece intacta, pero se alteran las relaciones locales entre símbolos.

## 4. Criptoanálisis clásico

El criptoanálisis busca recuperar el mensaje o la clave sin conocer el secreto. Sus herramientas históricas anticipan técnicas modernas:

| Técnica clásica | Idea moderna relacionada |
|---|---|
| Frecuencia de letras | Modelado estadístico |
| Kasiski | Detección de periodicidad |
| Texto probable | Known-plaintext attack |
| Prueba exhaustiva | Fuerza bruta |
| Comparación de patrones | Inferencia estructural |

## 5. One-Time Pad

El cifrado de Vernam con una clave verdaderamente aleatoria, tan larga como el mensaje, usada una sola vez y mantenida en secreto ofrece **secreto perfecto**.

```text
C = M XOR K
M = C XOR K
```

Su problema no es matemático sino operativo: generar, distribuir, almacenar y no reutilizar claves enormes. Reutilizar la clave destruye la seguridad:

```text
C1 XOR C2 = M1 XOR M2
```

## 6. Qué debe aprenderse de estos sistemas

1. Un espacio de claves grande no basta si el cifrado filtra estructura.
2. La seguridad por oscuridad es frágil.
3. La reutilización de claves y patrones suele ser fatal.
4. El lenguaje natural contiene redundancia explotable.
5. Diseño y criptoanálisis evolucionan juntos.

## Actividades sugeridas

- Implementar César y romperlo por fuerza bruta.
- Comparar histogramas antes y después de una sustitución monoalfabética.
- Estimar la longitud de una clave Vigenère mediante coincidencias.
- Demostrar por qué reutilizar una clave de One-Time Pad filtra información.

> **Advertencia:** estos cifrados son pedagógicos. No deben utilizarse para proteger información real.

---

[⬅️ Campus](./README.md) · [Siguiente: Fundamentos matemáticos ➡️](./02-fundamentos-matematicos.md)
