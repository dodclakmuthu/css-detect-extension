chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message Received:', message);
    if (message.type === 'ELEMENT_STYLE_CHANGES') {
        console.log('🔄 External CSS Changes Detected:', message.changes);
        chrome.storage.local.set({ elementCssChanges: message.changes });
    }

    if (message.type === 'INLINE_CSS_CHANGE') {
        console.log('🔄 Inline CSS Change Detected:', message.element);
        chrome.storage.local.set({ inlineCSSChange: message.element });
    }
});
