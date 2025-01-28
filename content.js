function findShortcutStoryElementAndAppendTimer(hasTimerStarted) { 
    const shortcutStoryModalContainerId = "story-dialog-parent";

    const storyModal = document.getElementById(shortcutStoryModalContainerId);

    if (!storyModal) {
        console.log("Story modal not found");
        return;
    }

    const harvestTimerID = "polaris-harvest-timer";

    if (storyModal) {
        const {
            storyId,
            storyName,
            storyPermaLink
        } = getShortcutStoryDetails();

        const elementToAppendId = document.getElementById('cid-breadcrumbs-story-dialog');
        if (elementToAppendId) {

            console.log("Element found to append timer.");
            if (!storyId || !storyName || !storyPermaLink) {
                console.log("Story details not found.");
                return;
            }

            createTimeActionButton("shortcut", elementToAppendId, harvestTimerID, storyId, storyName, storyPermaLink, hasTimerStarted);

            window._harvestPlatformConfig = {
                "applicationName": "Crowdlinker",
                "permalink": window.location.href,
                "skipStyling": true // Override the default styling
            };

            // Use to dispatch event after loading buttons
            const event = new CustomEvent("harvest-event:timers:add", {
                detail: { element: document.querySelector(".harvest-timer") }
            });
            document.querySelector("#harvest-messaging")?.dispatchEvent(event);
        }
    }
}

function findGoogleCalendarEventAndAppendTimer(hasTimerStarted) {
    const googleCalendarEventContainer = document.querySelector('[data-open-edit-note]') || document.querySelector('[data-is-adaptive]');
    const eventHeaderElement = document.querySelector('.wv9rPe');

    if (!googleCalendarEventContainer || !eventHeaderElement) {
        return;
    }


    const harvestTimerID = "polaris-harvest-timer";

    if (!document.getElementById(harvestTimerID)) {
        const eventName = googleCalendarEventContainer.querySelector('[data-text]')?.textContent;
        // For two different types of google calendar event modals
        // 1- Meeting Invites
        // 2- Focus Time
        const eventId = googleCalendarEventContainer.getAttribute('data-eventid') || googleCalendarEventContainer.querySelector('[data-eventid]')?.getAttribute('data-eventid');

        createTimeActionButton("google-calendar", eventHeaderElement, harvestTimerID, eventId, eventName, '', hasTimerStarted);

        window._harvestPlatformConfig = {
            "applicationName": "Crowdlinker",
            "permalink": window.location.href,
            "skipStyling": true // Override the default styling
        };

        // Use to dispatch event after loading buttons
        const event = new CustomEvent("harvest-event:timers:add", {
            detail: { element: document.querySelector(".harvest-timer") }
        });
        document.querySelector("#harvest-messaging")?.dispatchEvent(event);
    }

}

console.log("Content script loaded.");

window.addEventListener("load", () => {
    console.log("Window loaded.", { window });

    // TODO: Not working as expected, need to fix this
    // function observeDOM() {
    //     const observer = new MutationObserver(() => {
    //       console.log("DOM mutation detected.");
    //       detectStoryAndAppendTimerElement();
    //     });

    //     observer.observe(document.body, { childList: true, subtree: true });
    //   }
    setInterval(() => {
        chrome.storage.sync.get(['shortcutCheckBox', 'googleCalendarCheckBox', 'harvest_timer_started'], (result) => {
            const { shortcutCheckBox, googleCalendarCheckBox, harvest_timer_started } = result;
            if(window.location.href.includes(APP_CONSTANTS.SHORTCUT.baseDomain)) {
                if(shortcutCheckBox) {
                    findShortcutStoryElementAndAppendTimer(!!harvest_timer_started?.external_reference);
                } else if(!harvest_timer_started) {
                    const timerElement = document.getElementById("polaris-harvest-timer");
                    if (timerElement) {
                        timerElement.remove();
                    }
                }

            } else if(window.location.href.includes(APP_CONSTANTS.GOOGLE_CALENDAR.baseDomain)) {
                if(googleCalendarCheckBox) {
                    findGoogleCalendarEventAndAppendTimer(!!harvest_timer_started?.external_reference);
                } else if(!harvest_timer_started) {
                    const timerElement = document.getElementById("polaris-harvest-timer");
                    if (timerElement) {
                        timerElement.remove();
                    }
                }
            }
        });
    }, 500);
});


function getShortcutStoryDetails() {
    const storyDialogElement = document.querySelector(".story-dialog");

    if (!storyDialogElement) {
        return null;
    }

    const storyId = storyDialogElement?.getAttribute("data-id");
    const storyName = storyDialogElement?.querySelector(".story-name")?.textContent;

    const storyAttributesElement = storyDialogElement?.querySelector(".story-attributes");
    const storyPermaLink = storyAttributesElement?.querySelector('.attribute > span+button')?.baseURI;

    return {
        storyId,
        storyName,
        storyPermaLink
    };

}

