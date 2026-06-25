export class MucusProjectile {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.type = 'mucus_projectile';
        this.dead = false;
        
        // Calculate velocity
        const angle = Math.atan2(targetY - y, targetX - x);
        const speed = 6;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.timer = 0;
    }

    update(deltaTime, level) {
        this.timer += deltaTime;
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > level.width || this.y < 0 || this.y > level.height) {
            this.dead = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#8B8000'; // ugly yellowish green
        ctx.shadowColor = '#FF0000'; // burn
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 8, 8 + Math.sin(this.timer/100)*2, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
