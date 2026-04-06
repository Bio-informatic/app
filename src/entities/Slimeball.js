export class Slimeball {
    constructor(x, y, facingRight) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.type = 'slimeball';
        this.dead = false;

        this.vx = 0; // vertical only
        this.vy = 8; // drop fast
    }

    update(deltaTime, level) {
        if (this.dead) return;

        this.vy += 0.5; // gravity
        this.x += this.vx;
        this.y += this.vy;

        // Collision with map
        const ts = level.tileSize;
        const col = Math.floor(this.x / ts);
        const row = Math.floor((this.y + this.height) / ts);
        
        if (level.tiles[row]) {
            const t = level.tiles[row][col];
            if (t !== 0 && t !== 9) { // 9 is lava
                this.dead = true;
            }
        }
        
        // Bounds
        if (this.x < 0 || this.x > level.width || this.y > level.height) {
            this.dead = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#66AA00';
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 8, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#AADD88';
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y + 6, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
