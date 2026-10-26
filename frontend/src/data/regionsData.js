/**
 * CAMADA DE DADOS E CATÁLOGOS PADRONIZADOS (regionsData.js)
 * ---------------------------------------------------------
 * Mantém as opções predefinidas em estrita sincronia com o modelo Relato do Django:
 * - Regiões de Porto Alegre (RS)
 * - Categorias de relatos das usuárias
 * - Turnos da ocorrência (Manhã, Tarde, Noite, Madrugada)
 * - Períodos aproximados da ocorrência (faixas mutuamente exclusivas)
 *
 * Também define o estado inicial neutro ("Dados insuficientes" — cinza) para que a
 * interface nunca apresente níveis fictícios como se fossem dados reais do banco.
 */

export const PERIODO_REFERENCIA_PADRAO =
  'Últimos 90 dias — período aproximado da ocorrência informado pela pessoa';

const AVISO_LIMITACAO_PADRAO =
  'Os indicadores refletem o volume de relatos elegíveis registrados. Eles não representam necessariamente ocorrências únicas nem estatísticas criminais oficiais. A ausência de relatos não garante segurança.';

export const initialRegionsDB = {
  centro: {
    id: 'centro',
    nome: 'Centro Histórico',
    descricao_territorial: 'Região central · Porto Alegre',
    lat: -30.0328,
    lng: -51.2300,
    quantidade_relatos: 0,
    quantidade_anteriores_90_dias: 0,
    quantidade_periodo_desconhecido: 0,
    quantidade_historicos_indeterminados: 0,
    estado_semantico: 'Dados insuficientes',
    cor_classe: 'gray',
    cor_hex: '#64748b',
    subtitulo_estado: 'Sem relatos elegíveis suficientes no período de referência.',
    periodo_referencia: PERIODO_REFERENCIA_PADRAO,
    categorias_registradas: [],
    turnos_registrados: [],
    trechos_registrados: [],
    aviso_limitacao: AVISO_LIMITACAO_PADRAO,
  },
  cidade: {
    id: 'cidade',
    nome: 'Cidade Baixa',
    descricao_territorial: 'Área de circulação e lazer · Porto Alegre',
    lat: -30.0400,
    lng: -51.2200,
    quantidade_relatos: 0,
    quantidade_anteriores_90_dias: 0,
    quantidade_periodo_desconhecido: 0,
    quantidade_historicos_indeterminados: 0,
    estado_semantico: 'Dados insuficientes',
    cor_classe: 'gray',
    cor_hex: '#64748b',
    subtitulo_estado: 'Sem relatos elegíveis suficientes no período de referência.',
    periodo_referencia: PERIODO_REFERENCIA_PADRAO,
    categorias_registradas: [],
    turnos_registrados: [],
    trechos_registrados: [],
    aviso_limitacao: AVISO_LIMITACAO_PADRAO,
  },
  menino: {
    id: 'menino',
    nome: 'Menino Deus',
    descricao_territorial: 'Área residencial e de serviços · Porto Alegre',
    lat: -30.0500,
    lng: -51.2250,
    quantidade_relatos: 0,
    quantidade_anteriores_90_dias: 0,
    quantidade_periodo_desconhecido: 0,
    quantidade_historicos_indeterminados: 0,
    estado_semantico: 'Dados insuficientes',
    cor_classe: 'gray',
    cor_hex: '#64748b',
    subtitulo_estado: 'Sem relatos elegíveis suficientes no período de referência.',
    periodo_referencia: PERIODO_REFERENCIA_PADRAO,
    categorias_registradas: [],
    turnos_registrados: [],
    trechos_registrados: [],
    aviso_limitacao: AVISO_LIMITACAO_PADRAO,
  },
  bom_fim: {
    id: 'bom_fim',
    nome: 'Bom Fim',
    descricao_territorial: 'Área cultural, residencial e de serviços · Porto Alegre',
    lat: -30.0335,
    lng: -51.2105,
    quantidade_relatos: 0,
    quantidade_anteriores_90_dias: 0,
    quantidade_periodo_desconhecido: 0,
    quantidade_historicos_indeterminados: 0,
    estado_semantico: 'Dados insuficientes',
    cor_classe: 'gray',
    cor_hex: '#64748b',
    subtitulo_estado: 'Sem relatos elegíveis suficientes no período de referência.',
    periodo_referencia: PERIODO_REFERENCIA_PADRAO,
    categorias_registradas: [],
    turnos_registrados: [],
    trechos_registrados: [],
    aviso_limitacao: AVISO_LIMITACAO_PADRAO,
  },
  moinhos: {
    id: 'moinhos',
    nome: 'Moinhos de Vento',
    descricao_territorial: 'Área comercial e residencial · Porto Alegre',
    lat: -30.0258,
    lng: -51.2045,
    quantidade_relatos: 0,
    quantidade_anteriores_90_dias: 0,
    quantidade_periodo_desconhecido: 0,
    quantidade_historicos_indeterminados: 0,
    estado_semantico: 'Dados insuficientes',
    cor_classe: 'gray',
    cor_hex: '#64748b',
    subtitulo_estado: 'Sem relatos elegíveis suficientes no período de referência.',
    periodo_referencia: PERIODO_REFERENCIA_PADRAO,
    categorias_registradas: [],
    turnos_registrados: [],
    trechos_registrados: [],
    aviso_limitacao: AVISO_LIMITACAO_PADRAO,
  },
  praia_de_belas: {
    id: 'praia_de_belas',
    nome: 'Praia de Belas',
    descricao_territorial: 'Área institucional, parques e serviços · Porto Alegre',
    lat: -30.0495,
    lng: -51.2315,
    quantidade_relatos: 0,
    quantidade_anteriores_90_dias: 0,
    quantidade_periodo_desconhecido: 0,
    quantidade_historicos_indeterminados: 0,
    estado_semantico: 'Dados insuficientes',
    cor_classe: 'gray',
    cor_hex: '#64748b',
    subtitulo_estado: 'Sem relatos elegíveis suficientes no período de referência.',
    periodo_referencia: PERIODO_REFERENCIA_PADRAO,
    categorias_registradas: [],
    turnos_registrados: [],
    trechos_registrados: [],
    aviso_limitacao: AVISO_LIMITACAO_PADRAO,
  },
};

