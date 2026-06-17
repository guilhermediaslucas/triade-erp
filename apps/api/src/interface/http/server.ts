import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { AppDataSource } from '../../infra/db/data-source.js';
import { env } from '../../infra/config/env.js';
import { montarDependencias } from '../composition.js';
import { rotasAuth } from './rotas/auth.js';
import { rotasMe } from './rotas/me.js';
import { rotasCapabilities } from './rotas/capabilities.js';
import { rotasPerfis } from './rotas/perfis.js';
import { rotasUsuarios } from './rotas/usuarios.js';
import { rotasEmpresa } from './rotas/empresa.js';
import { rotasEmpresas } from './rotas/empresas.js';
import { rotasFiscal } from './rotas/fiscal.js';
import { rotasAnalise } from './rotas/analise.js';
import { rotasCategorias } from './rotas/categorias.js';
import { rotasFormasEntrega } from './rotas/formasEntrega.js';
import { rotasTiposDocumento } from './rotas/tiposDocumento.js';
import { rotasBancos } from './rotas/bancos.js';
import { rotasFavorecidos } from './rotas/favorecidos.js';
import { rotasProdutos } from './rotas/produtos.js';
import { rotasPessoas } from './rotas/pessoas.js';
import { rotasMotoboys } from './rotas/motoboys.js';
import { rotasPrecos } from './rotas/precos.js';
import { rotasCrm } from './rotas/crm.js';
import { rotasMetas } from './rotas/metas.js';
import { rotasFrete } from './rotas/frete.js';
import { rotasLogistica } from './rotas/logistica.js';
import { rotasPedidos } from './rotas/pedidos.js';
import { rotasEstoque } from './rotas/estoque.js';
import { rotasFinanceiro } from './rotas/financeiro.js';
import { rotasCategoriasFinanceiras } from './rotas/categoriasFinanceiras.js';
import { rotasContasContabeis } from './rotas/contasContabeis.js';
import { rotasDashboard } from './rotas/dashboard.js';
import { rotasRelatorios } from './rotas/relatorios.js';
import { rotasCondicoes } from './rotas/condicoes.js';
import { rotasContas } from './rotas/contas.js';
import { rotasSuporte } from './rotas/suporte.js';
import { rotasAuditoria } from './rotas/auditoria.js';
import { rotasAnexos } from './rotas/anexos.js';
import { criarAuditoria } from './middlewares/auditoria.js';

export function criarServidor(): Express {
  const app = express();
  // Atrás do proxy do Render: confiar no 1º proxy p/ req.ip refletir o IP real (rate limit).
  app.set('trust proxy', 1);
  // Não revelar o framework (X-Powered-By: Express).
  app.disable('x-powered-by');

  // Cabeçalhos de segurança em todas as respostas. A API só devolve JSON, então
  // CSP default-src 'none' é seguro e bloqueia qualquer render acidental de HTML.
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('Referrer-Policy', 'no-referrer');
    res.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    res.header('Cross-Origin-Resource-Policy', 'same-site');
    if (env.isProd) res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // CORS: permite o site (frontend) chamar a API. A origem vem de CORS_ORIGIN
  // (padrao '*'). Responde o preflight (OPTIONS) direto.
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', env.corsOrigin);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (env.corsOrigin !== '*') res.header('Vary', 'Origin');
    if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
    next();
  });

  // Limite maior para comportar upload de anexos (documentos até ~10 MB em base64).
  app.use(express.json({ limit: '15mb' }));

  // Auditoria: registra toda alteração (POST/PUT/PATCH/DELETE) bem-sucedida (best-effort).
  app.use(criarAuditoria(AppDataSource));

  const deps = montarDependencias();

  app.get('/health', async (_req: Request, res: Response) => {
    try {
      await AppDataSource.query('SELECT 1');
      res.json({ status: 'ok', db: 'conectado' });
    } catch (e) {
      // Não expor detalhe do erro em produção (pode vazar info de conexão).
      const detalhe = env.isProd ? undefined : (e instanceof Error ? e.message : String(e));
      res.status(503).json({ status: 'erro', db: 'sem conexao', ...(detalhe ? { detalhe } : {}) });
    }
  });

  app.use(rotasAuth(deps));
  app.use(rotasMe(deps));
  app.use(rotasCapabilities(deps.tokens));
  app.use(rotasPerfis(deps));
  app.use(rotasUsuarios(deps));
  app.use(rotasEmpresa(deps));
  app.use(rotasEmpresas(deps));
  app.use(rotasFiscal(deps));
  app.use(rotasCategorias(deps));
  app.use(rotasAnalise(deps));
  app.use(rotasFormasEntrega(deps));
  app.use(rotasTiposDocumento(deps));
  app.use(rotasBancos(deps));
  app.use(rotasFavorecidos(deps));
  app.use(rotasProdutos(deps));
  app.use(rotasPessoas(deps));
  app.use(rotasMotoboys(deps));
  app.use(rotasPrecos(deps));
  app.use(rotasCrm(deps));
  app.use(rotasMetas(deps));
  app.use(rotasFrete(deps));
  app.use(rotasLogistica(deps));
  app.use(rotasPedidos(deps));
  app.use(rotasEstoque(deps));
  app.use(rotasFinanceiro(deps));
  app.use(rotasCategoriasFinanceiras(deps));
  app.use(rotasContasContabeis(deps));
  app.use(rotasDashboard(deps));
  app.use(rotasRelatorios(deps));
  app.use(rotasCondicoes(deps));
  app.use(rotasContas(deps));
  app.use(rotasSuporte(deps));
  app.use(rotasAuditoria(deps));
  app.use(rotasAnexos(deps));

  return app;
}
