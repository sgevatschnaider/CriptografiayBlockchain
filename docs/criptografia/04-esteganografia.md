# 04 · Esteganografía, marcas de agua y canales encubiertos

La criptografía intenta que un mensaje resulte incomprensible para quien no posee la clave. La **esteganografía** intenta ocultar que el mensaje existe. Ambas técnicas pueden combinarse, pero responden a problemas distintos.

## 1. Modelo básico

```text
mensaje secreto + clave + portador → estego-objeto
```

- **Mensaje:** información que se desea ocultar.
- **Portador:** imagen, audio, video, texto, paquete de red u otro medio.
- **Estego-objeto:** portador modificado que contiene el mensaje.
- **Clave:** controla posiciones, transformaciones o selección de características.

La seguridad no debe depender únicamente de que el método permanezca desconocido.

## 2. Esteganografía en imágenes

### LSB

El método Least Significant Bit modifica los bits menos significativos de los píxeles. Es sencillo y tiene alta capacidad, pero suele ser frágil frente a compresión, redimensionado, filtrado y análisis estadístico.

### Dominio transformado

En formatos con compresión, el mensaje puede insertarse modificando coeficientes de transformadas como DCT o wavelets. Estos métodos pueden resistir mejor ciertas operaciones, aunque su diseño es más complejo.

### Selección adaptativa

Los algoritmos modernos prefieren regiones con textura, ruido o alta entropía visual, donde pequeñas modificaciones resultan menos detectables.

## 3. Audio y video

Técnicas comunes:

- modificación de bits poco significativos;
- eco oculto;
- espectro ensanchado;
- codificación de fase;
- inserción temporal o frecuencial;
- distribución del mensaje entre cuadros de video.

El desafío es equilibrar capacidad, imperceptibilidad y robustez.

## 4. Texto y metadatos

Puede ocultarse información mediante:

- espacios, caracteres invisibles o variantes Unicode;
- selección de sinónimos;
- estructura sintáctica;
- orden o formato;
- metadatos de archivos.

Estos canales suelen ser frágiles y pueden desaparecer al copiar, normalizar o convertir el contenido.

## 5. Canales encubiertos

Un canal encubierto utiliza recursos no diseñados para comunicar información:

- tiempos de respuesta;
- tamaño u orden de paquetes;
- campos no utilizados de protocolos;
- patrones de acceso a memoria o almacenamiento;
- comportamiento compartido entre procesos.

Son relevantes en seguridad de sistemas porque pueden eludir controles convencionales.

## 6. Estegoanálisis

El estegoanálisis busca detectar o extraer información oculta.

Enfoques:

- análisis estadístico de histogramas y correlaciones;
- comparación con el portador original;
- detección de anomalías de compresión;
- modelos de machine learning y deep learning;
- análisis de metadatos y estructura del archivo;
- pruebas de robustez ante transformaciones.

La pregunta central no es solo “¿puedo ver la alteración?”, sino “¿puedo distinguir estadísticamente un objeto normal de uno modificado?”.

## 7. Marcas de agua digitales

Una marca de agua busca vincular información con una obra o señal. Puede ser:

- visible o invisible;
- robusta o frágil;
- destinada a propiedad, trazabilidad o autenticación;
- reversible o irreversible.

La marca robusta intenta sobrevivir a compresión, recortes o conversiones. La marca frágil busca romperse cuando el contenido se modifica, funcionando como evidencia de integridad.

## 8. Métricas de evaluación

| Dimensión | Pregunta |
|---|---|
| Capacidad | ¿Cuánta información puede ocultarse? |
| Imperceptibilidad | ¿Qué tan poco cambia el portador? |
| Robustez | ¿Sobrevive a transformaciones? |
| Seguridad | ¿Puede detectarse sin conocer la clave? |
| Fidelidad | ¿Cuánto se degrada el contenido? |

Para imágenes pueden emplearse PSNR, SSIM y métricas perceptuales, pero ninguna sustituye un análisis de amenaza.

## 9. Composición segura

Una arquitectura razonable puede:

1. cifrar el mensaje con AEAD;
2. comprimirlo cuando corresponda;
3. insertar el ciphertext en el portador mediante una clave independiente;
4. verificar integridad al extraerlo.

La esteganografía no debe sustituir el cifrado. Si el mensaje oculto se descubre, todavía debe permanecer protegido.

## 10. Ética y uso responsable

La esteganografía tiene aplicaciones legítimas en protección de fuentes, marcas de agua, trazabilidad, resiliencia de comunicaciones e investigación. También puede utilizarse para evasión o exfiltración. Los laboratorios deben realizarse sobre archivos propios y entornos controlados.

## Laboratorios sugeridos

- Insertar un mensaje breve por LSB y medir PSNR.
- Comprimir la imagen y evaluar pérdida del mensaje.
- Comparar regiones uniformes y texturadas.
- Diseñar un detector estadístico simple.
- Cifrar antes de ocultar y verificar la diferencia conceptual.

---

[⬅️ Criptografía moderna](./03-criptografia-moderna.md) · [Campus](./README.md) · [Criptografía y blockchain ➡️](./05-criptografia-blockchain.md)
