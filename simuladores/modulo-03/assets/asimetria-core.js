(() => {
  'use strict';

  function mod(value, modulus) {
    return ((value % modulus) + modulus) % modulus;
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) [x, y] = [y, x % y];
    return x;
  }

  function extendedGcd(a, b) {
    if (b === 0) return { gcd: Math.abs(a), x: a < 0 ? -1 : 1, y: 0 };
    const next = extendedGcd(b, a % b);
    return { gcd: next.gcd, x: next.y, y: next.x - Math.trunc(a / b) * next.y };
  }

  function modInverse(value, modulus) {
    const result = extendedGcd(mod(value, modulus), modulus);
    if (result.gcd !== 1) throw new Error('El inverso modular no existe.');
    return mod(result.x, modulus);
  }

  function modPow(base, exponent, modulus) {
    if (!Number.isSafeInteger(base) || !Number.isSafeInteger(exponent) || !Number.isSafeInteger(modulus)) {
      throw new Error('Los parámetros deben ser enteros seguros.');
    }
    if (exponent < 0 || modulus <= 1) throw new Error('Exponente o módulo inválido.');
    let b = BigInt(mod(base, modulus));
    let e = BigInt(exponent);
    const m = BigInt(modulus);
    let result = 1n;
    while (e > 0n) {
      if (e & 1n) result = (result * b) % m;
      b = (b * b) % m;
      e >>= 1n;
    }
    return Number(result);
  }

  function isPrime(value) {
    if (!Number.isInteger(value) || value < 2) return false;
    if (value % 2 === 0) return value === 2;
    for (let divisor = 3; divisor * divisor <= value; divisor += 2) {
      if (value % divisor === 0) return false;
    }
    return true;
  }

  function rsaKeyFromPrimes(p, q, e) {
    if (!isPrime(p) || !isPrime(q) || p === q) throw new Error('p y q deben ser primos distintos.');
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    if (gcd(e, phi) !== 1) throw new Error('e debe ser coprimo con phi(n).');
    return { p, q, n, phi, e, d: modInverse(e, phi) };
  }

  function rsaTrace(p, q, e, message) {
    const key = rsaKeyFromPrimes(p, q, e);
    if (!Number.isInteger(message) || message < 0 || message >= key.n) {
      throw new Error('El mensaje entero debe cumplir 0 <= m < n.');
    }
    const ciphertext = modPow(message, key.e, key.n);
    const recovered = modPow(ciphertext, key.d, key.n);
    return { ...key, message, ciphertext, recovered };
  }

  function isOnCurve(point, a, b, prime) {
    if (point === null) return true;
    return mod(point.y * point.y - (point.x ** 3 + a * point.x + b), prime) === 0;
  }

  function ecAdd(first, second, a, b, prime) {
    if (first === null) return second === null ? null : { ...second };
    if (second === null) return { ...first };
    if (!isOnCurve(first, a, b, prime) || !isOnCurve(second, a, b, prime)) {
      throw new Error('El punto no pertenece a la curva.');
    }
    if (first.x === second.x && mod(first.y + second.y, prime) === 0) return null;
    const numerator = first.x === second.x && first.y === second.y
      ? 3 * first.x * first.x + a
      : second.y - first.y;
    const denominator = first.x === second.x && first.y === second.y
      ? 2 * first.y
      : second.x - first.x;
    const slope = mod(numerator * modInverse(denominator, prime), prime);
    const x = mod(slope * slope - first.x - second.x, prime);
    const y = mod(slope * (first.x - x) - first.y, prime);
    const result = { x, y };
    if (!isOnCurve(result, a, b, prime)) throw new Error('La suma produjo un punto inválido.');
    return result;
  }

  function ecMultiply(scalar, point, a, b, prime) {
    if (!Number.isInteger(scalar) || scalar < 0) throw new Error('El escalar debe ser un entero no negativo.');
    let result = null;
    let addend = point;
    let value = scalar;
    const trace = [];
    while (value > 0) {
      trace.push({ bit: value & 1, result: result && { ...result }, addend: addend && { ...addend } });
      if (value & 1) result = ecAdd(result, addend, a, b, prime);
      addend = ecAdd(addend, addend, a, b, prime);
      value >>= 1;
    }
    return { point: result, trace };
  }

  function enumerateCurve(a, b, prime) {
    const points = [];
    for (let x = 0; x < prime; x += 1) {
      for (let y = 0; y < prime; y += 1) {
        const point = { x, y };
        if (isOnCurve(point, a, b, prime)) points.push(point);
      }
    }
    return points;
  }

  window.AsymmetryCore = Object.freeze({
    mod,
    gcd,
    modInverse,
    modPow,
    isPrime,
    rsaKeyFromPrimes,
    rsaTrace,
    isOnCurve,
    ecAdd,
    ecMultiply,
    enumerateCurve,
  });
})();
