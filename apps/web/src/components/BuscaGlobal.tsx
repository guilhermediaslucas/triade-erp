import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';

interface Destino { rotulo: string; icone: string; to: string; cap?: string; }

// Telas navegáveis (espelha o menu). Filtradas por capability do usuário.
const DESTINOS: Destino[] = [
  { rotulo: 'menu.dashboard', icone: '▦', to: '/', cap: 'dashboard.ver' },
  { rotulo: 'menu.pedidos', icone: '🧾', to: '/comercial/pedidos', cap: 'comercial.pedido.listar' },
  { rotulo: 'menu.novo_pedido', icone: '➕', to: '/comercial/pedidos/novo', cap: 'comercial.pedido.criar' },
  { rotulo: 'menu.precos', icone: '🏷️', to: '/comercial/precos', cap: 'comercial.preco.listar' },
  { rotulo: 'menu.expedicao', icone: '🚚', to: '/estoque/expedicao', cap: 'comercial.pedido.gerenciar' },
  { rotulo: 'menu.posicao', icone: '📦', to: '/estoque/posicao', cap: 'estoque.saldo.ver' },
  { rotulo: 'menu.entrada', icone: '📥', to: '/estoque/entrada', cap: 'estoque.entrada.criar' },
  { rotulo: 'menu.recebimento', icone: '📦', to: '/estoque/recebimento', cap: 'estoque.entrada.criar' },
  { rotulo: 'menu.baixa', icone: '📉', to: '/estoque/baixa', cap: 'estoque.baixa.criar' },
  { rotulo: 'menu.inventario', icone: '🔎', to: '/estoque/inventario', cap: 'estoque.inventario.ver' },
  { rotulo: 'menu.gestao_fretes', icone: '🛣️', to: '/logistica/fretes', cap: 'logistica.frete.ver' },
  { rotulo: 'menu.receber', icone: '💰', to: '/financeiro/receber', cap: 'financeiro.receber.listar' },
  { rotulo: 'menu.pagar', icone: '💸', to: '/financeiro/pagar', cap: 'financeiro.pagar.listar' },
  { rotulo: 'menu.aging', icone: '📅', to: '/financeiro/aging-receber', cap: 'financeiro.receber.listar' },
  { rotulo: 'menu.fluxo', icone: '📊', to: '/financeiro/fluxo', cap: 'financeiro.fluxo.ver' },
  { rotulo: 'menu.dre', icone: '📋', to: '/financeiro/dre', cap: 'financeiro.fluxo.ver' },
  { rotulo: 'menu.nota', icone: '🧾', to: '/financeiro/nota', cap: 'financeiro.compra.criar' },
  { rotulo: 'menu.comissoes', icone: '🧮', to: '/financeiro/comissoes', cap: 'financeiro.comissao.ver' },
  { rotulo: 'menu.rel_vendas', icone: '📈', to: '/relatorios/vendas', cap: 'relatorios.ver' },
  { rotulo: 'menu.rel_produtos', icone: '🏆', to: '/relatorios/produtos', cap: 'relatorios.ver' },
  { rotulo: 'menu.rel_categorias', icone: '🧩', to: '/relatorios/vendas-categoria', cap: 'relatorios.ver' },
  { rotulo: 'menu.rel_validade', icone: '⏳', to: '/relatorios/validade', cap: 'relatorios.ver' },
  { rotulo: 'menu.rel_parado', icone: '🐢', to: '/relatorios/estoque-parado', cap: 'relatorios.ver' },
  { rotulo: 'menu.condicoes', icone: '💳', to: '/cadastros/condicoes', cap: 'cadastros.condicao.listar' },
  { rotulo: 'menu.clientes', icone: '🧑‍⚕️', to: '/cadastros/clientes', cap: 'cadastros.cliente.listar' },
  { rotulo: 'menu.fornecedores', icone: '🏭', to: '/cadastros/fornecedores', cap: 'cadastros.fornecedor.listar' },
  { rotulo: 'menu.vendedores', icone: '💼', to: '/cadastros/vendedores', cap: 'cadastros.vendedor.listar' },
  { rotulo: 'menu.motoboys', icone: '🛵', to: '/cadastros/motoboys', cap: 'cadastros.motoboy.listar' },
  { rotulo: 'menu.produtos', icone: '📦', to: '/cadastros/produtos', cap: 'cadastros.produto.listar' },
  { rotulo: 'menu.categorias', icone: '🏷️', to: '/cadastros/categorias', cap: 'cadastros.categoria.listar' },
  { rotulo: 'menu.marcas', icone: '™️', to: '/cadastros/marcas', cap: 'cadastros.marca.listar' },
  { rotulo: 'menu.contas_correntes', icone: '🏦', to: '/cadastros/contas-correntes', cap: 'cadastros.conta.listar' },
  { rotulo: 'menu.usuarios', icone: '👤', to: '/acesso/usuarios', cap: 'acesso.usuario.listar' },
  { rotulo: 'menu.perfis', icone: '🔑', to: '/acesso/perfis', cap: 'acesso.perfil.listar' },
  { rotulo: 'menu.empresa', icone: '🏢', to: '/config/empresa', cap: 'acesso.empresa.editar' },
  { rotulo: 'menu.empresas', icone: '🏬', to: '/superadmin/empresas', cap: 'superadmin.empresa.provisionar' },
];

function normaliza(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function BuscaGlobal() {
  const { temCapability } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [aberto, setAberto] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const visiveis = useMemo(() => DESTINOS.filter((d) => !d.cap || temCapability(d.cap)).map((d) => ({ ...d, label: t(d.rotulo) })), [temCapability, t]);
  const filtrados = useMemo(() => {
    const termo = normaliza(q.trim());
    if (!termo) return visiveis;
    return visiveis.filter((d) => normaliza(d.label).includes(termo));
  }, [visiveis, q]);

  function abrir() { setQ(''); setSel(0); setAberto(true); setTimeout(() => inputRef.current?.focus(), 30); }
  function fechar() { setAberto(false); }
  function ir(to: string) { fechar(); nav(to); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); setAberto((v) => !v); setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 30); }
    }
    function onAbrir() { abrir(); }
    window.addEventListener('keydown', onKey);
    window.addEventListener('abrir-busca', onAbrir);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('abrir-busca', onAbrir); };
  }, []);

  useEffect(() => { if (sel >= filtrados.length) setSel(0); }, [filtrados, sel]);

  if (!aberto) return null;
  return (
    <div className="busca-fundo" onClick={fechar}>
      <div className="busca-box" onClick={(e) => e.stopPropagation()}>
        <input ref={inputRef} className="busca-input" value={q} placeholder={t('busca.placeholder')} autoComplete="off"
          onChange={(e) => { setQ(e.target.value); setSel(0); }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { e.preventDefault(); fechar(); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, filtrados.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
            else if (e.key === 'Enter') { e.preventDefault(); const d = filtrados[sel]; if (d) ir(d.to); }
          }} />
        <div className="busca-lista">
          {filtrados.length === 0 && <div className="busca-vazio">{t('busca.vazio')}</div>}
          {filtrados.map((d, i) => (
            <button key={d.to} className={'busca-item' + (i === sel ? ' sel' : '')}
              onMouseEnter={() => setSel(i)} onClick={() => ir(d.to)}>
              <span className="busca-ic">{d.icone}</span>{d.label}
            </button>
          ))}
        </div>
        <div className="busca-rodape">{t('busca.dica')}</div>
      </div>
    </div>
  );
}
