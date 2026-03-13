const { simularDigitacao, delay } = require("../utils");
const { userSessions } = require("../session");

module.exports = async (client, msg, estadoAtual) => {
  const chat = await msg.getChat();
  const remetente = msg.from;
  const texto = msg.body.trim().toLowerCase();

  // 🧠 O Botão 0 Inteligente
  if (texto === "0") {
    if (estadoAtual === "LENDO_MATERIAIS") {
      userSessions.set(remetente, "MENU_PRINCIPAL");
      msg.body = "2"; // Finge que o usuário digitou '2' no início
      client.emit("message", msg);
    } else {
      userSessions.set(remetente, "INICIO");
      msg.body = "menu"; // Força o menu inicial
      client.emit("message", msg);
    }
    return;
  }

  await simularDigitacao(chat);

  // 1. Cartilha do COAI
  if (texto === "1") {
    const textoCartilha =
      `📘 *Cartilha do COAI*\n\n` +
      `Nossa nova cartilha com todas as orientações sobre as ações inclusivas da UFS está passando por atualizações finais e **em breve estará disponível aqui** para download em PDF!\n\n` +
      `Agradecemos a compreensão e pedimos que fique de olho nas novidades. 😉\n\n` +
      `_Digite *0* para voltar._`;

    await client.sendMessage(remetente, textoCartilha);
    userSessions.set(remetente, "LENDO_MATERIAIS"); // Sobe para o Andar 3

    // 2. Orientações aos Docentes
  } else if (texto === "2") {
    const introDocentes =
      `👨‍🏫 *Orientações aos Docentes*\n\n` +
      `O corpo docente tem papel fundamental na inclusão de estudantes com deficiência. Para conduzir a vida acadêmica da melhor forma, separamos orientações essenciais. 👇`;
    await client.sendMessage(remetente, introDocentes);

    await simularDigitacao(chat, 500);

    const visualDocentes =
      `👁️ *1. Estudantes Cegos ou com Baixa Visão*\n\n` +
      `• *Arquivos:* Utilizam leitores de tela (.txt, .doc, .pdf). Ao pedir livros, inclua exemplares digitais.\n` +
      `• *Aulas:* Descreva imagens e slides verbalmente. Para baixa visão, entregue material impresso ampliado.\n` +
      `• *Avaliações:* Use computador com leitor de tela ou auxílio de ledor/escriba (evite provas orais). Para baixa visão, use prova ampliada.\n` +
      `• *Materiais Táteis:* Conteúdos visuais (ex: mapas) devem ser adaptados em relevo. A DAIN possui máquina fusora.`;
    await client.sendMessage(remetente, visualDocentes);

    await simularDigitacao(chat, 500);

    const surdosDocentes =
      `🤟 *2. Estudantes Surdos*\n\n` +
      `• *Intérpretes:* Toda atividade deve ter a participação do Tradutor Intérprete de Libras.\n` +
      `• *Antecedência:* Repasse o material da aula antes para os intérpretes pelo e-mail: dain.ufs@hotmail.com (informe professor, curso e disciplina).\n` +
      `• *Eventos:* Solicite intérprete para eventos com, no mínimo, *10 dias* de antecedência.\n\n` +
      `_Digite *0* para voltar ao menu anterior._`;
    await client.sendMessage(remetente, surdosDocentes);
    userSessions.set(remetente, "LENDO_MATERIAIS"); // Sobe para o Andar 3

    // 3. Espaço Acessibilidade (BICEN) - NOVO
  } else if (texto === "3") {
    const introBicen =
      `📚 *Espaço Acessibilidade – BICEN/UFS*\n\n` +
      `Localizado no térreo da Biblioteca Central (ao lado da Sala da DIALE), este espaço reservado para pesquisas e estudos visa facilitar o acesso à informação para discentes com deficiência.\n\n` +
      `⏰ *Horário:* Seg a Sex, das 07h às 19h.\n` +
      `📍 *Estrutura:* Rampas, mapas táteis, banheiros adaptados e elevador (norma ABNT NBR-9050).`;
    await client.sendMessage(remetente, introBicen);

    await simularDigitacao(chat, 500);

    const servicosBicen =
      `⚙️ *Serviços e Regras de Uso:*\n\n` +
      `• *Empréstimos:* Livros em Braille (prazo de 30 dias) e Audiobooks (10 dias). Exclusivo para deficientes visuais.\n` +
      `• *Impressão Braille:* Exclusivo para alunos e docentes (prazo varia com a demanda).\n` +
      `• *Equipamentos:* Computadores com DOSVOX e NVDA, lupas eletrônicas (baixa visão) e scanner falado.\n` +
      `• *Digitalização:* O escaneamento de textos impressos deve ser feito pelo tutor do aluno.\n` +
      `• *Apoio Profissional:* Intérprete de LIBRAS disponível para mediar o atendimento e acesso ao acervo.\n\n` +
      `⚠️ *Atenção:* Os serviços são exclusivos para alunos e servidores regulares. É necessário apresentar documento comprobatório de vínculo presencialmente no espaço.\n\n` +
      `_Digite *0* para voltar ao menu anterior._`;
    await client.sendMessage(remetente, servicosBicen);
    userSessions.set(remetente, "LENDO_MATERIAIS"); // Sobe para o Andar 3

    // Opção Inválida
  } else {
    await client.sendMessage(
      remetente,
      "Desculpe, opção inválida. 😕 Digite um número de *1 a 3*, ou *0* para voltar.",
    );
  }
};
