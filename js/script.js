// ===========================================================
// SASPI CODE — IFTO Palmas — script.js (JS puro, sem build)
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-ready");

  // -----------------------------------------------------------
  // dados da programação
  // -----------------------------------------------------------
  const days = [
    { id: "21", label: "terça", date: "21/11" },
    { id: "22", label: "quarta", date: "22/11" },
    { id: "23", label: "quinta", date: "23/11" },
    { id: "24", label: "sexta", date: "24/11" },
  ];

  const schedule = {
    "21": [
      { time: "08:30", title: "Abertura // novos caminhos", type: "cerimônia", speaker: "Coordenações IFTO", place: "Auditório central", accent: "lime", featured: true },
      { time: "09:25", title: "Tecnologia sustentável", type: "palestra", speaker: "Edilanny Soares + Sara Jane", place: "Auditório central", accent: "white" },
      { time: "10:20", title: "Concursos na área de TI", type: "palestra", speaker: "Arnaldo Coelho · TCE-TO", place: "Auditório central", accent: "violet" },
      { time: "19:00", title: "Engenharia social & privacidade", type: "palestra online", speaker: "Cassandra Aguiar", place: "Auditório central · online", accent: "violet" },
      { time: "20:50", title: "Exploração de dados com Pandas", type: "minicurso", speaker: "Dr. Rogério Nogueira · UFT", place: "LABTEC · Bloco 4", accent: "lime" },
    ],
    "22": [
      { time: "08:30", title: "Git & GitHub na prática · parte 01", type: "minicurso", speaker: "Liliane Cavalcante + Charles Albert", place: "LabMídia · Bloco 4", accent: "lime", featured: true },
      { time: "09:25", title: "Servidor web em Docker", type: "minicurso", speaker: "Arinaldo Araújo da Silva", place: "LABTEC · Bloco 4", accent: "white" },
      { time: "19:00", title: "Você não conhece o IntelliJ", type: "minicurso", speaker: "Prof. Manoel Campos", place: "LABTEC · Bloco 4", accent: "violet" },
      { time: "19:30", title: "Pesquisa que move Palmas", type: "palestra", speaker: "Prof. Dr. Arquimedes Belo Paiva", place: "Auditório central", accent: "white" },
    ],
    "23": [
      { time: "08:30", title: "Git & GitHub na prática · parte 02", type: "minicurso", speaker: "Liliane Cavalcante + Charles Albert", place: "LabMídia · Bloco 4", accent: "lime", featured: true },
      { time: "08:30", title: "Do laboratório à startup", type: "palestra", speaker: "Jeferson Morais da Costa · Unitins", place: "Mini-Auditório 11", accent: "violet" },
      { time: "10:20", title: "Tecnologia para se destacar", type: "palestra online", speaker: "Miriam Aparecida · Tech Recruiter", place: "Auditório central · online", accent: "white" },
      { time: "20:50", title: "Cloud AWS em aplicações IoT", type: "palestra", speaker: "Prof. Dr. Marcos André · IFTO", place: "Auditório central", accent: "lime" },
    ],
    "24": [
      { time: "08:30", title: "Google Cloud Booster", type: "palestra destaque", speaker: "Fernando Hebraim + Adriana Pettengill · Google", place: "Auditório central", accent: "lime", featured: true },
      { time: "09:25", title: "5G/B5G: oportunidades e desafios", type: "palestra", speaker: "Douglas Chagas da Silva", place: "Mini-Auditório 11", accent: "white" },
      { time: "10:20", title: "Segurança da informação", type: "palestra", speaker: "Comunidade de segurança IFTO", place: "Auditório central", accent: "violet" },
      { time: "19:00", title: "Sessão de jogos + encerramento", type: "games & comunidade", speaker: "SASPI Code Crew", place: "Área de convivência", accent: "violet" },
    ],
  };

  const games = [
    { number: "01", title: "Arcade Sprint", text: "Desafios relâmpago de lógica, reflexo e código. Uma rodada, uma chance.", meta: "duplas · 15 min", color: "lime", icon: "▦" },
    { number: "02", title: "LAN // IFTO", text: "Clássicos competitivos, partidas abertas e muita torcida na área de convivência.", meta: "times · livre", color: "violet", icon: "⌘" },
    { number: "03", title: "Game Jam 90'", text: "Do conceito ao protótipo jogável com ferramentas livres e criatividade coletiva.", meta: "equipes · 90 min", color: "cream", icon: "✦" },
  ];

  const faqs = [
    { q: "Preciso pagar para participar?", a: "Não. A participação na SASPI Code é gratuita e aberta a toda a comunidade acadêmica e ao público externo interessado." },
    { q: "Vou receber certificado?", a: "Sim. A organização emite certificado de participação a quem cumprir a frequência mínima exigida nas atividades presenciais e online." },
    { q: "Preciso ser aluno do IFTO para participar?", a: "Não. O evento é aberto a estudantes de outras instituições, profissionais da área e à comunidade em geral." },
    { q: "As palestras online ficam gravadas?", a: "As atividades marcadas como \"online\" na programação têm transmissão ao vivo. A disponibilização de gravações depois do evento fica a critério de cada palestrante." },
    { q: "Como me inscrevo nos minicursos com vagas limitadas?", a: "As instruções de inscrição para minicursos com vagas limitadas serão divulgadas pela organização antes do início do evento, pelos canais oficiais." },
    { q: "Onde acompanho atualizações da programação?", a: "Pelos canais oficiais informados no rodapé deste site — e-mail da organização e comunidade no GitHub." },
  ];

  let activeDay = "21";
  const joinedGames = new Set();
  let lastFocusedBeforeModal = null;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // -----------------------------------------------------------
  // helpers
  // -----------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const icon = (name) => `<svg class="icon"><use href="#i-${name}"/></svg>`;
  /** escapa texto antes de entrar em innerHTML (evita XSS) */
  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function goTo(id, { focus = false } = {}) {
    closeMobileNav();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (id !== "top" && history.replaceState) history.replaceState(null, "", "#" + id);
    else if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    if (focus) setTimeout(() => el.focus({ preventScroll: true }), 450);
  }

  $$("[data-goto]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      goTo(el.dataset.goto);
    });
  });

  // -----------------------------------------------------------
  // toasts (substitui a lib "sonner") — texto seguro, clique fecha
  // -----------------------------------------------------------
  function showToast(title, description, type = "info") {
    const container = $("#toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast" + (type !== "info" ? ` toast--${type}` : "");
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    const strong = document.createElement("strong");
    strong.textContent = title;
    toast.appendChild(strong);
    if (description) {
      const span = document.createElement("span");
      span.textContent = description;
      toast.appendChild(span);
    }
    const life = type === "error" ? 5200 : 3600;
    toast.style.setProperty("--t", life + "ms");
    container.appendChild(toast);
    const remove = () => {
      toast.classList.add("is-leaving");
      setTimeout(() => toast.remove(), 260);
    };
    toast.addEventListener("click", remove);
    setTimeout(remove, life);
  }

  // -----------------------------------------------------------
  // menu mobile
  // -----------------------------------------------------------
  const siteNav = $("#siteNav");
  const menuToggle = $("#menuToggle");

  function closeMobileNav() {
    siteNav.classList.remove("is-open");
    menuToggle.innerHTML = icon("menu");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.innerHTML = icon(isOpen ? "x" : "menu");
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  // fecha ao clicar fora, com Esc ou ao voltar para a tela larga
  document.addEventListener("click", (e) => {
    if (siteNav.classList.contains("is-open") && !siteNav.contains(e.target)) closeMobileNav();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && siteNav.classList.contains("is-open")) {
      closeMobileNav();
      menuToggle.focus();
    }
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 850) closeMobileNav(); });

  // -----------------------------------------------------------
  // rolagem: progresso, header, voltar ao topo, link ativo
  // -----------------------------------------------------------
  const progressEl = $("#scrollProgress");
  const headerEl = $(".site-header");
  const backToTop = $("#backToTop");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressEl.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    headerEl.classList.toggle("is-scrolled", y > 60);
    backToTop.classList.toggle("is-visible", y > 700);
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  backToTop.addEventListener("click", () => goTo("top"));

  // scroll spy: destaca no menu a seção visível
  const navLinks = $$(".site-nav a[data-goto]");
  const spyIds = ["manifesto", "agenda", "games", "comissao", "local", "faq"];
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => {
          const on = a.dataset.goto === en.target.id && !a.classList.contains("nav-cta");
          a.classList.toggle("is-active", on);
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    spyIds.forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  // -----------------------------------------------------------
  // animações de entrada (reveal) e contadores
  // -----------------------------------------------------------
  function setupReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const groups = [
      ".section-label", ".manifesto__intro .big-note", ".manifesto__copy > *", ".manifesto__stats > div",
      ".tracks__header > *", ".track-card", ".schedule__top > *", ".day-tabs",
      ".games__top > *", ".game-signup__intro", ".game-signup__panel",
      ".about__layout > div", ".registration__intro > *", ".perk-item", ".registration__form-wrapper",
      ".committee__header > *", ".committee-card", ".partners__header > *", ".partner-badge",
      ".location__info > *", ".location__map", ".faq__header > *", ".faq-item",
    ];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    groups.forEach((sel) => {
      $$(sel).forEach((el, i) => {
        el.classList.add("reveal");
        el.style.setProperty("--d", Math.min(i, 5) * 0.08 + "s");
        io.observe(el);
      });
    });
  }

  function setupCounters() {
    const items = $$(".manifesto__stats strong");
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const final = en.target.textContent.trim();
        const num = parseInt(final, 10);
        const suffix = final.replace(/^\d+/, "");
        if (Number.isNaN(num)) return;
        const start = performance.now();
        const dur = 1100;
        (function tick(now) {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          en.target.textContent = String(Math.round(num * eased)).padStart(2, "0") + suffix;
          if (t < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.6 });
    items.forEach((el) => io.observe(el));
  }

  function confetti(originEl) {
    if (reduceMotion) return;
    const layer = document.createElement("div");
    layer.className = "confetti";
    const rect = originEl ? originEl.getBoundingClientRect() : { left: innerWidth / 2, top: 200, width: 0 };
    const cx = rect.left + rect.width / 2;
    const top = Math.max(rect.top, 60);
    layer.style.top = top + "px";
    const colors = ["#2f7d46", "#5f9c70", "#b52a36", "#e9b0b6", "#1b211d"];
    for (let i = 0; i < 36; i++) {
      const p = document.createElement("i");
      p.style.left = cx + "px";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--x", (Math.random() * 520 - 260).toFixed(0) + "px");
      p.style.setProperty("--y", (180 + Math.random() * 320).toFixed(0) + "px");
      p.style.setProperty("--r", (Math.random() * 900 - 450).toFixed(0) + "deg");
      p.style.setProperty("--dur", (1 + Math.random() * 0.9).toFixed(2) + "s");
      p.style.setProperty("--del", (Math.random() * 0.15).toFixed(2) + "s");
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 2400);
  }

  // -----------------------------------------------------------
  // agenda: abas de dias + lista de sessões
  // -----------------------------------------------------------
  const dayTabsEl = $("#dayTabs");
  const scheduleListEl = $("#scheduleList");

  function renderDayTabs(focusActive = false) {
    dayTabsEl.innerHTML = days
      .map(
        (day) => `
        <button role="tab" id="tab-${day.id}" aria-selected="${day.id === activeDay}" aria-controls="scheduleList"
                tabindex="${day.id === activeDay ? 0 : -1}" class="${day.id === activeDay ? "is-active" : ""}" data-day="${day.id}">
          <strong>${day.date}</strong><span>${day.label}</span>
        </button>`
      )
      .join("");

    $$("button[data-day]", dayTabsEl).forEach((btn) => {
      btn.addEventListener("click", () => selectDay(btn.dataset.day));
    });
    if (focusActive) $(`#tab-${activeDay}`)?.focus();
  }

  function selectDay(id, focus = false) {
    if (id === activeDay && !focus) return;
    activeDay = id;
    renderDayTabs(focus);
    renderSchedule();
  }

  // navegação por setas entre as abas (padrão WAI-ARIA)
  dayTabsEl.addEventListener("keydown", (e) => {
    const idx = days.findIndex((d) => d.id === activeDay);
    let next = null;
    if (e.key === "ArrowRight") next = (idx + 1) % days.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + days.length) % days.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = days.length - 1;
    if (next === null) return;
    e.preventDefault();
    selectDay(days[next].id, true);
  });

  function renderSchedule() {
    scheduleListEl.setAttribute("role", "tabpanel");
    scheduleListEl.setAttribute("aria-labelledby", `tab-${activeDay}`);
    scheduleListEl.innerHTML = schedule[activeDay]
      .map(
        (item, index) => `
        <button class="session-row session-row--${item.accent} ${item.featured ? "is-featured" : ""}" data-index="${index}" style="--i:${index}">
          <span class="session-row__time">${icon("clock-3")}${esc(item.time)}</span>
          <span class="session-row__main"><small>${esc(item.type)}</small><strong>${esc(item.title)}</strong><span>${esc(item.speaker)}</span></span>
          <span class="session-row__place">${icon("map-pin")}${esc(item.place)}</span>
          <span class="session-row__arrow">${icon("arrow-up-right")}</span>
        </button>`
      )
      .join("");

    $$("button[data-index]", scheduleListEl).forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = schedule[activeDay][Number(btn.dataset.index)];
        openSessionModal(item, btn);
      });
    });
  }

  // baixa a programação completa como planilha (CSV, abre no Excel/Sheets)
  $("#downloadScheduleBtn").addEventListener("click", () => {
    const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const linhas = [["Dia", "Horário", "Atividade", "Tipo", "Responsável", "Local"]];
    days.forEach((d) =>
      schedule[d.id].forEach((it) => linhas.push([d.date, it.time, it.title, it.type, it.speaker, it.place]))
    );
    const csv = "\uFEFF" + linhas.map((l) => l.map(csvCell).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "programacao-saspi-code.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Programação baixada", "Abra o arquivo no Excel ou Google Planilhas.", "success");
  });

  // -----------------------------------------------------------
  // modal de sessão
  // -----------------------------------------------------------
  const modalBackdrop = $("#modalBackdrop");
  const modalKicker = $("#modalKicker");
  const modalTitle = $("#modalTitle");
  const modalSpeaker = $("#modalSpeaker");
  const modalTime = $("#modalTime");
  const modalPlace = $("#modalPlace");
  const savedSessions = new Set();
  let currentSessionKey = "";

  function openSessionModal(item, triggerEl) {
    const dayDate = days.find((d) => d.id === activeDay)?.date ?? "";
    modalKicker.textContent = item.type;
    modalKicker.className = `modal-kicker modal-kicker--${item.accent}`;
    modalTitle.textContent = item.title;
    modalSpeaker.textContent = item.speaker;
    modalTime.textContent = `${item.time} · ${dayDate}`;
    modalPlace.textContent = item.place;
    currentSessionKey = `${activeDay}|${item.time}|${item.title}`;
    $("#modalSaveBtn").firstChild.textContent = savedSessions.has(currentSessionKey) ? "já está na sua agenda " : "salvar na minha agenda ";
    modalBackdrop.classList.add("is-open");
    document.body.classList.add("modal-open");

    lastFocusedBeforeModal = triggerEl || document.activeElement;
    $("#modalClose").focus();
  }

  function closeSessionModal() {
    modalBackdrop.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    if (lastFocusedBeforeModal) {
      lastFocusedBeforeModal.focus();
      lastFocusedBeforeModal = null;
    }
  }

  $("#modalClose").addEventListener("click", closeSessionModal);
  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) closeSessionModal();
  });
  $("#sessionModal").addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalBackdrop.classList.contains("is-open")) closeSessionModal();
  });
  $("#sessionModal").addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = $$("button, a[href]", $("#sessionModal"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  $("#modalSaveBtn").addEventListener("click", () => {
    if (savedSessions.has(currentSessionKey)) showToast("Essa atividade já está na sua agenda");
    else { savedSessions.add(currentSessionKey); showToast("Atividade salva na sua agenda", null, "success"); }
    closeSessionModal();
  });

  // -----------------------------------------------------------
  // games (cards) — "participar" leva ao formulário já com o jogo escolhido
  // -----------------------------------------------------------
  const gamesGridEl = $("#gamesGrid");

  function renderGames() {
    gamesGridEl.innerHTML = games
      .map((game) => {
        const joined = joinedGames.has(game.title);
        return `
        <article class="game-card game-card--${game.color}">
          <div class="game-card__top"><span>${game.number} / 03</span><span class="game-card__glyph">${game.icon}</span></div>
          <div class="game-card__art"><div class="game-card__rings"></div><span>${game.icon}</span></div>
          <h3>${esc(game.title)}</h3>
          <p>${esc(game.text)}</p>
          <div class="game-card__bottom">
            <span>${esc(game.meta)}</span>
            <button class="${joined ? "is-joined" : ""}" data-game="${esc(game.title)}" ${joined ? 'aria-disabled="true"' : ""}>
              ${joined ? `${icon("check")} você está inscrito` : `participar ${icon("arrow-right")}`}
            </button>
          </div>
        </article>`;
      })
      .join("");

    $$("button[data-game]", gamesGridEl).forEach((btn) => {
      btn.addEventListener("click", () => joinGame(btn.dataset.game));
    });
  }

  function joinGame(title) {
    if (joinedGames.has(title)) { showToast("Você já está inscrito em " + title); return; }
    const sel = $("#gameJogo");
    sel.value = title;
    validateField(sel);
    resetGameFormVisibility();
    goTo("inscricao-jogos");
    const box = $("#inscricao-jogos");
    box.classList.remove("is-highlight");
    void box.offsetWidth;
    box.classList.add("is-highlight");
    setTimeout(() => $("#gameNome")?.focus({ preventScroll: true }), 600);
  }

  // -----------------------------------------------------------
  // faq (accordion acessível)
  // -----------------------------------------------------------
  const faqListEl = $("#faqList");

  function renderFaq() {
    faqListEl.innerHTML = faqs
      .map(
        (item, index) => `
        <div class="faq-item">
          <h3>
            <button class="faq-item__trigger" id="faqTrigger${index}" aria-expanded="false" aria-controls="faqPanel${index}">
              <span>${esc(item.q)}</span>
              ${icon("chevron-down")}
            </button>
          </h3>
          <div class="faq-item__panel" id="faqPanel${index}" role="region" aria-labelledby="faqTrigger${index}">
            <p>${esc(item.a)}</p>
          </div>
        </div>`
      )
      .join("");

    $$(".faq-item__trigger", faqListEl).forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const panel = document.getElementById(trigger.getAttribute("aria-controls"));
        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!isOpen));
        panel.style.maxHeight = isOpen ? "0px" : `${panel.scrollHeight}px`;
      });
    });
  }

  // ===========================================================
  // FORMULÁRIOS — validação, campos condicionais e envio
  // ===========================================================
  const RX = {
    nome: /^[\p{L}][\p{L}\s'.-]{1,}\s+[\p{L}][\p{L}\s'.-]*$/u, // pelo menos nome + sobrenome
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    matricula: /^[A-Za-z0-9.\-]{4,30}$/,
  };

  const RULES = {
    gameJogo: (v) => (!v ? "Escolha o jogo." : ""),
    gameNome: (v) => (!v ? "Informe seu nome completo." : !RX.nome.test(v) || v.length < 5 ? "Digite nome e sobrenome." : ""),
    gameEmail: (v) => (!v ? "Informe seu e-mail." : !RX.email.test(v) ? "E-mail inválido. Ex: nome@exemplo.com" : ""),
    gameTelefone: (v) => (!v ? "Informe seu telefone." : v.replace(/\D/g, "").length < 10 ? "Digite com DDD. Ex: (63) 99999-9999" : ""),
    gameAluno: (v) => (!v ? "Escolha uma opção." : ""),
    gameMatricula: (v) => (!v ? "Informe sua matrícula." : !RX.matricula.test(v) ? "Use de 4 a 30 letras, números, ponto ou hífen." : ""),
    gameFaculdade: (v) => (!v ? "Informe sua faculdade." : v.length < 2 ? "Nome muito curto." : ""),
    gamePeriodo: (v) => (!v ? "Informe seu período." : ""),
  };

  const cleanValue = (el) => (el.type === "checkbox" ? el.checked : el.value.replace(/\s+/g, " ").trim());

  function setError(el, msg) {
    const group = el.closest(".form-group");
    const err = document.getElementById("err-" + el.id);
    if (err) err.textContent = msg || "";
    if (group) {
      group.classList.toggle("has-error", !!msg);
      group.classList.toggle("is-valid", !msg && !!cleanValue(el));
    }
    el.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function validateField(el) {
    if (!el || el.disabled) return true;
    const rule = RULES[el.id];
    if (!rule) return true;
    const msg = rule(cleanValue(el), el);
    setError(el, msg);
    return !msg;
  }

  function wireLiveValidation(form) {
    $$("input, select", form).forEach((el) => {
      if (!RULES[el.id]) return;
      const ev = el.tagName === "SELECT" || el.type === "checkbox" ? "change" : "blur";
      el.addEventListener(ev, () => validateField(el));
      el.addEventListener("input", () => {
        // depois de errar, limpa o erro assim que o campo ficar válido
        if (el.closest(".form-group")?.classList.contains("has-error")) validateField(el);
      });
    });
  }

  /** abre/fecha um bloco condicional e liga/desliga seus campos */
  function toggleConditional(groupEl, open) {
    groupEl.classList.toggle("is-open", open);
    groupEl.setAttribute("aria-hidden", String(!open));
    $$("input", groupEl).forEach((inp) => {
      inp.disabled = !open;
      if (!open) { inp.value = ""; setError(inp, ""); const g = inp.closest(".form-group"); g && g.classList.remove("is-valid"); }
    });
  }

  function focusFirstError(form) {
    const bad = form.querySelector(".has-error input:not(:disabled), .has-error select");
    if (bad) { bad.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); setTimeout(() => bad.focus({ preventScroll: true }), 250); }
  }

  function fillDetails(container, heading, rows) {
    container.textContent = "";
    const h = document.createElement("strong");
    h.textContent = heading;
    container.appendChild(h);
    rows.forEach(([label, value]) => {
      if (!value || (Array.isArray(value) && !value.length)) return;
      const line = document.createElement("div");
      const b = document.createElement("b");
      b.textContent = label + ": ";
      line.appendChild(b);
      if (Array.isArray(value)) {
        const ul = document.createElement("ul");
        value.forEach((m) => { const li = document.createElement("li"); li.textContent = m; ul.appendChild(li); });
        line.appendChild(ul);
      } else line.appendChild(document.createTextNode(value));
      container.appendChild(line);
    });
  }

  function setLoading(btn, loading, loadingText) {
    if (loading) {
      btn.dataset.html = btn.innerHTML;
      btn.disabled = true;
      btn.classList.add("is-loading");
      btn.innerHTML = `<span>${loadingText}</span> ${icon("clock-3")}`;
    } else {
      btn.disabled = false;
      btn.classList.remove("is-loading");
      if (btn.dataset.html) btn.innerHTML = btn.dataset.html;
    }
  }

  // ---------- formulário dos JOGOS ----------
  const gameForm = $("#gameForm");
  const gameAluno = $("#gameAluno");
  const gameSuccess = $("#gameSuccess");
  let gameBusy = false;

  // máscara do telefone: (XX) XXXXX-XXXX
  $("#gameTelefone").addEventListener("input", (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (val.length > 10) val = val.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    else if (val.length > 6) val = val.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    else if (val.length > 2) val = val.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    e.target.value = val;
  });

  function resetGameFormVisibility() {
    gameForm.style.display = "block";
    gameSuccess.classList.add("is-hidden");
  }

  function syncGameAluno() {
    const v = gameAluno.value;
    toggleConditional($("#gameGrupoMatricula"), v === "sim");
    toggleConditional($("#gameGrupoExterno"), v === "nao");
  }
  gameAluno.addEventListener("change", syncGameAluno);
  wireLiveValidation(gameForm);

  gameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (gameBusy) return;
    if ($("#gameSite").value) { showSuccessJogo({ nome: "jogador", jogo: "" }, true); return; }

    const campos = ["gameJogo", "gameNome", "gameAluno", "gameEmail", "gameTelefone", "gameMatricula", "gameFaculdade", "gamePeriodo"];
    const ok = campos.map((id) => validateField(document.getElementById(id))).every(Boolean);
    if (!ok) {
      showToast("Confira os campos destacados", "Alguns dados precisam de ajuste.", "error");
      focusFirstError(gameForm);
      return;
    }

    const aluno = gameAluno.value === "sim";
    const dados = {
      jogo: $("#gameJogo").value,
      nome: $("#gameNome").value,
      email: $("#gameEmail").value,
      telefone: $("#gameTelefone").value,
      aluno_ifto: aluno,
      matricula: aluno ? $("#gameMatricula").value : "",
      faculdade: aluno ? "" : $("#gameFaculdade").value,
      periodo: aluno ? "" : $("#gamePeriodo").value,
    };

    gameBusy = true;
    const btn = $("#gameSubmitBtn");
    setLoading(btn, true, "enviando...");
    try {
      const r = await salvarInscricaoJogo(dados);
      if (r.success) {
        joinedGames.add(dados.jogo);
        renderGames();
        showToast("Você está no jogo!", `${dados.jogo} · inscrição registrada.`, "success");
        showSuccessJogo(dados);
      } else {
        showToast("Não foi possível inscrever", r.error, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro inesperado", "Ocorreu uma falha ao processar o formulário.", "error");
    } finally {
      gameBusy = false;
      setLoading(btn, false);
    }
  });

  function showSuccessJogo(d, silent = false) {
    $("#gameSuccessName").textContent = `Boa, ${String(d.nome).split(" ")[0]}!`;
    fillDetails($("#gameSuccessDetails"), "Comprovante de inscrição", [
      ["Jogo", d.jogo],
      ["Nome", d.nome],
      ["E-mail", d.email],
      ["Telefone", d.telefone],
      [d.aluno_ifto ? "Matrícula" : "Faculdade", d.aluno_ifto ? d.matricula : d.faculdade],
      ["Período", d.aluno_ifto ? "" : d.periodo],
    ]);
    gameForm.style.display = "none";
    gameSuccess.classList.remove("is-hidden");
    gameSuccess.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    gameSuccess.focus({ preventScroll: true });
    if (!silent) confetti($(".success-card__badge", gameSuccess));
  }

  $("#newGameBtn").addEventListener("click", () => {
    gameForm.reset();
    $$(".form-group", gameForm).forEach((g) => g.classList.remove("has-error", "is-valid"));
    syncGameAluno();
    resetGameFormVisibility();
    $("#gameNome").focus();
  });

  // -----------------------------------------------------------
  // init
  // -----------------------------------------------------------
  renderDayTabs();
  renderSchedule();
  renderGames();
  renderFaq();
  setupReveal();
  setupCounters();
});
