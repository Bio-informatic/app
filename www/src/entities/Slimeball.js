export class Slimeball {
    constructor(x, y, facingRight, options = {}) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.type = 'slimeball';
        this.dead = false;
        this.source = options.source || 'stinkfly';
        this.facingRight = facingRight !== false;
        this.impactTile = null;

        if (this.source === 'upgrade') {
            this.vx = this.facingRight ? 8 : -8;
            this.vy = 0;
        } else {
            this.vx = 0; // vertical only
            this.vy = 8; // drop fast
        }
    }

    update(deltaTime, level) {
        if (this.dead) return;

        if (this.source !== 'upgrade') {
            this.vy += 0.5; // gravity
        }
        this.x += this.vx;
        this.y += this.vy;

        // Collision with map
        const ts = level.tileSize;
        const col = Math.floor(this.x / ts);
        const row = Math.floor((this.y + this.height) / ts);
        
        if (level.tiles[row]) {
            const t = level.tiles[row][col];
            if (t !== 0 && t !== 9) { // 9 is lava
                this.impactTile = t;
                this.dead = true;
            }
        }
        
        // Bounds
        if (this.x < 0 || this.x > level.width || this.y > level.height) {
            this.dead = true;
        }
    }

    draw(ctx) {
        const bodyColor = this.source === 'upgrade' ? '#00FF44' : '#66AA00';
        const highlightColor = this.source === 'upgrade' ? '#B6FFD1' : '#AADD88';

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 8, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = highlightColor;
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y + 6, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
