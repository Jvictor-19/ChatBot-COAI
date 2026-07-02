const socket = io();

// Referências DOM
const dom = {
  loginScreen: document.getElementById("login-screen"),
  appLayout: document.getElementById("app-layout"),
  loginForm: document.getElementById("login-form"),
  loginError: document.getElementById("login-error"),
  led: document.getElementById("status-led"),
  statusText: document.getElementById("status-text"),
  qrImage: document.getElementById("qr-image"),
  qrPlaceholder: document.getElementById("qr-placeholder"),
  btnToggle: document.getElementById("btn-toggle-bot"),
  kpiTotal: document.getElementById("kpi-total"),
  kpiUsers: document.getElementById("kpi-users"),
  tabela: document.getElementById("tabela-atendimentos"),
  tabelaFila: document.getElementById("tabela-fila"),
  filaAlert: document.getElementById("fila-alert"),
  badgeTop: document.getElementById("badge-topbar"),
  badgeSide: document.getElementById("badge-sidebar"),
  inputPesquisa: document.getElementById("input-pesquisa"),
  headerTitle: document.getElementById("header-title"),
  headerSubtitle: document.getElementById("header-subtitle"),
  viewSections: document.querySelectorAll(".view-section"),
  navItems: document.querySelectorAll(".nav-item"),
};

let chartInstance = null;
let historicoGlobal = [];

