export class Electromba {
    constructor(x, y) {
        this.width = 30;
        this.height = 30;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() > 0.5 ? 1 : -1) * 1.5;
        this.vy = 0;
        this.dead = false;
        this.type = 'electromba';
        this.absorbed = false;
        this.jumpTimer = performance.now() + Math.random() * 2000;
    }

    update(deltaTime, level) {
        if (this.absorbed) {
            this.type = 'goomba'; // act as generic goomba from now on
        }

        this.x += this.vx;
        this.vy += 0.5; // gravity
        this.y += this.vy;

        // Collision Check left/right
        let mCX = Math.floor((this.x + this.width / 2) / level.tileSize);
        let mCY = Math.floor((this.y + this.height / 2) / level.tileSize);
        if (this.vx > 0) mCX = Math.floor((this.x + this.width) / level.tileSize);
        else mCX = Math.floor(this.x / level.tileSize);

        if (level.tiles[mCY] && level.tiles[mCY][mCX] > 0 && level.tiles[mCY][mCX] !== 5) {
            this.vx *= -1; // turn around
        }

        // Floor collision
        let footY = Math.floor((this.y + this.height) / level.tileSize);
        let edgeL = Math.floor(this.x / level.tileSize);
        let edgeR = Math.floor((this.x + this.width) / level.tileSize);

        if (level.tiles[footY] && (level.tiles[footY][edgeL] || level.tiles[footY][edgeR])) {
            this.y = footY * level.tileSize - this.height;
            this.vy = 0;

            const now = performance.now();
            if (!this.absorbed && now > this.jumpTimer) {
                this.vy = -8;
                this.jumpTimer = now + 1500 + Math.random() * 1000;
            }
        }
    }

    draw(ctx) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        if (this.absorbed) {
            // green/black hacked coloring
            ctx.fillStyle = '#0f1a0f';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#00FFCC';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            return;
        }

        // Electronic coloring
        ctx.fillStyle = '#1A1A24';
        ctx.beginPath();
        ctx.moveTo(cx, this.y + 4);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#00FFCC';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Eye
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 6, cy - 2, 4, 4);
        ctx.fillRect(cx + 2, cy - 2, 4, 4);

        // Electric thunder effect
        if ((performance.now() % 300) < 150) {
            ctx.strokeStyle = '#FFFF00';
            ctx.beginPath();
            ctx.moveTo(cx, this.y - 5);
            ctx.lineTo(cx - 5, this.y - 12);
            ctx.lineTo(cx + 2, this.y - 10);
            ctx.lineTo(cx, this.y - 20);
            ctx.stroke();
        }
    }
}
