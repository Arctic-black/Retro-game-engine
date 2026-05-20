let keys = {};
let keysTyped = {};
window.addEventListener('keydown', (e) => {
    if (!keys[e.key]) {
        keysTyped[e.key] = true;
    }

    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    delete keys[e.key];
});