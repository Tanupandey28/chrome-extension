async function getSelectedText() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
    });
    return result;
}

async function saveHighlight(selectedText) {
    if (!selectedText) {
        alert('Please select some text to highlight!');
        return;
    }


    chrome.storage.local.get({ highlights: [] }, (data) => {
        const highlights = data.highlights;
        highlights.push(selectedText);
        chrome.storage.local.set({ highlights }, () => {
            console.log('Highlight saved:', selectedText);
            showHighlights();
        });
    });
}

function showHighlights() {
    chrome.storage.local.get({ highlights: [] }, (data) => {
        const list = document.getElementById('savedHighlights');
        list.innerHTML = '';
        data.highlights.forEach((text, index) => {
            const li = document.createElement('li');
            li.textContent = text;

            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => deleteHighlight(index));

            li.appendChild(deleteButton);
            list.appendChild(li);
        });
    });
}

function deleteHighlight(index) {
    chrome.storage.local.get({ highlights: [] }, (data) => {
        const highlights = data.highlights;
        highlights.splice(index, 1); 
        chrome.storage.local.set({ highlights }, () => {
            console.log('Highlight deleted');
            showHighlights(); 
        });
    });
}

document.getElementById('highlightBtn').addEventListener('click', async () => {
    const selectedText = await getSelectedText();
    saveHighlight(selectedText);
});


showHighlights();

chrome.action.onClicked.addListener(tab => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            alert('Click inside the page and highlight text using the extension!');
        }
    });
});

chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
        document.addEventListener('mouseup', function (event) {
            const selection = window.getSelection();
            const selectedText = selection.toString();
            if (selectedText) {
                const rect = selection.getRangeAt(0).getBoundingClientRect();
                showPopup(rect, selectedText);
            }
        });
    }
});

function showPopup(rect, selectedText) {
    const popup = document.createElement('div');
    popup.id = 'highlightPopup';
    popup.style.position = 'absolute';
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.top = `${rect.top + window.scrollY - 30}px`;
    popup.style.padding = '8px 15px';
    popup.style.backgroundColor = '#333';
    popup.style.color = '#fff';
    popup.style.fontSize = '14px';
    popup.style.borderRadius = '8px';
    popup.style.cursor = 'pointer';
    popup.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
    popup.style.transition = 'background-color 0.3s';
    
    popup.innerText = 'Save Highlight';

    popup.addEventListener('click', () => {
        saveHighlight(selectedText);
        document.body.removeChild(popup);
    });

    
    popup.addEventListener('mouseover', () => {
        popup.style.backgroundColor = '#555';
    });

    popup.addEventListener('mouseout', () => {
        popup.style.backgroundColor = '#333';
    });

    document.body.appendChild(popup);
}

document.addEventListener('click', function (event) {
    if (!event.target.closest('#highlightPopup')) {
        const popup = document.getElementById('highlightPopup');
        if (popup) {
            document.body.removeChild(popup);
        }
    }
});
