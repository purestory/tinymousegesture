const style = `
  .gesture-container {
    position: fixed !important;
    pointer-events: none !important;
    background: rgba(0, 0, 0, 0.8) !important;
    width: 400px !important;
    height: 400px !important;
    border-radius: 10px !important;
    z-index: 2147483647 !important;
    display: none;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    font-family: Arial, sans-serif !important;
    box-sizing: border-box !important;
  }
  .gesture-container.visible {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .gesture-icon {
    width: 120px !important;
    height: 120px !important;
    border: solid white !important;
    border-width: 0 16px 16px 0 !important;
    transform-origin: center !important;
    margin: 0 !important;
    padding: 0 !important;
    position: relative !important;
    display: block !important;
    box-sizing: border-box !important;
  }
  .arrow-left .gesture-icon {
    transform: rotate(135deg) !important;
  }
  .arrow-right .gesture-icon {
    transform: rotate(-45deg) !important;
  }
  .gesture-text {
    color: white !important;
    font-size: 24px !important;
    font-weight: bold !important;
    margin-top: 20px !important;
    text-align: center !important;
    width: auto !important;
    height: auto !important;
    position: relative !important;
    display: block !important;
    white-space: nowrap !important;
    font-family: Arial, sans-serif !important;
    text-shadow: none !important;
    line-height: normal !important;
    letter-spacing: normal !important;
  }
  html.dragging, 
  html.dragging *,
  body.dragging,
  body.dragging * {
    cursor: none !important;
    user-select: none !important;
    -webkit-user-select: none !important;
  }
  html.unblock-all *, 
  body.unblock-all * {
    -webkit-user-select: text !important;
    -moz-user-select: text !important;
    -ms-user-select: text !important;
    user-select: text !important;
    pointer-events: auto !important;
  }
`;

class GestureNavigator {
  constructor() {
    this.isMouseDown = false;
    this.startX = 0;
    this.startY = 0;
    this.dragDistance = 0;
    this.isGesturing = false;
    this.isUnblocked = false;
    this.skipContextMenu = false; // 제스처 후 컨텍스트 메뉴 차단용 플래그

    // 다국어 처리: 인구가 많은 20개국 언어 순서로 "뒤로"와 "앞으로"를 표현
    this.texts = this.getLocalizedTexts();

    // Shadow DOM을 이용해 UI 생성 (스타일 격리)
    this.ui = this.createUI();

    this.initializeState();
    this.setupEventListeners();
  }

  // 20개국 언어로 "뒤로"와 "앞으로"를 표현하고, 해당 언어가 없으면 영어로 표현
  getLocalizedTexts() {
    const texts = {
      back: {
        zh: "返回",       // Chinese
        es: "Atrás",      // Spanish
        en: "Back",       // English
        hi: "पीछे",      // Hindi
        ar: "للخلف",     // Arabic
        bn: "পিছনে",     // Bengali
        pt: "Voltar",     // Portuguese
        ru: "Назад",      // Russian
        ja: "戻る",       // Japanese
        pa: "ਪਿਛੇ",      // Punjabi
        de: "Zurück",     // German
        ko: "뒤로",       // Korean
        fr: "Précédent",  // French
        tr: "Geri",       // Turkish
        vi: "Quay lại",   // Vietnamese
        it: "Indietro",   // Italian
        nl: "Terug",      // Dutch
        pl: "Wstecz",     // Polish
        th: "ย้อนกลับ",    // Thai
        fa: "بازگشت"       // Persian (Farsi)
      },
      forward: {
        zh: "前进",       // Chinese
        es: "Adelante",   // Spanish
        en: "Forward",    // English
        hi: "आगे",       // Hindi
        ar: "للأمام",    // Arabic
        bn: "সামনে",     // Bengali
        pt: "Avançar",    // Portuguese
        ru: "Вперёд",     // Russian
        ja: "進む",       // Japanese
        pa: "ਅੱਗੇ",      // Punjabi
        de: "Vorwärts",   // German
        ko: "앞으로",      // Korean
        fr: "Suivant",    // French
        tr: "İleri",      // Turkish
        vi: "Tiến",       // Vietnamese
        it: "Avanti",     // Italian
        nl: "Vooruit",    // Dutch
        pl: "Dalej",      // Polish
        th: "ไปข้างหน้า",   // Thai
        fa: "ادامه"        // Persian (Farsi)
      }
    };
    const langCode = (navigator.language || navigator.userLanguage).split('-')[0];
    return {
      back: texts.back[langCode] || texts.back.en,
      forward: texts.forward[langCode] || texts.forward.en
    };
  }

