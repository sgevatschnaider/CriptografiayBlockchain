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

  function renderMatrix(root, state, comparison = null) {
    root.innerHTML = [...state].map((value, index) => {
      const changed = comparison && value !== comparison[index];
      const bits = comparison ? Module02.popcount(value ^ comparison[index]) : 0;
      return `<span class="state-byte ${changed ? 'changed' : ''}" title="byte ${index}: ${bits} bit(s) diferentes">${value.toString(16).padStart(2, '0')}</span>`;
    }).join('');
  }

  function render() {
    const source = blockFromText($('spn-message').value);
    const key = keyFromText($('spn-key').value);
    const bitIndex = Number($('flip-bit').value);
    const rounds = Number($('round-count').value);
    const mode = $('layer-mode').value;
    const modified = source.block.slice();
    modified[Math.floor(bitIndex / 8)] ^= 1 << (7 - (bitIndex % 8));
    const originalRounds = transform(source.block, key, rounds, mode);
    const modifiedRounds = transform(modified, key, rounds, mode);
    const original = originalRounds.at(-1);
    const flipped = modifiedRounds.at(-1);
    const distance = Module02.hammingBytes(original, flipped);
    const percent = distance / 128 * 100;
    const changedBytes = original.reduce((sum, value, index) => sum + (value !== flipped[index] ? 1 : 0), 0);

    $('flip-bit-value').textContent = String(bitIndex);
    $('round-count-value').textContent = String(rounds);
    $('input-bytes').textContent = `M: ${Module02.toHex(source.block)}\nM′: ${Module02.toHex(modified)}\nK*: ${Module02.toHex(key)}`;
    $('hamming-distance').textContent = `${distance}/128`;
    $('avalanche-percent').textContent = `${percent.toFixed(1)}%`;
    $('changed-bytes').textContent = `${changedBytes}/16`;
    $('distance-to-half').textContent = `${Math.abs(50 - percent).toFixed(1)} pp`;
    $('hex-original').textContent = Module02.toHex(original);
    $('hex-flipped').textContent = Module02.toHex(flipped);
    renderMatrix($('state-original'), original);
    renderMatrix($('state-flipped'), flipped, original);
    $('round-bars').innerHTML = originalRounds.map((state, index) => {
      const d = Module02.hammingBytes(state, modifiedRounds[index]);
      const pct = d / 128 * 100;
      return `<div class="round-row"><strong>Ronda ${index + 1}</strong><span class="round-track"><span style="width:${pct}%"></span></span><span>${d} · ${pct.toFixed(1)}%</span></div>`;
    }).join('');

    const lengthMessage = source.originalLength > 16
      ? 'El mensaje se truncó a 16 bytes.'
      : source.originalLength < 16
        ? 'El bloque se completó con bytes 00.'
        : 'El mensaje ocupa exactamente 16 bytes.';
    if (mode === 'full' && percent >= 35 && percent <= 65) {
      $('spn-status').textContent = `${lengthMessage} La red completa quedó cerca del objetivo visual de 50%, sin que eso pruebe seguridad.`;
      $('spn-status').className = 'status good';
    } else {
      $('spn-status').textContent = `${lengthMessage} Con estas capas, el cambio alcanzó ${percent.toFixed(1)}% de los bits.`;
      $('spn-status').className = 'status warn';
    }
  }

  ['spn-message', 'spn-key'].forEach((id) => $(id).addEventListener('input', render));
  ['flip-bit', 'round-count'].forEach((id) => $(id).addEventListener('input', render));
  $('layer-mode').addEventListener('change', render);
  render();
})();
