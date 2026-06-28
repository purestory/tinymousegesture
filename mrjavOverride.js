// mrjavOverride.js: mrjav.net의 MAIN world에서 실행되어 팝업을 철저히 막습니다.
(function() {
  if (window.__MrJavPopupBlocker) return;
  window.__MrJavPopupBlocker = true;

  // 1. window.open 완벽 차단
  window.open = function() {
    console.log('MAIN world 팝업 차단 (window.open)', arguments);
    return null;
  };
  
  // 2. 동적 a 태그 click() 차단 (_blank 이거나 외부 도메인이면)
  const originalClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function() {
    const href = this.href || '';
    if (this.target === '_blank' || (href && !href.includes('mrjav.net') && !href.startsWith('/') && !href.startsWith('javascript:'))) {
      console.log('MAIN world 팝업 차단 (a.click):', href);
      return;
    }
    return originalClick.apply(this, arguments);
  };

  // 3. 동적 form submit() 차단
  const originalSubmit = HTMLFormElement.prototype.submit;
  HTMLFormElement.prototype.submit = function() {
    if (this.target === '_blank') {
      console.log('MAIN world 팝업 차단 (form.submit)');
      return;
    }
    return originalSubmit.apply(this, arguments);
  };

  // 4. 모든 종류의 클릭 이벤트 가로채기 (mouseup, mousedown 포함)
  const blockEvent = function(e) {
    try {
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentNode;
      }
      if (target && target.tagName === 'A') {
        const href = target.href || '';
        if (target.target === '_blank' || (href && !href.includes('mrjav.net') && !href.startsWith('/') && !href.startsWith('javascript:'))) {
          e.preventDefault();
          e.stopPropagation();
          console.log('MAIN world 팝업 차단 (이벤트):', href);
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
