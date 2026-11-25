(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const enteDi = (a) => ENTI.find((e) => e.id === a.ente);
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const MESI3 = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];

  const S = { espanse: new Set(), vista: 'mappa', cat: 'Tutte', per: [], comune: '', tipo: '', durata: 'Tutte', gratuito: false, scuole: false, q: '', modoElenco: 'attivita', aperta: null, mese: [new Date().getFullYear(), new Date().getMonth()], sel: null };

  // ---------- filtri ----------
  function enteCercato() {
    const q = S.q.trim().toLowerCase();
    if (q.length < 2) return null;
    return ENTI.find((e) => e.nome.toLowerCase().includes(q)) || null;
  }
  function filtra() {
    const q = S.q.trim().toLowerCase();
    const ec = enteCercato();
    return ATTIVITA.filter((a) => {
      const e = enteDi(a);
      if (S.cat !== 'Tutte' && !a.categorie.includes(S.cat)) return false;
      if (S.per.length && !S.per.some((p) => a.per.includes(p))) return false;
      if (S.comune && !((a.luogo || []).includes(S.comune) || (e.comune || '').includes(S.comune))) return false;
      if (S.tipo && e.tipo !== S.tipo) return false;
      if (S.durata === 'Continuativa' && a.durata !== 'Continuativa') return false;
      if (S.durata === 'Evento' && a.durata !== 'Evento') return false;
      if (S.gratuito && !a.gratuito) return false;
      if (S.scuole && !a.scuole) return false;
      if (q.length >= 2) {
        if (ec) return a.ente === ec.id;
        const testo = [a.nome, e.nome, a.offre, a.testo, a.dove].join(' ').toLowerCase();
        if (!testo.includes(q)) return false;
      }
      return true;
    });
  }

  // ---------- pezzi ----------
  const tag = (cls, t) => `<span class="tag ${cls}">${esc(t)}</span>`;
  const vuoto = () => '';
  const rigaEnte = (a, suffisso) => {
    const e = enteDi(a);
    const suf = suffisso ?? (a.luogo ? a.luogo.join(', ') : (a.tipoLuogo || ''));
    return `<div class="riga-ente"><button class="link-ente" data-ente="${e.id}">${esc(e.nome)}</button>${suf ? ' · ' + esc(suf) : ''}</div>`;
  };
  const rigaEnteTesto = (a, suf) => `<div class="riga-ente">${esc(enteDi(a).nome)}${suf ? ' · ' + esc(suf) : ''}</div>`;
  const contatti = (lista) => {
    if (!lista || !lista.length) return '';
    return `<div class="contatti">${lista.map((c) => `<a href="#" onclick="return false">${svg(ICONE[c.tipo] || ICONE.web)}${esc(c.testo)}</a>`).join('')}</div>`;
  };
  const campo = (lab, val, opzionale = false) => {
    if (!val) return '';
    return `<div class="campo"><div class="etichetta">${esc(lab)}</div><div class="val">${val}</div></div>`;
  };
  const tagsAtt = (a, { cat = true, dur = true } = {}) => [
    dur && a.durata ? tag('dur', a.durata) : '',
    cat ? a.categorie.map((c) => tag('cat', c)).join('') : '',
    a.gratuito ? tag('grat', 'Gratuito') : '',
  ].join('');
  const fmtData = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MESI[m - 1]} ${y}`; };

  // ---------- testata ----------
  function costruisciTestata() {
    $('#chips').innerHTML = [`<button class="chip on" data-cat="Tutte">Tutte</button>`]
      .concat(CATEGORIE.map((c) => `<button class="chip" data-cat="${esc(c)}">${svg(ICONE_CATEGORIA[c], 16)}${esc(c)}</button>`)).join('');
    $('#menu-per').innerHTML = FASI.map((f) => `<label><input type="checkbox" value="${esc(f)}"> ${esc(f)}</label>`).join('');
    const comuni = [...new Set(ATTIVITA.flatMap((a) => a.luogo || []).concat(Object.keys(COMUNI)))].sort();
    $('#menu-comune').innerHTML = `<label><input type="radio" name="comune" value="" checked> Tutti i comuni</label>` + comuni.map((c) => `<label><input type="radio" name="comune" value="${esc(c)}"> ${esc(c)}</label>`).join('');
    const tipi = [...new Set(ENTI.map((e) => e.tipo).filter(Boolean))].sort();
    $('#menu-tipo').innerHTML = `<label><input type="radio" name="tipo" value="" checked> Tutti i tipi</label>` + tipi.map((t) => `<label><input type="radio" name="tipo" value="${esc(t)}"> ${esc(t)}</label>`).join('');
  }
  function aggiornaTestata() {
    $$('#viste button').forEach((b) => b.classList.toggle('on', b.dataset.vista === S.vista));
    $$('#durata button').forEach((b) => b.classList.toggle('on', b.dataset.durata === S.durata));
    $('#durata').style.display = S.vista === 'calendario' ? 'none' : '';
    $$('#chips .chip').forEach((b) => b.classList.toggle('on', b.dataset.cat === S.cat));
    $('#t-gratuito').classList.toggle('on', S.gratuito);
    $('#t-scuole').classList.toggle('on', S.scuole);
    $('#b-per').classList.toggle('on', S.per.length > 0);
    $('#b-per span').textContent = S.per.length ? `Pensato per (${S.per.length})` : 'Pensato per';
    $('#b-comune').classList.toggle('on', !!S.comune);
    $('#b-comune span').textContent = S.comune || 'Comune';
    $('#b-tipo').classList.toggle('on', !!S.tipo);
    $('#b-tipo span').textContent = S.tipo || 'Tipo di ente';
    $('.ricerca').classList.toggle('attiva', S.q.length > 0);
  }

  // ---------- box ente cercato ----------
  function boxEnte(e, lista, extra = '') {
    const n = lista.length;
    return `<div class="box-ente"><div class="etichetta">Ente</div><h3>${esc(e.nome)}</h3>
      <div class="riga-ente">${esc([e.comune, extra].filter(Boolean).join(' · '))}</div>
      <button class="link" data-ente="${e.id}" style="text-align:left">Apri scheda ente →</button></div>`;
  }

  // ---------- mappa ----------
  let mappa, cluster, inVista = [], quanti = 20;
  const icoPin = (a, size = 16) => `<span class="pin">${svg(ICONE_CATEGORIA[a.categorie[0]] || '', size)}</span>`;
  function posizioni(a) {
    return (a.luogo || []).map((c, k) => { if (k === 0 && a.coord) return a.coord; const b = COMUNI[c]; if (!b) return null; const o = a.offset || [0, 0]; return [b[0] + o[0] + k * 0.0015, b[1] + o[1]]; }).filter(Boolean);
  }
  function listaLaterale(conLuogo, senza, ec, totale) {
    const card = (a) => `<div class="card ${S.sel === a.id ? 'sel' : ''}" data-sel="${a.id}" role="button" tabindex="0">
        <div class="top">${icoPin(a, 14)}<h3>${esc(a.nome)}</h3></div>
        ${rigaEnteTesto(a, enteDi(a).nome === a.nome ? '' : a.luogo.join(', '))}<div class="tags">${a.categorie[0] ? tag('cat', a.categorie[0]) : ''}${a.durata ? tag('dur', a.durata) : ''}</div></div>`;
    const cardSenza = (a) => `<div class="card senza" data-att="${a.id}" role="button" tabindex="0"><h3>${esc(a.nome)}</h3>${rigaEnteTesto(a, a.tipoLuogo)}
        <div class="tags">${tag('cat', a.categorie[0])}${a.durata ? tag('dur', a.durata) : ''}</div></div>`;
    const visibili = conLuogo.slice(0, quanti);
    $('#lista-lat').innerHTML = `${ec ? boxEnte(ec, [], `${totale} attività`) : ''}
      <div class="conteggio">${conLuogo.length} attività in quest’area della mappa</div>
      ${visibili.map(card).join('') || '<div class="nessuno">Nessuna attività in quest’area: sposta o allarga la mappa.</div>'}
      ${conLuogo.length > quanti ? `<button class="bottone-sec" data-altre>Mostra altre ${Math.min(20, conLuogo.length - quanti)}</button>` : ''}
      ${senza.length ? `<div class="sep"></div><div class="conteggio">${senza.length} ${senza.length === 1 ? 'attività itinerante, senza sede fissa o fuori Ambito' : 'attività itineranti, senza sede fissa o fuori Ambito'}</div>${senza.map(cardSenza).join('')}` : ''}`;
  }
  function aggiornaLista(lista) {
    const ec = enteCercato();
    const conLuogo = lista.filter((a) => a.luogo);
    const senza = lista.filter((a) => !a.luogo && a.tipoLuogo !== 'Luogo non compilato');
    const b = mappa.getBounds();
    inVista = conLuogo.filter((a) => posizioni(a).some((p) => b.contains(p)));
    listaLaterale(inVista, senza, ec, lista.length);
  }
  function vistaMappa(lista) {
    quanti = 20;
    $('#contenuto').innerHTML = `<div class="mappa-layout"><div class="lista-lat" id="lista-lat"></div><div id="mappa"></div></div>`;
    if (mappa) { mappa.remove(); mappa = null; }
    mappa = L.map('mappa', { scrollWheelZoom: false }).setView([45.525, 9.77], 12);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors', maxZoom: 16,
    }).addTo(mappa);
    cluster = L.markerClusterGroup({
      showCoverageOnHover: false, maxClusterRadius: 45, spiderfyOnMaxZoom: true,
      iconCreateFunction: (c) => L.divIcon({ className: 'cluster', html: `<span>${c.getChildCount()}</span>`, iconSize: [40, 40] }),
    });
    const punti = [];
    lista.filter((a) => a.luogo).forEach((a) => {
      posizioni(a).forEach((ll) => {
        punti.push(ll);
        const m = L.marker(ll, { icon: L.divIcon({ className: 'pin-mappa', html: icoPin(a, 16), iconSize: [32, 32], iconAnchor: [16, 16] }) });
        m.bindPopup(`<div class="pop"><h3>${esc(a.nome)}</h3>${rigaEnte(a, a.dove || '')}<div class="tags">${a.categorie[0] ? tag('cat', a.categorie[0]) : ''}${a.per.map((p) => tag('per', p)).join('')}${a.durata ? tag('dur', a.durata) : ''}</div><button class="link" data-att="${a.id}">Apri scheda attività →</button></div>`);
        m.on('click', () => { S.sel = a.id; $$('.card').forEach((x) => x.classList.toggle('sel', x.dataset.sel === a.id)); });
        cluster.addLayer(m);
      });
    });
    mappa.addLayer(cluster);
    if (punti.length) mappa.fitBounds(punti, { padding: [40, 40], maxZoom: 14 });
    mappa.on('moveend', () => { quanti = 20; aggiornaLista(lista); });
    aggiornaLista(lista);
    vistaMappa.lista = lista;
  }

  // ---------- elenco ----------
  function dettaglioAtt(a) {
    return `<div class="dettaglio">
      <div><div class="etichetta">Pensato per</div><div class="tags">${a.per.map((p) => tag('per', p)).join('')}</div></div>
      <div class="perche"><div class="etichetta">In “${esc(a.categorie[0])}” perché ...</div><div class="val">${LOREM}</div></div>
      ${a.testo ? `<div style="font-size:14px">${esc(a.testo)}</div>` : ''}
      <div class="griglia"><div class="col">
        ${campo('Cosa offre', esc(a.offre))}${campo('Come si accede', esc(a.accesso))}
        ${a.durata ? `<div class="tags">${tag('dur', a.durata)}</div>` : ''}
      </div><div class="col">
        ${campo('Dove', a.dove ? `<span style="color:${a.luogo ? 'var(--blu)' : 'inherit'}">${esc(a.dove)}</span>` : '')}
        ${campo('Orari', esc(a.orari), true)}
        ${a.contatti && a.contatti.length ? `<div class="campo"><div class="etichetta">Contatti</div>${contatti(a.contatti)}</div>` : ''}
      </div></div>
    </div>`;
  }
  function dettaglioEnte(e) {
    const att = ATTIVITA.filter((a) => a.ente === e.id);
    return `<div class="dettaglio">
      <div class="tags">${[...new Set(att.flatMap((a) => a.categorie.slice(0, 1)))].map((c) => tag('cat', c)).join('')}</div>
      ${e.descrizione ? `<div style="font-size:14px">${esc(e.descrizione)}</div>` : ''}
      <div class="griglia"><div class="col">${e.sede ? `<div class="campo"><div class="etichetta">Sede</div><div class="contatti"><span class="nolink">${svg(ICONE.sede)}${esc(e.sede)}</span></div></div>` : ''}</div>
      <div class="col">${e.contatti && e.contatti.length ? `<div class="campo"><div class="etichetta">Contatti</div>${contatti(e.contatti)}</div>` : ''}</div></div>
      <div><div class="etichetta">Le attività dell’ente</div><div class="col" style="gap:6px">${att.map((a) => `<div style="display:flex;gap:8px;align-items:center"><button class="link" data-att="${a.id}" style="font-size:14px">${esc(a.nome)} →</button>${a.durata ? tag('dur', a.durata) : ''}</div>`).join('')}</div></div>
    </div>`;
  }
  function vistaElenco(lista) {
    const ec = enteCercato();
    const enti = S.modoElenco === 'enti';
    let html = `<div class="barra-elenco"><div class="seg piccolo" id="modo"><button data-modo="attivita" class="${!enti ? 'on' : ''}">Attività</button><button data-modo="enti" class="${enti ? 'on' : ''}">Enti</button></div>
      <span class="cont">${lista.length} attività · ${new Set(lista.map((a) => a.ente)).size} enti</span></div>`;
    if (ec) html += `<div style="max-width:420px;margin-bottom:20px">${boxEnte(ec, lista, `${lista.length} attività`)}</div>`;
    const sezioni = [];
    const vuote = [];
    for (const c of CATEGORIE) {
      if (S.cat !== 'Tutte' && S.cat !== c) continue;
      if (!enti) {
        const items = lista.filter((a) => a.categorie[0] === c);
        if (!items.length) { vuote.push(c); continue; }
        const nEnti = new Set(items.map((a) => a.ente)).size;
        sezioni.push(`<section class="sezione"><div class="sx">${svg(ICONE_CATEGORIA[c], 28)}<h2>${esc(c)}</h2><div class="n">${items.length} ${items.length === 1 ? 'attività' : 'attività'} · ${nEnti} ${nEnti === 1 ? 'ente' : 'enti'}</div></div>
          <div class="contenitore">${(S.espanse.has('a-' + c) ? items : items.slice(0, 6)).map((a) => `<div class="voce ${S.aperta === a.id ? 'aperta' : ''}" data-voce="${a.id}"><button class="testa"><div class="corpo"><span class="titolo-att">${esc(a.nome)}</span>
            <span class="sub">${esc(enteDi(a).nome)} · ${esc(a.luogo ? a.luogo.join(', ') : (a.tipoLuogo || ''))} ${a.per.map((p) => tag('per', p)).join('')} ${a.durata ? tag('dur', a.durata) : ''}</span></div>${a.gratuito ? tag('grat', 'Gratuito') : ''}${svg(ICONE.chevron, 20, 'chev')}</button>${dettaglioAtt(a)}</div>`).join('')}${items.length > 6 && !S.espanse.has('a-' + c) ? `<button class="bottone-sec" data-tutte="a-${esc(c)}">Mostra tutte le ${items.length} attività</button>` : ''}</div></section>`);
      } else {
        const ids = [...new Set(lista.filter((a) => a.categorie.includes(c)).map((a) => a.ente))];
        if (!ids.length) { vuote.push(c); continue; }
        sezioni.push(`<section class="sezione"><div class="sx">${svg(ICONE_CATEGORIA[c], 28)}<h2>${esc(c)}</h2><div class="n">${ids.length} ${ids.length === 1 ? 'ente' : 'enti'}</div></div>
          <div class="contenitore">${(S.espanse.has('e-' + c) ? ids : ids.slice(0, 6)).map((id) => { const e = ENTI.find((x) => x.id === id); const n = ATTIVITA.filter((a) => a.ente === id).length; const k = 'e-' + id + '-' + c;
            return `<div class="voce ${S.aperta === k ? 'aperta' : ''}" data-voce="${k}"><button class="testa"><div class="corpo"><span class="titolo-att">${esc(e.nome)}</span>
            <span class="sub">${esc([e.tipo, e.comune].filter(Boolean).join(' · ') || 'Sede non compilata')} ${tag('cat', n + (n === 1 ? ' attività' : ' attività'))}</span></div>${svg(ICONE.chevron, 20, 'chev')}</button>${dettaglioEnte(e)}</div>`; }).join('')}${ids.length > 6 && !S.espanse.has('e-' + c) ? `<button class="bottone-sec" data-tutte="e-${esc(c)}">Mostra tutti i ${ids.length} enti</button>` : ''}</div></section>`);
      }
    }
    html += `<div class="sezioni">${sezioni.join('') || '<div class="nessuno">Nessun risultato con questi filtri.</div>'}</div>`;
    if (vuote.length && S.cat === 'Tutte') html += `<div class="vuote">${enti ? 'Ancora nessun ente in:' : 'Ancora nessuna attività in:'} ${vuote.map((v) => tag('per', v)).join('')}</div>`;
    $('#contenuto').innerHTML = html;
  }

  const isoDi = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  // ---------- calendario ----------
  function vistaCalendario(lista) {
    const ec = enteCercato();
    const [y, m] = S.mese;
    const eventi = lista.filter((a) => a.date && a.date.length);
    const perGiorno = {};
    eventi.forEach((a) => a.date.forEach((d) => { (perGiorno[d] = perGiorno[d] || []).push(a); }));
    const primo = new Date(y, m, 1); const offset = (primo.getDay() + 6) % 7;
    const giorniMese = new Date(y, m + 1, 0).getDate(); const giorniPrima = new Date(y, m, 0).getDate();
    const celle = [];
    for (let i = 0; i < 42; i++) {
      const n = i - offset + 1; let d, fuori = false, iso = '';
      if (n < 1) { d = giorniPrima + n; fuori = true; } else if (n > giorniMese) { d = n - giorniMese; fuori = true; } else { d = n; iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }
      if (i % 7 === 0 && n > giorniMese) break;
      celle.push(`<div class="g ${fuori ? 'fuori' : ''}"><span class="num">${d}</span>${(perGiorno[iso] || []).map((a) => `<button class="ev" data-att="${a.id}" title="${esc(a.nome)}">${esc(a.nome)}</button>`).join('')}</div>`);
    }
    const oggi = isoDi(new Date());
    const prossimi = eventi.map((a) => ({ a, d: a.date.slice().sort().find((x) => x >= oggi) })).filter((p) => p.d).sort((p, q) => p.d.localeCompare(q.d)).slice(0, 3);
    $('#contenuto').innerHTML = `<div class="cal-layout"><div>
      <div class="cal-testa"><button class="freccia" data-mese="-1">‹</button><h2>${MESI[m][0].toUpperCase() + MESI[m].slice(1)} ${y}</h2><button class="freccia" data-mese="1">›</button></div>
      <div class="griglia-mese">${['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((g) => `<div class="gs">${g}</div>`).join('')}${celle.join('')}</div></div>
      <div class="prossimi"><h2>Prossimi eventi</h2>${ec ? boxEnte(ec, eventi, `${eventi.length} eventi in calendario`) : ''}
      ${prossimi.map(({ a, d }) => { const [, mm, dd] = d.split('-').map(Number); return `<button class="ev-card" data-att="${a.id}"><div class="data"><b>${dd}</b><span>${MESI3[mm - 1]}</span></div><div class="t"><h3>${esc(a.nome)}</h3><div class="riga-ente">${esc(enteDi(a).nome)} · ${esc(a.dove || '')}${a.orari ? ' · ' + esc(a.orari) : ''}</div><div class="tags">${tag('cat', a.categorie[0])}</div></div></button>`; }).join('') || '<div class="nessuno">Nessun evento.</div>'}</div></div>`;
  }

  // ---------- modali ----------
  let mini;
  function apriAttivita(id) {
    const a = ATTIVITA.find((x) => x.id === id); if (!a) return;
    $('#modale').innerHTML = `<button class="chiudi" data-chiudi>${svg(ICONE.chiudi, 20)}</button><div class="corpo">
      <div><h2>${esc(a.nome)}</h2>${rigaEnte(a, enteDi(a).comune || '')}</div>
      <div class="tags">${tagsAtt(a)}</div>
      <div><div class="etichetta">Pensato per</div><div class="tags">${a.per.map((p) => tag('per', p)).join('')}</div></div>
      <div class="perche"><div class="etichetta">In “${esc(a.categorie[0])}” perché ...</div><div class="val">${LOREM}</div></div>
      ${a.testo ? `<div class="testo">${esc(a.testo)}</div>` : ''}
      <div class="griglia"><div class="col">
        ${campo('Cosa offre', esc(a.offre))}${campo('Come si accede', esc(a.accesso))}${campo('Elementi distintivi', esc(a.distintivi))}
        ${a.contatti && a.contatti.length ? `<div class="campo"><div class="etichetta">Contatti</div>${contatti(a.contatti)}</div>` : ''}
      </div><div class="col">
        ${a.dove ? `<div class="campo"><div class="etichetta">Dove</div><div class="val" style="color:${a.luogo ? 'var(--blu)' : 'inherit'}">${esc(a.dove)}</div>${a.luogo ? '<div id="mini" class="mini-mappa"></div>' : ''}</div>` : ''}
        ${a.durata === 'Evento' ? campo('Data', a.date ? esc(a.date.map(fmtData).join(', ')) : '') : ''}
        ${campo('Orari', esc(a.orari), true)}
      </div></div></div>
      <div class="immagine">${svg(ICONE.immagine, 40)}</div>`;
    $('#velo').classList.add('aperto');
    if (a.luogo) {
      setTimeout(() => {
        if (mini) mini.remove();
        const c = COMUNI[a.luogo[0]]; const off = a.offset || [0, 0]; const ll = a.coord || [c[0] + off[0], c[1] + off[1]];
        mini = L.map('mini', { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false }).setView(ll, 14);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16 }).addTo(mini);
        L.marker(ll, { icon: L.divIcon({ className: 'pin-mappa', html: icoPin(a, 16), iconSize: [32, 32], iconAnchor: [16, 16] }) }).addTo(mini);
      }, 30);
    }
  }
  function apriEnte(id) {
    const e = ENTI.find((x) => x.id === id); if (!e) return;
    const att = ATTIVITA.filter((a) => a.ente === e.id);
    $('#modale').innerHTML = `<button class="chiudi" data-chiudi>${svg(ICONE.chiudi, 20)}</button><div class="corpo">
      <div><h2>${esc(e.nome)}</h2><div class="riga-ente">${esc([e.tipo, e.comune].filter(Boolean).join(' · '))}</div></div>
      <div class="tags">${[...new Set(att.map((a) => a.categorie[0]))].map((c) => tag('cat', c)).join('')}</div>
      ${e.descrizione ? `<div class="testo" style="font-size:15px">${esc(e.descrizione)}</div>` : ''}
      <div class="box-contatti">${e.sede ? `<div class="campo"><div class="etichetta">Sede</div><div class="contatti"><span class="nolink">${svg(ICONE.sede)}${esc(e.sede)}</span></div></div>` : ''}
        ${e.contatti && e.contatti.length ? `<div class="campo"><div class="etichetta">Contatti</div>${contatti(e.contatti)}</div>` : ''}</div>
      <div><div class="etichetta">Le attività dell’ente</div><div class="carte-att">${att.map((a) => `<div class="card"><div class="tags">${tag('cat', a.categorie[0])}</div><h3>${esc(a.nome)}</h3><div class="tags">${a.per.map((p) => tag('per', p)).join('')}${a.durata ? tag('dur', a.durata) : ''}</div><button class="link" data-att="${a.id}" style="text-align:left">Apri scheda attività →</button></div>`).join('')}</div></div>
      <div><div class="etichetta">Collabora con</div><div class="collabora">${['Lorem ipsum', 'Dolor sit amet', 'Consectetur'].map((n, i) => `<div class="c"><b>${n}</b><span>Associazione · ${['Lorem', 'Ipsum', 'Dolor'][i]}</span></div>`).join('')}</div></div>
    </div>`;
    $('#velo').classList.add('aperto');
  }
  function chiudi() { $('#velo').classList.remove('aperto'); if (mini) { mini.remove(); mini = null; } }

  // ---------- render ----------
  function render() {
    aggiornaTestata();
    const lista = filtra();
    if (S.vista !== 'mappa' && mappa) { mappa.remove(); mappa = null; }
    if (S.vista === 'mappa') vistaMappa(lista);
    else if (S.vista === 'elenco') vistaElenco(lista);
    else vistaCalendario(lista);
  }

  // ---------- eventi ----------
  document.addEventListener('click', (ev) => {
    const t = ev.target.closest('button, [data-chiudi], [data-sel], [data-att], [data-altre], [data-tutte], label, input');
    $$('.dd').forEach((d) => { if (!d.contains(ev.target)) d.classList.remove('aperto'); });
    if (ev.target === $('#velo')) return chiudi();
    if (!t) return;
    if (t.matches('[data-chiudi]')) return chiudi();
    if (t.dataset.ente) { ev.preventDefault(); chiudi(); return apriEnte(t.dataset.ente); }
    if (t.dataset.att) { ev.preventDefault(); chiudi(); return apriAttivita(t.dataset.att); }
    if (t.dataset.vista) { const prima = S.vista; S.vista = t.dataset.vista; if (S.vista === 'calendario' && prima !== 'calendario') S.durata = 'Evento'; if (prima === 'calendario' && S.vista !== 'calendario' && S.durata === 'Evento') S.durata = 'Tutte'; S.aperta = null; return render(); }
    if (t.dataset.durata) { S.durata = t.dataset.durata; return render(); }
    if (t.dataset.cat) { S.cat = t.dataset.cat; return render(); }
    if (t.dataset.modo) { S.modoElenco = t.dataset.modo; S.aperta = null; return render(); }
    if (t.dataset.mese) { let [y, m] = S.mese; m += Number(t.dataset.mese); if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } S.mese = [y, m]; return render(); }
    if (t.hasAttribute('data-altre')) { quanti += 20; aggiornaLista(vistaMappa.lista); return; }
    if (t.hasAttribute('data-tutte')) { S.espanse.add(t.dataset.tutte); return render(); }
    if (t.dataset.sel) { S.sel = t.dataset.sel; return apriAttivita(t.dataset.sel); }
    if (t.id === 't-gratuito') { S.gratuito = !S.gratuito; return render(); }
    if (t.id === 't-scuole') { S.scuole = !S.scuole; return render(); }
    if (t.matches('.dd > button')) { const d = t.parentElement; const was = d.classList.contains('aperto'); $$('.dd').forEach((x) => x.classList.remove('aperto')); if (!was) d.classList.add('aperto'); return; }
    if (t.classList.contains('svuota')) { S.q = ''; $('#q').value = ''; return render(); }
    const voce = t.closest('.voce');
    if (voce && t.classList.contains('testa')) { const k = voce.dataset.voce; S.aperta = S.aperta === k ? null : k; $$('.voce').forEach((v) => v.classList.toggle('aperta', v.dataset.voce === S.aperta)); }
  });
  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.closest('#menu-per')) { S.per = $$('#menu-per input:checked').map((i) => i.value); render(); $('#dd-per').classList.add('aperto'); }
    if (t.name === 'comune') { S.comune = t.value; $('#dd-comune').classList.remove('aperto'); render(); }
    if (t.name === 'tipo') { S.tipo = t.value; $('#dd-tipo').classList.remove('aperto'); render(); }
  });
  $('#q').addEventListener('input', (ev) => { S.q = ev.target.value; render(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') chiudi(); });

  costruisciTestata();
  render();
})();
