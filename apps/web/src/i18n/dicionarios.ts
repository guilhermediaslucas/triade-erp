import type { Idioma } from '@triade/shared';
type Dict = Record<string, string>;

const pt: Dict = {
  'app.nome': 'TRIADE ERP',
  'login.titulo': 'Entrar', 'login.empresa': 'Código da empresa', 'login.email': 'E-mail',
  'login.senha': 'Senha', 'login.entrar': 'Entrar', 'login.entrando': 'Entrando...',
  'login.subtitulo': 'Acesse sua conta para continuar',
  'menu.dashboard': 'Dashboard', 'menu.acesso': 'Acesso', 'menu.usuarios': 'Usuários', 'menu.perfis': 'Perfis',
  'topbar.sair': 'Sair',
  'dashboard.titulo': 'Visão geral', 'dashboard.bemvindo': 'Bem-vindo(a)',
  'dashboard.placeholder': 'Os indicadores da operação aparecerão aqui conforme os módulos forem implementados.',
  'common.salvar': 'Salvar', 'common.cancelar': 'Cancelar', 'common.editar': 'Editar',
  'common.fechar': 'Fechar', 'common.sim': 'Sim', 'common.nao': 'Não', 'common.carregando': 'Carregando...',
  'common.nenhum': 'Nenhum registro.',
  'usuarios.titulo': 'Usuários', 'usuarios.novo': 'Novo usuário', 'usuarios.nome': 'Nome',
  'usuarios.email': 'E-mail', 'usuarios.perfil': 'Perfil', 'usuarios.senha': 'Senha',
  'usuarios.situacao': 'Situação', 'usuarios.acoes': 'Ações', 'usuarios.ativo': 'Ativo',
  'usuarios.inativo': 'Inativo', 'usuarios.ativar': 'Ativar', 'usuarios.inativar': 'Inativar',
  'usuarios.editar_titulo': 'Editar usuário', 'usuarios.novo_titulo': 'Novo usuário',
  'usuarios.sem_perfil': '(sem perfil)', 'usuarios.redefinir_senha': 'Redefinir senha',
  'usuarios.nova_senha': 'Nova senha', 'usuarios.senha_hint': 'Mínimo de 6 caracteres.',
  'usuarios.salvo': 'Usuário salvo.', 'usuarios.senha_alterada': 'Senha alterada.',
  'perfis.titulo': 'Perfis', 'perfis.novo': 'Novo perfil', 'perfis.nome': 'Nome do perfil',
  'perfis.permissoes': 'Permissões', 'perfis.qtd_permissoes': 'permissões',
  'perfis.editar_titulo': 'Editar perfil', 'perfis.novo_titulo': 'Novo perfil', 'perfis.salvo': 'Perfil salvo.',
  'cap.modulo.dashboard': 'Painel', 'cap.modulo.acesso': 'Acesso',
  'cap.dashboard.ver': 'Ver o dashboard',
  'cap.acesso.usuario.listar': 'Listar usuários', 'cap.acesso.usuario.gerenciar': 'Criar e editar usuários',
  'cap.acesso.perfil.listar': 'Listar perfis', 'cap.acesso.perfil.gerenciar': 'Criar e editar perfis',
  'cap.acesso.empresa.editar': 'Editar dados da empresa',
  'auth.campos_obrigatorios': 'Preencha empresa, e-mail e senha.',
  'auth.credenciais_invalidas': 'E-mail ou senha incorretos.',
  'auth.empresa_invalida': 'Empresa não encontrada ou inativa.',
  'auth.token_ausente': 'Sessão não encontrada. Faça login novamente.',
  'auth.token_invalido': 'Sessão expirada. Faça login novamente.',
  'auth.sem_permissao': 'Você não tem permissão para esta ação.',
  'usuario.nome_invalido': 'Informe um nome válido.', 'usuario.email_invalido': 'E-mail inválido.',
  'usuario.email_em_uso': 'Já existe um usuário com este e-mail.', 'usuario.senha_curta': 'A senha deve ter ao menos 6 caracteres.',
  'usuario.perfil_invalido': 'Perfil inválido.', 'usuario.nao_encontrado': 'Usuário não encontrado.',
  'perfil.nome_invalido': 'Informe um nome de perfil válido.', 'perfil.capability_invalida': 'Permissão inválida.',
  'perfil.nao_encontrado': 'Perfil não encontrado.',
  'erro.interno': 'Ocorreu um erro. Tente novamente.', 'erro.rede': 'Falha de conexão com o servidor.',
};

const en: Dict = {
  'login.titulo': 'Sign in', 'login.empresa': 'Company code', 'login.email': 'E-mail',
  'login.senha': 'Password', 'login.entrar': 'Sign in', 'login.entrando': 'Signing in...',
  'login.subtitulo': 'Access your account to continue',
  'menu.dashboard': 'Dashboard', 'menu.acesso': 'Access', 'menu.usuarios': 'Users', 'menu.perfis': 'Roles',
  'topbar.sair': 'Sign out',
  'dashboard.titulo': 'Overview', 'dashboard.bemvindo': 'Welcome',
  'dashboard.placeholder': 'Operation metrics will appear here as modules are implemented.',
  'common.salvar': 'Save', 'common.cancelar': 'Cancel', 'common.editar': 'Edit',
  'common.fechar': 'Close', 'common.sim': 'Yes', 'common.nao': 'No', 'common.carregando': 'Loading...',
  'common.nenhum': 'No records.',
  'usuarios.titulo': 'Users', 'usuarios.novo': 'New user', 'usuarios.nome': 'Name',
  'usuarios.email': 'E-mail', 'usuarios.perfil': 'Role', 'usuarios.senha': 'Password',
  'usuarios.situacao': 'Status', 'usuarios.acoes': 'Actions', 'usuarios.ativo': 'Active',
  'usuarios.inativo': 'Inactive', 'usuarios.ativar': 'Activate', 'usuarios.inativar': 'Deactivate',
  'usuarios.editar_titulo': 'Edit user', 'usuarios.novo_titulo': 'New user',
  'usuarios.sem_perfil': '(no role)', 'usuarios.redefinir_senha': 'Reset password',
  'usuarios.nova_senha': 'New password', 'usuarios.senha_hint': 'At least 6 characters.',
  'usuarios.salvo': 'User saved.', 'usuarios.senha_alterada': 'Password changed.',
  'perfis.titulo': 'Roles', 'perfis.novo': 'New role', 'perfis.nome': 'Role name',
  'perfis.permissoes': 'Permissions', 'perfis.qtd_permissoes': 'permissions',
  'perfis.editar_titulo': 'Edit role', 'perfis.novo_titulo': 'New role', 'perfis.salvo': 'Role saved.',
  'cap.modulo.dashboard': 'Dashboard', 'cap.modulo.acesso': 'Access',
  'cap.dashboard.ver': 'View dashboard',
  'cap.acesso.usuario.listar': 'List users', 'cap.acesso.usuario.gerenciar': 'Create and edit users',
  'cap.acesso.perfil.listar': 'List roles', 'cap.acesso.perfil.gerenciar': 'Create and edit roles',
  'cap.acesso.empresa.editar': 'Edit company data',
  'auth.campos_obrigatorios': 'Fill in company, e-mail and password.',
  'auth.credenciais_invalidas': 'Wrong e-mail or password.',
  'auth.empresa_invalida': 'Company not found or inactive.',
  'auth.token_ausente': 'Session not found. Please sign in again.',
  'auth.token_invalido': 'Session expired. Please sign in again.',
  'auth.sem_permissao': 'You do not have permission for this action.',
  'usuario.nome_invalido': 'Enter a valid name.', 'usuario.email_invalido': 'Invalid e-mail.',
  'usuario.email_em_uso': 'A user with this e-mail already exists.', 'usuario.senha_curta': 'Password must be at least 6 characters.',
  'usuario.perfil_invalido': 'Invalid role.', 'usuario.nao_encontrado': 'User not found.',
  'perfil.nome_invalido': 'Enter a valid role name.', 'perfil.capability_invalida': 'Invalid permission.',
  'perfil.nao_encontrado': 'Role not found.',
  'erro.interno': 'An error occurred. Please try again.', 'erro.rede': 'Connection to the server failed.',
};

const es: Dict = {
  'login.titulo': 'Iniciar sesión', 'login.empresa': 'Código de la empresa', 'login.email': 'Correo',
  'login.senha': 'Contraseña', 'login.entrar': 'Entrar', 'login.entrando': 'Entrando...',
  'login.subtitulo': 'Accede a tu cuenta para continuar',
  'menu.dashboard': 'Panel', 'menu.acesso': 'Acceso', 'menu.usuarios': 'Usuarios', 'menu.perfis': 'Perfiles',
  'topbar.sair': 'Salir',
  'dashboard.titulo': 'Visión general', 'dashboard.bemvindo': 'Bienvenido(a)',
  'dashboard.placeholder': 'Los indicadores de la operación aparecerán aquí a medida que se implementen los módulos.',
  'common.salvar': 'Guardar', 'common.cancelar': 'Cancelar', 'common.editar': 'Editar',
  'common.fechar': 'Cerrar', 'common.sim': 'Sí', 'common.nao': 'No', 'common.carregando': 'Cargando...',
  'common.nenhum': 'Sin registros.',
  'usuarios.titulo': 'Usuarios', 'usuarios.novo': 'Nuevo usuario', 'usuarios.nome': 'Nombre',
  'usuarios.email': 'Correo', 'usuarios.perfil': 'Perfil', 'usuarios.senha': 'Contraseña',
  'usuarios.situacao': 'Estado', 'usuarios.acoes': 'Acciones', 'usuarios.ativo': 'Activo',
  'usuarios.inativo': 'Inactivo', 'usuarios.ativar': 'Activar', 'usuarios.inativar': 'Desactivar',
  'usuarios.editar_titulo': 'Editar usuario', 'usuarios.novo_titulo': 'Nuevo usuario',
  'usuarios.sem_perfil': '(sin perfil)', 'usuarios.redefinir_senha': 'Restablecer contraseña',
  'usuarios.nova_senha': 'Nueva contraseña', 'usuarios.senha_hint': 'Mínimo 6 caracteres.',
  'usuarios.salvo': 'Usuario guardado.', 'usuarios.senha_alterada': 'Contraseña cambiada.',
  'perfis.titulo': 'Perfiles', 'perfis.novo': 'Nuevo perfil', 'perfis.nome': 'Nombre del perfil',
  'perfis.permissoes': 'Permisos', 'perfis.qtd_permissoes': 'permisos',
  'perfis.editar_titulo': 'Editar perfil', 'perfis.novo_titulo': 'Nuevo perfil', 'perfis.salvo': 'Perfil guardado.',
  'cap.modulo.dashboard': 'Panel', 'cap.modulo.acesso': 'Acceso',
  'cap.dashboard.ver': 'Ver el panel',
  'cap.acesso.usuario.listar': 'Listar usuarios', 'cap.acesso.usuario.gerenciar': 'Crear y editar usuarios',
  'cap.acesso.perfil.listar': 'Listar perfiles', 'cap.acesso.perfil.gerenciar': 'Crear y editar perfiles',
  'cap.acesso.empresa.editar': 'Editar datos de la empresa',
  'auth.campos_obrigatorios': 'Completa empresa, correo y contraseña.',
  'auth.credenciais_invalidas': 'Correo o contraseña incorrectos.',
  'auth.empresa_invalida': 'Empresa no encontrada o inactiva.',
  'auth.token_ausente': 'Sesión no encontrada. Inicia sesión de nuevo.',
  'auth.token_invalido': 'Sesión expirada. Inicia sesión de nuevo.',
  'auth.sem_permissao': 'No tienes permiso para esta acción.',
  'usuario.nome_invalido': 'Ingresa un nombre válido.', 'usuario.email_invalido': 'Correo inválido.',
  'usuario.email_em_uso': 'Ya existe un usuario con este correo.', 'usuario.senha_curta': 'La contraseña debe tener al menos 6 caracteres.',
  'usuario.perfil_invalido': 'Perfil inválido.', 'usuario.nao_encontrado': 'Usuario no encontrado.',
  'perfil.nome_invalido': 'Ingresa un nombre de perfil válido.', 'perfil.capability_invalida': 'Permiso inválido.',
  'perfil.nao_encontrado': 'Perfil no encontrado.',
  'erro.interno': 'Ocurrió un error. Inténtalo de nuevo.', 'erro.rede': 'Error de conexión con el servidor.',
};

export const dicionarios: Record<Idioma, Dict> = { 'pt-BR': pt, 'en-US': en, es };

