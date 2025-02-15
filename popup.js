import { messages } from './i18n/messages.js';

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
      if (!chrome.runtime?.id) {
        console.error('확장프로그램 컨텍스트를 찾을 수 없습니다.');
        return;
      }

      const data = await chrome.storage.local.get(['isUnblocked', 'searchPrefix', 'youtubeSkipTime']);
      this.toggleSwitch.checked = data.isUnblocked;
      this.searchPrefix.value = data.searchPrefix || '';
      this.lastSavedPrefix = data.searchPrefix || '';
      
      this.skipTimeInput = document.getElementById('skipTimeInput');
      this.skipTimeSaveButton = document.getElementById('skipTimeSaveButton');
      this.skipTimeInput.value = data.youtubeSkipTime || 5;
      this.lastSavedSkipTime = data.youtubeSkipTime || 5;
      
      const lang = (navigator.language || navigator.userLanguage).split('-')[0];
      const texts = messages[lang] || messages.en;
      
      document.getElementById('extensionTitle').textContent = texts.extensionName;
      document.getElementById('copyProtectionText').textContent = texts.copyProtectionToggle;
      document.getElementById('searchPrefixText').textContent = texts.searchPrefixPlaceholder;
      this.searchPrefix.placeholder = texts.searchPrefixPlaceholder;
      this.saveButton.textContent = texts.saveButton;
      this.skipTimeSaveButton.textContent = texts.saveButton;
      document.getElementById('youtubeControlText').textContent = texts.youtubeControlText;
      
      this.saveButton.disabled = true;
      this.skipTimeSaveButton.disabled = true;
      this.setupEventListeners();
    } catch (error) {
      console.error('초기화 오류:', error);
    }
  }

  setupEventListeners() {
    this.toggleSwitch.addEventListener('change', this.handleToggleChange.bind(this));
    this.searchPrefix.addEventListener('input', this.handlePrefixInput.bind(this));
    this.saveButton.addEventListener('click', this.handlePrefixSave.bind(this));
    this.skipTimeInput.addEventListener('input', this.handleSkipTimeInput.bind(this));
    this.skipTimeSaveButton.addEventListener('click', this.handleSkipTimeSave.bind(this));
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
      await chrome.runtime.sendMessage({
        action: 'updateSearchPrefix',
        prefix: prefix
      });
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateSearchPrefix',
          prefix: prefix
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
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'toggleUnblock',
            state: newState
          });
          // 상태 변경 후 항상 새로고침
          await chrome.tabs.reload(tab.id);
        } catch (error) {
          if (error.message.includes('Receiving end does not exist')) {
            await chrome.tabs.reload(tab.id);
          } else {
            throw error;
          }
        }
      }
      setTimeout(() => window.close(), 300);
    } catch (error) {
      console.error('상태 변경 오류:', error);
      e.target.checked = !newState;
    }
  }
  
  handleSkipTimeInput(e) {
    const value = parseInt(e.target.value);
    const isValid = value && value >= 1 && value <= 60;
    const isDifferent = value !== this.lastSavedSkipTime;
    
    this.skipTimeSaveButton.disabled = !isValid || !isDifferent;
    
    if (!this.skipTimeSaveButton.disabled) {
      this.skipTimeSaveButton.style.background = '#4285f4';
      this.skipTimeSaveButton.style.cursor = 'pointer';
    } else {
      this.skipTimeSaveButton.style.background = '#cccccc';
      this.skipTimeSaveButton.style.cursor = 'not-allowed';
    }
  }
  
  async handleSkipTimeSave() {
    const skipTime = parseInt(this.skipTimeInput.value);
    if (!skipTime || skipTime < 1 || skipTime > 60) return;
    
    this.skipTimeSaveButton.disabled = true;
    this.skipTimeSaveButton.style.background = '#cccccc';
    this.skipTimeSaveButton.style.cursor = 'not-allowed';
    
    try {
      await chrome.storage.local.set({ youtubeSkipTime: skipTime });
      this.lastSavedSkipTime = skipTime;
      setTimeout(() => window.close(), this.POPUP_CLOSE_DELAY);
    } catch (error) {
      console.error('스킵 시간 저장 오류:', error);
      this.skipTimeSaveButton.disabled = false;
      this.skipTimeSaveButton.style.background = '#4285f4';
      this.skipTimeSaveButton.style.cursor = 'pointer';
    }
  }
  
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});