// mrjavOverride.js: MAIN world에서 실행되어 팝업을 철저히 막습니다.
(function() {
  if (window.__MainPopupBlocker) return;
  window.__MainPopupBlocker = true;

  const hostname = window.location.hostname.replace('www.', '');

  const fakeWindow = {
    closed: false, close: function(){}, focus: function(){}, blur: function(){}, postMessage: function(){},
    document: { write: function(){}, open: function(){}, close: function(){}, body: { appendChild: function(){} } },
    location: { href: '', replace: function(){}, assign: function(){} }
  };

  // 1. window.open 완벽 차단
  window.open = function() {
    console.log('MAIN world 팝업 차단 (window.open)', arguments);
    return fakeWindow;
  };
  
  // 2. 동적 a 태그 click() 차단 (새 창 열기이거나 외부 도메인이면)
  const originalClick = HTMLAnchorElement.prototype.click;
  const hookedClick = function() {
    const href = this.href || '';
    const t = this.target ? this.target.toLowerCase() : '';
    const hasNewTabTarget = t && !['_self', '_top', '_parent'].includes(t);
    const isExternalHref = href && !href.includes(hostname) && !href.startsWith('/') && !href.startsWith('javascript:');

    if (hasNewTabTarget || isExternalHref) {
      console.log('MAIN world 팝업 차단 (a.click):', href, t);
      return;
    }
    return originalClick.apply(this, arguments);
  };
  HTMLAnchorElement.prototype.click = hookedClick;

  // 3. 동적 form submit() 차단
  const originalSubmit = HTMLFormElement.prototype.submit;
  const hookedSubmit = function() {
    const t = this.target ? this.target.toLowerCase() : '';
    if (t && !['_self', '_top', '_parent'].includes(t)) {
      console.log('MAIN world 팝업 차단 (form.submit)', t);
      return;
    }
    return originalSubmit.apply(this, arguments);
  };
  HTMLFormElement.prototype.submit = hookedSubmit;

  // 3.5. dispatchEvent를 통한 우회 클릭 차단 (가짜 a 태그 생성 후 dispatchEvent)
  const originalDispatchEvent = EventTarget.prototype.dispatchEvent;
  EventTarget.prototype.dispatchEvent = function(event) {
    if (event && event.type === 'click' && this.tagName === 'A') {
      const href = this.href || '';
      const t = this.target ? this.target.toLowerCase() : '';
      if (t && !['_self', '_top', '_parent'].includes(t)) {
        console.log('MAIN world 팝업 차단 (dispatchEvent):', href, t);
        return false;
      }
    }
    return originalDispatchEvent.apply(this, arguments);
  };

  // innerHTML 등을 통한 동기적 우회 방지 (contentWindow 속성 가로채기)
  const cwDesc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');
  const cdDesc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentDocument');

  // 숨겨진 iframe을 생성해서 우회하여 팝업을 여는 악질적인 수법 완벽 차단
  const hookIframe = function(iframe) {
    try {
      if (!iframe) return;
      // 무한 루프 방지: 우리가 가로채기 전의 원본 getter를 사용하여 진짜 cw를 가져옴
      let cw = null;
      if (cwDesc && cwDesc.get) {
        cw = cwDesc.get.call(iframe);
      } else {
        cw = iframe.contentWindow; // 이 코드가 무한루프를 발생시키지 않도록 보장됨 (getter가 없을 경우)
      }
      
      if (cw) {
        cw.open = function() {
          console.log('MAIN world 팝업 차단 (iframe.contentWindow.open)', arguments);
          return fakeWindow;
        };
        if (cw.HTMLAnchorElement) cw.HTMLAnchorElement.prototype.click = hookedClick;
        if (cw.HTMLFormElement) cw.HTMLFormElement.prototype.submit = hookedSubmit;
      }
    } catch(e) {}
  };

  // 동적으로 생성되는 iframe 감지
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child) {
    const result = originalAppendChild.apply(this, arguments);
    if (child && (child.tagName === 'IFRAME' || child.nodeName === 'IFRAME')) hookIframe(child);
    return result;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    const result = originalInsertBefore.apply(this, arguments);
    if (newNode && (newNode.tagName === 'IFRAME' || newNode.nodeName === 'IFRAME')) hookIframe(newNode);
    return result;
  };

  if (cwDesc) {
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
      get: function() {
        hookIframe(this);
        return cwDesc.get.call(this);
      },
      configurable: true,
      enumerable: true
    });
  }

  if (cdDesc) {
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentDocument', {
      get: function() {
        hookIframe(this);
        return cdDesc.get.call(this);
      },
      configurable: true,
      enumerable: true
    });
  }

  // HTML에 처음부터 하드코딩된 iframe 감지 (파싱 시점)
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.tagName === 'IFRAME' || node.nodeName === 'IFRAME') {
          hookIframe(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('iframe').forEach(hookIframe);
        }
      });
    });
  });
  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // 지연 주입 시 이미 존재하는 iframe도 훅킹
  const existingIframes = document.querySelectorAll('iframe');
  for (let i = 0; i < existingIframes.length; i++) {
    hookIframe(existingIframes[i]);
  }

  // 4. 모든 종류의 클릭 이벤트 가로채기 (mouseup, mousedown 포함)
  const blockEvent = function(e) {
    try {
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentNode;
      }
      if (target && target.tagName === 'A') {
        const href = target.href || '';
        const t = target.target ? target.target.toLowerCase() : '';
        const hasNewTabTarget = t && !['_self', '_top', '_parent'].includes(t);
        const isExternalHref = href && !href.includes(hostname) && !href.startsWith('/') && !href.startsWith('javascript:');

        if (hasNewTabTarget || isExternalHref) {
          e.preventDefault();
          e.stopPropagation();
          console.log('MAIN world 팝업 차단 (이벤트):', href, t);
        }
      }
    } catch (err) {}
  };
  document.addEventListener('click', blockEvent, true);
  document.addEventListener('mousedown', blockEvent, true);
  document.addEventListener('mouseup', blockEvent, true);
  document.addEventListener('pointerdown', blockEvent, true);
  document.addEventListener('pointerup', blockEvent, true);
})();
