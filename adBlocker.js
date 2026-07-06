// 광고 및 팝업 차단 스크립트
(function() {
  if (window.__AdBlockerInitialized) return;
  window.__AdBlockerInitialized = true;
  
  const hostname = window.location.hostname;
  const isHitomiSite = hostname.includes('hitomi.la');
  const isTwidougaSite = hostname.includes('twidouga.net');
  const isSwiftUploadsSite = hostname.includes('swiftuploads.com');
  let isMrJavSite = false;
  try {
    isMrJavSite = hostname.includes('mrjav.net') || (window.top && window.top.location.hostname.includes('mrjav.net'));
  } catch(e) {}
  
  const blockedDomains = [
    'stripchatgirls', 'stripchat', 'chaturbate', 'livejasmin', 'biotrck',
    'trafficjunky', 'adskeeper', 'ad-maven', 'kilojaya', 'satisfiednews',
    'gullible-thanks', 'tsyndicate', 'alfalfaemployeeresource', 'few-politics',
    'waqool', 'rmhfrtnd', 'wpadmngr', 'mqy60aa7.shop'
  ];
  
  function removeTransparentOverlays() {
    try {
      const overlays = document.querySelectorAll('div[style*="position: fixed"]');
      overlays.forEach(overlay => {
        const style = window.getComputedStyle(overlay);
        const opacity = parseFloat(style.getPropertyValue('opacity')) || 1;
        const zIndex = parseInt(style.getPropertyValue('z-index')) || 0;
        const rect = overlay.getBoundingClientRect();
        
        if (rect.width > window.innerWidth * 0.8 && rect.height > window.innerHeight * 0.8) {
          if (opacity < 0.3 || zIndex > 1000) {
            console.log('투명 오버레이 제거:', overlay);
            overlay.remove();
          }
        }
      });
      document.querySelectorAll('div[style*="opacity: 0.01"], div[style*="opacity:0.01"]').forEach(el => el.remove());
    } catch (error) {}
  }
  
  function addBlockingStyles() {
    const styleEl = document.createElement('style');
    styleEl.id = 'ad-blocker-style';
    styleEl.textContent = `
      div[style*="position: fixed"][style*="inset: 0"],
      div[style*="position: fixed"][style*="top: 0"][style*="left: 0"][style*="width: 100%"],
      div[style*="position: fixed"][style*="opacity: 0.01"],
      div[style*="position: fixed"][style*="opacity:0.01"],
      div[data-banner-id],
      iframe[src*="waqool"],
      iframe[src*="rmhfrtnd"],
      iframe[src*="few-politics"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -9999 !important;
      }
      
      #cover, #display, .gallery, .content, #image-container, #content-container,
      .cover, .image, .image-container, .thumbnail-container,
      img[src*="hitomi"], img[src*="image"], img[data-src] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
    `;
    if (document.head) document.head.appendChild(styleEl);
    else if (document.documentElement) document.documentElement.appendChild(styleEl);
    else document.addEventListener('DOMContentLoaded', () => { if (document.head) document.head.appendChild(styleEl); });
  }

  function preventRedirects() {
    const originalLocation = window.location;
    let lastLocation = window.location.href;
    
    try {
      Object.defineProperty(window, 'location', {
        get: function() { return originalLocation; },
        set: function(value) {
          if (typeof value === 'string') {
            const lowercaseUrl = value.toLowerCase();
            const isBlocked = blockedDomains.some(domain => lowercaseUrl.includes(domain));
            if (isBlocked) {
              console.log('차단된 리디렉션:', value);
              return;
            }
          }
          originalLocation.href = value;
        }
      });
    } catch (e) {}
    
    if (isMrJavSite) {
      try {
        const pageId = btoa(window.location.pathname).substring(0, 16);
        sessionStorage.setItem('v_pop_' + pageId, '3');
      } catch (e) {}
    }

    if (isMrJavSite || isSwiftUploadsSite) {
      const injectPopupBlocker = () => {
        if (chrome.runtime && chrome.runtime.getURL) {
          const script = document.createElement('script');
          script.src = chrome.runtime.getURL('mrjavOverride.js');
          (document.head || document.documentElement).appendChild(script);
          script.onload = () => script.remove();
        }
      };
      if (document.head || document.documentElement) injectPopupBlocker();
      else document.addEventListener('DOMContentLoaded', injectPopupBlocker);
    }

    if (isTwidougaSite || isSwiftUploadsSite) {
      window.addEventListener('submit', function(e) {
        if (isSwiftUploadsSite && e.target && e.target.tagName === 'FORM') {
          const t = e.target.target ? e.target.target.toLowerCase() : '';
          if (t && !['_self', '_top', '_parent'].includes(t)) {
            e.preventDefault();
            console.log('폼 제출 팝언더 차단:', e.target.action);
            e.target.removeAttribute('target');
            if (!e.target.action.toLowerCase().includes(hostname)) e.preventDefault();
          }
        }
      }, true);

      window.addEventListener('click', function(e) {
        if (isSwiftUploadsSite) {
          const link = e.target.closest('a');
          if (link) {
            const href = link.href || '';
            const t = link.target ? link.target.toLowerCase() : '';
            const hasNewTabTarget = t && !['_self', '_top', '_parent'].includes(t);
            const isExternalHref = href && !href.toLowerCase().includes(hostname) && !href.startsWith('/') && !href.startsWith('javascript:');

            if (hasNewTabTarget || isExternalHref) {
              e.preventDefault();
              e.stopPropagation();
              console.log('격리세계 외부/팝업 링크 클릭 차단:', href, t);
              link.removeAttribute('target');
              if (isExternalHref) {
                 link.href = 'javascript:void(0)';
              } else {
                 if (href && href !== 'javascript:void(0)') window.location.href = href;
              }
            }
          }
        }
      }, true);

      if (isTwidougaSite) {
        window.addEventListener('click', function(e) {
          setTimeout(() => {
            if (window.location.href !== lastLocation) {
              const newUrl = window.location.href;
              const isBlocked = blockedDomains.some(domain => newUrl.toLowerCase().includes(domain));
              if (isBlocked) {
                console.log('클릭 후 차단된 리디렉션 시도:', newUrl);
                history.pushState(null, '', lastLocation);
              } else {
                lastLocation = newUrl;
              }
            }
          }, 50);
        }, true);
        
        document.addEventListener('click', function(e) {
          if (e.target.tagName === 'A' || e.target.closest('a') || e.target.classList.contains('thumb') || e.target.classList.contains('thumbnail')) {
            setTimeout(() => {
              const currentUrl = window.location.href;
              const isAdUrl = blockedDomains.some(domain => currentUrl.toLowerCase().includes(domain));
              if (isAdUrl || currentUrl !== lastLocation) {
                console.log('동영상 클릭 후 리디렉션 차단:', currentUrl);
                history.pushState(null, '', lastLocation);
              }
            }, 100);
          }
        }, true);
      }
    }
    
    if (isTwidougaSite) {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      history.pushState = function(state, title, url) {
        if (url && blockedDomains.some(domain => url.toLowerCase().includes(domain))) {
          console.log('pushState 리디렉션 차단:', url);
          return;
        }
        return originalPushState.apply(this, arguments);
      };
      history.replaceState = function(state, title, url) {
        if (url && blockedDomains.some(domain => url.toLowerCase().includes(domain))) {
          console.log('replaceState 리디렉션 차단:', url);
          return;
        }
        return originalReplaceState.apply(this, arguments);
      };
    }

    if (isSwiftUploadsSite) {
      // 진짜 버튼(Free Download)을 찾아 강제로 활성화하고 가짜 버튼을 숨깁니다.
      const forceButtonTimer = setInterval(() => {
        try {
          const buttons = document.querySelectorAll('button');
          let fakeBtn = null;
          let realBtn = null;
          
          buttons.forEach(btn => {
            const text = btn.textContent.trim();
            if (text.includes('Get Download Link')) fakeBtn = btn;
            if (text.includes('Free Download')) realBtn = btn;
          });
          
          if (fakeBtn && realBtn) {
            // 진짜 버튼이 화면에 보이지 않는 상태라면 강제로 표시
            const realStyle = window.getComputedStyle(realBtn);
            if (realStyle.display === 'none' || realStyle.visibility === 'hidden' || realBtn.offsetHeight === 0) {
              
              // 가짜 버튼 완전히 숨기기
              fakeBtn.style.setProperty('display', 'none', 'important');
              if (fakeBtn.parentElement) fakeBtn.parentElement.style.setProperty('display', 'none', 'important');
              
              // 진짜 버튼 강제 활성화
              realBtn.style.setProperty('display', 'block', 'important');
              realBtn.style.setProperty('visibility', 'visible', 'important');
              realBtn.style.setProperty('opacity', '1', 'important');
              realBtn.removeAttribute('disabled');
              
              // 광고 스크립트의 전역 클릭 이벤트 버블링 차단
              if (realBtn.dataset.adShield !== 'true') {
                realBtn.dataset.adShield = 'true';
                realBtn.addEventListener('click', function(e) {
                  e.stopPropagation();
                  console.log('진짜 다운로드 버튼 클릭: 광고 스크립트로의 이벤트 버블링 차단');
                });
              }
              
              // 부모 요소 중 숨겨진 것이 있다면 전부 해제
              let parent = realBtn.parentElement;
              while (parent && parent.tagName !== 'BODY') {
                if (window.getComputedStyle(parent).display === 'none' || parent.style.display === 'none') {
                  parent.style.setProperty('display', 'block', 'important');
                }
                parent = parent.parentElement;
              }
              
              console.log('가짜 버튼을 진짜 다운로드 버튼으로 강제 교체 완료!');
            }
          }
        } catch(e) {}
      }, 500);
    }
  }
  
  function init() {
    addBlockingStyles();
    removeTransparentOverlays();
    preventRedirects();
    setInterval(removeTransparentOverlays, 1000);
  }
  
  init();
})();