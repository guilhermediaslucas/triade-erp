import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider } from './auth/AuthContext.js';
import { BrandingProvider } from './branding/BrandingContext.js';
import { I18nProvider } from './i18n/I18nContext.js';
import { ToastProvider } from './components/Toast.js';
import { ThemeProvider } from './theme/ThemeContext.js';
import { Login } from './pages/Login.js';
import { RedefinirSenha } from './pages/RedefinirSenha.js';
import { RastreioPublico } from './pages/RastreioPublico.js';
import { MinhasEntregas } from './pages/MinhasEntregas.js';
import { PainelEntregas } from './pages/PainelEntregas.js';
import { DashboardSerie } from './pages/DashboardSerie.js';
import { DashboardTV } from './pages/DashboardTV.js';
import { DashboardTVExpedicao } from './pages/DashboardTVExpedicao.js';
import { PainelInicial } from './pages/PainelInicial.js';
import { Usuarios } from './pages/Usuarios.js';
import { Perfis } from './pages/Perfis.js';
import { DadosEmpresa } from './pages/DadosEmpresa.js';
import { Empresas } from './pages/Empresas.js';
import { ChamadosSuporte } from './pages/ChamadosSuporte.js';
import { MeusChamados } from './pages/MeusChamados.js';
import { CampanhasFrete } from './pages/CampanhasFrete.js';
import { RelVendasContabil } from './pages/RelVendasContabil.js';
import { RelContasPagarContabil } from './pages/RelContasPagarContabil.js';
import { RelContasReceberContabil } from './pages/RelContasReceberContabil.js';
import { Auditoria } from './pages/Auditoria.js';
import { FormasEntrega } from './pages/FormasEntrega.js';
import { Produtos } from './pages/Produtos.js';
import { Clientes } from './pages/Clientes.js';
import { Fornecedores } from './pages/Fornecedores.js';
import { Vendedores } from './pages/Vendedores.js';
import { Favorecidos } from './pages/Favorecidos.js';
import { Motoboys } from './pages/Motoboys.js';
import { TabelaPreco } from './pages/TabelaPreco.js';
import { Crm } from './pages/Crm.js';
import { Metas } from './pages/Metas.js';
import { Pedidos } from './pages/Pedidos.js';
import { NovoPedido } from './pages/NovoPedido.js';
import { PedidoDetalhe } from './pages/PedidoDetalhe.js';
import { Romaneio } from './pages/Romaneio.js';
import { PosicaoEstoque } from './pages/PosicaoEstoque.js';
import { DisponibilidadeProdutos } from './pages/DisponibilidadeProdutos.js';
import { ConsultarEtiqueta } from './pages/ConsultarEtiqueta.js';
import { EntradaEstoque } from './pages/EntradaEstoque.js';
import { Inventario } from './pages/Inventario.js';
import { KanbanExpedicao } from './pages/KanbanExpedicao.js';
import { BaixaPerda } from './pages/BaixaPerda.js';
import { GestaoFretes } from './pages/GestaoFretes.js';
import { Contas } from './pages/Contas.js';
import { FluxoCaixa } from './pages/FluxoCaixa.js';
import { Relatorios } from './pages/Relatorios.js';
import { NotaEntrada } from './pages/NotaEntrada.js';
import { ConferenciaCartao } from './pages/ConferenciaCartao.js';
import { AnaliseVendas } from './pages/AnaliseVendas.js';
import { NotasFiscais } from './pages/NotasFiscais.js';
import { Recebimento } from './pages/Recebimento.js';
import { RelVendas } from './pages/RelVendas.js';
import { RelProdutos } from './pages/RelProdutos.js';
import { RelAbc } from './pages/RelAbc.js';
import { RelValidade } from './pages/RelValidade.js';
import { RelEstoqueParado } from './pages/RelEstoqueParado.js';
import { RelPerdas } from './pages/RelPerdas.js';
import { RelInventarios } from './pages/RelInventarios.js';
import { RelPedidos } from './pages/RelPedidos.js';
import { RelFavorecidos } from './pages/RelFavorecidos.js';
import { Notificacoes } from './pages/Notificacoes.js';
import { Condicoes } from './pages/Condicoes.js';
import { Comissoes } from './pages/Comissoes.js';
import { Conciliacao } from './pages/Conciliacao.js';
import { ContasCorrentes } from './pages/ContasCorrentes.js';
import { CategoriasFinanceiras } from './pages/CategoriasFinanceiras.js';
import { PlanoContas } from './pages/PlanoContas.js';
import { RelDRECompetencia } from './pages/RelDRECompetencia.js';
import { TiposDocumento } from './pages/TiposDocumento.js';
import { Bancos } from './pages/Bancos.js';
import { TaxasCartao } from './pages/TaxasCartao.js';
import { DescontosPedido } from './pages/DescontosPedido.js';
import { Layout } from './components/Layout.js';
import { ScrollToTop } from './components/ScrollToTop.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

function Protegida({ children, cap, soSuper }: { children: ReactNode; cap?: string; soSuper?: boolean }) {
  return <ProtectedRoute capability={cap} soSuperAdmin={soSuper}><Layout>{children}</Layout></ProtectedRoute>;
}

