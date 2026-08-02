(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  let rsaKeys = null;
  let rsaCiphertext = null;
  let aliceKeys = null;
  let bobKeys = null;
  const HYBRID_SUITE = Object.freeze({
    v: 1,
    agreement: 'ECDH-P-256',
    kdf: 'HKDF-SHA-256',
    encryption: 'AES-256-GCM'
  });

  function assertWebCrypto() {
    if (!globalThis.crypto?.subtle || !globalThis.isSecureContext) throw new Error('Web Crypto requiere HTTPS o localhost.');
  }

  async function digest(bytes) {
    return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  }

  async function fingerprint(key, format) {
    const exported = await crypto.subtle.exportKey(format, key);
    return Lab.bytesToHex(await digest(exported));
  }

  async function generateRsaKeys() {
    try {
      assertWebCrypto();
      byId('generate-rsa-keys').disabled = true;
      byId('generate-rsa-keys').textContent = 'Generando…';
      rsaKeys = await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        false,
        ['encrypt', 'decrypt']
      );
      rsaCiphertext = null;
      byId('rsa-key-state').textContent = 'Sí';
      byId('rsa-fingerprint').textContent = await fingerprint(rsaKeys.publicKey, 'spki');
      byId('rsa-ciphertext').textContent = '—';
      byId('rsa-recovered').textContent = '—';
      Lab.setStatus(byId('rsa-status'), 'Par RSA-OAEP generado. La privada no se muestra ni se exporta.', 'good');
    } catch (error) {
      Lab.setStatus(byId('rsa-status'), error.message, 'bad');
    } finally {
      byId('generate-rsa-keys').disabled = false;
      byId('generate-rsa-keys').textContent = 'Generar RSA 2048';
    }
  }

  async function rsaEncrypt() {
    try {
      if (!rsaKeys) await generateRsaKeys();
      const message = Lab.te.encode(byId('rsa-message').value);
      if (message.length > 190) throw new Error(`La entrada ocupa ${message.length} bytes y supera el máximo de 190 para RSA-2048/OAEP/SHA-256.`);
      rsaCiphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaKeys.publicKey, message));
      byId('rsa-message-bytes').textContent = message.length;
      byId('rsa-cipher-bytes').textContent = rsaCiphertext.length;
      byId('rsa-ciphertext').textContent = Lab.bytesToB64(rsaCiphertext);
      byId('rsa-recovered').textContent = '—';
      Lab.setStatus(byId('rsa-status'), 'Mensaje cifrado con la clave pública. OAEP produce un ciphertext de 256 bytes para este módulo RSA.', 'good');
    } catch (error) {
      Lab.setStatus(byId('rsa-status'), error.message, 'bad');
    }
  }

  async function rsaDecrypt(privateKey = rsaKeys?.privateKey) {
    try {
      if (!privateKey || !rsaCiphertext) throw new Error('Generá el par y cifrá un mensaje primero.');
      const plaintext = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, rsaCiphertext);
      byId('rsa-recovered').textContent = Lab.td.decode(plaintext);
      Lab.setStatus(byId('rsa-status'), 'OAEP válido: la clave privada recuperó el mensaje.', 'good');
      return true;
    } catch {
      byId('rsa-recovered').textContent = '—';
      Lab.setStatus(byId('rsa-status'), 'No se pudo descifrar: ciphertext alterado o clave privada incorrecta.', 'bad');
      return false;
    }
  }

  async function generateEcdhPairs() {
    try {
      assertWebCrypto();
      [aliceKeys, bobKeys] = await Promise.all([
        crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']),
        crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits'])
      ]);
      const [alicePrint, bobPrint] = await Promise.all([
        fingerprint(aliceKeys.publicKey, 'raw'),
        fingerprint(bobKeys.publicKey, 'raw')
      ]);
      byId('alice-fingerprint').textContent = alicePrint;
      byId('bob-fingerprint').textContent = bobPrint;
      byId('alice-secret').textContent = 'Pendiente';
      byId('bob-secret').textContent = 'Pendiente';
      Lab.setStatus(byId('ecdh-status'), 'Pares efímeros generados. Intercambiá las claves públicas para derivar.', 'good');
    } catch (error) {
      Lab.setStatus(byId('ecdh-status'), error.message, 'bad');
    }
  }

  async function derive(privateKey, publicKey) {
    return new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'ECDH', public: publicKey },
      privateKey,
      256
    ));
  }

  async function deriveEcdh() {
    try {
      if (!aliceKeys || !bobKeys) await generateEcdhPairs();
      const [aliceSecret, bobSecret] = await Promise.all([
        derive(aliceKeys.privateKey, bobKeys.publicKey),
        derive(bobKeys.privateKey, aliceKeys.publicKey)
      ]);
      const same = Lab.bytesToHex(aliceSecret) === Lab.bytesToHex(bobSecret);
      byId('alice-secret').textContent = Lab.bytesToHex(aliceSecret);
      byId('bob-secret').textContent = Lab.bytesToHex(bobSecret);
      Lab.setStatus(byId('ecdh-status'), same
        ? 'Los dos cálculos produjeron exactamente los mismos 256 bits.'
        : 'Los secretos no coinciden; el intercambio no es coherente.', same ? 'good' : 'bad');
      return { aliceSecret, bobSecret, same };
    } catch (error) {
      Lab.setStatus(byId('ecdh-status'), error.message, 'bad');
      throw error;
    }
  }

  async function simulateMitm() {
    try {
      if (!aliceKeys || !bobKeys) await generateEcdhPairs();
      const [malloryAlice, malloryBob] = await Promise.all([
        crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']),
        crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits'])
      ]);
      const [aliceSide, malloryWithAlice, bobSide, malloryWithBob] = await Promise.all([
        derive(aliceKeys.privateKey, malloryAlice.publicKey),
        derive(malloryAlice.privateKey, aliceKeys.publicKey),
        derive(bobKeys.privateKey, malloryBob.publicKey),
        derive(malloryBob.privateKey, bobKeys.publicKey)
      ]);
      const aliceMatch = Lab.bytesToHex(aliceSide) === Lab.bytesToHex(malloryWithAlice);
      const bobMatch = Lab.bytesToHex(bobSide) === Lab.bytesToHex(malloryWithBob);
      const endpointsMatch = Lab.bytesToHex(aliceSide) === Lab.bytesToHex(bobSide);
      byId('mitm-alice-match').textContent = aliceMatch ? 'Coinciden' : 'No coinciden';
      byId('mitm-bob-match').textContent = bobMatch ? 'Coinciden' : 'No coinciden';
      byId('mitm-endpoints-match').textContent = endpointsMatch ? 'Sí' : 'No';
      Lab.setStatus(byId('mitm-status'), !endpointsMatch && aliceMatch && bobMatch
        ? 'Mallory comparte una clave distinta con cada extremo y podría descifrar, modificar y volver a cifrar.'
        : 'La simulación no produjo el patrón MITM esperado.', !endpointsMatch && aliceMatch && bobMatch ? 'bad' : 'warn');
    } catch (error) {
      Lab.setStatus(byId('mitm-status'), error.message, 'bad');
    }
  }

  async function deriveHybridKey(secret, salt, info) {
    const material = await crypto.subtle.importKey('raw', secret, 'HKDF', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info },
      material,
      256
    );
    return crypto.subtle.importKey('raw', bits, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }

  function hybridAad(packet) {
    return Lab.te.encode(JSON.stringify({
      v: packet.v,
      agreement: packet.agreement,
      kdf: packet.kdf,
      encryption: packet.encryption,
      info: packet.info,
      salt: packet.salt,
      iv: packet.iv
    }));
  }

  async function hybridEncrypt() {
    try {
      if (!aliceKeys || !bobKeys) await generateEcdhPairs();
      const secret = await derive(aliceKeys.privateKey, bobKeys.publicKey);
      const salt = Module03.randomBytes(16);
      const iv = Module03.randomBytes(12);
      const info = Lab.te.encode(byId('hybrid-context').value);
      const packet = {
        ...HYBRID_SUITE,
        info: byId('hybrid-context').value,
        salt: Lab.bytesToB64(salt),
        iv: Lab.bytesToB64(iv)
      };
      const aad = hybridAad(packet);
      const aesKey = await deriveHybridKey(secret, salt, info);
      const encrypted = new Uint8Array(await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 },
        aesKey,
        Lab.te.encode(byId('hybrid-message').value)
      ));
      packet.aad = Lab.bytesToB64(aad);
      packet.ciphertextAndTag = Lab.bytesToB64(encrypted);
      byId('hybrid-package').value = JSON.stringify(packet, null, 2);
      byId('hybrid-recovered').value = '';
      Lab.setStatus(byId('hybrid-status'), 'Alicia derivó una clave de sesión y cifró el mensaje. La clave no aparece en el paquete.', 'good');
    } catch (error) {
      Lab.setStatus(byId('hybrid-status'), error.message, 'bad');
    }
  }

  function parsePacket() {
    const packet = JSON.parse(byId('hybrid-package').value);
    const required = ['agreement', 'kdf', 'encryption', 'info', 'salt', 'iv', 'aad', 'ciphertextAndTag'];
    if (!required.every((field) => typeof packet[field] === 'string')) throw new Error('El paquete no contiene todos los campos requeridos.');
    if (packet.v !== HYBRID_SUITE.v ||
        packet.agreement !== HYBRID_SUITE.agreement ||
        packet.kdf !== HYBRID_SUITE.kdf ||
        packet.encryption !== HYBRID_SUITE.encryption) {
      throw new Error('La suite criptográfica declarada no es compatible.');
    }
    if (packet.aad !== Lab.bytesToB64(hybridAad(packet))) {
      throw new Error('Los metadatos no coinciden con el AAD canónico.');
    }
    return packet;
  }

  async function hybridDecrypt() {
    try {
      if (!aliceKeys || !bobKeys) throw new Error('No están disponibles los pares ECDH de esta sesión.');
      const packet = parsePacket();
      const secret = await derive(bobKeys.privateKey, aliceKeys.publicKey);
      const aesKey = await deriveHybridKey(secret, Lab.b64ToBytes(packet.salt), Lab.te.encode(packet.info));
      const aad = hybridAad(packet);
      const plaintext = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: Lab.b64ToBytes(packet.iv),
          additionalData: aad,
          tagLength: 128
        },
        aesKey,
        Lab.b64ToBytes(packet.ciphertextAndTag)
      );
      byId('hybrid-recovered').value = Lab.td.decode(plaintext);
      Lab.setStatus(byId('hybrid-status'), 'Bob derivó la misma clave y AES-GCM autenticó el paquete antes de liberar el texto.', 'good');
    } catch {
      byId('hybrid-recovered').value = '';
      Lab.setStatus(byId('hybrid-status'), 'No se pudo autenticar o recuperar: cambió el paquete, el contexto o el acuerdo de claves.', 'bad');
    }
  }

  byId('generate-rsa-keys').addEventListener('click', generateRsaKeys);
  byId('rsa-encrypt').addEventListener('click', rsaEncrypt);
  byId('rsa-decrypt').addEventListener('click', () => rsaDecrypt());
  byId('rsa-tamper').addEventListener('click', () => {
    if (!rsaCiphertext) return Lab.setStatus(byId('rsa-status'), 'Cifrá un mensaje primero.', 'warn');
    rsaCiphertext[rsaCiphertext.length - 1] ^= 1;
    byId('rsa-ciphertext').textContent = Lab.bytesToB64(rsaCiphertext);
    Lab.setStatus(byId('rsa-status'), 'Ciphertext alterado. OAEP debería rechazarlo.', 'warn');
  });
  byId('rsa-wrong-key').addEventListener('click', async () => {
    if (!rsaCiphertext) return Lab.setStatus(byId('rsa-status'), 'Cifrá un mensaje primero.', 'warn');
    const other = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, false, ['encrypt', 'decrypt']);
    await rsaDecrypt(other.privateKey);
  });
  byId('generate-ecdh-pairs').addEventListener('click', generateEcdhPairs);
  byId('derive-ecdh').addEventListener('click', deriveEcdh);
  byId('simulate-mitm').addEventListener('click', simulateMitm);
  byId('hybrid-encrypt').addEventListener('click', hybridEncrypt);
  byId('hybrid-decrypt').addEventListener('click', hybridDecrypt);
  byId('hybrid-tamper').addEventListener('click', () => {
    try {
      const packet = parsePacket();
      const bytes = Lab.b64ToBytes(packet.ciphertextAndTag);
      bytes[Math.max(0, bytes.length - 17)] ^= 1;
      packet.ciphertextAndTag = Lab.bytesToB64(bytes);
      byId('hybrid-package').value = JSON.stringify(packet, null, 2);
      Lab.setStatus(byId('hybrid-status'), 'Se alteró un bit del ciphertext. Bob debería rechazar el tag.', 'warn');
    } catch (error) {
      Lab.setStatus(byId('hybrid-status'), error.message, 'bad');
    }
  });

  byId('rsa-message-bytes').textContent = Lab.te.encode(byId('rsa-message').value).length;
})();
