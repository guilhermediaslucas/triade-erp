// Avatar do usuário: mostra a foto (data URI) ou as iniciais do nome como fallback.
function iniciais(nome: string): string {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return (p[0]![0] ?? '?').toUpperCase();
  return ((p[0]![0] ?? '') + (p[p.length - 1]![0] ?? '')).toUpperCase();
}

export function Avatar({ nome, foto, tamanho = 28 }: { nome: string; foto?: string | null; tamanho?: number }) {
  const estilo = { width: tamanho, height: tamanho, fontSize: Math.round(tamanho * 0.42) };
  if (foto) return <img className="avatar" style={estilo} src={foto} alt={nome} />;
  return <span className="avatar avatar-ph" style={estilo} aria-hidden="true">{iniciais(nome)}</span>;
}
