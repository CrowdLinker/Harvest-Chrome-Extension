// Save Input checkbox values in chrome storage

document.addEventListener('DOMContentLoaded', (e) => {
    let googleCalendarCheckbox = document.getElementById('google_calendar');
    let shortcutCheckbox = document.getElementById('shortcut');

    // Load saved checkbox values
    chrome.storage.sync.get(['googleCalendarCheckBox', 'shortcutCheckBox'], function(items) {
        shortcutCheckbox.checked = items.shortcutCheckBox || false;
        googleCalendarCheckbox.checked = items.googleCalendarCheckBox || false;
      });

    // Save checkbox values
    googleCalendarCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ 'googleCalendarCheckBox': googleCalendarCheckbox.checked });
    });

    shortcutCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ 'shortcutCheckBox': shortcutCheckbox.checked });
    });
});
