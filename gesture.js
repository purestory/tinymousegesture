// 스타일 요소 생성 및 추가
const style = document.createElement('style');
style.textContent = `
  .gesture-arrow {
    position: fixed;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.8);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    z-index: 2147483647;
    display: none;
    transform: translate(-50%, -50%);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  html.dragging, 
  html.dragging *,
  body.dragging,
  body.dragging * {
    cursor: none !important;
    user-select: none !important;
    -webkit-user-select: none !important;
  }

  .arrow-left::after, .arrow-right::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    border: solid white;
    border-width: 0 6px 6px 0;
    display: inline-block;
    transform-origin: center;
  }

  .arrow-left::after {
    transform: translate(-30%, -50%) rotate(135deg);
  }

  .arrow-right::after {
    transform: translate(-70%, -50%) rotate(-45deg);
  }
`;
document.head.appendChild(style);

// 화살표 요소 생성
const arrow = document.createElement('div');
arrow.className = 'gesture-arrow';
document.documentElement.appendChild(arrow);

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

  // 화살표 요소 생성
  createArrowElement() {
    const arrow = document.createElement('div');
    arrow.className = 'gesture-arrow';
    document.documentElement.appendChild(arrow);
    return arrow;
  }

  // 초기 상태 설정
  async initializeState() {
    try {
      const data = await chrome.storage.local.get('isUnblocked');
      this.isUnblocked = data.isUnblocked || false;
      if (this.isUnblocked) {
        this.unblockAll();
      }
    } catch (error) {
      console.error('상태 초기화 실패:', error);
    }
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    document.addEventListener('mousedown', this.handleMouseDown.bind(this), { capture: true });
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), { capture: true });
    document.addEventListener('mouseup', this.handleMouseUp.bind(this), { capture: true });
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this), { capture: true });
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  // 마우스 다운 이벤트 처리
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
      
      this.arrow.style.cssText = `
        display: block;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
      `;
      this.arrow.className = 'gesture-arrow ' + (this.dragDistance < 0 ? 'arrow-left' : 'arrow-right');
      e.preventDefault();
      e.stopPropagation();
    }
  }

  // 마우스 업 이벤트 처리
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

  // 컨텍스트 메뉴 이벤트 처리
  handleContextMenu(e) {
    if (this.isGesturing) {
      e.preventDefault();
      e.stopPropagation();
      this.isGesturing = false;
    }
  }

  // 메시지 이벤트 처리
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

  // 제스처 상태 초기화
  resetGestureState() {
    this.isMouseDown = false;
    this.dragDistance = 0;
    this.arrow.style.display = 'none';
    document.documentElement.classList.remove('dragging');
  }

  // 차단 해제 적용
  unblockAll() {
    document.documentElement.classList.add('unblock-all');
    this.setupUnblockEvents();
  }

  // 차단 복원
  restoreBlock() {
    document.documentElement.classList.remove('unblock-all');
    location.reload();
  }

  // 차단 해제 이벤트 설정
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