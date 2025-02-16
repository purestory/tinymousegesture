// override.js: EventTarget.prototype.addEventListener를 오버라이드하여 복사방지 관련 이벤트 등록을 차단합니다.
(function(){
  if (!window.__originalAddEventListener) {
    window.__originalAddEventListener = EventTarget.prototype.addEventListener;
  }
  const banned = ['copy','cut','paste','selectstart','contextmenu','mousedown','mouseup','dragstart'];
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (banned.indexOf(type) !== -1) {
      return;
    }
    return window.__originalAddEventListener.call(this, type, listener, options);
  };
})(); 