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
      targetY = (px - 0.5) * 7;
      targetX = (0.5 - py) * 7;
      targetScale = 1.01;

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

  // 3. Sync GDE & Peer Bonus badge box heights on desktop
  const gdeBadgesBox = document.querySelector('.gde-badges-box');
  const awardBadgeBox = document.querySelector('.award-badge-box');

  if (gdeBadgesBox && awardBadgeBox) {
    const syncBadgeBoxHeights = () => {
      gdeBadgesBox.style.minHeight = '';
      awardBadgeBox.style.minHeight = '';

      if (window.innerWidth >= 900) {
        const maxHeight = Math.max(
          gdeBadgesBox.getBoundingClientRect().height,
          awardBadgeBox.getBoundingClientRect().height
        );
        const target = `${Math.ceil(maxHeight)}px`;
        gdeBadgesBox.style.minHeight = target;
        awardBadgeBox.style.minHeight = target;
      }
    };

    syncBadgeBoxHeights();
    window.addEventListener('resize', syncBadgeBoxHeights);
    window.addEventListener('load', syncBadgeBoxHeights);
  }

  // 4. Copyright Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
