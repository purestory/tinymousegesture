chrome.storage.local.get('isUnblocked', (data) => {
  const toggleSwitch = document.getElementById('toggleProtection');
  toggleSwitch.checked = data.isUnblocked;
});

async function sendMessageToTab(message) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id && !tab.url.startsWith('chrome://')) {
      await chrome.tabs.sendMessage(tab.id, message);
    }
  } catch (error) {
    console.error('메시지 전송 오류:', error);
  }
}

document.getElementById('toggleProtection').addEventListener('change', async (e) => {
  const newState = e.target.checked;
  try {
    await chrome.storage.local.set({ isUnblocked: newState });
    await sendMessageToTab({
      action: "toggleUnblock",
      state: newState
    });
  } catch (error) {
    console.error('토글 상태 설정 오류:', error);
  }
  setTimeout(() => window.close(), 200);
});