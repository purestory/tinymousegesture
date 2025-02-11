const style = document.createElement('style');
style.textContent = `
  .gesture-arrow {
    position: fixed;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.8);
    width: 120px;
    height: 120px;
    border-radius: 10px;
    z-index: 2147483647;
    display: none;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .gesture-arrow::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60px;
    height: 60px;
    border: solid white;
    border-width: 0 8px 8px 0;
    display: inline-block;
    transform-origin: center;
  }

  .arrow-left::after {
    transform: translate(-30%, -50%) rotate(135deg);
  }

  .arrow-right::after {
    transform: translate(-70%, -50%) rotate(-45deg);
  }

  html.dragging, 
  html.dragging *,
  body.dragging,
  body.dragging * {
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
document.head.appendChild(style);

class GestureNavigator {
  constructor() {
    this.isMouseDown = false;
    this.startX = 0;
    this.startY = 0;
    this.dragDistance = 0;
    this.isGesturing = false;
    this.isUnblocked = false;
    
    this.arrow = this.createArrowElement();
    this.initializeState();
    this.setupEventListeners();
  }

  createArrowElement() {
    const arrow = document.createElement('div');
    arrow.className = 'gesture-arrow';
    document.documentElement.appendChild(arrow);
    return arrow;
  }

  async initializeState() {
    const data = await chrome.storage.local.get('isUnblocked');
    this.isUnblocked = data.isUnblocked || false;
    if (this.isUnblocked) {
      this.unblockAll();
    }
  }

  setupEventListeners() {
    document.addEventListener('mousedown', this.handleMouseDown.bind(this), { capture: true });
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), { capture: true });
    document.addEventListener('mouseup', this.handleMouseUp.bind(this), { capture: true });
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this), { capture: true });
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  handleMouseDown(e) {
    if (e.button === 2) {
      this.isMouseDown = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
    }
  }

  handleMouseMove(e) {
    if (!this.isMouseDown) return;
    
    this.dragDistance = e.clientX - this.startX;
    
    if (Math.abs(this.dragDistance) > 20) {
      this.isGesturing = true;
      document.documentElement.classList.add('dragging');
      
      // 화살표 표시
      this.arrow.style.display = 'block';
      this.arrow.className = 'gesture-arrow ' + (this.dragDistance < 0 ? 'arrow-left' : 'arrow-right');

      e.preventDefault();
      e.stopPropagation();
    }
  }

  handleMouseUp(e) {
    if (this.isMouseDown && e.button === 2) {
      if (Math.abs(this.dragDistance) > 20) {
        if (Math.abs(this.dragDistance) > 100) {
          if (this.dragDistance < 0) {
            history.back();
          } else {
            history.forward();
          }
        }
        e.preventDefault();
        e.stopPropagation();
        this.isGesturing = true;
      }
      
      this.resetGestureState();
    }
  }

  handleContextMenu(e) {
    if (this.isGesturing) {
      e.preventDefault();
      e.stopPropagation();
      this.isGesturing = false;
    }
  }

  handleMessage(request, sender, sendResponse) {
    if (request.action === "toggleUnblock") {
      this.isUnblocked = request.state;
      if (this.isUnblocked) {
        this.unblockAll();
      } else {
        this.restoreBlock();
      }
    }
  }

  resetGestureState() {
    this.isMouseDown = false;
    this.dragDistance = 0;
    this.arrow.style.display = 'none';
    document.documentElement.classList.remove('dragging');
  }

  unblockAll() {
    document.documentElement.classList.add('unblock-all');
    this.setupUnblockEvents();
  }

  restoreBlock() {
    document.documentElement.classList.remove('unblock-all');
    location.reload();
  }

  setupUnblockEvents() {
    const events = ['contextmenu', 'selectstart', 'copy', 'cut', 'paste', 'mousedown', 'mouseup', 'mousemove', 'drag', 'dragstart'];
    events.forEach(eventName => {
      document.addEventListener(eventName, (e) => {
        e.stopPropagation();
        return true;
      }, true);
    });
  }
}

// 인스턴스 생성
new GestureNavigator();