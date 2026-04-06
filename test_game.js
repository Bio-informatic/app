global.window = {
    innerWidth: 800, innerHeight: 600,
    addEventListener: () => {},
    AudioContext: class {
        createGain() { return { gain: { value: 0 }, connect: () => {} }; }
    }
};
global.document = {
    getElementById: () => ({ addEventListener: () => {}, getContext: () => ({}), classList: {add: ()=>{}, remove: ()=>{}}, blur: ()=>{}, appendChild: () => {}, innerHTML: '' }),
    createElement: () => ({ classList: {add: ()=>{}}, appendChild: () => {}, innerHTML: '', addEventListener: () => {} })
};
global.performance = { now: () => 0 };
global.requestAnimationFrame = () => {};

import('./game.js').then(m => {
    console.log("GAME.JS LOADED SUCCESFULLY!");
}).catch(console.error);
