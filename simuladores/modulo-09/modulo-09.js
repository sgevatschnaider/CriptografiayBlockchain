(() => {
  "use strict";

  const storageKey = "criptografia-modulo-09-bitcoin-progreso-v1";
  const cards = [...document.querySelectorAll(".resource-card[data-resource-id]")];
  const filters = [...document.querySelectorAll("[data-filter]")];
  const search = document.querySelector("#resource-search");
  const status = document.querySelector("#progress-status");
  const progress = document.querySelector(".progress-track");
  const fill = document.querySelector("#progress-fill");
  const continueLink = document.querySelector("#continue-link");
  const reset = document.querySelector("#reset-progress");
  const empty = document.querySelector("#empty-state");
  let activeFilter = "todos";

  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveProgress(value) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // El módulo sigue funcionando aunque el navegador bloquee almacenamiento local.
    }
  }

  function normalize(value) {
    return value
      .toLocaleLowerCase("es")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function updateProgress() {
    const completed = cards.filter((card) => card.querySelector("[data-complete]").checked);
    const count = completed.length;
    const total = cards.length;
    const percentage = total ? (count / total) * 100 : 0;
    const progressState = {};

    cards.forEach((card) => {
      const checkbox = card.querySelector("[data-complete]");
      const isComplete = checkbox.checked;
      card.classList.toggle("completed", isComplete);
      progressState[card.dataset.resourceId] = isComplete;
    });

    saveProgress(progressState);
    status.textContent = count === total
      ? `Ruta completa: ${total} de ${total} recursos revisados.`
      : `${count} de ${total} recursos completados.`;
    fill.style.width = `${percentage}%`;
    progress.setAttribute("aria-valuemax", String(total));
    progress.setAttribute("aria-valuenow", String(count));

    const next = cards.find((card) => !card.querySelector("[data-complete]").checked);
    const nextAnchor = next?.querySelector(".card-actions a");
    if (nextAnchor) {
      continueLink.href = nextAnchor.getAttribute("href");
      continueLink.textContent = count ? "Continuar la ruta" : "Comenzar la ruta";
    } else {
      continueLink.href = "cuestionario-interactivo-bitcoin-20-preguntas.html";
      continueLink.textContent = "Revisar el cuestionario";
    }
  }

  function applyFilters() {
    const query = normalize(search?.value || "");
    let visible = 0;

    cards.forEach((card) => {
      const categories = (card.dataset.category || "").split(/\s+/);
      const categoryMatches = activeFilter === "todos" || categories.includes(activeFilter);
      const searchable = normalize(`${card.dataset.search || ""} ${card.textContent}`);
      const searchMatches = !query || searchable.includes(query);
      const show = categoryMatches && searchMatches;
      card.hidden = !show;
      if (show) visible += 1;
    });

    empty.hidden = visible !== 0;
  }

  const saved = loadProgress();
  cards.forEach((card) => {
    const checkbox = card.querySelector("[data-complete]");
    checkbox.checked = Boolean(saved[card.dataset.resourceId]);
    checkbox.addEventListener("change", updateProgress);
  });

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filters.forEach((candidate) => {
        const selected = candidate === button;
        candidate.classList.toggle("active", selected);
        candidate.setAttribute("aria-pressed", String(selected));
      });
      applyFilters();
    });
  });

  search?.addEventListener("input", applyFilters);

  reset?.addEventListener("click", () => {
    if (!window.confirm(`¿Reiniciar el progreso guardado para los ${cards.length} recursos?`)) return;
    cards.forEach((card) => {
      card.querySelector("[data-complete]").checked = false;
    });
    updateProgress();
  });

  updateProgress();
  applyFilters();
})();
