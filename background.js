const messages = {
  en: {
    copyProtectionToggle: "Copy Protection Bypass",
    searchWithPrefix: "Search \"%s\"",
    searchPrefixPlaceholder: "검색어"
  },
  ko: {
    copyProtectionToggle: "복사 방지 해제",
    searchWithPrefix: "\"%s\" 검색하기"
  },
  ja: {
    copyProtectionToggle: "コピー保護解除",
    searchWithPrefix: "\"%s\"を検索"
  }
  // 다른 언어들도 동일하게 추가
};

class BackgroundManager {
  constructor() {
    this.currentState = { isUnblocked: false };
    this.currentPrefix = '';
    this.setupListeners();
    this.setupContextMenu();
  }

  setupListeners() {
    chrome.storage.local.get(['isUnblocked', 'searchPrefix']).then(data => {
      this.currentState.isUnblocked = data.isUnblocked || false;
      this.currentPrefix = data.searchPrefix || '';
      this.updateContextMenu();
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'updateState') {
        this.currentState = request.state;
      } else if (request.action === 'updateSearchPrefix') {
        this.currentPrefix = request.prefix;
        this.updateContextMenu();
      }
      return true;
    });
  }

  setupContextMenu() {
    chrome.contextMenus.create({
      id: 'searchWithPrefix',
      title: `${this.currentPrefix || '접두어'} "%s" 검색하기`,
      contexts: ['selection']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'searchWithPrefix' && info.selectionText) {
        const searchText = info.selectionText.trim();
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(this.currentPrefix + ' ' + searchText)}`;
        chrome.tabs.create({ url: searchUrl });
      }
    });
  }

  updateContextMenu() {
    const lang = (navigator.language || 'en').split('-')[0];
    const texts = messages[lang] || messages.en;
    
    const menuTitle = this.currentPrefix ? 
      `${this.currentPrefix} "%s" ${texts.searchWithPrefix}` :
      `"%s" ${texts.searchWithPrefix}`;
    
    chrome.contextMenus.update('searchWithPrefix', { title: menuTitle });
  }

  async toggleUnblockState(tab) {
    this.currentState.isUnblocked = !this.currentState.isUnblocked;
    await chrome.storage.local.set({ isUnblocked: this.currentState.isUnblocked });
    
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: "toggleUnblock",
        state: this.currentState.isUnblocked
      });
    }
  }
}

new BackgroundManager();