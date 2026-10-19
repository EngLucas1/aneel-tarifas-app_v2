/**
 * ANEEL Tarifas A4 - Gestor e Consulta Tarifária
 * Registra Demanda, TUSD P/FP e TE P/FP para tarifas Verde e Azul
 * com base na resolução homologatória mais recente e anterior da ANEEL.
 */

// 40 Concessionárias padrão do modelo da planilha Excel do usuário
const DEFAULT_CONCESSIONARIAS = [
  "Equatorial PA",
  "Energisa TO (ETO)",
  "Equatorial MA",
  "Energisa AC (EAC)",
  "Energisa RO (ERO)",
  "LIGHT (LIGHT SESA)",
  "Energisa MT (EMT)",
  "Energisa PB (EPB)",
  "SULGIPE",
  "Neoenergia PE",
  "Neoenergia BA (COELBA)",
  "Equatorial PI",
  "Energisa MS (EMS)",
  "CEMIG",
  "Equatorial AL",
  "COCEL",
  "RGE Sul",
  "Equatorial GO",
  "Neoenergia RN (COSERN)",
  "CELESC",
  "Roraima Energia (Boa Vista)",
  "Neoenergia Elektro (ELEKTRO)",
  "COPEL",
  "Enel CE",
  "Energisa SE (ESE)",
  "CEEE Equatorial",
  "CPFL Paulista",
  "CPFL Piratininga",
  "EDP SP",
  "Neoenergia Brasília (CEB)",
  "Enel RJ",
  "Enel SP (ELETROPAULO)",
  "Amazonas Energia",
  "Energisa Sul-Sudeste (ESS)",
  "Equatorial AP (CEA)",
  "CHESP",
  "CPFL Santa Cruz",
  "Energisa Minas Rio (EMR)",
  "EDP ES",
  "FORCEL (Pacto Energia PR)"
];

// Dicionário de Mapeamento para os nomes exatos de agentes da ANEEL no banco de dados
const ALIAS_MAP = {
  "equatorial pa": "EQUATORIAL PA",
  "energisa to (eto)": "ETO",
  "eto": "ETO",
  "equatorial ma": "EQUATORIAL MA",
  "energisa ac (eac)": "EAC",
  "eac": "EAC",
  "energisa ro (ero)": "ERO",
  "ero": "ERO",
  "light (light sesa)": "LIGHT SESA",
  "light": "LIGHT SESA",
  "energisa mt (emt)": "EMT",
  "emt": "EMT",
  "energisa pb (epb)": "EPB",
  "epb": "EPB",
  "sulgipe": "SULGIPE",
  "neoenergia pe": "Neoenergia PE",
  "celpe": "Neoenergia PE",
  "neoenergia ba (coelba)": "COELBA",
  "coelba": "COELBA",
  "equatorial pi": "EQUATORIAL PI",
  "cepisa": "EQUATORIAL PI",
  "energisa ms (ems)": "EMS",
  "ems": "EMS",
  "cemig": "CEMIG-D",
  "cemig-d": "CEMIG-D",
  "equatorial al": "EQUATORIAL AL",
  "ceal": "EQUATORIAL AL",
  "cocel": "COCEL",
  "rge sul": "RGE",
  "rge": "RGE",
  "equatorial go": "EQUATORIAL GO",
  "celg": "EQUATORIAL GO",
  "neoenergia rn (cosern)": "COSERN",
  "cosern": "COSERN",
  "celesc": "CELESC",
  "roraima energia (boa vista)": "ÂMBAR ENERGIA RR",
  "roraima energia": "ÂMBAR ENERGIA RR",
  "boa vista": "ÂMBAR ENERGIA RR",
  "âmbar energia rr": "ÂMBAR ENERGIA RR",
  "neoenergia elektro (elektro)": "ELEKTRO",
  "elektro": "ELEKTRO",
  "copel": "COPEL-DIS",
  "copel-dis": "COPEL-DIS",
  "enel ce": "ENEL CE",
  "coelce": "ENEL CE",
  "energisa se (ese)": "ESE",
  "ese": "ESE",
  "ceee equatorial": "CEEE-D",
  "ceee": "CEEE-D",
  "cpfl paulista": "CPFL-PAULISTA",
  "cpfl-paulista": "CPFL-PAULISTA",
  "cpfl piratininga": "CPFL-PIRATINING",
  "cpfl-piratining": "CPFL-PIRATINING",
  "edp sp": "EDP SP",
  "neoenergia brasília (ceb)": "Neoenergia Brasília",
  "neoenergia brasilia (ceb)": "Neoenergia Brasília",
  "neoenergia brasília": "Neoenergia Brasília",
  "ceb": "Neoenergia Brasília",
  "enel rj": "ENEL RJ",
  "ampla": "ENEL RJ",
  "enel sp (eletropaulo)": "ELETROPAULO",
  "eletropaulo": "ELETROPAULO",
  "amazonas energia": "Âmbar Amazonas",
  "âmbar amazonas": "Âmbar Amazonas",
  "ame": "Âmbar Amazonas",
  "energisa sul-sudeste (ess)": "ESS",
  "ess": "ESS",
  "equatorial ap (cea)": "CEA",
  "cea": "CEA",
  "chesp": "CHESP",
  "cpfl santa cruz": "CPFL Santa Cruz",
  "energisa minas rio (emr)": "EMR",
  "emr": "EMR",
  "edp es": "EDP ES",
  "escelsa": "EDP ES",
  "forcel (pacto energia pr)": "PACTO ENERGIA PR",
  "pacto energia pr": "PACTO ENERGIA PR",
  "forcel": "PACTO ENERGIA PR"
};

