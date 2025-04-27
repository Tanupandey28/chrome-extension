chrome.action.onClicked.addListener(tab => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        alert('Click inside the page and highlight text using the extension!');
      }
    });
  });
  