export class CrystalShard {
    constructor(x, y, dir, power) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 8;
        this.vx = 8 * dir; // Very fast
        this.vy = 0;
        this.type = 'crystal_shard';
        this.dead = false;
        this.power = power || 1;
        this.damage = this.power;
    }

    update(deltaTime, level) {
        this.x += this.vx;

        // Collision with level bounds
        if (this.x < 0 || this.x > level.width) {
            this.dead = true;
            return;
        }

        // Collision with blocks
        const cx = Math.floor(this.x / level.tileSize);
        const cy = Math.floor(this.y / level.tileSize);
        if (level.tiles[cy] && level.tiles[cy][cx] > 0 && level.tiles[cy][cx] !== 5) {
            this.dead = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#A0E6FF'; // Icy blue crystal
        ctx.beginPath();
        if (this.vx > 0) {
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height / 2);
            ctx.lineTo(this.x, this.y + this.height);
        } else {
            ctx.moveTo(this.x + this.width, this.y);
            ctx.lineTo(this.x, this.y + this.height / 2);
            ctx.lineTo(this.x + this.width, this.y + this.height);
        }
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