// --- Fase 1B: Dados da empresa ---
Object.assign(pt, {
  'menu.config': 'Configurações', 'menu.empresa': 'Dados da empresa',
  'empresa.titulo': 'Dados da empresa', 'empresa.fantasia': 'Nome fantasia',
  'empresa.logo': 'Logotipo', 'empresa.logo_enviar': 'Enviar imagem', 'empresa.logo_remover': 'Remover',
  'empresa.logo_hint': 'PNG ou JPG, até 1,5 MB. Aparece no menu lateral.',
  'empresa.cor_primaria': 'Cor primária', 'empresa.cor_menu_fundo': 'Menu — fundo', 'empresa.cor_menu_fonte': 'Menu — fonte',
  'empresa.idioma_padrao': 'Idioma padrão', 'empresa.timezone_padrao': 'Fuso horário padrão',
  'empresa.salvo': 'Dados da empresa salvos.',
  'empresa.nao_encontrada': 'Empresa não encontrada.', 'empresa.fantasia_invalida': 'Informe um nome fantasia válido.',
  'empresa.cor_invalida': 'Cor inválida.', 'empresa.idioma_invalido': 'Idioma inválido.',
  'empresa.timezone_invalido': 'Fuso horário inválido.', 'empresa.logo_grande': 'A imagem é muito grande (máx. 1,5 MB).',
});
Object.assign(en, {
  'menu.config': 'Settings', 'menu.empresa': 'Company data',
  'empresa.titulo': 'Company data', 'empresa.fantasia': 'Trade name',
  'empresa.logo': 'Logo', 'empresa.logo_enviar': 'Upload image', 'empresa.logo_remover': 'Remove',
  'empresa.logo_hint': 'PNG or JPG, up to 1.5 MB. Shown in the sidebar.',
  'empresa.cor_primaria': 'Primary color', 'empresa.cor_menu_fundo': 'Menu — background', 'empresa.cor_menu_fonte': 'Menu — text',
  'empresa.idioma_padrao': 'Default language', 'empresa.timezone_padrao': 'Default timezone',
  'empresa.salvo': 'Company data saved.',
  'empresa.nao_encontrada': 'Company not found.', 'empresa.fantasia_invalida': 'Enter a valid trade name.',
  'empresa.cor_invalida': 'Invalid color.', 'empresa.idioma_invalido': 'Invalid language.',
  'empresa.timezone_invalido': 'Invalid timezone.', 'empresa.logo_grande': 'Image too large (max 1.5 MB).',
});
Object.assign(es, {
  'menu.config': 'Configuración', 'menu.empresa': 'Datos de la empresa',
  'empresa.titulo': 'Datos de la empresa', 'empresa.fantasia': 'Nombre comercial',
  'empresa.logo': 'Logotipo', 'empresa.logo_enviar': 'Subir imagen', 'empresa.logo_remover': 'Quitar',
  'empresa.logo_hint': 'PNG o JPG, hasta 1,5 MB. Aparece en el menú lateral.',
  'empresa.cor_primaria': 'Color primario', 'empresa.cor_menu_fundo': 'Menú — fondo', 'empresa.cor_menu_fonte': 'Menú — texto',
  'empresa.idioma_padrao': 'Idioma predeterminado', 'empresa.timezone_padrao': 'Zona horaria predeterminada',
  'empresa.salvo': 'Datos de la empresa guardados.',
  'empresa.nao_encontrada': 'Empresa no encontrada.', 'empresa.fantasia_invalida': 'Ingresa un nombre comercial válido.',
  'empresa.cor_invalida': 'Color inválido.', 'empresa.idioma_invalido': 'Idioma inválido.',
  'empresa.timezone_invalido': 'Zona horaria inválida.', 'empresa.logo_grande': 'La imagen es muy grande (máx. 1,5 MB).',
});

// --- Fase 1B2: Super-admin / Empresas ---
Object.assign(pt, {
  'menu.superadmin': 'Super-admin', 'menu.empresas': 'Empresas',
  'cap.modulo.superadmin': 'Super-admin', 'cap.superadmin.empresa.provisionar': 'Provisionar empresas',
  'empresas.titulo': 'Empresas', 'empresas.codigo': 'Código', 'empresas.nome': 'Razão social',
  'empresas.fantasia': 'Nome fantasia', 'empresas.admin': 'Administrador inicial',
  'empresas.provisionar': 'Provisionar empresa',
  'empresas.provisionar_hint': 'Cria uma nova empresa com seu banco isolado, perfil Administrador e o primeiro usuário.',
  'empresas.codigo_hint': 'Só letras e números, sem espaços. Usado no login.',
  'empresas.criada': 'Empresa provisionada com sucesso.',
  'empresa.codigo_invalido': 'Código inválido (use letras e números, sem espaços).',
  'empresa.codigo_em_uso': 'Já existe uma empresa com este código.', 'empresa.nome_invalido': 'Informe uma razão social válida.',
});
Object.assign(en, {
  'menu.superadmin': 'Super-admin', 'menu.empresas': 'Companies',
  'cap.modulo.superadmin': 'Super-admin', 'cap.superadmin.empresa.provisionar': 'Provision companies',
  'empresas.titulo': 'Companies', 'empresas.codigo': 'Code', 'empresas.nome': 'Legal name',
  'empresas.fantasia': 'Trade name', 'empresas.admin': 'Initial administrator',
  'empresas.provisionar': 'Provision company',
  'empresas.provisionar_hint': 'Creates a new company with its own isolated database, an Administrator role and the first user.',
  'empresas.codigo_hint': 'Letters and numbers only, no spaces. Used at login.',
  'empresas.criada': 'Company provisioned successfully.',
  'empresa.codigo_invalido': 'Invalid code (use letters and numbers, no spaces).',
  'empresa.codigo_em_uso': 'A company with this code already exists.', 'empresa.nome_invalido': 'Enter a valid legal name.',
});
Object.assign(es, {
  'menu.superadmin': 'Super-admin', 'menu.empresas': 'Empresas',
  'cap.modulo.superadmin': 'Super-admin', 'cap.superadmin.empresa.provisionar': 'Aprovisionar empresas',
  'empresas.titulo': 'Empresas', 'empresas.codigo': 'Código', 'empresas.nome': 'Razón social',
  'empresas.fantasia': 'Nombre comercial', 'empresas.admin': 'Administrador inicial',
  'empresas.provisionar': 'Aprovisionar empresa',
  'empresas.provisionar_hint': 'Crea una nueva empresa con su base de datos aislada, un perfil Administrador y el primer usuario.',
  'empresas.codigo_hint': 'Solo letras y números, sin espacios. Se usa en el inicio de sesión.',
  'empresas.criada': 'Empresa aprovisionada con éxito.',
  'empresa.codigo_invalido': 'Código inválido (usa letras y números, sin espacios).',
  'empresa.codigo_em_uso': 'Ya existe una empresa con este código.', 'empresa.nome_invalido': 'Ingresa una razón social válida.',
});

// --- Fase 2A: Cadastros (Categorias, Produtos) ---
Object.assign(pt, {
  'menu.cadastros': 'Cadastros', 'menu.categorias': 'Categorias', 'menu.produtos': 'Produtos',
  'cap.modulo.cadastros': 'Cadastros',
  'cap.cadastros.categoria.listar': 'Listar categorias', 'cap.cadastros.categoria.gerenciar': 'Criar e editar categorias',
  'cap.cadastros.produto.listar': 'Listar produtos', 'cap.cadastros.produto.gerenciar': 'Criar e editar produtos',
  'categorias.titulo': 'Categorias', 'categorias.nova': 'Nova categoria', 'categorias.nome': 'Nome',
  'produtos.titulo': 'Produtos', 'produtos.novo': 'Novo produto', 'produtos.nome': 'Nome',
  'produtos.categoria': 'Categoria', 'produtos.unidade': 'Unidade', 'produtos.preco': 'Preço',
  'produtos.minimo': 'Estoque mínimo', 'produtos.sem_categoria': '(sem categoria)',
  'cadastro.nome_invalido': 'Informe um nome válido.', 'cadastro.nao_encontrado': 'Registro não encontrado.',
  'produto.preco_invalido': 'Preço inválido.', 'produto.minimo_invalido': 'Estoque mínimo inválido.',
  'produto.categoria_invalida': 'Categoria inválida.',
});
Object.assign(en, {
  'menu.cadastros': 'Records', 'menu.categorias': 'Categories', 'menu.produtos': 'Products',
  'cap.modulo.cadastros': 'Records',
  'cap.cadastros.categoria.listar': 'List categories', 'cap.cadastros.categoria.gerenciar': 'Create and edit categories',
  'cap.cadastros.produto.listar': 'List products', 'cap.cadastros.produto.gerenciar': 'Create and edit products',
  'categorias.titulo': 'Categories', 'categorias.nova': 'New category', 'categorias.nome': 'Name',
  'produtos.titulo': 'Products', 'produtos.novo': 'New product', 'produtos.nome': 'Name',
  'produtos.categoria': 'Category', 'produtos.unidade': 'Unit', 'produtos.preco': 'Price',
  'produtos.minimo': 'Minimum stock', 'produtos.sem_categoria': '(no category)',
  'cadastro.nome_invalido': 'Enter a valid name.', 'cadastro.nao_encontrado': 'Record not found.',
  'produto.preco_invalido': 'Invalid price.', 'produto.minimo_invalido': 'Invalid minimum stock.',
  'produto.categoria_invalida': 'Invalid category.',
});
Object.assign(es, {
  'menu.cadastros': 'Registros', 'menu.categorias': 'Categorías', 'menu.produtos': 'Productos',
  'cap.modulo.cadastros': 'Registros',
  'cap.cadastros.categoria.listar': 'Listar categorías', 'cap.cadastros.categoria.gerenciar': 'Crear y editar categorías',
  'cap.cadastros.produto.listar': 'Listar productos', 'cap.cadastros.produto.gerenciar': 'Crear y editar productos',
  'categorias.titulo': 'Categorías', 'categorias.nova': 'Nueva categoría', 'categorias.nome': 'Nombre',
  'produtos.titulo': 'Productos', 'produtos.novo': 'Nuevo producto', 'produtos.nome': 'Nombre',
  'produtos.categoria': 'Categoría', 'produtos.unidade': 'Unidad', 'produtos.preco': 'Precio',
  'produtos.minimo': 'Stock mínimo', 'produtos.sem_categoria': '(sin categoría)',
  'cadastro.nome_invalido': 'Ingresa un nombre válido.', 'cadastro.nao_encontrado': 'Registro no encontrado.',
  'produto.preco_invalido': 'Precio inválido.', 'produto.minimo_invalido': 'Stock mínimo inválido.',
  'produto.categoria_invalida': 'Categoría inválida.',
});

// --- Alinhamento de menu ao mockup (sub-rotulos do Cadastros) ---
Object.assign(pt, { 'menu.sub.comercial': 'Comercial', 'menu.sub.pessoas': 'Pessoas', 'menu.sub.estoque': 'Estoque/Expedição', 'menu.sub.financeiro': 'Financeiro' });
Object.assign(en, { 'menu.sub.comercial': 'Sales', 'menu.sub.pessoas': 'People', 'menu.sub.estoque': 'Inventory/Shipping', 'menu.sub.financeiro': 'Finance' });
Object.assign(es, { 'menu.sub.comercial': 'Comercial', 'menu.sub.pessoas': 'Personas', 'menu.sub.estoque': 'Inventario/Expedición', 'menu.sub.financeiro': 'Finanzas' });

// --- Fase 2B: Pessoas (Clientes, Fornecedores, Vendedores) ---
Object.assign(pt, {
  'menu.clientes': 'Clientes', 'menu.fornecedores': 'Fornecedores', 'menu.vendedores': 'Vendedores',
  'cap.cadastros.cliente.listar': 'Listar clientes', 'cap.cadastros.cliente.gerenciar': 'Criar e editar clientes',
  'cap.cadastros.fornecedor.listar': 'Listar fornecedores', 'cap.cadastros.fornecedor.gerenciar': 'Criar e editar fornecedores',
  'cap.cadastros.vendedor.listar': 'Listar vendedores', 'cap.cadastros.vendedor.gerenciar': 'Criar e editar vendedores',
  'pessoa.nome': 'Nome', 'pessoa.razao': 'Razão social', 'pessoa.fantasia': 'Nome fantasia',
  'pessoa.documento': 'CPF/CNPJ', 'pessoa.email': 'E-mail', 'pessoa.telefone': 'Telefone',
  'clientes.titulo': 'Clientes', 'clientes.novo': 'Novo cliente', 'clientes.nome': 'Nome',
  'clientes.tipo': 'Tipo de pessoa', 'clientes.pj': 'Pessoa jurídica (PJ)', 'clientes.pf': 'Pessoa física (PF)',
  'clientes.nome_completo': 'Nome completo', 'clientes.limite': 'Limite de crédito',
  'fornecedores.titulo': 'Fornecedores', 'fornecedores.novo': 'Novo fornecedor',
  'vendedores.titulo': 'Vendedores', 'vendedores.novo': 'Novo vendedor', 'vendedores.comissao': 'Comissão (%)',
  'pessoa.documento_invalido': 'Informe um CPF/CNPJ válido.', 'pessoa.limite_invalido': 'Limite de crédito inválido.',
  'vendedor.comissao_invalida': 'Comissão inválida (0 a 100).',
});
Object.assign(en, {
  'menu.clientes': 'Customers', 'menu.fornecedores': 'Suppliers', 'menu.vendedores': 'Sales reps',
  'cap.cadastros.cliente.listar': 'List customers', 'cap.cadastros.cliente.gerenciar': 'Create and edit customers',
  'cap.cadastros.fornecedor.listar': 'List suppliers', 'cap.cadastros.fornecedor.gerenciar': 'Create and edit suppliers',
  'cap.cadastros.vendedor.listar': 'List sales reps', 'cap.cadastros.vendedor.gerenciar': 'Create and edit sales reps',
  'pessoa.nome': 'Name', 'pessoa.razao': 'Legal name', 'pessoa.fantasia': 'Trade name',
  'pessoa.documento': 'Tax ID', 'pessoa.email': 'E-mail', 'pessoa.telefone': 'Phone',
  'clientes.titulo': 'Customers', 'clientes.novo': 'New customer', 'clientes.nome': 'Name',
  'clientes.tipo': 'Entity type', 'clientes.pj': 'Company', 'clientes.pf': 'Individual',
  'clientes.nome_completo': 'Full name', 'clientes.limite': 'Credit limit',
  'fornecedores.titulo': 'Suppliers', 'fornecedores.novo': 'New supplier',
  'vendedores.titulo': 'Sales reps', 'vendedores.novo': 'New sales rep', 'vendedores.comissao': 'Commission (%)',
  'pessoa.documento_invalido': 'Enter a valid tax ID.', 'pessoa.limite_invalido': 'Invalid credit limit.',
  'vendedor.comissao_invalida': 'Invalid commission (0 to 100).',
});
Object.assign(es, {
  'menu.clientes': 'Clientes', 'menu.fornecedores': 'Proveedores', 'menu.vendedores': 'Vendedores',
  'cap.cadastros.cliente.listar': 'Listar clientes', 'cap.cadastros.cliente.gerenciar': 'Crear y editar clientes',
  'cap.cadastros.fornecedor.listar': 'Listar proveedores', 'cap.cadastros.fornecedor.gerenciar': 'Crear y editar proveedores',
  'cap.cadastros.vendedor.listar': 'Listar vendedores', 'cap.cadastros.vendedor.gerenciar': 'Crear y editar vendedores',
  'pessoa.nome': 'Nombre', 'pessoa.razao': 'Razón social', 'pessoa.fantasia': 'Nombre comercial',
  'pessoa.documento': 'CPF/CNPJ', 'pessoa.email': 'Correo', 'pessoa.telefone': 'Teléfono',
  'clientes.titulo': 'Clientes', 'clientes.novo': 'Nuevo cliente', 'clientes.nome': 'Nombre',
  'clientes.tipo': 'Tipo de persona', 'clientes.pj': 'Persona jurídica', 'clientes.pf': 'Persona física',
  'clientes.nome_completo': 'Nombre completo', 'clientes.limite': 'Límite de crédito',
  'fornecedores.titulo': 'Proveedores', 'fornecedores.novo': 'Nuevo proveedor',
  'vendedores.titulo': 'Vendedores', 'vendedores.novo': 'Nuevo vendedor', 'vendedores.comissao': 'Comisión (%)',
  'pessoa.documento_invalido': 'Ingresa un CPF/CNPJ válido.', 'pessoa.limite_invalido': 'Límite de crédito inválido.',
  'vendedor.comissao_invalida': 'Comisión inválida (0 a 100).',
});