function exibirToast(msg, tipo = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  let icone =
    tipo === "error"
      ? "fa-triangle-exclamation"
      : tipo === "warning"
        ? "fa-circle-info"
        : "fa-circle-check";
  toast.innerHTML = `<i class="fa-solid ${icone}"></i> <span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// LÓGICA DE LOGIN BLINDADA
dom.loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Busca os valores exatos dos campos no momento do clique
  const emailDigitado = document.getElementById("email").value;
  const senhaDigitada = document.getElementById("password").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailDigitado, password: senhaDigitada }),
    });

    const data = await res.json();
    if (data.success) {
      dom.loginScreen.style.display = "none";
      dom.appLayout.style.display = "flex";
      carregarDados();
      exibirToast("Autenticado com sucesso!", "success");
    } else {
      dom.loginError.innerText = "Credenciais inválidas.";
      exibirToast("Falha no login", "error");
    }
  } catch (err) {
    dom.loginError.innerText = "Erro ao conectar com o servidor local.";
  }
});

function fazerLogout() {
  location.reload();
}

const titulos = {
  "view-dashboard": { t: "Visão Geral", s: "Monitoramento em tempo real" },
  "view-fila": {
    t: "Solicitações de Atendimento Humano",
    s: "Gerencie os usuários que aguardam interação.",
  },
  "view-connection": { t: "Motor WhatsApp", s: "Infraestrutura" },
  "view-history": { t: "Auditoria de Sessões", s: "Histórico Completo" },
};

dom.navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    dom.navItems.forEach((n) => n.classList.remove("active"));
    dom.viewSections.forEach((s) => s.classList.remove("active"));
    item.classList.add("active");
    const targetId = item.getAttribute("data-target");
    document.getElementById(targetId).classList.add("active");
    dom.headerTitle.innerText = titulos[targetId].t;
    dom.headerSubtitle.innerText = titulos[targetId].s;
  });
});

socket.on("status", (s) => {
  dom.statusText.innerText = s;
  dom.led.className =
    "indicator " +
    (s.includes("Conectado")
      ? "connected"
      : s.includes("Desconectado")
        ? "disconnected"
        : "");
  if (s.includes("Conectado")) {
    dom.qrImage.style.display = "none";
    dom.qrPlaceholder.style.display = "flex";
    dom.qrPlaceholder.innerHTML =
      '<i class="fa-solid fa-circle-check" style="color:var(--success);font-size:3rem;"></i>';
  }
});
socket.on("qr", (qr) => {
  if (qr) {
    dom.qrPlaceholder.style.display = "none";
    dom.qrImage.style.display = "block";
    dom.qrImage.src = qr;
  }
});
socket.on("bot-state", (ativo) => {
  dom.btnToggle.className = ativo ? "btn btn-primary" : "btn btn-warning";
  dom.btnToggle.innerHTML = ativo
    ? '<i class="fa-solid fa-pause"></i> Pausar Automação'
    : '<i class="fa-solid fa-play"></i> Retomar Automação';
});
function alternarBot() {
  socket.emit("toggle-bot");
}
function desconectarBot() {
  if (confirm("Ejetar WhatsApp do Servidor?")) socket.emit("force-logout");
}

async function carregarDados() {
  try {
    const [resKpis, resMetrics, resHistory] = await Promise.all([
      fetch("/api/kpis"),
      fetch("/api/metricas"),
      fetch("/api/historico"),
    ]);
    if (resKpis.ok) {
      const kpis = await resKpis.json();
      dom.kpiTotal.innerText = kpis.interacoes;
      dom.kpiUsers.innerText = kpis.usuarios;
    }
    if (resMetrics.ok) renderizarGrafico(await resMetrics.json());
    if (resHistory.ok) {
      historicoGlobal = await resHistory.json();
      renderizarFila();
      filtrarTabela();
    }
  } catch (e) {
    console.error("Erro na API", e);
  }
}

function renderizarFila() {
  const pendentes = historicoGlobal.filter(
    (u) => u.status === "Aguardando Humano",
  );

  dom.badgeTop.innerText = pendentes.length;
  dom.badgeSide.innerText = pendentes.length;
  dom.badgeTop.style.display = pendentes.length > 0 ? "block" : "none";
  dom.badgeSide.style.display = pendentes.length > 0 ? "block" : "none";

  if (pendentes.length === 0) {
    dom.filaAlert.innerHTML = `<i class="fa-solid fa-circle-check"></i> Tudo tranquilo! Não há solicitações pendentes.`;
    dom.filaAlert.style.backgroundColor = "#ecfdf5";
    dom.filaAlert.style.color = "#065f46";
    dom.filaAlert.style.borderColor = "#a7f3d0";
    dom.tabelaFila.innerHTML = `<tr><td colspan="5" class="text-center hint-text">Ninguém na fila.</td></tr>`;
    return;
  }

  dom.filaAlert.innerHTML = `<i class="fa-solid fa-circle-info"></i> Existem ${pendentes.length} solicitação(ões) pendente(s) requerendo atenção.`;
  dom.filaAlert.style.backgroundColor = "#e0e7ff";
  dom.filaAlert.style.color = "#1e3a8a";
  dom.filaAlert.style.borderColor = "#c7d2fe";

  dom.tabelaFila.innerHTML = pendentes
    .map((u) => {
      const minutos = Math.floor(
        (new Date() - new Date(u.data_inicio + "Z")) / 60000,
      );
      const statusLabel =
        minutos > 10
          ? '<span class="badge-urgente">URGENTE</span>'
          : '<span class="badge-novo">NOVO</span>';
      const iniciais = u.nome.substring(0, 2).toUpperCase();

      return `<tr>
            <td><div class="user-cell"><div class="avatar">${iniciais}</div><div><strong>${u.nome}</strong></div></div></td>
            <td style="color: var(--text-muted)">${u.telefone_formatado}</td>
            <td style="color: var(--danger); font-weight: 500;"><i class="fa-regular fa-clock"></i> ${minutos} min</td>
            <td>${statusLabel}</td>
            <td><button onclick="concluirTransbordo('${u.telefone_original}')" class="btn btn-primary" style="padding: 8px 15px;">Finalizar Atendimento</button></td>
        </tr>`;
    })
    .join("");
}

function renderizarTabela(dados) {
  if (dados.length === 0) {
    dom.tabela.innerHTML = `<tr><td colspan="4" class="text-center hint-text">Nenhum registro.</td></tr>`;
    return;
  }
  dom.tabela.innerHTML = dados
    .map((u) => {
      let statusText =
        u.status === "Concluído"
          ? `<span style="color: var(--success);"><i class="fa-solid fa-check-double"></i> Concluído</span>`
          : u.status === "Aguardando Humano"
            ? `<span style="color: var(--warning);"><i class="fa-solid fa-headset"></i> Aguardando...</span>`
            : `<span style="color: var(--primary);"><i class="fa-solid fa-robot"></i> Em andamento</span>`;
      return `<tr>
            <td style="color: var(--text-muted)">${u.data_hora}</td>
            <td><strong>${u.nome}</strong></td>
            <td>${u.telefone_formatado}</td>
            <td>${statusText}</td>
        </tr>`;
    })
    .join("");
}

async function concluirTransbordo(telefone) {
  if (!confirm("Encerrar suporte humano e reativar o robô para este aluno?"))
    return;
  try {
    await fetch("/api/encerrar-atendimento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefone }),
    });
    exibirToast("Atendimento humano concluído!", "success");
    carregarDados();
  } catch (e) {}
}

function filtrarTabela() {
  const termo = dom.inputPesquisa.value.toLowerCase();
  const filtrados = historicoGlobal.filter(
    (u) =>
      u.telefone_formatado.includes(termo) ||
      u.nome.toLowerCase().includes(termo),
  );
  renderizarTabela(filtrados);
}

function exportarCSV() {
  let csv = "\uFEFFData;Aluno;Número;Status\n";
  historicoGlobal.forEach(
    (r) =>
      (csv += `"${r.data_hora}";"${r.nome}";"${r.telefone_formatado}";"${r.status}"\n`),
  );
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  link.download = "auditoria.csv";
  link.click();
}

function renderizarGrafico(dados) {
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(
    document.getElementById("menuChart").getContext("2d"),
    {
      type: "bar",
      data: {
        labels: dados.map((d) => d.menu_acessado),
        datasets: [
          {
            data: dados.map((d) => d.total),
            backgroundColor: "#1e3a8a",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    },
  );
}
setInterval(carregarDados, 10000);

// ==========================================
// 🚀 MOTOR DO CMS (GERENCIADOR DE CONTEÚDO)
// ==========================================
const titulosCMS = {
  "view-cms": {
    t: "Editor de Textos",
    s: "Altere as mensagens e links do robô sem precisar programar.",
  },
};
Object.assign(titulos, titulosCMS); // Adiciona o título da nova tela no roteador

async function carregarCMS() {
  try {
    const res = await fetch("/api/conteudos");
    if (res.ok) {
      const conteudos = await res.json();
      const container = document.getElementById("cms-container");
      container.innerHTML = conteudos
        .map(
          (c) => `
                <div style="margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid var(--border);">
                    <label style="font-weight: 700; color: var(--primary); display: block; margin-bottom: 10px;">
                        <i class="fa-solid fa-message"></i> ${c.titulo}
                    </label>
                    <textarea id="cms-${c.chave}" rows="6" style="width: 100%; padding: 15px; border-radius: 8px; border: 1px solid var(--border); font-family: monospace; font-size: 0.9rem; line-height: 1.5; resize: vertical;">${c.texto}</textarea>
                    <button onclick="salvarCMS('${c.chave}')" class="btn btn-primary" style="margin-top: 10px;">
                        <i class="fa-solid fa-floppy-disk"></i> Salvar Alterações
                    </button>
                </div>
            `,
        )
        .join("");
    }
  } catch (e) {
    console.error("Erro no CMS:", e);
  }
}

async function salvarCMS(chave) {
  const texto = document.getElementById(`cms-${chave}`).value;
  try {
    const res = await fetch("/api/conteudos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chave, texto }),
    });
    if (res.ok) {
      exibirToast("Texto atualizado no robô com sucesso!", "success");
    } else {
      exibirToast("Erro ao atualizar o texto.", "error");
    }
  } catch (e) {
    exibirToast("Erro de conexão com o CMS.", "error");
  }
}
