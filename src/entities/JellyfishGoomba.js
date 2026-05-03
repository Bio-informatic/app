export class JellyfishGoomba {
    constructor(x, y, isRising = false) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 30;
        this.type = 'jellyfish_goomba';
        this.dead = false;
        this.timer = Math.random() * 1000;
        this.baseY = y;
        this.isRising = isRising;
    }

    update(deltaTime, level) {
        this.timer += deltaTime;
        if (this.isRising) {
            this.y -= 2; // Constantly rise
            this.baseY = this.y;
            this.x -= 0.5; // Slight drift
        } else {
            // Float up and down
            this.y = this.baseY + Math.sin(this.timer / 500) * 40;
            // Drift to the left
            this.x -= 1.0;
        }
    }

    draw(ctx) {
        const cx = this.x + this.width/2;
        const cy = this.y + 10;
        
        // Electric glow
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 10;
        
        // Bell/Body
        ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(cx, cy, 12, Math.PI, 0);
        ctx.lineTo(cx + 12, cy + 3);
        ctx.lineTo(cx - 12, cy + 3);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 3, 2, 0, Math.PI*2);
        ctx.arc(cx + 4, cy - 3, 2, 0, Math.PI*2);
        ctx.fill();
        
        // Tentacles
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(cx - 9 + i*6, cy + 3);
            ctx.lineTo(cx - 9 + i*6 + Math.sin(this.timer/200 + i)*3, cy + 18);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    }
}
