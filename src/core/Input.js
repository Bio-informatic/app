export class Input {
    constructor() {
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isDown(key) {
        if (key === 'ArrowRight') return this.keys['ArrowRight'] || this.keys['KeyD'];
        if (key === 'ArrowLeft') return this.keys['ArrowLeft'] || this.keys['KeyA'];
        if (key === 'ArrowUp') return this.keys['ArrowUp'] || this.keys['KeyW'];
        if (key === 'Space') return this.keys['Space'] || this.keys['KeyZ'] || this.keys['ArrowUp'] || this.keys['KeyW'];
        if (key === 'R') return this.keys['KeyR'];
        if (key === 'F') return this.keys['KeyF'];
        return this.keys[key];
    }
}
