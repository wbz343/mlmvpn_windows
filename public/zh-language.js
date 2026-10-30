(function () {
  const STORAGE_KEY = 'mv-language';

  function safeGetItem(name, fallback) {
    try {
      const raw = window.localStorage ? window.localStorage.getItem(name) : null;
      return raw == null ? fallback : raw;
    } catch (e) {
      return fallback;
    }
  }

  function safeSetItem(name, value) {
    try {
      if (window.localStorage) window.localStorage.setItem(name, value);
    } catch (e) {
      // Ignore storage restrictions.
    }
  }

  function markLanguage() {
    const cur = safeGetItem(STORAGE_KEY, 'auto');
    if (!cur || cur === 'auto') {
      safeSetItem(STORAGE_KEY, 'zh');
    }

    const lang = safeGetItem(STORAGE_KEY, 'zh');
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'fa';
    document.documentElement.setAttribute('data-mv-lang', lang);

    if (lang === 'zh') {
      document.documentElement.setAttribute('dir', 'rtl');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markLanguage, { once: true });
  } else {
    markLanguage();
  }
})();
