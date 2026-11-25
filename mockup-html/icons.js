// Icone lineari (24px, tratto 1,5) dal file Figma; il colore segue currentColor.
const ICONE_CATEGORIA = {
  'Cultura': '<path d="M3 5.5C5.5 4.5 8.5 4.5 12 6.5V19.5C8.5 17.5 5.5 17.5 3 18.5V5.5Z"/><path d="M21 5.5C18.5 4.5 15.5 4.5 12 6.5V19.5C15.5 17.5 18.5 17.5 21 18.5V5.5Z"/>',
  'Divertimento, eventi e spettacolo': '<path d="M9 18V5L20 3V16"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  'Sport e promozione sportiva': '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6C8.6 8.6 8.6 15.4 5.6 18.4"/><path d="M18.4 5.6C15.4 8.6 15.4 15.4 18.4 18.4"/>',
  'Salute e benessere': '<path d="M9.5 3.5H14.5V9.5H20.5V14.5H14.5V20.5H9.5V14.5H3.5V9.5H9.5V3.5Z"/>',
  'Educazione e formazione della persona': '<path d="M2 9.5L12 4.5L22 9.5L12 14.5L2 9.5Z"/><path d="M6 11.5V16.3C9.5 18.7 14.5 18.7 18 16.3V11.5"/><path d="M22 9.5V15"/>',
  'Sostenibilità e ambiente': '<path d="M5 19C5 10 11 5 20 5C20 14 15 19.5 6 19.5"/><path d="M5 19.5L13 11.5"/>',
  'Partecipazione sociale e impegno civico': '<circle cx="12" cy="7" r="2.6"/><circle cx="5" cy="9.5" r="2"/><circle cx="19" cy="9.5" r="2"/><path d="M7.5 20V18.5a4.5 4.5 0 0 1 9 0V20"/><path d="M2 19v-.8a3.2 3.2 0 0 1 4-3.3"/><path d="M22 19v-.8a3.2 3.2 0 0 0-4-3.3"/>',
  'Lavoro e diritti': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5H15V7"/><path d="M3 12.5H21"/>',
  'Solidarietà e cura': '<path d="M12 20S4.5 15.4 4.5 9.7A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z"/>',
};
const ICONE = {
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  instagram: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r=".6" fill="currentColor"/>',
  facebook: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M14.5 8.5h-1.3c-1 0-1.7.7-1.7 1.7V20M9.5 13h5"/>',
  tiktok: '<path d="M13 4v10.5a3.5 3.5 0 1 1-3.5-3.5M13 4c.4 2.3 2 4 4.5 4.2"/>',
  sede: '<path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  cerca: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  chiudi: '<path d="M6 6l12 12M18 6 6 18"/>',
  immagine: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4 4 3 3-2 4 3"/>',
};
function svg(paths, size = 16, cls = '') {
  return `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
