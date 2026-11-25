// Mockup del modulo che l'ente apre dal link personale ricevuto con la mail mensile.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const FACOLT = 'Facoltativo; se vuoto, il campo non viene mostrato.';
  const TIPI = { web: 'Sito web', mail: 'Email', tel: 'Telefono', instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' };
  const COMUNI_L = Object.keys(COMUNI).sort();

  const idEnte = new URLSearchParams(location.search).get('ente') || 'cittagiovane';
  const E = ENTI.find((e) => e.id === idEnte) || ENTI[0];
  const ATT = ATTIVITA.filter((a) => a.ente === E.id);
  const stato = {}; // id attività → 'ok' | 'mod' | 'via'
  let nNuove = 0;

  // scadenza: il 20 del mese; il calendario aggiornato è quello del mese dopo
  const oggi = new Date();
  let scad = new Date(oggi.getFullYear(), oggi.getMonth(), 20);
  if (oggi.getDate() > 20) scad = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 20);
  const meseCal = new Date(scad.getFullYear(), scad.getMonth() + 1, 1);

  const fmtData = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MESI[m - 1]}`; };
  const riassunto = (a) => {
    const quando = a.durata === 'Evento' ? (a.date || []).map(fmtData).join(', ') : (a.orari || 'Continuativa');
    const dove = a.luogo ? a.luogo.join(', ') : (a.tipoLuogo || '');
    return [a.durata === 'Evento' ? 'Evento · ' + quando : quando, dove].filter(Boolean).join(' · ');
  };
  const pin = (cat, size = 18) => `<span class="pin">${svg(ICONE_CATEGORIA[cat] || '', size)}</span>`;
  const aiuto = (t) => `<div class="aiuto">${t}</div>`;
  const err = (t) => `<div class="msg-err">${t}</div>`;

  // ---------- form attività (uguale per modifica e nuova) ----------
  function rigaData(k, d = '') {
    return `<div class="date-riga"><div class="d"><div class="mini">Data</div><input type="date" value="${d}"></div>
      <div><div class="mini">Ora di inizio</div><input type="time"></div><div><div class="mini">Ora di fine</div><input type="time"></div>
      <button type="button" class="togli" data-togli title="Togli">×</button></div>`;
  }
  function rigaContatto(c = { tipo: 'web', testo: '' }) {
    return `<div class="contatto-riga"><select>${Object.entries(TIPI).map(([t, l]) => `<option ${t === c.tipo ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <input type="text" value="${esc(String(c.testo || '').replace(/^(Instagram|Facebook|TikTok):\s*/i, ''))}"><button type="button" class="togli" data-togli title="Togli">×</button></div>`;
  }
  function formAtt(a, k) {
    const nuova = !a;
    a = a || { nome: '', categorie: [], per: [], durata: 'Evento', luogo: [], contatti: [], date: [] };
    const ev = a.durata === 'Evento';
    const tl = a.tipoLuogo === 'Itinerante' ? 'iti' : a.tipoLuogo === 'Senza sede fissa' ? 'ssf' : (a.luogo || []).length > 1 ? 'piu' : 'ind';
    const princ = a.categorie[0] || '';
    return `<div class="form" data-form="${k}" data-nuova="${nuova ? 1 : ''}">
      <div class="campo" data-req="nome"><label>Nome ${nuova ? 'dell’evento o dell’attività' : ''}<span class="obb">obbligatorio</span></label><input type="text" id="${k}-nome" value="${esc(a.nome)}">${err('Scrivete il nome.')}</div>

      <div class="sezione-form">Di cosa si tratta</div>
      <div class="campo" data-req="cat"><label>Categoria principale<span class="obb">obbligatoria</span></label>
        <select id="${k}-cat" data-cat-princ="${k}"><option value="">Scegli…</option>${CATEGORIE.map((c) => `<option ${c === princ ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>${err('Scegliete la categoria principale.')}</div>
      <div class="campo"><span class="lab">Altre categorie</span><div class="chips" id="${k}-altre">
        ${CATEGORIE.map((c) => `<label data-cat="${esc(c)}" ${c === princ ? 'hidden' : ''}><input type="checkbox" ${a.categorie.indexOf(c) > 0 ? 'checked' : ''}>${esc(c)}</label>`).join('')}</div>${aiuto(FACOLT)}</div>
      <div class="campo" data-req="per"><span class="lab">Pensato per<span class="obb">almeno una</span></span><div class="chips" id="${k}-per">
        ${FASI.map((f) => `<label><input type="checkbox" ${(a.per || []).includes(f) ? 'checked' : ''}>${esc(f)}</label>`).join('')}</div>${err('Scegliete almeno una fascia.')}</div>
      <div class="campo" data-req="offre"><label>Cosa offre<span class="obb">obbligatorio</span></label><textarea id="${k}-offre">${esc(a.offre || '')}</textarea>${err('Descrivete cosa offre.')}</div>
      <div class="campo"><label>Elementi distintivi</label><textarea>${esc(a.distintivi || '')}</textarea>${aiuto(FACOLT)}</div>
      <div class="campo"><label>Testo breve</label><textarea>${esc(a.testo || '')}</textarea>${aiuto(FACOLT)}</div>
      <div class="campo"><label>Perché in “<span id="${k}-perche">${esc(princ || 'categoria principale')}</span>”</label><textarea>${esc(a.perche || '')}</textarea>${aiuto(FACOLT)}</div>

      <div class="sezione-form">Quando</div>
      <div class="campo"><div class="radio-h">
        <label><input type="radio" name="${k}-dur" value="cont" data-dur="${k}" ${ev ? '' : 'checked'}> Continuativa</label>
        <label><input type="radio" name="${k}-dur" value="ev" data-dur="${k}" ${ev ? 'checked' : ''}> Evento (va in calendario)</label></div></div>
      <div class="campo" id="${k}-blk-cont" ${ev ? 'hidden' : ''}><label>Giorni e orari</label><textarea placeholder="Es. lunedì e mercoledì 18.00–19.30">${esc(ev ? '' : (a.orari || ''))}</textarea>${aiuto(FACOLT)}</div>
      <div class="campo" id="${k}-blk-ev" data-req="date" ${ev ? '' : 'hidden'}><span class="lab">Date dell’evento<span class="obb">almeno una</span></span>
        <div id="${k}-date">${(a.date && a.date.length ? a.date : ['']).map((d) => rigaData(k, d)).join('')}</div>
        <button type="button" class="aggiungi" data-add-data="${k}">+ Aggiungi data</button>${err('Inserite almeno una data.')}${aiuto('Ogni data compare nel calendario.')}</div>

      <div class="sezione-form">Dove</div>
      <div class="campo"><div class="radio-h">
        ${[['ind', 'Un indirizzo'], ['piu', 'Più comuni'], ['iti', 'Itinerante'], ['ssf', 'Senza sede fissa']].map(([v, l]) => `<label><input type="radio" name="${k}-tl" value="${v}" data-tl="${k}" ${tl === v ? 'checked' : ''}> ${l}</label>`).join('')}</div></div>
      <div id="${k}-blk-ind" data-req="ind" class="campo" ${tl === 'ind' ? '' : 'hidden'}><div class="riga2">
        <div><label class="lab" style="font-weight:600;display:block;margin-bottom:6px">Indirizzo o nome del luogo</label><input type="text" id="${k}-ind" value="${esc(tl === 'ind' ? (a.dove || (nuova ? E.sede || '' : '')) : '')}"></div>
        <div><label class="lab" style="font-weight:600;display:block;margin-bottom:6px">Comune</label><select id="${k}-com"><option value="">Scegli…</option>${COMUNI_L.map((c) => `<option ${(a.luogo && a.luogo.length ? a.luogo : [E.comune])[0] === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div></div>
        ${err('Indicate indirizzo e comune.')}</div>
      <div id="${k}-blk-piu" data-req="piu" class="campo" ${tl === 'piu' ? '' : 'hidden'}><span class="lab">Comuni</span><div class="chips" id="${k}-comuni">
        ${COMUNI_L.map((c) => `<label><input type="checkbox" ${(a.luogo || []).includes(c) && tl === 'piu' ? 'checked' : ''}>${esc(c)}</label>`).join('')}</div>${err('Scegliete almeno un comune.')}</div>
      <div id="${k}-blk-nomap" class="campo" ${tl === 'iti' || tl === 'ssf' ? '' : 'hidden'}>${aiuto('L’attività non compare sulla mappa ma nell’elenco a lato.')}</div>

      <div class="sezione-form">Come partecipare</div>
      <div class="campo"><label>Come si accede</label><input type="text" value="${esc(a.accesso || '')}" placeholder="Es. libero, su prenotazione, con iscrizione">${aiuto(FACOLT)}</div>
      <div class="campo"><span class="lab">Contatti</span><div id="${k}-contatti">${(a.contatti && a.contatti.length ? a.contatti : [undefined]).map((c) => rigaContatto(c)).join('')}</div>
        <button type="button" class="aggiungi" data-add-cont="${k}">+ Aggiungi contatto</button>${aiuto('Se vuoto, nella scheda si mostrano i contatti dell’ente.')}</div>
      <div class="campo"><label class="switch"><input type="checkbox" ${a.gratuito ? 'checked' : ''}> Gratuito</label><label class="switch"><input type="checkbox" ${a.scuole ? 'checked' : ''}> Per le scuole</label></div>

      <div class="sezione-form">Immagine o locandina</div>
      <div class="campo" data-req="${nuova ? 'img' : ''}"><div class="upload">${nuova ? '' : '<div class="attuale">Lasciate vuoto per tenere l’immagine attuale.</div>'}<b>Scegliete un file</b><input type="file" accept="image/jpeg,image/png,image/webp" id="${k}-img"></div>
        <div class="aiuto">${nuova ? '<b>Obbligatoria.</b> ' : ''}Formato JPG, PNG o WebP · peso massimo 2 MB · larghezza minima 1200 px · orizzontale o verticale (anche locandine)</div>${err('Caricate un’immagine o una locandina.')}</div>
      ${nuova ? `<div class="azioni-form"><button type="button" class="bt sec" data-togli-nuova="${k}">Annulla</button></div>` : ''}
    </div>`;
  }

  // ---------- pagina ----------
  function cardAtt(a) {
    return `<div class="att" id="att-${a.id}">
      <div class="att-testa">${pin(a.categorie[0])}<div class="info"><h3>${esc(a.nome)}</h3><div class="det">${esc(riassunto(a))}</div></div><span class="stato" id="stato-${a.id}" hidden></span></div>
      <div class="scelte">
        <button type="button" class="scelta ok" data-scelta="ok" data-att="${a.id}">Va bene così</button>
        <button type="button" class="scelta mod" data-scelta="mod" data-att="${a.id}">Modifica</button>
        <button type="button" class="scelta via" data-scelta="via" data-att="${a.id}">Elimina</button></div>
      <div id="form-${a.id}" hidden>${formAtt(a, a.id)}</div></div>`;
  }
  function render() {
    $('#app').innerHTML = `
      <div class="testa"><div class="sopra">Famiglie alla pari · attività ed eventi di ${MESI[meseCal.getMonth()]} ${meseCal.getFullYear()}</div>
        <h1>${esc(E.nome)}</h1>
        <div class="scadenza">Da inviare entro il ${scad.getDate()} ${MESI[scad.getMonth()]}</div></div>

      <section class="blocco"><h2>Le vostre attività ed eventi sul sito Famiglie alla pari</h2>
        <p class="sotto">Per ognuna scegliete se va bene così, se va modificata o se va eliminata.</p>
        <div class="progresso" id="progresso"></div>
        ${ATT.map(cardAtt).join('') || '<p class="sotto">Non ci sono ancora attività sul sito.</p>'}</section>

      <section class="blocco"><h2>Nuovi eventi o attività</h2>
        <p class="sotto">Aggiungete quello che non è ancora sul sito.</p>
        <div id="nuove"></div>
        <div class="nuove-azioni"><button type="button" class="bt sec" data-add-nuova>+ Aggiungi un evento o un’attività</button></div></section>

      <section class="blocco"><h2>I dati del vostro ente</h2>
        <div class="att" id="att-ente"><div class="att-testa"><div class="info"><h3>${esc(E.nome)}</h3><div class="det">${esc([E.tipo, E.sede || E.comune].filter(Boolean).join(' · '))}</div></div><span class="stato" id="stato-ente" hidden></span></div>
          <div class="scelte" style="padding-left:16px"><button type="button" class="scelta ok" data-scelta-ente="ok">Va bene così</button><button type="button" class="scelta mod" data-scelta-ente="mod">Modifica</button></div>
          <div id="form-ente" hidden><div class="form">
            <div class="campo"><label>L’ente in breve</label><textarea>${esc(E.descrizione || '')}</textarea></div>
            <div class="riga2 campo"><div><label class="lab" style="font-weight:600;display:block;margin-bottom:6px">Indirizzo della sede</label><input type="text" value="${esc(E.sede || '')}"></div>
              <div><label class="lab" style="font-weight:600;display:block;margin-bottom:6px">Comune</label><select><option></option>${COMUNI_L.map((c) => `<option ${E.comune === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div></div>
            <div class="campo"><span class="lab">Contatti pubblici</span><div id="ente-contatti">${(E.contatti && E.contatti.length ? E.contatti : [undefined]).map((c) => rigaContatto(c)).join('')}</div>
              <button type="button" class="aggiungi" data-add-cont="ente">+ Aggiungi contatto</button></div>
          </div></div></div></section>

      <section class="blocco invio"><h2>Invio</h2>
        <div class="campo"><label>Note per la redazione del Centro per la Famiglia</label><textarea placeholder="Facoltativo"></textarea></div>
        <div class="avviso" id="avviso" hidden></div>
        <div class="riepilogo" id="riepilogo"></div>
        <button type="button" class="bt largo" data-invia>Invia</button>
        <div class="aiuto" style="font-size:12.5px;color:var(--testo2);text-align:center">Le modifiche vengono controllate dalla redazione del Centro per la Famiglia prima della pubblicazione.</div></section>`;
    aggiorna();
  }

  function aggiorna() {
    const fatte = ATT.filter((a) => stato[a.id]).length;
    if ($('#progresso')) $('#progresso').textContent = ATT.length ? `${fatte} di ${ATT.length} attività controllate` : '';
    const c = { ok: 0, mod: 0, via: 0 }; Object.values(stato).forEach((s) => c[s]++);
    const n = $$('#nuove .att').length;
    const parti = [c.ok && `${c.ok} confermate`, c.mod && `${c.mod} da modificare`, c.via && `${c.via} da eliminare`, n && `${n} ${n === 1 ? 'nuova' : 'nuove'}`].filter(Boolean);
    $('#riepilogo').textContent = parti.length ? 'Riepilogo: ' + parti.join(' · ') : '';
  }
  const ETICHETTE = { ok: 'Confermata', mod: 'Da modificare', via: 'Da eliminare' };

  function scegli(id, s) {
    stato[id] = s;
    const card = $('#att-' + id); card.className = 'att ' + s;
    $$('.scelta', card).forEach((b) => b.classList.toggle('on', b.dataset.scelta === s));
    const st = $('#stato-' + id); st.hidden = false; st.className = 'stato ' + s; st.textContent = ETICHETTE[s];
    $('#form-' + id).hidden = s !== 'mod';
    aggiorna();
  }
  function aggiungiNuova() {
    nNuove++; const k = 'n' + nNuove;
    const d = document.createElement('div'); d.className = 'att mod'; d.id = 'att-' + k;
    d.innerHTML = `<div class="att-testa"><div class="info"><h3 style="text-decoration:none">Nuovo evento o attività</h3></div><span class="stato nuova">Nuova</span></div>${formAtt(null, k)}`;
    $('#nuove').appendChild(d); $('#' + k + '-nome').focus(); aggiorna();
  }

  // ---------- controllo e invio ----------
  function valida(form) {
    const k = form.dataset.form; let ok = true;
    const set = (req, bad) => { const c = $(`[data-req="${req}"]`, form); if (!c) return; c.classList.toggle('err', bad); if (bad) ok = false; };
    set('nome', !$('#' + k + '-nome').value.trim());
    set('cat', !$('#' + k + '-cat').value);
    set('per', !$$('#' + k + '-per input:checked').length);
    set('offre', !$('#' + k + '-offre').value.trim());
    const ev = $(`input[name="${k}-dur"]:checked`).value === 'ev';
    set('date', ev && !$$('#' + k + '-date input[type=date]').some((i) => i.value));
    const tl = $(`input[name="${k}-tl"]:checked`).value;
    set('ind', tl === 'ind' && (!$('#' + k + '-ind').value.trim() || !$('#' + k + '-com').value));
    set('piu', tl === 'piu' && !$$('#' + k + '-comuni input:checked').length);
    if (form.dataset.nuova) set('img', !$('#' + k + '-img').files.length);
    return ok;
  }
  function invia() {
    const msg = [];
    const mancanti = ATT.filter((a) => !stato[a.id]);
    if (mancanti.length) msg.push(`Scegliete un’opzione per ${mancanti.length === 1 ? 'l’attività' : 'le attività'}: ${mancanti.map((a) => a.nome).join(', ')}.`);
    const forms = $$('.form[data-form]').filter((f) => !f.closest('[hidden]'));
    const errate = forms.filter((f) => !valida(f));
    if (errate.length) msg.push('Alcuni campi obbligatori non sono compilati: sono segnati in rosso.');
    const av = $('#avviso');
    if (msg.length) { av.hidden = false; av.innerHTML = msg.map(esc).join('<br>'); (errate[0] || (mancanti[0] && $('#att-' + mancanti[0].id)) || av).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const c = { ok: 0, mod: 0, via: 0 }; Object.values(stato).forEach((s) => c[s]++); const n = $$('#nuove .att').length;
    $('#app').innerHTML = `<section class="blocco grazie"><div class="spunta">✓</div><h2>Grazie, abbiamo ricevuto l’aggiornamento</h2>
      <p class="sotto">La redazione del Centro per la Famiglia controllerà le informazioni prima di pubblicarle.</p>
      <ul>${[c.ok && `<li>${c.ok} attività confermate</li>`, c.mod && `<li>${c.mod} attività da modificare</li>`, c.via && `<li>${c.via} attività da eliminare</li>`, n && `<li>${n} ${n === 1 ? 'nuovo evento o attività' : 'nuovi eventi o attività'}</li>`].filter(Boolean).join('')}</ul>
      <p class="sotto" style="margin-top:18px">Potete riaprire questo link fino al ${scad.getDate()} ${MESI[scad.getMonth()]} per fare altre modifiche.</p></section>`;
    window.scrollTo(0, 0);
  }

  // ---------- eventi ----------
  document.addEventListener('click', (ev) => {
    const t = ev.target.closest('button'); if (!t) return;
    if (t.dataset.scelta) return scegli(t.dataset.att, t.dataset.scelta);
    if (t.dataset.sceltaEnte) {
      const s = t.dataset.sceltaEnte; const card = $('#att-ente'); card.className = 'att ' + s;
      $$('.scelta', card).forEach((b) => b.classList.toggle('on', b.dataset.sceltaEnte === s));
      const st = $('#stato-ente'); st.hidden = false; st.className = 'stato ' + s; st.textContent = s === 'ok' ? 'Confermati' : 'Da modificare';
      $('#form-ente').hidden = s !== 'mod'; return;
    }
    if (t.hasAttribute("data-add-nuova")) return aggiungiNuova();
    if (t.dataset.togliNuova) { $('#att-' + t.dataset.togliNuova).remove(); return aggiorna(); }
    if (t.dataset.addData) { $('#' + t.dataset.addData + '-date').insertAdjacentHTML('beforeend', rigaData(t.dataset.addData)); return; }
    if (t.dataset.addCont) { $('#' + t.dataset.addCont + (t.dataset.addCont === 'ente' ? '-contatti' : '-contatti')).insertAdjacentHTML('beforeend', rigaContatto()); return; }
    if (t.hasAttribute('data-togli')) { const r = t.parentElement; if (r.parentElement.children.length > 1) r.remove(); else $$('input', r).forEach((i) => { i.value = ''; }); return; }
    if (t.hasAttribute('data-invia')) return invia();
  });
  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.dataset.catPrinc) {
      const k = t.dataset.catPrinc;
      $$('#' + k + '-altre label').forEach((l) => { const on = l.dataset.cat === t.value; l.hidden = on; if (on) l.querySelector('input').checked = false; });
      $('#' + k + '-perche').textContent = t.value || 'categoria principale';
    }
    if (t.dataset.dur) { const k = t.dataset.dur; $('#' + k + '-blk-cont').hidden = t.value !== 'cont'; $('#' + k + '-blk-ev').hidden = t.value !== 'ev'; }
    if (t.dataset.tl) { const k = t.dataset.tl; $('#' + k + '-blk-ind').hidden = t.value !== 'ind'; $('#' + k + '-blk-piu').hidden = t.value !== 'piu'; $('#' + k + '-blk-nomap').hidden = !['iti', 'ssf'].includes(t.value); }
    const c = t.closest('.campo.err'); if (c) c.classList.remove('err');
  });
  document.addEventListener('input', (ev) => { const c = ev.target.closest('.campo.err'); if (c) c.classList.remove('err'); });

  render();
})();
