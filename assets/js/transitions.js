// Simple page transitions: slide in on load, slide out on click for internal links
(function () {
  const selector = '.post-link, .side_link, .pagination a, a.page-link';

  function onEnter() {
    const targets = document.querySelectorAll('.content-anim');
    targets.forEach(t => t.classList.add('enter'));
  }

  function onExit(href) {
    const targets = document.querySelectorAll('.content-anim');
    return new Promise(resolve => {
      targets.forEach(t => {
        t.classList.remove('enter');
        t.classList.add('exit');
      });
      // match the CSS transition duration (safe margin)
      setTimeout(() => resolve(), 360);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    onEnter();

    document.body.addEventListener('click', (e) => {
      // only intercept left clicks without modifier keys
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;
      // external links and anchors should not be intercepted
      if (href.startsWith('http') && !href.includes(location.host)) return;
      if (href.startsWith('#')) return;
      // allow same-page relative links
      if (a.target === '_blank') return;

      // Intercept internal navigation
      e.preventDefault();
      onExit().then(() => {
        window.location.href = href;
      });
    });
  });
})();
