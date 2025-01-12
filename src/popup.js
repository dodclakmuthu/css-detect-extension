document.addEventListener("DOMContentLoaded", () => {


    function displayChanges() {
        // 🟢 Fetch and Display CSS Changes
        chrome.storage.local.get(["elementCssChanges", "styleSheetChanges"], (data) => {
            console.log(data)
            const { elementCssChanges, styleSheetChanges } = data;

            if (elementCssChanges.length == 0 || styleSheetChanges.length == 0) {
                document.querySelector('.alert.has-changes').style.display = 'none';
                document.querySelector('.alert.no-changes').style.display = 'block';
                document.getElementById("save-changes").disabled = true;

            } else {
                document.querySelector('.alert.no-changes').style.display = 'none';
                document.querySelector('.alert.has-changes').style.display = 'block';
                document.getElementById("save-changes").disabled = false;
            }
        });
    }
    // 🟢 Save Changes to File
    document.getElementById("save-changes").addEventListener("click", async () => {
        try {
            displayChanges();
            const data = await chrome.storage.local.get(["elementCssChanges", "styleSheetChanges"]);
            const elementCssChanges = data.elementCssChanges || [];
            const styleSheetChanges = data.styleSheetChanges || [];
            console.log(styleSheetChanges);

            if (elementCssChanges.length === 0 && styleSheetChanges.length === 0) {
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

            const content1 = elementCssChanges.map(c => `/* ${c.type} in ${c.sheet}*/\n${c.newRule || ''}`).join("\n");
            await writable.write("/* Inline element CSS changes */\n");
            await writable.write(content1);


            const content2 = styleSheetChanges.map(c => `/* ${c.type} in ${c.sheet} */\n${c.newRule || ''}`).join("\n");
            await writable.write("\n\n\n\n/* Exsisting stylesheets related css changes */\n");
            await writable.write(content2);

            await writable.close();
        } catch (err) {
            console.error('Failed to save changes:', err);
        }
    });

    document.getElementById("detect-changes-btn").addEventListener('click', () => {
        // Send a message to the content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'RUN_DETECT_CHANGES' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                } else {
                    console.log('✅ Response from content script:', response);
                }
            });
        });
        
    });

    document.getElementById("clear-detect-btn").addEventListener('click', () => {
        chrome.storage.local.set({ elementCssChanges: '' });
        chrome.storage.local.set({ styleSheetChanges: '' });

        console.log('Local storage cleared successfully.');
        document.querySelector('.alert.has-changes').style.display = 'none';
        document.querySelector('.alert.no-changes').style.display = 'none';
        document.getElementById("save-changes").disabled = true;;
    })
});