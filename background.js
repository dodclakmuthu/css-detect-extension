chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message Received:', message);
    if (message.type === 'ELEMENT_STYLE_CHANGES') {
        console.log('🔄 External CSS Changes Detected:', message.changes);
        chrome.storage.local.set({ elementCssChanges: message.changes }, () => {
            chrome.runtime.sendMessage({ type: 'CSS_CHANGES_UPDATED', changes: message.changes });
        });
    }

    if (message.type === 'STYLESHEET_CSS_CHANGES') {
        console.log('🔄 Inline CSS Change Detected:', message.changes);
        chrome.storage.local.set({ styleSheetChanges: message.changes }, () => {
            chrome.runtime.sendMessage({ type: 'CSS_CHANGES_UPDATED', changes: message.changes });
        });
    }
});



chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log('Tab Activated:', activeInfo);
});