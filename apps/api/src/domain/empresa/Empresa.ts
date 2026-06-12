export interface BrandingEmpresa {
  logo: string | null;        // data URI ou URL
  corPrimaria: string;
  corSecundaria: string;      // realça valores financeiros/totais
  corMenuFundo: string;
  corMenuFonte: string;
  logoAltura: number;         // altura da logo no menu (px)
  idiomaPadrao: string;
  timezonePadrao: string;
  // identificação (ficha da empresa)
  cnpj: string;
  inscricaoEstadual: string;
  telefone: string;
  email: string;
  logradouro: string;
  bairro: string;
  cep: string;
  uf: string;
  cidade: string;
}

// Empresa = tenant (conta que usa o sistema).
export interface Empresa extends BrandingEmpresa {
  id: string;
  codigo: string;
  nome: string;
  fantasia: string;
  schemaName: string;
  ativo: boolean;
  criadoEm: Date; // UTC
}
