class PopupManager {
  constructor() {
    this.toggleSwitch = document.getElementById('toggleProtection');
    this.initialize();
  }

  async initialize() {
    const data = await chrome.storage.local.get('isUnblocked');
    this.toggleSwitch.checked = data.isUnblocked;
    this.setupEventListeners();
  }

  async sendMessageToTab(message) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id && !tab.url.startsWith('chrome://')) {
        await chrome.tabs.sendMessage(tab.id, message);
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error);
    }
  }

  async handleToggleChange(e) {
    const newState = e.target.checked;
    try {
      await chrome.storage.local.set({ isUnblocked: newState });
      await this.sendMessageToTab({
        action: "toggleUnblock",
        state: newState
      });
    } catch (error) {
      console.error('토글 상태 설정 오류:', error);
    }
    setTimeout(() => window.close(), 200);
  }

  setupEventListeners() {
    this.toggleSwitch.addEventListener('change', this.handleToggleChange.bind(this));
  }
}

// 인스턴스 생성
new PopupManager();