// Using Standard JavaScript:
document.body.addEventListener("harvest-event:ready", function (event) {
    console.log("Harvest Buttons are ready.");
});


// Listen for messages from the injected script
window.onmessage = (event) => {
    if (event.origin !== APP_CONSTANTS.HARVEST.baseDomain) {
        return;
    }

    console.log(`Received message`);
    const { type, value } = event.data;

    if (type === "timer:started") {
        console.log("Timer started.");
        handleStartTimeEvent(value);
    }

    if (type === "timer:stopped") {
        console.log("Timer stopped.");
        handleStopTimeEvent(value)
    }
};

function createTimeActionButton(type, elementToAppend, harvestTimerID, id, name, storyPermaLink, hasTimerStarted) {
        
    let buttonElement = document.getElementById("start_time_btn");
    if (!buttonElement) {
        buttonElement = document.createElement('button');
    }

    buttonElement.id = "start_time_btn";
    buttonElement.className = "harvest-timer";
    buttonElement.setAttribute('data-id', id);
    buttonElement.style = "background: transparent; cursor: pointer; padding: 8px; border-radius: 8px; border: 1px solid grey; color: #fff; font-weight: 700; font-size: 14px; border: none;";
    

    buttonElement.innerHTML = hasTimerStarted ? "Stop Timer" : "Start Timer";
    buttonElement.style.backgroundColor = hasTimerStarted ? "rgb(189 54 54)" : "#188433";

    switch (type) {
        case "shortcut":
            buttonElement.dataset.item = JSON.stringify({
                "id": id,
                "name": `${id} - ${name}`,
                "permalink": storyPermaLink || '',
                "type": "shortcut_app"
            });

            break;
        case "google-calendar":
            buttonElement.dataset.item = JSON.stringify({
                "id": id,
                "name": `Meeting - ${name}`,
                "permalink": APP_CONSTANTS.GOOGLE_CALENDAR.baseDomain,
                "type": "google_calendar"
            });

    }

    timerElement = document.getElementById("polaris-harvest-timer") || document.createElement('div');

    switch (type) {
        case "shortcut":
            timerElement.style = "float:right; margin: 0px 20px;";
            break;
        case "google-calendar":
            timerElement.style = "float:right; margin: 0px 20px; position: absolute; left: 0; margin-top: 4px;";
            break;
    }

    timerElement.id = harvestTimerID;
    timerElement.innerHTML = `
        <div class="harvest_timer_btn_div"> </div>
    `;

    timerElement.appendChild(buttonElement);

    elementToAppend.appendChild(timerElement);
}


function handleStartTimeEvent(eventValue) {
    const buttonElement = document.getElementById("start_time_btn");

    if (buttonElement) {
        buttonElement.innerHTML = "Stop Timer";
        buttonElement.style.backgroundColor = "rgb(189 54 54)";

        if (eventValue?.external_reference?.permalink?.includes(APP_CONSTANTS.SHORTCUT.baseDomain) || eventValue?.external_reference?.permalink?.includes(APP_CONSTANTS.GOOGLE_CALENDAR.baseDomain)) {
            const serviceType = getServiceTypeByDomain(eventValue?.external_reference?.permalink);
            chrome.storage.sync.set({ 'harvest_timer_started': {
                ...eventValue,
                service_type: serviceType
            } });
        }
    }
}

function getServiceTypeByDomain(domain) {
    if (domain.includes(APP_CONSTANTS.SHORTCUT.baseDomain)) {
        return "shortcut";
    }

    if (domain.includes(APP_CONSTANTS.GOOGLE_CALENDAR.baseDomain)) {
        return "google_calendar";
    }
}

function handleStopTimeEvent(eventValue) {
    const buttonElement = document.getElementById("start_time_btn");

    if (buttonElement) {
        buttonElement.innerHTML = "Start Timer";
        buttonElement.style.backgroundColor = "#188433";

        if (eventValue?.external_reference?.permalink?.includes(APP_CONSTANTS.SHORTCUT.baseDomain) || eventValue?.external_reference?.permalink?.includes(APP_CONSTANTS.GOOGLE_CALENDAR.baseDomain)) {
            chrome.storage.sync.remove('harvest_timer_started');
        }

    }
}


// Listen for chrome storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if(namespace === 'sync'){
        if(changes.harvest_timer_started) {
            const olderValue = changes?.harvest_timer_started?.oldValue;
            const newValue = changes?.harvest_timer_started?.newValue; 

            // Timer stopped state, since value is removed
            if(!newValue && olderValue?.external_reference) {
                handleStopTimeEvent(olderValue);
            }
        }
    }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'harvestAppDetected') {
        // Check if timer is stopped
        const stopTimerElement = document.querySelector(".js-stop-timer");
        if(!stopTimerElement) {
            console.log("No timer is running.");
            return;
        }

        stopTimerElement.addEventListener('click', () => {
            console.log("Timer stopped.");  
            chrome.storage.sync.remove('harvest_timer_started');
        });
    }

    return true;
});
