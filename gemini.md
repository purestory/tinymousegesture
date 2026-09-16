# Antigravity (Gemini) Rules for Chrome Extension Development

이 문서는 크롬 확장 프로그램 개발 및 타겟 웹사이트의 동작(DOM, JS)을 우회/수정할 때 발생할 수 있는 시행착오를 방지하기 위한 지침입니다. 코드를 작성하거나 수정할 때 다음 원칙을 반드시 준수하세요.

## 1. 사이트 스크립트 우회 시 주의사항 (MAIN World vs ISOLATED World)
크롬 확장 프로그램의 기본 Content Script는 **ISOLATED world**에서 실행됩니다. 따라서 페이지 내의 전역 변수(`window.xxx`)나 함수를 직접 수정해도 실제 웹페이지에는 반영되지 않습니다.

- **[잘못된 방법] Inline Script 주입 금지**: `document.createElement('script')` 후 `script.textContent = '...'`로 코드를 욱여넣는 방식은 피하세요. 최신 웹사이트들은 **CSP (Content-Security-Policy)** 설정으로 인해 `unsafe-inline` 스크립트 실행을 차단하는 경우가 많습니다. 이 경우 에러 로그 없이 조용히 실행이 실패하여 왜 코드가 안 먹히는지 찾기 어려워집니다.
- **[올바른 방법] Manifest V3의 `"world": "MAIN"` 사용**: 페이지의 자바스크립트 환경에 직접 개입해야 한다면, `manifest.json`의 `content_scripts` 선언부에 `"world": "MAIN"` 옵션을 추가한 별도의 js 파일을 만들어 주입하세요. CSP 제약을 우회하면서도 `document_start` 시점에 안전하고 확실하게 코드를 메인 컨텍스트에서 실행할 수 있습니다.

## 2. 지역 변수(IIFE/Closure) 한계 극복
목표 웹사이트의 로직이 즉시실행함수(IIFE) 내부에 갇혀 있는 경우 (예: `(function(){ var AD_SECONDS = 5; })()`), 외부에서 `window.AD_SECONDS = 0;` 이나 `Object.defineProperty`를 사용해 값을 덮어쓸 수 없습니다.

- **해결책 (Global API Hooking)**: 이 경우 변수 자체를 건드리기보다는 해당 변수를 사용하는 **전역 함수(Global API)를 가로채는(Hooking) 방식**을 사용해야 합니다.
- **예시 (타이머 무력화)**: 타이머 대기 시간이 지역 변수에 갇혀 있다면, MAIN world에서 `window.setInterval`이나 `window.setTimeout`을 오버라이드하세요. 콜백 함수(fn)의 내용을 `toString()`으로 검사한 뒤, 타겟 함수일 경우 delay 값을 강제로 10ms 등으로 줄여버리면 대기 시간을 효과적으로 무력화할 수 있습니다.

## 3. 코드 수정 (Replace) 시 문법 훼손 주의
- 코드를 교체하거나 삭제할 때(`multi_replace_file_content` 등 사용), 중괄호(`{`, `}`)나 제어문(`if`)이 짝이 맞지 않게 삭제되지 않도록 컨텍스트를 반드시 두 번 확인하세요. 
- 스크립트 덩어리를 삭제하다가 윗줄에 있던 `if (...) {` 블록의 시작점까지 날려버려 Syntax Error가 발생하는 일이 없도록 주의해야 합니다.
