// Dati di prova trascritti dalle schede compilate al workshop 1 (Excel «Schede enti e attività compilate»).
// Campi segnati come "esempio" non sono presenti nelle schede: servono solo a mostrare il funzionamento.

const CATEGORIE = [
  'Cultura',
  'Divertimento, eventi e spettacolo',
  'Sport e promozione sportiva',
  'Salute e benessere',
  'Educazione e formazione della persona',
  'Sostenibilità e ambiente',
  'Partecipazione sociale e impegno civico',
  'Lavoro e diritti',
  'Solidarietà e cura',
];

const FASI = ['Prima infanzia', 'Bambini', 'Ragazzi', 'Adolescenti', 'Giovani', 'Adulti', 'Anziani', 'Famiglie', 'Per tutti'];

// Coordinate dei comuni (municipio, da OpenStreetMap): aggiornate in data-territorio.js.
const COMUNI = {
  'Romano di Lombardia': [45.5226, 9.7541],
  'Bariano': [45.5128, 9.7055],
  'Martinengo': [45.5699, 9.7668],
  'Fontanella': [45.4699, 9.8017],
  'Cividate al Piano': [45.5537, 9.8264],
  'Calcio': [45.5079, 9.8498],
  'Mozzanica': [45.4772, 9.6869],
  'Morengo': [45.5306, 9.7037],
};

const ENTI = [
  {
    id: 'sefem', nome: 'Se Fèm', tipo: 'Associazione culturale', tipoEsempio: true,
    comune: 'Romano di Lombardia', sede: 'Via Tito Speri 15, Romano di Lombardia',
    descrizione: 'L’associazione giovani «Se Fèm» è un ente che promuove la partecipazione giovanile, la socializzazione e la crescita personale dei ragazzi. Attraverso attività, progetti e iniziative si impegna a creare opportunità di aggregazione e cittadinanza attiva sul territorio.',
    contatti: [
      { tipo: 'instagram', testo: 'Instagram: @sefem.official' },
      { tipo: 'facebook', testo: 'Facebook: @sefem.official' },
      { tipo: 'tiktok', testo: 'TikTok: @sefem.official' },
    ],
  },
  {
    id: 'cafelule', nome: 'A.S.D. Cafelulé Danza', tipo: 'Associazione sportiva dilettantistica',
    comune: 'Martinengo, Fontanella', sede: 'Via Prefabbricati, Martinengo · Via Roma 2, Fontanella',
    descrizione: 'ASD che organizza corsi a Casalulé (Martinengo) di discipline aeree e circensi e corsi a LuLab (Fontanella) di ginnastica per la salute (pilates, yoga…). Realizza laboratori per le scuole e nelle scuole. Partecipa a eventi di intrattenimento con gli allievi di Casalulé. L’ASD è anche una compagnia che realizza spettacoli di danza verticale in Italia e all’estero.',
    contatti: [
      { tipo: 'web', testo: 'cafelule.it' },
      { tipo: 'instagram', testo: 'Instagram: Casalulé, LuLab e Cafelulé' },
    ],
  },
  {
    id: 'scout', nome: 'Scout AGESCI Cologno 1', tipo: null,
    comune: null, sede: null,
    descrizione: 'L’associazione, giovanile e educativa, si propone di contribuire, nel tempo libero, alla formazione della persona secondo i principi e metodi dello scautismo per aiutare i giovani a crescere come buoni cittadini.',
    contatti: [{ tipo: 'instagram', testo: 'Instagram: scout_cologno1' }],
  },
  {
    id: 'plasticfree', nome: 'Plastic Free ODV Onlus', tipo: 'Organizzazione di volontariato',
    comune: 'Bergamo', sede: 'Lazzaretto, Bergamo', fuoriAmbito: true,
    descrizione: 'Sensibilizzare attraverso appuntamenti di pulizia città, parchi, fiumi.',
    contatti: [
      { tipo: 'web', testo: 'www.plasticfreeonlus.it' },
      { tipo: 'instagram', testo: 'Instagram: plasticfreelombardia' },
    ],
  },
  {
    id: 'terzotempo', nome: 'Terzo Tempo ASD', tipo: 'Associazione sportiva dilettantistica',
    comune: 'Bariano', sede: 'Via Oriana Fallaci 162, Bariano',
    descrizione: null,
    contatti: [
      { tipo: 'web', testo: 'terzotempoasd.it' },
      { tipo: 'mail', testo: 'segreteria@terzotempoasd.it' },
      { tipo: 'instagram', testo: 'Instagram e Facebook' },
    ],
  },
  {
    id: 'cittagiovane', nome: 'La Città del Giovane', tipo: 'Organizzazione di volontariato',
    comune: 'Cividate al Piano', sede: 'Via Ospedale 34, Cividate al Piano',
    descrizione: 'La Città del Giovane è un’organizzazione di volontariato che non persegue scopi di lucro con lo scopo di svolgere le seguenti attività di utilità sociale: promuovere la partecipazione giovanile, cooperare con realtà associative e istituzionali del Paese, proporre eventi culturali e di sensibilizzazione per la comunità, favorire una rete tra i giovani del Paese per la crescita personale e umana dei suoi membri.',
    contatti: [
      { tipo: 'instagram', testo: 'Instagram: lacittadelgiovane' },
      { tipo: 'facebook', testo: 'Facebook: La Città Del Giovane - Cividate al Piano' },
      { tipo: 'tiktok', testo: 'TikTok: lacittadelgiovane' },
    ],
  },
  {
    id: 'beeyoung', nome: 'Be.E Young A.P.S.', tipo: 'Associazione di promozione sociale',
    comune: 'Calcio', sede: 'Via … Goffredi 18, Calcio (sede legale)',
    descrizione: 'Be.e Young è un’associazione di promozione sociale che si occupa di organizzare eventi e iniziative con lo scopo di creare momenti di aggregazione e condivisione. Le nostre iniziative sono rivolte prevalentemente ai giovani, ma creiamo occasioni di formazione e di condivisione per le famiglie.',
    contatti: [
      { tipo: 'web', testo: 'beeyoungcalcio.it' },
      { tipo: 'instagram', testo: 'Instagram: be.eyoung' },
      { tipo: 'facebook', testo: 'Facebook: Be.E Young' },
    ],
  },
];

