const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { userSessions, resetarCronometro } = require("./src/session");
const roteador = require("./src/menus/roteador");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--single-process"],
  },
});

client.on("qr", (qr) => {
  console.log("📲 Escaneie o QR Code abaixo:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => console.log("✅ Motor do COAI conectado!"));

client.on("message", async (msg) => {
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

client.initialize();
