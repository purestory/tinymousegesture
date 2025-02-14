class I18nManager {
  constructor() {
    this.initialize();
  }

  initialize() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = chrome.i18n.getMessage(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = chrome.i18n.getMessage(key);
    });
  }
}

new I18nManager(); 