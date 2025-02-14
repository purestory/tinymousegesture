class CopyProtectionBypass {
  constructor() {
    this.isUnblocked = false;
    this.initializeState();
    this.setupEventListeners();
  }

  async initializeState() {
    try {
      const data = await chrome.storage.local.get('isUnblocked');
      this.isUnblocked = data.isUnblocked || false;
      if (this.isUnblocked) {
        this.unblockAll();
      }
    } catch (error) {
      console.error('initializeState error:', error);
    }
  }

  setupEventListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleUnblock') {
        this.isUnblocked = request.state;
        if (this.isUnblocked) {
          this.unblockAll();
        } else {
          this.restoreBlock();
        }
        sendResponse({ success: true });
      }
      return true;
    });
  }

  unblockAll() {
    if (!document.getElementById('unblock-style')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'unblock-style';
      styleTag.textContent = `
        * {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(styleTag);
    }

    const events = ['contextmenu', 'selectstart', 'copy', 'cut', 'paste', 'mousedown', 'mouseup'];
    events.forEach(eventName => {
      document.addEventListener(eventName, (e) => {
        if (e.type === 'mousedown' && e.button === 2) {
          return true;
        }
        e.stopPropagation();
        e.stopImmediatePropagation();
        return true;
      }, true);
    });

    document.documentElement.classList.add('unblock-all');
  }

  restoreBlock() {
    const styleTag = document.getElementById('unblock-style');
    if (styleTag) {
      styleTag.remove();
    }
    document.documentElement.classList.remove('unblock-all');
    location.reload();
  }
}

new CopyProtectionBypass();