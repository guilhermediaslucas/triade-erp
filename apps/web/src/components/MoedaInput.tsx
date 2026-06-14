import { useEffect, useState, type CSSProperties } from 'react';

// Formata um número no padrão BR de milhar/decimal: 350000 -> "350.000,00".
export function fmtMoedaBR(n: number): string {
  return Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
// Converte texto digitado ("350.000,00" / "350000" / "1234,5") no número limpo.
export function parseMoedaBR(s: string): number {
  const limpo = String(s).replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
}

interface Props {
  value: number | string;
  onChange: (n: number) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  placeholder?: string;
}

// Input de moeda com máscara BR. Exibe formatado (350.000,00) e devolve o número
// limpo no onChange. Formata ao sair do campo; durante a digitação aceita ponto/vírgula.
export function MoedaInput({ value, onChange, disabled, className, style, id, placeholder }: Props) {
  const vazio = value === '' || value == null;
  const [texto, setTexto] = useState(() => (vazio ? '' : fmtMoedaBR(Number(value))));
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (!editando) setTexto(value === '' || value == null ? '' : fmtMoedaBR(Number(value)));
  }, [value, editando]);

  return (
    <input
      id={id}
      className={className}
      style={style}
      disabled={disabled}
      placeholder={placeholder ?? '0,00'}
      inputMode="decimal"
      value={texto}
      onFocus={() => setEditando(true)}
      onChange={(e) => { setTexto(e.target.value); onChange(parseMoedaBR(e.target.value)); }}
      onBlur={() => { setEditando(false); const n = parseMoedaBR(texto); setTexto(n ? fmtMoedaBR(n) : ''); onChange(n); }}
    />
  );
}
