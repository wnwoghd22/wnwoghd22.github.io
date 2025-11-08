// Robust page transitions: reliable enter/exit with bfcache handling,
// forced reflow + double RAF for consistent start, and transitionend
// listener + timeout fallback for deterministic exit completion.
(function () {
  'use strict';

  const ANIM_CLASS = 'content-anim';
  const ENTER_CLASS = 'enter';
  const EXIT_CLASS = 'exit';
  const NO_TRANSITION_ATTR = 'data-no-transition';
  const DEBUG = true; // set true temporarily to see logs in console
  const CONTENT_SELECTOR = '.wrapper'; // main content wrapper to swap

  function qsAll(sel) { return Array.from(document.querySelectorAll(sel)); }
  function qs(sel) { return document.querySelector(sel); }
  function forceReflow(node) { return node && node.offsetWidth; }

  // Expose a small global probe so you can test in the console:
  try { window.__transitions_loaded = true; } catch (e) { /* ignore */ }
  window.testTransitions = function () {
    try {
      console.log('transitions loaded:', !!window.__transitions_loaded);
      console.log('location:', location.href);
      console.log('history.state:', history.state);
      console.log('content wrapper present:', !!document.querySelector(CONTENT_SELECTOR));
      console.log('.content-anim count:', document.querySelectorAll('.content-anim').length);
      document.querySelectorAll('.content-anim').forEach((t,i)=> console.log(i, t.tagName, t.className));
    } catch (err) { console.error(err); }
  };

  function parseTimeToMs(s) {
    if (!s) return 0;
    s = s.trim();
    if (s.endsWith('ms')) return parseFloat(s);
    if (s.endsWith('s')) return parseFloat(s) * 1000;
    return parseFloat(s) || 0;
  }

  function getTransitionTimeout(el) {
    if (!el) return 300;
    const cs = getComputedStyle(el);
    const durs = cs.transitionDuration.split(',').map(parseTimeToMs);
    const delays = cs.transitionDelay.split(',').map(parseTimeToMs);
    const times = durs.map((d, i) => (d || 0) + (delays[i] || 0));
    return Math.max(...times, 150);
  }

  function waitForTransition(el, fallbackMs) {
    return new Promise(resolve => {
      if (!el) return resolve();
      const timeout = typeof fallbackMs === 'number' ? fallbackMs : getTransitionTimeout(el);
      let settled = false;
      function done() {
        if (settled) return; settled = true; el.removeEventListener('transitionend', onEnd); resolve();
      }
      function onEnd(e) { done(); }
      el.addEventListener('transitionend', onEnd, { once: true });
      setTimeout(done, timeout + 80);
    });
  }

  async function runEnter() {
    const targets = qsAll('.' + ANIM_CLASS);
    if (!targets.length) return;
  if (DEBUG) console.debug('runEnter targets count:', targets.length);
    targets.forEach(t => { t.classList.remove(EXIT_CLASS); t.classList.remove(ENTER_CLASS); forceReflow(t); });
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    targets.forEach(t => t.classList.add(ENTER_CLASS));
  if (DEBUG) console.debug('runEnter applied enter class');
  }

  async function runExit() {
    const targets = qsAll('.' + ANIM_CLASS);
    if (!targets.length) {
      if (DEBUG) console.debug('runExit: no .content-anim targets found');
      return;
    }
    targets.forEach(t => t.classList.remove(ENTER_CLASS));
    targets.forEach(t => forceReflow(t));
    targets.forEach(t => t.classList.add(EXIT_CLASS));
    const maxTimeout = Math.max(...targets.map(getTransitionTimeout));
    if (DEBUG) {
      console.groupCollapsed('runExit targets (' + targets.length + ')');
      targets.forEach((t, i) => {
        try {
          const cs = getComputedStyle(t);
          console.log(i, t.tagName, t.className, {
            transitionDuration: cs.transitionDuration,
            transitionDelay: cs.transitionDelay,
            transform: cs.transform,
            opacity: cs.opacity,
            visible: !!(t.offsetWidth || t.offsetHeight || t.getClientRects().length),
            inDOM: document.contains(t),
          });
        } catch (err) {
          console.log('error reading computed style for target', t, err);
        }
      });
      console.debug('runExit timeouts:', targets.map(getTransitionTimeout), 'max:', maxTimeout);
      console.groupEnd();
    }
    // If computed timeout is very small/zero (possible missing CSS), use a small fallback delay
    const effectiveTimeout = (maxTimeout < 20) ? Math.max(200, maxTimeout) : maxTimeout;
    if (effectiveTimeout !== maxTimeout && DEBUG) console.debug('runExit: applied fallback timeout', effectiveTimeout);
    await Promise.all(targets.map(t => waitForTransition(t, effectiveTimeout)));
  }

  function isInternalLink(a) {
    if (!a || !a.href) return false;
    try { var url = new URL(a.href, location.href); } catch (e) { return false; }
    if (url.origin !== location.origin) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute(NO_TRANSITION_ATTR)) return false;
    // same-page hash anchors should not be PJAXed
    if (url.pathname === location.pathname && url.hash && url.hash !== '') return false;
    if (a.getAttribute('download')) return false;
    return true;
  }

  // Simple in-memory cache
  const cache = new Map();

  async function fetchDocument(url) {
    if (cache.has(url)) return cache.get(url).cloneNode(true);
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Failed to fetch: ' + res.status);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    cache.set(url, doc);
    return doc.cloneNode(true);
  }

  function extractAndRemoveScripts(node) {
    const scripts = Array.from(node.querySelectorAll('script'));
    scripts.forEach(s => s.parentNode && s.parentNode.removeChild(s));
    return scripts;
  }

  function loadScriptElement(s) {
    return new Promise((resolve, reject) => {
      const ns = document.createElement('script');
      if (s.src) {
        ns.src = s.src;
        ns.async = false;
        ns.onload = () => resolve();
        ns.onerror = () => resolve();
        document.head.appendChild(ns);
      } else {
        ns.textContent = s.textContent;
        document.head.appendChild(ns);
        resolve();
      }
    });
  }

  async function loadScripts(scripts) {
    for (const s of scripts) {
      // avoid reloading common core scripts that live outside the wrapper
      await loadScriptElement(s);
    }
  }

  async function navigateTo(href, opts = {}) {
    const { push = true } = opts;
    try {
      await runExit();
    } catch (e) {
      // if exit fails, still try navigation
    }

    let doc;
    try {
      doc = await fetchDocument(href);
    } catch (e) {
      // fallback to full navigation on error
      location.href = href; return;
    }

    const newWrapper = doc.querySelector(CONTENT_SELECTOR);
    const curWrapper = qs(CONTENT_SELECTOR);
    if (!newWrapper || !curWrapper) {
      location.href = href; return;
    }

    // extract scripts from new content before insertion
    const scripts = extractAndRemoveScripts(newWrapper);

    // replace content
    curWrapper.innerHTML = newWrapper.innerHTML;

    // update title
    const newTitle = doc.querySelector('title');
    if (newTitle) document.title = newTitle.textContent;

    // push history
    if (push) history.pushState({ url: href }, '', href);

    // load scripts (sequentially)
    try {
      await loadScripts(scripts);
    } catch (e) {
      // ignore
    }

    // re-run enter animation and page init hook
    await runEnter();
    if (window.initPage && typeof window.initPage === 'function') {
      try { window.initPage(); } catch (e) { /* ignore */ }
    }

    // scroll to top
    window.scrollTo(0, 0);
  }

  function handleLinkClick(e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!a) return;
    if (!isInternalLink(a)) return;
    const href = a.href;
    e.preventDefault();
    navigateTo(href, { push: true });
  }

  window.addEventListener('popstate', (e) => {
    const url = location.href;
    navigateTo(url, { push: false });
    if (DEBUG) console.debug('popstate event', e.state, 'location', location.href);
  });

  document.addEventListener('click', handleLinkClick, { capture: true });
  document.addEventListener('DOMContentLoaded', () => runEnter());
  window.addEventListener('pageshow', (ev) => { runEnter(); });
  document.addEventListener('DOMContentLoaded', () => {
    // ensure initial history state so popstate behaves consistently
    try { history.replaceState({ url: location.href }, '', location.href); } catch (err) { /* ignore */ }
    runEnter();
  });
  window.addEventListener('pageshow', (ev) => {
    if (DEBUG) console.debug('pageshow, persisted:', ev.persisted);
    runEnter();
  });

  // reduced motion
  const media = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (media && media.matches) {
    qsAll('.' + ANIM_CLASS).forEach(el => el.classList.remove(ENTER_CLASS, EXIT_CLASS));
  }

})();
