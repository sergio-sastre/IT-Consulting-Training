(function () {
  'use strict';

  // 1. Scroll Reveal
  const revealElements = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // 2. Silky-Smooth 3D Tilt on the Floating Profile Card (rAF lerp)
  const profileCard = document.getElementById('profile-card');
  if (profileCard && !prefersReducedMotion) {
    let targetX = 0;
    let targetY = 0;
    let targetScale = 1;
    let currentX = 0;
    let currentY = 0;
    let currentScale = 1;
    let rafId = null;

    const ease = 0.1;

    function animateTilt() {
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      currentScale += (targetScale - currentScale) * ease;

      profileCard.style.transform =
        `perspective(900px) rotateX(${currentX.toFixed(3)}deg) rotateY(${currentY.toFixed(3)}deg) scale3d(${currentScale.toFixed(4)}, ${currentScale.toFixed(4)}, 1)`;

      const settled =
        Math.abs(targetX - currentX) < 0.01 &&
        Math.abs(targetY - currentY) < 0.01 &&
        Math.abs(targetScale - currentScale) < 0.0005;

      if (!settled) {
        rafId = window.requestAnimationFrame(animateTilt);
      } else {
        if (targetX === 0 && targetY === 0 && targetScale === 1) {
          profileCard.style.transform = '';
        }
        rafId = null;
      }
    }

    function startTiltLoop() {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(animateTilt);
      }
    }

    profileCard.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = profileCard.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      targetY = (px - 0.5) * 14;
      targetX = (0.5 - py) * 14;
      targetScale = 1.02;

      profileCard.classList.add('is-tilting');
      profileCard.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      profileCard.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      startTiltLoop();
    });

    profileCard.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      targetScale = 1;
      profileCard.classList.remove('is-tilting');
      startTiltLoop();
    });
  }

  // 3. Interactive Quality-First Pillar Switcher
  const qualityContent = {
    testing: {
      title: 'Zero Visual Regressions',
      text: 'Deterministic Paparazzi, Roborazzi & Preview verification across themes, locales, font scales, and accessibility—before code ever merges.'
    },
    cpdd: {
      title: 'Composable Preview Driven Development',
      text: 'Turn @Preview functions into living UI specifications and automated tests, enabling rapid refactoring with complete confidence.'
    },
    ai: {
      title: 'Augmented Coding with AI',
      text: 'Pair AI coding workflows with strict TDD and automated verification loops to multiply engineering velocity without sacrificing quality.'
    }
  };

  const qualityTabs = Array.from(document.querySelectorAll('.quality-tab'));
  const qualityPanel = document.getElementById('quality-panel');

  qualityTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.qtab;
      const data = qualityContent[key];
      if (!data || !qualityPanel) return;

      qualityTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });

      const titleEl = qualityPanel.querySelector('.quality-panel-title');
      const textEl = qualityPanel.querySelector('.quality-panel-text');
      if (titleEl) titleEl.textContent = data.title;
      if (textEl) textEl.textContent = data.text;
    });
  });

  // 4. Copyright Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
