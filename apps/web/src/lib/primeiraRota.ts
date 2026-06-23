// Primeira tela acessível a um usuário, na ordem do menu lateral. Usado para
// redirecionar quem NÃO tem o Dashboard direto para a 1ª tela que pode abrir.
// Mantido em sincronia com o menu (components/Layout.tsx).
const ROTAS: Array<{ cap: string; to: string }> = [
  { cap: 'dashboard.ver', to: '/' },
  { cap: 'logistica.entrega.atualizar', to: '/entregas/minhas' },   // motoboy: 1ª (e única) tela dele
  { cap: 'comercial.pedido.listar', to: '/comercial/pedidos' },
  { cap: 'comercial.crm.ver', to: '/comercial/crm' },
  { cap: 'comercial.meta.ver', to: '/comercial/metas' },
  { cap: 'comercial.preco.listar', to: '/comercial/precos' },
  { cap: 'comercial.analise.ver', to: '/comercial/analise' },
  { cap: 'financeiro.receber.listar', to: '/financeiro/receber' },
  { cap: 'financeiro.pagar.listar', to: '/financeiro/pagar' },
  { cap: 'financeiro.compra.criar', to: '/financeiro/nota' },
  { cap: 'financeiro.fluxo.ver', to: '/financeiro/fluxo' },
  { cap: 'financeiro.conciliacao.ver', to: '/financeiro/conciliacao' },
  { cap: 'financeiro.comissao.ver', to: '/financeiro/comissoes' },
  { cap: 'comercial.pedido.gerenciar', to: '/estoque/expedicao' },
  { cap: 'estoque.saldo.ver', to: '/estoque/disponibilidade' },
  { cap: 'estoque.entrada.criar', to: '/estoque/entrada' },
  { cap: 'estoque.baixa.criar', to: '/estoque/baixa' },
  { cap: 'estoque.inventario.ver', to: '/estoque/inventario' },
  { cap: 'logistica.frete.ver', to: '/logistica/fretes' },
  { cap: 'relatorios.ver', to: '/relatorios' },
  { cap: 'cadastros.condicao.listar', to: '/cadastros/condicoes' },
  { cap: 'cadastros.cliente.listar', to: '/cadastros/clientes' },
  { cap: 'cadastros.vendedor.listar', to: '/cadastros/vendedores' },
  { cap: 'cadastros.fornecedor.listar', to: '/cadastros/fornecedores' },
  { cap: 'cadastros.produto.listar', to: '/cadastros/produtos' },
  { cap: 'cadastros.conta.listar', to: '/cadastros/contas-correntes' },
  { cap: 'cadastros.catfin.listar', to: '/cadastros/categorias-financeiras' },
  { cap: 'acesso.usuario.listar', to: '/acesso/usuarios' },
  { cap: 'acesso.perfil.listar', to: '/acesso/perfis' },
  { cap: 'acesso.empresa.editar', to: '/config/empresa' },
];

// Retorna a 1ª rota cuja capability o usuário possui (pulando o dashboard),
// ou null se não houver nenhuma tela acessível.
export function primeiraRotaAcessivel(temCapability: (id: string) => boolean): string | null {
  for (const r of ROTAS) {
    if (r.to === '/') continue;               // o dashboard é tratado à parte
    if (temCapability(r.cap)) return r.to;
  }
  return null;
}
