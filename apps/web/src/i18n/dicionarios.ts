import type { Idioma } from '@triade/shared';
type Dict = Record<string, string>;

const pt: Dict = {
  // ===== Acesso, disponibilidade e relatórios contábeis (lote 2026-06-16) =====
  'senha.obrigatoria': 'Sua senha é provisória. Defina uma nova senha para continuar.',
  'senha.provisoria': 'Senha provisória',
  'sem_telas.titulo': 'Nenhuma tela liberada',
  'sem_telas.msg': 'Seu perfil ainda não tem acesso a nenhuma tela. Fale com o administrador.',
  'usuarios.exigir_troca': 'Exigir troca de senha no próximo acesso',
  'usuarios.acesso_empresas': 'Acesso multi-empresa',
  'usuarios.acesso_ajuda': 'Vincule este login a várias empresas sem recadastrar. As empresas marcadas terão o mesmo usuário (e-mail e senha); o perfil é aplicado pelo nome em cada empresa.',
  'usuarios.acesso_buscar': 'Buscar',
  'usuarios.acesso_senha': 'Senha provisória',
  'usuarios.acesso_senha_ph': 'em branco = mantém a atual',
  'usuarios.acesso_empresas_lista': 'Empresas de acesso',
  'usuarios.acesso_busque': 'Informe o e-mail e clique em Buscar para ver as empresas.',
  'menu.disponibilidade': 'Disponibilidade',
  'disp.crumb': 'Estoque/Expedição / Disponibilidade',
  'disp.titulo': 'Disponibilidade de produtos',
  'disp.sub': 'O que está disponível para vender hoje (saldo menos reservado).',
  'disp.reservado': 'Reservado',
  'disp.disponivel': 'Disponível',
  'disp.ok': 'Disponível',
  'disp.sem': 'Sem disponibilidade',
  'disp.f_disponivel': 'Com disponibilidade',
  'disp.f_sem': 'Sem disponibilidade',
  'disp.kpi_disp': 'Produtos disponíveis',
  'disp.kpi_sem': 'Sem disponibilidade',
  'disp.kpi_reservado': 'Total reservado',
  'disp.kpi_valor': 'Valor disponível',
  'disp.nota': 'Disponível = saldo em estoque − quantidade reservada em pedidos aprovados/aguardando. Itens sem disponibilidade aparecem no topo.',
  'rel.g_contabil': 'Contábil',
  'rel.g_contabil_d': 'Contas a pagar/receber e vendas — visão contábil por competência.',
  'cap.modulo.relatorios_contabil': 'Relatórios contábeis',
  'cap.relatorios.contabil.pagar': 'Contas a pagar (contábil)',
  'cap.relatorios.contabil.receber': 'Contas a receber (contábil)',
  'cap.relatorios.contabil.vendas': 'Vendas (contábil)',
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
  'filtro.buscar_ph': 'Buscar…', 'filtro.todos': 'Todos', 'filtro.ativos': 'Ativos', 'filtro.inativos': 'Inativos',
  'common.nenhum': 'Nenhum registro.', 'common.excluir': 'Excluir',
  'anexo.titulo': 'Anexos', 'anexo.vazio': 'Nenhum documento anexado.', 'anexo.ver': 'Ver', 'anexo.baixar': 'Baixar',
  'anexo.enviar': 'Anexar documento', 'anexo.enviando': 'Enviando...', 'anexo.formatos': 'PDF, JPG, PNG ou WEBP · até 10 MB',
  'anexo.remover_confirma': 'Remover este anexo?', 'anexo.indisponivel': 'Anexos indisponíveis: o armazenamento (R2) ainda não está configurado.',
  'anexo.tipo_invalido': 'Tipo de arquivo não permitido (use PDF, JPG, PNG ou WEBP).', 'anexo.muito_grande': 'Arquivo muito grande (máx. 10 MB).',
  'anexo.conteudo_invalido': 'Arquivo inválido.', 'anexo.nao_encontrado': 'Anexo não encontrado.', 'anexo.titulo_invalido': 'Título inválido.',
  'usuarios.titulo': 'Usuários', 'usuarios.novo': 'Novo usuário', 'usuarios.nome': 'Nome',
  'usuarios.email': 'E-mail', 'usuarios.perfil': 'Perfil', 'usuarios.senha': 'Senha',
  'usuarios.situacao': 'Situação', 'usuarios.acoes': 'Ações', 'usuarios.ativo': 'Ativo',
  'usuarios.inativo': 'Inativo', 'usuarios.ativar': 'Ativar', 'usuarios.inativar': 'Inativar',
  'usuarios.editar_titulo': 'Editar usuário', 'usuarios.novo_titulo': 'Novo usuário',
  'usuarios.sem_perfil': '(sem perfil)', 'usuarios.redefinir_senha': 'Redefinir senha',
  'usuarios.vendedor': 'Vendedor vinculado', 'usuarios.sem_vendedor': '(nenhum)',
  'usuarios.vendedor_hint': 'Liga este login a um cadastro de Vendedor — usado na regra de "só o próprio vendedor".',
  'usuarios.nova_senha': 'Nova senha', 'usuarios.senha_hint': 'Mínimo de 6 caracteres.',
  'usuarios.salvo': 'Usuário salvo.', 'usuarios.senha_alterada': 'Senha alterada.',
  'perfis.titulo': 'Perfis', 'perfis.novo': 'Novo perfil', 'perfis.nome': 'Nome do perfil',
  'perfis.permissoes': 'Permissões', 'perfis.qtd_permissoes': 'permissões', 'perfis.modulos': 'Módulos liberados', 'perfis.todos_modulos': 'Todos',
  'perfis.editar_titulo': 'Editar perfil', 'perfis.novo_titulo': 'Novo perfil', 'perfis.salvo': 'Perfil salvo.',
  'cap.modulo.dashboard': 'Painel', 'cap.modulo.acesso': 'Acesso',
  'cap.dashboard.ver': 'Ver o dashboard',
  'cap.acesso.usuario.listar': 'Listar usuários', 'cap.acesso.usuario.gerenciar': 'Criar e editar usuários',
  'cap.acesso.perfil.listar': 'Listar perfis', 'cap.acesso.perfil.gerenciar': 'Criar e editar perfis',
  'cap.acesso.empresa.editar': 'Editar dados da empresa',
  'auth.campos_obrigatorios': 'Preencha empresa, e-mail e senha.',
  'auth.credenciais_invalidas': 'E-mail ou senha incorretos.', 'auth.sem_empresas': 'Nenhuma empresa ativa para acessar.',
  'auth.empresa_invalida': 'Empresa não encontrada ou inativa.',
  'auth.token_ausente': 'Sessão não encontrada. Faça login novamente.',
  'auth.token_invalido': 'Sessão expirada. Faça login novamente.',
  'auth.muitas_tentativas': 'Muitas tentativas de login. Aguarde alguns minutos e tente de novo.',
  'auth.sem_permissao': 'Você não tem permissão para esta ação.',
  'usuario.nome_invalido': 'Informe um nome válido.', 'usuario.email_invalido': 'E-mail inválido.',
  'usuario.email_em_uso': 'Já existe um usuário com este e-mail.', 'usuario.senha_curta': 'A senha deve ter ao menos 6 caracteres.',
  'senha.trocar': 'Trocar senha', 'senha.atual': 'Senha atual', 'senha.nova': 'Nova senha', 'senha.confirmar': 'Confirmar nova senha',
  'senha.ok': 'Senha alterada com sucesso.', 'senha.divergem': 'A confirmação não confere com a nova senha.',
  'auth.senha_atual_invalida': 'Senha atual incorreta.',
  'usuario.perfil_invalido': 'Perfil inválido.', 'usuario.nao_encontrado': 'Usuário não encontrado.',
  'perfil.nome_invalido': 'Informe um nome de perfil válido.', 'perfil.capability_invalida': 'Permissão inválida.',
  'perfil.nao_encontrado': 'Perfil não encontrado.',
  'erro.interno': 'Ocorreu um erro. Tente novamente.', 'erro.rede': 'Falha de conexão com o servidor.',
};

const en: Dict = {
  'senha.obrigatoria': 'Your password is temporary. Set a new password to continue.',
  'senha.provisoria': 'Temporary password',
  'sem_telas.titulo': 'No screens available',
  'sem_telas.msg': 'Your profile has no access to any screen yet. Contact the administrator.',
  'usuarios.exigir_troca': 'Require password change on next sign-in',
  'usuarios.acesso_empresas': 'Multi-company access',
  'usuarios.acesso_ajuda': 'Link this login to several companies without re-registering. Checked companies share the same user (email and password); the profile is applied by name in each company.',
  'usuarios.acesso_buscar': 'Search',
  'usuarios.acesso_senha': 'Temporary password',
  'usuarios.acesso_senha_ph': 'blank = keep current',
  'usuarios.acesso_empresas_lista': 'Companies with access',
  'usuarios.acesso_busque': 'Enter the email and click Search to see the companies.',
  'menu.disponibilidade': 'Availability',
  'disp.crumb': 'Stock/Shipping / Availability',
  'disp.titulo': 'Product availability',
  'disp.sub': 'What is available to sell today (balance minus reserved).',
  'disp.reservado': 'Reserved',
  'disp.disponivel': 'Available',
  'disp.ok': 'Available',
  'disp.sem': 'Unavailable',
  'disp.f_disponivel': 'Available',
  'disp.f_sem': 'Unavailable',
  'disp.kpi_disp': 'Available products',
  'disp.kpi_sem': 'Unavailable',
  'disp.kpi_reservado': 'Total reserved',
  'disp.kpi_valor': 'Available value',
  'disp.nota': 'Available = stock balance − quantity reserved in approved/pending orders. Items without availability appear on top.',
  'rel.g_contabil': 'Accounting',
  'rel.g_contabil_d': 'Payables/receivables and sales — accounting view by accrual.',
  'cap.modulo.relatorios_contabil': 'Accounting reports',
  'cap.relatorios.contabil.pagar': 'Payables (accounting)',
  'cap.relatorios.contabil.receber': 'Receivables (accounting)',
  'cap.relatorios.contabil.vendas': 'Sales (accounting)',
  'login.titulo': 'Sign in', 'login.empresa': 'Company code', 'login.email': 'E-mail',
  'login.senha': 'Password', 'login.entrar': 'Sign in', 'login.entrando': 'Signing in...',
  'login.subtitulo': 'Access your account to continue',
  'menu.dashboard': 'Dashboard', 'menu.acesso': 'Access', 'menu.usuarios': 'Users', 'menu.perfis': 'Roles',
  'topbar.sair': 'Sign out',
  'dashboard.titulo': 'Overview', 'dashboard.bemvindo': 'Welcome',
  'dashboard.placeholder': 'Operation metrics will appear here as modules are implemented.',
  'common.salvar': 'Save', 'common.cancelar': 'Cancel', 'common.editar': 'Edit',
  'common.fechar': 'Close', 'common.sim': 'Yes', 'common.nao': 'No', 'common.carregando': 'Loading...',
  'filtro.buscar_ph': 'Search…', 'filtro.todos': 'All', 'filtro.ativos': 'Active', 'filtro.inativos': 'Inactive',
  'common.nenhum': 'No records.', 'common.excluir': 'Delete',
  'anexo.titulo': 'Attachments', 'anexo.vazio': 'No documents attached.', 'anexo.ver': 'View', 'anexo.baixar': 'Download',
  'anexo.enviar': 'Attach document', 'anexo.enviando': 'Uploading...', 'anexo.formatos': 'PDF, JPG, PNG or WEBP · up to 10 MB',
  'anexo.remover_confirma': 'Remove this attachment?', 'anexo.indisponivel': 'Attachments unavailable: storage (R2) is not configured yet.',
  'anexo.tipo_invalido': 'File type not allowed (use PDF, JPG, PNG or WEBP).', 'anexo.muito_grande': 'File too large (max 10 MB).',
  'anexo.conteudo_invalido': 'Invalid file.', 'anexo.nao_encontrado': 'Attachment not found.', 'anexo.titulo_invalido': 'Invalid title.',
  'usuarios.titulo': 'Users', 'usuarios.novo': 'New user', 'usuarios.nome': 'Name',
  'usuarios.email': 'E-mail', 'usuarios.perfil': 'Role', 'usuarios.senha': 'Password',
  'usuarios.situacao': 'Status', 'usuarios.acoes': 'Actions', 'usuarios.ativo': 'Active',
  'usuarios.inativo': 'Inactive', 'usuarios.ativar': 'Activate', 'usuarios.inativar': 'Deactivate',
  'usuarios.editar_titulo': 'Edit user', 'usuarios.novo_titulo': 'New user',
  'usuarios.sem_perfil': '(no role)', 'usuarios.redefinir_senha': 'Reset password',
  'usuarios.vendedor': 'Linked sales rep', 'usuarios.sem_vendedor': '(none)',
  'usuarios.vendedor_hint': 'Links this login to a Sales rep record — used by the "own sales rep only" rule.',
  'usuarios.nova_senha': 'New password', 'usuarios.senha_hint': 'At least 6 characters.',
  'usuarios.salvo': 'User saved.', 'usuarios.senha_alterada': 'Password changed.',
  'perfis.titulo': 'Roles', 'perfis.novo': 'New role', 'perfis.nome': 'Role name',
  'perfis.permissoes': 'Permissions', 'perfis.qtd_permissoes': 'permissions', 'perfis.modulos': 'Allowed modules', 'perfis.todos_modulos': 'All',
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
  'auth.muitas_tentativas': 'Too many login attempts. Please wait a few minutes and try again.',
  'auth.sem_permissao': 'You do not have permission for this action.',
  'usuario.nome_invalido': 'Enter a valid name.', 'usuario.email_invalido': 'Invalid e-mail.',
  'usuario.email_em_uso': 'A user with this e-mail already exists.', 'usuario.senha_curta': 'Password must be at least 6 characters.',
  'senha.trocar': 'Change password', 'senha.atual': 'Current password', 'senha.nova': 'New password', 'senha.confirmar': 'Confirm new password',
  'senha.ok': 'Password changed successfully.', 'senha.divergem': 'Confirmation does not match the new password.',
  'auth.senha_atual_invalida': 'Current password is incorrect.',
  'usuario.perfil_invalido': 'Invalid role.', 'usuario.nao_encontrado': 'User not found.',
  'perfil.nome_invalido': 'Enter a valid role name.', 'perfil.capability_invalida': 'Invalid permission.',
  'perfil.nao_encontrado': 'Role not found.',
  'erro.interno': 'An error occurred. Please try again.', 'erro.rede': 'Connection to the server failed.',
};

const es: Dict = {
  'senha.obrigatoria': 'Tu contraseña es provisional. Define una nueva contraseña para continuar.',
  'senha.provisoria': 'Contraseña provisional',
  'sem_telas.titulo': 'Ninguna pantalla disponible',
  'sem_telas.msg': 'Tu perfil aún no tiene acceso a ninguna pantalla. Habla con el administrador.',
  'usuarios.exigir_troca': 'Exigir cambio de contraseña en el próximo acceso',
  'usuarios.acesso_empresas': 'Acceso multiempresa',
  'usuarios.acesso_ajuda': 'Vincula este acceso a varias empresas sin volver a registrarlo. Las empresas marcadas comparten el mismo usuario (correo y contraseña); el perfil se aplica por nombre en cada empresa.',
  'usuarios.acesso_buscar': 'Buscar',
  'usuarios.acesso_senha': 'Contraseña provisional',
  'usuarios.acesso_senha_ph': 'en blanco = mantener la actual',
  'usuarios.acesso_empresas_lista': 'Empresas con acceso',
  'usuarios.acesso_busque': 'Ingresa el correo y haz clic en Buscar para ver las empresas.',
  'menu.disponibilidade': 'Disponibilidad',
  'disp.crumb': 'Stock/Expedición / Disponibilidad',
  'disp.titulo': 'Disponibilidad de productos',
  'disp.sub': 'Lo que está disponible para vender hoy (saldo menos reservado).',
  'disp.reservado': 'Reservado',
  'disp.disponivel': 'Disponible',
  'disp.ok': 'Disponible',
  'disp.sem': 'Sin disponibilidad',
  'disp.f_disponivel': 'Con disponibilidad',
  'disp.f_sem': 'Sin disponibilidad',
  'disp.kpi_disp': 'Productos disponibles',
  'disp.kpi_sem': 'Sin disponibilidad',
  'disp.kpi_reservado': 'Total reservado',
  'disp.kpi_valor': 'Valor disponible',
  'disp.nota': 'Disponible = saldo en stock − cantidad reservada en pedidos aprobados/pendientes. Los ítems sin disponibilidad aparecen arriba.',
  'rel.g_contabil': 'Contable',
  'rel.g_contabil_d': 'Cuentas por pagar/cobrar y ventas — visión contable por devengo.',
  'cap.modulo.relatorios_contabil': 'Informes contables',
  'cap.relatorios.contabil.pagar': 'Cuentas por pagar (contable)',
  'cap.relatorios.contabil.receber': 'Cuentas por cobrar (contable)',
  'cap.relatorios.contabil.vendas': 'Ventas (contable)',
  'login.titulo': 'Iniciar sesión', 'login.empresa': 'Código de la empresa', 'login.email': 'Correo',
  'login.senha': 'Contraseña', 'login.entrar': 'Entrar', 'login.entrando': 'Entrando...',
  'login.subtitulo': 'Accede a tu cuenta para continuar',
  'menu.dashboard': 'Panel', 'menu.acesso': 'Acceso', 'menu.usuarios': 'Usuarios', 'menu.perfis': 'Perfiles',
  'topbar.sair': 'Salir',
  'dashboard.titulo': 'Visión general', 'dashboard.bemvindo': 'Bienvenido(a)',
  'dashboard.placeholder': 'Los indicadores de la operación aparecerán aquí a medida que se implementen los módulos.',
  'common.salvar': 'Guardar', 'common.cancelar': 'Cancelar', 'common.editar': 'Editar',
  'common.fechar': 'Cerrar', 'common.sim': 'Sí', 'common.nao': 'No', 'common.carregando': 'Cargando...',
  'filtro.buscar_ph': 'Buscar…', 'filtro.todos': 'Todos', 'filtro.ativos': 'Activos', 'filtro.inativos': 'Inactivos',
  'common.nenhum': 'Sin registros.', 'common.excluir': 'Eliminar',
  'anexo.titulo': 'Adjuntos', 'anexo.vazio': 'Ningún documento adjunto.', 'anexo.ver': 'Ver', 'anexo.baixar': 'Descargar',
  'anexo.enviar': 'Adjuntar documento', 'anexo.enviando': 'Enviando...', 'anexo.formatos': 'PDF, JPG, PNG o WEBP · hasta 10 MB',
  'anexo.remover_confirma': '¿Quitar este adjunto?', 'anexo.indisponivel': 'Adjuntos no disponibles: el almacenamiento (R2) aún no está configurado.',
  'anexo.tipo_invalido': 'Tipo de archivo no permitido (usa PDF, JPG, PNG o WEBP).', 'anexo.muito_grande': 'Archivo demasiado grande (máx. 10 MB).',
  'anexo.conteudo_invalido': 'Archivo inválido.', 'anexo.nao_encontrado': 'Adjunto no encontrado.', 'anexo.titulo_invalido': 'Título inválido.',
  'usuarios.titulo': 'Usuarios', 'usuarios.novo': 'Nuevo usuario', 'usuarios.nome': 'Nombre',
  'usuarios.email': 'Correo', 'usuarios.perfil': 'Perfil', 'usuarios.senha': 'Contraseña',
  'usuarios.situacao': 'Estado', 'usuarios.acoes': 'Acciones', 'usuarios.ativo': 'Activo',
  'usuarios.inativo': 'Inactivo', 'usuarios.ativar': 'Activar', 'usuarios.inativar': 'Desactivar',
  'usuarios.editar_titulo': 'Editar usuario', 'usuarios.novo_titulo': 'Nuevo usuario',
  'usuarios.sem_perfil': '(sin perfil)', 'usuarios.redefinir_senha': 'Restablecer contraseña',
  'usuarios.vendedor': 'Vendedor vinculado', 'usuarios.sem_vendedor': '(ninguno)',
  'usuarios.vendedor_hint': 'Vincula este acceso a un Vendedor — usado en la regla de "solo el propio vendedor".',
  'usuarios.nova_senha': 'Nueva contraseña', 'usuarios.senha_hint': 'Mínimo 6 caracteres.',
  'usuarios.salvo': 'Usuario guardado.', 'usuarios.senha_alterada': 'Contraseña cambiada.',
  'perfis.titulo': 'Perfiles', 'perfis.novo': 'Nuevo perfil', 'perfis.nome': 'Nombre del perfil',
  'perfis.permissoes': 'Permisos', 'perfis.qtd_permissoes': 'permisos', 'perfis.modulos': 'Módulos liberados', 'perfis.todos_modulos': 'Todos',
  'perfis.editar_titulo': 'Editar perfil', 'perfis.novo_titulo': 'Nuevo perfil', 'perfis.salvo': 'Perfil guardado.',
  'cap.modulo.dashboard': 'Panel', 'cap.modulo.acesso': 'Acceso',
  'cap.dashboard.ver': 'Ver el panel',
  'cap.acesso.usuario.listar': 'Listar usuarios', 'cap.acesso.usuario.gerenciar': 'Crear y editar usuarios',
  'cap.acesso.perfil.listar': 'Listar perfiles', 'cap.acesso.perfil.gerenciar': 'Crear y editar perfiles',
  'cap.acesso.empresa.editar': 'Editar datos de la empresa',
  'auth.campos_obrigatorios': 'Completa empresa, correo y contraseña.',
  'auth.credenciais_invalidas': 'Correo o contraseña incorrectos.', 'auth.sem_empresas': 'Ninguna empresa activa para acceder.',
  'auth.empresa_invalida': 'Empresa no encontrada o inactiva.',
  'auth.token_ausente': 'Sesión no encontrada. Inicia sesión de nuevo.',
  'auth.token_invalido': 'Sesión expirada. Inicia sesión de nuevo.',
  'auth.muitas_tentativas': 'Demasiados intentos de inicio de sesión. Espera unos minutos e inténtalo de nuevo.',
  'auth.sem_permissao': 'No tienes permiso para esta acción.',
  'usuario.nome_invalido': 'Ingresa un nombre válido.', 'usuario.email_invalido': 'Correo inválido.',
  'usuario.email_em_uso': 'Ya existe un usuario con este correo.', 'usuario.senha_curta': 'La contraseña debe tener al menos 6 caracteres.',
  'senha.trocar': 'Cambiar contraseña', 'senha.atual': 'Contraseña actual', 'senha.nova': 'Nueva contraseña', 'senha.confirmar': 'Confirmar nueva contraseña',
  'senha.ok': 'Contraseña cambiada con éxito.', 'senha.divergem': 'La confirmación no coincide con la nueva contraseña.',
  'auth.senha_atual_invalida': 'Contraseña actual incorrecta.',
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
  'empresas.provisionar': 'Criar empresa',
  'empresas.provisionar_hint': 'Cria uma nova empresa com seu banco isolado, perfil Administrador e o primeiro usuário.',
  'empresas.codigo_hint': 'Só letras e números, sem espaços. Usado no login.',
  'empresas.criada': 'Empresa criada com sucesso.',
  'empresas.acoes': 'Ações', 'empresas.editar': 'Editar', 'empresas.excluir': 'Excluir',
  'empresas.editar_titulo': 'Editar empresa', 'empresas.ativa': 'Empresa ativa',
  'empresas.admin_nova_senha': 'Nova senha', 'empresas.admin_senha_ph': 'Deixe em branco para manter',
  'empresas.salva': 'Empresa atualizada com sucesso.', 'empresas.excluida': 'Empresa excluída.',
  'empresas.excluir_confirma': 'Excluir a empresa "{nome}"? Isso apaga todos os dados dela (sem volta).',
  'empresa.codigo_invalido': 'Código inválido (use letras e números, sem espaços).',
  'empresa.codigo_em_uso': 'Já existe uma empresa com este código.', 'empresa.nome_invalido': 'Informe uma razão social válida.',
});
Object.assign(en, {
  'menu.superadmin': 'Super-admin', 'menu.empresas': 'Companies',
  'cap.modulo.superadmin': 'Super-admin', 'cap.superadmin.empresa.provisionar': 'Provision companies',
  'empresas.titulo': 'Companies', 'empresas.codigo': 'Code', 'empresas.nome': 'Legal name',
  'empresas.fantasia': 'Trade name', 'empresas.admin': 'Initial administrator',
  'empresas.provisionar': 'Create company',
  'empresas.provisionar_hint': 'Creates a new company with its own isolated database, an Administrator role and the first user.',
  'empresas.codigo_hint': 'Letters and numbers only, no spaces. Used at login.',
  'empresas.criada': 'Company created successfully.',
  'empresas.acoes': 'Actions', 'empresas.editar': 'Edit', 'empresas.excluir': 'Delete',
  'empresas.editar_titulo': 'Edit company', 'empresas.ativa': 'Active company',
  'empresas.admin_nova_senha': 'New password', 'empresas.admin_senha_ph': 'Leave blank to keep',
  'empresas.salva': 'Company updated successfully.', 'empresas.excluida': 'Company deleted.',
  'empresas.excluir_confirma': 'Delete company "{nome}"? This erases all of its data (cannot be undone).',
  'empresa.codigo_invalido': 'Invalid code (use letters and numbers, no spaces).',
  'empresa.codigo_em_uso': 'A company with this code already exists.', 'empresa.nome_invalido': 'Enter a valid legal name.',
});
Object.assign(es, {
  'menu.superadmin': 'Super-admin', 'menu.empresas': 'Empresas',
  'cap.modulo.superadmin': 'Super-admin', 'cap.superadmin.empresa.provisionar': 'Aprovisionar empresas',
  'empresas.titulo': 'Empresas', 'empresas.codigo': 'Código', 'empresas.nome': 'Razón social',
  'empresas.fantasia': 'Nombre comercial', 'empresas.admin': 'Administrador inicial',
  'empresas.provisionar': 'Crear empresa',
  'empresas.provisionar_hint': 'Crea una nueva empresa con su base de datos aislada, un perfil Administrador y el primer usuario.',
  'empresas.codigo_hint': 'Solo letras y números, sin espacios. Se usa en el inicio de sesión.',
  'empresas.criada': 'Empresa creada con éxito.',
  'empresas.acoes': 'Acciones', 'empresas.editar': 'Editar', 'empresas.excluir': 'Eliminar',
  'empresas.editar_titulo': 'Editar empresa', 'empresas.ativa': 'Empresa activa',
  'empresas.admin_nova_senha': 'Nueva contraseña', 'empresas.admin_senha_ph': 'Déjalo en blanco para mantener',
  'empresas.salva': 'Empresa actualizada con éxito.', 'empresas.excluida': 'Empresa eliminada.',
  'empresas.excluir_confirma': '¿Eliminar la empresa "{nome}"? Esto borra todos sus datos (sin retorno).',
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
  'produtos.buscar': 'Buscar produto', 'produtos.todas_cat': 'Todas categorias',
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
  'produtos.buscar': 'Search product', 'produtos.todas_cat': 'All categories',
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
  'produtos.buscar': 'Buscar producto', 'produtos.todas_cat': 'Todas las categorías',
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
  'clientes.titulo': 'Clientes comerciais', 'clientes.novo': 'Novo cliente', 'clientes.nome': 'Nome', 'clientes.col_cliente': 'Cliente',
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
  'clientes.titulo': 'Commercial customers', 'clientes.novo': 'New customer', 'clientes.nome': 'Name', 'clientes.col_cliente': 'Customer',
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
  'clientes.titulo': 'Clientes comerciales', 'clientes.novo': 'Nuevo cliente', 'clientes.nome': 'Nombre', 'clientes.col_cliente': 'Cliente',
  'clientes.tipo': 'Tipo de persona', 'clientes.pj': 'Persona jurídica', 'clientes.pf': 'Persona física',
  'clientes.nome_completo': 'Nombre completo', 'clientes.limite': 'Límite de crédito',
  'fornecedores.titulo': 'Proveedores', 'fornecedores.novo': 'Nuevo proveedor',
  'vendedores.titulo': 'Vendedores', 'vendedores.novo': 'Nuevo vendedor', 'vendedores.comissao': 'Comisión (%)',
  'pessoa.documento_invalido': 'Ingresa un CPF/CNPJ válido.', 'pessoa.limite_invalido': 'Límite de crédito inválido.',
  'vendedor.comissao_invalida': 'Comisión inválida (0 a 100).',
});

// --- Fidelidade Clientes (enderecos, busca CNPJ/CEP) ---
Object.assign(pt, {
  'clientes.cidade': 'Cidade', 'clientes.em_aberto': 'Em aberto', 'clientes.buscar': 'Buscar', 'clientes.buscar_cnpj': 'Buscar CNPJ', 'clientes.enderecos': 'Endereços',
  'clientes.add_endereco': 'Adicionar endereço', 'clientes.sem_endereco': 'Nenhum endereço. O favorito será usado como padrão no pedido.',
  'clientes.favorito': 'Favorito', 'clientes.remover': 'Remover',
  'clientes.logradouro': 'Logradouro', 'clientes.numero': 'Número', 'clientes.bairro': 'Bairro', 'clientes.complemento': 'Complemento',
  'clientes.cnpj_incompleto': 'Informe um CNPJ completo para buscar.', 'clientes.cnpj_nao_encontrado': 'CNPJ não encontrado.',
});
Object.assign(en, {
  'clientes.cidade': 'City', 'clientes.em_aberto': 'Open', 'clientes.buscar': 'Look up', 'clientes.buscar_cnpj': 'Look up', 'clientes.enderecos': 'Addresses',
  'clientes.add_endereco': 'Add address', 'clientes.sem_endereco': 'No address. The favorite is used as default in orders.',
  'clientes.favorito': 'Favorite', 'clientes.remover': 'Remove',
  'clientes.logradouro': 'Street', 'clientes.numero': 'Number', 'clientes.bairro': 'District', 'clientes.complemento': 'Complement',
  'clientes.cnpj_incompleto': 'Enter a full tax ID to look up.', 'clientes.cnpj_nao_encontrado': 'Tax ID not found.',
});
Object.assign(es, {
  'clientes.cidade': 'Ciudad', 'clientes.em_aberto': 'Pendiente', 'clientes.buscar': 'Buscar', 'clientes.buscar_cnpj': 'Buscar CNPJ', 'clientes.enderecos': 'Direcciones',
  'clientes.add_endereco': 'Agregar dirección', 'clientes.sem_endereco': 'Sin dirección. La favorita se usa por defecto en el pedido.',
  'clientes.favorito': 'Favorita', 'clientes.remover': 'Quitar',
  'clientes.logradouro': 'Calle', 'clientes.numero': 'Número', 'clientes.bairro': 'Barrio', 'clientes.complemento': 'Complemento',
  'clientes.cnpj_incompleto': 'Ingresa un CNPJ completo para buscar.', 'clientes.cnpj_nao_encontrado': 'CNPJ no encontrado.',
});

// --- Fidelidade Produto/Fornecedor/Vendedor ---
Object.assign(pt, {
  'produtos.local': 'Localização', 'produtos.local_ph': 'Depósito / prateleira', 'produtos.anvisa': 'Registro ANVISA',
  'produtos.nota_preco': 'O preço de venda é definido em Comercial › Tabela de preço (será criado na Fase 3). Lote e validade pertencem à entrada de estoque.',
  'vendedores.regiao': 'Região / carteira', 'vendedores.vendas_mes': 'Vendas (mês)', 'vendedores.regiao_ph': 'Ex.: SP Capital, Interior SP',
  'vendedores.meta': 'Meta mensal (R$)', 'vendedores.regra_geral': 'Seguir regra geral de comissão (ignora o % individual)',
  'vendedores.regra_geral_curta': 'Regra geral', 'vendedor.meta_invalida': 'Meta mensal inválida.',
});
Object.assign(en, {
  'produtos.local': 'Location', 'produtos.local_ph': 'Warehouse / shelf', 'produtos.anvisa': 'ANVISA registration',
  'produtos.nota_preco': 'Sale price is set in Sales › Price table (coming in Phase 3). Batch and expiry belong to stock entry.',
  'vendedores.regiao': 'Region / territory', 'vendedores.vendas_mes': 'Sales (month)', 'vendedores.regiao_ph': 'e.g., SP Capital, Interior SP',
  'vendedores.meta': 'Monthly target (R$)', 'vendedores.regra_geral': 'Follow general commission rule (ignores individual %)',
  'vendedores.regra_geral_curta': 'General rule', 'vendedor.meta_invalida': 'Invalid monthly target.',
});
Object.assign(es, {
  'produtos.local': 'Ubicación', 'produtos.local_ph': 'Depósito / estante', 'produtos.anvisa': 'Registro ANVISA',
  'produtos.nota_preco': 'El precio de venta se define en Comercial › Tabla de precios (Fase 3). Lote y validez pertenecen a la entrada de stock.',
  'vendedores.regiao': 'Región / cartera', 'vendedores.vendas_mes': 'Ventas (mes)', 'vendedores.regiao_ph': 'Ej.: SP Capital, Interior SP',
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
  'precos.sub_full': 'Preço base do produto (fixo + campanha/período) e preços negociados por cliente',
  'precos.tabela': 'Tabela', 'precos.salvar_tabela': 'Salvar tabela', 'precos.salvo_tabela': 'Tabela salva.',
  'precos.preco_fixo': 'Preço fixo (R$)', 'precos.camp_vigente': 'Campanha vigente', 'precos.usa_fixo': '— (usa preço fixo)',
});
Object.assign(en, {
  'menu.comercial': 'Sales', 'menu.precos': 'Price table',
  'cap.modulo.comercial': 'Sales',
  'cap.comercial.preco.listar': 'View price table', 'cap.comercial.preco.gerenciar': 'Edit prices',
  'precos.titulo': 'Price table', 'precos.sub': 'Base sale price per product (used in orders).',
  'precos.produto': 'Product', 'precos.preco_base': 'Base price (R$)', 'precos.sem_produtos': 'Create products first.',
  'precos.sub_full': 'Product base price (fixed + campaign/period) and per-customer negotiated prices',
  'precos.tabela': 'Table', 'precos.salvar_tabela': 'Save table', 'precos.salvo_tabela': 'Table saved.',
  'precos.preco_fixo': 'Fixed price (R$)', 'precos.camp_vigente': 'Active campaign', 'precos.usa_fixo': '— (uses fixed price)',
});
Object.assign(es, {
  'menu.comercial': 'Comercial', 'menu.precos': 'Tabla de precios',
  'cap.modulo.comercial': 'Comercial',
  'cap.comercial.preco.listar': 'Ver tabla de precios', 'cap.comercial.preco.gerenciar': 'Editar precios',
  'precos.titulo': 'Tabla de precios', 'precos.sub': 'Precio base de venta por producto (usado en los pedidos).',
  'precos.produto': 'Producto', 'precos.preco_base': 'Precio base (R$)', 'precos.sem_produtos': 'Crea productos primero.',
  'precos.sub_full': 'Precio base del producto (fijo + campaña/período) y precios negociados por cliente',
  'precos.tabela': 'Tabla', 'precos.salvar_tabela': 'Guardar tabla', 'precos.salvo_tabela': 'Tabla guardada.',
  'precos.preco_fixo': 'Precio fijo (R$)', 'precos.camp_vigente': 'Campaña vigente', 'precos.usa_fixo': '— (usa precio fijo)',
});