// luogo: { comuni:[...] } per le attività con un luogo nell'Ambito; null se itineranti / senza sede / non indicato
// date: date di esempio (giugno 2027) per gli eventi: le schede non hanno un campo data
const ATTIVITA = [
  { id: 'fem', nome: 'F.E.M. in Rocca', ente: 'sefem', categorie: ['Divertimento, eventi e spettacolo', 'Cultura'],
    per: ['Giovani', 'Per tutti'], durata: 'Evento', dove: 'Rocca, Romano di Lombardia', luogo: ['Romano di Lombardia'], offset: [0.002, 0.004],
    offre: 'Momento di aggregazione e svago con DJ set, esposizioni artistiche durante orario aperitivo.', accesso: 'Libero',
    orari: '17.00–24.00', contatti: [{ tipo: 'instagram', testo: '@sefem.official' }],
    distintivi: 'Primo evento giovani in Rocca.',
    testo: 'Evento musicale-culturale-artistico in cui i giovani raccontano e coinvolgono coetanei e la comunità nel cortile della Rocca Viscontea.',
    date: ['2027-06-19'] },
  { id: 'redtrack', nome: 'Red Track Tournament', ente: 'sefem', categorie: ['Sport e promozione sportiva', 'Divertimento, eventi e spettacolo'],
    per: ['Per tutti'], durata: 'Evento', dove: 'Pista Rossa, Romano di Lombardia', luogo: ['Romano di Lombardia'], offset: [-0.004, -0.003],
    offre: 'Torneo di basket, DJ set, foodtruck per tutta la durata dell’evento.', accesso: 'Iscrizione per partecipanti / libero per pubblico',
    orari: '14.00–23.00', contatti: [{ tipo: 'instagram', testo: '@redtracktournament' }],
    distintivi: 'Torneo di basket stile street con negozi con stand, bar, foodtruck, gelateria sul posto, DJ set.',
    testo: 'Torneo di basket organizzato da giovani per giovani, pista decorata da noi, DJ set orario aperitivo, stand negozi street.',
    date: ['2027-06-06'] },
  { id: 'cleanvaders', nome: 'Cleanvaders', ente: 'sefem', categorie: ['Sostenibilità e ambiente'],
    per: ['Per tutti'], durata: 'Evento', dove: 'Itinerante', luogo: null, tipoLuogo: 'Itinerante',
    offre: 'Raccolta rifiuti sul territorio.', accesso: 'Libero', orari: 'Nel pomeriggio',
    contatti: [{ tipo: 'instagram', testo: '@sefem.official' }],
    distintivi: 'Ragazzi che collaborano in maniera attiva e divertente con musica e aperitivo finale.',
    testo: 'Raccolta rifiuti itinerante intorno ad una specifica area del paese svolta in maniera divertente, in gruppo con musica e momenti di svago.',
    date: ['2027-06-20'] },
  { id: 'lulab', nome: 'LuLab Pilates Studio', ente: 'cafelule', categorie: ['Salute e benessere'],
    per: ['Ragazzi', 'Adulti'], durata: 'Continuativa', dove: 'LuLab, Via Roma 2, Fontanella', luogo: ['Fontanella'],
    offre: 'Corsi di ginnastica finalizzati alla salute.', accesso: 'Su appuntamento / prenotazione', orari: null,
    contatti: [{ tipo: 'tel', testo: '338 8253231' }, { tipo: 'mail', testo: 'studiolulab@email.com' }, { tipo: 'instagram', testo: 'Instagram: LuLab Pilates Studio' }],
    distintivi: 'Professionalità e esperienza. Attività olistiche. In forma ma nel rispetto delle fisicità e problematiche che ognuno può avere.',
    testo: 'Luogo intimo dove svolgere attività adattata e preventiva di ginnastica per la salute. Qui le persone vengono seguite durante tutto il percorso più adatto a loro.' },
  { id: 'casalule', nome: 'Casalulé. Scuola di discipline aeree', ente: 'cafelule', categorie: ['Sport e promozione sportiva'],
    per: ['Bambini', 'Ragazzi', 'Adulti'], durata: 'Continuativa', gratuito: true, gratuitoEsempio: true,
    dove: 'Casalulé, Via Prefabbricati snc, Martinengo', luogo: ['Martinengo'],
    offre: 'Corsi di svariate discipline aeree, laboratori circo bambini e attività annesse.', accesso: 'Su appuntamento / prenotazione', orari: null,
    contatti: [{ tipo: 'web', testo: 'www.cafelule.it' }, { tipo: 'mail', testo: 'casalule.info@gmail.com' }, { tipo: 'tel', testo: '379 3789075' }, { tipo: 'instagram', testo: 'Instagram: Spazio Casalulé' }],
    distintivi: 'Modo di tenersi in forma alternativo. Alleniamo oltre che i corpi la creatività, la sfida, il desiderio di superare il proprio limite, in un ambiente accogliente.',
    testo: 'Spazio in cui sport, arte e circo si incontrano.' },
  { id: 'cleanup', nome: 'Clean up – attività di raccolta', ente: 'plasticfree', categorie: ['Sostenibilità e ambiente'],
    per: ['Giovani', 'Famiglie', 'Adulti', 'Anziani'], durata: 'Evento', dove: 'Senza sede fissa', luogo: null, tipoLuogo: 'Senza sede fissa',
    offre: null, accesso: 'Registrandosi al singolo evento dal sito web', orari: '8–12, 14–18 circa', contatti: [], distintivi: null,
    testo: 'Ci si trova nel punto di ritrovo indicato in locandina, muniti di guanti e sacchi si pulisce una zona del paese. Finito l’evento si lasciano i rifiuti in un luogo stabilito con il Comune che poi passerà per il ritiro dei rifiuti. L’iscrizione all’evento è obbligatoria per la copertura assicurativa.',
    date: ['2027-06-12'] },
  { id: 'sensibilizzazione', nome: 'Sensibilizzazione studenti/cittadini', ente: 'plasticfree', categorie: ['Educazione e formazione della persona', 'Cultura'],
    per: ['Per tutti', 'Famiglie'], durata: null, scuole: true, dove: 'Senza sede fissa', luogo: null, tipoLuogo: 'Senza sede fissa',
    offre: null, accesso: 'Libero', orari: 'Variabili', contatti: [], distintivi: null, testo: null },
  { id: 'agesci', nome: 'AGESCI Scout Cologno 1', ente: 'scout', categorie: ['Educazione e formazione della persona', 'Sostenibilità e ambiente'],
    per: ['Bambini', 'Ragazzi', 'Adolescenti'], durata: 'Continuativa', dove: null, luogo: null, tipoLuogo: 'Luogo non compilato',
    offre: null, accesso: 'Iscrizione annuale', orari: null, contatti: [], distintivi: null, testo: null },
  { id: 'basket', nome: 'Corsi di basket', ente: 'terzotempo', categorie: ['Sport e promozione sportiva', 'Salute e benessere', 'Educazione e formazione della persona'],
    per: ['Bambini', 'Ragazzi', 'Giovani'], durata: 'Continuativa', dove: 'Bariano e Romano di Lombardia', luogo: ['Bariano', 'Romano di Lombardia'], offset: [0.003, -0.006],
    offre: 'Corsi di minibasket, microbasket, basket.', accesso: 'Prove gratuite + iscrizioni', orari: null,
    contatti: [{ tipo: 'web', testo: 'terzotempoasd.it' }, { tipo: 'instagram', testo: 'Instagram' }], distintivi: null, testo: null },
  { id: 'fitness', nome: 'Corsi fitness', ente: 'terzotempo', categorie: ['Sport e promozione sportiva', 'Salute e benessere', 'Partecipazione sociale e impegno civico'],
    per: ['Adolescenti', 'Giovani', 'Adulti', 'Anziani'], durata: 'Continuativa', dove: 'Bariano, Mozzanica, Morengo', luogo: ['Bariano', 'Mozzanica', 'Morengo'], offset: [-0.003, 0.004],
    offre: 'Corsi vari fitness, total body, GAG, vari (in base alle stagioni sportive).', accesso: 'Prove gratuite + iscrizione', orari: 'Serali (prevalentemente)',
    contatti: [{ tipo: 'web', testo: 'terzotempoasd.it' }, { tipo: 'mail', testo: 'segreteria@terzotempoasd.it' }, { tipo: 'instagram', testo: 'Instagram' }], distintivi: null, testo: null },
  { id: 'cammino', nome: 'Gruppo di cammino', ente: 'terzotempo', categorie: ['Sport e promozione sportiva', 'Salute e benessere', 'Partecipazione sociale e impegno civico'],
    per: ['Per tutti'], durata: 'Continuativa', dove: 'Bariano e limitrofi (partenza da Bariano)', luogo: ['Bariano'], offset: [0.005, 0.002],
    offre: 'Gruppo di cammino diurno: 2 volte alla settimana. Gruppo di cammino serale: 2 volte alla settimana.', accesso: 'Prove gratuite e iscrizione, tramite contatto',
    orari: 'Gruppo diurno (mattina); gruppo serale (serale e preserale)',
    contatti: [{ tipo: 'web', testo: 'terzotempoasd.it' }, { tipo: 'mail', testo: 'segreteria@terzotempoasd.it' }, { tipo: 'instagram', testo: 'Instagram' }], distintivi: null, testo: null },
  { id: 'weekend', nome: 'Weekend del Giovane', ente: 'cittagiovane', categorie: ['Divertimento, eventi e spettacolo'],
    per: ['Per tutti', 'Giovani'], durata: 'Evento', dove: 'Via Ospedale 34, Cividate al Piano', luogo: ['Cividate al Piano'], offset: [0.002, -0.003],
    offre: 'Tre serate in un weekend estivo con live music (giovani emergenti o band affermate), servizio cucina fino a tardi, cocktail e bar e tornei notturni di calcetto, beach volley e basket.',
    accesso: 'Scrivi alla nostra pagina Instagram', orari: null,
    contatti: [{ tipo: 'instagram', testo: 'Instagram: lacittadelgiovane' }, { tipo: 'facebook', testo: 'Facebook: La Città del Giovane - Cividate al Piano' }, { tipo: 'tiktok', testo: 'TikTok: lacittadelgiovane' }],
    distintivi: 'La possibilità di passare 3 serate uniche, che permettono a qualsiasi tipo di persona di trovare ciò che gli piace di più, che sia cantare a squarciagola, condividere una cena in compagnia o fare una partita con gli amici.',
    testo: null, date: ['2027-06-25', '2027-06-26', '2027-06-27'] },
  { id: 'cultura', nome: 'Cultura e servizi', ente: 'cittagiovane', categorie: ['Solidarietà e cura', 'Educazione e formazione della persona', 'Partecipazione sociale e impegno civico', 'Sostenibilità e ambiente'],
    per: ['Per tutti', 'Giovani'], durata: 'Continuativa', dove: 'Via Ospedale 34, Cividate al Piano', luogo: ['Cividate al Piano'], offset: [-0.002, 0.004],
    offre: 'Consegna dei pasti alle persone anziane, corsi di lingue, sensibilizzazione riguardo temi importanti (violenza sulle donne, mafia, ecc.), attività natalizia con la casa di riposo, affiancamento e collaborazione con altre associazioni per la tutela del territorio.',
    accesso: 'Scrivi alla nostra pagina Instagram', orari: null,
    contatti: [{ tipo: 'instagram', testo: 'Instagram: lacittadelgiovane' }, { tipo: 'facebook', testo: 'Facebook: La Città del Giovane - Cividate al Piano' }, { tipo: 'tiktok', testo: 'TikTok: lacittadelgiovane' }],
    distintivi: null, testo: null },
  { id: 'beefest', nome: 'Be.E Fest', ente: 'beeyoung', categorie: ['Divertimento, eventi e spettacolo', 'Partecipazione sociale e impegno civico'],
    per: ['Giovani', 'Famiglie'], durata: 'Evento', dove: 'Piazza Polivalente, Calcio', luogo: ['Calcio'],
    offre: '4 serate di musica dal vivo, intrattenimento, con la possibilità di mangiare e bere in loco.', accesso: 'Accesso libero',
    orari: 'Gio 18.00–00.00 · Ven 18.00–01.00 · Sab 18.00–02.00 · Dom 18.00–00.00', contatti: [], distintivi: null, testo: null,
    date: ['2027-06-10', '2027-06-11', '2027-06-12', '2027-06-13'] },
];

