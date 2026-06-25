export class GhostGoomba {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = (Math.random() > 0.5 ? 1 : -1) * 1.5;
        this.vy = 0;
        this.type = 'ghost_goomba';
        this.dead = false;
        this.startY = y;
        this.floatPhase = Math.random() * Math.PI * 2;
        this.acquired = false;
    }

    update(deltaTime, level) {
        if (this.dead) return;
        if (this.acquired) {
            this.vx = 0;
            return;
        }
        
        this.x += this.vx;
        
        // Sine wave floating physics
        this.floatPhase += 0.05;
        this.y = this.startY + Math.sin(this.floatPhase) * 20;

        // Bounce off screen edges instead of walls to give 'ghost' passing ability
        if (this.x <= 0 || this.x + this.width >= level.width) {
            this.vx *= -1;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Ghost body (small ghost)
        if (this.acquired) {
            // Violent shaking and dissolving effect
            const shakeX = (Math.random() - 0.5) * 8;
            const shakeY = (Math.random() - 0.5) * 8;
            ctx.translate(shakeX, shakeY);
            
            // Creepy dark aura around acquired enemy
            ctx.shadowColor = '#FF0000';
            ctx.shadowBlur = 20;
            ctx.fillStyle = 'rgba(50, 0, 50, 0.8)'; // Corrupted body color
        } else {
            ctx.fillStyle = 'rgba(200, 255, 200, 0.8)';
            ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(16, 16, 16, Math.PI, 0);
        ctx.lineTo(32, 32);
        ctx.lineTo(24, 28);
        ctx.lineTo(16, 32);
        ctx.lineTo(8, 28);
        ctx.lineTo(0, 32);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0; // Reset shadow

        // Eyes
        if (this.acquired) {
            // Demonic red eye with purple bleeding
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(12, 12, 4, 0, Math.PI * 2);
            ctx.fill();
            // Corrupting tendrils on face
            ctx.strokeStyle = '#800080';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(12, 12); ctx.lineTo(18, 5);
            ctx.moveTo(12, 12); ctx.lineTo(5, 20);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(12, 12, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
