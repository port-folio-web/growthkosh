(() => {
  // =========================
  // HEADER SCROLL EFFECT
  // =========================
  const header = document.querySelector('.site-header');

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 16);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // =========================
  // MOBILE NAVIGATION
  // =========================
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  menuToggle?.addEventListener('click', () => {
    if (!navMenu) return;

    const open = navMenu.classList.toggle('open');

    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute(
      'aria-label',
      open ? 'Close navigation' : 'Open navigation'
    );

    document.body.classList.toggle('menu-open', open);
  });

  navMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');

      menuToggle?.setAttribute('aria-expanded', 'false');
      menuToggle?.setAttribute('aria-label', 'Open navigation');

      document.body.classList.remove('menu-open');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', event => {
    if (!navMenu || !menuToggle) return;

    const isMenuOpen = navMenu.classList.contains('open');
    const clickedInsideMenu = navMenu.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (isMenuOpen && !clickedInsideMenu && !clickedToggle) {
      navMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      document.body.classList.remove('menu-open');
    }
  });

  // =========================
  // FAQ ACCORDION
  // =========================
  document.querySelectorAll('.faq-item').forEach(item => {
    const button = item.querySelector('.faq-q');

    if (!button) return;

    button.addEventListener('click', () => {
      const wasOpen = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(otherItem => {
        const otherButton = otherItem.querySelector('.faq-q');
        const icon = otherButton?.querySelector('span');

        otherItem.classList.remove('active');

        if (otherButton) {
          otherButton.setAttribute('aria-expanded', 'false');
        }

        if (icon) {
          icon.textContent = '+';
        }
      });

      if (!wasOpen) {
        item.classList.add('active');
        button.setAttribute('aria-expanded', 'true');

        const icon = button.querySelector('span');

        if (icon) {
          icon.textContent = '−';
        }
      }
    });
  });

  // =========================
  // SCROLL REVEAL ANIMATION
  // =========================
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    revealElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    revealElements.forEach(element => {
      element.classList.add('visible');
    });
  }

  // =========================
  // CUSTOM ORDER CALCULATOR
  // =========================
  const calcForm = document.querySelector('#custom-calculator-form');
  const reelsInput = document.querySelector('#calc-reels');
  const viewsInput = document.querySelector('#calc-views');
  const totalViewsElement = document.querySelector('#calc-total-views');
  const totalCostElement = document.querySelector('#calc-total-cost');
  const nameInput = document.querySelector('#calc-name');
  const businessInput = document.querySelector('#calc-business');
  const quickViewButtons = document.querySelectorAll(
    '.quick-view-options button'
  );

  const CUSTOM_RATE_PER_100K = 1600;
  const MIN_VIEWS = 10000;
  const MAX_VIEWS = 10000000;
  const MIN_REELS = 1;
  const MAX_REELS = 500;

  const clampNumber = (value, min, max, fallback) => {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return fallback;
    }

    return Math.min(max, Math.max(min, parsedValue));
  };

  const formatNumber = value => {
    return new Intl.NumberFormat('en-IN').format(Math.round(value));
  };

  const formatCurrency = value => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.round(value));
  };

  const calculateCustomOrder = () => {
    const reels = Math.round(
      clampNumber(
        reelsInput?.value,
        MIN_REELS,
        MAX_REELS,
        MIN_REELS
      )
    );

    const viewsPerReel = Math.round(
      clampNumber(
        viewsInput?.value,
        MIN_VIEWS,
        MAX_VIEWS,
        100000
      )
    );

    const totalViews = reels * viewsPerReel;

    const totalCost =
      (totalViews / 100000) * CUSTOM_RATE_PER_100K;

    if (totalViewsElement) {
      totalViewsElement.textContent = formatNumber(totalViews);
    }

    if (totalCostElement) {
      totalCostElement.textContent = formatCurrency(totalCost);
    }

    quickViewButtons.forEach(button => {
      const buttonViews = Number(button.dataset.views);

      button.classList.toggle(
        'selected',
        buttonViews === viewsPerReel
      );
    });

    return {
      reels,
      viewsPerReel,
      totalViews,
      totalCost
    };
  };

  // Update calculator while user types
  reelsInput?.addEventListener('input', calculateCustomOrder);
  viewsInput?.addEventListener('input', calculateCustomOrder);

  // Validate values when input loses focus
  reelsInput?.addEventListener('blur', () => {
    reelsInput.value = Math.round(
      clampNumber(
        reelsInput.value,
        MIN_REELS,
        MAX_REELS,
        MIN_REELS
      )
    );

    calculateCustomOrder();
  });

  viewsInput?.addEventListener('blur', () => {
    viewsInput.value = Math.round(
      clampNumber(
        viewsInput.value,
        MIN_VIEWS,
        MAX_VIEWS,
        100000
      )
    );

    calculateCustomOrder();
  });

  // Quick buttons: 10K, 50K, 100K, 250K, 500K
  quickViewButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selectedViews = Number(button.dataset.views);

      if (
        !Number.isFinite(selectedViews) ||
        selectedViews < MIN_VIEWS
      ) {
        return;
      }

      if (viewsInput) {
        viewsInput.value = selectedViews;
      }

      calculateCustomOrder();
    });
  });

  // =========================
  // WHATSAPP CUSTOM ORDER
  // =========================
  calcForm?.addEventListener('submit', event => {
    event.preventDefault();

    const {
      reels,
      viewsPerReel,
      totalViews,
      totalCost
    } = calculateCustomOrder();

    if (
      reels < MIN_REELS ||
      reels > MAX_REELS ||
      viewsPerReel < MIN_VIEWS ||
      viewsPerReel > MAX_VIEWS
    ) {
      return;
    }

    const customerName =
      (nameInput?.value || '').trim();

    const businessName =
      (businessInput?.value || '').trim();

    const messageLines = [
      'Hi GrowthKosh, I want a custom social media views package.',
      '',
      `Number of reels: ${reels}`,
      `Views per reel: ${formatNumber(viewsPerReel)}`,
      `Total views: ${formatNumber(totalViews)}`,
      `Estimated cost: ${formatCurrency(totalCost)}`,
      'Rate used: ₹1,600 per 100K views'
    ];

    if (customerName) {
      messageLines.push(`Name: ${customerName}`);
    }

    if (businessName) {
      messageLines.push(`Business/Page: ${businessName}`);
    }

    messageLines.push(
      '',
      'Please confirm availability and final order details.'
    );

    const whatsappMessage =
      encodeURIComponent(messageLines.join('\n'));

    const whatsappUrl =
      `https://wa.me/919337963411?text=${whatsappMessage}`;

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    );
  });

  // Initialize calculator when page loads
  if (calcForm) {
    calculateCustomOrder();
  }
})();
