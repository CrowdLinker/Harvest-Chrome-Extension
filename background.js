chrome.runtime.onInstalled.addListener(async () => {
  try {
    const tab = await getCurrentTab();
    await executeScript(tab);
  } catch (err) {
    console.error(`Failed to fetch script: ${err}`);
  }
});

async function executeScript(tab) {
  try {
    // Avoid running in chrome:// pages
    if (tab.url.startsWith('chrome://')) {
      return;
    } 

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['harvest-script.js'],
    })
      .then(() => {
        console.log('Script injected successfully.');
      })
      .catch(err => {
        console.error(`Failed to inject script: ${err}`);
      });
  } catch (err) {
    console.error(`Failed to execute script: ${err}`);
  }
}


async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && (tab.url.startsWith('https://app.shortcut.com/') || tab.url.startsWith('https://calendar.google.com/'))) {
      await executeScript(tab);
  }
});

 // Listen for changes in local storage and update the timer display in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log({ changes, namespace })
  if (namespace === 'local') {
  }   
});


// !NOTE: Not used
async function checkIfHarvestTimerIsRunning() {
  try {
    const apiResponse = await fetch("https://api.harvestapp.com/v2/platform/running_time_entry", {
      method: "GET",
      // credentials: 'include'
    });

    const response = await apiResponse.json();
  } catch (error) {
    console.error("Failed to fetch running time entry.", error);
  }
}