// --- Fase 3B: Pedidos ---
Object.assign(pt, {
  'menu.pedidos': 'Pedidos', 'menu.novo_pedido': 'Novo pedido', 'menu.crm': 'CRM', 'menu.metas': 'Metas',
  'cap.comercial.pedido.listar': 'Listar pedidos', 'cap.comercial.pedido.criar': 'Criar pedidos', 'cap.comercial.pedido.gerenciar': 'Gerenciar status dos pedidos',
  'cap.comercial.pedido.separar': 'Separar (baixa de estoque)', 'cap.comercial.pedido.expedir': 'Expedir / entregar', 'cap.comercial.pedido.cancelar': 'Cancelar pedido',
  'cap.comercial.crm.ver': 'Ver CRM', 'cap.comercial.crm.gerenciar': 'Gerenciar CRM (oportunidades e interações)',
  'cap.comercial.meta.ver': 'Ver metas', 'cap.comercial.meta.gerenciar': 'Definir metas',
  'metas.crumb': 'Comercial / Metas', 'metas.titulo': 'Metas', 'metas.sub': 'Metas de faturamento por mês — o ano é a soma dos 12 meses',
  'metas.ano': 'Ano', 'metas.total_ano': 'Total do ano', 'metas.diluir': 'Diluir por dia',
  'metas.dia_util': 'Dia útil seg–sex (R$)', 'metas.sabado': 'Sábado (R$)',
  'metas.dias_uteis': 'dias úteis', 'metas.sabados': 'sáb', 'metas.domingo_sem': 'domingo sem meta',
  'metas.aplicar_diluicao': 'Aplicar diluição ao mês',
  'metas.salvar': 'Salvar metas', 'metas.salvo': 'Metas salvas', 'metas.nota': 'A meta de cada mês aparece como barra vermelha no gráfico do dashboard; no painel da TV, a meta do dia/semana/mês vem da diluição (dia útil e sábado).',
  'meta.valor_invalido': 'Valor de meta inválido (informe um número ≥ 0).', 'meta.ano_invalido': 'Ano inválido.', 'meta.mes_invalido': 'Mês inválido.',
  'cap.modulo.painel': 'Painéis (TV)', 'cap.painel.tv_comercial': 'Painel TV — Comercial', 'cap.painel.tv_expedicao': 'Painel TV — Expedição',
  'pedidos.titulo': 'Pedidos - Comercial', 'pedidos.novo': 'Novo pedido', 'pedidos.numero': 'Número', 'pedidos.data': 'Data',
  'pedidos.cliente': 'Cliente', 'pedidos.vendedor': 'Vendedor', 'pedidos.status': 'Status', 'pedidos.total': 'Total',
  'pedidos.vendedor_travado': 'Fixo no seu usuário — você só inclui pedido para si.', 'pedidos.vendedor_voce': 'Você',
  'pedidos.frete_custo': 'Frete (custo)', 'pedidos.cliente_paga': 'Cliente paga (campanha)', 'pedidos.frete_absorvido': 'Frete absorvido pela empresa',
  'pedidos.forma_pgto': 'Forma de pagamento', 'pedidos.endereco': 'Endereço de entrega', 'pedidos.endereco_ph': 'Preenchido pelo favorito do cliente (editável)',
  'pedidos.itens': 'Itens', 'pedidos.add_item': 'Adicionar item', 'pedidos.escolha_produto': 'Escolha o produto',
  'pedidos.subtotal': 'Subtotal', 'pedidos.frete': 'Frete', 'pedidos.obs': 'Observação', 'pedidos.salvar': 'Criar pedido',
  'pedidos.voltar': 'Voltar', 'pedidos.qtd': 'Qtd', 'pedidos.preco_unit': 'Preço unit.',
  'status.orcamento': 'Orçamento', 'status.aguardando_pagamento': 'Aguardando pagamento', 'status.aprovado': 'Aguardando separação',
  'status.separacao': 'Em separação', 'status.expedido': 'Expedido', 'status.entregue': 'Entregue', 'status.cancelado': 'Cancelado',
  'pedidos.acao.aguardando_pagamento': 'Confirmar pedido', 'pedidos.acao.aprovado': 'Aprovar pagamento',
  'pedidos.acao.separacao': 'Enviar p/ separação', 'pedidos.acao.expedido': 'Marcar expedido', 'pedidos.acao.entregue': 'Marcar entregue',
  'pedidos.acao.cancelado': 'Cancelar pedido',
  'pedido.nao_encontrado': 'Pedido não encontrado.', 'pedido.cliente_obrigatorio': 'Selecione um cliente.',
  'pedido.sem_itens': 'Adicione ao menos um item.', 'pedido.produto_invalido': 'Produto inválido no pedido.',
  'pedido.qtd_invalida': 'Quantidade inválida.', 'pedido.transicao_invalida': 'Mudança de status não permitida.',
  'pedido.cancelar_baixa_antes': 'Há título já baixado (pago) deste pedido. Cancele a baixa no Financeiro antes de cancelar o pedido.',
  'pedido.cancelar': 'Cancelar pedido', 'pedido.cancelar_confirma': 'Cancelar este pedido? O estoque e as etiquetas voltam, e os títulos do pedido são cancelados.', 'pedido.cancelado_ok': 'Pedido cancelado.',
  'toastpix.titulo': 'Pendência de baixa', 'toastpix.corpo': 'O pedido <b>{n}</b> ({c}) gerou um título de <b>{v}</b> via Pix que precisa ser baixado no financeiro.',
  'pedido.limite_estourado': 'Limite de crédito do cliente excedido.',
});
Object.assign(en, {
  'menu.pedidos': 'Orders', 'menu.novo_pedido': 'New order', 'menu.crm': 'CRM', 'menu.metas': 'Targets',
  'cap.comercial.meta.ver': 'View targets', 'cap.comercial.meta.gerenciar': 'Set targets',
  'metas.crumb': 'Sales / Targets', 'metas.titulo': 'Targets', 'metas.sub': 'Monthly revenue targets — the year is the sum of the 12 months',
  'metas.ano': 'Year', 'metas.total_ano': 'Year total', 'metas.diluir': 'Break down by day',
  'metas.dia_util': 'Weekday Mon–Fri (R$)', 'metas.sabado': 'Saturday (R$)',
  'metas.dias_uteis': 'weekdays', 'metas.sabados': 'Sat', 'metas.domingo_sem': 'Sunday no target',
  'metas.aplicar_diluicao': 'Apply breakdown to month',
  'metas.salvar': 'Save targets', 'metas.salvo': 'Targets saved', 'metas.nota': 'Each month target shows as a red bar on the dashboard chart; on the TV panel, the day/week/month target comes from the breakdown (weekday and Saturday).',
  'meta.valor_invalido': 'Invalid target value (enter a number ≥ 0).', 'meta.ano_invalido': 'Invalid year.', 'meta.mes_invalido': 'Invalid month.',
  'cap.comercial.pedido.listar': 'List orders', 'cap.comercial.pedido.criar': 'Create orders', 'cap.comercial.pedido.gerenciar': 'Manage order status',
  'cap.comercial.pedido.separar': 'Pick (stock write-off)', 'cap.comercial.pedido.expedir': 'Ship / deliver', 'cap.comercial.pedido.cancelar': 'Cancel order',
  'cap.comercial.crm.ver': 'View CRM', 'cap.comercial.crm.gerenciar': 'Manage CRM (opportunities and interactions)',
  'cap.modulo.painel': 'Panels (TV)', 'cap.painel.tv_comercial': 'TV Panel — Sales', 'cap.painel.tv_expedicao': 'TV Panel — Shipping',
  'pedidos.titulo': 'Orders - Sales', 'pedidos.novo': 'New order', 'pedidos.numero': 'Number', 'pedidos.data': 'Date',
  'pedidos.cliente': 'Customer', 'pedidos.vendedor': 'Sales rep', 'pedidos.status': 'Status', 'pedidos.total': 'Total',
  'pedidos.vendedor_travado': 'Locked to your user — you can only create orders for yourself.', 'pedidos.vendedor_voce': 'You',
  'pedidos.frete_custo': 'Freight (cost)', 'pedidos.cliente_paga': 'Customer pays (campaign)', 'pedidos.frete_absorvido': 'Freight absorbed by company',
  'pedidos.forma_pgto': 'Payment method', 'pedidos.endereco': 'Delivery address', 'pedidos.endereco_ph': 'Filled from customer favorite (editable)',
  'pedidos.itens': 'Items', 'pedidos.add_item': 'Add item', 'pedidos.escolha_produto': 'Choose product',
  'pedidos.subtotal': 'Subtotal', 'pedidos.frete': 'Shipping', 'pedidos.obs': 'Notes', 'pedidos.salvar': 'Create order',
  'pedidos.voltar': 'Back', 'pedidos.qtd': 'Qty', 'pedidos.preco_unit': 'Unit price',
  'status.orcamento': 'Quote', 'status.aguardando_pagamento': 'Awaiting payment', 'status.aprovado': 'Awaiting picking',
  'status.separacao': 'Picking', 'status.expedido': 'Shipped', 'status.entregue': 'Delivered', 'status.cancelado': 'Canceled',
  'pedidos.acao.aguardando_pagamento': 'Confirm order', 'pedidos.acao.aprovado': 'Approve payment',
  'pedidos.acao.separacao': 'Send to picking', 'pedidos.acao.expedido': 'Mark shipped', 'pedidos.acao.entregue': 'Mark delivered',
  'pedidos.acao.cancelado': 'Cancel order',
  'pedido.nao_encontrado': 'Order not found.', 'pedido.cliente_obrigatorio': 'Select a customer.',
  'pedido.sem_itens': 'Add at least one item.', 'pedido.produto_invalido': 'Invalid product in order.',
  'pedido.qtd_invalida': 'Invalid quantity.', 'pedido.transicao_invalida': 'Status change not allowed.',
  'pedido.cancelar_baixa_antes': 'This order has a settled (paid) entry. Cancel the settlement in Finance before cancelling the order.',
  'pedido.cancelar': 'Cancel order', 'pedido.cancelar_confirma': 'Cancel this order? Stock and labels are returned, and the order entries are cancelled.', 'pedido.cancelado_ok': 'Order cancelled.',
  'toastpix.titulo': 'Settlement pending', 'toastpix.corpo': 'Order <b>{n}</b> ({c}) generated a <b>{v}</b> entry via Pix that needs to be settled in Finance.',
  'pedido.limite_estourado': "Customer's credit limit exceeded.",
});
Object.assign(es, {
  'menu.pedidos': 'Pedidos', 'menu.novo_pedido': 'Nuevo pedido', 'menu.crm': 'CRM', 'menu.metas': 'Metas',
  'cap.comercial.meta.ver': 'Ver metas', 'cap.comercial.meta.gerenciar': 'Definir metas',
  'metas.crumb': 'Comercial / Metas', 'metas.titulo': 'Metas', 'metas.sub': 'Metas de facturación por mes — el año es la suma de los 12 meses',
  'metas.ano': 'Año', 'metas.total_ano': 'Total del año', 'metas.diluir': 'Diluir por día',
  'metas.dia_util': 'Día hábil lun–vie (R$)', 'metas.sabado': 'Sábado (R$)',
  'metas.dias_uteis': 'días hábiles', 'metas.sabados': 'sáb', 'metas.domingo_sem': 'domingo sin meta',
  'metas.aplicar_diluicao': 'Aplicar dilución al mes',
  'metas.salvar': 'Guardar metas', 'metas.salvo': 'Metas guardadas', 'metas.nota': 'La meta de cada mes aparece como barra roja en el gráfico del panel; en el panel de TV, la meta del día/semana/mes viene de la dilución (día hábil y sábado).',
  'meta.valor_invalido': 'Valor de meta inválido (ingrese un número ≥ 0).', 'meta.ano_invalido': 'Año inválido.', 'meta.mes_invalido': 'Mes inválido.',
  'cap.comercial.pedido.listar': 'Listar pedidos', 'cap.comercial.pedido.criar': 'Crear pedidos', 'cap.comercial.pedido.gerenciar': 'Gestionar estado de pedidos',
  'cap.comercial.pedido.separar': 'Separar (baja de stock)', 'cap.comercial.pedido.expedir': 'Expedir / entregar', 'cap.comercial.pedido.cancelar': 'Cancelar pedido',
  'cap.comercial.crm.ver': 'Ver CRM', 'cap.comercial.crm.gerenciar': 'Gestionar CRM (oportunidades e interacciones)',
  'cap.modulo.painel': 'Paneles (TV)', 'cap.painel.tv_comercial': 'Panel TV — Comercial', 'cap.painel.tv_expedicao': 'Panel TV — Expedición',
  'pedidos.titulo': 'Pedidos - Comercial', 'pedidos.novo': 'Nuevo pedido', 'pedidos.numero': 'Número', 'pedidos.data': 'Fecha',
  'pedidos.cliente': 'Cliente', 'pedidos.vendedor': 'Vendedor', 'pedidos.status': 'Estado', 'pedidos.total': 'Total',
  'pedidos.vendedor_travado': 'Fijo en tu usuario — solo creas pedidos para ti.', 'pedidos.vendedor_voce': 'Tú',
  'pedidos.frete_custo': 'Flete (costo)', 'pedidos.cliente_paga': 'Cliente paga (campaña)', 'pedidos.frete_absorvido': 'Flete absorbido por la empresa',
  'pedidos.forma_pgto': 'Forma de pago', 'pedidos.endereco': 'Dirección de entrega', 'pedidos.endereco_ph': 'Rellenado por la favorita del cliente (editable)',
  'pedidos.itens': 'Ítems', 'pedidos.add_item': 'Agregar ítem', 'pedidos.escolha_produto': 'Elige el producto',
  'pedidos.subtotal': 'Subtotal', 'pedidos.frete': 'Flete', 'pedidos.obs': 'Observación', 'pedidos.salvar': 'Crear pedido',
  'pedidos.voltar': 'Volver', 'pedidos.qtd': 'Cant.', 'pedidos.preco_unit': 'Precio unit.',
  'status.orcamento': 'Presupuesto', 'status.aguardando_pagamento': 'Esperando pago', 'status.aprovado': 'Esperando preparación',
  'status.separacao': 'En preparación', 'status.expedido': 'Expedido', 'status.entregue': 'Entregado', 'status.cancelado': 'Cancelado',
  'pedidos.acao.aguardando_pagamento': 'Confirmar pedido', 'pedidos.acao.aprovado': 'Aprobar pago',
  'pedidos.acao.separacao': 'Enviar a preparación', 'pedidos.acao.expedido': 'Marcar expedido', 'pedidos.acao.entregue': 'Marcar entregado',
  'pedidos.acao.cancelado': 'Cancelar pedido',
  'pedido.nao_encontrado': 'Pedido no encontrado.', 'pedido.cliente_obrigatorio': 'Selecciona un cliente.',
  'pedido.sem_itens': 'Agrega al menos un ítem.', 'pedido.produto_invalido': 'Producto inválido en el pedido.',
  'pedido.qtd_invalida': 'Cantidad inválida.', 'pedido.transicao_invalida': 'Cambio de estado no permitido.',
  'pedido.cancelar_baixa_antes': 'Hay un título ya pagado de este pedido. Cancele la baja en Finanzas antes de cancelar el pedido.',
  'pedido.cancelar': 'Cancelar pedido', 'pedido.cancelar_confirma': '¿Cancelar este pedido? El stock y las etiquetas vuelven, y los títulos del pedido se cancelan.', 'pedido.cancelado_ok': 'Pedido cancelado.',
  'toastpix.titulo': 'Pendiente de baja', 'toastpix.corpo': 'El pedido <b>{n}</b> ({c}) generó un título de <b>{v}</b> vía Pix que debe darse de baja en finanzas.',
  'pedido.limite_estourado': 'Límite de crédito del cliente excedido.',
});

// --- Kanban de pedidos ---
Object.assign(pt, { 'pedidos.kanban_sub': 'Visão Kanban (somente leitura — movimentação fica em Estoque/Expedição)', 'pedidos.cancelados_ocultos': 'pedido(s) cancelado(s) não exibidos no quadro.' });
Object.assign(en, { 'pedidos.kanban_sub': 'Kanban view (read-only — movement happens in Stock/Shipping)', 'pedidos.cancelados_ocultos': 'canceled order(s) not shown on the board.' });
Object.assign(es, { 'pedidos.kanban_sub': 'Vista Kanban (solo lectura — el movimiento ocurre en Stock/Expedición)', 'pedidos.cancelados_ocultos': 'pedido(s) cancelado(s) no mostrados en el tablero.' });

// --- Fase 4A: Estoque ---
Object.assign(pt, {
  'menu.estoque_exp': 'Estoque/Expedição', 'menu.posicao': 'Posição de estoque', 'menu.entrada': 'Entrada de estoque', 'menu.consultar_etiqueta': 'Consultar etiqueta',
  'etqc.crumb': 'Estoque / Consultar etiqueta', 'etqc.titulo': 'Consultar etiqueta', 'etqc.sub': 'Bipe ou digite o código para ver o produto, lote, validade, marca e origem',
  'etqc.codigo': 'Código da etiqueta', 'etqc.codigo_ph': 'Bipe ou digite o código', 'etqc.consultar': 'Consultar', 'etqc.nao_encontrada': 'Etiqueta não encontrada.', 'etqc.saldo_lote': 'Saldo do lote', 'etqc.marca': 'Marca',
  'cap.modulo.estoque': 'Estoque', 'cap.estoque.saldo.ver': 'Ver posição de estoque', 'cap.estoque.entrada.criar': 'Registrar entrada de estoque',
  'estoque.titulo': 'Posição de estoque', 'estoque.saldo': 'Saldo', 'estoque.lote': 'Lote', 'estoque.validade': 'Validade',
  'estoque.baixo': 'Estoque baixo', 'estoque.ok': 'Em dia',
  'estoque.kpi_skus': 'SKUs ativos', 'estoque.kpi_baixo': 'Estoque baixo', 'estoque.kpi_validade90': 'Validade < 90 dias', 'estoque.kpi_valor': 'Valor em estoque',
  'estoque.buscar': 'Buscar por produto', 'estoque.valor': 'Valor', 'estoque.f_validade': 'Validade próxima', 'estoque.sit_validade': 'Validade próxima',
  'estoque.btn_entrada': 'Entrada', 'estoque.nota_lotes': 'Cada linha é um produto. Duplo-clique para ver os lotes que compõem o saldo.',
  'estoque.de': 'de', 'estoque.item': 'item(ns)',
  'entrada.titulo': 'Entrada de estoque', 'entrada.sub': 'Informe lote e validade e bipe as etiquetas já afixadas nos produtos. A quantidade é o número de códigos lidos.',
  'entrada.lote_ph': 'Ex.: L-2026-001', 'entrada.quantidade': 'Quantidade', 'entrada.custo': 'Custo unitário (R$)',
  'entrada.fornecedor': 'Fornecedor (opcional)', 'entrada.fornecedor_ph': 'Nome do fornecedor', 'entrada.nf': 'Nº da NF (opcional)', 'entrada.nf_ph': 'Ex.: 12345', 'entrada.emissao': 'Emissão (opcional)',
  'entrada.confirmar': 'Confirmar entrada', 'entrada.ok': 'Entrada registrada no estoque.',
  'estoque.qtd_invalida': 'Quantidade inválida.', 'estoque.custo_invalido': 'Custo inválido.',
});
Object.assign(en, {
  'menu.estoque_exp': 'Inventory/Shipping', 'menu.posicao': 'Stock position', 'menu.entrada': 'Stock entry', 'menu.consultar_etiqueta': 'Look up label',
  'etqc.crumb': 'Inventory / Look up label', 'etqc.titulo': 'Look up label', 'etqc.sub': 'Scan or type the code to see product, lot, expiry, brand and origin',
  'etqc.codigo': 'Label code', 'etqc.codigo_ph': 'Scan or type the code', 'etqc.consultar': 'Look up', 'etqc.nao_encontrada': 'Label not found.', 'etqc.saldo_lote': 'Lot balance', 'etqc.marca': 'Brand',
  'cap.modulo.estoque': 'Inventory', 'cap.estoque.saldo.ver': 'View stock position', 'cap.estoque.entrada.criar': 'Register stock entry',
  'estoque.titulo': 'Stock position', 'estoque.saldo': 'Balance', 'estoque.lote': 'Batch', 'estoque.validade': 'Expiry',
  'estoque.baixo': 'Low stock', 'estoque.ok': 'OK',
  'estoque.kpi_skus': 'Active SKUs', 'estoque.kpi_baixo': 'Low stock', 'estoque.kpi_validade90': 'Expiry < 90 days', 'estoque.kpi_valor': 'Stock value',
  'estoque.buscar': 'Search by product', 'estoque.valor': 'Value', 'estoque.f_validade': 'Near expiry', 'estoque.sit_validade': 'Near expiry',
  'estoque.btn_entrada': 'Entry', 'estoque.nota_lotes': 'Each row is a product. Double-click to see the batches that make up the balance.',
  'estoque.de': 'of', 'estoque.item': 'item(s)',
  'entrada.titulo': 'Stock entry', 'entrada.sub': 'Set batch and expiry and scan the labels already on the products. Quantity equals the number of codes read.',
  'entrada.lote_ph': 'e.g., L-2026-001', 'entrada.quantidade': 'Quantity', 'entrada.custo': 'Unit cost (R$)',
  'entrada.fornecedor': 'Supplier (optional)', 'entrada.fornecedor_ph': 'Supplier name', 'entrada.nf': 'Invoice no. (optional)', 'entrada.nf_ph': 'e.g. 12345', 'entrada.emissao': 'Issue date (optional)',
  'entrada.confirmar': 'Confirm entry', 'entrada.ok': 'Stock entry registered.',
  'estoque.qtd_invalida': 'Invalid quantity.', 'estoque.custo_invalido': 'Invalid cost.',
});
Object.assign(es, {
  'menu.estoque_exp': 'Inventario/Expedición', 'menu.posicao': 'Posición de stock', 'menu.entrada': 'Entrada de stock', 'menu.consultar_etiqueta': 'Consultar etiqueta',
  'etqc.crumb': 'Inventario / Consultar etiqueta', 'etqc.titulo': 'Consultar etiqueta', 'etqc.sub': 'Escanee o escriba el código para ver producto, lote, vencimiento, marca y origen',
  'etqc.codigo': 'Código de la etiqueta', 'etqc.codigo_ph': 'Escanee o escriba el código', 'etqc.consultar': 'Consultar', 'etqc.nao_encontrada': 'Etiqueta no encontrada.', 'etqc.saldo_lote': 'Saldo del lote', 'etqc.marca': 'Marca',
  'cap.modulo.estoque': 'Inventario', 'cap.estoque.saldo.ver': 'Ver posición de stock', 'cap.estoque.entrada.criar': 'Registrar entrada de stock',
  'estoque.titulo': 'Posición de stock', 'estoque.saldo': 'Saldo', 'estoque.lote': 'Lote', 'estoque.validade': 'Caducidad',
  'estoque.baixo': 'Stock bajo', 'estoque.ok': 'Al día',
  'estoque.kpi_skus': 'SKUs activos', 'estoque.kpi_baixo': 'Stock bajo', 'estoque.kpi_validade90': 'Caducidad < 90 días', 'estoque.kpi_valor': 'Valor en stock',
  'estoque.buscar': 'Buscar por producto', 'estoque.valor': 'Valor', 'estoque.f_validade': 'Caducidad próxima', 'estoque.sit_validade': 'Caducidad próxima',
  'estoque.btn_entrada': 'Entrada', 'estoque.nota_lotes': 'Cada fila es un producto. Doble clic para ver los lotes que componen el saldo.',
  'estoque.de': 'de', 'estoque.item': 'ítem(s)',
  'entrada.titulo': 'Entrada de stock', 'entrada.sub': 'Indica lote y caducidad y escanea las etiquetas ya pegadas en los productos. La cantidad es el número de códigos leídos.',
  'entrada.lote_ph': 'Ej.: L-2026-001', 'entrada.quantidade': 'Cantidad', 'entrada.custo': 'Costo unitario (R$)',
  'entrada.fornecedor': 'Proveedor (opcional)', 'entrada.fornecedor_ph': 'Nombre del proveedor', 'entrada.nf': 'Nº de factura (opcional)', 'entrada.nf_ph': 'Ej.: 12345', 'entrada.emissao': 'Emisión (opcional)',
  'entrada.confirmar': 'Confirmar entrada', 'entrada.ok': 'Entrada registrada en el stock.',
  'estoque.qtd_invalida': 'Cantidad inválida.', 'estoque.custo_invalido': 'Costo inválido.',
});

// --- Fase 4B: Expedição + estoque insuficiente ---
Object.assign(pt, {
  'menu.expedicao': 'Pedidos (Kanban)',
  'expedicao.titulo': 'Pedidos - Estoque/Expedição', 'expedicao.sub': 'Arraste os cards para avançar o status. Cartão pula "Aguardando pagamento"; Pix/Boleto precisa de confirmação financeira para liberar.',
  'expedicao.col_aguard_sep': 'Aguardando separação',
  'estoque.insuficiente': 'Estoque insuficiente para separar o pedido.',
});
Object.assign(en, {
  'menu.expedicao': 'Orders (Kanban)',
  'expedicao.titulo': 'Orders - Stock/Shipping', 'expedicao.sub': 'Drag cards to advance the status. Card skips "Awaiting payment"; Pix/Boleto needs financial confirmation to release.',
  'expedicao.col_aguard_sep': 'Awaiting picking',
  'estoque.insuficiente': 'Not enough stock to pick the order.',
});
Object.assign(es, {
  'menu.expedicao': 'Pedidos (Kanban)',
  'expedicao.titulo': 'Pedidos - Stock/Expedición', 'expedicao.sub': 'Arrastra las tarjetas para avanzar el estado. Tarjeta salta "Esperando pago"; Pix/Boleto necesita confirmación financiera para liberar.',
  'expedicao.col_aguard_sep': 'Esperando preparación',
  'estoque.insuficiente': 'Stock insuficiente para preparar el pedido.',
});

// --- Fase 4C: Baixa / perda ---
Object.assign(pt, {
  'menu.baixa': 'Baixa / perda', 'cap.estoque.baixa.criar': 'Registrar baixa/perda de estoque',
  'perda.titulo': 'Baixa / perda de estoque', 'perda.sub': 'Saída sem venda — vencimento, avaria, furto, inventário',
  'perda.motivo': 'Motivo da perda', 'perda.confirmar': 'Confirmar baixa', 'perda.ok': 'Baixa registrada.', 'perda.max': 'Máximo',
  'perda.qtd_baixar': 'Quantidade a baixar', 'perda.data_ocorrencia': 'Data da ocorrência', 'perda.responsavel': 'Responsável',
  'perda.obs': 'Observação (opcional)', 'perda.obs_ph': 'Ex: caixa danificada no transporte interno',
  'perda.produto_ph': 'Digite ou selecione', 'perda.lote_label': 'Lote (saldo · validade)', 'perda.sem_estoque': 'Produto sem estoque',
  'perda.custo_un': 'Custo unitário (do lote)', 'perda.valor_perda': 'Valor da perda', 'perda.saldo_apos': 'Saldo do lote após baixa',
  'perda.nota': 'A baixa reduz o saldo do lote e registra um movimento rastreável no histórico de perdas. Não afeta o financeiro.',
  'estoque.motivo_invalido': 'Informe o motivo da baixa.', 'estoque.lote_invalido': 'Lote não encontrado.',
});
Object.assign(en, {
  'menu.baixa': 'Write-off / loss', 'cap.estoque.baixa.criar': 'Register stock write-off/loss',
  'perda.titulo': 'Stock write-off / loss', 'perda.sub': 'Non-sale exit — expiry, damage, theft, inventory',
  'perda.motivo': 'Loss reason', 'perda.confirmar': 'Confirm write-off', 'perda.ok': 'Write-off registered.', 'perda.max': 'Max',
  'perda.qtd_baixar': 'Quantity to write off', 'perda.data_ocorrencia': 'Occurrence date', 'perda.responsavel': 'Responsible',
  'perda.obs': 'Note (optional)', 'perda.obs_ph': 'E.g. box damaged in internal transport',
  'perda.produto_ph': 'Type or select', 'perda.lote_label': 'Batch (balance · expiry)', 'perda.sem_estoque': 'Product out of stock',
  'perda.custo_un': 'Unit cost (of batch)', 'perda.valor_perda': 'Loss value', 'perda.saldo_apos': 'Batch balance after write-off',
  'perda.nota': 'The write-off reduces the batch balance and records a traceable movement in the loss history. Does not affect finance.',
  'estoque.motivo_invalido': 'Provide a reason.', 'estoque.lote_invalido': 'Batch not found.',
});
Object.assign(es, {
  'menu.baixa': 'Baja / pérdida', 'cap.estoque.baixa.criar': 'Registrar baja/pérdida de stock',
  'perda.titulo': 'Baja / pérdida de stock', 'perda.sub': 'Salida sin venta — caducidad, avería, robo, inventario',
  'perda.motivo': 'Motivo de la pérdida', 'perda.confirmar': 'Confirmar baja', 'perda.ok': 'Baja registrada.', 'perda.max': 'Máximo',
  'perda.qtd_baixar': 'Cantidad a dar de baja', 'perda.data_ocorrencia': 'Fecha del hecho', 'perda.responsavel': 'Responsable',
  'perda.obs': 'Observación (opcional)', 'perda.obs_ph': 'Ej: caja dañada en transporte interno',
  'perda.produto_ph': 'Escribe o selecciona', 'perda.lote_label': 'Lote (saldo · caducidad)', 'perda.sem_estoque': 'Producto sin stock',
  'perda.custo_un': 'Costo unitario (del lote)', 'perda.valor_perda': 'Valor de la pérdida', 'perda.saldo_apos': 'Saldo del lote tras la baja',
  'perda.nota': 'La baja reduce el saldo del lote y registra un movimiento rastreable en el historial de pérdidas. No afecta las finanzas.',
  'estoque.motivo_invalido': 'Indica el motivo.', 'estoque.lote_invalido': 'Lote no encontrado.',
});

// --- Fase 5A: Financeiro ---
Object.assign(pt, {
  'menu.financeiro': 'Financeiro', 'menu.receber': 'Contas a receber', 'menu.pagar': 'Contas a pagar',
  'cap.modulo.financeiro': 'Financeiro', 'cap.modulo.relatorios': 'Relatórios', 'cap.relatorios.ver': 'Acessar Relatórios',
  'cap.relatorios.vendas': 'Relatório de vendas', 'cap.relatorios.pedidos': 'Relatório de pedidos', 'cap.relatorios.produtos': 'Produtos mais vendidos', 'cap.relatorios.categorias': 'Vendas por categoria', 'cap.relatorios.abc': 'Curva ABC', 'cap.relatorios.validade': 'Validade de lotes', 'cap.relatorios.parado': 'Estoque parado', 'cap.relatorios.perdas': 'Perdas de estoque',
  'cap.financeiro.receber.listar': 'Ver contas a receber', 'cap.financeiro.receber.gerenciar': 'Gerenciar contas a receber',
  'cap.financeiro.pagar.listar': 'Ver contas a pagar', 'cap.financeiro.pagar.gerenciar': 'Gerenciar contas a pagar',
  'fin.receber': 'Contas a receber', 'fin.pagar': 'Contas a pagar', 'fin.novo': 'Novo título',
  'fin.novo_lancamento': 'Novo lançamento financeiro', 'fin.salvar_lancamento': 'Salvar lançamento',
  'fin.descricao_ph': 'Descrição do título', 'fin.num_documento': 'Nº do documento', 'fin.num_documento_ph': 'Ex: 12345',
  'fin.fornecedor_favorecido': 'Fornecedor / Favorecido', 'fin.cadastrar_novo': 'cadastrar novo', 'fin.pessoa_ph': 'Digite para buscar...',
  'fin.nota_conta': 'Fornecedor não cadastrado? Use + cadastrar novo. A conta bancária é definida na baixa do título, não no lançamento.',
  'fin.novo_lanc_btn': 'Novo lançamento', 'fin.baixar_sel': 'Baixar selecionados', 'fin.excluir_sel': 'Excluir selecionados',
  'fin.status': 'Status', 'fin.todos_fornecedores': 'Todos fornecedores', 'fin.nome': 'Nome',
  'fin.novo_fornecedor': 'Novo fornecedor', 'fin.novo_cliente': 'Novo cliente', 'fin.cadastrar_cliente_com': 'Cadastrar cliente comercial', 'fin.salvar_cliente': 'Salvar cliente', 'fin.doc_ph': 'CPF / CNPJ',
  'fin.cadastrar_fornecedor': 'Cadastrar fornecedor', 'fin.fantasia_ph': '(opcional — usa 1º nome da razão social)',
  'fin.celular': 'Celular', 'fin.uf': 'Estado (UF)', 'fin.salvar_fornecedor': 'Salvar fornecedor',
  'fin.descricao': 'Descrição', 'fin.cliente': 'Cliente', 'fin.fornecedor': 'Fornecedor', 'fin.vencimento': 'Vencimento',
  'fin.numero': 'Título', 'fin.documento': 'Documento', 'fin.emissao': 'Emissão', 'fin.baixa': 'Baixa', 'fin.vendedor': 'Vendedor',
  'fin.sub': 'Baixa, conta bancária, conciliação · clique nas colunas p/ ordenar, arraste p/ reordenar',
  'fin.favorecido_cliente': 'Favorecido / Cliente', 'fin.boletos_abertos': 'Boletos abertos', 'fin.a_vencer': 'A vencer',
  'fin.todos_clientes': 'Todos clientes', 'fin.todos_favorecidos': 'Todos favorecidos',
  'fin.valor': 'Valor', 'fin.situacao': 'Situação', 'fin.aberto': 'Em aberto', 'fin.vencido': 'Vencido', 'fin.pago': 'Pago',
  'fin.baixar': 'Baixar', 'fin.cancelar_baixa': 'Cancelar baixa', 'fin.confirmar_baixa': 'Confirmar baixa', 'fin.data_baixa': 'Data da baixa', 'fin.composicao': 'Composição do valor', 'fin.valor_original': 'Valor original', 'fin.desconto': 'Desconto (R$)', 'fin.multa': 'Multa (R$)', 'fin.juros': 'Juros (R$)', 'fin.total_baixar': 'Total a baixar', 'fin.conta_obrigatoria': 'Selecione o banco (conta corrente) para baixar via Pix/Boleto.', 'fin.conta_obrig_hint': 'obrigatório p/ Pix/Boleto', 'fin.conta_sem_cadastro': 'Cadastre uma conta corrente (Cadastros › Financeiro › Contas correntes) para baixar via Pix/Boleto.',
  'fin.aberto_receber': 'A receber (em aberto)', 'fin.aberto_pagar': 'A pagar (em aberto)', 'fin.vencidos': 'Vencidos',
  'fin.titulos': 'título(s)', 'fin.do_pedido': 'do pedido',
  'financeiro.descricao_invalida': 'Informe uma descrição.', 'financeiro.valor_invalido': 'Valor inválido.',
  'financeiro.vencimento_invalido': 'Vencimento inválido.', 'financeiro.nao_encontrado': 'Título não encontrado.',
  'financeiro.ja_pago': 'Título já está pago.',
});
Object.assign(en, {
  'menu.financeiro': 'Finance', 'menu.receber': 'Receivables', 'menu.pagar': 'Payables',
  'cap.modulo.financeiro': 'Finance', 'cap.modulo.relatorios': 'Reports', 'cap.relatorios.ver': 'Access Reports',
  'cap.relatorios.vendas': 'Sales report', 'cap.relatorios.pedidos': 'Orders report', 'cap.relatorios.produtos': 'Best-selling products', 'cap.relatorios.categorias': 'Sales by category', 'cap.relatorios.abc': 'ABC curve', 'cap.relatorios.validade': 'Lot expiry', 'cap.relatorios.parado': 'Stalled stock', 'cap.relatorios.perdas': 'Stock losses',
  'cap.financeiro.receber.listar': 'View receivables', 'cap.financeiro.receber.gerenciar': 'Manage receivables',
  'cap.financeiro.pagar.listar': 'View payables', 'cap.financeiro.pagar.gerenciar': 'Manage payables',
  'fin.receber': 'Receivables', 'fin.pagar': 'Payables', 'fin.novo': 'New entry',
  'fin.novo_lancamento': 'New financial entry', 'fin.salvar_lancamento': 'Save entry',
  'fin.descricao_ph': 'Entry description', 'fin.num_documento': 'Document #', 'fin.num_documento_ph': 'Ex: 12345',
  'fin.fornecedor_favorecido': 'Supplier / Payee', 'fin.cadastrar_novo': 'add new', 'fin.pessoa_ph': 'Type to search...',
  'fin.nota_conta': 'Supplier not registered? Use + add new. The bank account is set when settling the entry, not when creating it.',
  'fin.novo_lanc_btn': 'New entry', 'fin.baixar_sel': 'Settle selected', 'fin.excluir_sel': 'Delete selected',
  'fin.status': 'Status', 'fin.todos_fornecedores': 'All suppliers', 'fin.nome': 'Name',
  'fin.novo_fornecedor': 'New supplier', 'fin.novo_cliente': 'New customer', 'fin.cadastrar_cliente_com': 'Add commercial customer', 'fin.salvar_cliente': 'Save customer', 'fin.doc_ph': 'Tax ID',
  'fin.cadastrar_fornecedor': 'Register supplier', 'fin.fantasia_ph': '(optional — uses first word of legal name)',
  'fin.celular': 'Mobile', 'fin.uf': 'State', 'fin.salvar_fornecedor': 'Save supplier',
  'fin.descricao': 'Description', 'fin.cliente': 'Customer', 'fin.fornecedor': 'Supplier', 'fin.vencimento': 'Due date',
  'fin.numero': 'Doc. #', 'fin.documento': 'Document', 'fin.emissao': 'Issued', 'fin.baixa': 'Settled', 'fin.vendedor': 'Salesperson',
  'fin.sub': 'Settlement, bank account, reconciliation · click columns to sort, drag to reorder',
  'fin.favorecido_cliente': 'Payee / Customer', 'fin.boletos_abertos': 'Open invoices', 'fin.a_vencer': 'Upcoming',
  'fin.todos_clientes': 'All customers', 'fin.todos_favorecidos': 'All payees',
  'fin.valor': 'Amount', 'fin.situacao': 'Status', 'fin.aberto': 'Open', 'fin.vencido': 'Overdue', 'fin.pago': 'Paid',
  'fin.baixar': 'Settle', 'fin.cancelar_baixa': 'Undo settlement', 'fin.confirmar_baixa': 'Confirm settlement', 'fin.data_baixa': 'Settlement date', 'fin.composicao': 'Amount composition', 'fin.valor_original': 'Original amount', 'fin.desconto': 'Discount (R$)', 'fin.multa': 'Penalty (R$)', 'fin.juros': 'Interest (R$)', 'fin.total_baixar': 'Total to settle', 'fin.conta_obrigatoria': 'Select the bank account to settle via Pix/Boleto.', 'fin.conta_obrig_hint': 'required for Pix/Boleto', 'fin.conta_sem_cadastro': 'Register a bank account (Records › Finance › Bank accounts) to settle via Pix/Boleto.',
  'fin.aberto_receber': 'Receivable (open)', 'fin.aberto_pagar': 'Payable (open)', 'fin.vencidos': 'Overdue',
  'fin.titulos': 'entry(ies)', 'fin.do_pedido': 'from order',
  'financeiro.descricao_invalida': 'Provide a description.', 'financeiro.valor_invalido': 'Invalid amount.',
  'financeiro.vencimento_invalido': 'Invalid due date.', 'financeiro.nao_encontrado': 'Entry not found.',
  'financeiro.ja_pago': 'Entry already paid.',
});
Object.assign(es, {
  'menu.financeiro': 'Finanzas', 'menu.receber': 'Cuentas a cobrar', 'menu.pagar': 'Cuentas a pagar',
  'cap.modulo.financeiro': 'Finanzas', 'cap.modulo.relatorios': 'Informes', 'cap.relatorios.ver': 'Acceder a Informes',
  'cap.relatorios.vendas': 'Informe de ventas', 'cap.relatorios.pedidos': 'Informe de pedidos', 'cap.relatorios.produtos': 'Productos más vendidos', 'cap.relatorios.categorias': 'Ventas por categoría', 'cap.relatorios.abc': 'Curva ABC', 'cap.relatorios.validade': 'Vencimiento de lotes', 'cap.relatorios.parado': 'Stock parado', 'cap.relatorios.perdas': 'Pérdidas de stock',
  'cap.financeiro.receber.listar': 'Ver cuentas a cobrar', 'cap.financeiro.receber.gerenciar': 'Gestionar cuentas a cobrar',
  'cap.financeiro.pagar.listar': 'Ver cuentas a pagar', 'cap.financeiro.pagar.gerenciar': 'Gestionar cuentas a pagar',
  'fin.receber': 'Cuentas a cobrar', 'fin.pagar': 'Cuentas a pagar', 'fin.novo': 'Nuevo título',
  'fin.novo_lancamento': 'Nuevo asiento financiero', 'fin.salvar_lancamento': 'Guardar asiento',
  'fin.descricao_ph': 'Descripción del título', 'fin.num_documento': 'Nº del documento', 'fin.num_documento_ph': 'Ej: 12345',
  'fin.fornecedor_favorecido': 'Proveedor / Beneficiario', 'fin.cadastrar_novo': 'registrar nuevo', 'fin.pessoa_ph': 'Escribe para buscar...',
  'fin.nota_conta': '¿Proveedor no registrado? Usa + registrar nuevo. La cuenta bancaria se define en la baja del título, no en el asiento.',
  'fin.novo_lanc_btn': 'Nuevo asiento', 'fin.baixar_sel': 'Dar de baja seleccionados', 'fin.excluir_sel': 'Eliminar seleccionados',
  'fin.status': 'Estado', 'fin.todos_fornecedores': 'Todos proveedores', 'fin.nome': 'Nombre',
  'fin.novo_fornecedor': 'Nuevo proveedor', 'fin.novo_cliente': 'Nuevo cliente', 'fin.cadastrar_cliente_com': 'Registrar cliente comercial', 'fin.salvar_cliente': 'Guardar cliente', 'fin.doc_ph': 'CPF / CNPJ',
  'fin.cadastrar_fornecedor': 'Registrar proveedor', 'fin.fantasia_ph': '(opcional — usa 1ª palabra de la razón social)',
  'fin.celular': 'Celular', 'fin.uf': 'Estado (UF)', 'fin.salvar_fornecedor': 'Guardar proveedor',
  'fin.descricao': 'Descripción', 'fin.cliente': 'Cliente', 'fin.fornecedor': 'Proveedor', 'fin.vencimento': 'Vencimiento',
  'fin.numero': 'Título', 'fin.documento': 'Documento', 'fin.emissao': 'Emisión', 'fin.baixa': 'Baja', 'fin.vendedor': 'Vendedor',
  'fin.sub': 'Baja, cuenta bancaria, conciliación · clic en las columnas para ordenar, arrastra para reordenar',
  'fin.favorecido_cliente': 'Beneficiario / Cliente', 'fin.boletos_abertos': 'Boletos abiertos', 'fin.a_vencer': 'Por vencer',
  'fin.todos_clientes': 'Todos los clientes', 'fin.todos_favorecidos': 'Todos los beneficiarios',
  'fin.valor': 'Valor', 'fin.situacao': 'Estado', 'fin.aberto': 'Abierto', 'fin.vencido': 'Vencido', 'fin.pago': 'Pagado',
  'fin.baixar': 'Liquidar', 'fin.cancelar_baixa': 'Cancelar liquidación', 'fin.confirmar_baixa': 'Confirmar liquidación', 'fin.data_baixa': 'Fecha de baja', 'fin.composicao': 'Composición del valor', 'fin.valor_original': 'Valor original', 'fin.desconto': 'Descuento (R$)', 'fin.multa': 'Multa (R$)', 'fin.juros': 'Intereses (R$)', 'fin.total_baixar': 'Total a liquidar', 'fin.conta_obrigatoria': 'Selecciona el banco (cuenta corriente) para liquidar vía Pix/Boleto.', 'fin.conta_obrig_hint': 'obligatorio p/ Pix/Boleto', 'fin.conta_sem_cadastro': 'Registra una cuenta corriente (Registros › Finanzas › Cuentas corrientes) para liquidar vía Pix/Boleto.',
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
  'fluxo.entrada': 'Entrada', 'fluxo.saida': 'Saída', 'fluxo.vazio': 'Nenhum lançamento no período.',
  'fluxo.sub_full': 'Entradas × saídas × saldo. Considera todos os títulos lançados (data de caixa = baixa, ou vencimento se ainda em aberto).',
  'fluxo.data_ini': 'Data início', 'fluxo.data_fim': 'Data fim', 'fluxo.filtrar': 'Filtrar', 'fluxo.limpar': 'Limpar',
  'fluxo.entradas_saidas': 'Entradas e saídas', 'fluxo.resumo': 'Resumo', 'fluxo.saldo_inicial': 'Saldo inicial (bancos)',
  'fluxo.saldo_periodo': 'Saldo do período', 'fluxo.saldos_banco': 'Saldos por banco (marque os que entram no saldo inicial)',
  'fluxo.sem_contas': 'Sem contas cadastradas.', 'fluxo.lancamentos': 'Lançamentos que compõem o fluxo (período)',
  'fluxo.tipo': 'Tipo', 'fluxo.conta': 'Conta', 'fluxo.data_caixa': 'Data de caixa', 'fluxo.prev_efet': 'Previsto/Efetivo', 'fluxo.cli_forn': 'Cliente / Fornecedor',
  'fluxo.clique_barras': 'Clique nas barras para ver os títulos da semana', 'fluxo.previsto': 'Previsto', 'fluxo.efetivo': 'Efetivo',
  'fluxo.baixado': 'Baixado', 'fluxo.aberto': 'Em aberto', 'fluxo.vencido': 'Vencido', 'fluxo.saldo_sel': 'Saldo do período (selecionados)',
});
Object.assign(en, {
  'menu.fluxo': 'Cash flow', 'cap.financeiro.fluxo.ver': 'View cash flow',
  'fluxo.titulo': 'Cash flow', 'fluxo.sub': 'Inflows and outflows by the settlement date.',
  'fluxo.entradas': 'Inflows', 'fluxo.saidas': 'Outflows', 'fluxo.saldo': 'Balance',
  'fluxo.entrada': 'In', 'fluxo.saida': 'Out', 'fluxo.vazio': 'No entries in the period.',
  'fluxo.sub_full': 'Inflows × outflows × balance. Considers all entries (cash date = settlement, or due date if still open).',
  'fluxo.data_ini': 'Start date', 'fluxo.data_fim': 'End date', 'fluxo.filtrar': 'Filter', 'fluxo.limpar': 'Clear',
  'fluxo.entradas_saidas': 'Inflows and outflows', 'fluxo.resumo': 'Summary', 'fluxo.saldo_inicial': 'Initial balance (banks)',
  'fluxo.saldo_periodo': 'Period balance', 'fluxo.saldos_banco': 'Bank balances (check those included in the initial balance)',
  'fluxo.sem_contas': 'No accounts registered.', 'fluxo.lancamentos': 'Entries in the cash flow (period)',
  'fluxo.tipo': 'Type', 'fluxo.conta': 'Account', 'fluxo.data_caixa': 'Cash date', 'fluxo.prev_efet': 'Forecast/Actual', 'fluxo.cli_forn': 'Customer / Supplier',
  'fluxo.clique_barras': 'Click the bars to see the week’s entries', 'fluxo.previsto': 'Forecast', 'fluxo.efetivo': 'Actual',
  'fluxo.baixado': 'Settled', 'fluxo.aberto': 'Open', 'fluxo.vencido': 'Overdue', 'fluxo.saldo_sel': 'Period balance (selected)',
});
Object.assign(es, {
  'menu.fluxo': 'Flujo de caja', 'cap.financeiro.fluxo.ver': 'Ver flujo de caja',
  'fluxo.titulo': 'Flujo de caja', 'fluxo.sub': 'Entradas y salidas por la fecha de liquidación.',
  'fluxo.entradas': 'Entradas', 'fluxo.saidas': 'Salidas', 'fluxo.saldo': 'Saldo',
  'fluxo.entrada': 'Entrada', 'fluxo.saida': 'Salida', 'fluxo.vazio': 'Ningún lançamiento en el período.',
  'fluxo.sub_full': 'Entradas × salidas × saldo. Considera todos los títulos (fecha de caja = baja, o vencimiento si sigue abierto).',
  'fluxo.data_ini': 'Fecha inicio', 'fluxo.data_fim': 'Fecha fin', 'fluxo.filtrar': 'Filtrar', 'fluxo.limpar': 'Limpiar',
  'fluxo.entradas_saidas': 'Entradas y salidas', 'fluxo.resumo': 'Resumen', 'fluxo.saldo_inicial': 'Saldo inicial (bancos)',
  'fluxo.saldo_periodo': 'Saldo del período', 'fluxo.saldos_banco': 'Saldos por banco (marca los que entran en el saldo inicial)',
  'fluxo.sem_contas': 'Sin cuentas registradas.', 'fluxo.lancamentos': 'Asientos que componen el flujo (período)',
  'fluxo.tipo': 'Tipo', 'fluxo.conta': 'Cuenta', 'fluxo.data_caixa': 'Fecha de caja', 'fluxo.prev_efet': 'Previsto/Efectivo', 'fluxo.cli_forn': 'Cliente / Proveedor',
  'fluxo.clique_barras': 'Haz clic en las barras para ver los títulos de la semana', 'fluxo.previsto': 'Previsto', 'fluxo.efetivo': 'Efectivo',
  'fluxo.baixado': 'Pagado', 'fluxo.aberto': 'Abierto', 'fluxo.vencido': 'Vencido', 'fluxo.saldo_sel': 'Saldo del período (seleccionados)',
});

