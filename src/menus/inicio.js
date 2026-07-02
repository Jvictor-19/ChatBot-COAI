const { simularDigitacao } = require("../utils");
const { userSessions } = require("../session");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");

async function obterBanco() {
  return open({
    filename: path.join(__dirname, "../../banco_coai.db"),
    driver: sqlite3.Database,
  });
}

// Função nativa do CMS para puxar textos
const getTexto = async (chave) => {
  try {
    const db = await obterBanco();
    const res = await db.get(`SELECT texto FROM conteudos WHERE chave = ?`, [
      chave,
    ]);
    return res ? res.texto : "Texto em manutenção.";
  } catch (e) {
    return "Erro no banco.";
  }
};

module.exports = async (client, msg, estadoAtual) => {
  const chat = await msg.getChat();
  const remetente = msg.from;
  const texto = msg.body.trim().toLowerCase();

  if (estadoAtual === "AGUARDANDO_ATENDENTE") return;

  if (estadoAtual === "INICIO") {
    userSessions.set(remetente, "PROCESSANDO_LGPD");

    let ehNovoUsuario = true;
    try {
      const db = await obterBanco();
      const usuarioExiste = await db.get(
        `SELECT nome FROM usuarios WHERE telefone = ?`,
        [remetente],
      );
      if (usuarioExiste && usuarioExiste.nome) ehNovoUsuario = false;
      await db.run(
        `INSERT INTO atendimentos (telefone, status) VALUES (?, 'Em andamento')`,
        [remetente],
      );
    } catch (erro) {}

    if (ehNovoUsuario) {
      await simularDigitacao(chat, 1000);
      const msgLGPD = await getTexto("lgpd"); // PUXA DO BANCO
      await client.sendMessage(remetente, msgLGPD);
      userSessions.set(remetente, "COLETA_NOME");
    } else {
      userSessions.set(remetente, "MENU_PRINCIPAL");
      msg.body = "menu";
      return module.exports(client, msg, "MENU_PRINCIPAL");
    }
  } else if (estadoAtual === "COLETA_NOME") {
    const nomeEscolhido = msg.body.trim();
    try {
      const db = await obterBanco();
      await db.run(
        `INSERT OR REPLACE INTO usuarios (telefone, nome) VALUES (?, ?)`,
        [remetente, nomeEscolhido],
      );
    } catch (erro) {}
    userSessions.set(remetente, "MENU_PRINCIPAL");
    msg.body = "menu";
    return module.exports(client, msg, "MENU_PRINCIPAL");
  } else if (estadoAtual === "MENU_PRINCIPAL") {
    const db = await obterBanco();

    if (
      texto === "menu" ||
      texto === "0" ||
      texto === "oi" ||
      texto === "olá"
    ) {
      let nomeSalvo = "Aluno(a)";
      try {
        const usuario = await db.get(
          `SELECT nome FROM usuarios WHERE telefone = ?`,
          [remetente],
        );
        if (usuario) nomeSalvo = usuario.nome;
      } catch (e) {}

      await simularDigitacao(chat, 500);
      const textoMenu = await getTexto("menu_principal"); // PUXA DO BANCO
      const saudacao =
        `Olá, *${nomeSalvo}*! 👋 Bem-vindo ao canal oficial do *COAI*.\n\n` +
        textoMenu;
      await client.sendMessage(remetente, saudacao);
      return;
    }

    if (texto === "1") {
      userSessions.set(remetente, "SUBMENU_SOLICITACOES");
      await db.run(
        `INSERT INTO metricas (telefone, menu_acessado) VALUES (?, ?)`,
        [remetente, "1 - Solicitações de Apoio"],
      );
      await simularDigitacao(chat);
      await client.sendMessage(remetente, await getTexto("menu_solicitacoes"));
    } else if (texto === "2") {
      userSessions.set(remetente, "SUBMENU_MATERIAIS");
      await db.run(
        `INSERT INTO metricas (telefone, menu_acessado) VALUES (?, ?)`,
        [remetente, "2 - Materiais e Orientações"],
      );
      await simularDigitacao(chat);
      await client.sendMessage(remetente, await getTexto("menu_materiais"));
    } else if (texto === "3") {
      userSessions.set(remetente, "SUBMENU_INSTITUCIONAL");
      await db.run(
        `INSERT INTO metricas (telefone, menu_acessado) VALUES (?, ?)`,
        [remetente, "3 - Conheça o COAI"],
      );
      await simularDigitacao(chat);
      await client.sendMessage(remetente, await getTexto("menu_institucional"));
    } else if (texto === "9") {
      userSessions.set(remetente, "AGUARDANDO_ATENDENTE");
      await db.run(
        `UPDATE atendimentos SET status = 'Aguardando Humano' WHERE telefone = ? AND status = 'Em andamento'`,
        [remetente],
      );
      await db.run(
        `INSERT INTO metricas (telefone, menu_acessado) VALUES (?, ?)`,
        [remetente, "9 - Transbordo Humano"],
      );
      await simularDigitacao(chat);
      await client.sendMessage(remetente, await getTexto("transbordo"));
    } else {
      await client.sendMessage(
        remetente,
        "Opção inválida. 😕 Digite *1*, *2*, *3* ou *9*.",
      );
    }
  }
};
