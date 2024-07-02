function detectStoryAndAppendTimerElement() {
    const shortcutStoryModalContainerId = "story-dialog-parent";

    const storyModal = document.getElementById(shortcutStoryModalContainerId);

    if(!storyModal) {
        console.log("Story modal not found");
        return;
    }

    const harvestTimerID = "polaris-harvest-timer";

    if(storyModal) {
        // chrome.runtime.sendMessage({ action: 'checkIfHarvestTimerIsRunning' }, function(response) {
        // });

        const {
            storyId,
            storyName,
            storyPermaLink
        } = getShortcutStoryDetails();

        const elementToAppendId = document.getElementById('cid-breadcrumbs-story-dialog');
        const startTimerButton = document.getElementById(harvestTimerID);

        if(elementToAppendId) {
            
            console.log("Element found to append timer.");
            if(!storyId || !storyName || !storyPermaLink) {
                console.log("Story details not found.");
                return;
            }

            createStartTimerButton("shortcut", elementToAppendId, harvestTimerID, storyId, storyName, storyPermaLink);

            window._harvestPlatformConfig = {
                "applicationName": "Crowdlinker",
                "permalink": window.location.href,
                "skipStyling": true // Override the default styling
            };

            // Use to dispatch event after loading buttons
            const event = new CustomEvent("harvest-event:timers:add", {
                detail: { element: document.querySelector(".harvest-timer") }
            });
            document.querySelector("#harvest-messaging").dispatchEvent(event);
        }
    }
}

function detectGoogleCalendarEvent() {
    const googleCalendarEventContainer = document.querySelector('[data-open-edit-note]');
    const eventHeaderElement = document.querySelector('.wv9rPe');

    if(!googleCalendarEventContainer || !eventHeaderElement) {
        return;
    }

    const harvestTimerID = "polaris-harvest-timer";

    if(!document.getElementById(harvestTimerID)) {
        const eventName = document.querySelector('[data-open-edit-note] [data-text]').textContent;
        const eventId = googleCalendarEventContainer.getAttribute('data-eventid');

        createStartTimerButton("google-calendar", eventHeaderElement, harvestTimerID, eventId, eventName);

        window._harvestPlatformConfig = {
            "applicationName": "Crowdlinker",
            "permalink": window.location.href,
            "skipStyling": true // Override the default styling
        };

        // Use to dispatch event after loading buttons
        const event = new CustomEvent("harvest-event:timers:add", {
            detail: { element: document.querySelector(".harvest-timer") }
        });
        document.querySelector("#harvest-messaging").dispatchEvent(event);
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
        if(window.location.href.includes("https://app.shortcut.com/")) {
            chrome.storage.sync.get('shortcutCheckBox')
            .then((res) => {
                if(res?.shortcutCheckBox) {
                    detectStoryAndAppendTimerElement();
                }
                else if(!window.localStorage.getItem("harvest_timer_started")) {
                    // delete timer element
                    const timerElement = document.getElementById("polaris-harvest-timer");
                    if(timerElement) {
                        timerElement.remove();
                    }
                }
            })
         }
         else if( window.location.href.includes("https://calendar.google.com/")) {
            chrome.storage.sync.get('googleCalendarCheckBox')
            .then((res) => {
                if(res?.googleCalendarCheckBox) {
                    detectGoogleCalendarEvent();
                }
                else if(!window.localStorage.getItem("google_calendar_timer_started")) {
                    // delete timer element
                    const timerElement = document.getElementById("polaris-harvest-timer");
                    if(timerElement) {
                        timerElement.remove();
                    }
                }
            })   
         
        }
      }, 500);
});


function getShortcutStoryDetails() {
    const storyDialogElement = document.querySelector(".story-dialog");

    if(!storyDialogElement) {
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
    console.log({ event });
});


// Listen for messages from the injected script
window.onmessage = (event) => {
    if (event.origin !== "https://platform.harvestapp.com") {
        return;
    }

    console.log(`Received message`);
    console.log(event.data);
    const { type, value } = event.data;  

    if(type === "timer:started") {
        console.log("Timer started.");
        const buttonElement = document.getElementById("start_time_btn");

        if(buttonElement) {
            buttonElement.innerHTML = "Stop Timer";
            buttonElement.style.backgroundColor = "rgb(189 54 54)";

            if(value?.external_reference?.permalink?.includes("https://app.shortcut.com/")) {
                window.localStorage.setItem("harvest_timer_started", JSON.stringify(value));
            } 
            else if(value?.external_reference?.permalink?.includes("https://calendar.google.com")){
                window.localStorage.setItem("google_calendar_timer_started", JSON.stringify(value));
            }
        }
    }

    if(type === "timer:stopped") {
        console.log("Timer stopped.");
        const buttonElement = document.getElementById("start_time_btn");

        if(buttonElement) {
            buttonElement.innerHTML = "Start Timer";
            buttonElement.style.backgroundColor = "#188433";

            if(value?.external_reference?.permalink?.includes("https://app.shortcut.com/")) {
                window.localStorage.removeItem("harvest_timer_started");
            }
            else if(value?.external_reference?.permalink?.includes("https://calendar.google.com")){
                window.localStorage.removeItem("google_calendar_timer_started");
            }

        }
    }
};

function createStartTimerButton(type, elementToAppend, harvestTimerID, id, name, storyPermaLink) {

    let buttonElement = document.getElementById("start_time_btn");
    if(!buttonElement) {
        buttonElement = document.createElement('button');
    }

    buttonElement.id = "start_time_btn";
    buttonElement.className = "harvest-timer";
    buttonElement.setAttribute('data-id', id);
    buttonElement.style = "background: transparent; cursor: pointer; padding: 8px; border-radius: 8px; border: 1px solid grey; color: #fff; font-weight: 700; font-size: 14px; border: none;";
    buttonElement.innerHTML = 
    type === "shortcut" ? checkIfTimerStartedForStory(id) ? "Stop Timer" : "Start Timer"
    : checkIfTimerStartedForGoogleCalendarEvent(id) ? "Stop Timer" : "Start Timer";
    buttonElement.style.backgroundColor = 
    type === "shortcut" ? checkIfTimerStartedForStory(id) ? "rgb(189 54 54)" : "#188433"
    : checkIfTimerStartedForGoogleCalendarEvent(id) ? "rgb(189 54 54)" : "#188433";
    checkIfTimerStartedForStory(id) ? "rgb(189 54 54)" : "#188433";

    switch(type) {
        case "shortcut":
            buttonElement.dataset.item = JSON.stringify({
                "id": id,
                "name": `${id} - ${name}`,
                "permalink": storyPermaLink || ''
            });

            break;
        case "google-calendar":

        buttonElement.dataset.item = JSON.stringify({
            "id": id,
            "name": `Meeting - ${name}`,
            "permalink": "https://calendar.google.com/"
        });

    }

    timerElement = document.getElementById("polaris-harvest-timer") || document.createElement('div');

    switch(type) {
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


function checkIfTimerStartedForStory(storyId) {
    const startedTimer = window.localStorage.getItem("harvest_timer_started");
    const startedTimerObj = startedTimer ? JSON.parse(startedTimer) : {};

    if(startedTimerObj?.external_reference?.id === storyId) {
        return true;
    }

    return false;
}

function checkIfTimerStartedForGoogleCalendarEvent(eventId) {
    const startedTimer = window.localStorage.getItem("google_calendar_timer_started");
    const startedTimerObj = startedTimer ? JSON.parse(startedTimer) : {};


    if(startedTimerObj?.external_reference?.id === eventId) {
        return true;
    }

    return false;
}
