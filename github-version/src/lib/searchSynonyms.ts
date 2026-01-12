export const synonymsMap: Record<string, string[]> = {
  'entregador': ['delivery', 'motoboy', 'courier', 'moto-frete', 'entregas', 'entregador', 'motofrete'],
  'pedreiro': ['construção', 'alvenaria', 'mestre de obras', 'construtor', 'obra'],
  'eletricista': ['elétrica', 'eletricista', 'instalação elétrica', 'fiação', 'eletrico'],
  'encanador': ['hidráulica', 'canos', 'tubulação', 'vazamento', 'hidraulico'],
  'pintor': ['pintura', 'pinturas', 'pintar', 'tinta'],
  'jardineiro': ['jardim', 'jardinagem', 'poda', 'grama', 'plantas', 'paisagismo'],
  'diarista': ['faxina', 'limpeza', 'faxineira', 'doméstica', 'limpador'],
  'motorista': ['driver', 'condutor', 'transporte', 'dirigir'],
  'babá': ['cuidador', 'babysitter', 'cuidados infantis', 'baba'],
  'cozinheiro': ['chef', 'cozinheira', 'culinária', 'cozinha'],
  'marceneiro': ['marcenaria', 'móveis', 'madeira', 'carpinteiro'],
  'montador': ['montagem', 'montar', 'móveis', 'instalação'],
  'faxineiro': ['limpeza', 'faxina', 'diarista', 'limpar'],
  'ajudante': ['auxiliar', 'assistente', 'helper', 'apoio'],
  'carregador': ['carga', 'descarga', 'carregar', 'mudança'],
};

export function expandSearchTerms(query: string): string[] {
  const normalized = query.toLowerCase().trim();
  const terms = [normalized];

  // Buscar sinônimos
  for (const [key, synonyms] of Object.entries(synonymsMap)) {
    if (key.includes(normalized) || synonyms.some(s => s.includes(normalized))) {
      terms.push(...synonyms, key);
    }
  }

  return [...new Set(terms)]; // Remove duplicatas
}
