// utils.js

// Set DEBUG to true to enable debugging, false to disable it
const DEBUG = true;

export const sortItems = (items) => {
    return items.sort((a, b) => {
        if (a.is_dir && !b.is_dir) return -1;
        if (!a.is_dir && b.is_dir) return 1;
        return a.name.localeCompare(b.name);
    });
};

export const debug = (...args) => {
    if (DEBUG) {
        console.log(...args);
    }
};

// Add more utility functions as needed
