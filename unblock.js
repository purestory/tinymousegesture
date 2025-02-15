class CopyProtectionBypass {
  constructor() {
    this.isUnblocked = false;
    this.eventHandlers = new Map();
    this.observer = null;
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

    // 복사 관련 이벤트 처리
    const events = ['copy', 'cut', 'contextmenu', 'selectstart', 'mouseup', 'mousedown'];
    events.forEach(event => {
      const handler = (e) => {
        if (this.isUnblocked) {
          e.stopPropagation();
          return true;
        }
      };
      this.eventHandlers.set(event, handler);
      document.addEventListener(event, handler, true);
    });
  }

  unblockAll() {
    // 스타일 적용
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
        ::selection {
          background: #b3d4fc !important;
          color: #000 !important;
        }
      `;
      document.head.appendChild(styleTag);
    }

    // MutationObserver 설정
    if (!this.observer) {
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes') {
            const target = mutation.target;
            if (target instanceof Element) {
              if (target.style?.userSelect === 'none' || 
                  target.style?.webkitUserSelect === 'none' || 
                  target.hasAttribute('unselectable')) {
                target.style.setProperty('user-select', 'text', 'important');
                target.style.setProperty('-webkit-user-select', 'text', 'important');
                target.removeAttribute('unselectable');
              }
              if (target.hasAttribute('oncopy') || 
                  target.hasAttribute('oncut') || 
                  target.hasAttribute('onselectstart') ||
                  target.hasAttribute('oncontextmenu')) {
                target.removeAttribute('oncopy');
                target.removeAttribute('oncut');
                target.removeAttribute('onselectstart');
                target.removeAttribute('oncontextmenu');
              }
            }
          }
        });
      });

      this.observer.observe(document.documentElement, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['style', 'unselectable', 'oncopy', 'oncut', 'onselectstart', 'oncontextmenu']
      });
    }

    document.documentElement.classList.add('unblock-all');
  }

  restoreBlock() {
    // 스타일 제거
    const styleTag = document.getElementById('unblock-style');
    if (styleTag) {
      styleTag.remove();
    }

    // MutationObserver 해제
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    document.documentElement.classList.remove('unblock-all');
  }
}

// 인스턴스 생성
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new CopyProtectionBypass());
} else {
  new CopyProtectionBypass();
}