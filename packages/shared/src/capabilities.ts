export interface Capability { id: string; moduloChave: string; labelChave: string; }

export const CAPABILITIES: Capability[] = [
  { id: 'dashboard.ver',            moduloChave: 'cap.modulo.dashboard',  labelChave: 'cap.dashboard.ver' },
  { id: 'acesso.usuario.listar',    moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.usuario.listar' },
  { id: 'acesso.usuario.gerenciar', moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.usuario.gerenciar' },
  { id: 'acesso.perfil.listar',     moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.perfil.listar' },
  { id: 'acesso.perfil.gerenciar',  moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.perfil.gerenciar' },
  { id: 'acesso.empresa.editar',    moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.empresa.editar' },
  { id: 'cadastros.categoria.listar',    moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.categoria.listar' },
  { id: 'cadastros.categoria.gerenciar', moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.categoria.gerenciar' },
  { id: 'cadastros.produto.listar',      moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.produto.listar' },
  { id: 'cadastros.produto.gerenciar',   moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.produto.gerenciar' },
  { id: 'cadastros.cliente.listar',      moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.cliente.listar' },
  { id: 'cadastros.cliente.gerenciar',   moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.cliente.gerenciar' },
  { id: 'cadastros.fornecedor.listar',   moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.fornecedor.listar' },
  { id: 'cadastros.fornecedor.gerenciar',moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.fornecedor.gerenciar' },
  { id: 'cadastros.vendedor.listar',     moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.vendedor.listar' },
  { id: 'cadastros.vendedor.gerenciar',  moduloChave: 'cap.modulo.cadastros', labelChave: 'cap.cadastros.vendedor.gerenciar' },
  { id: 'comercial.preco.listar',    moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.preco.listar' },
  { id: 'comercial.preco.gerenciar', moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.preco.gerenciar' },
  { id: 'comercial.pedido.listar',    moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.pedido.listar' },
  { id: 'comercial.pedido.criar',     moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.pedido.criar' },
  { id: 'comercial.pedido.gerenciar', moduloChave: 'cap.modulo.comercial', labelChave: 'cap.comercial.pedido.gerenciar' },
  { id: 'estoque.saldo.ver',     moduloChave: 'cap.modulo.estoque', labelChave: 'cap.estoque.saldo.ver' },
  { id: 'estoque.entrada.criar', moduloChave: 'cap.modulo.estoque', labelChave: 'cap.estoque.entrada.criar' },
  { id: 'estoque.baixa.criar',   moduloChave: 'cap.modulo.estoque', labelChave: 'cap.estoque.baixa.criar' },
  { id: 'superadmin.empresa.provisionar', moduloChave: 'cap.modulo.superadmin', labelChave: 'cap.superadmin.empresa.provisionar' },
];

export const CAPABILITY_IDS: string[] = CAPABILITIES.map((c) => c.id);
export function capabilityExiste(id: string): boolean { return CAPABILITY_IDS.includes(id); }
