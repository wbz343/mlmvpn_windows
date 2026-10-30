(function () {
  const STORAGE_KEY = 'mv-language';
  const DEFAULT_LANG = 'zh';

  const TEXT = {
    zh: {
      '帮助': '帮助',
      '关于': '关于',
      '关闭菜单': '关闭菜单',
      '语言 / 切换语言': '语言 / 切换语言',
      '中文': '中文',
      'فارسی': 'فارسی',
      'English': 'English',
      '语言': '语言',
      '切换语言': '切换语言',
      '更改语言': '更改语言',
      '系统语言': '系统语言',
      '菜单': '菜单',
      '通知设置': '通知设置',
      '扫描设置': '扫描设置',
      '扫描历史': '扫描历史',
      '速度测试': '速度测试',
      '设置': '设置',
      '新建标签': '新建标签',
      '复制当前标签': '复制当前标签',
      '版本': '版本',
      '更新日志': '更新日志'
    },
    fa: {
      '帮助': 'راهنما',
      '关于': 'درباره ما',
      '关闭菜单': 'بستن منو',
      '语言 / 切换语言': 'زبان / تغییر زبان',
      '中文': 'چینی',
      'فارسی': 'فارسی',
      'English': 'انگلیسی',
      '语言': 'زبان',
      '切换语言': 'تغییر زبان',
      '更改语言': 'تغییر زبان',
      '系统语言': 'زبان سیستم',
      '菜单': 'منو',
      '通知设置': 'تنظیمات نوتیفیکیشن',
      '扫描设置': 'تنظیمات اسکن',
      '扫描历史': 'تاریخچه اسکن‌ها',
      '速度测试': 'تست سرعت',
      '设置': 'تنظیمات',
      '新建标签': 'تب جدید',
      '复制当前标签': 'کپی تب فعلی',
      '版本': 'نسخه',
      '更新日志': 'لیست تغییرات'
    }
  };

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

  function normalizeLang(value) {
    if (value === 'zh' || value === 'fa') return value;
    return DEFAULT_LANG;
  }

  function getLanguage() {
    return normalizeLang(safeGetItem(STORAGE_KEY, DEFAULT_LANG));
  }

  function setLanguage(nextLang) {
    const lang = normalizeLang(nextLang);
    safeSetItem(STORAGE_KEY, lang);
    applyLanguageState();
    installLanguagePicker();
  }

  function applyLanguageState() {
    const lang = getLanguage();
    const html = document.documentElement;
    html.lang = lang === 'zh' ? 'zh-CN' : 'fa';
    html.setAttribute('dir', 'rtl');
    html.setAttribute('data-mv-lang', lang);

    const map = TEXT[lang] || TEXT.zh;
    const textNodes = [];
    const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT, null);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const t = n.nodeValue || '';
      if (!t.trim()) continue;
      if (map[t.trim()]) textNodes.push({ node: n, oldValue: t.trim(), newValue: map[t.trim()] });
    }
    textNodes.forEach(({ node, oldValue, newValue }) => {
      node.nodeValue = (node.nodeValue || '').replace(oldValue, newValue);
    });

    document.querySelectorAll('[data-mv-i18n]').forEach((el) => {
      const key = el.getAttribute('data-mv-i18n');
      if (key && map[key]) {
        el.textContent = map[key];
      }
    });
  }

  function installLanguagePicker() {
    const menu = document.getElementById('main-menu');
    if (!menu) return;

    let btn = menu.querySelector('[data-mv-language-toggle]');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-mv-language-toggle', '1');
      btn.className = 'w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gs-text hover:bg-gs-bg hover:text-gs-primary rounded-lg transition-colors text-right';
      btn.innerHTML = '<i class="ph-bold ph-translate text-lg"></i><div class="flex flex-col"><span class="font-bold">语言 / 切换语言</span><span class="text-[10px] text-gs-muted">中文 / فارسی / English</span></div>';
      btn.onclick = function () {
        const next = getLanguage() === 'zh' ? 'fa' : 'zh';
        setLanguage(next);
      };
      const closeBtn = menu.querySelector('button[onclick*="toggleMainMenu"]');
      if (closeBtn) {
        closeBtn.parentNode.insertBefore(btn, closeBtn);
      } else {
        menu.appendChild(btn);
      }
    }

    const label = btn.querySelector('.font-bold');
    if (label) {
      label.textContent = getLanguage() === 'zh' ? '语言 / 切换语言' : 'زبان / تغییر زبان';
    }
    const sub = btn.querySelector('.text-gs-muted');
    if (sub) {
      sub.textContent = getLanguage() === 'zh' ? '中文 / فارسی / English' : 'چینی / فارسی / English';
    }
  }

  function boot() {
    const lang = getLanguage();
    safeSetItem(STORAGE_KEY, lang);
    applyLanguageState();
    installLanguagePicker();
    window.mvSetLanguage = setLanguage;
    window.mvGetLanguage = getLanguage;
    window.mvToggleLanguage = function () {
      setLanguage(getLanguage() === 'zh' ? 'fa' : 'zh');
    };
  }

  window.mvSetLanguage = setLanguage;
  window.mvGetLanguage = getLanguage;
  window.mvToggleLanguage = function () {
    setLanguage(getLanguage() === 'zh' ? 'fa' : 'zh');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  const observer = new MutationObserver(function () {
    if (document.body) {
      applyLanguageState();
      installLanguagePicker();
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
})();
