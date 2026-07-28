(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  function mod(value, modulus) {
    return ((value % modulus) + modulus) % modulus;
  }

  function modPow(base, exponent, modulus) {
    let result = 1;
    let factor = mod(base, modulus);
    let power = exponent;
    while (power > 0) {
      if (power & 1) result = (result * factor) % modulus;
      factor = (factor * factor) % modulus;
      power = Math.floor(power / 2);
    }
    return result;
  }

  function inverseMod(value, modulus) {
    let [oldR, r] = [mod(value, modulus), modulus];
    let [oldS, s] = [1, 0];
    while (r) {
      const quotient = Math.floor(oldR / r);
      [oldR, r] = [r, oldR - quotient * r];
      [oldS, s] = [s, oldS - quotient * s];
    }
    return oldR === 1 ? mod(oldS, modulus) : null;
  }

  function parseByte(input) {
    const cleaned = input.value.trim().replace(/^0x/i, '');
    if (!/^[0-9a-f]{1,2}$/i.test(cleaned)) return null;
    return Number.parseInt(cleaned, 16);
  }

  function gfXtime(value) {
    return ((value << 1) ^ ((value & 0x80) ? 0x1b : 0)) & 0xff;
  }

  function gfMultiply(left, right) {
    let a = left;
    let b = right;
    let product = 0;
    while (b) {
      if (b & 1) product ^= a;
      a = gfXtime(a);
      b >>>= 1;
    }
    return product;
  }

  function gfPow(value, exponent) {
    let result = 1;
    let factor = value;
    let power = exponent;
    while (power) {
      if (power & 1) result = gfMultiply(result, factor);
      factor = gfMultiply(factor, factor);
      power >>>= 1;
    }
    return result;
  }

  function byteHex(value) {
    return `0x${value.toString(16).padStart(2, '0').toUpperCase()}`;
  }

  function polynomial(value) {
    if (!value) return '0';
    const terms = [];
    for (let degree = 7; degree >= 0; degree -= 1) {
      if (!(value & (1 << degree))) continue;
      terms.push(degree === 0 ? '1' : degree === 1 ? 'x' : `x${toSuperscript(degree)}`);
    }
    return terms.join(' + ');
  }

  function toSuperscript(value) {
    return String(value).replace(/[0-9]/g, (digit) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)]);
  }

  function renderField() {
    const a = parseByte($('field-a'));
    const b = parseByte($('field-b'));
    if (a === null || b === null) {
      $('field-status').textContent = 'Ingresá bytes hexadecimales entre 00 y FF.';
      $('field-status').className = 'status bad';
      return;
    }
    $('field-a-polynomial').textContent = `${byteHex(a)} = ${polynomial(a)}`;
    $('field-b-polynomial').textContent = `${byteHex(b)} = ${polynomial(b)}`;
    $('field-xor').textContent = byteHex(a ^ b);
    $('field-xtime').textContent = byteHex(gfXtime(a));
    $('field-product').textContent = byteHex(gfMultiply(a, b));
    $('field-inverse').textContent = a ? byteHex(gfPow(a, 254)) : 'no existe';
    $('field-status').textContent = `${byteHex(a)}·${byteHex(b)} = ${byteHex(gfMultiply(a, b))} después de la reducción modular.`;
    $('field-status').className = 'status good';
  }

  function primeFactors(value) {
    const factors = [];
    let n = value;
    for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
      if (n % divisor !== 0) continue;
      factors.push(divisor);
      while (n % divisor === 0) n /= divisor;
    }
    if (n > 1) factors.push(n);
    return factors;
  }

  function multiplicativeOrder(g, p) {
    let value = 1;
    for (let order = 1; order <= p - 1; order += 1) {
      value = value * g % p;
      if (value === 1) return order;
    }
    return 0;
  }

  function isGenerator(g, p) {
    if (g <= 1 || g >= p) return false;
    return primeFactors(p - 1).every((factor) => modPow(g, (p - 1) / factor, p) !== 1);
  }

  function smallestGenerator(p) {
    for (let candidate = 2; candidate < p; candidate += 1) {
      if (isGenerator(candidate, p)) return candidate;
    }
    return 1;
  }

  function orbit(g, p) {
    const values = [];
    let value = 1;
    do {
      values.push(value);
      value = value * g % p;
    } while (value !== 1 && values.length <= p);
    return values;
  }

  function renderGroupPlot(p, g, exponent, values) {
    const size = 420;
    const center = size / 2;
    const radius = 165;
    const pointPosition = new Map();
    const all = Array.from({ length: p - 1 }, (_, index) => index + 1);
    all.forEach((value, index) => {
      const angle = -Math.PI / 2 + index / all.length * Math.PI * 2;
      pointPosition.set(value, {
        x: center + Math.cos(angle) * radius,
        y: center + Math.sin(angle) * radius
      });
    });
    const target = modPow(g, exponent, p);
    const lines = values.map((value, index) => {
      const next = values[(index + 1) % values.length];
      const a = pointPosition.get(value);
      const b = pointPosition.get(next);
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#6b84a1" stroke-width="1.4" opacity=".55"/>`;
    }).join('');
    const nodes = all.map((value) => {
      const point = pointPosition.get(value);
      const active = value === target;
      const inOrbit = values.includes(value);
      return `<g><circle cx="${point.x}" cy="${point.y}" r="${active ? 13 : 9}" fill="${active ? '#ffc766' : inOrbit ? '#63d5ff' : '#d8e1ea'}" stroke="#17324a" stroke-width="1.5"/><text x="${point.x}" y="${point.y + 4}" fill="#10253a" font-size="${active ? 11 : 8}" font-weight="800" text-anchor="middle">${value}</text></g>`;
    }).join('');
    $('group-plot').innerHTML = `${lines}${nodes}<text x="210" y="205" text-anchor="middle" fill="#1d3850" font-size="16" font-weight="800">g=${g}</text><text x="210" y="226" text-anchor="middle" fill="#4b6277" font-size="12">módulo ${p}</text>`;
  }

  function renderGroup() {
    const p = Number($('group-prime').value);
    const g = Module02.clamp(Math.round(Number($('group-generator').value) || 2), 2, p - 1);
    $('group-generator').value = String(g);
    $('group-exponent').max = String(p - 2);
    const exponent = Module02.clamp(Number($('group-exponent').value), 0, p - 2);
    $('group-exponent').value = String(exponent);
    $('group-exponent-value').textContent = String(exponent);
    const values = orbit(g, p);
    const order = multiplicativeOrder(g, p);
    const generator = isGenerator(g, p);
    $('group-result').textContent = String(modPow(g, exponent, p));
    $('group-order').textContent = String(order);
    $('group-size').textContent = String(p - 1);
    $('group-generator-verdict').textContent = generator ? 'Sí' : 'No';
    $('group-orbit').textContent = values.map((value, index) => `g^${index}=${value}`).join(' → ') + ' → 1';
    $('group-status').textContent = generator
      ? `g=${g} tiene orden p−1=${p - 1}: recorre todos los elementos no nulos.`
      : `g=${g} tiene orden ${order}: genera un subgrupo propio de ℤ*${p}.`;
    $('group-status').className = generator ? 'status good' : 'status warn';
    renderGroupPlot(p, g, exponent, values);
  }

  const CURVE = { p: 17, a: 2, b: 2 };
  const BASE = { x: 5, y: 1 };

  function curvePoints() {
    const points = [];
    for (let x = 0; x < CURVE.p; x += 1) {
      for (let y = 0; y < CURVE.p; y += 1) {
        if (mod(y * y - (x * x * x + CURVE.a * x + CURVE.b), CURVE.p) === 0) points.push({ x, y });
      }
    }
    return points;
  }

  function pointEqual(a, b) {
    if (a === null || b === null) return a === b;
    return a.x === b.x && a.y === b.y;
  }

  function pointAdd(left, right) {
    if (left === null) return right;
    if (right === null) return left;
    const p = CURVE.p;
    if (left.x === right.x && mod(left.y + right.y, p) === 0) return null;
    const numerator = pointEqual(left, right)
      ? 3 * left.x * left.x + CURVE.a
      : right.y - left.y;
    const denominator = pointEqual(left, right)
      ? 2 * left.y
      : right.x - left.x;
    const inverse = inverseMod(denominator, p);
    if (inverse === null) return null;
    const slope = mod(numerator * inverse, p);
    const x = mod(slope * slope - left.x - right.x, p);
    const y = mod(slope * (left.x - x) - left.y, p);
    return { x, y };
  }

  function scalarMultiply(scalar, point) {
    let result = null;
    let addend = point;
    let k = scalar;
    while (k > 0) {
      if (k & 1) result = pointAdd(result, addend);
      addend = pointAdd(addend, addend);
      k >>= 1;
    }
    return result;
  }

  function pointOrder(point) {
    let result = null;
    for (let order = 1; order <= 100; order += 1) {
      result = pointAdd(result, point);
      if (result === null) return order;
    }
    return 0;
  }

  function renderEcc() {
    const scalar = Number($('ecc-scalar').value);
    const result = scalarMultiply(scalar, BASE);
    const points = curvePoints();
    $('ecc-scalar-value').textContent = String(scalar);
    $('ecc-result').textContent = result ? `(${result.x},${result.y})` : '𝒪';
    $('ecc-order').textContent = String(pointOrder(BASE));

    const padding = 38;
    const step = (540 - padding * 2) / 16;
    const position = (point) => ({
      x: padding + point.x * step,
      y: padding + (16 - point.y) * step
    });
    const grid = Array.from({ length: 17 }, (_, value) => {
      const offset = padding + value * step;
      return `<line x1="${padding}" y1="${offset}" x2="${540 - padding}" y2="${offset}" stroke="#e3eaf1"/><line x1="${offset}" y1="${padding}" x2="${offset}" y2="${540 - padding}" stroke="#e3eaf1"/><text x="${offset}" y="${527}" text-anchor="middle" fill="#526a80" font-size="9">${value}</text><text x="17" y="${padding + (16 - value) * step + 3}" text-anchor="middle" fill="#526a80" font-size="9">${value}</text>`;
    }).join('');
    const nodes = points.map((point) => {
      const pos = position(point);
      const isBase = pointEqual(point, BASE);
      const isResult = result && pointEqual(point, result);
      const fill = isResult ? '#ffc766' : isBase ? '#b394ff' : '#63d5ff';
      const radius = isResult || isBase ? 7 : 4.5;
      return `<circle cx="${pos.x}" cy="${pos.y}" r="${radius}" fill="${fill}" stroke="#17324a" stroke-width="1.2"><title>(${point.x},${point.y})${isBase ? ' = P' : ''}${isResult ? ` = ${scalar}P` : ''}</title></circle>`;
    }).join('');
    $('ecc-plot').innerHTML = `${grid}${nodes}<text x="270" y="24" text-anchor="middle" fill="#17324a" font-size="14" font-weight="800">y² = x³ + 2x + 2 mod 17</text>`;
  }

  function randomInt(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const value = new Uint32Array(1);
    do crypto.getRandomValues(value); while (value[0] >= limit);
    return value[0] % max;
  }

  function modularDistance(value, modulus) {
    const residue = mod(value, modulus);
    return Math.min(residue, modulus - residue);
  }

  function generateLwe() {
    const q = 17;
    const secret = [3, 5];
    const count = Module02.clamp(Math.round(Number($('lwe-samples').value) || 8), 3, 20);
    $('lwe-samples').value = String(count);
    const noisy = $('lwe-noise').value === 'on';
    const samples = Array.from({ length: count }, () => {
      const a = [1 + randomInt(q - 1), 1 + randomInt(q - 1)];
      const error = noisy ? randomInt(3) - 1 : 0;
      const b = mod(a[0] * secret[0] + a[1] * secret[1] + error, q);
      return { a, error, b };
    });
    const exact = [];
    let best = null;
    for (let s1 = 0; s1 < q; s1 += 1) {
      for (let s2 = 0; s2 < q; s2 += 1) {
        const residuals = samples.map((sample) => mod(sample.b - sample.a[0] * s1 - sample.a[1] * s2, q));
        if (residuals.every((residual) => residual === 0)) exact.push([s1, s2]);
        const score = residuals.reduce((sum, residual) => sum + modularDistance(residual, q) ** 2, 0);
        if (!best || score < best.score) best = { secret: [s1, s2], score };
      }
    }
    $('lwe-table').innerHTML = samples.map((sample, index) => `<tr><td>${index + 1}</td><td>(${sample.a[0]}, ${sample.a[1]})</td><td>${sample.error}</td><td>${sample.b}</td></tr>`).join('');
    $('lwe-exact-count').textContent = String(exact.length);
    $('lwe-best').textContent = `(${best.secret.join(',')})`;
    $('lwe-score').textContent = String(best.score);
    const recovered = best.secret[0] === secret[0] && best.secret[1] === secret[1];
    $('lwe-recovered').textContent = recovered ? 'Sí' : 'No';
    if (!noisy) {
      $('lwe-status').textContent = exact.length === 1
        ? 'Sin ruido aparece una única solución exacta: el sistema lineal revela el secreto.'
        : `Sin ruido se encontraron ${exact.length} soluciones exactas; generá más ecuaciones para determinar el secreto.`;
      $('lwe-status').className = exact.length === 1 ? 'status bad' : 'status warn';
    } else {
      $('lwe-status').textContent = exact.length
        ? `El ruido produjo todavía ${exact.length} solución(es) exacta(s) por azar; generá otra muestra.`
        : `Con ruido no existe una solución que satisfaga exactamente todas las ecuaciones. El mejor ajuste ${recovered ? 'recuperó' : 'no recuperó'} el secreto en este juguete.`;
      $('lwe-status').className = 'status good';
    }
  }

  $('calculate-field').addEventListener('click', renderField);
  ['field-a', 'field-b'].forEach((id) => $(id).addEventListener('input', renderField));
  $('group-prime').addEventListener('change', () => {
    const p = Number($('group-prime').value);
    $('group-generator').value = String(smallestGenerator(p));
    $('group-exponent').max = String(p - 2);
    renderGroup();
  });
  $('group-generator').addEventListener('input', renderGroup);
  $('group-exponent').addEventListener('input', renderGroup);
  $('find-generator').addEventListener('click', () => {
    $('group-generator').value = String(smallestGenerator(Number($('group-prime').value)));
    renderGroup();
  });
  $('ecc-scalar').addEventListener('input', renderEcc);
  $('generate-lwe').addEventListener('click', generateLwe);
  $('lwe-noise').addEventListener('change', generateLwe);

  renderField();
  renderGroup();
  renderEcc();
  generateLwe();
})();
