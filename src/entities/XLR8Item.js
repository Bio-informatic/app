export class XLR8Item {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = 2;
        this.vy = -5;
        this.gravity = 0.5;
        this.dead = false;
        this.type = 'xlr8_item';
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
        const now = performance.now();

        ctx.save();
        ctx.translate(cx, cy);

        // Electric aura glow (pulsing)
        const pulse = 0.3 + Math.sin(now / 200) * 0.15;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Body — dark blue/black
        ctx.fillStyle = '#0A0A2E';
        ctx.fillRect(-10, -10, 20, 20);

        // Cyan visor stripe
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(-8, -4, 16, 4);

        // Lightning bolt icon
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.moveTo(-3, -10);
        ctx.lineTo(2, -3);
        ctx.lineTo(-1, -3);
        ctx.lineTo(3, 6);
        ctx.lineTo(-2, 0);
        ctx.lineTo(1, 0);
        ctx.lineTo(-3, -10);
        ctx.fill();

        // Sparks
        for (let i = 0; i < 3; i++) {
            const sx = Math.sin(now / 100 + i * 2.1) * 12;
            const sy = Math.cos(now / 130 + i * 1.7) * 12;
            ctx.fillStyle = i % 2 === 0 ? '#00FFFF' : '#FFFFFF';
            ctx.fillRect(sx - 1, sy - 1, 2, 2);
        }

        ctx.restore();
    }
}
