const APP_CONSTANTS = {
    SHORTCUT: {
        baseDomain: 'https://app.shortcut.com',
    },
    HARVEST: {
        baseDomain: 'https://platform.harvestapp.com',
        paths: {
            runningTimeEntry: '/platform/running_time_entry',
        }
    },
    GOOGLE_CALENDAR: {
        baseDomain: 'https://calendar.google.com',
    },
}


if (typeof window !== 'undefined') {
    window.APP_CONSTANTS = APP_CONSTANTS;
} else if (typeof self !== 'undefined') {
    self.APP_CONSTANTS = APP_CONSTANTS;
}