// --- Fidelidade Clientes (enderecos, busca CNPJ/CEP) ---
Object.assign(pt, {
  'clientes.cidade': 'Cidade', 'clientes.buscar': 'Buscar', 'clientes.enderecos': 'Endereços',
  'clientes.add_endereco': 'Adicionar endereço', 'clientes.sem_endereco': 'Nenhum endereço. O favorito será usado como padrão no pedido.',
  'clientes.favorito': 'Favorito', 'clientes.remover': 'Remover',
  'clientes.logradouro': 'Logradouro', 'clientes.numero': 'Número', 'clientes.bairro': 'Bairro',
  'clientes.cnpj_incompleto': 'Informe um CNPJ completo para buscar.', 'clientes.cnpj_nao_encontrado': 'CNPJ não encontrado.',
});
Object.assign(en, {
  'clientes.cidade': 'City', 'clientes.buscar': 'Look up', 'clientes.enderecos': 'Addresses',
  'clientes.add_endereco': 'Add address', 'clientes.sem_endereco': 'No address. The favorite is used as default in orders.',
  'clientes.favorito': 'Favorite', 'clientes.remover': 'Remove',
  'clientes.logradouro': 'Street', 'clientes.numero': 'Number', 'clientes.bairro': 'District',
  'clientes.cnpj_incompleto': 'Enter a full tax ID to look up.', 'clientes.cnpj_nao_encontrado': 'Tax ID not found.',
});
Object.assign(es, {
  'clientes.cidade': 'Ciudad', 'clientes.buscar': 'Buscar', 'clientes.enderecos': 'Direcciones',
  'clientes.add_endereco': 'Agregar dirección', 'clientes.sem_endereco': 'Sin dirección. La favorita se usa por defecto en el pedido.',
  'clientes.favorito': 'Favorita', 'clientes.remover': 'Quitar',
  'clientes.logradouro': 'Calle', 'clientes.numero': 'Número', 'clientes.bairro': 'Barrio',
  'clientes.cnpj_incompleto': 'Ingresa un CNPJ completo para buscar.', 'clientes.cnpj_nao_encontrado': 'CNPJ no encontrado.',
});

// --- Fidelidade Produto/Fornecedor/Vendedor ---
Object.assign(pt, {
  'produtos.local': 'Localização', 'produtos.local_ph': 'Depósito / prateleira', 'produtos.anvisa': 'Registro ANVISA',
  'produtos.nota_preco': 'O preço de venda é definido em Comercial › Tabela de preço (será criado na Fase 3). Lote e validade pertencem à entrada de estoque.',
  'vendedores.regiao': 'Região / carteira', 'vendedores.regiao_ph': 'Ex.: SP Capital, Interior SP',
  'vendedores.meta': 'Meta mensal (R$)', 'vendedores.regra_geral': 'Seguir regra geral de comissão (ignora o % individual)',
  'vendedores.regra_geral_curta': 'Regra geral', 'vendedor.meta_invalida': 'Meta mensal inválida.',
});
Object.assign(en, {
  'produtos.local': 'Location', 'produtos.local_ph': 'Warehouse / shelf', 'produtos.anvisa': 'ANVISA registration',
  'produtos.nota_preco': 'Sale price is set in Sales › Price table (coming in Phase 3). Batch and expiry belong to stock entry.',
  'vendedores.regiao': 'Region / territory', 'vendedores.regiao_ph': 'e.g., SP Capital, Interior SP',
  'vendedores.meta': 'Monthly target (R$)', 'vendedores.regra_geral': 'Follow general commission rule (ignores individual %)',
  'vendedores.regra_geral_curta': 'General rule', 'vendedor.meta_invalida': 'Invalid monthly target.',
});
Object.assign(es, {
  'produtos.local': 'Ubicación', 'produtos.local_ph': 'Depósito / estante', 'produtos.anvisa': 'Registro ANVISA',
  'produtos.nota_preco': 'El precio de venta se define en Comercial › Tabla de precios (Fase 3). Lote y validez pertenecen a la entrada de stock.',
  'vendedores.regiao': 'Región / cartera', 'vendedores.regiao_ph': 'Ej.: SP Capital, Interior SP',
  'vendedores.meta': 'Meta mensual (R$)', 'vendedores.regra_geral': 'Seguir regla general de comisión (ignora el % individual)',
  'vendedores.regra_geral_curta': 'Regla general', 'vendedor.meta_invalida': 'Meta mensual inválida.',
});

// --- Fase 3A: Comercial / Tabela de preço ---
Object.assign(pt, {
  'menu.comercial': 'Comercial', 'menu.precos': 'Tabela de preço',
  'cap.modulo.comercial': 'Comercial',
  'cap.comercial.preco.listar': 'Ver tabela de preço', 'cap.comercial.preco.gerenciar': 'Editar preços',
  'precos.titulo': 'Tabela de preço', 'precos.sub': 'Preço base de venda por produto (usado nos pedidos).',
  'precos.produto': 'Produto', 'precos.preco_base': 'Preço base (R$)', 'precos.sem_produtos': 'Cadastre produtos primeiro.',
});
Object.assign(en, {
  'menu.comercial': 'Sales', 'menu.precos': 'Price table',
  'cap.modulo.comercial': 'Sales',
  'cap.comercial.preco.listar': 'View price table', 'cap.comercial.preco.gerenciar': 'Edit prices',
  'precos.titulo': 'Price table', 'precos.sub': 'Base sale price per product (used in orders).',
  'precos.produto': 'Product', 'precos.preco_base': 'Base price (R$)', 'precos.sem_produtos': 'Create products first.',
});
Object.assign(es, {
  'menu.comercial': 'Comercial', 'menu.precos': 'Tabla de precios',
  'cap.modulo.comercial': 'Comercial',
  'cap.comercial.preco.listar': 'Ver tabla de precios', 'cap.comercial.preco.gerenciar': 'Editar precios',
  'precos.titulo': 'Tabla de precios', 'precos.sub': 'Precio base de venta por producto (usado en los pedidos).',
  'precos.produto': 'Producto', 'precos.preco_base': 'Precio base (R$)', 'precos.sem_produtos': 'Crea productos primero.',
});

// --- Fase 3B: Pedidos ---
Object.assign(pt, {
  'menu.pedidos': 'Pedidos', 'menu.novo_pedido': 'Novo pedido',
  'cap.comercial.pedido.listar': 'Listar pedidos', 'cap.comercial.pedido.criar': 'Criar pedidos', 'cap.comercial.pedido.gerenciar': 'Gerenciar status dos pedidos',
  'pedidos.titulo': 'Pedidos', 'pedidos.novo': 'Novo pedido', 'pedidos.numero': 'Número', 'pedidos.data': 'Data',
  'pedidos.cliente': 'Cliente', 'pedidos.vendedor': 'Vendedor', 'pedidos.status': 'Status', 'pedidos.total': 'Total',
  'pedidos.forma_pgto': 'Forma de pagamento', 'pedidos.endereco': 'Endereço de entrega', 'pedidos.endereco_ph': 'Preenchido pelo favorito do cliente (editável)',
  'pedidos.itens': 'Itens', 'pedidos.add_item': 'Adicionar item', 'pedidos.escolha_produto': 'Escolha o produto',
  'pedidos.subtotal': 'Subtotal', 'pedidos.frete': 'Frete', 'pedidos.obs': 'Observação', 'pedidos.salvar': 'Criar pedido',
  'pedidos.voltar': 'Voltar', 'pedidos.qtd': 'Qtd', 'pedidos.preco_unit': 'Preço unit.',
  'status.orcamento': 'Orçamento', 'status.aguardando_pagamento': 'Aguardando pagamento', 'status.aprovado': 'Pagamento aprovado',
  'status.separacao': 'Em separação', 'status.expedido': 'Expedido', 'status.entregue': 'Entregue', 'status.cancelado': 'Cancelado',
  'pedidos.acao.aguardando_pagamento': 'Confirmar pedido', 'pedidos.acao.aprovado': 'Aprovar pagamento',
  'pedidos.acao.separacao': 'Enviar p/ separação', 'pedidos.acao.expedido': 'Marcar expedido', 'pedidos.acao.entregue': 'Marcar entregue',
  'pedidos.acao.cancelado': 'Cancelar pedido',
  'pedido.nao_encontrado': 'Pedido não encontrado.', 'pedido.cliente_obrigatorio': 'Selecione um cliente.',
  'pedido.sem_itens': 'Adicione ao menos um item.', 'pedido.produto_invalido': 'Produto inválido no pedido.',
  'pedido.qtd_invalida': 'Quantidade inválida.', 'pedido.transicao_invalida': 'Mudança de status não permitida.',
  'pedido.limite_estourado': 'Limite de crédito do cliente excedido.',
});
Object.assign(en, {
  'menu.pedidos': 'Orders', 'menu.novo_pedido': 'New order',
  'cap.comercial.pedido.listar': 'List orders', 'cap.comercial.pedido.criar': 'Create orders', 'cap.comercial.pedido.gerenciar': 'Manage order status',
  'pedidos.titulo': 'Orders', 'pedidos.novo': 'New order', 'pedidos.numero': 'Number', 'pedidos.data': 'Date',
  'pedidos.cliente': 'Customer', 'pedidos.vendedor': 'Sales rep', 'pedidos.status': 'Status', 'pedidos.total': 'Total',
  'pedidos.forma_pgto': 'Payment method', 'pedidos.endereco': 'Delivery address', 'pedidos.endereco_ph': 'Filled from customer favorite (editable)',
  'pedidos.itens': 'Items', 'pedidos.add_item': 'Add item', 'pedidos.escolha_produto': 'Choose product',
  'pedidos.subtotal': 'Subtotal', 'pedidos.frete': 'Shipping', 'pedidos.obs': 'Notes', 'pedidos.salvar': 'Create order',
  'pedidos.voltar': 'Back', 'pedidos.qtd': 'Qty', 'pedidos.preco_unit': 'Unit price',
  'status.orcamento': 'Quote', 'status.aguardando_pagamento': 'Awaiting payment', 'status.aprovado': 'Payment approved',
  'status.separacao': 'Picking', 'status.expedido': 'Shipped', 'status.entregue': 'Delivered', 'status.cancelado': 'Canceled',
  'pedidos.acao.aguardando_pagamento': 'Confirm order', 'pedidos.acao.aprovado': 'Approve payment',
  'pedidos.acao.separacao': 'Send to picking', 'pedidos.acao.expedido': 'Mark shipped', 'pedidos.acao.entregue': 'Mark delivered',
  'pedidos.acao.cancelado': 'Cancel order',
  'pedido.nao_encontrado': 'Order not found.', 'pedido.cliente_obrigatorio': 'Select a customer.',
  'pedido.sem_itens': 'Add at least one item.', 'pedido.produto_invalido': 'Invalid product in order.',
  'pedido.qtd_invalida': 'Invalid quantity.', 'pedido.transicao_invalida': 'Status change not allowed.',
  'pedido.limite_estourado': "Customer's credit limit exceeded.",
});
Object.assign(es, {
  'menu.pedidos': 'Pedidos', 'menu.novo_pedido': 'Nuevo pedido',
  'cap.comercial.pedido.listar': 'Listar pedidos', 'cap.comercial.pedido.criar': 'Crear pedidos', 'cap.comercial.pedido.gerenciar': 'Gestionar estado de pedidos',
  'pedidos.titulo': 'Pedidos', 'pedidos.novo': 'Nuevo pedido', 'pedidos.numero': 'Número', 'pedidos.data': 'Fecha',
  'pedidos.cliente': 'Cliente', 'pedidos.vendedor': 'Vendedor', 'pedidos.status': 'Estado', 'pedidos.total': 'Total',
  'pedidos.forma_pgto': 'Forma de pago', 'pedidos.endereco': 'Dirección de entrega', 'pedidos.endereco_ph': 'Rellenado por la favorita del cliente (editable)',
  'pedidos.itens': 'Ítems', 'pedidos.add_item': 'Agregar ítem', 'pedidos.escolha_produto': 'Elige el producto',
  'pedidos.subtotal': 'Subtotal', 'pedidos.frete': 'Flete', 'pedidos.obs': 'Observación', 'pedidos.salvar': 'Crear pedido',
  'pedidos.voltar': 'Volver', 'pedidos.qtd': 'Cant.', 'pedidos.preco_unit': 'Precio unit.',
  'status.orcamento': 'Presupuesto', 'status.aguardando_pagamento': 'Esperando pago', 'status.aprovado': 'Pago aprobado',
  'status.separacao': 'En preparación', 'status.expedido': 'Expedido', 'status.entregue': 'Entregado', 'status.cancelado': 'Cancelado',
  'pedidos.acao.aguardando_pagamento': 'Confirmar pedido', 'pedidos.acao.aprovado': 'Aprobar pago',
  'pedidos.acao.separacao': 'Enviar a preparación', 'pedidos.acao.expedido': 'Marcar expedido', 'pedidos.acao.entregue': 'Marcar entregado',
  'pedidos.acao.cancelado': 'Cancelar pedido',
  'pedido.nao_encontrado': 'Pedido no encontrado.', 'pedido.cliente_obrigatorio': 'Selecciona un cliente.',
  'pedido.sem_itens': 'Agrega al menos un ítem.', 'pedido.produto_invalido': 'Producto inválido en el pedido.',
  'pedido.qtd_invalida': 'Cantidad inválida.', 'pedido.transicao_invalida': 'Cambio de estado no permitido.',
  'pedido.limite_estourado': 'Límite de crédito del cliente excedido.',
});

