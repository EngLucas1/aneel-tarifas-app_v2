# ⚡ ANEEL Tarifas A4 - Gestor e Consulta Tarifária

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ativo%20%26%20Online-brightgreen?style=for-the-badge&logo=github)](https://pages.github.com/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![ANEEL](https://img.shields.io/badge/Dados%20Oficiais-ANEEL%20Gov%20BR-0052cc?style=for-the-badge)](https://dadosabertos.aneel.gov.br/)

Aplicação web estática moderna desenvolvida para consulta, registro e preenchimento automatizado dos valores de **Demanda (R$/kW)**, **TUSD Ponta e Fora Ponta (R$/kWh)** e **TE Ponta e Fora Ponta (R$/kWh)** para tarifas do **Grupo A4 Verde e Azul**, com base na **Resolução Homologatória mais recente (ATUAL)** e na **Resolução Imediatamente Anterior (ANTERIOR)** publicadas pela ANEEL.

> 🚀 **100% Estática e Pronta para o GitHub Pages**: Não necessita de backend, Node.js ou banco de dados externo. Funciona diretamente em qualquer navegador e hospeda gratuitamente no GitHub Pages.

---

## 🌐 Como Publicar no seu GitHub Pages (Passo a Passo Rápido)

### Método 1: Criando o Repositório e Subindo pelo Navegador (Sem Instalação)
1. Acesse [github.com/new](https://github.com/new) e crie um novo repositório (ex: `aneel-tarifas-app`). Deixe o repositório como **Público**.
2. Na página inicial do repositório, clique em **"uploading an existing file"**.
3. Arraste todos os arquivos e pastas deste diretório:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `.nojekyll`
   - `404.html`
   - pastas `data/` e `js/`
   - pasta `.github/`
4. Clique em **"Commit changes"**.
5. No GitHub, vá na aba **Settings** > **Pages** (no menu lateral esquerdo):
   - Em **Source**, selecione **"GitHub Actions"** (para deploy automático via nosso workflow `.github/workflows/deploy.yml`) **OU** selecione **"Deploy from a branch"** > branch `main` > pasta `/ (root)` e clique em **Save**.
6. Aguarde 1 minuto: seu link estará no ar em:  
   `https://<seu-usuario>.github.io/<nome-do-repositorio>/`

---

### Método 2: Pelo Terminal / VS Code / Git
Se você tem o Git ou o GitHub Desktop instalado no seu computador:

```bash
# 1. Inicialize o repositório local
git init

# 2. Adicione todos os arquivos
git add .
git commit -m "feat: ANEEL Tarifas A4 inicial pronto para GitHub Pages"

# 3. Vincule ao seu repositório no GitHub
git branch -M main
git remote add origin https://github.com/<seu-usuario>/<nome-do-repositorio>.git

# 4. Envie os arquivos
git push -u origin main
```

Em seguida, acesse **Settings > Pages** no seu repositório para ativar a publicação!

---

## 💻 Como Executar Localmente no seu Computador

A aplicação pode ser aberta de duas maneiras no Windows:

- **Sem servidor (Direto no Navegador):** Basta dar duplo clique no arquivo [`index.html`](file:///C:/Users/user/.gemini/antigravity-ide/scratch/aneel-tarifas-app/index.html) em qualquer navegador (Edge, Chrome, Firefox).
- **Via Servidor Local:** Dê duplo clique em [`Abrir_Aplicacao.bat`](file:///C:/Users/user/.gemini/antigravity-ide/scratch/aneel-tarifas-app/Abrir_Aplicacao.bat) para abrir via servidor web local em `http://localhost:8080/`.

---

## 📊 Estrutura dos Dados de Entrada e Saída (Grupo A4)

A aplicação segue a estrutura exata do modelo de planilha do setor elétrico:

| Bloco | Componente | Modalidade Verde | Modalidade Azul | Unidade |
| :--- | :--- | :--- | :--- | :--- |
| **ANTERIOR** | TUSD Ponta | R$/kWh | R$/kWh | R$/kWh |
| **ANTERIOR** | TUSD Fora Ponta | R$/kWh | R$/kWh | R$/kWh |
| **ANTERIOR** | TE Ponta | R$/kWh | R$/kWh | R$/kWh |
| **ANTERIOR** | TE Fora Ponta | R$/kWh | R$/kWh | R$/kWh |
| **ANTERIOR** | Demanda Ponta | R$/kW (Única) | R$/kW (Ponta) | R$/kW |
| **ANTERIOR** | Demanda Fora Ponta | R$/kW (Única) | R$/kW (Fora Ponta) | R$/kW |
| **ANTERIOR** | Resolução | Número e Data da REH Anterior | - | Texto |
| **ATUAL** | TUSD Ponta | R$/kWh | R$/kWh | R$/kWh |
| **ATUAL** | TUSD Fora Ponta | R$/kWh | R$/kWh | R$/kWh |
| **ATUAL** | TE Ponta | R$/kWh | R$/kWh | R$/kWh |
| **ATUAL** | TE Fora Ponta | R$/kWh | R$/kWh | R$/kWh |
| **ATUAL** | Demanda Ponta | R$/kW (Única) | R$/kW (Ponta) | R$/kW |
| **ATUAL** | Demanda Fora Ponta | R$/kW (Única) | R$/kW (Fora Ponta) | R$/kW |
| **ATUAL** | Resolução | Número e Data da REH Atual | - | Texto |

---

## ⚡ Principais Funcionalidades

1. **Conexão Direta com a API de Dados Abertos da ANEEL (Portal CKAN)**:
   - Integração com o recurso oficial de tarifas homologadas: [`fcf2906c-7c32-4b9b-a637-054e7a5234f4`](https://dadosabertos.aneel.gov.br/dataset/tarifas-distribuidoras-energia-eletrica/resource/fcf2906c-7c32-4b9b-a637-054e7a5234f4).
   - Botão **"Sincronizar via API ANEEL"** busca dados em lote ao vivo diretamente do portal governamental com barra de progresso visual em tempo real.
   - Arquitetura **JSONP + Proxy Fallback** para garantir funcionamento 100% livre de bloqueios CORS no navegador (GitHub Pages, Edge, Chrome, etc.).
   - Armazenamento em cache inteligente (`localStorage`) para consultas ultra-rápidas.
2. **Upload de Planilha Excel**: Arraste ou selecione qualquer arquivo `.xlsx`, `.xls` ou `.csv` contendo uma lista de concessionárias. A aplicação extrai e mapeia os nomes automaticamente sem enviar seus dados para nenhum servidor externo (100% privado).
3. **40 Concessionárias Padrão**: Botão com 1 clique para carregar imediatamente as 40 distribuidoras do modelo nacional.
4. **Mapeamento Inteligente (Alias Matcher)**: Reconhece siglas e variações de nomes comerciais (ex: `Energisa TO`, `Enel SP`, `CEMIG`, `CPFL Paulista`, `Amazonas Energia`, `Roraima Energia`).
5. **Várias Visões de Tabela**:
   - **Visão Completa**: Todos os 26 campos de Anterior e Atual lado a lado com cabeçalho multinível idêntico ao modelo físico.
   - **Foco Tarifa Verde**: Demanda, TUSD P/FP e TE P/FP.
   - **Foco Tarifa Azul**: Demanda P/FP, TUSD P/FP e TE P/FP.
   - **Comparativo de Reajuste (Δ%)**: Variação percentual calculada automaticamente.
6. **Exportação Excel (.xlsx)**:
   - Botão **"Baixar Excel Preenchido (.xlsx)"** gera arquivo nativo com cabeçalhos mesclados em múltiplos níveis.
   - Botão **"Copiar p/ Excel"** para copiar em formato TSV e colar diretamente em qualquer planilha aberta.
7. **Consulta Direta no Portal ANEEL**:
   - Modal com detalhes completos da concessionária e link direto para a consulta pública oficial da ANEEL: [https://calculostarifarios.aneel.gov.br/lista-publica](https://calculostarifarios.aneel.gov.br/lista-publica).
   - Botão **"Recarregar via API"** dentro do modal para consultar uma distribuidora específica sob demanda.

---

## 📁 Estrutura de Arquivos do Projeto

```
aneel-tarifas-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automação de deploy contínuo no GitHub Pages
├── data/
│   ├── tarifas_database.js     # Base consolidada ANEEL em JavaScript para inicialização instantânea
│   └── tarifas_consolidated.json # Base de dados em formato JSON puro
├── js/
│   ├── aneel-api.js            # Cliente oficial da API CKAN de Dados Abertos da ANEEL (fcf2906c)
│   └── xlsx.full.min.js        # Biblioteca SheetJS embutida localmente (offline e sem dependências)
├── .nojekyll                   # Garante que o GitHub Pages sirva todos os arquivos estáticos
├── 404.html                    # Página 404 personalizada com redirecionamento automático
├── Abrir_Aplicacao.bat         # Atalho de execução local rápida no Windows
├── index.html                  # Interface web principal responsiva e moderna
├── styles.css                  # Folha de estilos completa (Dark Theme, Glassmorphism, Variáveis CSS)
├── app.js                      # Lógica da aplicação, cálculos de tarifas e exportação Excel
├── server.ps1                  # Servidor web local em PowerShell (porta 8080)
└── README.md                   # Documentação completa do projeto
```

---

## 📄 Licença e Fonte dos Dados

- Os dados tarifários são públicos e providos pela **Agência Nacional de Energia Elétrica (ANEEL)** via portal de [Dados Abertos ANEEL](https://dadosabertos.aneel.gov.br/).
- Recurso utilizado: [`tarifas-homologadas-distribuidoras-energia-eletrica.csv (fcf2906c-7c32-4b9b-a637-054e7a5234f4)`](https://dadosabertos.aneel.gov.br/dataset/tarifas-distribuidoras-energia-eletrica/resource/fcf2906c-7c32-4b9b-a637-054e7a5234f4).
- Desenvolvido para livre uso, consulta e auditoria de tarifas de energia do mercado cativo brasileiro.
