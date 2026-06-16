import { AppDataSource } from '../infra/db/data-source.js';
import { env } from '../infra/config/env.js';
import { SqlEmpresaRepository } from '../infra/repositories/SqlEmpresaRepository.js';
import { SqlSuperAdminRepository } from '../infra/repositories/SqlSuperAdminRepository.js';
import { SqlUsuarioRepository } from '../infra/repositories/SqlUsuarioRepository.js';
import { SqlPerfilRepository } from '../infra/repositories/SqlPerfilRepository.js';
import { BcryptHashSenha } from '../infra/security/BcryptHashSenha.js';
import { JwtGeradorToken } from '../infra/security/JwtGeradorToken.js';
import { TypeOrmMigrador } from '../infra/db/TypeOrmMigrador.js';
import { AutenticarUsuario } from '../application/auth/AutenticarUsuario.js';
import { UsuariosService } from '../application/usuario/UsuariosService.js';
import { AcessoMultiEmpresa } from '../application/usuario/AcessoMultiEmpresa.js';
import { PerfisService } from '../application/perfil/PerfisService.js';
import { EmpresaService } from '../application/empresa/EmpresaService.js';
import { ProvisionarEmpresa } from '../application/empresa/ProvisionarEmpresa.js';
import { SqlCategoriaRepository } from '../infra/repositories/SqlCategoriaRepository.js';
import { SqlProdutoRepository } from '../infra/repositories/SqlProdutoRepository.js';
import { CategoriasService } from '../application/cadastro/CategoriasService.js';
import { ProdutosService } from '../application/cadastro/ProdutosService.js';
import { SqlFormaEntregaRepository } from '../infra/repositories/SqlFormaEntregaRepository.js';
import { FormasEntregaService } from '../application/cadastro/FormasEntregaService.js';
import { SqlTipoDocumentoRepository } from '../infra/repositories/SqlTipoDocumentoRepository.js';
import { TiposDocumentoService } from '../application/cadastro/TiposDocumentoService.js';
import { SqlBancoRepository } from '../infra/repositories/SqlBancoRepository.js';
import { BancosService } from '../application/cadastro/BancosService.js';
import { SqlFavorecidoRepository } from '../infra/repositories/SqlFavorecidoRepository.js';
import { FavorecidosService } from '../application/cadastro/FavorecidosService.js';
import { SqlClienteRepository } from '../infra/repositories/SqlClienteRepository.js';
import { SqlFornecedorRepository } from '../infra/repositories/SqlFornecedorRepository.js';
import { SqlVendedorRepository } from '../infra/repositories/SqlVendedorRepository.js';
import { SqlMotoboyRepository } from '../infra/repositories/SqlMotoboyRepository.js';
import { ClientesService, FornecedoresService, VendedoresService } from '../application/pessoa/PessoasServices.js';
import { MotoboysService } from '../application/pessoa/MotoboysService.js';
import { SqlPrecoBaseRepository } from '../infra/repositories/SqlPrecoBaseRepository.js';
import { PrecosService } from '../application/comercial/PrecosService.js';
import { SqlCrmRepository } from '../infra/repositories/SqlCrmRepository.js';
import { CrmService } from '../application/comercial/CrmService.js';
import { MetasService } from '../application/comercial/MetasService.js';
import { SqlMetaRepository } from '../infra/repositories/SqlMetaRepository.js';
import { SqlPrecoClienteRepository } from '../infra/repositories/SqlPrecoClienteRepository.js';
import { SqlCondicaoRepository } from '../infra/repositories/SqlCondicaoRepository.js';
import { CondicoesService } from '../application/comercial/CondicoesService.js';
import { SqlFreteConfigRepository } from '../infra/repositories/SqlFreteConfigRepository.js';
import { FreteService } from '../application/comercial/FreteService.js';
import { SqlFreteCampanhaRepository } from '../infra/repositories/SqlFreteCampanhaRepository.js';
import { FreteCampanhasService } from '../application/comercial/FreteCampanhasService.js';
import { SqlGestaoFreteRepository } from '../infra/repositories/SqlGestaoFreteRepository.js';
import { GestaoFretesService } from '../application/comercial/GestaoFretesService.js';
import { SqlPedidoRepository } from '../infra/repositories/SqlPedidoRepository.js';
import { PedidosService } from '../application/comercial/PedidosService.js';
import { SqlEstoqueRepository } from '../infra/repositories/SqlEstoqueRepository.js';
import { SqlEtiquetaRepository } from '../infra/repositories/SqlEtiquetaRepository.js';
import { EstoqueService } from '../application/estoque/EstoqueService.js';
import { SqlInventarioRepository } from '../infra/repositories/SqlInventarioRepository.js';
import { InventarioService } from '../application/estoque/InventarioService.js';
import { SqlTituloRepository } from '../infra/repositories/SqlTituloRepository.js';
import { FinanceiroService } from '../application/financeiro/FinanceiroService.js';
import { SqlCategoriaFinanceiraRepository } from '../infra/repositories/SqlCategoriaFinanceiraRepository.js';
import { CategoriasFinanceirasService } from '../application/financeiro/CategoriasFinanceirasService.js';
import { SqlRecebimentoRepository } from '../infra/repositories/SqlRecebimentoRepository.js';
import { ComprasService } from '../application/financeiro/ComprasService.js';
import { SqlComissaoRepository } from '../infra/repositories/SqlComissaoRepository.js';
import { ComissoesService } from '../application/financeiro/ComissoesService.js';
import { SqlContaCorrenteRepository } from '../infra/repositories/SqlContaCorrenteRepository.js';
import { ContasService } from '../application/financeiro/ContasService.js';
import { SqlDashboardRepository } from '../infra/repositories/SqlDashboardRepository.js';
import { DashboardService } from '../application/dashboard/DashboardService.js';
import { SqlRelatorioRepository } from '../infra/repositories/SqlRelatorioRepository.js';
import { RelatoriosService } from '../application/relatorio/RelatoriosService.js';
import { SqlChamadoRepository } from '../infra/repositories/SqlChamadoRepository.js';
import { SuporteService } from '../application/suporte/SuporteService.js';
import { SqlLogAcaoRepository } from '../infra/repositories/SqlLogAcaoRepository.js';
import { R2Storage } from '../infra/storage/R2Storage.js';
import { SqlTituloAnexoRepository } from '../infra/repositories/SqlTituloAnexoRepository.js';
import { AnexosService } from '../application/financeiro/AnexosService.js';
import { ResendEmailSender } from '../infra/email/ResendEmailSender.js';
import { SqlResetSenhaRepository } from '../infra/repositories/SqlResetSenhaRepository.js';
import { RecuperarSenha } from '../application/auth/RecuperarSenha.js';

