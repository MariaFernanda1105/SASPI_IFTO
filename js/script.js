// ===========================================================
// SASPI CODE — IFTO Palmas — script.js (JS puro, sem build)
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
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

  // -----------------------------------------------------------
  // helpers
  // -----------------------------------------------------------
  const $ = (sel) => document.querySelector(sel);
  const icon = (name) => `<svg class="icon"><use href="#i-${name}"/></svg>`;

  function goTo(id) {
    closeMobileNav();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", () => goTo(el.dataset.goto));
  });

  // -----------------------------------------------------------
  // menu mobile
  // -----------------------------------------------------------
  const siteNav = $("#siteNav");
  const menuToggle = $("#menuToggle");

  function closeMobileNav() {
    siteNav.classList.remove("is-open");
    menuToggle.innerHTML = icon("menu");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.innerHTML = icon(isOpen ? "x" : "menu");
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  // -----------------------------------------------------------
  // toasts (substitui a lib "sonner")
  // -----------------------------------------------------------
  function showToast(title, description) {
    const container = $("#toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<strong>${title}</strong>${description ? `<span>${description}</span>` : ""}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity .25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // -----------------------------------------------------------
  // agenda: abas de dias + lista de sessões
  // -----------------------------------------------------------
  const dayTabsEl = $("#dayTabs");
  const scheduleListEl = $("#scheduleList");

  function renderDayTabs() {
    dayTabsEl.innerHTML = days
      .map(
        (day) => `
        <button role="tab" aria-selected="${day.id === activeDay}" class="${day.id === activeDay ? "is-active" : ""}" data-day="${day.id}">
          <strong>${day.date}</strong><span>${day.label}</span>
        </button>`
      )
      .join("");

    dayTabsEl.querySelectorAll("button[data-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeDay = btn.dataset.day;
        renderDayTabs();
        renderSchedule();
      });
    });
  }

  function renderSchedule() {
    scheduleListEl.innerHTML = schedule[activeDay]
      .map(
        (item, index) => `
        <button class="session-row session-row--${item.accent} ${item.featured ? "is-featured" : ""}" data-index="${index}">
          <span class="session-row__time">${icon("clock-3")}${item.time}</span>
          <span class="session-row__main"><small>${item.type}</small><strong>${item.title}</strong><span>${item.speaker}</span></span>
          <span class="session-row__place">${icon("map-pin")}${item.place}</span>
          <span class="session-row__arrow">${icon("arrow-up-right")}</span>
        </button>`
      )
      .join("");

    scheduleListEl.querySelectorAll("button[data-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = schedule[activeDay][Number(btn.dataset.index)];
        openSessionModal(item, btn);
      });
    });
  }

  $("#downloadScheduleBtn").addEventListener("click", () => {
    showToast("A programação completa está sendo finalizada pela organização.");
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

  function openSessionModal(item, triggerEl) {
    const dayDate = days.find((d) => d.id === activeDay)?.date ?? "";
    modalKicker.textContent = item.type;
    modalKicker.className = `modal-kicker modal-kicker--${item.accent}`;
    modalTitle.textContent = item.title;
    modalSpeaker.textContent = item.speaker;
    modalTime.textContent = `${item.time} · ${dayDate}`;
    modalPlace.textContent = item.place;
    modalBackdrop.classList.add("is-open");

    // acessibilidade: guarda o elemento que abriu o modal e move o foco para dentro dele
    lastFocusedBeforeModal = triggerEl || document.activeElement;
    $("#modalClose").focus();
  }

  function closeSessionModal() {
    modalBackdrop.classList.remove("is-open");
    // devolve o foco para quem abriu o modal, para não perder o lugar na navegação por teclado
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

  // mantém o foco dentro do modal enquanto ele estiver aberto (focus trap simples)
  $("#sessionModal").addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = $("#sessionModal").querySelectorAll("button, a[href]");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  $("#modalSaveBtn").addEventListener("click", () => {
    showToast("Atividade salva na sua agenda");
    closeSessionModal();
  });

  // -----------------------------------------------------------
  // games
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
          <h3>${game.title}</h3>
          <p>${game.text}</p>
          <div class="game-card__bottom">
            <span>${game.meta}</span>
            <button class="${joined ? "is-joined" : ""}" data-game="${game.title}">
              ${joined ? `${icon("check")} na minha trilha` : `participar ${icon("arrow-right")}`}
            </button>
          </div>
        </article>`;
      })
      .join("");

    gamesGridEl.querySelectorAll("button[data-game]").forEach((btn) => {
      btn.addEventListener("click", () => joinGame(btn.dataset.game));
    });
  }

  function joinGame(title) {
    if (!joinedGames.has(title)) {
      joinedGames.add(title);
      showToast(`${title} adicionado à sua trilha`, "A programação ficará te esperando.");
      renderGames();
    }
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
              <span>${item.q}</span>
              ${icon("chevron-down")}
            </button>
          </h3>
          <div class="faq-item__panel" id="faqPanel${index}" role="region" aria-labelledby="faqTrigger${index}">
            <p>${item.a}</p>
          </div>
        </div>`
      )
      .join("");

    faqListEl.querySelectorAll(".faq-item__trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const panel = document.getElementById(trigger.getAttribute("aria-controls"));
        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!isOpen));
        panel.style.maxHeight = isOpen ? "0px" : `${panel.scrollHeight}px`;
      });
    });
  }

  // -----------------------------------------------------------
  // inscrição (about)
  // -----------------------------------------------------------
  $("#joinEventBtn").addEventListener("click", () => {
    showToast("Inscrição encaminhada", "Em breve, a organização enviará os próximos passos.");
  });

  // -----------------------------------------------------------
  // init
  // -----------------------------------------------------------
  renderDayTabs();
  renderSchedule();
  renderGames();
  renderFaq();
});
