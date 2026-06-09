const STORAGE_KEY = 'ds-theme';

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(saved || 'dark');

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    // Enable cross-fade transition for this toggle only
    document.documentElement.classList.add('theme-transitioning');
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 300);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
}
