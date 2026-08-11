(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const encoder = new TextEncoder();
  const state = {
    macKey: null,
    macKeyBytes: null,
    macTag: null,
    hkdfIkm: null,
    hkdfSalt: null,
    signatureKeys: null,
    signature: null,
    signatureAlgorithm: null,
    ed25519Supported: false,
  };

  function requireCrypto() {
    if (!globalThis.crypto?.subtle || !globalThis.isSecureContext) {
      throw new Error("Web Crypto requiere HTTPS o localhost.");
    }
  }

  function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  function hex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  function base64(bytes) {
    let binary = "";
    for (let index = 0; index < bytes.length; index += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    }
    return btoa(binary);
  }

  function status(id, message, kind = "") {
    const element = byId(id);
    element.textContent = message;
    if (kind) element.dataset.kind = kind;
    else delete element.dataset.kind;
  }

  function hamming(left, right) {
    const limit = Math.min(left.length, right.length);
    let distance = Math.abs(left.length - right.length) * 8;
    for (let index = 0; index < limit; index += 1) {
      let value = left[index] ^ right[index];
      while (value) {
        distance += value & 1;
        value >>>= 1;
      }
    }
    return distance;
  }

  async function digest(algorithm, value) {
    return new Uint8Array(
      await crypto.subtle.digest(
        algorithm,
        typeof value === "string" ? encoder.encode(value) : value,
      ),
    );
  }

  async function calculateHashes() {
    try {
      requireCrypto();
      const algorithm = byId("hash-algorithm").value;
      const [left, right] = await Promise.all([
        digest(algorithm, byId("hash-a").value),
        digest(algorithm, byId("hash-b").value),
      ]);
      const distance = hamming(left, right);
      const bits = left.length * 8;
      const ratio = distance / bits;
      byId("hash-output-a").textContent = hex(left);
      byId("hash-output-b").textContent = hex(right);
      byId("hash-distance").textContent = `${distance} / ${bits} bits`;
      byId("hash-ratio").textContent = `${(ratio * 100).toFixed(1)}%`;
      byId("hash-meter").style.width = `${ratio * 100}%`;
      status(
        "hash-status",
        distance
          ? `Las entradas produjeron salidas diferentes. ${distance} bits cambiaron; esto ilustra avalancha, no demuestra por sí solo todas las propiedades de seguridad.`
          : "Las entradas son idénticas y el algoritmo determinista produjo el mismo digest.",
        distance ? "good" : "warn",
      );
    } catch (error) {
      status("hash-status", error.message, "bad");
    }
  }

  async function generateMacKey() {
    requireCrypto();
    state.macKeyBytes = randomBytes(32);
    state.macKey = await crypto.subtle.importKey(
      "raw",
      state.macKeyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
    state.macTag = null;
    byId("mac-key").textContent = hex(state.macKeyBytes);
    byId("mac-tag").textContent = "—";
    status(
      "mac-status",
      "Clave HMAC nueva. Se muestra únicamente con fines didácticos.",
      "good",
    );
  }

  async function createMac() {
    try {
      if (!state.macKey) await generateMacKey();
      state.macTag = new Uint8Array(
        await crypto.subtle.sign(
          "HMAC",
          state.macKey,
          encoder.encode(byId("mac-message").value),
        ),
      );
      byId("mac-tag").textContent = hex(state.macTag);
      status(
        "mac-status",
        "Tag creado: está ligado a estos bytes y a la clave compartida.",
        "good",
      );
    } catch (error) {
      status("mac-status", error.message, "bad");
    }
  }

  async function verifyMac(tag = state.macTag, label = "Tag") {
    try {
      if (!state.macKey || !tag) throw new Error("Creá primero un tag HMAC.");
      const valid = await crypto.subtle.verify(
        "HMAC",
        state.macKey,
        tag,
        encoder.encode(byId("mac-message").value),
      );
      status(
        "mac-status",
        valid
          ? `${label} válido: clave, mensaje y tag coinciden.`
          : `${label} inválido: el mensaje, la clave o el tag no coincide.`,
        valid ? "good" : "bad",
      );
      return valid;
    } catch (error) {
      status("mac-status", error.message, "bad");
      return false;
    }
  }

  function parseSalt(value) {
    const normalized = value.trim().toLowerCase();
    if (!/^[0-9a-f]{32}$/.test(normalized))
      throw new Error(
        "La salt debe contener exactamente 32 dígitos hexadecimales.",
      );
    return new Uint8Array(
      normalized.match(/../g).map((pair) => Number.parseInt(pair, 16)),
    );
  }

  async function derivePbkdf2() {
    try {
      requireCrypto();
      const password = byId("pbkdf-password").value.normalize("NFC");
      if (!password) throw new Error("Ingresá una contraseña ficticia.");
      const salt = parseSalt(byId("pbkdf-salt").value);
      const iterations = Number(byId("pbkdf-iterations").value);
      const material = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"],
      );
      const started = performance.now();
      const bits = new Uint8Array(
        await crypto.subtle.deriveBits(
          { name: "PBKDF2", hash: "SHA-256", salt, iterations },
          material,
          256,
        ),
      );
      const elapsed = performance.now() - started;
      byId("pbkdf-output").textContent = hex(bits);
      byId("pbkdf-time").textContent =
        elapsed < 1000
          ? `${elapsed.toFixed(1)} ms`
          : `${(elapsed / 1000).toFixed(2)} s`;
      status(
        "pbkdf-status",
        `PBKDF2 ejecutó ${iterations.toLocaleString("es-AR")} iteraciones. El tiempo local encarece cada intento, pero debe calibrarse para la plataforma real.`,
        "good",
      );
    } catch (error) {
      status("pbkdf-status", error.message, "bad");
    }
  }

  function newPbkdfSalt() {
    byId("pbkdf-salt").value = hex(randomBytes(16));
    status(
      "pbkdf-status",
      "Salt pública nueva. Derivá otra vez para observar que cambia la salida.",
      "warn",
    );
  }

  function newHkdfIkm() {
    state.hkdfIkm = randomBytes(32);
    state.hkdfSalt = randomBytes(32);
    byId("hkdf-ikm").textContent = hex(state.hkdfIkm);
    byId("hkdf-output-a").textContent = "—";
    byId("hkdf-output-b").textContent = "—";
    status(
      "hkdf-status",
      "Nuevo material de entrada y salt HKDF generados.",
      "good",
    );
  }

  async function deriveHkdf() {
    try {
      requireCrypto();
      if (!state.hkdfIkm) newHkdfIkm();
      const contextA = byId("hkdf-context-a").value;
      const contextB = byId("hkdf-context-b").value;
      if (!contextA || !contextB)
        throw new Error("Completá ambos contextos info.");
      const material = await crypto.subtle.importKey(
        "raw",
        state.hkdfIkm,
        "HKDF",
        false,
        ["deriveBits"],
      );
      const derive = async (info) =>
        new Uint8Array(
          await crypto.subtle.deriveBits(
            {
              name: "HKDF",
              hash: "SHA-256",
              salt: state.hkdfSalt,
              info: encoder.encode(info),
            },
            material,
            256,
          ),
        );
      const [keyA, keyB] = await Promise.all([
        derive(contextA),
        derive(contextB),
      ]);
      const same = hex(keyA) === hex(keyB);
      byId("hkdf-output-a").textContent = hex(keyA);
      byId("hkdf-output-b").textContent = hex(keyB);
      status(
        "hkdf-status",
        same
          ? "Los contextos son iguales y HKDF produjo la misma clave. Cambiá info para separar dominios."
          : "Mismo IKM y salt, pero info diferente: HKDF separó las claves por propósito.",
        same ? "warn" : "good",
      );
    } catch (error) {
      status("hkdf-status", error.message, "bad");
    }
  }

  function signatureParameters(name) {
    if (name === "RSA-PSS") {
      return {
        generate: {
          name: "RSA-PSS",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        sign: { name: "RSA-PSS", saltLength: 32 },
      };
    }
    if (name === "ECDSA") {
      return {
        generate: { name: "ECDSA", namedCurve: "P-256" },
        sign: { name: "ECDSA", hash: "SHA-256" },
      };
    }
    return { generate: { name: "Ed25519" }, sign: { name: "Ed25519" } };
  }

  async function publicFingerprint(publicKey) {
    const exported = new Uint8Array(
      await crypto.subtle.exportKey("spki", publicKey),
    );
    return hex(await digest("SHA-256", exported));
  }

  function resetSignature(
    message = "La selección cambió. Generá un par para este algoritmo.",
  ) {
    state.signatureKeys = null;
    state.signature = null;
    state.signatureAlgorithm = null;
    byId("signature-fingerprint").textContent = "—";
    byId("signature-output").textContent = "—";
    byId("signature-length").textContent = "—";
    byId("signature-result").textContent = "—";
    status("signature-status", message, "warn");
  }

  async function generateSignatureKeys(updateStatus = true) {
    requireCrypto();
    const name = byId("signature-algorithm").value;
    if (name === "Ed25519" && !state.ed25519Supported)
      throw new Error(
        "Este navegador no ofrece Ed25519 mediante Web Crypto. Elegí RSA-PSS o ECDSA.",
      );
    const parameters = signatureParameters(name);
    state.signatureKeys = await crypto.subtle.generateKey(
      parameters.generate,
      false,
      ["sign", "verify"],
    );
    state.signatureAlgorithm = name;
    state.signature = null;
    byId("signature-fingerprint").textContent = await publicFingerprint(
      state.signatureKeys.publicKey,
    );
    byId("signature-output").textContent = "—";
    byId("signature-length").textContent = "—";
    byId("signature-result").textContent = "Pendiente";
    if (updateStatus)
      status(
        "signature-status",
        `Par ${name} generado. La huella identifica la clave pública, no una persona por sí sola.`,
        "good",
      );
  }

  async function signMessage() {
    try {
      const name = byId("signature-algorithm").value;
      if (!state.signatureKeys || state.signatureAlgorithm !== name)
        await generateSignatureKeys(false);
      const parameters = signatureParameters(name);
      state.signature = new Uint8Array(
        await crypto.subtle.sign(
          parameters.sign,
          state.signatureKeys.privateKey,
          encoder.encode(byId("signature-message").value),
        ),
      );
      byId("signature-output").textContent = base64(state.signature);
      byId("signature-length").textContent = `${state.signature.length} bytes`;
      byId("signature-result").textContent = "Pendiente";
      status(
        "signature-status",
        `Documento firmado con ${name}. Alterá el texto o la clave pública y verificá otra vez.`,
        "good",
      );
    } catch (error) {
      status("signature-status", error.message, "bad");
    }
  }

  async function verifySignature(
    publicKey = state.signatureKeys?.publicKey,
    label = "Firma",
  ) {
    try {
      if (!publicKey || !state.signature)
        throw new Error("Generá el par y firmá el documento primero.");
      const parameters = signatureParameters(state.signatureAlgorithm);
      const valid = await crypto.subtle.verify(
        parameters.sign,
        publicKey,
        state.signature,
        encoder.encode(byId("signature-message").value),
      );
      byId("signature-result").textContent = valid ? "Válida" : "Inválida";
      status(
        "signature-status",
        valid
          ? `${label} válida: mensaje, firma y clave pública coinciden.`
          : `${label} inválida: cambió el mensaje, la firma o la clave pública.`,
        valid ? "good" : "bad",
      );
      return valid;
    } catch (error) {
      byId("signature-result").textContent = "Error";
      status("signature-status", error.message, "bad");
      return false;
    }
  }

  async function verifyWithWrongKey() {
    try {
      if (!state.signature)
        throw new Error("Firmá el documento antes de probar otra clave.");
      const other = await crypto.subtle.generateKey(
        signatureParameters(state.signatureAlgorithm).generate,
        false,
        ["sign", "verify"],
      );
      await verifySignature(other.publicKey, "Prueba con otra clave pública");
    } catch (error) {
      status("signature-status", error.message, "bad");
    }
  }

  function recommendSignature() {
    const choices = {
      legacy: [
        "RSA-PSS",
        "Confirmar módulo, SHA-256 o superior, saltLength, certificados y compatibilidad del perfil.",
      ],
      compact: [
        "ECDSA P-256 o EdDSA, según el protocolo",
        "Verificar curvas permitidas, formato de firma, biblioteca y gestión segura de claves.",
      ],
      simple: [
        "Ed25519 / EdDSA cuando el ecosistema lo estandariza",
        "Confirmar variante, soporte, contexto, prehash y codificación de claves.",
      ],
      pq: [
        "ML-DSA o SLH-DSA dentro de un plan de transición",
        "Medir tamaños, rendimiento, formatos híbridos, interoperabilidad e inventario criptográfico.",
      ],
    };
    const [recommendation, followup] =
      choices[byId("signature-scenario").value];
    byId("signature-recommendation").textContent = recommendation;
    byId("signature-followup").textContent = followup;
  }

  async function detectEd25519() {
    const indicator = byId("eddsa-support");
    try {
      requireCrypto();
      await crypto.subtle.generateKey({ name: "Ed25519" }, false, [
        "sign",
        "verify",
      ]);
      state.ed25519Supported = true;
      indicator.textContent = "Ed25519 disponible";
      indicator.classList.add("good");
    } catch {
      state.ed25519Supported = false;
      indicator.textContent = "Ed25519 no disponible";
      indicator.classList.add("bad");
      byId("signature-algorithm").querySelector(
        'option[value="Ed25519"]',
      ).disabled = true;
    }
  }

  byId("hash-calculate").addEventListener("click", calculateHashes);
  byId("hash-one-bit").addEventListener("click", () => {
    byId("hash-a").value = "A";
    byId("hash-b").value = "C";
    calculateHashes();
  });
  byId("hash-algorithm").addEventListener("change", calculateHashes);
  byId("mac-new-key").addEventListener("click", () =>
    generateMacKey().catch((error) =>
      status("mac-status", error.message, "bad"),
    ),
  );
  byId("mac-create").addEventListener("click", createMac);
  byId("mac-verify").addEventListener("click", () => verifyMac());
  byId("mac-tamper").addEventListener("click", () => {
    byId("mac-message").value += ";alterado=1";
    status(
      "mac-status",
      "Mensaje alterado después de crear el tag. Ejecutá la verificación.",
      "warn",
    );
  });
  byId("mac-random-tag").addEventListener("click", () =>
    verifyMac(randomBytes(32), "Tag aleatorio"),
  );
  byId("pbkdf-new-salt").addEventListener("click", newPbkdfSalt);
  byId("pbkdf-run").addEventListener("click", derivePbkdf2);
  byId("pbkdf-iterations").addEventListener("input", () => {
    byId("pbkdf-iterations-label").textContent = Number(
      byId("pbkdf-iterations").value,
    ).toLocaleString("es-AR");
    status(
      "pbkdf-status",
      "Costo modificado. Derivá para medir este navegador.",
      "warn",
    );
  });
  byId("hkdf-new-ikm").addEventListener("click", newHkdfIkm);
  byId("hkdf-run").addEventListener("click", deriveHkdf);
  byId("signature-algorithm").addEventListener("change", () =>
    resetSignature(),
  );
  byId("signature-generate").addEventListener("click", () =>
    generateSignatureKeys().catch((error) =>
      status("signature-status", error.message, "bad"),
    ),
  );
  byId("signature-sign").addEventListener("click", signMessage);
  byId("signature-verify").addEventListener("click", () => verifySignature());
  byId("signature-tamper").addEventListener("click", () => {
    byId("signature-message").value += " [MODIFICADO]";
    status(
      "signature-status",
      "Documento alterado después de firmar. Ejecutá la verificación.",
      "warn",
    );
  });
  byId("signature-wrong-key").addEventListener("click", verifyWithWrongKey);
  byId("signature-scenario").addEventListener("change", recommendSignature);

  calculateHashes();
  newPbkdfSalt();
  newHkdfIkm();
  recommendSignature();
  detectEd25519();
  generateMacKey().catch((error) => status("mac-status", error.message, "bad"));
})();
