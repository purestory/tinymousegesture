// twidougaOverride.js: MAIN world에서 실행되어 타이머를 무력화합니다.
(function() {
  const originalSetInterval = window.setInterval;
  window.setInterval = function(fn, delay) {
    // twidouga.net 의 더 불러오기 광고 대기 시간 무력화
    if (fn && typeof fn === 'function' && fn.toString().includes('adGate')) {
      return originalSetInterval.call(this, fn, 10); // 10ms로 단축
    }
    return originalSetInterval.call(this, fn, delay);
  };
})();
