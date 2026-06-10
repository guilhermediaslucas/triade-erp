export interface BrandingEmpresa {
  logo: string | null;        // data URI ou URL
  corPrimaria: string;
  corMenuFundo: string;
  corMenuFonte: string;
  idiomaPadrao: string;
  timezonePadrao: string;
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
