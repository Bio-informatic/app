export class OmnitrixItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = 2; // Move right initially
        this.vy = 0;
        this.gravity = 0.5;
        this.grounded = false;
        this.type = 'omnitrix_item';
        this.dead = false;

        // Visuals
        // this.image = new Image();
        // const ASSET_PREFIX = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : '.';
        // this.image.src = ASSET_PREFIX + 'assets/omnitrix_pixel_art.png';

        // Initial "Rise" animation state
        this.rising = true;
        this.riseStartY = y + 32; // Started from below
        this.riseTargetY = y;
    }

    update(deltaTime, level) {
        if (this.dead) return;

        if (this.rising) {
            this.y -= 1; // Rise speed
            if (this.y <= this.riseTargetY) {
                this.y = this.riseTargetY;
                this.rising = false;
            }
            return;
        }

        // Physics
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Level Collision
        // Horizontal
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

        // Vertical
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

        // Draw Item
        if (this.image && this.image.complete && this.image.naturalWidth !== 0) {
            ctx.drawImage(this.image, this.x, this.y, 32, 32);
        } else {
            // Fallback Drawing (Pixel Art Watch)
            ctx.fillStyle = '#000'; // Strap
            ctx.fillRect(this.x + 4, this.y + 4, 24, 24);

            ctx.fillStyle = '#39FF14'; // Green Face
            ctx.beginPath();
            ctx.arc(this.x + 16, this.y + 16, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000'; // Hourglass
            ctx.beginPath();
            ctx.moveTo(this.x + 12, this.y + 12);
            ctx.lineTo(this.x + 20, this.y + 12);
            ctx.lineTo(this.x + 16, this.y + 16);
            ctx.lineTo(this.x + 20, this.y + 20);
            ctx.lineTo(this.x + 12, this.y + 20);
            ctx.lineTo(this.x + 16, this.y + 16);
            ctx.fill();
        }
    }
}
