import { LavaGoomba } from './LavaGoomba.js';

export class Goombaba {
    constructor(x, y, entitiesArray) {
        this.x = x;
        this.y = y;
        this.width = 96;   // 3x size of normal Goomba
        this.height = 96;
        this.vx = -1;      // Slow patrol
        this.vy = 0;
        this.gravity = 0.5;
        this.dead = false;
        this.type = 'goombaba';

        this.maxHp = 69;
        this.hp = this.maxHp;

        this.entitiesArray = entitiesArray; // Reference to spawn babies into
        this.lastSpawnTime = performance.now();
        this.spawnInterval = 3000; // 3 seconds

        // Visual
        this.hurtFlash = 0;
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hurtFlash = 8; // frames of flash
        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
        }
    }

    update(deltaTime, level) {
        if (this.dead) return;

        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Horizontal collisions — bounce off walls
        const ts = level.tileSize;
        const gridYMid = Math.floor((this.y + this.height / 2) / ts);

        const gridRight = Math.floor((this.x + this.width) / ts);
        if (gridRight >= level.cols || (level.tiles[gridYMid] && level.tiles[gridYMid][gridRight] !== 0)) {
            this.vx = -Math.abs(this.vx);
        }
        const gridLeft = Math.floor(this.x / ts);
        if (gridLeft < 0 || (level.tiles[gridYMid] && level.tiles[gridYMid][gridLeft] !== 0)) {
            this.vx = Math.abs(this.vx);
        }

        // Vertical collisions
        const gridBottom = Math.floor((this.y + this.height) / ts);
        const gx1 = Math.floor(this.x / ts);
        const gx2 = Math.floor((this.x + this.width - 1) / ts);

        if (gridBottom < level.rows && level.tiles[gridBottom]) {
            if (level.tiles[gridBottom][gx1] !== 0 || level.tiles[gridBottom][gx2] !== 0) {
                if (this.vy > 0) {
                    this.y = gridBottom * ts - this.height;
                    this.vy = 0;
                }
            }
        }

        // Spawn baby LavaGoombas every 3 seconds
        const now = performance.now();
        if (now - this.lastSpawnTime > this.spawnInterval) {
            this.lastSpawnTime = now;
            // Spawn one baby from center of Goombaba
            const baby = new LavaGoomba(
                this.x + this.width / 2 - 16,
                this.y - 32
            );
            baby.vy = -4; // Pop up so they're visible
            baby.vx = (Math.random() > 0.5) ? 2 : -2;
            this.entitiesArray.push(baby);
        }

        // Hurt flash countdown
        if (this.hurtFlash > 0) this.hurtFlash--;
    }

    draw(ctx) {
        if (this.dead) return;

        const t = performance.now();

        // Hurt flash
        if (this.hurtFlash > 0 && this.hurtFlash % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Body — giant dark red
        ctx.fillStyle = '#660000';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Dark cap
        ctx.fillStyle = '#330000';
        ctx.fillRect(this.x + 4, this.y, this.width - 8, 30);

        // Lava cracks across body
        ctx.strokeStyle = '#FF6600';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + 40);
        ctx.lineTo(this.x + 30, this.y + 55);
        ctx.lineTo(this.x + 50, this.y + 45);
        ctx.lineTo(this.x + 70, this.y + 60);
        ctx.lineTo(this.x + 86, this.y + 50);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y + 70);
        ctx.lineTo(this.x + 48, this.y + 80);
        ctx.lineTo(this.x + 76, this.y + 72);
        ctx.stroke();
        ctx.lineWidth = 1;

        // Eyes — large, angry, glowing
        ctx.fillStyle = '#FFCC00';
        ctx.fillRect(this.x + 12, this.y + 20, 20, 16);
        ctx.fillRect(this.x + 64, this.y + 20, 20, 16);
        // Pupils
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x + 18, this.y + 24, 8, 8);
        ctx.fillRect(this.x + 70, this.y + 24, 8, 8);

        // Angry eyebrow lines
        ctx.strokeStyle = '#330000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + 18);
        ctx.lineTo(this.x + 34, this.y + 22);
        ctx.moveTo(this.x + 86, this.y + 18);
        ctx.lineTo(this.x + 62, this.y + 22);
        ctx.stroke();
        ctx.lineWidth = 1;

        // Mouth — jagged teeth
        ctx.fillStyle = '#330000';
        ctx.fillRect(this.x + 20, this.y + 60, 56, 16);
        ctx.fillStyle = '#FFCC00';
        for (let i = 0; i < 7; i++) {
            ctx.fillRect(this.x + 22 + i * 8, this.y + 60, 4, 8);
        }

        // Fire particles on top
        for (let i = 0; i < 6; i++) {
            const fx = this.x + 12 + i * 14 + Math.sin(t / 180 + i) * 4;
            const fy = this.y - 8 - Math.abs(Math.sin(t / 120 + i * 1.5)) * 12;
            ctx.fillStyle = i % 2 === 0 ? '#FF4400' : '#FFAA00';
            ctx.fillRect(fx, fy, 6, 8);
        }

        ctx.globalAlpha = 1.0;

        // ── Health Bar ───────────────────────
        const barW = this.width;
        const barH = 8;
        const barX = this.x;
        const barY = this.y - 16;
        const hpRatio = this.hp / this.maxHp;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);
        // Fill
        const r = Math.floor(255 * (1 - hpRatio));
        const g = Math.floor(255 * hpRatio);
        ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        // Border
        ctx.strokeStyle = '#000';
        ctx.strokeRect(barX, barY, barW, barH);

        // HP text
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.hp}/${this.maxHp}`, barX + barW / 2, barY - 2);
        ctx.textAlign = 'left';
    }
}
