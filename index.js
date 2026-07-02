const { Client, LocalAuth } = require("whatsapp-web.js");
const { userSessions, resetarCronometro } = require("./src/session");
const roteador = require("./src/menus/roteador");
const { iniciarBanco } = require("./src/database"); // Importação do Banco de Dados
const { iniciarDashboard } = require("./src/dashboard/server"); // Importação do Dashboard Web

const client = new Client({
  authStrategy: new LocalAuth(), // Mantém a sua estratégia de cache atual
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  },
});

// Garante que o estado inicial do robô seja ATIVO
client.botAtivo = true;

client.on("qr", (qr) => {
  console.log("📲 QR Code interceptado pelo backend. Enviando para o site...");
});

client.on("ready", () => console.log("✅ Motor do COAI conectado!"));

client.on("message", async (msg) => {
  // 🛑 TRAVA DO PAINEL: Se o bot estiver inativo, ignora a mensagem imediatamente
  if (client.botAtivo === false) return;

  if (
    !msg.from ||
    msg.from.endsWith("@g.us") ||
    msg.from === "status@broadcast"
  )
    return;
  const chat = await msg.getChat();
  if (chat.isGroup) return;

  const texto = msg.body ? msg.body.trim().toLowerCase() : "";
  const remetente = msg.from;

  resetarCronometro(client, remetente);

  // Palavras-chave para forçar o reinício
  let estadoAtual = userSessions.get(remetente);
  const palavrasReset = [
    "menu",
    "oi",
    "olá",
    "ola",
    "voltar",
    "inicio",
    "início",
  ];

  if (!estadoAtual || palavrasReset.includes(texto)) {
    estadoAtual = "INICIO";
  }

  // Chama o roteador passando o controle para as pastas de menus
  await roteador(client, msg, estadoAtual);
});

// ==========================================
// 🛡️ VACINA ANTI-TRAVAMENTO (Graceful Shutdown)
// ==========================================
const fecharServidor = async () => {
  console.log("\n⚠️ Sinal de encerramento recebido (Ctrl+C).");
  console.log(
    "🛑 Fechando o Chrome invisível em background para não corromper a sessão...",
  );
  try {
    await client.destroy();
    console.log("✅ WhatsApp ejetado da memória com sucesso. Até logo!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao fechar o navegador:", err);
    process.exit(1);
  }
};

// Intercepta o Ctrl+C no terminal do Windows/Linux
process.on("SIGINT", fecharServidor);
process.on("SIGTERM", fecharServidor);

// 🚀 Sequência de Ignição: Banco -> Dashboard Web -> WhatsApp
iniciarBanco()
  .then(() => {
    console.log("🗄️ Banco de dados pronto. Subindo o servidor web...");
    // LIGA A PORTA 3000 IMEDIATAMENTE ANTES DO WHATSAPP PESADO CARREGAR
    iniciarDashboard(client);

    console.log("🤖 Inicializando instâncias do WhatsApp...");
    client.initialize();
  })
  .catch((erro) => {
    console.error("❌ Erro crítico ao iniciar o banco de dados:", erro);
  });
