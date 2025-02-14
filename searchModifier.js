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
      let selectionTimeout;
      
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getCurrentSelection') {
          sendResponse({
            selectedText: window.getSelection().toString().trim()
          });
        } else if (request.action === 'updateSearchPrefix') {
          this.prefix = request.prefix;
        }
        return true;
      });
  
      const handleSelection = () => {
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(() => {
          const selectedText = window.getSelection().toString().trim();
          if (selectedText) {
            chrome.runtime.sendMessage({
              action: 'updateContextMenu',
              text: selectedText
            });
          }
        }, 100);
      };
  
      ['selectionchange', 'contextmenu'].forEach(eventName => {
        document.addEventListener(eventName, handleSelection, true);
      });
    }
  }
  
  new SearchModifier();