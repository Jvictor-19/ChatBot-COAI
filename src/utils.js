const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const simularDigitacao = async (chat, tempoMs = 500) => {
  await chat.sendStateTyping();
  await delay(tempoMs);
};

// NOVA FUNÇÃO: Limpa e formata o número real do WhatsApp
const formatarNumero = (idWhatsApp) => {
  if (!idWhatsApp) return "Desconhecido";
  let num = idWhatsApp.split("@")[0]; // Remove o @c.us

  if (num.startsWith("55") && num.length >= 12) {
    const ddd = num.slice(2, 4);
    const primParte = num.slice(4, -4);
    const segParte = num.slice(-4);
    return `+55 ${ddd} ${primParte}-${segParte}`;
  }
  return `+${num}`;
};

module.exports = { delay, simularDigitacao, formatarNumero };