// --- Fase 5B-ii: Nota de entrada + Recebimento ---
Object.assign(pt, {
  'menu.nota': 'Nota de entrada', 'menu.recebimento': 'Recebimento', 'cap.financeiro.compra.criar': 'Lançar nota de entrada (compra)',
  'nota.titulo': 'Nota de entrada (compra)', 'nota.sub': 'Lança a compra: gera título a pagar e uma pendência de recebimento no estoque.',
  'nota.forn_ph': 'Nome do fornecedor', 'nota.nf': 'NF', 'nota.total': 'Total', 'nota.lancar': 'Lançar nota',
  'nota.editar': 'Editar nota', 'nota.forn': 'Fornecedor', 'nota.lancadas': 'Notas lançadas', 'nota.lista_vazia': 'Nenhuma nota no período.', 'nota.pendente': 'Pendente', 'nota.recebida': 'Recebida', 'nota.confirmar_excluir': 'Excluir esta nota e o título a pagar que ela gerou?', 'recebimento.so_pendente': 'Só é possível editar/excluir notas ainda pendentes (não recebidas).',
  'nota.gera': 'gera título a pagar + pendência de recebimento', 'nota.ok': 'Nota lançada. Veja em Contas a pagar e em Estoque › Recebimento.',
  'nota.serie': 'Série', 'nota.serie_ph': 'Série', 'nota.nf_ph': 'NF nº', 'nota.produto_ph': 'Digite ou selecione',
  'nota.venc1': '1º vencimento (Contas a pagar)', 'nota.valor_total': 'Valor total',
  'nota.gera_full': 'Ao lançar, é criado um título no Contas a pagar (fornecedor, valor total) e uma pendência de recebimento que o Estoque abre para bipar as etiquetas e distribuir por lote/validade.',
  'receb.titulo': 'Recebimento de mercadoria', 'receb.sub': 'Receba as notas lançadas pelo Financeiro: informe a marca e bipe as etiquetas por lote/validade',
  'receb.pendencias': 'Pendências de recebimento', 'receb.custo_un': 'Custo un.', 'receb.lancada_em': 'Lançada em',
  'receb.vazio': 'Nenhuma pendência. As notas lançadas no Financeiro aparecem aqui.', 'receb.receber': 'Receber', 'receb.confirmar': 'Confirmar recebimento', 'receb.un': 'un',
  'recebimento.nao_encontrado': 'Pendência não encontrada.',
});
Object.assign(en, {
  'menu.nota': 'Purchase entry', 'menu.recebimento': 'Receiving', 'cap.financeiro.compra.criar': 'Create purchase entry',
  'nota.titulo': 'Purchase entry', 'nota.sub': 'Records the purchase: creates a payable and a pending receipt in inventory.',
  'nota.forn_ph': 'Supplier name', 'nota.nf': 'Invoice', 'nota.total': 'Total', 'nota.lancar': 'Create entry',
  'nota.editar': 'Edit entry', 'nota.forn': 'Supplier', 'nota.lancadas': 'Entered notes', 'nota.lista_vazia': 'No notes in the period.', 'nota.pendente': 'Pending', 'nota.recebida': 'Received', 'nota.confirmar_excluir': 'Delete this note and the payable it created?', 'recebimento.so_pendente': 'You can only edit/delete notes that are still pending (not received).',
  'nota.gera': 'creates payable + pending receipt', 'nota.ok': 'Entry created. See Payables and Inventory › Receiving.',
  'nota.serie': 'Series', 'nota.serie_ph': 'Series', 'nota.nf_ph': 'Invoice #', 'nota.produto_ph': 'Type or select',
  'nota.venc1': 'First due date (Payables)', 'nota.valor_total': 'Total value',
  'nota.gera_full': 'On submit, a payable is created (supplier, total) and a pending receipt that Inventory opens to scan labels and split by batch/expiry.',
  'receb.titulo': 'Goods receiving', 'receb.sub': 'Receive the entries posted by Finance: set the brand and scan the labels per batch/expiry',
  'receb.pendencias': 'Pending receipts', 'receb.custo_un': 'Unit cost', 'receb.lancada_em': 'Posted on',
  'receb.vazio': 'No pending receipts. Entries posted in Finance show up here.', 'receb.receber': 'Receive', 'receb.confirmar': 'Confirm receipt', 'receb.un': 'un',
  'recebimento.nao_encontrado': 'Pending receipt not found.',
});
Object.assign(es, {
  'menu.nota': 'Nota de entrada', 'menu.recebimento': 'Recepción', 'cap.financeiro.compra.criar': 'Crear nota de entrada (compra)',
  'nota.titulo': 'Nota de entrada (compra)', 'nota.sub': 'Registra la compra: genera cuenta a pagar y una pendencia de recepción en el stock.',
  'nota.forn_ph': 'Nombre del proveedor', 'nota.nf': 'Factura', 'nota.total': 'Total', 'nota.lancar': 'Crear nota',
  'nota.editar': 'Editar nota', 'nota.forn': 'Proveedor', 'nota.lancadas': 'Notas registradas', 'nota.lista_vazia': 'Ninguna nota en el período.', 'nota.pendente': 'Pendiente', 'nota.recebida': 'Recibida', 'nota.confirmar_excluir': '¿Eliminar esta nota y el título a pagar que generó?', 'recebimento.so_pendente': 'Solo se pueden editar/eliminar notas pendientes (no recibidas).',
  'nota.gera': 'genera cuenta a pagar + pendencia de recepción', 'nota.ok': 'Nota creada. Ver en Cuentas a pagar y Stock › Recepción.',
  'nota.serie': 'Serie', 'nota.serie_ph': 'Serie', 'nota.nf_ph': 'Factura nº', 'nota.produto_ph': 'Escribe o selecciona',
  'nota.venc1': '1º vencimiento (Cuentas a pagar)', 'nota.valor_total': 'Valor total',
  'nota.gera_full': 'Al registrar, se crea una cuenta a pagar (proveedor, total) y una pendencia de recepción que el Stock abre para escanear etiquetas y distribuir por lote/caducidad.',
  'receb.titulo': 'Recepción de mercancía', 'receb.sub': 'Recibe las notas registradas por Finanzas: indica la marca y escanea las etiquetas por lote/caducidad',
  'receb.pendencias': 'Pendencias de recepción', 'receb.custo_un': 'Costo un.', 'receb.lancada_em': 'Registrada el',
  'receb.vazio': 'Sin pendencias. Las notas registradas en Finanzas aparecen aquí.', 'receb.receber': 'Recibir', 'receb.confirmar': 'Confirmar recepción', 'receb.un': 'un',
  'recebimento.nao_encontrado': 'Pendencia no encontrada.',
});

// --- Fase 6: Dashboard ---
Object.assign(pt, {
  'dash.vendas_mes': 'Vendas do mês', 'dash.saldo_caixa': 'Saldo de caixa', 'dash.a_receber': 'A receber (aberto)',
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
  'rel.vendas': 'Relatório de vendas', 'rel.produtos': 'Produtos mais vendidos',
  'rel.de': 'De', 'rel.ate': 'Até', 'rel.gerar': 'Gerar', 'rel.exportar': 'Exportar CSV',
  'rel.total_vendas': 'Total de vendas', 'rel.por_vendedor': 'Total por vendedor', 'rel.vazio': 'Nenhuma venda no período.',
  'rel.qtd': 'Qtd', 'rel.total': 'Total',
});
Object.assign(en, {
  'menu.relatorios': 'Reports', 'menu.rel_vendas': 'Sales', 'menu.rel_produtos': 'Best sellers',
  'rel.vendas': 'Sales report', 'rel.produtos': 'Best-selling products',
  'rel.de': 'From', 'rel.ate': 'To', 'rel.gerar': 'Generate', 'rel.exportar': 'Export CSV',
  'rel.total_vendas': 'Total sales', 'rel.por_vendedor': 'Total by sales rep', 'rel.vazio': 'No sales in the period.',
  'rel.qtd': 'Qty', 'rel.total': 'Total',
});
Object.assign(es, {
  'menu.relatorios': 'Informes', 'menu.rel_vendas': 'Ventas', 'menu.rel_produtos': 'Más vendidos',
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
  'precos.vigencia': 'Vigência', 'precos.tipo_fixo': 'Fixo', 'precos.tipo_periodo': 'Período',
});
Object.assign(en, {
  'precos.modo': 'Mode', 'precos.modo_base': 'Base price (general)', 'precos.modo_cliente': 'Per customer',
  'precos.preco_cliente': 'Customer price (R$)', 'precos.sub_cliente': 'Negotiated price per customer — overrides the base price in orders. Blank = uses base.',
  'precos.escolha_cliente': 'Choose a customer to set negotiated prices.', 'precos.usa_base': 'uses base',
  'precos.vigencia': 'Validity', 'precos.tipo_fixo': 'Fixed', 'precos.tipo_periodo': 'Period',
});
Object.assign(es, {
  'precos.modo': 'Modo', 'precos.modo_base': 'Precio base (general)', 'precos.modo_cliente': 'Por cliente',
  'precos.preco_cliente': 'Precio del cliente (R$)', 'precos.sub_cliente': 'Precio negociado por cliente — sustituye el base en el pedido. Vacío = usa el base.',
  'precos.escolha_cliente': 'Elige un cliente para definir los precios negociados.', 'precos.usa_base': 'usa el base',
  'precos.vigencia': 'Vigencia', 'precos.tipo_fixo': 'Fijo', 'precos.tipo_periodo': 'Período',
});

