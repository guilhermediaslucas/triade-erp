export interface Capability { id: string; moduloChave: string; labelChave: string; }

export const CAPABILITIES: Capability[] = [
  { id: 'dashboard.ver',            moduloChave: 'cap.modulo.dashboard',  labelChave: 'cap.dashboard.ver' },
  { id: 'dashboard.kpis',           moduloChave: 'cap.modulo.dashboard',  labelChave: 'cap.dashboard.kpis' },
  { id: 'dashboard.faturamento',    moduloChave: 'cap.modulo.dashboard',  labelChave: 'cap.dashboard.faturamento' },
  { id: 'dashboard.por_produto',    moduloChave: 'cap.modulo.dashboard',  labelChave: 'cap.dashboard.por_produto' },
  { id: 'dashboard.top_produtos',   moduloChave: 'cap.modulo.dashboard',  labelChave: 'cap.dashboard.top_produtos' },
  { id: 'dashboard.clientes',       moduloChave: 'cap.modulo.dashboard',  labelChave: 'cap.dashboard.clientes' },
  { id: 'dashboard.avisos',         moduloChave: 'cap.modulo.dashboard',  labelChave: 'cap.dashboard.avisos' },
  { id: 'dashboard.pedidos',        moduloChave: 'cap.modulo.dashboard',  labelChave: 'cap.dashboard.pedidos' },
  { id: 'dashboard.fluxo',          moduloChave: 'cap.modulo.dashboard',  labelChave: 'cap.dashboard.fluxo' },
  { id: 'dashboard.saldos',         moduloChave: 'cap.modulo.dashboard',  labelChave: 'cap.dashboard.saldos' },
  { id: 'acesso.usuario.listar',    moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.usuario.listar' },
  { id: 'acesso.usuario.gerenciar', moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.usuario.gerenciar' },
  { id: 'acesso.perfil.listar',     moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.perfil.listar' },
  { id: 'acesso.perfil.gerenciar',  moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.perfil.gerenciar' },
  { id: 'acesso.empresa.editar',    moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.empresa.editar' },
  { id: 'cadastros.produto.listar',      moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.produto.listar' },
  { id: 'cadastros.produto.gerenciar',   moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.produto.gerenciar' },
  { id: 'cadastros.condicao.listar',     moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.condicao.listar' },
  { id: 'cadastros.condicao.gerenciar',  moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.condicao.gerenciar' },
  { id: 'cadastros.conta.listar',        moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.conta.listar' },
  { id: 'cadastros.conta.gerenciar',     moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.conta.gerenciar' },
  { id: 'cadastros.cliente.listar',      moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.cliente.listar' },
  { id: 'cadastros.cliente.gerenciar',   moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.cliente.gerenciar' },
  { id: 'cadastros.fornecedor.listar',   moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.fornecedor.listar' },
  { id: 'cadastros.fornecedor.gerenciar',moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.fornecedor.gerenciar' },
  { id: 'cadastros.vendedor.listar',     moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.vendedor.listar' },
  { id: 'cadastros.vendedor.gerenciar',  moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.vendedor.gerenciar' },
  { id: 'cadastros.forma_entrega.listar',    moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.forma_entrega.listar' },
  { id: 'cadastros.forma_entrega.gerenciar', moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.forma_entrega.gerenciar' },
  { id: 'cadastros.tipodoc.listar',          moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.tipodoc.listar' },
  { id: 'cadastros.tipodoc.gerenciar',       moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.tipodoc.gerenciar' },
  { id: 'cadastros.banco.listar',            moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.banco.listar' },
  { id: 'cadastros.banco.gerenciar',         moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.banco.gerenciar' },
  { id: 'cadastros.taxa_cartao.listar',      moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.taxa_cartao.listar' },
  { id: 'cadastros.taxa_cartao.gerenciar',   moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.taxa_cartao.gerenciar' },
  { id: 'cadastros.motoboy.listar',      moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.motoboy.listar' },
  { id: 'cadastros.motoboy.gerenciar',   moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.motoboy.gerenciar' },
  { id: 'cadastros.favorecido.listar',    moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.favorecido.listar' },
  { id: 'cadastros.favorecido.gerenciar', moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.favorecido.gerenciar' },
  { id: 'logistica.frete.ver',         moduloChave: 'cap.modulo.logistica', labelChave: 'cap.logistica.frete.ver' },
  { id: 'logistica.frete.gerenciar',    moduloChave: 'cap.modulo.logistica', labelChave: 'cap.logistica.frete.gerenciar' },
  { id: 'logistica.entrega.ver',        moduloChave: 'cap.modulo.logistica', labelChave: 'cap.logistica.entrega.ver' },
  { id: 'logistica.entrega.atualizar',  moduloChave: 'cap.modulo.logistica', labelChave: 'cap.logistica.entrega.atualizar' },
  { id: 'cadastros.catfin.listar',       moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.catfin.listar' },
  { id: 'cadastros.catfin.gerenciar',    moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.catfin.gerenciar' },
  { id: 'comercial.preco.listar',    moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.preco.listar' },
  { id: 'comercial.preco.gerenciar', moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.preco.gerenciar' },
  { id: 'comercial.pedido.listar',    moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.pedido.listar' },
  { id: 'comercial.pedido.criar',     moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.pedido.criar' },
  { id: 'comercial.pedido.gerenciar', moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.pedido.gerenciar' },
  { id: 'comercial.pedido.separar',   moduloChave: 'cap.modulo.estoque', labelChave: 'cap.comercial.pedido.separar' },
  { id: 'comercial.pedido.expedir',   moduloChave: 'cap.modulo.estoque', labelChave: 'cap.comercial.pedido.expedir' },
  { id: 'comercial.pedido.cancelar',  moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.pedido.cancelar' },
  { id: 'comercial.crm.ver',          moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.crm.ver' },
  { id: 'comercial.crm.gerenciar',    moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.crm.gerenciar' },
  { id: 'comercial.meta.ver',         moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.meta.ver' },
  { id: 'comercial.meta.gerenciar',   moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.meta.gerenciar' },
  { id: 'comercial.analise.ver',      moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.analise.ver' },
  { id: 'comercial.disponibilidade.ver', moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.disponibilidade.ver' },
  { id: 'comercial.pedido.vendedor_qualquer', moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.pedido.vendedor_qualquer' },
  { id: 'estoque.saldo.ver',     moduloChave: 'cap.modulo.estoque', labelChave: 'cap.estoque.saldo.ver' },
  { id: 'estoque.entrada.criar', moduloChave: 'cap.modulo.estoque', labelChave: 'cap.estoque.entrada.criar' },
  { id: 'estoque.baixa.criar',   moduloChave: 'cap.modulo.estoque', labelChave: 'cap.estoque.baixa.criar' },
  { id: 'estoque.inventario.ver',       moduloChave: 'cap.modulo.estoque', labelChave: 'cap.estoque.inventario.ver' },
  { id: 'estoque.inventario.gerenciar', moduloChave: 'cap.modulo.estoque', labelChave: 'cap.estoque.inventario.gerenciar' },
  { id: 'financeiro.receber.listar',    moduloChave: 'cap.modulo.financeiro', labelChave: 'cap.financeiro.receber.listar' },
  { id: 'financeiro.receber.gerenciar', moduloChave: 'cap.modulo.financeiro', labelChave: 'cap.financeiro.receber.gerenciar' },
  { id: 'financeiro.pagar.listar',      moduloChave: 'cap.modulo.financeiro', labelChave: 'cap.financeiro.pagar.listar' },
  { id: 'financeiro.pagar.gerenciar',   moduloChave: 'cap.modulo.financeiro', labelChave: 'cap.financeiro.pagar.gerenciar' },
  { id: 'financeiro.fluxo.ver',         moduloChave: 'cap.modulo.financeiro', labelChave: 'cap.financeiro.fluxo.ver' },
  { id: 'financeiro.compra.criar',      moduloChave: 'cap.modulo.financeiro', labelChave: 'cap.financeiro.compra.criar' },
  { id: 'financeiro.comissao.ver',      moduloChave: 'cap.modulo.financeiro', labelChave: 'cap.financeiro.comissao.ver' },
  { id: 'financeiro.comissao.gerenciar',moduloChave: 'cap.modulo.financeiro', labelChave: 'cap.financeiro.comissao.gerenciar' },
  { id: 'financeiro.conciliacao.ver',      moduloChave: 'cap.modulo.financeiro', labelChave: 'cap.financeiro.conciliacao.ver' },
  { id: 'financeiro.conciliacao.gerenciar', moduloChave: 'cap.modulo.financeiro', labelChave: 'cap.financeiro.conciliacao.gerenciar' },
  { id: 'relatorios.ver',                  moduloChave: 'cap.modulo.relatorios', labelChave: 'cap.relatorios.ver' },
  { id: 'relatorios.vendas.ver',           moduloChave: 'cap.modulo.relatorios', labelChave: 'cap.relatorios.vendas' },
  { id: 'relatorios.pedidos.ver',          moduloChave: 'cap.modulo.relatorios', labelChave: 'cap.relatorios.pedidos' },
  { id: 'relatorios.produtos.ver',         moduloChave: 'cap.modulo.relatorios', labelChave: 'cap.relatorios.produtos' },
  { id: 'relatorios.abc.ver',              moduloChave: 'cap.modulo.relatorios', labelChave: 'cap.relatorios.abc' },
  { id: 'relatorios.validade.ver',         moduloChave: 'cap.modulo.relatorios', labelChave: 'cap.relatorios.validade' },
  { id: 'relatorios.parado.ver',           moduloChave: 'cap.modulo.relatorios', labelChave: 'cap.relatorios.parado' },
  { id: 'relatorios.perdas.ver',           moduloChave: 'cap.modulo.relatorios', labelChave: 'cap.relatorios.perdas' },
  { id: 'relatorios.contabil.pagar.ver',   moduloChave: 'cap.modulo.relatorios_contabil', labelChave: 'cap.relatorios.contabil.pagar' },
  { id: 'relatorios.contabil.receber.ver', moduloChave: 'cap.modulo.relatorios_contabil', labelChave: 'cap.relatorios.contabil.receber' },
  { id: 'relatorios.contabil.vendas.ver',  moduloChave: 'cap.modulo.relatorios_contabil', labelChave: 'cap.relatorios.contabil.vendas' },
  { id: 'fiscal.nota.ver',    moduloChave: 'cap.modulo.fiscal', labelChave: 'cap.fiscal.nota.ver' },
  { id: 'fiscal.nota.emitir', moduloChave: 'cap.modulo.fiscal', labelChave: 'cap.fiscal.nota.emitir' },
  { id: 'painel.tv_comercial', moduloChave: 'cap.modulo.painel', labelChave: 'cap.painel.tv_comercial' },
  { id: 'painel.tv_expedicao', moduloChave: 'cap.modulo.painel', labelChave: 'cap.painel.tv_expedicao' },
];

export const CAPABILITY_IDS: string[] = CAPABILITIES.map((c) => c.id);
export function capabilityExiste(id: string): boolean { return CAPABILITY_IDS.includes(id); }

// Caps de "painel TV": NÃO são acesso comum — marcam usuários de Gestão à Vista,
// cuja tela inicial redireciona para o painel. Não devem ir para perfis "vê tudo"
// (Administrador/Diretor), senão esses usuários cairiam no painel TV ao logar.
export const CAPS_PAINEL_TV: string[] = ['painel.tv_comercial', 'painel.tv_expedicao', 'logistica.entrega.atualizar'];
export const CAPABILITY_IDS_GERAIS: string[] = CAPABILITY_IDS.filter((id) => !CAPS_PAINEL_TV.includes(id));

// ===== Perfis padrão (criados em toda empresa, atuais e novas) =====
const REL_COMERCIAL = ['relatorios.ver', 'relatorios.vendas.ver', 'relatorios.pedidos.ver', 'relatorios.produtos.ver', 'relatorios.abc.ver'];

export interface PerfilPadrao {
  nome: string;
  descricao: string;
  caps: string[] | 'TODAS';
  usuario?: { prefixoEmail: string };   // se definido, cria um usuário (login cai no painel TV)
}

export const PERFIS_PADRAO: PerfilPadrao[] = [
  { nome: 'Diretor', descricao: 'Acesso total ao sistema', caps: 'TODAS' },
  {
    nome: 'Comercial', descricao: 'Apenas Comercial e relatórios comerciais',
    caps: ['dashboard.ver', 'comercial.preco.listar', 'comercial.preco.gerenciar', 'comercial.pedido.listar', 'comercial.pedido.criar', 'comercial.pedido.gerenciar',
      'comercial.pedido.separar', 'comercial.pedido.expedir', 'comercial.pedido.cancelar',
      'comercial.crm.ver', 'comercial.crm.gerenciar', 'comercial.meta.ver', 'comercial.meta.gerenciar', 'comercial.analise.ver', 'comercial.disponibilidade.ver', 'comercial.pedido.vendedor_qualquer', 'cadastros.cliente.listar', 'cadastros.cliente.gerenciar', 'cadastros.produto.listar', 'cadastros.vendedor.listar', ...REL_COMERCIAL],
  },
  {
    nome: 'Financeiro', descricao: 'Apenas Financeiro e cadastros financeiros',
    caps: ['dashboard.ver', 'financeiro.receber.listar', 'financeiro.receber.gerenciar', 'financeiro.pagar.listar', 'financeiro.pagar.gerenciar',
      'financeiro.fluxo.ver', 'financeiro.compra.criar', 'financeiro.comissao.ver', 'financeiro.comissao.gerenciar', 'financeiro.conciliacao.ver', 'financeiro.conciliacao.gerenciar',
      'cadastros.catfin.listar', 'cadastros.catfin.gerenciar', 'cadastros.conta.listar', 'cadastros.conta.gerenciar', 'cadastros.tipodoc.listar', 'cadastros.tipodoc.gerenciar',
      'cadastros.banco.listar', 'cadastros.banco.gerenciar', 'cadastros.favorecido.listar', 'cadastros.favorecido.gerenciar',
      'cadastros.taxa_cartao.listar', 'cadastros.taxa_cartao.gerenciar',
      'relatorios.ver', 'relatorios.contabil.pagar.ver', 'relatorios.contabil.receber.ver', 'relatorios.contabil.vendas.ver'],
  },
  {
    nome: 'Estoque', descricao: 'Apenas Estoque/Expedição',
    caps: ['dashboard.ver', 'estoque.saldo.ver', 'comercial.disponibilidade.ver', 'estoque.entrada.criar', 'estoque.baixa.criar', 'estoque.inventario.ver', 'estoque.inventario.gerenciar',
      'comercial.pedido.listar', 'comercial.pedido.gerenciar', 'comercial.pedido.separar', 'comercial.pedido.expedir', 'financeiro.compra.criar', 'cadastros.produto.listar',
      'cadastros.forma_entrega.listar', 'cadastros.motoboy.listar', 'fiscal.nota.ver', 'fiscal.nota.emitir', 'relatorios.ver', 'relatorios.validade.ver', 'relatorios.parado.ver', 'relatorios.perdas.ver',
      'logistica.entrega.ver'],
  },
  {
    nome: 'Motoboy', descricao: 'App do motoboy — só as entregas atribuídas a ele',
    caps: ['logistica.entrega.atualizar'],
  },
  {
    nome: 'Gestão à Vista Comercial', descricao: 'Painel de vendas em TV (somente leitura)',
    caps: ['painel.tv_comercial', 'dashboard.ver', 'estoque.saldo.ver', 'comercial.meta.ver'], usuario: { prefixoEmail: 'tv-comercial' },
  },
  {
    nome: 'Gestão à Vista Estoque/Expedição', descricao: 'Painel de expedição em TV (somente leitura)',
    caps: ['painel.tv_expedicao', 'comercial.pedido.listar', 'estoque.saldo.ver', 'financeiro.compra.criar'], usuario: { prefixoEmail: 'tv-expedicao' },
  },
];
