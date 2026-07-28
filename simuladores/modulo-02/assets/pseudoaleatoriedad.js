(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const A = 1664525;
  const C = 1013904223;
  let previous = null;

  const format = (value, digits = 4) => Number(value).toLocaleString('es-AR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });

  function hashSeed(text) {
    let hash = 2166136261;
    for (const character of String(text)) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0 || 1;
  }

  function generateLcg(length, seedText) {
    let state = hashSeed(seedText);
    const initial = state;
    const bits = new Uint8Array(length);
    const trace = [];
    for (let index = 0; index < length; index += 1) {
      state = (Math.imul(A, state) + C) >>> 0;
      bits[index] = state >>> 31;
      if (index < 8) trace.push(state);
    }
    const predicted = (Math.imul(A, state) + C) >>> 0;
    return { bits, initial, final: state, predicted, trace };
  }

  function generateCrypto(length) {
    const bytes = new Uint8Array(Math.ceil(length / 8));
    const chunkSize = 65536;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      crypto.getRandomValues(bytes.subarray(offset, Math.min(bytes.length, offset + chunkSize)));
    }
    const bits = new Uint8Array(length);
    for (let index = 0; index < length; index += 1) {
      bits[index] = (bytes[index >>> 3] >>> (7 - (index & 7))) & 1;
    }
    return { bits };
  }

  function stats(bits) {
    const n = bits.length;
    let ones = 0;
    let runs = n ? 1 : 0;
    for (let index = 0; index < n; index += 1) {
      ones += bits[index];
      if (index && bits[index] !== bits[index - 1]) runs += 1;
    }
    const mean = ones / n;
    let numerator = 0;
    let denominatorLeft = 0;
    let denominatorRight = 0;
    for (let index = 0; index < n - 1; index += 1) {
      const left = bits[index] - mean;
      const right = bits[index + 1] - mean;
      numerator += left * right;
      denominatorLeft += left * left;
      denominatorRight += right * right;
    }
    const correlation = denominatorLeft && denominatorRight
      ? numerator / Math.sqrt(denominatorLeft * denominatorRight)
      : 0;
    return {
      ones,
      zeros: n - ones,
      proportion: mean,
      entropy: Module02.entropy([mean, 1 - mean]),
      runs,
      correlation
    };
  }

  function preview(bits) {
    const limit = Math.min(bits.length, 384);
    let output = '';
    for (let index = 0; index < limit; index += 1) {
      output += bits[index];
      if ((index + 1) % 8 === 0) output += ' ';
    }
    return output.trim() + (bits.length > limit ? ' …' : '');
  }

  function equalBits(a, b) {
    return Boolean(a && b && a.length === b.length && a.every((value, index) => value === b[index]));
  }

  function renderStats(prefix, result) {
    const values = stats(result.bits);
    $(`${prefix}-balance`).textContent = format(values.proportion);
    $(`${prefix}-entropy`).textContent = `${format(values.entropy)} bits`;
    $(`${prefix}-runs`).textContent = values.runs.toLocaleString('es-AR');
    $(`${prefix}-correlation`).textContent = format(values.correlation);
    $(`${prefix}-output`).textContent = preview(result.bits);
    $(`${prefix}-one-bar`).style.width = `${values.proportion * 100}%`;
    $(`${prefix}-zero-bar`).style.width = `${(1 - values.proportion) * 100}%`;
    $(`${prefix}-one-value`).textContent = format(values.proportion, 3);
    $(`${prefix}-zero-value`).textContent = format(1 - values.proportion, 3);
  }

  function run() {
    const length = Module02.clamp(Math.round(Number($('stream-length').value) || 4096), 64, 20000);
    $('stream-length').value = String(length);
    const lcg = generateLcg(length, $('seed').value);
    const secure = generateCrypto(length);
    renderStats('lcg', lcg);
    renderStats('crypto', secure);
    $('lcg-state-output').textContent = [
      `semilla normalizada: 0x${lcg.initial.toString(16).padStart(8, '0')}`,
      ...lcg.trace.map((state, index) => `x${index + 1}=0x${state.toString(16).padStart(8, '0')}`),
      `estado final: 0x${lcg.final.toString(16).padStart(8, '0')}`
    ].join('\n');
    $('prediction-output').textContent = `Con xₙ=0x${lcg.final.toString(16).padStart(8, '0')}, la recurrencia predice xₙ₊₁=0x${lcg.predicted.toString(16).padStart(8, '0')} y bit más significativo ${(lcg.predicted >>> 31)}.`;

    if (previous) {
      const lcgSame = equalBits(previous.lcg.bits, lcg.bits);
      const cryptoSame = equalBits(previous.secure.bits, secure.bits);
      $('lcg-repeat').textContent = lcgSame ? 'Idéntico' : 'Distinto';
      $('crypto-repeat').textContent = cryptoSame ? 'Idéntico' : 'Distinto';
      $('rng-status').textContent = lcgSame
        ? 'El PRNG repitió exactamente la salida con la misma semilla; el CSPRNG generó una muestra nueva.'
        : 'La semilla o la longitud cambió: el PRNG produjo otra secuencia.';
      $('rng-status').className = lcgSame && !cryptoSame ? 'status good' : 'status warn';
    } else {
      $('lcg-repeat').textContent = 'Primera ejecución';
      $('crypto-repeat').textContent = 'Primera ejecución';
      $('rng-status').textContent = 'Primera comparación generada. Repetí sin cambiar la semilla para contrastar.';
      $('rng-status').className = 'status';
    }
    previous = { lcg, secure, seed: $('seed').value, length };
  }

  $('generate-streams').addEventListener('click', run);
  $('repeat-experiment').addEventListener('click', run);
  run();
})();
