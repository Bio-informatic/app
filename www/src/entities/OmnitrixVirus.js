export class OmnitrixVirus {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = (Math.random() > 0.5 ? 2 : -2);
        this.vy = 0;
        this.gravity = 0.5;
        this.dead = false; // Never truly dies, turns green
        this.fixed = false;
        this.type = 'omnitrix_virus';
        this.followTarget = null;
    }

    update(deltaTime, level) {
        if (this.fixed) {
            // Friendly behavior
            if (this.followTarget) {
                const targetX = this.followTarget.x + this.followTarget.width / 2;
                const myX = this.x + this.width / 2;
                
                // Move towards target smoothly
                if (Math.abs(targetX - myX) > 40) {
                    this.vx = targetX > myX ? 3 : -3;
                } else {
                    this.vx = 0;
                }
            } else {
                // Fly straight up and out of screen if no target
                this.y -= 5;
                if (this.y < -100) this.dead = true;
                return;
            }
        } else {
            // Aggressive behavior
            this.vy += this.gravity;
        }

        // Horizontal
        this.x += this.vx;
        if (!this.fixed || this.followTarget) {
            const ts = level.tileSize;
            const gridRight = Math.floor((this.x + this.width) / ts);
            const gridLeft = Math.floor(this.x / ts);
            const gridYMid = Math.floor((this.y + this.height / 2) / ts);

            if (gridRight >= level.cols || (level.tiles[gridYMid] && level.tiles[gridYMid][gridRight] !== 0)) {
                this.vx = -Math.abs(this.vx);
            } else if (gridLeft < 0 || (level.tiles[gridYMid] && level.tiles[gridYMid][gridLeft] !== 0)) {
                this.vx = Math.abs(this.vx);
            }
        }

        // Vertical
        if (!this.fixed) {
            this.y += this.vy;
            const ts = level.tileSize;
            const gridBottom = Math.floor((this.y + this.height) / ts);
            const gx1 = Math.floor(this.x / ts);
            const gx2 = Math.floor((this.x + this.width - 1) / ts);

            if (gridBottom < level.rows && level.tiles[gridBottom] && 
                (level.tiles[gridBottom][gx1] !== 0 || level.tiles[gridBottom][gx2] !== 0)) {
                if (this.vy > 0) {
                    this.y = gridBottom * ts - this.height;
                    this.vy = 0;
                }
            }
        }
    }

    draw(ctx) {
        if (this.dead) return;
        const now = performance.now();
        const mainColor = this.fixed ? '#00FF00' : '#FF0000';
        const glowColor = this.fixed ? 'rgba(0,255,0,0.5)' : 'rgba(255,0,0,0.5)';

        ctx.save();
        ctx.translate(this.x, this.y);

        // Hover bobbing
        const bob = Math.sin(now / 150 + this.x) * 4;

        // Glow
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(16, 16 + bob, 20, 0, Math.PI * 2);
        ctx.fill();

        // Bug body
        ctx.fillStyle = '#111';
        ctx.fillRect(8, 8 + bob, 16, 16);
        ctx.fillStyle = mainColor;
        ctx.fillRect(10, 10 + bob, 12, 12);

        // Glitchy legs
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (now % 200 < 100) {
            ctx.moveTo(8, 12 + bob); ctx.lineTo(0, 8 + bob);
            ctx.moveTo(8, 20 + bob); ctx.lineTo(0, 24 + bob);
            ctx.moveTo(24, 12 + bob); ctx.lineTo(32, 8 + bob);
            ctx.moveTo(24, 20 + bob); ctx.lineTo(32, 24 + bob);
        } else {
            ctx.moveTo(8, 12 + bob); ctx.lineTo(4, 16 + bob);
            ctx.moveTo(8, 20 + bob); ctx.lineTo(4, 20 + bob);
            ctx.moveTo(24, 12 + bob); ctx.lineTo(28, 16 + bob);
            ctx.moveTo(24, 20 + bob); ctx.lineTo(28, 20 + bob);
        }
        ctx.stroke();

        ctx.restore();
    }
}
