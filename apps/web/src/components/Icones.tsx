// Ícones SVG line-style portados do mockup (erp-mockup.html).
// <SpriteIcones/> é montado uma vez (no Layout); <Ic name="i-cart"/> referencia o símbolo.
import type { CSSProperties } from 'react';

export function Ic({ name, className, style }: { name: string; className?: string; style?: CSSProperties }) {
  return (
    <svg className={'ic' + (className ? ' ' + className : '')} aria-hidden="true" style={style}>
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
      <symbol id="i-alert" viewBox="0 0 24 24"><path d="M12 3.2 21.5 20H2.5z" /><line x1="12" y1="9.5" x2="12" y2="14.5" /><line x1="12" y1="17.4" x2="12.02" y2="17.4" /></symbol>
      <symbol id="i-trash" viewBox="0 0 24 24"><polyline points="4 7 20 7" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></symbol>
      <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.8" /></symbol>
      <symbol id="i-check" viewBox="0 0 24 24"><polyline points="4 12.5 9.5 18 20 6.5" /></symbol>
      <symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 16V4" /><polyline points="7 9 12 4 17 9" /><path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" /></symbol>
      <symbol id="i-menu" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></symbol>
      <symbol id="i-x" viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></symbol>
      <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c.8-3.6 4-5.5 7.5-5.5s6.7 1.9 7.5 5.5" /></symbol>
      <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.4" /><path d="M3 19.5c.6-3 3-4.6 6-4.6s5.4 1.6 6 4.6" /><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6" /><path d="M17.5 14.9c2.3.4 3.9 1.9 4.5 4.6" /></symbol>
      <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0 1 12 0c0 4.5 1.5 5.5 2 6.5H4c.5-1 2-2 2-6.5z" /><path d="M10 19a2 2 0 0 0 4 0" /></symbol>
      <symbol id="i-camera" viewBox="0 0 24 24"><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H7l1.5-2.2h7L17 7h2.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" /><circle cx="12" cy="13" r="3.4" /></symbol>
      <symbol id="i-print" viewBox="0 0 24 24"><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="8" rx="1.5" /><rect x="7" y="14" width="10" height="6" rx="1" /></symbol>
      <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><line x1="12" y1="2.5" x2="12" y2="4.6" /><line x1="12" y1="19.4" x2="12" y2="21.5" /><line x1="2.5" y1="12" x2="4.6" y2="12" /><line x1="19.4" y1="12" x2="21.5" y2="12" /><line x1="5.2" y1="5.2" x2="6.7" y2="6.7" /><line x1="17.3" y1="17.3" x2="18.8" y2="18.8" /><line x1="5.2" y1="18.8" x2="6.7" y2="17.3" /><line x1="17.3" y1="6.7" x2="18.8" y2="5.2" /></symbol>
      <symbol id="i-moon" viewBox="0 0 24 24"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" style={{ fill: 'currentColor', stroke: 'none' }} /></symbol>
      <symbol id="i-expand" viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></symbol>
      <symbol id="i-compress" viewBox="0 0 24 24"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></symbol>
      <symbol id="i-key" viewBox="0 0 24 24"><circle cx="8" cy="14" r="4" /><path d="M11 11l9-9" /><line x1="17" y1="5" x2="19" y2="7" /><line x1="14.5" y1="7.5" x2="16.5" y2="9.5" /></symbol>
      <symbol id="i-tag" viewBox="0 0 24 24"><path d="M3 11.5V4h7.5l9.5 9.5-7.5 7.5L3 11.5z" /><circle cx="7.5" cy="7.5" r="1.4" /></symbol>
      <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l8 3v5.5c0 5-3.5 8-8 9.5-4.5-1.5-8-4.5-8-9.5V6z" /></symbol>
      <symbol id="i-download" viewBox="0 0 24 24"><path d="M12 4v11" /><polyline points="7 10.5 12 15.5 17 10.5" /><path d="M4 18v1.5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V18" /></symbol>
      <symbol id="i-receipt" viewBox="0 0 24 24"><path d="M5 3h14v18l-2.4-1.5-2.4 1.5-2.2-1.5L9.8 21l-2.4-1.5L5 21z" /><line x1="8.5" y1="8" x2="15.5" y2="8" /><line x1="8.5" y1="12" x2="13.5" y2="12" /></symbol>
      <symbol id="i-flag" viewBox="0 0 24 24"><line x1="5" y1="21" x2="5" y2="3.5" /><path d="M5 4.2h11l-2.2 3.2 2.2 3.2H5" /></symbol>
      <symbol id="i-filter" viewBox="0 0 24 24"><path d="M3 5h18l-7 8.2V20l-4-2.2v-4.6z" /></symbol>
      <symbol id="i-rows" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="5" rx="1.5" /><rect x="3.5" y="14" width="17" height="5" rx="1.5" /></symbol>
      <symbol id="i-arrow-up" viewBox="0 0 24 24"><polyline points="6 14 12 8 18 14" /></symbol>
      <symbol id="i-arrow-down" viewBox="0 0 24 24"><polyline points="6 10 12 16 18 10" /></symbol>
      <symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /></symbol>
      <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></symbol>
      <symbol id="i-nav" viewBox="0 0 24 24"><path d="M21 3 3 10.5l7.5 2.8L13.3 21z" /></symbol>
    </svg>
  );
}
