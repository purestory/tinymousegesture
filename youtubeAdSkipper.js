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
      } else {
        console.log('영상 길이를 가져올 수 없습니다.');
      }
    } catch (e) {
      console.error('스킵 중 오류:', e);
    }
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
  
  // MutationObserver로 DOM 변경 감지하여 버튼 유지 (기존 버튼에 영향 없이)
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
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

  // DOM 로드 완료 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(tryAddButtons, 2000);
      setTimeout(makeButtonsCompact, 2000);
      startObserving();
    });
  } else {
    setTimeout(tryAddButtons, 2000);
    setTimeout(makeButtonsCompact, 2000);
    startObserving();
  }
})();