// Quattro eventi di esempio inventati, sempre nel prossimo fine settimana (le date si calcolano all'apertura della pagina).
const WEEKEND = (() => {
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const oggi = new Date(); const g = oggi.getDay();
  const sab = new Date(oggi); sab.setDate(oggi.getDate() + (g === 0 ? -1 : 6 - g));
  const dom = new Date(sab); dom.setDate(sab.getDate() + 1);
  return { sab: iso(sab), dom: iso(dom) };
})();
ATTIVITA.push(
  { id: 'ev-giochi', nome: 'Pomeriggio di giochi da tavolo', ente: 'sefem', categorie: ['Divertimento, eventi e spettacolo'],
    per: ['Ragazzi', 'Giovani'], durata: 'Evento', dove: 'Rocca, Romano di Lombardia', luogo: ['Romano di Lombardia'], offset: [0.0025, 0.0045],
    offre: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', accesso: 'Libero', orari: '15.00–19.00', contatti: [], distintivi: null, testo: null,
    date: [WEEKEND.sab], esempio: true, gratuito: true },
  { id: 'ev-danza', nome: 'Lezione aperta di danza aerea', ente: 'cafelule', categorie: ['Sport e promozione sportiva'],
    per: ['Bambini', 'Ragazzi'], durata: 'Evento', dove: 'Casalulé, Via Prefabbricati snc, Martinengo', luogo: ['Martinengo'],
    offre: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', accesso: 'Su prenotazione', orari: '10.00–12.00', contatti: [], distintivi: null, testo: null,
    date: [WEEKEND.sab], esempio: true },
  { id: 'ev-concerto', nome: 'Concerto di band emergenti', ente: 'cittagiovane', categorie: ['Divertimento, eventi e spettacolo', 'Cultura'],
    per: ['Giovani'], durata: 'Evento', dove: 'Via Ospedale 34, Cividate al Piano', luogo: ['Cividate al Piano'],
    offre: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', accesso: 'Libero', orari: '21.00–24.00', contatti: [], distintivi: null, testo: null,
    date: [WEEKEND.sab], esempio: true },
  { id: 'ev-pulizia', nome: 'Passeggiata ecologica di raccolta rifiuti', ente: 'plasticfree', categorie: ['Sostenibilità e ambiente'],
    per: ['Per tutti', 'Famiglie'], durata: 'Evento', dove: 'Piazza Maggiore, Martinengo', luogo: ['Martinengo'], offset: [0.001, -0.002],
    offre: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', accesso: 'Libero, guanti e sacchi forniti', orari: '9.30–12.00', contatti: [], distintivi: null, testo: null,
    date: [WEEKEND.dom], esempio: true, gratuito: true },
);

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
