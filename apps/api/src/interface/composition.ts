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
import { PerfisService } from '../application/perfil/PerfisService.js';
import { EmpresaService } from '../application/empresa/EmpresaService.js';
import { ProvisionarEmpresa } from '../application/empresa/ProvisionarEmpresa.js';
import { SqlCategoriaRepository } from '../infra/repositories/SqlCategoriaRepository.js';
import { SqlProdutoRepository } from '../infra/repositories/SqlProdutoRepository.js';
import { CategoriasService } from '../application/cadastro/CategoriasService.js';
import { ProdutosService } from '../application/cadastro/ProdutosService.js';
import { SqlMarcaRepository } from '../infra/repositories/SqlMarcaRepository.js';
import { MarcasService } from '../application/cadastro/MarcasService.js';
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
import { SqlPrecoClienteRepository } from '../infra/repositories/SqlPrecoClienteRepository.js';
import { SqlCondicaoRepository } from '../infra/repositories/SqlCondicaoRepository.js';
import { CondicoesService } from '../application/comercial/CondicoesService.js';
import { SqlFreteConfigRepository } from '../infra/repositories/SqlFreteConfigRepository.js';
import { FreteService } from '../application/comercial/FreteService.js';
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
  const marcasRepo = new SqlMarcaRepository(AppDataSource);
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

  return {
    tokens,
    usuariosRepo,
    empresasRepo,
    autenticarUsuario: new AutenticarUsuario(empresasRepo, usuariosRepo, hash, tokens, superAdminsRepo),
    usuariosService: new UsuariosService(usuariosRepo, perfisRepo, hash),
    perfisService: new PerfisService(perfisRepo),
    empresaService: new EmpresaService(empresasRepo),
    provisionarEmpresa: new ProvisionarEmpresa(empresasRepo, migrador, perfisRepo, usuariosRepo, hash),
    categoriasService: new CategoriasService(categoriasRepo),
    marcasService: new MarcasService(marcasRepo),
    favorecidosService: new FavorecidosService(favorecidosRepo),
    produtosService: new ProdutosService(produtosRepo, categoriasRepo),
    clientesService: new ClientesService(clientesRepo),
    fornecedoresService: new FornecedoresService(fornecedoresRepo),
    vendedoresService: new VendedoresService(vendedoresRepo),
    motoboysService: new MotoboysService(motoboysRepo),
    precosService: new PrecosService(precoBaseRepo, precoClienteRepo),
    freteService: new FreteService(freteConfigRepo),
    gestaoFretesService: new GestaoFretesService(new SqlGestaoFreteRepository(AppDataSource), tituloRepo),
    pedidosService: new PedidosService(pedidoRepo, produtosRepo, precoBaseRepo, precoClienteRepo, clientesRepo, estoqueRepo, etiquetaRepo, tituloRepo, condicaoRepo, motoboysRepo),
    condicoesService: new CondicoesService(condicaoRepo),
    financeiroService: new FinanceiroService(tituloRepo),
    categoriasFinanceirasService: new CategoriasFinanceirasService(catFinRepo),
    comprasService: new ComprasService(produtosRepo, tituloRepo, recebimentoRepo, estoqueRepo, marcasRepo, etiquetaRepo),
    comissoesService: new ComissoesService(new SqlComissaoRepository(AppDataSource), tituloRepo),
    contasService: new ContasService(new SqlContaCorrenteRepository(AppDataSource)),
    dashboardService: new DashboardService(new SqlDashboardRepository(AppDataSource)),
    relatoriosService: new RelatoriosService(new SqlRelatorioRepository(AppDataSource)),
    estoqueService: new EstoqueService(estoqueRepo, etiquetaRepo),
    inventarioService: new InventarioService(inventarioRepo, etiquetaRepo, estoqueRepo),
  };
}

export type Dependencias = ReturnType<typeof montarDependencias>;
