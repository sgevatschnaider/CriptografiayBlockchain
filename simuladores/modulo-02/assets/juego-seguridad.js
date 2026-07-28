(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const encoder = new TextEncoder();
  let current = null;

  function xor(a, b) {
    const output = new Uint8Array(a.length);
    for (let index = 0; index < a.length; index += 1) output[index] = a[index] ^ b[index];
    return output;
  }

  function equal(a, b) {
    return a.length === b.length && a.every((value, index) => value === b[index]);
  }

  function randomBit() {
    return Module02.randomBytes(1)[0] & 1;
  }

  function readMessages() {
    const zero = encoder.encode($('challenge-zero').value);
    const one = encoder.encode($('challenge-one').value);
    if (!zero.length || zero.length !== one.length) return null;
    return [zero, one];
  }

  function makeRound(messages, scenario) {
    const bit = randomBit();
    const oraclePlain = new Uint8Array(messages[0].length);
    const oracleKey = Module02.randomBytes(messages[0].length);
    const challengeKey = scenario === 'reuse' ? oracleKey : Module02.randomBytes(messages[0].length);
    const oracleCipher = xor(oraclePlain, oracleKey);
    const challengeCipher = xor(messages[bit], challengeKey);
    const derived = xor(challengeCipher, oracleCipher);
    return { bit, oracleCipher, challengeCipher, derived, scenario, messages };
  }

  function automaticGuess(round) {
    if (equal(round.derived, round.messages[0])) return 0;
    if (equal(round.derived, round.messages[1])) return 1;
    return randomBit();
  }

  function renderRound() {
    const messages = readMessages();
    if (!messages) {
      current = null;
      $('game-status').textContent = 'M₀ y M₁ deben ser no vacíos y tener la misma longitud en bytes UTF-8.';
      $('game-status').className = 'status bad';
      return;
    }
    current = makeRound(messages, $('security-scenario').value);
    $('oracle-output').textContent = Module02.toHex(current.oracleCipher);
    $('challenge-output').textContent = Module02.toHex(current.challengeCipher);
    $('derived-output').textContent = `${Module02.toHex(current.derived)}\ntexto UTF-8 aproximado: ${new TextDecoder().decode(current.derived).replace(/[^\x20-\x7e]/g, '·')}`;
    $('manual-result').textContent = 'Elegí';
    $('secret-bit').textContent = '?';
    document.querySelectorAll('.guess-button').forEach((button) => {
      button.disabled = false;
      button.classList.remove('warn');
    });
    if (current.scenario === 'reuse') {
      $('game-status').textContent = 'El oráculo y el desafío reutilizan keystream. Compará el valor derivado con M₀ y M₁.';
      $('game-status').className = 'status warn';
    } else {
      $('game-status').textContent = 'Cada cifrado usa aleatorización independiente. El valor derivado no identifica el mensaje.';
      $('game-status').className = 'status good';
    }
  }

  function submitGuess(guess) {
    if (!current) return;
    const correct = guess === current.bit;
    $('manual-result').textContent = correct ? 'Acierto' : 'Error';
    $('secret-bit').textContent = `b=${current.bit}`;
    $('game-status').textContent = correct
      ? `Acertaste: el desafiante cifró M${current.bit}.`
      : `No acertaste: el desafiante cifró M${current.bit}.`;
    $('game-status').className = correct ? 'status good' : 'status bad';
    document.querySelectorAll('.guess-button').forEach((button) => {
      button.disabled = true;
    });
  }

  function runAutomatic() {
    const messages = readMessages();
    if (!messages) {
      renderRound();
      return;
    }
    const rounds = Module02.clamp(Math.round(Number($('auto-rounds').value) || 200), 10, 2000);
    $('auto-rounds').value = String(rounds);
    const scenario = $('security-scenario').value;
    let correct = 0;
    for (let index = 0; index < rounds; index += 1) {
      const round = makeRound(messages, scenario);
      correct += automaticGuess(round) === round.bit ? 1 : 0;
    }
    const rate = correct / rounds;
    const advantage = Math.abs(rate - 0.5);
    $('auto-correct').textContent = `${correct}/${rounds}`;
    $('auto-rate').textContent = `${(rate * 100).toFixed(1)}%`;
    $('auto-advantage').textContent = advantage.toFixed(3);
    $('auto-verdict').textContent = advantage > 0.25 ? 'Distinguible' : 'Cerca del azar';
    $('success-bar').style.width = `${rate * 100}%`;
    $('game-status').textContent = scenario === 'reuse'
      ? 'La reutilización permite al adversario recuperar el mensaje desafío y alcanzar éxito total.'
      : 'Con aleatorización independiente, esta estrategia no obtiene una ventaja sistemática.';
    $('game-status').className = scenario === 'reuse' ? 'status bad' : 'status good';
  }

  $('new-challenge').addEventListener('click', renderRound);
  $('run-auto').addEventListener('click', runAutomatic);
  $('security-scenario').addEventListener('change', () => {
    renderRound();
    runAutomatic();
  });
  document.querySelectorAll('.guess-button').forEach((button) => {
    button.addEventListener('click', () => submitGuess(Number(button.dataset.guess)));
  });

  renderRound();
  runAutomatic();
})();