export function App() {
  return (
    <ThemeProvider>
    <I18nProvider>
      <AuthProvider>
        <BrandingProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/redefinir-senha" element={<RedefinirSenha />} />
                <Route path="/rastreio/:token" element={<RastreioPublico />} />
                <Route path="/" element={<Protegida><PainelInicial /></Protegida>} />
                <Route path="/entregas/minhas" element={<Protegida cap="logistica.entrega.atualizar"><MinhasEntregas /></Protegida>} />
                <Route path="/logistica/entregas" element={<Protegida cap="logistica.entrega.ver"><PainelEntregas /></Protegida>} />
                <Route path="/dashboard/serie/:tipo" element={<Protegida cap="dashboard.ver"><DashboardSerie /></Protegida>} />
                <Route path="/dashboard/tv" element={<ProtectedRoute capability="dashboard.ver"><DashboardTV /></ProtectedRoute>} />
                <Route path="/estoque/tv" element={<ProtectedRoute capability="comercial.pedido.listar"><DashboardTVExpedicao /></ProtectedRoute>} />
                <Route path="/notificacoes" element={<Protegida><Notificacoes /></Protegida>} />
                <Route path="/meus-chamados" element={<Protegida><MeusChamados /></Protegida>} />
                <Route path="/acesso/usuarios" element={<Protegida cap="acesso.usuario.listar"><Usuarios /></Protegida>} />
                <Route path="/acesso/perfis" element={<Protegida cap="acesso.perfil.listar"><Perfis /></Protegida>} />
                <Route path="/config/empresa" element={<Protegida cap="acesso.empresa.editar"><DadosEmpresa /></Protegida>} />
                <Route path="/config/auditoria" element={<Protegida cap="acesso.usuario.listar"><Auditoria /></Protegida>} />
                <Route path="/comercial/pedidos" element={<Protegida cap="comercial.pedido.listar"><Pedidos /></Protegida>} />
                <Route path="/comercial/pedidos/novo" element={<Protegida cap="comercial.pedido.criar"><NovoPedido /></Protegida>} />
                <Route path="/comercial/pedidos/:id/editar" element={<Protegida cap="comercial.pedido.criar"><NovoPedido /></Protegida>} />
                <Route path="/comercial/pedidos/:id/romaneio" element={<ProtectedRoute capability="comercial.pedido.listar"><Romaneio /></ProtectedRoute>} />
                <Route path="/comercial/pedidos/:id" element={<Protegida cap="comercial.pedido.listar"><PedidoDetalhe /></Protegida>} />
                <Route path="/comercial/precos" element={<Protegida cap="comercial.preco.listar"><TabelaPreco /></Protegida>} />
                <Route path="/comercial/descontos" element={<Protegida cap="comercial.preco.listar"><DescontosPedido /></Protegida>} />
                <Route path="/comercial/crm" element={<Protegida cap="comercial.crm.ver"><Crm /></Protegida>} />
                <Route path="/comercial/metas" element={<Protegida cap="comercial.meta.ver"><Metas /></Protegida>} />
                <Route path="/comercial/analise" element={<Protegida cap="comercial.analise.ver"><AnaliseVendas /></Protegida>} />
                <Route path="/financeiro/notas-fiscais" element={<Protegida cap="fiscal.nota.ver"><NotasFiscais /></Protegida>} />
                <Route path="/estoque/expedicao" element={<Protegida cap="comercial.pedido.gerenciar"><KanbanExpedicao /></Protegida>} />
                <Route path="/estoque/baixa" element={<Protegida cap="estoque.baixa.criar"><BaixaPerda /></Protegida>} />
                <Route path="/estoque/posicao" element={<Protegida cap="estoque.saldo.ver"><PosicaoEstoque /></Protegida>} />
                <Route path="/estoque/disponibilidade" element={<Protegida cap="comercial.disponibilidade.ver"><DisponibilidadeProdutos /></Protegida>} />
                <Route path="/estoque/entrada" element={<Protegida cap="estoque.entrada.criar"><EntradaEstoque /></Protegida>} />
                <Route path="/estoque/etiqueta" element={<Protegida cap="estoque.saldo.ver"><ConsultarEtiqueta /></Protegida>} />
                <Route path="/estoque/inventario" element={<Protegida cap="estoque.inventario.ver"><Inventario /></Protegida>} />
                <Route path="/logistica/fretes" element={<Protegida cap="logistica.frete.ver"><GestaoFretes /></Protegida>} />
                <Route path="/logistica/campanhas-frete" element={<Protegida cap="logistica.frete.ver"><CampanhasFrete /></Protegida>} />
                <Route path="/financeiro/receber" element={<Protegida cap="financeiro.receber.listar"><Contas tipo="receber" /></Protegida>} />
                <Route path="/financeiro/conferencia-cartao" element={<Protegida cap="financeiro.receber.listar"><ConferenciaCartao /></Protegida>} />
                <Route path="/financeiro/nota" element={<Protegida cap="financeiro.compra.criar"><NotaEntrada /></Protegida>} />
                <Route path="/estoque/recebimento" element={<Protegida cap="estoque.entrada.criar"><Recebimento /></Protegida>} />
                <Route path="/financeiro/comissoes" element={<Protegida cap="financeiro.comissao.ver"><Comissoes /></Protegida>} />
                <Route path="/financeiro/conciliacao" element={<Protegida cap="financeiro.conciliacao.ver"><Conciliacao /></Protegida>} />
                <Route path="/financeiro/fluxo" element={<Protegida cap="financeiro.fluxo.ver"><FluxoCaixa /></Protegida>} />
                <Route path="/financeiro/pagar" element={<Protegida cap="financeiro.pagar.listar"><Contas tipo="pagar" /></Protegida>} />
                <Route path="/relatorios" element={<Protegida cap="relatorios.ver"><Relatorios /></Protegida>} />
                <Route path="/relatorios/vendas" element={<Protegida cap="relatorios.vendas.ver"><RelVendas /></Protegida>} />
                <Route path="/relatorios/vendas-contabil" element={<Protegida cap="relatorios.contabil.vendas.ver"><RelVendasContabil /></Protegida>} />
                <Route path="/relatorios/contas-pagar" element={<Protegida cap="relatorios.contabil.pagar.ver"><RelContasPagarContabil /></Protegida>} />
                <Route path="/relatorios/contas-receber" element={<Protegida cap="relatorios.contabil.receber.ver"><RelContasReceberContabil /></Protegida>} />
                <Route path="/relatorios/pedidos" element={<Protegida cap="relatorios.pedidos.ver"><RelPedidos /></Protegida>} />
                <Route path="/relatorios/reembolsos" element={<Protegida cap="financeiro.pagar.listar"><RelFavorecidos /></Protegida>} />
                <Route path="/relatorios/produtos" element={<Protegida cap="relatorios.produtos.ver"><RelProdutos /></Protegida>} />
                <Route path="/relatorios/curva-abc" element={<Protegida cap="relatorios.abc.ver"><RelAbc /></Protegida>} />
                <Route path="/relatorios/validade" element={<Protegida cap="relatorios.validade.ver"><RelValidade /></Protegida>} />
                <Route path="/relatorios/estoque-parado" element={<Protegida cap="relatorios.parado.ver"><RelEstoqueParado /></Protegida>} />
                <Route path="/relatorios/perdas" element={<Protegida cap="relatorios.perdas.ver"><RelPerdas /></Protegida>} />
                <Route path="/relatorios/inventarios" element={<Protegida cap="estoque.inventario.ver"><RelInventarios /></Protegida>} />
                <Route path="/cadastros/contas-correntes" element={<Protegida cap="cadastros.conta.listar"><ContasCorrentes /></Protegida>} />
                <Route path="/cadastros/categorias-financeiras" element={<Protegida cap="cadastros.catfin.listar"><CategoriasFinanceiras /></Protegida>} />
                <Route path="/cadastros/plano-contas" element={<Protegida cap="cadastros.catfin.listar"><PlanoContas /></Protegida>} />
                <Route path="/financeiro/dre" element={<Protegida cap="financeiro.fluxo.ver"><RelDRECompetencia /></Protegida>} />
                <Route path="/cadastros/tipos-documento" element={<Protegida cap="cadastros.tipodoc.listar"><TiposDocumento /></Protegida>} />
                <Route path="/cadastros/bancos" element={<Protegida cap="cadastros.banco.listar"><Bancos /></Protegida>} />
                <Route path="/cadastros/taxas-cartao" element={<Protegida cap="cadastros.taxa_cartao.listar"><TaxasCartao /></Protegida>} />
                <Route path="/cadastros/condicoes" element={<Protegida cap="cadastros.condicao.listar"><Condicoes /></Protegida>} />
                <Route path="/cadastros/clientes" element={<Protegida cap="cadastros.cliente.listar"><Clientes /></Protegida>} />
                <Route path="/cadastros/fornecedores" element={<Protegida cap="cadastros.fornecedor.listar"><Fornecedores /></Protegida>} />
                <Route path="/cadastros/vendedores" element={<Protegida cap="cadastros.vendedor.listar"><Vendedores /></Protegida>} />
                <Route path="/cadastros/favorecidos" element={<Protegida cap="cadastros.favorecido.listar"><Favorecidos /></Protegida>} />
                <Route path="/cadastros/motoboys" element={<Protegida cap="cadastros.motoboy.listar"><Motoboys /></Protegida>} />
                <Route path="/cadastros/formas-entrega" element={<Protegida cap="cadastros.forma_entrega.listar"><FormasEntrega /></Protegida>} />
                <Route path="/cadastros/produtos" element={<Protegida cap="cadastros.produto.listar"><Produtos /></Protegida>} />
                <Route path="/superadmin/empresas" element={<Protegida soSuper><Empresas /></Protegida>} />
                <Route path="/superadmin/chamados" element={<Protegida soSuper><ChamadosSuporte /></Protegida>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </BrandingProvider>
      </AuthProvider>
    </I18nProvider>
    </ThemeProvider>
  );
}
