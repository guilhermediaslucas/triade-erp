import jwt, { type SignOptions } from 'jsonwebtoken';
import type { GeradorToken, TokenPayload } from '../../domain/ports/GeradorToken.js';

export class JwtGeradorToken implements GeradorToken {
  constructor(
    private readonly segredo: string,
    // 30 dias: o "Lembrar-me" (localStorage) precisa sobreviver a dias/semanas.
    // Sem lembrar, o sessionStorage já derruba a sessão ao fechar o navegador.
    private readonly expiraEm: SignOptions['expiresIn'] = '30d',
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
      superAdmin: dados.superAdmin === true,
    };
  }
}
