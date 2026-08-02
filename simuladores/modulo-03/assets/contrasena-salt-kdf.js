(() => {
  'use strict';

  const {
    encoder,
    randomBytes,
    bytesToHex,
    hexToBytes,
    normalizePassword,
    clampIterations,
    sha256Bytes,
    derivePbkdf2Bits,
    formatDuration,
    describeText
  } = Class3Crypto;
  const { setStatus } = Lab;
  const $ = (selector) => document.querySelector(selector);

  const state = {
    runs: [],
    lastPbkdf2Ms: null
  };

  function updateTextMetrics() {
    const details = describeText($('#password').value);
    $('#graphemes').textContent = details.graphemes;
    $('#code-points').textContent = details.codePoints;
    $('#utf16-units').textContent = details.utf16Units;
    $('#utf8-bytes').textContent = details.utf8Bytes;
    $('#normalized-output').textContent = details.normalized || '—';

    setStatus(
      $('#unicode-status'),
      details.changedByNormalization
        ? 'NFC cambió la representación interna antes de derivar. La apariencia puede mantenerse igual.'
        : 'La entrada ya está en NFC. Los bytes mostrados son los que ingresarán en PBKDF2.',
      details.changedByNormalization ? 'warn' : 'good'
    );
  }

  function setNewSalt() {
    const salt = randomBytes(16);
    $('#salt').value = bytesToHex(salt);
    $('#salt-output').textContent = bytesToHex(salt, ' ');
  }

  function validateSalt() {
    const salt = hexToBytes($('#salt').value);
    if (salt.length !== 16) throw new Error('La salt debe contener exactamente 16 bytes (32 dígitos hexadecimales).');
    return salt;
  }

  function updateAttackModel(milliseconds) {
    $('#cost-1').textContent = formatDuration(milliseconds);
    $('#cost-1000').textContent = formatDuration(milliseconds * 1_000);
    $('#cost-million').textContent = formatDuration(milliseconds * 1_000_000);
    setStatus(
      $('#attack-status'),
      `Cada intento tardó ${formatDuration(milliseconds)} en este navegador. La extrapolación es lineal y solo sirve para comparar parámetros en esta máquina.`,
      'warn'
    );
  }

  function renderRuns() {
    const container = $('#experiment-log');
    container.replaceChildren();

    for (const [index, run] of state.runs.slice(-5).reverse().entries()) {
      const previous = state.runs[state.runs.length - 2 - index];
      const matchesPrevious = Boolean(previous && previous.key === run.key);
      const entry = document.createElement('div');
      entry.className = 'experiment-entry';

      const number = document.createElement('strong');
      number.textContent = `#${run.number}`;
      const key = document.createElement('code');
      key.textContent = run.key;
      key.title = run.key;
      const badge = document.createElement('span');
      badge.className = `state-badge ${matchesPrevious ? 'warn' : 'good'}`;
      badge.textContent = previous ? (matchesPrevious ? 'Igual a la anterior' : 'Diferente') : 'Primera ejecución';

      entry.append(number, key, badge);
      container.append(entry);
    }
  }

  async function derive(label = 'Derivación manual') {
    const buttons = [$('#derive'), $('#repeat'), $('#different-salt')];
    buttons.forEach((button) => { button.disabled = true; });

    try {
      const rawPassword = $('#password').value;
      const password = normalizePassword(rawPassword);
      if (!password.length) throw new Error('Ingresá una contraseña ficticia.');
      const salt = validateSalt();
      const iterations = clampIterations($('#iterations').value);
      $('#iterations').value = iterations;

      const directStart = performance.now();
      const direct = await sha256Bytes(encoder.encode(password));
      const directMs = Math.max(0.001, performance.now() - directStart);

      const pbkdf2Start = performance.now();
      const derived = await derivePbkdf2Bits(password, salt, iterations);
      const pbkdf2Ms = Math.max(0.001, performance.now() - pbkdf2Start);
      const keyHex = bytesToHex(derived);

      $('#direct-output').textContent = bytesToHex(direct);
      $('#derived-output').textContent = keyHex;
      $('#salt-output').textContent = bytesToHex(salt, ' ');
      $('#direct-time').textContent = formatDuration(directMs);
      $('#pbkdf2-time').textContent = formatDuration(pbkdf2Ms);
      $('#cost-ratio').textContent = `${Math.max(1, Math.round(pbkdf2Ms / directMs)).toLocaleString('es-AR')}×`;

      state.lastPbkdf2Ms = pbkdf2Ms;
      state.runs.push({
        number: state.runs.length + 1,
        label,
        key: keyHex,
        salt: bytesToHex(salt),
        iterations,
        milliseconds: pbkdf2Ms
      });
      renderRuns();
      updateAttackModel(pbkdf2Ms);

      const predictable = /^(?:123456|password|qwerty|admin|contrase(?:ña|na)|sergio)|(?:19|20)\d{2}$/i.test(password)
        || /(.)\1{2,}/u.test(password);
      setStatus(
        $('#kdf-status'),
        predictable
          ? `${label}: PBKDF2 aumentó el costo, pero detectamos un patrón humano obvio. La salida de 256 bits no convierte esa entrada en un secreto de 256 bits.`
          : `${label}: clave derivada en ${formatDuration(pbkdf2Ms)} con ${iterations.toLocaleString('es-AR')} iteraciones.`,
        predictable ? 'warn' : 'good'
      );
    } catch (error) {
      setStatus($('#kdf-status'), error.message, 'bad');
    } finally {
      buttons.forEach((button) => { button.disabled = false; });
    }
  }

  $('#password').addEventListener('input', updateTextMetrics);
  $('#toggle-password').addEventListener('click', () => {
    const field = $('#password');
    const revealing = field.type === 'password';
    field.type = revealing ? 'text' : 'password';
    $('#toggle-password').textContent = revealing ? 'Ocultar contraseña' : 'Mostrar contraseña';
  });
  $('#unicode-example').addEventListener('click', () => {
    $('#password').value = 'man\u0303ana educativa 🔐';
    updateTextMetrics();
  });
  $('#derive').addEventListener('click', () => derive('Derivación manual'));
  $('#repeat').addEventListener('click', () => derive('Mismos parámetros'));
  $('#different-salt').addEventListener('click', () => {
    setNewSalt();
    derive('Salt diferente');
  });
  $('#salt').addEventListener('input', () => {
    try {
      const salt = validateSalt();
      $('#salt-output').textContent = bytesToHex(salt, ' ');
    } catch {
      $('#salt-output').textContent = 'Salt incompleta o inválida';
    }
  });

  try {
    setNewSalt();
    updateTextMetrics();
  } catch (error) {
    setStatus($('#kdf-status'), error.message, 'bad');
  }
})();
