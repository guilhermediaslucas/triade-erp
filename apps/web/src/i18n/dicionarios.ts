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
  'entrada.titulo': 'Entrada de estoque', 'entrada.sub': 'Recebimento direto com lote e validade. O recebimento por nota/código de barras vem com o Financeiro.',
  'entrada.lote_ph': 'Ex.: L-2026-001', 'entrada.quantidade': 'Quantidade', 'entrada.custo': 'Custo unitário (R$)',
  'entrada.confirmar': 'Confirmar entrada', 'entrada.ok': 'Entrada registrada no estoque.',
  'estoque.qtd_invalida': 'Quantidade inválida.', 'estoque.custo_invalido': 'Custo inválido.',
});
Object.assign(en, {
  'menu.estoque_exp': 'Inventory/Shipping', 'menu.posicao': 'Stock position', 'menu.entrada': 'Stock entry',
  'cap.modulo.estoque': 'Inventory', 'cap.estoque.saldo.ver': 'View stock position', 'cap.estoque.entrada.criar': 'Register stock entry',
  'estoque.titulo': 'Stock position', 'estoque.saldo': 'Balance', 'estoque.lote': 'Batch', 'estoque.validade': 'Expiry',
  'estoque.baixo': 'Low stock', 'estoque.ok': 'OK',
  'entrada.titulo': 'Stock entry', 'entrada.sub': 'Direct receipt with batch and expiry. Invoice/barcode receiving comes with Finance.',
  'entrada.lote_ph': 'e.g., L-2026-001', 'entrada.quantidade': 'Quantity', 'entrada.custo': 'Unit cost (R$)',
  'entrada.confirmar': 'Confirm entry', 'entrada.ok': 'Stock entry registered.',
  'estoque.qtd_invalida': 'Invalid quantity.', 'estoque.custo_invalido': 'Invalid cost.',
});
Object.assign(es, {
  'menu.estoque_exp': 'Inventario/Expedición', 'menu.posicao': 'Posición de stock', 'menu.entrada': 'Entrada de stock',
  'cap.modulo.estoque': 'Inventario', 'cap.estoque.saldo.ver': 'Ver posición de stock', 'cap.estoque.entrada.criar': 'Registrar entrada de stock',
  'estoque.titulo': 'Posición de stock', 'estoque.saldo': 'Saldo', 'estoque.lote': 'Lote', 'estoque.validade': 'Caducidad',
  'estoque.baixo': 'Stock bajo', 'estoque.ok': 'Al día',
  'entrada.titulo': 'Entrada de stock', 'entrada.sub': 'Recepción directa con lote y caducidad. La recepción por factura/código de barras llega con Finanzas.',
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
