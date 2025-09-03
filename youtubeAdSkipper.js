/**
 * 유튜브 광고 수동 스킵 기능 (자동 기능 제거됨)
 * 기능4-1: 유튜브 광고 수동 스킵 기능
 */

(function() {
  'use strict';
  
  console.log('YouTube 수동 광고 스킵 기능 시작');
  
  let customSkipButton = null;
  
  function removeCustomButton() {
    if (customSkipButton && customSkipButton.parentNode) {
      customSkipButton.remove();
      customSkipButton = null;
      console.log('커스텀 스킵 버튼 제거됨');
    }
  }
  
  function addManualSkipButton() {
    // 이미 버튼이 있으면 스킵
    if (customSkipButton && customSkipButton.parentNode) {
      return;
    }
    
    // 광고 관련 요소들 체크
    const adSelectors = [
      '.ytp-ad-skip-button',
      '.ytp-ad-skip-button-modern', 
      '.ytp-skip-ad-button',
      '.videoAdUiSkipButton',
      '[data-purpose="video-ad-ui-skip-button"]'
    ];
    
    const adElement = document.querySelector(adSelectors.join(', '));
    const adContainer = document.querySelector('.ytp-ad-module, .video-ads, .ytp-ad-player-overlay');
    const adText = document.querySelector('.ytp-ad-text, .ytp-ad-message-text');
    
    console.log('광고 요소 체크:', {
      adElement: !!adElement,
      adContainer: !!adContainer,
      adText: !!adText
    });
    
    // 광고가 있을 때만 버튼 생성
    if (adElement || adContainer || adText) {
      console.log('광고 감지됨, 수동 스킵 버튼 생성');
      
      customSkipButton = document.createElement('button');
      customSkipButton.className = 'custom-manual-skip-button';
      customSkipButton.innerHTML = '🔴 광고 건너뛰기';
      customSkipButton.style.cssText = `
        position: fixed !important;
        top: 120px !important;
        right: 20px !important;
        z-index: 99999 !important;
        background: linear-gradient(45deg, #ff0000, #ff4444) !important;
        color: white !important;
        border: 2px solid white !important;
        padding: 12px 20px !important;
        border-radius: 25px !important;
        cursor: pointer !important;
        font-size: 16px !important;
        font-weight: bold !important;
        box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3) !important;
        transition: all 0.3s ease !important;
        font-family: 'Arial', sans-serif !important;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5) !important;
      `;
      
      // 호버 효과
      customSkipButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 6px 20px rgba(255, 0, 0, 0.5)';
      });
      
      customSkipButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.3)';
      });
      
      customSkipButton.addEventListener('click', function() {
        console.log('수동 스킵 버튼 클릭됨');
        
        // 모든 가능한 스킵 버튼 찾기
        const skipButtons = document.querySelectorAll(adSelectors.join(', '));
        let clicked = false;
        
        skipButtons.forEach(btn => {
          if (btn && btn.offsetParent !== null) { // 버튼이 보이는 상태인지 확인
            btn.click();
            clicked = true;
            console.log('스킵 버튼 클릭됨:', btn);
          }
        });
        
        if (!clicked) {
          // 스킵 버튼이 없으면 다른 방법 시도
          const video = document.querySelector('video');
          if (video) {
            // 비디오 시간을 끝으로 이동
            video.currentTime = video.duration - 1;
            console.log('비디오 시간을 끝으로 이동');
          }
        }
        
        removeCustomButton();
      });
      
      document.body.appendChild(customSkipButton);
      console.log('커스텀 스킵 버튼 추가됨');
      
      // 30초 후 자동 제거
      setTimeout(() => {
        removeCustomButton();
      }, 30000);
    }
  }
  
  function checkForAds() {
    // 광고가 없으면 버튼 제거
    const adSelectors = [
      '.ytp-ad-skip-button',
      '.ytp-ad-skip-button-modern', 
      '.ytp-skip-ad-button',
      '.videoAdUiSkipButton',
      '[data-purpose="video-ad-ui-skip-button"]',
      '.ytp-ad-module',
      '.video-ads',
      '.ytp-ad-player-overlay',
      '.ytp-ad-text',
      '.ytp-ad-message-text'
    ];
    
    const hasAd = document.querySelector(adSelectors.join(', '));
    
    if (!hasAd && customSkipButton) {
      console.log('광고 종료됨, 버튼 제거');
      removeCustomButton();
    } else if (hasAd) {
      addManualSkipButton();
    }
  }
  
  // 초기 실행
  setTimeout(checkForAds, 1000);
  
  // 주기적으로 체크
  setInterval(checkForAds, 2000);
  
  // URL 변경 감지 (SPA)
  let currentUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log('URL 변경 감지, 버튼 제거');
      removeCustomButton();
    }
  }, 1000);
  
  console.log('YouTube 수동 광고 스킵 기능 활성화됨');
  
})();