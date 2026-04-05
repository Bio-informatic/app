export class ShieldDrone {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 36;
        this.height = 36;
        this.vx = -1.5;
        this.vy = 0;
        this.gravity = 0.5;
        this.dead = false;
        this.type = 'shield_drone';
        this.shieldAngle = 0;     // Rotating shield angle
        this.shieldActive = true; // Shield blocks normal attacks
    }

    update(deltaTime, level) {
        if (this.dead) return;

        // Rotate shield
        this.shieldAngle += 0.04;

        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Horizontal collisions — bounce off walls
        const gridTop = Math.floor(this.y / level.tileSize);
        const gridBottom = Math.floor((this.y + this.height - 0.1) / level.tileSize);
        const gridY = Math.floor((this.y + 18) / level.tileSize);

        if (this.vx > 0) {
            const gridRight = Math.floor((this.x + this.width) / level.tileSize);
            if (gridRight >= level.cols || (level.tiles[gridY] && level.tiles[gridY][gridRight] !== 0)) {
                this.vx = -Math.abs(this.vx);
            }
        } else if (this.vx < 0) {
            const gridLeft = Math.floor(this.x / level.tileSize);
            if (gridLeft < 0 || (level.tiles[gridY] && level.tiles[gridY][gridLeft] !== 0)) {
                this.vx = Math.abs(this.vx);
            }
        }

        // Vertical collisions
        if (this.vy > 0) {
            const gridBottomY = Math.floor((this.y + this.height) / level.tileSize);
            const gx1 = Math.floor(this.x / level.tileSize);
            const gx2 = Math.floor((this.x + this.width - 0.1) / level.tileSize);
            if (level.tiles[gridBottomY] && (level.tiles[gridBottomY][gx1] !== 0 || level.tiles[gridBottomY][gx2] !== 0)) {
                this.y = gridBottomY * level.tileSize - this.height;
                this.vy = 0;
            }
        }
    }

    draw(ctx) {
        if (this.dead) return;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const now = performance.now();

        ctx.save();
        ctx.translate(cx, cy);

        // Rotating shield ring (if active)
        if (this.shieldActive) {
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2;
            const segments = 6;
            const gapAngle = Math.PI / 8;
            for (let i = 0; i < segments; i++) {
                const startA = this.shieldAngle + (i * 2 * Math.PI / segments);
                const endA = startA + (2 * Math.PI / segments) - gapAngle;
                ctx.beginPath();
                ctx.arc(0, 0, 20, startA, endA);
                ctx.stroke();
            }
            // Shield glow
            ctx.globalAlpha = 0.1 + Math.sin(now / 200) * 0.05;
            ctx.fillStyle = '#00FFFF';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        // Main body — chrome sphere
        ctx.fillStyle = '#4A4A6A';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Metallic highlight
        ctx.fillStyle = '#6A6A9A';
        ctx.beginPath();
        ctx.arc(-3, -4, 7, 0, Math.PI * 2);
        ctx.fill();

        // Red eye — scanning
        const eyeX = Math.sin(now / 500) * 4;
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(eyeX, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        // Eye glow
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(eyeX, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        // Bottom thruster glow
        ctx.fillStyle = '#00AAFF';
        const thrustH = 3 + Math.sin(now / 100) * 2;
        ctx.fillRect(-4, 12, 8, thrustH);

        ctx.restore();
    }
}
