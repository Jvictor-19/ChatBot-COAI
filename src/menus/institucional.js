const { simularDigitacao } = require("../utils");
const { userSessions } = require("../session");

module.exports = async (client, msg, estadoAtual) => {
  const chat = await msg.getChat();
  const remetente = msg.from;
  const texto = msg.body.trim().toLowerCase();

  // 🧠 O Botão 0 Inteligente
  if (texto === "0") {
    if (estadoAtual === "LENDO_INSTITUCIONAL") {
      userSessions.set(remetente, "MENU_PRINCIPAL");
      msg.body = "3"; // Finge que o usuário digitou '3' no início
      client.emit("message", msg);
    } else {
      userSessions.set(remetente, "INICIO");
      msg.body = "menu"; // Força o menu inicial
      client.emit("message", msg);
    }
    return;
  }

  await simularDigitacao(chat);

  if (texto === "1") {
    const textoApresentacao =
      `🏛️ *Sobre o COAI / DAIN*\n\n` +
      `A COAI/DAIN tem como principal objetivo garantir o acesso de estudantes com deficiência e com Necessidades Educacionais Específicas (NEE) à vida acadêmica, com vistas a mitigar barreiras atitudinais, comunicacionais, pedagógicas, arquitetônicas e de comunicação.\n\n` +
      `*Nossa História:*\n` +
      `A Divisão de Ações Inclusivas (DAIN) iniciou suas atividades em 2014. Em abril de 2025, foi criada a *Coordenação de Ações Inclusivas (COAI)*. Mais recentemente, em dezembro de 2025, foi criada a *Pró-Reitoria de Acessibilidade e Ações Inclusivas (PROAAI)*, consolidando as ações voltadas à equidade e à garantia de direitos no âmbito da UFS.\n\n` +
      `_Digite *0* para voltar._`;
    await client.sendMessage(remetente, textoApresentacao);
    userSessions.set(remetente, "LENDO_INSTITUCIONAL"); // Sobe para o Andar 3
  } else if (texto === "2") {
    const textoAcoes =
      `📱 *Nossas Ações e Projetos*\n\n` +
      `Quer ficar por dentro de tudo o que a COAI realiza pela comunidade da UFS? 💙\n\n` +
      `Nosso mural oficial de projetos, eventos e ações de inclusão acontece em tempo real no nosso Instagram! É lá que publicamos nossas campanhas, oficinas e os resultados do nosso trabalho.\n\n` +
      `🔗 *Conheça e acompanhe:*\n` +
      `https://www.instagram.com/coai_ufs\n\n` +
      `✨ *Aproveite para seguir a nossa página e ative o sininho 🔔* lá no perfil! Assim você garante que não vai perder nenhuma novidade ou prazo importante dos nossos projetos.\n\n` +
      `_Digite *0* para voltar._`;

    await client.sendMessage(remetente, textoAcoes);
    userSessions.set(remetente, "LENDO_INSTITUCIONAL"); // Sobe para o Andar 3
  } else if (texto === "3") {
    // 1. Equipe de Gestão e Administração
    const equipeGestao =
      `👥 *Equipe COAI/DAIN - Gestão e Administração*\n\n` +
      `🔹 *Pró-reitora de Acessibilidade e Ações Inclusivas (PROAAI):*\n` +
      `Profa. Dra. Marília Cavalcante\n\n` +
      `🔹 *Coordenadora:*\nProfa. Dra. Bárbara Cristina da Silva Rosa\n\n` +
      `🔹 *Coordenadora Adjunta:*\nAntonella Moura da Silva\n\n` +
      `🔹 *Pedagoga:*\nLorena Santos Lima\n\n` +
      `🔹 *Secretária Executiva:*\nMiriam Carla Batista de Aragão de Melo\n\n` +
      `🔹 *Assistência Administrativa:*\nCarlos Frederico Resende da Costa Santos\nDeodata Maria Libório da Fonseca`;

    await client.sendMessage(remetente, equipeGestao);

    await simularDigitacao(chat, 500);

    // 2. Equipe de Intérpretes de Libras
    const equipeLibras =
      `🤟 *Equipe COAI/DAIN - Intérpretes de LIBRAS*\n\n` +
      `👤 *Servidores:*\n` +
      `• Analu Barbosa Santos Feitosa\n` +
      `• Egles Conceição Fontes Andrade\n` +
      `• Elielda Santos Bila da Silva\n` +
      `• Jorge Fortes dos Santos\n` +
      `• Marcelo de Oliveira Calumbi\n` +
      `• Marília da Silva Fortes\n` +
      `• Silvia Ribeiro Lima Costa\n\n` +
      `🤝 *Colaboradores:*\n` +
      `• Davi Bomfim dos Santos\n` +
      `• Débora Moreno Diniz\n` +
      `• Eliane Santos do Nascimento\n` +
      `• Elisana Alves Fraga\n` +
      `• Fabiana Santos Ramos Ataíde\n` +
      `• Gislaine Oliveira Vales\n` +
      `• Iara Fontes do Nascimento\n` +
      `• José Ferreira Filho\n` +
      `• Juliana Santos Fraga\n` +
      `• Kelly Isabelle Melo Lima Silva\n` +
      `• Priscila de Jesus Brito\n` +
      `• Rigleisson Gomes Feitosa\n` +
      `• Wagner Santos Guimarães\n` +
      `• Wilma Nunes Santos\n\n` +
      `_Digite *0* para voltar ao menu anterior._`;

    await client.sendMessage(remetente, equipeLibras);
    userSessions.set(remetente, "LENDO_INSTITUCIONAL"); // Sobe para o Andar 3
  } else if (texto === "4") {
    const textoContato =
      `📍 *Contato e Localização*\n\n` +
      `*Endereço:*\n` +
      `Ilha da Inclusão e Didática VI (Campus de São Cristóvão)\n\n` +
      `*Telefones:*\n` +
      `📞 (79) 3194-6588 *(Também é WhatsApp)*\n` +
      `📞 (79) 3194-7039\n\n` +
      `*E-mails:*\n` +
      `✉️ coai@academico.ufs.br\n` +
      `✉️ dain@academico.ufs.br\n` +
      `✉️ proaai@academico.ufs.br\n\n` +
      `_Digite *0* para voltar._`;
    await client.sendMessage(remetente, textoContato);
    userSessions.set(remetente, "LENDO_INSTITUCIONAL"); // Sobe para o Andar 3
  } else {
    await client.sendMessage(
      remetente,
      "Digite um número de *1 a 4*, ou *0* para voltar.",
    );
  }
};
