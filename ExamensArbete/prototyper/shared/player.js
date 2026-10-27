/*
 * Egenutvecklad videospelare för ArcadaTube. I fas 1 delades den av
 * prototyp A, B och C, där bara utseendet (CSS-variabler) skilde sig.
 *
 * Funktioner: kapitelmarkörer på tidslinjen, textning (från transkription),
 * uppspelningshastighet, ±10 s, återuppta där man slutade, helskärm,
 * tangentbordsgenvägar och (valfritt, opts.gestures) dubbeltryck för att
 * spola på mobil. Dubbeltrycket användes i prototyp C och är avstängt i
 * ArcadaTube, men behålls som kandidat inför React-versionen.
 */
(function () {
  'use strict';
  const AT = window.AT;

  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 5h4v14h-4zm7 0h4v14h-4z"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/><text x="12" y="16.3" font-size="6.6" font-weight="700" text-anchor="middle" fill="currentColor" font-family="system-ui,sans-serif">10</text></svg>',
    fwd: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2l5 4-5 4V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z"/><text x="12" y="16.3" font-size="6.6" font-weight="700" text-anchor="middle" fill="currentColor" font-family="system-ui,sans-serif">10</text></svg>',
    vol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9.5v5h4l5 4.5v-14L7 9.5H3zm13.5 2.5A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
    mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9.5v5h4l5 4.5v-14L7 9.5H3zm13.6 2.5 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4z"/></svg>',
    cc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1z"/></svg>',
    fs: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
    fsExit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>'
  };
  const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

  function createPlayer(mount, video, opts) {
    opts = opts || {};
    const root = document.createElement('div');
    root.className = 'ap';
    root.dataset.state = 'paused';
    root.innerHTML = `
      <video class="ap-video" preload="metadata" playsinline></video>
      <div class="ap-surface" aria-hidden="true"></div>
      <div class="ap-ripple ap-ripple-left" aria-hidden="true">−10 s</div>
      <div class="ap-ripple ap-ripple-right" aria-hidden="true">+10 s</div>
      <button type="button" class="ap-big-play" aria-label="Spela upp">${ICON.play}</button>
      <div class="ap-caption" hidden></div>
      <div class="ap-error" role="alert" hidden>
        <strong>Videon kunde inte laddas.</strong>
        <span>Kontrollera att videofilen finns på servern. Resten av gränssnittet går ändå att testa.</span>
      </div>
      <div class="ap-controls">
        <div class="ap-progress" role="slider" tabindex="0" aria-label="Tidslinje" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00">
          <div class="ap-track"><div class="ap-buffer"></div><div class="ap-played"></div></div>
          <div class="ap-markers"></div>
          <div class="ap-handle"></div>
          <div class="ap-tip" hidden><span class="ap-tip-time"></span><span class="ap-tip-chapter"></span></div>
        </div>
        <div class="ap-row">
          <div class="ap-group">
            <button type="button" class="ap-btn ap-play" aria-label="Spela upp (k)">${ICON.play}</button>
            <button type="button" class="ap-btn ap-back" aria-label="Spola tillbaka 10 sekunder (j)">${ICON.back}</button>
            <button type="button" class="ap-btn ap-fwd" aria-label="Spola framåt 10 sekunder (l)">${ICON.fwd}</button>
            <div class="ap-volume-wrap">
              <button type="button" class="ap-btn ap-mute" aria-label="Stäng av ljud (m)">${ICON.vol}</button>
              <input class="ap-volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volym">
            </div>
            <span class="ap-time"><span class="ap-cur">0:00</span> / <span class="ap-dur">0:00</span></span>
          </div>
          <button type="button" class="ap-chapter-label" aria-label="Nuvarande kapitel"></button>
          <div class="ap-group">
            <button type="button" class="ap-btn ap-cc" aria-pressed="false" aria-label="Textning (c)">${ICON.cc}</button>
            <div class="ap-speed-wrap">
              <button type="button" class="ap-btn ap-speed" aria-haspopup="true" aria-expanded="false" aria-label="Uppspelningshastighet">1×</button>
              <div class="ap-menu" role="menu" aria-label="Uppspelningshastighet" hidden>
                ${SPEEDS.map(s => `<button type="button" role="menuitemradio" aria-checked="${s === 1}" data-speed="${s}">${s === 1 ? 'Normal' : s + '×'}</button>`).join('')}
              </div>
            </div>
            <button type="button" class="ap-btn ap-fs" aria-label="Helskärm (f)">${ICON.fs}</button>
          </div>
        </div>
      </div>`;
    mount.replaceChildren(root);

    const $ = s => root.querySelector(s);
    const v = $('.ap-video');
    const progressEl = $('.ap-progress');
    const listeners = { time: [], chapter: [], ended: [], play: [], pause: [] };
    // Inga callbacks efter destroy(): videohändelser kan komma asynkront efter vybyte
    const emit = (e, a) => { if (!destroyed) listeners[e].forEach(fn => fn(a)); };
    const chapters = video.chapters || [];
    const cues = video.cues || [];
    let duration = video.duration || 0;
    let chapterIdx = -1;
    let cc = AT.store.get('cc', false);
    let lastSaved = 0;
    let idleTimer = null;
    let scrubbing = false;
    let destroyed = false;

    v.src = video.src;

    /* --- Hjälpare --- */
    const chapterAt = t => {
      let i = 0;
      for (let k = 0; k < chapters.length; k++) if (chapters[k].t <= t + 0.25) i = k;
      return i;
    };
    const cueAt = t => {
      let c = null;
      for (const cue of cues) { if (cue.t <= t) c = cue; else break; }
      return c;
    };
    const seek = t => {
      t = Math.max(0, Math.min(duration || t, t));
      v.currentTime = t;
      sync();
    };
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    const toggle = () => (v.paused ? play() : v.pause());
    const setSpeed = s => {
      v.playbackRate = s;
      $('.ap-speed').textContent = s + '×';
      root.querySelectorAll('[data-speed]').forEach(b => b.setAttribute('aria-checked', String(Number(b.dataset.speed) === s)));
      AT.store.set('speed', s);
    };
    const stepSpeed = dir => {
      const i = SPEEDS.indexOf(v.playbackRate);
      const next = SPEEDS[Math.max(0, Math.min(SPEEDS.length - 1, (i < 0 ? 1 : i) + dir))];
      setSpeed(next);
      AT.toast(`Hastighet ${next}×`);
    };
    const setCaptions = on => {
      cc = on;
      AT.store.set('cc', on);
      $('.ap-cc').setAttribute('aria-pressed', String(on));
      root.classList.toggle('ap-cc-on', on);
      syncCaption();
    };
    const syncCaption = () => {
      const el = $('.ap-caption');
      const cue = cc ? cueAt(v.currentTime) : null;
      el.hidden = !cue;
      if (cue && el.textContent !== cue.text) el.textContent = cue.text;
    };
    const isFs = () => document.fullscreenElement === root || document.webkitFullscreenElement === root;
    const toggleFs = () => {
      if (isFs()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
      else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen();
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    };
    const pctOf = t => (duration ? (t / duration) * 100 : 0);
    const tFromEvent = e => {
      const r = progressEl.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
    };

    function renderMarkers() {
      $('.ap-markers').innerHTML = chapters
        .filter(c => c.t > 0 && c.t < duration)
        .map(c => `<span class="ap-marker" style="left:${pctOf(c.t)}%"></span>`).join('');
    }

    function sync() {
      const t = v.currentTime || 0;
      const p = pctOf(t);
      $('.ap-played').style.width = p + '%';
      $('.ap-handle').style.left = p + '%';
      $('.ap-cur').textContent = AT.fmtTime(t);
      progressEl.setAttribute('aria-valuenow', String(Math.floor(t)));
      const i = chapterAt(t);
      progressEl.setAttribute('aria-valuetext', `${AT.fmtTime(t)} av ${AT.fmtTime(duration)}${chapters[i] ? ', kapitel: ' + chapters[i].title : ''}`);
      if (i !== chapterIdx) {
        chapterIdx = i;
        $('.ap-chapter-label').textContent = chapters[i] ? chapters[i].title : '';
        emit('chapter', i);
      }
      syncCaption();
      emit('time', t);
    }

    function saveProgress(force) {
      const now = Date.now();
      if (!force && now - lastSaved < 4000) return;
      lastSaved = now;
      if (v.currentTime > 1) AT.setProgress(video.id, v.currentTime);
    }

    function wake() {
      root.classList.remove('ap-idle');
      clearTimeout(idleTimer);
      if (!v.paused) idleTimer = setTimeout(() => root.classList.add('ap-idle'), 2600);
    }

    function ripple(side) {
      const el = $(side < 0 ? '.ap-ripple-left' : '.ap-ripple-right');
      el.classList.remove('ap-show');
      void el.offsetWidth;
      el.classList.add('ap-show');
    }

    /* --- Videohändelser --- */
    v.addEventListener('loadedmetadata', () => {
      if (isFinite(v.duration) && v.duration > 0) duration = v.duration;
      $('.ap-dur').textContent = AT.fmtTime(duration);
      progressEl.setAttribute('aria-valuemax', String(Math.floor(duration)));
      renderMarkers();
      let start = typeof opts.startAt === 'number' ? opts.startAt : null;
      if (start === null) {
        const saved = AT.progress(video.id);
        if (saved > 5 && saved < duration - 10) {
          start = saved;
          AT.toast(`Fortsätter där du slutade (${AT.fmtTime(saved)})`);
        }
      }
      if (start) v.currentTime = start;
      sync();
    });
    v.addEventListener('timeupdate', () => { if (!scrubbing) sync(); saveProgress(false); });
    v.addEventListener('progress', () => {
      if (v.buffered.length && duration) $('.ap-buffer').style.width = pctOf(v.buffered.end(v.buffered.length - 1)) + '%';
    });
    v.addEventListener('play', () => {
      root.dataset.state = 'playing';
      $('.ap-play').innerHTML = ICON.pause;
      $('.ap-play').setAttribute('aria-label', 'Pausa (k)');
      wake();
      emit('play');
    });
    v.addEventListener('pause', () => {
      root.dataset.state = 'paused';
      $('.ap-play').innerHTML = ICON.play;
      $('.ap-play').setAttribute('aria-label', 'Spela upp (k)');
      wake();
      saveProgress(true);
      emit('pause');
    });
    v.addEventListener('ended', () => { AT.setProgress(video.id, duration); emit('ended'); });
    v.addEventListener('volumechange', () => {
      const muted = v.muted || v.volume === 0;
      $('.ap-mute').innerHTML = muted ? ICON.mute : ICON.vol;
      $('.ap-mute').setAttribute('aria-label', muted ? 'Slå på ljud (m)' : 'Stäng av ljud (m)');
      $('.ap-volume').value = v.muted ? 0 : v.volume;
    });
    v.addEventListener('error', () => { $('.ap-error').hidden = false; root.classList.add('ap-has-error'); });

    /* --- Kontroller --- */
    $('.ap-play').addEventListener('click', toggle);
    $('.ap-big-play').addEventListener('click', play);
    $('.ap-back').addEventListener('click', () => seek(v.currentTime - 10));
    $('.ap-fwd').addEventListener('click', () => seek(v.currentTime + 10));
    $('.ap-mute').addEventListener('click', () => { v.muted = !v.muted; if (!v.muted && v.volume === 0) v.volume = 1; });
    $('.ap-volume').addEventListener('input', e => { v.volume = Number(e.target.value); v.muted = v.volume === 0; });
    $('.ap-cc').addEventListener('click', () => setCaptions(!cc));
    $('.ap-fs').addEventListener('click', toggleFs);
    $('.ap-chapter-label').addEventListener('click', () => emit('chapter', chapterIdx));

    const onFsChange = () => {
      const fs = isFs();
      root.classList.toggle('ap-fullscreen', fs);
      $('.ap-fs').innerHTML = fs ? ICON.fsExit : ICON.fs;
      $('.ap-fs').setAttribute('aria-label', fs ? 'Avsluta helskärm (f)' : 'Helskärm (f)');
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);

    // Hastighetsmeny
    const speedBtn = $('.ap-speed'), menu = $('.ap-menu');
    const closeMenu = () => { menu.hidden = true; speedBtn.setAttribute('aria-expanded', 'false'); };
    speedBtn.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      speedBtn.setAttribute('aria-expanded', String(open));
      if (open) menu.querySelector('[aria-checked="true"]').focus();
    });
    menu.addEventListener('click', e => {
      const b = e.target.closest('[data-speed]');
      if (!b) return;
      setSpeed(Number(b.dataset.speed));
      closeMenu();
      speedBtn.focus();
    });
    menu.addEventListener('keydown', e => {
      const items = Array.from(menu.querySelectorAll('[role="menuitemradio"]'));
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { items[(i + 1) % items.length].focus(); e.preventDefault(); }
      if (e.key === 'ArrowUp') { items[(i - 1 + items.length) % items.length].focus(); e.preventDefault(); }
      if (e.key === 'Escape') { closeMenu(); speedBtn.focus(); e.stopPropagation(); }
    });
    const onDocClick = e => { if (!e.target.closest('.ap-speed-wrap')) closeMenu(); };
    document.addEventListener('click', onDocClick);

    // Tidslinje: dra, klicka, hovra och tangentbord
    progressEl.addEventListener('pointerdown', e => {
      scrubbing = true;
      progressEl.setPointerCapture(e.pointerId);
      seek(tFromEvent(e));
    });
    progressEl.addEventListener('pointermove', e => {
      const t = tFromEvent(e);
      const tip = $('.ap-tip');
      tip.hidden = false;
      tip.style.left = pctOf(t) + '%';
      $('.ap-tip-time').textContent = AT.fmtTime(t);
      $('.ap-tip-chapter').textContent = chapters[chapterAt(t)] ? chapters[chapterAt(t)].title : '';
      if (scrubbing) seek(t);
    });
    progressEl.addEventListener('pointerleave', () => { $('.ap-tip').hidden = true; });
    const endScrub = () => { scrubbing = false; };
    progressEl.addEventListener('pointerup', endScrub);
    progressEl.addEventListener('pointercancel', endScrub);
    progressEl.addEventListener('keydown', e => {
      const map = { ArrowLeft: -5, ArrowRight: 5, PageDown: -60, PageUp: 60 };
      if (e.key in map) { seek(v.currentTime + map[e.key]); e.preventDefault(); e.stopPropagation(); }
      if (e.key === 'Home') { seek(0); e.preventDefault(); }
      if (e.key === 'End') { seek(duration - 1); e.preventDefault(); }
    });

    // Klick/tryck på videoytan
    let tapTimer = null, lastTap = 0;
    $('.ap-surface').addEventListener('click', e => {
      wake();
      if (!opts.gestures) { toggle(); return; }
      const r = root.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const now = Date.now();
      if (now - lastTap < 300 && (x < 0.35 || x > 0.65)) {
        clearTimeout(tapTimer);
        const dir = x < 0.35 ? -1 : 1;
        seek(v.currentTime + dir * 10);
        ripple(dir);
        lastTap = 0;
        return;
      }
      lastTap = now;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(toggle, 260);
    });
    if (!opts.gestures) $('.ap-surface').addEventListener('dblclick', toggleFs);

    root.addEventListener('pointermove', wake);
    root.addEventListener('focusin', wake);

    // Globala tangentbordsgenvägar
    function onKey(e) {
      if (destroyed || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
      const t = e.target;
      if (t.closest && t.closest('input, textarea, select, [contenteditable="true"], dialog')) return;
      const inPlayer = root.contains(t);
      const free = inPlayer || t === document.body || t === document.documentElement;
      const onControl = t.closest && t.closest('button, a, [role="slider"]');
      let handled = true;
      switch (e.key) {
        case ' ':
          if (!free || onControl) { handled = false; break; }
          toggle(); break;
        case 'k': case 'K': toggle(); break;
        case 'j': case 'J': seek(v.currentTime - 10); ripple(-1); break;
        case 'l': case 'L': seek(v.currentTime + 10); ripple(1); break;
        case 'ArrowLeft': if (!free) { handled = false; break; } seek(v.currentTime - 5); break;
        case 'ArrowRight': if (!free) { handled = false; break; } seek(v.currentTime + 5); break;
        case 'ArrowUp': if (!inPlayer) { handled = false; break; } v.volume = Math.min(1, v.volume + 0.1); v.muted = false; break;
        case 'ArrowDown': if (!inPlayer) { handled = false; break; } v.volume = Math.max(0, v.volume - 0.1); break;
        case 'm': case 'M': v.muted = !v.muted; break;
        case 'f': case 'F': toggleFs(); break;
        case 'c': case 'C': setCaptions(!cc); AT.toast(cc ? 'Textning på' : 'Textning av'); break;
        case '>': stepSpeed(1); break;
        case '<': stepSpeed(-1); break;
        default:
          if (/^[0-9]$/.test(e.key)) seek(duration * Number(e.key) / 10);
          else handled = false;
      }
      if (handled) { e.preventDefault(); wake(); }
    }
    document.addEventListener('keydown', onKey);

    // Starttillstånd
    setSpeed(AT.store.get('speed', 1));
    setCaptions(cc);
    $('.ap-dur').textContent = AT.fmtTime(duration);
    renderMarkers();
    sync();

    const api = {
      el: root,
      video: v,
      chapters,
      cues,
      get currentTime() { return v.currentTime || 0; },
      get duration() { return duration; },
      seek(t, autoplay) { seek(t); if (autoplay) play(); },
      play, pause: () => v.pause(), toggle,
      setCaptions, get captions() { return cc; },
      setSpeed, get speed() { return v.playbackRate; },
      chapterAt,
      on(evt, fn) { listeners[evt].push(fn); return api; },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        saveProgress(true);
        clearTimeout(idleTimer); clearTimeout(tapTimer);
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('fullscreenchange', onFsChange);
        document.removeEventListener('webkitfullscreenchange', onFsChange);
        v.pause();
        v.removeAttribute('src');
        v.load();
      }
    };
    return api;
  }

  AT.createPlayer = createPlayer;
  AT.SHORTCUTS = [
    ['k / mellanslag', 'Spela / pausa'],
    ['j / l', '−10 s / +10 s'],
    ['← / →', '−5 s / +5 s'],
    ['0–9', 'Hoppa till 0–90 %'],
    ['c', 'Textning av/på'],
    ['< / >', 'Långsammare / snabbare'],
    ['m', 'Ljud av/på'],
    ['f', 'Helskärm']
  ];
})();
