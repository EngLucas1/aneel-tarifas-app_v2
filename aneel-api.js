/**
 * ANEEL Dados Abertos API Client
 * Integração com o portal oficial de Dados Abertos da ANEEL:
 * Recurso: Tarifas de aplicação das distribuidoras de energia elétrica
 * Resource ID: fcf2906c-7c32-4b9b-a637-054e7a5234f4
 * URL: https://dadosabertos.aneel.gov.br/dataset/tarifas-distribuidoras-energia-eletrica/resource/fcf2906c-7c32-4b9b-a637-054e7a5234f4
 */

const ANEEL_API_CONFIG = {
  baseUrl: 'https://dadosabertos.aneel.gov.br/api/3/action/datastore_search',
  resourceId: 'fcf2906c-7c32-4b9b-a637-054e7a5234f4',
  datasetUrl: 'https://dadosabertos.aneel.gov.br/dataset/tarifas-distribuidoras-energia-eletrica/resource/fcf2906c-7c32-4b9b-a637-054e7a5234f4',
  cacheKey: 'aneel_tarifas_api_cache_v2',
  cacheExpiryMs: 12 * 60 * 60 * 1000 // 12 horas
};

class AneelApiClient {
  constructor() {
    this.memoryCache = new Map();
    this.loadCacheFromStorage();
  }

