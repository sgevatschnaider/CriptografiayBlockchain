(() => {
  "use strict";
  const STORAGE_KEY = "criptografia-ruta-integridad-autenticidad";
  const boxes = [...document.querySelectorAll("[data-route-station]")];
  const count = document.getElementById("route-count");
  const percent = document.getElementById("route-percent");
  const bar = document.getElementById("route-bar");
  const progress = document.querySelector("[data-route-progress] .ia-progress");

  function stored() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return new Set(Array.isArray(value) ? value.map(String) : []);
    } catch {
      return new Set();
    }
  }

  function update() {
    const completed = boxes.filter((box) => box.checked).length;
    const value = Math.round((completed / boxes.length) * 100);
    count.textContent = completed;
    percent.textContent = `${value}%`;
    bar.style.width = `${value}%`;
    progress.setAttribute("aria-valuenow", String(value));
  }

  function save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          boxes
            .filter((box) => box.checked)
            .map((box) => box.dataset.routeStation),
        ),
      );
    } catch {}
    update();
  }

  const completed = stored();
  boxes.forEach((box) => {
    box.checked = completed.has(box.dataset.routeStation);
    box.addEventListener("change", save);
  });
  update();

  document.getElementById("route-reset").addEventListener("click", () => {
    boxes.forEach((box) => {
      box.checked = false;
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    update();
  });

  document
    .getElementById("route-ticket")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const expected = {
        q1: "b",
        q2: "a",
        q3: "a",
        q4: "b",
        q5: "a",
        q6: "a",
        q7: "b",
        q8: "a",
      };
      const data = new FormData(event.currentTarget);
      const missing = Object.keys(expected).filter((key) => !data.get(key));
      const status = document.getElementById("route-ticket-status");
      if (missing.length) {
        status.textContent = `Faltan ${missing.length} respuesta${missing.length === 1 ? "" : "s"}.`;
        status.dataset.kind = "warn";
        return;
      }
      const score = Object.entries(expected).reduce(
        (total, [key, value]) => total + (data.get(key) === value ? 1 : 0),
        0,
      );
      status.textContent =
        score === 8
          ? "8/8. Diferenciaste las primitivas, sus modelos de clave y la transición de algoritmos."
          : `${score}/8. Revisá canal confiable para hashes, secreto compartido, PBKDF/HKDF, identidad de clave pública, nonce ECDSA y RSA-PSS/ML-DSA.`;
      status.dataset.kind = score === 8 ? "good" : "warn";
      if (score === 8) {
        const final = document.querySelector('[data-route-station="7"]');
        final.checked = true;
        save();
      }
    });
})();
