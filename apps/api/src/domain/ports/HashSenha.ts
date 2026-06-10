// Porta para hashing de senha (impl. com bcryptjs na infra).
export interface HashSenha {
  gerar(senhaPura: string): Promise<string>;
  comparar(senhaPura: string, hash: string): Promise<boolean>;
}
