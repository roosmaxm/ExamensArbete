/*
 * Gemensamma hjälpfunktioner för prototypen: lagring, datamodell,
 * formatering, routing och små UI-hjälpare. Vyerna i ArcadaTube
 * (a-klassisk/app.js) bygger ovanpå detta.
 */
(function () {
  'use strict';

  const D = window.ARCADA_DATA;
  const PREFIX = 'arcadatube.';

  /* ---------- Lagring (localStorage med minnes-fallback) ---------- */
  const mem = {};
  const store = {
    get(key, fallback) {
      if (key in mem) return mem[key];
      try {
        const raw = localStorage.getItem(PREFIX + key);
        if (raw !== null) return (mem[key] = JSON.parse(raw));
      } catch (e) { /* privat läge eller blockerad lagring */ }
      return fallback;
    },
    set(key, value) {
      mem[key] = value;
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* ignoreras */ }
    },
    remove(key) {
      delete mem[key];
      try { localStorage.removeItem(PREFIX + key); } catch (e) { /* ignoreras */ }
    }
  };

  /* ---------- Formatering ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const ss = String(s).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
  }
  function fmtDuration(sec) {
    const m = Math.round(sec / 60);
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
  }
  function parseTime(str) {
    const parts = String(str).trim().split(':').map(Number);
    if (!parts.length || parts.some(isNaN)) return NaN;
    return parts.reduce((acc, p) => acc * 60 + p, 0);
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('sv-FI', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { return iso; }
  }
  function fmtViews(n) { return `${n} ${n === 1 ? 'visning' : 'visningar'}`; }

  /* ---------- Datamodell ---------- */
  const sessionMedia = {}; // id -> objekt-URL för filer som valts under denna session

  function rawVideos() { return store.get('videos', null) || D.videos; }

  function hydrate(v) {
    const demo = D.sources.demo;
    const hasOwn = !!sessionMedia[v.id];
    const duration = hasOwn && v.ownDuration ? v.ownDuration : (v.media ? v.duration : demo.duration);
    const n = v.chapters.length || 1;
    const chapters = v.chapters
      .map((c, i) => ({ title: c.title, lines: c.lines || [], t: typeof c.t === 'number' ? c.t : Math.round(i * duration / n) }))
      .filter(c => c.t < duration)
      .sort((a, b) => a.t - b.t);
    if (!chapters.length || chapters[0].t > 0) chapters.unshift({ title: 'Start', lines: [], t: 0 });
    const cues = [];
    chapters.forEach((c, i) => {
      const end = i + 1 < chapters.length ? chapters[i + 1].t : duration;
      const span = end - c.t;
      c.end = end;
      c.lines.forEach((text, j) => cues.push({ t: Math.round(c.t + j * span / c.lines.length), text }));
    });
    return Object.assign({}, v, { duration, chapters, cues, src: hasOwn ? sessionMedia[v.id] : (v.media || demo.src) });
  }

  function videos(opts) {
    opts = opts || {};
    let list = rawVideos().map(hydrate);
    if (!opts.includeDrafts) list = list.filter(v => v.status === 'publicerad');
    return list;
  }
  function visibleVideos() { return videos({ includeDrafts: role() === 'teacher' }); }
  function video(id) {
    const v = rawVideos().find(x => x.id === id);
    return v ? hydrate(v) : null;
  }
  function course(id) { return D.courses.find(c => c.id === id) || { id, code: '?', name: 'Okänd kurs', color: '#666' }; }
  function courses() { return D.courses; }
  function teacher(id) { return D.teachers.find(t => t.id === id) || { name: 'Okänd lärare' }; }
  function myCourses() { return D.courses.filter(c => c.teacherId === D.currentTeacherId); }

  function sortLectures(list) {
    return list.slice().sort((a, b) => a.courseId.localeCompare(b.courseId) || a.week - b.week || a.order - b.order);
  }
  function courseVideos(courseId, includeDrafts) {
    return sortLectures(videos({ includeDrafts }).filter(v => v.courseId === courseId));
  }
  // Nästa föreläsningar: de som följer i samma kurs först, sedan andra kurser, sist tidigare i kursen
  function upNext(v) {
    const inCourse = courseVideos(v.courseId);
    const i = inCourse.findIndex(x => x.id === v.id);
    const later = i >= 0 ? inCourse.slice(i + 1) : inCourse;
    const earlier = i >= 0 ? inCourse.slice(0, i) : [];
    return later.concat(sortLectures(videos().filter(x => x.courseId !== v.courseId)), earlier);
  }

  function saveVideo(v) {
    const list = rawVideos().slice();
    const clean = Object.assign({}, v);
    ['cues', 'src'].forEach(k => delete clean[k]);
    clean.chapters = (v.chapters || []).map(c => {
      const out = { title: c.title, lines: c.lines || [] };
      if (typeof c.t === 'number') out.t = c.t;
      return out;
    });
    const i = list.findIndex(x => x.id === v.id);
    if (i >= 0) list[i] = clean; else list.push(clean);
    store.set('videos', list);
  }
  function deleteVideo(id) { store.set('videos', rawVideos().filter(v => v.id !== id)); }
  function resetData() { ['videos', 'progress', 'history', 'saved'].forEach(store.remove); }

  /* Konverterar fälten i ett formulär till ett videoobjekt. Fältnamn:
     title, courseId, week, description, status,
     chapters (text: "mm:ss Titel" per rad), file. */
  function videoFromForm(form, existing) {
    const fd = new FormData(form);
    const base = existing ? Object.assign({}, existing) : {
      id: 'v' + Date.now().toString(36), teacherId: D.currentTeacherId, views: 0,
      stats: { avgPct: 0, completions: 0 }, order: 99,
      published: new Date().toISOString().slice(0, 10)
    };
    base.title = String(fd.get('title') || '').trim() || 'Namnlös föreläsning';
    base.short = base.title.replace(/^Föreläsning \d+:\s*/, '').slice(0, 32);
    if (fd.has('courseId')) base.courseId = fd.get('courseId');
    if (fd.has('week')) base.week = Math.max(1, parseInt(fd.get('week'), 10) || 1);
    if (fd.has('description')) base.description = String(fd.get('description') || '').trim();
    if (fd.has('status')) base.status = fd.get('status');
    if (fd.has('chapters')) {
      const parsed = parseChapters(fd.get('chapters'));
      if (parsed.length) {
        const oldLines = {};
        (existing && existing.chapters || []).forEach(c => { oldLines[c.title] = c.lines; });
        base.chapters = parsed.map(c => ({ t: c.t, title: c.title, lines: oldLines[c.title] || [] }));
      } else if (!existing) {
        base.chapters = [{ title: 'Hela föreläsningen', lines: [] }];
      }
    }
    if (!base.chapters) base.chapters = [{ title: 'Hela föreläsningen', lines: [] }];
    const file = fd.get('file');
    if (file && file.size) return attachFile(base, file);
    return Promise.resolve(base);
  }
  function attachFile(v, file) {
    const url = URL.createObjectURL(file);
    sessionMedia[v.id] = url;
    return new Promise(resolve => {
      const probe = document.createElement('video');
      probe.preload = 'metadata';
      probe.onloadedmetadata = () => { v.ownDuration = Math.round(probe.duration); resolve(v); };
      probe.onerror = () => resolve(v);
      probe.src = url;
    });
  }
  function parseChapters(text) {
    return String(text || '').split('\n').map(line => {
      const m = line.trim().match(/^((?:\d+:)?\d{1,2}:\d{2})\s+(.+)$/);
      return m ? { t: parseTime(m[1]), title: m[2].trim() } : null;
    }).filter(Boolean).sort((a, b) => a.t - b.t);
  }
  function chaptersToText(v) { return v.chapters.map(c => `${fmtTime(c.t)} ${c.title}`).join('\n'); }

  /* ---------- Användarens data ---------- */
  function progressMap() { return store.get('progress', D.seedProgress); }
  function progress(id) { return progressMap()[id] || 0; }
  function setProgress(id, sec) {
    const map = Object.assign({}, progressMap());
    map[id] = Math.round(sec);
    store.set('progress', map);
    const hist = store.get('history', Object.keys(D.seedProgress)).filter(x => x !== id);
    hist.unshift(id);
    store.set('history', hist.slice(0, 30));
  }
  function pct(v) { return v.duration ? Math.min(100, Math.round(progress(v.id) / v.duration * 100)) : 0; }
  function isDone(v) { return pct(v) >= 95; }
  function inProgress() {
    const order = store.get('history', Object.keys(D.seedProgress));
    return order.map(video).filter(v => v && v.status === 'publicerad' && pct(v) > 0 && !isDone(v));
  }

  function saved() { return store.get('saved', ['v3']); }
  function isSaved(id) { return saved().includes(id); }
  function toggleSaved(id) {
    const list = saved();
    const next = list.includes(id) ? list.filter(x => x !== id) : [id].concat(list);
    store.set('saved', next);
    return next.includes(id);
  }

  function role() { return store.get('role', 'student'); }
  function setRole(r) { store.set('role', r); }

  function search(q, list) {
    q = String(q || '').trim().toLowerCase();
    list = list || visibleVideos();
    if (!q) return list;
    return list.filter(v => {
      const hay = [v.title, v.description, course(v.courseId).name, course(v.courseId).code, teacher(v.teacherId).name]
        .concat(v.chapters.map(c => c.title)).join(' ').toLowerCase();
      return q.split(/\s+/).every(w => hay.includes(w));
    });
  }

  /* ---------- UI-hjälpare ---------- */
  function thumb(v, extraClass) {
    const c = course(v.courseId);
    const p = pct(v);
    return `<div class="at-thumb ${extraClass || ''}" style="--c:${c.color}" aria-hidden="true">
      <span class="at-thumb-code">${esc(c.code)} · v${v.week}</span>
      <span class="at-thumb-title">${esc(v.short || v.title)}</span>
      <span class="at-thumb-dur">${fmtTime(v.duration)}</span>
      ${v.status !== 'publicerad' ? '<span class="at-thumb-draft">Utkast</span>' : ''}
      ${p > 0 ? `<span class="at-thumb-prog"><i style="width:${p}%"></i></span>` : ''}
    </div>`;
  }

  function parseRoute() {
    const h = location.hash.replace(/^#\/?/, '');
    const qi = h.indexOf('?');
    const path = qi >= 0 ? h.slice(0, qi) : h;
    const qs = qi >= 0 ? h.slice(qi + 1) : '';
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    const query = {};
    new URLSearchParams(qs).forEach((val, key) => { query[key] = val; });
    return { name: parts[0] || 'home', params: parts.slice(1), query };
  }
  function startRouter(render) {
    let first = true;
    const run = () => {
      render(parseRoute());
      if (!first) {
        window.scrollTo(0, 0);
        const h1 = document.querySelector('main h1');
        if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
      }
      first = false;
    };
    window.addEventListener('hashchange', run);
    run();
  }

  function toast(msg) {
    let box = document.getElementById('at-toasts');
    if (!box) {
      box = document.createElement('div');
      box.id = 'at-toasts';
      box.className = 'at-toasts';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    const el = document.createElement('div');
    el.className = 'at-toast';
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function copyLink(hash) {
    const url = location.href.split('#')[0] + hash;
    const done = () => toast('Länken kopierades');
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => toast(url));
    else toast(url);
  }

  function protoBadge(letter, name) {
    const a = document.createElement('a');
    a.className = 'at-proto-badge';
    a.href = '../../index.html';
    a.innerHTML = `<b>Prototyp ${esc(letter)}</b><span>${esc(name)} · till översikten</span>`;
    document.body.appendChild(a);
  }

  window.AT = {
    data: D, store, esc, fmtTime, fmtDuration, parseTime, fmtDate, fmtViews,
    videos, visibleVideos, video, course, courses, teacher, myCourses, courseVideos, sortLectures, upNext,
    saveVideo, deleteVideo, resetData, videoFromForm, parseChapters, chaptersToText,
    progress, setProgress, pct, isDone, inProgress, saved, isSaved, toggleSaved,
    role, setRole, search,
    thumb, parseRoute, startRouter, toast, copyLink, protoBadge
  };
})();
