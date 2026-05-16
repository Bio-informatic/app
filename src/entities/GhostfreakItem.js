export class GhostfreakItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = 2;
        this.vy = -5;
        this.gravity = 0.5;
        this.type = 'ghostfreak_item';
        this.dead = false;
        this.bounces = 0;
    }

    update(deltaTime, level) {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        const groundY = Math.floor((this.y + this.height) / level.tileSize);
        const gx = Math.floor((this.x + this.width / 2) / level.tileSize);

        if (level.tiles[groundY] && level.tiles[groundY][gx] !== 0) {
            this.y = groundY * level.tileSize - this.height;
            if (this.bounces < 3) {
                this.vy = -4 + this.bounces;
                this.bounces++;
            } else {
                this.vy = 0;
                this.vx = 0;
            }
        }
    }

    draw(ctx) {
        const now = performance.now();
        const floatY = Math.sin(now / 150) * 4;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + floatY);
        
        // Ghostly aura
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Dark core
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Green eye track
        ctx.strokeStyle = '#39FF14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, -2);
        ctx.lineTo(6, -2);
        ctx.stroke();

        ctx.restore();
    }
}
