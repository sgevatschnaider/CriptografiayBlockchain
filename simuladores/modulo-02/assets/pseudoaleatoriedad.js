(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const LCG_A = 1664525;
  const LCG_C = 1013904223;
  const TOY_A = 5;
  const TOY_C = 1;
  const TOY_MODULUS = 256;
  const MAX_PLOT_PAIRS = 900;
  let previousExperiment = null;
  let currentPlotData = null;
  let resizeTimer = null;

  const entropyModels = Object.freeze({
    public: {
      bits: 0,
      candidates: 1n,
      label: 'Entropía nula',
      level: 'critical',
      explanation: 'Si el adversario conoce la frase, no existe incertidumbre aunque el texto sea largo.'
    },
    pin: {
      bits: Math.log2(10000),
      candidates: 10000n,
      label: 'Crítica',
      level: 'critical',
      explanation: 'Un PIN uniforme aporta solo 10 000 candidatos; puede enumerarse antes de atacar la primitiva.'
    },
    timestamp: {
      bits: Math.log2(86400000),
      candidates: 86400000n,
      label: 'Crítica',
      level: 'critical',
      explanation: 'Conocer el día reduce la búsqueda a los milisegundos posibles de ese intervalo.'
    },
    dice: {
      bits: 20 * Math.log2(6),
      candidates: 6n ** 20n,
      label: 'Insuficiente',
      level: 'insufficient',
      explanation: 'Es mucha más incertidumbre que un PIN, pero queda lejos de un objetivo moderno de 128 bits.'
    },
    os128: {
      bits: 128,
      candidates: 1n << 128n,
      label: 'Objetivo moderno',
      level: 'strong',
      explanation: 'Bajo el supuesto de bits uniformes e independientes, el espacio alcanza 2¹²⁸ candidatos.'
    }
  });

  const quizExplanations = Object.freeze([
    'Las frecuencias describen la muestra, pero no revelan si un adversario puede reconstruir el estado.',
    'Muchos DRBG expanden determinísticamente un estado secreto que fue inicializado con entropía suficiente.',
    'La unicidad del nonce bajo una misma clave es un requisito esencial de GCM; no necesita ser secreto.',
    'Una semilla pública y fija vuelve reproducible la secuencia, por lo que los tokens dejan de ser impredecibles.'
  ]);

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function formatNumber(value, digits = 4) {
    return Number(value).toLocaleString('es-AR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function formatHex(value) {
    return `0x${(value >>> 0).toString(16).padStart(8, '0')}`;
  }

  function hashSeed(text) {
    let hash = 2166136261;
    for (const character of String(text)) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0 || 1;
  }

  function bytesToBits(bytes, requestedLength) {
    const bits = new Uint8Array(requestedLength);
    for (let index = 0; index < requestedLength; index += 1) {
      bits[index] = (bytes[index >>> 3] >>> (7 - (index & 7))) & 1;
    }
    return bits;
  }

  function generateLcg(bitLength, seedText) {
    let state = hashSeed(seedText);
    const initial = state;
    const bytes = new Uint8Array(Math.ceil(bitLength / 8));
    const trace = [];

    for (let index = 0; index < bytes.length; index += 1) {
      state = (Math.imul(LCG_A, state) + LCG_C) >>> 0;
      bytes[index] = state & 0xff;
      if (index < 8) trace.push(state);
    }

    const predictedState = (Math.imul(LCG_A, state) + LCG_C) >>> 0;
    return {
      bits: bytesToBits(bytes, bitLength),
      bytes,
      initial,
      final: state,
      predictedState,
      predictedByte: predictedState & 0xff,
      trace
    };
  }

  function secureRandomAvailable() {
    return Boolean(window.crypto && typeof window.crypto.getRandomValues === 'function');
  }

  function fillSecureBytes(bytes) {
    if (!secureRandomAvailable()) return false;
    const maximumChunk = 65536;
    for (let offset = 0; offset < bytes.length; offset += maximumChunk) {
      const end = Math.min(bytes.length, offset + maximumChunk);
      window.crypto.getRandomValues(bytes.subarray(offset, end));
    }
    return true;
  }

  function generateSecure(bitLength) {
    const bytes = new Uint8Array(Math.ceil(bitLength / 8));
    const available = fillSecureBytes(bytes);
    return {
      bits: available ? bytesToBits(bytes, bitLength) : new Uint8Array(0),
      bytes: available ? bytes : new Uint8Array(0),
      available
    };
  }

  function binaryEntropy(probability) {
    if (probability <= 0 || probability >= 1) return 0;
    return -probability * Math.log2(probability)
      - (1 - probability) * Math.log2(1 - probability);
  }

  function calculateStats(bits) {
    const length = bits.length;
    if (!length) {
      return {
        proportion: 0,
        entropy: 0,
        runs: 0,
        correlation: 0
      };
    }

    let ones = 0;
    let runs = 1;
    for (let index = 0; index < length; index += 1) {
      ones += bits[index];
      if (index > 0 && bits[index] !== bits[index - 1]) runs += 1;
    }

    const mean = ones / length;
    let numerator = 0;
    let leftSquares = 0;
    let rightSquares = 0;

    for (let index = 0; index < length - 1; index += 1) {
      const left = bits[index] - mean;
      const right = bits[index + 1] - mean;
      numerator += left * right;
      leftSquares += left * left;
      rightSquares += right * right;
    }

    return {
      proportion: mean,
      entropy: binaryEntropy(mean),
      runs,
      correlation: leftSquares && rightSquares
        ? numerator / Math.sqrt(leftSquares * rightSquares)
        : 0
    };
  }

  function previewBits(bits) {
    if (!bits.length) return 'API criptográfica no disponible en este contexto.';
    const visibleLength = Math.min(bits.length, 384);
    let output = '';
    for (let index = 0; index < visibleLength; index += 1) {
      output += bits[index];
      if ((index + 1) % 8 === 0) output += ' ';
    }
    return `${output.trim()}${bits.length > visibleLength ? ' …' : ''}`;
  }

  function equalTypedArrays(left, right) {
    if (!left || !right || left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
      if (left[index] !== right[index]) return false;
    }
    return true;
  }

  function renderStats(prefix, result) {
    if (!result.bits.length) {
      $(`${prefix}-balance`).textContent = 'No disponible';
      $(`${prefix}-entropy`).textContent = 'No disponible';
      $(`${prefix}-runs`).textContent = '—';
      $(`${prefix}-correlation`).textContent = '—';
      $(`${prefix}-output`).textContent = previewBits(result.bits);
      return;
    }

    const values = calculateStats(result.bits);
    $(`${prefix}-balance`).textContent = formatNumber(values.proportion);
    $(`${prefix}-entropy`).textContent = `${formatNumber(values.entropy)} bits`;
    $(`${prefix}-runs`).textContent = values.runs.toLocaleString('es-AR');
    $(`${prefix}-correlation`).textContent = formatNumber(values.correlation);
    $(`${prefix}-output`).textContent = previewBits(result.bits);
  }

  function countUniquePairs(bytes) {
    const pairs = new Set();
    for (let index = 0; index < bytes.length - 1; index += 1) {
      pairs.add((bytes[index] << 8) | bytes[index + 1]);
    }
    return pairs.size;
  }

  function drawPairPlot(canvas, bytes, color, summaryElement) {
    const pairCount = Math.min(Math.max(bytes.length - 1, 0), MAX_PLOT_PAIRS);
    const uniquePairs = countUniquePairs(bytes);
    summaryElement.textContent = pairCount
      ? `${pairCount.toLocaleString('es-AR')} pares dibujados; ${uniquePairs.toLocaleString('es-AR')} pares distintos en la muestra completa.`
      : 'No hay datos suficientes para dibujar pares.';

    let context;
    try {
      context = canvas.getContext('2d');
    } catch (error) {
      context = null;
    }
    if (!context) return;

    const cssWidth = Math.max(260, Math.round(canvas.clientWidth || 560));
    const cssHeight = Math.max(190, Math.round(canvas.clientHeight || 250));
    const ratio = clamp(window.devicePixelRatio || 1, 1, 2);
    canvas.width = Math.round(cssWidth * ratio);
    canvas.height = Math.round(cssHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, cssWidth, cssHeight);

    const padding = 25;
    const plotWidth = cssWidth - padding * 2;
    const plotHeight = cssHeight - padding * 2;

    context.fillStyle = '#04121f';
    context.fillRect(0, 0, cssWidth, cssHeight);
    context.strokeStyle = 'rgba(163, 198, 230, 0.13)';
    context.lineWidth = 1;

    for (let step = 0; step <= 4; step += 1) {
      const x = padding + (plotWidth * step) / 4;
      const y = padding + (plotHeight * step) / 4;
      context.beginPath();
      context.moveTo(x, padding);
      context.lineTo(x, cssHeight - padding);
      context.stroke();
      context.beginPath();
      context.moveTo(padding, y);
      context.lineTo(cssWidth - padding, y);
      context.stroke();
    }

    context.fillStyle = color;
    context.globalAlpha = 0.62;
    for (let index = 0; index < pairCount; index += 1) {
      const x = padding + (bytes[index] / 255) * plotWidth;
      const y = cssHeight - padding - (bytes[index + 1] / 255) * plotHeight;
      context.beginPath();
      context.arc(x, y, 1.7, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;

    context.fillStyle = '#8298ad';
    context.font = '10px system-ui, sans-serif';
    context.fillText('0', 8, cssHeight - 8);
    context.fillText('255', cssWidth - 40, cssHeight - 8);
    context.fillText('byteₙ', cssWidth / 2 - 16, cssHeight - 8);
    context.save();
    context.translate(11, cssHeight / 2 + 18);
    context.rotate(-Math.PI / 2);
    context.fillText('byteₙ₊₁', 0, 0);
    context.restore();
  }

  function renderExperimentPlots(lcg, secure) {
    drawPairPlot(
      $('lcg-pair-chart'),
      lcg.bytes,
      '#ffc766',
      $('lcg-plot-summary')
    );
    drawPairPlot(
      $('crypto-pair-chart'),
      secure.bytes,
      '#4adea3',
      $('crypto-plot-summary')
    );
  }

  function renderTrace(lcg) {
    const lines = [
      `semilla normalizada  ${formatHex(lcg.initial)}`,
      ...lcg.trace.map((state, index) => `x${String(index + 1).padStart(2, '0')}                 ${formatHex(state)}  → byte ${String(state & 0xff).padStart(3, ' ')}`),
      `estado final         ${formatHex(lcg.final)}`
    ];
    $('lcg-state-output').textContent = lines.join('\n');
    $('lcg-next-state').textContent = `${formatHex(lcg.predictedState)} → ${lcg.predictedByte}`;
  }

  function renderRepeatComparison(lcg, secure, seed, bitLength) {
    if (!previousExperiment) {
      $('lcg-repeat').textContent = 'Primera ejecución';
      $('crypto-repeat').textContent = secure.available ? 'Primera ejecución' : 'No disponible';
      $('rng-status').textContent = 'Primera comparación lista. Repetí sin cambiar la semilla para observar qué flujo se reproduce.';
      $('rng-status').className = 'status';
      return;
    }

    const sameInputs = previousExperiment.seed === seed
      && previousExperiment.bitLength === bitLength;
    const lcgSame = sameInputs && equalTypedArrays(previousExperiment.lcg.bytes, lcg.bytes);
    const secureSame = secure.available
      && previousExperiment.secure.available
      && equalTypedArrays(previousExperiment.secure.bytes, secure.bytes);

    if (!sameInputs) {
      $('lcg-repeat').textContent = 'Entrada modificada';
      $('crypto-repeat').textContent = secure.available ? 'Muestra nueva' : 'No disponible';
      $('rng-status').textContent = 'Cambió la semilla o la longitud; el PRNG partió de otra configuración.';
      $('rng-status').className = 'status warn';
      return;
    }

    $('lcg-repeat').textContent = lcgSame ? 'Idéntico' : 'Distinto';
    $('crypto-repeat').textContent = secure.available
      ? (secureSame ? 'Coincidencia total' : 'Distinto')
      : 'No disponible';

    if (lcgSame && secure.available && !secureSame) {
      $('rng-status').textContent = 'Misma entrada: el PRNG repitió todos sus bytes y el CSPRNG entregó una muestra nueva.';
      $('rng-status').className = 'status good';
    } else {
      $('rng-status').textContent = 'Comparación completada. Revisá reproducibilidad, estado y origen antes de interpretar la muestra.';
      $('rng-status').className = 'status warn';
    }
  }

  function runExperiment() {
    const rawLength = Math.round(Number($('stream-length').value) || 4096);
    const bitLength = clamp(rawLength, 256, 20000);
    const seed = $('seed').value.trim() || 'SEMILLA-DIDACTICA';
    $('stream-length').value = String(bitLength);
    $('seed').value = seed;

    const lcg = generateLcg(bitLength, seed);
    const secure = generateSecure(bitLength);
    renderStats('lcg', lcg);
    renderStats('crypto', secure);
    renderTrace(lcg);
    renderRepeatComparison(lcg, secure, seed, bitLength);
    renderExperimentPlots(lcg, secure);

    previousExperiment = { lcg, secure, seed, bitLength };
    currentPlotData = { lcg, secure };
  }

  function toySequence(seed) {
    const sequence = [];
    let state = seed;
    for (let index = 0; index < 4; index += 1) {
      state = (TOY_A * state + TOY_C) % TOY_MODULUS;
      sequence.push(state);
    }
    return sequence;
  }

  function renderToyExperiment() {
    const seed = Number($('toy-seed').value);
    const sequence = toySequence(seed);
    $('toy-seed-value').textContent = String(seed);
    const cells = [...$('weak-observations').children];
    sequence.slice(0, 3).forEach((value, index) => {
      cells[index].textContent = String(value);
      cells[index].className = '';
    });
    cells[3].textContent = '?';
    cells[3].className = 'unknown';
    $('weak-calculation').textContent = `Salida observada x₃ = ${sequence[2]}. Falta aplicar la recurrencia pública.`;
    $('prediction-status').textContent = 'Todavía no se reveló la cuarta salida.';
    $('prediction-status').className = 'status';
  }

  function predictToyOutput() {
    const seed = Number($('toy-seed').value);
    const sequence = toySequence(seed);
    const observedState = sequence[2];
    const prediction = (TOY_A * observedState + TOY_C) % TOY_MODULUS;
    const finalCell = $('weak-observations').children[3];
    finalCell.textContent = String(prediction);
    finalCell.className = 'predicted';
    $('weak-calculation').textContent = `x₄ = (5 × ${observedState} + 1) mod 256 = ${prediction}`;
    $('prediction-status').textContent = prediction === sequence[3]
      ? `Predicción exacta: el valor calculado y la salida real son ${sequence[3]}.`
      : 'La predicción no coincidió; revisá el modelo.';
    $('prediction-status').className = prediction === sequence[3] ? 'status good' : 'status bad';
  }

  function chooseNewToySeed() {
    const byte = new Uint8Array(1);
    if (fillSecureBytes(byte)) {
      $('toy-seed').value = String(byte[0]);
    } else {
      $('toy-seed').value = String((Number($('toy-seed').value) + 73) % 256);
    }
    renderToyExperiment();
  }

  function formatBigInteger(value) {
    if (value <= 1000000000n) return value.toLocaleString('es-AR');
    const digits = value.toString();
    const coefficient = `${digits[0]},${digits.slice(1, 3)}`;
    return `${coefficient} × 10^${digits.length - 1}`;
  }

  function formatDuration(seconds) {
    if (seconds < 0.001) return '< 1 ms';
    if (seconds < 1) return `${formatNumber(seconds * 1000, 2)} ms`;
    if (seconds < 60) return `${formatNumber(seconds, 2)} s`;
    if (seconds < 3600) return `${formatNumber(seconds / 60, 2)} min`;
    if (seconds < 86400) return `${formatNumber(seconds / 3600, 2)} h`;
    if (seconds < 31557600) return `${formatNumber(seconds / 86400, 2)} días`;
    const years = seconds / 31557600;
    if (years < 1000000) return `${formatNumber(years, 2)} años`;
    return `${years.toExponential(2).replace('.', ',')} años`;
  }

  function renderEntropyModel() {
    const model = entropyModels[$('entropy-source').value] || entropyModels.public;
    const averageSearchSeconds = (2 ** Math.max(model.bits - 1, -1)) / 1000000;
    $('entropy-bits').textContent = `${formatNumber(model.bits, model.bits % 1 === 0 ? 0 : 2)} bits`;
    $('entropy-candidates').textContent = formatBigInteger(model.candidates);
    $('entropy-search-time').textContent = formatDuration(averageSearchSeconds);
    $('entropy-meter-fill').style.width = `${clamp((model.bits / 128) * 100, 0, 100)}%`;
    $('entropy-level').textContent = model.label;
    $('entropy-explanation').textContent = model.explanation;
    $('entropy-verdict').dataset.level = model.level;
  }

  function evaluateQuiz(event) {
    event.preventDefault();
    const questions = [...document.querySelectorAll('.rng-question')];
    let score = 0;
    let unanswered = 0;

    questions.forEach((question, index) => {
      const selected = question.querySelector('input:checked');
      const feedback = question.querySelector('.question-feedback');
      question.classList.remove('correct', 'incorrect');

      if (!selected) {
        unanswered += 1;
        feedback.textContent = 'Falta seleccionar una respuesta.';
        return;
      }

      const correct = selected.value === question.dataset.answer;
      question.classList.add(correct ? 'correct' : 'incorrect');
      feedback.textContent = `${correct ? 'Correcto. ' : 'Revisá el criterio. '}${quizExplanations[index]}`;
      if (correct) score += 1;
    });

    const result = $('rng-quiz-result');
    if (unanswered) {
      result.textContent = `${score} correctas hasta ahora; faltan ${unanswered} ${unanswered === 1 ? 'respuesta' : 'respuestas'}.`;
    } else if (score === questions.length) {
      result.textContent = `${score}/${questions.length}. Distinguís apariencia estadística, entropía, estado y requisitos de uso.`;
    } else {
      result.textContent = `${score}/${questions.length}. Leé las devoluciones y volvé a intentarlo.`;
    }
  }

  function resetQuiz() {
    $('rng-quiz').reset();
    document.querySelectorAll('.rng-question').forEach((question) => {
      question.classList.remove('correct', 'incorrect');
      question.querySelector('.question-feedback').textContent = '';
    });
    $('rng-quiz-result').textContent = 'Respondé las cuatro situaciones.';
  }

  function redrawPlotsAfterResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (currentPlotData) {
        renderExperimentPlots(currentPlotData.lcg, currentPlotData.secure);
      }
    }, 120);
  }

  $('generate-streams').addEventListener('click', runExperiment);
  $('repeat-experiment').addEventListener('click', runExperiment);
  $('toy-seed').addEventListener('input', renderToyExperiment);
  $('new-toy-seed').addEventListener('click', chooseNewToySeed);
  $('predict-weak').addEventListener('click', predictToyOutput);
  $('entropy-source').addEventListener('change', renderEntropyModel);
  $('rng-quiz').addEventListener('submit', evaluateQuiz);
  $('reset-rng-quiz').addEventListener('click', resetQuiz);
  window.addEventListener('resize', redrawPlotsAfterResize);

  runExperiment();
  renderToyExperiment();
  renderEntropyModel();
})();
