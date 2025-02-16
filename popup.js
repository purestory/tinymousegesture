import { getMessage } from './i18n/messages.js';

class PopupManager {
  constructor() {
    this.toggleSwitch = null;
    this.searchPrefix = null;
    this.saveButton = null;
    this.skipTimeInput = null;
    this.skipTimeSaveButton = null;
    this.lastSavedPrefix = '';
    this.lastSavedSkipTime = 5;
    this.POPUP_CLOSE_DELAY = 500;

    // DOM이 로드된 후 초기화
    document.addEventListener('DOMContentLoaded', () => {
      this.toggleSwitch = document.getElementById('toggleSwitch');
      this.searchPrefix = document.getElementById('searchPrefix');
      this.saveButton = document.getElementById('saveButton');
      this.skipTimeInput = document.getElementById('skipTimeInput');
      this.skipTimeSaveButton = document.getElementById('skipTimeSaveButton');
      
      if (!this.toggleSwitch || !this.searchPrefix || !this.saveButton || 
          !this.skipTimeInput || !this.skipTimeSaveButton) {
        console.error('필수 UI 요소를 찾을 수 없습니다.');
        return;
      }

      this.initialize();
    });
  }

  async initialize() {
    try {
      if (!chrome?.runtime?.id) {
        throw new Error('Extension context not available');
      }

      const data = await chrome.storage.local.get(['isUnblocked', 'searchPrefix', 'youtubeSkipTime']);
      this.initializeUI(data);
      this.setupEventListeners();
    } catch (error) {
      console.error('초기화 오류:', error);
    }
  }

  initializeUI(data) {
    try {
      // UI 요소들에 다국어 텍스트 적용
      const elements = {
        'extensionTitle': 'extensionName',
        'copyProtectionText': 'copyProtectionToggle',
        'searchPrefixText': 'searchPrefixPlaceholder',
        'youtubeControlText': 'youtubeControlText'
      };

      Object.entries(elements).forEach(([id, key]) => {
        const element = document.getElementById(id);
        if (!element) {
          console.warn(`Element not found: ${id}`);
          return;
        }
        element.textContent = getMessage(key);
      });

      // 데이터 초기화
      this.toggleSwitch.checked = data.isUnblocked;
      this.searchPrefix.value = data.searchPrefix || '';
      this.skipTimeInput.value = data.youtubeSkipTime || 5;
      this.lastSavedPrefix = data.searchPrefix || '';
      this.lastSavedSkipTime = data.youtubeSkipTime || 5;

      // 버튼 텍스트 설정
      this.searchPrefix.placeholder = getMessage('searchPrefixPlaceholder');
      this.saveButton.textContent = getMessage('saveButton');
      this.skipTimeSaveButton.textContent = getMessage('saveButton');

      // 버튼 초기 상태
      this.saveButton.disabled = true;
      this.skipTimeSaveButton.disabled = true;
    } catch (error) {
      console.error('UI 초기화 오류:', error);
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

// 클래스 초기화
new PopupManager();