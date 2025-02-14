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
    this.setupMenus();
    this.setupListeners();
  }

  setupMenus() {
    const createContextMenus = () => {
      const lang = (navigator.language || 'en').split('-')[0];
      const texts = messages[lang] || messages.en;

      chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
          id: "toggleUnblock",
          title: this.currentState.isUnblocked ? 
            texts.copyProtectionToggle + " ✓" : 
            texts.copyProtectionToggle,
          contexts: ["action"]
        });

        chrome.contextMenus.create({
          id: 'searchWithPrefix',
          title: texts.searchWithPrefix.replace('%s', ''),
          contexts: ['selection']
        });
      });
    };

    chrome.storage.local.get(['isUnblocked', 'searchPrefix']).then(data => {
      this.currentState.isUnblocked = data.isUnblocked || false;
      this.currentPrefix = data.searchPrefix || '';
      createContextMenus();
    });
  }

  setupListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'updateContextMenu':
          this.updateSearchMenu(request.text);
          break;
        case 'updateSearchPrefix':
          this.currentPrefix = request.prefix;
          this.updateSearchMenu(request.text);
          break;
        case 'toggleUnblock':
          this.toggleUnblockState(sender.tab);
          break;
      }
      return true;
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'searchWithPrefix') {
        const searchText = this.currentPrefix ? 
          `${this.currentPrefix} ${info.selectionText}` : 
          info.selectionText;
        
        chrome.tabs.create({ 
          url: `https://www.google.com/search?q=${encodeURIComponent(searchText)}`
        });
      } else if (info.menuItemId === "toggleUnblock") {
        this.toggleUnblockState(tab);
      }
    });
  }

  updateSearchMenu(selectedText) {
    if (!selectedText) return;
    const lang = (navigator.language || 'en').split('-')[0];
    const texts = messages[lang] || messages.en;
    
    const searchText = this.currentPrefix ? 
      `${this.currentPrefix} ${selectedText}` : 
      selectedText;
    
    chrome.contextMenus.update('searchWithPrefix', {
      title: texts.searchWithPrefix.replace('%s', searchText)
    });
  }

  async toggleUnblockState(tab) {
    this.currentState.isUnblocked = !this.currentState.isUnblocked;
    await chrome.storage.local.set({ isUnblocked: this.currentState.isUnblocked });
    
    const lang = (navigator.language || 'en').split('-')[0];
    const texts = messages[lang] || messages.en;
 
    chrome.contextMenus.update("toggleUnblock", {
      title: this.currentState.isUnblocked ? 
        texts.copyProtectionToggle + " ✓" : 
        texts.copyProtectionToggle
    });

    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: "toggleUnblock",
        state: this.currentState.isUnblocked
      });
    }
  }
}

new BackgroundManager();