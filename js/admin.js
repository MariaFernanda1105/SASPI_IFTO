// ===========================================================
// SASPI CODE — painel da organização (admin.js)
// Lista, filtra e exporta inscritos (Excel / PDF / CSV).
// Só mostra dados se o usuário logado for admin (regra no banco: sql/schema.sql).
// ===========================================================

document.addEventListener("DOMContentLoaded", async () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const COLS = [
    ["created_at", "Data"], ["jogo", "Jogo"], ["nome", "Nome"], ["email", "E-mail"], ["telefone", "Telefone"],
    ["vinculo", "Vínculo"], ["matricula", "Matrícula"], ["faculdade", "Faculdade"], ["periodo", "Período"],
  ];
  const TABELA = "inscricoes_jogos";
  const TITULO = "Inscritos nos Jogos — SASPI Code";
  const JOGOS = ["Arcade Sprint", "LAN // IFTO", "Game Jam 90'"];

  const state = { dados: [], demo: false };

  // ---------- helpers ----------
  function toast(title, desc, type = "info") {
    const t = document.createElement("div");
    t.className = "toast" + (type !== "info" ? ` toast--${type}` : "");
    const s = document.createElement("strong"); s.textContent = title; t.appendChild(s);
    if (desc) { const d = document.createElement("span"); d.textContent = desc; t.appendChild(d); }
    $("#toastContainer").appendChild(t);
    const rm = () => { t.classList.add("is-leaving"); setTimeout(() => t.remove(), 260); };
    t.addEventListener("click", rm); setTimeout(rm, 3800);
  }
  const fmtData = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  const vinculoTxt = (r) => (r.aluno_ifto ? "Aluno IFTO" : "Outra instituição");

  /** valor "puro" de uma célula (para exportação) */
  function valor(r, key) {
    if (key === "created_at") return fmtData(r.created_at);
    if (key === "vinculo") return vinculoTxt(r);
    return r[key] ?? "";
  }
  /** evita "injeção de fórmula": texto começando com = + - @ vira texto literal no Excel/Sheets */
  const seguro = (v) => {
    const s = String(v ?? "");
    return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
  };

  function filtrados() {
    const q = $("#searchInput").value.trim().toLowerCase();
    const v = $("#filterVinculo").value;
    const j = $("#filterJogo").value;
    return state.dados.filter((r) => {
      if (v === "ifto" && !r.aluno_ifto) return false;
      if (v === "externo" && r.aluno_ifto) return false;
      if (j && r.jogo !== j) return false;
      if (!q) return true;
      return COLS.some(([k]) => String(valor(r, k)).toLowerCase().includes(q));
    });
  }

  // ---------- render ----------
  function renderStats() {
    const d = state.dados;
    const cards = [
      [d.length, "inscrições nos jogos"],
      [d.filter((r) => r.aluno_ifto).length, "alunos IFTO"],
      [d.filter((r) => !r.aluno_ifto).length, "externos"],
      ...JOGOS.map((n) => [d.filter((r) => r.jogo === n).length, n]),
    ];
    const box = $("#stats");
    box.textContent = "";
    cards.forEach(([n, label], i) => {
      const c = document.createElement("div"); c.className = "stat-card"; c.style.setProperty("--i", i);
      const s = document.createElement("strong"); s.textContent = n;
      const l = document.createElement("span"); l.textContent = label;
      c.append(s, l); box.appendChild(c);
    });
  }

  function renderTable() {
    const cols = COLS;
    const thead = $("#thead"), tbody = $("#tbody");
    thead.textContent = ""; tbody.textContent = "";
    const hr = document.createElement("tr");
    cols.forEach(([, label]) => { const th = document.createElement("th"); th.scope = "col"; th.textContent = label; hr.appendChild(th); });
    const thAct = document.createElement("th"); thAct.textContent = ""; thAct.setAttribute("aria-label", "Ações"); hr.appendChild(thAct);
    thead.appendChild(hr);

    const rows = filtrados();
    rows.forEach((r) => {
      const tr = document.createElement("tr");
      cols.forEach(([k]) => {
        const td = document.createElement("td");
        if (k === "vinculo") {
          const tag = document.createElement("span"); tag.className = "tag" + (r.aluno_ifto ? "" : " tag--ext"); tag.textContent = vinculoTxt(r); td.appendChild(tag);
        } else td.textContent = valor(r, k) || "—";
        tr.appendChild(td);
      });
      const tdA = document.createElement("td");
      const del = document.createElement("button");
      del.className = "row-del"; del.type = "button"; del.setAttribute("aria-label", "Apagar inscrição de " + r.nome);
      del.innerHTML = '<svg class="icon"><use href="#i-trash"/></svg>';
      del.addEventListener("click", () => apagar(r));
      tdA.appendChild(del); tr.appendChild(tdA);
      tbody.appendChild(tr);
    });
    $("#emptyMsg").hidden = rows.length > 0;
    $("#footMsg").textContent = `Mostrando ${rows.length} de ${state.dados.length} registros. Dados pessoais: use somente para a organização do evento (LGPD).`;
  }

  async function apagar(r) {
    if (!confirm(`Apagar a inscrição de "${r.nome}"? Essa ação não pode ser desfeita.`)) return;
    const res = await adminApagar(TABELA, r.id);
    if (!res.success) return toast("Não foi possível apagar", res.error, "error");
    state.dados = state.dados.filter((x) => x.id !== r.id);
    renderStats(); renderTable();
    toast("Inscrição apagada", null, "success");
  }

  async function carregar() {
    const btn = $("#refreshBtn"); btn.disabled = true;
    const a = await adminListar(TABELA);
    btn.disabled = false;
    if (!a.success) return toast("Erro ao carregar", a.error, "error");
    state.dados = a.data;
    renderStats(); renderTable();
  }

  // ---------- exportações ----------
  const stamp = () => new Date().toISOString().slice(0, 10);
  const matriz = (rows) => [COLS.map(([, l]) => l), ...rows.map((r) => COLS.map(([k]) => seguro(valor(r, k))))];

  function baixarBlob(blob, nome) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  const larguras = (m) => m[0].map((_, c) => ({ wch: Math.min(48, Math.max(...m.map((row) => String(row[c] ?? "").length)) + 2) }));

  function exportarXlsx() {
    if (typeof XLSX === "undefined") return toast("Biblioteca não carregou", "Verifique sua conexão com a internet.", "error");
    const wb = XLSX.utils.book_new();
    const m = matriz(filtrados());
    const ws = XLSX.utils.aoa_to_sheet(m);
    ws["!cols"] = larguras(m);
    ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(m.length - 1, 0), c: m[0].length - 1 } }) };
    XLSX.utils.book_append_sheet(wb, ws, "Jogos");
    XLSX.writeFile(wb, `saspi-jogos-${stamp()}.xlsx`);
    toast("Excel gerado", null, "success");
  }

  function exportarCsv() {
    const cel = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = "\uFEFF" + matriz(filtrados()).map((l) => l.map(cel).join(";")).join("\r\n");
    baixarBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `saspi-jogos-${stamp()}.csv`);
    toast("CSV gerado", null, "success");
  }

  function exportarPdf() {
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return toast("Biblioteca não carregou", "Verifique sua conexão com a internet.", "error");
    const rows = filtrados();
    const doc = new J({ orientation: "landscape", unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const m = matriz(rows);

    doc.setFillColor(47, 125, 70); doc.rect(0, 0, W, 8, "F");
    doc.setFillColor(181, 42, 54); doc.rect(W - 160, 0, 160, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(27, 33, 29);
    doc.text(TITULO, 40, 42);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(94, 104, 95);
    doc.text(`IFTO Campus Palmas · gerado em ${fmtData(new Date().toISOString())} · ${rows.length} registro(s)`, 40, 58);

    doc.autoTable({
      head: [m[0]], body: m.slice(1).map((r) => r.map((c) => String(c).replace(/^'/, ""))),
      startY: 72, theme: "grid",
      styles: { font: "helvetica", fontSize: 8, cellPadding: 4, lineColor: [220, 225, 220], lineWidth: 0.5, overflow: "linebreak", textColor: [27, 33, 29] },
      headStyles: { fillColor: [47, 125, 70], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [244, 246, 240] },
      margin: { left: 40, right: 40, bottom: 36 },
      didDrawPage: () => {
        const n = doc.internal.getNumberOfPages();
        doc.setFontSize(8); doc.setTextColor(120);
        doc.text(`SASPI Code · página ${n}`, W - 40, doc.internal.pageSize.getHeight() - 18, { align: "right" });
      },
    });
    doc.save(`saspi-jogos-${stamp()}.pdf`);
    toast("PDF gerado", null, "success");
  }

  // ---------- eventos da interface ----------
  ["searchInput", "filterVinculo", "filterJogo"].forEach((id) => $("#" + id).addEventListener("input", renderTable));
  $("#refreshBtn").addEventListener("click", carregar);
  $("#btnXlsx").addEventListener("click", exportarXlsx);
  $("#btnCsv").addEventListener("click", exportarCsv);
  $("#btnPdf").addEventListener("click", exportarPdf);

  // ---------- login ----------
  function mostrarPainel() {
    $("#loginView").hidden = true; $("#panelView").hidden = false;
    $("#logoutBtn").hidden = state.demo;
    $("#modeBadge").hidden = !state.demo;
    carregar();
  }
  function mostrarLogin() {
    $("#panelView").hidden = true; $("#loginView").hidden = false; $("#logoutBtn").hidden = true;
    $("#loginEmail").focus();
  }

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("#loginEmail").value.trim(), senha = $("#loginSenha").value;
    const msg = $("#loginMsg"); msg.textContent = "";
    if (!email || !senha) { msg.textContent = "Preencha e-mail e senha."; return; }
    const btn = $("#loginBtn"); btn.disabled = true;
    const r = await adminLogin(email, senha);
    btn.disabled = false; $("#loginSenha").value = "";
    if (!r.success) { msg.textContent = r.error; return; }
    mostrarPainel();
  });
  $("#logoutBtn").addEventListener("click", async () => { await adminLogout(); state.dados = []; mostrarLogin(); });

  const sess = await adminSessao();
  state.demo = !!sess.demo;
  if (sess.demo || sess.session) mostrarPainel(); else mostrarLogin();
});
