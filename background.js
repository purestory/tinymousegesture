import { messages } from './i18n/messages.js';
import { getMessage } from './i18n/messages.js';

class BackgroundManager {
  constructor() {
    this.currentState = { isUnblocked: false };
    this.currentPrefix = '';
    this.setupListeners();
    this.setupContextMenus();
    this.setupMessageListeners();
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

  setupContextMenus() {
    chrome.contextMenus.create({
      id: 'searchWithPrefix',
      title: '"%s" 검색하기',
      contexts: ['selection']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'searchWithPrefix') {
        this.handlePrefixSearch(info.selectionText);
      }
    });
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getSelectedText') {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'getCurrentSelection' }, 
          response => {
            if (response && response.selectedText) {
              this.handlePrefixSearch(response.selectedText);
            }
          }
        );
      }
      return true;
    });
  }

  async handlePrefixSearch(text) {
    try {
      const { searchPrefix } = await chrome.storage.local.get('searchPrefix');
      const prefix = searchPrefix || '';
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(prefix + ' ' + text)}`;
      chrome.tabs.create({ url: searchUrl });
    } catch (error) {
      console.error('검색 처리 오류:', error);
    }
  }

  updateContextMenu() {
    chrome.contextMenus.update('searchWithPrefix', {
      title: getMessage('searchWithPrefix').replace('%s', this.currentPrefix ? `${this.currentPrefix} "%s"` : '"%s"')
    }, () => {
      if (chrome.runtime.lastError) {
        this.setupContextMenus();
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