const AGENT_UF = {
  "EQUATORIAL PA": "PA",
  "ETO": "TO",
  "EQUATORIAL MA": "MA",
  "EAC": "AC",
  "ERO": "RO",
  "LIGHT SESA": "RJ",
  "EMT": "MT",
  "EPB": "PB",
  "SULGIPE": "SE",
  "Neoenergia PE": "PE",
  "COELBA": "BA",
  "EQUATORIAL PI": "PI",
  "EMS": "MS",
  "CEMIG-D": "MG",
  "EQUATORIAL AL": "AL",
  "COCEL": "PR",
  "RGE": "RS",
  "EQUATORIAL GO": "GO",
  "COSERN": "RN",
  "CELESC": "SC",
  "ÂMBAR ENERGIA RR": "RR",
  "ELEKTRO": "SP",
  "COPEL-DIS": "PR",
  "ENEL CE": "CE",
  "ESE": "SE",
  "CEEE-D": "RS",
  "CPFL-PAULISTA": "SP",
  "CPFL-PIRATINING": "SP",
  "EDP SP": "SP",
  "Neoenergia Brasília": "DF",
  "ENEL RJ": "RJ",
  "ELETROPAULO": "SP",
  "Âmbar Amazonas": "AM",
  "ESS": "SP",
  "CEA": "AP",
  "CHESP": "GO",
  "CPFL Santa Cruz": "SP",
  "EMR": "MG",
  "EDP ES": "ES",
  "PACTO ENERGIA PR": "PR"
};

// Application State
const state = {
  items: [],              // Processed rows
  filteredItems: [],      // Filtered rows
  currentView: 'full',    // 'full' | 'verde' | 'azul' | 'variacao'
  searchTerm: '',
  selectedUF: '',
  selectedAno: '',
  activeModalItem: null
};

