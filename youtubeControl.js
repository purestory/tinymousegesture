class YoutubeController {
  constructor() {
    this.skipTime = 5; // 기본값 5초
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

    // 재생 버튼 다음 위치 찾기
    const playButton = leftControls.querySelector('.ytp-play-button');
    if (!playButton) return;

    const buttonStyle = `
      width: 46px !important;
      height: 46px !important;
      min-width: 46px !important;
      min-height: 46px !important;
      border: none;
      background: transparent;
      color: white;
      cursor: pointer;
      padding: 0;
      margin: 0 2px;
      opacity: 0.9;
      transition: opacity 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transform: translateY(2px);
    `;

    const svgStyle = `
      width: 32px !important;
      height: 32px !important;
      min-width: 32px !important;
      min-height: 32px !important;
      fill: currentColor;
      filter: drop-shadow(0 1px 1px rgba(0,0,0,0.5));
    `;

    const backwardButton = document.createElement('button');
    backwardButton.className = 'ytp-button';
    backwardButton.innerHTML = `
      <svg style="${svgStyle}" viewBox="0 0 24 24">
        <path d="M21,7L12,12l9,5V7z M11,7v10l-9-5L11,7z"/>
      </svg>
    `;
    backwardButton.style.cssText = buttonStyle;
    backwardButton.title = `${this.skipTime}초 뒤로`;
    backwardButton.onclick = () => this.skip(-this.skipTime);

    const forwardButton = document.createElement('button');
    forwardButton.className = 'ytp-button';
    forwardButton.innerHTML = `
      <svg style="${svgStyle}" viewBox="0 0 24 24">
        <path d="M3,7v10l9-5L3,7z M13,7v10l9-5L13,7z"/>
      </svg>
    `;
    forwardButton.style.cssText = buttonStyle;
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

  // 영상을 마지막 부분으로 보내는 함수 (자연스러운 이동)
  jumpToEnd() {
    const video = document.querySelector('video');
    if (!video) return;
    
    try {
      if (video.duration) {
        const targetTime = video.duration - 3;
        const currentTime = video.currentTime;
        
        // 현재 위치에서 목표 지점까지 점진적으로 이동
        if (targetTime > currentTime) {
          const step = Math.min(10, targetTime - currentTime); // 최대 10초씩 이동
          video.currentTime = currentTime + step;
          
          // 목표에 도달할 때까지 반복
          if (video.currentTime < targetTime - 1) {
            setTimeout(() => this.jumpToEnd(), 100); // 0.1초 후 재시도
          } else {
            video.currentTime = targetTime; // 마지막에 정확한 위치로
          }
        } else {
          video.currentTime = targetTime;
        }
      }
    } catch (e) {
      console.error('영상 이동 중 오류:', e);
    }
  }

  // 페이지 새로고침 함수
  refreshPage() {
    window.location.reload();
  }

  // 유틸리티 버튼들 생성 (끝으로, 새로고침)
  createUtilityButtons(player) {
    const leftControls = player.querySelector('.ytp-left-controls');
    if (!leftControls) return;

    // 기존 유틸리티 버튼들 제거
    this.removeExistingUtilityButtons();

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

    // 마지막으로 버튼 생성
    const jumpButton = document.createElement('button');
    jumpButton.className = 'ytp-button ytp-custom-jump-button';
    jumpButton.title = '영상 마지막 부분으로 이동';
    jumpButton.style.cssText = buttonStyle;
    jumpButton.textContent = '마지막으로';
    jumpButton.addEventListener('click', () => this.jumpToEnd());

    // 새로고침 버튼 생성
    const refreshButton = document.createElement('button');
    refreshButton.className = 'ytp-button ytp-custom-refresh-button';
    refreshButton.title = '페이지 새로고침';
    refreshButton.style.cssText = buttonStyle;
    refreshButton.textContent = '새로고침';
    refreshButton.addEventListener('click', () => this.refreshPage());

    // 호버 효과 추가
    [jumpButton, refreshButton].forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'transparent';
      });
    });

    // 버튼 배치 - 음소거 버튼 앞에 배치
    const muteButton = leftControls.querySelector('.ytp-mute-button');
    if (muteButton) {
      muteButton.insertAdjacentElement('beforebegin', jumpButton);
      jumpButton.insertAdjacentElement('afterend', refreshButton);
      return;
    }

    // 볼륨 패널 앞에 배치
    const volumePanel = leftControls.querySelector('.ytp-volume-panel');
    if (volumePanel) {
      volumePanel.insertAdjacentElement('beforebegin', jumpButton);
      jumpButton.insertAdjacentElement('afterend', refreshButton);
      return;
    }

    // 시간 표시 앞에 배치
    const timeDisplay = leftControls.querySelector('.ytp-time-display');
    if (timeDisplay) {
      timeDisplay.insertAdjacentElement('beforebegin', jumpButton);
      jumpButton.insertAdjacentElement('afterend', refreshButton);
      return;
    }

    // 마지막: 왼쪽 컨트롤 맨 뒤에 추가
    leftControls.appendChild(jumpButton);
    leftControls.appendChild(refreshButton);
  }

  // 기존 유틸리티 버튼들 제거
  removeExistingUtilityButtons() {
    document.querySelectorAll('.ytp-custom-jump-button, .ytp-custom-refresh-button').forEach(button => {
      button.remove();
    });
  }
}

new YoutubeController(); 