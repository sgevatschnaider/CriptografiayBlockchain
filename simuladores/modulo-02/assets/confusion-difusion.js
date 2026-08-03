(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const encoder = new TextEncoder();
  const SBOX = new Uint8Array([
    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
  ]);

  const MODES = Object.freeze([
    { id: 'key', label: 'Solo XOR', short: 'lineal' },
    { id: 'sub', label: '+ S-box', short: 'no lineal' },
    { id: 'perm', label: '+ ShiftRows', short: 'reposición' },
    { id: 'full', label: '+ MixColumns', short: 'mezcla completa' }
  ]);
  const MODE_EXPLANATIONS = Object.freeze({
    key: 'Solo XOR es lineal: conserva exactamente la posición y la cantidad de diferencias; no aporta difusión.',
    sub: 'La S-box agrega no linealidad y puede cambiar varios bits, pero cada byte continúa aislado de los demás.',
    perm: 'ShiftRows mueve bytes entre columnas. Conserva la distancia en esa capa, pero prepara la propagación de rondas posteriores.',
    full: 'MixColumns combina cuatro bytes por columna; junto con ShiftRows y varias rondas extiende la influencia por todo el bloque.'
  });
  const ANALYSIS_CONTEXTS = 32;
  const BIC_PAIR_SAMPLE = 512;

  function blockFromText(text) {
    const source = encoder.encode(text);
    const block = new Uint8Array(16);
    block.set(source.slice(0, 16));
    return { block, originalLength: source.length };
  }

  function keyFromText(text) {
    const source = encoder.encode(text || 'K');
    const key = new Uint8Array(16);
    for (let index = 0; index < 16; index += 1) {
      key[index] = source[index % source.length] ^ ((index * 17 + 0x5b) & 0xff);
    }
    return key;
  }

  function addRoundKey(state, key, round) {
    return Uint8Array.from(state, (value, index) =>
      value ^ key[(index + round) % 16] ^ ((round * 29 + index * 7) & 0xff)
    );
  }

  function subBytes(state) {
    return Uint8Array.from(state, (value) => SBOX[value]);
  }

  function shiftRows(state) {
    const output = new Uint8Array(16);
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        output[row + 4 * column] = state[row + 4 * ((column + row) % 4)];
      }
    }
    return output;
  }

  function xtime(value) {
    return ((value << 1) ^ ((value & 0x80) ? 0x1b : 0)) & 0xff;
  }

  function mul2(value) {
    return xtime(value);
  }

  function mul3(value) {
    return xtime(value) ^ value;
  }

  function mixColumns(state) {
    const output = new Uint8Array(16);
    for (let column = 0; column < 4; column += 1) {
      const offset = column * 4;
      const a = state[offset];
      const b = state[offset + 1];
      const c = state[offset + 2];
      const d = state[offset + 3];
      output[offset] = mul2(a) ^ mul3(b) ^ c ^ d;
      output[offset + 1] = a ^ mul2(b) ^ mul3(c) ^ d;
      output[offset + 2] = a ^ b ^ mul2(c) ^ mul3(d);
      output[offset + 3] = mul3(a) ^ b ^ c ^ mul2(d);
    }
    return output;
  }

  function transform(input, key, rounds, mode) {
    let state = input.slice();
    const states = [];
    for (let round = 1; round <= rounds; round += 1) {
      state = addRoundKey(state, key, round);
      if (mode !== 'key') state = subBytes(state);
      if (mode === 'perm' || mode === 'full') state = shiftRows(state);
      if (mode === 'full') state = mixColumns(state);
      states.push(state.slice());
    }
    return states;
  }

  function finalState(input, key, rounds, mode) {
    return transform(input, key, rounds, mode).at(-1);
  }

  function flipBit(bytes, bitIndex) {
    const output = bytes.slice();
    output[Math.floor(bitIndex / 8)] ^= 1 << (7 - (bitIndex % 8));
    return output;
  }

  function differenceBits(a, b) {
    const changes = new Uint8Array(128);
    for (let byte = 0; byte < 16; byte += 1) {
      const difference = a[byte] ^ b[byte];
      for (let bit = 0; bit < 8; bit += 1) {
        changes[byte * 8 + bit] = (difference >> (7 - bit)) & 1;
      }
    }
    return changes;
  }

  function changedByteCount(a, b) {
    return a.reduce((sum, value, index) => sum + (value !== b[index] ? 1 : 0), 0);
  }

  function buildExperiment() {
    const source = blockFromText($('spn-message').value);
    const key = keyFromText($('spn-key').value);
    const target = $('perturb-target').value;
    const bitIndex = Number($('flip-bit').value);
    return {
      source,
      key,
      target,
      bitIndex,
      originalInput: source.block,
      modifiedInput: target === 'message' ? flipBit(source.block, bitIndex) : source.block,
      originalKey: key,
      modifiedKey: target === 'key' ? flipBit(key, bitIndex) : key
    };
  }

  function renderMatrix(root, state, comparison = null) {
    root.innerHTML = [...state].map((value, index) => {
      const changed = comparison && value !== comparison[index];
      const bits = comparison ? Module02.popcount(value ^ comparison[index]) : 0;
      return `<span class="state-byte ${changed ? 'changed' : ''}" title="byte ${index}: ${bits} bit(s) diferentes">${value.toString(16).padStart(2, '0')}</span>`;
    }).join('');
  }

  function renderLayerComparison(experiment, rounds, selectedMode) {
    $('layer-comparison').innerHTML = MODES.map((mode) => {
      const original = finalState(experiment.originalInput, experiment.originalKey, rounds, mode.id);
      const modified = finalState(experiment.modifiedInput, experiment.modifiedKey, rounds, mode.id);
      const distance = Module02.hammingBytes(original, modified);
      const percent = distance / 128 * 100;
      const bytes = changedByteCount(original, modified);
      return `<div class="layer-row${mode.id === selectedMode ? ' active' : ''}">
        <strong>${mode.label}</strong>
        <span class="layer-track" aria-hidden="true"><span style="width:${percent}%"></span></span>
        <output>${distance}/128</output>
        <small>${bytes}/16 bytes · ${mode.short}</small>
      </div>`;
    }).join('');
  }

  function render() {
    const experiment = buildExperiment();
    const rounds = Number($('round-count').value);
    const mode = $('layer-mode').value;
    const originalRounds = transform(experiment.originalInput, experiment.originalKey, rounds, mode);
    const modifiedRounds = transform(experiment.modifiedInput, experiment.modifiedKey, rounds, mode);
    const original = originalRounds.at(-1);
    const flipped = modifiedRounds.at(-1);
    const distance = Module02.hammingBytes(original, flipped);
    const percent = distance / 128 * 100;
    const changedBytes = changedByteCount(original, flipped);
    const targetLabel = experiment.target === 'message' ? 'mensaje' : 'clave expandida';

    $('flip-bit-label').textContent = `Bit de ${targetLabel}`;
    $('flip-bit-value').textContent = String(experiment.bitIndex);
    $('round-count-value').textContent = String(rounds);
    $('input-bytes').textContent = experiment.target === 'message'
      ? `M:  ${Module02.toHex(experiment.originalInput)}\nM′: ${Module02.toHex(experiment.modifiedInput)}\nK*: ${Module02.toHex(experiment.originalKey)}`
      : `M:  ${Module02.toHex(experiment.originalInput)}\nK*: ${Module02.toHex(experiment.originalKey)}\nK′: ${Module02.toHex(experiment.modifiedKey)}`;
    $('hamming-distance').textContent = `${distance}/128`;
    $('avalanche-percent').textContent = `${percent.toFixed(1)}%`;
    $('changed-bytes').textContent = `${changedBytes}/16`;
    $('distance-to-half').textContent = `${Math.abs(50 - percent).toFixed(1)} pp`;
    $('hex-original').textContent = Module02.toHex(original);
    $('hex-flipped').textContent = Module02.toHex(flipped);
    $('layer-explanation').textContent = MODE_EXPLANATIONS[mode];
    renderMatrix($('state-original'), original);
    renderMatrix($('state-flipped'), flipped, original);
    $('round-bars').innerHTML = originalRounds.map((state, index) => {
      const roundModified = modifiedRounds[index];
      const roundDistance = Module02.hammingBytes(state, roundModified);
      const roundPercent = roundDistance / 128 * 100;
      const roundBytes = changedByteCount(state, roundModified);
      return `<div class="round-row"><strong>Ronda ${index + 1}</strong><span class="round-track"><span style="width:${roundPercent}%"></span></span><span>${roundDistance} · ${roundPercent.toFixed(1)}% · ${roundBytes}/16 bytes</span></div>`;
    }).join('');
    renderLayerComparison(experiment, rounds, mode);

    const lengthMessage = experiment.source.originalLength > 16
      ? 'El mensaje se truncó a 16 bytes.'
      : experiment.source.originalLength < 16
        ? 'El bloque se completó con bytes 00.'
        : 'El mensaje ocupa exactamente 16 bytes.';
    const interpretation = experiment.target === 'message'
      ? 'Esta prueba observa sensibilidad al texto y difusión.'
      : 'Esta prueba observa sensibilidad a la clave y confusión.';
    if (mode === 'full' && percent >= 35 && percent <= 65) {
      $('spn-status').textContent = `${lengthMessage} ${interpretation} El resultado quedó cerca de 50%, sin probar seguridad ni SAC.`;
      $('spn-status').className = 'status good';
    } else {
      $('spn-status').textContent = `${lengthMessage} ${interpretation} Con estas capas, el cambio alcanzó ${percent.toFixed(1)}% de los bits.`;
      $('spn-status').className = 'status warn';
    }
  }

  function contextVariant(bytes, contextIndex) {
    if (contextIndex === 0) return bytes.slice();
    const output = bytes.slice();
    let state = (0x9e3779b9 ^ Math.imul(contextIndex, 0x85ebca6b)) >>> 0;
    for (let index = 0; index < output.length; index += 1) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      output[index] ^= (state >>> 24) & 0xff;
    }
    return output;
  }

  function sampledOutputPairs(limit) {
    const allPairs = [];
    for (let first = 0; first < 128; first += 1) {
      for (let second = first + 1; second < 128; second += 1) {
        allPairs.push([first, second]);
      }
    }
    const pairs = [];
    const stride = 73;
    const start = 19;
    for (let index = 0; index < limit; index += 1) {
      pairs.push(allPairs[(start + index * stride) % allPairs.length]);
    }
    return pairs;
  }

  function phiCoefficient(first, second) {
    let firstOnes = 0;
    let secondOnes = 0;
    let bothOnes = 0;
    for (let index = 0; index < first.length; index += 1) {
      firstOnes += first[index];
      secondOnes += second[index];
      bothOnes += first[index] & second[index];
    }
    const total = first.length;
    const denominator = Math.sqrt(firstOnes * (total - firstOnes) * secondOnes * (total - secondOnes));
    if (denominator === 0) return 1;
    return (total * bothOnes - firstOnes * secondOnes) / denominator;
  }

  function renderHeatmap(pairCounts, target) {
    const cells = ['<span class="heat-label axis-title">in→out</span>'];
    for (let outputByte = 0; outputByte < 16; outputByte += 1) {
      cells.push(`<span class="heat-label">${outputByte.toString(16).toUpperCase()}</span>`);
    }
    for (let inputByte = 0; inputByte < 16; inputByte += 1) {
      cells.push(`<span class="heat-label">${inputByte.toString(16).toUpperCase()}</span>`);
      for (let outputByte = 0; outputByte < 16; outputByte += 1) {
        let changes = 0;
        for (let inputBit = inputByte * 8; inputBit < inputByte * 8 + 8; inputBit += 1) {
          for (let outputBit = outputByte * 8; outputBit < outputByte * 8 + 8; outputBit += 1) {
            changes += pairCounts[inputBit * 128 + outputBit];
          }
        }
        const rate = changes / (ANALYSIS_CONTEXTS * 64);
        const hue = rate <= 0.5 ? 208 - rate * 114 : 151 - (rate - 0.5) * 218;
        const lightness = 16 + Math.min(rate, 0.5) * 56;
        const textColor = lightness > 34 ? '#03131d' : '#f2fbff';
        const title = `${target === 'message' ? 'Mensaje' : 'Clave'} byte ${inputByte.toString(16).toUpperCase()} → salida byte ${outputByte.toString(16).toUpperCase()}: ${(rate * 100).toFixed(1)}%`;
        cells.push(`<span class="heat-cell" style="background:hsl(${hue.toFixed(0)} 72% ${lightness.toFixed(0)}%);color:${textColor}" title="${title}">${Math.round(rate * 100)}</span>`);
      }
    }
    $('influence-heatmap').innerHTML = cells.join('');
    $('influence-heatmap').setAttribute('aria-label', `Mapa de influencia de ${target === 'message' ? 'bits del mensaje' : 'bits de la clave'} sobre bytes de salida`);
  }

  function renderEmptyHeatmap() {
    $('influence-heatmap').innerHTML = '<span class="heat-placeholder">El mapa aparecerá después de ejecutar el análisis.</span>';
    $('influence-heatmap').setAttribute('aria-label', 'Mapa pendiente de análisis');
  }

  function markAnalysisStale() {
    for (const id of ['batch-mean', 'sac-deviation', 'completeness-coverage', 'bic-correlation']) {
      $(id).textContent = '—';
    }
    $('analysis-summary').hidden = true;
    $('analysis-status').textContent = 'Los controles cambiaron. Ejecutá nuevamente el análisis para obtener métricas comparables.';
    $('analysis-status').className = 'status warn';
    renderEmptyHeatmap();
  }

  function analyzeConfiguration(experiment, rounds, mode) {
    const totalTrials = ANALYSIS_CONTEXTS * 128;
    const pairCounts = new Uint16Array(128 * 128);
    const outputChanges = Array.from({ length: 128 }, () => new Uint8Array(totalTrials));
    const distances = new Uint8Array(totalTrials);
    let trialIndex = 0;
    let totalChanged = 0;

    for (let context = 0; context < ANALYSIS_CONTEXTS; context += 1) {
      const baseInput = experiment.target === 'message'
        ? contextVariant(experiment.originalInput, context)
        : experiment.originalInput;
      const baseKey = experiment.target === 'key'
        ? contextVariant(experiment.originalKey, context)
        : experiment.originalKey;
      const originalOutput = finalState(baseInput, baseKey, rounds, mode);

      for (let inputBit = 0; inputBit < 128; inputBit += 1) {
        const modifiedInput = experiment.target === 'message' ? flipBit(baseInput, inputBit) : baseInput;
        const modifiedKey = experiment.target === 'key' ? flipBit(baseKey, inputBit) : baseKey;
        const modifiedOutput = finalState(modifiedInput, modifiedKey, rounds, mode);
        const changes = differenceBits(originalOutput, modifiedOutput);
        let distance = 0;
        for (let outputBit = 0; outputBit < 128; outputBit += 1) {
          const changed = changes[outputBit];
          distance += changed;
          pairCounts[inputBit * 128 + outputBit] += changed;
          outputChanges[outputBit][trialIndex] = changed;
        }
        distances[trialIndex] = distance;
        totalChanged += distance;
        trialIndex += 1;
      }
    }

    let sacAbsoluteDeviation = 0;
    let observedDependencies = 0;
    for (const count of pairCounts) {
      const probability = count / ANALYSIS_CONTEXTS;
      sacAbsoluteDeviation += Math.abs(probability - 0.5);
      if (count > 0) observedDependencies += 1;
    }

    let correlationTotal = 0;
    const pairs = sampledOutputPairs(BIC_PAIR_SAMPLE);
    for (const [first, second] of pairs) {
      correlationTotal += Math.abs(phiCoefficient(outputChanges[first], outputChanges[second]));
    }

    const globalMean = totalChanged / (totalTrials * 128);
    const sacDeviation = sacAbsoluteDeviation / pairCounts.length;
    const coverage = observedDependencies / pairCounts.length;
    const bicProxy = correlationTotal / pairs.length;
    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);

    return {
      totalTrials,
      pairCounts,
      globalMean,
      sacDeviation,
      coverage,
      bicProxy,
      minDistance,
      maxDistance
    };
  }

  function calculateStatisticalAnalysis() {
    const experiment = buildExperiment();
    const rounds = Number($('round-count').value);
    const mode = $('layer-mode').value;
    const analysis = analyzeConfiguration(experiment, rounds, mode);

    $('batch-mean').textContent = `${(analysis.globalMean * 100).toFixed(2)}%`;
    $('sac-deviation').textContent = `${(analysis.sacDeviation * 100).toFixed(2)} pp`;
    $('completeness-coverage').textContent = `${(analysis.coverage * 100).toFixed(2)}%`;
    $('bic-correlation').textContent = analysis.bicProxy.toFixed(3);
    $('analysis-range').textContent = `${(analysis.minDistance / 128 * 100).toFixed(1)}% – ${(analysis.maxDistance / 128 * 100).toFixed(1)}%`;
    $('analysis-target-label').textContent = experiment.target === 'message' ? '128 bits del mensaje' : '128 bits de la clave expandida';
    $('analysis-summary').hidden = false;
    renderHeatmap(analysis.pairCounts, experiment.target);

    const balanced = analysis.globalMean >= 0.45 && analysis.globalMean <= 0.55;
    $('analysis-status').textContent = balanced
      ? 'La media global quedó cerca de 50%. Revisá ahora el desvío por par, la cobertura y la correlación: el promedio no basta.'
      : 'La media global se aleja de 50% en esta configuración. No interpretes el proxy BIC de forma aislada; compará capas y aumentá rondas.';
    $('analysis-status').className = `status ${balanced ? 'good' : 'warn'}`;
  }

  function runStatisticalAnalysis() {
    const button = $('run-statistical-analysis');
    button.disabled = true;
    button.textContent = 'Analizando…';
    $('analysis-status').textContent = 'Procesando 4.096 pares sin transmitir datos fuera del navegador.';
    $('analysis-status').className = 'status';
    window.setTimeout(() => {
      try {
        calculateStatisticalAnalysis();
      } catch (error) {
        $('analysis-status').textContent = `No se pudo completar el análisis: ${error.message}`;
        $('analysis-status').className = 'status bad';
      } finally {
        button.disabled = false;
        button.textContent = 'Analizar 4.096 pares';
      }
    }, 20);
  }

  globalThis.ConfusionDiffusionCore = Object.freeze({
    ANALYSIS_CONTEXTS,
    blockFromText,
    keyFromText,
    transform,
    finalState,
    flipBit,
    differenceBits,
    changedByteCount,
    contextVariant,
    phiCoefficient,
    analyzeConfiguration
  });

  if (typeof document === 'undefined') return;

  const bindAndInvalidate = (id, eventName) => {
    $(id).addEventListener(eventName, () => {
      render();
      markAnalysisStale();
    });
  };

  ['spn-message', 'spn-key'].forEach((id) => bindAndInvalidate(id, 'input'));
  $('flip-bit').addEventListener('input', render);
  bindAndInvalidate('round-count', 'input');
  ['perturb-target', 'layer-mode'].forEach((id) => bindAndInvalidate(id, 'change'));
  $('run-statistical-analysis').addEventListener('click', runStatisticalAnalysis);
  render();
  renderEmptyHeatmap();
})();
