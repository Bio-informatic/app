export class Goomba {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = -2;
        this.vy = 0;
        this.gravity = 0.5;
        this.dead = false;
        this.type = 'goomba';
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
        // Simple turn around on edge of screen or blocks
        // For now, just turn around if hitting something
        const gridLeft = Math.floor(this.x / level.tileSize);
        const gridRight = Math.floor((this.x + this.width) / level.tileSize);
        const gridY = Math.floor((this.y + 16) / level.tileSize); // Check center Y

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

        if (gridY < level.rows && (level.tiles[gridY][gridX1] !== 0 || level.tiles[gridY][gridX2] !== 0)) {
            if (this.vy > 0) {
                this.y = gridY * level.tileSize - this.height;
                this.vy = 0;
            }
        }
    }

    draw(ctx) {
        if (this.dead) return;
        ctx.fillStyle = '#8B4513'; // Mushroom brown
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 4, this.y + 8, 8, 8);
        ctx.fillRect(this.x + 20, this.y + 8, 8, 8);
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 6, this.y + 10, 4, 4);
        ctx.fillRect(this.x + 22, this.y + 10, 4, 4);
    }
}
