// 페이지 컨텍스트에 주입될 핵심 광고 스킵 로직
function injectedScript() {
  console.log('[YT Ad Skipper] 주입된 스크립트 실행 중.');

  let wasAdPlaying = false;
  let originalVideoState = { muted: false, playbackRate: 1.0 };

  const adSkipper = () => {
    const adblockWarning = document.querySelector('ytd-enforcement-message-view-model, [class*="enforcement-message"]');
    if (adblockWarning && adblockWarning.offsetParent !== null) {
      console.log('[YT Ad Skipper] 애드블록 방지 메시지를 발견하여 제거합니다.');
      adblockWarning.remove();
      const video = document.querySelector('video');
      if (video && video.paused) {
        video.play();
      }
      return;
    }

    const player = document.querySelector('#movie_player');
    const isAd = player && player.classList.contains('ad-showing');
    const video = document.querySelector('video');

    if (isAd && video) {
      if (!wasAdPlaying) {
        originalVideoState = { muted: video.muted, playbackRate: video.playbackRate };
        console.log('[YT Ad Skipper] 광고 시작. 비디오 상태 저장됨:', originalVideoState);
      }
      wasAdPlaying = true;

      const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
      if (skipButton && skipButton.offsetParent !== null) {
        console.log('[YT Ad Skipper] 건너뛰기 버튼 클릭.');
        skipButton.click();
        return;
      }

      // 건너뛸 수 없는 광고 처리
      video.muted = true;
      video.playbackRate = 16;

    } else if (wasAdPlaying) {
      console.log('[YT Ad Skipper] 광고 종료. 비디오 상태를 복원합니다.');
      if (video) {
        video.muted = originalVideoState.muted;
        video.playbackRate = originalVideoState.playbackRate;
      }
      wasAdPlaying = false;
    }
  };

  setInterval(adSkipper, 300);
}


class YoutubeController {
  constructor() {
    this.skipTime = 10; // 기본 스킵 시간 10초로 설정
    this.isAdPlaying = false;
    this.observer = null;
    this.adStateInterval = null; // 인터벌 ID 저장
    this.initialize();
  }

  initialize() {
    this.initializeState();
    this.injectScript();
    this.setupMessageListener();
    this.setupControlsObserver();
    this.setupAdStateMonitor(); // 광고 상태 모니터링 시작
  }

  injectScript() {
    try {
      const scriptId = 'yt-ad-skipper-script';
      if (document.getElementById(scriptId)) return;
      const script = document.createElement('script');
      script.id = scriptId;
      script.textContent = `(${injectedScript.toString()})();`;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    } catch (e) {
      console.error('스크립트 주입 실패:', e);
    }
  }

