(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const labels = ['00', '01', '10', '11'];
  const encoder = new TextEncoder();

  const format = (value, digits = 3) => Number(value).toLocaleString('es-AR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });

  function messageDistribution() {
    return $('message-model').value === 'uniform'
      ? [0.25, 0.25, 0.25, 0.25]
      : [0.5, 0.25, 0.15, 0.1];
  }

  function keyDistribution() {
    if ($('key-model').value === 'uniform') return [0.25, 0.25, 0.25, 0.25];
    const first = Number($('key-bias').value);
    const rest = (1 - first) / 3;
    return [first, rest, rest, rest];
  }

  function posteriorFor(cipher, messages, keys) {
    const unnormalized = messages.map((probability, message) => probability * keys[cipher ^ message]);
    const cipherProbability = unnormalized.reduce((sum, value) => sum + value, 0);
    return {
      cipherProbability,
      values: unnormalized.map((value) => cipherProbability ? value / cipherProbability : 0)
    };
  }

  function conditionalEntropy(messages, keys) {
    let result = 0;
    for (let cipher = 0; cipher < 4; cipher += 1) {
      const posterior = posteriorFor(cipher, messages, keys);
      result += posterior.cipherProbability * Module02.entropy(posterior.values);
    }
    return result;
  }

  function renderBars(root, probabilities, posterior = false) {
    root.innerHTML = probabilities.map((probability, index) => `
      <div class="probability-row ${posterior ? 'posterior' : ''}">
        <strong>M=${labels[index]}</strong>
        <span class="probability-track"><span style="width:${probability * 100}%"></span></span>
        <span>${format(probability, 3)}</span>
      </div>
    `).join('');
  }

  function renderModel() {
    const messages = messageDistribution();
    const keys = keyDistribution();
    const observed = Number($('observed-cipher').value);
    const posterior = posteriorFor(observed, messages, keys);
    const hMessage = Module02.entropy(messages);
    const hConditional = conditionalEntropy(messages, keys);
    const information = Math.max(0, hMessage - hConditional);
    const uniformKey = $('key-model').value === 'uniform';

    $('bias-control').hidden = uniformKey;
    $('key-bias-value').textContent = format(Number($('key-bias').value), 2);
    renderBars($('prior-bars'), messages);
    renderBars($('posterior-bars'), posterior.values, true);
    $('message-entropy').textContent = `${format(hMessage)} bits`;
    $('conditional-entropy').textContent = `${format(hConditional)} bits`;
    $('mutual-information').textContent = `${format(information, 6)} bits`;
    $('cipher-probability').textContent = format(posterior.cipherProbability, 3);

    const maxDifference = Math.max(...messages.map((value, index) => Math.abs(value - posterior.values[index])));
    if (uniformKey) {
      $('perfect-status').textContent = `Secreto perfecto: para C=${labels[observed]}, la diferencia máxima entre prior y posterior es ${format(maxDifference, 6)}.`;
      $('perfect-status').className = 'status good';
    } else {
      $('perfect-status').textContent = `Hay filtración: la clave sesgada produce I(M;C)=${format(information, 6)} bits. Observar C cambia las creencias.`;
      $('perfect-status').className = 'status warn';
    }
    renderTable(keys);
  }

  function renderTable(keys) {
    $('xor-table').innerHTML = labels.map((messageLabel, message) => `
      <tr>
        <th scope="row">M=${messageLabel}</th>
        ${labels.map((keyLabel, key) => {
          const cipher = message ^ key;
          const probability = keys[key];
          return `<td><strong>C=${labels[cipher]}</strong><br><span class="small muted">P(K=${keyLabel})=${format(probability, 3)}</span></td>`;
        }).join('')}
      </tr>
    `).join('');
  }

  function xorBytes(a, b) {
    const length = Math.min(a.length, b.length);
    const output = new Uint8Array(length);
    for (let index = 0; index < length; index += 1) output[index] = a[index] ^ b[index];
    return output;
  }

  function runReuseExperiment() {
    const messageOne = encoder.encode($('message-one').value);
    const messageTwo = encoder.encode($('message-two').value);
    const length = Math.min(messageOne.length, messageTwo.length);
    if (!length) {
      $('reuse-status').textContent = 'Ingresá dos mensajes no vacíos.';
      $('reuse-status').className = 'status bad';
      return;
    }

    const m1 = messageOne.slice(0, length);
    const m2 = messageTwo.slice(0, length);
    const keyOne = Module02.randomBytes(length);
    const reuse = $('reuse-mode').value === 'reuse';
    const keyTwo = reuse ? keyOne : Module02.randomBytes(length);
    const cipherOne = xorBytes(m1, keyOne);
    const cipherTwo = xorBytes(m2, keyTwo);
    const cipherRelation = xorBytes(cipherOne, cipherTwo);
    const messageRelation = xorBytes(m1, m2);
    const equal = cipherRelation.every((value, index) => value === messageRelation[index]);

    $('key-one-output').textContent = Module02.toHex(keyOne);
    $('cipher-one-output').textContent = Module02.toHex(cipherOne);
    $('cipher-two-output').textContent = Module02.toHex(cipherTwo);
    $('key-relation').textContent = reuse ? 'K₁ = K₂' : 'K₁ ≠ K₂';
    $('cipher-xor').textContent = Module02.toHex(cipherRelation);
    $('message-xor').textContent = Module02.toHex(messageRelation);

    const truncated = messageOne.length !== messageTwo.length
      ? ` Se compararon los primeros ${length} bytes porque las longitudes eran distintas.`
      : '';
    if (equal) {
      $('reuse-status').textContent = `La clave se canceló: C₁⊕C₂ = M₁⊕M₂. La relación entre mensajes quedó expuesta.${truncated}`;
      $('reuse-status').className = 'status bad';
    } else {
      $('reuse-status').textContent = `Con claves independientes, C₁⊕C₂ no coincide con M₁⊕M₂: también contiene K₁⊕K₂.${truncated}`;
      $('reuse-status').className = 'status good';
    }
  }

  ['message-model', 'key-model', 'observed-cipher'].forEach((id) => $(id).addEventListener('change', renderModel));
  $('key-bias').addEventListener('input', renderModel);
  $('run-reuse').addEventListener('click', runReuseExperiment);
  $('reuse-mode').addEventListener('change', runReuseExperiment);

  renderModel();
  runReuseExperiment();
})();
