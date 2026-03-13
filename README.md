# ChatBot COAI/DAIN - UFS

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)

Este é o repositório oficial do ChatBot de atendimento da **Coordenação de Ações Inclusivas (COAI/DAIN)** da Universidade Federal de Sergipe (UFS).

O sistema atua como o primeiro nível de atendimento (Tier 1) via WhatsApp, centralizando solicitações de apoio, distribuição de materiais adaptados e informações institucionais. O principal objetivo do projeto é **mitigar a dependência de navegação no site institucional**, reduzindo a fricção informacional e entregando diretrizes de acessibilidade e links de formulários de forma rápida, confiável e assíncrona.

---

##  Arquitetura e Padrões de Projeto (Versão 1.0)

O projeto foi construído sobre o runtime Node.js, utilizando uma arquitetura orientada a eventos e fortemente inspirada no padrão **MVC (Model-View-Controller)** para garantir escalabilidade:

* **Roteamento Inteligente (Controller):** O Roteador intercepta as mensagens, verifica a sessão ativa e delega a requisição para o módulo correto.
* **Máquina de Estados (State Machine):** Sistema robusto de gerenciamento de estado em memória (`Map()`). A navegação ocorre em 3 níveis de profundidade (Root, Node e Leaf), permitindo retenção de contexto e navegação bidirecional.
* **Fallback Polimórfico:** O comando de escape (`0`) age de forma dinâmica. Se acionado na leitura de um material, retorna ao submenu. Se acionado no submenu, retorna à raiz.
* **Trava de Sincronização (Mutex Lock):** Proteção arquitetural desenvolvida para ignorar as "Condições de Corrida" e "Eventos Fantasmas" nativos da plataforma WhatsApp, impedindo a duplicação de mensagens no envio inicial (Onboarding).
* **UX Conversacional:** Simulação humanizada de digitação e inatividade gerenciada automaticamente.

---

## Tecnologias e Dependências

* **Node.js (v21+):** Ambiente de execução base.
* **[whatsapp-web.js](https://wwebjs.dev/):** *Wrapper* extraoficial da API do WhatsApp.
* **Puppeteer:** Motor de renderização *headless* (Chromium) utilizado para instanciar a sessão segura.
* **qrcode-terminal:** Renderização da matriz de autenticação via CLI (Interface de Linha de Comando).

---

## Roadmap (Trabalhos Futuros)

A aplicação está em evolução contínua. As próximas *features* (Versão 2.0) incluem:

- [ ] **Integração com Banco de Dados (SQLite):** Persistência de contatos e criação de perfil de usuário (Onboarding com nome).
- [ ] **Módulo de BI e CRM:** Geração de métricas de uso, mapeamento de opções mais acessadas (Heatmap) e pesquisa de satisfação após inatividade.
- [ ] **Interface Gráfica Administrativa (GUI):** Empacotamento do motor Node.js com **Electron.js** para fornecer um painel Desktop executável (`.exe`) aos operadores da secretaria.
- [ ] **Transição para UI Nativas:** Migração dos menus numéricos para listas e botões clicáveis oficiais (avaliando a transição para a *Cloud API*).

---

## Como Instalar e Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/Jvictor-19/ChatBot-COAI.git](https://github.com/Jvictor-19/ChatBot-COAI.git)

---

## Autor

João Victor Pereira Santos
Estudante de Engenharia de Computação - Universidade Federal de Sergipe (UFS)

E-mail Acadêmico: joao_victor@academico.ufs.br
