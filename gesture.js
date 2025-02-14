class GestureNavigator {
  constructor() {
    this.isMouseDown = false;
    this.isGesturing = false;
    this.startX = 0;
    this.startY = 0;
    this.dragDistance = 0;
    this.skipContextMenu = false;
    this.texts = this.getLocalizedTexts();
    this.setupGestureUI();
    this.setupEventListeners();
  }

  setupGestureUI() {
    this.container = document.createElement('div');
    this.container.className = 'gesture-container';
    this.container.innerHTML = `
      <div class="gesture-icon"></div>
      <div class="gesture-text"></div>
    `;

    const style = document.createElement('style');
    style.textContent = `
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
      
      .dragging {
        cursor: none !important;
        user-select: none !important;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(this.container);
  }

  setupEventListeners() {
    document.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), true);
    document.addEventListener('mouseup', this.handleMouseUp.bind(this), true);
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this), true);
  }

  handleMouseDown(e) {
    if (e.button === 2) {
      this.isGesturing = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
    }
  }

  handleMouseMove(e) {
    if (!this.isGesturing) return;
    
    this.dragDistance = e.clientX - this.startX;
    
    if (Math.abs(this.dragDistance) > 20) {
      this.container.classList.add('visible');
      this.container.classList.toggle('arrow-left', this.dragDistance < 0);
      this.container.classList.toggle('arrow-right', this.dragDistance > 0);
      
      const text = this.container.querySelector('.gesture-text');
      text.textContent = this.dragDistance < 0 ? this.texts.back : this.texts.forward;
      
      e.preventDefault();
      e.stopPropagation();
    }
  }

  handleMouseUp(e) {
    if (!this.isGesturing) return;
    
    const deltaX = e.clientX - this.startX;
    if (Math.abs(deltaX) > 100) {
      e.preventDefault();
      e.stopPropagation();
      if (deltaX < 0) {
        history.back();
      } else {
        history.forward();
      }
      this.skipContextMenu = true;
    }
    this.isGesturing = false;
    this.resetGestureState();
  }

  handleContextMenu(e) {
    if (this.skipContextMenu) {
      e.preventDefault();
      this.skipContextMenu = false;
    }
  }

  resetGestureState() {
    this.dragDistance = 0;
    document.documentElement.classList.remove('dragging');
    this.container.classList.remove('visible', 'arrow-left', 'arrow-right');
  }

  getLocalizedTexts() {
    return {
      back: chrome.i18n.getMessage('gestureBack') || '뒤로',
      forward: chrome.i18n.getMessage('gestureForward') || '앞으로'
    };
  }
}

new GestureNavigator();