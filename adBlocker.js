// 광고 및 팝업 차단 스크립트
(function() {
  // 이미 로드되었으면 중복 실행 방지
  if (window.__AdBlockerInitialized) return;
  window.__AdBlockerInitialized = true;
  
  // 사이트 확인
  const hostname = window.location.hostname;
  const isHitomiSite = hostname.includes('hitomi.la');
  const isTwidougaSite = hostname.includes('twidouga.net');
  
  // 차단할 도메인 목록
  const blockedDomains = [
    'stripchatgirls',
    'stripchat',
    'chaturbate',
    'livejasmin',
    'biotrck',
    'trafficjunky',
    'adskeeper',
    'ad-maven',
    'ads',
    'banner',
    'popunder',
    'pop',
    'promo'
  ];
  
  // 투명한 오버레이 제거 함수
  function removeTransparentOverlays() {
    try {
      // 투명한 전체 화면 오버레이 찾기
      const overlays = document.querySelectorAll('div[style*="position: fixed"]');
      overlays.forEach(overlay => {
        const style = window.getComputedStyle(overlay);
        const opacity = parseFloat(style.getPropertyValue('opacity')) || 1;
        const zIndex = parseInt(style.getPropertyValue('z-index')) || 0;
        const rect = overlay.getBoundingClientRect();
        
        // 전체 화면 차지하고 투명하거나 높은 z-index를 가진 요소 제거
        if (rect.width > window.innerWidth * 0.8 && rect.height > window.innerHeight * 0.8) {
          if (opacity < 0.3 || zIndex > 1000) {
            console.log('투명 오버레이 제거:', overlay);
            overlay.remove();
          }
        }
      });
      
      // 특정 스타일의 투명 오버레이 제거
      document.querySelectorAll('div[style*="opacity: 0.01"], div[style*="opacity:0.01"]').forEach(el => el.remove());
    } catch (error) {
      console.error('오버레이 제거 오류:', error);
    }
  }
  
  // CSS로 광고 및 팝업 차단
  function addBlockingStyles() {
    const styleEl = document.createElement('style');
    styleEl.id = 'ad-blocker-style';
    styleEl.textContent = `
      /* 투명한 오버레이 차단 */
      div[style*="position: fixed"][style*="inset: 0"],
      div[style*="position: fixed"][style*="top: 0"][style*="left: 0"][style*="width: 100%"],
      div[style*="position: fixed"][style*="opacity: 0.01"],
      div[style*="position: fixed"][style*="opacity:0.01"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -9999 !important;
      }
      
      /* 콘텐츠 표시 보장 */
      #cover, #display, .gallery, .content, #image-container, #content-container,
      .cover, .image, .image-container, .thumbnail-container,
      img[src*="hitomi"], img[src*="image"], img[data-src] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 리디렉션 차단 강화 함수
  function preventRedirects() {
    // 원래 window.location 객체 저장
    const originalLocation = window.location;
    let lastLocation = window.location.href;
    
    // window.location 재정의
    Object.defineProperty(window, 'location', {
      get: function() {
        return originalLocation;
      },
      set: function(value) {
        // 문자열인 경우 URL로 처리
        if (typeof value === 'string') {
          const lowercaseUrl = value.toLowerCase();
          const isBlocked = blockedDomains.some(domain => lowercaseUrl.includes(domain));
          
          if (isBlocked) {
            console.log('차단된 리디렉션:', value);
            return; // 리디렉션 차단
          }
        }
        // 차단되지 않은 URL은 정상 처리
        originalLocation.href = value;
      }
    });
    
    // 리디렉션 방지를 위한 추가 보호
    if (isTwidougaSite) {
      // twidouga.net의 페이지 이동 방지 (특정 이벤트에서)
      window.addEventListener('click', function(e) {
        // 일반 클릭은 허용하고, 특수 이벤트만 검사
        setTimeout(() => {
          // 리디렉션 시도 감지 (URL 변경)
          if (window.location.href !== lastLocation) {
            const newUrl = window.location.href;
            const isBlocked = blockedDomains.some(domain => newUrl.toLowerCase().includes(domain));
            
            if (isBlocked) {
              console.log('클릭 후 차단된 리디렉션 시도:', newUrl);
              history.pushState(null, '', lastLocation); // 원래 URL로 되돌림
            } else {
              lastLocation = newUrl;
            }
          }
        }, 50);
      }, true);
      
      // 동영상 링크 클릭 시 팝언더 방지
      document.addEventListener('click', function(e) {
        // 동영상 링크 또는 섬네일 클릭 처리
        if (e.target.tagName === 'A' || 
            e.target.closest('a') || 
            e.target.classList.contains('thumb') || 
            e.target.classList.contains('thumbnail')) {
          
          // 원래 창에서 리디렉션 방지 타이머 설정
          setTimeout(() => {
            // 현재 URL이 광고 URL인지 확인
            const currentUrl = window.location.href;
            const isAdUrl = blockedDomains.some(domain => currentUrl.toLowerCase().includes(domain));
            
            // 광고 URL로 바뀐 경우 원래 페이지로 돌아가기
            if (isAdUrl || currentUrl !== lastLocation) {
              console.log('동영상 클릭 후 리디렉션 차단:', currentUrl);
              history.pushState(null, '', lastLocation);
            }
          }, 100);
        }
      }, true);
    }
    
    // window.open 재정의 - 광고 팝업 차단
    const originalOpen = window.open;
    window.open = function(url, name, specs) {
      if (!url) return null;
      
      // 광고 URL 확인
      const isAdUrl = blockedDomains.some(domain => {
        return url.toLowerCase().includes(domain);
      });
      
      if (isAdUrl) {
        console.log('광고 팝업 차단:', url);
        return null; // 광고 팝업 차단
      }
      
      // 정상 URL은 원래 함수로 처리
      return originalOpen.call(this, url, name, specs);
    };
    
    // twidouga 사이트 특별 처리
    if (isTwidougaSite) {
      // 페이지 히스토리 조작 감지 및 차단
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(state, title, url) {
        if (url) {
          const isAdUrl = blockedDomains.some(domain => url.toLowerCase().includes(domain));
          if (isAdUrl) {
            console.log('pushState 리디렉션 차단:', url);
            return;
          }
        }
        return originalPushState.apply(this, arguments);
      };
      
      history.replaceState = function(state, title, url) {
        if (url) {
          const isAdUrl = blockedDomains.some(domain => url.toLowerCase().includes(domain));
          if (isAdUrl) {
            console.log('replaceState 리디렉션 차단:', url);
            return;
          }
        }
        return originalReplaceState.apply(this, arguments);
      };
    }
  }
  
  // 페이지 로드 시 실행
  function init() {
    // 스타일 적용
    addBlockingStyles();
    
    // 투명 오버레이 제거
    removeTransparentOverlays();
    
    // 리디렉션 차단
    preventRedirects();
    
    // 주기적으로 투명 오버레이 검사
    setInterval(removeTransparentOverlays, 1000);
  }
  
  // 실행
  init();
})();