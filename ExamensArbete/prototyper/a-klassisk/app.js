/*
 * Prototyp A – "Klassisk"
 * Designidé: följer den välkända videoplattformsmodellen (sökfält i toppen,
 * sidomeny, rutnät med videokort, "Nästa"-lista bredvid spelaren).
 * Hypotes: igenkänning (Jakobs lag) ger låg inlärningströskel.
 */
(function () {
  'use strict';
  const AT = window.AT;
  const esc = AT.esc;
  const main = document.getElementById('main');
  const sidebar = document.getElementById('sidebar');
  const dialog = document.getElementById('video-dialog');
  let player = null;

  AT.protoBadge('A', 'Klassisk');

  const ICON = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3 10.5V21h6v-6h6v6h6V10.5z"/></svg>',
    history: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3a9 9 0 0 0-9 9H1l4 4 4-4H6a7 7 0 1 1 2.05 4.95l-1.42 1.42A9 9 0 1 0 13 3zm-1 5v5l4.25 2.52.77-1.28L13.5 12.2V8z"/></svg>',
    saved: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"/></svg>',
    studio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 6h-7.6l3.3-3.3-.7-.7L12 6 8 2l-.7.7L10.6 6H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 14H3V8h18v12zM9 10v8l7-4z"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16a3 3 0 0 0-2.4 1.2l-7-3.5a3 3 0 0 0 0-1.4l7-3.5A3 3 0 1 0 15 7l-7 3.5a3 3 0 1 0 0 3l7 3.5A3 3 0 1 0 18 16z"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"/></svg>',
    upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20h14v-2H5zm7-16-5 5h3v6h4V9h3z"/></svg>'
  };

  /* ---------- Roll ---------- */
  function syncRole() {
    document.querySelectorAll('.role-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.role === AT.role())));
  }
  document.querySelector('.role-switch').addEventListener('click', e => {
    const b = e.target.closest('[data-role]');
    if (!b) return;
    AT.setRole(b.dataset.role);
    syncRole();
    AT.toast(b.dataset.role === 'teacher' ? 'Du ser nu sidan som lärare' : 'Du ser nu sidan som student');
    render(AT.parseRoute());
  });

  /* ---------- Sidomeny (utfällbar på mobil) ---------- */
  const menuBtn = document.querySelector('.menu-btn');
  const scrim = document.querySelector('.scrim');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    scrim.hidden = !open;
  }
  menuBtn.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 1023px)').matches) setMenu(!document.body.classList.contains('menu-open'));
    else document.body.classList.toggle('menu-collapsed');
  });
  scrim.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });

  function renderSidebar(route) {
    const r = route.name;
    const item = (href, icon, label, active) =>
      `<a href="${href}" class="nav-item"${active ? ' aria-current="page"' : ''}>${icon}<span>${label}</span></a>`;
    sidebar.innerHTML = `
      ${item('#/', ICON.home, 'Hem', r === 'home' && !route.query.kurs)}
      ${item('#/historik', ICON.history, 'Fortsätt titta', r === 'historik')}
      ${item('#/sparade', ICON.saved, 'Sparade', r === 'sparade')}
      <hr>
      <h2 class="nav-heading">Mina kurser</h2>
      ${AT.courses().map(c => `<a href="#/?kurs=${c.id}" class="nav-item nav-course"${route.query.kurs === c.id ? ' aria-current="page"' : ''}>
        <span class="dot" style="background:${c.color}" aria-hidden="true"></span><span>${esc(c.name)}</span></a>`).join('')}
      ${AT.role() === 'teacher' ? `<hr><h2 class="nav-heading">Lärare</h2>${item('#/studio', ICON.studio, 'Studio', r === 'studio')}` : ''}
    `;
  }
  sidebar.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  /* ---------- Sök ---------- */
  const searchForm = document.querySelector('.search');
  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const q = searchForm.q.value.trim();
    location.hash = q ? `#/sok?q=${encodeURIComponent(q)}` : '#/';
  });

  /* ---------- Komponenter ---------- */
  function card(v) {
    const c = AT.course(v.courseId);
    return `<article class="card">
      <a href="#/watch/${v.id}" class="card-link">
        ${AT.thumb(v)}
        <div class="card-body">
          <span class="avatar" style="background:${c.color}" aria-hidden="true">${esc(AT.teacher(v.teacherId).name[0])}</span>
          <div>
            <h3 class="card-title">${esc(v.title)}</h3>
            <p class="card-meta">${esc(c.name)}<br>${esc(AT.teacher(v.teacherId).name)} · ${AT.fmtViews(v.views)} · ${AT.fmtDate(v.published)}</p>
          </div>
        </div>
      </a>
    </article>`;
  }
  function rowCard(v, extra) {
    const c = AT.course(v.courseId);
    return `<a href="#/watch/${v.id}" class="row-card">
      ${AT.thumb(v)}
      <div>
        <h3 class="card-title">${esc(v.title)}</h3>
        <p class="card-meta">${esc(c.name)} · ${esc(AT.teacher(v.teacherId).name)}</p>
        ${extra || ''}
      </div>
    </a>`;
  }

  /* ---------- Vyer ---------- */
  function viewHome(route) {
    const active = route.query.kurs || '';
    const list = AT.sortLectures(AT.visibleVideos()).filter(v => !active || v.courseId === active);
    const cont = active ? [] : AT.inProgress();
    const course = active ? AT.course(active) : null;
    main.innerHTML = `
      <h1 class="${course ? '' : 'sr-only'}">${course ? esc(course.name) : 'Startsida'}</h1>
      ${course ? `<p class="lead">${esc(course.code)} · ${esc(course.description)}</p>` : ''}
      <div class="chips" role="list" aria-label="Filtrera på kurs">
        <a role="listitem" class="chip" href="#/"${!active ? ' aria-current="true"' : ''}>Alla</a>
        ${AT.courses().map(c => `<a role="listitem" class="chip" href="#/?kurs=${c.id}"${active === c.id ? ' aria-current="true"' : ''}>${esc(c.name)}</a>`).join('')}
      </div>
      ${cont.length ? `<section aria-labelledby="cont-h">
        <h2 id="cont-h" class="section-title">Fortsätt titta</h2>
        <div class="grid">${cont.slice(0, 4).map(card).join('')}</div>
      </section>` : ''}
      <section aria-labelledby="all-h">
        <h2 id="all-h" class="section-title">${course ? 'Alla föreläsningar i kursen' : 'Senaste föreläsningarna'}</h2>
        ${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : '<p class="empty">Inga föreläsningar ännu.</p>'}
      </section>`;
  }

  function viewSearch(route) {
    const q = route.query.q || '';
    searchForm.q.value = q;
    const res = AT.search(q);
    main.innerHTML = `
      <h1 class="page-title">Sökresultat för ”${esc(q)}”</h1>
      <p class="lead">${res.length} ${res.length === 1 ? 'träff' : 'träffar'}</p>
      <div class="list">${res.map(v => rowCard(v, `<p class="card-desc">${esc(v.description)}</p>`)).join('') || '<p class="empty">Inga föreläsningar matchade sökningen. Prova ett annat ord.</p>'}</div>`;
  }

  function viewList(title, list, emptyText) {
    main.innerHTML = `<h1 class="page-title">${title}</h1>
      <div class="list">${list.map(v => rowCard(v, `<p class="card-meta">${AT.pct(v)} % sett · ${AT.fmtTime(v.duration)}</p>`)).join('') || `<p class="empty">${emptyText}</p>`}</div>`;
  }

  function viewWatch(route) {
    const v = AT.video(route.params[0]);
    if (!v || (v.status !== 'publicerad' && AT.role() !== 'teacher')) return viewNotFound();
    const c = AT.course(v.courseId);
    const upNext = AT.upNext(v).slice(0, 8);
    const saved = AT.isSaved(v.id);
    main.innerHTML = `
      <div class="watch">
        <div class="watch-main">
          <p class="demo-note">Demovideo – bilden är en platshållare, gränssnittet är det som testas.</p>
          <div id="player"></div>
          <h1 class="watch-title">${esc(v.title)}</h1>
          <div class="watch-bar">
            <div class="channel">
              <span class="avatar" style="background:${c.color}" aria-hidden="true">${esc(AT.teacher(v.teacherId).name[0])}</span>
              <div><a href="#/?kurs=${c.id}" class="channel-name">${esc(c.name)}</a><span class="card-meta">${esc(AT.teacher(v.teacherId).name)}</span></div>
            </div>
            <div class="actions">
              <button type="button" class="pill" id="save-btn" aria-pressed="${saved}">${ICON.saved}<span>${saved ? 'Sparad' : 'Spara'}</span></button>
              <button type="button" class="pill" id="share-btn">${ICON.share}<span>Dela</span></button>
              ${AT.role() === 'teacher' ? `<button type="button" class="pill" id="edit-btn">${ICON.edit}<span>Redigera</span></button>` : ''}
            </div>
          </div>
          <div class="desc-box">
            <p class="card-meta"><b>${AT.fmtViews(v.views)} · ${AT.fmtDate(v.published)} · Vecka ${v.week}</b>${v.status !== 'publicerad' ? ' · <span class="badge-draft">Utkast</span>' : ''}</p>
            <p>${esc(v.description)}</p>
            <h2 class="sub-title">Kapitel</h2>
            <ol class="chapters">${v.chapters.map((ch, i) => `<li><button type="button" data-t="${ch.t}" data-i="${i}"><span class="ch-time">${AT.fmtTime(ch.t)}</span><span>${esc(ch.title)}</span></button></li>`).join('')}</ol>
            <details class="shortcuts"><summary>Kortkommandon</summary>
              <dl>${AT.SHORTCUTS.map(([k, d]) => `<div><dt><kbd>${esc(k)}</kbd></dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
            </details>
          </div>
        </div>
        <aside class="watch-side" aria-labelledby="next-h">
          <h2 id="next-h" class="section-title">Nästa</h2>
          <label class="autoplay"><input type="checkbox" id="autoplay" ${AT.store.get('autoplay', true) ? 'checked' : ''}> Spela nästa automatiskt</label>
          <div class="side-list">${upNext.map(x => rowCard(x)).join('')}</div>
        </aside>
      </div>`;

    player = AT.createPlayer(document.getElementById('player'), v, { startAt: route.query.t ? Number(route.query.t) : undefined });
    const chapterBtns = main.querySelectorAll('.chapters button');
    player.on('chapter', i => chapterBtns.forEach((b, k) => b.toggleAttribute('aria-current', k === i)));
    player.on('ended', () => {
      if (AT.store.get('autoplay', true) && upNext[0]) {
        AT.toast(`Nästa: ${upNext[0].title}`);
        setTimeout(() => { location.hash = `#/watch/${upNext[0].id}`; }, 1500);
      }
    });
    main.querySelector('.chapters').addEventListener('click', e => {
      const b = e.target.closest('[data-t]');
      if (b) { player.seek(Number(b.dataset.t), true); document.getElementById('player').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    });
    document.getElementById('autoplay').addEventListener('change', e => AT.store.set('autoplay', e.target.checked));
    document.getElementById('save-btn').addEventListener('click', e => {
      const on = AT.toggleSaved(v.id);
      e.currentTarget.setAttribute('aria-pressed', String(on));
      e.currentTarget.querySelector('span').textContent = on ? 'Sparad' : 'Spara';
      AT.toast(on ? 'Sparad i ”Sparade”' : 'Borttagen från ”Sparade”');
    });
    document.getElementById('share-btn').addEventListener('click', () => AT.copyLink(`#/watch/${v.id}?t=${Math.floor(player.currentTime)}`));
    const editBtn = document.getElementById('edit-btn');
    if (editBtn) editBtn.addEventListener('click', () => openDialog(v));
  }

  /* ---------- Studio (lärarvy) ---------- */
  function viewStudio() {
    if (AT.role() !== 'teacher') {
      main.innerHTML = `<div class="notice"><h1 class="page-title">Studio är endast för lärare</h1>
        <p>Byt roll till ”Lärare” uppe till höger för att hantera föreläsningar.</p></div>`;
      return;
    }
    const mine = AT.sortLectures(AT.videos({ includeDrafts: true }).filter(v => AT.course(v.courseId).teacherId === AT.data.currentTeacherId));
    const published = mine.filter(v => v.status === 'publicerad');
    const totalViews = mine.reduce((s, v) => s + v.views, 0);
    const avg = published.length ? Math.round(published.reduce((s, v) => s + v.stats.avgPct, 0) / published.length) : 0;
    main.innerHTML = `
      <div class="studio-head">
        <h1 class="page-title">Studio</h1>
        <button type="button" class="btn-primary" id="upload-btn">${ICON.upload}<span>Ladda upp föreläsning</span></button>
      </div>
      <div class="stats">
        <div class="stat"><span>Föreläsningar</span><b>${mine.length}</b><small>${mine.length - published.length} utkast</small></div>
        <div class="stat"><span>Visningar totalt</span><b>${totalViews}</b><small>senaste 30 dagarna</small></div>
        <div class="stat"><span>Genomsnittligt sett</span><b>${avg} %</b><small>av videolängden</small></div>
      </div>
      <div class="table-wrap">
        <table class="table">
          <caption class="sr-only">Dina föreläsningar</caption>
          <thead><tr><th scope="col">Föreläsning</th><th scope="col">Status</th><th scope="col">Datum</th><th scope="col" class="num">Visningar</th><th scope="col" class="num">Sett i snitt</th><th scope="col"><span class="sr-only">Åtgärder</span></th></tr></thead>
          <tbody>${mine.map(v => `<tr>
            <td><div class="t-video">${AT.thumb(v, 'mini')}<div><a href="#/watch/${v.id}" class="t-title">${esc(v.title)}</a><span class="card-meta">${esc(AT.course(v.courseId).name)} · Vecka ${v.week} · ${AT.fmtTime(v.duration)}</span></div></div></td>
            <td><span class="status ${v.status === 'publicerad' ? 'is-pub' : 'is-draft'}">${v.status === 'publicerad' ? 'Publicerad' : 'Utkast'}</span></td>
            <td>${AT.fmtDate(v.published)}</td>
            <td class="num">${v.views}</td>
            <td class="num">${v.stats.avgPct} %</td>
            <td class="t-actions">
              <button type="button" class="icon-btn" data-edit="${v.id}" aria-label="Redigera ${esc(v.title)}">${ICON.edit}</button>
              <button type="button" class="icon-btn danger" data-del="${v.id}" aria-label="Ta bort ${esc(v.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg></button>
            </td></tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="reset"><button type="button" class="link-btn" id="reset-btn">Återställ demodata</button></p>`;

    document.getElementById('upload-btn').addEventListener('click', () => openDialog(null));
    document.getElementById('reset-btn').addEventListener('click', () => {
      if (confirm('Återställa all demodata (föreläsningar, tittarhistorik och sparade)?')) { AT.resetData(); render(AT.parseRoute()); AT.toast('Demodata återställd'); }
    });
    main.querySelector('tbody').addEventListener('click', e => {
      const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
      if (ed) openDialog(AT.video(ed.dataset.edit));
      if (del) {
        const v = AT.video(del.dataset.del);
        if (confirm(`Ta bort ”${v.title}”? Det går inte att ångra.`)) { AT.deleteVideo(v.id); render(AT.parseRoute()); AT.toast('Föreläsningen togs bort'); }
      }
    });
  }

  function openDialog(v) {
    const isNew = !v;
    const courses = AT.myCourses();
    dialog.innerHTML = `
      <form method="dialog" class="dialog-form" novalidate>
        <header class="dialog-head">
          <h2 id="dialog-title">${isNew ? 'Ladda upp föreläsning' : 'Redigera föreläsning'}</h2>
          <button type="button" class="icon-btn" value="cancel" data-close aria-label="Stäng"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg></button>
        </header>
        <div class="dialog-body">
          ${isNew ? `<label class="drop" for="file">
            ${ICON.upload}<b>Dra och släpp en videofil här</b><span>eller klicka för att välja (MP4, WebM). Utan fil används en demovideo.</span>
            <input id="file" name="file" type="file" accept="video/*" class="sr-only">
            <span class="file-name" aria-live="polite"></span>
          </label>` : ''}
          <div class="field"><label for="f-title">Titel <span aria-hidden="true">*</span></label>
            <input id="f-title" name="title" required value="${esc(v ? v.title : '')}" aria-describedby="f-title-err">
            <span class="field-err" id="f-title-err" hidden>Ange en titel.</span></div>
          <div class="field-row">
            <div class="field"><label for="f-course">Kurs</label>
              <select id="f-course" name="courseId">${courses.map(c => `<option value="${c.id}"${v && v.courseId === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
            <div class="field small"><label for="f-week">Vecka</label>
              <input id="f-week" name="week" type="number" min="1" max="20" value="${v ? v.week : 1}"></div>
          </div>
          <div class="field"><label for="f-desc">Beskrivning</label>
            <textarea id="f-desc" name="description" rows="3">${esc(v ? v.description : '')}</textarea></div>
          <div class="field"><label for="f-ch">Kapitel</label>
            <textarea id="f-ch" name="chapters" rows="4" aria-describedby="f-ch-help" placeholder="0:00 Introduktion&#10;5:30 Första delen">${esc(v ? AT.chaptersToText(v) : '')}</textarea>
            <span class="field-help" id="f-ch-help">En rad per kapitel: tid (mm:ss) och titel. Kapitlen visas som markörer i tidslinjen.</span></div>
          <fieldset class="field"><legend>Synlighet</legend>
            <label class="radio"><input type="radio" name="status" value="publicerad" ${!v || v.status === 'publicerad' ? 'checked' : ''}> Publicerad – synlig för studenter</label>
            <label class="radio"><input type="radio" name="status" value="utkast" ${v && v.status === 'utkast' ? 'checked' : ''}> Utkast – endast synlig för dig</label>
          </fieldset>
        </div>
        <footer class="dialog-foot">
          <button type="button" class="btn-ghost" data-close>Avbryt</button>
          <button type="submit" class="btn-primary">${isNew ? 'Ladda upp' : 'Spara ändringar'}</button>
        </footer>
      </form>`;
    const form = dialog.querySelector('form');
    const titleInput = form.querySelector('#f-title'); // obs: form.title är formulärets title-attribut
    dialog.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dialog.close()));
    const fileInput = form.querySelector('#file');
    if (fileInput) {
      const drop = form.querySelector('.drop');
      const show = () => { form.querySelector('.file-name').textContent = fileInput.files[0] ? `Vald fil: ${fileInput.files[0].name}` : ''; };
      fileInput.addEventListener('change', () => {
        show();
        if (fileInput.files[0] && !titleInput.value) titleInput.value = fileInput.files[0].name.replace(/\.[^.]+$/, '');
      });
      ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
      ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, () => drop.classList.remove('over')));
      drop.addEventListener('drop', e => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) { fileInput.files = e.dataTransfer.files; fileInput.dispatchEvent(new Event('change')); }
      });
    }
    form.addEventListener('submit', e => {
      e.preventDefault();
      const err = form.querySelector('#f-title-err');
      if (!titleInput.value.trim()) {
        err.hidden = false; titleInput.setAttribute('aria-invalid', 'true'); titleInput.focus(); return;
      }
      AT.videoFromForm(form, v).then(saved => {
        AT.saveVideo(saved);
        dialog.close();
        AT.toast(isNew ? 'Föreläsningen laddades upp' : 'Ändringarna sparades');
        render(AT.parseRoute());
      });
    });
    dialog.showModal();
    titleInput.focus();
  }

  function viewNotFound() {
    main.innerHTML = `<div class="notice"><h1 class="page-title">Föreläsningen hittades inte</h1>
      <p>Den kan ha tagits bort eller ännu inte publicerats.</p><p><a href="#/">Till startsidan</a></p></div>`;
  }

  /* ---------- Router ---------- */
  function render(route) {
    if (player) { player.destroy(); player = null; }
    syncRole();
    renderSidebar(route);
    document.body.classList.toggle('is-watch', route.name === 'watch');
    if (route.name !== 'sok') searchForm.q.value = '';
    switch (route.name) {
      case 'home': return viewHome(route);
      case 'sok': return viewSearch(route);
      case 'watch': return viewWatch(route);
      case 'historik': return viewList('Fortsätt titta', AT.inProgress(), 'Du har inga påbörjade föreläsningar.');
      case 'sparade': return viewList('Sparade', AT.saved().map(AT.video).filter(v => v && v.status === 'publicerad'), 'Du har inte sparat några föreläsningar ännu.');
      case 'studio': return viewStudio();
      default: return viewNotFound();
    }
  }
  AT.startRouter(render);
})();
