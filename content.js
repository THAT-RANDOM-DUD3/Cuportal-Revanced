/**
 * Cuportal Revanced - Content Script
 * Injected into Covenant University Portal pages
 * Handles theme persistence, dark mode toggle, and login interaction enhancements
 */

(function () {
  'use strict';

  // 1. Initialize Dark / Light Theme
  const savedTheme = localStorage.getItem('cuportal_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);

  // 2. Setup Floating Theme Switcher with High-Contrast SVGs
  const moonSvg = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#a855f7" stroke="#7e22ce" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
      <circle cx="19" cy="5" r="1.2" fill="#eab308" stroke="none"></circle>
      <circle cx="16" cy="2" r="0.9" fill="#eab308" stroke="none"></circle>
    </svg>
  `;

  const sunSvg = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  `;

  function setupThemeToggle() {
    let toggleBtn = document.getElementById('themeToggle');
    let toggleIcon = document.getElementById('themeToggleIcon');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (!toggleBtn) {
      const aside = document.createElement('aside');
      aside.className = 'theme-toggle-wrap';
      aside.innerHTML = `
        <button type="button" class="theme-toggle-btn" id="themeToggle" 
          aria-label="Toggle dark mode" 
          title="${isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}">
          <span class="theme-toggle-icon" id="themeToggleIcon">
            ${isDark ? sunSvg : moonSvg}
          </span>
        </button>
      `;
      document.body.appendChild(aside);
      toggleBtn = document.getElementById('themeToggle');
      toggleIcon = document.getElementById('themeToggleIcon');
    } else if (toggleIcon) {
      toggleIcon.innerHTML = isDark ? sunSvg : moonSvg;
    }

    if (toggleBtn) {
      toggleBtn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      toggleBtn.onclick = () => {
        const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const nextTheme = currentlyDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('cuportal_theme', nextTheme);
        if (toggleIcon) {
          toggleIcon.innerHTML = nextTheme === 'dark' ? sunSvg : moonSvg;
        }
        toggleBtn.title = nextTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      };
    }
  }

  // 3. Login Page Interactions (Dynamic Button & Password Toggle)
  function setupLoginEnhancements() {
    const useridInput = document.getElementById('userid');
    const passwordInput = document.getElementById('inputpassword1');
    const signinBtn = document.getElementById('signin');

    if (!useridInput || !passwordInput || !signinBtn) return;

    // Apply extension background image if running in extension environment
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      const bgUrl = chrome.runtime.getURL('assets/img/CU6.jpg');
      document.body.style.backgroundImage = `url("${bgUrl}")`;
    }

    // Dynamic sign-in button active state
    function updateButtonState() {
      const hasUser = useridInput.value.trim().length > 0;
      const hasPass = passwordInput.value.length > 0;
      const isReady = hasUser || hasPass;

      if (isReady) {
        signinBtn.disabled = false;
        signinBtn.classList.add('btn-active');
      } else {
        signinBtn.disabled = true;
        signinBtn.classList.remove('btn-active');
      }
    }

    useridInput.addEventListener('input', updateButtonState);
    passwordInput.addEventListener('input', updateButtonState);
    updateButtonState();

    // Password Visibility Toggle
    let toggleBtn = document.getElementById('togglePassword');
    if (!toggleBtn) {
      const inputContainer = passwordInput.parentElement;
      if (inputContainer) {
        toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle';
        toggleBtn.id = 'togglePassword';
        toggleBtn.setAttribute('aria-label', 'Toggle password visibility');
        toggleBtn.innerHTML = '<i class="fa-regular fa-eye" id="togglePasswordIcon"></i>';
        inputContainer.appendChild(toggleBtn);
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        const icon = document.getElementById('togglePasswordIcon');
        if (icon) {
          icon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        }
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupThemeToggle();
      setupLoginEnhancements();
    });
  } else {
    setupThemeToggle();
    setupLoginEnhancements();
  }
})();