// --- Refinamento: campanhas de preço ---
Object.assign(pt, {
  'camp.titulo': 'Campanhas', 'camp.gerenciar': 'Campanhas', 'camp.motivo': 'Motivo', 'camp.periodo': 'Período',
  'camp.vigente': 'Vigente', 'camp.encerrada': 'Encerrada', 'camp.vazia': 'Nenhuma campanha.', 'camp.nova': 'Nova campanha',
  'camp.add': 'Adicionar campanha', 'camp.editar': 'Editar', 'camp.editando': 'Editar campanha', 'camp.salvar': 'Salvar alterações', 'camp.cancelar_edicao': 'Cancelar edição', 'campanha.periodo_invalido': 'Período inválido (data final antes da inicial).',
});
Object.assign(en, {
  'camp.titulo': 'Campaigns', 'camp.gerenciar': 'Campaigns', 'camp.motivo': 'Reason', 'camp.periodo': 'Period',
  'camp.vigente': 'Active', 'camp.encerrada': 'Ended', 'camp.vazia': 'No campaigns.', 'camp.nova': 'New campaign',
  'camp.add': 'Add campaign', 'camp.editar': 'Edit', 'camp.editando': 'Edit campaign', 'camp.salvar': 'Save changes', 'camp.cancelar_edicao': 'Cancel edit', 'campanha.periodo_invalido': 'Invalid period (end before start).',
});
Object.assign(es, {
  'camp.titulo': 'Campañas', 'camp.gerenciar': 'Campañas', 'camp.motivo': 'Motivo', 'camp.periodo': 'Período',
  'camp.vigente': 'Vigente', 'camp.encerrada': 'Finalizada', 'camp.vazia': 'Sin campañas.', 'camp.nova': 'Nueva campaña',
  'camp.add': 'Agregar campaña', 'camp.editar': 'Editar', 'camp.editando': 'Editar campaña', 'camp.salvar': 'Guardar cambios', 'camp.cancelar_edicao': 'Cancelar edición', 'campanha.periodo_invalido': 'Período inválido (fin antes del inicio).',
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
  'etq.bipe': 'Bipe as etiquetas dos itens', 'etq.bipe_ph': 'Bipe ou digite o código e tecle Enter…', 'scan.escanear': 'Escanear',
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
  'etq.bipe': 'Scan the item labels', 'etq.bipe_ph': 'Scan or type the code and press Enter…', 'scan.escanear': 'Scan',
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
  'etq.bipe': 'Escanea las etiquetas de los ítems', 'etq.bipe_ph': 'Escanea o escribe el código y pulsa Enter…', 'scan.escanear': 'Escanear',
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
  'inv.titulo': 'Inventário por leitor', 'inv.sub': 'Conferência do estoque por leitura de etiqueta, com registro',
  'inv.iniciar': 'Iniciar inventário', 'inv.data_inv': 'Data do inventário', 'inv.iniciar_btn': 'Iniciar inventário',
  'inv.realizados': 'Inventários realizados', 'inv.detalhe': 'Detalhe', 'inv.ver_faltantes': 'Ver faltantes',
  'inv.responsavel': 'Responsável', 'inv.responsavel_auto': 'Registrado automaticamente como o usuário logado.', 'inv.bipe': 'Bipe as etiquetas contadas',
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
  'inv.titulo': 'Inventory count by scanner', 'inv.sub': 'Stock check by label scanning, with record',
  'inv.iniciar': 'Start count', 'inv.data_inv': 'Count date', 'inv.iniciar_btn': 'Start count',
  'inv.realizados': 'Completed counts', 'inv.detalhe': 'Detail', 'inv.ver_faltantes': 'View missing',
  'inv.responsavel': 'Responsible', 'inv.responsavel_auto': 'Automatically recorded as the logged-in user.', 'inv.bipe': 'Scan the counted labels',
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
  'inv.titulo': 'Inventario por lector', 'inv.sub': 'Verificación del stock por lectura de etiqueta, con registro',
  'inv.iniciar': 'Iniciar inventario', 'inv.data_inv': 'Fecha del inventario', 'inv.iniciar_btn': 'Iniciar inventario',
  'inv.realizados': 'Inventarios realizados', 'inv.detalhe': 'Detalle', 'inv.ver_faltantes': 'Ver faltantes',
  'inv.responsavel': 'Responsable', 'inv.responsavel_auto': 'Registrado automáticamente como el usuario conectado.', 'inv.bipe': 'Escanea las etiquetas contadas',
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
  'motoboys.titulo': 'Motoboys', 'motoboys.novo': 'Novo motoboy', 'motoboys.nome': 'Nome', 'motoboys.telefone': 'Telefone', 'motoboys.chave_pix': 'Chave Pix',
  'motoboys.cfg_titulo': 'Configuração de frete (motoboy)',
  'motoboys.cfg_sub': 'A distância é simulada pelo CEP de entrega. Frete = km × valor por km, respeitando o mínimo.',
  'motoboys.km_rate': 'Valor por km (R$)', 'motoboys.min_motoboy': 'Frete mínimo (R$)', 'motoboys.cfg_ok': 'Configuração de frete salva.',
  'entrega.forma': 'Forma de entrega', 'entrega.retirada': 'Retirada', 'entrega.motoboy': 'Motoboy', 'entrega.motoboy_na_expedicao': 'O motoboy é escolhido na expedição',
  'entrega.correios': 'Correios', 'entrega.transportadora': 'Transportadora', 'entrega.memo': 'Cálculo',
  'frete.forma_invalida': 'Forma de entrega inválida.', 'frete.km_rate_invalido': 'Valor por km inválido.',
  'frete.min_invalido': 'Frete mínimo inválido.', 'frete.manual_invalido': 'Informe um valor de frete válido.',
  'pedido.motoboy_obrigatorio': 'Selecione o motoboy.', 'pedido.motoboy_invalido': 'Motoboy inválido.',
});
Object.assign(en, {
  'menu.motoboys': 'Couriers',
  'cap.cadastros.motoboy.listar': 'List couriers', 'cap.cadastros.motoboy.gerenciar': 'Create/edit couriers & freight config',
  'motoboys.titulo': 'Couriers', 'motoboys.novo': 'New courier', 'motoboys.nome': 'Name', 'motoboys.telefone': 'Phone', 'motoboys.chave_pix': 'Pix key',
  'motoboys.cfg_titulo': 'Freight settings (courier)',
  'motoboys.cfg_sub': 'Distance is simulated from the delivery ZIP. Freight = km × per-km rate, respecting the minimum.',
  'motoboys.km_rate': 'Per-km rate ($)', 'motoboys.min_motoboy': 'Minimum freight ($)', 'motoboys.cfg_ok': 'Freight settings saved.',
  'entrega.forma': 'Delivery method', 'entrega.retirada': 'Pickup', 'entrega.motoboy': 'Courier', 'entrega.motoboy_na_expedicao': 'The courier is chosen at shipping',
  'entrega.correios': 'Postal', 'entrega.transportadora': 'Carrier', 'entrega.memo': 'Calc',
  'frete.forma_invalida': 'Invalid delivery method.', 'frete.km_rate_invalido': 'Invalid per-km rate.',
  'frete.min_invalido': 'Invalid minimum freight.', 'frete.manual_invalido': 'Enter a valid freight value.',
  'pedido.motoboy_obrigatorio': 'Select the courier.', 'pedido.motoboy_invalido': 'Invalid courier.',
});
Object.assign(es, {
  'menu.motoboys': 'Motoboys',
  'cap.cadastros.motoboy.listar': 'Listar motoboys', 'cap.cadastros.motoboy.gerenciar': 'Crear/editar motoboys y config. de flete',
  'motoboys.titulo': 'Motoboys', 'motoboys.novo': 'Nuevo motoboy', 'motoboys.nome': 'Nombre', 'motoboys.telefone': 'Teléfono', 'motoboys.chave_pix': 'Clave Pix',
  'motoboys.cfg_titulo': 'Configuración de flete (motoboy)',
  'motoboys.cfg_sub': 'La distancia se simula por el CP de entrega. Flete = km × valor por km, respetando el mínimo.',
  'motoboys.km_rate': 'Valor por km ($)', 'motoboys.min_motoboy': 'Flete mínimo ($)', 'motoboys.cfg_ok': 'Configuración de flete guardada.',
  'entrega.forma': 'Forma de entrega', 'entrega.retirada': 'Retiro', 'entrega.motoboy': 'Motoboy', 'entrega.motoboy_na_expedicao': 'El motoboy se elige en la expedición',
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
  'gfrete.titulo': 'Gestão de fretes', 'gfrete.sub': 'Fretes dos pedidos · fechar por motoboy no Contas a pagar',
  'gfrete.parametros': 'Parâmetros do frete (motoboy)', 'gfrete.salvar_param': 'Salvar parâmetros', 'gfrete.param_ok': 'Parâmetros salvos.',
  'gfrete.venc1': '1º vencimento', 'gfrete.col_pedido': 'Pedido', 'gfrete.distancia': 'Distância', 'gfrete.gerar_titulos_motoboy': 'Gerar títulos (por motoboy)',
  'gfrete.nota': '"Gerar títulos" soma os fretes de motoboy por motoboy no período e cria um título no Contas a pagar para cada um (Correios/Transportadora não geram título de motoboy).',
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
  'gfrete.titulo': 'Freight management', 'gfrete.sub': 'Order freight · close per courier in Payables',
  'gfrete.parametros': 'Freight parameters (courier)', 'gfrete.salvar_param': 'Save parameters', 'gfrete.param_ok': 'Parameters saved.',
  'gfrete.venc1': 'First due date', 'gfrete.col_pedido': 'Order', 'gfrete.distancia': 'Distance', 'gfrete.gerar_titulos_motoboy': 'Generate payables (per courier)',
  'gfrete.nota': '"Generate payables" sums courier freight per courier in the period and creates one payable for each (Post/Carrier do not generate courier payables).',
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
  'gfrete.titulo': 'Gestión de fletes', 'gfrete.sub': 'Fletes de los pedidos · cerrar por motoboy en Cuentas a pagar',
  'gfrete.parametros': 'Parámetros del flete (motoboy)', 'gfrete.salvar_param': 'Guardar parámetros', 'gfrete.param_ok': 'Parámetros guardados.',
  'gfrete.venc1': '1º vencimiento', 'gfrete.col_pedido': 'Pedido', 'gfrete.distancia': 'Distancia', 'gfrete.gerar_titulos_motoboy': 'Generar cuentas (por motoboy)',
  'gfrete.nota': '"Generar cuentas" suma los fletes de motoboy por motoboy en el período y crea una cuenta a pagar para cada uno (Correos/Transportadora no generan cuenta de motoboy).',
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
Object.assign(pt, { 'busca.abrir': 'Buscar', 'busca.placeholder': 'Pesquisar telas, produtos, clientes…', 'busca.vazio': 'Nada encontrado.', 'busca.dica': '↑ ↓ navegar · Enter abrir · Esc fechar' });
Object.assign(en, { 'busca.abrir': 'Search', 'busca.placeholder': 'Search screens, products, customers…', 'busca.vazio': 'Nothing found.', 'busca.dica': '↑ ↓ navigate · Enter open · Esc close' });
Object.assign(es, { 'busca.abrir': 'Buscar', 'busca.placeholder': 'Buscar pantallas, productos, clientes…', 'busca.vazio': 'Nada encontrado.', 'busca.dica': '↑ ↓ navegar · Enter abrir · Esc cerrar' });

// --- Refinamento: Toasts de confirmação ---
Object.assign(pt, {
  'fin.toast_criado': 'Título lançado.', 'fin.toast_baixado': 'Título baixado.', 'fin.toast_cancelado': 'Baixa cancelada.',
  'pedido.toast_status': 'Pedido movido para', 'pedido.toast_pix_pendente': 'Pedido aguardando baixa no Financeiro (Pix). O setor financeiro foi notificado.', 'sep.toast_ok': 'Separação concluída e estoque baixado.',
});
Object.assign(en, {
  'fin.toast_criado': 'Title created.', 'fin.toast_baixado': 'Title settled.', 'fin.toast_cancelado': 'Settlement reverted.',
  'pedido.toast_status': 'Order moved to', 'pedido.toast_pix_pendente': 'Order awaiting receipt in Finance (Pix). Finance has been notified.', 'sep.toast_ok': 'Picking done and stock deducted.',
});
Object.assign(es, {
  'fin.toast_criado': 'Título creado.', 'fin.toast_baixado': 'Título pagado.', 'fin.toast_cancelado': 'Pago cancelado.',
  'pedido.toast_status': 'Pedido movido a', 'pedido.toast_pix_pendente': 'Pedido esperando cobro en Finanzas (Pix). Finanzas fue notificada.', 'sep.toast_ok': 'Preparación hecha y stock descontado.',
});

// --- Refinamento: Sino de notificações ---
Object.assign(pt, { 'sino.titulo': 'Notificações', 'sino.vazio': 'Nada pendente. Tudo em dia!', 'sino.titulos_vencidos': 'Títulos a receber vencidos', 'sino.lotes_vencendo': 'Lotes vencendo (30 d)', 'sino.estoque_baixo': 'Produtos com estoque baixo', 'sino.pendencia_baixa': 'Pedidos aguardando baixa (Pix/Boleto)', 'sino.aguardando_separacao': 'Pedidos aguardando separação', 'sino.toast_nova_separacao': 'Novo pedido aguardando separação', 'sino.ver_todas': 'Ver todas', 'notif.crumb': 'Notificações', 'notif.titulo': 'Notificações', 'notif.sub': 'Avisos e pendências da operação', 'notif.vazio': 'Nada pendente. Tudo em dia!' });
Object.assign(en, { 'sino.titulo': 'Notifications', 'sino.vazio': 'Nothing pending. All caught up!', 'sino.titulos_vencidos': 'Overdue receivables', 'sino.lotes_vencendo': 'Lots expiring (30 d)', 'sino.estoque_baixo': 'Low-stock products', 'sino.pendencia_baixa': 'Orders awaiting receipt (Pix/Boleto)', 'sino.aguardando_separacao': 'Orders awaiting picking', 'sino.toast_nova_separacao': 'New order awaiting picking', 'sino.ver_todas': 'See all', 'notif.crumb': 'Notifications', 'notif.titulo': 'Notifications', 'notif.sub': 'Operation alerts and pending items', 'notif.vazio': 'Nothing pending. All caught up!' });
Object.assign(es, { 'sino.titulo': 'Notificaciones', 'sino.vazio': 'Nada pendiente. ¡Todo al día!', 'sino.titulos_vencidos': 'Cobranzas vencidas', 'sino.lotes_vencendo': 'Lotes por vencer (30 d)', 'sino.estoque_baixo': 'Productos con stock bajo', 'sino.pendencia_baixa': 'Pedidos esperando cobro (Pix/Boleto)', 'sino.aguardando_separacao': 'Pedidos esperando preparación', 'sino.toast_nova_separacao': 'Nuevo pedido esperando preparación', 'sino.ver_todas': 'Ver todas', 'notif.crumb': 'Notificaciones', 'notif.titulo': 'Notificaciones', 'notif.sub': 'Avisos y pendientes de la operación', 'notif.vazio': '¡Nada pendiente. Todo al día!' });

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
  'abc.por_produtos': 'Produtos', 'abc.por_clientes': 'Clientes', 'abc.titulo_clientes': 'Curva ABC de clientes', 'abc.qtd_pedidos': 'Pedidos',
});
Object.assign(en, {
  'menu.rel_abc': 'ABC analysis',
  'abc.titulo': 'Product ABC analysis', 'abc.sub': 'Products by revenue share. A ≈ 80% (vital few), B ≈ 15%, C ≈ 5%.',
  'abc.pct': '% of revenue', 'abc.acumulado': 'cumulative %', 'abc.classe': 'Class', 'abc.itens': 'items',
  'abc.por_produtos': 'Products', 'abc.por_clientes': 'Customers', 'abc.titulo_clientes': 'Customer ABC analysis', 'abc.qtd_pedidos': 'Orders',
});
Object.assign(es, {
  'menu.rel_abc': 'Curva ABC',
  'abc.titulo': 'Curva ABC de productos', 'abc.sub': 'Productos por participación en los ingresos. A ≈ 80%, B ≈ 15%, C ≈ 5%.',
  'abc.pct': '% de ingresos', 'abc.acumulado': '% acumulado', 'abc.classe': 'Clase', 'abc.itens': 'ítems',
  'abc.por_produtos': 'Productos', 'abc.por_clientes': 'Clientes', 'abc.titulo_clientes': 'Curva ABC de clientes', 'abc.qtd_pedidos': 'Pedidos',
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

// --- Refinamento: Relatório de Inventários (histórico) ---
Object.assign(pt, {
  'menu.rel_inventarios': 'Inventários',
  'relinv.titulo': 'Histórico de inventários', 'relinv.sub': 'Contagens realizadas no período, acuracidade e faltantes.',
  'relinv.acuracidade': 'Acuracidade', 'relinv.vazio': 'Nenhum inventário no período.',
  'relinv.kpi_total': 'Inventários', 'relinv.kpi_acur': 'Acuracidade média', 'relinv.kpi_falt': 'Itens faltantes', 'relinv.kpi_baixados': 'Baixados como perda',
  'relinv.ver_falt': 'Ver faltantes', 'relinv.ocultar': 'Ocultar',
});
Object.assign(en, {
  'menu.rel_inventarios': 'Inventories',
  'relinv.titulo': 'Inventory history', 'relinv.sub': 'Counts performed in the period, accuracy and missing items.',
  'relinv.acuracidade': 'Accuracy', 'relinv.vazio': 'No inventories in the period.',
  'relinv.kpi_total': 'Inventories', 'relinv.kpi_acur': 'Avg. accuracy', 'relinv.kpi_falt': 'Missing items', 'relinv.kpi_baixados': 'Written off as loss',
  'relinv.ver_falt': 'View missing', 'relinv.ocultar': 'Hide',
});
Object.assign(es, {
  'menu.rel_inventarios': 'Inventarios',
  'relinv.titulo': 'Historial de inventarios', 'relinv.sub': 'Conteos realizados en el período, exactitud y faltantes.',
  'relinv.acuracidade': 'Exactitud', 'relinv.vazio': 'Sin inventarios en el período.',
  'relinv.kpi_total': 'Inventarios', 'relinv.kpi_acur': 'Exactitud media', 'relinv.kpi_falt': 'Ítems faltantes', 'relinv.kpi_baixados': 'Dados de baja',
  'relinv.ver_falt': 'Ver faltantes', 'relinv.ocultar': 'Ocultar',
});

// --- Refinamento: Cadastro de Favorecidos (reembolso) ---
Object.assign(pt, {
  'menu.favorecidos': 'Favorecidos',
  'cap.cadastros.favorecido.listar': 'Listar favorecidos', 'cap.cadastros.favorecido.gerenciar': 'Criar e editar favorecidos',
  'favorecido.tipo_invalido': 'Tipo de pessoa inválido.',
  'favorecidos.titulo': 'Favorecidos', 'favorecidos.sub': 'Pessoas e empresas que recebem reembolsos e pagamentos avulsos.',
  'favorecidos.novo': 'Novo favorecido', 'favorecidos.nome': 'Nome', 'favorecidos.nome_fantasia': 'Nome / Fantasia', 'favorecidos.tipo': 'Tipo',
  'favorecidos.pf': 'Pessoa física', 'favorecidos.pj': 'Pessoa jurídica',
  'favorecidos.documento': 'CPF / CNPJ', 'favorecidos.pix': 'Chave PIX',
  'favorecidos.banco': 'Banco', 'favorecidos.agencia': 'Agência', 'favorecidos.conta': 'Conta', 'favorecidos.observacao': 'Observação',
});
Object.assign(en, {
  'menu.favorecidos': 'Payees',
  'cap.cadastros.favorecido.listar': 'List payees', 'cap.cadastros.favorecido.gerenciar': 'Create and edit payees',
  'favorecido.tipo_invalido': 'Invalid person type.',
  'favorecidos.titulo': 'Payees', 'favorecidos.sub': 'People and companies that receive reimbursements and one-off payments.',
  'favorecidos.novo': 'New payee', 'favorecidos.nome': 'Name', 'favorecidos.nome_fantasia': 'Name / Trade name', 'favorecidos.tipo': 'Type',
  'favorecidos.pf': 'Individual', 'favorecidos.pj': 'Company',
  'favorecidos.documento': 'Tax ID', 'favorecidos.pix': 'PIX key',
  'favorecidos.banco': 'Bank', 'favorecidos.agencia': 'Branch', 'favorecidos.conta': 'Account', 'favorecidos.observacao': 'Notes',
});
Object.assign(es, {
  'menu.favorecidos': 'Beneficiarios',
  'cap.cadastros.favorecido.listar': 'Listar beneficiarios', 'cap.cadastros.favorecido.gerenciar': 'Crear y editar beneficiarios',
  'favorecido.tipo_invalido': 'Tipo de persona inválido.',
  'favorecidos.titulo': 'Beneficiarios', 'favorecidos.sub': 'Personas y empresas que reciben reembolsos y pagos puntuales.',
  'favorecidos.novo': 'Nuevo beneficiario', 'favorecidos.nome': 'Nombre', 'favorecidos.nome_fantasia': 'Nombre / Fantasía', 'favorecidos.tipo': 'Tipo',
  'favorecidos.pf': 'Persona física', 'favorecidos.pj': 'Persona jurídica',
  'favorecidos.documento': 'CPF / CNPJ', 'favorecidos.pix': 'Clave PIX',
  'favorecidos.banco': 'Banco', 'favorecidos.agencia': 'Agencia', 'favorecidos.conta': 'Cuenta', 'favorecidos.observacao': 'Observación',
});

// --- Refinamento: favorecido no título a pagar ---
Object.assign(pt, { 'fin.favorecido': 'Favorecido', 'fin.sem_favorecido': 'Sem favorecido (nome livre)' });
Object.assign(en, { 'fin.favorecido': 'Payee', 'fin.sem_favorecido': 'No payee (free text)' });
Object.assign(es, { 'fin.favorecido': 'Beneficiario', 'fin.sem_favorecido': 'Sin beneficiario (texto libre)' });

// --- Refinamento: Conciliação bancária (manual) ---
Object.assign(pt, {
  'menu.conciliacao': 'Conciliação bancária',
  'cap.financeiro.conciliacao.ver': 'Ver conciliação bancária', 'cap.financeiro.conciliacao.gerenciar': 'Conciliar lançamentos',
  'conciliacao.conta_obrigatoria': 'Selecione uma conta corrente.', 'conciliacao.so_pago': 'Só títulos pagos podem ser conciliados.',
  'concil.titulo': 'Conciliação bancária', 'concil.sub': 'Confira os lançamentos pagos de cada conta contra o extrato do banco.',
  'concil.conta': 'Conta corrente', 'concil.sem_contas': 'Nenhuma conta cadastrada',
  'concil.tipo': 'Tipo', 'concil.entrada': 'Entrada', 'concil.saida': 'Saída', 'concil.conciliado': 'Conciliado',
  'concil.entradas': 'Entradas', 'concil.saidas': 'Saídas', 'concil.saldo_mov': 'Saldo de movimentos',
  'concil.conciliados': 'Conciliados', 'concil.pendentes': 'Pendentes',
  'concil.saldo_sistema': 'Saldo no sistema', 'concil.saldo_extrato': 'Saldo do extrato', 'concil.diferenca': 'Diferença',
  'concil.bate': 'Saldos batem — conta conciliada.', 'concil.vazio': 'Nenhum lançamento pago nesta conta no período.',
});
Object.assign(en, {
  'menu.conciliacao': 'Bank reconciliation',
  'cap.financeiro.conciliacao.ver': 'View bank reconciliation', 'cap.financeiro.conciliacao.gerenciar': 'Reconcile entries',
  'conciliacao.conta_obrigatoria': 'Select a bank account.', 'conciliacao.so_pago': 'Only paid entries can be reconciled.',
  'concil.titulo': 'Bank reconciliation', 'concil.sub': 'Check paid entries of each account against the bank statement.',
  'concil.conta': 'Bank account', 'concil.sem_contas': 'No accounts registered',
  'concil.tipo': 'Type', 'concil.entrada': 'Inflow', 'concil.saida': 'Outflow', 'concil.conciliado': 'Reconciled',
  'concil.entradas': 'Inflows', 'concil.saidas': 'Outflows', 'concil.saldo_mov': 'Net movement',
  'concil.conciliados': 'Reconciled', 'concil.pendentes': 'Pending',
  'concil.saldo_sistema': 'System balance', 'concil.saldo_extrato': 'Statement balance', 'concil.diferenca': 'Difference',
  'concil.bate': 'Balances match — account reconciled.', 'concil.vazio': 'No paid entries in this account for the period.',
});
Object.assign(es, {
  'menu.conciliacao': 'Conciliación bancaria',
  'cap.financeiro.conciliacao.ver': 'Ver conciliación bancaria', 'cap.financeiro.conciliacao.gerenciar': 'Conciliar movimientos',
  'conciliacao.conta_obrigatoria': 'Seleccione una cuenta bancaria.', 'conciliacao.so_pago': 'Solo títulos pagados pueden conciliarse.',
  'concil.titulo': 'Conciliación bancaria', 'concil.sub': 'Compare los movimientos pagados de cada cuenta con el extracto del banco.',
  'concil.conta': 'Cuenta bancaria', 'concil.sem_contas': 'Ninguna cuenta registrada',
  'concil.tipo': 'Tipo', 'concil.entrada': 'Entrada', 'concil.saida': 'Salida', 'concil.conciliado': 'Conciliado',
  'concil.entradas': 'Entradas', 'concil.saidas': 'Salidas', 'concil.saldo_mov': 'Saldo de movimientos',
  'concil.conciliados': 'Conciliados', 'concil.pendentes': 'Pendientes',
  'concil.saldo_sistema': 'Saldo en el sistema', 'concil.saldo_extrato': 'Saldo del extracto', 'concil.diferenca': 'Diferencia',
  'concil.bate': 'Los saldos coinciden — cuenta conciliada.', 'concil.vazio': 'Sin movimientos pagados en esta cuenta en el período.',
});

// --- Refinamento: Parcelar / Multiplicar títulos ---
Object.assign(pt, {
  'parcelar.acao': 'Parcelar', 'parcelar.multiplicar': 'Multiplicar', 'parcelar.titulo': 'Parcelar / multiplicar título',
  'mult.titulo': 'Multiplicar título', 'mult.vezes': 'Multiplicar o título (vezes)', 'mult.variacao': 'Variação por título (+/−)',
  'mult.int_venc': 'Intervalo de vencimento', 'mult.int_emis': 'Intervalo de emissão', 'mult.acao': 'Multiplicar',
  'mult.nota': 'Cria N novos títulos a partir do marcado, somando o intervalo a cada repetição (vencimento e emissão) e aplicando a variação ao valor — em $ (valor) ou % (percentual). O título original é mantido.',
  'mult.un.dia': 'Dia(s)', 'mult.un.semanal': 'Semanal', 'mult.un.quinzenal': 'Quinzenal', 'mult.un.mensal': 'Mensal', 'mult.un.anual': 'Anual',
  'flt.limpar': 'Limpar filtros', 'flt.aplicar': 'Aplicar', 'flt.titulo': 'Filtros',
  'parcelar.modo': 'Modo', 'parcelar.dividir': 'Dividir o valor em parcelas', 'parcelar.replicar': 'Replicar o valor (recorrente)',
  'parcelar.parcelas': 'Parcelas', 'parcelar.intervalo': 'Intervalo (dias)',
  'parcelar.previa_dividir': 'Vai gerar', 'parcelar.previa_replicar': 'Vai gerar',
  'parcelar.toast': '{n} parcelas geradas.',
  'parcelar.so_aberto': 'Só títulos em aberto podem ser parcelados.',
  'parcelar.parcelas_invalidas': 'Informe de 2 a 99 parcelas.', 'parcelar.intervalo_invalido': 'Intervalo inválido.',
});
Object.assign(en, {
  'parcelar.acao': 'Split', 'parcelar.multiplicar': 'Multiply', 'parcelar.titulo': 'Split / multiply entry',
  'mult.titulo': 'Multiply entry', 'mult.vezes': 'Multiply the entry (times)', 'mult.variacao': 'Variation per entry (+/−)',
  'mult.int_venc': 'Due-date interval', 'mult.int_emis': 'Issue-date interval', 'mult.acao': 'Multiply',
  'mult.nota': 'Creates N new entries from the selected one, adding the interval on each repeat (due and issue dates) and applying the variation to the amount — in $ (value) or % (percent). The original entry is kept.',
  'mult.un.dia': 'Day(s)', 'mult.un.semanal': 'Weekly', 'mult.un.quinzenal': 'Biweekly', 'mult.un.mensal': 'Monthly', 'mult.un.anual': 'Yearly',
  'flt.limpar': 'Clear filters', 'flt.aplicar': 'Apply', 'flt.titulo': 'Filters',
  'parcelar.modo': 'Mode', 'parcelar.dividir': 'Split the amount into installments', 'parcelar.replicar': 'Replicate the amount (recurring)',
  'parcelar.parcelas': 'Installments', 'parcelar.intervalo': 'Interval (days)',
  'parcelar.previa_dividir': 'Will generate', 'parcelar.previa_replicar': 'Will generate',
  'parcelar.toast': '{n} installments created.',
  'parcelar.so_aberto': 'Only open entries can be split.',
  'parcelar.parcelas_invalidas': 'Enter 2 to 99 installments.', 'parcelar.intervalo_invalido': 'Invalid interval.',
});
Object.assign(es, {
  'parcelar.acao': 'Dividir', 'parcelar.multiplicar': 'Multiplicar', 'parcelar.titulo': 'Dividir / multiplicar título',
  'mult.titulo': 'Multiplicar título', 'mult.vezes': 'Multiplicar el título (veces)', 'mult.variacao': 'Variación por título (+/−)',
  'mult.int_venc': 'Intervalo de vencimiento', 'mult.int_emis': 'Intervalo de emisión', 'mult.acao': 'Multiplicar',
  'mult.nota': 'Crea N nuevos títulos a partir del marcado, sumando el intervalo en cada repetición (vencimiento y emisión) y aplicando la variación al valor — en $ (valor) o % (porcentaje). El título original se mantiene.',
  'mult.un.dia': 'Día(s)', 'mult.un.semanal': 'Semanal', 'mult.un.quinzenal': 'Quincenal', 'mult.un.mensal': 'Mensual', 'mult.un.anual': 'Anual',
  'flt.limpar': 'Limpiar filtros', 'flt.aplicar': 'Aplicar', 'flt.titulo': 'Filtros',
  'parcelar.modo': 'Modo', 'parcelar.dividir': 'Dividir el valor en cuotas', 'parcelar.replicar': 'Replicar el valor (recurrente)',
  'parcelar.parcelas': 'Cuotas', 'parcelar.intervalo': 'Intervalo (días)',
  'parcelar.previa_dividir': 'Generará', 'parcelar.previa_replicar': 'Generará',
  'parcelar.toast': '{n} cuotas generadas.',
  'parcelar.so_aberto': 'Solo títulos abiertos pueden dividirse.',
  'parcelar.parcelas_invalidas': 'Ingrese de 2 a 99 cuotas.', 'parcelar.intervalo_invalido': 'Intervalo inválido.',
});

// --- Refinamento: conciliação etapa 2 (importar extrato) ---
Object.assign(pt, {
  'concil.importar': 'Importar extrato (OFX/CSV)',
  'concil.imp_titulo': 'Importar extrato bancário', 'concil.imp_resumo': '{m} de {n} lançamentos do extrato casaram com títulos.',
  'concil.imp_extrato': 'Descrição no extrato', 'concil.imp_match': 'Título correspondente', 'concil.imp_sem': 'Sem correspondência',
  'concil.imp_conciliar': 'Conciliar {n} correspondências', 'concil.imp_toast': '{n} lançamentos conciliados.',
  'concil.imp_vazio': 'Não encontrei lançamentos no arquivo.', 'concil.imp_erro': 'Não consegui ler o arquivo.',
});
Object.assign(en, {
  'concil.importar': 'Import statement (OFX/CSV)',
  'concil.imp_titulo': 'Import bank statement', 'concil.imp_resumo': '{m} of {n} statement entries matched entries.',
  'concil.imp_extrato': 'Statement description', 'concil.imp_match': 'Matched entry', 'concil.imp_sem': 'No match',
  'concil.imp_conciliar': 'Reconcile {n} matches', 'concil.imp_toast': '{n} entries reconciled.',
  'concil.imp_vazio': 'No entries found in the file.', 'concil.imp_erro': 'Could not read the file.',
});
Object.assign(es, {
  'concil.importar': 'Importar extracto (OFX/CSV)',
  'concil.imp_titulo': 'Importar extracto bancario', 'concil.imp_resumo': '{m} de {n} movimientos del extracto coincidieron con títulos.',
  'concil.imp_extrato': 'Descripción en el extracto', 'concil.imp_match': 'Título correspondiente', 'concil.imp_sem': 'Sin coincidencia',
  'concil.imp_conciliar': 'Conciliar {n} coincidencias', 'concil.imp_toast': '{n} movimientos conciliados.',
  'concil.imp_vazio': 'No encontré movimientos en el archivo.', 'concil.imp_erro': 'No pude leer el archivo.',
});

// --- Refinamento: exportar Excel (.xls formatado) ---
Object.assign(pt, { 'rel.exportar_csv': 'Exportar CSV', 'rel.exportar_xlsx': 'Exportar Excel' });
Object.assign(en, { 'rel.exportar_csv': 'Export CSV', 'rel.exportar_xlsx': 'Export Excel' });
Object.assign(es, { 'rel.exportar_csv': 'Exportar CSV', 'rel.exportar_xlsx': 'Exportar Excel' });
Object.assign(pt, {
  'rel.crumb_hub': 'Relatórios', 'rel.hub_sub': 'Indicadores e exportações por categoria',
  'rel.abrir_grupo': 'Abrir grupo', 'rel.fechar_grupo': 'Fechar grupo',
  'rel.g_financeiro': 'Financeiro', 'rel.g_financeiro_d': 'Contas a pagar e receber, comissões, reembolsos.',
  'rel.g_comercial': 'Vendas / Comercial', 'rel.g_comercial_d': 'Desempenho por vendedor, curva ABC e produtos mais vendidos.',
  'rel.g_estoque': 'Estoque', 'rel.g_estoque_d': 'Validade de lotes, estoque parado, perdas e inventários.',
});
Object.assign(en, {
  'rel.crumb_hub': 'Reports', 'rel.hub_sub': 'Indicators and exports by category',
  'rel.abrir_grupo': 'Open group', 'rel.fechar_grupo': 'Close group',
  'rel.g_financeiro': 'Finance', 'rel.g_financeiro_d': 'Payables and receivables, commissions, refunds.',
  'rel.g_comercial': 'Sales / Commercial', 'rel.g_comercial_d': 'Performance by rep, ABC curve and best sellers.',
  'rel.g_estoque': 'Stock', 'rel.g_estoque_d': 'Batch expiry, idle stock, losses and counts.',
});
Object.assign(es, {
  'rel.crumb_hub': 'Informes', 'rel.hub_sub': 'Indicadores y exportaciones por categoría',
  'rel.abrir_grupo': 'Abrir grupo', 'rel.fechar_grupo': 'Cerrar grupo',
  'rel.g_financeiro': 'Financiero', 'rel.g_financeiro_d': 'Cuentas a pagar y cobrar, comisiones, reembolsos.',
  'rel.g_comercial': 'Ventas / Comercial', 'rel.g_comercial_d': 'Desempeño por vendedor, curva ABC y más vendidos.',
  'rel.g_estoque': 'Stock', 'rel.g_estoque_d': 'Caducidad de lotes, stock parado, pérdidas e inventarios.',
});

// --- Refinamento: filtros avançados nas Contas ---
Object.assign(pt, {
  'fin.filtros': 'Filtros', 'fin.f_busca': 'Buscar', 'fin.f_busca_ph': 'Descrição ou pessoa…',
  'fin.f_situacao': 'Situação', 'fin.f_todos': 'Todos', 'fin.f_venc_de': 'Vence de', 'fin.f_venc_ate': 'Vence até',
  'fin.f_min': 'Valor de (R$)', 'fin.f_max': 'Valor até (R$)', 'fin.f_limpar': 'Limpar filtros',
  'fin.f_conta': 'Conta bancária', 'fin.f_pessoa_ph': 'Parte do nome / razão social', 'fin.f_desc_ph': 'Trecho da descrição', 'fin.de': 'de', 'fin.ate': 'até',
});
Object.assign(en, {
  'fin.filtros': 'Filters', 'fin.f_busca': 'Search', 'fin.f_busca_ph': 'Description or person…',
  'fin.f_situacao': 'Status', 'fin.f_todos': 'All', 'fin.f_venc_de': 'Due from', 'fin.f_venc_ate': 'Due until',
  'fin.f_min': 'Amount from (R$)', 'fin.f_max': 'Amount to (R$)', 'fin.f_limpar': 'Clear filters',
  'fin.f_conta': 'Bank account', 'fin.f_pessoa_ph': 'Part of the name', 'fin.f_desc_ph': 'Part of the description', 'fin.de': 'from', 'fin.ate': 'to',
});
Object.assign(es, {
  'fin.filtros': 'Filtros', 'fin.f_busca': 'Buscar', 'fin.f_busca_ph': 'Descripción o persona…',
  'fin.f_situacao': 'Situación', 'fin.f_todos': 'Todos', 'fin.f_venc_de': 'Vence desde', 'fin.f_venc_ate': 'Vence hasta',
  'fin.f_min': 'Valor de (R$)', 'fin.f_max': 'Valor hasta (R$)', 'fin.f_limpar': 'Limpiar filtros',
  'fin.f_conta': 'Cuenta bancaria', 'fin.f_pessoa_ph': 'Parte del nombre / razón social', 'fin.f_desc_ph': 'Parte de la descripción', 'fin.de': 'de', 'fin.ate': 'hasta',
});

// --- common.voltar ---
Object.assign(pt, { 'common.voltar': 'Voltar' });
Object.assign(en, { 'common.voltar': 'Back' });
Object.assign(es, { 'common.voltar': 'Volver' });

// --- Refinamento: esconder/mostrar colunas ---
Object.assign(pt, { 'fin.colunas': 'Colunas' });
Object.assign(en, { 'fin.colunas': 'Columns' });
Object.assign(es, { 'fin.colunas': 'Columnas' });

// --- Login no padrão do mockup (hero + e-mail/senha + recuperar) ---
Object.assign(pt, {
  'login.acesse': 'Acesse sua conta', 'login.ver_senha': 'Mostrar/ocultar senha',
  'login.lembrar': 'Lembrar-me', 'login.esqueci': 'Esqueci minha senha', 'login.dev': 'Desenvolvido por',
  'login.hero_titulo': 'Transforme a gestão da sua distribuidora em decisões inteligentes',
  'login.hero_sub': 'O TRÍADE ERP centraliza a gestão comercial, financeira e de estoque de forma integrada e ágil. Tudo em um só lugar.',
  'login.f1_t': 'Dashboards por área', 'login.f1_d': 'Consolidam informações vitais para decisões ágeis — visão 360° do negócio.',
  'login.f2_t': 'Comercial', 'login.f2_d': 'Pedidos, acompanhamento de vendas e controle de metas.',
  'login.f3_t': 'Financeiro', 'login.f3_d': 'Contas a pagar e receber, fluxo de caixa e controle de comissões.',
  'login.f4_t': 'Estoque', 'login.f4_d': 'Separação em Kanban, com rastreabilidade por lote e validade.',
  'login.f5_t': 'Relatórios por área', 'login.f5_d': 'Relatórios gerenciais e exportáveis — apoio à conformidade.',
  'login.f6_t': 'Acesso por perfil & usuário', 'login.f6_d': 'Total controle do que cada usuário acessa — permissões por tela.',
  'login.rec_titulo': 'Recuperar senha', 'login.rec_sub': 'Informe seu e-mail cadastrado. Enviaremos um link para você criar uma nova senha.',
  'login.rec_enviar': 'Enviar link', 'login.rec_ok': 'Se o e-mail existir, enviamos um link de redefinição válido por 1 hora. Verifique sua caixa de entrada e o spam.',
  'reset.titulo': 'Definir nova senha', 'reset.sub': 'Escolha uma nova senha para sua conta.',
  'reset.nova': 'Nova senha', 'reset.confirmar': 'Confirmar nova senha', 'reset.salvar': 'Salvar nova senha',
  'reset.voltar': 'Voltar para o login', 'reset.ir_login': 'Ir para o login',
  'reset.ok_titulo': 'Senha redefinida!', 'reset.ok_sub': 'Sua senha foi alterada. Você já pode entrar com a nova senha.',
  'auth.reset_invalido': 'Link inválido ou expirado. Solicite um novo em "Esqueci minha senha".',
});
Object.assign(en, {
  'login.acesse': 'Access your account', 'login.ver_senha': 'Show/hide password',
  'login.lembrar': 'Remember me', 'login.esqueci': 'Forgot my password', 'login.dev': 'Developed by',
  'login.hero_titulo': 'Turn your distributor management into smart decisions',
  'login.hero_sub': 'TRÍADE ERP centralizes sales, finance and inventory management in an integrated, agile way. All in one place.',
  'login.f1_t': 'Dashboards by area', 'login.f1_d': 'Consolidate vital information for agile decisions — a 360° view of the business.',
  'login.f2_t': 'Sales', 'login.f2_d': 'Orders, sales tracking and target control.',
  'login.f3_t': 'Finance', 'login.f3_d': 'Payables and receivables, cash flow and commission control.',
  'login.f4_t': 'Inventory', 'login.f4_d': 'Kanban picking with batch and expiry traceability.',
  'login.f5_t': 'Reports by area', 'login.f5_d': 'Managerial, exportable reports — compliance support.',
  'login.f6_t': 'Role & user access', 'login.f6_d': 'Full control over what each user accesses — per-screen permissions.',
  'login.rec_titulo': 'Recover password', 'login.rec_sub': 'Enter your registered e-mail. We will send a link to create a new password.',
  'login.rec_enviar': 'Send link', 'login.rec_ok': 'If the e-mail exists, we sent a reset link valid for 1 hour. Check your inbox and spam.',
  'reset.titulo': 'Set a new password', 'reset.sub': 'Choose a new password for your account.',
  'reset.nova': 'New password', 'reset.confirmar': 'Confirm new password', 'reset.salvar': 'Save new password',
  'reset.voltar': 'Back to login', 'reset.ir_login': 'Go to login',
  'reset.ok_titulo': 'Password reset!', 'reset.ok_sub': 'Your password was changed. You can sign in with the new one now.',
  'auth.reset_invalido': 'Invalid or expired link. Request a new one via "Forgot my password".',
});
Object.assign(es, {
  'login.acesse': 'Accede a tu cuenta', 'login.ver_senha': 'Mostrar/ocultar contraseña',
  'login.lembrar': 'Recordarme', 'login.esqueci': 'Olvidé mi contraseña', 'login.dev': 'Desarrollado por',
  'login.hero_titulo': 'Transforma la gestión de tu distribuidora en decisiones inteligentes',
  'login.hero_sub': 'TRÍADE ERP centraliza la gestión comercial, financiera y de stock de forma integrada y ágil. Todo en un solo lugar.',
  'login.f1_t': 'Paneles por área', 'login.f1_d': 'Consolidan información vital para decisiones ágiles — visión 360° del negocio.',
  'login.f2_t': 'Comercial', 'login.f2_d': 'Pedidos, seguimiento de ventas y control de metas.',
  'login.f3_t': 'Financiero', 'login.f3_d': 'Cuentas por pagar y cobrar, flujo de caja y comisiones.',
  'login.f4_t': 'Stock', 'login.f4_d': 'Preparación en Kanban, con trazabilidad por lote y vencimiento.',
  'login.f5_t': 'Informes por área', 'login.f5_d': 'Informes gerenciales y exportables — apoyo al cumplimiento.',
  'login.f6_t': 'Acceso por perfil y usuario', 'login.f6_d': 'Control total de lo que accede cada usuario — permisos por pantalla.',
  'login.rec_titulo': 'Recuperar contraseña', 'login.rec_sub': 'Ingresa tu correo registrado. Enviaremos un enlace para crear una nueva contraseña.',
  'login.rec_enviar': 'Enviar enlace', 'login.rec_ok': 'Si el correo existe, enviamos un enlace de restablecimiento válido por 1 hora. Revisa tu bandeja y el spam.',
  'reset.titulo': 'Definir nueva contraseña', 'reset.sub': 'Elige una nueva contraseña para tu cuenta.',
  'reset.nova': 'Nueva contraseña', 'reset.confirmar': 'Confirmar nueva contraseña', 'reset.salvar': 'Guardar nueva contraseña',
  'reset.voltar': 'Volver al inicio de sesión', 'reset.ir_login': 'Ir al inicio de sesión',
  'reset.ok_titulo': '¡Contraseña restablecida!', 'reset.ok_sub': 'Tu contraseña fue cambiada. Ya puedes iniciar sesión con la nueva.',
  'auth.reset_invalido': 'Enlace inválido o vencido. Solicita uno nuevo en "Olvidé mi contraseña".',
});

// --- Modo escuro ---
Object.assign(pt, { 'tema.alternar': 'Alternar tema claro/escuro', 'tela.cheia': 'Tela cheia' });
Object.assign(en, { 'tema.alternar': 'Toggle light/dark theme', 'tela.cheia': 'Fullscreen' });
Object.assign(es, { 'tema.alternar': 'Alternar tema claro/oscuro', 'tela.cheia': 'Pantalla completa' });

Object.assign(pt, {
  'crm.crumb': 'Comercial / CRM', 'crm.titulo': 'CRM', 'crm.sub': 'Relacionamento com clientes — indicadores e histórico de interações',
  'crm.kpi_ativos': 'Clientes ativos', 'crm.kpi_atendidos': 'Clientes atendidos', 'crm.kpi_ticket': 'Ticket médio', 'crm.kpi_interacoes': 'Interações registradas',
  'crm.funil': 'Funil de oportunidades', 'crm.arraste': 'Arraste os cards entre os estágios', 'crm.nova_oport': 'Nova oportunidade',
  'crm.est.lead': 'Lead', 'crm.est.contato': 'Contato', 'crm.est.proposta': 'Proposta', 'crm.est.negociacao': 'Negociação', 'crm.est.ganho': 'Ganho',
  'crm.marcar_perdido': 'Marcar perdido', 'crm.orcamento': 'Orçamento', 'crm.gerar_orcamento': 'Gerar orçamento',
  'crm.nota_funil': 'Marque uma oportunidade como Perdida (no card) para tirá-la do funil. Na coluna Ganho, use Gerar orçamento para abrir o pedido já com o cliente preenchido.',
  'crm.historico': 'Histórico do cliente', 'crm.busque_cliente': '— selecione um cliente —', 'crm.registrar_interacao': 'Registrar interação',
  'crm.timeline_vazia_sel': 'Selecione um cliente para ver pedidos, orçamentos e interações registradas.', 'crm.timeline_vazia': 'Sem pedidos ou interações para este cliente. Use "Registrar interação".',
  'crm.recompra': 'Previsão de recompra', 'crm.recompra_sub': 'Com base no ciclo médio de compra de cada cliente',
  'crm.ultima_compra': 'Última compra', 'crm.ciclo': 'Ciclo médio', 'crm.proxima': 'Próxima prevista', 'crm.sugestao': 'Sugestão de itens', 'crm.recompra_vazia': 'Sem clientes com histórico suficiente (2+ pedidos datados).',
  'crm.atrasada': 'Atrasada', 'crm.esta_semana': 'Esta semana', 'crm.em_dia': 'Em dia', 'crm.dias': 'dias',
  'crm.nota_recompra': 'Considera apenas clientes com 2+ pedidos datados. "Atrasada" = passou da data prevista; "Esta semana" = vence em até 7 dias.',
  'crm.inativos': 'Clientes inativos', 'crm.sem_comprar': 'Sem comprar há mais de', 'crm.dias_sem': 'Dias sem comprar', 'crm.acao': 'Ação', 'crm.inativos_vazio': 'Nenhum cliente inativo nesse período.', 'crm.registrar_contato': 'Registrar contato',
  'crm.nota_inativos': 'Clientes que já compraram mas pararam. Use "Registrar interação" para retomar o contato.',
  'crm.confirmar_perder': 'Marcar esta oportunidade como perdida? Ela sai do funil.', 'crm.precisa_cadastro': 'Cadastre o cliente antes de gerar o orçamento.',
  'crm.cliente_prospect': 'Cliente ou prospect', 'crm.cliente_ph': 'Digite ou selecione...', 'crm.titulo_oport': 'Título da oportunidade', 'crm.titulo_ph': 'Ex.: Reposição trimestral de injetáveis',
  'crm.valor': 'Valor', 'crm.estagio': 'Estágio', 'crm.previsao': 'Previsão', 'crm.salvar_oport': 'Salvar oportunidade',
  'crm.tipo': 'Tipo', 'crm.data': 'Data', 'crm.anotacao': 'Anotação', 'crm.anotacao_ph': 'Resumo do contato, próximos passos...', 'crm.salvar_interacao': 'Salvar interação',
  'crm.cliente_obrigatorio': 'Informe o cliente.', 'crm.oportunidade_nao_encontrada': 'Oportunidade não encontrada.',
  'crm.contato': 'Contato', 'crm.contato_ph': 'Pessoa de contato', 'crm.origem': 'Origem', 'crm.origem_ph': 'Ex.: Instagram, indicação, feira',
  'crm.lead_tag': 'Lead', 'crm.converter': 'Converter em cliente', 'crm.convertido_ok': 'Lead convertido em cliente.',
  'crm.importar_leads': 'Importar leads', 'crm.import_erro_linha': 'Não foi possível importar esta linha.',
  'crm.alertas': 'Alertas do comercial', 'crm.alertas_sub': 'Comparados pelo ritmo de compra de cada cliente',
  'crm.alertas_nota': 'A janela de comparação acompanha o ciclo médio de cada cliente — clientes semanais e mensais são avaliados de forma justa.',
  'crm.al_queda': 'Em queda', 'crm.al_atrasados': 'Recompra atrasada', 'crm.al_inativos': 'Inativos',
  'crm.al_sem_queda': 'Nenhum cliente em queda.', 'crm.al_sem_atraso': 'Ninguém atrasado.', 'crm.al_sem_inativo': 'Nenhum inativo.',
  'crm.ritmo.semanal': 'Semanal', 'crm.ritmo.quinzenal': 'Quinzenal', 'crm.ritmo.mensal': 'Mensal', 'crm.ritmo.esporadico': 'Esporádico',
});
Object.assign(en, {
  'crm.crumb': 'Sales / CRM', 'crm.titulo': 'CRM', 'crm.sub': 'Customer relationship — indicators and interaction history',
  'crm.kpi_ativos': 'Active customers', 'crm.kpi_atendidos': 'Served customers', 'crm.kpi_ticket': 'Average ticket', 'crm.kpi_interacoes': 'Logged interactions',
  'crm.funil': 'Opportunity funnel', 'crm.arraste': 'Drag cards between stages', 'crm.nova_oport': 'New opportunity',
  'crm.est.lead': 'Lead', 'crm.est.contato': 'Contact', 'crm.est.proposta': 'Proposal', 'crm.est.negociacao': 'Negotiation', 'crm.est.ganho': 'Won',
  'crm.marcar_perdido': 'Mark lost', 'crm.orcamento': 'Quote', 'crm.gerar_orcamento': 'Generate quote',
  'crm.nota_funil': 'Mark an opportunity as Lost (on the card) to remove it from the funnel. In the Won column, use Generate quote to open the order with the customer prefilled.',
  'crm.historico': 'Customer history', 'crm.busque_cliente': '— select a customer —', 'crm.registrar_interacao': 'Log interaction',
  'crm.timeline_vazia_sel': 'Select a customer to see orders, quotes and logged interactions.', 'crm.timeline_vazia': 'No orders or interactions for this customer. Use "Log interaction".',
  'crm.recompra': 'Repurchase forecast', 'crm.recompra_sub': 'Based on each customer average purchase cycle',
  'crm.ultima_compra': 'Last purchase', 'crm.ciclo': 'Avg cycle', 'crm.proxima': 'Next expected', 'crm.sugestao': 'Suggested items', 'crm.recompra_vazia': 'No customers with enough history (2+ dated orders).',
  'crm.atrasada': 'Overdue', 'crm.esta_semana': 'This week', 'crm.em_dia': 'On track', 'crm.dias': 'days',
  'crm.nota_recompra': 'Only customers with 2+ dated orders. "Overdue" = past the expected date; "This week" = due within 7 days.',
  'crm.inativos': 'Inactive customers', 'crm.sem_comprar': 'Not buying for over', 'crm.dias_sem': 'Days without buying', 'crm.acao': 'Action', 'crm.inativos_vazio': 'No inactive customers in this range.', 'crm.registrar_contato': 'Log contact',
  'crm.nota_inativos': 'Customers who bought but stopped. Use "Log interaction" to resume contact.',
  'crm.confirmar_perder': 'Mark this opportunity as lost? It leaves the funnel.', 'crm.precisa_cadastro': 'Register the customer before generating the quote.',
  'crm.cliente_prospect': 'Customer or prospect', 'crm.cliente_ph': 'Type or select...', 'crm.titulo_oport': 'Opportunity title', 'crm.titulo_ph': 'e.g. Quarterly injectables restock',
  'crm.valor': 'Value', 'crm.estagio': 'Stage', 'crm.previsao': 'Forecast', 'crm.salvar_oport': 'Save opportunity',
  'crm.tipo': 'Type', 'crm.data': 'Date', 'crm.anotacao': 'Note', 'crm.anotacao_ph': 'Contact summary, next steps...', 'crm.salvar_interacao': 'Save interaction',
  'crm.cliente_obrigatorio': 'Enter the customer.', 'crm.oportunidade_nao_encontrada': 'Opportunity not found.',
  'crm.contato': 'Contact', 'crm.contato_ph': 'Contact person', 'crm.origem': 'Source', 'crm.origem_ph': 'e.g. Instagram, referral, fair',
  'crm.lead_tag': 'Lead', 'crm.converter': 'Convert to customer', 'crm.convertido_ok': 'Lead converted to customer.',
  'crm.importar_leads': 'Import leads', 'crm.import_erro_linha': 'Could not import this row.',
  'crm.alertas': 'Sales alerts', 'crm.alertas_sub': 'Compared by each customer purchase rhythm',
  'crm.alertas_nota': 'The comparison window follows each customer average cycle — weekly and monthly customers are judged fairly.',
  'crm.al_queda': 'Declining', 'crm.al_atrasados': 'Repurchase overdue', 'crm.al_inativos': 'Inactive',
  'crm.al_sem_queda': 'No declining customers.', 'crm.al_sem_atraso': 'Nobody overdue.', 'crm.al_sem_inativo': 'No inactive customers.',
  'crm.ritmo.semanal': 'Weekly', 'crm.ritmo.quinzenal': 'Biweekly', 'crm.ritmo.mensal': 'Monthly', 'crm.ritmo.esporadico': 'Sporadic',
});
Object.assign(es, {
  'crm.crumb': 'Comercial / CRM', 'crm.titulo': 'CRM', 'crm.sub': 'Relación con clientes — indicadores e historial de interacciones',
  'crm.kpi_ativos': 'Clientes activos', 'crm.kpi_atendidos': 'Clientes atendidos', 'crm.kpi_ticket': 'Ticket medio', 'crm.kpi_interacoes': 'Interacciones registradas',
  'crm.funil': 'Embudo de oportunidades', 'crm.arraste': 'Arrastra las tarjetas entre las etapas', 'crm.nova_oport': 'Nueva oportunidad',
  'crm.est.lead': 'Lead', 'crm.est.contato': 'Contacto', 'crm.est.proposta': 'Propuesta', 'crm.est.negociacao': 'Negociación', 'crm.est.ganho': 'Ganado',
  'crm.marcar_perdido': 'Marcar perdido', 'crm.orcamento': 'Presupuesto', 'crm.gerar_orcamento': 'Generar presupuesto',
  'crm.nota_funil': 'Marca una oportunidad como Perdida (en la tarjeta) para sacarla del embudo. En la columna Ganado, usa Generar presupuesto para abrir el pedido con el cliente cargado.',
  'crm.historico': 'Historial del cliente', 'crm.busque_cliente': '— selecciona un cliente —', 'crm.registrar_interacao': 'Registrar interacción',
  'crm.timeline_vazia_sel': 'Selecciona un cliente para ver pedidos, presupuestos e interacciones.', 'crm.timeline_vazia': 'Sin pedidos ni interacciones para este cliente. Usa "Registrar interacción".',
  'crm.recompra': 'Previsión de recompra', 'crm.recompra_sub': 'Según el ciclo medio de compra de cada cliente',
  'crm.ultima_compra': 'Última compra', 'crm.ciclo': 'Ciclo medio', 'crm.proxima': 'Próxima prevista', 'crm.sugestao': 'Sugerencia de ítems', 'crm.recompra_vazia': 'Sin clientes con historial suficiente (2+ pedidos con fecha).',
  'crm.atrasada': 'Atrasada', 'crm.esta_semana': 'Esta semana', 'crm.em_dia': 'Al día', 'crm.dias': 'días',
  'crm.nota_recompra': 'Solo clientes con 2+ pedidos con fecha. "Atrasada" = pasó la fecha prevista; "Esta semana" = vence en hasta 7 días.',
  'crm.inativos': 'Clientes inactivos', 'crm.sem_comprar': 'Sin comprar hace más de', 'crm.dias_sem': 'Días sin comprar', 'crm.acao': 'Acción', 'crm.inativos_vazio': 'Ningún cliente inactivo en ese período.', 'crm.registrar_contato': 'Registrar contacto',
  'crm.nota_inativos': 'Clientes que compraron pero pararon. Usa "Registrar interacción" para retomar el contacto.',
  'crm.confirmar_perder': '¿Marcar esta oportunidad como perdida? Sale del embudo.', 'crm.precisa_cadastro': 'Registra el cliente antes de generar el presupuesto.',
  'crm.cliente_prospect': 'Cliente o prospecto', 'crm.cliente_ph': 'Escribe o selecciona...', 'crm.titulo_oport': 'Título de la oportunidad', 'crm.titulo_ph': 'Ej.: Reposición trimestral de inyectables',
  'crm.valor': 'Valor', 'crm.estagio': 'Etapa', 'crm.previsao': 'Previsión', 'crm.salvar_oport': 'Guardar oportunidad',
  'crm.tipo': 'Tipo', 'crm.data': 'Fecha', 'crm.anotacao': 'Anotación', 'crm.anotacao_ph': 'Resumen del contacto, próximos pasos...', 'crm.salvar_interacao': 'Guardar interacción',
  'crm.cliente_obrigatorio': 'Informa el cliente.', 'crm.oportunidade_nao_encontrada': 'Oportunidad no encontrada.',
  'crm.contato': 'Contacto', 'crm.contato_ph': 'Persona de contacto', 'crm.origem': 'Origen', 'crm.origem_ph': 'Ej.: Instagram, recomendación, feria',
  'crm.lead_tag': 'Lead', 'crm.converter': 'Convertir en cliente', 'crm.convertido_ok': 'Lead convertido en cliente.',
  'crm.importar_leads': 'Importar leads', 'crm.import_erro_linha': 'No se pudo importar esta fila.',
  'crm.alertas': 'Alertas comerciales', 'crm.alertas_sub': 'Comparados por el ritmo de compra de cada cliente',
  'crm.alertas_nota': 'La ventana de comparación sigue el ciclo medio de cada cliente — clientes semanales y mensuales se evalúan de forma justa.',
  'crm.al_queda': 'En caída', 'crm.al_atrasados': 'Recompra atrasada', 'crm.al_inativos': 'Inactivos',
  'crm.al_sem_queda': 'Ningún cliente en caída.', 'crm.al_sem_atraso': 'Nadie atrasado.', 'crm.al_sem_inativo': 'Ningún inactivo.',
  'crm.ritmo.semanal': 'Semanal', 'crm.ritmo.quinzenal': 'Quincenal', 'crm.ritmo.mensal': 'Mensual', 'crm.ritmo.esporadico': 'Esporádico',
});

// --- Seletor de empresa (admin do sistema) ---
Object.assign(pt, { 'emp.trocar': 'Trocar empresa (admin do sistema)', 'emp.titulo': 'Trocar empresa', 'emp.vazio': 'Nenhuma empresa.' });
Object.assign(en, { 'emp.trocar': 'Switch company (system admin)', 'emp.titulo': 'Switch company', 'emp.vazio': 'No companies.' });
Object.assign(es, { 'emp.trocar': 'Cambiar empresa (admin del sistema)', 'emp.titulo': 'Cambiar empresa', 'emp.vazio': 'Sin empresas.' });

Object.assign(es, { 'auth.sem_empresas': 'Ninguna empresa activa para acceder.' });

// --- Dashboard fiel ao mockup ---
Object.assign(pt, {
  'dash.subtitulo': 'Visão geral da operação',
  'tv.botao': 'Modo TV', 'tv.titulo': 'Painel de Vendas', 'tv.atualizado': 'Atualizado às', 'tv.sair': 'Sair', 'tv.sair_conta': 'Sair da conta',
  'tv.dia': 'Vendas hoje', 'tv.semana': 'Vendas na semana', 'tv.mes': 'Vendas no mês', 'tv.ano': 'Vendas no ano',
  'tv.receber': 'A receber em aberto', 'tv.caixa': 'Saldo em caixa', 'tv.aguard_sep': 'Aguardando separação', 'tv.estoque_baixo': 'Estoque baixo',
  'tv.top_produtos': 'Produtos mais vendidos', 'tv.recentes': 'Pedidos recentes',
  'tv.vendas_dia': 'Vendas por dia (últimos 14 dias)', 'tv.estoque_disp': 'Estoque disponível por produto',
  'tve.titulo': 'Painel de Expedição', 'tve.entrar_nota': 'Para entrar com nota', 'tve.aguard_sep': 'Aguardando separação', 'tve.aguard_exp': 'Aguardando expedição', 'tve.aguard_ent': 'Aguardando entrega',
  'dash.avisos': 'Avisos e pendências', 'dash.acoes': 'Ações rápidas',
  'dash.av_orcamento': 'Pedidos em orçamento', 'dash.av_aguardando': 'Pedidos aguardando pagamento',
  'dash.av_estoque': 'Produtos com estoque baixo', 'dash.av_receber_venc': 'A receber vencido',
  'dash.qa_novo_pedido': 'Novo pedido', 'dash.qa_novo_cliente': 'Novo cliente', 'dash.qa_entrada': 'Entrada de estoque',
  'dash.vendas_dia': 'Vendas do dia', 'dash.vendas_semana': 'Vendas da semana', 'dash.vendas_ano': 'Vendas do ano', 'dash.clientes_ativos': 'Clientes ativos',
  'dash.vs_ontem': 'vs ontem', 'dash.vs_semana': 'vs sem. anterior', 'dash.vs_mes': 'vs mês anterior', 'dash.vs_ano': 'vs ano anterior', 'dash.novo_periodo': 'novo no período',
  'dash.top_cli_valor': 'Top 5 clientes — por valor', 'dash.top_cli_qtd': 'Top 5 clientes — por pedidos',
  'dash.total_comprado': 'Total comprado', 'dash.qtd_pedidos': 'Quantidade de pedidos', 'dash.sem_dados': 'Sem dados ainda. Crie pedidos para popular o ranking.',
  'dash.pedidos_recentes': 'Pedidos recentes', 'dash.ver_todos': 'Ver todos', 'dash.fluxo_mes': 'Fluxo de caixa (mês)', 'dash.ver_detalhes': 'Ver detalhes',
  'dash.entradas': 'Entradas', 'dash.saidas': 'Saídas', 'dash.saldo': 'Saldo', 'dash.total_contas': 'Total em contas', 'dash.saldo_total': 'Saldo total', 'dash.ver_contas': 'Ver contas',
  'dash.sem_contas': 'Sem contas cadastradas', 'dash.un': 'un', 'dash.este_periodo': 'Este período', 'dash.periodo_anterior': 'Período anterior', 'dash.realizado': 'Realizado', 'dash.meta': 'Meta',
  'dash.footer': 'TRÍADE ERP © 2026 · Todos os direitos reservados · Versão 0.1.0', 'dash.cli_ativos_total': 'ativos no total',
  'dash.clique_ponto': 'Clique num ponto do gráfico para ver o detalhe do mês', 'dash.drill_sub': 'Detalhe do mês selecionado no gráfico.', 'dash.drill_faturado': 'Faturado', 'dash.drill_pedidos': 'Pedidos', 'dash.drill_ticket': 'Ticket médio', 'dash.drill_top_clientes': 'Top clientes do mês', 'dash.mes_invalido': 'Mês inválido.',
  'dash.col_pedido': 'Pedido', 'dash.col_cliente': 'Cliente', 'dash.col_vendedor': 'Vendedor', 'dash.col_valor': 'Valor', 'dash.col_data': 'Data',
  'dash.kpi_drill': 'Clique para ver o gráfico do período',
  'dash.serie_crumb': 'Gráfico do período', 'dash.serie_total': 'Total do período', 'dash.serie_media': 'Média', 'dash.serie_pico': 'Pico',
  'dash.serie_vazio': 'Sem vendas no período.', 'dash.serie_limpar': 'Últimos 30 dias', 'dash.serie_tipo_invalido': 'Período inválido.',
  'dash.itens_vendas': 'Vendas que compõem o valor', 'dash.itens_clientes': 'Clientes ativos', 'dash.col_status': 'Status',
  'dash.serie_dia': 'Vendas do dia — diário (últimos 30 dias)', 'dash.serie_semana': 'Vendas da semana — últimas 12 semanas',
  'dash.serie_mes': 'Vendas do mês — últimos 12 meses', 'dash.serie_ano': 'Vendas do ano — últimos 5 anos', 'dash.serie_clientes': 'Clientes ativos — total atual',
});
Object.assign(en, {
  'dash.subtitulo': 'Operations overview',
  'tv.botao': 'TV mode', 'tv.titulo': 'Sales Panel', 'tv.atualizado': 'Updated at', 'tv.sair': 'Exit', 'tv.sair_conta': 'Sign out',
  'tv.dia': 'Sales today', 'tv.semana': 'Sales this week', 'tv.mes': 'Sales this month', 'tv.ano': 'Sales this year',
  'tv.receber': 'Open receivables', 'tv.caixa': 'Cash balance', 'tv.aguard_sep': 'Awaiting picking', 'tv.estoque_baixo': 'Low stock',
  'tv.top_produtos': 'Best sellers', 'tv.recentes': 'Recent orders',
  'tv.vendas_dia': 'Sales per day (last 14 days)', 'tv.estoque_disp': 'Available stock per product',
  'tve.titulo': 'Shipping Panel', 'tve.entrar_nota': 'To enter invoice', 'tve.aguard_sep': 'Awaiting picking', 'tve.aguard_exp': 'Awaiting shipment', 'tve.aguard_ent': 'Awaiting delivery',
  'dash.avisos': 'Alerts & pending', 'dash.acoes': 'Quick actions',
  'dash.av_orcamento': 'Orders in quote', 'dash.av_aguardando': 'Orders awaiting payment',
  'dash.av_estoque': 'Low-stock products', 'dash.av_receber_venc': 'Overdue receivables',
  'dash.qa_novo_pedido': 'New order', 'dash.qa_novo_cliente': 'New customer', 'dash.qa_entrada': 'Stock entry',
  'dash.vendas_dia': 'Sales today', 'dash.vendas_semana': 'Sales this week', 'dash.vendas_ano': 'Sales this year', 'dash.clientes_ativos': 'Active customers',
  'dash.vs_ontem': 'vs yesterday', 'dash.vs_semana': 'vs last week', 'dash.vs_mes': 'vs last month', 'dash.vs_ano': 'vs last year', 'dash.novo_periodo': 'new in period',
  'dash.top_cli_valor': 'Top 5 customers — by value', 'dash.top_cli_qtd': 'Top 5 customers — by orders',
  'dash.total_comprado': 'Total purchased', 'dash.qtd_pedidos': 'Number of orders', 'dash.sem_dados': 'No data yet. Create orders to populate the ranking.',
  'dash.pedidos_recentes': 'Recent orders', 'dash.ver_todos': 'View all', 'dash.fluxo_mes': 'Cash flow (month)', 'dash.ver_detalhes': 'View details',
  'dash.entradas': 'Inflows', 'dash.saidas': 'Outflows', 'dash.saldo': 'Balance', 'dash.total_contas': 'Total in accounts', 'dash.saldo_total': 'Total balance', 'dash.ver_contas': 'View accounts',
  'dash.sem_contas': 'No accounts registered', 'dash.un': 'un', 'dash.este_periodo': 'This period', 'dash.periodo_anterior': 'Previous period', 'dash.realizado': 'Achieved', 'dash.meta': 'Target',
  'dash.footer': 'TRÍADE ERP © 2026 · All rights reserved · Version 0.1.0', 'dash.cli_ativos_total': 'active total',
  'dash.clique_ponto': 'Click a point on the chart to see the month detail', 'dash.drill_sub': 'Detail of the month selected on the chart.', 'dash.drill_faturado': 'Revenue', 'dash.drill_pedidos': 'Orders', 'dash.drill_ticket': 'Avg. ticket', 'dash.drill_top_clientes': 'Top customers of the month', 'dash.mes_invalido': 'Invalid month.',
  'dash.col_pedido': 'Order', 'dash.col_cliente': 'Customer', 'dash.col_vendedor': 'Salesperson', 'dash.col_valor': 'Value', 'dash.col_data': 'Date',
  'dash.kpi_drill': 'Click to see the period chart',
  'dash.serie_crumb': 'Period chart', 'dash.serie_total': 'Period total', 'dash.serie_media': 'Average', 'dash.serie_pico': 'Peak',
  'dash.serie_vazio': 'No sales in the period.', 'dash.serie_limpar': 'Last 30 days', 'dash.serie_tipo_invalido': 'Invalid period.',
  'dash.itens_vendas': 'Sales that make up the value', 'dash.itens_clientes': 'Active customers', 'dash.col_status': 'Status',
  'dash.serie_dia': 'Sales today — daily (last 30 days)', 'dash.serie_semana': 'Weekly sales — last 12 weeks',
  'dash.serie_mes': 'Monthly sales — last 12 months', 'dash.serie_ano': 'Yearly sales — last 5 years', 'dash.serie_clientes': 'Active customers — current total',
});
Object.assign(es, {
  'dash.subtitulo': 'Visión general de la operación',
  'tv.botao': 'Modo TV', 'tv.titulo': 'Panel de Ventas', 'tv.atualizado': 'Actualizado a las', 'tv.sair': 'Salir', 'tv.sair_conta': 'Cerrar sesión',
  'tv.dia': 'Ventas de hoy', 'tv.semana': 'Ventas de la semana', 'tv.mes': 'Ventas del mes', 'tv.ano': 'Ventas del año',
  'tv.receber': 'Por cobrar abierto', 'tv.caixa': 'Saldo en caja', 'tv.aguard_sep': 'Esperando preparación', 'tv.estoque_baixo': 'Stock bajo',
  'tv.top_produtos': 'Más vendidos', 'tv.recentes': 'Pedidos recientes',
  'tv.vendas_dia': 'Ventas por día (últimos 14 días)', 'tv.estoque_disp': 'Stock disponible por producto',
  'tve.titulo': 'Panel de Expedición', 'tve.entrar_nota': 'Para ingresar nota', 'tve.aguard_sep': 'Esperando preparación', 'tve.aguard_exp': 'Esperando expedición', 'tve.aguard_ent': 'Esperando entrega',
  'dash.avisos': 'Avisos y pendientes', 'dash.acoes': 'Acciones rápidas',
  'dash.av_orcamento': 'Pedidos en presupuesto', 'dash.av_aguardando': 'Pedidos esperando pago',
  'dash.av_estoque': 'Productos con stock bajo', 'dash.av_receber_venc': 'Por cobrar vencido',
  'dash.qa_novo_pedido': 'Nuevo pedido', 'dash.qa_novo_cliente': 'Nuevo cliente', 'dash.qa_entrada': 'Entrada de stock',
  'dash.vendas_dia': 'Ventas del día', 'dash.vendas_semana': 'Ventas de la semana', 'dash.vendas_ano': 'Ventas del año', 'dash.clientes_ativos': 'Clientes activos',
  'dash.vs_ontem': 'vs ayer', 'dash.vs_semana': 'vs sem. anterior', 'dash.vs_mes': 'vs mes anterior', 'dash.vs_ano': 'vs año anterior', 'dash.novo_periodo': 'nuevo en el período',
  'dash.top_cli_valor': 'Top 5 clientes — por valor', 'dash.top_cli_qtd': 'Top 5 clientes — por pedidos',
  'dash.total_comprado': 'Total comprado', 'dash.qtd_pedidos': 'Cantidad de pedidos', 'dash.sem_dados': 'Sin datos aún. Crea pedidos para poblar el ranking.',
  'dash.pedidos_recentes': 'Pedidos recientes', 'dash.ver_todos': 'Ver todos', 'dash.fluxo_mes': 'Flujo de caja (mes)', 'dash.ver_detalhes': 'Ver detalles',
  'dash.entradas': 'Entradas', 'dash.saidas': 'Salidas', 'dash.saldo': 'Saldo', 'dash.total_contas': 'Total en cuentas', 'dash.saldo_total': 'Saldo total', 'dash.ver_contas': 'Ver cuentas',
  'dash.sem_contas': 'Sin cuentas registradas', 'dash.un': 'un', 'dash.este_periodo': 'Este período', 'dash.periodo_anterior': 'Período anterior', 'dash.realizado': 'Realizado', 'dash.meta': 'Meta',
  'dash.footer': 'TRÍADE ERP © 2026 · Todos los derechos reservados · Versión 0.1.0', 'dash.cli_ativos_total': 'activos en total',
  'dash.clique_ponto': 'Haz clic en un punto del gráfico para ver el detalle del mes', 'dash.drill_sub': 'Detalle del mes seleccionado en el gráfico.', 'dash.drill_faturado': 'Facturado', 'dash.drill_pedidos': 'Pedidos', 'dash.drill_ticket': 'Ticket medio', 'dash.drill_top_clientes': 'Top clientes del mes', 'dash.mes_invalido': 'Mes inválido.',
  'dash.col_pedido': 'Pedido', 'dash.col_cliente': 'Cliente', 'dash.col_vendedor': 'Vendedor', 'dash.col_valor': 'Valor', 'dash.col_data': 'Fecha',
  'dash.kpi_drill': 'Haz clic para ver el gráfico del período',
  'dash.serie_crumb': 'Gráfico del período', 'dash.serie_total': 'Total del período', 'dash.serie_media': 'Promedio', 'dash.serie_pico': 'Pico',
  'dash.serie_vazio': 'Sin ventas en el período.', 'dash.serie_limpar': 'Últimos 30 días', 'dash.serie_tipo_invalido': 'Período inválido.',
  'dash.itens_vendas': 'Ventas que componen el valor', 'dash.itens_clientes': 'Clientes activos', 'dash.col_status': 'Estado',
  'dash.serie_dia': 'Ventas del día — diario (últimos 30 días)', 'dash.serie_semana': 'Ventas de la semana — últimas 12 semanas',
  'dash.serie_mes': 'Ventas del mes — últimos 12 meses', 'dash.serie_ano': 'Ventas del año — últimos 5 años', 'dash.serie_clientes': 'Clientes activos — total actual',
});

// --- Padrão de tela (crumb/chips) + Clientes ---
Object.assign(pt, { 'common.todos': 'Todos', 'common.ativos': 'Ativos', 'common.inativos': 'Inativos',
  'clientes.crumb': 'Cadastros / Clientes', 'clientes.sub': 'Clínicas e institutos compradores', 'clientes.buscar': 'Buscar cliente' });
Object.assign(en, { 'common.todos': 'All', 'common.ativos': 'Active', 'common.inativos': 'Inactive',
  'clientes.crumb': 'Records / Customers', 'clientes.sub': 'Buying clinics and institutes', 'clientes.buscar': 'Search customer' });
Object.assign(es, { 'common.todos': 'Todos', 'common.ativos': 'Activos', 'common.inativos': 'Inactivos',
  'clientes.crumb': 'Registros / Clientes', 'clientes.sub': 'Clínicas e institutos compradores', 'clientes.buscar': 'Buscar cliente' });

// --- Importação de planilha (clientes/leads) ---
Object.assign(pt, {
  'clientes.importar': 'Importar clientes', 'cadastro.import_erro_linha': 'Não foi possível importar esta linha.',
  'import.baixar_modelo': 'Baixar modelo (CSV)', 'import.aceita': 'Aceita CSV ou Excel (.xlsx). A 1ª linha deve conter os títulos das colunas.',
  'import.mapear': 'Mapear colunas', 'import.ignorar': 'ignorar', 'import.coluna': 'coluna', 'import.previa': 'Prévia',
  'import.linhas': 'linhas', 'import.validas': 'válidas', 'import.importar': 'Importar',
  'import.criados': 'Criados', 'import.ignorados': 'Ignorados', 'import.erros': 'Erros',
  'import.nota_dedup': 'Ignorados = já existiam (mesmo documento ou nome).', 'import.linha': 'Linha', 'import.motivo': 'Motivo',
  'import.vazio': 'A planilha está vazia.', 'import.erro_ler': 'Não foi possível ler o arquivo.', 'import.erro_enviar': 'Falha ao enviar a importação.',
});
Object.assign(en, {
  'clientes.importar': 'Import customers', 'cadastro.import_erro_linha': 'Could not import this row.',
  'import.baixar_modelo': 'Download template (CSV)', 'import.aceita': 'Accepts CSV or Excel (.xlsx). The first row must contain the column headers.',
  'import.mapear': 'Map columns', 'import.ignorar': 'ignore', 'import.coluna': 'column', 'import.previa': 'Preview',
  'import.linhas': 'rows', 'import.validas': 'valid', 'import.importar': 'Import',
  'import.criados': 'Created', 'import.ignorados': 'Skipped', 'import.erros': 'Errors',
  'import.nota_dedup': 'Skipped = already existed (same document or name).', 'import.linha': 'Row', 'import.motivo': 'Reason',
  'import.vazio': 'The spreadsheet is empty.', 'import.erro_ler': 'Could not read the file.', 'import.erro_enviar': 'Failed to send the import.',
});
Object.assign(es, {
  'clientes.importar': 'Importar clientes', 'cadastro.import_erro_linha': 'No se pudo importar esta fila.',
  'import.baixar_modelo': 'Descargar plantilla (CSV)', 'import.aceita': 'Acepta CSV o Excel (.xlsx). La 1ª fila debe contener los títulos de columna.',
  'import.mapear': 'Mapear columnas', 'import.ignorar': 'ignorar', 'import.coluna': 'columna', 'import.previa': 'Vista previa',
  'import.linhas': 'filas', 'import.validas': 'válidas', 'import.importar': 'Importar',
  'import.criados': 'Creados', 'import.ignorados': 'Ignorados', 'import.erros': 'Errores',
  'import.nota_dedup': 'Ignorados = ya existían (mismo documento o nombre).', 'import.linha': 'Fila', 'import.motivo': 'Motivo',
  'import.vazio': 'La planilla está vacía.', 'import.erro_ler': 'No se pudo leer el archivo.', 'import.erro_enviar': 'Error al enviar la importación.',
});

// --- Pedidos (crumb + filtro de data) ---
Object.assign(pt, { 'pedidos.crumb': 'Comercial / Pedidos', 'pedidos.data_de': 'Data início', 'pedidos.data_ate': 'Data fim', 'pedidos.filtro_dica': 'Filtra os pedidos pela data de criação.', 'pedidos.filtrar': 'Filtrar', 'pedidos.col_retirada': 'Aguardando retirada' });
Object.assign(en, { 'pedidos.crumb': 'Sales / Orders', 'pedidos.data_de': 'Start date', 'pedidos.data_ate': 'End date', 'pedidos.filtro_dica': 'Filters orders by creation date.', 'pedidos.filtrar': 'Filter', 'pedidos.col_retirada': 'Awaiting pickup' });
Object.assign(es, { 'pedidos.crumb': 'Comercial / Pedidos', 'pedidos.data_de': 'Fecha inicio', 'pedidos.data_ate': 'Fecha fin', 'pedidos.filtro_dica': 'Filtra los pedidos por fecha de creación.', 'pedidos.filtrar': 'Filtrar', 'pedidos.col_retirada': 'Esperando retiro' });

// --- Fornecedores / Vendedores (crumb+sub+busca) ---
Object.assign(pt, {
  'fornecedores.crumb': 'Cadastros / Pessoas / Fornecedores', 'fornecedores.sub': 'Pessoas — fornecedores cadastrados', 'fornecedores.buscar': 'Buscar fornecedor', 'forn.cidade_uf': 'Cidade/UF',
  'vendedores.crumb': 'Cadastros / Vendedores', 'vendedores.sub': 'Equipe comercial e metas — usados nos pedidos e no cálculo de comissões', 'vendedores.buscar': 'Buscar vendedor',
  'vendedores.col_vend': 'Vendedor', 'vendedores.regiao_s': 'Região', 'vendedores.meta_s': 'Meta', 'vendedores.comissao_s': 'Comissão',
});
Object.assign(en, {
  'fornecedores.crumb': 'Records / People / Suppliers', 'fornecedores.sub': 'People — registered suppliers', 'fornecedores.buscar': 'Search supplier', 'forn.cidade_uf': 'City/State',
  'vendedores.crumb': 'Records / Salespeople', 'vendedores.sub': 'Sales team and targets — used in orders and commission calc', 'vendedores.buscar': 'Search salesperson',
  'vendedores.col_vend': 'Salesperson', 'vendedores.regiao_s': 'Region', 'vendedores.meta_s': 'Target', 'vendedores.comissao_s': 'Commission',
});
Object.assign(es, {
  'fornecedores.crumb': 'Registros / Personas / Proveedores', 'fornecedores.sub': 'Personas — proveedores registrados', 'fornecedores.buscar': 'Buscar proveedor', 'forn.cidade_uf': 'Ciudad/UF',
  'vendedores.crumb': 'Registros / Vendedores', 'vendedores.sub': 'Equipo comercial y metas — usados en pedidos y cálculo de comisiones', 'vendedores.buscar': 'Buscar vendedor',
  'vendedores.col_vend': 'Vendedor', 'vendedores.regiao_s': 'Región', 'vendedores.meta_s': 'Meta', 'vendedores.comissao_s': 'Comisión',
});

// --- Cadastros (crumb+sub+busca): Marcas/Categorias/Favorecidos/Motoboys ---
Object.assign(pt, {
  'marcas.crumb': 'Cadastros / Marcas', 'marcas.sub': 'Marcas usadas no recebimento dos produtos', 'marcas.buscar': 'Buscar marca',
  'categorias.crumb': 'Cadastros / Categorias', 'categorias.sub': 'Categorias dos produtos', 'categorias.buscar': 'Buscar categoria',
  'favorecidos.buscar': 'Buscar favorecido', 'favorecidos.crumb': 'Cadastros / Pessoas / Favorecidos',
  'motoboys.crumb': 'Cadastros / Pessoas / Motoboys', 'motoboys.sub': 'Entregadores que aparecem no seletor de frete do pedido', 'motoboys.buscar': 'Buscar motoboy',
});
Object.assign(en, {
  'marcas.crumb': 'Records / Brands', 'marcas.sub': 'Brands used when receiving products', 'marcas.buscar': 'Search brand',
  'categorias.crumb': 'Records / Categories', 'categorias.sub': 'Product categories', 'categorias.buscar': 'Search category',
  'favorecidos.buscar': 'Search payee', 'favorecidos.crumb': 'Records / Payees',
  'motoboys.crumb': 'Records / Couriers', 'motoboys.sub': 'Couriers used for delivery', 'motoboys.buscar': 'Search courier',
});
Object.assign(es, {
  'marcas.crumb': 'Registros / Marcas', 'marcas.sub': 'Marcas usadas en la recepción de productos', 'marcas.buscar': 'Buscar marca',
  'categorias.crumb': 'Registros / Categorías', 'categorias.sub': 'Categorías de los productos', 'categorias.buscar': 'Buscar categoría',
  'favorecidos.buscar': 'Buscar beneficiario', 'favorecidos.crumb': 'Registros / Beneficiarios',
  'motoboys.crumb': 'Registros / Mensajeros', 'motoboys.sub': 'Mensajeros usados en el envío', 'motoboys.buscar': 'Buscar mensajero',
});

// --- crumb+sub: Usuarios/Perfis/Condicoes/CatFin/Produtos/ContasCorrentes ---
Object.assign(pt, {
  'usuarios.crumb': 'Configurações / Usuários', 'usuarios.sub': 'Quem acessa o sistema e seus perfis',
  'perfis.crumb': 'Configurações / Perfis', 'perfis.sub': 'Perfis de acesso e permissões por tela',
  'cond.crumb': 'Cadastros / Condições de pagamento', 'cond.sub': 'Parcelas e prazos usados nos pedidos',
  'catfin.crumb': 'Cadastros / Categorias financeiras',
  'produtos.crumb': 'Cadastros / Produtos', 'produtos.sub': 'Itens vendidos — preço, lote e validade vêm depois',
  'cc.crumb': 'Cadastros / Contas correntes', 'cc.sub': 'Bancos e saldos usados nas baixas',
});
Object.assign(pt, {
  'perfis.ativo_label': 'Ativo (disponível para vincular a usuários)', 'perfis.descricao': 'Descrição', 'perfis.descricao_ph': 'Ex.: Acesso total ao sistema',
  'perfis.telas_liberadas': 'Telas liberadas', 'perfis.telas_hint': 'Marque as telas que este perfil pode enxergar. Use o título do grupo para marcar/desmarcar o módulo inteiro.',
});
Object.assign(en, {
  'perfis.ativo_label': 'Active (available to assign to users)', 'perfis.descricao': 'Description', 'perfis.descricao_ph': 'E.g. Full system access',
  'perfis.telas_liberadas': 'Allowed screens', 'perfis.telas_hint': 'Check the screens this role can see. Use the group title to toggle the whole module.',
});
Object.assign(es, {
  'perfis.ativo_label': 'Activo (disponible para asignar a usuarios)', 'perfis.descricao': 'Descripción', 'perfis.descricao_ph': 'Ej.: Acceso total al sistema',
  'perfis.telas_liberadas': 'Pantallas habilitadas', 'perfis.telas_hint': 'Marca las pantallas que este perfil puede ver. Usa el título del grupo para marcar/desmarcar el módulo entero.',
});
Object.assign(en, {
  'usuarios.crumb': 'Settings / Users', 'usuarios.sub': 'Who accesses the system and their roles',
  'perfis.crumb': 'Settings / Roles', 'perfis.sub': 'Access roles and per-screen permissions',
  'cond.crumb': 'Records / Payment terms', 'cond.sub': 'Installments and terms used in orders',
  'catfin.crumb': 'Records / Financial categories',
  'produtos.crumb': 'Records / Products', 'produtos.sub': 'Sold items — price, batch and expiry come later',
  'cc.crumb': 'Records / Bank accounts', 'cc.sub': 'Banks and balances used when settling',
});
Object.assign(es, {
  'usuarios.crumb': 'Configuración / Usuarios', 'usuarios.sub': 'Quién accede al sistema y sus perfiles',
  'perfis.crumb': 'Configuración / Perfiles', 'perfis.sub': 'Perfiles de acceso y permisos por pantalla',
  'cond.crumb': 'Registros / Condiciones de pago', 'cond.sub': 'Cuotas y plazos usados en los pedidos',
  'catfin.crumb': 'Registros / Categorías financieras',
  'produtos.crumb': 'Registros / Productos', 'produtos.sub': 'Ítems vendidos — precio, lote y vencimiento después',
  'cc.crumb': 'Registros / Cuentas bancarias', 'cc.sub': 'Bancos y saldos usados en las bajas',
});

// --- crumb das telas de Estoque/Financeiro ---
Object.assign(pt, {
  'estoque.crumb': 'Estoque/Expedição / Posição de estoque', 'estoque.sub': 'Saldo por produto, lote, validade e localização',
  'entrada.crumb': 'Estoque/Expedição / Entrada de estoque', 'receb.crumb': 'Estoque/Expedição / Recebimento',
  'perda.crumb': 'Estoque/Expedição / Baixa · perda de estoque', 'inv.crumb': 'Estoque/Expedição / Inventário (leitor)',
  'expedicao.crumb': 'Estoque/Expedição / Pedidos',
  'fluxo.crumb': 'Financeiro / Fluxo de caixa', 'nota.crumb': 'Financeiro / Nota de entrada',
  'com.crumb': 'Financeiro / Controle de comissões', 'com.sub': 'Apuração por vendedor e fechamento de competência',
  'gfrete.crumb': 'Logística / Gestão de fretes', 'precos.crumb': 'Comercial / Tabela de preço',
});
Object.assign(en, {
  'estoque.crumb': 'Stock / Stock position', 'estoque.sub': 'Balance per product, batch, expiry and location',
  'entrada.crumb': 'Stock / Stock entry', 'receb.crumb': 'Stock / Receiving',
  'perda.crumb': 'Stock / Write-off', 'inv.crumb': 'Stock / Inventory',
  'expedicao.crumb': 'Stock / Shipping',
  'fluxo.crumb': 'Finance / Cash flow', 'nota.crumb': 'Finance / Purchase note',
  'com.crumb': 'Finance / Commissions', 'com.sub': 'Per-salesperson calculation and period closing',
  'gfrete.crumb': 'Logistics / Freight management', 'precos.crumb': 'Sales / Price table',
});
Object.assign(es, {
  'estoque.crumb': 'Stock / Posición de stock', 'estoque.sub': 'Saldo por producto, lote, vencimiento y ubicación',
  'entrada.crumb': 'Stock / Entrada de stock', 'receb.crumb': 'Stock / Recepción',
  'perda.crumb': 'Stock / Baja / pérdida', 'inv.crumb': 'Stock / Inventario',
  'expedicao.crumb': 'Stock / Expedición',
  'fluxo.crumb': 'Financiero / Flujo de caja', 'nota.crumb': 'Financiero / Nota de entrada',
  'com.crumb': 'Financiero / Comisiones', 'com.sub': 'Cálculo por vendedor y cierre de período',
  'gfrete.crumb': 'Logística / Gestión de fletes', 'precos.crumb': 'Comercial / Tabla de precios',
});

// --- crumb dos Relatórios + Empresas/Dados + Contas ---
Object.assign(pt, {
  'rel.crumb_vendas': 'Relatórios / Vendas', 'rel.crumb_produtos': 'Relatórios / Produtos mais vendidos',
  'rel.crumb_categorias': 'Relatórios / Vendas por categoria', 'rel.crumb_abc': 'Relatórios / Curva ABC',
  'rel.crumb_validade': 'Relatórios / Validade de lotes', 'rel.crumb_parado': 'Relatórios / Estoque parado',
  'rel.crumb_perdas': 'Relatórios / Perdas de estoque', 'rel.crumb_inv': 'Relatórios / Inventários',
  'rel.crumb_dre': 'Financeiro / DRE', 'rel.crumb_aging': 'Financeiro / Aging de recebíveis',
  'empresas.crumb': 'Super-admin / Empresas', 'empresa.crumb': 'Configurações / Dados da empresa',
  'fin.crumb_receber': 'Financeiro / Contas a receber', 'fin.crumb_pagar': 'Financeiro / Contas a pagar',
});
Object.assign(en, {
  'rel.crumb_vendas': 'Reports / Sales', 'rel.crumb_produtos': 'Reports / Top products',
  'rel.crumb_categorias': 'Reports / Sales by category', 'rel.crumb_abc': 'Reports / ABC curve',
  'rel.crumb_validade': 'Reports / Batch expiry', 'rel.crumb_parado': 'Reports / Idle stock',
  'rel.crumb_perdas': 'Reports / Stock losses', 'rel.crumb_inv': 'Reports / Inventories',
  'rel.crumb_dre': 'Finance / Income statement', 'rel.crumb_aging': 'Finance / Receivables aging',
  'empresas.crumb': 'Super-admin / Companies', 'empresa.crumb': 'Settings / Company details',
  'fin.crumb_receber': 'Finance / Receivables', 'fin.crumb_pagar': 'Finance / Payables',
});
Object.assign(es, {
  'rel.crumb_vendas': 'Informes / Ventas', 'rel.crumb_produtos': 'Informes / Productos más vendidos',
  'rel.crumb_categorias': 'Informes / Ventas por categoría', 'rel.crumb_abc': 'Informes / Curva ABC',
  'rel.crumb_validade': 'Informes / Vencimiento de lotes', 'rel.crumb_parado': 'Informes / Stock parado',
  'rel.crumb_perdas': 'Informes / Pérdidas de stock', 'rel.crumb_inv': 'Informes / Inventarios',
  'rel.crumb_dre': 'Financiero / Estado de resultados', 'rel.crumb_aging': 'Financiero / Aging de cobros',
  'empresas.crumb': 'Super-admin / Empresas', 'empresa.crumb': 'Configuración / Datos de la empresa',
  'fin.crumb_receber': 'Financiero / Cuentas por cobrar', 'fin.crumb_pagar': 'Financiero / Cuentas por pagar',
});

Object.assign(pt, { 'concil.crumb': 'Financeiro / Conciliação bancária' });
Object.assign(en, { 'concil.crumb': 'Finance / Bank reconciliation' });
Object.assign(es, { 'concil.crumb': 'Financiero / Conciliación bancaria' });

// --- Dashboard gráficos ---
Object.assign(pt, { 'dash.faturamento': 'Faturamento (6 meses)', 'dash.por_categoria': 'Vendas por categoria', 'dash.saldos': 'Saldos bancários', 'dash.total': 'Total' });
Object.assign(en, { 'dash.faturamento': 'Revenue (6 months)', 'dash.por_categoria': 'Sales by category', 'dash.saldos': 'Bank balances', 'dash.total': 'Total' });
Object.assign(es, { 'dash.faturamento': 'Facturación (6 meses)', 'dash.por_categoria': 'Ventas por categoría', 'dash.saldos': 'Saldos bancarios', 'dash.total': 'Total' });

Object.assign(pt, { 'usuarios.buscar': 'Buscar usuário', 'cond.buscar': 'Buscar condição', 'catfin.buscar': 'Buscar categoria' });
Object.assign(en, { 'usuarios.buscar': 'Search user', 'cond.buscar': 'Search term', 'catfin.buscar': 'Search category' });
Object.assign(es, { 'usuarios.buscar': 'Buscar usuario', 'cond.buscar': 'Buscar condición', 'catfin.buscar': 'Buscar categoría' });

// --- Frete por Google Maps (CEP de origem) ---
Object.assign(pt, { 'motoboys.cep_origem': 'CEP de origem (saída das entregas)', 'motoboys.cep_origem_ph': 'Ex.: 01001-000', 'motoboys.google_dica': 'Com a chave do Google Maps configurada no servidor (GOOGLE_MAPS_API_KEY) e este CEP preenchido, a distância do motoboy é calculada por rota real. Sem isso, usa estimativa pelo CEP.' });
Object.assign(en, { 'motoboys.cep_origem': 'Origin ZIP (deliveries start)', 'motoboys.cep_origem_ph': 'e.g. 01001-000', 'motoboys.google_dica': 'With the Google Maps key set on the server (GOOGLE_MAPS_API_KEY) and this ZIP filled, courier distance uses real routing. Otherwise it estimates from the ZIP.' });
Object.assign(es, { 'motoboys.cep_origem': 'CP de origen (salida de entregas)', 'motoboys.cep_origem_ph': 'Ej.: 01001-000', 'motoboys.google_dica': 'Con la clave de Google Maps en el servidor (GOOGLE_MAPS_API_KEY) y este CP, la distancia usa ruta real. Sin eso, estima por el CP.' });

// --- Novo pedido (cards do mockup) ---
Object.assign(pt, {
  'pedidos.crumb_novo': 'Comercial / Pedidos / Novo', 'pedidos.sub_novo': 'Cliente, itens e forma de pagamento',
  'pedidos.card_dados': 'Dados do pedido', 'pedidos.card_endereco': 'Endereço de entrega',
  'pedidos.escolha_cliente': 'Digite ou selecione um cliente', 'pedidos.obs_ph': 'Notas internas do pedido',
  'pedidos.preco_un': 'Preço un.', 'pedidos.sem_itens': 'Nenhum item adicionado. Clique em Adicionar item.', 'pedidos.criar': 'Criar pedido',
  'pedidos.cliente_comercial': 'Cliente comercial', 'pedidos.cadastrar_cliente': 'cadastrar novo', 'pedidos.cadastrar_motoboy': 'cadastrar', 'pedidos.novo_motoboy': 'Novo motoboy',
  'pedidos.pix_avista': 'Pix é somente à vista.', 'pedidos.salvar_orcamento': 'Salvar como orçamento',
  'pedidos.end_cliente': 'Endereço do cliente', 'pedidos.end_selecione_cliente': '— selecione um cliente para visualizar —',
  'pedidos.end_novo': 'Informar um novo endereço', 'pedidos.end_salvar': 'Salvar este endereço no cadastro do cliente',
  'pedidos.complemento': 'Complemento', 'pedidos.complemento_ph': 'Sala, andar...',
  'pedidos.excluir_sel': 'Excluir selecionados', 'pedidos.itens_sel': 'item(ns) selecionado(s)', 'pedidos.total_sel': 'Total selecionado',
  'pedidos.crumb_editar': 'Comercial / Pedidos / Editar orçamento', 'pedidos.editar': 'Editar orçamento', 'pedidos.sub_editar': 'Ajuste os itens e dados antes de virar pedido',
  'pedidos.end_manter': 'Manter endereço atual', 'pedidos.confirmar_virar': 'Confirmar pedido', 'pedidos.salvar_alteracoes': 'Salvar alterações',
  'pedidos.disponivel': 'disp.', 'pedidos.disponivel_col': 'Disponível', 'pedidos.estoque_excede': 'Há itens com quantidade acima do disponível em estoque. Ajuste para criar o pedido/orçamento.',
});
Object.assign(en, {
  'pedidos.crumb_novo': 'Sales / Orders / New', 'pedidos.sub_novo': 'Customer, items and payment',
  'pedidos.card_dados': 'Order details', 'pedidos.card_endereco': 'Delivery address',
  'pedidos.escolha_cliente': 'Type or select a customer', 'pedidos.obs_ph': 'Internal order notes',
  'pedidos.preco_un': 'Unit price', 'pedidos.sem_itens': 'No items added. Click Add item.', 'pedidos.criar': 'Create order',
  'pedidos.cliente_comercial': 'Commercial customer', 'pedidos.cadastrar_cliente': 'add new', 'pedidos.cadastrar_motoboy': 'add', 'pedidos.novo_motoboy': 'New courier',
  'pedidos.pix_avista': 'Pix is cash only.', 'pedidos.salvar_orcamento': 'Save as quote',
  'pedidos.end_cliente': 'Customer address', 'pedidos.end_selecione_cliente': '— select a customer to view —',
  'pedidos.end_novo': 'Enter a new address', 'pedidos.end_salvar': 'Save this address to the customer record',
  'pedidos.complemento': 'Complement', 'pedidos.complemento_ph': 'Suite, floor...',
  'pedidos.excluir_sel': 'Delete selected', 'pedidos.itens_sel': 'item(s) selected', 'pedidos.total_sel': 'Selected total',
  'pedidos.crumb_editar': 'Sales / Orders / Edit quote', 'pedidos.editar': 'Edit quote', 'pedidos.sub_editar': 'Adjust items and details before turning it into an order',
  'pedidos.end_manter': 'Keep current address', 'pedidos.confirmar_virar': 'Confirm order', 'pedidos.salvar_alteracoes': 'Save changes',
  'pedidos.disponivel': 'avail.', 'pedidos.disponivel_col': 'Available', 'pedidos.estoque_excede': 'Some items exceed available stock. Adjust to create the order/quote.',
});
Object.assign(es, {
  'pedidos.crumb_novo': 'Comercial / Pedidos / Nuevo', 'pedidos.sub_novo': 'Cliente, ítems y forma de pago',
  'pedidos.card_dados': 'Datos del pedido', 'pedidos.card_endereco': 'Dirección de entrega',
  'pedidos.escolha_cliente': 'Escribe o selecciona un cliente', 'pedidos.obs_ph': 'Notas internas del pedido',
  'pedidos.preco_un': 'Precio un.', 'pedidos.sem_itens': 'Ningún ítem agregado. Clic en Agregar ítem.', 'pedidos.criar': 'Crear pedido',
  'pedidos.cliente_comercial': 'Cliente comercial', 'pedidos.cadastrar_cliente': 'registrar nuevo', 'pedidos.cadastrar_motoboy': 'registrar', 'pedidos.novo_motoboy': 'Nuevo motoboy',
  'pedidos.pix_avista': 'Pix es solo al contado.', 'pedidos.salvar_orcamento': 'Guardar como presupuesto',
  'pedidos.end_cliente': 'Dirección del cliente', 'pedidos.end_selecione_cliente': '— selecciona un cliente para ver —',
  'pedidos.end_novo': 'Informar una nueva dirección', 'pedidos.end_salvar': 'Guardar esta dirección en el registro del cliente',
  'pedidos.complemento': 'Complemento', 'pedidos.complemento_ph': 'Sala, piso...',
  'pedidos.excluir_sel': 'Eliminar seleccionados', 'pedidos.itens_sel': 'ítem(s) seleccionado(s)', 'pedidos.total_sel': 'Total seleccionado',
  'pedidos.crumb_editar': 'Comercial / Pedidos / Editar presupuesto', 'pedidos.editar': 'Editar presupuesto', 'pedidos.sub_editar': 'Ajusta los ítems y datos antes de convertirlo en pedido',
  'pedidos.end_manter': 'Mantener dirección actual', 'pedidos.confirmar_virar': 'Confirmar pedido', 'pedidos.salvar_alteracoes': 'Guardar cambios',
  'pedidos.disponivel': 'disp.', 'pedidos.disponivel_col': 'Disponible', 'pedidos.estoque_excede': 'Hay ítems por encima del stock disponible. Ajusta para crear el pedido/presupuesto.',
});

Object.assign(pt, { 'pedido.workflow': 'Workflow', 'pedido.titulo': 'Pedido', 'pedido.lote': 'Lote', 'pedido.validade': 'Validade', 'pedido.editar': 'Editar', 'pedido.so_orcamento_edita': 'Só é possível editar enquanto o pedido está em orçamento.' });
Object.assign(en, { 'pedido.workflow': 'Workflow', 'pedido.titulo': 'Order', 'pedido.lote': 'Batch', 'pedido.validade': 'Expiry', 'pedido.editar': 'Edit', 'pedido.so_orcamento_edita': 'You can only edit while the order is a quote.' });
Object.assign(es, { 'pedido.workflow': 'Flujo', 'pedido.titulo': 'Pedido', 'pedido.lote': 'Lote', 'pedido.validade': 'Validez', 'pedido.editar': 'Editar', 'pedido.so_orcamento_edita': 'Solo se puede editar mientras el pedido es un presupuesto.' });

Object.assign(pt, { 'entrada.card': 'Dados da entrada', 'nota.card': 'Dados da nota', 'perda.card': 'Dados da baixa' });
Object.assign(en, { 'entrada.card': 'Entry details', 'nota.card': 'Note details', 'perda.card': 'Write-off details' });
Object.assign(es, { 'entrada.card': 'Datos de la entrada', 'nota.card': 'Datos de la nota', 'perda.card': 'Datos de la baja' });

Object.assign(pt, { 'empresa.card': 'Identidade e preferências' });
Object.assign(en, { 'empresa.card': 'Identity and preferences' });
Object.assign(es, { 'empresa.card': 'Identidad y preferencias' });
Object.assign(pt, {
  'empresa.identificacao': 'Identificação', 'empresa.razao': 'Razão social', 'empresa.fantasia_hint': 'Usado no menu lateral e na tela de login.',
  'empresa.cnpj': 'CNPJ', 'empresa.buscar': 'Buscar', 'empresa.ie': 'Inscrição estadual', 'empresa.telefone': 'Telefone', 'empresa.email': 'E-mail',
  'empresa.endereco': 'Endereço (logradouro e número)', 'empresa.bairro': 'Bairro', 'empresa.cep': 'CEP', 'empresa.uf': 'Estado (UF)', 'empresa.cidade': 'Cidade',
  'empresa.preview': 'Pré-visualização', 'empresa.logo_onde': 'A mesma imagem aparece no menu lateral e no login.', 'empresa.logo_inserir': 'Clique para inserir a logo da empresa', 'empresa.logo_hint': 'PNG ou JPG · até 2 MB',
  'empresa.logo_tamanho': 'Tamanho no menu', 'empresa.logo_tamanho_hint': 'Altura da logo exibida no menu lateral. Não afeta a tela de login.',
  'empresa.paleta': 'Paleta de cores', 'empresa.paleta_hint': 'Quatro cores aplicadas ao layout em tempo real: primária (botões e destaques), secundária (realces/saldos), fundo do menu e cor da fonte do menu.',
  'empresa.cor_primaria': 'Primária', 'empresa.cor_secundaria': 'Secundária', 'empresa.cor_menu_fundo': 'Menu (fundo)', 'empresa.cor_menu_fonte': 'Menu (fonte)',
  'empresa.cor_secundaria_hint': 'A cor secundária realça valores financeiros (saldos e totais em destaque) e o total dos cards de pedido.', 'empresa.nome_invalido': 'Razão social inválida (mínimo 2 caracteres).',
});
Object.assign(en, {
  'empresa.identificacao': 'Identification', 'empresa.razao': 'Legal name', 'empresa.fantasia_hint': 'Used in the sidebar and login screen.',
  'empresa.cnpj': 'Tax ID (CNPJ)', 'empresa.buscar': 'Look up', 'empresa.ie': 'State registration', 'empresa.telefone': 'Phone', 'empresa.email': 'E-mail',
  'empresa.endereco': 'Address (street and number)', 'empresa.bairro': 'District', 'empresa.cep': 'ZIP code', 'empresa.uf': 'State', 'empresa.cidade': 'City',
  'empresa.preview': 'Preview', 'empresa.logo_onde': 'The same image appears in the sidebar and login.', 'empresa.logo_inserir': 'Click to add the company logo', 'empresa.logo_hint': 'PNG or JPG · up to 2 MB',
  'empresa.logo_tamanho': 'Size in menu', 'empresa.logo_tamanho_hint': 'Logo height shown in the sidebar. Does not affect the login screen.',
  'empresa.paleta': 'Color palette', 'empresa.paleta_hint': 'Four colors applied live: primary (buttons/highlights), secondary (totals/balances), menu background and menu text.',
  'empresa.cor_primaria': 'Primary', 'empresa.cor_secundaria': 'Secondary', 'empresa.cor_menu_fundo': 'Menu (background)', 'empresa.cor_menu_fonte': 'Menu (text)',
  'empresa.cor_secundaria_hint': 'The secondary color highlights financial values (balances and totals) and the order card total.', 'empresa.nome_invalido': 'Invalid legal name (min. 2 characters).',
});
Object.assign(es, {
  'empresa.identificacao': 'Identificación', 'empresa.razao': 'Razón social', 'empresa.fantasia_hint': 'Usado en el menú lateral y la pantalla de inicio.',
  'empresa.cnpj': 'CNPJ', 'empresa.buscar': 'Buscar', 'empresa.ie': 'Inscripción estatal', 'empresa.telefone': 'Teléfono', 'empresa.email': 'Correo',
  'empresa.endereco': 'Dirección (calle y número)', 'empresa.bairro': 'Barrio', 'empresa.cep': 'Código postal', 'empresa.uf': 'Estado (UF)', 'empresa.cidade': 'Ciudad',
  'empresa.preview': 'Vista previa', 'empresa.logo_onde': 'La misma imagen aparece en el menú lateral y el inicio.', 'empresa.logo_inserir': 'Haz clic para agregar el logo de la empresa', 'empresa.logo_hint': 'PNG o JPG · hasta 2 MB',
  'empresa.logo_tamanho': 'Tamaño en el menú', 'empresa.logo_tamanho_hint': 'Altura del logo en el menú lateral. No afecta el inicio de sesión.',
  'empresa.paleta': 'Paleta de colores', 'empresa.paleta_hint': 'Cuatro colores aplicados en vivo: primario (botones/destacados), secundario (saldos/totales), fondo del menú y texto del menú.',
  'empresa.cor_primaria': 'Primario', 'empresa.cor_secundaria': 'Secundario', 'empresa.cor_menu_fundo': 'Menú (fondo)', 'empresa.cor_menu_fonte': 'Menú (texto)',
  'empresa.cor_secundaria_hint': 'El color secundario resalta valores financieros (saldos y totales) y el total de las tarjetas de pedido.', 'empresa.nome_invalido': 'Razón social inválida (mín. 2 caracteres).',
});

Object.assign(pt, { 'precos.nota': 'No preço base você define o preço fixo de cada produto e gerencia o histórico de campanhas (botão Campanhas). A campanha vigente na data sobrepõe o fixo; por cliente, o preço negociado sobrepõe o base.' });
Object.assign(en, { 'precos.nota': 'In base price you set each product’s fixed price and manage the campaign history (Campaigns button). The active campaign overrides the fixed price; per customer, the negotiated price overrides the base.' });
Object.assign(es, { 'precos.nota': 'En el precio base defines el precio fijo de cada producto y gestionas el historial de campañas (botón Campañas). La campaña vigente sobrepone el fijo; por cliente, el precio negociado sobrepone el base.' });

Object.assign(pt, { 'fin.vence7': 'Vence em 7 dias' });
Object.assign(en, { 'fin.vence7': 'Due in 7 days' });
Object.assign(es, { 'fin.vence7': 'Vence en 7 días' });

Object.assign(pt, { 'fin.detalhe': 'Detalhes do título', 'fin.ver_detalhe': 'Duplo-clique para ver os detalhes', 'fin.origem': 'Origem' });
Object.assign(en, { 'fin.detalhe': 'Title details', 'fin.ver_detalhe': 'Double-click to see details', 'fin.origem': 'Origin' });
Object.assign(es, { 'fin.detalhe': 'Detalles del título', 'fin.ver_detalhe': 'Doble clic para ver detalles', 'fin.origem': 'Origen' });

Object.assign(pt, { 'usuarios.foto': 'Foto', 'usuarios.foto_enviar': 'Enviar foto', 'usuarios.foto_remover': 'Remover', 'usuario.foto_grande': 'A foto é muito grande (máx. 2 MB).' });
Object.assign(en, { 'usuarios.foto': 'Photo', 'usuarios.foto_enviar': 'Upload photo', 'usuarios.foto_remover': 'Remove', 'usuario.foto_grande': 'Photo is too large (max 2 MB).' });
Object.assign(es, { 'usuarios.foto': 'Foto', 'usuarios.foto_enviar': 'Subir foto', 'usuarios.foto_remover': 'Quitar', 'usuario.foto_grande': 'La foto es muy grande (máx. 2 MB).' });

Object.assign(pt, {
  'fin.previsto': 'Previsto', 'fin.previsto_hint': 'Marcar como previsto (provisão — não pode ser baixado)',
  'fin.previsto_label': 'Lançamento previsto (provisão — não pode ser baixado)',
  'fin.toast_previsto': 'Marcado como previsto', 'fin.toast_efetivo': 'Marcado como efetivo',
  'financeiro.previsto_nao_baixa': 'Título previsto não pode ser baixado. Marque como efetivo primeiro.',
  'financeiro.baixa_negativa': 'O total a baixar não pode ser negativo. Revise desconto/multa/juros.',
  'financeiro.previsto_so_aberto': 'Só títulos em aberto podem ser marcados como previsto.',
});
Object.assign(en, {
  'fin.previsto': 'Forecast', 'fin.previsto_hint': 'Mark as forecast (provision — cannot be settled)',
  'fin.previsto_label': 'Forecast entry (provision — cannot be settled)',
  'fin.toast_previsto': 'Marked as forecast', 'fin.toast_efetivo': 'Marked as actual',
  'financeiro.previsto_nao_baixa': 'A forecast title cannot be settled. Mark it as actual first.',
  'financeiro.baixa_negativa': 'The amount to settle cannot be negative. Check discount/penalty/interest.',
  'financeiro.previsto_so_aberto': 'Only open titles can be marked as forecast.',
});
Object.assign(es, {
  'fin.previsto': 'Previsto', 'fin.previsto_hint': 'Marcar como previsto (provisión — no se puede dar de baja)',
  'fin.previsto_label': 'Asiento previsto (provisión — no se puede dar de baja)',
  'fin.toast_previsto': 'Marcado como previsto', 'fin.toast_efetivo': 'Marcado como efectivo',
  'financeiro.previsto_nao_baixa': 'Un título previsto no se puede dar de baja. Márcalo como efectivo primero.',
  'financeiro.baixa_negativa': 'El total a liquidar no puede ser negativo. Revisa descuento/multa/intereses.',
  'financeiro.previsto_so_aberto': 'Solo los títulos abiertos pueden marcarse como previstos.',
});

Object.assign(pt, {
  'menu.formas_entrega': 'Formas de entrega',
  'cap.cadastros.forma_entrega.listar': 'Listar formas de entrega', 'cap.cadastros.forma_entrega.gerenciar': 'Criar e editar formas de entrega',
  'formas_entrega.crumb': 'Cadastros / Estoque / Formas de entrega', 'formas_entrega.titulo': 'Formas de entrega',
  'formas_entrega.sub': 'Modalidades usadas na expedição dos pedidos (motoboy, correios, retirada…)',
  'formas_entrega.nova': 'Nova forma de entrega', 'formas_entrega.buscar': 'Buscar forma de entrega',
  'formas_entrega.nome': 'Nome', 'formas_entrega.tipo': 'Tipo', 'formas_entrega.prazo': 'Prazo estimado', 'formas_entrega.prazo_ph': 'Ex.: 3 a 8 dias úteis', 'formas_entrega.obs': 'Observação',
  'forma_entrega.tipo_motoboy': 'Motoboy', 'forma_entrega.tipo_correios': 'Correios', 'forma_entrega.tipo_retirada': 'Retirada na loja', 'forma_entrega.tipo_transportadora': 'Transportadora', 'forma_entrega.tipo_propria': 'Entrega própria',
  'forma_entrega.tipo_invalido': 'Tipo de forma de entrega inválido.',
});
Object.assign(en, {
  'menu.formas_entrega': 'Delivery methods',
  'cap.cadastros.forma_entrega.listar': 'List delivery methods', 'cap.cadastros.forma_entrega.gerenciar': 'Create and edit delivery methods',
  'formas_entrega.crumb': 'Records / Stock / Delivery methods', 'formas_entrega.titulo': 'Delivery methods',
  'formas_entrega.sub': 'Methods used to ship orders (courier, postal, pickup…)',
  'formas_entrega.nova': 'New delivery method', 'formas_entrega.buscar': 'Search delivery method',
  'formas_entrega.nome': 'Name', 'formas_entrega.tipo': 'Type', 'formas_entrega.prazo': 'Estimated time', 'formas_entrega.prazo_ph': 'e.g. 3 to 8 business days', 'formas_entrega.obs': 'Notes',
  'forma_entrega.tipo_motoboy': 'Courier', 'forma_entrega.tipo_correios': 'Postal', 'forma_entrega.tipo_retirada': 'Store pickup', 'forma_entrega.tipo_transportadora': 'Carrier', 'forma_entrega.tipo_propria': 'Own delivery',
  'forma_entrega.tipo_invalido': 'Invalid delivery method type.',
});
Object.assign(es, {
  'menu.formas_entrega': 'Formas de entrega',
  'cap.cadastros.forma_entrega.listar': 'Listar formas de entrega', 'cap.cadastros.forma_entrega.gerenciar': 'Crear y editar formas de entrega',
  'formas_entrega.crumb': 'Registros / Stock / Formas de entrega', 'formas_entrega.titulo': 'Formas de entrega',
  'formas_entrega.sub': 'Modalidades usadas en la expedición de pedidos (mensajero, correos, retiro…)',
  'formas_entrega.nova': 'Nueva forma de entrega', 'formas_entrega.buscar': 'Buscar forma de entrega',
  'formas_entrega.nome': 'Nombre', 'formas_entrega.tipo': 'Tipo', 'formas_entrega.prazo': 'Plazo estimado', 'formas_entrega.prazo_ph': 'Ej.: 3 a 8 días hábiles', 'formas_entrega.obs': 'Observación',
  'forma_entrega.tipo_motoboy': 'Mensajero', 'forma_entrega.tipo_correios': 'Correos', 'forma_entrega.tipo_retirada': 'Retiro en tienda', 'forma_entrega.tipo_transportadora': 'Transportista', 'forma_entrega.tipo_propria': 'Entrega propia',
  'forma_entrega.tipo_invalido': 'Tipo de forma de entrega inválido.',
});

Object.assign(pt, {
  'menu.tipodoc': 'Tipos de documento',
  'cap.cadastros.tipodoc.listar': 'Listar tipos de documento', 'cap.cadastros.tipodoc.gerenciar': 'Criar e editar tipos de documento',
  'tipodoc.crumb': 'Cadastros / Financeiro / Tipos de documento', 'tipodoc.titulo': 'Tipos de documento', 'tipodoc.titulo_s': 'Tipo de documento',
  'tipodoc.sub': 'Usados no campo Tipo de documento ao lançar um título', 'tipodoc.novo': 'Novo tipo de documento', 'tipodoc.buscar': 'Buscar tipo de documento',
  'tipodoc.nome': 'Tipo de documento', 'tipodoc.nome_ph': 'Ex.: NF-e, Boleto, Fatura, Recibo', 'tipodoc.sem': 'Nenhum',
  'comregra.titulo': 'Regras de comissão vigentes', 'comregra.sub': 'Defina o % por pedido, por vendedor ou geral, com vigência por período ou indeterminada.',
  'comregra.nova': 'Nova regra', 'comregra.vazio': 'Nenhuma regra. Sem regra, usa-se o % individual de cada vendedor.',
  'comregra.nome': 'Nome da regra', 'comregra.nome_ph': 'Ex.: Padrão, Campanha Black Friday, Diferenciada Carla',
  'comregra.taxa': 'Taxa (% por pedido)', 'comregra.taxa_label': 'Taxa de comissão (% sobre o pedido)',
  'comregra.todos': 'Todos (geral)', 'comregra.indet': 'Indeterminada', 'comregra.indet_label': 'Vigência indeterminada (vale enquanto a regra estiver ativa)',
  'comregra.dica': 'Vendedor em branco = vale para todos. Prioridade: regra do vendedor no período → regra geral no período → % individual do vendedor.',
  'comregra.prioridade': 'Prioridade ao aplicar: 1) regra do vendedor vigente · 2) regra geral vigente · 3) % individual do vendedor (padrão).',
  'comissao.taxa_invalida': 'Informe uma taxa entre 0 e 100.', 'comissao.periodo_invalido': 'A data final não pode ser anterior à inicial.',
  'fenv.titulo': 'Informar forma de envio', 'fenv.forma': 'Forma de entrega', 'fenv.selecione': 'Selecione ou digite…', 'fenv.selecione_motoboy': 'Selecione o motoboy…', 'fenv.sem_motoboy': 'Nenhum motoboy cadastrado — cadastre em Cadastros › Pessoas › Motoboys.',
  'fenv.detalhe': 'Detalhe (opcional)', 'fenv.detalhe_ph': 'Ex.: código de rastreio, nome do motoboy', 'fenv.confirmar': 'Confirmar expedição',
  'fenv.cod_rastreio': 'Código de rastreio', 'fenv.cod_rastreio_ph': 'Ex.: BR123456789BR', 'fenv.transportadora': 'Transportadora', 'fenv.transportadora_ph': 'Nome da transportadora', 'fenv.retirada_nota': 'O cliente retira o pedido. Nada a informar aqui.', 'fenv.opcional': 'opcional',
  'ent.titulo': 'Confirmar entrega', 'ent.data': 'Data de entrega', 'ent.confirmar': 'Confirmar entrega',
  'pedido.forma_envio': 'Forma de envio', 'pedido.entregue_em': 'Entregue em', 'pedido.separado_por': 'Separado por', 'pedido.expedido_por': 'Expedido por',
  'pedido.forma_envio_obrigatoria': 'Informe a forma de envio para expedir o pedido.', 'pedido.data_entrega_obrigatoria': 'Informe a data de entrega.',
  'menu.rel_pedidos': 'Pedidos', 'relped.crumb': 'Relatórios / Pedidos', 'relped.titulo': 'Relatório de pedidos',
  'relped.sub': 'Todos os pedidos do sistema, com filtro de data e status', 'relped.todos': 'Todos os status', 'relped.qtd': 'Pedidos', 'relped.total': 'Valor total',
  'menu.suporte': 'Suporte', 'menu.suporte_sub': 'Central de ajuda', 'menu.principal': 'PRINCIPAL', 'menu.recolher': 'Recolher menu',
  'menu.chamados': 'Chamados de suporte',
  'menu.campanhas_frete': 'Campanhas de frete', 'menu.auditoria': 'Auditoria',
  'menu.rel_contas_pagar': 'Contas a pagar (contábil)', 'menu.rel_contas_receber': 'Contas a receber (contábil)', 'menu.rel_vendas_contabil': 'Vendas (contábil)',
  'rel.data': 'Data',
  'frete.entrega_retirada': 'Retirada', 'frete.entrega_motoboy': 'Motoboy', 'frete.entrega_correios': 'Correios', 'frete.entrega_transportadora': 'Transportadora',
  'frete.cliente_obrigatorio': 'Selecione o cliente da campanha.', 'frete.campanha_tipo_invalido': 'Tipo de campanha inválido.', 'frete.campanha_valor_invalido': 'Valor da campanha inválido.',
  'relvc.crumb': 'Relatórios / Vendas (contábil)', 'relvc.titulo': 'Vendas (contábil)', 'relvc.sub': 'Venda separada do frete, para a contabilidade',
  'relvc.numero': 'Pedido', 'relvc.cliente': 'Cliente', 'relvc.venda': 'Venda', 'relvc.frete_cobrado': 'Frete cobrado', 'relvc.frete_custo': 'Frete custo', 'relvc.absorvido': 'Frete absorvido', 'relvc.tipo_frete': 'Tipo de frete', 'relvc.total': 'Total',
  'relcp.crumb': 'Relatórios / Contas a pagar', 'relcp.titulo': 'Contas a pagar (contábil)', 'relcp.sub': 'Todos os títulos a pagar do período', 'relcp.categoria': 'Categoria', 'relcp.fornecedor': 'Fornecedor', 'relcp.total': 'Total a pagar', 'relcp.titulos': 'Títulos', 'relcp.anexos': 'Anexos', 'relcp.anexar': 'Anexar', 'relcp.sub_emissao': 'Todos os títulos a pagar do período (por emissão)', 'relcp.emissao_de': 'Emissão de',
  'relcr.crumb': 'Relatórios / Contas a receber', 'relcr.titulo': 'Contas a receber (contábil)', 'relcr.sub_emissao': 'Todos os títulos a receber do período (por emissão)', 'relcr.cliente': 'Cliente', 'relcr.total': 'Total a receber', 'relcr.recebido': 'Recebido',
  'fretecamp.crumb': 'Logística / Campanhas de frete', 'fretecamp.titulo': 'Campanhas de frete', 'fretecamp.sub': 'Frete grátis, fixo ou desconto por cliente, com período', 'fretecamp.nova': 'Nova campanha de frete', 'fretecamp.cliente': 'Cliente', 'fretecamp.tipo': 'Tipo', 'fretecamp.tipo_gratis': 'Frete grátis', 'fretecamp.tipo_fixo': 'Valor fixo', 'fretecamp.tipo_percentual': 'Desconto %', 'fretecamp.valor_fixo': 'Valor cobrado (R$)', 'fretecamp.valor_pct': 'Desconto (%)', 'fretecamp.vigencia': 'Vigência', 'fretecamp.motivo': 'Motivo', 'fretecamp.motivo_ph': 'Ex.: Cliente VIP', 'fretecamp.vigente': 'Vigente', 'fretecamp.encerrada': 'Encerrada', 'fretecamp.excluir_confirma': 'Excluir esta campanha de frete?', 'fretecamp.toast_criada': 'Campanha de frete criada.',
  'precohist.botao': 'Histórico', 'precohist.titulo': 'Histórico de preços do cliente', 'precohist.sub': 'Preços negociados praticados para este cliente', 'precohist.produto': 'Produto', 'precohist.preco': 'Preço', 'precohist.vigencia': 'Vigência', 'precohist.usuario': 'Usuário', 'precohist.quando': 'Data/hora', 'precohist.vazio': 'Nenhum preço registrado ainda.', 'precohist.fixo': 'Fixo',
  'audit.crumb': 'Configurações / Auditoria', 'audit.titulo': 'Auditoria', 'audit.sub': 'Registro de quem alterou o quê e quando', 'audit.usuario': 'Usuário', 'audit.modulo': 'Módulo', 'audit.acao': 'Ação', 'audit.data': 'Data/hora', 'audit.todos': 'Todos',
  'suporte.titulo': 'Fale com o suporte', 'suporte.subtitulo': 'Relate um erro, uma sugestão ou tire uma dúvida.',
  'suporte.tipo': 'Tipo', 'suporte.tipo_erro': 'Erro', 'suporte.tipo_sugestao': 'Sugestão', 'suporte.tipo_duvida': 'Dúvida',
  'suporte.assunto': 'Assunto', 'suporte.descricao': 'Descrição', 'suporte.print': 'Print (opcional)',
  'suporte.print_enviar': 'Anexar imagem', 'suporte.print_remover': 'Remover',
  'suporte.print_zona': 'Cole o print aqui (Ctrl+V) ou arraste a imagem',
  'suporte.nota_contexto': 'Empresa, usuário, tela atual e versão do sistema vão anexados automaticamente.',
  'suporte.enviar': 'Enviar chamado', 'suporte.enviado': 'Chamado enviado ao suporte. Obrigado!',
  'suporte.tipo_invalido': 'Selecione o tipo do chamado.', 'suporte.assunto_invalido': 'Informe um assunto (mín. 3 caracteres).',
  'suporte.descricao_invalida': 'Descreva o chamado (mín. 3 caracteres).', 'suporte.print_grande': 'A imagem é muito grande (máx. ~3 MB).',
  'suporte.print_invalido': 'Anexe um arquivo de imagem.', 'suporte.status_invalido': 'Status inválido.', 'suporte.nao_encontrado': 'Chamado não encontrado.',
  'chamados.crumb': 'Super-admin / Chamados de suporte', 'chamados.titulo': 'Chamados de suporte',
  'chamados.abertos': 'Abertos', 'chamados.em_andamento': 'Em andamento', 'chamados.resolvidos': 'Resolvidos',
  'chamados.f_todos': 'Todos', 'chamados.f_aberto': 'Abertos', 'chamados.f_em_andamento': 'Em andamento', 'chamados.f_resolvido': 'Resolvidos',
  'chamados.tipo': 'Tipo', 'chamados.assunto': 'Assunto', 'chamados.empresa': 'Empresa', 'chamados.data': 'Data', 'chamados.status': 'Status',
  'chamados.s_aberto': 'Aberto', 'chamados.s_em_andamento': 'Em andamento', 'chamados.s_resolvido': 'Resolvido',
  'chamados.usuario': 'Usuário', 'chamados.tela_versao': 'Tela / versão', 'chamados.print': 'Print anexado',
  'chamados.marcar_andamento': 'Marcar em andamento', 'chamados.marcar_resolvido': 'Marcar resolvido', 'chamados.reabrir': 'Reabrir',
  'sino.chamados_suporte': 'Chamados de suporte abertos',
  'sino.chamados_atualizados': 'Seus chamados atualizados',
  'suporte.ver_meus': 'Ver meus chamados',
  'meuschamados.crumb': 'Suporte / Meus chamados', 'meuschamados.titulo': 'Meus chamados',
  'meuschamados.aberto_em': 'Aberto em', 'meuschamados.vazio': 'Você ainda não abriu chamados.',
  'logout.titulo': 'Sair do sistema?', 'logout.msg': 'Você precisará entrar novamente para acessar.',
  'menu.bancos': 'Bancos', 'cap.cadastros.banco.listar': 'Listar bancos', 'cap.cadastros.banco.gerenciar': 'Criar e editar bancos',
  'bancos.crumb': 'Cadastros / Financeiro / Bancos', 'bancos.titulo': 'Bancos', 'bancos.sub': 'Instituições usadas nas contas correntes e conciliação',
  'bancos.novo': 'Novo banco', 'bancos.buscar': 'Buscar banco', 'bancos.nome': 'Banco', 'bancos.nome_ph': 'Ex.: Itaú, Bradesco, Nubank',
  'menu.rel_reembolsos': 'Reembolsos', 'relfav.crumb': 'Relatórios / Reembolsos a favorecidos', 'relfav.titulo': 'Reembolsos a favorecidos',
  'relfav.sub': 'Títulos a pagar vinculados a favorecidos (reembolso de despesas)', 'relfav.favorecido': 'Favorecido', 'relfav.pago_em': 'Pago em', 'relfav.qtd': 'Lançamentos', 'relfav.total': 'Total',
  'menu.fluxo_proj': 'Fluxo projetado', 'fluxoproj.crumb': 'Financeiro / Fluxo de caixa projetado', 'fluxoproj.titulo': 'Fluxo de caixa projetado',
  'fluxoproj.sub': 'Projeção rolling de 13 semanas (método direto) a partir dos títulos em aberto',
  'fluxoproj.saldo_inicial': 'Saldo inicial (caixa atual)', 'fluxoproj.saldo_final': 'Saldo projetado (13 sem.)', 'fluxoproj.grafico': 'Saldo projetado por semana',
  'fluxoproj.semana': 'Semana', 'fluxoproj.periodo': 'Período', 'fluxoproj.saldo': 'Saldo projetado',
});
Object.assign(en, {
  'menu.tipodoc': 'Document types',
  'cap.cadastros.tipodoc.listar': 'List document types', 'cap.cadastros.tipodoc.gerenciar': 'Create and edit document types',
  'tipodoc.crumb': 'Records / Finance / Document types', 'tipodoc.titulo': 'Document types', 'tipodoc.titulo_s': 'Document type',
  'tipodoc.sub': 'Used in the Document type field when posting a title', 'tipodoc.novo': 'New document type', 'tipodoc.buscar': 'Search document type',
  'tipodoc.nome': 'Document type', 'tipodoc.nome_ph': 'e.g. Invoice, Bill, Receipt', 'tipodoc.sem': 'None',
  'comregra.titulo': 'Active commission rules', 'comregra.sub': 'Set the % per order, per salesperson or general, with a period or indefinite validity.',
  'comregra.nova': 'New rule', 'comregra.vazio': 'No rules. Without a rule, each salesperson’s individual % is used.',
  'comregra.nome': 'Rule name', 'comregra.nome_ph': 'e.g. Default, Black Friday, Carla special',
  'comregra.taxa': 'Rate (% per order)', 'comregra.taxa_label': 'Commission rate (% of the order)',
  'comregra.todos': 'All (general)', 'comregra.indet': 'Indefinite', 'comregra.indet_label': 'Indefinite validity (applies while the rule is active)',
  'comregra.dica': 'Blank salesperson = applies to all. Priority: salesperson rule in period → general rule in period → salesperson individual %.',
  'comregra.prioridade': 'Priority when applying: 1) active salesperson rule · 2) active general rule · 3) salesperson individual % (default).',
  'comissao.taxa_invalida': 'Enter a rate between 0 and 100.', 'comissao.periodo_invalido': 'End date cannot be before the start date.',
  'fenv.titulo': 'Set shipping method', 'fenv.forma': 'Delivery method', 'fenv.selecione': 'Select or type…', 'fenv.selecione_motoboy': 'Select the courier…', 'fenv.sem_motoboy': 'No courier registered — add one in Records › People › Couriers.',
  'fenv.detalhe': 'Detail (optional)', 'fenv.detalhe_ph': 'e.g. tracking code, courier name', 'fenv.confirmar': 'Confirm shipment',
  'fenv.cod_rastreio': 'Tracking code', 'fenv.cod_rastreio_ph': 'e.g. BR123456789BR', 'fenv.transportadora': 'Carrier', 'fenv.transportadora_ph': 'Carrier name', 'fenv.retirada_nota': 'The customer picks up the order. Nothing to enter here.', 'fenv.opcional': 'optional',
  'ent.titulo': 'Confirm delivery', 'ent.data': 'Delivery date', 'ent.confirmar': 'Confirm delivery',
  'pedido.forma_envio': 'Shipping method', 'pedido.entregue_em': 'Delivered on', 'pedido.separado_por': 'Picked by', 'pedido.expedido_por': 'Shipped by',
  'pedido.forma_envio_obrigatoria': 'Set the shipping method to dispatch the order.', 'pedido.data_entrega_obrigatoria': 'Enter the delivery date.',
  'menu.rel_pedidos': 'Orders', 'relped.crumb': 'Reports / Orders', 'relped.titulo': 'Orders report',
  'relped.sub': 'All orders in the system, with date and status filters', 'relped.todos': 'All statuses', 'relped.qtd': 'Orders', 'relped.total': 'Total value',
  'menu.suporte': 'Support', 'menu.suporte_sub': 'Help center', 'menu.principal': 'MAIN', 'menu.recolher': 'Collapse menu',
  'menu.chamados': 'Support tickets',
  'menu.campanhas_frete': 'Freight campaigns', 'menu.auditoria': 'Audit log',
  'menu.rel_contas_pagar': 'Payables (accounting)', 'menu.rel_contas_receber': 'Receivables (accounting)', 'menu.rel_vendas_contabil': 'Sales (accounting)',
  'rel.data': 'Date',
  'frete.entrega_retirada': 'Pickup', 'frete.entrega_motoboy': 'Courier', 'frete.entrega_correios': 'Mail', 'frete.entrega_transportadora': 'Carrier',
  'frete.cliente_obrigatorio': 'Select the campaign customer.', 'frete.campanha_tipo_invalido': 'Invalid campaign type.', 'frete.campanha_valor_invalido': 'Invalid campaign value.',
  'relvc.crumb': 'Reports / Sales (accounting)', 'relvc.titulo': 'Sales (accounting)', 'relvc.sub': 'Sale separated from freight, for accounting',
  'relvc.numero': 'Order', 'relvc.cliente': 'Customer', 'relvc.venda': 'Sale', 'relvc.frete_cobrado': 'Freight charged', 'relvc.frete_custo': 'Freight cost', 'relvc.absorvido': 'Freight absorbed', 'relvc.tipo_frete': 'Freight type', 'relvc.total': 'Total',
  'relcp.crumb': 'Reports / Payables', 'relcp.titulo': 'Payables (accounting)', 'relcp.sub': 'All payable entries in the period', 'relcp.categoria': 'Category', 'relcp.fornecedor': 'Supplier', 'relcp.total': 'Total payable', 'relcp.titulos': 'Entries', 'relcp.anexos': 'Attachments', 'relcp.anexar': 'Attach', 'relcp.sub_emissao': 'All payable entries in the period (by issue date)', 'relcp.emissao_de': 'Issued from',
  'relcr.crumb': 'Reports / Receivables', 'relcr.titulo': 'Receivables (accounting)', 'relcr.sub_emissao': 'All receivable entries in the period (by issue date)', 'relcr.cliente': 'Customer', 'relcr.total': 'Total receivable', 'relcr.recebido': 'Received',
  'fretecamp.crumb': 'Logistics / Freight campaigns', 'fretecamp.titulo': 'Freight campaigns', 'fretecamp.sub': 'Free, fixed or discounted freight per customer, with a period', 'fretecamp.nova': 'New freight campaign', 'fretecamp.cliente': 'Customer', 'fretecamp.tipo': 'Type', 'fretecamp.tipo_gratis': 'Free freight', 'fretecamp.tipo_fixo': 'Fixed value', 'fretecamp.tipo_percentual': 'Discount %', 'fretecamp.valor_fixo': 'Charged value', 'fretecamp.valor_pct': 'Discount (%)', 'fretecamp.vigencia': 'Validity', 'fretecamp.motivo': 'Reason', 'fretecamp.motivo_ph': 'e.g. VIP customer', 'fretecamp.vigente': 'Active', 'fretecamp.encerrada': 'Ended', 'fretecamp.excluir_confirma': 'Delete this freight campaign?', 'fretecamp.toast_criada': 'Freight campaign created.',
  'precohist.botao': 'History', 'precohist.titulo': 'Customer price history', 'precohist.sub': 'Negotiated prices applied to this customer', 'precohist.produto': 'Product', 'precohist.preco': 'Price', 'precohist.vigencia': 'Validity', 'precohist.usuario': 'User', 'precohist.quando': 'Date/time', 'precohist.vazio': 'No prices recorded yet.', 'precohist.fixo': 'Fixed',
  'audit.crumb': 'Settings / Audit log', 'audit.titulo': 'Audit log', 'audit.sub': 'Record of who changed what and when', 'audit.usuario': 'User', 'audit.modulo': 'Module', 'audit.acao': 'Action', 'audit.data': 'Date/time', 'audit.todos': 'All',
  'suporte.titulo': 'Contact support', 'suporte.subtitulo': 'Report a bug, a suggestion or ask a question.',
  'suporte.tipo': 'Type', 'suporte.tipo_erro': 'Bug', 'suporte.tipo_sugestao': 'Suggestion', 'suporte.tipo_duvida': 'Question',
  'suporte.assunto': 'Subject', 'suporte.descricao': 'Description', 'suporte.print': 'Screenshot (optional)',
  'suporte.print_enviar': 'Attach image', 'suporte.print_remover': 'Remove',
  'suporte.print_zona': 'Paste the screenshot here (Ctrl+V) or drag the image',
  'suporte.nota_contexto': 'Company, user, current screen and app version are attached automatically.',
  'suporte.enviar': 'Send ticket', 'suporte.enviado': 'Ticket sent to support. Thank you!',
  'suporte.tipo_invalido': 'Select the ticket type.', 'suporte.assunto_invalido': 'Enter a subject (min. 3 characters).',
  'suporte.descricao_invalida': 'Describe the ticket (min. 3 characters).', 'suporte.print_grande': 'The image is too large (max ~3 MB).',
  'suporte.print_invalido': 'Attach an image file.', 'suporte.status_invalido': 'Invalid status.', 'suporte.nao_encontrado': 'Ticket not found.',
  'chamados.crumb': 'Super-admin / Support tickets', 'chamados.titulo': 'Support tickets',
  'chamados.abertos': 'Open', 'chamados.em_andamento': 'In progress', 'chamados.resolvidos': 'Resolved',
  'chamados.f_todos': 'All', 'chamados.f_aberto': 'Open', 'chamados.f_em_andamento': 'In progress', 'chamados.f_resolvido': 'Resolved',
  'chamados.tipo': 'Type', 'chamados.assunto': 'Subject', 'chamados.empresa': 'Company', 'chamados.data': 'Date', 'chamados.status': 'Status',
  'chamados.s_aberto': 'Open', 'chamados.s_em_andamento': 'In progress', 'chamados.s_resolvido': 'Resolved',
  'chamados.usuario': 'User', 'chamados.tela_versao': 'Screen / version', 'chamados.print': 'Attached screenshot',
  'chamados.marcar_andamento': 'Mark in progress', 'chamados.marcar_resolvido': 'Mark resolved', 'chamados.reabrir': 'Reopen',
  'sino.chamados_suporte': 'Open support tickets',
  'sino.chamados_atualizados': 'Your tickets updated',
  'suporte.ver_meus': 'See my tickets',
  'meuschamados.crumb': 'Support / My tickets', 'meuschamados.titulo': 'My tickets',
  'meuschamados.aberto_em': 'Opened on', 'meuschamados.vazio': 'You have no tickets yet.',
  'logout.titulo': 'Sign out?', 'logout.msg': 'You will need to sign in again to access.',
  'menu.bancos': 'Banks', 'cap.cadastros.banco.listar': 'List banks', 'cap.cadastros.banco.gerenciar': 'Create and edit banks',
  'bancos.crumb': 'Records / Finance / Banks', 'bancos.titulo': 'Banks', 'bancos.sub': 'Institutions used in checking accounts and reconciliation',
  'bancos.novo': 'New bank', 'bancos.buscar': 'Search bank', 'bancos.nome': 'Bank', 'bancos.nome_ph': 'e.g. Itaú, Bradesco, Nubank',
  'menu.rel_reembolsos': 'Reimbursements', 'relfav.crumb': 'Reports / Reimbursements', 'relfav.titulo': 'Reimbursements to payees',
  'relfav.sub': 'Payables linked to payees (expense reimbursement)', 'relfav.favorecido': 'Payee', 'relfav.pago_em': 'Paid on', 'relfav.qtd': 'Entries', 'relfav.total': 'Total',
  'menu.fluxo_proj': 'Projected cash flow', 'fluxoproj.crumb': 'Finance / Projected cash flow', 'fluxoproj.titulo': 'Projected cash flow',
  'fluxoproj.sub': '13-week rolling projection (direct method) from open titles',
  'fluxoproj.saldo_inicial': 'Starting balance (current cash)', 'fluxoproj.saldo_final': 'Projected balance (13 wks)', 'fluxoproj.grafico': 'Projected balance per week',
  'fluxoproj.semana': 'Week', 'fluxoproj.periodo': 'Period', 'fluxoproj.saldo': 'Projected balance',
});
Object.assign(es, {
  'menu.tipodoc': 'Tipos de documento',
  'cap.cadastros.tipodoc.listar': 'Listar tipos de documento', 'cap.cadastros.tipodoc.gerenciar': 'Crear y editar tipos de documento',
  'tipodoc.crumb': 'Registros / Finanzas / Tipos de documento', 'tipodoc.titulo': 'Tipos de documento', 'tipodoc.titulo_s': 'Tipo de documento',
  'tipodoc.sub': 'Usados en el campo Tipo de documento al registrar un título', 'tipodoc.novo': 'Nuevo tipo de documento', 'tipodoc.buscar': 'Buscar tipo de documento',
  'tipodoc.nome': 'Tipo de documento', 'tipodoc.nome_ph': 'Ej.: Factura, Boleta, Recibo', 'tipodoc.sem': 'Ninguno',
  'comregra.titulo': 'Reglas de comisión vigentes', 'comregra.sub': 'Define el % por pedido, por vendedor o general, con vigencia por período o indeterminada.',
  'comregra.nova': 'Nueva regla', 'comregra.vazio': 'Sin reglas. Sin regla, se usa el % individual de cada vendedor.',
  'comregra.nome': 'Nombre de la regla', 'comregra.nome_ph': 'Ej.: Estándar, Black Friday, Diferenciada Carla',
  'comregra.taxa': 'Tasa (% por pedido)', 'comregra.taxa_label': 'Tasa de comisión (% sobre el pedido)',
  'comregra.todos': 'Todos (general)', 'comregra.indet': 'Indeterminada', 'comregra.indet_label': 'Vigencia indeterminada (vale mientras la regla esté activa)',
  'comregra.dica': 'Vendedor en blanco = vale para todos. Prioridad: regla del vendedor en el período → regla general en el período → % individual del vendedor.',
  'comregra.prioridade': 'Prioridad al aplicar: 1) regla del vendedor vigente · 2) regla general vigente · 3) % individual del vendedor (predeterminado).',
  'comissao.taxa_invalida': 'Ingresa una tasa entre 0 y 100.', 'comissao.periodo_invalido': 'La fecha final no puede ser anterior a la inicial.',
  'fenv.titulo': 'Informar forma de envío', 'fenv.forma': 'Forma de entrega', 'fenv.selecione': 'Selecciona o escribe…', 'fenv.selecione_motoboy': 'Selecciona el motoboy…', 'fenv.sem_motoboy': 'Ningún motoboy registrado — regístralo en Registros › Personas › Motoboys.',
  'fenv.detalhe': 'Detalle (opcional)', 'fenv.detalhe_ph': 'Ej.: código de seguimiento, nombre del mensajero', 'fenv.confirmar': 'Confirmar expedición',
  'fenv.cod_rastreio': 'Código de seguimiento', 'fenv.cod_rastreio_ph': 'Ej.: BR123456789BR', 'fenv.transportadora': 'Transportista', 'fenv.transportadora_ph': 'Nombre del transportista', 'fenv.retirada_nota': 'El cliente retira el pedido. Nada que informar aquí.', 'fenv.opcional': 'opcional',
  'ent.titulo': 'Confirmar entrega', 'ent.data': 'Fecha de entrega', 'ent.confirmar': 'Confirmar entrega',
  'pedido.forma_envio': 'Forma de envío', 'pedido.entregue_em': 'Entregado el', 'pedido.separado_por': 'Separado por', 'pedido.expedido_por': 'Expedido por',
  'pedido.forma_envio_obrigatoria': 'Informa la forma de envío para expedir el pedido.', 'pedido.data_entrega_obrigatoria': 'Informa la fecha de entrega.',
  'menu.rel_pedidos': 'Pedidos', 'relped.crumb': 'Informes / Pedidos', 'relped.titulo': 'Informe de pedidos',
  'relped.sub': 'Todos los pedidos del sistema, con filtro de fecha y estado', 'relped.todos': 'Todos los estados', 'relped.qtd': 'Pedidos', 'relped.total': 'Valor total',
  'menu.suporte': 'Soporte', 'menu.suporte_sub': 'Centro de ayuda', 'menu.principal': 'PRINCIPAL', 'menu.recolher': 'Recoger menú',
  'menu.chamados': 'Tickets de soporte',
  'menu.campanhas_frete': 'Campañas de flete', 'menu.auditoria': 'Auditoría',
  'menu.rel_contas_pagar': 'Cuentas por pagar (contable)', 'menu.rel_contas_receber': 'Cuentas por cobrar (contable)', 'menu.rel_vendas_contabil': 'Ventas (contable)',
  'rel.data': 'Fecha',
  'frete.entrega_retirada': 'Retiro', 'frete.entrega_motoboy': 'Mensajero', 'frete.entrega_correios': 'Correo', 'frete.entrega_transportadora': 'Transportista',
  'frete.cliente_obrigatorio': 'Selecciona el cliente de la campaña.', 'frete.campanha_tipo_invalido': 'Tipo de campaña inválido.', 'frete.campanha_valor_invalido': 'Valor de campaña inválido.',
  'relvc.crumb': 'Informes / Ventas (contable)', 'relvc.titulo': 'Ventas (contable)', 'relvc.sub': 'Venta separada del flete, para contabilidad',
  'relvc.numero': 'Pedido', 'relvc.cliente': 'Cliente', 'relvc.venda': 'Venta', 'relvc.frete_cobrado': 'Flete cobrado', 'relvc.frete_custo': 'Flete costo', 'relvc.absorvido': 'Flete absorbido', 'relvc.tipo_frete': 'Tipo de flete', 'relvc.total': 'Total',
  'relcp.crumb': 'Informes / Cuentas por pagar', 'relcp.titulo': 'Cuentas por pagar (contable)', 'relcp.sub': 'Todos los títulos a pagar del período', 'relcp.categoria': 'Categoría', 'relcp.fornecedor': 'Proveedor', 'relcp.total': 'Total a pagar', 'relcp.titulos': 'Títulos', 'relcp.anexos': 'Adjuntos', 'relcp.anexar': 'Adjuntar', 'relcp.sub_emissao': 'Todos los títulos a pagar del período (por emisión)', 'relcp.emissao_de': 'Emisión desde',
  'relcr.crumb': 'Informes / Cuentas por cobrar', 'relcr.titulo': 'Cuentas por cobrar (contable)', 'relcr.sub_emissao': 'Todos los títulos a cobrar del período (por emisión)', 'relcr.cliente': 'Cliente', 'relcr.total': 'Total a cobrar', 'relcr.recebido': 'Cobrado',
  'fretecamp.crumb': 'Logística / Campañas de flete', 'fretecamp.titulo': 'Campañas de flete', 'fretecamp.sub': 'Flete gratis, fijo o descuento por cliente, con período', 'fretecamp.nova': 'Nueva campaña de flete', 'fretecamp.cliente': 'Cliente', 'fretecamp.tipo': 'Tipo', 'fretecamp.tipo_gratis': 'Flete gratis', 'fretecamp.tipo_fixo': 'Valor fijo', 'fretecamp.tipo_percentual': 'Descuento %', 'fretecamp.valor_fixo': 'Valor cobrado', 'fretecamp.valor_pct': 'Descuento (%)', 'fretecamp.vigencia': 'Vigencia', 'fretecamp.motivo': 'Motivo', 'fretecamp.motivo_ph': 'Ej.: Cliente VIP', 'fretecamp.vigente': 'Vigente', 'fretecamp.encerrada': 'Finalizada', 'fretecamp.excluir_confirma': '¿Eliminar esta campaña de flete?', 'fretecamp.toast_criada': 'Campaña de flete creada.',
  'precohist.botao': 'Historial', 'precohist.titulo': 'Historial de precios del cliente', 'precohist.sub': 'Precios negociados aplicados a este cliente', 'precohist.produto': 'Producto', 'precohist.preco': 'Precio', 'precohist.vigencia': 'Vigencia', 'precohist.usuario': 'Usuario', 'precohist.quando': 'Fecha/hora', 'precohist.vazio': 'Aún no hay precios registrados.', 'precohist.fixo': 'Fijo',
  'audit.crumb': 'Configuración / Auditoría', 'audit.titulo': 'Auditoría', 'audit.sub': 'Registro de quién cambió qué y cuándo', 'audit.usuario': 'Usuario', 'audit.modulo': 'Módulo', 'audit.acao': 'Acción', 'audit.data': 'Fecha/hora', 'audit.todos': 'Todos',
  'suporte.titulo': 'Contactar soporte', 'suporte.subtitulo': 'Reporta un error, una sugerencia o haz una pregunta.',
  'suporte.tipo': 'Tipo', 'suporte.tipo_erro': 'Error', 'suporte.tipo_sugestao': 'Sugerencia', 'suporte.tipo_duvida': 'Duda',
  'suporte.assunto': 'Asunto', 'suporte.descricao': 'Descripción', 'suporte.print': 'Captura (opcional)',
  'suporte.print_enviar': 'Adjuntar imagen', 'suporte.print_remover': 'Quitar',
  'suporte.print_zona': 'Pega la captura aquí (Ctrl+V) o arrastra la imagen',
  'suporte.nota_contexto': 'Empresa, usuario, pantalla actual y versión del sistema se adjuntan automáticamente.',
  'suporte.enviar': 'Enviar ticket', 'suporte.enviado': 'Ticket enviado al soporte. ¡Gracias!',
  'suporte.tipo_invalido': 'Selecciona el tipo de ticket.', 'suporte.assunto_invalido': 'Indica un asunto (mín. 3 caracteres).',
  'suporte.descricao_invalida': 'Describe el ticket (mín. 3 caracteres).', 'suporte.print_grande': 'La imagen es muy grande (máx. ~3 MB).',
  'suporte.print_invalido': 'Adjunta un archivo de imagen.', 'suporte.status_invalido': 'Estado inválido.', 'suporte.nao_encontrado': 'Ticket no encontrado.',
  'chamados.crumb': 'Super-admin / Tickets de soporte', 'chamados.titulo': 'Tickets de soporte',
  'chamados.abertos': 'Abiertos', 'chamados.em_andamento': 'En curso', 'chamados.resolvidos': 'Resueltos',
  'chamados.f_todos': 'Todos', 'chamados.f_aberto': 'Abiertos', 'chamados.f_em_andamento': 'En curso', 'chamados.f_resolvido': 'Resueltos',
  'chamados.tipo': 'Tipo', 'chamados.assunto': 'Asunto', 'chamados.empresa': 'Empresa', 'chamados.data': 'Fecha', 'chamados.status': 'Estado',
  'chamados.s_aberto': 'Abierto', 'chamados.s_em_andamento': 'En curso', 'chamados.s_resolvido': 'Resuelto',
  'chamados.usuario': 'Usuario', 'chamados.tela_versao': 'Pantalla / versión', 'chamados.print': 'Captura adjunta',
  'chamados.marcar_andamento': 'Marcar en curso', 'chamados.marcar_resolvido': 'Marcar resuelto', 'chamados.reabrir': 'Reabrir',
  'sino.chamados_suporte': 'Tickets de soporte abiertos',
  'sino.chamados_atualizados': 'Tus tickets actualizados',
  'suporte.ver_meus': 'Ver mis tickets',
  'meuschamados.crumb': 'Soporte / Mis tickets', 'meuschamados.titulo': 'Mis tickets',
  'meuschamados.aberto_em': 'Abierto el', 'meuschamados.vazio': 'Aún no abriste tickets.',
  'logout.titulo': '¿Salir del sistema?', 'logout.msg': 'Tendrás que iniciar sesión de nuevo para acceder.',
  'menu.bancos': 'Bancos', 'cap.cadastros.banco.listar': 'Listar bancos', 'cap.cadastros.banco.gerenciar': 'Crear y editar bancos',
  'bancos.crumb': 'Registros / Finanzas / Bancos', 'bancos.titulo': 'Bancos', 'bancos.sub': 'Instituciones usadas en las cuentas corrientes y conciliación',
  'bancos.novo': 'Nuevo banco', 'bancos.buscar': 'Buscar banco', 'bancos.nome': 'Banco', 'bancos.nome_ph': 'Ej.: Itaú, Bradesco, Nubank',
  'menu.rel_reembolsos': 'Reembolsos', 'relfav.crumb': 'Informes / Reembolsos a favorecidos', 'relfav.titulo': 'Reembolsos a favorecidos',
  'relfav.sub': 'Títulos a pagar vinculados a favorecidos (reembolso de gastos)', 'relfav.favorecido': 'Favorecido', 'relfav.pago_em': 'Pagado el', 'relfav.qtd': 'Asientos', 'relfav.total': 'Total',
  'menu.fluxo_proj': 'Flujo proyectado', 'fluxoproj.crumb': 'Finanzas / Flujo de caja proyectado', 'fluxoproj.titulo': 'Flujo de caja proyectado',
  'fluxoproj.sub': 'Proyección rolling de 13 semanas (método directo) a partir de los títulos abiertos',
  'fluxoproj.saldo_inicial': 'Saldo inicial (caja actual)', 'fluxoproj.saldo_final': 'Saldo proyectado (13 sem.)', 'fluxoproj.grafico': 'Saldo proyectado por semana',
  'fluxoproj.semana': 'Semana', 'fluxoproj.periodo': 'Período', 'fluxoproj.saldo': 'Saldo proyectado',
});

// ===== Lote: confirmar baixa, voltar p/ orçamento, busca por nº, competência, metas por dia =====
Object.assign(pt, {
  'pedido.voltar_orcamento': 'Voltar para orçamento',
  'pedido.voltar_orcamento_confirma': 'Voltar este pedido para orçamento? O título a receber gerado será removido.',
  'pedido.voltar_baixa_antes': 'Não dá para voltar: o pagamento já foi baixado. Cancele a baixa no Financeiro antes.',
  'pedido.financeiro': 'Financeiro', 'pedido.vence': 'vence', 'pedido.baixado_em': 'baixado em',
  'pedido.baixado': 'Baixado', 'pedido.em_aberto': 'Em aberto', 'pedido.recebido_por': 'Recebido por',
  'fin.cancelar_baixa_titulo': 'Cancelar baixa?',
  'fin.cancelar_baixa_aviso': 'A baixa do título {n} de {v} será desfeita e o título volta para em aberto.',
  'ent.recebido_por': 'Recebido por', 'ent.recebido_por_ph': 'Nome de quem recebeu (opcional)',
  'com.competencia': 'Competência (mês)', 'com.periodo_personalizado': 'Usar período personalizado', 'com.usar_competencia': 'Usar competência (mês)',
  'pedidos.busca_num_ph': 'Buscar pedido nº…', 'pedidos.busca_num_btn': 'Abrir',
  'metas.calendario': 'Calendário (meta por dia)', 'metas.preencher': 'Preencher calendário',
  'metas.preencher_dica': 'Defina a meta por dia útil/sábado e clique em Preencher calendário para distribuir.',
  'metas.feriado': 'Feriado', 'metas.zerar_dia': 'Zerar dia', 'metas.dia': 'Dia', 'metas.total_mes': 'Total do mês',
  'metas.def_calendario': 'Total definido pelo calendário', 'meta.dia_invalido': 'Dia inválido.',
  'dash.drill_meta': 'Meta do mês', 'dash.drill_atingido': 'Atingido', 'dash.drill_mes': 'Mês', 'dash.acumulado': 'Acumulado',
});
Object.assign(en, {
  'pedido.voltar_orcamento': 'Back to quote',
  'pedido.voltar_orcamento_confirma': 'Move this order back to quote? The generated receivable will be removed.',
  'pedido.voltar_baixa_antes': "Can't go back: the payment was already settled. Cancel the settlement in Finance first.",
  'pedido.financeiro': 'Finance', 'pedido.vence': 'due', 'pedido.baixado_em': 'settled on',
  'pedido.baixado': 'Settled', 'pedido.em_aberto': 'Open', 'pedido.recebido_por': 'Received by',
  'fin.cancelar_baixa_titulo': 'Cancel settlement?',
  'fin.cancelar_baixa_aviso': 'The settlement of title {n} for {v} will be undone and the title goes back to open.',
  'ent.recebido_por': 'Received by', 'ent.recebido_por_ph': "Receiver's name (optional)",
  'com.competencia': 'Period (month)', 'com.periodo_personalizado': 'Use custom range', 'com.usar_competencia': 'Use month',
  'pedidos.busca_num_ph': 'Find order #…', 'pedidos.busca_num_btn': 'Open',
  'metas.calendario': 'Calendar (target per day)', 'metas.preencher': 'Fill calendar',
  'metas.preencher_dica': 'Set the weekday/Saturday target and click Fill calendar to distribute.',
  'metas.feriado': 'Holiday', 'metas.zerar_dia': 'Zero day', 'metas.dia': 'Day', 'metas.total_mes': 'Month total',
  'metas.def_calendario': 'Total set by the calendar', 'meta.dia_invalido': 'Invalid day.',
  'dash.drill_meta': 'Month target', 'dash.drill_atingido': 'Achieved', 'dash.drill_mes': 'Month', 'dash.acumulado': 'Cumulative',
});
Object.assign(es, {
  'pedido.voltar_orcamento': 'Volver a presupuesto',
  'pedido.voltar_orcamento_confirma': '¿Volver este pedido a presupuesto? El título a cobrar generado será eliminado.',
  'pedido.voltar_baixa_antes': 'No se puede volver: el pago ya fue conciliado. Cancela la baja en Finanzas primero.',
  'pedido.financeiro': 'Finanzas', 'pedido.vence': 'vence', 'pedido.baixado_em': 'pagado el',
  'pedido.baixado': 'Pagado', 'pedido.em_aberto': 'Abierto', 'pedido.recebido_por': 'Recibido por',
  'fin.cancelar_baixa_titulo': '¿Cancelar la baja?',
  'fin.cancelar_baixa_aviso': 'La baja del título {n} de {v} se deshará y el título vuelve a abierto.',
  'ent.recebido_por': 'Recibido por', 'ent.recebido_por_ph': 'Nombre de quien recibió (opcional)',
  'com.competencia': 'Competencia (mes)', 'com.periodo_personalizado': 'Usar período personalizado', 'com.usar_competencia': 'Usar competencia (mes)',
  'pedidos.busca_num_ph': 'Buscar pedido n.º…', 'pedidos.busca_num_btn': 'Abrir',
  'metas.calendario': 'Calendario (meta por día)', 'metas.preencher': 'Rellenar calendario',
  'metas.preencher_dica': 'Define la meta por día hábil/sábado y haz clic en Rellenar calendario para distribuir.',
  'metas.feriado': 'Feriado', 'metas.zerar_dia': 'Poner a cero', 'metas.dia': 'Día', 'metas.total_mes': 'Total del mes',
  'metas.def_calendario': 'Total definido por el calendario', 'meta.dia_invalido': 'Día inválido.',
  'dash.drill_meta': 'Meta del mes', 'dash.drill_atingido': 'Alcanzado', 'dash.drill_mes': 'Mes', 'dash.acumulado': 'Acumulado',
});

// ===== Lote: fluxo de caixa (filtro inline, agrupar por mês, badges) + DRE redesenhada =====
Object.assign(pt, {
  'fluxo.filtrar': 'Filtrar', 'fluxo.periodo': 'Período', 'fluxo.por_mes': 'agrupado por mês', 'fluxo.por_semana': 'agrupado por semana',
  'fluxo.clique_mes': 'Clique numa barra para ver os títulos do mês',
  'dre.margem': 'Margem', 'dre.competencia': 'Competência (mês)', 'dre.periodo_personalizado': 'Usar período personalizado', 'dre.usar_competencia': 'Usar competência (mês)',
  'dre.total_receitas': 'Total de receitas', 'dre.total_despesas': 'Total de despesas', 'dre.resultado_periodo': 'Resultado do período',
  'dre.vs_anterior': 'vs período anterior', 'dre.clique_linha': 'Clique numa linha para ver os títulos que a compõem', 'dre.detalhe_titulo': 'Títulos da linha',
});
Object.assign(en, {
  'fluxo.filtrar': 'Filter', 'fluxo.periodo': 'Period', 'fluxo.por_mes': 'grouped by month', 'fluxo.por_semana': 'grouped by week',
  'fluxo.clique_mes': 'Click a bar to see the entries for the month',
  'dre.margem': 'Margin', 'dre.competencia': 'Period (month)', 'dre.periodo_personalizado': 'Use custom range', 'dre.usar_competencia': 'Use month',
  'dre.total_receitas': 'Total revenue', 'dre.total_despesas': 'Total expenses', 'dre.resultado_periodo': 'Period result',
  'dre.vs_anterior': 'vs previous period', 'dre.clique_linha': 'Click a line to see the entries that make it up', 'dre.detalhe_titulo': 'Line entries',
});
Object.assign(es, {
  'fluxo.filtrar': 'Filtrar', 'fluxo.periodo': 'Período', 'fluxo.por_mes': 'agrupado por mes', 'fluxo.por_semana': 'agrupado por semana',
  'fluxo.clique_mes': 'Haz clic en una barra para ver los títulos del mes',
  'dre.margem': 'Margen', 'dre.competencia': 'Competencia (mes)', 'dre.periodo_personalizado': 'Usar período personalizado', 'dre.usar_competencia': 'Usar competencia (mes)',
  'dre.total_receitas': 'Total de ingresos', 'dre.total_despesas': 'Total de gastos', 'dre.resultado_periodo': 'Resultado del período',
  'dre.vs_anterior': 'vs período anterior', 'dre.clique_linha': 'Haz clic en una línea para ver los títulos que la componen', 'dre.detalhe_titulo': 'Títulos de la línea',
});

// ===== Lote: conferência cartão/dinheiro, análise de vendas, nota multi-produto, link =====
Object.assign(pt, {
  'menu.analise': 'Análise de vendas', 'menu.conferencia': 'Conferência de cartão/dinheiro',
  'cap.comercial.analise.ver': 'Análise de vendas',
  'cap.comercial.pedido.vendedor_qualquer': 'Escolher qualquer vendedor no pedido',
  'dash.por_produto': 'Vendas por produto', 'dash.top_cli_valor': 'Top 10 clientes', 'dash.top_cli_qtd': 'Top 10 clientes',
  'fin.forma': 'Forma',
  'conf.crumb': 'Financeiro / Conferência de cartão e dinheiro', 'conf.titulo': 'Conferência de cartão e dinheiro',
  'conf.sub': 'Confirme no fim do dia os recebimentos em cartão e dinheiro (não dá baixa no banco)',
  'conf.dia': 'Dia', 'conf.forma': 'Forma', 'conf.pedido': 'Título', 'conf.status': 'Conferido', 'conf.conferido_em': 'Conferido em',
  'conf.cartao_sistema': 'Cartão (sistema)', 'conf.dinheiro_sistema': 'Dinheiro (sistema)', 'conf.conferido': 'Conferido', 'conf.conferido_st': 'Conferido', 'conf.pendente': 'pendente',
  'conf.confirmar_sel': 'Confirmar selecionados ({n})', 'conf.desfazer': 'desfazer', 'conf.lista': 'Recebimentos em cartão/dinheiro',
  'conf.vazio': 'Nenhum recebimento em cartão ou dinheiro neste dia', 'conf.f_todos': 'Todos', 'conf.f_pendentes': 'Pendentes', 'conf.f_conferidos': 'Conferidos',
  'conf.aviso': 'Confirmar não dá baixa nem altera o saldo do banco — é só a conferência. A baixa acontece quando o valor entra na conta.',
  'conf.toast_confirmado': 'Recebimento conferido', 'conf.toast_desfeito': 'Conferência desfeita',
  'analise.crumb': 'Comercial / Análise de vendas', 'analise.titulo': 'Análise de vendas', 'analise.sub': 'Ranking de vendas por produto, categoria ou cliente',
  'analise.item': 'Item', 'analise.produtos': 'Produtos', 'analise.categorias': 'Categorias', 'analise.clientes_valor': 'Clientes · valor', 'analise.clientes_pedidos': 'Clientes · pedidos',
  'nota.itens': 'Produtos da nota', 'nota.add_produto': 'Adicionar produto', 'nota.subtotal': 'Subtotal',
  'toastreceb.titulo': 'Nota lançada', 'toastreceb.corpo': '{n} produto(s) de {f} · {v} pendente(s) de recebimento no Estoque',
});
Object.assign(en, {
  'menu.analise': 'Sales analysis', 'menu.conferencia': 'Card/cash reconciliation',
  'cap.comercial.analise.ver': 'Sales analysis',
  'cap.comercial.pedido.vendedor_qualquer': 'Choose any sales rep on the order',
  'dash.por_produto': 'Sales by product', 'dash.top_cli_valor': 'Top 10 customers', 'dash.top_cli_qtd': 'Top 10 customers',
  'fin.forma': 'Method',
  'conf.crumb': 'Finance / Card & cash reconciliation', 'conf.titulo': 'Card & cash reconciliation',
  'conf.sub': 'Confirm card and cash receipts at end of day (no bank settlement)',
  'conf.dia': 'Day', 'conf.forma': 'Method', 'conf.pedido': 'Title', 'conf.status': 'Reconciled', 'conf.conferido_em': 'Reconciled at',
  'conf.cartao_sistema': 'Card (system)', 'conf.dinheiro_sistema': 'Cash (system)', 'conf.conferido': 'Reconciled', 'conf.conferido_st': 'Reconciled', 'conf.pendente': 'pending',
  'conf.confirmar_sel': 'Confirm selected ({n})', 'conf.desfazer': 'undo', 'conf.lista': 'Card/cash receipts',
  'conf.vazio': 'No card or cash receipts on this day', 'conf.f_todos': 'All', 'conf.f_pendentes': 'Pending', 'conf.f_conferidos': 'Reconciled',
  'conf.aviso': 'Confirming does not settle nor change the bank balance — it is just the reconciliation. Settlement happens when the money arrives.',
  'conf.toast_confirmado': 'Receipt reconciled', 'conf.toast_desfeito': 'Reconciliation undone',
  'analise.crumb': 'Sales / Sales analysis', 'analise.titulo': 'Sales analysis', 'analise.sub': 'Sales ranking by product, category or customer',
  'analise.item': 'Item', 'analise.produtos': 'Products', 'analise.categorias': 'Categories', 'analise.clientes_valor': 'Customers · value', 'analise.clientes_pedidos': 'Customers · orders',
  'nota.itens': 'Note products', 'nota.add_produto': 'Add product', 'nota.subtotal': 'Subtotal',
  'toastreceb.titulo': 'Note created', 'toastreceb.corpo': '{n} product(s) from {f} · {v} pending receipt in Stock',
});
Object.assign(es, {
  'menu.analise': 'Análisis de ventas', 'menu.conferencia': 'Conciliación de tarjeta/efectivo',
  'cap.comercial.analise.ver': 'Análisis de ventas',
  'cap.comercial.pedido.vendedor_qualquer': 'Elegir cualquier vendedor en el pedido',
  'dash.por_produto': 'Ventas por producto', 'dash.top_cli_valor': 'Top 10 clientes', 'dash.top_cli_qtd': 'Top 10 clientes',
  'fin.forma': 'Forma',
  'conf.crumb': 'Finanzas / Conciliación de tarjeta y efectivo', 'conf.titulo': 'Conciliación de tarjeta y efectivo',
  'conf.sub': 'Confirma al final del día los cobros con tarjeta y efectivo (no da baja en el banco)',
  'conf.dia': 'Día', 'conf.forma': 'Forma', 'conf.pedido': 'Título', 'conf.status': 'Conciliado', 'conf.conferido_em': 'Conciliado el',
  'conf.cartao_sistema': 'Tarjeta (sistema)', 'conf.dinheiro_sistema': 'Efectivo (sistema)', 'conf.conferido': 'Conciliado', 'conf.conferido_st': 'Conciliado', 'conf.pendente': 'pendiente',
  'conf.confirmar_sel': 'Confirmar seleccionados ({n})', 'conf.desfazer': 'deshacer', 'conf.lista': 'Cobros con tarjeta/efectivo',
  'conf.vazio': 'Ningún cobro con tarjeta o efectivo en este día', 'conf.f_todos': 'Todos', 'conf.f_pendentes': 'Pendientes', 'conf.f_conferidos': 'Conciliados',
  'conf.aviso': 'Confirmar no da baja ni cambia el saldo del banco — es solo la conciliación. La baja ocurre cuando el dinero entra en la cuenta.',
  'conf.toast_confirmado': 'Cobro conciliado', 'conf.toast_desfeito': 'Conciliación deshecha',
  'analise.crumb': 'Comercial / Análisis de ventas', 'analise.titulo': 'Análisis de ventas', 'analise.sub': 'Ranking de ventas por producto, categoría o cliente',
  'analise.item': 'Ítem', 'analise.produtos': 'Productos', 'analise.categorias': 'Categorías', 'analise.clientes_valor': 'Clientes · valor', 'analise.clientes_pedidos': 'Clientes · pedidos',
  'nota.itens': 'Productos de la nota', 'nota.add_produto': 'Agregar producto', 'nota.subtotal': 'Subtotal',
  'toastreceb.titulo': 'Nota emitida', 'toastreceb.corpo': '{n} producto(s) de {f} · {v} pendiente(s) de recepción en Stock',
});
Object.assign(pt, { 'sino.recebimentos': 'Entradas pendentes de recebimento' });
Object.assign(en, { 'sino.recebimentos': 'Entries pending receipt' });
Object.assign(es, { 'sino.recebimentos': 'Entradas pendientes de recepción' });

Object.assign(pt, {
  'sino.aguard_separacao': 'Pedidos aguardando separação',
  'toastsep.titulo': 'Pedido liberado para separação',
  'toastsep.corpo': '{n} ({c} · {v}) foi aprovado e está pronto para separação.',
});
Object.assign(en, {
  'sino.aguard_separacao': 'Orders awaiting picking',
  'toastsep.titulo': 'Order released for picking',
  'toastsep.corpo': '{n} ({c} · {v}) was approved and is ready for picking.',
});
Object.assign(es, {
  'sino.aguard_separacao': 'Pedidos esperando separación',
  'toastsep.titulo': 'Pedido liberado para separación',
  'toastsep.corpo': '{n} ({c} · {v}) fue aprobado y está listo para separación.',
});

// ===== Lote: reembolso a terceiro (favorecido) =====
Object.assign(pt, {
  'fin.reembolso': 'Reembolso a terceiro', 'fin.reembolso_hint': '(pago por um favorecido)',
  'fin.reembolso_marcar': 'Este título é reembolso a terceiro',
  'fin.favorecido_reembolsar': 'Favorecido a reembolsar', 'fin.favorecido_escolha': 'Escolha o favorecido',
  'fin.favorecido_forma': 'Forma de pagamento do favorecido', 'fin.favorecido_pago_em': 'Pago pelo favorecido em',
  'fin.data_reembolso': 'Data de reembolso ao favorecido',
  'fin.reembolso_nota': 'Vira um título a pagar ao favorecido. A baixa = quando você reembolsar (entra no fluxo de caixa).',
  'fin.toast_reembolso': 'Reembolso atualizado',
  'relfav.a_reembolsar': 'A reembolsar', 'relfav.reembolsado': 'Já reembolsado', 'relfav.terceiros': 'Terceiros',
  'relfav.a_reembolsar_st': 'A reembolsar', 'relfav.reembolsado_st': 'Reembolsado',
  'relfav.reembolsar': 'Reembolsar', 'relfav.toast_reembolsado': 'Reembolso efetuado',
  'relfav.banco_conta': 'Banco (conta de saída)', 'relfav.sem_conta': 'Selecione a conta',
  'relfav.reembolsar_nota': 'Baixa o título no Contas a pagar e lança a saída no fluxo de caixa nessa conta.',
  'relfav.confirmar_reembolso': 'Confirmar reembolso',
});
Object.assign(en, {
  'fin.reembolso': 'Reimburse a third party', 'fin.reembolso_hint': '(paid by a payee)',
  'fin.reembolso_marcar': 'This title is a third-party reimbursement',
  'fin.favorecido_reembolsar': 'Payee to reimburse', 'fin.favorecido_escolha': 'Choose the payee',
  'fin.favorecido_forma': "Payee's payment method", 'fin.favorecido_pago_em': 'Paid by payee on',
  'fin.data_reembolso': 'Reimbursement date',
  'fin.reembolso_nota': 'Becomes a payable to the payee. Settlement = when you reimburse (hits cash flow).',
  'fin.toast_reembolso': 'Reimbursement updated',
  'relfav.a_reembolsar': 'To reimburse', 'relfav.reembolsado': 'Reimbursed', 'relfav.terceiros': 'Third parties',
  'relfav.a_reembolsar_st': 'To reimburse', 'relfav.reembolsado_st': 'Reimbursed',
  'relfav.reembolsar': 'Reimburse', 'relfav.toast_reembolsado': 'Reimbursement done',
  'relfav.banco_conta': 'Bank (source account)', 'relfav.sem_conta': 'Select the account',
  'relfav.reembolsar_nota': 'Settles the payable and posts the outflow to cash flow in that account.',
  'relfav.confirmar_reembolso': 'Confirm reimbursement',
});
Object.assign(es, {
  'fin.reembolso': 'Reembolso a tercero', 'fin.reembolso_hint': '(pagado por un favorecido)',
  'fin.reembolso_marcar': 'Este título es reembolso a tercero',
  'fin.favorecido_reembolsar': 'Favorecido a reembolsar', 'fin.favorecido_escolha': 'Elige el favorecido',
  'fin.favorecido_forma': 'Forma de pago del favorecido', 'fin.favorecido_pago_em': 'Pagado por el favorecido el',
  'fin.data_reembolso': 'Fecha de reembolso al favorecido',
  'fin.reembolso_nota': 'Se vuelve un título a pagar al favorecido. La baja = cuando reembolses (entra al flujo de caja).',
  'fin.toast_reembolso': 'Reembolso actualizado',
  'relfav.a_reembolsar': 'A reembolsar', 'relfav.reembolsado': 'Ya reembolsado', 'relfav.terceiros': 'Terceros',
  'relfav.a_reembolsar_st': 'A reembolsar', 'relfav.reembolsado_st': 'Reembolsado',
  'relfav.reembolsar': 'Reembolsar', 'relfav.toast_reembolsado': 'Reembolso realizado',
  'relfav.banco_conta': 'Banco (cuenta de salida)', 'relfav.sem_conta': 'Selecciona la cuenta',
  'relfav.reembolsar_nota': 'Da de baja el título a pagar y registra la salida en el flujo de caja en esa cuenta.',
  'relfav.confirmar_reembolso': 'Confirmar reembolso',
});

// ===== Fase 7A — Configuração fiscal (NF-e via Focus NFe) =====
Object.assign(pt, {
  'fiscal.titulo': 'Fiscal (NF-e)',
  'fiscal.sub': 'Emissão de nota fiscal eletrônica via Focus NFe. Configure o regime, o ambiente, o token e o perfil de operação padrão.',
  'fiscal.regime': 'Regime tributário',
  'fiscal.regime_1': 'Simples Nacional',
  'fiscal.regime_2': 'Simples Nacional (excesso de sublimite)',
  'fiscal.regime_3': 'Regime Normal (Lucro Presumido/Real)',
  'fiscal.ambiente': 'Ambiente',
  'fiscal.amb_homologacao': 'Homologação (teste, sem valor fiscal)',
  'fiscal.amb_producao': 'Produção (valor fiscal)',
  'fiscal.token_homologacao': 'Token Focus (homologação)',
  'fiscal.token_producao': 'Token Focus (produção)',
  'fiscal.token_configurado': 'configurado ✓',
  'fiscal.token_ph': 'deixe em branco para manter o atual',
  'fiscal.token_hint': 'O token fica só no servidor — não é exibido depois de salvo.',
  'fiscal.perfil': 'Perfil de operação padrão',
  'fiscal.perfil_hint': 'Aplicado a toda venda; cada produto pode sobrescrever campos específicos.',
  'fiscal.natureza': 'Natureza da operação',
  'fiscal.cfop_dentro': 'CFOP dentro do estado',
  'fiscal.cfop_fora': 'CFOP interestadual',
  'fiscal.origem': 'Origem da mercadoria',
  'fiscal.csosn': 'CSOSN padrão',
  'fiscal.cst_icms': 'CST de ICMS',
  'fiscal.aliquota_icms': 'Alíquota interna de ICMS (%)',
  'fiscal.aliquota_icms_hint': 'Usada nas vendas dentro do estado. A interestadual (7%/12%) é calculada automática pela região do destino.',
  'fiscal.pis_cst': 'CST de PIS',
  'fiscal.cofins_cst': 'CST de COFINS',
  'fiscal.salvo': 'Configuração fiscal salva.',
  'fiscal.regime_invalido': 'Regime tributário inválido.',
  'fiscal.ambiente_invalido': 'Ambiente inválido.',
  'fiscal.cfop_invalido': 'CFOP inválido (4 dígitos).',
  'fiscal.origem_invalida': 'Origem inválida (0 a 8).',
  'fiscal.aliquota_invalida': 'Alíquota inválida (0 a 100).',
  'fiscal.natureza_invalida': 'Informe a natureza da operação.',
  'produtos.fiscal': 'Dados fiscais (NF-e)',
  'produtos.fiscal_hint': 'NCM é obrigatório para emitir a nota. CFOP, CST/CSOSN e origem são opcionais — em branco, herdam o perfil padrão da empresa.',
  'produtos.ncm': 'NCM',
  'produtos.ncm_ph': '8 dígitos',
  'produtos.cfop_override': 'CFOP (opcional)',
  'produtos.cst_override': 'CST/CSOSN (opcional)',
  'produtos.origem_override': 'Origem (opcional)',
  'produto.ncm_invalido': 'NCM inválido (8 dígitos).',
  'produto.cfop_invalido': 'CFOP inválido (4 dígitos).',
  'produto.origem_invalida': 'Origem inválida (0 a 8).',
});
Object.assign(en, {
  'fiscal.titulo': 'Tax / Invoice (NF-e)',
  'fiscal.sub': 'Electronic invoice issuing via Focus NFe. Set the tax regime, environment, token and default operation profile.',
  'fiscal.regime': 'Tax regime',
  'fiscal.regime_1': 'Simples Nacional',
  'fiscal.regime_2': 'Simples Nacional (over sublimit)',
  'fiscal.regime_3': 'Regular regime',
  'fiscal.ambiente': 'Environment',
  'fiscal.amb_homologacao': 'Sandbox (test, no fiscal value)',
  'fiscal.amb_producao': 'Production (fiscal value)',
  'fiscal.token_homologacao': 'Focus token (sandbox)',
  'fiscal.token_producao': 'Focus token (production)',
  'fiscal.token_configurado': 'configured ✓',
  'fiscal.token_ph': 'leave blank to keep current',
  'fiscal.token_hint': 'The token stays server-side only — not shown after saving.',
  'fiscal.perfil': 'Default operation profile',
  'fiscal.perfil_hint': 'Applied to every sale; each product may override specific fields.',
  'fiscal.natureza': 'Operation nature',
  'fiscal.cfop_dentro': 'CFOP within state',
  'fiscal.cfop_fora': 'CFOP interstate',
  'fiscal.origem': 'Goods origin',
  'fiscal.csosn': 'Default CSOSN',
  'fiscal.cst_icms': 'ICMS CST',
  'fiscal.aliquota_icms': 'Internal ICMS rate (%)',
  'fiscal.aliquota_icms_hint': 'Used for in-state sales. The interstate rate (7%/12%) is computed automatically by the destination region.',
  'fiscal.pis_cst': 'PIS CST',
  'fiscal.cofins_cst': 'COFINS CST',
  'fiscal.salvo': 'Tax configuration saved.',
  'fiscal.regime_invalido': 'Invalid tax regime.',
  'fiscal.ambiente_invalido': 'Invalid environment.',
  'fiscal.cfop_invalido': 'Invalid CFOP (4 digits).',
  'fiscal.origem_invalida': 'Invalid origin (0 to 8).',
  'fiscal.aliquota_invalida': 'Invalid rate (0 to 100).',
  'fiscal.natureza_invalida': 'Enter the operation nature.',
  'produtos.fiscal': 'Tax data (NF-e)',
  'produtos.fiscal_hint': 'NCM is required to issue the invoice. CFOP, CST/CSOSN and origin are optional — blank inherits the company default profile.',
  'produtos.ncm': 'NCM',
  'produtos.ncm_ph': '8 digits',
  'produtos.cfop_override': 'CFOP (optional)',
  'produtos.cst_override': 'CST/CSOSN (optional)',
  'produtos.origem_override': 'Origin (optional)',
  'produto.ncm_invalido': 'Invalid NCM (8 digits).',
  'produto.cfop_invalido': 'Invalid CFOP (4 digits).',
  'produto.origem_invalida': 'Invalid origin (0 to 8).',
});
Object.assign(es, {
  'fiscal.titulo': 'Fiscal (NF-e)',
  'fiscal.sub': 'Emisión de factura electrónica vía Focus NFe. Configura el régimen, el ambiente, el token y el perfil de operación predeterminado.',
  'fiscal.regime': 'Régimen tributario',
  'fiscal.regime_1': 'Simples Nacional',
  'fiscal.regime_2': 'Simples Nacional (exceso de sublímite)',
  'fiscal.regime_3': 'Régimen Normal',
  'fiscal.ambiente': 'Ambiente',
  'fiscal.amb_homologacao': 'Homologación (prueba, sin valor fiscal)',
  'fiscal.amb_producao': 'Producción (valor fiscal)',
  'fiscal.token_homologacao': 'Token Focus (homologación)',
  'fiscal.token_producao': 'Token Focus (producción)',
  'fiscal.token_configurado': 'configurado ✓',
  'fiscal.token_ph': 'déjalo en blanco para mantener',
  'fiscal.token_hint': 'El token queda solo en el servidor — no se muestra después de guardar.',
  'fiscal.perfil': 'Perfil de operación predeterminado',
  'fiscal.perfil_hint': 'Aplicado a toda venta; cada producto puede sobrescribir campos específicos.',
  'fiscal.natureza': 'Naturaleza de la operación',
  'fiscal.cfop_dentro': 'CFOP dentro del estado',
  'fiscal.cfop_fora': 'CFOP interestatal',
  'fiscal.origem': 'Origen de la mercancía',
  'fiscal.csosn': 'CSOSN predeterminado',
  'fiscal.cst_icms': 'CST de ICMS',
  'fiscal.aliquota_icms': 'Alícuota interna de ICMS (%)',
  'fiscal.aliquota_icms_hint': 'Usada en ventas dentro del estado. La interestatal (7%/12%) se calcula automáticamente por la región del destino.',
  'fiscal.pis_cst': 'CST de PIS',
  'fiscal.cofins_cst': 'CST de COFINS',
  'fiscal.salvo': 'Configuración fiscal guardada.',
  'fiscal.regime_invalido': 'Régimen tributario inválido.',
  'fiscal.ambiente_invalido': 'Ambiente inválido.',
  'fiscal.cfop_invalido': 'CFOP inválido (4 dígitos).',
  'fiscal.origem_invalida': 'Origen inválido (0 a 8).',
  'fiscal.aliquota_invalida': 'Alícuota inválida (0 a 100).',
  'fiscal.natureza_invalida': 'Informa la naturaleza de la operación.',
  'produtos.fiscal': 'Datos fiscales (NF-e)',
  'produtos.fiscal_hint': 'El NCM es obligatorio para emitir la factura. CFOP, CST/CSOSN y origen son opcionales — en blanco, heredan el perfil predeterminado de la empresa.',
  'produtos.ncm': 'NCM',
  'produtos.ncm_ph': '8 dígitos',
  'produtos.cfop_override': 'CFOP (opcional)',
  'produtos.cst_override': 'CST/CSOSN (opcional)',
  'produtos.origem_override': 'Origen (opcional)',
  'produto.ncm_invalido': 'NCM inválido (8 dígitos).',
  'produto.cfop_invalido': 'CFOP inválido (4 dígitos).',
  'produto.origem_invalida': 'Origen inválido (0 a 8).',
});

// ===== Fase 7B — Emissão de NF-e (Focus NFe) =====
Object.assign(pt, {
  'fiscal.numero_emitente': 'Número do endereço (emitente)',
  'fiscal.complemento_emitente': 'Complemento (emitente)',
  'cap.modulo.fiscal': 'Fiscal',
  'cap.fiscal.nota.ver': 'Ver / baixar notas fiscais',
  'cap.fiscal.nota.emitir': 'Emitir / cancelar NF-e',
  'nf.titulo': 'Nota fiscal (NF-e)',
  'nf.nao_emitida': 'Nenhuma NF-e emitida para este pedido.',
  'nf.somente_expedido': 'A NF-e pode ser emitida quando o pedido for expedido ou entregue.',
  'nf.emitir': 'Emitir NF-e',
  'nf.reemitir': 'Emitir novamente',
  'nf.emitida': 'NF-e enviada para autorização.',
  'nf.status_processando': 'Processando',
  'nf.processando_hint': 'A SEFAZ está autorizando a nota. Pode levar alguns segundos.',
  'nf.atualizar': 'Atualizar',
  'nf.status_autorizado': 'Autorizada',
  'nf.status_erro': 'Erro na emissão',
  'nf.status_cancelado': 'Cancelada',
  'nf.numero': 'Nº',
  'nf.serie': 'série',
  'nf.danfe': 'Baixar DANFE',
  'nf.xml': 'Baixar XML',
  'fiscal.nota.status_invalido': 'A NF-e só pode ser emitida com o pedido expedido ou entregue.',
  'fiscal.nota.ja_emitida': 'Este pedido já tem uma NF-e emitida ou em processamento.',
  'fiscal.nota.emitente_incompleto': 'Complete os dados do emitente (CNPJ, IE e endereço com número) em Dados da empresa › Fiscal.',
  'fiscal.nota.token_ausente': 'Configure o token da Focus NFe em Dados da empresa › Fiscal.',
  'fiscal.nota.sem_cliente': 'O pedido não tem cliente para ser o destinatário da NF-e.',
  'fiscal.nota.destinatario_incompleto': 'Complete o endereço e o documento do cliente (destinatário).',
  'fiscal.nota.sem_ncm': 'Há produto sem NCM. Informe o NCM no cadastro do produto.',
  'fiscal.nota.sem_itens': 'O pedido não tem itens.',
  'fiscal.nota.indisponivel': 'DANFE/XML indisponível: a nota não está autorizada.',
});
Object.assign(en, {
  'fiscal.numero_emitente': 'Address number (issuer)',
  'fiscal.complemento_emitente': 'Complement (issuer)',
  'cap.modulo.fiscal': 'Tax / Invoice',
  'cap.fiscal.nota.ver': 'View / download invoices',
  'cap.fiscal.nota.emitir': 'Issue / cancel NF-e',
  'nf.titulo': 'Invoice (NF-e)',
  'nf.nao_emitida': 'No NF-e issued for this order.',
  'nf.somente_expedido': 'The NF-e can be issued once the order is shipped or delivered.',
  'nf.emitir': 'Issue NF-e',
  'nf.reemitir': 'Issue again',
  'nf.emitida': 'NF-e sent for authorization.',
  'nf.status_processando': 'Processing',
  'nf.processando_hint': 'SEFAZ is authorizing the invoice. It may take a few seconds.',
  'nf.atualizar': 'Refresh',
  'nf.status_autorizado': 'Authorized',
  'nf.status_erro': 'Issuing error',
  'nf.status_cancelado': 'Cancelled',
  'nf.numero': 'No.',
  'nf.serie': 'series',
  'nf.danfe': 'Download DANFE',
  'nf.xml': 'Download XML',
  'fiscal.nota.status_invalido': 'The NF-e can only be issued when the order is shipped or delivered.',
  'fiscal.nota.ja_emitida': 'This order already has an issued or processing NF-e.',
  'fiscal.nota.emitente_incompleto': 'Complete the issuer data (CNPJ, IE and address with number) in Company data › Tax.',
  'fiscal.nota.token_ausente': 'Set the Focus NFe token in Company data › Tax.',
  'fiscal.nota.sem_cliente': 'The order has no customer to be the NF-e recipient.',
  'fiscal.nota.destinatario_incompleto': 'Complete the customer address and document (recipient).',
  'fiscal.nota.sem_ncm': 'A product has no NCM. Set the NCM in the product registration.',
  'fiscal.nota.sem_itens': 'The order has no items.',
  'fiscal.nota.indisponivel': 'DANFE/XML unavailable: the invoice is not authorized.',
});
Object.assign(es, {
  'fiscal.numero_emitente': 'Número de la dirección (emisor)',
  'fiscal.complemento_emitente': 'Complemento (emisor)',
  'cap.modulo.fiscal': 'Fiscal',
  'cap.fiscal.nota.ver': 'Ver / descargar facturas',
  'cap.fiscal.nota.emitir': 'Emitir / cancelar NF-e',
  'nf.titulo': 'Factura (NF-e)',
  'nf.nao_emitida': 'Ninguna NF-e emitida para este pedido.',
  'nf.somente_expedido': 'La NF-e puede emitirse cuando el pedido sea expedido o entregado.',
  'nf.emitir': 'Emitir NF-e',
  'nf.reemitir': 'Emitir de nuevo',
  'nf.emitida': 'NF-e enviada para autorización.',
  'nf.status_processando': 'Procesando',
  'nf.processando_hint': 'La SEFAZ está autorizando la factura. Puede tardar unos segundos.',
  'nf.atualizar': 'Actualizar',
  'nf.status_autorizado': 'Autorizada',
  'nf.status_erro': 'Error en la emisión',
  'nf.status_cancelado': 'Cancelada',
  'nf.numero': 'N.º',
  'nf.serie': 'serie',
  'nf.danfe': 'Descargar DANFE',
  'nf.xml': 'Descargar XML',
  'fiscal.nota.status_invalido': 'La NF-e solo puede emitirse con el pedido expedido o entregado.',
  'fiscal.nota.ja_emitida': 'Este pedido ya tiene una NF-e emitida o en proceso.',
  'fiscal.nota.emitente_incompleto': 'Completa los datos del emisor (CNPJ, IE y dirección con número) en Datos de la empresa › Fiscal.',
  'fiscal.nota.token_ausente': 'Configura el token de Focus NFe en Datos de la empresa › Fiscal.',
  'fiscal.nota.sem_cliente': 'El pedido no tiene cliente para ser el destinatario de la NF-e.',
  'fiscal.nota.destinatario_incompleto': 'Completa la dirección y el documento del cliente (destinatario).',
  'fiscal.nota.sem_ncm': 'Hay un producto sin NCM. Informa el NCM en el registro del producto.',
  'fiscal.nota.sem_itens': 'El pedido no tiene ítems.',
  'fiscal.nota.indisponivel': 'DANFE/XML no disponible: la factura no está autorizada.',
});

// ===== Anexos de documentos no cadastro de cliente =====
Object.assign(pt, {
  'anexo.cliente': 'Documentos do cliente',
  'anexo.salve_primeiro': 'Salve o cliente primeiro para anexar documentos.',
  'anexo.cliente_invalido': 'Cliente inválido para anexar o documento.',
});
Object.assign(en, {
  'anexo.cliente': 'Customer documents',
  'anexo.salve_primeiro': 'Save the customer first to attach documents.',
  'anexo.cliente_invalido': 'Invalid customer for attaching the document.',
});
Object.assign(es, {
  'anexo.cliente': 'Documentos del cliente',
  'anexo.salve_primeiro': 'Guarda el cliente primero para adjuntar documentos.',
  'anexo.cliente_invalido': 'Cliente inválido para adjuntar el documento.',
});

Object.assign(pt, { 'nf.resposta_provedor': 'A Focus NFe respondeu:' });
Object.assign(en, { 'nf.resposta_provedor': 'Focus NFe replied:' });
Object.assign(es, { 'nf.resposta_provedor': 'Focus NFe respondió:' });

// ===== Fase 7C — Cancelamento de NF-e =====
Object.assign(pt, {
  'nf.cancelar': 'Cancelar NF-e',
  'nf.justificativa': 'Justificativa do cancelamento',
  'nf.justificativa_hint': 'Mínimo de 15 caracteres.',
  'nf.confirmar_cancelamento': 'Confirmar cancelamento',
  'nf.cancelando': 'Cancelando…',
  'nf.cancelada_ok': 'NF-e cancelada.',
  'fiscal.nota.justificativa_invalida': 'A justificativa deve ter entre 15 e 255 caracteres.',
  'fiscal.nota.nao_cancelavel': 'Só é possível cancelar uma NF-e autorizada.',
  'fiscal.nota.cancelamento_falhou': 'Não foi possível cancelar a NF-e.',
});
Object.assign(en, {
  'nf.cancelar': 'Cancel NF-e',
  'nf.justificativa': 'Cancellation reason',
  'nf.justificativa_hint': 'Minimum 15 characters.',
  'nf.confirmar_cancelamento': 'Confirm cancellation',
  'nf.cancelando': 'Cancelling…',
  'nf.cancelada_ok': 'NF-e cancelled.',
  'fiscal.nota.justificativa_invalida': 'The reason must be 15 to 255 characters.',
  'fiscal.nota.nao_cancelavel': 'Only an authorized NF-e can be cancelled.',
  'fiscal.nota.cancelamento_falhou': 'Could not cancel the NF-e.',
});
Object.assign(es, {
  'nf.cancelar': 'Cancelar NF-e',
  'nf.justificativa': 'Justificación de la cancelación',
  'nf.justificativa_hint': 'Mínimo 15 caracteres.',
  'nf.confirmar_cancelamento': 'Confirmar cancelación',
  'nf.cancelando': 'Cancelando…',
  'nf.cancelada_ok': 'NF-e cancelada.',
  'fiscal.nota.justificativa_invalida': 'La justificación debe tener entre 15 y 255 caracteres.',
  'fiscal.nota.nao_cancelavel': 'Solo se puede cancelar una NF-e autorizada.',
  'fiscal.nota.cancelamento_falhou': 'No se pudo cancelar la NF-e.',
});

// ===== Tela central de Notas fiscais =====
Object.assign(pt, {
  'menu.notas_fiscais': 'Notas fiscais',
  'nf.tela_titulo': 'Notas fiscais (NF-e)',
  'nf.tela_sub': 'Acompanhe as notas emitidas, baixe DANFE/XML e os XMLs do período (para a contabilidade).',
  'nf.f_todas': 'Todas',
  'nf.status_titulo': 'Status',
  'nf.pedido': 'Pedido',
  'nf.valor': 'Valor',
  'nf.emitida_em': 'Emitida em',
  'nf.kpi_autorizadas': 'Autorizadas',
  'nf.kpi_valor': 'Valor autorizado',
  'nf.kpi_canceladas': 'Canceladas',
  'nf.kpi_erro': 'Com erro',
  'nf.buscar': 'nº, chave ou cliente',
  'nf.baixar_xmls': 'Baixar XMLs (zip)',
  'nf.baixando': 'Gerando zip…',
  'nf.ver_pedido': 'Ver pedido',
  'nf.sem_xml': 'Nenhuma nota autorizada no filtro para baixar.',
});
Object.assign(en, {
  'menu.notas_fiscais': 'Invoices',
  'nf.tela_titulo': 'Invoices (NF-e)',
  'nf.tela_sub': 'Track issued invoices, download DANFE/XML and the period XMLs (for accounting).',
  'nf.f_todas': 'All',
  'nf.status_titulo': 'Status',
  'nf.pedido': 'Order',
  'nf.valor': 'Amount',
  'nf.emitida_em': 'Issued at',
  'nf.kpi_autorizadas': 'Authorized',
  'nf.kpi_valor': 'Authorized amount',
  'nf.kpi_canceladas': 'Cancelled',
  'nf.kpi_erro': 'With error',
  'nf.buscar': 'no., key or customer',
  'nf.baixar_xmls': 'Download XMLs (zip)',
  'nf.baixando': 'Building zip…',
  'nf.ver_pedido': 'View order',
  'nf.sem_xml': 'No authorized invoice in the filter to download.',
});
Object.assign(es, {
  'menu.notas_fiscais': 'Facturas',
  'nf.tela_titulo': 'Facturas (NF-e)',
  'nf.tela_sub': 'Sigue las facturas emitidas, descarga DANFE/XML y los XML del período (para la contabilidad).',
  'nf.f_todas': 'Todas',
  'nf.status_titulo': 'Estado',
  'nf.pedido': 'Pedido',
  'nf.valor': 'Importe',
  'nf.emitida_em': 'Emitida el',
  'nf.kpi_autorizadas': 'Autorizadas',
  'nf.kpi_valor': 'Importe autorizado',
  'nf.kpi_canceladas': 'Canceladas',
  'nf.kpi_erro': 'Con error',
  'nf.buscar': 'n.º, clave o cliente',
  'nf.baixar_xmls': 'Descargar XMLs (zip)',
  'nf.baixando': 'Generando zip…',
  'nf.ver_pedido': 'Ver pedido',
  'nf.sem_xml': 'Ninguna factura autorizada en el filtro para descargar.',
});

// ===== Perfil multi-empresa (super-admin) =====
Object.assign(pt, {
  'perfis.multi': 'Perfil multi-empresa',
  'perfis.multi_ajuda': 'Defina o perfil (nome + permissões) e aplique nas empresas marcadas. Onde já existir o mesmo nome, as permissões são atualizadas; as desmarcadas não são alteradas.',
  'perfis.multi_buscar': 'Buscar',
  'perfis.multi_empresas': 'Aplicar nas empresas',
  'perfis.multi_vazio': 'Nenhuma empresa.',
  'perfis.multi_existe': 'já existe',
  'perfis.multi_novo': 'novo',
  'perfis.multi_aplicar': 'Aplicar perfil',
});
Object.assign(en, {
  'perfis.multi': 'Multi-company profile',
  'perfis.multi_ajuda': 'Define the profile (name + permissions) and apply it to the checked companies. Where the same name already exists, permissions are updated; unchecked companies are left untouched.',
  'perfis.multi_buscar': 'Search',
  'perfis.multi_empresas': 'Apply to companies',
  'perfis.multi_vazio': 'No company.',
  'perfis.multi_existe': 'exists',
  'perfis.multi_novo': 'new',
  'perfis.multi_aplicar': 'Apply profile',
});
Object.assign(es, {
  'perfis.multi': 'Perfil multiempresa',
  'perfis.multi_ajuda': 'Define el perfil (nombre + permisos) y aplícalo en las empresas marcadas. Donde ya exista el mismo nombre, los permisos se actualizan; las no marcadas no se modifican.',
  'perfis.multi_buscar': 'Buscar',
  'perfis.multi_empresas': 'Aplicar en las empresas',
  'perfis.multi_vazio': 'Ninguna empresa.',
  'perfis.multi_existe': 'ya existe',
  'perfis.multi_novo': 'nuevo',
  'perfis.multi_aplicar': 'Aplicar perfil',
});

// ===== Plano de contas + vínculo na categoria financeira =====
Object.assign(pt, {
  'menu.plano_contas': 'Plano de contas',
  'plano.crumb': 'Cadastros / Financeiro / Plano de contas',
  'plano.titulo': 'Plano de contas', 'plano.sub': 'Contas contábeis usadas na categoria financeira e no DRE.',
  'plano.nova': 'Nova conta', 'plano.buscar': 'Buscar conta', 'plano.codigo': 'Código', 'plano.descricao': 'Descrição',
  'plano.tipo': 'Tipo', 'plano.pai': 'Conta-pai', 'plano.sem_pai': 'Nenhuma (conta de topo)',
  'plano.tipo_receita': 'Receita', 'plano.tipo_despesa': 'Despesa', 'plano.tipo_ativo': 'Ativo', 'plano.tipo_passivo': 'Passivo',
  'catfin.conta_contabil': 'Conta contábil', 'catfin.sem_conta': 'Sem conta contábil',
  'conta.codigo_invalido': 'Informe o código da conta.', 'conta.tipo_invalido': 'Tipo de conta inválido.', 'conta.pai_invalido': 'A conta não pode ser pai dela mesma.',
});
Object.assign(en, {
  'menu.plano_contas': 'Chart of accounts',
  'plano.crumb': 'Registers / Financial / Chart of accounts',
  'plano.titulo': 'Chart of accounts', 'plano.sub': 'Accounting accounts used by the financial category and the income statement.',
  'plano.nova': 'New account', 'plano.buscar': 'Search account', 'plano.codigo': 'Code', 'plano.descricao': 'Description',
  'plano.tipo': 'Type', 'plano.pai': 'Parent account', 'plano.sem_pai': 'None (top-level)',
  'plano.tipo_receita': 'Revenue', 'plano.tipo_despesa': 'Expense', 'plano.tipo_ativo': 'Asset', 'plano.tipo_passivo': 'Liability',
  'catfin.conta_contabil': 'Accounting account', 'catfin.sem_conta': 'No accounting account',
  'conta.codigo_invalido': 'Enter the account code.', 'conta.tipo_invalido': 'Invalid account type.', 'conta.pai_invalido': 'An account cannot be its own parent.',
});
Object.assign(es, {
  'menu.plano_contas': 'Plan de cuentas',
  'plano.crumb': 'Registros / Financiero / Plan de cuentas',
  'plano.titulo': 'Plan de cuentas', 'plano.sub': 'Cuentas contables usadas en la categoría financiera y en el DRE.',
  'plano.nova': 'Nueva cuenta', 'plano.buscar': 'Buscar cuenta', 'plano.codigo': 'Código', 'plano.descricao': 'Descripción',
  'plano.tipo': 'Tipo', 'plano.pai': 'Cuenta padre', 'plano.sem_pai': 'Ninguna (cuenta de nivel superior)',
  'plano.tipo_receita': 'Ingreso', 'plano.tipo_despesa': 'Gasto', 'plano.tipo_ativo': 'Activo', 'plano.tipo_passivo': 'Pasivo',
  'catfin.conta_contabil': 'Cuenta contable', 'catfin.sem_conta': 'Sin cuenta contable',
  'conta.codigo_invalido': 'Informa el código de la cuenta.', 'conta.tipo_invalido': 'Tipo de cuenta inválido.', 'conta.pai_invalido': 'Una cuenta no puede ser su propia padre.',
});

// ===== Taxa de cartão na baixa =====
Object.assign(pt, { 'fin.taxa_cartao': 'Taxa do cartão', 'fin.liquido_cartao': 'Líquido recebido' });
Object.assign(en, { 'fin.taxa_cartao': 'Card fee', 'fin.liquido_cartao': 'Net received' });
Object.assign(es, { 'fin.taxa_cartao': 'Tasa de la tarjeta', 'fin.liquido_cartao': 'Neto recibido' });

// ===== DRE por competência =====
Object.assign(pt, {
  'menu.dre': 'DRE', 'dre.titulo': 'DRE (resultado por competência)',
  'dre.sub': 'Receitas e despesas por categoria financeira e conta contábil, pela data de emissão.',
  'dre.competencia_nota': 'Regime de competência (pela emissão do título).',
  'dre.receitas': 'Receitas', 'dre.despesas': 'Despesas', 'dre.resultado': 'Resultado', 'dre.margem': 'Margem',
  'dre.total': 'Total', 'dre.grupo': 'Grupo', 'dre.receita': 'Receita', 'dre.despesa': 'Despesa',
});
Object.assign(en, {
  'menu.dre': 'Income stmt', 'dre.titulo': 'Income statement (accrual)',
  'dre.sub': 'Revenue and expenses by financial category and accounting account, by issue date.',
  'dre.competencia_nota': 'Accrual basis (by the title issue date).',
  'dre.receitas': 'Revenue', 'dre.despesas': 'Expenses', 'dre.resultado': 'Result', 'dre.margem': 'Margin',
  'dre.total': 'Total', 'dre.grupo': 'Group', 'dre.receita': 'Revenue', 'dre.despesa': 'Expense',
});
Object.assign(es, {
  'menu.dre': 'Estado res.', 'dre.titulo': 'Estado de resultados (devengo)',
  'dre.sub': 'Ingresos y gastos por categoría financiera y cuenta contable, por fecha de emisión.',
  'dre.competencia_nota': 'Régimen de devengo (por la emisión del título).',
  'dre.receitas': 'Ingresos', 'dre.despesas': 'Gastos', 'dre.resultado': 'Resultado', 'dre.margem': 'Margen',
  'dre.total': 'Total', 'dre.grupo': 'Grupo', 'dre.receita': 'Ingreso', 'dre.despesa': 'Gasto',
});

// ===== Tabela de ICMS interestadual (referência em Dados da empresa › Fiscal) =====
Object.assign(pt, {
  'fiscal.tabela_ver': 'Ver tabela de ICMS interestadual',
  'fiscal.tabela_origem': 'A partir da UF da empresa:',
  'fiscal.tabela_interna': 'interna:',
  'fiscal.tabela_sem_uf': 'Preencha a UF da empresa (em Identificação) para ver a tabela.',
  'fiscal.tabela_nota': 'Roxo = operação interna · Verde = 12% · Laranja = 7%. Calculado pela região do destino (vale no Regime Normal).',
});
Object.assign(en, {
  'fiscal.tabela_ver': 'Show interstate ICMS table',
  'fiscal.tabela_origem': 'From the company state:',
  'fiscal.tabela_interna': 'internal:',
  'fiscal.tabela_sem_uf': 'Fill in the company state (in Identification) to see the table.',
  'fiscal.tabela_nota': 'Purple = internal · Green = 12% · Orange = 7%. Computed by destination region (applies to the Regular regime).',
});
Object.assign(es, {
  'fiscal.tabela_ver': 'Ver tabla de ICMS interestatal',
  'fiscal.tabela_origem': 'Desde la UF de la empresa:',
  'fiscal.tabela_interna': 'interna:',
  'fiscal.tabela_sem_uf': 'Completa la UF de la empresa (en Identificación) para ver la tabla.',
  'fiscal.tabela_nota': 'Morado = interna · Verde = 12% · Naranja = 7%. Calculado por la región del destino (vale en el Régimen Normal).',
});
