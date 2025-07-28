class I18nManager {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.initialize();
  }

  detectLanguage() {
    const supportedLangs = ['en', 'ko', 'ja', 'zh-CN', 'zh-TW'];
    const browserLang = (navigator.language || navigator.userLanguage).toLowerCase();
    const baseLang = browserLang.split('-')[0];
    
    // 완전 일치 확인
    if (supportedLangs.includes(browserLang)) {
      return browserLang;
    }
    
    // 기본 언어 확인
    if (supportedLangs.includes(baseLang)) {
      return baseLang;
    }
    
    return 'en'; // 기본값
  }

  initialize() {
    this.updatePageTexts();
    this.observeDOM();
  }

  updatePageTexts() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.getMessage(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.getMessage(key);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.getMessage(key);
    });
  }

  getMessage(key) {
    try {
      const messages = this.getMessages();
      return messages[this.currentLang][key] || messages['en'][key] || key;
    } catch (error) {
      console.error('다국어 처리 오류:', error);
      return key;
    }
  }

  observeDOM() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          this.updatePageTexts();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// 전역 인스턴스 생성
window.i18n = new I18nManager(); 