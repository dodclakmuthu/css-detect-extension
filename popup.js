document.addEventListener("DOMContentLoaded", () => {
    const cssList = document.getElementById("css-list");

    // 🟢 Fetch and Display CSS Changes
    chrome.storage.local.get(["cssChanges", "inlineCSSChange"], (data) => {
        const { cssChanges, inlineCSSChange } = data;

        if (cssChanges) {
            cssChanges.forEach(change => {
                const li = document.createElement("li");
                li.textContent = `Change in: ${change.sheet}, Type: ${change.type}`;
                cssList.appendChild(li);
            });
        }

        if (inlineCSSChange) {
            const li = document.createElement("li");
            li.textContent = `Inline CSS Change: ${inlineCSSChange}`;
            cssList.appendChild(li);
        }
    });

    // 🟢 Save Changes to File
    document.getElementById("save-changes").addEventListener("click", async () => {
        try {
            const data = await chrome.storage.local.get("cssChanges");
            const changes = data.cssChanges || [];

            if (changes.length === 0) {
                alert("No changes to save.");
                return;
            }

            const handle = await window.showSaveFilePicker({
                suggestedName: "styles-changes.css",
                types: [{
                    description: "CSS Files",
                    accept: { "text/css": [".css"] }
                }]
            });

            const writable = await handle.createWritable();
            const content = changes.map(c => `/* ${c.type} in ${c.sheet} */\n${c.newRule || ''}`).join("\n");

            await writable.write(content);
            await writable.close();

            alert("Changes saved successfully!");
        } catch (err) {
            console.error('Failed to save changes:', err);
        }
    });


    document.getElementById("detect-changes-btn").addEventListener('click', () => {
        // Send a message to the content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'RUN_DETECT_CHANGES' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError.message);
                } else {
                    console.log('✅ Response from content script:', response);
                }
            });
        });
    });
});
