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
            
            // OPTIMIZATION: Spawns the baby directly from the lower furnace hatch of the cauldron! [1, 2]
            const baby = new LavaGoomba(
                this.x + this.width / 2 - 16,
                this.y + this.height - 36
            );
            baby.vy = -3; // Pop up and forward slightly out of the hatch door [1, 2]
            baby.vx = (Math.random() > 0.5) ? 1.5 : -1.5;
            this.entitiesArray.push(baby);
            if (this.onBabySpawn) this.onBabySpawn();
        }
        // Hurt flash countdown
        if (this.hurtFlash > 0) this.hurtFlash--;
    }

    draw(ctx) {
        if (this.dead) return;

        const t = performance.now();
        const auraPulse = 0.5 + 0.5 * Math.sin(t / 220);

        // Volcanic Golem Palette [2]
        const cBasalt = '#2E3033';       // Dark slate stone base
        const cBasaltDark = '#1C1D1F';   // Darkest shadow stone
        const cBasaltLight = '#4B4E54';  // Highlight stone
        const cLava = '#FF5E00';         // Glowing orange
        const cLavaBright = '#FFAE00';   // Lava highlights
        const cLavaCore = '#FFF600';     // Brightest yellow core
        const cClay = '#52362C';         // Cauldron brown
        const cClayDark = '#3B241C';     // Cauldron shadows

        // Hurt flash feedback
        if (this.hurtFlash > 0 && this.hurtFlash % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Volcanic ambient glow aura
        ctx.save();
        ctx.globalAlpha = 0.12 + auraPulse * 0.14;
        ctx.fillStyle = '#FF3300';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.75, this.height * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // ── 1. BACK ROCKY BASALT SPIKES (Hunhed shoulder guard) ──
        ctx.fillStyle = cBasaltDark;
        ctx.beginPath();
        // Left spike
        ctx.moveTo(this.x + 16, this.y + 36); ctx.lineTo(this.x + 10, this.y + 10); ctx.lineTo(this.x + 30, this.y + 26);
        // Center-left spike
        ctx.moveTo(this.x + 32, this.y + 28); ctx.lineTo(this.x + 40, this.y + 2);  ctx.lineTo(this.x + 52, this.y + 24);
        // Right shoulder block
        ctx.moveTo(this.x + 60, this.y + 24); ctx.lineTo(this.x + 72, this.y + 14); ctx.lineTo(this.x + 82, this.y + 32);
        ctx.closePath();
        ctx.fill();

        // ── 2. STONE LEGS & FEET ──
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 18, this.y + 70, 16, 26); // Left thigh
        ctx.fillRect(this.x + 62, this.y + 70, 16, 26); // Right thigh
        // Heavy rock claws/feet
        ctx.fillStyle = cBasalt;
        ctx.fillRect(this.x + 14, this.y + 86, 22, 10);
        ctx.fillRect(this.x + 60, this.y + 86, 22, 10);

        // ── 3. HUNCHED TORSO & HEAD ──
        // Giant Hunched Back rock plate
        ctx.fillStyle = cBasalt;
        ctx.beginPath();
        ctx.ellipse(this.x + 48, this.y + 44, 38, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Embedded stone head
        ctx.fillStyle = cBasaltDark;
        ctx.beginPath();
        ctx.arc(this.x + 64, this.y + 26, 18, 0, Math.PI * 2);
        ctx.fill();

        // Rocky Crown detailing
        ctx.fillStyle = cBasalt;
        ctx.beginPath();
        ctx.moveTo(this.x + 50, this.y + 14); ctx.lineTo(this.x + 54, this.y + 6); ctx.lineTo(this.x + 60, this.y + 10);
        ctx.moveTo(this.x + 60, this.y + 10); ctx.lineTo(this.x + 64, this.y + 4); ctx.lineTo(this.x + 68, this.y + 10);
        ctx.moveTo(this.x + 68, this.y + 10); ctx.lineTo(this.x + 74, this.y + 6); ctx.lineTo(this.x + 78, this.y + 14);
        ctx.closePath();
        ctx.fill();

        // Glowing Volcanic Eyes
        ctx.fillStyle = cLavaBright;
        ctx.beginPath();
        ctx.ellipse(this.x + 54, this.y + 24, 5, 3.5, 0.1, 0, Math.PI * 2);
        ctx.ellipse(this.x + 72, this.y + 24, 5, 3.5, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cLavaCore; // Bright center
        ctx.beginPath();
        ctx.ellipse(this.x + 54, this.y + 24, 2.5, 1.8, 0.1, 0, Math.PI * 2);
        ctx.ellipse(this.x + 72, this.y + 24, 2.5, 1.8, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // ── 4. GIANT LEFT ROCKY ARM & FLOWING LAVA VEINS ──
        ctx.fillStyle = cBasaltDark;
        ctx.beginPath();
        ctx.ellipse(this.x + 22, this.y + 54, 18, 28, 0.2, 0, Math.PI * 2); // left arm cylinder
        ctx.fill();
        ctx.fillStyle = cBasalt;
        ctx.beginPath();
        ctx.ellipse(this.x + 20, this.y + 54, 15, 25, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Glowing animated magma channels running down the left arm [2]
        ctx.strokeStyle = cLava;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(this.x + 22, this.y + 36);
        ctx.quadraticCurveTo(this.x + 12, this.y + 54, this.x + 24, this.y + 72);
        ctx.moveTo(this.x + 28, this.y + 44);
        ctx.quadraticCurveTo(this.x + 20, this.y + 56, this.x + 14, this.y + 66);
        ctx.stroke();
        ctx.strokeStyle = cLavaBright;
        ctx.lineWidth = 1.5;
        ctx.stroke(); // inner hot stripe [2]

        // ── 5. THE MOLTEN CAULDRON (Belly furnace) ──
        const cpX = this.x + 55; // Cauldron center X
        const cpY = this.y + 64; // Cauldron center Y
        
        // Cauldron exterior (Dark, heat-cracked clay pot) [2]
        ctx.fillStyle = cClayDark;
        ctx.beginPath(); ctx.arc(cpX, cpY, 25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = cClay;
        ctx.beginPath(); ctx.arc(cpX, cpY, 23, 0, Math.PI * 2); ctx.fill();

        // Cauldron rim shadow
        ctx.fillStyle = cClayDark;
        ctx.fillRect(cpX - 22, cpY - 18, 44, 5);

        // Top Lava Surface (Boiling liquid opening)
        ctx.fillStyle = cLava;
        ctx.beginPath();
        ctx.ellipse(cpX, cpY - 16, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cLavaCore;
        ctx.beginPath();
        ctx.ellipse(cpX, cpY - 16, 14, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated bubbling magma particles rising from the pot
        ctx.fillStyle = cLavaBright;
        for (let i = 0; i < 3; i++) {
            const bx = cpX - 10 + i * 10 + Math.sin(t / 140 + i) * 3;
            const by = cpY - 18 - Math.abs(Math.sin(t / 120 + i * 2)) * 5;
            ctx.fillRect(bx, by, 3, 3);
        }

        // Cauldron Heat Cracks [2]
        ctx.strokeStyle = cLava;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cpX - 18, cpY - 10); ctx.lineTo(cpX - 12, cpY + 2); ctx.lineTo(cpX - 18, cpY + 12);
        ctx.moveTo(cpX + 16, cpY - 8);  ctx.lineTo(cpX + 10, cpY + 6);
        ctx.stroke();

        // ── 6. CAULDRON HATCH (SPAWNING DOOR) ──
        // Metal frame
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(cpX - 10, cpY + 8, 20, 16);
        // Spawning furnace interior glow [2]
        ctx.fillStyle = cLava;
        ctx.fillRect(cpX - 7, cpY + 11, 14, 11);
        ctx.fillStyle = `rgba(255, 230, 0, ${0.4 + 0.3 * Math.sin(t / 80)})`;
        ctx.fillRect(cpX - 5, cpY + 13, 10, 7);

        // Hatch door (Hinges downward) [1, 2]
        ctx.fillStyle = cBasalt;
        ctx.fillRect(cpX - 12, cpY + 23, 24, 4);
        ctx.fillStyle = cBasaltLight;
        ctx.fillRect(cpX - 10, cpY + 23, 20, 1.5);

        // ── 7. GIANT RIGHT ROCKY ARM ──
        // Reaches forward on the right side to cradle the cauldron
        ctx.fillStyle = cBasaltDark;
        ctx.beginPath();
        ctx.ellipse(this.x + 78, this.y + 60, 14, 22, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cBasalt;
        ctx.beginPath();
        ctx.ellipse(this.x + 78, this.y + 60, 11, 19, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // ── 8. HEAT SHIMMER RINGS (Atmospheric convection waves) ──
        ctx.save();
        ctx.strokeStyle = `rgba(255, 120, 0, ${0.15 + auraPulse * 0.12})`;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 2; i++) {
            const r = 44 + i * 15 + Math.sin(t / 220 + i) * 2.5;
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, r, r * 0.72, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

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