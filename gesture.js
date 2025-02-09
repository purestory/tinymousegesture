// 스타일 요소 생성 및 추가
const style = document.createElement('style');
style.textContent = `
  .gesture-arrow {
    position: fixed;
    pointer-events: none;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 48px;
    z-index: 10000;
    display: none;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease;
  }
  
  /* 마우스 드래그 중일 때 커서 숨기기 */
  .dragging {
    cursor: none !important;
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
let dragStartTime = 0;
let dragDistance = 0;

// 마우스 오른쪽 버튼 클릭 시작
document.addEventListener('mousedown', (e) => {
  if (e.button === 2) {
    dragStartTime = Date.now();
    isMouseDown = true;
    startX = e.clientX;
    startY = e.clientY;
    e.preventDefault();
  }
});

// 마우스 이동 감지
document.addEventListener('mousemove', (e) => {
  if (isMouseDown) {
    dragDistance = e.clientX - startX;
    
    // 드래그 시작 후 100ms가 지났을 때만 화살표 표시
    if (Date.now() - dragStartTime > 100) {
      document.body.classList.add('dragging');
      
      arrow.style.top = `${e.clientY}px`;
      arrow.style.left = `${e.clientX}px`;
      
      if (Math.abs(dragDistance) > 20) {
        arrow.style.display = 'block';
        // 드래그 거리에 따라 화살표 크기 조절
        const scale = Math.min(Math.abs(dragDistance) / 200 + 0.8, 1.5);
        arrow.style.transform = `translate(-50%, -50%) scale(${scale})`;
        
        arrow.innerHTML = dragDistance < 0 ? '←' : '→';
      } else {
        arrow.style.display = 'none';
      }
    }
    e.preventDefault();
  }
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

// 기본 컨텍스트 메뉴 완전히 방지
document.addEventListener('contextmenu', (e) => {
  if (Date.now() - dragStartTime > 100) {
    e.preventDefault();
  }
}); 