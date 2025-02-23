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
    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
          id: "searchWithPrefix",
          title: chrome.i18n.getMessage("searchWithPrefixTitle") || "Search with prefix",
          contexts: ["selection"]
        }, () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        });
      });
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === "searchWithPrefix") {
        let selectedText = info.selectionText;
        let prefix = this.currentPrefix || "";
        let query = prefix ? `${prefix} ${selectedText}` : selectedText;
        chrome.tabs.create({ url: "https://www.google.com/search?q=" + encodeURIComponent(query) });
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
    // 지정된 접두어와 "%s" 자리표시자를 포함하여 context 메뉴 제목을 구성한 후,
    // 기존의 메뉴 항목을 제거하고 새로 생성하여 항상 최신 제목이 표시되도록 합니다.
    const prefix = this.currentPrefix ? this.currentPrefix + " " : "";
    const titleTemplate = chrome.i18n.getMessage("searchWithPrefixTitle") || "Search";
    const finalTitle = `${titleTemplate}: ${prefix}%s`;
    chrome.contextMenus.remove("searchWithPrefix", () => {
      chrome.contextMenus.create({
        id: "searchWithPrefix",
        title: finalTitle,
        contexts: ["selection"]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Creation error:", chrome.runtime.lastError.message);
        }
      });
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