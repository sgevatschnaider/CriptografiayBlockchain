(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const LOG10_2 = Math.log10(2);
  const SECONDS_PER_YEAR = 31557600;
  const LOG10_SECONDS_PER_YEAR = Math.log10(SECONDS_PER_YEAR);
  const UNIVERSE_YEARS = 1.38e10;
  const canvas = $('complexity-chart');
  const context = canvas.getContext('2d');
  let current = null;

  function scientificFromLog10(logValue, suffix = '') {
    if (!Number.isFinite(logValue)) return 'no definido';
    const exponent = Math.floor(logValue);
    const mantissa = 10 ** (logValue - exponent);
    if (exponent >= -3 && exponent <= 5) {
      return `${(10 ** logValue).toLocaleString('es-AR', { maximumFractionDigits: 3 })}${suffix}`;
    }
    return `${mantissa.toFixed(2)}×10^${exponent}${suffix}`;
  }

  function humanDuration(logSeconds) {
    if (!Number.isFinite(logSeconds)) return 'no definido';
    const units = [
      ['ns', -9],
      ['µs', -6],
      ['ms', -3],
      ['s', 0],
      ['min', Math.log10(60)],
      ['h', Math.log10(3600)],
      ['días', Math.log10(86400)],
      ['años', LOG10_SECONDS_PER_YEAR]
    ];
    if (logSeconds < -9) return scientificFromLog10(logSeconds + 9, ' ns');
    for (let index = 0; index < units.length - 1; index += 1) {
      if (logSeconds < units[index + 1][1]) {
        return `${(10 ** (logSeconds - units[index][1])).toLocaleString('es-AR', { maximumFractionDigits: 2 })} ${units[index][0]}`;
      }
    }
    return scientificFromLog10(logSeconds - LOG10_SECONDS_PER_YEAR, ' años');
  }

  function positiveNumber(input, fallback) {
    const value = Number(input.value);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  function calculateForBits(effectiveBits, model, rate, workers) {
    const workExponent = model === 'grover'
      ? effectiveBits / 2
      : Math.max(0, effectiveBits - 1);
    const logOperations = workExponent * LOG10_2;
    const logSeconds = logOperations - Math.log10(rate) - Math.log10(workers);
    return { workExponent, logOperations, logSeconds };
  }

  function render() {
    const keyBits = Number($('key-bits').value);
    const loss = Math.min(keyBits, Number($('bits-loss').value));
    const effectiveBits = Math.max(0, keyBits - loss);
    const model = $('compute-model').value;
    const rate = positiveNumber($('attempt-rate'), 1e12);
    const workers = positiveNumber($('workers'), 1e6);
    const energyPerTest = positiveNumber($('energy-per-test'), 1e-12);
    const result = calculateForBits(effectiveBits, model, rate, workers);
    const keySpaceLog = keyBits * LOG10_2;
    const logYears = result.logSeconds - LOG10_SECONDS_PER_YEAR;

    current = { keyBits, loss, effectiveBits, model, rate, workers, energyPerTest, ...result, logYears };
    $('key-bits-value').textContent = `${keyBits} bits`;
    $('bits-loss-value').textContent = `${loss} bits`;
    $('key-space').textContent = `2^${keyBits} ≈ ${scientificFromLog10(keySpaceLog)}`;
    $('effective-security').textContent = `${effectiveBits} bits`;
    $('work-factor').textContent = `≈2^${Number(result.workExponent.toFixed(1))}`;
    $('attack-time').textContent = humanDuration(result.logSeconds);
    $('attack-formula').textContent = model === 'grover'
      ? `T ≈ 2^(${effectiveBits}/2) ÷ (${rate.toExponential(2)}·${workers.toExponential(2)}) segundos`
      : `T medio ≈ 2^(${effectiveBits}−1) ÷ (${rate.toExponential(2)}·${workers.toExponential(2)}) segundos`;

    if (model === 'classical') {
      const logKwh = result.logOperations + Math.log10(energyPerTest) - Math.log10(3.6e6);
      $('energy-output').textContent = scientificFromLog10(logKwh, ' kWh');
    } else {
      $('energy-output').textContent = 'No modelada';
    }
    const ratioLog = logYears - Math.log10(UNIVERSE_YEARS);
    $('universe-comparison').textContent = ratioLog > 0
      ? `${scientificFromLog10(ratioLog)} × edad del universo`
      : `${scientificFromLog10(-ratioLog)} veces menor que su edad`;

    if (model === 'grover') {
      $('complexity-status').textContent = 'Modo Grover idealizado: se muestran consultas asintóticas, no recursos físicos ni una fecha de ruptura.';
      $('complexity-status').className = 'status warn';
    } else if (effectiveBits < 80) {
      $('complexity-status').textContent = 'El nivel efectivo quedó por debajo de 80 bits: sirve para observar una escala históricamente superada.';
      $('complexity-status').className = 'status bad';
    } else {
      $('complexity-status').textContent = 'La estimación supone claves uniformes y ausencia de atajos mejores que el configurado.';
      $('complexity-status').className = 'status good';
    }
    drawChart();
  }

  function drawChart() {
    if (!current) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width));
    const height = Math.max(240, Math.round(rect.height));
    const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const margin = { top: 20, right: 22, bottom: 44, left: 62 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const minBits = 0;
    const maxBits = 256;
    const sampleLogs = [];
    for (let bits = minBits; bits <= maxBits; bits += 2) {
      const logYears = calculateForBits(bits, current.model, current.rate, current.workers).logSeconds - LOG10_SECONDS_PER_YEAR;
      sampleLogs.push({ bits, logYears });
    }
    const rawMin = Math.min(...sampleLogs.map((point) => point.logYears), current.logYears);
    const rawMax = Math.max(...sampleLogs.map((point) => point.logYears), current.logYears);
    const minLog = Math.floor(rawMin / 10) * 10;
    const maxLog = Math.ceil(rawMax / 10) * 10 || minLog + 10;
    const x = (bits) => margin.left + (bits - minBits) / (maxBits - minBits) * plotWidth;
    const y = (logYears) => margin.top + (maxLog - logYears) / (maxLog - minLog) * plotHeight;

    context.strokeStyle = '#cbd8e5';
    context.lineWidth = 1;
    context.font = '11px system-ui, sans-serif';
    context.fillStyle = '#43566a';
    [0, 64, 128, 192, 256].forEach((tick) => {
      const px = x(tick);
      context.beginPath();
      context.moveTo(px, margin.top);
      context.lineTo(px, margin.top + plotHeight);
      context.strokeStyle = '#e3eaf1';
      context.stroke();
      context.textAlign = 'center';
      context.fillText(String(tick), px, height - 18);
    });
    for (let tick = minLog; tick <= maxLog; tick += Math.max(10, Math.ceil((maxLog - minLog) / 5 / 10) * 10)) {
      const py = y(tick);
      context.beginPath();
      context.moveTo(margin.left, py);
      context.lineTo(margin.left + plotWidth, py);
      context.strokeStyle = '#e3eaf1';
      context.stroke();
      context.textAlign = 'right';
      context.fillText(`10^${tick}`, margin.left - 8, py + 4);
    }

    const gradient = context.createLinearGradient(margin.left, 0, margin.left + plotWidth, 0);
    gradient.addColorStop(0, '#1597bd');
    gradient.addColorStop(0.55, '#4c6fff');
    gradient.addColorStop(1, '#8b54c7');
    context.strokeStyle = gradient;
    context.lineWidth = 4;
    context.beginPath();
    sampleLogs.forEach((point, index) => {
      if (index === 0) context.moveTo(x(point.bits), y(point.logYears));
      else context.lineTo(x(point.bits), y(point.logYears));
    });
    context.stroke();

    const currentBitsOnCurve = current.effectiveBits;
    const currentLog = calculateForBits(currentBitsOnCurve, current.model, current.rate, current.workers).logSeconds - LOG10_SECONDS_PER_YEAR;
    context.fillStyle = '#0a2135';
    context.strokeStyle = '#ffb52b';
    context.lineWidth = 4;
    context.beginPath();
    context.arc(x(currentBitsOnCurve), y(currentLog), 7, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }

  ['key-bits', 'bits-loss'].forEach((id) => $(id).addEventListener('input', render));
  ['compute-model', 'attempt-rate', 'workers', 'energy-per-test'].forEach((id) => $(id).addEventListener('change', render));
  Module02.observeResponsiveCanvas(canvas, drawChart);
  render();
})();
