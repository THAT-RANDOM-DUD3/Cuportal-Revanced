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

  // 2. Setup Floating Theme Switcher
  function setupThemeToggle() {
    if (document.getElementById('themeToggle')) return;

    const aside = document.createElement('aside');
    aside.className = 'theme-toggle-wrap';
    aside.innerHTML = `
      <button type="button" class="theme-toggle-btn" id="themeToggle" aria-label="Toggle dark mode" title="Toggle Dark / Light Mode">
        <i class="${document.documentElement.getAttribute('data-theme') === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}" id="themeToggleIcon"></i>
      </button>
    `;
    document.body.appendChild(aside);

    const toggleBtn = document.getElementById('themeToggle');
    const toggleIcon = document.getElementById('themeToggleIcon');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const nextTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('cuportal_theme', nextTheme);
        if (toggleIcon) {
          toggleIcon.className = nextTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
      });
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
