// Ícones SVG line-style portados do mockup (erp-mockup.html).
// <SpriteIcones/> é montado uma vez (no Layout); <Ic name="i-cart"/> referencia o símbolo.

export function Ic({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={'ic' + (className ? ' ' + className : '')} aria-hidden="true">
      <use href={'#' + name} />
    </svg>
  );
}

export function SpriteIcones() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></symbol>
      <symbol id="i-cart" viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h2.2l2.3 12h11l2-8H6.2" /></symbol>
      <symbol id="i-dollar" viewBox="0 0 24 24"><line x1="12" y1="2.5" x2="12" y2="21.5" /><path d="M16.5 6.5C16.5 4.8 14.5 3.7 12 3.7S7.5 4.8 7.5 6.9 9.8 9.6 12 10s4.5 1 4.5 3.2S14.5 16.4 12 16.4 7.5 15.3 7.5 13.6" /></symbol>
      <symbol id="i-box" viewBox="0 0 24 24"><path d="M21 8l-9-5-9 5v8l9 5 9-5z" /><path d="M3 8l9 5 9-5" /><line x1="12" y1="13" x2="12" y2="21" /></symbol>
      <symbol id="i-chart" viewBox="0 0 24 24"><line x1="4" y1="20" x2="20" y2="20" /><rect x="6" y="11" width="3" height="7" rx="1" /><rect x="11" y="6.5" width="3" height="11.5" rx="1" /><rect x="16" y="13" width="3" height="5" rx="1" /></symbol>
      <symbol id="i-clip" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2.5" /><rect x="9" y="2.5" width="6" height="3.2" rx="1.2" /><line x1="8.5" y1="11" x2="15.5" y2="11" /><line x1="8.5" y1="15" x2="13.5" y2="15" /></symbol>
      <symbol id="i-gear" viewBox="0 0 24 24"><line x1="4" y1="7" x2="20" y2="7" /><circle cx="9" cy="7" r="2.3" /><line x1="4" y1="17" x2="20" y2="17" /><circle cx="15" cy="17" r="2.3" /></symbol>
      <symbol id="i-help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.2" /><path d="M9.4 9.3a2.7 2.7 0 1 1 3.8 2.5c-1 .5-1.6 1-1.6 2.1" /><line x1="11.6" y1="17" x2="11.65" y2="17" /></symbol>
      <symbol id="i-truck" viewBox="0 0 24 24"><rect x="2" y="7" width="12" height="9" rx="1.5" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="6" cy="18" r="1.6" /><circle cx="18" cy="18" r="1.6" /></symbol>
      <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.6" y2="16.6" /></symbol>
      <symbol id="i-chev" viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18" /></symbol>
      <symbol id="i-shop" viewBox="0 0 24 24"><path d="M4 9h16l-1 11H5z" /><path d="M8 9V6a4 4 0 0 1 8 0v3" /></symbol>
      <symbol id="i-edit" viewBox="0 0 24 24"><path d="M14.5 5.5l4 4L8 20l-4.5 1 1-4.5z" /><line x1="13" y1="7" x2="17" y2="11" /></symbol>
      <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></symbol>
      <symbol id="i-check" viewBox="0 0 24 24"><polyline points="4 12.5 9.5 18 20 6.5" /></symbol>
      <symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 16V4" /><polyline points="7 9 12 4 17 9" /><path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" /></symbol>
    </svg>
  );
}
