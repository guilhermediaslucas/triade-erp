import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Ao trocar de rota, rola a página de volta ao topo (instantâneo).
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector('.conteudo')?.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
