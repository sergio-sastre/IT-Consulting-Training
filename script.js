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

  // 2b. Subtle Specular Spotlight across Split-Chamber Cards
  if (!prefersReducedMotion) {
    const spotlightCards = document.querySelectorAll(
      '.service-card, .gde-card, .award-card, .impact-card'
    );
    spotlightCards.forEach((card) => {
      card.addEventListener(
        'pointermove',
        (e) => {
          const rect = card.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
          const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);
          card.style.setProperty('--mx', `${x}%`);
          card.style.setProperty('--my', `${y}%`);
        },
        { passive: true }
      );
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

  // 5b. Generic One-Click Copy Email CTA Buttons (All Pages)
  const copyCtaButtons = document.querySelectorAll('[data-copy-email]');
  if (copyCtaButtons.length > 0) {
    copyCtaButtons.forEach((btn) => {
      const labelEl = btn.querySelector('[data-copy-label]') || btn;
      const defaultLabel = labelEl.textContent.trim();
      let resetTimer = null;

      btn.addEventListener('click', async () => {
        const email = btn.getAttribute('data-copy-email') || '';
        if (!email) return;
        try {
          await navigator.clipboard.writeText(email);
          btn.classList.add('is-copied');
          labelEl.textContent = 'Email Copied!';
          if (resetTimer) window.clearTimeout(resetTimer);
          resetTimer = window.setTimeout(() => {
            btn.classList.remove('is-copied');
            labelEl.textContent = defaultLabel;
          }, 2200);
        } catch (_err) {
          window.location.href = `mailto:${email}`;
        }
      });
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

  // 8. Micro Data-Visualizations & Interactive Proportional Career Ribbon
  const releaseGrid = document.getElementById('viz-release-grid');
  if (releaseGrid) {
    // 54 months (4.5 years): 3 amber hotfix markers across the span
    const hotfixIndices = new Set([11, 29, 44]);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 54; i += 1) {
      const tick = document.createElement('span');
      tick.className = hotfixIndices.has(i) ? 'viz-tick viz-tick--hotfix' : 'viz-tick';
      frag.appendChild(tick);
    }
    releaseGrid.appendChild(frag);
  }

  const ribbonCurrent = document.querySelector('[data-ribbon-start]');
  if (ribbonCurrent) {
    const raw = ribbonCurrent.getAttribute('data-ribbon-start') || '';
    const match = /^(\d{4})-(\d{2})$/.exec(raw);
    if (match) {
      const now = new Date();
      const totalMonths = Math.max(
        1,
        (now.getFullYear() - Number(match[1])) * 12 + (now.getMonth() + 1 - Number(match[2])) + 1
      );
      ribbonCurrent.style.flexGrow = String(totalMonths);
      const yrs = Math.floor(totalMonths / 12);
      const mos = totalMonths % 12;
      const shortDur = [yrs > 0 ? `${yrs}y` : '', mos > 0 ? `${mos}m` : ''].filter(Boolean).join(' ');
      const longDur = [
        yrs > 0 ? `${yrs} ${yrs === 1 ? 'yr' : 'yrs'}` : '',
        mos > 0 ? `${mos} ${mos === 1 ? 'mo' : 'mos'}` : ''
      ].filter(Boolean).join(' ');

      const labelEl = ribbonCurrent.querySelector('[data-ribbon-label]');
      if (labelEl) {
        const base = labelEl.getAttribute('data-ribbon-label') || 'Current';
        labelEl.textContent = `${base} · ${shortDur}`;
      }
      ribbonCurrent.setAttribute(
        'data-tooltip',
        `Deutsche Bahn Systel · Aug 2023–Present (${longDur})`
      );
    }
  }

  const ribbonSegments = document.querySelectorAll('.ribbon-seg[data-jump]');
  if (ribbonSegments.length > 0) {
    const allFilterPill = document.querySelector('.filter-pill[data-filter="all"]');
    ribbonSegments.forEach((seg) => {
      seg.addEventListener('click', () => {
        const selector = seg.getAttribute('data-jump');
        if (!selector) return;
        const target = document.querySelector(selector);
        if (!target) return;

        if (target.hidden && allFilterPill) {
          allFilterPill.click();
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const card = target.querySelector('.exp-card') || target;
        card.classList.remove('is-jump-highlight');
        void card.offsetWidth;
        card.classList.add('is-jump-highlight');
      });
    });
  }

  // 8b. Speaking Page Category Filters
  const speakingFilterButtons = document.querySelectorAll('[data-speaking-filter]');
  const speakingGroups = document.querySelectorAll('[data-speaking-group]');
  if (speakingFilterButtons.length > 0 && speakingGroups.length > 0) {
    speakingFilterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-speaking-filter') || 'all';
        speakingFilterButtons.forEach((other) => {
          const isActive = other === btn;
          other.classList.toggle('is-active', isActive);
          other.setAttribute('aria-selected', String(isActive));
        });
        speakingGroups.forEach((group) => {
          const groupKey = group.getAttribute('data-speaking-group');
          const show = selected === 'all' || groupKey === selected;
          group.hidden = !show;
        });
      });
    });
  }

  // 8c. Live GitHub Star Counts (with static HTML fallbacks & sessionStorage cache)
  const starNodes = document.querySelectorAll('[data-github-stars]');
  const totalStarNodes = document.querySelectorAll('[data-github-stars-total]');
  if (starNodes.length > 0 || totalStarNodes.length > 0) {
    const CACHE_KEY = 'gh_stars_cache_v1';
    const CACHE_TTL_MS = 30 * 60 * 1000;
    const nowMs = Date.now();
    let cache = {};

    try {
      const raw = window.sessionStorage.getItem(CACHE_KEY);
      if (raw) cache = JSON.parse(raw) || {};
    } catch (_) {
      cache = {};
    }

    const reposNeeded = new Set();
    starNodes.forEach((el) => {
      const repo = el.getAttribute('data-github-stars');
      if (repo) reposNeeded.add(repo);
    });
    totalStarNodes.forEach((el) => {
      const list = (el.getAttribute('data-github-stars-total') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      list.forEach((repo) => reposNeeded.add(repo));
    });

    const fetchRepoStars = async (repo) => {
      const cached = cache[repo];
      if (cached && typeof cached.count === 'number' && nowMs - cached.ts < CACHE_TTL_MS) {
        return cached.count;
      }
      try {
        const res = await window.fetch(`https://api.github.com/repos/${repo}`, {
          headers: { Accept: 'application/vnd.github+json' }
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (typeof data.stargazers_count !== 'number') return null;
        cache[repo] = { count: data.stargazers_count, ts: Date.now() };
        try {
          window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (_) {
          // Ignore storage quota / private mode errors
        }
        return data.stargazers_count;
      } catch (_) {
        return null;
      }
    };

    Promise.all(
      Array.from(reposNeeded).map(async (repo) => [repo, await fetchRepoStars(repo)])
    ).then((entries) => {
      const counts = Object.fromEntries(entries);

      starNodes.forEach((el) => {
        const repo = el.getAttribute('data-github-stars');
        const count = repo ? counts[repo] : null;
        if (typeof count === 'number') {
          el.textContent = count.toLocaleString('en-US');
        }
      });

      totalStarNodes.forEach((el) => {
        const repos = (el.getAttribute('data-github-stars-total') || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const resolved = repos.map((r) => counts[r]);
        if (repos.length > 0 && resolved.every((v) => typeof v === 'number')) {
          const sum = resolved.reduce((acc, n) => acc + n, 0);
          el.textContent = sum.toLocaleString('en-US');
        }
      });
    });
  }

  // 8d. Live Monthly Library Downloads (sum of JitPack & Scarf badges with static fallback)
  const downloadNodes = document.querySelectorAll('[data-library-downloads]');
  if (downloadNodes.length > 0) {
    const DL_CACHE_KEY = 'lib_downloads_cache_v1';
    const DL_CACHE_TTL_MS = 30 * 60 * 1000;
    const scarfBadgeUrl =
      'https://api.scarf.sh/v2/packages/Sergio-sastre/87e0cced-b5ee-4c8a-806c-81bdc43f6ec6/downloads-badge';
    const DOWNLOAD_SOURCES = [
      'https://jitpack.io/v/sergio-sastre/ComposablePreviewScanner/month.svg',
      `https://img.shields.io/badge/dynamic/xml?url=${encodeURIComponent(scarfBadgeUrl)}&query=${encodeURIComponent("//*[local-name()='title']")}&label=scarf`,
      'https://jitpack.io/v/sergio-sastre/AndroidUiTestingUtils/month.svg'
    ];

    const parseMonthlyDownloads = (svgText) => {
      const match = /(\d[\d,]*(?:\.\d+)?)\s*([kKmM])?\s*\/\s*month/i.exec(svgText);
      if (!match) return null;
      const value = Number.parseFloat(match[1].replace(/,/g, ''));
      if (!Number.isFinite(value)) return null;
      const unit = (match[2] || '').toLowerCase();
      const multiplier = unit === 'm' ? 1000000 : unit === 'k' ? 1000 : 1;
      return Math.round(value * multiplier);
    };

    const applyDownloadTotal = (total) => {
      const formatted = total.toLocaleString('en-US');
      downloadNodes.forEach((el) => {
        el.textContent = formatted;
      });
    };

    let cachedTotal = null;
    try {
      const raw = window.sessionStorage.getItem(DL_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.total === 'number' &&
          Date.now() - parsed.ts < DL_CACHE_TTL_MS
        ) {
          cachedTotal = parsed.total;
        }
      }
    } catch (_) {
      cachedTotal = null;
    }

    if (typeof cachedTotal === 'number') {
      applyDownloadTotal(cachedTotal);
    } else {
      Promise.all(
        DOWNLOAD_SOURCES.map(async (url) => {
          try {
            const res = await window.fetch(url);
            if (!res.ok) return null;
            const svgText = await res.text();
            return parseMonthlyDownloads(svgText);
          } catch (_) {
            return null;
          }
        })
      ).then((counts) => {
        if (counts.every((n) => typeof n === 'number' && n > 0)) {
          const total = counts.reduce((acc, n) => acc + n, 0);
          applyDownloadTotal(total);
          try {
            window.sessionStorage.setItem(
              DL_CACHE_KEY,
              JSON.stringify({ total, ts: Date.now() })
            );
          } catch (_) {
            // Ignore storage quota / private mode errors
          }
        }
      });
    }
  }

  // 9. Copyright Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
