const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");

async function iniciarBanco() {
  const db = await open({
    filename: path.join(__dirname, "../banco_coai.db"),
    driver: sqlite3.Database,
  });

  await db.exec(
    `CREATE TABLE IF NOT EXISTS usuarios (telefone TEXT PRIMARY KEY, nome TEXT, data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  );
  await db.exec(
    `CREATE TABLE IF NOT EXISTS metricas (id INTEGER PRIMARY KEY AUTOINCREMENT, telefone TEXT, menu_acessado TEXT, data_acesso DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  );
  await db.exec(
    `CREATE TABLE IF NOT EXISTS feedbacks (id INTEGER PRIMARY KEY AUTOINCREMENT, telefone TEXT, resolveu_problema TEXT, data_feedback DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  );
  await db.exec(
    `CREATE TABLE IF NOT EXISTS atendimentos (id INTEGER PRIMARY KEY AUTOINCREMENT, telefone TEXT, status TEXT DEFAULT 'Em andamento', data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP, data_fim DATETIME)`,
  );

  // 🚀 FASE 3: CMS - Tabela para os textos dinâmicos do Bot
  await db.exec(`
    CREATE TABLE IF NOT EXISTS conteudos (
      chave TEXT PRIMARY KEY,
      titulo TEXT,
      texto TEXT
    )
  `);

  // Se a tabela estiver vazia, injeta os textos padrões
  const conteudosCount = await db.get(
    `SELECT COUNT(*) as count FROM conteudos`,
  );
  if (conteudosCount.count === 0) {
    const defaultTexts = [
      [
        "lgpd",
        "1. Aviso de Privacidade (LGPD)",
        "⚖️ *Aviso de Privacidade (LGPD)*\n\nPara melhorar nosso atendimento, armazenamos apenas suas requisições de menu. Nenhuma informação sensível é coletada.\n\nPara começarmos, como você gostaria de ser chamado(a)?",
      ],
      [
        "menu_principal",
        "2. Opções do Menu Principal",
        "Como posso ajudar você hoje? Digite o *número* da opção desejada:\n\n*1️⃣* Solicitações de Apoio\n*2️⃣* Materiais e Orientações\n*3️⃣* Conheça o COAI Institucional\n\n*9️⃣* 🧑‍💻 Falar com Atendente Humano",
      ],
      [
        "menu_solicitacoes",
        "3. Menu: Solicitações de Apoio",
        "📝 *Solicitações de Apoio*\n\n*1️⃣* Como solicitar apoio?\n*2️⃣* Solicite Intérprete de Libras\n*3️⃣* Apoio Pedagógico\n*4️⃣* Apoio à Acessibilidade\n\n*0️⃣* Voltar ao Menu Principal",
      ],
      [
        "menu_materiais",
        "4. Menu: Materiais e Orientações",
        "📚 *Materiais e Orientações*\n\n*1️⃣* Cartilha do COAI\n*2️⃣* Orientações aos docentes\n*3️⃣* Espaço Acessibilidade (BICEN)\n\n*0️⃣* Voltar ao Menu Principal",
      ],
      [
        "menu_institucional",
        "5. Menu: Conheça o COAI",
        "🏛️ *Conheça o COAI*\n\n*1️⃣* Apresentação Completa\n*2️⃣* Nossas Ações\n*3️⃣* Nossa Equipe\n*4️⃣* Contato e Localização\n\n*0️⃣* Voltar ao Menu Principal",
      ],
      [
        "transbordo",
        "6. Mensagem de Transbordo (Aguardando Atendente)",
        "⏳ *Aguardando Atendente*\n\nSua solicitação foi encaminhada para a coordenação. Por favor, aguarde um momento, logo alguém irá te responder por aqui mesmo!",
      ],
    ];
    for (const [chave, titulo, texto] of defaultTexts) {
      await db.run(
        `INSERT INTO conteudos (chave, titulo, texto) VALUES (?, ?, ?)`,
        [chave, titulo, texto],
      );
    }
  }

  console.log(
    "🗄️ Banco de Dados V3 inciado (Suporte a CMS e Textos Dinâmicos)!",
  );
  return db;
}

module.exports = { iniciarBanco };