// --- Kanban de pedidos ---
Object.assign(pt, { 'pedidos.kanban_sub': 'Quadro por status — clique num card para ver e avançar o pedido', 'pedidos.cancelados_ocultos': 'pedido(s) cancelado(s) não exibidos no quadro.' });
Object.assign(en, { 'pedidos.kanban_sub': 'Board by status — click a card to view and advance the order', 'pedidos.cancelados_ocultos': 'canceled order(s) not shown on the board.' });
Object.assign(es, { 'pedidos.kanban_sub': 'Tablero por estado — haz clic en una tarjeta para ver y avanzar el pedido', 'pedidos.cancelados_ocultos': 'pedido(s) cancelado(s) no mostrados en el tablero.' });

// --- Fase 4A: Estoque ---
Object.assign(pt, {
  'menu.estoque_exp': 'Estoque/Expedição', 'menu.posicao': 'Posição de estoque', 'menu.entrada': 'Entrada de estoque',
  'cap.modulo.estoque': 'Estoque', 'cap.estoque.saldo.ver': 'Ver posição de estoque', 'cap.estoque.entrada.criar': 'Registrar entrada de estoque',
  'estoque.titulo': 'Posição de estoque', 'estoque.saldo': 'Saldo', 'estoque.lote': 'Lote', 'estoque.validade': 'Validade',
  'estoque.baixo': 'Estoque baixo', 'estoque.ok': 'Em dia',
  'entrada.titulo': 'Entrada de estoque', 'entrada.sub': 'Informe lote e validade e bipe as etiquetas já afixadas nos produtos. A quantidade é o número de códigos lidos.',
  'entrada.lote_ph': 'Ex.: L-2026-001', 'entrada.quantidade': 'Quantidade', 'entrada.custo': 'Custo unitário (R$)',
  'entrada.confirmar': 'Confirmar entrada', 'entrada.ok': 'Entrada registrada no estoque.',
  'estoque.qtd_invalida': 'Quantidade inválida.', 'estoque.custo_invalido': 'Custo inválido.',
});
Object.assign(en, {
  'menu.estoque_exp': 'Inventory/Shipping', 'menu.posicao': 'Stock position', 'menu.entrada': 'Stock entry',
  'cap.modulo.estoque': 'Inventory', 'cap.estoque.saldo.ver': 'View stock position', 'cap.estoque.entrada.criar': 'Register stock entry',
  'estoque.titulo': 'Stock position', 'estoque.saldo': 'Balance', 'estoque.lote': 'Batch', 'estoque.validade': 'Expiry',
  'estoque.baixo': 'Low stock', 'estoque.ok': 'OK',
  'entrada.titulo': 'Stock entry', 'entrada.sub': 'Set batch and expiry and scan the labels already on the products. Quantity equals the number of codes read.',
  'entrada.lote_ph': 'e.g., L-2026-001', 'entrada.quantidade': 'Quantity', 'entrada.custo': 'Unit cost (R$)',
  'entrada.confirmar': 'Confirm entry', 'entrada.ok': 'Stock entry registered.',
  'estoque.qtd_invalida': 'Invalid quantity.', 'estoque.custo_invalido': 'Invalid cost.',
});
Object.assign(es, {
  'menu.estoque_exp': 'Inventario/Expedición', 'menu.posicao': 'Posición de stock', 'menu.entrada': 'Entrada de stock',
  'cap.modulo.estoque': 'Inventario', 'cap.estoque.saldo.ver': 'Ver posición de stock', 'cap.estoque.entrada.criar': 'Registrar entrada de stock',
  'estoque.titulo': 'Posición de stock', 'estoque.saldo': 'Saldo', 'estoque.lote': 'Lote', 'estoque.validade': 'Caducidad',
  'estoque.baixo': 'Stock bajo', 'estoque.ok': 'Al día',
  'entrada.titulo': 'Entrada de stock', 'entrada.sub': 'Indica lote y caducidad y escanea las etiquetas ya pegadas en los productos. La cantidad es el número de códigos leídos.',
  'entrada.lote_ph': 'Ej.: L-2026-001', 'entrada.quantidade': 'Cantidad', 'entrada.custo': 'Costo unitario (R$)',
  'entrada.confirmar': 'Confirmar entrada', 'entrada.ok': 'Entrada registrada en el stock.',
  'estoque.qtd_invalida': 'Cantidad inválida.', 'estoque.custo_invalido': 'Costo inválido.',
});

// --- Fase 4B: Expedição + estoque insuficiente ---
Object.assign(pt, {
  'menu.expedicao': 'Pedidos (Kanban)',
  'expedicao.titulo': 'Expedição', 'expedicao.sub': 'Arraste os cards para mover o status. Ao enviar para "Em separação", o estoque é baixado automaticamente.',
  'estoque.insuficiente': 'Estoque insuficiente para separar o pedido.',
});
Object.assign(en, {
  'menu.expedicao': 'Orders (Kanban)',
  'expedicao.titulo': 'Shipping', 'expedicao.sub': 'Drag cards to change status. Moving to "Picking" deducts stock automatically.',
  'estoque.insuficiente': 'Not enough stock to pick the order.',
});
Object.assign(es, {
  'menu.expedicao': 'Pedidos (Kanban)',
  'expedicao.titulo': 'Expedición', 'expedicao.sub': 'Arrastra las tarjetas para cambiar el estado. Al pasar a "En preparación", el stock se descuenta automáticamente.',
  'estoque.insuficiente': 'Stock insuficiente para preparar el pedido.',
});

// --- Fase 4C: Baixa / perda ---
Object.assign(pt, {
  'menu.baixa': 'Baixa / perda', 'cap.estoque.baixa.criar': 'Registrar baixa/perda de estoque',
  'perda.titulo': 'Baixa / perda de estoque', 'perda.sub': 'Retira itens do estoque por vencimento, avaria, furto ou ajuste.',
  'perda.motivo': 'Motivo', 'perda.confirmar': 'Confirmar baixa', 'perda.ok': 'Baixa registrada.', 'perda.max': 'Máximo',
  'estoque.motivo_invalido': 'Informe o motivo da baixa.', 'estoque.lote_invalido': 'Lote não encontrado.',
});
Object.assign(en, {
  'menu.baixa': 'Write-off / loss', 'cap.estoque.baixa.criar': 'Register stock write-off/loss',
  'perda.titulo': 'Stock write-off / loss', 'perda.sub': 'Removes items from stock due to expiry, damage, theft or adjustment.',
  'perda.motivo': 'Reason', 'perda.confirmar': 'Confirm write-off', 'perda.ok': 'Write-off registered.', 'perda.max': 'Max',
  'estoque.motivo_invalido': 'Provide a reason.', 'estoque.lote_invalido': 'Batch not found.',
});
Object.assign(es, {
  'menu.baixa': 'Baja / pérdida', 'cap.estoque.baixa.criar': 'Registrar baja/pérdida de stock',
  'perda.titulo': 'Baja / pérdida de stock', 'perda.sub': 'Retira ítems del stock por caducidad, avería, robo o ajuste.',
  'perda.motivo': 'Motivo', 'perda.confirmar': 'Confirmar baja', 'perda.ok': 'Baja registrada.', 'perda.max': 'Máximo',
  'estoque.motivo_invalido': 'Indica el motivo.', 'estoque.lote_invalido': 'Lote no encontrado.',
});

// --- Fase 5A: Financeiro ---
Object.assign(pt, {
  'menu.financeiro': 'Financeiro', 'menu.receber': 'Contas a receber', 'menu.pagar': 'Contas a pagar',
  'cap.modulo.financeiro': 'Financeiro',
  'cap.financeiro.receber.listar': 'Ver contas a receber', 'cap.financeiro.receber.gerenciar': 'Gerenciar contas a receber',
  'cap.financeiro.pagar.listar': 'Ver contas a pagar', 'cap.financeiro.pagar.gerenciar': 'Gerenciar contas a pagar',
  'fin.receber': 'Contas a receber', 'fin.pagar': 'Contas a pagar', 'fin.novo': 'Novo título',
  'fin.descricao': 'Descrição', 'fin.cliente': 'Cliente', 'fin.fornecedor': 'Fornecedor', 'fin.vencimento': 'Vencimento',
  'fin.valor': 'Valor', 'fin.situacao': 'Situação', 'fin.aberto': 'Em aberto', 'fin.vencido': 'Vencido', 'fin.pago': 'Pago',
  'fin.baixar': 'Baixar', 'fin.cancelar_baixa': 'Cancelar baixa', 'fin.confirmar_baixa': 'Confirmar baixa',
  'fin.aberto_receber': 'A receber (em aberto)', 'fin.aberto_pagar': 'A pagar (em aberto)', 'fin.vencidos': 'Vencidos',
  'fin.titulos': 'título(s)', 'fin.do_pedido': 'do pedido',
  'financeiro.descricao_invalida': 'Informe uma descrição.', 'financeiro.valor_invalido': 'Valor inválido.',
  'financeiro.vencimento_invalido': 'Vencimento inválido.', 'financeiro.nao_encontrado': 'Título não encontrado.',
  'financeiro.ja_pago': 'Título já está pago.',
});
Object.assign(en, {
  'menu.financeiro': 'Finance', 'menu.receber': 'Receivables', 'menu.pagar': 'Payables',
  'cap.modulo.financeiro': 'Finance',
  'cap.financeiro.receber.listar': 'View receivables', 'cap.financeiro.receber.gerenciar': 'Manage receivables',
  'cap.financeiro.pagar.listar': 'View payables', 'cap.financeiro.pagar.gerenciar': 'Manage payables',
  'fin.receber': 'Receivables', 'fin.pagar': 'Payables', 'fin.novo': 'New entry',
  'fin.descricao': 'Description', 'fin.cliente': 'Customer', 'fin.fornecedor': 'Supplier', 'fin.vencimento': 'Due date',
  'fin.valor': 'Amount', 'fin.situacao': 'Status', 'fin.aberto': 'Open', 'fin.vencido': 'Overdue', 'fin.pago': 'Paid',
  'fin.baixar': 'Settle', 'fin.cancelar_baixa': 'Undo settlement', 'fin.confirmar_baixa': 'Confirm settlement',
  'fin.aberto_receber': 'Receivable (open)', 'fin.aberto_pagar': 'Payable (open)', 'fin.vencidos': 'Overdue',
  'fin.titulos': 'entry(ies)', 'fin.do_pedido': 'from order',
  'financeiro.descricao_invalida': 'Provide a description.', 'financeiro.valor_invalido': 'Invalid amount.',
  'financeiro.vencimento_invalido': 'Invalid due date.', 'financeiro.nao_encontrado': 'Entry not found.',
  'financeiro.ja_pago': 'Entry already paid.',
});
Object.assign(es, {
  'menu.financeiro': 'Finanzas', 'menu.receber': 'Cuentas a cobrar', 'menu.pagar': 'Cuentas a pagar',
  'cap.modulo.financeiro': 'Finanzas',
  'cap.financeiro.receber.listar': 'Ver cuentas a cobrar', 'cap.financeiro.receber.gerenciar': 'Gestionar cuentas a cobrar',
  'cap.financeiro.pagar.listar': 'Ver cuentas a pagar', 'cap.financeiro.pagar.gerenciar': 'Gestionar cuentas a pagar',
  'fin.receber': 'Cuentas a cobrar', 'fin.pagar': 'Cuentas a pagar', 'fin.novo': 'Nuevo título',
  'fin.descricao': 'Descripción', 'fin.cliente': 'Cliente', 'fin.fornecedor': 'Proveedor', 'fin.vencimento': 'Vencimiento',
  'fin.valor': 'Valor', 'fin.situacao': 'Estado', 'fin.aberto': 'Abierto', 'fin.vencido': 'Vencido', 'fin.pago': 'Pagado',
  'fin.baixar': 'Liquidar', 'fin.cancelar_baixa': 'Cancelar liquidación', 'fin.confirmar_baixa': 'Confirmar liquidación',
  'fin.aberto_receber': 'A cobrar (abierto)', 'fin.aberto_pagar': 'A pagar (abierto)', 'fin.vencidos': 'Vencidos',
  'fin.titulos': 'título(s)', 'fin.do_pedido': 'del pedido',
  'financeiro.descricao_invalida': 'Indica una descripción.', 'financeiro.valor_invalido': 'Valor inválido.',
  'financeiro.vencimento_invalido': 'Vencimiento inválido.', 'financeiro.nao_encontrado': 'Título no encontrado.',
  'financeiro.ja_pago': 'El título ya está pagado.',
});

// --- Fase 5B-i: Fluxo de caixa ---
Object.assign(pt, {
  'menu.fluxo': 'Fluxo de caixa', 'cap.financeiro.fluxo.ver': 'Ver fluxo de caixa',
  'fluxo.titulo': 'Fluxo de caixa', 'fluxo.sub': 'Entradas e saídas pela data da baixa dos títulos.',
  'fluxo.entradas': 'Entradas', 'fluxo.saidas': 'Saídas', 'fluxo.saldo': 'Saldo',
  'fluxo.entrada': 'Entrada', 'fluxo.saida': 'Saída', 'fluxo.vazio': 'Nenhuma baixa registrada ainda.',
});
Object.assign(en, {
  'menu.fluxo': 'Cash flow', 'cap.financeiro.fluxo.ver': 'View cash flow',
  'fluxo.titulo': 'Cash flow', 'fluxo.sub': 'Inflows and outflows by the settlement date.',
  'fluxo.entradas': 'Inflows', 'fluxo.saidas': 'Outflows', 'fluxo.saldo': 'Balance',
  'fluxo.entrada': 'In', 'fluxo.saida': 'Out', 'fluxo.vazio': 'No settlements yet.',
});
Object.assign(es, {
  'menu.fluxo': 'Flujo de caja', 'cap.financeiro.fluxo.ver': 'Ver flujo de caja',
  'fluxo.titulo': 'Flujo de caja', 'fluxo.sub': 'Entradas y salidas por la fecha de liquidación.',
  'fluxo.entradas': 'Entradas', 'fluxo.saidas': 'Salidas', 'fluxo.saldo': 'Saldo',
  'fluxo.entrada': 'Entrada', 'fluxo.saida': 'Salida', 'fluxo.vazio': 'Aún no hay liquidaciones.',
});

