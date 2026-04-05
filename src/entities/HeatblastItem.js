export class HeatblastItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = 2;
        this.vy = -5;
        this.gravity = 0.5;
        this.dead = false;
        this.type = 'heatblast_item';
        this.grounded = false;
    }

    update(deltaTime, level) {
        if (this.dead) return;

        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Horizontal collisions
        const gridTop = Math.floor(this.y / level.tileSize);
        const gridBottom = Math.floor((this.y + this.height - 0.1) / level.tileSize);

        if (this.vx > 0) {
            const gridRight = Math.floor((this.x + this.width) / level.tileSize);
            if (level.tiles[gridTop] && level.tiles[gridTop][gridRight] !== 0 ||
                level.tiles[gridBottom] && level.tiles[gridBottom][gridRight] !== 0) {
                this.vx = -this.vx;
            }
        } else if (this.vx < 0) {
            const gridLeft = Math.floor(this.x / level.tileSize);
            if (level.tiles[gridTop] && level.tiles[gridTop][gridLeft] !== 0 ||
                level.tiles[gridBottom] && level.tiles[gridBottom][gridLeft] !== 0) {
                this.vx = -this.vx;
            }
        }

        // Vertical collisions
        const gridLeft = Math.floor(this.x / level.tileSize);
        const gridRight = Math.floor((this.x + this.width - 0.1) / level.tileSize);

        if (this.vy > 0) {
            const gridBottomY = Math.floor((this.y + this.height) / level.tileSize);
            if (level.tiles[gridBottomY] && (level.tiles[gridBottomY][gridLeft] !== 0 || level.tiles[gridBottomY][gridRight] !== 0)) {
                this.y = gridBottomY * level.tileSize - this.height;
                this.vy = 0;
                this.grounded = true;
            }
        }
    }

    draw(ctx) {
        if (this.dead) return;

        const cx = this.x + 16;
        const cy = this.y + 16;

        ctx.save();
        ctx.translate(cx, cy);

        // Body — dark red with lava cracks
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(-10, -10, 20, 20);

        // Lava crack lines
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -4); ctx.lineTo(-2, 2); ctx.lineTo(4, -2);
        ctx.moveTo(2, 4); ctx.lineTo(6, 8);
        ctx.moveTo(-6, 6); ctx.lineTo(0, 10);
        ctx.stroke();
        ctx.lineWidth = 1;

        // Flame on top
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.moveTo(-6, -10);
        ctx.lineTo(0, -16);
        ctx.lineTo(6, -10);
        ctx.fill();
        ctx.fillStyle = '#FFCC00';
        ctx.beginPath();
        ctx.moveTo(-3, -10);
        ctx.lineTo(0, -14);
        ctx.lineTo(3, -10);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-6, -4, 4, 3);
        ctx.fillRect(2, -4, 4, 3);

        ctx.restore();
    }
}
