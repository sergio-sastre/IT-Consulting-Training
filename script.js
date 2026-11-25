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
            const el = entry.target;
            el.classList.add('is-visible');
            obs.unobserve(el);
            window.setTimeout(() => {
              el.classList.remove('reveal', 'is-visible');
            }, 600);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.remove('reveal'));
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

  // 4. Resume Experience Filter Pills
  const filterPills = document.querySelectorAll('.filter-pill[data-filter]');
  if (filterPills.length > 0) {
    const majorItems = document.querySelectorAll('#major-timeline .exp-entry');
    const minorWrap = document.getElementById('minor-projects-wrap');
    const minorCards = document.querySelectorAll('#minor-projects-wrap .minor-card');

    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const selected = pill.getAttribute('data-filter') || 'all';

        filterPills.forEach((btn) => {
          const active = btn === pill;
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-pressed', String(active));
        });

        majorItems.forEach((item) => {
          const cats = (item.getAttribute('data-categories') || '').split(/\s+/);
          item.hidden = selected !== 'all' && !cats.includes(selected);
        });

        let visibleMinorCount = 0;
        minorCards.forEach((card) => {
          const cats = (card.getAttribute('data-categories') || '').split(/\s+/);
          const match = selected === 'all' || cats.includes(selected);
          card.hidden = !match;
          if (match) visibleMinorCount += 1;
        });

        if (minorWrap) {
          minorWrap.hidden = visibleMinorCount === 0;
        }
      });
    });
  }

  // 5. Print / Save PDF & One-Click Email Copy (Resume Page)
  const printBtn = document.getElementById('print-resume-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyEmailStatus = document.getElementById('copy-email-status');
  if (copyEmailBtn && copyEmailStatus) {
    let resetTimer = null;
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.getAttribute('data-email') || '';
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
        copyEmailBtn.classList.add('is-copied');
        copyEmailStatus.textContent = 'Copied!';
        if (resetTimer) window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          copyEmailBtn.classList.remove('is-copied');
          copyEmailStatus.textContent = 'Copy';
        }, 2200);
      } catch (_err) {
        window.location.href = `mailto:${email}`;
      }
    });
  }

  // 6. Dynamic Ongoing Role Duration (inclusive month count, e.g. "3 yrs 4 mos")
  const dynamicDurations = document.querySelectorAll('[data-duration-start]');
  if (dynamicDurations.length > 0) {
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth() + 1;

    dynamicDurations.forEach((el) => {
      const raw = el.getAttribute('data-duration-start') || '';
      const match = /^(\d{4})-(\d{2})$/.exec(raw);
      if (!match) return;

      const startYear = Number(match[1]);
      const startMonth = Number(match[2]);
      const totalMonths = Math.max(
        1,
        (nowYear - startYear) * 12 + (nowMonth - startMonth) + 1
      );
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;

      const parts = [];
      if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
      if (months > 0) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
      el.textContent = parts.join(' ');
    });
  }

  // 7. Dynamic Total Years of Experience (e.g. "12+" since 2014-03)
  const yearsSinceEls = document.querySelectorAll('[data-years-since]');
  if (yearsSinceEls.length > 0) {
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth() + 1;

    yearsSinceEls.forEach((el) => {
      const raw = el.getAttribute('data-years-since') || '';
      const match = /^(\d{4})-(\d{2})$/.exec(raw);
      if (!match) return;

      const startYear = Number(match[1]);
      const startMonth = Number(match[2]);
      const totalMonths = Math.max(
        0,
        (nowYear - startYear) * 12 + (nowMonth - startMonth)
      );
      const years = Math.floor(totalMonths / 12);
      el.textContent = `${years}+`;
    });
  }

  // 8. Copyright Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
