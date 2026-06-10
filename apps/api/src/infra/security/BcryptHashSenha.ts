import bcrypt from 'bcryptjs';
import type { HashSenha } from '../../domain/ports/HashSenha.js';

export class BcryptHashSenha implements HashSenha {
  constructor(private readonly rounds = 10) {}
  async gerar(senhaPura: string): Promise<string> {
    return bcrypt.hash(senhaPura, this.rounds);
  }
  async comparar(senhaPura: string, hash: string): Promise<boolean> {
    return bcrypt.compare(senhaPura, hash);
  }
}
