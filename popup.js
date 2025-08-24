import { getMessage } from './i18n/messages.js';

class PopupManager {
  constructor() {
    this.toggleSwitch = null;
    this.searchPrefix = null;
    this.saveButton = null;
    this.skipTimeInput = null;
    this.skipTimeSaveButton = null;
    this.adBlockerToggle = null;
    this.lastSavedPrefix = '';
    this.lastSavedSkipTime = 5;
    this.isAdBlockerEnabled = false;
    this.POPUP_CLOSE_DELAY = 500;

    // DOM이 로드된 후 초기화
    document.addEventListener('DOMContentLoaded', () => {
      this.toggleSwitch = document.getElementById('toggleSwitch');
      this.searchPrefix = document.getElementById('searchPrefix');
      this.saveButton = document.getElementById('saveButton');
      this.skipTimeInput = document.getElementById('skipTimeInput');
      this.skipTimeSaveButton = document.getElementById('skipTimeSaveButton');
      this.adBlockerToggle = document.getElementById('adBlockerToggle');
      
      if (!this.toggleSwitch || !this.searchPrefix || !this.saveButton || 
          !this.skipTimeInput || !this.skipTimeSaveButton || !this.adBlockerToggle) {
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

      // 1. storage에서 데이터 가져오기
      const storageData = await chrome.storage.local.get(['searchPrefix', 'youtubeSkipTime', 'isAdBlockerEnabled']);

      // 2. background에서 isUnblocked 상태 가져오기
      const backgroundState = await chrome.runtime.sendMessage({ action: 'getUnblockState' });

      // 3. 데이터를 합쳐 UI 초기화
      this.initializeUI({
          ...storageData, // searchPrefix, youtubeSkipTime, isAdBlockerEnabled
          isUnblocked: backgroundState?.isUnblocked || false // background 응답 사용
      });

      this.setupEventListeners();
      this.setupBackgroundStateListener(); // 백그라운드 상태 변경 리스너 추가

    } catch (error) {
      console.error('초기화 오류:', error);
      // 오류 발생 시 기본값으로 UI 초기화 시도
      this.initializeUI({
        isUnblocked: false,
        searchPrefix: '',
        youtubeSkipTime: 5,
        isAdBlockerEnabled: false
      });
      this.setupEventListeners();
    }
  }

  initializeUI(data) {
    try {
      // UI 요소들에 다국어 텍스트 적용
      const elements = {
        'extensionTitle': 'extensionName',
        'copyProtectionText': 'copyProtectionToggle',
        'searchPrefixText': 'searchPrefixPlaceholder',
        'youtubeControlText': 'youtubeControlText',
        'adBlockerText': 'adBlockerText'
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
      if (this.toggleSwitch) {
        this.toggleSwitch.checked = data.isUnblocked;
      }
      if (this.searchPrefix) {
         this.searchPrefix.value = data.searchPrefix || '';
         this.lastSavedPrefix = data.searchPrefix || '';
      }
      if (this.skipTimeInput) {
          this.skipTimeInput.value = data.youtubeSkipTime || 5;
          this.lastSavedSkipTime = data.youtubeSkipTime || 5;
      }
      if (this.adBlockerToggle) {
          this.adBlockerToggle.checked = data.isAdBlockerEnabled || false;
          this.isAdBlockerEnabled = data.isAdBlockerEnabled || false;
      }

      // 버튼 텍스트 설정
      if (this.searchPrefix) this.searchPrefix.placeholder = getMessage('searchPrefixPlaceholder');
      if (this.saveButton) this.saveButton.textContent = getMessage('saveButton');
      if (this.skipTimeSaveButton) this.skipTimeSaveButton.textContent = getMessage('saveButton');

      // 버튼 초기 상태
      if (this.saveButton) this.saveButton.disabled = true;
      if (this.skipTimeSaveButton) this.skipTimeSaveButton.disabled = true;
    } catch (error) {
      console.error('UI 초기화 오류:', error);
    }
  }

  setupEventListeners() {
    if (this.toggleSwitch) {
       this.toggleSwitch.addEventListener('change', this.handleToggleChange.bind(this));
    }
    if (this.searchPrefix) {
       this.searchPrefix.addEventListener('input', this.handlePrefixInput.bind(this));
    }
    if (this.saveButton) {
       this.saveButton.addEventListener('click', this.handlePrefixSave.bind(this));
    }
    if (this.skipTimeInput) {
        this.skipTimeInput.addEventListener('input', this.handleSkipTimeInput.bind(this));
    }
    if (this.skipTimeSaveButton) {
        this.skipTimeSaveButton.addEventListener('click', this.handleSkipTimeSave.bind(this));
    }
    if (this.adBlockerToggle) {
        this.adBlockerToggle.addEventListener('change', this.handleAdBlockerToggle.bind(this));
    }
  }

  // 백그라운드에서 상태 변경 시 팝업 UI 업데이트 리스너
  async handleAdBlockerToggle(e) {
    try {
      const isEnabled = e.target.checked;
      await chrome.storage.local.set({ isAdBlockerEnabled: isEnabled });
      this.isAdBlockerEnabled = isEnabled;
      
      // 현재 활성화된 탭에 변경된 상태를 알림
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleAdBlocker',
          state: isEnabled
        }).catch(err => {
          // 현재 페이지가 hitomi.la가 아니거나 아직 컨텐츠 스크립트가 로드되지 않았을 수 있음
          console.log('광고차단 토글 메시지 전송 실패:', err);
        });
      }
      
      setTimeout(() => window.close(), 300);
    } catch (error) {
      console.error('광고 차단 상태 변경 오류:', error);
      e.target.checked = !e.target.checked;
    }
  }
  
