# tiny mouse gesture & etc.
> A lightweight Chrome extension for mouse gestures, copy protection bypass, and quick search. Focused on essential features for optimal performance.

# 타이니 마우스 제스처
> 마우스 제스처, 복사 방지 해제, 빠른 검색 기능을 제공하는 가벼운 크롬 확장프로그램입니다. 핵심 기능에만 집중하여 최적의 성능을 제공합니다.

## Features / 기능

### 1. Mouse Gesture / 마우스 제스처
- Right-click drag left/right for back/forward navigation
- Visual feedback with arrow indicators
- 오른쪽 클릭 후 좌우 드래그로 페이지 앞뒤 이동
- 화살표 표시로 직관적인 사용

### 2. Copy Protection Bypass / 복사 방지 해제
- Enable text selection and copying
- Toggle feature with one click
- 텍스트 선택 및 복사 가능
- 원클릭으로 기능 켜고 끄기

### 3. Quick Search / 빠른 검색
- Custom prefix for selected text search
- Right-click menu integration
- 선택한 텍스트에 접두어 추가 검색
- 우클릭 메뉴 통합

## Installation / 설치 방법

1. Download from Chrome Web Store (Coming Soon)
   크롬 웹 스토어에서 다운로드 (준비 중)

2. Manual Installation / 수동 설치
   ```bash
   git clone https://github.com/purestory/tiny-mouse-gesture.git
   ```
   - Open Chrome Extensions (chrome://extensions/)
   - Enable Developer Mode
   - Load unpacked extension
   - Select the cloned directory

## Tech Stack / 기술 스택
- Pure JavaScript (No dependencies)
- Chrome Extension APIs
- CSS3 for visual effects

## Browser Support / 브라우저 지원
- Chrome 88+
- Edge 88+ (Chromium-based)

## Multi-language Support / 다국어 지원
- English
- 한국어
- 日本語
- 中文(简体)
- 中文(繁體)

## License / 라이선스
MIT License

## Author / 작성자
purestory (https://github.com/purestory)

## Key Features / 주요 기능

### Fast & Lightweight Gesture Navigation / 빠르고 가벼운 제스처 네비게이션
- Right-click drag left: Go back / 오른쪽 클릭 후 왼쪽으로 드래그: 뒤로 가기
- Right-click drag right: Go forward / 오른쪽 클릭 후 오른쪽으로 드래그: 앞으로 가기
- Visual arrow feedback based on drag direction / 드래그 방향에 따른 시각적 화살표 표시
- Smooth animation effects / 부드러운 애니메이션 효과

### Simple Copy Protection Bypass / 간편한 복사 방지 해제
- Enable context menu on right-click blocked sites / 우클릭 차단된 사이트에서 컨텍스트 메뉴 활성화
- Enable text selection on drag-blocked sites / 드래그 차단된 사이트에서 텍스트 선택 가능
- Toggle bypass feature from extension menu / 확장 프로그램 메뉴에서 기능 켜고 끄기
- Automatic settings persistence / 설정 자동 저장

## Why It's Fast & Lightweight / 가볍고 빠른 이유
- Modular code structure for efficient management / 효율적인 관리를 위한 모듈식 코드 구조
- Optimized event handling with class-based architecture / 클래스 기반 아키텍처로 최적화된 이벤트 처리
- No external dependencies / 외부 라이브러리 의존성 없음
- Performance-focused implementation / 성능 중심 구현

## Project Structure / 프로젝트 구조

project-root/
├── manifest.json # Extension configuration / 확장프로그램 설정
├── popup.html # Extension popup UI / 팝업 UI
├── popup.js # Popup functionality / 팝업 기능
├── background.js # Background service worker / 백그라운드 서비스
├── gesture.js # Mouse gesture functionality / 마우스 제스처 기능
├── unblock.js # Copy protection bypass / 복사 방지 해제
├── searchModifier.js # Search prefix functionality / 검색 접두어 기능
│
└── icons/ # Extension icons / 확장프로그램 아이콘
├── icon16.png # Small icon / 작은 아이콘
├── icon48.png # Medium icon / 중간 아이콘
└── icon128.png # Large icon / 큰 아이콘

## How to Use / 사용 방법

### Gesture Navigation / 제스처 네비게이션
1. Press and hold right mouse button on any webpage / 웹페이지에서 오른쪽 마우스 버튼 누르고 유지
2. Drag left or right / 왼쪽 또는 오른쪽으로 드래그
3. Arrow indicator shows gesture direction / 화살표로 제스처 방향 표시
4. Release button to execute navigation / 버튼을 놓아 네비게이션 실행

### Copy Protection Bypass / 복사 방지 해제
1. Click extension icon / 확장 프로그램 아이콘 클릭
2. Toggle the switch to enable/disable / 스위치를 켜고 끄기
3. Works immediately without page reload / 페이지 새로고침 없이 즉시 적용

## Features / 특징

- Lightweight design focused on navigation and copy protection bypass
- Delayed context menu for accidental right-clicks
- Dynamic arrow size feedback
- Smooth animation for intuitive user experience
- Works on all websites
- Enhanced usability with copy protection bypass
- Automatic settings persistence
- Extension icons in 16x16, 48x48, 128x128 sizes

## Privacy / 개인정보 보호
This extension does not collect or transmit any personal data. See [PRIVACY.md](PRIVACY.md) for details.
이 확장 프로그램은 어떠한 개인정보도 수집하거나 전송하지 않습니다. 자세한 내용은 [PRIVACY.md](PRIVACY.md)를 참조하세요.

## Bug Reports and Feature Requests / 버그 신고 및 기능 요청
If you find a bug or want to suggest a new feature, please register it in GitHub Issues.
버그를 발견하거나 새로운 기능을 제안하고 싶으시다면 GitHub Issues에 등록해 주세요. 