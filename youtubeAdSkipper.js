// youtubeAdSkipper.js - 유튜브 광고 컨트롤러
(function() {
  // 이미 로드되었으면 중복 실행 방지
  if (window.__YoutubeAdSkipperInitialized) return;
  window.__YoutubeAdSkipperInitialized = true;

  // 유튜브 사이트인지 확인
  if (!window.location.hostname.includes('youtube.com')) return;
  
  // 유튜브 플레이어 컨트롤 스타일과 유사하게 설정
  const SKIP_BUTTON_CLASS = 'ytp-custom-skip-button';
  const REFRESH_BUTTON_CLASS = 'ytp-custom-refresh-button';
  
  // 영상을 끝으로 보내는 함수
  function skipToEnd() {
    const video = document.querySelector('video');
    if (!video) return;
    
    try {
      // 현재 시간 저장
      const currentTime = video.currentTime;
      
      // 영상 끝으로 이동 (끝에서 0.1초 떨어진 지점으로)
      if (video.duration) {
        video.currentTime = video.duration - 0.1;
        console.log(`영상 끝으로 스킵: ${currentTime.toFixed(1)}초 → ${video.currentTime.toFixed(1)}초`);
        
        // 스킵 후 안전한 리셋 시간 (기존 시간 유지)
        setTimeout(() => {
          console.log('스킵 후 상태 리셋 (1.5초)');
          window.lastAdId = null;
          window.lastAdState = false;
          // 타이머도 클리어
          if (window.adDetectedTimeout) {
            clearTimeout(window.adDetectedTimeout);
            window.adDetectedTimeout = null;
          }
        }, 1500); // 기존 1.5초로 복구
        
      } else {
        console.log('영상 길이를 가져올 수 없습니다.');
      }
    } catch (e) {
      console.error('스킵 중 오류:', e);
    }
  }
  
  // 영상 상태 확인 함수
  function isVideoEnded() {
    const video = document.querySelector('video');
    if (video) {
      // 영상이 끝났는지 확인
      const isEnded = video.ended || (video.duration && video.currentTime >= video.duration - 1);
      if (isEnded) {
        console.log('영상 종료 상태 감지됨');
        return true;
      }
    }
    
    // 종료 화면 요소들 확인
    const endScreenElements = [
      '.ytp-endscreen-content',
      '.ytp-ce-element',
      '.ytp-cards-teaser',
      '.html5-endscreen'
    ];
    
    for (const selector of endScreenElements) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        console.log('영상 종료 화면 감지됨:', selector);
        return true;
      }
    }
    
    return false;
  }

  // 강화된 광고 감지 함수
  function detectAd() {
    // 먼저 영상이 끝났는지 확인 - 끝났으면 광고가 아님
    if (isVideoEnded()) {
      console.log('영상 종료 상태이므로 광고 감지 중단');
      return false;
    }
    
    // 1. 정확한 DOM 기반 광고 지표들 (확실한 광고 요소만)
    const coreAdIndicators = [
      '.ytp-ad-player-overlay',
      '.ytp-ad-text',
      '.ytp-ad-overlay-container',
      '.ytp-ad-image-overlay',
      '.ytp-ad-duration-remaining',
      '.ytp-ad-preview-text',
      '.ytp-ad-skip-button',
      '.ytp-skip-ad-button',
      '.ytp-ad-skip-button-modern',
      '.ytp-ad-info',
      '.ytp-ad-forced-overlay',
      '.ytp-ad-display-container'
    ];
    
    for (const selector of coreAdIndicators) {
      const adElement = document.querySelector(selector);
      if (adElement && (adElement.offsetParent !== null || adElement.style.display !== 'none')) {
        console.log(`광고 감지 (확실한 DOM): ${selector}`);
        return true;
      }
    }
    
    // ad-showing 클래스는 플레이어에서만 확인
    const player = document.querySelector('#movie_player');
    if (player && player.classList.contains('ad-showing')) {
      console.log('광고 감지 (플레이어 ad-showing)');
      return true;
    }
    
    // 2. 더 정확한 비디오 기반 감지 (영상 재생 중일 때만)
    const video = document.querySelector('video');
    if (video && video.currentSrc && !video.paused) {
      // 영상이 실제로 재생 중인지 확인
      if (video.currentTime > 0 && video.currentTime < video.duration - 5) {
        // 광고 URL 패턴 확인 (더 정확한 패턴)
        const adUrlPatterns = [
          'doubleclick.net',
          'googleadservices.com',
          'googlesyndication.com'
        ];
        
        for (const pattern of adUrlPatterns) {
          if (video.currentSrc.includes(pattern)) {
            console.log('광고 감지 (광고 URL):', pattern);
            return true;
          }
        }
        
        // googlevideo.com이지만 광고 파라미터가 있는 경우만
        if (video.currentSrc.includes('googlevideo.com') && 
            (video.currentSrc.includes('&ad_') || video.currentSrc.includes('adunit'))) {
          console.log('광고 감지 (광고 파라미터 포함 URL)');
          return true;
        }
      }
    }
    
    // 3. 더 정확한 텍스트 기반 감지 (광고 영역에서만)
    const adContainers = document.querySelectorAll('.ytp-ad-player-overlay, .ytp-ad-text, .ytp-ad-overlay-container, [class*="ad-"], [id*="ad-"]');
    for (const container of adContainers) {
      if (container && container.offsetParent !== null) {
        const adTexts = ['광고', 'Ad ', 'Advertisement', 'Skip Ad', '초 후 건너뛸', 'seconds remaining'];
        const containerText = container.textContent || '';
        
        for (const adText of adTexts) {
          if (containerText.includes(adText)) {
            console.log(`광고 감지 (광고 영역 텍스트): ${adText}`);
            return true;
          }
        }
      }
    }
    
    // 4. 추가 플레이어 상태 확인 (중복 제거됨 - 위에서 이미 확인)
    
    return false;
  }
  
  // 스킵 버튼 감지 및 우리 건너뛰기 기능 실행
  function detectSkipButtonAndSkip() {
    // 다양한 광고 스킵 버튼 선택자들
    const skipSelectors = [
      '.ytp-ad-skip-button',
      '.ytp-skip-ad-button', 
      '.ytp-ad-skip-button-modern',
      '.skip-button',
      '[data-purpose="skip-ad-button"]',
      '.videoAdUiSkipButton',
      '.ytp-ad-skip-button-slot'
    ];
    
    for (const selector of skipSelectors) {
      const skipButton = document.querySelector(selector);
      if (skipButton && skipButton.offsetParent !== null) { // 버튼이 보이는 상태인지 확인
        console.log(`스킵 버튼 발견: ${selector} - 우리 건너뛰기 기능 실행`);
        try {
          // 우리가 만든 건너뛰기 기능 실행 (영상 끝으로 이동)
          skipToEnd();
          console.log('건너뛰기 기능으로 광고 스킵 완료');
          return true;
        } catch (e) {
          console.error('건너뛰기 기능 실행 중 오류:', e);
        }
      }
    }
    return false;
  }
  
  // 페이지 새로고침 함수
  function refreshPage() {
    console.log('페이지 새로고침...');
    window.location.reload();
  }

  // 버튼 생성 함수 (한글 텍스트만)
  function createSkipButton() {
    const button = document.createElement('button');
    button.className = `ytp-button ${SKIP_BUTTON_CLASS}`;
    button.title = '영상 끝으로 이동';
    
    // 강제적으로 보이도록 CSS 설정
    button.style.cssText = `
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 8px !important;
      margin: 0 4px !important;
      font-size: 13px !important;
      color: #fff !important;
      background-color: transparent !important;
      border: none !important;
      border-radius: 2px !important;
      cursor: pointer !important;
      white-space: nowrap !important;
      height: 46px !important;
      min-width: auto !important;
      font-weight: 500 !important;
      opacity: 1 !important;
      visibility: visible !important;
      position: relative !important;
      z-index: 10 !important;
      flex-shrink: 0 !important;
    `;
    
    // 한글 텍스트만 추가
    button.textContent = '건너뛰기';
    
    button.addEventListener('click', skipToEnd);
    
    // 호버 효과 추가
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'transparent';
    });
    
    console.log('건너뛰기 버튼 생성됨:', button);
    return button;
  }

  function createRefreshButton() {
    const button = document.createElement('button');
    button.className = `ytp-button ${REFRESH_BUTTON_CLASS}`;
    button.title = '페이지 새로고침';
    
    // 강제적으로 보이도록 CSS 설정
    button.style.cssText = `
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 8px !important;
      margin: 0 4px !important;
      font-size: 13px !important;
      color: #fff !important;
      background-color: transparent !important;
      border: none !important;
      border-radius: 2px !important;
      cursor: pointer !important;
      white-space: nowrap !important;
      height: 46px !important;
      min-width: auto !important;
      font-weight: 500 !important;
      opacity: 1 !important;
      visibility: visible !important;
      position: relative !important;
      z-index: 10 !important;
      flex-shrink: 0 !important;
    `;
    
    // 한글 텍스트만 추가
    button.textContent = '새로고침';
    
    button.addEventListener('click', refreshPage);
    
    // 호버 효과 추가
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'transparent';
    });
    
    console.log('새로고침 버튼 생성됨:', button);
    return button;
  }

  // 유튜브 컨트롤러에 버튼 추가 (볼륨과 시간 사이)
  function addButtonsToYouTubeControls() {
    // 이미 추가된 버튼 제거
    removeExistingButtons();
    
    // 왼쪽 컨트롤 찾기
    const leftControls = document.querySelector('.ytp-left-controls');
    if (!leftControls) {
      console.log('유튜브 왼쪽 컨트롤러를 찾을 수 없습니다. 다시 시도합니다.');
      return false;
    }
    
    console.log('leftControls 찾음:', leftControls);
    console.log('leftControls 자식들:', Array.from(leftControls.children).map(child => child.className));
    
    // 버튼 생성
    const skipButton = createSkipButton();
    const refreshButton = createRefreshButton();
    
    console.log('버튼 생성 완료');
    
    // 음소거 버튼 앞에 배치
    // 1순위: 뮤트 버튼 앞에 배치
    const muteButton = leftControls.querySelector('.ytp-mute-button');
    console.log('muteButton 찾기 결과:', !!muteButton);
    
    if (muteButton) {
      muteButton.insertAdjacentElement('beforebegin', skipButton);
      skipButton.insertAdjacentElement('afterend', refreshButton);
      console.log('뮤트 버튼 앞에 버튼 추가 완료');
      return true;
    }
    
    // 2순위: 볼륨 패널 앞에 배치
    const volumePanel = leftControls.querySelector('.ytp-volume-panel');
    console.log('volumePanel 찾기 결과:', !!volumePanel);
    
    if (volumePanel) {
      volumePanel.insertAdjacentElement('beforebegin', skipButton);
      skipButton.insertAdjacentElement('afterend', refreshButton);
      console.log('볼륨 패널 앞에 버튼 추가 완료');
      return true;
    }
    
    // 3순위: 시간 표시 앞에 배치
    const timeDisplay = leftControls.querySelector('.ytp-time-display');
    console.log('timeDisplay 찾기 결과:', !!timeDisplay);
    
    if (timeDisplay) {
      timeDisplay.insertAdjacentElement('beforebegin', skipButton);
      skipButton.insertAdjacentElement('afterend', refreshButton);
      console.log('시간 표시 앞에 버튼 추가 완료');
      return true;
    }
    
    // 마지막: 왼쪽 컨트롤 맨 뒤에 추가
    leftControls.appendChild(skipButton);
    leftControls.appendChild(refreshButton);
    console.log('왼쪽 컨트롤 맨 뒤에 버튼 추가 완료');
    return true;
  }
  
  // 기존 버튼 제거
  function removeExistingButtons() {
    document.querySelectorAll(`.${SKIP_BUTTON_CLASS}, .${REFRESH_BUTTON_CLASS}`).forEach(button => {
      button.remove();
    });
  }

  // 유튜브 플레이어 상태 확인 및 버튼 추가 (반복 시도)
  function tryAddButtons() {
    // 유튜브 컨트롤이 완전히 로드되었는지 확인
    const rightControls = document.querySelector('.ytp-right-controls');
    if (rightControls && rightControls.children.length > 0) {
      if (addButtonsToYouTubeControls()) {
        clearInterval(addButtonsInterval);
      }
    }
  }
  
  // 플레이어가 나타날 때까지 정기적으로 시도 (간격을 늘려서 유튜브 로딩에 영향 최소화)
  // let addButtonsInterval = setInterval(tryAddButtons, 2000);
  
  // 최초 시도는 지연시켜서 유튜브가 완전히 로드된 후 실행
  // setTimeout(tryAddButtons, 3000);
  
  // 페이지 변경 감지 (유튜브는 SPA)
  let lastUrl = location.href;
  const urlChangeObserver = setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      console.log('페이지 변경 감지, 버튼 다시 추가 시도');
      
      // 기존 인터벌 제거 및 새로 시작
      // clearInterval(addButtonsInterval);
      // addButtonsInterval = setInterval(tryAddButtons, 1000);
      
      // 즉시 한번 시도
      // setTimeout(tryAddButtons, 500);
    }
  }, 1000);
  
  // MutationObserver로 DOM 변경 감지하여 버튼 유지 및 광고 스킵 버튼 감지
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // 스킵 버튼이 추가되었는지 확인
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 스킵 버튼 확인 (더 많은 선택자 포함)
            const skipSelectors = [
              '.ytp-ad-skip-button',
              '.ytp-skip-ad-button', 
              '.ytp-ad-skip-button-modern',
              '.skip-button',
              '[data-purpose="skip-ad-button"]',
              '.videoAdUiSkipButton',
              '.ytp-ad-skip-button-slot'
            ];
            
            let foundSkipButton = false;
            for (const selector of skipSelectors) {
              const skipButton = node.querySelector ? node.querySelector(selector) : null;
              if (skipButton || (node.classList && node.classList.contains(selector.substring(1)))) {
                foundSkipButton = true;
                break;
              }
            }
            
            if (foundSkipButton) {
              console.log('스킵 버튼 DOM 추가 감지됨, 즉시 건너뛰기 실행');
              // 지연 없이 즉시 실행
              detectSkipButtonAndSkip();
            }
          }
        }
        
        const playerControls = document.querySelector('.ytp-right-controls');
        const skipButtonExists = document.querySelector(`.${SKIP_BUTTON_CLASS}`);
        const refreshButtonExists = document.querySelector(`.${REFRESH_BUTTON_CLASS}`);
        
        // 유튜브 컨트롤이 있고 우리 버튼이 없을 때만 추가
        // if (playerControls && playerControls.children.length > 0 && (!skipButtonExists || !refreshButtonExists)) {
        //   console.log('컨트롤러 변경 감지, 버튼 다시 추가');
        //   setTimeout(tryAddButtons, 100); // 약간의 지연을 두어 유튜브 로딩 완료 후 추가
        //   break;
        // }
      }
    }
  });
  
  // 비디오 플레이어 영역 관찰
  function startObserving() {
    const playerContainer = document.querySelector('#movie_player');
    if (playerContainer) {
      observer.observe(playerContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }
  }
  
  // 유튜브 버튼들을 촘촘하게 만드는 함수 (우리 버튼 제외)
  function makeButtonsCompact() {
    const rightControls = document.querySelector('.ytp-right-controls');
    if (rightControls) {
      // 오른쪽 컨트롤의 유튜브 기본 버튼들 간격만 줄이기 (우리 버튼 제외)
      const buttons = rightControls.querySelectorAll('.ytp-button:not(.ytp-custom-skip-button):not(.ytp-custom-refresh-button)');
      buttons.forEach(button => {
        button.style.margin = '0 1px'; // 간격만 줄임
      });
      
      // ytp-next-button 특별 처리 (원래 크기로 복원)
      const nextButton = document.querySelector('.ytp-next-button');
      if (nextButton) {
        nextButton.style.padding = ''; // 패딩 리셋
        nextButton.style.margin = ''; // 마진 리셋
        nextButton.style.width = ''; // 너비 리셋
        nextButton.style.height = ''; // 높이 리셋
      }
      
      // 컨트롤 전체 간격도 조정
      rightControls.style.gap = '2px';
      
      console.log('유튜브 버튼들을 촘촘하게 조정 완료');
    }
    
    // 왼쪽 컨트롤도 조정 (우리 버튼 제외)
    const leftControls = document.querySelector('.ytp-left-controls');
    if (leftControls) {
      const buttons = leftControls.querySelectorAll('.ytp-button:not(.ytp-custom-skip-button):not(.ytp-custom-refresh-button)');
      buttons.forEach(button => {
        button.style.margin = '0 1px'; // 간격만 줄임
      });
      
      leftControls.style.gap = '1px'; // 간격을 더 줄임
    }
  }

  // 버튼 간격 조정을 위한 반복 시도
  function tryMakeCompact() {
    const rightControls = document.querySelector('.ytp-right-controls');
    if (rightControls && rightControls.children.length > 0) {
      makeButtonsCompact();
      clearInterval(compactInterval);
    }
  }

  // 버튼 추가를 위한 반복 시도
  function tryAddButtons() {
    // 유튜브 컨트롤이 완전히 로드되었는지 확인
    const leftControls = document.querySelector('.ytp-left-controls');
    const rightControls = document.querySelector('.ytp-right-controls');
    
    console.log('tryAddButtons 호출됨');
    console.log('leftControls 존재:', !!leftControls);
    console.log('rightControls 존재:', !!rightControls);
    
    if (leftControls && leftControls.children.length > 0) {
      console.log('leftControls 자식 수:', leftControls.children.length);
      if (addButtonsToYouTubeControls()) {
        console.log('버튼 추가 성공, 인터벌 중지');
        clearInterval(addButtonsInterval);
      } else {
        console.log('버튼 추가 실패, 다시 시도');
      }
    } else {
      console.log('컨트롤이 아직 로드되지 않음');
    }
  }

  let compactInterval = setInterval(tryMakeCompact, 1000);
  let addButtonsInterval = setInterval(tryAddButtons, 1000);
  
  // 페이지 변경 시에도 다시 적용
  const urlChangeObserver2 = setInterval(() => {
    if (location.href !== lastUrl) {
      setTimeout(makeButtonsCompact, 2000); // 페이지 변경 후 2초 뒤 적용
      setTimeout(tryAddButtons, 2000); // 버튼도 다시 추가
    }
  }, 1000);

  // 광고 감시 및 자동 스킵 기능 (전역 변수)
  window.adDetectedTimeout = null;
  window.lastAdState = false;
  window.lastAdId = null; // 광고 고유 식별자
  
  function getAdId() {
    // 더 정확한 광고 식별을 위한 다양한 정보 수집
    const video = document.querySelector('video');
    const adText = document.querySelector('.ytp-ad-text');
    const adDuration = document.querySelector('.ytp-ad-duration-remaining');
    const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
    
    let adId = '';
    
    // 비디오 URL (가장 신뢰할 수 있는 식별자)
    if (video && video.currentSrc) {
      adId += video.currentSrc.substring(0, 100);
    }
    
    // 광고 텍스트
    if (adText && adText.textContent) {
      adId += '|' + adText.textContent.trim();
    }
    
    // 광고 남은 시간
    if (adDuration && adDuration.textContent) {
      adId += '|' + adDuration.textContent.trim();
    }
    
    // 스킵 버튼 존재 여부
    if (skipButton) {
      adId += '|skipbtn';
    }
    
    // 현재 시간 (초 단위로 반올림)
    if (video && video.currentTime !== undefined) {
      adId += '|t' + Math.floor(video.currentTime);
    }
    
    // DOM 상태 기반 추가 식별
    const player = document.querySelector('#movie_player');
    if (player && player.className) {
      adId += '|' + player.className.split(' ').filter(c => c.includes('ad')).join('');
    }
    
    // 고유 ID가 없으면 타임스탬프 + 랜덤값 사용
    return adId || (Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  }
  
  // 스킵 버튼 전용 초고속 감시기
  function startSkipButtonWatcher() {
    const skipButtonInterval = setInterval(() => {
      // 스킵 버튼만 감지하고 즉시 실행 (다른 체크 없음)
      if (detectSkipButtonAndSkip()) {
        console.log('🚀 초고속 스킵 버튼 감지하여 즉시 건너뛰기 실행');
      }
    }, 50); // 0.05초마다 스킵 버튼만 확인
    
    console.log('🚀 스킵 버튼 전용 초고속 감시기 시작 (0.05초 간격)');
    return skipButtonInterval;
  }

  function startAdSkipWatcher() {
    // 0.1초마다 광고 상태 확인 (스킵 버튼은 별도 감시기에서 처리)
    const adSkipInterval = setInterval(() => {
      const currentAdState = detectAd();
      const currentAdId = currentAdState ? getAdId() : null;
      
      // 광고 상태 변화 로깅
      if (currentAdState !== window.lastAdState) {
        console.log('광고 상태 변화:', window.lastAdState, '->', currentAdState);
      }
      
      // 광고가 감지되고, 새로운 광고인 경우
      if (currentAdState && (!window.lastAdState || currentAdId !== window.lastAdId)) {
        console.log('🔴 새로운 광고 감지됨! 1초 후 자동 건너뛰기 실행');
        console.log('광고 ID:', currentAdId);
        
        // 이전 타이머가 있다면 취소
        if (window.adDetectedTimeout) {
          clearTimeout(window.adDetectedTimeout);
          console.log('이전 타이머 취소됨');
        }
        
        // 1초 후 자동 건너뛰기
        window.adDetectedTimeout = setTimeout(() => {
          console.log('⏰ 1초 경과 - 자동 건너뛰기 실행');
          skipToEnd();
          // skipToEnd() 함수 내부에서 리셋 처리하므로 여기서는 제거
        }, 1000);
        
        window.lastAdId = currentAdId;
      }
      
      // 광고가 끝났을 때 ID 리셋
      if (!currentAdState && window.lastAdState) {
        console.log('광고 종료 감지 - ID 리셋');
        window.lastAdId = null;
        if (window.adDetectedTimeout) {
          clearTimeout(window.adDetectedTimeout);
          window.adDetectedTimeout = null;
        }
      }
      
      window.lastAdState = currentAdState;
    }, 100); // 0.1초로 단축하여 더 빠른 감지
    
    console.log('🎯 강화된 연속 광고 감시 시작 (0.1초 간격, 스킵버튼은 별도 초고속 처리)');
    return adSkipInterval;
  }
  
  // DOM 로드 완료 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(tryAddButtons, 2000);
      setTimeout(makeButtonsCompact, 2000);
      startObserving();
      setTimeout(startAdSkipWatcher, 1000); // 광고 스킵 감시 시작
      setTimeout(startSkipButtonWatcher, 500); // 스킵 버튼 전용 감시 시작
    });
  } else {
    setTimeout(tryAddButtons, 2000);
    setTimeout(makeButtonsCompact, 2000);
    startObserving();
    setTimeout(startAdSkipWatcher, 1000); // 광고 스킵 감시 시작
    setTimeout(startSkipButtonWatcher, 500); // 스킵 버튼 전용 감시 시작
  }
})();