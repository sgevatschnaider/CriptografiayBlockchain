(() => {
  'use strict';
  const Core = window.AsymmetryCore;
  const byId = (id) => document.getElementById(id);
  const progress = document.querySelector('[data-reading-progress]');

  function renderRsa() {
    const p = Number(byId('rsa-theory-p').value);
    const q = Number(byId('rsa-theory-q').value);
    const e = Number(byId('rsa-theory-e').value);
    const message = Number(byId('rsa-theory-message').value);
    try {
      const trace = Core.rsaTrace(p, q, e, message);
      byId('rsa-theory-n').textContent = trace.n;
      byId('rsa-theory-phi').textContent = trace.phi;
      byId('rsa-theory-d').textContent = trace.d;
      byId('rsa-theory-cipher').textContent = trace.ciphertext;
      byId('rsa-theory-recovered').textContent = trace.recovered;
      byId('rsa-theory-equations').textContent = [
        `n = p x q = ${trace.p} x ${trace.q} = ${trace.n}`,
        `phi(n) = (p - 1)(q - 1) = ${trace.phi}`,
        `d = e^-1 mod phi(n) = ${trace.d}`,
        `c = m^e mod n = ${trace.message}^${trace.e} mod ${trace.n} = ${trace.ciphertext}`,
        `m = c^d mod n = ${trace.ciphertext}^${trace.d} mod ${trace.n} = ${trace.recovered}`,
      ].join('\n');
      byId('rsa-theory-status').textContent = trace.recovered === trace.message
        ? 'La identidad RSA se cumple. Este ejemplo usa enteros pequeños únicamente para inspección.'
        : 'El mensaje no se recuperó; revise los parámetros.';
      byId('rsa-theory-status').dataset.kind = trace.recovered === trace.message ? 'good' : 'warn';
    } catch (error) {
      byId('rsa-theory-status').textContent = error.message;
      byId('rsa-theory-status').dataset.kind = 'warn';
    }
  }

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function renderCurve() {
    const scalar = Number(byId('ecc-scalar').value);
    const curve = { a: 2, b: 2, p: 17 };
    const base = { x: 5, y: 1 };
    const multiplication = Core.ecMultiply(scalar, base, curve.a, curve.b, curve.p);
    const result = multiplication.point;
    const points = Core.enumerateCurve(curve.a, curve.b, curve.p);
    const svg = byId('ecc-curve-plot');
    svg.replaceChildren();
    const left = 44;
    const top = 24;
    const width = 482;
    const height = 276;
    const xFor = (x) => left + (x / 16) * width;
    const yFor = (y) => top + height - (y / 16) * height;

    for (let value = 0; value <= 16; value += 4) {
      const x = xFor(value);
      const y = yFor(value);
      svg.append(svgElement('line', { x1: x, y1: top, x2: x, y2: top + height, class: 'asym-grid-line' }));
      svg.append(svgElement('line', { x1: left, y1: y, x2: left + width, y2: y, class: 'asym-grid-line' }));
      const xLabel = svgElement('text', { x, y: top + height + 24, class: 'asym-axis-label', 'text-anchor': 'middle' });
      xLabel.textContent = value;
      svg.append(xLabel);
      const yLabel = svgElement('text', { x: left - 16, y: y + 4, class: 'asym-axis-label', 'text-anchor': 'middle' });
      yLabel.textContent = value;
      svg.append(yLabel);
    }

    points.forEach((point) => {
      const classes = ['asym-curve-point'];
      if (point.x === base.x && point.y === base.y) classes.push('base');
      if (result && point.x === result.x && point.y === result.y) classes.push('result');
      const circle = svgElement('circle', {
        cx: xFor(point.x), cy: yFor(point.y), r: classes.length > 1 ? 7 : 4.5,
        class: classes.join(' '), 'aria-label': `Punto (${point.x}, ${point.y})`,
      });
      svg.append(circle);
    });

    byId('ecc-scalar-value').textContent = scalar;
    byId('ecc-result').textContent = result ? `${scalar}G = (${result.x}, ${result.y})` : `${scalar}G = punto al infinito`;
    byId('ecc-trace').textContent = multiplication.trace.map((step, index) => {
      const current = step.result ? `(${step.result.x},${step.result.y})` : 'O';
      const addend = step.addend ? `(${step.addend.x},${step.addend.y})` : 'O';
      return `paso ${index + 1}: bit=${step.bit}, acumulado=${current}, sumando=${addend}`;
    }).join('\n');
  }

  byId('rsa-theory-run').addEventListener('click', renderRsa);
  byId('rsa-theory-vector').addEventListener('click', () => {
    byId('rsa-theory-p').value = '61';
    byId('rsa-theory-q').value = '53';
    byId('rsa-theory-e').value = '17';
    byId('rsa-theory-message').value = '65';
    renderRsa();
  });
  byId('ecc-scalar').addEventListener('input', renderCurve);

  document.querySelectorAll('.aes-term button').forEach((button) => {
    button.addEventListener('click', () => {
      const term = button.closest('.aes-term');
      term.setAttribute('aria-expanded', String(term.getAttribute('aria-expanded') !== 'true'));
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal-on-scroll').forEach((section) => observer.observe(section));

  function updateReadingProgress() {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const value = available > 0 ? Math.min(100, Math.max(0, (window.scrollY / available) * 100)) : 0;
    progress.style.width = `${value}%`;
  }
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  window.addEventListener('resize', updateReadingProgress);

  renderRsa();
  renderCurve();
  updateReadingProgress();
})();
