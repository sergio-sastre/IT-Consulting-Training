/* ==========================================================================
   Interactions — Sergio Sastre Flórez | IT Consulting & Training
   ========================================================================== */

(function () {
  'use strict';

  // 1. Mobile Navigation Drawer
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuToggle && mobileNav) {
    const closeMenu = () => {
      mobileNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  // 2. Training & Workshops Tabs (Accessible WAI-ARIA Tabs)
  const tabButtons = Array.from(document.querySelectorAll('[role="tab"]'));
  const tabPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  function activateTab(tab) {
    const targetId = tab.getAttribute('aria-controls');

    tabButtons.forEach((btn) => {
      const selected = btn === tab;
      btn.setAttribute('aria-selected', String(selected));
      btn.setAttribute('tabindex', selected ? '0' : '-1');
    });

    tabPanels.forEach((panel) => {
      const active = panel.id === targetId;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  }

  tabButtons.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));

    tab.addEventListener('keydown', (event) => {
      let nextIndex = null;
      if (event.key === 'ArrowRight') {
        nextIndex = (index + 1) % tabButtons.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabButtons.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        tabButtons[nextIndex].focus();
        activateTab(tabButtons[nextIndex]);
      }
    });
  });

  // 3. Scroll-Triggered Staggered Reveal
  const revealElements = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // 4. Active Nav Link Highlighting on Scroll
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-35% 0px -55% 0px' }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // 5. Inquiry Brief Composer
  const topicChips = Array.from(document.querySelectorAll('.topic-chip'));
  const inquiryForm = document.getElementById('inquiry-form');
  const copyBriefBtn = document.getElementById('copy-brief-btn');
  const formStatus = document.getElementById('form-status');
  let selectedTopic = 'Android Consulting';

  topicChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      topicChips.forEach((c) => {
        c.classList.remove('is-selected');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-selected');
      chip.setAttribute('aria-pressed', 'true');
      selectedTopic = chip.dataset.topic || chip.textContent.trim();
    });
  });

  // Allow workshop cards to pre-select topic & scroll to contact
  document.querySelectorAll('[data-prefill-topic]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const desired = trigger.getAttribute('data-prefill-topic');
      const matchingChip = topicChips.find((c) => c.dataset.topic === desired);
      if (matchingChip) {
        matchingChip.click();
      }
      const messageField = document.getElementById('inquiry-message');
      const prefillText = trigger.getAttribute('data-prefill-message');
      if (messageField && prefillText && !messageField.value.trim()) {
        messageField.value = prefillText;
      }
    });
  });

  function buildBriefText() {
    const name = (document.getElementById('inquiry-name')?.value || '').trim();
    const company = (document.getElementById('inquiry-company')?.value || '').trim();
    const message = (document.getElementById('inquiry-message')?.value || '').trim();

    const lines = [
      `Topic: ${selectedTopic}`,
      name ? `From: ${name}${company ? ` (${company})` : ''}` : null,
      '',
      message || 'Hi Sergio, I would like to discuss a potential collaboration.'
    ].filter((line) => line !== null);

    return lines.join('\n');
  }

  if (copyBriefBtn) {
    copyBriefBtn.addEventListener('click', async () => {
      const brief = buildBriefText();
      try {
        await navigator.clipboard.writeText(brief);
        if (formStatus) {
          formStatus.textContent = 'Brief copied to clipboard — paste it directly in LinkedIn or your email client.';
        }
      } catch {
        if (formStatus) {
          formStatus.textContent = 'Unable to access clipboard automatically. Please copy your message from the form.';
        }
      }
    });
  }

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const brief = buildBriefText();
      try {
        await navigator.clipboard.writeText(brief);
        if (formStatus) {
          formStatus.textContent = 'Your brief is copied! Opening LinkedIn so you can paste and send it directly.';
        }
      } catch {
        if (formStatus) {
          formStatus.textContent = 'Opening LinkedIn to connect directly.';
        }
      }
      window.open('https://www.linkedin.com/in/sergio-sastre-florez-75b62754/', '_blank', 'noopener,noreferrer');
    });
  }

  // 6. Dynamic Copyright Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