// --- Fase 5B-ii: Nota de entrada + Recebimento ---
Object.assign(pt, {
  'menu.nota': 'Nota de entrada', 'menu.recebimento': 'Recebimento', 'cap.financeiro.compra.criar': 'Lançar nota de entrada (compra)',
  'nota.titulo': 'Nota de entrada (compra)', 'nota.sub': 'Lança a compra: gera título a pagar e uma pendência de recebimento no estoque.',
  'nota.forn_ph': 'Nome do fornecedor', 'nota.nf': 'NF', 'nota.total': 'Total', 'nota.lancar': 'Lançar nota',
  'nota.gera': 'gera título a pagar + pendência de recebimento', 'nota.ok': 'Nota lançada. Veja em Contas a pagar e em Estoque › Recebimento.',
  'receb.titulo': 'Recebimento', 'receb.sub': 'Pendências de recebimento das notas de entrada. Receber dá entrada no estoque.',
  'receb.vazio': 'Nenhuma pendência de recebimento.', 'receb.receber': 'Receber', 'receb.confirmar': 'Confirmar recebimento', 'receb.un': 'un',
  'recebimento.nao_encontrado': 'Pendência não encontrada.',
});
Object.assign(en, {
  'menu.nota': 'Purchase entry', 'menu.recebimento': 'Receiving', 'cap.financeiro.compra.criar': 'Create purchase entry',
  'nota.titulo': 'Purchase entry', 'nota.sub': 'Records the purchase: creates a payable and a pending receipt in inventory.',
  'nota.forn_ph': 'Supplier name', 'nota.nf': 'Invoice', 'nota.total': 'Total', 'nota.lancar': 'Create entry',
  'nota.gera': 'creates payable + pending receipt', 'nota.ok': 'Entry created. See Payables and Inventory › Receiving.',
  'receb.titulo': 'Receiving', 'receb.sub': 'Pending receipts from purchase entries. Receiving adds to stock.',
  'receb.vazio': 'No pending receipts.', 'receb.receber': 'Receive', 'receb.confirmar': 'Confirm receipt', 'receb.un': 'un',
  'recebimento.nao_encontrado': 'Pending receipt not found.',
});
Object.assign(es, {
  'menu.nota': 'Nota de entrada', 'menu.recebimento': 'Recepción', 'cap.financeiro.compra.criar': 'Crear nota de entrada (compra)',
  'nota.titulo': 'Nota de entrada (compra)', 'nota.sub': 'Registra la compra: genera cuenta a pagar y una pendencia de recepción en el stock.',
  'nota.forn_ph': 'Nombre del proveedor', 'nota.nf': 'Factura', 'nota.total': 'Total', 'nota.lancar': 'Crear nota',
  'nota.gera': 'genera cuenta a pagar + pendencia de recepción', 'nota.ok': 'Nota creada. Ver en Cuentas a pagar y Stock › Recepción.',
  'receb.titulo': 'Recepción', 'receb.sub': 'Pendencias de recepción de las notas de entrada. Recibir da entrada al stock.',
  'receb.vazio': 'Sin pendencias de recepción.', 'receb.receber': 'Recibir', 'receb.confirmar': 'Confirmar recepción', 'receb.un': 'un',
  'recebimento.nao_encontrado': 'Pendencia no encontrada.',
});

// --- Fase 6: Dashboard ---
Object.assign(pt, {
  'dash.vendas_mes': 'Vendas no mês', 'dash.saldo_caixa': 'Saldo de caixa', 'dash.a_receber': 'A receber (aberto)',
  'dash.a_pagar': 'A pagar (aberto)', 'dash.estoque_baixo': 'Estoque baixo', 'dash.produtos': 'produto(s)',
  'dash.vencido': 'vencido', 'dash.em_dia': 'Em dia', 'dash.pedidos_status': 'Pedidos por status',
  'dash.top_produtos': 'Produtos mais vendidos', 'dash.sem_vendas': 'Ainda sem vendas registradas.',
});
Object.assign(en, {
  'dash.vendas_mes': 'Sales this month', 'dash.saldo_caixa': 'Cash balance', 'dash.a_receber': 'Receivable (open)',
  'dash.a_pagar': 'Payable (open)', 'dash.estoque_baixo': 'Low stock', 'dash.produtos': 'product(s)',
  'dash.vencido': 'overdue', 'dash.em_dia': 'On track', 'dash.pedidos_status': 'Orders by status',
  'dash.top_produtos': 'Best-selling products', 'dash.sem_vendas': 'No sales recorded yet.',
});
Object.assign(es, {
  'dash.vendas_mes': 'Ventas del mes', 'dash.saldo_caixa': 'Saldo de caja', 'dash.a_receber': 'A cobrar (abierto)',
  'dash.a_pagar': 'A pagar (abierto)', 'dash.estoque_baixo': 'Stock bajo', 'dash.produtos': 'producto(s)',
  'dash.vencido': 'vencido', 'dash.em_dia': 'Al día', 'dash.pedidos_status': 'Pedidos por estado',
  'dash.top_produtos': 'Productos más vendidos', 'dash.sem_vendas': 'Aún sin ventas registradas.',
});

// --- Fase 6B: Relatórios ---
Object.assign(pt, {
  'menu.relatorios': 'Relatórios', 'menu.rel_vendas': 'Vendas', 'menu.rel_produtos': 'Produtos mais vendidos',
  'cap.modulo.relatorios': 'Relatórios', 'cap.relatorios.ver': 'Ver relatórios',
  'rel.vendas': 'Relatório de vendas', 'rel.produtos': 'Produtos mais vendidos',
  'rel.de': 'De', 'rel.ate': 'Até', 'rel.gerar': 'Gerar', 'rel.exportar': 'Exportar CSV',
  'rel.total_vendas': 'Total de vendas', 'rel.por_vendedor': 'Total por vendedor', 'rel.vazio': 'Nenhuma venda no período.',
  'rel.qtd': 'Qtd', 'rel.total': 'Total',
});
Object.assign(en, {
  'menu.relatorios': 'Reports', 'menu.rel_vendas': 'Sales', 'menu.rel_produtos': 'Best sellers',
  'cap.modulo.relatorios': 'Reports', 'cap.relatorios.ver': 'View reports',
  'rel.vendas': 'Sales report', 'rel.produtos': 'Best-selling products',
  'rel.de': 'From', 'rel.ate': 'To', 'rel.gerar': 'Generate', 'rel.exportar': 'Export CSV',
  'rel.total_vendas': 'Total sales', 'rel.por_vendedor': 'Total by sales rep', 'rel.vazio': 'No sales in the period.',
  'rel.qtd': 'Qty', 'rel.total': 'Total',
});
Object.assign(es, {
  'menu.relatorios': 'Informes', 'menu.rel_vendas': 'Ventas', 'menu.rel_produtos': 'Más vendidos',
  'cap.modulo.relatorios': 'Informes', 'cap.relatorios.ver': 'Ver informes',
  'rel.vendas': 'Informe de ventas', 'rel.produtos': 'Productos más vendidos',
  'rel.de': 'Desde', 'rel.ate': 'Hasta', 'rel.gerar': 'Generar', 'rel.exportar': 'Exportar CSV',
  'rel.total_vendas': 'Total de ventas', 'rel.por_vendedor': 'Total por vendedor', 'rel.vazio': 'Sin ventas en el período.',
  'rel.qtd': 'Cant.', 'rel.total': 'Total',
});

// --- Refinamento: preço por cliente ---
Object.assign(pt, {
  'precos.modo': 'Modo', 'precos.modo_base': 'Preço base (geral)', 'precos.modo_cliente': 'Por cliente',
  'precos.preco_cliente': 'Preço do cliente (R$)', 'precos.sub_cliente': 'Preço negociado por cliente — sobrepõe o preço base no pedido. Em branco = usa o base.',
  'precos.escolha_cliente': 'Escolha um cliente para definir os preços negociados.', 'precos.usa_base': 'usa o base',
});
Object.assign(en, {
  'precos.modo': 'Mode', 'precos.modo_base': 'Base price (general)', 'precos.modo_cliente': 'Per customer',
  'precos.preco_cliente': 'Customer price (R$)', 'precos.sub_cliente': 'Negotiated price per customer — overrides the base price in orders. Blank = uses base.',
  'precos.escolha_cliente': 'Choose a customer to set negotiated prices.', 'precos.usa_base': 'uses base',
});
Object.assign(es, {
  'precos.modo': 'Modo', 'precos.modo_base': 'Precio base (general)', 'precos.modo_cliente': 'Por cliente',
  'precos.preco_cliente': 'Precio del cliente (R$)', 'precos.sub_cliente': 'Precio negociado por cliente — sustituye el base en el pedido. Vacío = usa el base.',
  'precos.escolha_cliente': 'Elige un cliente para definir los precios negociados.', 'precos.usa_base': 'usa el base',
});

// --- Refinamento: campanhas de preço ---
Object.assign(pt, {
  'camp.titulo': 'Campanhas', 'camp.gerenciar': 'Campanhas', 'camp.motivo': 'Motivo', 'camp.periodo': 'Período',
  'camp.vigente': 'Vigente', 'camp.encerrada': 'Encerrada', 'camp.vazia': 'Nenhuma campanha.', 'camp.nova': 'Nova campanha',
  'camp.add': 'Adicionar campanha', 'campanha.periodo_invalido': 'Período inválido (data final antes da inicial).',
});
Object.assign(en, {
  'camp.titulo': 'Campaigns', 'camp.gerenciar': 'Campaigns', 'camp.motivo': 'Reason', 'camp.periodo': 'Period',
  'camp.vigente': 'Active', 'camp.encerrada': 'Ended', 'camp.vazia': 'No campaigns.', 'camp.nova': 'New campaign',
  'camp.add': 'Add campaign', 'campanha.periodo_invalido': 'Invalid period (end before start).',
});
Object.assign(es, {
  'camp.titulo': 'Campañas', 'camp.gerenciar': 'Campañas', 'camp.motivo': 'Motivo', 'camp.periodo': 'Período',
  'camp.vigente': 'Vigente', 'camp.encerrada': 'Finalizada', 'camp.vazia': 'Sin campañas.', 'camp.nova': 'Nueva campaña',
  'camp.add': 'Agregar campaña', 'campanha.periodo_invalido': 'Período inválido (fin antes del inicio).',
});

// --- Refinamento: condições de pagamento ---
Object.assign(pt, {
  'menu.condicoes': 'Condições de pagamento', 'cap.cadastros.condicao.listar': 'Listar condições de pagamento', 'cap.cadastros.condicao.gerenciar': 'Criar e editar condições de pagamento',
  'cond.titulo': 'Condições de pagamento', 'cond.titulo_s': 'Condição', 'cond.nova': 'Nova condição',
  'cond.parcelas': 'Parcelas', 'cond.intervalo': 'Intervalo', 'cond.dias': 'dias', 'cond.avista_pad': 'À vista (padrão)',
  'cond.dica': 'No pedido, gera N parcelas no Contas a receber (vencimento = nº da parcela × intervalo).',
  'condicao.parcelas_invalida': 'Número de parcelas inválido.', 'condicao.intervalo_invalido': 'Intervalo inválido.',
});
Object.assign(en, {
  'menu.condicoes': 'Payment terms', 'cap.cadastros.condicao.listar': 'List payment terms', 'cap.cadastros.condicao.gerenciar': 'Create and edit payment terms',
  'cond.titulo': 'Payment terms', 'cond.titulo_s': 'Term', 'cond.nova': 'New term',
  'cond.parcelas': 'Installments', 'cond.intervalo': 'Interval', 'cond.dias': 'days', 'cond.avista_pad': 'Cash (default)',
  'cond.dica': 'On the order, generates N installments in receivables (due = installment # × interval).',
  'condicao.parcelas_invalida': 'Invalid number of installments.', 'condicao.intervalo_invalido': 'Invalid interval.',
});
Object.assign(es, {
  'menu.condicoes': 'Condiciones de pago', 'cap.cadastros.condicao.listar': 'Listar condiciones de pago', 'cap.cadastros.condicao.gerenciar': 'Crear y editar condiciones de pago',
  'cond.titulo': 'Condiciones de pago', 'cond.titulo_s': 'Condición', 'cond.nova': 'Nueva condición',
  'cond.parcelas': 'Cuotas', 'cond.intervalo': 'Intervalo', 'cond.dias': 'días', 'cond.avista_pad': 'Al contado (predet.)',
  'cond.dica': 'En el pedido, genera N cuotas en cuentas a cobrar (vencimiento = nº cuota × intervalo).',
  'condicao.parcelas_invalida': 'Número de cuotas inválido.', 'condicao.intervalo_invalido': 'Intervalo inválido.',
});

// --- Refinamento: comissões ---
Object.assign(pt, {
  'menu.comissoes': 'Controle de comissões', 'cap.financeiro.comissao.ver': 'Ver comissões', 'cap.financeiro.comissao.gerenciar': 'Fechar competência de comissões',
  'com.titulo': 'Controle de comissões', 'com.total': 'Total de comissões', 'com.vendido': 'Vendido no período', 'com.pct': 'Comissão (%)',
  'com.comissao': 'Comissão (R$)', 'com.vazio': 'Sem vendas com vendedor no período.',
  'com.fechar': 'Fechar competência', 'com.fechar_dica': 'Gera um título a pagar com o total das comissões do período.',
  'com.vencimento': 'Vencimento do título', 'com.gerar_titulo': 'Gerar título de comissões', 'com.fechado': 'Competência fechada: título gerado em Contas a pagar.',
  'comissao.nada_apurar': 'Nenhuma comissão a apurar no período.',
});
Object.assign(en, {
  'menu.comissoes': 'Commissions', 'cap.financeiro.comissao.ver': 'View commissions', 'cap.financeiro.comissao.gerenciar': 'Close commission period',
  'com.titulo': 'Commissions', 'com.total': 'Total commissions', 'com.vendido': 'Sold in period', 'com.pct': 'Commission (%)',
  'com.comissao': 'Commission (R$)', 'com.vazio': 'No sales with a sales rep in the period.',
  'com.fechar': 'Close period', 'com.fechar_dica': 'Creates a payable with the period total commissions.',
  'com.vencimento': 'Entry due date', 'com.gerar_titulo': 'Generate commission entry', 'com.fechado': 'Period closed: entry created in Payables.',
  'comissao.nada_apurar': 'No commission to calculate in the period.',
});
Object.assign(es, {
  'menu.comissoes': 'Comisiones', 'cap.financeiro.comissao.ver': 'Ver comisiones', 'cap.financeiro.comissao.gerenciar': 'Cerrar período de comisiones',
  'com.titulo': 'Comisiones', 'com.total': 'Total de comisiones', 'com.vendido': 'Vendido en el período', 'com.pct': 'Comisión (%)',
  'com.comissao': 'Comisión (R$)', 'com.vazio': 'Sin ventas con vendedor en el período.',
  'com.fechar': 'Cerrar período', 'com.fechar_dica': 'Genera una cuenta a pagar con el total de comisiones del período.',
  'com.vencimento': 'Vencimiento del título', 'com.gerar_titulo': 'Generar título de comisiones', 'com.fechado': 'Período cerrado: título creado en Cuentas a pagar.',
  'comissao.nada_apurar': 'Sin comisión a calcular en el período.',
});

