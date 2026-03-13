const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const simularDigitacao = async (chat, tempoMs = 500) => {
  await chat.sendStateTyping();
  await delay(tempoMs);
};

module.exports = { delay, simularDigitacao };
