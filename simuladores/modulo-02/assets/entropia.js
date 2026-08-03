(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const probability = $('probability');
  const sampleSize = $('sample-size');
  const canvas = $('entropy-chart');
  const context = canvas.getContext('2d');
  let lastSample = null;

  const format = (value, digits = 3) => Number(value).toLocaleString('es-AR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });

  function binaryEntropy(p) {
    return Module02.entropy([p, 1 - p]);
  }

  function surprise(p) {
    return p > 0 ? -Math.log2(p) : Infinity;
  }

  function formatSurprise(value) {
    return Number.isFinite(value) ? `${format(value, 3)} bits` : '∞ (evento imposible)';
  }

  function updateTheory() {
    const p = Number(probability.value);
    const h = binaryEntropy(p);
    const pZero = 1 - p;
    $('probability-value').textContent = format(p, 2);
    $('p-zero').textContent = format(pZero, 2);
    $('p-one').textContent = format(p, 2);
    $('bar-zero').style.width = `${pZero * 100}%`;
    $('bar-one').style.width = `${p * 100}%`;
    $('theoretical-h').textContent = format(h);
    $('redundancy').textContent = format(1 - h);
    $('effective-outcomes').textContent = format(2 ** h, 2);
    $('surprise-output').textContent = `I(0)=${formatSurprise(surprise(pZero))} · I(1)=${formatSurprise(surprise(p))}`;
    drawChart();
    if (lastSample) renderSample(lastSample);
  }

  function randomUniforms(length) {
    const values = new Uint32Array(length);
    const chunkSize = 8192;
    for (let offset = 0; offset < length; offset += chunkSize) {
      crypto.getRandomValues(values.subarray(offset, Math.min(length, offset + chunkSize)));
    }
    return values;
  }

  function generateSample() {
    const p = Number(probability.value);
    const n = Module02.clamp(Math.round(Number(sampleSize.value) || 2000), 20, 50000);
    sampleSize.value = String(n);
    const random = randomUniforms(n);
    const threshold = p * 4294967296;
    let ones = 0;
    let preview = '';
    for (let index = 0; index < n; index += 1) {
      const bit = random[index] < threshold ? 1 : 0;
      ones += bit;
      if (index < 480) {
        preview += bit;
        if ((index + 1) % 8 === 0) preview += ' ';
      }
    }
    lastSample = { n, ones, preview: preview.trim() };
    renderSample(lastSample);
    $('entropy-status').textContent = `Muestra de ${n.toLocaleString('es-AR')} símbolos generada. Compará teoría y observación.`;
  }

  function renderSample(sample) {
    const p = Number(probability.value);
    const q = sample.ones / sample.n;
    const empirical = binaryEntropy(q);
    $('count-zero').textContent = (sample.n - sample.ones).toLocaleString('es-AR');
    $('count-one').textContent = sample.ones.toLocaleString('es-AR');
    $('empirical-h').textContent = `${format(empirical)} bits`;
    $('sample-output').textContent = sample.preview + (sample.n > 480 ? ' …' : '');
    $('empirical-comparison').textContent = `p̂(1) = ${format(q, 4)} · error absoluto = ${format(Math.abs(q - p), 4)} · Ĥ = ${format(empirical, 4)}`;
  }

  function drawChart() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width));
    const height = Math.max(240, Math.round(rect.height));
    const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const margin = { top: 20, right: 20, bottom: 42, left: 50 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const x = (p) => margin.left + p * plotWidth;
    const y = (h) => margin.top + (1 - h) * plotHeight;

    context.strokeStyle = '#c9d7e5';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(margin.left, margin.top);
    context.lineTo(margin.left, margin.top + plotHeight);
    context.lineTo(margin.left + plotWidth, margin.top + plotHeight);
    context.stroke();

    context.font = '12px system-ui, sans-serif';
    context.fillStyle = '#43566a';
    context.textAlign = 'center';
    [0, 0.25, 0.5, 0.75, 1].forEach((tick) => {
      const px = x(tick);
      context.strokeStyle = '#e1e8ef';
      context.beginPath();
      context.moveTo(px, margin.top);
      context.lineTo(px, margin.top + plotHeight);
      context.stroke();
      context.fillText(tick.toFixed(2), px, height - 17);
    });

    context.textAlign = 'right';
    [0, 0.25, 0.5, 0.75, 1].forEach((tick) => {
      const py = y(tick);
      context.strokeStyle = '#e1e8ef';
      context.beginPath();
      context.moveTo(margin.left, py);
      context.lineTo(margin.left + plotWidth, py);
      context.stroke();
      context.fillText(tick.toFixed(2), margin.left - 8, py + 4);
    });

    const gradient = context.createLinearGradient(margin.left, 0, margin.left + plotWidth, 0);
    gradient.addColorStop(0, '#1597bd');
    gradient.addColorStop(0.5, '#4c6fff');
    gradient.addColorStop(1, '#8b54c7');
    context.strokeStyle = gradient;
    context.lineWidth = 4;
    context.beginPath();
    for (let step = 0; step <= 300; step += 1) {
      const p = step / 300;
      const px = x(p);
      const py = y(binaryEntropy(p));
      if (step === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.stroke();

    const currentP = Number(probability.value);
    const currentH = binaryEntropy(currentP);
    context.fillStyle = '#0a2135';
    context.strokeStyle = '#ffb52b';
    context.lineWidth = 4;
    context.beginPath();
    context.arc(x(currentP), y(currentH), 7, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = '#1f3346';
    context.textAlign = 'left';
    context.fillText(`p=${currentP.toFixed(2)} · H=${currentH.toFixed(3)}`, Math.min(width - 135, x(currentP) + 12), Math.max(16, y(currentH) - 10));
  }

  probability.addEventListener('input', updateTheory);
  sampleSize.addEventListener('change', () => {
    sampleSize.value = String(Module02.clamp(Math.round(Number(sampleSize.value) || 2000), 20, 50000));
  });
  $('generate').addEventListener('click', generateSample);
  document.querySelectorAll('[data-probability]').forEach((button) => {
    button.addEventListener('click', () => {
      probability.value = button.dataset.probability;
      updateTheory();
    });
  });
  Module02.observeResponsiveCanvas(canvas, drawChart);

  updateTheory();
  generateSample();
})();
