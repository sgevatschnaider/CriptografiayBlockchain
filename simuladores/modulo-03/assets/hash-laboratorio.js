(() => {
  "use strict";

  const MASK_64 = (1n << 64n) - 1n;
  const SHA256_INITIAL = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];
  const SHA256_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const KECCAK_ROUND_CONSTANTS = [
    0x0000000000000001n,
    0x0000000000008082n,
    0x800000000000808an,
    0x8000000080008000n,
    0x000000000000808bn,
    0x0000000080000001n,
    0x8000000080008081n,
    0x8000000000008009n,
    0x000000000000008an,
    0x0000000000000088n,
    0x0000000080008009n,
    0x000000008000000an,
    0x000000008000808bn,
    0x800000000000008bn,
    0x8000000000008089n,
    0x8000000000008003n,
    0x8000000000008002n,
    0x8000000000000080n,
    0x000000000000800an,
    0x800000008000000an,
    0x8000000080008081n,
    0x8000000000008080n,
    0x0000000080000001n,
    0x8000000080008008n,
  ];
  const KECCAK_ROTATION = [
    0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8,
    18, 2, 61, 56, 14,
  ];

  const textEncoder = new TextEncoder();

  function toBytes(value) {
    if (ArrayBuffer.isView(value)) {
      return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    }
    if (Object.prototype.toString.call(value) === "[object ArrayBuffer]") {
      return new Uint8Array(value);
    }
    return textEncoder.encode(String(value));
  }

  function concatBytes(...arrays) {
    const total = arrays.reduce((sum, array) => sum + array.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    arrays.forEach((array) => {
      result.set(array, offset);
      offset += array.length;
    });
    return result;
  }

  function hex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  function rotr32(value, shift) {
    return ((value >>> shift) | (value << (32 - shift))) >>> 0;
  }

  function padSha256(input) {
    const bytes = toBytes(input);
    const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLength);
    padded.set(bytes);
    padded[bytes.length] = 0x80;
    let bitLength = BigInt(bytes.length) * 8n;
    for (let index = 0; index < 8; index += 1) {
      padded[padded.length - 1 - index] = Number(bitLength & 0xffn);
      bitLength >>= 8n;
    }
    return padded;
  }

  function sha256Trace(input) {
    const bytes = toBytes(input);
    const padded = padSha256(bytes);
    const hashState = SHA256_INITIAL.slice();
    const blocks = [];

    for (let offset = 0; offset < padded.length; offset += 64) {
      const schedule = new Uint32Array(64);
      for (let index = 0; index < 16; index += 1) {
        const cursor = offset + index * 4;
        schedule[index] =
          ((padded[cursor] << 24) |
            (padded[cursor + 1] << 16) |
            (padded[cursor + 2] << 8) |
            padded[cursor + 3]) >>>
          0;
      }
      for (let index = 16; index < 64; index += 1) {
        const x = schedule[index - 15];
        const y = schedule[index - 2];
        const sigma0 = rotr32(x, 7) ^ rotr32(x, 18) ^ (x >>> 3);
        const sigma1 = rotr32(y, 17) ^ rotr32(y, 19) ^ (y >>> 10);
        schedule[index] =
          (schedule[index - 16] + sigma0 + schedule[index - 7] + sigma1) >>> 0;
      }

      let [a, b, c, d, e, f, g, h] = hashState;
      const startState = hashState.slice();
      const rounds = [];
      for (let round = 0; round < 64; round += 1) {
        const sum1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
        const choice = (e & f) ^ (~e & g);
        const temporary1 =
          (h + sum1 + choice + SHA256_K[round] + schedule[round]) >>> 0;
        const sum0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
        const majority = (a & b) ^ (a & c) ^ (b & c);
        const temporary2 = (sum0 + majority) >>> 0;
        h = g;
        g = f;
        f = e;
        e = (d + temporary1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temporary1 + temporary2) >>> 0;
        rounds.push({ a, b, c, d, e, f, g, h, w: schedule[round] });
      }

      const working = [a, b, c, d, e, f, g, h];
      for (let index = 0; index < 8; index += 1) {
        hashState[index] = (hashState[index] + working[index]) >>> 0;
      }
      blocks.push({
        bytes: padded.slice(offset, offset + 64),
        schedule: Array.from(schedule),
        startState,
        rounds,
        endState: hashState.slice(),
      });
    }

    const digest = new Uint8Array(32);
    hashState.forEach((word, wordIndex) => {
      digest[wordIndex * 4] = word >>> 24;
      digest[wordIndex * 4 + 1] = word >>> 16;
      digest[wordIndex * 4 + 2] = word >>> 8;
      digest[wordIndex * 4 + 3] = word;
    });
    return { bytes, padded, blocks, digest };
  }

  function sha256Digest(input) {
    const padded = padSha256(input);
    const hashState = SHA256_INITIAL.slice();
    for (let offset = 0; offset < padded.length; offset += 64) {
      const schedule = new Uint32Array(64);
      for (let index = 0; index < 16; index += 1) {
        const cursor = offset + index * 4;
        schedule[index] =
          ((padded[cursor] << 24) |
            (padded[cursor + 1] << 16) |
            (padded[cursor + 2] << 8) |
            padded[cursor + 3]) >>>
          0;
      }
      for (let index = 16; index < 64; index += 1) {
        const x = schedule[index - 15];
        const y = schedule[index - 2];
        schedule[index] =
          (schedule[index - 16] +
            (rotr32(x, 7) ^ rotr32(x, 18) ^ (x >>> 3)) +
            schedule[index - 7] +
            (rotr32(y, 17) ^ rotr32(y, 19) ^ (y >>> 10))) >>>
          0;
      }
      let [a, b, c, d, e, f, g, h] = hashState;
      for (let round = 0; round < 64; round += 1) {
        const temporary1 =
          (h +
            (rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25)) +
            ((e & f) ^ (~e & g)) +
            SHA256_K[round] +
            schedule[round]) >>>
          0;
        const temporary2 =
          ((rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22)) +
            ((a & b) ^ (a & c) ^ (b & c))) >>>
          0;
        h = g;
        g = f;
        f = e;
        e = (d + temporary1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temporary1 + temporary2) >>> 0;
      }
      [a, b, c, d, e, f, g, h].forEach((word, index) => {
        hashState[index] = (hashState[index] + word) >>> 0;
      });
    }
    const result = new Uint8Array(32);
    hashState.forEach((word, index) => {
      result[index * 4] = word >>> 24;
      result[index * 4 + 1] = word >>> 16;
      result[index * 4 + 2] = word >>> 8;
      result[index * 4 + 3] = word;
    });
    return result;
  }

  function rotl64(value, shift) {
    const amount = BigInt(shift);
    if (amount === 0n) return value & MASK_64;
    return ((value << amount) | (value >> (64n - amount))) & MASK_64;
  }

  function keccakPermutation(state, captureRounds = false) {
    const trace = [];
    for (let round = 0; round < 24; round += 1) {
      const columns = new Array(5).fill(0n);
      const delta = new Array(5).fill(0n);
      for (let x = 0; x < 5; x += 1) {
        columns[x] =
          state[x] ^
          state[x + 5] ^
          state[x + 10] ^
          state[x + 15] ^
          state[x + 20];
      }
      for (let x = 0; x < 5; x += 1) {
        delta[x] = columns[(x + 4) % 5] ^ rotl64(columns[(x + 1) % 5], 1);
      }
      for (let y = 0; y < 5; y += 1) {
        for (let x = 0; x < 5; x += 1) state[x + 5 * y] ^= delta[x];
      }

      const mixed = new Array(25).fill(0n);
      for (let y = 0; y < 5; y += 1) {
        for (let x = 0; x < 5; x += 1) {
          mixed[y + 5 * ((2 * x + 3 * y) % 5)] = rotl64(
            state[x + 5 * y],
            KECCAK_ROTATION[x + 5 * y],
          );
        }
      }
      for (let y = 0; y < 5; y += 1) {
        for (let x = 0; x < 5; x += 1) {
          state[x + 5 * y] =
            (mixed[x + 5 * y] ^
              (~mixed[((x + 1) % 5) + 5 * y] & mixed[((x + 2) % 5) + 5 * y])) &
            MASK_64;
        }
      }
      state[0] = (state[0] ^ KECCAK_ROUND_CONSTANTS[round]) & MASK_64;
      if (captureRounds) trace.push(state.slice());
    }
    return trace;
  }

  function padSha3(input, rateBytes = 136) {
    const bytes = toBytes(input);
    const paddedLength = Math.ceil((bytes.length + 1) / rateBytes) * rateBytes;
    const padded = new Uint8Array(paddedLength);
    padded.set(bytes);
    padded[bytes.length] ^= 0x06;
    padded[padded.length - 1] ^= 0x80;
    return padded;
  }

  function sha3_256(input) {
    const bytes = toBytes(input);
    const rateBytes = 136;
    const padded = padSha3(bytes, rateBytes);
    const state = new Array(25).fill(0n);
    let firstRoundTrace = [];

    for (let offset = 0; offset < padded.length; offset += rateBytes) {
      for (let lane = 0; lane < rateBytes / 8; lane += 1) {
        let value = 0n;
        for (let byteIndex = 0; byteIndex < 8; byteIndex += 1) {
          value |=
            BigInt(padded[offset + lane * 8 + byteIndex]) <<
            BigInt(byteIndex * 8);
        }
        state[lane] = (state[lane] ^ value) & MASK_64;
      }
      const trace = keccakPermutation(state, offset === 0);
      if (offset === 0) firstRoundTrace = trace;
    }

    const digest = new Uint8Array(32);
    for (let index = 0; index < digest.length; index += 1) {
      const lane = state[Math.floor(index / 8)];
      digest[index] = Number((lane >> BigInt((index % 8) * 8)) & 0xffn);
    }
    return {
      bytes,
      padded,
      rateBytes,
      blocks: padded.length / rateBytes,
      digest,
      rounds: firstRoundTrace,
      finalState: state.slice(),
    };
  }

  function hammingDistance(left, right) {
    const limit = Math.min(left.length, right.length);
    let distance = Math.abs(left.length - right.length) * 8;
    for (let index = 0; index < limit; index += 1) {
      let value = left[index] ^ right[index];
      while (value) {
        distance += value & 1;
        value >>>= 1;
      }
    }
    return distance;
  }

  const api = {
    hex,
    hammingDistance,
    padSha256,
    sha256Digest,
    sha256Trace,
    padSha3,
    sha3_256,
  };
  globalThis.HashLabCrypto = api;

  if (typeof document === "undefined") return;

  const byId = (id) => document.getElementById(id);
  const labState = {
    completed: new Set(),
    sha2Trace: null,
    sha2Block: 0,
    sha3Trace: null,
    fileBytes: null,
    fileDigest: null,
    merkleTree: null,
  };

  function requireCrypto() {
    if (!globalThis.crypto?.subtle || !globalThis.isSecureContext) {
      throw new Error("Web Crypto requiere HTTPS o localhost.");
    }
  }

  function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  async function digest(algorithm, input) {
    const bytes = toBytes(input);
    if (algorithm === "SHA3-256") return sha3_256(bytes).digest;
    requireCrypto();
    return new Uint8Array(await crypto.subtle.digest(algorithm, bytes));
  }

  function setStatus(id, message, kind = "") {
    const element = byId(id);
    if (!element) return;
    element.textContent = message;
    if (kind) element.dataset.kind = kind;
    else delete element.dataset.kind;
  }

  function formatBytes(value) {
    if (value < 1024) return `${value.toLocaleString("es-AR")} bytes`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`;
    return `${(value / (1024 * 1024)).toFixed(2)} MiB`;
  }

  function formatMilliseconds(value) {
    if (value < 1) return `${(value * 1000).toFixed(1)} µs`;
    if (value < 1000) return `${value.toFixed(2)} ms`;
    return `${(value / 1000).toFixed(2)} s`;
  }

  function wordHex(value) {
    return (value >>> 0).toString(16).padStart(8, "0");
  }

  function laneHex(value) {
    return value.toString(16).padStart(16, "0");
  }

  function markComplete(number) {
    labState.completed.add(number);
    try {
      localStorage.setItem(
        "cripto-hash-lab-progress",
        JSON.stringify([...labState.completed]),
      );
    } catch {
      // El progreso es opcional; la simulación sigue funcionando sin almacenamiento.
    }
    const count = labState.completed.size;
    byId("hash-progress-label").textContent =
      `${count} de 8 estaciones exploradas`;
    byId("hash-progress-bar").style.width = `${(count / 8) * 100}%`;
    byId("hash-progress-track").setAttribute("aria-valuenow", String(count));
    document.querySelectorAll("[data-hash-station]").forEach((button) => {
      button.classList.toggle(
        "is-complete",
        labState.completed.has(Number(button.dataset.hashStation)),
      );
    });
  }

  function restoreProgress() {
    try {
      const saved = JSON.parse(
        localStorage.getItem("cripto-hash-lab-progress") || "[]",
      );
      saved
        .filter(
          (number) => Number.isInteger(number) && number >= 1 && number <= 8,
        )
        .forEach((number) => labState.completed.add(number));
    } catch {
      labState.completed.clear();
    }
    const count = labState.completed.size;
    byId("hash-progress-label").textContent =
      `${count} de 8 estaciones exploradas`;
    byId("hash-progress-bar").style.width = `${(count / 8) * 100}%`;
    byId("hash-progress-track").setAttribute("aria-valuenow", String(count));
    document.querySelectorAll("[data-hash-station]").forEach((button) => {
      button.classList.toggle(
        "is-complete",
        labState.completed.has(Number(button.dataset.hashStation)),
      );
    });
  }

  function updateStationUrl(number) {
    const url = new URL(globalThis.location.href);
    url.searchParams.set("station", String(number));
    url.hash = `hash-station-${number}`;
    globalThis.history.replaceState(null, "", url);
  }

  function stationFromUrl() {
    const hashMatch = globalThis.location.hash.match(
      /^#hash-station-([1-8])$/,
    );
    if (hashMatch) return Number(hashMatch[1]);
    const queryStation = Number(
      new URLSearchParams(globalThis.location.search).get("station"),
    );
    return queryStation >= 1 && queryStation <= 8 ? queryStation : 1;
  }

  function showStation(number, focusPanel = false, syncUrl = false) {
    if (!Number.isInteger(number) || number < 1 || number > 8) number = 1;
    document.querySelectorAll("[data-hash-panel]").forEach((panel) => {
      panel.hidden = Number(panel.dataset.hashPanel) !== number;
    });
    document.querySelectorAll("[data-hash-station]").forEach((button) => {
      const selected = Number(button.dataset.hashStation) === number;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    if (syncUrl) updateStationUrl(number);
    if (focusPanel)
      byId(`hash-station-${number}`).scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  async function runDigestStation(mark = true) {
    try {
      const message = byId("hash-input").value.normalize("NFC");
      const algorithm = byId("hash-digest-algorithm").value;
      const bytes = toBytes(message);
      const result = await digest(algorithm, bytes);
      const visible = Array.from(
        bytes.slice(0, 72),
        (byte) => `<span>${byte.toString(16).padStart(2, "0")}</span>`,
      ).join("");
      byId("hash-byte-stream").innerHTML =
        visible +
        (bytes.length > 72 ? `<span>+${bytes.length - 72}</span>` : "");
      byId("hash-input-size").textContent =
        `${bytes.length} bytes · ${bytes.length * 8} bits`;
      byId("hash-output-size").textContent =
        `${result.length} bytes · ${result.length * 8} bits`;
      byId("hash-digest-output").textContent = hex(result);
      setStatus(
        "hash-digest-status",
        `${algorithm} es determinista: estos mismos bytes volverán a producir el mismo digest de ${result.length * 8} bits.`,
        "good",
      );
      if (mark) markComplete(1);
    } catch (error) {
      setStatus("hash-digest-status", error.message, "bad");
    }
  }

  function flipBit(bytes, bitIndex) {
    const copy = bytes.slice();
    const byteIndex = Math.floor(bitIndex / 8);
    copy[byteIndex] ^= 1 << (7 - (bitIndex % 8));
    return copy;
  }

  function updateAvalancheRange() {
    const bits = Math.max(
      1,
      toBytes(byId("avalanche-message").value).length * 8,
    );
    byId("avalanche-bit").max = String(bits - 1);
    if (Number(byId("avalanche-bit").value) >= bits)
      byId("avalanche-bit").value = String(bits - 1);
    byId("avalanche-bit-label").textContent = byId("avalanche-bit").value;
  }

  function renderBitDifference(left, right) {
    const container = byId("avalanche-bit-diff");
    const items = [];
    for (let byteIndex = 0; byteIndex < left.length; byteIndex += 1) {
      const different = left[byteIndex] ^ right[byteIndex];
      for (let bit = 7; bit >= 0; bit -= 1) {
        items.push(
          `<i class="${different & (1 << bit) ? "changed" : ""}" aria-hidden="true"></i>`,
        );
      }
    }
    container.innerHTML = items.join("");
  }

  async function runAvalancheOne(mark = true) {
    try {
      const bytes = toBytes(byId("avalanche-message").value.normalize("NFC"));
      if (!bytes.length) throw new Error("Ingresá al menos un carácter.");
      updateAvalancheRange();
      const bitIndex = Number(byId("avalanche-bit").value);
      const changed = flipBit(bytes, bitIndex);
      const [originalDigest, changedDigest] = await Promise.all([
        digest("SHA-256", bytes),
        digest("SHA-256", changed),
      ]);
      const distance = hammingDistance(originalDigest, changedDigest);
      const ratio = distance / 256;
      byId("avalanche-distance").textContent = `${distance} / 256 bits`;
      byId("avalanche-ratio").textContent = `${(ratio * 100).toFixed(1)} %`;
      byId("avalanche-meter").style.width = `${ratio * 100}%`;
      byId("avalanche-meter-track").setAttribute(
        "aria-valuenow",
        (ratio * 100).toFixed(1),
      );
      renderBitDifference(originalDigest, changedDigest);
      setStatus(
        "avalanche-status",
        `Se invirtió exactamente el bit ${bitIndex} de la entrada. El digest cambió en ${distance} posiciones; una observación aislada no establece una garantía de seguridad.`,
        "good",
      );
      if (mark) markComplete(2);
    } catch (error) {
      setStatus("avalanche-status", error.message, "bad");
    }
  }

  async function runAvalancheSeries() {
    try {
      const bytes = toBytes(byId("avalanche-message").value.normalize("NFC"));
      if (!bytes.length) throw new Error("Ingresá al menos un carácter.");
      const base = await digest("SHA-256", bytes);
      const bitCount = bytes.length * 8;
      const positions = Array.from(
        { length: 32 },
        (_, index) => Math.floor((index * bitCount) / 32) % bitCount,
      );
      const changedDigests = await Promise.all(
        positions.map((position) =>
          digest("SHA-256", flipBit(bytes, position)),
        ),
      );
      const distances = changedDigests.map((candidate) =>
        hammingDistance(base, candidate),
      );
      const average =
        distances.reduce((sum, value) => sum + value, 0) / distances.length;
      byId("avalanche-average").textContent =
        `${average.toFixed(1)} / 256 · ${(average / 2.56).toFixed(1)} %`;
      byId("avalanche-histogram").innerHTML = distances
        .map(
          (distance, index) =>
            `<i style="height:${Math.min(100, (distance / 256) * 200).toFixed(1)}%" title="Ensayo ${index + 1}: ${distance} bits" aria-label="Ensayo ${index + 1}: ${distance} bits"></i>`,
        )
        .join("");
      const minimum = Math.min(...distances);
      const maximum = Math.max(...distances);
      setStatus(
        "avalanche-status",
        `En 32 inversiones de un bit, la media fue ${average.toFixed(1)} bits y el rango ${minimum}–${maximum}. Esto caracteriza difusión; no sustituye los ensayos de preimagen o colisión.`,
        "good",
      );
      markComplete(2);
    } catch (error) {
      setStatus("avalanche-status", error.message, "bad");
    }
  }

  function prefixValue(bytes, bits) {
    let value = 0;
    const byteCount = Math.ceil(bits / 8);
    for (let index = 0; index < byteCount; index += 1)
      value = (value << 8) | bytes[index];
    return value >>> (byteCount * 8 - bits);
  }

  function prefixHex(value, bits) {
    return value.toString(16).padStart(Math.ceil(bits / 4), "0");
  }

  function yieldToBrowser() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function updateResistanceProgress(percent) {
    const bounded = Math.max(0, Math.min(100, percent));
    byId("resistance-progress").style.width = `${bounded}%`;
    byId("resistance-progress-track").setAttribute(
      "aria-valuenow",
      bounded.toFixed(0),
    );
  }

  async function runResistanceSearch() {
    const button = byId("resistance-run");
    try {
      const mode = byId("resistance-mode").value;
      const bits = Number(byId("resistance-bits").value);
      const expected =
        mode === "collision" ? Math.pow(2, bits / 2) : Math.pow(2, bits);
      const expectedLabel =
        mode === "collision"
          ? `≈ 2^(${bits}/2) = ${Math.round(expected).toLocaleString("es-AR")}`
          : `≈ 2^${bits} = ${Math.round(expected).toLocaleString("es-AR")}`;
      byId("resistance-expected").textContent = expectedLabel;
      byId("resistance-result").textContent = "Buscando…";
      byId("resistance-attempts").textContent = "0";
      updateResistanceProgress(2);
      button.disabled = true;
      let attempts = 0;
      let result = "";
      let target = null;

      if (mode === "preimage") {
        target = prefixValue(sha256Digest(randomBytes(16)), bits);
        byId("resistance-target").textContent = prefixHex(target, bits);
        while (!result && attempts < 2_000_000) {
          attempts += 1;
          const candidate = `candidato:${attempts}`;
          if (prefixValue(sha256Digest(candidate), bits) === target)
            result = candidate;
          if (attempts % 512 === 0) {
            byId("resistance-attempts").textContent =
              attempts.toLocaleString("es-AR");
            updateResistanceProgress(
              Math.min(96, (attempts / (expected * 4)) * 100),
            );
            await yieldToBrowser();
          }
        }
      } else if (mode === "second") {
        const original = "contrato_original.pdf|monto=1000";
        target = prefixValue(sha256Digest(original), bits);
        byId("resistance-target").textContent =
          `${prefixHex(target, bits)} · ${original}`;
        while (!result && attempts < 2_000_000) {
          attempts += 1;
          const candidate = `contrato_alternativo:${attempts}`;
          if (prefixValue(sha256Digest(candidate), bits) === target)
            result = candidate;
          if (attempts % 512 === 0) {
            byId("resistance-attempts").textContent =
              attempts.toLocaleString("es-AR");
            updateResistanceProgress(
              Math.min(96, (attempts / (expected * 4)) * 100),
            );
            await yieldToBrowser();
          }
        }
      } else {
        const seen = new Map();
        byId("resistance-target").textContent = "cualquier prefijo repetido";
        while (!result && attempts < 2_000_000) {
          const candidate = `mensaje:${attempts}`;
          const prefix = prefixValue(sha256Digest(candidate), bits);
          if (seen.has(prefix)) {
            target = prefix;
            result = `${seen.get(prefix)} ↔ ${candidate}`;
          } else {
            seen.set(prefix, candidate);
          }
          attempts += 1;
          if (attempts % 256 === 0) {
            byId("resistance-attempts").textContent =
              attempts.toLocaleString("es-AR");
            updateResistanceProgress(
              Math.min(96, (attempts / (expected * 4)) * 100),
            );
            await yieldToBrowser();
          }
        }
        if (target !== null)
          byId("resistance-target").textContent = prefixHex(target, bits);
      }

      if (!result)
        throw new Error(
          "No se encontró coincidencia dentro del límite de seguridad del navegador. Repetí el ensayo.",
        );
      byId("resistance-attempts").textContent =
        attempts.toLocaleString("es-AR");
      byId("resistance-result").textContent = result;
      updateResistanceProgress(100);
      const contrast =
        mode === "collision"
          ? "la colisión aparece cerca de la raíz cuadrada del espacio"
          : "igualar un objetivo exige recorrer el espacio completo en promedio";
      setStatus(
        "resistance-status",
        `Coincidencia sobre ${bits} bits truncados: ${contrast}. Con 256 bits, este experimento deja de ser realizable.`,
        "good",
      );
      markComplete(3);
    } catch (error) {
      setStatus("resistance-status", error.message, "bad");
    } finally {
      button.disabled = false;
    }
  }

  function renderSha2Round() {
    if (!labState.sha2Trace) return;
    const roundIndex = Number(byId("sha2-round").value);
    const block = labState.sha2Trace.blocks[labState.sha2Block];
    const round = block.rounds[roundIndex];
    byId("sha2-round-label").textContent = String(roundIndex);
    byId("sha2-state").innerHTML = ["a", "b", "c", "d", "e", "f", "g", "h"]
      .map(
        (name) =>
          `<div><b>${name}</b><code>${wordHex(round[name])}</code></div>`,
      )
      .join("");
    byId("sha2-schedule-word").textContent =
      `W[${roundIndex}] = ${wordHex(round.w)}`;
  }

  function selectSha2Block(index) {
    labState.sha2Block = index;
    document
      .querySelectorAll("#sha2-blocks button")
      .forEach((button, buttonIndex) =>
        button.classList.toggle("is-selected", buttonIndex === index),
      );
    renderSha2Round();
  }

  async function runSha2Station(mark = true) {
    try {
      const bytes = toBytes(byId("sha2-message").value.normalize("NFC"));
      const trace = sha256Trace(bytes);
      labState.sha2Trace = trace;
      labState.sha2Block = 0;
      const nativeDigest = await digest("SHA-256", bytes);
      const matches = hex(nativeDigest) === hex(trace.digest);
      byId("sha2-original-bits").textContent = `${bytes.length * 8} bits`;
      byId("sha2-padding").textContent =
        `${trace.padded.length - bytes.length} bytes · incluye longitud de 64 bits`;
      byId("sha2-block-count").textContent = String(trace.blocks.length);
      byId("sha2-digest").textContent = hex(trace.digest);
      byId("sha2-blocks").innerHTML = trace.blocks
        .map(
          (block, index) =>
            `<button type="button" class="${index === 0 ? "is-selected" : ""}" data-sha2-block="${index}">B${index + 1}<br>${hex(block.bytes.slice(0, 6))}…</button>`,
        )
        .join("");
      byId("sha2-blocks")
        .querySelectorAll("button")
        .forEach((button) =>
          button.addEventListener("click", () =>
            selectSha2Block(Number(button.dataset.sha2Block)),
          ),
        );
      renderSha2Round();
      setStatus(
        "sha2-status",
        matches
          ? "Trazabilidad superada: el SHA-256 implementado paso a paso coincide bit a bit con Web Crypto."
          : "Error de consistencia: la traza no coincide con Web Crypto.",
        matches ? "good" : "bad",
      );
      if (!matches)
        throw new Error(
          "La implementación SHA-256 no superó la verificación cruzada.",
        );
      if (mark) markComplete(4);
    } catch (error) {
      setStatus("sha2-status", error.message, "bad");
    }
  }

  function popcount64(value) {
    let count = 0;
    let working = value;
    while (working) {
      count += Number(working & 1n);
      working >>= 1n;
    }
    return count;
  }

  function renderSha3Round() {
    if (!labState.sha3Trace) return;
    const roundIndex = Number(byId("sha3-round").value);
    const lanes = labState.sha3Trace.rounds[roundIndex];
    byId("sha3-round-label").textContent = String(roundIndex);
    byId("sha3-state").innerHTML = lanes
      .map((lane, index) => {
        const full = laneHex(lane);
        const x = index % 5;
        const y = Math.floor(index / 5);
        const energy = popcount64(lane) / 64;
        const border = (0.16 + energy * 0.45).toFixed(2);
        const fill = (0.035 + energy * 0.17).toFixed(2);
        return `<div style="--lane-border:${border};--lane-fill:${fill}" title="A[${x},${y}] = ${full}" aria-label="Lane A ${x}, ${y}: ${full}">${full.slice(0, 8)}</div>`;
      })
      .join("");
  }

  async function validateSha3Vectors(updateStatus = true) {
    const vectors = [
      ["", "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"],
      [
        "abc",
        "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532",
      ],
    ];
    const valid = vectors.every(
      ([message, expected]) => hex(sha3_256(message).digest) === expected,
    );
    byId("sha3-vector").textContent = valid ? "2/2 correctos" : "falló";
    if (updateStatus)
      setStatus(
        "sha3-status",
        valid
          ? "Los vectores SHA3-256 para cadena vacía y “abc” coinciden con FIPS 202. La permutación completa aplica θ, ρ, π, χ e ι en cada ronda."
          : "La implementación no coincide con los vectores conocidos y no debe utilizarse.",
        valid ? "good" : "bad",
      );
    return valid;
  }

  async function runSha3Station(mark = true) {
    try {
      const trace = sha3_256(byId("sha3-message").value.normalize("NFC"));
      labState.sha3Trace = trace;
      byId("sha3-digest").textContent = hex(trace.digest);
      byId("sha3-blocks").textContent =
        `${trace.blocks} × ${trace.rateBytes} bytes de tasa`;
      byId("sha3-round").value = "0";
      renderSha3Round();
      const valid = await validateSha3Vectors(false);
      setStatus(
        "sha3-status",
        valid
          ? `SHA3-256 absorbió ${trace.blocks} bloque(s), aplicó 24 rondas por bloque y extrajo 256 bits de la zona de tasa. Vectores conocidos: correctos.`
          : "La implementación no superó los vectores conocidos.",
        valid ? "good" : "bad",
      );
      if (!valid) throw new Error("Falló la autoverificación SHA3-256.");
      if (mark) markComplete(5);
    } catch (error) {
      setStatus("sha3-status", error.message, "bad");
    }
  }

  async function loadSelectedFile() {
    const file = byId("file-input").files[0];
    if (!file) return;
    labState.fileBytes = new Uint8Array(await file.arrayBuffer());
    labState.fileDigest = null;
    byId("file-name").textContent = file.name;
    byId("file-size").textContent = formatBytes(file.size);
    byId("file-digest").textContent = "—";
    setStatus(
      "file-status",
      "Archivo cargado en memoria local. Calculá su SHA-256.",
      "warn",
    );
  }

  function loadDemoFile() {
    labState.fileBytes = toBytes(
      "paquete=criptografia-3\nversion=1.0.0\ncontenido=didactico\n",
    );
    labState.fileDigest = null;
    byId("file-name").textContent = "paquete-curso.txt (didáctico)";
    byId("file-size").textContent = formatBytes(labState.fileBytes.length);
    byId("file-digest").textContent = "—";
    setStatus(
      "file-status",
      "Archivo didáctico preparado. Calculá su huella y decidí de dónde proviene la referencia.",
      "warn",
    );
  }

  async function hashLoadedFile() {
    try {
      if (!labState.fileBytes)
        throw new Error("Seleccioná un archivo o usá el archivo didáctico.");
      labState.fileDigest = await digest("SHA-256", labState.fileBytes);
      byId("file-digest").textContent = hex(labState.fileDigest);
      setStatus(
        "file-status",
        "Huella local calculada. Falta compararla con un valor esperado obtenido de una fuente confiable.",
        "good",
      );
      markComplete(6);
    } catch (error) {
      setStatus("file-status", error.message, "bad");
    }
  }

  function useCurrentFileDigest() {
    if (!labState.fileDigest) {
      setStatus("file-status", "Calculá primero la huella local.", "bad");
      return;
    }
    byId("file-expected").value = hex(labState.fileDigest);
    setStatus(
      "file-status",
      "La referencia ahora coincide, pero su autenticidad depende del canal seleccionado.",
      "warn",
    );
  }

  function compareFileDigest() {
    try {
      if (!labState.fileDigest)
        throw new Error("Calculá primero la huella local.");
      const expected = byId("file-expected").value.trim().toLowerCase();
      if (!/^[0-9a-f]{64}$/.test(expected))
        throw new Error(
          "El hash esperado debe tener exactamente 64 dígitos hexadecimales.",
        );
      const matches = expected === hex(labState.fileDigest);
      const trusted = byId("file-channel").value === "trusted";
      if (!matches) {
        setStatus(
          "file-status",
          "No coinciden: el archivo no es idéntico al que produjo la referencia.",
          "bad",
        );
      } else if (trusted) {
        setStatus(
          "file-status",
          "Coinciden y la referencia llegó por un canal confiable: hay evidencia fuerte de integridad respecto de ese valor.",
          "good",
        );
      } else {
        setStatus(
          "file-status",
          "Coinciden, pero un atacante pudo reemplazar archivo y hash en el mismo canal. La coincidencia no autentica el origen.",
          "warn",
        );
      }
      markComplete(6);
    } catch (error) {
      setStatus("file-status", error.message, "bad");
    }
  }

  function parseHexSalt(value) {
    const normalized = value.trim().toLowerCase();
    if (!/^[0-9a-f]{32}$/.test(normalized))
      throw new Error("La salt debe tener 32 dígitos hexadecimales.");
    return new Uint8Array(
      normalized.match(/../g).map((pair) => Number.parseInt(pair, 16)),
    );
  }

  function newPasswordSalt() {
    byId("password-demo-salt").value = hex(randomBytes(16));
    setStatus(
      "password-demo-status",
      "Salt pública nueva. Con la misma contraseña, el verificador debe cambiar.",
      "warn",
    );
  }

  async function runPasswordComparison() {
    try {
      requireCrypto();
      const password = byId("password-demo").value.normalize("NFC");
      if (!password) throw new Error("Ingresá una contraseña ficticia.");
      const bytes = toBytes(password);
      const salt = parseHexSalt(byId("password-demo-salt").value);
      const iterations = Number(byId("password-demo-cost").value);
      const shaStart = performance.now();
      const fastDigest = await digest("SHA-256", bytes);
      const shaElapsed = performance.now() - shaStart;
      const material = await crypto.subtle.importKey(
        "raw",
        bytes,
        "PBKDF2",
        false,
        ["deriveBits"],
      );
      const kdfStart = performance.now();
      const verifier = new Uint8Array(
        await crypto.subtle.deriveBits(
          { name: "PBKDF2", hash: "SHA-256", salt, iterations },
          material,
          256,
        ),
      );
      const kdfElapsed = performance.now() - kdfStart;
      byId("password-sha-time").textContent = formatMilliseconds(shaElapsed);
      byId("password-kdf-time").textContent = formatMilliseconds(kdfElapsed);
      byId("password-sha-output").textContent = hex(fastDigest);
      byId("password-kdf-output").textContent = hex(verifier);
      byId("password-sha-bar").style.width =
        `${Math.max(2, Math.min(100, (shaElapsed / kdfElapsed) * 100))}%`;
      byId("password-kdf-bar").style.width = "100%";
      const factor = Math.max(1, kdfElapsed / Math.max(shaElapsed, 0.001));
      setStatus(
        "password-demo-status",
        `En este navegador, PBKDF2 fue aproximadamente ${factor.toFixed(0)}× más lento que un SHA-256 directo. Eso encarece cada intento offline; el parámetro debe calibrarse en producción.`,
        "good",
      );
      markComplete(7);
    } catch (error) {
      setStatus("password-demo-status", error.message, "bad");
    }
  }

  async function merkleLeaf(value) {
    return digest(
      "SHA-256",
      concatBytes(new Uint8Array([0]), toBytes(value.normalize("NFC"))),
    );
  }

  async function merkleParent(left, right) {
    return digest("SHA-256", concatBytes(new Uint8Array([1]), left, right));
  }

  async function buildMerkleTree(mark = true) {
    try {
      const transactions = [1, 2, 3, 4].map(
        (index) => byId(`merkle-tx-${index}`).value,
      );
      if (transactions.some((value) => !value))
        throw new Error("Completá las cuatro transacciones.");
      const leaves = await Promise.all(transactions.map(merkleLeaf));
      const [p12, p34] = await Promise.all([
        merkleParent(leaves[0], leaves[1]),
        merkleParent(leaves[2], leaves[3]),
      ]);
      const root = await merkleParent(p12, p34);
      const tree = {
        l1: leaves[0],
        l2: leaves[1],
        l3: leaves[2],
        l4: leaves[3],
        p12,
        p34,
        root,
      };
      const previous = labState.merkleTree;
      Object.entries(tree).forEach(([name, value]) => {
        const node = document.querySelector(`[data-merkle-node="${name}"]`);
        node.querySelector("span").textContent = `${hex(value).slice(0, 12)}…`;
        node.classList.toggle(
          "changed",
          Boolean(previous && hex(previous[name]) !== hex(value)),
        );
      });
      byId("merkle-root").textContent = hex(root);
      const changedNames = previous
        ? Object.keys(tree).filter(
            (name) => hex(previous[name]) !== hex(tree[name]),
          )
        : [];
      labState.merkleTree = tree;
      setStatus(
        "merkle-status",
        previous && changedNames.length
          ? `Cambió el camino ${changedNames.join(" → ")}. Los nodos del otro subárbol permanecieron idénticos.`
          : "Árbol construido: cuatro hojas se resumen en una sola raíz de 256 bits.",
        "good",
      );
      if (mark) markComplete(8);
    } catch (error) {
      setStatus("merkle-status", error.message, "bad");
    }
  }

  function tamperMerkleTransaction() {
    const input = byId("merkle-tx-2");
    input.value = input.value.includes("[alterada]")
      ? input.value.replace(" [alterada]", "")
      : `${input.value} [alterada]`;
    buildMerkleTree();
  }

  function bindEvents() {
    document.querySelectorAll("[data-hash-station]").forEach((button) => {
      button.addEventListener("click", () =>
        showStation(Number(button.dataset.hashStation), true, true),
      );
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        const current = Number(button.dataset.hashStation);
        const next =
          event.key === "ArrowRight"
            ? (current % 8) + 1
            : ((current + 6) % 8) + 1;
        const nextButton = document.querySelector(
          `[data-hash-station="${next}"]`,
        );
        nextButton.focus();
        showStation(next, false, true);
      });
    });
    globalThis.addEventListener("hashchange", () => {
      showStation(stationFromUrl(), true);
    });
    byId("hash-digest-run").addEventListener("click", () => runDigestStation());
    byId("hash-digest-algorithm").addEventListener("change", () =>
      runDigestStation(),
    );
    byId("hash-digest-long").addEventListener("click", () => {
      const current = byId("hash-input").value;
      byId("hash-input").value = `${current.slice(0, 200)}\n`
        .repeat(100)
        .trimEnd();
      runDigestStation();
    });
    byId("avalanche-message").addEventListener("input", updateAvalancheRange);
    byId("avalanche-bit").addEventListener("input", () => {
      byId("avalanche-bit-label").textContent = byId("avalanche-bit").value;
    });
    byId("avalanche-one").addEventListener("click", () => runAvalancheOne());
    byId("avalanche-series").addEventListener("click", runAvalancheSeries);
    byId("resistance-run").addEventListener("click", runResistanceSearch);
    byId("sha2-run").addEventListener("click", () => runSha2Station());
    byId("sha2-round").addEventListener("input", renderSha2Round);
    byId("sha3-run").addEventListener("click", () => runSha3Station());
    byId("sha3-nist").addEventListener("click", () =>
      validateSha3Vectors().then((valid) => {
        if (valid) markComplete(5);
      }),
    );
    byId("sha3-round").addEventListener("input", renderSha3Round);
    byId("file-input").addEventListener("change", () =>
      loadSelectedFile().catch((error) =>
        setStatus("file-status", error.message, "bad"),
      ),
    );
    byId("file-demo").addEventListener("click", loadDemoFile);
    byId("file-hash").addEventListener("click", hashLoadedFile);
    byId("file-use-current").addEventListener("click", useCurrentFileDigest);
    byId("file-compare").addEventListener("click", compareFileDigest);
    byId("password-demo-new-salt").addEventListener("click", newPasswordSalt);
    byId("password-demo-run").addEventListener("click", runPasswordComparison);
    byId("password-demo-cost").addEventListener("input", () => {
      byId("password-demo-cost-label").textContent = Number(
        byId("password-demo-cost").value,
      ).toLocaleString("es-AR");
    });
    byId("merkle-build").addEventListener("click", () => buildMerkleTree());
    byId("merkle-tamper").addEventListener("click", tamperMerkleTransaction);
  }

  function initialize() {
    bindEvents();
    const initialStation = stationFromUrl();
    showStation(initialStation);
    restoreProgress();
    updateAvalancheRange();
    newPasswordSalt();
    runDigestStation(false);
    runSha2Station(false);
    runSha3Station(false);
    buildMerkleTree(false);
    if (initialStation !== 1)
      requestAnimationFrame(() =>
        byId(`hash-station-${initialStation}`).scrollIntoView({
          behavior: "auto",
          block: "start",
        }),
      );
  }

  initialize();
})();
