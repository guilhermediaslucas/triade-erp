export interface Perfil {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  capabilities: string[];
  criadoEm: Date; // UTC
}