  // Carrega cache local persistido
  loadCacheFromStorage() {
    try {
      const saved = localStorage.getItem(ANEEL_API_CONFIG.cacheKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        for (const [key, item] of Object.entries(parsed)) {
          if (now - item.timestamp < ANEEL_API_CONFIG.cacheExpiryMs) {
            this.memoryCache.set(key, item.data);
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar cache do localStorage:', e);
    }
  }

  // Persiste cache local
  saveCacheToStorage() {
    try {
      const obj = {};
      const now = Date.now();
      for (const [key, data] of this.memoryCache.entries()) {
        obj[key] = { timestamp: now, data: data };
      }
      localStorage.setItem(ANEEL_API_CONFIG.cacheKey, JSON.stringify(obj));
    } catch (e) {
      console.warn('Erro ao salvar cache no localStorage:', e);
    }
  }

  // Converte número padrão brasileiro ("1.234,56" ou "191,97" ou ",00") para float
  static parseNumberBr(val) {
    if (val === null || val === undefined) return 0;
    const str = String(val).trim();
    if (!str || str === '-' || str === ',00' || str === '0,00') return 0;
    const clean = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }

  // Limpa mojibake / caracteres UTF-8 corrompidos comuns em órgãos públicos
  static cleanMojibake(str) {
    if (!str || typeof str !== 'string') return str || '';
    return str
      .replace(/RESOLU[Ã][Ç][Ã]O/gi, 'RESOLUÇÃO')
      .replace(/HOMOLOGAT[Ã][Ó]RIA/gi, 'HOMOLOGATÓRIA')
      .replace(/N[Â]º/gi, 'Nº')
      .replace(/N[º°]/gi, 'Nº')
      .replace(/Aplica[çc][ãa]o/gi, 'Aplicação')
      .replace(/Econ[ôo]mica/gi, 'Econômica')
      .replace(/N[ãa]o se aplica/gi, 'Não se aplica')
      .replace(/ÂMBAR/gi, 'ÂMBAR')
      .replace(/mbar/gi, 'Âmbar')
      .replace(/Bras[íi]lia/gi, 'Brasília');
  }

  /**
   * Executa chamada à API CKAN via JSONP (sem bloqueio de CORS no navegador)
   * com fallback transparente para fetch com proxy
   */
  fetchJsonp(params = {}, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const callbackName = 'aneel_cb_' + Math.floor(Math.random() * 10000000);
      const queryParams = new URLSearchParams();

      queryParams.set('resource_id', ANEEL_API_CONFIG.resourceId);
      for (const [k, v] of Object.entries(params)) {
        if (typeof v === 'object') {
          queryParams.set(k, JSON.stringify(v));
        } else {
          queryParams.set(k, v);
        }
      }
      queryParams.set('callback', callbackName);

      const url = `${ANEEL_API_CONFIG.baseUrl}?${queryParams.toString()}`;

      let timer = setTimeout(() => {
        cleanup();
        this.fetchWithProxyFallback(params)
          .then(resolve)
          .catch(() => reject(new Error('Timeout de conexão com a API de Dados Abertos da ANEEL.')));
      }, timeoutMs);

      function cleanup() {
        clearTimeout(timer);
        delete window[callbackName];
        const scriptEl = document.getElementById(callbackName);
        if (scriptEl && scriptEl.parentNode) {
          scriptEl.parentNode.removeChild(scriptEl);
        }
      }

      window[callbackName] = (data) => {
        cleanup();
        if (data && data.success) {
          resolve(data.result);
        } else {
          const err = data?.error?.message || 'Erro na resposta da API ANEEL';
          reject(new Error(err));
        }
      };

      const script = document.createElement('script');
      script.id = callbackName;
      script.src = url;
      script.async = true;
      script.onerror = () => {
        cleanup();
        this.fetchWithProxyFallback(params)
          .then(resolve)
          .catch((err) => reject(new Error('Falha ao conectar com a API ANEEL: ' + err.message)));
      };

      document.head.appendChild(script);
    });
  }

  // Fallback via Fetch / Proxy em caso de bloqueio pontual de script
  async fetchWithProxyFallback(params = {}) {
    const queryParams = new URLSearchParams();
    queryParams.set('resource_id', ANEEL_API_CONFIG.resourceId);
    for (const [k, v] of Object.entries(params)) {
      if (typeof v === 'object') {
        queryParams.set(k, JSON.stringify(v));
      } else {
        queryParams.set(k, v);
      }
    }
    const targetUrl = `${ANEEL_API_CONFIG.baseUrl}?${queryParams.toString()}`;

    // Tenta fetch direto primeiro (caso CORS esteja habilitado no ambiente)
    try {
      const resp = await fetch(targetUrl, { signal: AbortSignal.timeout(8000) });
      if (resp.ok) {
        const json = await resp.json();
        if (json.success) return json.result;
      }
    } catch (e) {
      // Falha esperada em navegadores sem CORS origin
    }

    // Fallback para AllOrigins Proxy CORS público seguro
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const resp2 = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
    if (!resp2.ok) throw new Error('Proxy fallback HTTP ' + resp2.status);
    const json2 = await resp2.json();
    if (json2 && json2.success) return json2.result;
    throw new Error('Falha em todos os métodos de conexão');
  }

  // Testa conectividade com a API
  async testConnection() {
    try {
      const res = await this.fetchJsonp({ limit: 1 }, 7000);
      return {
        online: true,
        totalRecords: res.total || 655289,
        resourceId: ANEEL_API_CONFIG.resourceId
      };
    } catch (err) {
      return {
        online: false,
        error: err.message
      };
    }
  }

  /**
   * Processa registros brutos retornados da API em um objeto estruturado
   * contendo REH Atual e Anterior, com Grupo A4 Verde e Azul.
   */
  parseRecordsToTarifas(records, agentName) {
    if (!records || !records.length) return null;

    // Agrupa registros por Resolução Homologatória (DscREH) mantendo ordem temporal
    const rehGroups = [];
    const seenRehs = new Set();

    for (const rec of records) {
      const rawReh = rec.DscREH ? rec.DscREH.trim() : '';
      if (!rawReh) continue;

      const cleanReh = AneelApiClient.cleanMojibake(rawReh);
      if (!seenRehs.has(cleanReh)) {
        seenRehs.add(cleanReh);
        rehGroups.push({
          rawReh: rawReh,
          reh: cleanReh,
          vigencia: rec.DatInicioVigencia || '',
          records: []
        });
      }

      const targetGroup = rehGroups.find(g => g.reh === cleanReh);
      if (targetGroup) targetGroup.records.push(rec);
    }

    if (!rehGroups.length) return null;

    // Extrai valores de Verde e Azul para uma dada resolução
    const extractModalityValues = (group) => {
      if (!group || !group.records) return null;

      // Filtra tarifas de aplicação para consumo cativo regular (ignora APE, SCEE, GD)
      const validRecs = group.records.filter(r => {
        const base = (r.DscBaseTarifaria || '').toLowerCase();
        const detalhe = (r.DscDetalhe || '').toUpperCase();
        const isAplicacao = base.includes('aplica') || base.includes('aplica');
        const isCaptivoPadrao = !detalhe.includes('APE') && !detalhe.includes('SCEE') && !detalhe.includes('GERA');
        return isAplicacao && isCaptivoPadrao;
      });

      const verde = { Demanda: 0, TUSD_P: 0, TUSD_FP: 0, TE_P: 0, TE_FP: 0 };
      const azul = { Demanda_P: 0, Demanda_FP: 0, TUSD_P: 0, TUSD_FP: 0, TE_P: 0, TE_FP: 0 };

      for (const r of validRecs) {
        const mod = (r.DscModalidadeTarifaria || '').trim();
        const posto = (r.NomPostoTarifario || '').trim();
        const uni = (r.DscUnidadeTerciaria || '').trim();
        const tusdVal = AneelApiClient.parseNumberBr(r.VlrTUSD);
        const teVal = AneelApiClient.parseNumberBr(r.VlrTE);

        // Tarifa Verde
        if (mod === 'Verde') {
          if (uni === 'kW') {
            if (tusdVal > 0) verde.Demanda = tusdVal;
          } else if (uni === 'MWh' || uni === 'kWh') {
            const factor = uni === 'MWh' ? 1000 : 1;
            const tusdKwh = tusdVal > 0 ? parseFloat((tusdVal / factor).toFixed(5)) : 0;
            const teKwh = teVal > 0 ? parseFloat((teVal / factor).toFixed(5)) : 0;

            if (posto === 'Ponta') {
              if (tusdKwh > 0) verde.TUSD_P = tusdKwh;
              if (teKwh > 0) verde.TE_P = teKwh;
            } else if (posto.toLowerCase().includes('fora')) {
              if (tusdKwh > 0) verde.TUSD_FP = tusdKwh;
              if (teKwh > 0) verde.TE_FP = teKwh;
            }
          }
        }

        // Tarifa Azul
        if (mod === 'Azul') {
          if (uni === 'kW') {
            if (posto === 'Ponta') {
              if (tusdVal > 0) azul.Demanda_P = tusdVal;
            } else if (posto.toLowerCase().includes('fora')) {
              if (tusdVal > 0) azul.Demanda_FP = tusdVal;
            }
          } else if (uni === 'MWh' || uni === 'kWh') {
            const factor = uni === 'MWh' ? 1000 : 1;
            const tusdKwh = tusdVal > 0 ? parseFloat((tusdVal / factor).toFixed(5)) : 0;
            const teKwh = teVal > 0 ? parseFloat((teVal / factor).toFixed(5)) : 0;

            if (posto === 'Ponta') {
              if (tusdKwh > 0) azul.TUSD_P = tusdKwh;
              if (teKwh > 0) azul.TE_P = teKwh;
            } else if (posto.toLowerCase().includes('fora')) {
              if (tusdKwh > 0) azul.TUSD_FP = tusdKwh;
              if (teKwh > 0) azul.TE_FP = teKwh;
            }
          }
        }
      }

      return {
        REH: group.reh,
        RawREH: group.rawReh,
        Vigencia: group.vigencia,
        Verde: verde,
        Azul: azul
      };
    };

    const atual = rehGroups[0] ? extractModalityValues(rehGroups[0]) : null;
    const anterior = rehGroups[1] ? extractModalityValues(rehGroups[1]) : null;

    return {
      Agente: agentName,
      SubGrupo: 'A4',
      Atual: atual,
      Anterior: anterior,
      TotalResolutions: rehGroups.length,
      Source: 'API_DADOS_ABERTOS_ANEEL',
      ResourceId: ANEEL_API_CONFIG.resourceId,
      FetchedAt: new Date().toISOString()
    };
  }

  /**
   * Busca as tarifas A4 de uma distribuidora específica na API da ANEEL
   * @param {string} agentName - Sigla oficial da concessionária (ex: "EQUATORIAL PA", "CEMIG-D")
   * @param {boolean} forceRefresh - Força requisição à API ignorando cache local
   */
  async getDistributorTarifas(agentName, forceRefresh = false) {
    const cacheKey = agentName.trim().toUpperCase() + '|A4';

    if (!forceRefresh && this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey);
    }

    try {
      // 1. Tenta por filtro exato de SigAgente e SubGrupo A4
      let result = await this.fetchJsonp({
        filters: { SigAgente: agentName, DscSubGrupo: 'A4' },
        sort: 'DatInicioVigencia desc',
        limit: 150
      });

      // 2. Se não retornou registros, tenta busca textual ampla (q)
      if (!result.records || !result.records.length) {
        result = await this.fetchJsonp({
          filters: { DscSubGrupo: 'A4' },
          q: agentName,
          sort: 'DatInicioVigencia desc',
          limit: 150
        });
      }

      if (result.records && result.records.length > 0) {
        const parsed = this.parseRecordsToTarifas(result.records, agentName);
        if (parsed && parsed.Atual) {
          this.memoryCache.set(cacheKey, parsed);
          this.saveCacheToStorage();
          return parsed;
        }
      }

      return null;
    } catch (err) {
      console.warn(`[ANEEL API] Erro ao buscar distribuidora ${agentName}:`, err.message);
      return null;
    }
  }

  /**
   * Sincroniza uma lista de distribuidoras da API oficial em lotes controlados
   * @param {string[]} agentList - Lista de siglas/nomes
   * @param {Function} onProgress - Callback (current, total, currentAgent)
   */
  async syncAll(agentList, onProgress = null) {
    const total = agentList.length;
    let completed = 0;
    const results = {};

    // Processamento em lotes de 4 requisições simultâneas para respeitar limites do CKAN
    const batchSize = 4;
    for (let i = 0; i < agentList.length; i += batchSize) {
      const batch = agentList.slice(i, i + batchSize);
      await Promise.all(batch.map(async (agent) => {
        try {
          const data = await this.getDistributorTarifas(agent, true);
          if (data) {
            results[agent] = data;
          }
        } catch (e) {
          console.error(`Erro ao sincronizar ${agent}:`, e);
        } finally {
          completed++;
          if (typeof onProgress === 'function') {
            onProgress(completed, total, agent);
          }
        }
      }));
    }

    return results;
  }
}

// Instância global do cliente de API
window.aneelApiClient = new AneelApiClient();
