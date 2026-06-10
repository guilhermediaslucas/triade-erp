export interface Capability { id: string; moduloChave: string; labelChave: string; }

export const CAPABILITIES: Capability[] = [
  { id: 'dashboard.ver',            moduloChave: 'cap.modulo.dashboard',  labelChave: 'cap.dashboard.ver' },
  { id: 'acesso.usuario.listar',    moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.usuario.listar' },
  { id: 'acesso.usuario.gerenciar', moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.usuario.gerenciar' },
  { id: 'acesso.perfil.listar',     moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.perfil.listar' },
  { id: 'acesso.perfil.gerenciar',  moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.perfil.gerenciar' },
  { id: 'acesso.empresa.editar',    moduloChave: 'cap.modulo.acesso',     labelChave: 'cap.acesso.empresa.editar' },
  { id: 'superadmin.empresa.provisionar', moduloChave: 'cap.modulo.superadmin', labelChave: 'cap.superadmin.empresa.provisionar' },
];

export const CAPABILITY_IDS: string[] = CAPABILITIES.map((c) => c.id);
export function capabilityExiste(id: string): boolean { return CAPABILITY_IDS.includes(id); }
