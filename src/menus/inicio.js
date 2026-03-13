const { simularDigitacao } = require("../utils");
const { userSessions } = require("../session");

module.exports = async (client, msg, estadoAtual) => {
  const chat = await msg.getChat();
  const remetente = msg.from;
  const texto = msg.body.trim().toLowerCase();

  if (estadoAtual === "INICIO") {
    // 🛡️ ESTADO TRANSITÓRIO: Coloca o usuário em uma "sala de espera".
    // Isso faz os eventos fantasmas serem ignorados pelo roteador!
    userSessions.set(remetente, "PROCESSANDO_INICIO");

    await simularDigitacao(chat, 500);
    const apresentacao =
      `Olá! 👋 Bem-vindo ao canal oficial do *COAI*.\n\n` +
      `Como posso ajudar você hoje? Digite o *número* da opção desejada:\n\n` +
      `*1️⃣* Solicitações de Apoio\n` +
      `*2️⃣* Materiais e Orientações\n` +
      `*3️⃣* Conheça o COAI Institucional`;

    await client.sendMessage(remetente, apresentacao);

    // Agora sim, libera o usuário para responder o menu principal
    userSessions.set(remetente, "MENU_PRINCIPAL");
  } else if (estadoAtual === "MENU_PRINCIPAL") {
    if (texto === "1") {
      userSessions.set(remetente, "SUBMENU_SOLICITACOES");
      await simularDigitacao(chat);
      const menuSol =
        `📝 *Solicitações de Apoio*\n\n` +
        `*1️⃣* Como solicitar apoio?\n` +
        `*2️⃣* Solicite Tradutor e Intérprete de Libras\n` +
        `*3️⃣* Solicite Apoio Pedagógico PcD e NEE\n` +
        `*4️⃣* Solicite Apoio à Acessibilidade\n\n` +
        `*0️⃣* Voltar ao Menu Principal`;
      await client.sendMessage(remetente, menuSol);
    } else if (texto === "2") {
      userSessions.set(remetente, "SUBMENU_MATERIAIS");
      await simularDigitacao(chat);
      const menuMat =
        `📚 *Materiais e Orientações*\n\n` +
        `*1️⃣* Cartilha do COAI\n` +
        `*2️⃣* Orientações aos docentes\n` +
        `*3️⃣* Espaço Acessibilidade (BICEN)\n\n` +
        `*0️⃣* Voltar ao Menu Principal`;
      await client.sendMessage(remetente, menuMat);
    } else if (texto === "3") {
      userSessions.set(remetente, "SUBMENU_INSTITUCIONAL");
      await simularDigitacao(chat);
      const menuInst =
        `🏛️ *Conheça o COAI*\n\n` +
        `*1️⃣* Apresentação Completa\n` +
        `*2️⃣* Nossas Ações\n` +
        `*3️⃣* Nossa Equipe\n` +
        `*4️⃣* Contato e Localização\n\n` +
        `*0️⃣* Voltar ao Menu Principal`;
      await client.sendMessage(remetente, menuInst);
    } else {
      await client.sendMessage(
        remetente,
        "Opção inválida. 😕 Digite *1*, *2* ou *3*.",
      );
    }
  }
};
