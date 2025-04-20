import { messages } from './i18n/messages.js';
import { getMessage } from './i18n/messages.js';

class BackgroundManager {
  constructor() {
    this.currentState = { isUnblocked: false };
    this.currentPrefix = '';
    this.setupListeners();
    chrome.contextMenus.removeAll(() => { // 기존 메뉴 제거 후 재생성 보장
      this.setupContextMenus();
    });
    this.setupMessageListeners();
    this.updateIcon(this.currentState.isUnblocked); // 초기 아이콘 설정
  }

  updateIcon(isActive) {
    const iconPaths = isActive
      ? {
          "16": "icons/icon_active_16.png",
          "48": "icons/icon_active_48.png",
          "128": "icons/icon_active_128.png"
        }
      : {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png"
        };
    chrome.action.setIcon({ path: iconPaths });
  }

  setupListeners() {
    chrome.storage.local.get(['searchPrefix']).then(data => {
      this.currentPrefix = data.searchPrefix || '';
      this.updateContextMenu(); // 메뉴 생성 후 업데이트 호출
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'updateState') {
        console.warn("Received deprecated 'updateState' message.");
      } else if (request.action === 'updateSearchPrefix') {
        this.currentPrefix = request.prefix;
        this.updateContextMenu();
      } else if (request.action === 'toggleUnblock') {
        this.toggleUnblockState(sender.tab);
        sendResponse({newState: this.currentState.isUnblocked});
      } else if (request.action === 'getUnblockState') {
        sendResponse({ isUnblocked: this.currentState.isUnblocked });
      } else if (request.action === 'updateSkipTime') {
        chrome.storage.local.set({ youtubeSkipTime: request.skipTime });
        sendResponse({status: "ok"});
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
      id: 'searchParent',
      title: getMessage('searchContextMenuTitle'),
      contexts: ['selection']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Parent context menu creation failed: ", chrome.runtime.lastError.message);
        return;
      }
      chrome.contextMenus.create({
        id: 'searchWithPrefix',
        title: getMessage('searchWithPrefixDefaultLabel', '%s'),
        contexts: ['selection'],
        parentId: 'searchParent'
      }, () => {
          if (chrome.runtime.lastError) {
            console.error("searchWithPrefix context menu creation failed: ", chrome.runtime.lastError.message);
          } else {
              this.updateContextMenu();
          }
      });

      chrome.contextMenus.create({
        id: 'searchSubtitleCat',
        title: getMessage('searchOnSubtitleCat', '%s'),
        contexts: ['selection'],
        parentId: 'searchParent'
      }, () => {
          if (chrome.runtime.lastError) {
              console.error("searchSubtitleCat context menu creation failed: ", chrome.runtime.lastError.message);
          }
      });

      chrome.contextMenus.create({
        id: 'searchGoogleRemove',
        title: getMessage('searchGoogleRemoveLabel', '%s'),
        contexts: ['selection'],
        parentId: 'searchParent'
      }, () => {
          if (chrome.runtime.lastError) {
              console.error("searchGoogleRemove context menu creation failed: ", chrome.runtime.lastError.message);
          }
      });
    });

    if (!chrome.contextMenus.onClicked.hasListener(this.handleContextMenuClick)) {
        chrome.contextMenus.onClicked.addListener(this.handleContextMenuClick.bind(this));
    }
  }

  handleContextMenuClick(info, tab) {
    if (!info.selectionText) return;

    if (info.menuItemId === 'searchWithPrefix') {
      this.handlePrefixSearch(info.selectionText);
    } else if (info.menuItemId === 'searchSubtitleCat') {
      const searchUrl = `https://www.subtitlecat.com/index.php?search=${encodeURIComponent(info.selectionText)}`;
      chrome.tabs.create({ url: searchUrl });
    } else if (info.menuItemId === 'searchGoogleRemove') {
      const searchQuery = `uncensored ${info.selectionText}`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      chrome.tabs.create({ url: searchUrl });
    }
  }

  setupMessageListeners() {
  }

  async handlePrefixSearch(text) {
    try {
      const data = await chrome.storage.local.get('searchPrefix');
      const prefix = data.searchPrefix || '';
      const query = prefix ? `${prefix} ${text}` : text;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      chrome.tabs.create({ url: searchUrl });
    } catch (error) {
      console.error('검색 처리 오류:', error);
    }
  }

  updateContextMenu() {
    chrome.storage.local.get('searchPrefix', (data) => {
        const prefix = data.searchPrefix || '';
        let title;
        if (prefix) {
            title = getMessage('searchWithPrefixLabel', [prefix, '"%s"']);
        } else {
            title = getMessage('searchWithPrefixDefaultLabel', '"%s"');
        }

        chrome.contextMenus.update('searchWithPrefix', {
            title: title
        }, () => {
            if (chrome.runtime.lastError) {
                 console.warn("컨텍스트 메뉴 업데이트 실패(searchWithPrefix):", chrome.runtime.lastError.message);
            }
        });

         chrome.contextMenus.update('searchSubtitleCat', {
            title: getMessage('searchOnSubtitleCat', '"%s"')
        }, () => {
            if (chrome.runtime.lastError) {
                 console.warn("컨텍스트 메뉴 업데이트 실패(searchSubtitleCat):", chrome.runtime.lastError.message);
            }
        });

        chrome.contextMenus.update('searchGoogleRemove', {
           title: getMessage('searchGoogleRemoveLabel', '"%s"')
        }, () => {
           if (chrome.runtime.lastError) {
                console.warn("컨텍스트 메뉴 업데이트 실패(searchGoogleRemove):", chrome.runtime.lastError.message);
           }
        });
    });
  }

  async toggleUnblockState(tab) {
    try {
      this.currentState.isUnblocked = !this.currentState.isUnblocked;
      this.updateIcon(this.currentState.isUnblocked);

      let targetTabId = tab?.id;
      if (!targetTabId) {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          targetTabId = activeTab?.id;
      }

      if (targetTabId) {
         console.log(`Sending toggleUnblock to tab ${targetTabId}, state: ${this.currentState.isUnblocked}`);
        await chrome.tabs.sendMessage(targetTabId, {
          action: "updateUnblockState",
          state: this.currentState.isUnblocked
        }).catch(error => {
          console.warn(`Failed to send updateUnblockState message to tab ${targetTabId}: ${error.message}`);
        });
      } else {
           console.log("No active tab found to send toggleUnblock message.");
      }

      chrome.runtime.sendMessage({
          action: "updatePopupState",
          isUnblocked: this.currentState.isUnblocked
      }).catch(err => { /* 팝업 닫힘 */ });

    } catch (error) {
      console.error('토글 상태 변경 오류:', error);
      this.currentState.isUnblocked = !this.currentState.isUnblocked;
      this.updateIcon(this.currentState.isUnblocked);
    }
  }
}

new BackgroundManager();