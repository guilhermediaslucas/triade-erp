import { AppDataSource } from '../infra/db/data-source.js';
import { env } from '../infra/config/env.js';
import { SqlEmpresaRepository } from '../infra/repositories/SqlEmpresaRepository.js';
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
import { SqlClienteRepository } from '../infra/repositories/SqlClienteRepository.js';
import { SqlFornecedorRepository } from '../infra/repositories/SqlFornecedorRepository.js';
import { SqlVendedorRepository } from '../infra/repositories/SqlVendedorRepository.js';
import { ClientesService, FornecedoresService, VendedoresService } from '../application/pessoa/PessoasServices.js';
import { SqlPrecoBaseRepository } from '../infra/repositories/SqlPrecoBaseRepository.js';
import { PrecosService } from '../application/comercial/PrecosService.js';
import { SqlPrecoClienteRepository } from '../infra/repositories/SqlPrecoClienteRepository.js';
import { SqlPedidoRepository } from '../infra/repositories/SqlPedidoRepository.js';
import { PedidosService } from '../application/comercial/PedidosService.js';
import { SqlEstoqueRepository } from '../infra/repositories/SqlEstoqueRepository.js';
import { EstoqueService } from '../application/estoque/EstoqueService.js';
import { SqlTituloRepository } from '../infra/repositories/SqlTituloRepository.js';
import { FinanceiroService } from '../application/financeiro/FinanceiroService.js';
import { SqlRecebimentoRepository } from '../infra/repositories/SqlRecebimentoRepository.js';
import { ComprasService } from '../application/financeiro/ComprasService.js';
import { SqlDashboardRepository } from '../infra/repositories/SqlDashboardRepository.js';
import { DashboardService } from '../application/dashboard/DashboardService.js';
import { SqlRelatorioRepository } from '../infra/repositories/SqlRelatorioRepository.js';
import { RelatoriosService } from '../application/relatorio/RelatoriosService.js';

export function montarDependencias() {
  const empresasRepo = new SqlEmpresaRepository(AppDataSource);
  const usuariosRepo = new SqlUsuarioRepository(AppDataSource);
  const perfisRepo = new SqlPerfilRepository(AppDataSource);
  const hash = new BcryptHashSenha();
  const tokens = new JwtGeradorToken(env.jwtSecret);
  const migrador = new TypeOrmMigrador(AppDataSource);
  const categoriasRepo = new SqlCategoriaRepository(AppDataSource);
  const produtosRepo = new SqlProdutoRepository(AppDataSource);
  const clientesRepo = new SqlClienteRepository(AppDataSource);
  const fornecedoresRepo = new SqlFornecedorRepository(AppDataSource);
  const vendedoresRepo = new SqlVendedorRepository(AppDataSource);
  const precoBaseRepo = new SqlPrecoBaseRepository(AppDataSource);
  const precoClienteRepo = new SqlPrecoClienteRepository(AppDataSource);
  const pedidoRepo = new SqlPedidoRepository(AppDataSource);
  const estoqueRepo = new SqlEstoqueRepository(AppDataSource);
  const tituloRepo = new SqlTituloRepository(AppDataSource);
  const recebimentoRepo = new SqlRecebimentoRepository(AppDataSource);

  return {
    tokens,
    usuariosRepo,
    empresasRepo,
    autenticarUsuario: new AutenticarUsuario(empresasRepo, usuariosRepo, hash, tokens),
    usuariosService: new UsuariosService(usuariosRepo, perfisRepo, hash),
    perfisService: new PerfisService(perfisRepo),
    empresaService: new EmpresaService(empresasRepo),
    provisionarEmpresa: new ProvisionarEmpresa(empresasRepo, migrador, perfisRepo, usuariosRepo, hash),
    categoriasService: new CategoriasService(categoriasRepo),
    produtosService: new ProdutosService(produtosRepo, categoriasRepo),
    clientesService: new ClientesService(clientesRepo),
    fornecedoresService: new FornecedoresService(fornecedoresRepo),
    vendedoresService: new VendedoresService(vendedoresRepo),
    precosService: new PrecosService(precoBaseRepo, precoClienteRepo),
    pedidosService: new PedidosService(pedidoRepo, produtosRepo, precoBaseRepo, precoClienteRepo, clientesRepo, estoqueRepo, tituloRepo),
    financeiroService: new FinanceiroService(tituloRepo),
    comprasService: new ComprasService(produtosRepo, tituloRepo, recebimentoRepo, estoqueRepo),
    dashboardService: new DashboardService(new SqlDashboardRepository(AppDataSource)),
    relatoriosService: new RelatoriosService(new SqlRelatorioRepository(AppDataSource)),
    estoqueService: new EstoqueService(estoqueRepo),
  };
}

export type Dependencias = ReturnType<typeof montarDependencias>;
