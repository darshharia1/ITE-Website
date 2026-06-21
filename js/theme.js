/**
 * theme.js - Standalone Dark Mode Toggle Script
 * Ensures dark mode state is applied instantly on page load to prevent flashing white screens,
 * and safely binds the toggle events to both static and dynamically loaded navbar toggle buttons.
 */

(function () {
  const THEME_KEY = 'theme';
  const OLD_THEME_KEY = 'ite_theme';
  const DARK_CLASS = 'dark';

  // 1. Initial State Check (runs immediately to prevent flashing white screens)
  function initTheme() {
    // Check local storage (both the new 'theme' key and the old 'ite_theme' key for migration compatibility)
    const savedTheme = localStorage.getItem(THEME_KEY) || localStorage.getItem(OLD_THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine theme state (default to system preference if no saved setting)
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (isDark) {
      document.documentElement.classList.add(DARK_CLASS);
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(THEME_KEY, 'dark');
      localStorage.setItem(OLD_THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove(DARK_CLASS);
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem(THEME_KEY, 'light');
      localStorage.setItem(OLD_THEME_KEY, 'light');
    }
  }

  // Run instantly upon script load (which will be in <head> to prevent rendering flash)
  initTheme();

  // 2. Event Binding Helper (using event delegation for robustness against dynamic DOM changes)
  function bindToggleEvents() {
    // We attach a single listener on the document level. This catches clicks on any theme toggles
    // even if they are loaded dynamically, injected via JavaScript, or replaced during page transitions.
    document.addEventListener('click', function (event) {
      const toggleBtn = event.target.closest('#theme-toggle-app, .theme-toggle-btn');
      if (toggleBtn) {
        event.preventDefault();
        const html = document.documentElement;
        const isCurrentlyDark = html.classList.contains(DARK_CLASS);
        const newTheme = isCurrentlyDark ? 'light' : 'dark';
        
        if (newTheme === 'dark') {
          html.classList.add(DARK_CLASS);
          html.setAttribute('data-theme', 'dark');
        } else {
          html.classList.remove(DARK_CLASS);
          html.setAttribute('data-theme', 'light');
        }
        
        // Sync both localStorage keys
        localStorage.setItem(THEME_KEY, newTheme);
        localStorage.setItem(OLD_THEME_KEY, newTheme);
        
        // Also update any internal state of ITE.App if loaded
        if (window.ITE && window.ITE.App) {
          window.ITE.App.applyTheme(newTheme);
        }

        // Update display states of all theme icons in the DOM
        updateThemeIcons();
      }
    });
  }

  // Helper to synchronize visibility of sun and moon icons across the DOM
  function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains(DARK_CLASS);
    document.querySelectorAll('.sun-icon').forEach(el => {
      el.style.display = isDark ? 'none' : 'block';
    });
    document.querySelectorAll('.moon-icon').forEach(el => {
      el.style.display = isDark ? 'block' : 'none';
    });
  }

  // Bind events when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bindToggleEvents();
      updateThemeIcons();
    });
  } else {
    bindToggleEvents();
    updateThemeIcons();
  }

  // Expose ITE_Theme utility globally
  window.ITE_Theme = {
    init: initTheme,
    updateIcons: updateThemeIcons
  };
})();
