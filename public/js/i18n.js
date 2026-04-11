// Internationalization module
const i18n = {
  currentLang: 'en',
  translations: {},

  async loadLanguage(lang) {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) throw new Error('Failed to load language file');
      this.translations = await response.json();
      this.currentLang = lang;
      localStorage.setItem('selectedLanguage', lang);
      this.updatePageTranslations();
    } catch (error) {
      console.error('Error loading language:', error);
    }
  },

  t(key) {
    const keys = key.split('.');
    let value = this.translations;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    return value || key;
  },

  updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });
  },

  async init() {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    await this.loadLanguage(savedLang);
  }
};

// Export for use in other scripts
window.i18n = i18n;
