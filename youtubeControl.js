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
    this.setupMessageListener(); // 메시지 리스너 설정
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

  // 백그라운드 스크립트로부터 메시지를 수신하여 skipTime을 업데이트
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'updateSkipTime') {
        this.skipTime = request.skipTime || this.skipTime;
        console.log('스킵 시간이 업데이트되었습니다:', this.skipTime);
        // 버튼이 이미 생성되었다면 타이틀 업데이트
        this.updateButtonTitles();
      }
      return true; // 비동기 응답을 위해 true를 반환할 수 있습니다.
    });
  }

  // UI 관련 설정
  setupControls() {
    this.removeExistingButtons();
    
    // 플레이어가 로드될 때까지 기다립니다.
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

    // SVG 아이콘 스타일
    const svgStyle = `
      width: 100%; height: 100%;
      fill: currentColor;
      filter: drop-shadow(0 1px 1px rgba(0,0,0,0.5));
    `;
    const buttonStyle = `
        width: 48px; height: 48px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
    `;

    // 뒤로가기 버튼
    const backwardButton = playButton.cloneNode(true);
    backwardButton.className = 'ytp-button ytp-custom-backward-button';
    backwardButton.innerHTML = `<div style="${buttonStyle}"><svg style="${svgStyle}" viewBox="0 0 24 24"><path d="M11.5,12l8.5,6V6M11.5,6v12H10V6M10,12L1.5,18V6L10,12z"></path></svg></div>`;
    Object.assign(backwardButton.style, { margin: '0 4px', opacity: '0.9' });
    backwardButton.onclick = () => this.skip(-this.skipTime);

    // 앞으로가기 버튼
    const forwardButton = playButton.cloneNode(true);
    forwardButton.className = 'ytp-button ytp-custom-forward-button';
    forwardButton.innerHTML = `<div style="${buttonStyle}"><svg style="${svgStyle}" viewBox="0 0 24 24"><path d="M12.5,12l-8.5,6V6M12.5,18V6h1.5V18M14,12l8.5,6V6L14,12z"></path></svg></div>`;
    Object.assign(forwardButton.style, { margin: '0 4px', opacity: '0.9' });
    forwardButton.onclick = () => this.skip(this.skipTime);

    // 버튼 추가
    playButton.insertAdjacentElement('afterend', forwardButton);
    playButton.insertAdjacentElement('afterend', backwardButton);

    this.updateButtonTitles(); // 버튼 타이틀 초기 설정

    // 마우스 호버 효과
    [backwardButton, forwardButton].forEach(button => {
      button.addEventListener('mouseover', () => { button.style.opacity = '1'; });
      button.addEventListener('mouseout', () => { button.style.opacity = '0.9'; });
    });
  }

  updateButtonTitles() {
    const backwardButton = document.querySelector('.ytp-custom-backward-button');
    if (backwardButton) backwardButton.title = `${this.skipTime}초 뒤로`;

    const forwardButton = document.querySelector('.ytp-custom-forward-button');
    if (forwardButton) forwardButton.title = `${this.skipTime}초 앞으로`;
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

// 페이지 로드 시 컨트롤러 인스턴스 생성
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.youtubeController) {
      window.youtubeController = new YoutubeController();
    }
  });
} else {
  if (!window.youtubeController) {
    window.youtubeController = new YoutubeController();
  }
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
  if (window.youtubeController) {
    window.youtubeController.destroy();
  }
});
