class PopupManager {
  constructor() {
    this.toggleSwitch = document.getElementById('toggleProtection');
    this.searchPrefix = document.getElementById('searchPrefix');
    this.saveButton = document.getElementById('savePrefix');
    this.POPUP_CLOSE_DELAY = 500;
    this.initialize();
  }

  async initialize() {
    try {
      const data = await chrome.storage.local.get(['isUnblocked', 'searchPrefix']);
      this.toggleSwitch.checked = data.isUnblocked;
      this.searchPrefix.value = data.searchPrefix || '';
      this.lastSavedPrefix = data.searchPrefix || '';
      
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
    this.saveButton.disabled = !currentValue || currentValue === this.lastSavedPrefix;
  }

  async handlePrefixSave() {
    const prefix = this.searchPrefix.value.trim();
    if (!prefix) return;
    
    this.saveButton.disabled = true;
    
    try {
      await chrome.storage.local.set({ searchPrefix: prefix });
      chrome.runtime.sendMessage({
        action: 'updateSearchPrefix',
        prefix: prefix
      });
      this.lastSavedPrefix = prefix;
      setTimeout(() => window.close(), this.POPUP_CLOSE_DELAY);
    } catch (error) {
      console.error('접두어 저장 오류:', error);
      this.saveButton.disabled = false;
    }
  }

  async handleToggleChange(e) {
    const newState = e.target.checked;
    try {
      await chrome.storage.local.set({ isUnblocked: newState });
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'toggleUnblock',
          state: newState
        });
      }
      setTimeout(() => window.close(), this.POPUP_CLOSE_DELAY);
    } catch (error) {
      console.error('상태 변경 오류:', error);
      e.target.checked = !newState;
    }
  }
}

new PopupManager();