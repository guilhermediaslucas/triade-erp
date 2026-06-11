export interface TokenPayload {
  sub: string;       // id do usuario
  empresa: string;   // codigo da empresa
  schema: string;    // schema do tenant
  nome: string;
  email: string;
  superAdmin?: boolean;  // admin global do sistema (acesso total + troca de empresa)
}

// Porta para emitir/validar tokens (impl. com JWT na infra).
export interface GeradorToken {
  gerar(payload: TokenPayload): string;
  verificar(token: string): TokenPayload;
}
