export class GreyMatterItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = 'grey_matter_item';
        this.dead = false;
        
        // Slight hover animation
        this.startY = y;
        this.hoverOffset = 0;
    }

    update(deltaTime, level) {
        if (this.dead) return;
        const now = performance.now();
        this.hoverOffset = Math.sin(now / 200) * 8;
        this.y = this.startY + this.hoverOffset;
    }

    draw(ctx) {
        if (this.dead) return;
        
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        
        ctx.save();
        
        // Glow
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.arc(cx, cy, 20 + Math.abs(this.hoverOffset), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Base icon
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#0F0';
        ctx.beginPath(); ctx.ellipse(cx - 5, cy, 3, 5, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 5, cy, 3, 5, 0.3, 0, Math.PI * 2); ctx.fill();
        
        // Slits
        ctx.fillStyle = '#000';
        ctx.fillRect(cx - 6, cy - 1, 2, 2);
        ctx.fillRect(cx + 4, cy - 1, 2, 2);

        ctx.restore();
    }
}
