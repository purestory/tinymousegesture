let currentState = {
  isUnblocked: false
};

// 초기 상태 설정
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('isUnblocked', (data) => {
    currentState.isUnblocked = data.isUnblocked || false;
    chrome.storage.local.set(currentState);
    updateContextMenu();
  });
});

// 컨텍스트 메뉴 업데이트
function updateContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "toggleUnblock",
      title: currentState.isUnblocked ? "Disable Protection Bypass ✓" : "Enable Protection Bypass",
      contexts: ["all"]
    });
  });
}

// 상태 변경 및 전파
async function toggleState(tab) {
  currentState.isUnblocked = !currentState.isUnblocked;
  await chrome.storage.local.set(currentState);
  updateContextMenu();
  
  // 현재 활성 탭에만 메시지 전송
  if (tab && tab.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: "toggleUnblock",
        state: currentState.isUnblocked
      });
    } catch (error) {
      console.error('탭 통신 오류:', error);
    }
  }
}

// 메뉴 클릭 이벤트
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggleUnblock") {
    toggleState(tab);
  }
}); 