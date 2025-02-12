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
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  handleMessage(request, sender, sendResponse) {
    if (request.action === 'toggleUnblock') {
      this.isUnblocked = request.state;
      if (this.isUnblocked) {
        this.unblockAll();
      } else {
        this.restoreBlock();
      }
    }
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
    document.documentElement.classList.add('unblock-all');
    this.setupUnblockEvents();
  }

  setupUnblockEvents() {
    const events = ['contextmenu', 'selectstart', 'copy', 'cut', 'paste', 'mousedown', 'mouseup', 'mousemove', 'drag', 'dragstart'];
    events.forEach(eventName => {
      document.addEventListener(eventName, (e) => {
        e.stopPropagation();
        return true;
      }, true);
    });
  }

  restoreBlock() {
    document.documentElement.classList.remove('unblock-all');
    const styleTag = document.getElementById('unblock-style');
    if (styleTag) {
      styleTag.remove();
    }
    location.reload();
  }
}

new CopyProtectionBypass(); 