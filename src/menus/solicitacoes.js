const { MessageMedia } = require("whatsapp-web.js");
const { simularDigitacao, delay } = require("../utils");
const { userSessions } = require("../session");

module.exports = async (client, msg, estadoAtual) => {
  const chat = await msg.getChat();
  const remetente = msg.from;
  const texto = msg.body.trim().toLowerCase();

  // 🧠 O Botão 0 Inteligente
  if (texto === "0") {
    if (estadoAtual === "LENDO_SOLICITACOES") {
      userSessions.set(remetente, "MENU_PRINCIPAL");
      msg.body = "1"; // Finge que o usuário digitou '1' no início para puxar o submenu
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
    const textoApoio =
      `📝 *Como solicitar apoio?*\n\n` +
      `No geral, os discentes que ingressam na UFS sob a condição de Pessoa com Deficiência (PcD) e sua necessidade educacional específica (NEE), já têm seus dados registrados em nosso sistema.\n\n` +
      `⚠️ *Atenção:* Aqueles que *não* ingressaram através das cotas de PcD devem entrar em contato com a DAIN.\n\n` +
      `Para receber apoio personalizado, é crucial enviar uma solicitação através do nosso formulário. Essa solicitação pode ser feita pelo *próprio discente, por um docente ou pelo chefe do departamento*.\n\n` +
      `🔗 *Acesse o Formulário de Solicitação aqui:*\n` +
      `https://docs.google.com/forms/d/e/1FAIpQLSc9jNwEjY2IfXOxADn0_w7CYy7jc4Qnl46dCi-AwXqrJmLh8A/viewform?usp=pp_url\n\n` +
      `Estamos aqui para apoiar e facilitar o acesso à educação para todos os discentes da UFS! 💙`;
    await client.sendMessage(remetente, textoApoio);
    await simularDigitacao(chat, 2000);

    try {
      const media = MessageMedia.fromFilePath("./Cartilha-DAIN_reduz.pdf");
      await client.sendMessage(remetente, media, {
        caption:
          "📘 Confira nossa Cartilha Completa em PDF para mais detalhes!",
      });
    } catch (err) {
      console.error("❌ Arquivo PDF não encontrado.");
    }
    await delay(1000);
    await client.sendMessage(remetente, `\n_Digite *0* para voltar._`);
    userSessions.set(remetente, "LENDO_SOLICITACOES"); // Sobe para o Andar 3
  } else if (texto === "2") {
    const textoLibras =
      `🤟 *Tradutor e Intérprete de Libras*\n\n` +
      `Para solicitar o acompanhamento de um intérprete de Libras durante suas aulas e atividades acadêmicas, precisamos apenas que você preencha nosso formulário oficial.\n\n` +
      `🔗 *Acesse e preencha aqui:*\n` +
      `https://docs.google.com/forms/d/e/1FAIpQLSeGPFlD2_YvDutB0y698WQr-A9B0tbpuSBKtUNZ0Q3-wK2pbw/viewform\n\n` +
      `_Digite *0* para voltar._`;
    await client.sendMessage(remetente, textoLibras);
    userSessions.set(remetente, "LENDO_SOLICITACOES"); // Sobe para o Andar 3
  } else if (texto === "3") {
    const textoPedagogico =
      `📚 *Apoio Pedagógico (PcD e NEE)*\n\n` +
      `Se você necessita de adaptações de materiais, tempo adicional em avaliações, auxílio de ledores/escribas ou outros suportes pedagógicos para acompanhar suas disciplinas, faça sua solicitação.\n\n` +
      `🔗 *Acesse e preencha o formulário oficial aqui:*\n` +
      `https://docs.google.com/forms/d/e/1FAIpQLSdwDJStx3HGSOY5QgJDtx80rA76x62gXFPOKnoFDwyKQNW3mA/viewform\n\n` +
      `_Digite *0* para voltar._`;
    await client.sendMessage(remetente, textoPedagogico);
    userSessions.set(remetente, "LENDO_SOLICITACOES"); // Sobe para o Andar 3
  } else if (texto === "4") {
    const textoAcessibilidade =
      `♿ *Apoio à Acessibilidade*\n\n` +
      `Utilize este formulário para solicitar suporte estrutural, auxílio na locomoção, adaptação de espaços físicos ou empréstimo de equipamentos de tecnologia assistiva.\n\n` +
      `🔗 *Acesse e preencha sua solicitação aqui:*\n` +
      `https://docs.google.com/forms/d/e/1FAIpQLSfGcu8P8LDJ7Lbd_7MVhQQ9cNm1ovA6hcdlh90aZi6SxDwW8w/viewform\n\n` +
      `_Digite *0* para voltar._`;
    await client.sendMessage(remetente, textoAcessibilidade);
    userSessions.set(remetente, "LENDO_SOLICITACOES"); // Sobe para o Andar 3
  } else {
    await client.sendMessage(
      remetente,
      "Desculpe, opção inválida. 😕 Digite um número de *1 a 4*, ou *0* para voltar.",
    );
  }
};
