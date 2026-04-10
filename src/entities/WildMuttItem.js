export class WildMuttItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = 'wild_mutt_item';
        this.dead = false;
        this._bob = 0;
    }

    update(deltaTime) {
        this._bob += deltaTime * 0.003;
    }

    draw(ctx) {
        if (this.dead) return;
        const bob = Math.sin(this._bob) * 4;
        const bx = this.x;
        const by = this.y + bob;

        // Glow
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#88CCFF';
        ctx.beginPath();
        ctx.ellipse(bx + 16, by + 16, 22, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Omnitrix watch
        ctx.fillStyle = '#222';
        ctx.fillRect(bx + 4, by + 8, 24, 18);
        ctx.fillStyle = '#00FF44';
        ctx.fillRect(bx + 9, by + 13, 14, 8);
        ctx.fillStyle = '#004400';
        ctx.fillRect(bx + 12, by + 15, 8, 4); // silhouette of Wild Mutt paw
        ctx.fillStyle = '#888';
        ctx.fillRect(bx + 2, by + 12, 4, 8); // strap left
        ctx.fillRect(bx + 26, by + 12, 4, 8); // strap right
    }
}