  async initializeState() {
    try {
      const data = await chrome.storage.local.get('youtubeSkipTime');
      this.skipTime = data.youtubeSkipTime || 10; // 저장된 값이 없으면 10초
    } catch (error) {
      console.error('유튜브 컨트롤러 초기화 오류:', error);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'updateSkipTime') {
        this.skipTime = request.skipTime || this.skipTime;
        this.updateButtonTitles(); // 시간이 변경되면 버튼 타이틀 업데이트
      }
    });
  }

  setupControlsObserver() {
    this.observer = new MutationObserver(() => {
      const leftControls = document.querySelector('.ytp-left-controls');
      if (leftControls && !document.querySelector('.ytp-custom-forward-button')) {
          this.createButtons();
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  // 광고 상태를 주기적으로 확인하여 버튼 상태 변경
  setupAdStateMonitor() {
    if (this.adStateInterval) clearInterval(this.adStateInterval);
    this.adStateInterval = setInterval(() => {
      const player = document.querySelector('#movie_player');
      const isAd = player && player.classList.contains('ad-showing');

      if (isAd !== this.isAdPlaying) {
        this.isAdPlaying = isAd;
        this.updateButtonsForAdState();
      }
    }, 500);
  }

  createButtons() {
    const leftControls = document.querySelector('.ytp-left-controls');
    if (!leftControls) return;

    this.removeExistingButtons();

    const playButton = leftControls.querySelector('.ytp-play-button');
    if (!playButton) return;

    const svgStyle = `width: 100%; height: 100%; fill: currentColor; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.5));`;
    const buttonStyle = `width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer;`;

    const backwardButton = playButton.cloneNode(true);
    backwardButton.className = 'ytp-button ytp-custom-backward-button';
    backwardButton.innerHTML = `<div style="${buttonStyle}"><svg style="${svgStyle}" viewBox="0 0 24 24"><path d="M11.5,12l8.5,6V6M11.5,6v12H10V6M10,12L1.5,18V6L10,12z"></path></svg></div>`;
    Object.assign(backwardButton.style, { margin: '0 4px', opacity: '0.9' });
    backwardButton.onclick = () => this.skip(-this.skipTime);

    const forwardButton = playButton.cloneNode(true);
    forwardButton.className = 'ytp-button ytp-custom-forward-button';
    forwardButton.innerHTML = `<div style="${buttonStyle}"><svg style="${svgStyle}" viewBox="0 0 24 24"><path d="M12.5,12l-8.5,6V6M12.5,18V6h1.5V18M14,12l8.5,6V6L14,12z"></path></svg></div>`;
    Object.assign(forwardButton.style, { margin: '0 4px', opacity: '0.9' });
    forwardButton.onclick = () => this.skip(this.skipTime);

    playButton.insertAdjacentElement('afterend', forwardButton);
    playButton.insertAdjacentElement('afterend', backwardButton);

    this.updateButtonTitles(); // 초기 타이틀 설정
    this.updateButtonsForAdState(); // 현재 광고 상태에 맞게 버튼 즉시 업데이트

    [backwardButton, forwardButton].forEach(button => {
      button.addEventListener('mouseover', () => { button.style.opacity = '1'; });
      button.addEventListener('mouseout', () => { button.style.opacity = '0.9'; });
    });
  }

  // 광고 상태에 따라 버튼의 기능과 모양을 업데이트
  updateButtonsForAdState() {
    const forwardButton = document.querySelector('.ytp-custom-forward-button');
    const backwardButton = document.querySelector('.ytp-custom-backward-button');

    if (!forwardButton || !backwardButton) return;

    if (this.isAdPlaying) {
      forwardButton.onclick = () => this.skip(30);
      forwardButton.title = '30초 건너뛰기';
      backwardButton.style.display = 'none'; // 광고 중에는 뒤로가기 버튼 숨김
    } else {
      forwardButton.onclick = () => this.skip(this.skipTime);
      backwardButton.style.display = 'flex'; // 광고 끝나면 다시 표시
      this.updateButtonTitles(); // 일반 상태의 타이틀로 복원
    }
  }

  updateButtonTitles() {
    // 광고 중이 아닐 때만 일반 타이틀로 설정
    if (!this.isAdPlaying) {
      const backwardButton = document.querySelector('.ytp-custom-backward-button');
      if (backwardButton) backwardButton.title = `${this.skipTime}초 뒤로`;

      const forwardButton = document.querySelector('.ytp-custom-forward-button');
      if (forwardButton) forwardButton.title = `${this.skipTime}초 앞으로`;
    }
  }

  skip(seconds) {
    const video = document.querySelector('video');
    if (video) video.currentTime += seconds;
  }

  removeExistingButtons() {
    document.querySelectorAll('.ytp-custom-backward-button, .ytp-custom-forward-button').forEach(b => b.remove());
  }

  destroy() {
    if (this.observer) this.observer.disconnect();
    if (this.adStateInterval) clearInterval(this.adStateInterval);
    this.removeExistingButtons();
    console.log('YoutubeController 정리 완료');
  }
}

// 스크립트 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.youtubeController) window.youtubeController = new YoutubeController();
  });
} else {
  if (!window.youtubeController) window.youtubeController = new YoutubeController();
}

window.addEventListener('beforeunload', () => {
  if (window.youtubeController) window.youtubeController.destroy();
});
