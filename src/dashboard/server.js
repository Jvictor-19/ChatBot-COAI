const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const qrcode = require("qrcode");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const { formatarNumero } = require("../utils");

async function obterBanco() {
  return open({
    filename: path.join(process.cwd(), "banco_coai.db"),
    driver: sqlite3.Database,
  });
}

const iniciarDashboard = (client) => {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  app.use(express.static(path.join(process.cwd(), "src/dashboard/public")));
  app.use(express.json());

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    if (email === "coai@ufs.br" && password === "coai2026")
      res.json({ success: true });
    else res.status(401).json({ success: false });
  });

  app.get("/api/kpis", async (req, res) => {
    try {
      const db = await obterBanco();
      const interacoes = await db.get(
        `SELECT COUNT(*) as count FROM atendimentos`,
      );
      const usuarios = await db.get(`SELECT COUNT(*) as count FROM usuarios`);
      res.json({ interacoes: interacoes.count, usuarios: usuarios.count });
    } catch (e) {
      res.status(500).json({ error: "Erro" });
    }
  });

  app.get("/api/metricas", async (req, res) => {
    try {
      const db = await obterBanco();
      const dados = await db.all(
        `SELECT menu_acessado, COUNT(*) as total FROM metricas GROUP BY menu_acessado ORDER BY total DESC`,
      );
      res.json(dados);
    } catch (e) {
      res.status(500).json({ error: "Erro" });
    }
  });

  app.get("/api/historico", async (req, res) => {
    try {
      const db = await obterBanco();
      const atendimentos = await db.all(`
                SELECT a.id, a.telefone, u.nome, a.status, a.data_inicio as data_raw, datetime(a.data_inicio, 'localtime') as data_hora 
                FROM atendimentos a LEFT JOIN usuarios u ON a.telefone = u.telefone ORDER BY a.id DESC LIMIT 100
            `);
      const payload = atendimentos.map((atd) => ({
        id: atd.id,
        telefone_original: atd.telefone,
        telefone_formatado: formatarNumero(atd.telefone),
        nome: atd.nome || "Aluno(a)",
        status: atd.status,
        data_inicio: atd.data_raw,
        data_hora: atd.data_hora,
      }));
      res.json(payload);
    } catch (e) {
      res.status(500).json({ error: "Erro" });
    }
  });

  app.post("/api/encerrar-atendimento", async (req, res) => {
    const { telefone } = req.body;
    try {
      const db = await obterBanco();
      await db.run(
        `UPDATE atendimentos SET status = 'Concluído', data_fim = CURRENT_TIMESTAMP WHERE telefone = ? AND status != 'Concluído'`,
        [telefone],
      );
      const { userSessions } = require("../session");
      userSessions.delete(telefone);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erro" });
    }
  });

  // 🚀 API DO CMS (LER E SALVAR TEXTOS)
  app.get("/api/conteudos", async (req, res) => {
    try {
      const db = await obterBanco();
      const conteudos = await db.all(`SELECT * FROM conteudos`);
      res.json(conteudos);
    } catch (e) {
      res.status(500).json({ error: "Erro" });
    }
  });

  app.post("/api/conteudos", async (req, res) => {
    const { chave, texto } = req.body;
    try {
      const db = await obterBanco();
      await db.run(`UPDATE conteudos SET texto = ? WHERE chave = ?`, [
        texto,
        chave,
      ]);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erro" });
    }
  });

  if (client.botAtivo === undefined) client.botAtivo = true;
  io.on("connection", (socket) => {
    socket.emit(
      "status",
      client.info ? "Conectado" : "Aguardando Pareamento...",
    );
    socket.emit("bot-state", client.botAtivo);
    socket.on("toggle-bot", () => {
      client.botAtivo = !client.botAtivo;
      io.emit("bot-state", client.botAtivo);
    });
    socket.on("force-logout", async () => {
      try {
        io.emit("status", "Desconectando...");
        await client.logout();
        setTimeout(() => client.initialize(), 3000);
      } catch (err) {
        await client.destroy().catch(() => {});
        client.initialize();
      }
    });
  });

  client.on("qr", async (qr) => {
    try {
      const urlImagem = await qrcode.toDataURL(qr);
      io.emit("qr", urlImagem);
      io.emit("status", "Renderizando...");
    } catch (err) {}
  });
  client.on("ready", () => {
    io.emit("status", "Conectado");
    io.emit("qr", null);
  });
  client.on("disconnected", () => {
    io.emit("status", "Desconectado");
    setTimeout(() => client.initialize(), 3000);
  });

  server.listen(3000, () => {
    console.log(`[+] Dashboard em http://localhost:3000`);
  });
};
module.exports = { iniciarDashboard };
