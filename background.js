chrome.runtime.onInstalled.addListener(async () => {
  try {
    const tab = await getCurrentTab();
    await executeScript(tab);
  } catch (err) {
    console.error(`Failed to fetch script: ${err}`);
  }
});


// Listener for tab update
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && (tab.url.startsWith('https://app.shortcut.com/') || tab.url.startsWith('https://calendar.google.com/'))) {
      await executeScript(tab);
  }

  await detectIfTimerStoppedFromHarvest(tab);
});

// Listener for tab change
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  await detectIfTimerStoppedFromHarvest(tab);
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

// Check if Harvest website is open in browser


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


async function detectIfTimerStoppedFromHarvest(tab) {

  if(!tab.url.includes("crowdlinker.harvestapp.com")) {
    return
  }

  if(!tab?.active) {
    return;
  }

  // Send message to content script to check if timer is timerStopped
  await chrome.tabs.sendMessage(tab.id, { action: 'harvestAppDetected' });
}
