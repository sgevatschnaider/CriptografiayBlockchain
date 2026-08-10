(() => {
  'use strict';

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const byId = (id) => document.getElementById(id);
  const state = {
    rsa: {},
    ecdsa: {},
    authenticated: {},
    pki: {}
  };

  function requireCrypto() {
    if (!globalThis.crypto?.subtle) throw new Error('Web Crypto no está disponible. Usá HTTPS o localhost.');
  }

  function bytes(value) {
    return value instanceof Uint8Array ? value : new Uint8Array(value);
  }

  function toBase64(value) {
    let binary = '';
    for (const octet of bytes(value)) binary += String.fromCharCode(octet);
    return btoa(binary);
  }

  function fromBase64(value) {
    const binary = atob(String(value));
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  }

  function toHex(value, separator = '') {
    return [...bytes(value)].map((octet) => octet.toString(16).padStart(2, '0')).join(separator);
  }

  function randomBytes(length) {
    const result = new Uint8Array(length);
    crypto.getRandomValues(result);
    return result;
  }

  function equalBytes(left, right) {
    const a = bytes(left);
    const b = bytes(right);
    if (a.length !== b.length) return false;
    let difference = 0;
    for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
    return difference === 0;
  }

  function setStatus(id, message, kind = 'info') {
    const element = byId(id);
    if (!element) return;
    element.textContent = message;
    element.dataset.kind = kind;
  }

  function showValue(id, value) {
    const element = byId(id);
    if (element) element.textContent = value;
  }

  async function fingerprint(publicKey, format = 'spki') {
    const exported = await crypto.subtle.exportKey(format, publicKey);
    const digest = await crypto.subtle.digest('SHA-256', exported);
    return toHex(digest, ':').toUpperCase();
  }

  function bindTabs() {
    const tabs = [...document.querySelectorAll('.asym-tab[role="tab"]')];
    const panels = [...document.querySelectorAll('.asym-panel[role="tabpanel"]')];
    const activate = (tab) => {
      tabs.forEach((candidate) => candidate.setAttribute('aria-selected', String(candidate === tab)));
      panels.forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
      tab.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let target = index;
        if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = tabs.length - 1;
        activate(tabs[target]);
      });
    });
  }

  async function generateRsa() {
    requireCrypto();
    setStatus('asym-rsa-status', 'Generando dos pares RSA de 2048 bits…');
    const [oaep, pss] = await Promise.all([
      crypto.subtle.generateKey(
        { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        false,
        ['encrypt', 'decrypt']
      ),
      crypto.subtle.generateKey(
        { name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      )
    ]);
    state.rsa = { oaep, pss };
    showValue('asym-rsa-fingerprint', await fingerprint(oaep.publicKey));
    showValue('asym-rsa-cipher', '—');
    showValue('asym-rsa-recovered', '—');
    showValue('asym-rsa-signature', '—');
    setStatus('asym-rsa-status', 'Claves listas: OAEP para confidencialidad y PSS para autenticidad.', 'ok');
  }

  async function rsaEncrypt() {
    if (!state.rsa.oaep) await generateRsa();
    const plaintext = encoder.encode(byId('asym-rsa-message').value);
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, state.rsa.oaep.publicKey, plaintext));
    state.rsa.ciphertext = ciphertext;
    showValue('asym-rsa-cipher', toBase64(ciphertext));
    setStatus('asym-rsa-status', `OAEP produjo ${ciphertext.length} bytes. El mismo texto generará otro cifrado por su aleatoriedad.`, 'ok');
  }

  async function rsaDecrypt() {
    if (!state.rsa.ciphertext) throw new Error('Primero cifrá un mensaje.');
    const plaintext = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, state.rsa.oaep.privateKey, state.rsa.ciphertext);
    showValue('asym-rsa-recovered', decoder.decode(plaintext));
    setStatus('asym-rsa-status', 'OAEP verificó su estructura interna y recuperó el mensaje.', 'ok');
  }

  async function rsaSign() {
    if (!state.rsa.pss) await generateRsa();
    state.rsa.signedMessage = encoder.encode(byId('asym-rsa-message').value);
    state.rsa.signature = new Uint8Array(await crypto.subtle.sign(
      { name: 'RSA-PSS', saltLength: 32 },
      state.rsa.pss.privateKey,
      state.rsa.signedMessage
    ));
    showValue('asym-rsa-signature', toBase64(state.rsa.signature));
    setStatus('asym-rsa-status', 'Firma RSA-PSS creada con sal aleatoria de 32 bytes.', 'ok');
  }

  async function rsaVerify() {
    if (!state.rsa.signature) throw new Error('Primero firmá el mensaje.');
    const current = encoder.encode(byId('asym-rsa-message').value);
    const valid = await crypto.subtle.verify(
      { name: 'RSA-PSS', saltLength: 32 },
      state.rsa.pss.publicKey,
      state.rsa.signature,
      current
    );
    setStatus('asym-rsa-status', valid ? 'Firma RSA-PSS válida.' : 'Firma RSA-PSS inválida: el mensaje o la firma cambiaron.', valid ? 'ok' : 'error');
  }

  function rsaTamper() {
    if (state.rsa.ciphertext) {
      state.rsa.ciphertext = state.rsa.ciphertext.slice();
      state.rsa.ciphertext[0] ^= 1;
      showValue('asym-rsa-cipher', toBase64(state.rsa.ciphertext));
    }
    byId('asym-rsa-message').value += ' [alterado]';
    setStatus('asym-rsa-status', 'Se alteraron el criptograma y el mensaje: OAEP y PSS deben rechazarlos.', 'warn');
  }

  async function generateEcdsa() {
    requireCrypto();
    state.ecdsa = {
      keys: await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify'])
    };
    showValue('asym-ecdsa-fingerprint', await fingerprint(state.ecdsa.keys.publicKey));
    showValue('asym-ecdsa-signature', '—');
    showValue('asym-ecdsa-result', '—');
    setStatus('asym-ecdsa-status', 'Par ECDSA P-256 generado.', 'ok');
  }

  async function ecdsaSign() {
    if (!state.ecdsa.keys) await generateEcdsa();
    state.ecdsa.signature = new Uint8Array(await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      state.ecdsa.keys.privateKey,
      encoder.encode(byId('asym-ecdsa-message').value)
    ));
    showValue('asym-ecdsa-signature', toBase64(state.ecdsa.signature));
    showValue('asym-ecdsa-result', 'Firma creada');
    setStatus('asym-ecdsa-status', 'Firma ECDSA calculada sobre SHA-256(mensaje).', 'ok');
  }

  async function ecdsaVerify(publicKey = state.ecdsa.keys?.publicKey) {
    if (!state.ecdsa.signature || !publicKey) throw new Error('Generá la clave y firmá primero.');
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      state.ecdsa.signature,
      encoder.encode(byId('asym-ecdsa-message').value)
    );
    showValue('asym-ecdsa-result', valid ? 'VÁLIDA' : 'INVÁLIDA');
    setStatus('asym-ecdsa-status', valid ? 'La firma corresponde al mensaje y a esta clave pública.' : 'Verificación rechazada.', valid ? 'ok' : 'error');
  }

  function ecdsaTamper() {
    byId('asym-ecdsa-message').value += ' [alterado]';
    setStatus('asym-ecdsa-status', 'Mensaje alterado; la firma conservada ya no debe validar.', 'warn');
  }

  async function ecdsaWrongKey() {
    if (!state.ecdsa.signature) throw new Error('Firmá primero.');
    const impostor = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
    await ecdsaVerify(impostor.publicKey);
  }

  function signedEphemeral(context, publicRaw) {
    return encoder.encode(`${context}|${toBase64(publicRaw)}`);
  }

  async function generateAuthenticatedSession() {
    requireCrypto();
    setStatus('asym-auth-status', 'Generando identidad y claves efímeras…');
    const [bobIdentity, aliceEphemeral, bobEphemeral] = await Promise.all([
      crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']),
      crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']),
      crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits'])
    ]);
    const bobEphemeralRaw = new Uint8Array(await crypto.subtle.exportKey('raw', bobEphemeral.publicKey));
    const context = byId('asym-auth-context').value;
    const signature = new Uint8Array(await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      bobIdentity.privateKey,
      signedEphemeral(context, bobEphemeralRaw)
    ));
    state.authenticated = { bobIdentity, aliceEphemeral, bobEphemeral, bobEphemeralRaw, signature, context };
    showValue('asym-auth-identity', await fingerprint(bobIdentity.publicKey));
    showValue('asym-auth-ephemeral', toBase64(bobEphemeralRaw));
    showValue('asym-auth-package', '—');
    showValue('asym-auth-recovered', '—');
    setStatus('asym-auth-status', 'Bob firmó su clave ECDH efímera. La sesión está lista para verificar.', 'ok');
  }

  async function verifyAuthenticatedEphemeral() {
    const current = state.authenticated;
    if (!current.signature) throw new Error('Generá las identidades y claves efímeras.');
    const context = byId('asym-auth-context').value;
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      current.bobIdentity.publicKey,
      current.signature,
      signedEphemeral(context, current.bobEphemeralRaw)
    );
    setStatus('asym-auth-status', valid ? 'La clave efímera pertenece a Bob y al contexto declarado.' : 'Clave efímera no autenticada: posible sustitución o contexto modificado.', valid ? 'ok' : 'error');
    return valid;
  }

  async function importEcdhPublic(raw) {
    return crypto.subtle.importKey('raw', bytes(raw), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  }

  async function hkdfAesKey(sharedSecret, salt, context) {
    const material = await crypto.subtle.importKey('raw', bytes(sharedSecret), 'HKDF', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: bytes(salt), info: encoder.encode(context) },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function authenticatedEncrypt() {
    const current = state.authenticated;
    if (!(await verifyAuthenticatedEphemeral())) throw new Error('No se cifra hasta autenticar la clave efímera.');
    const importedBob = await importEcdhPublic(current.bobEphemeralRaw);
    const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: importedBob }, current.aliceEphemeral.privateKey, 256);
    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const context = byId('asym-auth-context').value;
    const aesKey = await hkdfAesKey(shared, salt, context);
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: encoder.encode(context), tagLength: 128 },
      aesKey,
      encoder.encode(byId('asym-auth-message').value)
    ));
    current.package = {
      version: 1,
      suite: 'ECDSA-P256 + ECDH-P256 + HKDF-SHA256 + AES-256-GCM',
      context,
      bobEphemeral: toBase64(current.bobEphemeralRaw),
      identitySignature: toBase64(current.signature),
      salt: toBase64(salt),
      iv: toBase64(iv),
      ciphertext: toBase64(ciphertext)
    };
    showValue('asym-auth-package', JSON.stringify(current.package, null, 2));
    setStatus('asym-auth-status', 'Paquete cifrado: clave autenticada, KDF contextual y AEAD.', 'ok');
  }

  async function authenticatedDecrypt() {
    const current = state.authenticated;
    const packet = current.package;
    if (!packet) throw new Error('Primero creá un paquete cifrado.');
    const packetPublic = fromBase64(packet.bobEphemeral);
    const identityValid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      current.bobIdentity.publicKey,
      fromBase64(packet.identitySignature),
      signedEphemeral(packet.context, packetPublic)
    );
    if (!identityValid) throw new Error('La firma de identidad del paquete no es válida.');
    const shared = await crypto.subtle.deriveBits(
      { name: 'ECDH', public: current.aliceEphemeral.publicKey },
      current.bobEphemeral.privateKey,
      256
    );
    const aesKey = await hkdfAesKey(shared, fromBase64(packet.salt), packet.context);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(packet.iv), additionalData: encoder.encode(packet.context), tagLength: 128 },
      aesKey,
      fromBase64(packet.ciphertext)
    );
    showValue('asym-auth-recovered', decoder.decode(plaintext));
    setStatus('asym-auth-status', 'Firma, acuerdo de clave y tag GCM verificados; texto liberado.', 'ok');
  }

  function tamperAuthenticatedKey() {
    const current = state.authenticated;
    if (!current.bobEphemeralRaw) throw new Error('Generá la sesión primero.');
    current.bobEphemeralRaw = current.bobEphemeralRaw.slice();
    current.bobEphemeralRaw[current.bobEphemeralRaw.length - 1] ^= 1;
    showValue('asym-auth-ephemeral', toBase64(current.bobEphemeralRaw));
    setStatus('asym-auth-status', 'Clave efímera alterada sin renovar su firma: la autenticación debe fallar.', 'warn');
  }

  function tamperAuthenticatedPackage() {
    const packet = state.authenticated.package;
    if (!packet) throw new Error('Creá un paquete primero.');
    const tampered = fromBase64(packet.ciphertext);
    tampered[0] ^= 1;
    packet.ciphertext = toBase64(tampered);
    showValue('asym-auth-package', JSON.stringify(packet, null, 2));
    setStatus('asym-auth-status', 'Cifrado alterado: el tag AES-GCM impedirá liberar texto.', 'warn');
  }

  async function simulateMitm() {
    const current = state.authenticated;
    if (!current.signature) throw new Error('Generá la sesión primero.');
    const mallory = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
    current.bobEphemeralRaw = new Uint8Array(await crypto.subtle.exportKey('raw', mallory.publicKey));
    showValue('asym-auth-ephemeral', toBase64(current.bobEphemeralRaw));
    await verifyAuthenticatedEphemeral();
  }

  async function runX25519() {
    requireCrypto();
    setStatus('asym-x25519-status', 'Comprobando compatibilidad X25519…');
    try {
      const [alice, bob] = await Promise.all([
        crypto.subtle.generateKey({ name: 'X25519' }, false, ['deriveBits']),
        crypto.subtle.generateKey({ name: 'X25519' }, false, ['deriveBits'])
      ]);
      const [aliceSecret, bobSecret] = await Promise.all([
        crypto.subtle.deriveBits({ name: 'X25519', public: bob.publicKey }, alice.privateKey, 256),
        crypto.subtle.deriveBits({ name: 'X25519', public: alice.publicKey }, bob.privateKey, 256)
      ]);
      const [aliceHash, bobHash] = await Promise.all([
        crypto.subtle.digest('SHA-256', aliceSecret),
        crypto.subtle.digest('SHA-256', bobSecret)
      ]);
      showValue('asym-x25519-alice', toHex(aliceHash).slice(0, 32) + '…');
      showValue('asym-x25519-bob', toHex(bobHash).slice(0, 32) + '…');
      const match = equalBytes(aliceSecret, bobSecret);
      showValue('asym-x25519-match', match ? 'SÍ' : 'NO');
      setStatus('asym-x25519-status', match ? 'X25519 produjo el mismo secreto de 32 bytes en ambos extremos.' : 'Los secretos no coinciden.', match ? 'ok' : 'error');
    } catch (error) {
      showValue('asym-x25519-alice', 'No disponible');
      showValue('asym-x25519-bob', 'No disponible');
      showValue('asym-x25519-match', '—');
      setStatus('asym-x25519-status', `Este motor no ofrece X25519 en Web Crypto (${error.name}). La explicación y el flujo siguen siendo válidos; probá un navegador actualizado.`, 'warn');
    }
  }

  function certificateBytes(tbs) {
    return encoder.encode(JSON.stringify(tbs));
  }

  async function signCertificate(tbs, privateKey) {
    const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, certificateBytes(tbs));
    return toBase64(signature);
  }

  async function generatePkiChain() {
    requireCrypto();
    setStatus('asym-pki-status', 'Creando raíz, intermedia y entidad final…');
    const [root, intermediate, leaf] = await Promise.all([
      crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']),
      crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']),
      crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify'])
    ]);
    const now = Date.now();
    const day = 86_400_000;
    const intermediateSpki = toBase64(await crypto.subtle.exportKey('spki', intermediate.publicKey));
    const leafSpki = toBase64(await crypto.subtle.exportKey('spki', leaf.publicKey));
    const rootRecord = {
      subject: 'CN=Curso Root CA',
      trustAnchor: true,
      fingerprintSha256: await fingerprint(root.publicKey),
      note: 'Ancla distribuida fuera de la cadena'
    };
    const intermediateTbs = {
      serial: '1001', issuer: rootRecord.subject, subject: 'CN=Curso Intermediate CA',
      notBefore: new Date(now - day).toISOString(), notAfter: new Date(now + 365 * day).toISOString(),
      isCA: true, keyUsage: ['keyCertSign'], publicKeySpki: intermediateSpki
    };
    const leafTbs = {
      serial: '2001', issuer: intermediateTbs.subject, subject: 'CN=servidor.modulo-03.test',
      notBefore: new Date(now - day).toISOString(), notAfter: new Date(now + 30 * day).toISOString(),
      isCA: false, keyUsage: ['digitalSignature', 'keyAgreement'], publicKeySpki: leafSpki
    };
    const intermediateCert = { tbs: intermediateTbs, signature: await signCertificate(intermediateTbs, root.privateKey) };
    const leafCert = { tbs: leafTbs, signature: await signCertificate(leafTbs, intermediate.privateKey) };
    state.pki = { root, intermediate, leaf, rootRecord, intermediateCert, leafCert };
    showValue('asym-pki-root', JSON.stringify(rootRecord, null, 2));
    showValue('asym-pki-intermediate', JSON.stringify(intermediateCert, null, 2));
    showValue('asym-pki-leaf', JSON.stringify(leafCert, null, 2));
    setStatus('asym-pki-status', 'Cadena educativa firmada con ECDSA P-256. Lista para validar.', 'ok');
  }

  async function validatePki(useWrongRoot = false) {
    const current = state.pki;
    if (!current.root) throw new Error('Generá la cadena primero.');
    const rootPublic = useWrongRoot
      ? (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify'])).publicKey
      : current.root.publicKey;
    const intermediateValid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' }, rootPublic,
      fromBase64(current.intermediateCert.signature), certificateBytes(current.intermediateCert.tbs)
    );
    const importedIntermediate = await crypto.subtle.importKey(
      'spki', fromBase64(current.intermediateCert.tbs.publicKeySpki),
      { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']
    );
    const leafValid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' }, importedIntermediate,
      fromBase64(current.leafCert.signature), certificateBytes(current.leafCert.tbs)
    );
    const instant = Date.now();
    const timeValid = [current.intermediateCert, current.leafCert].every((certificate) =>
      Date.parse(certificate.tbs.notBefore) <= instant && instant <= Date.parse(certificate.tbs.notAfter));
    const constraintsValid = current.intermediateCert.tbs.isCA === true
      && current.intermediateCert.tbs.keyUsage.includes('keyCertSign')
      && current.leafCert.tbs.isCA === false
      && current.leafCert.tbs.issuer === current.intermediateCert.tbs.subject
      && current.intermediateCert.tbs.issuer === current.rootRecord.subject;
    const valid = intermediateValid && leafValid && timeValid && constraintsValid;
    const details = `raíz→intermedia=${intermediateValid}; intermedia→final=${leafValid}; vigencia=${timeValid}; restricciones=${constraintsValid}`;
    setStatus('asym-pki-status', valid ? `Cadena válida (${details}).` : `Cadena rechazada (${details}).`, valid ? 'ok' : 'error');
    return valid;
  }

  function tamperPki() {
    if (!state.pki.leafCert) throw new Error('Generá la cadena primero.');
    state.pki.leafCert.tbs.subject = 'CN=atacante.modulo-03.test';
    showValue('asym-pki-leaf', JSON.stringify(state.pki.leafCert, null, 2));
    setStatus('asym-pki-status', 'Sujeto final alterado sin volver a firmar: la validación debe fallar.', 'warn');
  }

  function bindAction(id, action, statusId) {
    byId(id)?.addEventListener('click', async () => {
      try {
        await action();
      } catch (error) {
        const detail = String(error.message || '').trim()
          || (error.name === 'OperationError'
            ? 'La operación criptográfica rechazó datos alterados, una clave incorrecta o un tag inválido.'
            : 'La operación no pudo completarse.');
        setStatus(statusId, `${error.name || 'Error'}: ${detail}`, 'error');
      }
    });
  }

  bindTabs();
  bindAction('asym-rsa-generate', generateRsa, 'asym-rsa-status');
  bindAction('asym-rsa-encrypt', rsaEncrypt, 'asym-rsa-status');
  bindAction('asym-rsa-decrypt', rsaDecrypt, 'asym-rsa-status');
  bindAction('asym-rsa-sign', rsaSign, 'asym-rsa-status');
  bindAction('asym-rsa-verify', rsaVerify, 'asym-rsa-status');
  bindAction('asym-rsa-tamper', rsaTamper, 'asym-rsa-status');
  bindAction('asym-ecdsa-generate', generateEcdsa, 'asym-ecdsa-status');
  bindAction('asym-ecdsa-sign', ecdsaSign, 'asym-ecdsa-status');
  bindAction('asym-ecdsa-verify', () => ecdsaVerify(), 'asym-ecdsa-status');
  bindAction('asym-ecdsa-tamper', ecdsaTamper, 'asym-ecdsa-status');
  bindAction('asym-ecdsa-wrong', ecdsaWrongKey, 'asym-ecdsa-status');
  bindAction('asym-auth-generate', generateAuthenticatedSession, 'asym-auth-status');
  bindAction('asym-auth-verify', verifyAuthenticatedEphemeral, 'asym-auth-status');
  bindAction('asym-auth-encrypt', authenticatedEncrypt, 'asym-auth-status');
  bindAction('asym-auth-decrypt', authenticatedDecrypt, 'asym-auth-status');
  bindAction('asym-auth-tamper-key', tamperAuthenticatedKey, 'asym-auth-status');
  bindAction('asym-auth-tamper-package', tamperAuthenticatedPackage, 'asym-auth-status');
  bindAction('asym-auth-mitm', simulateMitm, 'asym-auth-status');
  bindAction('asym-x25519-run', runX25519, 'asym-x25519-status');
  bindAction('asym-pki-generate', generatePkiChain, 'asym-pki-status');
  bindAction('asym-pki-validate', () => validatePki(false), 'asym-pki-status');
  bindAction('asym-pki-tamper', tamperPki, 'asym-pki-status');
  bindAction('asym-pki-wrong-root', () => validatePki(true), 'asym-pki-status');
})();