// --- Refinamento: contas correntes ---
Object.assign(pt, {
  'menu.contas_correntes': 'Contas correntes', 'cap.cadastros.conta.listar': 'Ver contas correntes', 'cap.cadastros.conta.gerenciar': 'Gerenciar contas correntes',
  'cc.titulo': 'Contas correntes', 'cc.nova': 'Nova conta', 'cc.banco': 'Banco', 'cc.saldo_inicial': 'Saldo inicial',
  'cc.vazio': 'Nenhuma conta cadastrada.', 'cc.conta': 'Conta corrente', 'cc.nenhuma': '(nenhuma)',
});
Object.assign(en, {
  'menu.contas_correntes': 'Bank accounts', 'cap.cadastros.conta.listar': 'View bank accounts', 'cap.cadastros.conta.gerenciar': 'Manage bank accounts',
  'cc.titulo': 'Bank accounts', 'cc.nova': 'New account', 'cc.banco': 'Bank', 'cc.saldo_inicial': 'Initial balance',
  'cc.vazio': 'No accounts yet.', 'cc.conta': 'Bank account', 'cc.nenhuma': '(none)',
});
Object.assign(es, {
  'menu.contas_correntes': 'Cuentas bancarias', 'cap.cadastros.conta.listar': 'Ver cuentas bancarias', 'cap.cadastros.conta.gerenciar': 'Gestionar cuentas bancarias',
  'cc.titulo': 'Cuentas bancarias', 'cc.nova': 'Nueva cuenta', 'cc.banco': 'Banco', 'cc.saldo_inicial': 'Saldo inicial',
  'cc.vazio': 'Sin cuentas.', 'cc.conta': 'Cuenta bancaria', 'cc.nenhuma': '(ninguna)',
});

// --- Refinamento: codigo de barras / etiquetas por item (bipagem) ---
// O sistema NAO gera etiquetas: elas ja vem afixadas nos produtos. Aqui o usuario
// BIPA os codigos na entrada e na separacao; o codigo traz produto/lote/validade.
Object.assign(pt, {
  'etq.titulo': 'Etiquetas do lote', 'etq.ver': 'Etiquetas',
  'etq.codigo': 'Código', 'etq.situacao': 'Situação',
  'etq.vazio': 'Nenhuma etiqueta bipada neste lote.',
  'etq.subtitulo': 'Códigos de barras bipados na entrada deste lote (rastreabilidade item a item).',
  'etq.st.estoque': 'Em estoque', 'etq.st.saida': 'Saída', 'etq.st.perda': 'Perda',
  'etq.bipe': 'Bipe as etiquetas dos itens', 'etq.bipe_ph': 'Bipe ou digite o código e tecle Enter…',
  'etq.bipados': 'bipados',
  'etq.bipe_ajuda': 'As etiquetas já vêm nos produtos. A quantidade da entrada é o número de códigos bipados.',
  'common.remover': 'Remover',
  'etiqueta.codigo_invalido': 'Código de etiqueta inválido.', 'etiqueta.nao_encontrada': 'Etiqueta não encontrada.',
  'etiqueta.bipe_obrigatorio': 'Bipe ao menos uma etiqueta para dar entrada.',
  'etiqueta.duplicada': 'Etiqueta já existe no estoque (item já cadastrado).',
  'etiqueta.duplicada_leitura': 'Esta etiqueta já foi bipada nesta entrada.',
});
Object.assign(en, {
  'etq.titulo': 'Batch labels', 'etq.ver': 'Labels',
  'etq.codigo': 'Code', 'etq.situacao': 'Status',
  'etq.vazio': 'No labels scanned for this batch.',
  'etq.subtitulo': 'Barcodes scanned at entry for this batch (item-level traceability).',
  'etq.st.estoque': 'In stock', 'etq.st.saida': 'Out', 'etq.st.perda': 'Loss',
  'etq.bipe': 'Scan the item labels', 'etq.bipe_ph': 'Scan or type the code and press Enter…',
  'etq.bipados': 'scanned',
  'etq.bipe_ajuda': 'Labels already come on the products. The entry quantity is the number of scanned codes.',
  'common.remover': 'Remove',
  'etiqueta.codigo_invalido': 'Invalid label code.', 'etiqueta.nao_encontrada': 'Label not found.',
  'etiqueta.bipe_obrigatorio': 'Scan at least one label to register the entry.',
  'etiqueta.duplicada': 'Label already exists in stock (item already registered).',
  'etiqueta.duplicada_leitura': 'This label was already scanned in this entry.',
});
Object.assign(es, {
  'etq.titulo': 'Etiquetas del lote', 'etq.ver': 'Etiquetas',
  'etq.codigo': 'Código', 'etq.situacao': 'Situación',
  'etq.vazio': 'Ninguna etiqueta escaneada en este lote.',
  'etq.subtitulo': 'Códigos de barras escaneados en la entrada de este lote (trazabilidad ítem a ítem).',
  'etq.st.estoque': 'En stock', 'etq.st.saida': 'Salida', 'etq.st.perda': 'Pérdida',
  'etq.bipe': 'Escanea las etiquetas de los ítems', 'etq.bipe_ph': 'Escanea o escribe el código y pulsa Enter…',
  'etq.bipados': 'escaneados',
  'etq.bipe_ajuda': 'Las etiquetas ya vienen en los productos. La cantidad de la entrada es el número de códigos escaneados.',
  'common.remover': 'Quitar',
  'etiqueta.codigo_invalido': 'Código de etiqueta inválido.', 'etiqueta.nao_encontrada': 'Etiqueta no encontrada.',
  'etiqueta.bipe_obrigatorio': 'Escanea al menos una etiqueta para registrar la entrada.',
  'etiqueta.duplicada': 'La etiqueta ya existe en el stock (ítem ya registrado).',
  'etiqueta.duplicada_leitura': 'Esta etiqueta ya fue escaneada en esta entrada.',
});

// --- Refinamento: bipagem na SEPARAÇÃO (baixa por código de barras) ---
Object.assign(pt, {
  'sep.acao': 'Separar por leitura', 'sep.titulo': 'Separação por leitura',
  'sep.sub': 'Bipe a etiqueta de cada item a separar. O código casa com o pedido pelo produto e dá baixa do lote/validade certos. Todos os itens precisam ser bipados.',
  'sep.confirmar': 'Confirmar separação',
  'separacao.incompleta': 'Bipe exatamente a quantidade de cada item do pedido.',
  'etiqueta.fora_pedido': 'Esta etiqueta é de um produto que não está no pedido.',
  'etiqueta.fora_estoque': 'Esta etiqueta não está mais no estoque (já saiu ou foi baixada).',
});
Object.assign(en, {
  'sep.acao': 'Pick by scanning', 'sep.titulo': 'Pick by scanning',
  'sep.sub': 'Scan each item label to pick. The code matches the order by product and deducts the right batch/expiry. All items must be scanned.',
  'sep.confirmar': 'Confirm picking',
  'separacao.incompleta': 'Scan exactly the quantity of each order item.',
  'etiqueta.fora_pedido': 'This label belongs to a product not in the order.',
  'etiqueta.fora_estoque': 'This label is no longer in stock (already shipped or written off).',
});
Object.assign(es, {
  'sep.acao': 'Preparar por lectura', 'sep.titulo': 'Preparación por lectura',
  'sep.sub': 'Escanea la etiqueta de cada ítem a preparar. El código casa con el pedido por producto y descuenta el lote/caducidad correctos. Hay que escanear todos los ítems.',
  'sep.confirmar': 'Confirmar preparación',
  'separacao.incompleta': 'Escanea exactamente la cantidad de cada ítem del pedido.',
  'etiqueta.fora_pedido': 'Esta etiqueta es de un producto que no está en el pedido.',
  'etiqueta.fora_estoque': 'Esta etiqueta ya no está en el stock (ya salió o fue dada de baja).',
});

// --- Refinamento: Inventário por leitor ---
Object.assign(pt, {
  'menu.inventario': 'Inventário',
  'cap.estoque.inventario.ver': 'Ver inventários', 'cap.estoque.inventario.gerenciar': 'Fazer inventário',
  'inv.titulo': 'Inventário por leitor', 'inv.sub': 'Bipe as etiquetas presentes no estoque. O sistema compara com o esperado e aponta os faltantes.',
  'inv.responsavel': 'Responsável', 'inv.bipe': 'Bipe as etiquetas contadas',
  'inv.finalizar': 'Finalizar contagem', 'inv.finalizar_baixar': 'Finalizar e baixar faltantes',
  'inv.resultado': 'Resultado da contagem', 'inv.esperadas': 'Esperadas', 'inv.encontradas': 'Encontradas',
  'inv.faltantes': 'Faltantes', 'inv.desconhecidas': 'Desconhecidas',
  'inv.baixou_ok': 'Faltantes baixados como perda (ajuste de inventário).',
  'inv.historico': 'Histórico de inventários', 'inv.data': 'Data', 'inv.baixa': 'Baixa',
  'inv.baixados': 'baixados como perda', 'inv.vazio': 'Nenhum inventário registrado.',
});
Object.assign(en, {
  'menu.inventario': 'Inventory count',
  'cap.estoque.inventario.ver': 'View counts', 'cap.estoque.inventario.gerenciar': 'Run inventory count',
  'inv.titulo': 'Inventory count by scanner', 'inv.sub': 'Scan the labels present in stock. The system compares with expected and flags the missing ones.',
  'inv.responsavel': 'Responsible', 'inv.bipe': 'Scan the counted labels',
  'inv.finalizar': 'Finish count', 'inv.finalizar_baixar': 'Finish and write off missing',
  'inv.resultado': 'Count result', 'inv.esperadas': 'Expected', 'inv.encontradas': 'Found',
  'inv.faltantes': 'Missing', 'inv.desconhecidas': 'Unknown',
  'inv.baixou_ok': 'Missing items written off as loss (inventory adjustment).',
  'inv.historico': 'Count history', 'inv.data': 'Date', 'inv.baixa': 'Write-off',
  'inv.baixados': 'written off as loss', 'inv.vazio': 'No inventory recorded.',
});
Object.assign(es, {
  'menu.inventario': 'Inventario',
  'cap.estoque.inventario.ver': 'Ver inventarios', 'cap.estoque.inventario.gerenciar': 'Hacer inventario',
  'inv.titulo': 'Inventario por lector', 'inv.sub': 'Escanea las etiquetas presentes en el stock. El sistema compara con lo esperado e indica los faltantes.',
  'inv.responsavel': 'Responsable', 'inv.bipe': 'Escanea las etiquetas contadas',
  'inv.finalizar': 'Finalizar conteo', 'inv.finalizar_baixar': 'Finalizar y dar de baja faltantes',
  'inv.resultado': 'Resultado del conteo', 'inv.esperadas': 'Esperadas', 'inv.encontradas': 'Encontradas',
  'inv.faltantes': 'Faltantes', 'inv.desconhecidas': 'Desconocidas',
  'inv.baixou_ok': 'Faltantes dados de baja como pérdida (ajuste de inventario).',
  'inv.historico': 'Historial de inventarios', 'inv.data': 'Fecha', 'inv.baixa': 'Baja',
  'inv.baixados': 'dados de baja', 'inv.vazio': 'Ningún inventario registrado.',
});

// --- Refinamento: Marcas de produtos + recebimento multi-lote com bipagem ---
Object.assign(pt, {
  'common.opcional': 'opcional',
  'menu.marcas': 'Marcas',
  'cap.cadastros.marca.listar': 'Listar marcas', 'cap.cadastros.marca.gerenciar': 'Criar e editar marcas',
  'marcas.titulo': 'Marcas', 'marcas.titulo_sing': 'Marca', 'marcas.nova': 'Nova marca',
  'marcas.sub': 'Marcas usadas no recebimento dos lotes.', 'marcas.nome': 'Nome', 'marcas.fabricante': 'Fabricante',
  'receb.bipados': 'bipados', 'receb.add_lote': 'Adicionar lote', 'receb.lote_n': 'Lote',
  'recebimento.lotes_obrigatorio': 'Informe ao menos um lote.',
  'recebimento.marca_obrigatoria': 'Selecione a marca de cada lote.',
  'recebimento.soma_invalida': 'A soma das etiquetas bipadas deve bater com a quantidade da nota.',
  'marca.invalida': 'Marca inválida.',
});
Object.assign(en, {
  'common.opcional': 'optional',
  'menu.marcas': 'Brands',
  'cap.cadastros.marca.listar': 'List brands', 'cap.cadastros.marca.gerenciar': 'Create and edit brands',
  'marcas.titulo': 'Brands', 'marcas.titulo_sing': 'Brand', 'marcas.nova': 'New brand',
  'marcas.sub': 'Brands used when receiving lots.', 'marcas.nome': 'Name', 'marcas.fabricante': 'Manufacturer',
  'receb.bipados': 'scanned', 'receb.add_lote': 'Add lot', 'receb.lote_n': 'Lot',
  'recebimento.lotes_obrigatorio': 'Provide at least one lot.',
  'recebimento.marca_obrigatoria': 'Select a brand for each lot.',
  'recebimento.soma_invalida': 'The scanned labels must match the note quantity.',
  'marca.invalida': 'Invalid brand.',
});
Object.assign(es, {
  'common.opcional': 'opcional',
  'menu.marcas': 'Marcas',
  'cap.cadastros.marca.listar': 'Listar marcas', 'cap.cadastros.marca.gerenciar': 'Crear y editar marcas',
  'marcas.titulo': 'Marcas', 'marcas.titulo_sing': 'Marca', 'marcas.nova': 'Nueva marca',
  'marcas.sub': 'Marcas usadas en la recepción de los lotes.', 'marcas.nome': 'Nombre', 'marcas.fabricante': 'Fabricante',
  'receb.bipados': 'escaneados', 'receb.add_lote': 'Agregar lote', 'receb.lote_n': 'Lote',
  'recebimento.lotes_obrigatorio': 'Informe al menos un lote.',
  'recebimento.marca_obrigatoria': 'Selecciona la marca de cada lote.',
  'recebimento.soma_invalida': 'La suma de las etiquetas escaneadas debe coincidir con la cantidad de la nota.',
  'marca.invalida': 'Marca inválida.',
});

