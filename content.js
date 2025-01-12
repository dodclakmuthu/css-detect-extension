// Monitor Inline CSS and External CSS Changes
let previousCSSState = [];

// 🟢 Capture the current CSS state
function captureCSSState() {
    return Array.from(document.styleSheets).map((sheet) => {
        try {
            return {
                href: sheet.href,
                rules: Array.from(sheet.cssRules || []).map(rule => rule.cssText)
            };
        } catch (e) {
            console.warn('Cannot access stylesheet:', sheet.href, e);
            return { href: sheet.href, rules: [] };
        }
    });
}

// 🟢 Detect changes between previous and current CSS state
function detectExternalCSSChanges() {
    try {
        const currentCSSState = captureCSSState();
        if (previousCSSState.length === 0) {
            previousCSSState = currentCSSState;
            return;
        }

        const changes = [];

        currentCSSState.forEach((currentSheet, index) => {
            const previousSheet = previousCSSState[index];
            if (!previousSheet) return;

            if (currentSheet.rules.length !== previousSheet.rules.length) {
                changes.push({
                    type: 'rule-added-or-removed',
                    sheet: currentSheet.href || 'inline stylesheet'
                });
            } else {
                currentSheet.rules.forEach((rule, i) => {
                    if (rule !== previousSheet.rules[i]) {
                        changes.push({
                            type: 'rule-modified',
                            sheet: currentSheet.href || 'inline stylesheet',
                            oldRule: previousSheet.rules[i],
                            newRule: rule
                        });
                    }
                });
            }
        });
        if (changes.length > 0) {
            chrome.runtime.sendMessage({ type: 'STYLESHEET_CSS_CHANGES', changes });
        }

        previousCSSState = currentCSSState;
    } catch (e) {
        console.log(e)
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'RUN_DETECT_CHANGES') {
        detectExternalCSSChanges();
        sendResponse({ status: 'External CSS changes detected' });
    }
});

// 🟢 Observe Inline CSS Changes
const inlineObserver = new MutationObserver((mutations) => {
    const changes = [];

    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {

            const oldStyle = mutation.oldValue;
            const newStyle = mutation.target.getAttribute('style');
            if (newStyle === oldStyle) return;

            let tag = mutation.target.tagName.toLowerCase()
            let selector = tag;
            if (mutation.target.id) {
                selector += '#' + mutation.target.id;
            }
            if (mutation.target.className) {
                selector += '.' + mutation.target.className;
            }

            let newStyleString = selector + ' {' + newStyle + '}';
            changes.push({
                type: 'rule-modified',
                sheet: 'element style change on element : ' + selector,
                oldRule: oldStyle,
                newRule: newStyleString,
            });
        }
    });

    if (changes.length > 0) {
        chrome.runtime.sendMessage({ type: 'ELEMENT_STYLE_CHANGES', changes });
    }
});

inlineObserver.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['style'],
    attributeOldValue: true
});

// Start initial state
previousCSSState = captureCSSState();
