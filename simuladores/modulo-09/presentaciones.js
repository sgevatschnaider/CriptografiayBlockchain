(() => {
  "use strict";

  const decks = {
    1: { title: "Bitcoin 01 · Fundamentos e historia", slug: "deck-01", pptx: "bitcoin-01-fundamentos-historia.pptx", slides: "1Leu8lgUTgfJfQzh3vYScwk942JW3r45l79JhDXwiFwg" },
    2: { title: "Bitcoin 02 · Claves, wallets y transacciones", slug: "deck-02", pptx: "bitcoin-02-claves-wallets-transacciones.pptx", slides: "1ljGY3GK09oSAMmFfgzQEkEf0u8TIWiHLrByeRc5qppM" },
    3: { title: "Bitcoin 03 · Bloques, minería y consenso", slug: "deck-03", pptx: "bitcoin-03-bloques-mineria-consenso.pptx", slides: "1hOU-LJXJKPakaBg1TUQn3qapQ-r70zIbWkD6-eHfKtE" },
    4: { title: "Bitcoin 04 · Economía, seguridad y escalabilidad", slug: "deck-04", pptx: "bitcoin-04-economia-seguridad-escalabilidad.pptx", slides: "16uEry1ec_DwMBelUKcoueaoiQMB72YfS7FPbDiwekH4" },
  };
  const total = 16;
  const params = new URLSearchParams(location.search);
  let deck = Math.min(4, Math.max(1, Number(params.get("deck")) || 1));
  let slide = Math.min(total, Math.max(1, Number(params.get("slide")) || 1));
  let timer = null;

  const image = document.querySelector("#slide-image");
  const counter = document.querySelector("#counter");
  const title = document.querySelector("#deck-title");
  const pptx = document.querySelector("#pptx-link");
  const google = document.querySelector("#slides-link");
  const play = document.querySelector("#play");
  const delay = document.querySelector("#delay");
  const thumbnails = document.querySelector("#thumbnails");

  function slidePath(index, small = false) {
    const number = String(index).padStart(2, "0");
    return `presentaciones/${decks[deck].slug}/slide-${number}.png${small ? "" : ""}`;
  }

  function syncUrl() {
    history.replaceState(null, "", `?deck=${deck}&slide=${slide}`);
  }

  function renderThumbnails() {
    thumbnails.innerHTML = Array.from({ length: total }, (_, index) => {
      const number = index + 1;
      return `<li><button type="button" data-slide="${number}" aria-label="Abrir diapositiva ${number}" aria-current="${number === slide ? "true" : "false"}"><img src="${slidePath(number, true)}" alt="" loading="lazy" /><span>${number}</span></button></li>`;
    }).join("");
    thumbnails.querySelectorAll("[data-slide]").forEach((button) => button.addEventListener("click", () => setSlide(Number(button.dataset.slide))));
  }

  function render() {
    const data = decks[deck];
    title.textContent = data.title;
    image.src = slidePath(slide);
    image.alt = `Diapositiva ${slide} de 16 de ${data.title}`;
    counter.textContent = `${slide} / ${total}`;
    pptx.href = `presentaciones/${data.pptx}`;
    google.href = `https://docs.google.com/presentation/d/${data.slides}/edit`;
    document.querySelectorAll("[data-deck]").forEach((button) => button.setAttribute("aria-selected", String(Number(button.dataset.deck) === deck)));
    thumbnails.querySelectorAll("[data-slide]").forEach((button) => button.setAttribute("aria-current", String(Number(button.dataset.slide) === slide)));
    syncUrl();
  }

  function setSlide(value) {
    slide = Math.min(total, Math.max(1, value));
    render();
    thumbnails.querySelector(`[data-slide="${slide}"]`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function setDeck(value) {
    deck = Math.min(4, Math.max(1, value));
    slide = 1;
    renderThumbnails();
    render();
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    play.textContent = "▶ Reproducir";
    play.setAttribute("aria-pressed", "false");
  }

  function togglePlay() {
    if (timer) return stop();
    play.textContent = "❚❚ Pausar";
    play.setAttribute("aria-pressed", "true");
    timer = setInterval(() => {
      if (slide === total) {
        if (deck === 4) return stop();
        setDeck(deck + 1);
      } else setSlide(slide + 1);
    }, Number(delay.value));
  }

  document.querySelectorAll("[data-deck]").forEach((button) => button.addEventListener("click", () => { stop(); setDeck(Number(button.dataset.deck)); }));
  document.querySelector("#previous").addEventListener("click", () => setSlide(slide - 1));
  document.querySelector("#next").addEventListener("click", () => setSlide(slide + 1));
  document.querySelector("#first").addEventListener("click", () => setSlide(1));
  document.querySelector("#last").addEventListener("click", () => setSlide(total));
  play.addEventListener("click", togglePlay);
  delay.addEventListener("change", () => { if (timer) { stop(); togglePlay(); } });
  document.querySelector("#fullscreen").addEventListener("click", () => document.querySelector("#viewer-root").requestFullscreen?.());
  document.addEventListener("keydown", (event) => {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
    if (event.key === "ArrowLeft") setSlide(slide - 1);
    if (event.key === "ArrowRight") setSlide(slide + 1);
    if (event.key === "Home") setSlide(1);
    if (event.key === "End") setSlide(total);
    if (event.key === " ") { event.preventDefault(); togglePlay(); }
  });

  renderThumbnails();
  render();
})();
