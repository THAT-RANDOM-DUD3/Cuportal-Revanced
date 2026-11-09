/**
 * Cuportal Revanced - Dashboard & Portal Script
 * Injected into Covenant University Portal pages after login
 * Handles:
 * 1. Native asynchronous loading of portal apps from appajax.php (on dashboard)
 * 2. Tokenized link generation and redirection on app click
 * 3. Modern, instinctive user account dropdown with clear visual affordances
 * 4. Responsive collapsible sidebar & mobile offcanvas drawer
 * 5. Instant search / quick filter for portal apps
 * 6. High-contrast icon fallbacks for broken portal images
 * 7. Support for both landing dashboard and inner subpages
 */

(function () {
  'use strict';

  // Check if we are inside the authenticated portal shell
  function isPortalPage() {
    return (
      document.querySelector('.wrapper') !== null ||
      document.querySelector('.headerstaff') !== null ||
      document.querySelector('.sidebar') !== null ||
      document.body.classList.contains('skin-black')
    );
  }

  // Check if current page is the Applications Dashboard landing page
  function isAppsDashboardPage() {
    return (
      location.pathname.includes('studentdashboard') ||
      document.getElementById('loading-image') !== null ||
      document.querySelector('.clickapp') !== null
    );
  }

  // Map application names to modern high-clarity FontAwesome icons (for broken image fallbacks)
  function getIconForApp(appName) {
    const name = (appName || '').toLowerCase();
    if (name.includes('account')) {
      return '<i class="fa-solid fa-wallet" style="font-size: 2.2rem; color: #a855f7;"></i>';
    }
    if (name.includes('planning') || name.includes('academic') || name.includes('setup')) {
      return '<i class="fa-solid fa-graduation-cap" style="font-size: 2.2rem; color: #3b82f6;"></i>';
    }
    if (name.includes('resumption')) {
      return '<i class="fa-solid fa-calendar-check" style="font-size: 2.2rem; color: #10b981;"></i>';
    }
    if (name.includes('affair')) {
      return '<i class="fa-solid fa-users" style="font-size: 2.2rem; color: #f59e0b;"></i>';
    }
    if (name.includes('course') || name.includes('control') || name.includes('registration')) {
      return '<i class="fa-solid fa-book-bookmark" style="font-size: 2.2rem; color: #ec4899;"></i>';
    }
    if (name.includes('attendance')) {
      return '<i class="fa-solid fa-clipboard-user" style="font-size: 2.2rem; color: #06b6d4;"></i>';
    }
    if (name.includes('result') || name.includes('processing')) {
      return '<i class="fa-solid fa-chart-line" style="font-size: 2.2rem; color: #8b5cf6;"></i>';
    }
    return '<i class="fa-solid fa-cubes" style="font-size: 2.2rem; color: #a855f7;"></i>';
  }

  // -------------------------------------------------------------------------
  // 1. Data Loading: Fetch applications from appajax.php
  // -------------------------------------------------------------------------
  function setupAppGrid() {
    if (!isAppsDashboardPage()) return;

    const loadingImg = document.getElementById('loading-image');
    const existingCards = document.querySelectorAll('.clickapp');

    // Identify apps row container
    let gridRow = loadingImg ? loadingImg.closest('.row') : null;
    if (!gridRow && existingCards.length > 0) {
      gridRow = existingCards[0].closest('.row');
    }
    if (!gridRow) {
      gridRow = document.querySelector('.right-side .content .row');
    }
    if (!gridRow) return;

    gridRow.classList.add('dashboard-apps-grid');

    // If apps are already present in DOM
    if (existingCards.length > 0) {
      if (loadingImg) loadingImg.style.display = 'none';
      enhanceAppCards(gridRow);
      return;
    }

    // Hide old unstyled gif icon
    if (loadingImg) loadingImg.style.display = 'none';

    // Directly render skeletons inside gridRow
    gridRow.innerHTML = '';
    renderSkeletons(gridRow, 8);

    // Guaranteed root-relative URL for Covenant portal
    const ajaxUrl = window.location.origin + '/applications/admin/include/appajax.php';

    fetch(ajaxUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: 'pageload=pageload'
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.text();
      })
      .then((html) => {
        gridRow.innerHTML = '';
        if (!html || !html.trim()) {
          throw new Error('Empty response from portal application server');
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        while (tempDiv.firstChild) {
          gridRow.appendChild(tempDiv.firstChild);
        }

        enhanceAppCards(gridRow);
      })
      .catch((err) => {
        console.warn('[Cuportal Revanced] Fetching appajax.php error:', err);
        renderErrorState(gridRow, () => setupAppGrid());
      });
  }

  function renderSkeletons(container, count) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'dashboard-skeleton-card';
      skeleton.innerHTML = `
        <div class="skeleton-icon"></div>
        <div class="skeleton-text"></div>
      `;
      container.appendChild(skeleton);
    }
  }

  function renderErrorState(container, retryCallback) {
    container.innerHTML = `
      <div class="dashboard-empty-state">
        <i class="fa-solid fa-triangle-exclamation" style="color: var(--color-warning);"></i>
        <h3>Unable to load portal applications</h3>
        <p>Please verify your active session or connection and try again.</p>
        <button type="button" class="btn btn-primary" id="retryLoadBtn" style="margin-top: 1rem;">
          <i class="fa-solid fa-rotate-right"></i> Retry Loading
        </button>
      </div>
    `;
    const retryBtn = document.getElementById('retryLoadBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', retryCallback);
    }
  }

  // Enhance rendered cards with launch indicators, accessibility & image fallbacks
  function enhanceAppCards(container) {
    const cards = container.querySelectorAll('.clickapp');
    cards.forEach((card) => {
      // Add launch icon badge if missing
      if (!card.querySelector('.app-card-launch-icon')) {
        const badge = document.createElement('div');
        badge.className = 'app-card-launch-icon';
        badge.setAttribute('title', 'Launch Portal');
        badge.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i>';
        card.appendChild(badge);
      }

      // Handle broken or missing app icons
      const img = card.querySelector('.stat-icon img');
      const titleEl = card.querySelector('.stat-info') || card.querySelector('h5');
      const appTitle = titleEl ? titleEl.textContent.trim() : '';

      if (img) {
        img.addEventListener('error', () => {
          const iconWrapper = img.parentElement;
          if (iconWrapper) {
            iconWrapper.innerHTML = getIconForApp(appTitle);
          }
        });

        // If image already failed to load before listener
        if (img.complete && img.naturalWidth === 0) {
          const iconWrapper = img.parentElement;
          if (iconWrapper) {
            iconWrapper.innerHTML = getIconForApp(appTitle);
          }
        }
      }

      // Accessibility attributes
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    updateAppCount(cards.length);
  }

  function updateAppCount(count) {
    const countEl = document.getElementById('appCountBadge');
    if (countEl) {
      countEl.textContent = `${count} Portals`;
    }
  }

  // -------------------------------------------------------------------------
  // 2. Event Listener for Link Generation & Redirection
  // -------------------------------------------------------------------------
  function setupRedirectionHandler() {
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.clickapp');
      if (!card) return;

      e.preventDefault();

      let appid1 = '';
      const cardId = card.id || '';
      const anchor = card.querySelector('a');
      const anchorId = anchor ? anchor.id : '';

      const match = cardId.match(/\d+/) || anchorId.match(/\d+/);
      if (match) {
        appid1 = match[0];
      }

      const appidInput = card.querySelector('input[id^="appid"]') || (appid1 ? document.getElementById('appid' + appid1) : null);
      const tokenInput = card.querySelector('input[id^="handofftoken"]') || (appid1 ? document.getElementById('handofftoken' + appid1) : null);
      const urlInput = card.querySelector('input[id^="appurl"]') || (appid1 ? document.getElementById('appurl' + appid1) : null);

      const appurl = urlInput ? urlInput.value.trim() : '';
      const handoffToken = tokenInput ? tokenInput.value.trim() : '';

      if (!appurl) {
        console.error('[Cuportal Revanced] Target application URL missing for card:', card);
        return;
      }

      // Subtle click pulse
      card.style.transform = 'scale(0.97)';
      setTimeout(() => {
        card.style.transform = '';
      }, 150);

      // Assemble destination with security handoff token
      const separator = appurl.includes('?') ? '&' : '?';
      const destination = handoffToken ? `${appurl}${separator}token=${encodeURIComponent(handoffToken)}` : appurl;

      window.location.href = destination;
    });
  }

  // -------------------------------------------------------------------------
  // 3. Search & Quick Filter (Only on Apps Dashboard)
  // -------------------------------------------------------------------------
  function setupDashboardHeroAndSearch() {
    if (!isAppsDashboardPage()) return;

    const content = document.querySelector('.right-side section.content');
    if (!content || document.getElementById('dashboardHeroBanner')) return;

    // Extract student first name
    const userNameEl = document.querySelector('.user.user-menu .dropdown-toggle span') ||
                       document.querySelector('.sidebar-menu .side-piece span');
    let studentFirstName = 'Student';
    if (userNameEl) {
      const rawText = userNameEl.textContent.trim().split(/\s+/)[0];
      if (rawText && rawText !== 'Account') studentFirstName = rawText;
    }

    const hero = document.createElement('div');
    hero.className = 'dashboard-hero-banner';
    hero.id = 'dashboardHeroBanner';
    hero.innerHTML = `
      <div class="dashboard-hero-content">
        <h1>Welcome back, ${escapeHtml(studentFirstName)} 👋</h1>
        <p>Access your Covenant University academic portals and services below.</p>
      </div>
      <div class="dashboard-search-wrap">
        <i class="fa-solid fa-magnifying-glass dashboard-search-icon"></i>
        <input 
          type="search" 
          id="appSearchInput" 
          class="dashboard-search-input" 
          placeholder="Quick search portals (Press / to search)..." 
          aria-label="Search applications"
          autocomplete="off"
        />
      </div>
    `;

    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'dashboard-section-header';
    sectionHeader.innerHTML = `
      <h2 class="dashboard-section-title">
        <i class="fa-solid fa-shapes" style="color: var(--color-primary); font-size: 1.1rem;"></i>
        Available Applications
        <span class="dashboard-app-count" id="appCountBadge">Loading...</span>
      </h2>
    `;

    const row = content.querySelector('.row');
    if (row) {
      content.insertBefore(hero, row);
      content.insertBefore(sectionHeader, row);
    } else {
      content.prepend(sectionHeader);
      content.prepend(hero);
    }

    const searchInput = document.getElementById('appSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        filterApps(query);
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }
  }

  function filterApps(query) {
    const gridRow = document.querySelector('.right-side .content .row');
    if (!gridRow) return;

    const cards = gridRow.querySelectorAll('.clickapp');
    let visibleCount = 0;

    cards.forEach((card) => {
      const titleEl = card.querySelector('.stat-info') || card.querySelector('h5');
      const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
      const matches = titleText.includes(query);

      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    let emptyState = gridRow.querySelector('.dashboard-empty-state');
    if (visibleCount === 0 && query.length > 0) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'dashboard-empty-state';
        emptyState.innerHTML = `
          <i class="fa-solid fa-magnifying-glass"></i>
          <h3>No applications found</h3>
          <p>We couldn't find any portal matching "<strong>${escapeHtml(query)}</strong>".</p>
        `;
        gridRow.appendChild(emptyState);
      } else {
        emptyState.querySelector('strong').textContent = query;
        emptyState.style.display = '';
      }
    } else if (emptyState) {
      emptyState.style.display = 'none';
    }

    updateAppCount(visibleCount);
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  // -------------------------------------------------------------------------
  // 4. Instinctive User Account Dropdown
  // -------------------------------------------------------------------------
  function setupUserMenu() {
    const userMenuItem = document.querySelector('.navbar .dropdown.user.user-menu');
    if (!userMenuItem) return;

    const toggleLink = userMenuItem.querySelector('.dropdown-toggle');
    const dropdownMenu = userMenuItem.querySelector('.dropdown-menu');
    if (!toggleLink || !dropdownMenu) return;

    // Student info from sidebar
    const studentImg = document.querySelector('.sidebar .staffimage');
    const studentAvatarSrc = studentImg ? studentImg.src : 'assets/img/logo.png';
    const fullNameEl = document.querySelector('.sidebar-menu .side-piece span');
    const matricEl = document.querySelector('.sidebar-menu li:nth-child(3) span');
    const fullName = fullNameEl ? fullNameEl.textContent.trim() : 'Student';
    const matricNo = matricEl ? matricEl.textContent.trim() : '';

    const nameSpan = toggleLink.querySelector('span');
    const firstName = nameSpan ? nameSpan.textContent.replace(/[▾▼\s]/g, '').trim() : fullName.split(' ')[0];

    // Explicit User Chip with avatar and chevron
    toggleLink.innerHTML = `
      <img src="${studentAvatarSrc}" class="user-menu-avatar" alt="User avatar" onerror="this.src='assets/img/logo.png'" />
      <span class="user-menu-name">${firstName || 'Account'}</span>
      <i class="fa-solid fa-chevron-down user-menu-chevron" aria-hidden="true"></i>
    `;
    toggleLink.setAttribute('aria-haspopup', 'true');
    toggleLink.setAttribute('aria-expanded', 'false');

    // Dropdown user profile summary header
    if (!dropdownMenu.querySelector('.dropdown-user-summary')) {
      const summary = document.createElement('div');
      summary.className = 'dropdown-user-summary';
      summary.innerHTML = `
        <img src="${studentAvatarSrc}" alt="User photo" onerror="this.src='assets/img/logo.png'" />
        <div class="dropdown-user-details">
          <span class="dropdown-user-name">${escapeHtml(fullName)}</span>
          ${matricNo ? `<span class="dropdown-user-matric">${escapeHtml(matricNo)}</span>` : ''}
        </div>
      `;
      dropdownMenu.prepend(summary);
    }

    function toggleMenu(open) {
      const isCurrentlyOpen = userMenuItem.classList.contains('is-open');
      const shouldOpen = open !== undefined ? open : !isCurrentlyOpen;

      if (shouldOpen) {
        userMenuItem.classList.add('is-open', 'open');
        toggleLink.setAttribute('aria-expanded', 'true');
      } else {
        userMenuItem.classList.remove('is-open', 'open');
        toggleLink.setAttribute('aria-expanded', 'false');
      }
    }

    toggleLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    document.addEventListener('click', (e) => {
      if (!userMenuItem.contains(e.target)) {
        toggleMenu(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleMenu(false);
      }
    });
  }

  // -------------------------------------------------------------------------
  // 5. Sidebar Toggle & Offcanvas Behavior
  // -------------------------------------------------------------------------
  function setupSidebarInteractions() {
    const toggleBtn = document.querySelector('[data-toggle="offcanvas"]');
    const wrapper = document.querySelector('.wrapper');
    if (!toggleBtn || !wrapper) return;

    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    function toggleSidebar(e) {
      if (e) e.preventDefault();
      const isMobile = window.innerWidth <= 992;

      if (isMobile) {
        const isOpen = wrapper.classList.toggle('offcanvas-open');
        backdrop.classList.toggle('active', isOpen);
      } else {
        wrapper.classList.toggle('sidebar-collapsed');
      }
    }

    toggleBtn.addEventListener('click', toggleSidebar);
    backdrop.addEventListener('click', () => {
      wrapper.classList.remove('offcanvas-open');
      backdrop.classList.remove('active');
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 992) {
        wrapper.classList.remove('offcanvas-open');
        backdrop.classList.remove('active');
      }
    });

    enhanceSidebarProfile();
  }

  function enhanceSidebarProfile() {
    const sidebar = document.querySelector('aside.left-side .sidebar');
    if (!sidebar || sidebar.querySelector('.sidebar-user-card')) return;

    const userPanel = sidebar.querySelector('.user-panel');
    const img = sidebar.querySelector('.staffimage');
    const listItems = sidebar.querySelectorAll('.sidebar-menu li');

    let fullName = '';
    let matricNo = '';
    let level = '';
    let program = '';

    listItems.forEach((li) => {
      const text = li.textContent.trim();
      if (!fullName && text && !text.includes('Level') && !text.includes('Program') && !/\d{2}[A-Z]{2}/.test(text)) {
        fullName = text;
      } else if (/\d{2}[A-Z]{2}\d+/.test(text)) {
        matricNo = text;
      } else if (text.includes('Level')) {
        level = text;
      } else if (text.includes('Program')) {
        program = text.replace('Program -', '').trim();
      }
    });

    const profileCard = document.createElement('div');
    profileCard.className = 'sidebar-user-card';
    profileCard.innerHTML = `
      <img src="${img ? img.src : 'assets/img/logo.png'}" class="staffimage" alt="Student Profile Photo" onerror="this.src='assets/img/logo.png'" />
      <div class="sidebar-user-name">${escapeHtml(fullName || 'Student')}</div>
      ${matricNo ? `<div class="sidebar-matric-badge"><i class="fa-solid fa-id-card"></i> ${escapeHtml(matricNo)}</div>` : ''}
      <div class="sidebar-meta-badges">
        ${level ? `<span class="sidebar-meta-pill"><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(level)}</span>` : ''}
        ${program ? `<span class="sidebar-meta-pill"><i class="fa-solid fa-laptop-code"></i> ${escapeHtml(program)}</span>` : ''}
      </div>
    `;

    if (userPanel) userPanel.style.display = 'none';
    sidebar.prepend(profileCard);

    // Only configure default navigation links if sidebar menu only contained raw metadata
    const menu = sidebar.querySelector('.sidebar-menu');
    if (menu) {
      const isMetadataOnly = Array.from(menu.querySelectorAll('a')).every((a) => {
        const href = a.getAttribute('href');
        return !href || href === '#' || href === '';
      });

      if (isMetadataOnly) {
        const isDashboard = location.pathname.includes('studentdashboard');
        const isPasswordPage = location.pathname.includes('resetpword');

        menu.innerHTML = `
          <li class="${isDashboard ? 'active' : ''}">
            <a href="studentdashboard.php">
              <i class="fa-solid fa-table-cells-large"></i>
              <span class="sidebar-item-text">All Portals</span>
            </a>
          </li>
          <li class="${isPasswordPage ? 'active' : ''}">
            <a href="resetpword.php">
              <i class="fa-solid fa-key"></i>
              <span class="sidebar-item-text">Change Password</span>
            </a>
          </li>
          <li>
            <a href="logout.php" style="color: var(--color-critical);">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
              <span class="sidebar-item-text">Sign Out</span>
            </a>
          </li>
        `;
      }
    }
  }

  // -------------------------------------------------------------------------
  // Initialize Script
  // -------------------------------------------------------------------------
  function initPortalScript() {
    if (!isPortalPage()) return;

    setupSidebarInteractions();
    setupUserMenu();

    if (isAppsDashboardPage()) {
      setupDashboardHeroAndSearch();
      setupAppGrid();
      setupRedirectionHandler();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortalScript);
  } else {
    initPortalScript();
  }
})();
