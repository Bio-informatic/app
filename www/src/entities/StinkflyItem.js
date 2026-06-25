export class StinkflyItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = 'stinkfly_item';
        this.dead = false;
        this.floatOffset = 0;
        this.floatDir = 1;
    }

    update(deltaTime) {
        this.floatOffset += 0.05 * this.floatDir * (deltaTime / 16);
        if (this.floatOffset > 5) this.floatDir = -1;
        if (this.floatOffset < -5) this.floatDir = 1;
        this.y += this.floatDir * 0.2 * (deltaTime / 16);
    }

    draw(ctx) {
        ctx.fillStyle = '#66AA00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 16, this.y + 16, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#39FF14';
        ctx.beginPath();
        ctx.moveTo(this.x + 12, this.y + 16);
        ctx.lineTo(this.x + 20, this.y + 12);
        ctx.lineTo(this.x + 20, this.y + 20);
        ctx.fill();
    }
}
