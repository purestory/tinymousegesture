import { messages } from './i18n/messages.js';

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

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.searchPrefix) {
        this.currentPrefix = changes.searchPrefix.newValue;
        this.updateContextMenu();
      }
    });
  }

  setupContextMenu() {
    const lang = (navigator.language || 'en').split('-')[0];
    const texts = messages[lang] || messages.en;
    
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'searchWithPrefix',
        title: this.currentPrefix 
          ? `${this.currentPrefix} "%s" 검색` 
          : `"%s" 검색`,
        contexts: ['selection']
      });
    });

    // 기존 리스너 제거
    if (this.contextMenuListener) {
      chrome.contextMenus.onClicked.removeListener(this.contextMenuListener);
    }

    // 새로운 리스너 등록
    this.contextMenuListener = (info, tab) => {
      if (info.menuItemId === 'searchWithPrefix' && info.selectionText) {
        const searchText = info.selectionText.trim();
        const prefix = this.currentPrefix ? this.currentPrefix + ' ' : '';
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(prefix + searchText)}`;
        chrome.tabs.create({ url: searchUrl });
      }
    };

    chrome.contextMenus.onClicked.addListener(this.contextMenuListener);
  }

  updateContextMenu() {
    chrome.contextMenus.update('searchWithPrefix', {
      title: this.currentPrefix 
        ? `${this.currentPrefix} "%s" 검색` 
        : `"%s" 검색`
    }, () => {
      if (chrome.runtime.lastError) {
        this.setupContextMenu();
      }
    });
  }

  async toggleUnblockState(tab) {
    try {
      this.currentState.isUnblocked = !this.currentState.isUnblocked;
      await chrome.storage.local.set({ isUnblocked: this.currentState.isUnblocked });
      
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, {
          action: "toggleUnblock",
          state: this.currentState.isUnblocked
        });
      }
    } catch (error) {
      console.error('토글 상태 변경 오류:', error);
      this.currentState.isUnblocked = !this.currentState.isUnblocked;
    }
  }
}

// 클래스 초기화
new BackgroundManager();