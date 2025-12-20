class YoutubeController {
  constructor() {
    this.skipTime = 5; // 기본값 5초
    this.isProcessing = false; // 중복 실행 방지
    this.initializeState();
    this.setupControls();
  }

  async initializeState() {
    try {
      const data = await chrome.storage.local.get('youtubeSkipTime');
      this.skipTime = data.youtubeSkipTime || 5;
    } catch (error) {
      console.error('유튜브 컨트롤러 초기화 오류:', error);
    }
  }

  setupControls() {
    // 기존 버튼들 먼저 제거
    this.removeExistingButtons();
    
    const checkForPlayer = setInterval(() => {
      const player = document.querySelector('.html5-video-player');
      if (player) {
        clearInterval(checkForPlayer);
        this.createButtons(player);
        this.createUtilityButtons(player);
      }
    }, 1000);
  }

  createButtons(player) {
    // 재생 버튼 옆의 컨트롤 영역 찾기
    const leftControls = player.querySelector('.ytp-left-controls');
    if (!leftControls) return;

    // 기존 커스텀 버튼들 제거 (중복 방지)
    this.removeExistingButtons();

    // 재생 버튼 다음 위치 찾기
    const playButton = leftControls.querySelector('.ytp-play-button');
    if (!playButton) return;

    const svgStyle = `
      width: 32px !important;
      height: 32px !important;
      min-width: 32px !important;
      min-height: 32px !important;
      fill: currentColor;
      filter: drop-shadow(0 1px 1px rgba(0,0,0,0.5));
    `;

    // 재생 버튼을 복제해서 아이콘만 변경
    const backwardButton = playButton.cloneNode(true);
    backwardButton.className = 'ytp-button ytp-custom-backward-button';
    backwardButton.innerHTML = `
      <svg style="${svgStyle}" viewBox="0 0 24 24">
        <path d="M21,7L12,12l9,5V7z M11,7v10l-9-5L11,7z"/>
      </svg>
    `;
    // 기본 스타일은 유지하고 필요한 부분만 수정
    Object.assign(backwardButton.style, {
      margin: '0 2px',
      opacity: '0.9'
    });
    backwardButton.title = `${this.skipTime}초 뒤로`;
    backwardButton.onclick = () => this.skip(-this.skipTime);

    const forwardButton = playButton.cloneNode(true);
    forwardButton.className = 'ytp-button ytp-custom-forward-button';
    forwardButton.innerHTML = `
      <svg style="${svgStyle}" viewBox="0 0 24 24">
        <path d="M3,7v10l9-5L3,7z M13,7v10l9-5L13,7z"/>
      </svg>
    `;
    // 기본 스타일은 유지하고 필요한 부분만 수정
    Object.assign(forwardButton.style, {
      margin: '0 2px',
      opacity: '0.9'
    });
    forwardButton.title = `${this.skipTime}초 앞으로`;
    forwardButton.onclick = () => this.skip(this.skipTime);

    // 재생 버튼 다음에 삽입
    playButton.insertAdjacentElement('afterend', forwardButton);
    playButton.insertAdjacentElement('afterend', backwardButton);

    // 마우스 이벤트 핸들러 수정
    [backwardButton, forwardButton].forEach(button => {
      button.addEventListener('mouseover', () => {
        button.style.opacity = '1';
      });
      button.addEventListener('mouseout', () => {
        button.style.opacity = '0.9';
      });
    });
  }

  skip(seconds) {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime += seconds;
    }
  }

  // 광고 감지 함수 (정확한 감지만)
  isAdPlaying() {
    // 1. 가장 확실한 광고 표시 - 플레이어에 ad-showing 클래스
    const player = document.querySelector('#movie_player');
    if (player && player.classList.contains('ad-showing')) {
      console.log('🎯 광고 감지: ad-showing 클래스');
      return true;
    }

    // 2. 광고 스킵 버튼이 보이는 경우 (가장 확실한 광고 신호)
    const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
    if (skipButton && skipButton.offsetParent !== null && skipButton.style.display !== 'none') {
      console.log('🎯 광고 감지: 스킵 버튼 존재');
      return true;
    }

    // 3. 광고 시간 표시가 보이는 경우
    const adTime = document.querySelector('.ytp-ad-duration-remaining');
    if (adTime && adTime.offsetParent !== null && adTime.style.display !== 'none') {
      console.log('🎯 광고 감지: 광고 시간 표시');
      return true;
    }

    // 4. 광고 오버레이가 보이는 경우
    const adOverlay = document.querySelector('.ytp-ad-player-overlay');
    if (adOverlay && adOverlay.offsetParent !== null && adOverlay.style.display !== 'none') {
      console.log('🎯 광고 감지: 광고 오버레이');
      return true;
    }

    // 5. 광고 텍스트가 보이는 경우
    const adText = document.querySelector('.ytp-ad-text');
    if (adText && adText.offsetParent !== null && adText.style.display !== 'none') {
      console.log('🎯 광고 감지: 광고 텍스트');
      return true;
    }

    // 6. 명확한 광고 URL 패턴만 확인 (매우 제한적으로)
    const video = document.querySelector('video');
    if (video && video.currentSrc) {
      // 확실한 광고 서버만 확인
      if (video.currentSrc.includes('doubleclick.net') || 
          video.currentSrc.includes('googleadservices.com') ||
          video.currentSrc.includes('googlesyndication.com')) {
        console.log('🎯 광고 감지: 광고 서버 URL');
        return true;
      }
    }

    return false;
  }

  // 광고 감지 디버깅 함수
  debugAdDetection() {
    console.log('🔍 광고 감지 상태 확인:');
    
    const player = document.querySelector('#movie_player');
    console.log('- 플레이어 ad-showing 클래스:', player?.classList.contains('ad-showing') || false);
    
    const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
    console.log('- 스킵 버튼 존재:', !!skipButton && skipButton.offsetParent !== null);
    
    const adTime = document.querySelector('.ytp-ad-duration-remaining');
    console.log('- 광고 시간 표시:', !!adTime && adTime.offsetParent !== null);
    
    const adOverlay = document.querySelector('.ytp-ad-player-overlay');
    console.log('- 광고 오버레이:', !!adOverlay && adOverlay.offsetParent !== null);
    
    const adText = document.querySelector('.ytp-ad-text');
    console.log('- 광고 텍스트:', !!adText && adText.offsetParent !== null);
    
    const video = document.querySelector('video');
    if (video && video.currentSrc) {
      console.log('- 비디오 URL:', video.currentSrc.substring(0, 100) + '...');
      console.log('- 광고 서버 URL 포함:', 
        video.currentSrc.includes('doubleclick.net') ||
        video.currentSrc.includes('googleadservices.com') ||
        video.currentSrc.includes('googlesyndication.com')
      );
    }
  }

  // 광고 차단 경고 화면 감지 함수 (디버깅 포함)
  isAdBlockWarningShown() {
    // 경고 메시지 관련 선택자들
    const warningSelectors = [
      'ytd-enforcement-message-view-model',
      '[class*="enforcement-message"]',
      '[class*="playability-error"]',
      '.yt-playability-error-supported-renderers'
    ];

    for (const selector of warningSelectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        // 텍스트 내용도 확인
        const text = element.textContent || '';
        if (text.includes('광고 차단') || 
            text.includes('ad block') || 
            text.includes('YouTube 서비스 약관') ||
            text.includes('광고를 기반으로')) {
          console.log('🚨 경고 화면 감지 (DOM 요소):', selector);
          console.log('📝 감지된 텍스트:', text.substring(0, 100) + '...');
          return true;
        }
      }
    }

    // 특정 텍스트 패턴으로도 확인 (더 제한적으로)
    const warningTexts = [
      '광고 차단 프로그램을 사용 중인 것 같습니다',
      'YouTube 서비스 약관을 위반하는',
      'ad blocker'
    ];

    // body 전체 텍스트 확인은 너무 광범위할 수 있으므로 제거하고
    // 특정 컨테이너만 확인
    const mainContainer = document.querySelector('#player-container, #movie_player, .html5-video-container');
    if (mainContainer) {
      const containerText = mainContainer.textContent || '';
      for (const warningText of warningTexts) {
        if (containerText.includes(warningText)) {
          console.log('🚨 경고 화면 감지 (텍스트 패턴):', warningText);
          return true;
        }
      }
    }

    return false;
  }


  // 스킵 완료 후 경고화면 확인 (한 번만)
  checkWarningAfterSkip() {
    console.log('🔍 스킵 완료 후 경고화면 확인...');
    
    if (this.isAdBlockWarningShown()) {
      console.log('⚠️ 광고 스킵 후 경고 화면이 감지되었습니다. 즉시 새로고침...');
      console.log('🔄 경고 화면으로 인한 페이지 새로고침 실행');
      window.location.reload();
    } else {
      console.log('✅ 경고화면 없음 - 정상 상태');
    }
  }

  // 광고 끝나기 3초 전으로 이동하는 함수 (광고일 때만 작동)
  jumpToEnd() {
    if (this.isProcessing) return;

    // 1. 광고 재생 중이 아니면 아무것도 하지 않음
    if (!this.isAdPlaying()) return;

    this.isProcessing = true;

    // 2. 건너뛰기 버튼이 있으면 즉시 클릭 (가장 안전한 방법)
    if (this.clickSkipButton()) {
      console.log('✅ "광고 건너뛰기" 버튼을 클릭했습니다.');
      this.isProcessing = false;
      return;
    }

    // 3. 건너뛸 수 없는 광고 처리: 음소거 및 최대 배속
    const video = document.querySelector('video');
    if (video) {
      console.log('🔇 건너뛸 수 없는 광고입니다. 음소거 및 최대 배속으로 재생합니다.');
      video.muted = true;
      video.playbackRate = 16;
    }

    // 잠시 후 처리 상태 해제
    setTimeout(() => {
      this.isProcessing = false;
    }, 1000);
  }


  // 유튜브 건너뛰기 버튼 표시 여부 확인 (더욱 강화된 버전)
  isYouTubeSkipButtonVisible() {
    const skipButtonSelectors = [
      '.ytp-ad-skip-button-modern',   // 최신 UI 스킵 버튼
      '.ytp-skip-ad-button',          // 클래식 스킵 버튼
      '.ytp-ad-skip-button',          // 이전 스킵 버튼
      'button[id*="skip-button"]',    // ID에 'skip-button'을 포함하는 버튼
      '.ytp-ad-skip-button-slot',     // 스킵 버튼을 담는 컨테이너
      'yt-button-renderer[id*="skip"]', // YouTube 웹 컴포넌트 기반 버튼
    ];

    for (const selector of skipButtonSelectors) {
      const skipButton = document.querySelector(selector);
      
      // 버튼이 존재하고, 화면에 보이며(offsetParent), 비활성화 상태가 아닐 때
      if (skipButton && 
          skipButton.offsetParent !== null && 
          !skipButton.disabled) {
        
        // 버튼이 실제로 클릭 가능한지 확인 (너비와 높이가 0보다 큼)
        const rect = skipButton.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          console.log(`🔍 건너뛰기 버튼 (표시됨) 감지: ${selector}`);
          return true;
        }
      }
    }
    
    return false;
  }

  // 페이지 새로고침 함수
  refreshPage() {
    window.location.reload();
  }

  // 유틸리티 버튼들 생성 (광고스킵)
  createUtilityButtons(player) {
    const leftControls = player.querySelector('.ytp-left-controls');
    if (!leftControls) return;

    const buttonStyle = `
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

    // 광고 스킵 버튼 생성 (하나만)
    const jumpButton = document.createElement('button');
    jumpButton.className = 'ytp-button ytp-custom-jump-button';
    jumpButton.title = '광고일 때만: 광고 끝나기 3초 전으로 이동';
    jumpButton.style.cssText = buttonStyle;
    jumpButton.textContent = '광고스킵';
    jumpButton.addEventListener('click', () => this.jumpToEnd());

    // 호버 효과 추가
    jumpButton.addEventListener('mouseenter', () => {
      jumpButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    jumpButton.addEventListener('mouseleave', () => {
      jumpButton.style.backgroundColor = 'transparent';
    });

    // 버튼 배치 - 음소거 버튼 앞에 배치
    const muteButton = leftControls.querySelector('.ytp-mute-button');
    if (muteButton) {
      muteButton.insertAdjacentElement('beforebegin', jumpButton);
      return;
    }

    // 볼륨 패널 앞에 배치
    const volumePanel = leftControls.querySelector('.ytp-volume-panel');
    if (volumePanel) {
      volumePanel.insertAdjacentElement('beforebegin', jumpButton);
      return;
    }

    // 시간 표시 앞에 배치
    const timeDisplay = leftControls.querySelector('.ytp-time-display');
    if (timeDisplay) {
      timeDisplay.insertAdjacentElement('beforebegin', jumpButton);
      return;
    }

    // 마지막: 왼쪽 컨트롤 맨 뒤에 추가
    leftControls.appendChild(jumpButton);
  }

  // 기존 커스텀 버튼들 제거 (모든 커스텀 버튼)
  removeExistingButtons() {
    document.querySelectorAll('.ytp-custom-backward-button, .ytp-custom-forward-button, .ytp-custom-jump-button').forEach(button => {
      button.remove();
    });
  }

  // 기존 유틸리티 버튼들 제거 (호환성을 위해 유지)
  removeExistingUtilityButtons() {
    this.removeExistingButtons();
  }


  // 자동 광고 스킵 기능 (선택적)
  enableAutoSkip() {
    if (this.autoSkipInterval) {
      clearInterval(this.autoSkipInterval);
    }

    let wasAdPlaying = false;

    // 1초마다 광고 및 경고 화면 확인
    this.autoSkipInterval = setInterval(() => {
      const isCurrentlyAd = this.isAdPlaying();

      // 1. 경고 화면이 최우선 처리 대상
      if (this.handleAntiAdblock()) {
        return;
      }

      // 2. 광고 스킵 로직
      if (isCurrentlyAd && !this.isProcessing) {
        console.log('🤖 자동 광고 스킵 실행');
        this.jumpToEnd();
        wasAdPlaying = true;
      }
      // 3. 광고가 끝난 직후 원래 상태로 복구
      else if (wasAdPlaying && !isCurrentlyAd) {
        const video = document.querySelector('video');
        if (video) {
          console.log('🎬 광고가 종료되었습니다. 원래 재생 상태로 복구합니다.');
          video.muted = false;
          video.playbackRate = 1.0;
        }
        wasAdPlaying = false;
      }
    }, 1000);
  }

  // 자동 스킵 비활성화
  disableAutoSkip() {
    if (this.autoSkipInterval) {
      clearInterval(this.autoSkipInterval);
      this.autoSkipInterval = null;
    }
  }

  // 클래스 정리 (메모리 누수 방지)
  handleAntiAdblock() {
    const warningSelector = 'ytd-enforcement-message-view-model, [class*="enforcement-message"]';
    const warningElement = document.querySelector(warningSelector);

    if (warningElement && warningElement.offsetParent !== null) {
      console.log('🚫 광고 차단 경고 화면을 감지했습니다. 복구를 시도합니다.');

      // 1. '닫기' 버튼이 있으면 클릭
      const closeButton = warningElement.querySelector('yt-button-renderer#dismiss-button, button.ytp-button');
      if (closeButton) {
        console.log('Attempting to click the close button.');
        closeButton.click();
      }

      // 2. 경고 화면 강제 제거
      console.log('Removing the adblock warning element from the DOM.');
      warningElement.remove();

      // 3. 비디오 강제 재생
      const video = document.querySelector('video');
      if (video && video.paused) {
        console.log('Video is paused, attempting to play.');
        video.play();
      }
      return true;
    }
    return false;
  }

  clickSkipButton() {
    const skipButtonSelectors = [
      '.ytp-ad-skip-button-modern', // 최신 UI 스킵 버튼
      '.ytp-skip-ad-button',      // 클래식 스킵 버튼
      '.ytp-ad-skip-button',      // 이전 스킵 버튼
      'button[class*="skip"]',    // 'skip'을 포함하는 모든 버튼
    ];

    for (const selector of skipButtonSelectors) {
      const skipButton = document.querySelector(selector);
      // 버튼이 존재하고, 화면에 보이며, 비활성화 상태가 아닐 때
      if (skipButton && skipButton.offsetParent !== null && !skipButton.disabled) {
        console.log(`✅ 건너뛰기 버튼 감지 및 클릭: ${selector}`);
        skipButton.click(); // 버튼 클릭
        return true; // 클릭 성공 시 true 반환
      }
    }
    return false; // 적절한 버튼을 찾지 못함
  }

  destroy() {
    // 자동 스킵 인터벌 정리
    if (this.autoSkipInterval) {
      clearInterval(this.autoSkipInterval);
      this.autoSkipInterval = null;
    }

    // 커스텀 버튼들 제거
    this.removeExistingButtons();
    
    console.log('YoutubeController 정리 완료');
  }
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
  if (window.youtubeController) {
    window.youtubeController.destroy();
  }
});

// 전역 변수로 저장하여 나중에 정리할 수 있도록 함
window.youtubeController = new YoutubeController();
