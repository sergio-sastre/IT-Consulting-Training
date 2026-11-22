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

  // 2. Subtle 3D Tilt on the Floating Profile Card
  const profileCard = document.getElementById('profile-card');
  if (profileCard && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    profileCard.addEventListener('mousemove', (event) => {
      const rect = profileCard.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateY = (x * 7).toFixed(2);
      const rotateX = (-y * 7).toFixed(2);
      profileCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    profileCard.addEventListener('mouseleave', () => {
      profileCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
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
