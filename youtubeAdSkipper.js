/**
 * 유튜브 광고 수동 스킵 기능 (자동 기능 제거됨)
 * 기능4-1: 유튜브 광고 수동 스킵 기능
 */

(function() {
  'use strict';
  
  console.log('YouTube 수동 광고 스킵 기능 시작');
  
  // 자동 광고 스킵 기능은 제거됨
  // 수동으로만 광고를 스킵할 수 있는 버튼만 제공
  
  function addManualSkipButton() {
    // 광고가 있을 때만 수동 스킵 버튼 표시
    const adElement = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
    if (adElement && !document.querySelector('.custom-skip-button')) {
      const skipButton = document.createElement('button');
      skipButton.className = 'custom-skip-button';
      skipButton.textContent = '광고 건너뛰기';
      skipButton.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        background: #ff0000;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
      `;
      
      skipButton.addEventListener('click', function() {
        const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
        if (skipBtn) {
          skipBtn.click();
          skipButton.remove();
        }
      });
      
      document.body.appendChild(skipButton);
      
      // 광고가 끝나면 버튼 제거
      setTimeout(() => {
        if (skipButton.parentNode) {
          skipButton.remove();
        }
      }, 30000);
    }
  }
  
  // 페이지 로드 시 체크
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setInterval(addManualSkipButton, 1000);
    });
  } else {
    setInterval(addManualSkipButton, 1000);
  }
  
})();
