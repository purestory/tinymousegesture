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
    z-index: 10000;
    display: none;
    transform: translate(-50%, -50%);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .dragging {
    cursor: none !important;
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
  }

  .arrow-left::after {
    transform: translate(-50%, -50%) rotate(135deg);
  }

  .arrow-right::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
`;
document.head.appendChild(style);

// 화살표 요소 생성
const arrow = document.createElement('div');
arrow.className = 'gesture-arrow';
document.body.appendChild(arrow);

let isMouseDown = false;
let startX = 0;
let startY = 0;
let dragDistance = 0;

// 마우스 오른쪽 버튼 클릭 시작
document.addEventListener('mousedown', (e) => {
  if (e.button === 2) {
    isMouseDown = true;
    startX = e.clientX;
    startY = e.clientY;
    e.preventDefault();
  }
});

// 마우스 이동 감지
document.addEventListener('mousemove', (e) => {
  if (!isMouseDown) return;
  
  dragDistance = e.clientX - startX;
  
  document.body.classList.add('dragging');
  
  if (Math.abs(dragDistance) > 20) {
    arrow.style.display = 'block';
    arrow.style.left = e.clientX + 'px';
    arrow.style.top = e.clientY + 'px';
    arrow.className = 'gesture-arrow ' + (dragDistance < 0 ? 'arrow-left' : 'arrow-right');
  } else {
    arrow.style.display = 'none';
  }
  
  e.preventDefault();
});

// 마우스 버튼 놓을 때
document.addEventListener('mouseup', (e) => {
  if (isMouseDown && e.button === 2) {
    if (Math.abs(dragDistance) > 100) {
      if (dragDistance < 0) {
        history.back();
      } else {
        history.forward();
      }
    }
    
    isMouseDown = false;
    dragDistance = 0;
    arrow.style.display = 'none';
    document.body.classList.remove('dragging');
    e.preventDefault();
  }
});

// 기본 컨텍스트 메뉴 방지
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
}); 