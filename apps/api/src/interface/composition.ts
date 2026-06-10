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
    precosService: new PrecosService(precoBaseRepo),
  };
}

export type Dependencias = ReturnType<typeof montarDependencias>;
