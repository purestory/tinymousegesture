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
  
      chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'updateSearchPrefix') {
          this.prefix = request.prefix;
        }
        return true;
      });
    }
  }
  
  new SearchModifier();