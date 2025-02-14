class BackgroundManager {
  constructor() {
    this.currentState = { isUnblocked: false };
    this.currentPrefix = '';
    this.setupMenus();
    this.setupListeners();
  }

  setupMenus() {
    const createContextMenus = () => {
      chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
          id: "toggleUnblock",
          title: this.currentState.isUnblocked ? "복사 방지 해제 ✓" : "복사 방지 해제",
          contexts: ["action"]
        });

        chrome.contextMenus.create({
          id: 'searchWithPrefix',
          title: '"%s" 검색하기',
          contexts: ['selection']
        });
      });
    };

    chrome.storage.local.get(['isUnblocked', 'searchPrefix'], (data) => {
      this.currentState.isUnblocked = data.isUnblocked || false;
      this.currentPrefix = data.searchPrefix || '';
      createContextMenus();
    });

    chrome.runtime.onInstalled.addListener(() => {
      chrome.storage.local.get(['isUnblocked', 'searchPrefix'], (data) => {
        this.currentState.isUnblocked = data.isUnblocked || false;
        this.currentPrefix = data.searchPrefix || '';
        createContextMenus();
      });
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
    const searchText = this.currentPrefix ? 
      `${this.currentPrefix} ${selectedText}` : 
      selectedText;
    
    chrome.contextMenus.update('searchWithPrefix', {
      title: `"${searchText}" 검색하기`
    });
  }

  async toggleUnblockState(tab) {
    this.currentState.isUnblocked = !this.currentState.isUnblocked;
    await chrome.storage.local.set({ isUnblocked: this.currentState.isUnblocked });
    
    chrome.contextMenus.update("toggleUnblock", {
      title: this.currentState.isUnblocked ? "복사 방지 해제 ✓" : "복사 방지 해제"
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