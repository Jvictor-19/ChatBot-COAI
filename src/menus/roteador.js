const inicio = require("./inicio");
const solicitacoes = require("./solicitacoes");
const materiais = require("./materiais");
const institucional = require("./institucional");

const roteador = async (client, msg, estadoAtual) => {
  try {
    switch (estadoAtual) {
      case "INICIO":
      case "MENU_PRINCIPAL":
        await inicio(client, msg, estadoAtual);
        break;

      case "SUBMENU_SOLICITACOES":
      case "LENDO_SOLICITACOES": // <-- Novo Andar
        await solicitacoes(client, msg, estadoAtual);
        break;

      case "SUBMENU_MATERIAIS":
      case "LENDO_MATERIAIS": // <-- Novo Andar
        await materiais(client, msg, estadoAtual);
        break;

      case "SUBMENU_INSTITUCIONAL":
      case "LENDO_INSTITUCIONAL": // <-- Novo Andar
        await institucional(client, msg, estadoAtual);
        break;
    }
  } catch (error) {
    console.error("❌ Erro no roteador:", error);
  }
};

module.exports = roteador;