  // Shadow DOM을 활용해 제스처 UI 요소 생성
  createUI() {
    const host = document.createElement('div');
    host.id = 'gesture-host';
    host.style.all = 'initial';

    const shadow = host.attachShadow({ mode: 'open' });
    const styleElem = document.createElement('style');
    styleElem.textContent = style;
    shadow.appendChild(styleElem);

    const container = document.createElement('div');
    container.className = 'gesture-container';
    const icon = document.createElement('div');
    icon.className = 'gesture-icon';
    const text = document.createElement('div');
    text.className = 'gesture-text';

    container.appendChild(icon);
    container.appendChild(text);
    shadow.appendChild(container);
    document.body.appendChild(host);

    return { host, container, icon, text };
  }

  // 마우스 다운 이벤트 처리 (오른쪽 클릭)
  handleMouseDown(e) {
    if (e.button === 2) {
      this.isMouseDown = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.dragDistance = 0;
      this.isGesturing = false;
    }
  }

  // 마우스 이동 이벤트 처리
  handleMouseMove(e) {
    if (!this.isMouseDown) return;
    this.dragDistance = e.clientX - this.startX;

    if (Math.abs(this.dragDistance) > 20) {
      this.isGesturing = true;
      document.documentElement.classList.add('dragging');

      if (!this.ui.container.classList.contains('visible')) {
        this.ui.container.classList.add('visible');
      }

      if (this.dragDistance < 0) {
        this.ui.container.classList.remove('arrow-right');
        this.ui.container.classList.add('arrow-left');
        this.ui.text.textContent = this.texts.back;
      } else {
        this.ui.container.classList.remove('arrow-left');
        this.ui.container.classList.add('arrow-right');
        this.ui.text.textContent = this.texts.forward;
      }

      e.preventDefault();
      e.stopPropagation();
    }
  }

  // 마우스 업 이벤트 처리
  handleMouseUp(e) {
    if (!this.isMouseDown) return;

    if (this.isGesturing) {
      e.preventDefault();
      e.stopPropagation();

      if (this.dragDistance < 0) {
        history.back();
      } else if (this.dragDistance > 0) {
        history.forward();
      }
      // 제스처 사용 후 컨텍스트 메뉴가 뜨지 않도록 플래그 설정
      this.skipContextMenu = true;
    }

    this.resetGestureState();
  }

  // 컨텍스트 메뉴 이벤트 처리
  handleContextMenu(e) {
    if (this.isGesturing || this.skipContextMenu) {
      e.preventDefault();
      e.stopPropagation();
      this.skipContextMenu = false;
    }
  }

  // 제스처 상태 초기화
  resetGestureState() {
    this.isMouseDown = false;
    this.dragDistance = 0;
    this.isGesturing = false;
    this.ui.container.classList.remove('visible', 'arrow-left', 'arrow-right');
    document.documentElement.classList.remove('dragging');
  }

  // 이벤트 리스너 등록
  setupEventListeners() {
    document.addEventListener('mousedown', this.handleMouseDown.bind(this), { capture: true });
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), { capture: true });
    document.addEventListener('mouseup', this.handleMouseUp.bind(this), { capture: true });
    window.addEventListener('mouseup', this.handleMouseUp.bind(this), { capture: true });
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this), { capture: true });
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  // 저장된 상태 초기화
  async initializeState() {
    try {
      const data = await chrome.storage.local.get('isUnblocked');
      this.isUnblocked = data.isUnblocked || false;
      if (this.isUnblocked) {
        this.unblockAll();
      }
    } catch (error) {
      console.error('initializeState error:', error);
    }
  }

  // 메시지 수신 핸들러
  handleMessage(request, sender, sendResponse) {
    if (request.action === 'toggleUnblock') {
      this.isUnblocked = request.state;
      if (this.isUnblocked) {
        this.unblockAll();
      } else {
        this.restoreBlock();
      }
    }
  }

  // 복사 보호 해제 (모든 요소 unblock)
  unblockAll() {
    document.documentElement.classList.add('unblock-all');
  }

  // 복사 보호 복원 (페이지 리로드)
  restoreBlock() {
    document.documentElement.classList.remove('unblock-all');
    location.reload();
  }
}

new GestureNavigator();