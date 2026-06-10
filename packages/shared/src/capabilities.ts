// Catalogo de permissoes (capabilities) auto-descobertas.
// Fonte unica: backend valida contra esta lista; frontend monta os checkboxes.
// label/modulo sao CHAVES i18n (resolvidas na UI), nunca texto fixo.
export interface Capability {
  id: string;
  moduloChave: string; // chave i18n do modulo
  labelChave: string;  // chave i18n da acao
}

export const CAPABILITIES: Capability[] = [
  { id: 'dashboard.ver',           moduloChave: 'cap.modulo.dashboard', labelChave: 'cap.dashboard.ver' },
  { id: 'acesso.usuario.listar',   moduloChave: 'cap.modulo.acesso',    labelChave: 'cap.acesso.usuario.listar' },
  { id: 'acesso.usuario.gerenciar',moduloChave: 'cap.modulo.acesso',    labelChave: 'cap.acesso.usuario.gerenciar' },
  { id: 'acesso.perfil.listar',    moduloChave: 'cap.modulo.acesso',    labelChave: 'cap.acesso.perfil.listar' },
  { id: 'acesso.perfil.gerenciar', moduloChave: 'cap.modulo.acesso',    labelChave: 'cap.acesso.perfil.gerenciar' },
  { id: 'acesso.empresa.editar',   moduloChave: 'cap.modulo.acesso',    labelChave: 'cap.acesso.empresa.editar' },
];

export const CAPABILITY_IDS: string[] = CAPABILITIES.map((c) => c.id);

export function capabilityExiste(id: string): boolean {
  return CAPABILITY_IDS.includes(id);
}
