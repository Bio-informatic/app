export class UpgradeItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = 'upgrade_item';
        this.dead = false;
        this.startY = y;
        this.time = 0;
    }

    update(deltaTime) {
        this.time += deltaTime;
        this.y = this.startY + Math.sin(this.time * 0.005) * 5;
    }

    draw(ctx) {
        ctx.fillStyle = '#0a0a0c';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#00FFCC';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#00FFCC';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
