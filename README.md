# Mouse Gesture & Copy Protection Bypass
> A lightweight and fast Chrome extension that enables mouse gestures for web page navigation and bypasses copy protection on websites. Focused solely on essential features for optimal performance and speed.

# 마우스 제스처 & 복사방지 해제
> 마우스 제스처로 웹 페이지를 앞뒤로 이동하고, 복사 방지된 사이트에서도 자유롭게 콘텐츠를 복사할 수 있는 크롬 확장프로그램입니다. 불필요한 기능을 제외하고 핵심 기능에만 집중하여 가볍고 빠른 실행 속도를 제공합니다.

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
├── manifest.json     # Extension configuration
├── popup.html       # Extension popup UI
├── popup.js        # Popup functionality
├── background.js   # Background service worker
├── gesture.js      # Mouse gesture functionality
├── unblock.js      # Copy protection bypass functionality
├── PRIVACY.md      # Privacy policy
└── icons/          # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png

## Installation / 설치 방법

1. Clone or download this repository / 이 저장소를 클론하거나 다운로드
   ```bash
   git clone https://github.com/purestory/mouse-gesture-navigation.git
   ```
2. Go to `chrome://extensions` in Chrome browser / 크롬 브라우저에서 `chrome://extensions` 접속
3. Enable "Developer mode" / "개발자 모드" 활성화
4. Click "Load unpacked extension" / "압축해제된 확장 프로그램을 로드합니다." 클릭
5. Select the downloaded folder / 다운로드한 폴더 선택

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

## Tech Stack / 기술 스택

- JavaScript (ES6+)
- Chrome Extension Manifest V3
- Chrome APIs (Storage, Tabs, Context Menus)
- Shadow DOM for isolated styles
- CSS3 Animations

## Developer / 개발자

[@purestory](https://github.com/purestory)

## License / 라이선스

MIT License

## Privacy / 개인정보 보호
This extension does not collect or transmit any personal data. See [PRIVACY.md](PRIVACY.md) for details.
이 확장 프로그램은 어떠한 개인정보도 수집하거나 전송하지 않습니다. 자세한 내용은 [PRIVACY.md](PRIVACY.md)를 참조하세요.

## Bug Reports and Feature Requests / 버그 신고 및 기능 요청
If you find a bug or want to suggest a new feature, please register it in GitHub Issues.
버그를 발견하거나 새로운 기능을 제안하고 싶으시다면 GitHub Issues에 등록해 주세요. 