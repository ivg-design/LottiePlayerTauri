// debugger.js
let isDebuggingEnabled = false;

export const enableDebugging = () => {
    isDebuggingEnabled = true;
};

export const disableDebugging = () => {
    isDebuggingEnabled = false;
};

export const debugLog = (...args) => {
    if (isDebuggingEnabled) {
        console.log(...args);
    }
};
