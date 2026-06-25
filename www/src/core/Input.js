export class Input {
    constructor() {
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyF'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Track left mouse click as F key trigger
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.keys['MouseLeft'] = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.keys['MouseLeft'] = false;
            }
        });

        this.setupTouchControls();
    }

    setupTouchControls() {
        const touchControls = document.getElementById('touch-controls');
        if (!touchControls) return;

        const activeTouches = new Map();
        const keyValues = {
            Space: ' ',
            ArrowLeft: 'ArrowLeft',
            ArrowRight: 'ArrowRight',
            ArrowUp: 'ArrowUp',
            ArrowDown: 'ArrowDown',
            KeyC: 'c',
            KeyF: 'f',
            Digit0: '0',
            Digit1: '1',
            Digit2: '2',
            Digit3: '3',
            Digit4: '4',
            Digit5: '5',
            Digit6: '6',
            Digit7: '7',
            Digit8: '8',
            Digit9: '9'
        };

        const getButtonFromTouch = (touch) => {
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            return target ? target.closest('[data-touch-key]') : null;
        };

        const emitKeyEvent = (type, code, keyValue) => {
            const event = new KeyboardEvent(type, {
                code,
                key: keyValue || keyValues[code] || code,
                bubbles: true,
                cancelable: true
            });
            window.dispatchEvent(event);
        };

        const pressButton = (button, touchId) => {
            const code = button.dataset.touchKey;
            if (!code) return;

            const keyValue = button.dataset.touchKeyValue || keyValues[code] || code;
            activeTouches.set(touchId, { button, code, keyValue });
            button.classList.add('is-pressed');
            this.keys[code] = true;
            emitKeyEvent('keydown', code, keyValue);
        };

        const releaseTouch = (touchId) => {
            const active = activeTouches.get(touchId);
            if (!active) return;

            active.button.classList.remove('is-pressed');
            this.keys[active.code] = false;
            emitKeyEvent('keyup', active.code, active.keyValue);
            activeTouches.delete(touchId);
        };

        touchControls.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                const button = getButtonFromTouch(touch);
                if (button) pressButton(button, touch.identifier);
            }
        }, { passive: false });

        touchControls.addEventListener('touchend', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                releaseTouch(touch.identifier);
            }
        }, { passive: false });

        touchControls.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                releaseTouch(touch.identifier);
            }
        }, { passive: false });
    }
    isDown(key) {
        if (key === 'ArrowRight') return this.keys['ArrowRight'] || this.keys['KeyD'];
        if (key === 'ArrowLeft') return this.keys['ArrowLeft'] || this.keys['KeyA'];
        if (key === 'ArrowUp') return this.keys['ArrowUp'] || this.keys['KeyW'];
        if (key === 'ArrowDown') return this.keys['ArrowDown'] || this.keys['KeyS'];
        if (key === 'Space') return this.keys['Space'] || this.keys['KeyZ'] || this.keys['ArrowUp'] || this.keys['KeyW'];
        if (key === 'R') return this.keys['KeyR'];
        if (key === 'F') return this.keys['KeyF'] || this.keys['MouseLeft'];
        return this.keys[key];
    }
}
