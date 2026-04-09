export class Electromba {
    constructor(x, y, entitiesArray = null) {
        this.width = 30;
        this.height = 30;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() > 0.5 ? 1 : -1) * 1.5;
        this.vy = 0;
        this.dead = false;
        this.type = 'electromba';
        this.absorbed = false;
        this.hacked = false;
        this.jumpTimer = performance.now() + Math.random() * 2000;
        this.entities = entitiesArray;
    }

    isHacked() {
        return this.hacked;
    }

    update(deltaTime, level) {
        if (this.absorbed) {
            this.type = 'goomba'; // act as generic goomba from now on
        }

        if (this.hacked && this.entities) {
            let nearestHostile = null;
            let nearestDist = Infinity;

            this.entities.forEach(entity => {
                if (!entity || entity === this || entity.dead || entity.type !== 'electromba') return;
                if (entity.isHacked && entity.isHacked()) return;

                const dx = (entity.x + entity.width / 2) - (this.x + this.width / 2);
                const dy = (entity.y + entity.height / 2) - (this.y + this.height / 2);
                const dist = Math.hypot(dx, dy);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestHostile = entity;
                }
            });

            if (nearestHostile) {
                this.vx = nearestHostile.x > this.x ? 2.8 : -2.8;

                if (nearestHostile.y + 4 < this.y && this.vy === 0) {
                    this.vy = -7;
                }

                const overlapping =
                    this.x < nearestHostile.x + nearestHostile.width &&
                    this.x + this.width > nearestHostile.x &&
                    this.y < nearestHostile.y + nearestHostile.height &&
                    this.y + this.height > nearestHostile.y;

                if (overlapping) {
                    nearestHostile.dead = true;
                    this.dead = true;
                }
            }
        }

        this.x += this.vx;
        this.vy += 0.5; // gravity
        this.y += this.vy;

        // Collision Check left/right
        let mCX = Math.floor((this.x + this.width / 2) / level.tileSize);
        let mCY = Math.floor((this.y + this.height / 2) / level.tileSize);
        if (this.vx > 0) mCX = Math.floor((this.x + this.width) / level.tileSize);
        else mCX = Math.floor(this.x / level.tileSize);

        if (level.tiles[mCY] && level.tiles[mCY][mCX] > 0 && level.tiles[mCY][mCX] !== 5) {
            this.vx *= -1; // turn around
        }

        // Floor collision
        let footY = Math.floor((this.y + this.height) / level.tileSize);
        let edgeL = Math.floor(this.x / level.tileSize);
        let edgeR = Math.floor((this.x + this.width) / level.tileSize);

        if (level.tiles[footY] && (level.tiles[footY][edgeL] || level.tiles[footY][edgeR])) {
            this.y = footY * level.tileSize - this.height;
            this.vy = 0;

            const now = performance.now();
            if (!this.absorbed && now > this.jumpTimer) {
                this.vy = -8;
                this.jumpTimer = now + 1500 + Math.random() * 1000;
            }
        }
    }

    draw(ctx) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const hacked = this.isHacked();

        if (this.absorbed || hacked) {
            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00FF44';
            ctx.fillStyle = '#080808';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#00FF44';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#00FF44';
            ctx.fillRect(cx - 5, cy - 2, 10, 4);
            if (hacked && !this.absorbed) {
                ctx.strokeStyle = '#B6FFD1';
                ctx.beginPath();
                ctx.moveTo(this.x + this.width + 2, cy);
                ctx.lineTo(this.x + this.width + 10, cy - 4);
                ctx.lineTo(this.x + this.width + 6, cy);
                ctx.lineTo(this.x + this.width + 10, cy + 4);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        // Electronic coloring
        ctx.fillStyle = '#1A1A24';
        ctx.beginPath();
        ctx.moveTo(cx, this.y + 4);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#00FFCC';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Eye
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 6, cy - 2, 4, 4);
        ctx.fillRect(cx + 2, cy - 2, 4, 4);

        // Electric thunder effect
        if ((performance.now() % 300) < 150) {
            ctx.strokeStyle = '#FFFF00';
            ctx.beginPath();
            ctx.moveTo(cx, this.y - 5);
            ctx.lineTo(cx - 5, this.y - 12);
            ctx.lineTo(cx + 2, this.y - 10);
            ctx.lineTo(cx, this.y - 20);
            ctx.stroke();
        }
    }
}
