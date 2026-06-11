/* ════════════════════════════════════════════════════════════
   SENSEUNI — SHARED BEHAVIOR
   nav · drawer · reveal · count-up · parallax · cookie · misc
   ════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Nav: scrolled state + hide-on-scroll-down ───────────── */
  const nav = document.getElementById('nav');
  const backToTop = document.getElementById('back-to-top');

  if (nav) {
    let lastY = 0;
    let ticking = false;
    const HIDE_AFTER = 140;
    const DELTA = 6;

    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 10);
      if (y < HIDE_AFTER) {
        nav.classList.remove('is-hidden');
      } else if (y > lastY + DELTA) {
        nav.classList.add('is-hidden');
      } else if (y < lastY - DELTA) {
        nav.classList.remove('is-hidden');
      }
      if (backToTop) backToTop.classList.toggle('is-visible', y > 500);
      lastY = y;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    document.addEventListener('mousemove', (e) => {
      if (e.clientY < 80) nav.classList.remove('is-hidden');
    }, { passive: true });
  }

  /* ── Mobile drawer ───────────────────────────────────────── */
  const hamburger = document.getElementById('nav-hamburger');
  const drawer = document.getElementById('nav-drawer');

  if (nav && hamburger && drawer) {
    const setDrawer = (open) => {
      nav.classList.toggle('is-open', open);
      drawer.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    hamburger.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
    window.addEventListener('resize', () => { if (window.innerWidth > 960) setDrawer(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
  }

  /* ── Scroll reveal (.reveal and [data-stagger]) ──────────── */
  const revealTargets = document.querySelectorAll('.reveal, [data-stagger]');
  if (revealTargets.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      revealTargets.forEach(el => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealTargets.forEach(el => {
        // anything already in (or above) the viewport shows immediately —
        // covers deep links and programmatic jumps
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92) el.classList.add('is-visible');
        else io.observe(el);
      });
    }
  }

  /* ── Number count-up: [data-count="1234"] ────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const fmt = (n, dec) => n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      const dur = 1600;
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(target * eased, dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = fmt(target, dec);
      };
      requestAnimationFrame(step);
    };
    if (reduced || !('IntersectionObserver' in window)) {
      counters.forEach(el => { el.textContent = parseFloat(el.dataset.count).toLocaleString('en-US'); });
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(el => io.observe(el));
    }
  }

  /* ── Gentle parallax: [data-parallax="0.15"] ─────────────── */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reduced) {
    let pTicking = false;
    const apply = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.12;
        const r = el.getBoundingClientRect();
        const offset = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      pTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!pTicking) { requestAnimationFrame(apply); pTicking = true; }
    }, { passive: true });
    apply();
  }

  /* ── FAQ accordion ───────────────────────────────────────── */
  document.querySelectorAll('.faq-item__q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const answer = item.querySelector('.faq-item__a');
      const isOpen = item.classList.contains('is-open');
      // close siblings
      item.parentElement.querySelectorAll('.faq-item.is-open').forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq-item__a').style.maxHeight = '0px';
          other.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('is-open', !isOpen);
      q.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? '0px' : answer.scrollHeight + 'px';
    });
  });

  /* ── Cookie notice ───────────────────────────────────────── */
  const cookie = document.getElementById('cookie-notice');
  if (cookie) {
    if (localStorage.getItem('su-cookie-ok')) {
      cookie.hidden = true;
    } else {
      cookie.hidden = false;
      const btn = cookie.querySelector('[data-cookie-accept]');
      if (btn) btn.addEventListener('click', () => {
        localStorage.setItem('su-cookie-ok', '1');
        cookie.style.opacity = '0';
        cookie.style.transform = 'translateY(12px)';
        setTimeout(() => { cookie.hidden = true; }, 350);
      });
    }
  }

  /* ── Range slider fill sync ──────────────────────────────── */
  document.querySelectorAll('input[type="range"].slider').forEach(s => {
    const sync = () => {
      const min = parseFloat(s.min) || 0;
      const max = parseFloat(s.max) || 100;
      s.style.setProperty('--fill', (((s.value - min) / (max - min)) * 100) + '%');
    };
    s.addEventListener('input', sync);
    sync();
  });

  /* ── Footer year ─────────────────────────────────────────── */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
