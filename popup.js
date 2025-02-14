class PopupManager {
  constructor() {
    this.toggleSwitch = document.getElementById('toggleSwitch');
    this.searchPrefix = document.getElementById('searchPrefix');
    this.saveButton = document.getElementById('saveButton');
    this.POPUP_CLOSE_DELAY = 500;
    this.initialize();
  }

  async initialize() {
    try {
      const data = await chrome.storage.local.get(['isUnblocked', 'searchPrefix']);
      this.toggleSwitch.checked = data.isUnblocked;
      this.searchPrefix.value = data.searchPrefix || '';
      this.lastSavedPrefix = data.searchPrefix || '';
      
      const lang = (navigator.language || navigator.userLanguage).split('-')[0];
      const texts = window.messages[lang] || window.messages.en;
      
      document.getElementById('copyProtectionText').textContent = texts.copyProtectionToggle;
      this.searchPrefix.placeholder = texts.searchPrefixPlaceholder;
      this.saveButton.textContent = texts.saveButton;
      
      this.saveButton.disabled = true;
      this.setupEventListeners();
    } catch (error) {
      console.error('초기화 오류:', error);
    }
  }

  setupEventListeners() {
    this.toggleSwitch.addEventListener('change', this.handleToggleChange.bind(this));
    this.searchPrefix.addEventListener('input', this.handlePrefixInput.bind(this));
    this.saveButton.addEventListener('click', this.handlePrefixSave.bind(this));
  }

  handlePrefixInput(e) {
    const currentValue = e.target.value.trim();
    const shouldEnable = currentValue && currentValue !== this.lastSavedPrefix;
    this.saveButton.disabled = !shouldEnable;
    
    if (shouldEnable) {
      this.saveButton.style.background = '#4285f4';
      this.saveButton.style.cursor = 'pointer';
    } else {
      this.saveButton.style.background = '#cccccc';
      this.saveButton.style.cursor = 'not-allowed';
    }
  }

  async handlePrefixSave() {
    const prefix = this.searchPrefix.value.trim();
    if (!prefix) return;
    
    this.saveButton.disabled = true;
    this.saveButton.style.background = '#cccccc';
    this.saveButton.style.cursor = 'not-allowed';
    
    try {
      await chrome.storage.local.set({ searchPrefix: prefix });
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'getCurrentSelection'
        });
        
        await chrome.runtime.sendMessage({
          action: 'updateSearchPrefix',
          prefix: prefix,
          text: response?.selectedText || ''
        });
      }
      this.lastSavedPrefix = prefix;
      setTimeout(() => window.close(), this.POPUP_CLOSE_DELAY);
    } catch (error) {
      console.error('접두어 저장 오류:', error);
      this.saveButton.disabled = false;
      this.saveButton.style.background = '#4285f4';
      this.saveButton.style.cursor = 'pointer';
    }
  }

  async handleToggleChange(e) {
    const newState = e.target.checked;
    try {
      await chrome.storage.local.set({ isUnblocked: newState });
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await new Promise((resolve) => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'toggleUnblock',
            state: newState
          }, resolve);
        });
      }
      window.close();
    } catch (error) {
      console.error('상태 변경 오류:', error);
      e.target.checked = !newState;
    }
  }
}

new PopupManager();