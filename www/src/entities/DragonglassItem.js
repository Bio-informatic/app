export class DragonglassItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = 'dragonglass_item';
        this.dead = false;
        this.baseY = y;
        this.timer = 0;
    }

    update(deltaTime) {
        this.timer += deltaTime;
        this.y = this.baseY + Math.sin(this.timer / 200) * 5;
    }

    draw(ctx) {
        ctx.fillStyle = '#1A1A1A'; // Obsidian black
        ctx.beginPath();
        ctx.moveTo(this.x + 16, this.y);
        ctx.lineTo(this.x + 24, this.y + 16);
        ctx.lineTo(this.x + 16, this.y + 32);
        ctx.lineTo(this.x + 8, this.y + 16);
        ctx.fill();
        
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(this.x + 16, this.y + 4);
        ctx.lineTo(this.x + 20, this.y + 16);
        ctx.lineTo(this.x + 16, this.y + 28);
        ctx.lineTo(this.x + 12, this.y + 16);
        ctx.fill();
    }
}
