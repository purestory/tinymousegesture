const style = `
  .gesture-container {
    position: fixed !important;
    pointer-events: none !important;
    background: rgba(0, 0, 0, 0.8) !important;
    width: 300px !important;
    height: 300px !important;
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
    gap: 80px !important;
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
    transform: translateY(30px) rotate(135deg) !important;
  }
  .arrow-right .gesture-icon {
    transform: translateY(30px) rotate(-45deg) !important;
  }
  .gesture-text {
    color: white !important;
    font-size: 24px !important;
    font-weight: bold !important;
    margin-top: 0 !important;
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

`;

class GestureNavigator {
  constructor() {
    this.isMouseDown = false;
    this.startX = 0;
    this.startY = 0;
    this.dragDistance = 0;
    this.isGesturing = false;
    this.skipContextMenu = false;
    this.texts = this.getLocalizedTexts();
    this.initialize();
  }

  initialize() {
    this.createGestureContainer();
    this.setupEventListeners();
  }

  createGestureContainer() {
    const container = document.createElement('div');
    container.className = 'gesture-container';
    container.innerHTML = `
      <div class="gesture-arrow"></div>
      <div class="gesture-text"></div>
    `;
    document.body.appendChild(container);
    this.container = container;
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
        th: "ย้อนกลับ",   // Thai
        fa: "بازگشت"      // Persian (Farsi)
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
        fa: "ادامه"       // Persian (Farsi)
      }
    };
    const langCode = (navigator.language || navigator.userLanguage).split('-')[0];
    return {
      back: texts.back[langCode] || texts.back.en,
      forward: texts.forward[langCode] || texts.forward.en
    };
  }

  // 마우스 다운 이벤트 처리 (오른쪽 클릭)
  handleMouseDown(e) {
    if (e.button === 2) {
      this.isMouseDown = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.dragDistance = 0;
    }
  }

  // 마우스 이동 이벤트 처리
  handleMouseMove(e) {
    if (!this.isMouseDown) return;
    
    this.dragDistance = e.clientX - this.startX;
    
    if (Math.abs(this.dragDistance) > 20) {
      this.isGesturing = true;
      document.documentElement.classList.add('dragging');
      
      this.container.classList.add('visible');
      this.container.classList.toggle('arrow-left', this.dragDistance < 0);
      this.container.classList.toggle('arrow-right', this.dragDistance > 0);
      
      const textElement = this.container.querySelector('.gesture-text');
      if (textElement) {
        textElement.textContent = this.dragDistance < 0 ? this.texts.back : this.texts.forward;
      }
      
      e.preventDefault();
      e.stopPropagation();
    }
  }

  // 마우스 업 이벤트 처리
  handleMouseUp(e) {
    if (this.isMouseDown && e.button === 2) {
      if (Math.abs(this.dragDistance) > 100) {
        if (this.dragDistance < 0) {
          history.back();
        } else {
          history.forward();
        }
        this.skipContextMenu = true;
      }
      this.resetGestureState();
    }
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
    this.container.classList.remove('visible', 'arrow-left', 'arrow-right');
    document.documentElement.classList.remove('dragging');
  }

  setupEventListeners() {
    const events = {
      'mousedown': this.handleMouseDown.bind(this),
      'mousemove': this.handleMouseMove.bind(this),
      'mouseup': this.handleMouseUp.bind(this),
      'contextmenu': this.handleContextMenu.bind(this)
    };

    Object.entries(events).forEach(([event, handler]) => {
      document.addEventListener(event, handler, { capture: true });
    });

    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  handleMessage(message) {
    // Implementation of handleMessage method
  }
}

new GestureNavigator();