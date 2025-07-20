(function(){
  // 이미 로드되었으면 재정의하지 않도록 합니다.
  if (window.__CopyProtectionBypassInitialized) return;
  window.__CopyProtectionBypassInitialized = true;

  class CopyProtectionBypass {
    constructor() {
      this.isUnblocked = false;
      this.eventHandlers = new Map();
      this.observer = null;
      this.intervalId = null;
      this.overrideIntervalId = null;
      this.globalListenersAdded = false;
      this.initializeState();
      this.setupEventListeners();
    }
    
    // 로컬 스토리지에서 상태를 불러옵니다.
    async initializeState() {
      try {
        const data = await chrome.storage.local.get('isUnblocked');
        this.isUnblocked = data.isUnblocked || false;
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
    
    removeInlineEvents(root) {
      if (root && 'removeAttribute' in root) {
        root.removeAttribute('oncopy');
        root.removeAttribute('oncut');
        root.removeAttribute('onpaste');
        root.removeAttribute('onselectstart');
        root.removeAttribute('oncontextmenu');
        root.removeAttribute('onmousedown');
        root.removeAttribute('onmouseup');
        root.removeAttribute('ondragstart');
      }
      if (root && root.querySelectorAll) {
        const elements = root.querySelectorAll('*');
        elements.forEach(el => {
          el.removeAttribute('oncopy');
          el.removeAttribute('oncut');
          el.removeAttribute('onpaste');
          el.removeAttribute('onselectstart');
          el.removeAttribute('oncontextmenu');
          el.removeAttribute('onmousedown');
          el.removeAttribute('onmouseup');
          el.removeAttribute('ondragstart');
        });
      }
    }
    
    removeGlobalEvents() {
      document.onselectstart = null;
      document.oncopy = null;
      document.oncut = null;
      document.onpaste = null;
      document.oncontextmenu = null;
      document.onmousedown = null;
      document.onmouseup = null;
      document.ondragstart = null;
    }
    
    removeOverlays() {
      const overlays = document.querySelectorAll('div, section, article');
      overlays.forEach(el => {
        const style = window.getComputedStyle(el);
        const pos = style.getPropertyValue('position');
        const zIndex = parseInt(style.getPropertyValue('z-index')) || 0;
        if ((pos === 'fixed' || pos === 'absolute') && zIndex >= 1000) {
          const rect = el.getBoundingClientRect();
          if (rect.width >= window.innerWidth * 0.6 && rect.height >= window.innerHeight * 0.6) {
            el.remove();
          } else {
            el.style.setProperty('pointer-events', 'none', 'important');
          }
        }
      });
      document.querySelectorAll("[class*='overlay']").forEach(el => {
        el.remove();
      });
    }
    
    // inline 스크립트 대신 외부 파일(override.js)을 불러옵니다.
    injectOverrideScript() {
      const script = document.createElement('script');
      script.id = 'override-events';
      script.src = chrome.runtime.getURL('override.js');
      document.documentElement.appendChild(script);
      script.onload = function() {
        script.remove();
      };
    }
    
    addGlobalCaptureListeners() {
      if (this.globalListenersAdded) return;
      const events = ["copy", "cut", "paste", "selectstart", "contextmenu", "mousedown", "mouseup", "dragstart"];
      events.forEach(event => {
        document.addEventListener(event, (e) => {
          if (this.isUnblocked) {
            e.stopImmediatePropagation();
          }
        }, true);
      });
      this.globalListenersAdded = true;
    }
    
    // 복사방지 해제 실행: CSS 인젝션, 이벤트 제거, 오버레이 제거, 외부 스크립트 주입 및 주기적 제거 처리
    unblockAll() {
      let styleTag = document.getElementById("unblock-style");
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "unblock-style";
        styleTag.textContent = `
          * {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
            -webkit-touch-callout: default !important;
            pointer-events: auto !important;
          }
        `;
        document.head.appendChild(styleTag);
      }
      this.removeInlineEvents(document);
      this.removeGlobalEvents();
      this.removeOverlays();
      this.injectOverrideScript();
      this.addGlobalCaptureListeners();
      
      if (!this.observer) {
        this.observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (mutation.type === "attributes") {
              this.removeInlineEvents(mutation.target);
              this.removeGlobalEvents();
              this.removeOverlays();
            } else if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
              mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  this.removeInlineEvents(node);
                  this.removeGlobalEvents();
                  this.removeOverlays();
                }
              });
            }
          });
        });
        this.observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["oncopy", "oncut", "onpaste", "onselectstart", "oncontextmenu", "onmousedown", "onmouseup", "ondragstart"]
        });
      }
      
      if (this.intervalId === null) {
        this.intervalId = setInterval(() => {
          this.removeInlineEvents(document);
          this.removeGlobalEvents();
          this.removeOverlays();
          this.injectOverrideScript();
        }, 500);
      }
      
      if (this.overrideIntervalId === null) {
        this.overrideIntervalId = setInterval(() => {
          this.injectOverrideScript();
        }, 5000);
      }
    }
    
    // 복사방지 원복: CSS, MutationObserver, 주기적 타이머를 해제합니다.
    restoreBlock() {
      const styleTag = document.getElementById("unblock-style");
      if (styleTag) {
        styleTag.remove();
      }
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      if (this.overrideIntervalId !== null) {
        clearInterval(this.overrideIntervalId);
        this.overrideIntervalId = null;
      }
    }
  }
  
  new CopyProtectionBypass();
})();