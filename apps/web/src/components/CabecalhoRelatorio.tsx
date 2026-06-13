import { useBranding } from '../branding/BrandingContext.js';

// Cabeçalho padrão dos relatórios: logo da empresa à esquerda, marca TRÍADE ERP à direita.
export function CabecalhoRelatorio({ titulo }: { titulo?: string }) {
  const { branding } = useBranding();
  return (
    <div className="rel-cab">
      <div className="rel-cab-esq">
        {branding?.logo
          ? <img src={branding.logo} alt={branding?.fantasia ?? ''} className="rel-cab-logo" />
          : <div className="rel-cab-fantasia">{branding?.fantasia ?? ''}</div>}
        {branding?.logo && branding?.fantasia && <span className="rel-cab-fantasia-sm">{branding.fantasia}</span>}
      </div>
      {titulo && <div className="rel-cab-titulo">{titulo}</div>}
      <div className="rel-cab-dir">
        <span className="rel-wordmark">TR<span className="rm-i">Í</span>ADE <span className="rm-erp">ERP</span></span>
      </div>
    </div>
  );
}
