export class RipjawsItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vy = -5;
        this.vx = 2;
        this.gravity = 0.4;
        this.type = 'ripjaws_item';
        this.dead = false;
        this.grounded = false;
        this.bounceCount = 0;
    }

    update(deltaTime, level) {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        const ts = level.tileSize;
        const gY = Math.floor((this.y + this.height) / ts);
        const gX = Math.floor((this.x + this.width / 2) / ts);

        if (gY < level.rows && level.tiles[gY] && level.tiles[gY][gX] !== 0) {
            this.y = gY * ts - this.height;
            if (this.bounceCount < 2) {
                this.vy = -4;
                this.bounceCount++;
            } else {
                this.vy = 0;
                this.vx = 0;
                this.grounded = true;
            }
        }
    }

    draw(ctx) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#39FF14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy - 8); ctx.lineTo(cx + 8, cy + 8);
        ctx.moveTo(cx + 8, cy - 8); ctx.lineTo(cx - 8, cy + 8);
        ctx.stroke();

        ctx.fillStyle = '#4A8F79';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}
