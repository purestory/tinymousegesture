// 초기 상태 로드
chrome.storage.local.get('isUnblocked', (data) => {
  const toggleSwitch = document.getElementById('toggleProtection');
  toggleSwitch.checked = data.isUnblocked;
});

// 현재 탭에 메시지 전송
async function sendMessageToTab(message) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id && !tab.url.startsWith('chrome://')) {
      await chrome.tabs.sendMessage(tab.id, message).catch(() => {
        // 메시지 전송 실패 시 무시 (정상적인 동작)
      });
    }
  } catch (error) {
    // 에러 무시 (정상적인 동작)
  }
}

// 클릭 이벤트 처리
document.getElementById('toggleProtection').addEventListener('change', async (e) => {
  const newState = e.target.checked;
  
  await chrome.storage.local.set({ isUnblocked: newState });
  
  // 현재 탭에 상태 변경 메시지 전송
  await sendMessageToTab({
    action: "toggleUnblock",
    state: newState
  });
  
  // 약간의 지연 후 팝업 닫기 (애니메이션을 볼 수 있도록)
  setTimeout(() => window.close(), 200);
}); 