// Format currency numbers: R$ 0,00000 ou R$ 0,00
function formatCurrency(val, decimals = 5) {
  if (val === null || val === undefined || isNaN(val) || val === 0) return '-';
  return 'R$ ' + Number(val).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatPercent(pct) {
  if (pct === null || pct === undefined || isNaN(pct)) return '-';
  const sign = pct > 0 ? '+' : '';
  const cssClass = pct > 0 ? 'val-up' : pct < 0 ? 'val-down' : 'val-neutral';
  return `<span class="${cssClass}">${sign}${pct.toFixed(2)}%</span>`;
}

// Find distributor data in ANEEL database (with API live cache prioritization)
function matchDistributor(name) {
  const db = window.TARIFAS_ANEEL_DATABASE || {};
  const lower = name.toLowerCase().trim();

  let mappedKey = ALIAS_MAP[lower];
  if (!mappedKey) {
    // Check if contains parentheses
    const matchParen = name.match(/\((.*?)\)/);
    if (matchParen) {
      const parenKey = matchParen[1].toLowerCase().trim();
      mappedKey = ALIAS_MAP[parenKey];
    }
  }

  // If still not found, search in database keys
  if (!mappedKey) {
    for (const key in db) {
      const agente = db[key].Agente;
      if (agente.toLowerCase() === lower || lower.includes(agente.toLowerCase()) || agente.toLowerCase().includes(lower)) {
        mappedKey = agente;
        break;
      }
    }
  }

  const agentName = mappedKey || name;
  const dbKey = agentName.trim().toUpperCase() + '|A4';

  // Verifica se temos dados atualizados vindos da API
  let entry = null;
  let source = 'LOCAL_DB';

  if (window.aneelApiClient && window.aneelApiClient.memoryCache.has(dbKey)) {
    entry = window.aneelApiClient.memoryCache.get(dbKey);
    source = 'API_DADOS_ABERTOS';
  } else if (db[dbKey]) {
    entry = db[dbKey];
    source = 'LOCAL_DB';
  } else if (db[agentName.trim() + '|A4']) {
    entry = db[agentName.trim() + '|A4'];
    source = 'LOCAL_DB';
  }

  const uf = (mappedKey && AGENT_UF[mappedKey]) || 'BR';

  return {
    rawName: name,
    agentName: agentName,
    uf: uf,
    dbEntry: entry,
    source: source,
    fetchedAt: entry ? entry.FetchedAt : null
  };
}

// Process Concessionaire List into structured items
function processConcessionaires(names) {
  const items = [];
  names.forEach((name, idx) => {
    if (!name || !name.trim()) return;
    const match = matchDistributor(name);
    const entry = match.dbEntry;

    const atual = entry ? entry.Atual : null;
    const anterior = entry ? entry.Anterior : null;

    // Calculate variations if both exist
    const calcVar = (newVal, oldVal) => {
      if (newVal > 0 && oldVal > 0) {
        return ((newVal - oldVal) / oldVal) * 100;
      }
      return null;
    };

    const variacoes = {
      demandaVerde: atual && anterior ? calcVar(atual.Verde.Demanda, anterior.Verde.Demanda) : null,
      demandaAzulP: atual && anterior ? calcVar(atual.Azul.Demanda_P, anterior.Azul.Demanda_P) : null,
      demandaAzulFP: atual && anterior ? calcVar(atual.Azul.Demanda_FP, anterior.Azul.Demanda_FP) : null,
      tusdVerdeP: atual && anterior ? calcVar(atual.Verde.TUSD_P, anterior.Verde.TUSD_P) : null,
      tusdVerdeFP: atual && anterior ? calcVar(atual.Verde.TUSD_FP, anterior.Verde.TUSD_FP) : null,
      teVerdeP: atual && anterior ? calcVar(atual.Verde.TE_P, anterior.Verde.TE_P) : null,
      teVerdeFP: atual && anterior ? calcVar(atual.Verde.TE_FP, anterior.Verde.TE_FP) : null,
      tusdAzulP: atual && anterior ? calcVar(atual.Azul.TUSD_P, anterior.Azul.TUSD_P) : null,
      tusdAzulFP: atual && anterior ? calcVar(atual.Azul.TUSD_FP, anterior.Azul.TUSD_FP) : null
    };

    items.push({
      index: idx + 1,
      nome: name,
      agenteANEEL: match.agentName,
      uf: match.uf,
      atual: atual,
      anterior: anterior,
      variacoes: variacoes,
      hasData: !!atual,
      source: match.source,
      fetchedAt: match.fetchedAt
    });
  });

  return items;
}

// Render Table Header according to active view
function renderTableHeader() {
  const thead = document.querySelector('#tarifa-table thead');
  if (!thead) return;

  if (state.currentView === 'full') {
    // Modelo da Imagem do Usuário
    thead.innerHTML = `
      <tr>
        <th rowspan="3" class="th-distributor">Concessionárias</th>
        <th colspan="13" class="th-block-anterior">ANTERIOR</th>
        <th colspan="13" class="th-block-atual">ATUAL</th>
      </tr>
      <tr>
        <!-- ANTERIOR -->
        <th colspan="6" class="th-sub-ponta">PONTA</th>
        <th colspan="6" class="th-sub-fora">FORA PONTA</th>
        <th rowspan="2" class="th-sub-ponta">Resolução</th>

        <!-- ATUAL -->
        <th colspan="6" class="th-sub-ponta">PONTA</th>
        <th colspan="6" class="th-sub-fora">FORA PONTA</th>
        <th rowspan="2" class="th-sub-ponta">Resolução</th>
      </tr>
      <tr>
        <!-- ANTERIOR PONTA -->
        <th colspan="2">TUSD</th>
        <th colspan="2">TE</th>
        <th colspan="2">DEMANDA</th>

        <!-- ANTERIOR FORA PONTA -->
        <th colspan="2">TUSD</th>
        <th colspan="2">TE</th>
        <th colspan="2">DEMANDA</th>

        <!-- ATUAL PONTA -->
        <th colspan="2">TUSD</th>
        <th colspan="2">TE</th>
        <th colspan="2">DEMANDA</th>

        <!-- ATUAL FORA PONTA -->
        <th colspan="2">TUSD</th>
        <th colspan="2">TE</th>
        <th colspan="2">DEMANDA</th>
      </tr>
      <tr class="th-sub-modalidades">
        <th class="th-distributor" style="top: 86px;">Distribuidora / UF</th>
        <!-- ANTERIOR PONTA -->
        <th class="th-col-verde">VERDE</th><th class="th-col-azul">AZUL</th>
        <th class="th-col-verde">VERDE</th><th class="th-col-azul">AZUL</th>
        <th class="th-col-verde">VERDE</th><th class="th-col-azul">AZUL</th>
        <!-- ANTERIOR FORA PONTA -->
        <th class="th-col-verde">VERDE</th><th class="th-col-azul">AZUL</th>
        <th class="th-col-verde">VERDE</th><th class="th-col-azul">AZUL</th>
        <th class="th-col-verde">VERDE</th><th class="th-col-azul">AZUL</th>
        <th>Número / Data</th>

        <!-- ATUAL PONTA -->
        <th class="th-col-verde">VERDE</th><th class="th-col-azul">AZUL</th>
        <th class="th-col-verde">VERDE</th><th class="th-col-azul">AZUL</th>
        <th class="th-col-verde">VERDE</th><th class="th-col-azul">AZUL</th>
        <!-- ATUAL FORA PONTA -->
        <th class="th-col-verde">VERDE</th><th class="th-col-azul">AZUL</th>
        <th class="th-col-verde">VERDE</th><th class="th-col-azul">AZUL</th>
        <th class="th-col-verde">VERDE</th><th class="th-col-azul">AZUL</th>
        <th>Número / Data</th>
      </tr>
    `;
  } else if (state.currentView === 'verde') {
    thead.innerHTML = `
      <tr>
        <th rowspan="2" class="th-distributor">Concessionária</th>
        <th colspan="5" class="th-block-anterior">TARIFA VERDE - ANTERIOR</th>
        <th colspan="5" class="th-block-atual">TARIFA VERDE - ATUAL</th>
        <th colspan="3" class="th-sub-ponta">VARIAÇÃO (%)</th>
      </tr>
      <tr>
        <th>Demanda (R$/kW)</th>
        <th>TUSD Ponta</th>
        <th>TUSD Fora Ponta</th>
        <th>TE Ponta</th>
        <th>TE Fora Ponta</th>
        <th>Demanda (R$/kW)</th>
        <th>TUSD Ponta</th>
        <th>TUSD Fora Ponta</th>
        <th>TE Ponta</th>
        <th>TE Fora Ponta</th>
        <th>Δ Demanda</th>
        <th>Δ TUSD Ponta</th>
        <th>Δ TUSD FP</th>
      </tr>
    `;
  } else if (state.currentView === 'azul') {
    thead.innerHTML = `
      <tr>
        <th rowspan="2" class="th-distributor">Concessionária</th>
        <th colspan="6" class="th-block-anterior">TARIFA AZUL - ANTERIOR</th>
        <th colspan="6" class="th-block-atual">TARIFA AZUL - ATUAL</th>
        <th colspan="3" class="th-sub-ponta">VARIAÇÃO (%)</th>
      </tr>
      <tr>
        <th>Demanda P</th>
        <th>Demanda FP</th>
        <th>TUSD Ponta</th>
        <th>TUSD FP</th>
        <th>TE Ponta</th>
        <th>TE FP</th>
        <th>Demanda P</th>
        <th>Demanda FP</th>
        <th>TUSD Ponta</th>
        <th>TUSD FP</th>
        <th>TE Ponta</th>
        <th>TE FP</th>
        <th>Δ Demanda P</th>
        <th>Δ Demanda FP</th>
        <th>Δ TUSD Ponta</th>
      </tr>
    `;
  } else if (state.currentView === 'variacao') {
    thead.innerHTML = `
      <tr>
        <th rowspan="2" class="th-distributor">Concessionária</th>
        <th rowspan="2">REH Anterior</th>
        <th rowspan="2">REH Atual</th>
        <th colspan="3" class="th-block-anterior">REAJUSTE DEMANDA</th>
        <th colspan="3" class="th-block-atual">REAJUSTE TUSD</th>
        <th colspan="2" class="th-sub-fora">REAJUSTE TE</th>
      </tr>
      <tr>
        <th>Verde</th>
        <th>Azul Ponta</th>
        <th>Azul FP</th>
        <th>Verde Ponta</th>
        <th>Verde FP</th>
        <th>Azul Ponta</th>
        <th>Ponta</th>
        <th>Fora Ponta</th>
      </tr>
    `;
  }
}

// Render Table Body Rows
function renderTableBody() {
  const tbody = document.getElementById('tarifa-tbody');
  if (!tbody) return;

  const items = state.filteredItems;
  document.getElementById('table-row-count').textContent = `Exibindo ${items.length} concessionárias`;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="28" style="text-align: center; padding: 40px; color: var(--text-muted);">Nenhuma concessionária encontrada para os filtros selecionados.</td></tr>`;
    return;
  }

  let html = '';

  items.forEach(item => {
    const at = item.atual;
    const an = item.anterior;

    const liveBadge = item.source === 'API_DADOS_ABERTOS' 
      ? '<span class="badge-live-api" title="Tarifa sincronizada ao vivo via API ANEEL (Recurso fcf2906c)"></span>' 
      : '';

    if (state.currentView === 'full') {
      html += `
        <tr onclick="openModal('${escapeHtml(item.nome)}')">
          <td class="td-distributor">
            <span class="dist-uf-tag">${item.uf}</span>
            <span>${escapeHtml(item.nome)}</span>
            ${liveBadge}
          </td>

          <!-- ANTERIOR PONTA -->
          <td class="cell-anterior">${an ? formatCurrency(an.Verde.TUSD_P) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Azul.TUSD_P) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Verde.TE_P) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Azul.TE_P) : '-'}</td>
          <td class="cell-anterior font-bold">${an ? formatCurrency(an.Verde.Demanda, 2) : '-'}</td>
          <td class="cell-anterior font-bold">${an ? formatCurrency(an.Azul.Demanda_P, 2) : '-'}</td>

          <!-- ANTERIOR FORA PONTA -->
          <td class="cell-anterior">${an ? formatCurrency(an.Verde.TUSD_FP) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Azul.TUSD_FP) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Verde.TE_FP) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Azul.TE_FP) : '-'}</td>
          <td class="cell-anterior font-bold">${an ? formatCurrency(an.Verde.Demanda, 2) : '-'}</td>
          <td class="cell-anterior font-bold">${an ? formatCurrency(an.Azul.Demanda_FP, 2) : '-'}</td>
          <td class="cell-anterior cell-reh" title="${an ? an.REH : ''}">${an ? an.REH : '-'}</td>

          <!-- ATUAL PONTA -->
          <td class="cell-atual">${at ? formatCurrency(at.Verde.TUSD_P) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Azul.TUSD_P) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Verde.TE_P) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Azul.TE_P) : '-'}</td>
          <td class="cell-atual font-bold">${at ? formatCurrency(at.Verde.Demanda, 2) : '-'}</td>
          <td class="cell-atual font-bold">${at ? formatCurrency(at.Azul.Demanda_P, 2) : '-'}</td>

          <!-- ATUAL FORA PONTA -->
          <td class="cell-atual">${at ? formatCurrency(at.Verde.TUSD_FP) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Azul.TUSD_FP) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Verde.TE_FP) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Azul.TE_FP) : '-'}</td>
          <td class="cell-atual font-bold">${at ? formatCurrency(at.Verde.Demanda, 2) : '-'}</td>
          <td class="cell-atual font-bold">${at ? formatCurrency(at.Azul.Demanda_FP, 2) : '-'}</td>
          <td class="cell-atual cell-reh" title="${at ? at.REH : ''}">${at ? at.REH : '-'}</td>
        </tr>
      `;
    } else if (state.currentView === 'verde') {
      html += `
        <tr onclick="openModal('${escapeHtml(item.nome)}')">
          <td class="td-distributor"><span class="dist-uf-tag">${item.uf}</span>${escapeHtml(item.nome)}${liveBadge}</td>
          <td class="cell-anterior font-bold">${an ? formatCurrency(an.Verde.Demanda, 2) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Verde.TUSD_P) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Verde.TUSD_FP) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Verde.TE_P) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Verde.TE_FP) : '-'}</td>

          <td class="cell-atual font-bold">${at ? formatCurrency(at.Verde.Demanda, 2) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Verde.TUSD_P) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Verde.TUSD_FP) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Verde.TE_P) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Verde.TE_FP) : '-'}</td>

          <td>${formatPercent(item.variacoes.demandaVerde)}</td>
          <td>${formatPercent(item.variacoes.tusdVerdeP)}</td>
          <td>${formatPercent(item.variacoes.tusdVerdeFP)}</td>
        </tr>
      `;
    } else if (state.currentView === 'azul') {
      html += `
        <tr onclick="openModal('${escapeHtml(item.nome)}')">
          <td class="td-distributor"><span class="dist-uf-tag">${item.uf}</span>${escapeHtml(item.nome)}${liveBadge}</td>
          <td class="cell-anterior font-bold">${an ? formatCurrency(an.Azul.Demanda_P, 2) : '-'}</td>
          <td class="cell-anterior font-bold">${an ? formatCurrency(an.Azul.Demanda_FP, 2) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Azul.TUSD_P) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Azul.TUSD_FP) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Azul.TE_P) : '-'}</td>
          <td class="cell-anterior">${an ? formatCurrency(an.Azul.TE_FP) : '-'}</td>

          <td class="cell-atual font-bold">${at ? formatCurrency(at.Azul.Demanda_P, 2) : '-'}</td>
          <td class="cell-atual font-bold">${at ? formatCurrency(at.Azul.Demanda_FP, 2) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Azul.TUSD_P) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Azul.TUSD_FP) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Azul.TE_P) : '-'}</td>
          <td class="cell-atual">${at ? formatCurrency(at.Azul.TE_FP) : '-'}</td>

          <td>${formatPercent(item.variacoes.demandaAzulP)}</td>
          <td>${formatPercent(item.variacoes.demandaAzulFP)}</td>
          <td>${formatPercent(item.variacoes.tusdAzulP)}</td>
        </tr>
      `;
    } else if (state.currentView === 'variacao') {
      html += `
        <tr onclick="openModal('${escapeHtml(item.nome)}')">
          <td class="td-distributor"><span class="dist-uf-tag">${item.uf}</span>${escapeHtml(item.nome)}${liveBadge}</td>
          <td class="cell-reh">${an ? an.REH : '-'}</td>
          <td class="cell-reh">${at ? at.REH : '-'}</td>
          <td>${formatPercent(item.variacoes.demandaVerde)}</td>
          <td>${formatPercent(item.variacoes.demandaAzulP)}</td>
          <td>${formatPercent(item.variacoes.demandaAzulFP)}</td>
          <td>${formatPercent(item.variacoes.tusdVerdeP)}</td>
          <td>${formatPercent(item.variacoes.tusdVerdeFP)}</td>
          <td>${formatPercent(item.variacoes.tusdAzulP)}</td>
          <td>${formatPercent(item.variacoes.teVerdeP)}</td>
          <td>${formatPercent(item.variacoes.teVerdeFP)}</td>
        </tr>
      `;
    }
  });

  tbody.innerHTML = html;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// Apply Filters (Search, UF, Ano)
function applyFilters() {
  const q = state.searchTerm.toLowerCase().trim();
  const uf = state.selectedUF;
  const ano = state.selectedAno;

  state.filteredItems = state.items.filter(item => {
    if (q) {
      const matchName = item.nome.toLowerCase().includes(q) || item.agenteANEEL.toLowerCase().includes(q);
      const matchUF = item.uf.toLowerCase().includes(q);
      const matchREH = (item.atual && item.atual.REH.toLowerCase().includes(q)) || (item.anterior && item.anterior.REH.toLowerCase().includes(q));
      if (!matchName && !matchUF && !matchREH) return false;
    }

    if (uf && item.uf !== uf) {
      return false;
    }

    if (ano) {
      const atVig = item.atual ? item.atual.Vigencia : '';
      const atReh = item.atual ? item.atual.REH : '';
      const containsAno = atVig.includes(ano) || atReh.includes(ano);
      if (!containsAno) return false;
    }

    return true;
  });

  renderTableBody();
}

// Populate UF Filter Dropdown
function populateUFFilter() {
  const select = document.getElementById('filter-uf');
  if (!select) return;

  const ufs = new Set();
  state.items.forEach(it => {
    if (it.uf && it.uf !== 'BR') ufs.add(it.uf);
  });

  const sortedUFs = Array.from(ufs).sort();
  select.innerHTML = '<option value="">Todos os Estados (UF)</option>';
  sortedUFs.forEach(uf => {
    const opt = document.createElement('option');
    opt.value = uf;
    opt.textContent = uf;
    select.appendChild(opt);
  });
}

// Modal View Details
window.openModal = function(distributorName) {
  const item = state.items.find(i => i.nome === distributorName);
  if (!item) return;

  state.activeModalItem = item;

  document.getElementById('modal-distributor-name').textContent = item.nome;
  document.getElementById('modal-uf').textContent = item.uf;

  const at = item.atual;
  const an = item.anterior;

  // Atual
  document.getElementById('modal-atual-reh').textContent = at ? at.REH : 'Sem registro recente';
  document.getElementById('modal-atual-vig').textContent = at ? at.Vigencia : '-';
  document.getElementById('modal-atual-dem-verde').textContent = at ? `${formatCurrency(at.Verde.Demanda, 2)} / kW` : '-';
  document.getElementById('modal-atual-dem-azul').textContent = at ? `P: ${formatCurrency(at.Azul.Demanda_P, 2)} | FP: ${formatCurrency(at.Azul.Demanda_FP, 2)}` : '-';
  document.getElementById('modal-atual-tusd-p').textContent = at ? `Verde: ${formatCurrency(at.Verde.TUSD_P)} | Azul: ${formatCurrency(at.Azul.TUSD_P)}` : '-';
  document.getElementById('modal-atual-tusd-fp').textContent = at ? `Verde: ${formatCurrency(at.Verde.TUSD_FP)} | Azul: ${formatCurrency(at.Azul.TUSD_FP)}` : '-';
  document.getElementById('modal-atual-te').textContent = at ? `P: ${formatCurrency(at.Verde.TE_P)} | FP: ${formatCurrency(at.Verde.TE_FP)}` : '-';

  // Anterior
  document.getElementById('modal-anterior-reh').textContent = an ? an.REH : 'Sem registro anterior';
  document.getElementById('modal-anterior-vig').textContent = an ? an.Vigencia : '-';
  document.getElementById('modal-anterior-dem-verde').textContent = an ? `${formatCurrency(an.Verde.Demanda, 2)} / kW` : '-';
  document.getElementById('modal-anterior-dem-azul').textContent = an ? `P: ${formatCurrency(an.Azul.Demanda_P, 2)} | FP: ${formatCurrency(an.Azul.Demanda_FP, 2)}` : '-';
  document.getElementById('modal-anterior-tusd-p').textContent = an ? `Verde: ${formatCurrency(an.Verde.TUSD_P)} | Azul: ${formatCurrency(an.Azul.TUSD_P)}` : '-';
  document.getElementById('modal-anterior-tusd-fp').textContent = an ? `Verde: ${formatCurrency(an.Verde.TUSD_FP)} | Azul: ${formatCurrency(an.Azul.TUSD_FP)}` : '-';
  document.getElementById('modal-anterior-te').textContent = an ? `P: ${formatCurrency(an.Verde.TE_P)} | FP: ${formatCurrency(an.Verde.TE_FP)}` : '-';

  // Metadata da API no Modal
  const modalSource = document.getElementById('modal-api-source');
  const modalTime = document.getElementById('modal-api-timestamp');
  if (modalSource) {
    if (item.source === 'API_DADOS_ABERTOS') {
      modalSource.innerHTML = '<span class="badge-live-api"></span>Fonte: API Dados Abertos (fcf2906c)';
      modalTime.textContent = item.fetchedAt ? new Date(item.fetchedAt).toLocaleTimeString('pt-BR') : 'Ao vivo';
    } else {
      modalSource.textContent = 'Fonte: Base Homologada ANEEL (Local)';
      modalTime.textContent = 'Pronta p/ sincronizar com a API';
    }
  }

  // Link direto para Cálculos Tarifários ANEEL
  document.getElementById('modal-aneel-link').href = `https://calculostarifarios.aneel.gov.br/lista-publica`;

  document.getElementById('modal-overlay').style.display = 'flex';
};

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  state.activeModalItem = null;
}

