// Save Input checkbox values in chrome storage

document.addEventListener('DOMContentLoaded', (e) => {
    let googleCalendarCheckbox = document.getElementById('google_calendar');
    let shortcutCheckbox = document.getElementById('shortcut');

    // Retrieve the timer values from chrome sync storage
    chrome.storage.sync.get(['harvest_timer_started'], (result) => {
        if(!result) return; 
        

         // !NOTE: This is needed to start the timer in Shortcut as "harvest-script" refers to this config to inject iFrame
         window._harvestPlatformConfig = {
            "applicationName": "Crowdlinker",
            "permalink": window.location.href,
            "skipStyling": true // Override the default styling
        };

        const timerData = result?.harvest_timer_started?.external_reference;
        const serviceType = result?.harvest_timer_started?.service_type;

        if (serviceType === "google_calendar") {
            const googleCalendarTimerElement = document.getElementById('gc_toggle_action');
            const googleCalendarToggleSwitch = document.getElementById('gc_toggle_switch');
            
            createStopTimerButton('google-calendar', googleCalendarTimerElement, timerData);
            googleCalendarToggleSwitch?.style.setProperty('display', 'none');

            googleCalendarCheckbox.setAttribute('disabled', true);

            const event = new CustomEvent("harvest-event:timers:add", {
                detail: { element: document.querySelector(".harvest-timer") }
            });
            document.querySelector("#harvest-messaging")?.dispatchEvent(event);
        }

        else if (serviceType === "shortcut") {
            const shortcutTimerElement = document.getElementById('shortcut_toggle_action');
            const shortcutToggleSwitch = document.getElementById('shortcut_toggle_switch');

            createStopTimerButton('shortcut', shortcutTimerElement, timerData);
            shortcutToggleSwitch?.style.setProperty('display', 'none');
            
            shortcutCheckbox.setAttribute('disabled', true);

            const event = new CustomEvent("harvest-event:timers:add", {
                detail: { element: document.querySelector(".harvest-timer") }
            });
            document.querySelector("#harvest-messaging")?.dispatchEvent(event);
        }
    });
    

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


function createStopTimerButton(type, elementToAppend, data) {
    let buttonElement = document.getElementById("stop_timer_btn");
    if (!buttonElement) {
        buttonElement = document.createElement('button');
    }

    buttonElement.id = "stop_timer_btn";
    buttonElement.className = "harvest-timer";
    buttonElement.style = "background: transparent; cursor: pointer; padding: 8px; border-radius: 8px; border: 1px solid grey; color: #fff; font-weight: 700; font-size: 14px; border: none;";
    buttonElement.innerHTML = 'Stop Timer';
    buttonElement.style.backgroundColor = 'rgb(189 54 54)';

    console.log({ data });
    buttonElement.dataset.item = JSON.stringify({
        id: data?.id,
        permalink: data.permalink,
    })


    let timerElement = document.createElement('div');
    timerElement.innerHTML = `
        <div class="harvest_timer_btn_div"> </div>
    `;

    timerElement.appendChild(buttonElement);

    elementToAppend.appendChild(timerElement);
    
}

window.onmessage = (event) => {
    const { type, value } = event.data;

    if(type === "timer:stopped") {
        if (value?.external_reference?.permalink?.includes('https://app.shortcut.com') || value?.external_reference?.permalink?.includes('https://calendar.google.com')) {
            chrome.storage.sync.remove('harvest_timer_started');           
        }

        // Remove the "stop" button
        const buttonElement = document.getElementById("stop_timer_btn");
        if(buttonElement) {
                buttonElement.remove();
        }

        // Mark the checkbox as enabled
        const googleCalendarToggleSwitch = document.getElementById('gc_toggle_switch');
        const shortcutToggleSwitch = document.getElementById('shortcut_toggle_switch');

        if(googleCalendarToggleSwitch) {
            googleCalendarToggleSwitch.style.setProperty('display', 'block');
        }

        if(shortcutToggleSwitch) {
            shortcutToggleSwitch.style.setProperty('display', 'block');
        }
        
    }
}
