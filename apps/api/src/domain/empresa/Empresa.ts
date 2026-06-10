// Entidade de dominio pura (sem ORM). Empresa = tenant (conta que usa o sistema).
export interface Empresa {
  id: string;
  codigo: string;      // slug curto usado no login (ex.: "belle")
  nome: string;        // razao social
  fantasia: string;    // nome fantasia
  schemaName: string;  // schema dedicado deste tenant no Postgres
  ativo: boolean;
  criadoEm: Date;      // UTC
}
