import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Stored preferences with fallbacks
const initialTheme = browser && localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light';
const initialLang = browser && localStorage.getItem('lang') ? localStorage.getItem('lang') : 'en';
const initialFontSize = browser && localStorage.getItem('font_size') ? localStorage.getItem('font_size') : 'normal';

let initialA11y = { reduceMotion: false, highContrast: false };
if (browser && localStorage.getItem('a11y_prefs')) {
  try {
    initialA11y = JSON.parse(localStorage.getItem('a11y_prefs'));
  } catch (e) {}
}

export const themeStore = writable(initialTheme);
export const langStore = writable(initialLang);
export const fontSizeStore = writable(initialFontSize);
export const accessibilityStore = writable(initialA11y);

function applyTheme(themeValue) {
  if (!browser) return;
  
  let isDark = false;
  if (themeValue === 'dark') {
    isDark = true;
  } else if (themeValue === 'system') {
    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isDark = false;
  }

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function applyFontSize(size) {
  if (!browser) return;
  if (size === 'compact') {
    document.documentElement.style.fontSize = '17px';
  } else if (size === 'large') {
    document.documentElement.style.fontSize = '23px';
  } else {
    document.documentElement.style.fontSize = '20px';
  }
}

function applyA11y(prefs) {
  if (!browser) return;
  if (prefs?.reduceMotion) {
    document.documentElement.classList.add('reduce-motion');
  } else {
    document.documentElement.classList.remove('reduce-motion');
  }

  if (prefs?.highContrast) {
    document.documentElement.classList.add('high-contrast');
  } else {
    document.documentElement.classList.remove('high-contrast');
  }
}

if (browser) {
  // Apply initial states
  applyTheme(initialTheme);
  applyFontSize(initialFontSize);
  applyA11y(initialA11y);

  // Subscribe to Theme changes
  themeStore.subscribe((val) => {
    localStorage.setItem('theme', val);
    applyTheme(val);
  });

  // System color scheme change listener for when in 'system' mode
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      let currentVal = 'light';
      themeStore.subscribe(v => currentVal = v)();
      if (currentVal === 'system') {
        applyTheme('system');
      }
    });
  }

  // Language store persistence
  langStore.subscribe((val) => {
    localStorage.setItem('lang', val);
  });

  // Font size store persistence
  fontSizeStore.subscribe((val) => {
    localStorage.setItem('font_size', val);
    applyFontSize(val);
  });

  // Accessibility store persistence
  accessibilityStore.subscribe((val) => {
    localStorage.setItem('a11y_prefs', JSON.stringify(val));
    applyA11y(val);
  });
}
