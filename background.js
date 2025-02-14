const messages = {
  en: {
    copyProtectionToggle: "Copy Protection Bypass",
    searchWithPrefix: "Search \"%s\""
  },
  ko: {
    copyProtectionToggle: "복사 방지 해제",
    searchWithPrefix: "\"%s\" 검색하기"
  }
};

class BackgroundManager {
  constructor() {
    this.currentState = { isUnblocked: false };
    this.currentPrefix = '';
    this.setupListeners();
  }

  setupListeners() {
    chrome.storage.local.get(['isUnblocked', 'searchPrefix']).then(data => {
      this.currentState.isUnblocked = data.isUnblocked || false;
      this.currentPrefix = data.searchPrefix || '';
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'updateState') {
        this.currentState = request.state;
      } else if (request.action === 'updateSearchPrefix') {
        this.currentPrefix = request.prefix;
      }
      return true;
    });
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