// --- Refinamento: Motoboys + formas de entrega + frete ---
Object.assign(pt, {
  'menu.motoboys': 'Motoboys',
  'cap.cadastros.motoboy.listar': 'Listar motoboys', 'cap.cadastros.motoboy.gerenciar': 'Criar e editar motoboys / config. de frete',
  'motoboys.titulo': 'Motoboys', 'motoboys.novo': 'Novo motoboy', 'motoboys.nome': 'Nome', 'motoboys.telefone': 'Telefone',
  'motoboys.cfg_titulo': 'Configuração de frete (motoboy)',
  'motoboys.cfg_sub': 'A distância é simulada pelo CEP de entrega. Frete = km × valor por km, respeitando o mínimo.',
  'motoboys.km_rate': 'Valor por km (R$)', 'motoboys.min_motoboy': 'Frete mínimo (R$)', 'motoboys.cfg_ok': 'Configuração de frete salva.',
  'entrega.forma': 'Forma de entrega', 'entrega.retirada': 'Retirada', 'entrega.motoboy': 'Motoboy',
  'entrega.correios': 'Correios', 'entrega.transportadora': 'Transportadora', 'entrega.memo': 'Cálculo',
  'frete.forma_invalida': 'Forma de entrega inválida.', 'frete.km_rate_invalido': 'Valor por km inválido.',
  'frete.min_invalido': 'Frete mínimo inválido.', 'frete.manual_invalido': 'Informe um valor de frete válido.',
  'pedido.motoboy_obrigatorio': 'Selecione o motoboy.', 'pedido.motoboy_invalido': 'Motoboy inválido.',
});
Object.assign(en, {
  'menu.motoboys': 'Couriers',
  'cap.cadastros.motoboy.listar': 'List couriers', 'cap.cadastros.motoboy.gerenciar': 'Create/edit couriers & freight config',
  'motoboys.titulo': 'Couriers', 'motoboys.novo': 'New courier', 'motoboys.nome': 'Name', 'motoboys.telefone': 'Phone',
  'motoboys.cfg_titulo': 'Freight settings (courier)',
  'motoboys.cfg_sub': 'Distance is simulated from the delivery ZIP. Freight = km × per-km rate, respecting the minimum.',
  'motoboys.km_rate': 'Per-km rate ($)', 'motoboys.min_motoboy': 'Minimum freight ($)', 'motoboys.cfg_ok': 'Freight settings saved.',
  'entrega.forma': 'Delivery method', 'entrega.retirada': 'Pickup', 'entrega.motoboy': 'Courier',
  'entrega.correios': 'Postal', 'entrega.transportadora': 'Carrier', 'entrega.memo': 'Calc',
  'frete.forma_invalida': 'Invalid delivery method.', 'frete.km_rate_invalido': 'Invalid per-km rate.',
  'frete.min_invalido': 'Invalid minimum freight.', 'frete.manual_invalido': 'Enter a valid freight value.',
  'pedido.motoboy_obrigatorio': 'Select the courier.', 'pedido.motoboy_invalido': 'Invalid courier.',
});
Object.assign(es, {
  'menu.motoboys': 'Motoboys',
  'cap.cadastros.motoboy.listar': 'Listar motoboys', 'cap.cadastros.motoboy.gerenciar': 'Crear/editar motoboys y config. de flete',
  'motoboys.titulo': 'Motoboys', 'motoboys.novo': 'Nuevo motoboy', 'motoboys.nome': 'Nombre', 'motoboys.telefone': 'Teléfono',
  'motoboys.cfg_titulo': 'Configuración de flete (motoboy)',
  'motoboys.cfg_sub': 'La distancia se simula por el CP de entrega. Flete = km × valor por km, respetando el mínimo.',
  'motoboys.km_rate': 'Valor por km ($)', 'motoboys.min_motoboy': 'Flete mínimo ($)', 'motoboys.cfg_ok': 'Configuración de flete guardada.',
  'entrega.forma': 'Forma de entrega', 'entrega.retirada': 'Retiro', 'entrega.motoboy': 'Motoboy',
  'entrega.correios': 'Correos', 'entrega.transportadora': 'Transportista', 'entrega.memo': 'Cálculo',
  'frete.forma_invalida': 'Forma de entrega inválida.', 'frete.km_rate_invalido': 'Valor por km inválido.',
  'frete.min_invalido': 'Flete mínimo inválido.', 'frete.manual_invalido': 'Ingresa un valor de flete válido.',
  'pedido.motoboy_obrigatorio': 'Selecciona el motoboy.', 'pedido.motoboy_invalido': 'Motoboy inválido.',
});

// --- Refinamento: Logística › Gestão de fretes ---
Object.assign(pt, {
  'cap.modulo.logistica': 'Logística',
  'cap.logistica.frete.ver': 'Ver gestão de fretes', 'cap.logistica.frete.gerenciar': 'Fechar fretes (gerar títulos)',
  'menu.logistica': 'Logística', 'menu.gestao_fretes': 'Gestão de fretes',
  'gfrete.titulo': 'Gestão de fretes', 'gfrete.sub': 'Fretes de motoboy por período. Feche a competência para gerar um título a pagar por motoboy.',
  'gfrete.total': 'Total de fretes', 'gfrete.pedidos': 'Pedidos', 'gfrete.frete': 'Frete acumulado',
  'gfrete.vazio': 'Nenhum frete de motoboy no período.', 'gfrete.fechar': 'Fechar competência',
  'gfrete.fechar_dica': 'Gera um título a pagar por motoboy com o frete do período.',
  'gfrete.gerar_titulos': 'Gerar títulos', 'gfrete.fechado': '{n} título(s) a pagar gerado(s).',
  'frete.nada_apurar': 'Nenhum frete a apurar no período.',
});
Object.assign(en, {
  'cap.modulo.logistica': 'Logistics',
  'cap.logistica.frete.ver': 'View freight management', 'cap.logistica.frete.gerenciar': 'Close freight (generate payables)',
  'menu.logistica': 'Logistics', 'menu.gestao_fretes': 'Freight management',
  'gfrete.titulo': 'Freight management', 'gfrete.sub': 'Courier freight by period. Close the period to generate one payable per courier.',
  'gfrete.total': 'Total freight', 'gfrete.pedidos': 'Orders', 'gfrete.frete': 'Accrued freight',
  'gfrete.vazio': 'No courier freight in the period.', 'gfrete.fechar': 'Close period',
  'gfrete.fechar_dica': 'Generates one payable per courier with the period freight.',
  'gfrete.gerar_titulos': 'Generate payables', 'gfrete.fechado': '{n} payable(s) generated.',
  'frete.nada_apurar': 'No freight to settle in the period.',
});
Object.assign(es, {
  'cap.modulo.logistica': 'Logística',
  'cap.logistica.frete.ver': 'Ver gestión de fletes', 'cap.logistica.frete.gerenciar': 'Cerrar fletes (generar cuentas)',
  'menu.logistica': 'Logística', 'menu.gestao_fretes': 'Gestión de fletes',
  'gfrete.titulo': 'Gestión de fletes', 'gfrete.sub': 'Fletes de motoboy por período. Cierra la competencia para generar una cuenta a pagar por motoboy.',
  'gfrete.total': 'Total de fletes', 'gfrete.pedidos': 'Pedidos', 'gfrete.frete': 'Flete acumulado',
  'gfrete.vazio': 'Sin fletes de motoboy en el período.', 'gfrete.fechar': 'Cerrar competencia',
  'gfrete.fechar_dica': 'Genera una cuenta a pagar por motoboy con el flete del período.',
  'gfrete.gerar_titulos': 'Generar cuentas', 'gfrete.fechado': '{n} cuenta(s) a pagar generada(s).',
  'frete.nada_apurar': 'Sin flete a liquidar en el período.',
});

// --- Refinamento: Romaneio imprimível ---
Object.assign(pt, {
  'romaneio.titulo': 'Romaneio', 'romaneio.imprimir': 'Imprimir', 'romaneio.pedido': 'Pedido',
  'romaneio.recebido_por': 'Recebido por (nome / assinatura)',
});
Object.assign(en, {
  'romaneio.titulo': 'Packing slip', 'romaneio.imprimir': 'Print', 'romaneio.pedido': 'Order',
  'romaneio.recebido_por': 'Received by (name / signature)',
});
Object.assign(es, {
  'romaneio.titulo': 'Remito', 'romaneio.imprimir': 'Imprimir', 'romaneio.pedido': 'Pedido',
  'romaneio.recebido_por': 'Recibido por (nombre / firma)',
});

// --- Refinamento: Relatório de validade de lotes ---
Object.assign(pt, {
  'menu.rel_validade': 'Validade de lotes',
  'rel.validade': 'Validade de lotes', 'rel.validade_sub': 'Lotes em estoque ordenados pela validade. Acompanhe vencidos e a vencer.',
  'rel.saldo': 'Saldo', 'rel.valor': 'Valor',
  'validade.situacao': 'Situação', 'validade.dias': 'Dias p/ vencer', 'validade.ha_dias': 'vencido há {n} d',
  'validade.so_vencer': 'Só vencidos / a vencer (90 d)',
  'validade.kpi_vencidos': 'Lotes vencidos', 'validade.kpi_criticos': 'Vencem em 30 dias',
  'validade.vencido': 'Vencido', 'validade.critico': 'Vence ≤ 30 d', 'validade.atencao': 'Vence ≤ 90 d', 'validade.ok': 'OK', 'validade.sem': 'Sem validade',
});
Object.assign(en, {
  'menu.rel_validade': 'Lot expiry',
  'rel.validade': 'Lot expiry', 'rel.validade_sub': 'Lots in stock sorted by expiry date. Track expired and expiring soon.',
  'rel.saldo': 'Balance', 'rel.valor': 'Value',
  'validade.situacao': 'Status', 'validade.dias': 'Days to expiry', 'validade.ha_dias': 'expired {n} d ago',
  'validade.so_vencer': 'Only expired / expiring (90 d)',
  'validade.kpi_vencidos': 'Expired lots', 'validade.kpi_criticos': 'Expiring in 30 days',
  'validade.vencido': 'Expired', 'validade.critico': 'Expires ≤ 30 d', 'validade.atencao': 'Expires ≤ 90 d', 'validade.ok': 'OK', 'validade.sem': 'No expiry',
});
Object.assign(es, {
  'menu.rel_validade': 'Vencimiento de lotes',
  'rel.validade': 'Vencimiento de lotes', 'rel.validade_sub': 'Lotes en stock ordenados por vencimiento. Controla vencidos y por vencer.',
  'rel.saldo': 'Saldo', 'rel.valor': 'Valor',
  'validade.situacao': 'Situación', 'validade.dias': 'Días p/ vencer', 'validade.ha_dias': 'vencido hace {n} d',
  'validade.so_vencer': 'Solo vencidos / por vencer (90 d)',
  'validade.kpi_vencidos': 'Lotes vencidos', 'validade.kpi_criticos': 'Vencen en 30 días',
  'validade.vencido': 'Vencido', 'validade.critico': 'Vence ≤ 30 d', 'validade.atencao': 'Vence ≤ 90 d', 'validade.ok': 'OK', 'validade.sem': 'Sin vencimiento',
});

// --- Refinamento: Relatório de estoque parado ---
Object.assign(pt, {
  'menu.rel_parado': 'Estoque parado',
  'rel.parado': 'Estoque parado', 'rel.parado_sub': 'Produtos com saldo que não têm saída há um tempo (capital parado).',
  'parado.limite': 'Sem vender há', 'parado.dias': 'dias', 'parado.todos': 'Todos com saldo',
  'parado.ultima_saida': 'Última saída', 'parado.dias_parado': 'Dias parado', 'parado.nunca': 'Nunca vendido',
  'parado.kpi_itens': 'Produtos parados', 'parado.kpi_valor': 'Valor parado',
});
Object.assign(en, {
  'menu.rel_parado': 'Dead stock',
  'rel.parado': 'Dead stock', 'rel.parado_sub': 'Products with stock and no sales for a while (tied-up capital).',
  'parado.limite': 'Not sold for', 'parado.dias': 'days', 'parado.todos': 'All with stock',
  'parado.ultima_saida': 'Last sale', 'parado.dias_parado': 'Days idle', 'parado.nunca': 'Never sold',
  'parado.kpi_itens': 'Idle products', 'parado.kpi_valor': 'Idle value',
});
Object.assign(es, {
  'menu.rel_parado': 'Stock parado',
  'rel.parado': 'Stock parado', 'rel.parado_sub': 'Productos con saldo sin salida hace un tiempo (capital parado).',
  'parado.limite': 'Sin vender hace', 'parado.dias': 'días', 'parado.todos': 'Todos con saldo',
  'parado.ultima_saida': 'Última salida', 'parado.dias_parado': 'Días parado', 'parado.nunca': 'Nunca vendido',
  'parado.kpi_itens': 'Productos parados', 'parado.kpi_valor': 'Valor parado',
});

// --- Refinamento: Relatório de vendas por categoria ---
Object.assign(pt, { 'menu.rel_categorias': 'Vendas por categoria', 'rel.categorias': 'Vendas por categoria' });
Object.assign(en, { 'menu.rel_categorias': 'Sales by category', 'rel.categorias': 'Sales by category' });
Object.assign(es, { 'menu.rel_categorias': 'Ventas por categoría', 'rel.categorias': 'Ventas por categoría' });

