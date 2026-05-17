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
