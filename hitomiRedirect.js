// hitomiRedirect.js - 히토미 사이트의 링크를 자동으로 reader 페이지로 리디렉션합니다.
(function() {
  // 히토미 사이트인지 확인
  if (!window.location.hostname.includes('hitomi.la')) return;

  // 현재 URL이 이미 reader 페이지인 경우 무시
  if (window.location.href.includes('/reader/')) return;
  
  // 갤러리 페이지 자동 리디렉션 처리
  function redirectToReader() {
    // 현재 URL이 갤러리 페이지 형식인지 확인 (/[type]/[title]-[language]-[id].html)
    const currentUrl = window.location.href;
    const galleryPattern = /hitomi\.la\/([^\/]+)\/([^\/]+?)(?:-[a-zA-Z\u3131-\u318E\uAC00-\uD7A3]+)?-(\d+)\.html/;
    const matches = currentUrl.match(galleryPattern);
    
    if (matches) {
      const type = matches[1]; // 타입 (doujinshi, cg 등)
      const id = matches[3];   // 갤러리 ID
      
      // reader 페이지 URL 구성
      const readerUrl = `https://hitomi.la/${type}/reader/${id}.html`;
      
      // 페이지 리디렉션
      window.location.href = readerUrl;
    }
  }
  
  // 페이지의 모든 갤러리 링크를 reader 링크로 변경
  function modifyGalleryLinks() {
    // 히토미 갤러리 링크 패턴
    const linkPattern = /hitomi\.la\/([^\/]+)\/([^\/]+?)(?:-[a-zA-Z\u3131-\u318E\uAC00-\uD7A3]+)?-(\d+)\.html/;
    
    // 페이지의 모든 링크 검사
    const links = document.querySelectorAll('a[href*="hitomi.la/"]');
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      const matches = href.match(linkPattern);
      
      if (matches) {
        const type = matches[1]; // 타입 (doujinshi, cg 등)
        const id = matches[3];   // 갤러리 ID
        
        // reader 페이지 URL로 링크 변경
        const readerUrl = `https://hitomi.la/${type}/reader/${id}.html`;
        link.setAttribute('href', readerUrl);
      }
    });
  }
  
  // 히토미 메인 페이지나 목록 페이지인 경우 링크 수정
  if (window.location.pathname === '/' || 
      window.location.pathname.includes('index') || 
      window.location.pathname.includes('/tag/') ||
      window.location.pathname.includes('/series/') ||
      window.location.pathname.includes('/artist/')) {
    
    // 페이지 로드 후 링크 수정
    modifyGalleryLinks();
    
    // 동적으로 추가되는 링크도 처리하기 위해 MutationObserver 사용
    const observer = new MutationObserver((mutations) => {
      modifyGalleryLinks();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
  } else {
    // 갤러리 페이지인 경우 자동 리디렉션
    redirectToReader();
  }
})();
