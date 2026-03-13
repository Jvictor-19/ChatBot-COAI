const userSessions = new Map();
const userTimers = new Map();
const TEMPO_INATIVIDADE = 180000; // 3 minutos

const resetarCronometro = (client, remetente) => {
  if (userTimers.has(remetente)) clearTimeout(userTimers.get(remetente));

  const timer = setTimeout(async () => {
    try {
      const msgEncerramento =
        `⏳ *Atendimento Encerrado por Inatividade*\n\n` +
        `Como não tivemos mais interações, estou encerrando esta sessão.\n` +
        `🔄 Digite *Menu* para reiniciar o chatbot quando precisar.`;

      await client.sendMessage(remetente, msgEncerramento);
      userSessions.delete(remetente);
      userTimers.delete(remetente);
    } catch (error) {
      console.error("Erro no timeout:", error);
    }
  }, TEMPO_INATIVIDADE);

  userTimers.set(remetente, timer);
};

module.exports = { userSessions, resetarCronometro };
