let currentState = {
  isUnblocked: false
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('isUnblocked', (data) => {
    currentState.isUnblocked = data.isUnblocked || false;
    chrome.storage.local.set(currentState, () => {
      if (chrome.runtime.lastError) {
        console.error('Error setting currentState:', chrome.runtime.lastError);
      }
      updateContextMenu();
    });
  });
});

function updateContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "toggleUnblock",
      title: currentState.isUnblocked ? "Disable Copy Protection ✓" : "Enable Copy Protection",
      contexts: ["action"]
    });
  });
}

async function toggleState(tab) {
  currentState.isUnblocked = !currentState.isUnblocked;
  try {
    await chrome.storage.local.set(currentState);
    updateContextMenu();
    if (tab && tab.id) {
      await chrome.tabs.sendMessage(tab.id, {
        action: "toggleUnblock",
        state: currentState.isUnblocked
      });
    }
  } catch (error) {
    console.error('Error toggling state:', error);
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggleUnblock") {
    toggleState(tab);
  }
});