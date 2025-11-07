// Robust page transitions: reliable enter/exit with bfcache handling,
// forced reflow + double RAF for consistent start, and transitionend
// listener + timeout fallback for deterministic exit completion.
(function () {
  'use strict';

  const ANIM_CLASS = 'content-anim';
  const ENTER_CLASS = 'enter';
  const EXIT_CLASS = 'exit';
  const NO_TRANSITION_ATTR = 'data-no-transition';

  function qsAll(sel) { return Array.from(document.querySelectorAll(sel)); }

  function forceReflow(node) {
    return node && node.offsetWidth;
  }

  function getTransitionTimeout(node) {
    if (!node) return 300;
    const cs = getComputedStyle(node);
    const durs = cs.transitionDuration.split(',').map(s => parseFloat(s || 0));
    const delays = cs.transitionDelay.split(',').map(s => parseFloat(s || 0));
    const times = durs.map((v, i) => ((v || 0) + (delays[i] || 0)) * 1000);
    return Math.max(...times, 150);
  }

  function runEnter() {
    const targets = qsAll('.' + ANIM_CLASS);
    if (!targets.length) return;
    targets.forEach(t => {
      t.classList.remove(EXIT_CLASS);
      t.classList.remove(ENTER_CLASS);
      forceReflow(t);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      targets.forEach(t => t.classList.add(ENTER_CLASS));
    }));
  }

  function runExit(navigate) {
    const targets = qsAll('.' + ANIM_CLASS);
    if (!targets.length) {
      if (navigate) navigate();
      return;
    }

    targets.forEach(t => t.classList.remove(ENTER_CLASS));
    targets.forEach(t => forceReflow(t));
    targets.forEach(t => t.classList.add(EXIT_CLASS));

    // wait for the longest transition among targets
    const timeout = Math.max(...targets.map(getTransitionTimeout));
    let called = false;

    function done() {
      if (called) return;
      called = true;
      targets.forEach(t => t.removeEventListener('transitionend', onEnd));
      if (navigate) navigate();
    }

    function onEnd(e) {
      // call done once (we also have fallback)
      done();
    }

    targets.forEach(t => t.addEventListener('transitionend', onEnd));
    setTimeout(done, timeout + 80);
  }

  function isInternalLink(a) {
    if (!a || !a.href) return false;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute(NO_TRANSITION_ATTR)) return false;
    if (url.pathname === location.pathname && url.hash) return false;
    return true;
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
    runExit(() => { location.href = href; });
  }

  document.addEventListener('click', handleLinkClick, { capture: true });

  document.addEventListener('DOMContentLoaded', () => runEnter());
  window.addEventListener('pageshow', (ev) => {
    // handle BFCache restore
    runEnter();
  });

  // reduced motion
  const media = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (media && media.matches) {
    qsAll('.' + ANIM_CLASS).forEach(el => el.classList.remove(ENTER_CLASS, EXIT_CLASS));
  }

})();
