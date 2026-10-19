/* D&K Services — shared motion script (homepage + /fleet)
   - Skips all motion for visitors with "reduce motion" turned on.
   - Reveals any element with class "reveal" or "bar-grow" as it scrolls into view.
   - Counts up any element with data-count="40" (keeps a suffix like "+").
   - Drives the thin red scroll-progress bar.
   Works with content React renders later: new elements are picked up automatically. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return; // content stays fully visible, no motion
  var root = document.documentElement;
  root.classList.add('anim');

  // Safety net: if anything goes wrong, never leave content hidden.
  var failsafe = setTimeout(function () { revealAll(); }, 6000);
  function revealAll() {
    var els = document.querySelectorAll('.reveal:not([data-in]), .bar-grow:not([data-in])');
    for (var i = 0; i < els.length; i++) els[i].setAttribute('data-in', '');
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, start = null;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.setAttribute('data-in', '');
      if (el.hasAttribute('data-count') && !el.hasAttribute('data-counted')) {
        el.setAttribute('data-counted', '');
        countUp(el);
      }
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0.1 });

  var seen = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
  function scan(scope) {
    var els = (scope || document).querySelectorAll('.reveal, .bar-grow, [data-count]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (seen) { if (seen.has(el)) continue; seen.add(el); }
      io.observe(el);
    }
  }

  function start() {
    scan();
    // Pick up content rendered later (the homepage renders with React after load).
    var target = document.getElementById('root') || document.body;
    var pending = false;
    new MutationObserver(function () {
      if (pending) return; pending = true;
      requestAnimationFrame(function () { pending = false; scan(target); });
    }).observe(target, { childList: true, subtree: true });

    // Scroll progress bar
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      ticking = false;
      var max = root.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      if (max - window.scrollY < 6) revealAll(); // bottom of page: show anything still waiting
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
    clearTimeout(failsafe);
    // Re-arm the failsafe briefly in case React hasn't rendered yet.
    failsafe = setTimeout(function () {
      var hidden = document.querySelectorAll('.reveal:not([data-in])');
      for (var i = 0; i < hidden.length; i++) {
        var r = hidden[i].getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) hidden[i].setAttribute('data-in', '');
      }
    }, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