// 1. Regiões de Porto Alegre (RS) — sincronizadas com Relato.RegiaoChoices no Django
export const regionOptions = [
  { value: 'centro', label: 'Centro Histórico' },
  { value: 'cidade', label: 'Cidade Baixa' },
  { value: 'menino', label: 'Menino Deus' },
  { value: 'bom_fim', label: 'Bom Fim' },
  { value: 'moinhos', label: 'Moinhos de Vento' },
  { value: 'praia_de_belas', label: 'Praia de Belas' },
];

// 2. Categorias de relato — sincronizadas com Relato.CategoriaChoices no Django
export const typeOptions = [
  { value: 'iluminacao', label: 'Iluminação insuficiente' },
  { value: 'isolamento', label: 'Trecho isolado ou com pouca circulação' },
  { value: 'assedio', label: 'Assédio ou importunação' },
  { value: 'transporte', label: 'Problema em ponto de transporte' },
  { value: 'infraestrutura', label: 'Outro fator relacionado ao espaço urbano' },
];

// 3. Turno da ocorrência — sincronizado com Relato.TurnoChoices no Django
export const shiftOptions = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
  { value: 'madrugada', label: 'Madrugada' },
];

// 4. Período aproximado da ocorrência (faixas mutuamente exclusivas) — sincronizado com Relato.PeriodoChoices
export const periodOptions = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'de_1_a_7_dias', label: 'De 1 a 7 dias atrás' },
  { value: 'de_8_a_30_dias', label: 'De 8 a 30 dias atrás' },
  { value: 'de_31_a_60_dias', label: 'De 31 a 60 dias atrás' },
  { value: 'de_61_a_90_dias', label: 'De 61 a 90 dias atrás' },
  { value: 'mais_de_90_dias', label: 'Há mais de 90 dias' },
  { value: 'nao_sei', label: 'Não sei informar' },
];
