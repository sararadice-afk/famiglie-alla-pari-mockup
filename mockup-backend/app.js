// Mockup del backend WordPress: navigazione con #hash, dati da ../mockup-html/data*.js
(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const enteById = Object.fromEntries(ENTI.map((e) => [e.id, e]));
  const attById = Object.fromEntries(ATTIVITA.map((a) => [a.id, a]));
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const dataIt = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MESI[m - 1]} ${y}`; };
  const comuneAtt = (a) => (a.luogo && a.luogo.length ? a.luogo.join(', ') : (a.tipoLuogo || '—'));
  const TIPI_ENTE = [...new Set(ENTI.map((e) => e.tipo).filter(Boolean))].sort();
  const COMUNI_L = Object.keys(COMUNI).sort();
  const TIPI_CONTATTO = { web: 'Sito web', mail: 'Email', tel: 'Telefono', instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' };

  // Proposte simulate della raccolta di giugno 2027
  const PROPOSTE = [
    { n: 1, tipo: 'Aggiornamento', ente: 'cittagiovane', att: 'weekend', ricevuta: '2027-05-06', stato: 'Da revisionare',
      cambi: [['Date', '25, 26, 27 giugno 2027', '25, 26, 27 giugno · 2, 3 luglio 2027'], ['Orari', '—', 'Dalle 19.00']] },
    { n: 2, tipo: 'Nuovo evento', ente: 'sefem', nome: 'Lorem ipsum dolor', ricevuta: '2027-05-08', stato: 'Da revisionare' },
    { n: 3, tipo: 'Nuovo evento', ente: 'cafelule', nome: 'Lorem ipsum sit amet', ricevuta: '2027-05-11', stato: 'Da revisionare' },
    { n: 4, tipo: 'Conferma senza modifiche', ente: 'beeyoung', att: 'beefest', ricevuta: '2027-05-12', stato: 'Da revisionare' },
    { n: 5, tipo: 'Aggiornamento', ente: 'terzotempo', att: 'cammino', ricevuta: '2027-05-03', stato: 'Pubblicata',
      cambi: [['Orari', 'Lorem ipsum', 'Lorem ipsum dolor']] },
    { n: 6, tipo: 'Nuovo evento', ente: 'plasticfree', nome: 'Lorem ipsum', ricevuta: '2027-05-02', stato: 'Scartata' },
  ];
  const daRev = PROPOSTE.filter((p) => p.stato === 'Da revisionare').length;
  const conReferente = ENTI.filter((e, i) => i < 7 || i % 3 === 0).length; // simulazione: enti con email referente compilata

  // ---------- menu ----------
  function menu(route) {
    const sez = route.startsWith('ente') || route === 'enti' || route === 'tipi-ente' ? 'enti'
      : route.startsWith('attivit') || route === 'importa' ? 'attivita'
        : route.startsWith('propost') || route === 'raccolta' || route === 'modulo' ? 'raccolta' : '';
    const off = (ic, t) => `<div class="voce off"><span class="ic">${ic}</span>${t}</div>`;
    const voce = (id, ic, t, sotto, extra = '') => `<a class="voce ${sez === id ? 'attiva' : ''}" href="#${sotto[0][0]}"><span class="ic">${ic}</span>${t}${extra}</a>`
      + (sez === id ? `<div class="sotto">${sotto.map(([h, l]) => `<a href="#${h}" class="${route === h ? 'attiva' : ''}">${l}</a>`).join('')}</div>` : '');
    $('#menu').innerHTML = off('⌂', 'Bacheca') + '<div class="sep"></div>' + off('✎', 'Articoli') + off('▣', 'Media') + off('▤', 'Pagine')
      + '<div class="sep"></div>'
      + voce('attivita', '★', 'Attività', [['attivita', 'Tutte le attività'], ['attivita-nuova', 'Aggiungi attività'], ['importa', 'Importa da Excel']])
      + voce('enti', '◉', 'Enti', [['enti', 'Tutti gli enti'], ['ente-nuovo', 'Aggiungi ente']])
      + voce('raccolta', '✉', 'Raccolta mensile', [['proposte', `Proposte ricevute <span class="badge">${daRev}</span>`], ['raccolta', 'Invio e scadenze'], ['modulo', 'Modulo per gli enti']], ` <span class="badge">${daRev}</span>`)
      + '<div class="sep"></div>' + off('⚇', 'Utenti') + off('⚙', 'Impostazioni');
  }

  // ---------- elenco attività ----------
  function prossimaData(a) { return (a.date || []).slice().sort()[0]; }
  function listaAttivita(q = {}) {
    let righe = ATTIVITA.slice();
    if (q.durata) righe = righe.filter((a) => a.durata === q.durata);
    if (q.cat) righe = righe.filter((a) => a.categorie[0] === q.cat);
    if (q.comune) righe = righe.filter((a) => (a.luogo || []).includes(q.comune));
    const ev = ATTIVITA.filter((a) => a.durata === 'Evento').length;
    const pag = righe.slice(0, 40);
    return `<h1>Attività <a class="page-title-action" href="#attivita-nuova">Aggiungi attività</a> <a class="page-title-action" href="#importa">Importa da Excel</a></h1>
    <ul class="subsub"><li><a class="${!q.durata ? 'corr' : ''}" href="#attivita">Tutte (${ATTIVITA.length})</a> |</li>
      <li><a class="${q.durata === 'Continuativa' ? 'corr' : ''}" href="#attivita?durata=Continuativa">Continuative (${ATTIVITA.length - ev})</a> |</li>
      <li><a class="${q.durata === 'Evento' ? 'corr' : ''}" href="#attivita?durata=Evento">Eventi (${ev})</a> |</li>
      <li><a href="#proposte">In revisione (${daRev})</a></li></ul>
    <div class="tablenav">
      <select><option>Azioni di gruppo</option><option>Modifica</option><option>Sposta nel cestino</option></select><button class="button">Applica</button>
      <select id="f-cat"><option value="">Tutte le categorie</option>${CATEGORIE.map((c) => `<option ${q.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
      <select id="f-com"><option value="">Tutti i comuni</option>${COMUNI_L.map((c) => `<option ${q.comune === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
      <button class="button" id="filtra">Filtra</button>
      <span class="dx">${righe.length} elementi${righe.length > 40 ? ' · pagina 1 di ' + Math.ceil(righe.length / 40) : ''}</span>
    </div>
    <table class="wp-list"><thead><tr><th class="cb"><input type="checkbox"></th><th>Titolo</th><th>Ente</th><th>Categoria principale</th><th>Pensato per</th><th>Comune</th><th>Durata</th><th>Prossima data</th></tr></thead>
    <tbody>${pag.map((a) => {
      const e = enteById[a.ente] || {}; const pd = prossimaData(a);
      return `<tr><td class="cb"><input type="checkbox"></td>
        <td class="tit"><a href="#attivita-${a.id}">${esc(a.nome)}</a>${a.id === 'weekend' ? ' — <span class="post-state">Aggiornamento in revisione</span>' : ''}
          <div class="azioni"><a href="#attivita-${a.id}">Modifica</a> | <a>Modifica rapida</a> | <a style="color:#b32d2e">Cestino</a> | <a>Visualizza</a> | <a>Duplica</a></div></td>
        <td><a href="#ente-${e.id}">${esc(e.nome || '')}</a></td><td>${esc(a.categorie[0])}</td><td>${esc((a.per || []).join(', '))}</td>
        <td>${esc(comuneAtt(a))}</td><td><span class="pill ${a.durata === 'Evento' ? 'ev' : 'co'}">${esc(a.durata || 'Continuativa')}</span></td>
        <td>${pd ? dataIt(pd) : '<span class="muto">—</span>'}</td></tr>`;
    }).join('')}</tbody></table>`;
  }

  // ---------- modifica attività ----------
  function boxContatti(contatti) {
    const righe = (contatti && contatti.length ? contatti : [{ tipo: 'web', testo: '' }]).map((c, i) => `<div class="r" style="grid-template-columns:24px 160px 1fr 24px">
      <span class="n">${i + 1}</span><select>${Object.entries(TIPI_CONTATTO).map(([k, v]) => `<option ${k === c.tipo ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <input type="text" value="${esc(String(c.testo || '').replace(/^(Instagram|Facebook|TikTok):\s*/i, ''))}"><span class="n">−</span></div>`).join('');
    return `<div class="repeater">${righe}<div class="add"><button class="button">+ Aggiungi contatto</button></div></div>`;
  }
  function mappaCampo(id) { return `<div class="mappa" id="${id}"></div><div class="aiuto">Scrivi l’indirizzo: il segnaposto si posiziona da solo e si può trascinare per correggerlo.</div>`; }
  function editAttivita(a) {
    const nuovo = !a; a = a || { nome: '', ente: '', categorie: [], per: [], durata: 'Continuativa', luogo: [], contatti: [] };
    const e = enteById[a.ente];
    const tipoLuogo = a.tipoLuogo === 'Itinerante' ? 'iti' : a.tipoLuogo === 'Senza sede fissa' ? 'ssf' : (a.luogo || []).length > 1 ? 'piu' : 'ind';
    const date = a.date || [];
    const prop = PROPOSTE.find((p) => p.att === a.id && p.stato === 'Da revisionare');
    setTimeout(() => creaMappa('m-att', a), 0);
    return `<h1>${nuovo ? 'Aggiungi attività' : 'Modifica attività'} ${nuovo ? '' : '<a class="page-title-action" href="#attivita-nuova">Aggiungi attività</a>'}</h1>
    ${prop ? `<div class="notice warn"><p>L’ente ha inviato un aggiornamento per questa attività. <a href="#proposta-${prop.n}">Confronta e approva</a></p></div>` : ''}
    <div class="edit"><div class="col-main">
      <input id="title" type="text" placeholder="Nome dell’attività" value="${esc(a.nome)}">
      <div class="postbox"><h2>Ente</h2><div class="inside">
        <div class="campo"><label>Ente che propone l’attività</label><select><option>${e ? esc(e.nome + ' · ' + (e.comune || '')) : 'Cerca un ente…'}</option></select>
        <div class="aiuto">Il nome dell’ente sotto all’attività rimanda alla sua scheda.</div></div></div></div>
      <div class="postbox"><h2>Descrizione</h2><div class="inside">
        <div class="campo"><label>Cosa offre</label><textarea>${esc(a.offre || '')}</textarea></div>
        <div class="campo"><label>Elementi distintivi</label><textarea>${esc(a.distintivi || '')}</textarea><div class="aiuto">Facoltativo; se vuoto, il campo non viene mostrato.</div></div>
        <div class="campo"><label>Testo breve</label><textarea>${esc(a.testo || '')}</textarea><div class="aiuto">Facoltativo; se vuoto, il campo non viene mostrato.</div></div>
        <div class="campo"><label>Perché in “<span id="perche-cat">${esc(a.categorie[0] || 'categoria principale')}</span>”</label><textarea>${esc(a.perche || '')}</textarea><div class="aiuto">Facoltativo; se vuoto, il campo non viene mostrato.</div></div>
      </div></div>
      <div class="postbox"><h2>Quando</h2><div class="inside">
        <div class="campo"><span class="lab">Durata</span><div class="radio-h">
          <label><input type="radio" name="dur" data-dur="cont" ${a.durata !== 'Evento' ? 'checked' : ''}> Continuativa</label>
          <label><input type="radio" name="dur" data-dur="ev" ${a.durata === 'Evento' ? 'checked' : ''}> Evento (va in calendario)</label></div></div>
        <div class="campo" id="blk-cont" ${a.durata === 'Evento' ? 'hidden' : ''}><label>Giorni e orari</label>
          <textarea rows="4" placeholder="Es. lunedì e mercoledì 18.00–19.30">${esc(a.durata === 'Evento' ? '' : (a.orari || ''))}</textarea>
          <div class="aiuto">Testo libero, anche su più righe. Facoltativo; se vuoto, il campo non viene mostrato.</div></div>
        <div class="campo" id="blk-ev" ${a.durata === 'Evento' ? '' : 'hidden'}><span class="lab">Date dell’evento</span>
          <div class="repeater"><div class="r" style="grid-template-columns:24px 170px 120px 120px 24px;padding-top:4px;padding-bottom:4px;background:#fff"><span></span><span class="muto">Data</span><span class="muto">Ora di inizio</span><span class="muto">Ora di fine</span><span></span></div>
            ${(date.length ? date : ['']).map((d, i) => `<div class="r" style="grid-template-columns:24px 170px 120px 120px 24px"><span class="n">${i + 1}</span>
            <input type="date" value="${d}"><input type="time"><input type="time"><span class="n">−</span></div>`).join('')}
            <div class="add"><button class="button">+ Aggiungi data</button></div></div>
          <div class="aiuto">Ogni data compare nel calendario.</div></div>
      </div></div>
      <div class="postbox"><h2>Dove</h2><div class="inside">
        <div class="campo"><span class="lab">Tipo di luogo</span><div class="radio-h">
          <label><input type="radio" name="tl" ${tipoLuogo === 'ind' ? 'checked' : ''}> Un indirizzo</label>
          <label><input type="radio" name="tl" ${tipoLuogo === 'piu' ? 'checked' : ''}> Più comuni</label>
          <label><input type="radio" name="tl" ${tipoLuogo === 'iti' ? 'checked' : ''}> Itinerante</label>
          <label><input type="radio" name="tl" ${tipoLuogo === 'ssf' ? 'checked' : ''}> Senza sede fissa</label></div>
          <div class="aiuto">Itinerante e senza sede fissa: l’attività non va sulla mappa ma nel riquadro a lato.</div></div>
        <div class="riga2"><div class="campo"><label>Indirizzo o nome del luogo</label><input type="text" value="${esc(a.dove || '')}"></div>
          <div class="campo"><label>Comuni</label><select multiple size="3">${COMUNI_L.map((c) => `<option ${(a.luogo || []).includes(c) ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div></div>
        ${mappaCampo('m-att')}
      </div></div>
      <div class="postbox"><h2>Come partecipare</h2><div class="inside">
        <div class="campo"><label>Come si accede</label><input type="text" value="${esc(a.accesso || '')}"></div>
        <div class="campo"><span class="lab">Contatti</span>${boxContatti(a.contatti)}<div class="aiuto">Se vuoto, nella scheda si mostrano i contatti dell’ente.</div></div>
      </div></div>
    </div>
    <div class="col-side">
      <div class="postbox"><h2>Pubblica</h2>
        <div class="misc"><p>Stato: <b>${nuovo ? 'Bozza' : 'Pubblicato'}</b> <a>Modifica</a></p><p>Visibilità: <b>Pubblica</b></p>
        ${nuovo ? '' : '<p class="muto">Ultima modifica: redazione, 12 maggio 2027</p>'}${a.placeholder ? '<p class="muto">Origine: import Excel «Aggiornamento Dati_2025»</p>' : ''}</div>
        <div class="major">${nuovo ? '<a>Salva bozza</a>' : '<button class="button-link-delete">Sposta nel cestino</button>'}<button class="button button-primary">${nuovo ? 'Pubblica' : 'Aggiorna'}</button></div></div>
      <div class="postbox"><h2>Categorie</h2><div class="inside">
        <div class="campo"><label>Categoria principale</label><select id="cat-princ"><option value="">Scegli…</option>${CATEGORIE.map((c) => `<option ${a.categorie[0] === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
          <div class="aiuto">Obbligatoria. Decide l’icona sulla mappa e la sezione in cui compare l’attività.</div></div>
        <div class="campo" style="margin-bottom:0"><span class="lab">Altre categorie</span><div class="check-list" id="cat-altre">
        ${CATEGORIE.map((c) => `<label data-cat="${esc(c)}" ${a.categorie[0] === c ? 'hidden' : ''}><input type="checkbox" ${a.categorie.indexOf(c) > 0 ? 'checked' : ''}> ${esc(c)}</label>`).join('')}
        </div><div class="aiuto">Facoltativo; se vuoto, il campo non viene mostrato.</div></div>
      </div></div>
      <div class="postbox"><h2>Pensato per</h2><div class="inside"><div class="check-list">
        ${FASI.map((f) => `<label><input type="checkbox" ${(a.per || []).includes(f) ? 'checked' : ''}> ${esc(f)}</label>`).join('')}
      </div></div></div>
      <div class="postbox"><h2>Opzioni</h2><div class="inside">
        <label class="toggle"><input type="checkbox" ${a.gratuito ? 'checked' : ''}> Gratuito</label>
        <label class="toggle"><input type="checkbox" ${a.scuole ? 'checked' : ''}> Per le scuole</label></div></div>
      <div class="postbox"><h2>Immagine o locandina</h2><div class="inside"><div class="immagine"><a class="button">Imposta immagine</a></div>
        <div class="aiuto" style="font-style:normal;line-height:1.6;margin-top:10px"><b>Obbligatoria.</b><br>Formato: JPG, PNG o WebP<br>Peso massimo: 2 MB<br>Larghezza minima: 1200 px<br>Orizzontale o verticale (anche locandine)</div></div></div>
    </div></div>`;
  }

  function creaMappa(id, a, ente) {
    const el = document.getElementById(id); if (!el || !window.L) return;
    let ll = null;
    if (a && a.coord) ll = a.coord;
    else if (a && a.luogo && a.luogo.length) { const c = COMUNI[a.luogo[0]]; const o = a.offset || [0, 0]; if (c) ll = [c[0] + o[0], c[1] + o[1]]; }
    else if (ente && ente.coord) ll = ente.coord;
    else if (ente && COMUNI[ente.comune]) ll = COMUNI[ente.comune];
    const m = L.map(el, { scrollWheelZoom: false }).setView(ll || [45.52, 9.76], ll ? 15 : 11);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16, attribution: 'Tiles © Esri' }).addTo(m);
    if (ll) L.marker(ll, { draggable: true }).addTo(m);
  }

  // ---------- enti ----------
  function listaEnti(q = {}) {
    let righe = ENTI.slice(); if (q.tipo) righe = righe.filter((e) => e.tipo === q.tipo);
    const nAtt = (id) => ATTIVITA.filter((a) => a.ente === id).length;
    return `<h1>Enti <a class="page-title-action" href="#ente-nuovo">Aggiungi ente</a></h1>
    <div class="tablenav"><select id="f-tipo"><option value="">Tutti i tipi di ente</option>${TIPI_ENTE.map((t) => `<option ${q.tipo === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>
      <button class="button" id="filtra-enti">Filtra</button><span class="dx">${righe.length} elementi${righe.length > 40 ? ' · pagina 1 di ' + Math.ceil(righe.length / 40) : ''}</span></div>
    <table class="wp-list"><thead><tr><th class="cb"><input type="checkbox"></th><th>Nome</th><th>Tipo di ente</th><th>Comune</th><th>Attività</th><th>Referente per la raccolta</th><th>Ultima risposta</th></tr></thead>
    <tbody>${righe.slice(0, 40).map((e, i) => {
      const ref = i < 7 || ENTI.indexOf(e) % 3 === 0; const risp = PROPOSTE.find((p) => p.ente === e.id);
      return `<tr><td class="cb"><input type="checkbox"></td><td class="tit"><a href="#ente-${e.id}">${esc(e.nome)}</a>
        <div class="azioni"><a href="#ente-${e.id}">Modifica</a> | <a>Copia link al modulo</a> | <a>Visualizza</a></div></td>
        <td>${esc(e.tipo || '')}</td><td>${esc(e.comune || '')}</td><td>${nAtt(e.id)}</td>
        <td>${ref ? '<span class="pill ok">Email presente</span>' : '<span class="pill no">Manca email</span>'}</td>
        <td>${risp ? dataIt(risp.ricevuta) : '<span class="muto">—</span>'}</td></tr>`;
    }).join('')}</tbody></table>`;
  }
  function editEnte(e) {
    const nuovo = !e; e = e || { nome: '', contatti: [] };
    const att = ATTIVITA.filter((a) => a.ente === e.id);
    const cat = [...new Set(att.flatMap((a) => a.categorie))];
    return `<h1>${nuovo ? 'Aggiungi ente' : 'Modifica ente'}</h1>
    <div class="edit"><div class="col-main">
      <input id="title" type="text" placeholder="Nome dell’ente" value="${esc(e.nome)}">
      <div class="postbox"><h2>L’ente in breve</h2><div class="inside"><textarea style="min-height:110px">${esc(e.descrizione || '')}</textarea></div></div>
      <div class="postbox"><h2>Sede</h2><div class="inside">
        <div class="riga2"><div class="campo"><label>Indirizzo</label><input type="text" value="${esc(e.sede || '')}"></div>
        <div class="campo"><label>Comune</label><select><option></option>${COMUNI_L.map((c) => `<option ${e.comune === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div></div>
        <div class="aiuto">La sede si mostra come testo nella scheda ente. Quando si crea un’attività, l’indirizzo della sede viene proposto come luogo di partenza.</div></div></div>
      <div class="postbox"><h2>Contatti pubblici</h2><div class="inside">${boxContatti(e.contatti)}</div></div>
      <div class="postbox"><h2>Collabora con</h2><div class="inside"><div class="campo"><select><option>Cerca un ente…</option></select><div class="aiuto">Facoltativo; se vuoto, il campo non viene mostrato.</div></div></div></div>
      <div class="postbox privato"><h2>Referente per la raccolta mensile <small>non pubblicato</small></h2><div class="inside">
        <div class="riga2"><div class="campo"><label>Nome e cognome</label><input type="text" placeholder="Nome Cognome"></div><div class="campo"><label>Ruolo</label><input type="text" placeholder="Lorem ipsum"></div></div>
        <div class="riga2"><div class="campo"><label>Email</label><input type="email" placeholder="referente@lorem-ipsum.it"><div class="aiuto">Riceve la mail mensile con il link al modulo.</div></div><div class="campo"><label>Telefono</label><input type="text"></div></div>
        <div class="campo"><span class="lab">Link personale al modulo</span><div style="display:flex;gap:6px"><input type="text" readonly value="https://lorem-ipsum.it/aggiorna/${esc(e.id || 'nuovo')}-7f3a9c" style="flex:1"><button class="button">Copia</button><button class="button">Invia ora</button><button class="button">Rigenera</button></div>
        <div class="aiuto">Chi ha il link può proporre aggiornamenti solo per questo ente, senza account. Le proposte arrivano in revisione.</div></div>
      </div></div>
      ${nuovo ? '' : `<div class="postbox"><h2>Attività dell’ente <small>${att.length}</small></h2><div class="inside">
        <table class="wp-list"><tbody>${att.map((a) => `<tr><td class="tit"><a href="#attivita-${a.id}">${esc(a.nome)}</a></td><td>${esc(a.categorie[0])}</td><td><span class="pill ${a.durata === 'Evento' ? 'ev' : 'co'}">${esc(a.durata || 'Continuativa')}</span></td></tr>`).join('')}</tbody></table>
        <p><a class="button" href="#attivita-nuova">+ Aggiungi attività per questo ente</a></p></div></div>`}
    </div>
    <div class="col-side">
      <div class="postbox"><h2>Pubblica</h2><div class="misc"><p>Stato: <b>${nuovo ? 'Bozza' : 'Pubblicato'}</b></p>${e.placeholder ? '<p class="muto">Origine: import Excel «Aggiornamento Dati_2025»</p>' : ''}</div>
        <div class="major"><button class="button-link-delete">Sposta nel cestino</button><button class="button button-primary">${nuovo ? 'Pubblica' : 'Aggiorna'}</button></div></div>
      <div class="postbox"><h2>Tipo di ente</h2><div class="inside"><select style="width:100%"><option></option>${TIPI_ENTE.map((t) => `<option ${e.tipo === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select><p><a>+ Aggiungi nuovo tipo</a></p></div></div>
      <div class="postbox"><h2>Categorie</h2><div class="inside"><p class="muto" style="margin-top:0">Calcolate dalle attività dell’ente.</p>${cat.map((c) => `<span class="pill" style="margin:0 4px 4px 0">${esc(c)}</span>`).join('') || '—'}</div></div>
    </div></div>`;
  }

  // ---------- raccolta mensile ----------
  function proposte() {
    return `<h1>Proposte ricevute · raccolta di giugno 2027</h1>
    <p class="descr">Qui arriva quello che gli enti inviano dal modulo. Niente va online finché la redazione non approva.</p>
    <div class="cards">
      <div class="card"><div class="num">${conReferente}</div><div class="lab">enti che hanno ricevuto la mail</div></div>
      <div class="card"><div class="num">${PROPOSTE.length}</div><div class="lab">proposte ricevute</div></div>
      <div class="card"><div class="num">${daRev}</div><div class="lab">da revisionare</div></div>
      <div class="card"><div class="num">${conReferente - new Set(PROPOSTE.map((p) => p.ente)).size}</div><div class="lab">enti che non hanno risposto · <a>invia promemoria</a></div></div>
    </div>
    <table class="wp-list"><thead><tr><th>#</th><th>Tipo</th><th>Attività</th><th>Ente</th><th>Ricevuta il</th><th>Stato</th><th></th></tr></thead>
    <tbody>${PROPOSTE.map((p) => {
      const e = enteById[p.ente]; const a = attById[p.att];
      const cls = p.stato === 'Pubblicata' ? 'ok' : p.stato === 'Scartata' ? 'no' : 'rev';
      return `<tr><td>${p.n}</td><td>${esc(p.tipo)}</td><td class="tit"><a href="#proposta-${p.n}">${esc(a ? a.nome : p.nome)}</a></td>
        <td><a href="#ente-${e.id}">${esc(e.nome)}</a></td><td>${dataIt(p.ricevuta)}</td><td><span class="pill ${cls}">${p.stato}</span></td>
        <td>${p.stato === 'Da revisionare' ? `<a class="button" href="#proposta-${p.n}">Rivedi</a>` : ''}</td></tr>`;
    }).join('')}</tbody></table>`;
  }
  function proposta(p) {
    const e = enteById[p.ente]; const a = attById[p.att];
    const azioni = `<p><button class="button button-primary">Approva e pubblica</button> <button class="button">Modifica prima di pubblicare</button> <button class="button-link-delete">Scarta</button></p>`;
    let corpo;
    if (p.tipo === 'Aggiornamento') {
      corpo = `<p>Modifiche proposte a <a href="#attivita-${a.id}">${esc(a.nome)}</a>. In verde i campi cambiati.</p>
      <div class="diff"><div class="h">Campo</div><div class="h">Ora sul sito</div><div class="h">Proposta dell’ente</div>
      ${p.cambi.map(([c, v, n]) => `<div>${c}</div><div>${esc(v)}</div><div class="cambiato">${esc(n)}</div>`).join('')}</div>`;
    } else if (p.tipo === 'Conferma senza modifiche') {
      corpo = `<p>L’ente conferma che <a href="#attivita-${a.id}">${esc(a.nome)}</a> resta com’è. Approvando, l’attività viene segnata come verificata a maggio 2027.</p>`;
    } else {
      corpo = `<p>Nuovo evento proposto. Si apre come bozza già compilata: controlla e pubblica.</p>
      <div class="diff" style="grid-template-columns:180px 1fr"><div class="h">Campo</div><div class="h">Proposta dell’ente</div>
      <div>Nome</div><div>${esc(p.nome)}</div><div>Categoria</div><div>${esc(CATEGORIE[1])}</div><div>Pensato per</div><div>Giovani, Famiglie</div>
      <div>Date</div><div>12 giugno 2027, 21.00</div><div>Dove</div><div>${esc(e.sede || e.comune || '')}</div><div>Cosa offre</div><div>${esc(LOREM)}</div><div>Locandina</div><div>locandina.jpg</div></div>`;
    }
    return `<h1>Proposta #${p.n} · ${esc(p.tipo)}</h1><p class="descr">Da <a href="#ente-${e.id}">${esc(e.nome)}</a>, ricevuta il ${dataIt(p.ricevuta)} dal modulo.</p>
      <div class="postbox"><div class="inside">${corpo}${p.stato === 'Da revisionare' ? azioni : `<p><span class="pill ${p.stato === 'Pubblicata' ? 'ok' : 'no'}">${p.stato}</span></p>`}</div></div>
      <p><a href="#proposte">← Torna alle proposte</a></p>`;
  }
  function raccolta() {
    return `<h1>Raccolta mensile · invio e scadenze</h1>
    <p class="descr">Ogni mese il sito scrive in automatico ai referenti degli enti con il loro link personale al modulo.</p>
    <div class="timeline">
      <div class="step fatto"><b>1 maggio</b>Invio della mail a tutti i referenti</div>
      <div class="step fatto"><b>15 maggio</b>Promemoria a chi non ha risposto</div>
      <div class="step fatto"><b>20 maggio</b>Chiusura del modulo</div>
      <div class="step"><b>21–24 maggio</b>Revisione della redazione</div>
      <div class="step"><b>25 maggio</b>Calendario di giugno online</div>
    </div>
    <div class="postbox"><h2>Impostazioni</h2><div class="inside"><table class="form-table">
      <tr><th>Raccolta attiva</th><td><label class="toggle"><input type="checkbox" checked> Invia ogni mese</label></td></tr>
      <tr><th>Giorno di invio</th><td><select><option>1</option></select> del mese precedente</td></tr>
      <tr><th>Promemoria</th><td><select><option>15</option></select> del mese, solo a chi non ha risposto</td></tr>
      <tr><th>Scadenza</th><td><select><option>20</option></select> del mese</td></tr>
      <tr><th>Mittente</th><td><input type="text" value="Centro per la Famiglia" style="width:300px"> <input type="email" value="info@lorem-ipsum.it" style="width:240px"></td></tr>
      <tr><th>Notifica alla redazione</th><td><label class="toggle"><input type="checkbox" checked> Una mail per ogni nuova proposta</label></td></tr>
      <tr><th>Enti senza email del referente</th><td>${ENTI.length - conReferente} enti non riceveranno la mail. <a href="#enti">Vedi elenco</a></td></tr>
    </table></div></div>
    <div class="postbox"><h2>Testo della mail <small>bozza da rivedere</small></h2><div class="inside">
      <div class="email-prev"><div class="hd"><b>Oggetto:</b> Lorem ipsum: eventi di giugno entro il 20 maggio</div>
      <div class="bd">Ciao {nome_referente},<br><br>${esc(LOREM)}<br><br>
      <a class="button button-primary" style="color:#fff">Aggiorna le attività di {nome_ente}</a><br><br>
      <span class="muto">Attività di {nome_ente} oggi sul sito: {elenco_attivita}</span></div></div>
      <p><button class="button">Invia una prova a me</button> <button class="button button-primary">Salva</button></p></div></div>`;
  }
  function modulo() {
    return `<h1>Modulo per gli enti <a class="page-title-action" href="../mockup-modulo/index.html?ente=cittagiovane" target="_blank">Apri in una nuova scheda</a></h1>
    <p class="descr">Anteprima di quello che vede La Città del Giovane aprendo il suo link personale.</p>
    <iframe src="../mockup-modulo/index.html?ente=cittagiovane" style="width:100%;height:calc(100vh - 190px);border:1px solid #c3c4c7;background:#fff"></iframe>`;
  }
  function importa() {
    return `<h1>Importa da Excel</h1>
    <p class="descr">Per il primo caricamento o per aggiornare molti enti insieme. Il file va compilato sul modello scaricabile, con le stesse colonne delle schede.</p>
    <div class="postbox"><div class="inside"><table class="form-table">
      <tr><th>Modello</th><td><a class="button">Scarica modello enti.xlsx</a> <a class="button">Scarica modello attività.xlsx</a></td></tr>
      <tr><th>File</th><td><input type="file"></td></tr>
      <tr><th>Se l’elemento esiste già</th><td><label class="toggle"><input type="radio" name="imp" checked> Aggiorna i campi compilati</label><label class="toggle"><input type="radio" name="imp"> Salta</label></td></tr>
      <tr><th>Stato dopo l’import</th><td><select><option>Bozza</option><option>Pubblicato</option></select></td></tr>
    </table><p><button class="button button-primary">Controlla il file</button></p></div></div>
    <div class="notice ok"><p><b>Ultimo import:</b> «Aggiornamento Dati_2025.xlsx» · ${ENTI.filter((e) => e.placeholder).length} enti e ${ATTIVITA.filter((a) => a.placeholder).length} attività. Indirizzi convertiti in coordinate in automatico.</p></div>`;
  }

  // ---------- router ----------
  function render() {
    const [route, qs] = (location.hash.slice(1) || 'attivita').split('?');
    const q = Object.fromEntries(new URLSearchParams(qs || ''));
    menu(route);
    let h;
    if (route === 'attivita') h = listaAttivita(q);
    else if (route === 'attivita-nuova') h = editAttivita(null);
    else if (route.startsWith('attivita-')) h = editAttivita(attById[route.slice(9)]);
    else if (route === 'enti') h = listaEnti(q);
    else if (route === 'ente-nuovo') h = editEnte(null);
    else if (route.startsWith('ente-')) h = editEnte(enteById[route.slice(5)]);
    else if (route === 'proposte') h = proposte();
    else if (route.startsWith('proposta-')) h = proposta(PROPOSTE.find((p) => p.n === +route.slice(9)));
    else if (route === 'raccolta') h = raccolta();
    else if (route === 'modulo') h = modulo();
    else if (route === 'importa') h = importa();
    $('#corpo').innerHTML = h || '';
    window.scrollTo(0, 0);
  }
  document.addEventListener('click', (ev) => {
    if (ev.target.id === 'filtra') { const c = $('#f-cat').value, m = $('#f-com').value; const p = new URLSearchParams(); if (c) p.set('cat', c); if (m) p.set('comune', m); location.hash = 'attivita' + (p.toString() ? '?' + p : ''); }
    if (ev.target.id === 'filtra-enti') { const t = $('#f-tipo').value; location.hash = 'enti' + (t ? '?tipo=' + encodeURIComponent(t) : ''); }
  });
  document.addEventListener('change', (ev) => {
    if (ev.target.id === 'cat-princ') { const pc = document.getElementById('perche-cat'); if (pc) pc.textContent = ev.target.value || 'categoria principale'; document.querySelectorAll('#cat-altre label').forEach((l) => { const on = l.dataset.cat === ev.target.value; l.hidden = on; if (on) l.querySelector('input').checked = false; }); return; }
    const d = ev.target.dataset && ev.target.dataset.dur; if (!d) return;
    $('#blk-cont').hidden = d !== 'cont'; $('#blk-ev').hidden = d !== 'ev';
  });
  window.addEventListener('hashchange', render);
  render();
})();
