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
        this.isUnblocked ? this.unblockAll() : this.restoreBlock();
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
        
        *::selection {
          background: #b3d4fc !important;
          color: #000 !important;
        }
        
        [contenteditable="false"] {
          -webkit-user-modify: read-write !important;
          -moz-user-modify: read-write !important;
          user-modify: read-write !important;
        }
        
        [unselectable="on"] {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          user-select: text !important;
        }
      `;
      document.head.appendChild(styleTag);
    }
    document.documentElement.classList.add('unblock-all');
    this.setupUnblockEvents();
  }

  setupUnblockEvents() {
    const preventDefaultHandler = (e) => {
      if (this.isUnblocked) {
        e.stopPropagation();
      }
    };

    ['copy', 'cut', 'paste', 'contextmenu', 'selectstart', 'mousedown', 'mouseup', 'keydown', 'keyup'].forEach(eventType => {
      document.addEventListener(eventType, preventDefaultHandler, true);
    });
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