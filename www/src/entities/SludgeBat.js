export class SludgeBat {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.type = 'sludge_bat';
        this.dead = false;
        
        this.baseY = y;
        this.time = Math.random() * 100;
        
        this.vx = (Math.random() < 0.5 ? -1 : 1) * 2;
    }

    update(deltaTime, level) {
        if (this.dead) return;
        this.time += deltaTime / 100;
        
        this.x += this.vx;
        this.y = this.baseY + Math.sin(this.time) * 40; // bob up and down
        
        // Bounds check
        if (this.x < 0 || this.x > level.width) {
            this.dead = true;
        }
    }

    draw(ctx) {
        const cx = this.x + this.width/2;
        const cy = this.y + this.height/2;

        ctx.save();
        ctx.translate(cx, cy);

        // Wings flap
        const flap = Math.sin(performance.now() / 30) * 10;

        ctx.fillStyle = '#668800'; // slime green
        
        // Body
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Left wing
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.lineTo(-20, flap - 10);
        ctx.lineTo(-18, 5);
        ctx.fill();

        // Right wing
        ctx.beginPath();
        ctx.moveTo(8, -2);
        ctx.lineTo(20, flap - 10);
        ctx.lineTo(18, 5);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-3, -2, 2, 2);
        ctx.fillRect(1, -2, 2, 2);
        
        ctx.restore();
    }
}
