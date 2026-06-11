/* ════════════════════════════════════════════════════════════
   SENSEUNI — PREMIUM EFFECTS LAYER (additive, zero layout change)
   cursor aura · card spotlight · magnetic buttons ·
   scroll progress · headline shimmer · image glare
   Desktop pointer-fine only where it matters; respects
   prefers-reduced-motion. Safe to load on any page.
   ════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePtr  = window.matchMedia('(pointer: fine)').matches;
  const lerp     = (a, b, t) => a + (b - a) * t;

  /* ── Scroll progress bar (all devices) ───────────────────── */
  if (!reduced) {
    const bar = document.createElement('div');
    bar.className = 'fx-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let ticking = false;
    const paint = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0).toFixed(4) + ')';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(paint); ticking = true; }
    }, { passive: true });
    paint();
  }

  /* ── Headline shimmer — tag existing gradient-text spans ──── */
  if (!reduced) {
    // pages render gradient words as spans with background-clip:text
    document.querySelectorAll('h1 span, h2 span, .stat__value, [class*="grad"]').forEach(el => {
      const cs = getComputedStyle(el);
      const clipped = (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text');
      if (clipped && cs.backgroundImage !== 'none') el.classList.add('fx-shimmer');
    });
  }

  if (!finePtr || reduced) return;   // pointer effects below: desktop only

  /* ── Cursor aura ─────────────────────────────────────────── */
  const aura = document.createElement('div');
  aura.className = 'fx-aura';
  aura.setAttribute('aria-hidden', 'true');
  document.body.appendChild(aura);

  let mx = innerWidth / 2, my = innerHeight / 2;   // target
  let ax = mx, ay = my;                            // animated
  let auraRaf = null;

  const auraStep = () => {
    ax = lerp(ax, mx, 0.09);
    ay = lerp(ay, my, 0.09);
    aura.style.transform = 'translate3d(' + ax.toFixed(1) + 'px,' + ay.toFixed(1) + 'px,0)';
    if (Math.abs(ax - mx) + Math.abs(ay - my) > 0.4) {
      auraRaf = requestAnimationFrame(auraStep);
    } else {
      auraRaf = null;
    }
  };

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    aura.classList.add('is-on');
    if (!auraRaf) auraRaf = requestAnimationFrame(auraStep);
  }, { passive: true });

  document.addEventListener('mouseleave', () => aura.classList.remove('is-on'));

  /* ── Card spotlight ──────────────────────────────────────── */
  // Outer card-ish elements only: a class token that ENDS in "card",
  // plus a few known node/tile patterns from the existing pages.
  const tokenIsCard = (cls) => /(^|-|__)card$/.test(cls);
  const extraSel = '.platform__node, .eco-node, .patent-item, .hw-hs-item, .icon-item';
  const seen = new Set();
  const spotTargets = [];

  document.querySelectorAll('[class]').forEach(el => {
    if ([...el.classList].some(tokenIsCard)) { spotTargets.push(el); seen.add(el); }
  });
  document.querySelectorAll(extraSel).forEach(el => { if (!seen.has(el)) spotTargets.push(el); });

  spotTargets.forEach(card => {
    // skip elements nested inside another spotlight host (inner *-card tokens)
    if (card.closest('.fx-spot-host') && card.closest('.fx-spot-host') !== card) return;
    card.classList.add('fx-spot-host');
    const spot = document.createElement('span');
    spot.className = 'fx-spotlight';
    spot.setAttribute('aria-hidden', 'true');
    card.appendChild(spot);

    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--fx-x', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
      card.style.setProperty('--fx-y', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
    }, { passive: true });
  });

  /* ── Magnetic buttons ────────────────────────────────────────
     Uses the standalone `translate` property so it composes with
     each button's own :hover transform (no style conflicts). */
  const MAG_RADIUS = 90;   // px around the button that attracts
  const MAG_PULL   = 0.22; // fraction of cursor offset applied

  document.querySelectorAll('.btn--primary, .btn--secondary, .final-cta__btn, .back-to-top').forEach(btn => {
    btn.classList.add('fx-magnet');
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.translate = (dx * MAG_PULL).toFixed(1) + 'px ' + (dy * MAG_PULL).toFixed(1) + 'px';
    }, { passive: true });
    btn.addEventListener('mouseleave', () => { btn.style.translate = '0px 0px'; });
  });
  void MAG_RADIUS;

  /* ── Image glare on product/case imagery wrappers ─────────── */
  document.querySelectorAll('.prod-card__img-wrap, .patent-item__img, [class*="img-wrap"], [class*="media"]').forEach(el => {
    if (el.querySelector('img') && !el.closest('.fx-glare')) el.classList.add('fx-glare');
  });
})();