export function montarDependencias() {
  const empresasRepo = new SqlEmpresaRepository(AppDataSource);
  const superAdminsRepo = new SqlSuperAdminRepository(AppDataSource);
  const usuariosRepo = new SqlUsuarioRepository(AppDataSource);
  const perfisRepo = new SqlPerfilRepository(AppDataSource);
  const hash = new BcryptHashSenha();
  const tokens = new JwtGeradorToken(env.jwtSecret);
  const migrador = new TypeOrmMigrador(AppDataSource);
  const categoriasRepo = new SqlCategoriaRepository(AppDataSource);
  const produtosRepo = new SqlProdutoRepository(AppDataSource);
  const favorecidosRepo = new SqlFavorecidoRepository(AppDataSource);
  const clientesRepo = new SqlClienteRepository(AppDataSource);
  const fornecedoresRepo = new SqlFornecedorRepository(AppDataSource);
  const vendedoresRepo = new SqlVendedorRepository(AppDataSource);
  const motoboysRepo = new SqlMotoboyRepository(AppDataSource);
  const precoBaseRepo = new SqlPrecoBaseRepository(AppDataSource);
  const precoClienteRepo = new SqlPrecoClienteRepository(AppDataSource);
  const condicaoRepo = new SqlCondicaoRepository(AppDataSource);
  const freteConfigRepo = new SqlFreteConfigRepository(AppDataSource);
  const pedidoRepo = new SqlPedidoRepository(AppDataSource);
  const estoqueRepo = new SqlEstoqueRepository(AppDataSource);
  const etiquetaRepo = new SqlEtiquetaRepository(AppDataSource);
  const inventarioRepo = new SqlInventarioRepository(AppDataSource);
  const tituloRepo = new SqlTituloRepository(AppDataSource);
  const catFinRepo = new SqlCategoriaFinanceiraRepository(AppDataSource);
  const recebimentoRepo = new SqlRecebimentoRepository(AppDataSource);
  const emailSender = new ResendEmailSender(env.resendApiKey, env.emailFrom);
  const resetSenhaRepo = new SqlResetSenhaRepository(AppDataSource);
  const freteCampanhaRepo = new SqlFreteCampanhaRepository(AppDataSource);

  return {
    tokens,
    usuariosRepo,
    empresasRepo,
    vendedoresRepo,
    tituloRepo,
    clientesRepo,
    produtosRepo,
    precoBaseRepo,
    pedidoRepo,
    recebimentoRepo,
    autenticarUsuario: new AutenticarUsuario(empresasRepo, usuariosRepo, hash, tokens, superAdminsRepo),
    usuariosService: new UsuariosService(usuariosRepo, perfisRepo, hash),
    acessoMultiEmpresa: new AcessoMultiEmpresa(empresasRepo, usuariosRepo, perfisRepo, hash),
    perfisService: new PerfisService(perfisRepo),
    empresaService: new EmpresaService(empresasRepo, migrador, usuariosRepo, hash),
    provisionarEmpresa: new ProvisionarEmpresa(empresasRepo, migrador, perfisRepo, usuariosRepo, hash),
    categoriasService: new CategoriasService(categoriasRepo),
    formasEntregaService: new FormasEntregaService(new SqlFormaEntregaRepository(AppDataSource)),
    tiposDocumentoService: new TiposDocumentoService(new SqlTipoDocumentoRepository(AppDataSource)),
    bancosService: new BancosService(new SqlBancoRepository(AppDataSource)),
    favorecidosService: new FavorecidosService(favorecidosRepo),
    produtosService: new ProdutosService(produtosRepo, categoriasRepo),
    clientesService: new ClientesService(clientesRepo),
    fornecedoresService: new FornecedoresService(fornecedoresRepo),
    vendedoresService: new VendedoresService(vendedoresRepo),
    motoboysService: new MotoboysService(motoboysRepo),
    precosService: new PrecosService(precoBaseRepo, precoClienteRepo),
    freteService: new FreteService(freteConfigRepo, empresasRepo),
    gestaoFretesService: new GestaoFretesService(new SqlGestaoFreteRepository(AppDataSource), tituloRepo),
    pedidosService: new PedidosService(pedidoRepo, produtosRepo, precoBaseRepo, precoClienteRepo, clientesRepo, estoqueRepo, etiquetaRepo, tituloRepo, condicaoRepo, motoboysRepo, usuariosRepo, freteCampanhaRepo),
    freteCampanhasService: new FreteCampanhasService(freteCampanhaRepo),
    condicoesService: new CondicoesService(condicaoRepo),
    financeiroService: new FinanceiroService(tituloRepo, pedidoRepo),
    categoriasFinanceirasService: new CategoriasFinanceirasService(catFinRepo),
    comprasService: new ComprasService(produtosRepo, tituloRepo, recebimentoRepo, estoqueRepo, etiquetaRepo),
    comissoesService: new ComissoesService(new SqlComissaoRepository(AppDataSource), tituloRepo),
    contasService: new ContasService(new SqlContaCorrenteRepository(AppDataSource)),
    dashboardService: new DashboardService(new SqlDashboardRepository(AppDataSource), new SqlMetaRepository(AppDataSource)),
    relatoriosService: new RelatoriosService(new SqlRelatorioRepository(AppDataSource)),
    estoqueService: new EstoqueService(estoqueRepo, etiquetaRepo),
    inventarioService: new InventarioService(inventarioRepo, etiquetaRepo, estoqueRepo),
    crmService: new CrmService(new SqlCrmRepository(AppDataSource), clientesRepo),
    metasService: new MetasService(new SqlMetaRepository(AppDataSource)),
    suporteService: new SuporteService(
      new SqlChamadoRepository(AppDataSource),
      emailSender,
      env.suporteEmailDestino,
    ),
    auditoriaRepo: new SqlLogAcaoRepository(AppDataSource),
    anexosService: new AnexosService(
      new SqlTituloAnexoRepository(AppDataSource),
      new R2Storage(env.r2AccountId, env.r2AccessKeyId, env.r2SecretAccessKey, env.r2Bucket),
    ),
    recuperarSenha: new RecuperarSenha(
      empresasRepo, usuariosRepo, superAdminsRepo, resetSenhaRepo, hash, emailSender, env.appUrl,
    ),
  };
}

export type Dependencias = ReturnType<typeof montarDependencias>;
