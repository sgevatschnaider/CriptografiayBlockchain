(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  let hmacKey = null;
  let hmacKeyBytes = null;
  let hmacTag = null;
  let signingKeys = null;
  let signature = null;

  function assertWebCrypto() {
    if (!globalThis.crypto?.subtle || !globalThis.isSecureContext) {
      throw new Error('Web Crypto requiere HTTPS o localhost.');
    }
  }

  async function digestBytes(text) {
    return new Uint8Array(await crypto.subtle.digest('SHA-256', Lab.te.encode(text)));
  }

  async function calculateHashes() {
    try {
      assertWebCrypto();
      const [a, b] = await Promise.all([
        digestBytes(byId('hash-message-a').value),
        digestBytes(byId('hash-message-b').value)
      ]);
      const distance = Module03.hammingBytes(a, b);
      const ratio = distance / 256;
      byId('hash-a').textContent = Lab.bytesToHex(a);
      byId('hash-b').textContent = Lab.bytesToHex(b);
      byId('hash-distance').textContent = `${distance} / 256`;
      byId('hash-ratio').textContent = `${(ratio * 100).toFixed(1)}%`;
      byId('hash-meter').style.width = `${ratio * 100}%`;
      Lab.setStatus(byId('hash-status'), distance === 0
        ? 'Las entradas son idénticas y producen el mismo resumen.'
        : `Una diferencia pequeña en la entrada cambió ${distance} bits de la salida. Avalancha no significa aleatoriedad de la entrada.`, distance === 0 ? 'warn' : 'good');
    } catch (error) {
      Lab.setStatus(byId('hash-status'), error.message, 'bad');
    }
  }

  async function generateHmacKey() {
    try {
      assertWebCrypto();
      hmacKeyBytes = Module03.randomBytes(32);
      hmacKey = await crypto.subtle.importKey(
        'raw',
        hmacKeyBytes,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      );
      hmacTag = null;
      byId('hmac-key').textContent = Lab.bytesToHex(hmacKeyBytes);
      byId('hmac-tag').textContent = '—';
      Lab.setStatus(byId('hmac-status'), 'Nueva clave generada con el CSPRNG. Se muestra únicamente con fines didácticos.', 'good');
    } catch (error) {
      Lab.setStatus(byId('hmac-status'), error.message, 'bad');
    }
  }

  async function createHmac() {
    try {
      if (!hmacKey) await generateHmacKey();
      hmacTag = new Uint8Array(await crypto.subtle.sign('HMAC', hmacKey, Lab.te.encode(byId('hmac-message').value)));
      byId('hmac-tag').textContent = Lab.bytesToHex(hmacTag);
      Lab.setStatus(byId('hmac-status'), 'Tag creado. Está vinculado a estos bytes y a la clave compartida.', 'good');
    } catch (error) {
      Lab.setStatus(byId('hmac-status'), error.message, 'bad');
    }
  }

  async function verifyHmac() {
    try {
      if (!hmacKey || !hmacTag) throw new Error('Creá un tag antes de verificar.');
      const valid = await crypto.subtle.verify('HMAC', hmacKey, hmacTag, Lab.te.encode(byId('hmac-message').value));
      Lab.setStatus(byId('hmac-status'), valid
        ? 'HMAC válido: clave, mensaje y tag coinciden.'
        : 'HMAC inválido: cambió el mensaje, la clave o el tag.', valid ? 'good' : 'bad');
    } catch (error) {
      Lab.setStatus(byId('hmac-status'), error.message, 'bad');
    }
  }

  async function publicKeyFingerprint(publicKey) {
    const jwk = await crypto.subtle.exportKey('jwk', publicKey);
    const canonical = JSON.stringify({ crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y });
    return Lab.bytesToHex(await digestBytes(canonical));
  }

  async function generateSigningKeys() {
    try {
      assertWebCrypto();
      signingKeys = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['sign', 'verify']
      );
      signature = null;
      byId('public-fingerprint').textContent = await publicKeyFingerprint(signingKeys.publicKey);
      byId('signature-output').textContent = '—';
      byId('signature-length').textContent = '0 bytes';
      byId('signature-result').textContent = 'Pendiente';
      Lab.setStatus(byId('signature-status'), 'Par ECDSA generado. La huella identifica estos bytes de clave pública, no una identidad por sí sola.', 'good');
    } catch (error) {
      Lab.setStatus(byId('signature-status'), error.message, 'bad');
    }
  }

  async function signDocument() {
    try {
      if (!signingKeys) await generateSigningKeys();
      signature = new Uint8Array(await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        signingKeys.privateKey,
        Lab.te.encode(byId('signed-document').value)
      ));
      byId('signature-output').textContent = Lab.bytesToB64(signature);
      byId('signature-length').textContent = `${signature.length} bytes`;
      byId('signature-result').textContent = 'Pendiente';
      Lab.setStatus(byId('signature-status'), 'Documento firmado. Modificar cualquier byte debería invalidar la verificación.', 'good');
    } catch (error) {
      Lab.setStatus(byId('signature-status'), error.message, 'bad');
    }
  }

  async function verifySignature(publicKey = signingKeys?.publicKey) {
    try {
      if (!publicKey || !signature) throw new Error('Generá el par y firmá el documento primero.');
      const valid = await crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        publicKey,
        signature,
        Lab.te.encode(byId('signed-document').value)
      );
      byId('signature-result').textContent = valid ? 'Válida' : 'Inválida';
      Lab.setStatus(byId('signature-status'), valid
        ? 'Firma válida: documento, firma y clave pública coinciden.'
        : 'Firma inválida: no coincide el documento, la firma o la clave pública.', valid ? 'good' : 'bad');
      return valid;
    } catch (error) {
      byId('signature-result').textContent = 'Error';
      Lab.setStatus(byId('signature-status'), error.message, 'bad');
      return false;
    }
  }

  byId('calculate-hashes').addEventListener('click', calculateHashes);
  byId('one-bit-example').addEventListener('click', () => {
    byId('hash-message-a').value = 'A';
    byId('hash-message-b').value = 'C';
    calculateHashes();
  });
  byId('new-hmac-key').addEventListener('click', generateHmacKey);
  byId('create-hmac').addEventListener('click', createHmac);
  byId('verify-hmac').addEventListener('click', verifyHmac);
  byId('tamper-hmac-message').addEventListener('click', () => {
    byId('hmac-message').value += ';alterado=1';
    Lab.setStatus(byId('hmac-status'), 'Mensaje alterado después de crear el tag. Ejecutá la verificación.', 'warn');
  });
  byId('generate-signing-keys').addEventListener('click', generateSigningKeys);
  byId('sign-document').addEventListener('click', signDocument);
  byId('verify-signature').addEventListener('click', () => verifySignature());
  byId('tamper-document').addEventListener('click', () => {
    byId('signed-document').value += ' [MODIFICADO]';
    Lab.setStatus(byId('signature-status'), 'Documento alterado después de firmar. Ejecutá la verificación.', 'warn');
  });
  byId('verify-wrong-key').addEventListener('click', async () => {
    try {
      if (!signature) throw new Error('Firmá el documento antes de probar otra clave.');
      const other = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
      await verifySignature(other.publicKey);
    } catch (error) {
      Lab.setStatus(byId('signature-status'), error.message, 'bad');
    }
  });

  calculateHashes();
  generateHmacKey();
  generateSigningKeys();
})();
