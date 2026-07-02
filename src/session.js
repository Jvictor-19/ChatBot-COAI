const { adicionarRegistroPlanilha } = require("./planilha"); // 📊 Importa o nosso carteiro
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");

// Função rápida para abrir a conexão com a memória local
async function obterBanco() {
  return open({
    filename: path.join(__dirname, "../banco_coai.db"),
    driver: sqlite3.Database,
  });
}

const userSessions = new Map();
const userTimers = new Map();

// Ajustado para 30 minutos de inatividade (30 * 60 * 1000 milissegundos)
const TEMPO_INATIVIDADE = 1800000;

const resetarCronometro = (client, remetente) => {
  if (userTimers.has(remetente)) clearTimeout(userTimers.get(remetente));

  const timer = setTimeout(async () => {
    try {
      // 🧠 1. Puxar os dados do aluno antes de apagar a memória
      const db = await obterBanco();

      // Busca o nome do usuário
      const usuario = await db.get(
        `SELECT nome FROM usuarios WHERE telefone = ?`,
        [remetente],
      );
      const nomeStr = usuario ? usuario.nome : "Aluno(a)";

      // Busca a última ação/menu que ele acessou
      const metrica = await db.get(
        `SELECT menu_acessado FROM metricas WHERE telefone = ? ORDER BY id DESC LIMIT 1`,
        [remetente],
      );
      const menuStr = metrica ? metrica.menu_acessado : "Apenas iniciou";

      // 📊 2. Enviar o pacote de dados para o Google Sheets!
      await adicionarRegistroPlanilha(
        remetente,
        nomeStr,
        menuStr,
        "Encerrado por inatividade",
      );

      // 3. Manda a mensagem de despedida para o WhatsApp
      const msgEncerramento =
        `⏳ *Sessão Expirada*\n\n` +
        `Como não houve resposta nos últimos 30 minutos, seu atendimento automático foi encerrado.\n\n` +
        `🔄 Para acessar os menus novamente, basta enviar um *Oi* a qualquer momento! 👋`;

      await client.sendMessage(remetente, msgEncerramento);

      // 4. Limpa a memória RAM do bot
      userSessions.delete(remetente);
      userTimers.delete(remetente);
    } catch (error) {
      console.error("❌ Erro no timeout e exportação:", error);
    }
  }, TEMPO_INATIVIDADE);

  userTimers.set(remetente, timer);
};

module.exports = { userSessions, resetarCronometro };
