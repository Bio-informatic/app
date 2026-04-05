export class Fireball {
    constructor(x, y, direction, power) {
        this.x = x;
        this.y = y;
        // Size scales with power level (1-5)
        this.power = Math.min(power, 5);
        const baseSize = 12;
        const sizeBonus = (this.power - 1) * 6;
        this.width = baseSize + sizeBonus;
        this.height = baseSize + sizeBonus;
        this.vx = direction * (8 + this.power); // faster at higher power
        this.vy = 0;
        this.gravity = 0.15; // slight arc
        this.dead = false;
        this.type = 'fireball';
        this.damage = this.power; // damage doubles per level: 1, 2, 4, 8, 16
        this.lifetime = 0;
        this.maxLifetime = 3000; // 3 seconds
        this.spawnTime = performance.now();

        // Trail particles
        this.trail = [];
    }

    update(deltaTime, level) {
        if (this.dead) return;

        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Trail
        this.trail.push({ x: this.x + this.width / 2, y: this.y + this.height / 2, alpha: 1 });
        if (this.trail.length > 10) this.trail.shift();
        this.trail.forEach(p => p.alpha -= 0.1);

        // Lifetime
        if (performance.now() - this.spawnTime > this.maxLifetime) {
            this.dead = true;
            return;
        }

        // Tile collision — destroy brick tiles on contact
        const ts = level.tileSize;
        const gx = Math.floor((this.x + this.width / 2) / ts);
        const gy = Math.floor((this.y + this.height / 2) / ts);

        if (gy >= 0 && gy < level.rows && gx >= 0 && gx < level.cols) {
            const tile = level.tiles[gy][gx];
            if (tile === 1 || tile === 2) {
                // Fireball burns through bricks
                if (tile === 2) {
                    level.tiles[gy][gx] = 0; // destroy brick
                }
                this.dead = true;
                return;
            }
            if (tile === 9) {
                // Lava tile — fireball passes through
                // no collision
            }
            if (tile !== 0 && tile !== 5 && tile !== 9) {
                this.dead = true;
                return;
            }
        }

        // Off-screen
        if (this.y > level.height + 100 || this.x < -100 || this.x > level.width + 100) {
            this.dead = true;
        }
    }

    draw(ctx) {
        if (this.dead) return;

        // Trail
        this.trail.forEach(p => {
            if (p.alpha <= 0) return;
            ctx.fillStyle = `rgba(255, 100, 0, ${p.alpha * 0.4})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, this.width / 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Core fireball
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const r = this.width / 2;

        // Outer glow
        ctx.fillStyle = `rgba(255, 60, 0, 0.5)`;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.fill();

        // Main body
        ctx.fillStyle = '#FF4400';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Inner hot core
        ctx.fillStyle = '#FFCC00';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // White hot center at high power
        if (this.power >= 3) {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