// Show Toast Message
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

// Export to Excel (.xlsx) with exact template format
function exportToExcel() {
  if (typeof XLSX === 'undefined') {
    showToast('Biblioteca SheetJS ainda não carregada!');
    return;
  }

  showToast('Gerando planilha Excel (.xlsx)...');

  // Headers matching the user's template exactly
  const rows = [
    // Row 1
    ["", "ANTERIOR", "", "", "", "", "", "", "", "", "", "", "", "ATUAL", "", "", "", "", "", "", "", "", "", "", ""],
    // Row 2
    ["", "PONTA", "", "", "", "", "FORA PONTA", "", "", "", "", "Resolução", "PONTA", "", "", "", "", "FORA PONTA", "", "", "", "", "Resolução"],
    // Row 3
    ["", "TUSD", "", "TE", "", "DEMANDA", "", "TUSD", "", "TE", "", "DEMANDA", "", "", "TUSD", "", "TE", "", "DEMANDA", "", "TUSD", "", "TE", "", "DEMANDA", "", ""],
    // Row 4
    ["Concessionárias", 
     "VERDE", "AZUL", "VERDE", "AZUL", "VERDE", "AZUL", 
     "VERDE", "AZUL", "VERDE", "AZUL", "VERDE", "AZUL", "Resolução Anterior",
     "VERDE", "AZUL", "VERDE", "AZUL", "VERDE", "AZUL", 
     "VERDE", "AZUL", "VERDE", "AZUL", "VERDE", "AZUL", "Resolução Atual"]
  ];

  // Data rows
  state.items.forEach(item => {
    const at = item.atual;
    const an = item.anterior;

    rows.push([
      item.nome,
      // Anterior Ponta
      an ? an.Verde.TUSD_P : "",
      an ? an.Azul.TUSD_P : "",
      an ? an.Verde.TE_P : "",
      an ? an.Azul.TE_P : "",
      an ? an.Verde.Demanda : "",
      an ? an.Azul.Demanda_P : "",
      // Anterior Fora Ponta
      an ? an.Verde.TUSD_FP : "",
      an ? an.Azul.TUSD_FP : "",
      an ? an.Verde.TE_FP : "",
      an ? an.Azul.TE_FP : "",
      an ? an.Verde.Demanda : "",
      an ? an.Azul.Demanda_FP : "",
      an ? an.REH : "",
      // Atual Ponta
      at ? at.Verde.TUSD_P : "",
      at ? at.Azul.TUSD_P : "",
      at ? at.Verde.TE_P : "",
      at ? at.Azul.TE_P : "",
      at ? at.Verde.Demanda : "",
      at ? at.Azul.Demanda_P : "",
      // Atual Fora Ponta
      at ? at.Verde.TUSD_FP : "",
      at ? at.Azul.TUSD_FP : "",
      at ? at.Verde.TE_FP : "",
      at ? at.Azul.TE_FP : "",
      at ? at.Verde.Demanda : "",
      at ? at.Azul.Demanda_FP : "",
      at ? at.REH : ""
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set merges for multi-level headers
  ws['!merges'] = [
    // ANTERIOR header
    { s: { r: 0, c: 1 }, e: { r: 0, c: 13 } },
    // ATUAL header
    { s: { r: 0, c: 14 }, e: { r: 0, c: 26 } },
    // ANTERIOR PONTA
    { s: { r: 1, c: 1 }, e: { r: 1, c: 6 } },
    // ANTERIOR FORA PONTA
    { s: { r: 1, c: 7 }, e: { r: 1, c: 12 } },
    // ATUAL PONTA
    { s: { r: 1, c: 14 }, e: { r: 1, c: 19 } },
    // ATUAL FORA PONTA
    { s: { r: 1, c: 20 }, e: { r: 1, c: 25 } }
  ];

  // Set column widths
  ws['!cols'] = [
    { wch: 30 }, // Concessionárias
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 32 }, // REH Anterior
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 32 }  // REH Atual
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tarifas A4 Verde e Azul");

  const fileName = `Tarifas_A4_Verde_Azul_ANEEL_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);

  showToast(`Planilha ${fileName} baixada com sucesso!`);
}

// Copy table to clipboard in Excel-ready TSV format
function copyToClipboard() {
  let tsv = "Concessionária\tUF\tDemanda Verde (Atual)\tDemanda Azul Ponta (Atual)\tDemanda Azul FP (Atual)\tTUSD Ponta Verde (Atual)\tTUSD FP Verde (Atual)\tTE Ponta (Atual)\tTE FP (Atual)\tResolução Atual\tDemanda Verde (Anterior)\tResolução Anterior\n";

  state.filteredItems.forEach(item => {
    const at = item.atual;
    const an = item.anterior;
    tsv += [
      item.nome,
      item.uf,
      at ? at.Verde.Demanda : '',
      at ? at.Azul.Demanda_P : '',
      at ? at.Azul.Demanda_FP : '',
      at ? at.Verde.TUSD_P : '',
      at ? at.Verde.TUSD_FP : '',
      at ? at.Verde.TE_P : '',
      at ? at.Verde.TE_FP : '',
      at ? at.REH : '',
      an ? an.Verde.Demanda : '',
      an ? an.REH : ''
    ].join('\t') + '\n';
  });

  navigator.clipboard.writeText(tsv).then(() => {
    showToast('Tabela copiada! Cole com Ctrl+V no Excel.');
  }).catch(() => {
    showToast('Erro ao copiar para a área de transferência.');
  });
}

// Handle Excel / CSV File Upload
function handleFileUpload(file) {
  if (!file) return;

  showToast(`Lendo arquivo: ${file.name}...`);

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // First sheet
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const extractedNames = [];
      // Look for concessionaires in column B or col 0/1 starting from row 4/5
      jsonRows.forEach((row, idx) => {
        if (idx < 1) return; // skip row 0
        // Check col 1 (index 1) which is usually Col B
        let candidate = row[1];
        if (!candidate && row[0] && typeof row[0] === 'string' && row[0].length > 3) {
          candidate = row[0];
        }

        if (candidate && typeof candidate === 'string') {
          const clean = candidate.trim();
          if (clean && !clean.toLowerCase().includes('concessionária') && !clean.toLowerCase().includes('distribuidora')) {
            extractedNames.push(clean);
          }
        }
      });

      if (extractedNames.length > 0) {
        state.items = processConcessionaires(extractedNames);
        state.filteredItems = [...state.items];
        document.getElementById('stat-distributors-count').textContent = state.items.length;
        populateUFFilter();
        renderTableBody();
        showToast(`Sucesso! ${extractedNames.length} concessionárias carregadas da planilha!`);
      } else {
        showToast('Nenhum nome de concessionária encontrado na planilha.');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao processar arquivo Excel.');
    }
  };

  reader.readAsArrayBuffer(file);
}

// Event Listeners Initialization
function initEventListeners() {
  // Theme Toggle
  const themeBtn = document.getElementById('btn-theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      document.body.classList.toggle('dark-theme');
      const isLight = document.body.classList.contains('light-theme');
      localStorage.setItem('aneel-theme', isLight ? 'light' : 'dark');
    });

    const savedTheme = localStorage.getItem('aneel-theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  // Load Template Button
  document.getElementById('btn-load-template').addEventListener('click', () => {
    state.items = processConcessionaires(DEFAULT_CONCESSIONARIAS);
    state.filteredItems = [...state.items];
    document.getElementById('stat-distributors-count').textContent = state.items.length;
    populateUFFilter();
    renderTableBody();
    showToast('40 Concessionárias do modelo padrão carregadas!');
  });

  // Fill All Button
  document.getElementById('btn-fill-all').addEventListener('click', () => {
    state.items = processConcessionaires(DEFAULT_CONCESSIONARIAS);
    applyFilters();
    showToast('Tarifas A4 oficiais da ANEEL atualizadas para todas as concessionárias!');
  });

  // Export XLSX
  document.getElementById('btn-export-xlsx').addEventListener('click', exportToExcel);

  // Copy Clipboard
  document.getElementById('btn-copy-clipboard').addEventListener('click', copyToClipboard);

  // Tabs for View Selection
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      state.currentView = btn.dataset.view;
      renderTableHeader();
      renderTableBody();
    });
  });

  // Search input
  const searchInput = document.getElementById('search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');

  searchInput.addEventListener('input', (e) => {
    state.searchTerm = e.target.value;
    btnClearSearch.style.display = state.searchTerm ? 'block' : 'none';
    applyFilters();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    state.searchTerm = '';
    btnClearSearch.style.display = 'none';
    applyFilters();
  });

  // UF Filter
  document.getElementById('filter-uf').addEventListener('change', (e) => {
    state.selectedUF = e.target.value;
    applyFilters();
  });

  // Year Filter
  document.getElementById('filter-ano').addEventListener('change', (e) => {
    state.selectedAno = e.target.value;
    applyFilters();
  });

  // Modal Close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });

  // Drag & Drop
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });

  // API Live Sync Button
  const btnSyncApi = document.getElementById('btn-sync-api');
  if (btnSyncApi) {
    btnSyncApi.addEventListener('click', syncWithAneelApi);
  }

  // Modal API Refresh Button
  const btnModalRefresh = document.getElementById('btn-modal-refresh-api');
  if (btnModalRefresh) {
    btnModalRefresh.addEventListener('click', refreshSingleDistributorApi);
  }
}

// Sincronização em massa com a API de Dados Abertos da ANEEL (Recurso fcf2906c)
async function syncWithAneelApi() {
  const btnSync = document.getElementById('btn-sync-api');
  const progressPanel = document.getElementById('api-sync-progress');
  const progressFill = document.getElementById('api-progress-fill');
  const progressCount = document.getElementById('api-progress-count');
  const progressAgent = document.getElementById('api-progress-agent');

  if (!window.aneelApiClient) {
    showToast('Cliente de API da ANEEL não disponível.');
    return;
  }

  btnSync.disabled = true;
  btnSync.innerHTML = '<span class="spinner-small"></span> Sincronizando...';
  progressPanel.style.display = 'block';

  // Coleta lista única de distribuidoras atualmente carregadas
  const agents = [...new Set(state.items.map(it => it.agenteANEEL || it.nome))];
  const total = agents.length;

  progressCount.textContent = `0 / ${total}`;
  progressFill.style.width = '0%';
  progressAgent.textContent = 'Conectando ao recurso fcf2906c da ANEEL...';

  try {
    await window.aneelApiClient.syncAll(agents, (current, count, agent) => {
      const pct = Math.round((current / count) * 100);
      progressFill.style.width = pct + '%';
      progressCount.textContent = `${current} / ${count}`;
      progressAgent.textContent = `Sincronizando ${agent} (${pct}%)...`;
    });

    // Re-processa todos os itens com os novos dados frescos da API
    const names = state.items.map(it => it.nome);
    state.items = processConcessionaires(names);
    applyFilters();

    progressAgent.textContent = 'Sincronização com API ANEEL concluída!';
    showToast(`✅ ${total} distribuidoras atualizadas diretamente da API da ANEEL!`);

    setTimeout(() => {
      progressPanel.style.display = 'none';
    }, 2000);
  } catch (err) {
    console.error('Erro na sincronização com a API:', err);
    showToast('Aviso: Erro pontual na API ANEEL. Mantendo base em cache.');
  } finally {
    btnSync.disabled = false;
    btnSync.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
      </svg>
      Sincronizar via API ANEEL
    `;
  }
}

// Atualização sob demanda de uma única distribuidora no Modal
async function refreshSingleDistributorApi() {
  if (!state.activeModalItem || !window.aneelApiClient) return;
  const btn = document.getElementById('btn-modal-refresh-api');
  const agentName = state.activeModalItem.agenteANEEL || state.activeModalItem.nome;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-small"></span> Consultando API...';

  try {
    const updated = await window.aneelApiClient.getDistributorTarifas(agentName, true);
    if (updated) {
      // Atualiza estado global
      const names = state.items.map(it => it.nome);
      state.items = processConcessionaires(names);
      applyFilters();

      // Recarrega modal com os novos dados
      window.openModal(state.activeModalItem.nome);
      showToast(`Tarifa de ${agentName} atualizada via API!`);
    } else {
      showToast(`Não foram retornados novos dados para ${agentName} na API.`);
    }
  } catch (err) {
    showToast('Erro ao consultar API: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
      </svg>
      Recarregar via API
    `;
  }
}

// Initial App Boot
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();

  // Load default concessionaires automatically on boot
  state.items = processConcessionaires(DEFAULT_CONCESSIONARIAS);
  state.filteredItems = [...state.items];
  document.getElementById('stat-distributors-count').textContent = state.items.length;

  populateUFFilter();
  renderTableHeader();
  renderTableBody();

  // Teste de conexão em segundo plano com a API de Dados Abertos
  if (window.aneelApiClient) {
    window.aneelApiClient.testConnection().then(status => {
      const badge = document.getElementById('api-status-badge');
      const text = document.getElementById('api-status-text');
      if (status.online) {
        badge.classList.remove('offline', 'error');
        text.textContent = 'API ANEEL Conectada (Dados Abertos)';
      } else {
        badge.classList.add('offline');
        text.textContent = 'API Offline (Modo Local)';
      }
    }).catch(() => {
      const badge = document.getElementById('api-status-badge');
      const text = document.getElementById('api-status-text');
      if (badge) badge.classList.add('offline');
      if (text) text.textContent = 'API Offline (Modo Local)';
    });
  }

  console.log('App ANEEL Tarifas A4 inicializada com suporte a API CKAN.');
});

