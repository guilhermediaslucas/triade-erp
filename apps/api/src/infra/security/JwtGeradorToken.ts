import jwt, { type SignOptions } from 'jsonwebtoken';
import type { GeradorToken, TokenPayload } from '../../domain/ports/GeradorToken.js';

export class JwtGeradorToken implements GeradorToken {
  constructor(
    private readonly segredo: string,
    private readonly expiraEm: SignOptions['expiresIn'] = '8h',
  ) {}

  gerar(payload: TokenPayload): string {
    return jwt.sign(payload, this.segredo, { expiresIn: this.expiraEm });
  }

  verificar(token: string): TokenPayload {
    const dados = jwt.verify(token, this.segredo) as jwt.JwtPayload;
    return {
      sub: String(dados.sub),
      empresa: String(dados.empresa),
      schema: String(dados.schema),
      nome: String(dados.nome),
      email: String(dados.email),
    };
  }
}
