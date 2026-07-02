const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const credenciais = require("../credenciais.json"); // Puxa o seu arquivo secreto

// 1. Configura a Identidade do Robô
const serviceAccountAuth = new JWT({
  email: credenciais.client_email,
  key: credenciais.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// 2. Conecta na SUA Planilha
const PLANILHA_ID = "1Yh-z6H2a9DU-DfOpbElrqh4hg7Rh2lZHTI8rIiVGGaA"; // <--- COLE SEU ID AQUI
const doc = new GoogleSpreadsheet(PLANILHA_ID, serviceAccountAuth);

// 3. A Função que escreve os dados
async function adicionarRegistroPlanilha(telefone, nome, menu, status) {
  try {
    await doc.loadInfo(); // Conecta e carrega as abas
    const pagina = doc.sheetsByIndex[0]; // Seleciona a primeira aba (Página1)

    // Pega a data e hora atual no fuso horário do Brasil
    const dataAtual = new Date().toLocaleString("pt-BR");

    // Escreve uma nova linha (Exatamente na ordem das colunas A, B, C, D, E)
    await pagina.addRow([dataAtual, telefone, nome, menu, status]);

    console.log(`✅ Tabela do Google atualizada: ${nome} acessou [${menu}]`);
  } catch (erro) {
    console.error("❌ Erro de conexão com o Google Sheets:", erro);
  }
}

// ==========================================
// TESTE DE FOGO (Apagaremos isso depois)
// ==========================================
/*adicionarRegistroPlanilha(
  "5579999999999",
  "João Victor (Teste)",
  "Menu Principal",
  "Em andamento",
);*/

module.exports = { adicionarRegistroPlanilha };
