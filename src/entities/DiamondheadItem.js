export class DiamondheadItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vy = -5;
        this.vx = 2;
        this.gravity = 0.4;
        this.grounded = false;
        this.type = 'diamondhead_item';
        this.dead = false;
        // Float logic
        this.baseY = y;
        this.timer = 0;
    }

    update(deltaTime, level) {
        this.timer += deltaTime;
        // Make it hover nicely
        this.y = this.baseY + Math.sin(this.timer / 200) * 5;
    }

    draw(ctx) {
        ctx.fillStyle = '#00FFFF'; // Cyan crystal
        ctx.beginPath();
        ctx.moveTo(this.x + 16, this.y);
        ctx.lineTo(this.x + 32, this.y + 16);
        ctx.lineTo(this.x + 16, this.y + 32);
        ctx.lineTo(this.x, this.y + 16);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
