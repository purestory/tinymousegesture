import { messages } from './i18n/messages.js';

class SearchModifier {
    constructor() {
      this.prefix = '';
      this.initialize();
    }
  
    async initialize() {
      try {
        const data = await chrome.storage.local.get('searchPrefix');
        this.prefix = data.searchPrefix || '';
        this.setupMessageListener();
      } catch (error) {
        console.error('검색 접두어 초기화 오류:', error);
      }
    }
  
    setupMessageListener() {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'updateSearchPrefix') {
          this.prefix = request.prefix;
        } else if (request.action === 'getCurrentSelection') {
          sendResponse({ selectedText: window.getSelection().toString().trim() });
        }
        return true;
      });
    }
}

new SearchModifier();