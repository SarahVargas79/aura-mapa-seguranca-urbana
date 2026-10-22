/**
 * CAMADA DE DADOS TERRITORIAIS (regionsData.js)
 * ---------------------------------------------
 * Finalidade arquitetural:
 * Separar os dados estáticos/demonstrativos da lógica visual dos componentes React.
 * Quando o backend Django REST Framework fornecer um endpoint (ex.: GET /api/regions/),
 * basta substituir ou alimentar esta estrutura sem precisar reescrever os componentes visuais.
 */

export const regionsDB = {
  centro: { 
    id: 'centro',
    name: 'Centro Histórico',
    level: 'Atenção',
    levelClass: 'yellow',
    color: '#d1a738',
    desc: 'Região central · Porto Alegre',
    copy: 'Esta região é usada para demonstrar como os fatores podem ser apresentados. A classificação não representa uma avaliação real do bairro.',
    sub: 'Consulte os fatores disponíveis antes de decidir seu trajeto.',
    advice: 'Confira opções de transporte, observe as condições do trajeto e procure canais de apoio quando necessário.',
    factors: [
      ['Iluminação e visibilidade', 'Consultar', 55, 'check'],
      ['Movimento no entorno', 'Variável', 60, 'variable'],
      ['Relatos comunitários', 'Demonstrativo', 35, 'demo']
    ],
    lat: -30.0328,
    lng: -51.2300
  },
  cidade: { 
    id: 'cidade',
    name: 'Cidade Baixa',
    level: 'Alerta',
    levelClass: 'orange',
    color: '#cf8534',
    desc: 'Área de circulação e lazer · Porto Alegre',
    copy: 'A movimentação pode variar conforme o horário e as atividades no entorno. Os fatores abaixo são exemplos de apresentação.',
    sub: 'Informações contextuais, não uma previsão de risco.',
    advice: 'Observe as condições atuais do trajeto e identifique opções de transporte e pontos de referência próximos.',
    factors: [
      ['Iluminação e visibilidade', 'Consultar', 48, 'check'],
      ['Movimento no entorno', 'Variável', 76, 'variable'],
      ['Relatos comunitários', 'Demonstrativo', 43, 'demo']
    ],
    lat: -30.0400,
    lng: -51.2200
  },
  menino: { 
    id: 'menino',
    name: 'Menino Deus',
    level: 'Perigo',
    levelClass: 'red',
    color: '#cc4759',
    desc: 'Área residencial e de serviços · Porto Alegre',
    copy: 'Esta visualização demonstra uma categoria de cor do projeto. O marcador e o nível são fictícios e não indicam perigo real.',
    sub: 'Classificação fictícia: confirme sempre as condições no local.',
    advice: 'Consulte informações oficiais, confira opções de transporte e, diante de perigo imediato, procure um local seguro.',
    factors: [
      ['Iluminação e visibilidade', 'Consultar', 70, 'check'],
      ['Movimento no entorno', 'Variável', 52, 'variable'],
      ['Relatos comunitários', 'Demonstrativo', 60, 'demo']
    ],
    lat: -30.0500,
    lng: -51.2250
  }
};

// Opções permitidas (allowlist) para seleção de região no formulário de percepção
export const regionOptions = [
  { value: 'centro', label: 'Centro Histórico' },
  { value: 'cidade', label: 'Cidade Baixa' },
  { value: 'menino', label: 'Menino Deus' }
];

// Opções permitidas (allowlist) para classificação do tipo de percepção urbana
export const typeOptions = [
  { value: 'iluminacao', label: 'Iluminação insuficiente' },
  { value: 'isolamento', label: 'Trecho isolado ou com pouca circulação' },
  { value: 'assedio', label: 'Assédio ou importunação' },
  { value: 'transporte', label: 'Condição de ponto de transporte' },
  { value: 'infraestrutura', label: 'Outro fator urbano' }
];
