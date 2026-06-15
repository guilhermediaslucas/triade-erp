import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { useI18n } from '../i18n/I18nContext.js';
import { Ic } from './Icones.js';

interface Destino { rotulo: string; icone: string; to: string; cap?: string; soSuperAdmin?: boolean; }

// Telas navegáveis (espelha o menu). Filtradas por capability do usuário.
const DESTINOS: Destino[] = [
  { rotulo: 'menu.dashboard', icone: 'i-grid', to: '/', cap: 'dashboard.ver' },
  { rotulo: 'menu.pedidos', icone: 'i-receipt', to: '/comercial/pedidos', cap: 'comercial.pedido.listar' },
  { rotulo: 'menu.novo_pedido', icone: 'i-plus', to: '/comercial/pedidos/novo', cap: 'comercial.pedido.criar' },
  { rotulo: 'menu.precos', icone: 'i-tag', to: '/comercial/precos', cap: 'comercial.preco.listar' },
  { rotulo: 'menu.expedicao', icone: 'i-truck', to: '/estoque/expedicao', cap: 'comercial.pedido.gerenciar' },
  { rotulo: 'menu.posicao', icone: 'i-box', to: '/estoque/posicao', cap: 'estoque.saldo.ver' },
  { rotulo: 'menu.entrada', icone: 'i-download', to: '/estoque/entrada', cap: 'estoque.entrada.criar' },
  { rotulo: 'menu.recebimento', icone: 'i-box', to: '/estoque/recebimento', cap: 'estoque.entrada.criar' },
  { rotulo: 'menu.baixa', icone: 'i-arrow-down', to: '/estoque/baixa', cap: 'estoque.baixa.criar' },
  { rotulo: 'menu.inventario', icone: 'i-search', to: '/estoque/inventario', cap: 'estoque.inventario.ver' },
  { rotulo: 'menu.gestao_fretes', icone: 'i-truck', to: '/logistica/fretes', cap: 'logistica.frete.ver' },
  { rotulo: 'menu.receber', icone: 'i-dollar', to: '/financeiro/receber', cap: 'financeiro.receber.listar' },
  { rotulo: 'menu.pagar', icone: 'i-dollar', to: '/financeiro/pagar', cap: 'financeiro.pagar.listar' },
  { rotulo: 'menu.fluxo', icone: 'i-chart', to: '/financeiro/fluxo', cap: 'financeiro.fluxo.ver' },
  { rotulo: 'menu.nota', icone: 'i-receipt', to: '/financeiro/nota', cap: 'financeiro.compra.criar' },
  { rotulo: 'menu.comissoes', icone: 'i-dollar', to: '/financeiro/comissoes', cap: 'financeiro.comissao.ver' },
  { rotulo: 'menu.conferencia', icone: 'i-check', to: '/financeiro/conferencia-cartao', cap: 'financeiro.receber.listar' },
  { rotulo: 'menu.analise', icone: 'i-chart', to: '/comercial/analise', cap: 'comercial.analise.ver' },
  { rotulo: 'menu.rel_vendas', icone: 'i-chart', to: '/relatorios/vendas', cap: 'relatorios.vendas.ver' },
  { rotulo: 'menu.rel_produtos', icone: 'i-chart', to: '/relatorios/produtos', cap: 'relatorios.produtos.ver' },
  { rotulo: 'menu.rel_categorias', icone: 'i-grid', to: '/relatorios/vendas-categoria', cap: 'relatorios.categorias.ver' },
  { rotulo: 'menu.rel_validade', icone: 'i-clock', to: '/relatorios/validade', cap: 'relatorios.validade.ver' },
  { rotulo: 'menu.rel_parado', icone: 'i-clock', to: '/relatorios/estoque-parado', cap: 'relatorios.parado.ver' },
  { rotulo: 'menu.condicoes', icone: 'i-dollar', to: '/cadastros/condicoes', cap: 'cadastros.condicao.listar' },
  { rotulo: 'menu.clientes', icone: 'i-user', to: '/cadastros/clientes', cap: 'cadastros.cliente.listar' },
  { rotulo: 'menu.fornecedores', icone: 'i-shop', to: '/cadastros/fornecedores', cap: 'cadastros.fornecedor.listar' },
  { rotulo: 'menu.vendedores', icone: 'i-user', to: '/cadastros/vendedores', cap: 'cadastros.vendedor.listar' },
  { rotulo: 'menu.motoboys', icone: 'i-truck', to: '/cadastros/motoboys', cap: 'cadastros.motoboy.listar' },
  { rotulo: 'menu.produtos', icone: 'i-box', to: '/cadastros/produtos', cap: 'cadastros.produto.listar' },
  { rotulo: 'menu.categorias', icone: 'i-tag', to: '/cadastros/categorias', cap: 'cadastros.categoria.listar' },
  { rotulo: 'menu.contas_correntes', icone: 'i-dollar', to: '/cadastros/contas-correntes', cap: 'cadastros.conta.listar' },
  { rotulo: 'menu.usuarios', icone: 'i-user', to: '/acesso/usuarios', cap: 'acesso.usuario.listar' },
  { rotulo: 'menu.perfis', icone: 'i-key', to: '/acesso/perfis', cap: 'acesso.perfil.listar' },
  { rotulo: 'menu.empresa', icone: 'i-shop', to: '/config/empresa', cap: 'acesso.empresa.editar' },
  { rotulo: 'menu.empresas', icone: 'i-shop', to: '/superadmin/empresas', soSuperAdmin: true },
];

function normaliza(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function BuscaGlobal() {
  const { temCapability, superAdmin } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [aberto, setAberto] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const visiveis = useMemo(() => DESTINOS.filter((d) => d.soSuperAdmin ? superAdmin : (!d.cap || temCapability(d.cap))).map((d) => ({ ...d, label: t(d.rotulo) })), [temCapability, superAdmin, t]);
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
              <span className="busca-ic"><Ic name={d.icone} className="sm" /></span>{d.label}
            </button>
          ))}
        </div>
        <div className="busca-rodape">{t('busca.dica')}</div>
      </div>
    </div>
  );
}
