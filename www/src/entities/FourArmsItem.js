export class FourArmsItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = 2; // Moves right initially
        this.vy = -5; // Pops up
        this.gravity = 0.5;
        this.dead = false;
        this.type = 'fourarms_item';
        this.grounded = false;
    }

    update(deltaTime, level) {
        if (this.dead) return;

        this.vy += this.gravity;

        // Move X
        this.x += this.vx;
        this.handleHorizontalCollisions(level);

        // Move Y
        this.y += this.vy;
        this.handleVerticalCollisions(level);
    }

    handleHorizontalCollisions(level) {
        const gridLeft = Math.floor(this.x / level.tileSize);
        const gridRight = Math.floor((this.x + this.width) / level.tileSize);
        const gridY = Math.floor((this.y + 16) / level.tileSize);

        if (gridRight >= level.cols || (level.tiles[gridY] && level.tiles[gridY][gridRight] !== 0)) {
            this.vx = -Math.abs(this.vx);
        } else if (gridLeft < 0 || (level.tiles[gridY] && level.tiles[gridY][gridLeft] !== 0)) {
            this.vx = Math.abs(this.vx);
        }
    }

    handleVerticalCollisions(level) {
        const gridY = Math.floor((this.y + this.height) / level.tileSize);
        const gridX1 = Math.floor(this.x / level.tileSize);
        const gridX2 = Math.floor((this.x + this.width - 0.1) / level.tileSize);

        if (gridY >= 0 && gridY < level.rows && level.tiles[gridY] && (level.tiles[gridY][gridX1] !== 0 || level.tiles[gridY][gridX2] !== 0)) {
            if (this.vy > 0) {
                this.y = gridY * level.tileSize - this.height;
                this.vy = 0;
                this.grounded = true;
            }
        }
    }

    draw(ctx) {
        if (this.dead) return;

        // Draw Mini Four Arms Icon
        const cx = this.x + 16;
        const cy = this.y + 16;

        ctx.save();
        ctx.translate(cx, cy);

        // Simple Head Icon
        ctx.fillStyle = '#C80000';
        ctx.fillRect(-8, -8, 16, 16);
        ctx.fillStyle = '#000'; // Stripe
        ctx.fillRect(-2, -8, 4, 16);
        // Eyes
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(-6, -4, 3, 3);
        ctx.fillRect(3, -4, 3, 3);
        ctx.fillRect(-6, 2, 3, 3);
        ctx.fillRect(3, 2, 3, 3);

        ctx.restore();
    }
}