// --- Refinamento: Aging de recebíveis ---
Object.assign(pt, {
  'menu.aging': 'Aging de recebíveis', 'fin.pessoa': 'Cliente / pessoa',
  'aging.titulo': 'Aging de recebíveis', 'aging.sub': 'Contas a receber em aberto por faixa de atraso (gestão de caixa).',
  'aging.dias_atraso': 'Dias de atraso', 'aging.faixa': 'Faixa', 'aging.total_aberto': 'Total em aberto', 'aging.vazio': 'Nenhum título a receber em aberto.',
  'aging.a_vencer': 'A vencer', 'aging.d1_30': 'Atraso 1–30 d', 'aging.d31_60': 'Atraso 31–60 d', 'aging.d61_90': 'Atraso 61–90 d', 'aging.d90_mais': 'Atraso 90+ d',
});
Object.assign(en, {
  'menu.aging': 'Receivables aging', 'fin.pessoa': 'Customer / payer',
  'aging.titulo': 'Receivables aging', 'aging.sub': 'Open receivables by overdue bucket (cash management).',
  'aging.dias_atraso': 'Days overdue', 'aging.faixa': 'Bucket', 'aging.total_aberto': 'Total open', 'aging.vazio': 'No open receivables.',
  'aging.a_vencer': 'Not due', 'aging.d1_30': 'Overdue 1–30 d', 'aging.d31_60': 'Overdue 31–60 d', 'aging.d61_90': 'Overdue 61–90 d', 'aging.d90_mais': 'Overdue 90+ d',
});
Object.assign(es, {
  'menu.aging': 'Aging de cobranzas', 'fin.pessoa': 'Cliente / persona',
  'aging.titulo': 'Aging de cobranzas', 'aging.sub': 'Cuentas por cobrar abiertas por franja de atraso (gestión de caja).',
  'aging.dias_atraso': 'Días de atraso', 'aging.faixa': 'Franja', 'aging.total_aberto': 'Total abierto', 'aging.vazio': 'Sin cuentas por cobrar abiertas.',
  'aging.a_vencer': 'Por vencer', 'aging.d1_30': 'Atraso 1–30 d', 'aging.d31_60': 'Atraso 31–60 d', 'aging.d61_90': 'Atraso 61–90 d', 'aging.d90_mais': 'Atraso 90+ d',
});

// --- Refinamento: DRE simplificada (resultado do período) ---
Object.assign(pt, {
  'menu.dre': 'DRE (resultado)',
  'dre.titulo': 'DRE simplificada — resultado do período', 'dre.sub': 'Caixa realizado no período (títulos pagos), por origem. Resultado = receitas − despesas.',
  'dre.receitas': 'Receitas', 'dre.despesas': 'Despesas', 'dre.resultado': 'Resultado', 'dre.origem': 'Origem', 'dre.grupo': 'Grupo',
  'origem.pedido': 'Pedidos', 'origem.compra': 'Compras', 'origem.comissao': 'Comissões', 'origem.frete': 'Fretes', 'origem.manual': 'Manual',
});
Object.assign(en, {
  'menu.dre': 'P&L (result)',
  'dre.titulo': 'Simplified P&L — period result', 'dre.sub': 'Cash realized in the period (paid titles), by source. Result = income − expenses.',
  'dre.receitas': 'Income', 'dre.despesas': 'Expenses', 'dre.resultado': 'Result', 'dre.origem': 'Source', 'dre.grupo': 'Group',
  'origem.pedido': 'Orders', 'origem.compra': 'Purchases', 'origem.comissao': 'Commissions', 'origem.frete': 'Freight', 'origem.manual': 'Manual',
});
Object.assign(es, {
  'menu.dre': 'Estado de resultados',
  'dre.titulo': 'Estado de resultados simplificado — período', 'dre.sub': 'Caja realizada en el período (títulos pagados), por origen. Resultado = ingresos − gastos.',
  'dre.receitas': 'Ingresos', 'dre.despesas': 'Gastos', 'dre.resultado': 'Resultado', 'dre.origem': 'Origen', 'dre.grupo': 'Grupo',
  'origem.pedido': 'Pedidos', 'origem.compra': 'Compras', 'origem.comissao': 'Comisiones', 'origem.frete': 'Fletes', 'origem.manual': 'Manual',
});

// --- Refinamento: Busca global (Ctrl+K) ---
Object.assign(pt, { 'busca.abrir': 'Buscar', 'busca.placeholder': 'Buscar telas… (ex.: pedidos, estoque, DRE)', 'busca.vazio': 'Nada encontrado.', 'busca.dica': '↑ ↓ navegar · Enter abrir · Esc fechar' });
Object.assign(en, { 'busca.abrir': 'Search', 'busca.placeholder': 'Search screens… (e.g. orders, stock, P&L)', 'busca.vazio': 'Nothing found.', 'busca.dica': '↑ ↓ navigate · Enter open · Esc close' });
Object.assign(es, { 'busca.abrir': 'Buscar', 'busca.placeholder': 'Buscar pantallas… (ej.: pedidos, stock, resultados)', 'busca.vazio': 'Nada encontrado.', 'busca.dica': '↑ ↓ navegar · Enter abrir · Esc cerrar' });

// --- Refinamento: Toasts de confirmação ---
Object.assign(pt, {
  'fin.toast_criado': 'Título lançado.', 'fin.toast_baixado': 'Título baixado.', 'fin.toast_cancelado': 'Baixa cancelada.',
  'pedido.toast_status': 'Pedido movido para', 'sep.toast_ok': 'Separação concluída e estoque baixado.',
});
Object.assign(en, {
  'fin.toast_criado': 'Title created.', 'fin.toast_baixado': 'Title settled.', 'fin.toast_cancelado': 'Settlement reverted.',
  'pedido.toast_status': 'Order moved to', 'sep.toast_ok': 'Picking done and stock deducted.',
});
Object.assign(es, {
  'fin.toast_criado': 'Título creado.', 'fin.toast_baixado': 'Título pagado.', 'fin.toast_cancelado': 'Pago cancelado.',
  'pedido.toast_status': 'Pedido movido a', 'sep.toast_ok': 'Preparación hecha y stock descontado.',
});

// --- Refinamento: Sino de notificações ---
Object.assign(pt, { 'sino.titulo': 'Notificações', 'sino.vazio': 'Nada pendente. Tudo em dia! 🎉', 'sino.titulos_vencidos': 'Títulos a receber vencidos', 'sino.lotes_vencendo': 'Lotes vencendo (30 d)', 'sino.estoque_baixo': 'Produtos com estoque baixo' });
Object.assign(en, { 'sino.titulo': 'Notifications', 'sino.vazio': 'Nothing pending. All caught up! 🎉', 'sino.titulos_vencidos': 'Overdue receivables', 'sino.lotes_vencendo': 'Lots expiring (30 d)', 'sino.estoque_baixo': 'Low-stock products' });
Object.assign(es, { 'sino.titulo': 'Notificaciones', 'sino.vazio': 'Nada pendiente. ¡Todo al día! 🎉', 'sino.titulos_vencidos': 'Cobranzas vencidas', 'sino.lotes_vencendo': 'Lotes por vencer (30 d)', 'sino.estoque_baixo': 'Productos con stock bajo' });

// --- Refinamento: Ações em massa ---
Object.assign(pt, {
  'bulk.selecionados': '{n} selecionado(s)', 'bulk.baixar': 'Baixar', 'bulk.excluir': 'Excluir', 'bulk.limpar': 'Limpar seleção',
  'bulk.baixados': '{n} título(s) baixado(s).', 'bulk.excluidos': '{n} título(s) excluído(s).', 'bulk.confirma_excluir': 'Excluir {n} título(s) selecionado(s)?',
});
Object.assign(en, {
  'bulk.selecionados': '{n} selected', 'bulk.baixar': 'Settle', 'bulk.excluir': 'Delete', 'bulk.limpar': 'Clear selection',
  'bulk.baixados': '{n} title(s) settled.', 'bulk.excluidos': '{n} title(s) deleted.', 'bulk.confirma_excluir': 'Delete {n} selected title(s)?',
});
Object.assign(es, {
  'bulk.selecionados': '{n} seleccionado(s)', 'bulk.baixar': 'Pagar', 'bulk.excluir': 'Eliminar', 'bulk.limpar': 'Limpiar selección',
  'bulk.baixados': '{n} título(s) pagado(s).', 'bulk.excluidos': '{n} título(s) eliminado(s).', 'bulk.confirma_excluir': '¿Eliminar {n} título(s) seleccionado(s)?',
});

// --- Refinamento: Categorias financeiras ---
Object.assign(pt, {
  'common.salvo': 'Salvo.',
  'menu.catfin': 'Categorias financeiras',
  'cap.cadastros.catfin.listar': 'Listar categorias financeiras', 'cap.cadastros.catfin.gerenciar': 'Criar e editar categorias financeiras',
  'catfin.titulo': 'Categorias financeiras', 'catfin.titulo_s': 'Categoria', 'catfin.nova': 'Nova categoria',
  'catfin.sub': 'Classifique receitas e despesas (organiza o financeiro e a DRE por categoria).',
  'catfin.nome': 'Nome', 'catfin.tipo': 'Tipo', 'catfin.receita': 'Receita', 'catfin.despesa': 'Despesa', 'catfin.sem': '(sem categoria)',
  'catfin.tipo_invalido': 'Tipo de categoria inválido.',
});
Object.assign(en, {
  'common.salvo': 'Saved.',
  'menu.catfin': 'Financial categories',
  'cap.cadastros.catfin.listar': 'List financial categories', 'cap.cadastros.catfin.gerenciar': 'Create and edit financial categories',
  'catfin.titulo': 'Financial categories', 'catfin.titulo_s': 'Category', 'catfin.nova': 'New category',
  'catfin.sub': 'Classify income and expenses (organizes finance and P&L by category).',
  'catfin.nome': 'Name', 'catfin.tipo': 'Type', 'catfin.receita': 'Income', 'catfin.despesa': 'Expense', 'catfin.sem': '(no category)',
  'catfin.tipo_invalido': 'Invalid category type.',
});
Object.assign(es, {
  'common.salvo': 'Guardado.',
  'menu.catfin': 'Categorías financieras',
  'cap.cadastros.catfin.listar': 'Listar categorías financieras', 'cap.cadastros.catfin.gerenciar': 'Crear y editar categorías financieras',
  'catfin.titulo': 'Categorías financieras', 'catfin.titulo_s': 'Categoría', 'catfin.nova': 'Nueva categoría',
  'catfin.sub': 'Clasifica ingresos y gastos (organiza las finanzas y el resultado por categoría).',
  'catfin.nome': 'Nombre', 'catfin.tipo': 'Tipo', 'catfin.receita': 'Ingreso', 'catfin.despesa': 'Gasto', 'catfin.sem': '(sin categoría)',
  'catfin.tipo_invalido': 'Tipo de categoría inválido.',
});

// --- Refinamento: DRE por categoria (seletor de agrupamento) ---
Object.assign(pt, { 'dre.agrupar': 'Agrupar por', 'dre.por_origem': 'Origem', 'dre.por_categoria': 'Categoria financeira' });
Object.assign(en, { 'dre.agrupar': 'Group by', 'dre.por_origem': 'Source', 'dre.por_categoria': 'Financial category' });
Object.assign(es, { 'dre.agrupar': 'Agrupar por', 'dre.por_origem': 'Origen', 'dre.por_categoria': 'Categoría financiera' });

// --- Refinamento: Curva ABC de produtos ---
Object.assign(pt, {
  'menu.rel_abc': 'Curva ABC',
  'abc.titulo': 'Curva ABC de produtos', 'abc.sub': 'Produtos por participação na receita. A ≈ 80% (poucos vitais), B ≈ 15%, C ≈ 5%.',
  'abc.pct': '% da receita', 'abc.acumulado': '% acumulado', 'abc.classe': 'Classe', 'abc.itens': 'itens',
});
Object.assign(en, {
  'menu.rel_abc': 'ABC analysis',
  'abc.titulo': 'Product ABC analysis', 'abc.sub': 'Products by revenue share. A ≈ 80% (vital few), B ≈ 15%, C ≈ 5%.',
  'abc.pct': '% of revenue', 'abc.acumulado': 'cumulative %', 'abc.classe': 'Class', 'abc.itens': 'items',
});
Object.assign(es, {
  'menu.rel_abc': 'Curva ABC',
  'abc.titulo': 'Curva ABC de productos', 'abc.sub': 'Productos por participación en los ingresos. A ≈ 80%, B ≈ 15%, C ≈ 5%.',
  'abc.pct': '% de ingresos', 'abc.acumulado': '% acumulado', 'abc.classe': 'Clase', 'abc.itens': 'ítems',
});

// --- Refinamento: Relatório de Perdas de estoque ---
Object.assign(pt, {
  'menu.rel_perdas': 'Perdas de estoque',
  'perdas.titulo': 'Perdas de estoque', 'perdas.sub': 'Baixas por perda no período (vencimento, avaria, ajuste de inventário, etc.).',
  'perdas.motivo': 'Motivo', 'perdas.todos': 'Todos os motivos', 'perdas.vazio': 'Nenhuma perda no período.',
  'perdas.kpi_valor': 'Valor perdido', 'perdas.kpi_itens': 'Itens perdidos', 'perdas.kpi_lancamentos': 'Lançamentos',
});
Object.assign(en, {
  'menu.rel_perdas': 'Stock losses',
  'perdas.titulo': 'Stock losses', 'perdas.sub': 'Write-offs in the period (expiry, damage, inventory adjustment, etc.).',
  'perdas.motivo': 'Reason', 'perdas.todos': 'All reasons', 'perdas.vazio': 'No losses in the period.',
  'perdas.kpi_valor': 'Lost value', 'perdas.kpi_itens': 'Lost items', 'perdas.kpi_lancamentos': 'Entries',
});
Object.assign(es, {
  'menu.rel_perdas': 'Pérdidas de stock',
  'perdas.titulo': 'Pérdidas de stock', 'perdas.sub': 'Bajas por pérdida en el período (vencimiento, avería, ajuste de inventario, etc.).',
  'perdas.motivo': 'Motivo', 'perdas.todos': 'Todos los motivos', 'perdas.vazio': 'Sin pérdidas en el período.',
  'perdas.kpi_valor': 'Valor perdido', 'perdas.kpi_itens': 'Ítems perdidos', 'perdas.kpi_lancamentos': 'Registros',
});