  setupBackgroundStateListener() {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
          if (request.action === 'updatePopupState' && this.toggleSwitch) {
              // 백그라운드에서 isUnblocked 상태가 변경되었다는 알림을 받으면
              // 팝업의 토글 스위치 상태를 업데이트
              this.toggleSwitch.checked = request.isUnblocked;
          }
          // 다른 메시지에 대한 처리가 필요하면 여기에 추가
          return true; // 비동기 처리가 있을 수 있으므로 true 반환
      });
  }

  handlePrefixInput(e) {
    const currentValue = e.target.value.trim();
    const shouldEnable = currentValue && currentValue !== this.lastSavedPrefix;
    if (this.saveButton) {
      this.saveButton.disabled = !shouldEnable;
      
      if (shouldEnable) {
        this.saveButton.style.background = '#4285f4';
        this.saveButton.style.cursor = 'pointer';
      } else {
        this.saveButton.style.background = '#cccccc';
        this.saveButton.style.cursor = 'not-allowed';
      }
    }
  }

  async handlePrefixSave() {
    const prefix = this.searchPrefix.value.trim();
    if (!prefix) return;
    
    if (this.saveButton) {
      this.saveButton.disabled = true;
      this.saveButton.style.background = '#cccccc';
      this.saveButton.style.cursor = 'not-allowed';
    }
    
    try {
      console.log('저장하려는 접두어:', prefix);
      await chrome.storage.local.set({ searchPrefix: prefix });
      console.log('스토리지에 접두어 저장 완료');
      await chrome.runtime.sendMessage({
        action: 'updateSearchPrefix',
        prefix: prefix
      });
      console.log('백그라운드에 접두어 업데이트 메시지 전송 완료');
      
      this.lastSavedPrefix = prefix;
      setTimeout(() => window.close(), this.POPUP_CLOSE_DELAY);
    } catch (error) {
      console.error('접두어 저장 오류:', error);
      if (this.saveButton) {
        this.saveButton.disabled = false;
        this.saveButton.style.background = '#4285f4';
        this.saveButton.style.cursor = 'pointer';
      }
    }
  }

  async handleToggleChange(e) {
    try {
      const newState = e.target.checked;
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.runtime.sendMessage({ action: 'toggleUnblock', state: newState, tabId: tab.id });
      setTimeout(() => window.close(), 300);
    } catch (error) {
      console.error('상태 변경 요청 오류:', error);
      e.target.checked = !e.target.checked;
    }
  }
  
  handleSkipTimeInput(e) {
    const value = parseInt(e.target.value);
    const isValid = value && value >= 1 && value <= 60;
    const isDifferent = value !== this.lastSavedSkipTime;
    
    if (this.skipTimeSaveButton) {
      this.skipTimeSaveButton.disabled = !isValid || !isDifferent;
      
      if (!this.skipTimeSaveButton.disabled) {
        this.skipTimeSaveButton.style.background = '#4285f4';
        this.skipTimeSaveButton.style.cursor = 'pointer';
      } else {
        this.skipTimeSaveButton.style.background = '#cccccc';
        this.skipTimeSaveButton.style.cursor = 'not-allowed';
      }
    }
  }
  
  async handleSkipTimeSave() {
    const skipTime = parseInt(this.skipTimeInput.value);
    if (!skipTime || skipTime < 1 || skipTime > 60) return;
    
    if (this.skipTimeSaveButton) {
      this.skipTimeSaveButton.disabled = true;
      this.skipTimeSaveButton.style.background = '#cccccc';
      this.skipTimeSaveButton.style.cursor = 'not-allowed';
    }
    
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSkipTime',
        skipTime: skipTime
      });
      this.lastSavedSkipTime = skipTime;
      setTimeout(() => window.close(), this.POPUP_CLOSE_DELAY);
    } catch (error) {
      console.error('스킵 시간 저장 오류:', error);
      if (this.skipTimeSaveButton) {
        this.skipTimeSaveButton.disabled = false;
        this.skipTimeSaveButton.style.background = '#4285f4';
        this.skipTimeSaveButton.style.cursor = 'pointer';
      }
    }
  }
  
}

// 클래스 초기화
new PopupManager();