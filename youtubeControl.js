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
      width: 46px;
      height: 46px;
      border: none;
      background: transparent;
      color: white;
      cursor: pointer;
      padding: 0;
      margin: 0 2px;
      opacity: 0.9;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transform: translateY(2px);
    `;

    const svgStyle = `
      width: 32px;
      height: 32px;
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
        button.style.transform = 'translateY(2px) scale(1.1)';
        button.querySelector('svg').style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))';
      });
      button.addEventListener('mouseout', () => {
        button.style.opacity = '0.9';
        button.style.transform = 'translateY(2px)';
        button.querySelector('svg').style.filter = 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))';
      });
    });
  }

  skip(seconds) {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime += seconds;
    }
  }
}

new YoutubeController(); 