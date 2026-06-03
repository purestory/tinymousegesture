class YoutubeController {
  constructor() {
    this.skipTime = 5; // 기본값 5초
    this.isProcessing = false; // 중복 실행 방지
    this.ensureControlsTimer = null;
    this.playerPollInterval = null;
    this.playerObserver = null;
    this.boundScheduleEnsureControls = () => this.scheduleEnsureControls();
    this.boundOnYoutubePageUpdate = () => {
      this.scheduleEnsureControls();
      this.startPlayerPolling();
    };
    this.ytNavigationEvents = ['yt-navigate-finish', 'yt-page-data-updated', 'yt-player-updated'];
    this.initializeState();
    this.installControlHooks();
  }

  async initializeState() {
    try {
      const data = await chrome.storage.local.get('youtubeSkipTime');
      this.skipTime = data.youtubeSkipTime || 5;
    } catch (error) {
      console.error('유튜브 컨트롤러 초기화 오류:', error);
    }
  }

  installControlHooks() {
    this.ytNavigationEvents.forEach((eventName) => {
      document.addEventListener(eventName, this.boundOnYoutubePageUpdate);
    });

    this.playerObserver = new MutationObserver(() => {
      if (this.areControlsMissing()) {
        this.scheduleEnsureControls();
      }
    });

    const observeTarget = document.body || document.documentElement;
    if (observeTarget) {
      this.playerObserver.observe(observeTarget, { childList: true, subtree: true });
    }

    this.scheduleEnsureControls();
    this.startPlayerPolling();
  }

  areControlsMissing() {
    const player = document.querySelector('.html5-video-player');
    if (!player) return false;

    const playButton = player.querySelector('.ytp-left-controls .ytp-play-button');
    if (!playButton) return false;

    return !player.querySelector('.ytp-custom-backward-button') ||
      !player.querySelector('.ytp-custom-jump-button');
  }

  scheduleEnsureControls() {
    if (this.ensureControlsTimer) {
      clearTimeout(this.ensureControlsTimer);
    }
    // YouTube React 렌더 완료 후 DOM이 준비되도록 짧게 대기
    this.ensureControlsTimer = setTimeout(() => this.ensureControls(), 350);
  }

  ensureControls() {
    const player = document.querySelector('.html5-video-player');
    if (!player) return;

    const leftControls = player.querySelector('.ytp-left-controls');
    const playButton = leftControls?.querySelector('.ytp-play-button');
    if (!leftControls || !playButton) return;

    const hasSkipButtons = !!player.querySelector('.ytp-custom-backward-button');
    const hasJumpButton = !!player.querySelector('.ytp-custom-jump-button');
    if (hasSkipButtons && hasJumpButton) return;

    if (!hasSkipButtons) {
      this.createButtons(player);
    }
    if (!player.querySelector('.ytp-custom-jump-button')) {
      this.createUtilityButtons(player);
    }
  }

  startPlayerPolling() {
    if (this.playerPollInterval) return;

    let attempts = 0;
    const maxAttempts = 60;

    this.playerPollInterval = setInterval(() => {
      this.ensureControls();
      attempts++;

      const player = document.querySelector('.html5-video-player');
      const isComplete = player &&
        player.querySelector('.ytp-custom-backward-button') &&
        player.querySelector('.ytp-custom-jump-button');

      if (isComplete || attempts >= maxAttempts) {
        clearInterval(this.playerPollInterval);
        this.playerPollInterval = null;
      }
    }, 500);
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
      console.log('⚠️ 광고 스킵 후 경고 화면이 감지되었습니다.');
      console.log('ℹ️ 새로고침 기능이 비활성화되어 있습니다.');
      // 새로고침 비활성화됨
      // window.location.reload();
    } else {
      console.log('✅ 경고화면 없음 - 정상 상태');
    }
  }

  // 광고 끝나기 3초 전으로 이동하는 함수 (광고일 때만 작동)
  jumpToEnd() {
    // 중복 실행 방지
    if (this.isProcessing) {
      console.log('⏳ 이미 처리 중입니다...');
      return;
    }

    // 광고 감지 상태 디버깅
    this.debugAdDetection();

    // 광고가 아니면 작동하지 않음
    if (!this.isAdPlaying()) {
      console.log('❌ 현재 광고가 재생 중이 아닙니다. 광고일 때만 스킵 가능합니다.');
      return;
    }

    this.isProcessing = true;
    const video = document.querySelector('video');
    if (!video) {
      this.isProcessing = false;
      return;
    }
    
    try {
      if (video.duration && video.duration > 0) {
        // 광고 끝나기 3초 전으로 이동 (광고가 3초보다 짧으면 시작 지점으로)
        const targetTime = video.duration > 3 ? video.duration - 3 : 0;
        const currentTime = video.currentTime;
        
        console.log(`🎯 광고 스킵 시작: ${currentTime.toFixed(1)}초 → ${targetTime.toFixed(1)}초 (은밀하게)`);
        
        // 더욱 은밀하고 점진적인 이동
        this.stealthSeekTo(video, targetTime, currentTime);
      } else {
        this.isProcessing = false;
      }
    } catch (e) {
      console.error('광고 이동 중 오류:', e);
      this.isProcessing = false;
    }
  }

  // 매우 은밀한 시크 함수 (감지 회피 극대화)
  stealthSeekTo(video, targetTime, startTime) {
    const timeDiff = targetTime - startTime;
    
    if (timeDiff <= 0) {
      this.isProcessing = false;
      return;
    }

    // 최소 5초씩 이동하는 단계로 나누기 (마지막 단계 제외)
    const stepSize = 5; // 각 단계별 최소 5초 이동
    const steps = Math.max(1, Math.floor(timeDiff / stepSize)); // 마지막 단계 제외
    let currentStep = 0;

    const moveStep = () => {
      // 스킵 중에 유튜브 건너뛰기 버튼이 나타나면 중단
      if (this.isYouTubeSkipButtonVisible()) {
        console.log('⏹️ 유튜브 건너뛰기 버튼 감지! 은밀한 스킵 중단');
        this.isProcessing = false;
        return;
      }

      if (currentStep >= steps) {
        // 최종 위치로 정확히 이동
        video.currentTime = targetTime;
        this.isProcessing = false;
        console.log('✅ 광고 스킵 완료 (은밀하게)');

        // 스킵 완료 후 1초 뒤에 경고화면 확인
        setTimeout(() => {
          this.checkWarningAfterSkip();
        }, 1000);
        
        return;
      }

      // 다음 위치 계산 (정확히 5초씩 이동)
      const nextTime = startTime + (stepSize * (currentStep + 1));
      
      // 마지막 단계 전까지는 5초씩 정확히 이동
      if (currentStep < steps - 1) {
        video.currentTime = Math.min(nextTime, targetTime);
      } else {
        // 마지막 단계에서는 정확한 목표 위치로 이동
        video.currentTime = targetTime;
      }
      
      currentStep++;
      
      // 고정 딜레이 0.3초 (300ms)
      setTimeout(moveStep, 300);
    };

    // 첫 번째 단계 시작 (고정 딜레이 0.3초)
    setTimeout(moveStep, 300);
  }

  // 유튜브 건너뛰기 버튼 표시 여부 확인
  isYouTubeSkipButtonVisible() {
    const skipButtonSelectors = [
      '.ytp-skip-ad-button',           // 기본 스킵 버튼
      '.ytp-ad-skip-button',           // 대체 스킵 버튼
      '#skip-button\\:w',              // ID 기반 스킵 버튼
      'button[class*="skip"]',         // 클래스에 skip이 포함된 버튼
      '[class*="ytp-skip"]'            // ytp-skip이 포함된 요소
    ];

    for (const selector of skipButtonSelectors) {
      const skipButton = document.querySelector(selector);
      
      if (skipButton && 
          skipButton.offsetParent !== null && 
          skipButton.style.display !== 'none' &&
          !skipButton.disabled) {
        
        // 버튼이 실제로 보이는지 확인
        const rect = skipButton.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return true;
        }
      }
    }
    
    return false;
  }

  // 페이지 새로고침 함수 (비활성화됨)
  refreshPage() {
    // 새로고침 비활성화됨
    // window.location.reload();
    console.log('ℹ️ 새로고침 기능이 비활성화되어 있습니다.');
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

    // 5초마다 광고 확인 및 자동 스킵
    this.autoSkipInterval = setInterval(() => {
      if (this.isAdPlaying() && !this.isProcessing) {
        const video = document.querySelector('video');
        if (video && video.duration && video.currentTime > 5) {
          // 광고가 5초 이상 재생되었으면 자동 스킵
          console.log('🤖 자동 광고 스킵 실행');
          this.jumpToEnd();
        }
      }
    }, 5000);
  }

  // 자동 스킵 비활성화
  disableAutoSkip() {
    if (this.autoSkipInterval) {
      clearInterval(this.autoSkipInterval);
      this.autoSkipInterval = null;
    }
  }

  // 클래스 정리 (메모리 누수 방지)
  destroy() {
    if (this.ensureControlsTimer) {
      clearTimeout(this.ensureControlsTimer);
      this.ensureControlsTimer = null;
    }

    if (this.playerPollInterval) {
      clearInterval(this.playerPollInterval);
      this.playerPollInterval = null;
    }

    if (this.playerObserver) {
      this.playerObserver.disconnect();
      this.playerObserver = null;
    }

    this.ytNavigationEvents.forEach((eventName) => {
      document.removeEventListener(eventName, this.boundOnYoutubePageUpdate);
    });

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
