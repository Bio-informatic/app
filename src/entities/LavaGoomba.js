export class LavaGoomba {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = -2;
        this.vy = 0;
        this.gravity = 0.5;
        this.dead = false;
        this.type = 'goomba'; // Same type so existing collision code works
        this.isLava = true;   // Visual flag for orange/fire drawing
    }

    update(deltaTime, level) {
        if (this.dead) return;

        this.vy += this.gravity;
        this.x += this.vx;
        this.handleHorizontalCollisions(level);
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

        if (gridY < level.rows && level.tiles[gridY] && (level.tiles[gridY][gridX1] !== 0 || level.tiles[gridY][gridX2] !== 0)) {
            if (this.vy > 0) {
                this.y = gridY * level.tileSize - this.height;
                this.vy = 0;
            }
        }
    }

    draw(ctx) {
        if (this.dead) return;

        // Lava Goomba — orange body with fire particles
        ctx.fillStyle = '#CC4400';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Dark red cap
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(this.x + 2, this.y, this.width - 4, 12);

        // Glowing cracks
        ctx.strokeStyle = '#FF8800';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + 6, this.y + 14);
        ctx.lineTo(this.x + 16, this.y + 20);
        ctx.lineTo(this.x + 26, this.y + 16);
        ctx.stroke();

        // Eyes — angry orange
        ctx.fillStyle = '#FFCC00';
        ctx.fillRect(this.x + 4, this.y + 8, 8, 8);
        ctx.fillRect(this.x + 20, this.y + 8, 8, 8);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x + 6, this.y + 10, 4, 4);
        ctx.fillRect(this.x + 22, this.y + 10, 4, 4);

        // Tiny fire particles on top
        const t = performance.now();
        for (let i = 0; i < 3; i++) {
            const fx = this.x + 8 + i * 8 + Math.sin(t / 200 + i) * 3;
            const fy = this.y - 4 - Math.abs(Math.sin(t / 150 + i * 2)) * 6;
            ctx.fillStyle = i % 2 === 0 ? '#FF6600' : '#FFCC00';
            ctx.fillRect(fx, fy, 3, 4);
        }
    }
}
