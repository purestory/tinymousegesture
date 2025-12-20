// 페이지 컨텍스트에 주입될 핵심 광고 스킵 로직
function injectedScript() {
  console.log('[YT Ad Skipper] 주입된 스크립트 실행 중.');

  let wasAdPlaying = false;
  // 광고 이후 비디오 상태를 복원하기 위해 원래 상태를 저장합니다.
  let originalVideoState = {
    muted: false,
    playbackRate: 1.0,
  };

  const adSkipper = () => {
    // 1. 애드블록 방지 팝업 처리
    const adblockWarning = document.querySelector('ytd-enforcement-message-view-model, [class*="enforcement-message"]');
    if (adblockWarning && adblockWarning.offsetParent !== null) {
      console.log('[YT Ad Skipper] 애드블록 방지 메시지를 발견하여 제거합니다.');
      adblockWarning.remove();
      const video = document.querySelector('video');
      if (video && video.paused) {
        video.play(); // 비디오 강제 재생
      }
      return; // 차단기 제거를 우선 처리
    }

    // 2. 광고 처리
    const player = document.querySelector('#movie_player');
    const isAd = player && player.classList.contains('ad-showing');

    if (isAd) {
      // 현재 광고가 표시되고 있습니다.
      const video = document.querySelector('video');
      if (!wasAdPlaying && video) {
        // 광고가 막 시작되었으므로 비디오 상태를 저장합니다.
        originalVideoState.muted = video.muted;
        originalVideoState.playbackRate = video.playbackRate;
        console.log('[YT Ad Skipper] 광고 시작. 비디오 상태 저장됨:', originalVideoState);
      }
      wasAdPlaying = true;

      // 먼저 건너뛰기 버튼을 클릭합니다.
      const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
      if (skipButton && skipButton.offsetParent !== null) {
        console.log('[YT Ad Skipper] 건너뛰기 버튼 클릭.');
        skipButton.click();
        return;
      }

      // 건너뛰기 버튼이 없다면, 건너뛸 수 없는 광고입니다. 음소거하고 숨깁니다.
      if (video) {
        video.muted = true;
        // 감지될 수 있는 빨리 감기 대신, 광고 컨테이너를 숨깁니다.
        if (player) player.style.visibility = 'hidden';
      }
    } else if (wasAdPlaying) {
      // 광고가 방금 끝났습니다. 비디오 상태를 복원합니다.
      console.log('[YT Ad Skipper] 광고 종료. 비디오 상태를 복원합니다.');
      const video = document.querySelector('video');
      if (video) {
        video.muted = originalVideoState.muted;
        video.playbackRate = originalVideoState.playbackRate;
        if (player) player.style.visibility = 'visible';
      }
      wasAdPlaying = false;
    }
  };

  // 주기적으로 스키퍼를 실행합니다.
  setInterval(adSkipper, 300); // 더 빠른 감지를 위해 300ms로 설정
}


class YoutubeController {
  constructor() {
    this.skipTime = 5; // 기본값 5초
    this.initializeState();
    this.setupControls(); // UI 버튼 설정
    this.injectScript(); // 핵심 로직 주입
  }

  // 페이지에 광고 스킵 스크립트를 주입하는 함수
  injectScript() {
    try {
      const scriptId = 'yt-ad-skipper-script';
      // 이미 주입된 스크립트가 있다면 중복 실행 방지
      if (document.getElementById(scriptId)) return;

      const script = document.createElement('script');
      script.id = scriptId;
      // 함수를 즉시 실행되는 함수 표현식(IIFE)으로 감싸서 주입
      script.textContent = `(${injectedScript.toString()})();`;

      (document.head || document.documentElement).appendChild(script);
      // 주입 후 DOM에서 스크립트 태그 정리
      script.remove();
      console.log('광고 스킵 스크립트가 페이지에 성공적으로 주입되었습니다.');
    } catch (e) {
      console.error('스크립트 주입 실패:', e);
    }
  }

  async initializeState() {
    try {
      const data = await chrome.storage.local.get('youtubeSkipTime');
      this.skipTime = data.youtubeSkipTime || 5;
    } catch (error) {
      console.error('유튜브 컨트롤러 초기화 오류:', error);
    }
  }

  // UI 관련 설정은 그대로 유지
  setupControls() {
    this.removeExistingButtons();
    
    const checkForPlayer = setInterval(() => {
      const player = document.querySelector('.html5-video-player');
      if (player) {
        clearInterval(checkForPlayer);
        this.createButtons(player);
      }
    }, 1000);
  }

  createButtons(player) {
    const leftControls = player.querySelector('.ytp-left-controls');
    if (!leftControls) return;

    this.removeExistingButtons();

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

    const backwardButton = playButton.cloneNode(true);
    backwardButton.className = 'ytp-button ytp-custom-backward-button';
    backwardButton.innerHTML = `
      <svg style="${svgStyle}" viewBox="0 0 24 24">
        <path d="M21,7L12,12l9,5V7z M11,7v10l-9-5L11,7z"/>
      </svg>
    `;
    Object.assign(backwardButton.style, { margin: '0 2px', opacity: '0.9' });
    backwardButton.title = `${this.skipTime}초 뒤로`;
    backwardButton.onclick = () => this.skip(-this.skipTime);

    const forwardButton = playButton.cloneNode(true);
    forwardButton.className = 'ytp-button ytp-custom-forward-button';
    forwardButton.innerHTML = `
      <svg style="${svgStyle}" viewBox="0 0 24 24">
        <path d="M3,7v10l9-5L3,7z M13,7v10l9-5L13,7z"/>
      </svg>
    `;
    Object.assign(forwardButton.style, { margin: '0 2px', opacity: '0.9' });
    forwardButton.title = `${this.skipTime}초 앞으로`;
    forwardButton.onclick = () => this.skip(this.skipTime);

    playButton.insertAdjacentElement('afterend', forwardButton);
    playButton.insertAdjacentElement('afterend', backwardButton);

    [backwardButton, forwardButton].forEach(button => {
      button.addEventListener('mouseover', () => { button.style.opacity = '1'; });
      button.addEventListener('mouseout', () => { button.style.opacity = '0.9'; });
    });
  }

  skip(seconds) {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime += seconds;
    }
  }

  removeExistingButtons() {
    document.querySelectorAll('.ytp-custom-backward-button, .ytp-custom-forward-button').forEach(button => {
      button.remove();
    });
  }

  destroy() {
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
