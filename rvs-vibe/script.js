/**
 * ════════════════════════════════════════════════
 *  RVS VIBE 2026 — script.js
 *  Canvas particles • Navbar • Hamburger
 *  Scroll reveal • Counters • Tabs • Form
 * ════════════════════════════════════════════════
 */

/* ─────────────────────────────────────────────
   UTILITY: Run after DOM is ready
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════════════
     1. HERO CANVAS — Animated particle network
     ═══════════════════════════════════════════ */
  const canvas  = document.getElementById('heroCanvas');
  const ctx     = canvas ? canvas.getContext('2d') : null;
  const particles = [];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* Particle class */
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x   = Math.random() * canvas.width;
      this.y   = Math.random() * canvas.height;
      this.vx  = (Math.random() - .5) * .4;
      this.vy  = (Math.random() - .5) * .4;
      this.r   = Math.random() * 1.5 + .5;
      this.a   = Math.random() * .5 + .1;
      this.col = Math.random() > .6 ? '#a78bfa' : Math.random() > .5 ? '#f472b6' : '#7c3aed';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.a;
      ctx.fillStyle   = this.col;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* Create particles */
  if (canvas && ctx) {
    const count = window.innerWidth < 768 ? 40 : 90;
    for (let i = 0; i < count; i++) particles.push(new Particle());

    /* Draw connecting lines between nearby particles */
    function drawLines() {
      const limit = window.innerWidth < 768 ? 80 : 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < limit) {
            ctx.save();
            ctx.globalAlpha = (1 - d / limit) * .12;
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth   = .5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    /* Animation loop */
    function animateCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animateCanvas);
    }
    animateCanvas();
  }

  /* ═══════════════════════════════════════════
     2. CURSOR GLOW
     ═══════════════════════════════════════════ */
  const cursorGlow = document.getElementById('cursorGlow');

  if (cursorGlow && !('ontouchstart' in window)) {
    document.addEventListener('mousemove', e => {
      cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
  }

  /* ═══════════════════════════════════════════
     3. NAVBAR — scroll effect + active link
     ═══════════════════════════════════════════ */
  const navbar    = document.getElementById('navbar');
  const navLinks  = document.querySelectorAll('.nav-link');
  const sections  = document.querySelectorAll('section[id]');

  function onScroll() {
    /* Scrolled style */
    navbar.classList.toggle('scrolled', window.scrollY > 60);

    /* Active link highlight */
    const scrollY = window.scrollY + 120;
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === `#${sec.id}`) a.classList.add('active');
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ═══════════════════════════════════════════
     4. HAMBURGER MENU
     ═══════════════════════════════════════════ */
  const hamburger  = document.getElementById('hamburger');
  const navMenu    = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    hamburger.classList.add('open');
    navMenu.classList.add('open');
    navOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    navOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => navMenu.classList.contains('open') ? closeMenu() : openMenu());
  navOverlay.addEventListener('click', closeMenu);

  navLinks.forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) closeMenu();
  });

  /* ═══════════════════════════════════════════
     5. SCROLL REVEAL (Intersection Observer)
     ═══════════════════════════════════════════ */
  const revealEls = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.delay || '0');
      setTimeout(() => {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }, delay);
    });
  }, {
    root: null,
    rootMargin: '0px 0px -70px 0px',
    threshold: 0.08
  });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ═══════════════════════════════════════════
     6. COUNTER ANIMATION (Stats Bar)
     ═══════════════════════════════════════════ */
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  let countersDone = false;

  function animateCounter(el, target) {
    const duration = 1800;
    const start    = performance.now();
    const isLarge  = target >= 100;

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease-out cubic */
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  const statsBar = document.getElementById('statsBar');
  if (statsBar) {
    const statObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersDone) {
          countersDone = true;
          statNums.forEach(el => {
            animateCounter(el, parseInt(el.dataset.target));
          });
          statObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statObserver.observe(statsBar);
  }

  /* ═══════════════════════════════════════════
     7. HERO ENTRANCE ANIMATION
        Stagger-in on page load
     ═══════════════════════════════════════════ */
  const heroRevealEls = document.querySelectorAll('.hero [data-reveal]');
  heroRevealEls.forEach((el, i) => {
    const delay = parseInt(el.dataset.delay || '0');
    setTimeout(() => el.classList.add('revealed'), 200 + delay);
  });

  /* ═══════════════════════════════════════════
     8. SMOOTH SCROLL for internal links
     ═══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const navH = parseInt(getComputedStyle(document.documentElement)
                             .getPropertyValue('--nav-h')) || 76;
      window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
    });
  });

  /* ═══════════════════════════════════════════
     9. FORM VALIDATION
     ═══════════════════════════════════════════ */
  const form       = document.getElementById('regForm');
  const successBox = document.getElementById('regSuccess');
  const regAgain   = document.getElementById('regAgain');

  /* Field configs */
  const fields = {
    regName: {
      err:      'errName',
      validate: v => {
        if (!v.trim())           return 'Name is required.';
        if (v.trim().length < 3) return 'Name must be at least 3 characters.';
        if (!/^[a-zA-Z\s.''-]+$/.test(v)) return 'Please enter a valid name.';
        return '';
      }
    },
    regEmail: {
      err:      'errEmail',
      validate: v => {
        if (!v.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
        return '';
      }
    },
    regPhone: {
      err:      'errPhone',
      validate: v => {
        if (!v.trim())                   return 'Phone number is required.';
        if (!/^[6-9]\d{9}$/.test(v.trim())) return 'Enter a valid 10-digit Indian number.';
        return '';
      }
    },
    regYear: {
      err:      'errYear',
      validate: v => (!v ? 'Please select your year.' : '')
    },
    regDept: {
      err:      'errDept',
      validate: v => (!v ? 'Please select your department.' : '')
    },
    regEvent: {
      err:      'errEvent',
      validate: v => (!v ? 'Please select an event.' : '')
    }
  };

  /* Live validation */
  Object.entries(fields).forEach(([id, cfg]) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(cfg.err);
    if (!el || !err) return;

    const validate = () => {
      const msg = cfg.validate(el.value);
      err.textContent = msg;
      el.classList.toggle('f-error', !!msg);
      return !msg;
    };

    el.addEventListener('blur',  validate);
    el.addEventListener('change', validate);
    el.addEventListener('input', () => {
      if (el.classList.contains('f-error')) validate();
    });
  });

  /* Submit */
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      /* Validate all */
      let valid = true;
      Object.entries(fields).forEach(([id, cfg]) => {
        const el  = document.getElementById(id);
        const err = document.getElementById(cfg.err);
        if (!el || !err) return;
        const msg = cfg.validate(el.value);
        err.textContent = msg;
        el.classList.toggle('f-error', !!msg);
        if (msg) valid = false;
      });

      if (!valid) {
        /* Focus first error */
        const firstErr = form.querySelector('.f-error');
        if (firstErr) {
          firstErr.focus();
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      /* Loading state */
      const btn = document.getElementById('regBtn');
      btn.classList.add('loading');
      btn.disabled = true;

      setTimeout(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
        /* Show success */
        form.style.display    = 'none';
        successBox.classList.add('show');
      }, 1600);
    });
  }

  /* Register another */
  if (regAgain) {
    regAgain.addEventListener('click', () => {
      if (form) {
        form.reset();
        form.querySelectorAll('.f-error').forEach(el => el.classList.remove('f-error'));
        form.querySelectorAll('.f-err').forEach(el => el.textContent = '');
        form.style.display = 'block';
      }
      successBox.classList.remove('show');
    });
  }

  /* ═══════════════════════════════════════════
     10. GEO SHAPES — Parallax on mouse move
     ═══════════════════════════════════════════ */
  const geos = document.querySelectorAll('.geo');

  if (!('ontouchstart' in window)) {
    document.addEventListener('mousemove', e => {
      const cx = e.clientX / window.innerWidth  - .5;
      const cy = e.clientY / window.innerHeight - .5;
      geos.forEach((g, i) => {
        const factor = (i + 1) * 12;
        g.style.transform = `translate(${cx * factor}px, ${cy * factor}px)`;
      });
    });
  }

  /* ═══════════════════════════════════════════
     11. GALLERY ITEMS — stagger reveal
     ═══════════════════════════════════════════ */
  const galleryItems = document.querySelectorAll('.g-item');
  const galleryObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'none';
      galleryObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  galleryItems.forEach((item, i) => {
    item.style.opacity   = '0';
    item.style.transform = 'scale(.96) translateY(20px)';
    item.style.transition = `opacity .6s ${i * 80}ms ease, transform .6s ${i * 80}ms cubic-bezier(.34,1.56,.64,1)`;
    galleryObserver.observe(item);
  });

  /* ═══════════════════════════════════════════
     12. EVENT CARDS — stagger (already done via
         data-reveal + CSS, just log for debug)
     ═══════════════════════════════════════════ */
  // All event cards use [data-reveal] handled in section 5.

  /* ═══════════════════════════════════════════
     13. FEATURED CODE BLOCK — typewriter effect
     ═══════════════════════════════════════════ */
  const codeLines = document.querySelectorAll('.feat-code-block .code-line');
  const codeBlock = document.querySelector('.feat-code-block');
  let codeAnimated = false;

  if (codeBlock) {
    // Initially hide lines
    codeLines.forEach(line => { line.style.opacity = '0'; line.style.transform = 'translateX(-8px)'; line.style.transition = 'opacity .4s ease, transform .4s ease'; });

    const codeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !codeAnimated) {
          codeAnimated = true;
          codeLines.forEach((line, i) => {
            setTimeout(() => {
              line.style.opacity   = '1';
              line.style.transform = 'none';
            }, i * 180);
          });
          codeObserver.disconnect();
        }
      });
    }, { threshold: .5 });
    codeObserver.observe(codeBlock);
  }

}); /* end DOMContentLoaded */
