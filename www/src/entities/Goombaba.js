import { LavaGoomba } from './LavaGoomba.js';

export class Goombaba {
    constructor(x, y, entitiesArray) {
        this.x = x;
        this.y = y;
        this.width = 96;   // 3x size of normal Goomba
        this.height = 96;
        this.vx = -1;      // Slow heavy patrol
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

        // Horizontal collisions — bounce back
        let ts = level.tileSize;
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

        // Spawn baby LavaGoombas every 3 seconds [1]
        const now = performance.now();
        if (now - this.lastSpawnTime > this.spawnInterval) {
            this.lastSpawnTime = now;
            
            // OPTIMIZATION: Spawns the baby LavaGoomba directly from the lower cauldron furnace hatch! [1]
            const baby = new LavaGoomba(
                this.x + 48 - 16, // Centered perfectly on the furnace opening [1]
                this.y + 68       // Spills out from the lower cauldron gate [1]
            );
            baby.vy = -1.5; // Slower upward pop as they spill forward [1]
            baby.vx = (Math.random() > 0.5) ? 1.5 : -1.5; // Runs left or right [1]
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
        
        // Slow heavy breathing/bobbing cycle for the stone giant [2]
        const bob = Math.sin(t / 320) * 1.5;

        // Color Palette [1, 2]
        const cBasalt = '#252528';      // Dark craggy stone base [1]
        const cBasaltLight = '#404044'; // Highlight grey [1]
        const cBasaltDark = '#121214';  // Shadow black [1]
        const cLava = '#FF4500';        // Lava orange base [1]
        const cLavaLight = '#FFA500';   // Highlight yellow-orange [1]
        const cClay = '#6E3A20';        // Terracotta Cauldron base [1]
        const cClayDark = '#432010';    // Terracotta shadow [1]

        // Hurt flash
        if (this.hurtFlash > 0 && this.hurtFlash % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Volcanic aura
        ctx.save();
        ctx.globalAlpha = 0.12 + auraPulse * 0.14;
        ctx.fillStyle = '#FF4A00';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2 + bob, this.width * 0.72, this.height * 0.68, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // ── 1. STONE GIANT SHOULDERS & BACK (BASALT) ──
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 8, this.y + 24 + bob, 80, 52); // backing frame
        
        // Left heavy arm cradling the pot [1]
        ctx.fillStyle = cBasalt;
        ctx.fillRect(this.x + 4, this.y + 40 + bob, 24, 38);
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 2, this.y + 54 + bob, 8, 24); // knuckle joints

        // Right heavy arm cradling the pot [1]
        ctx.fillStyle = cBasalt;
        ctx.fillRect(this.x + 68, this.y + 40 + bob, 24, 38);
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 86, this.y + 54 + bob, 8, 24);

        // ── 2. ACTIVE FLOWING LAVA VEINS (SHOULDERS TO ARMS) ──
        ctx.strokeStyle = cLava;
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Left arm veins
        ctx.moveTo(this.x + 18, this.y + 36 + bob);
        ctx.quadraticCurveTo(this.x + 6, this.y + 48 + bob, this.x + 12, this.y + 68 + bob);
        // Right arm veins (FIXED: changed 'hover' to 'bob') [1]
        ctx.moveTo(this.x + 78, this.y + 36 + bob);
        ctx.quadraticCurveTo(this.x + 90, this.y + 48 + bob, this.x + 84, this.y + 68 + bob);
        ctx.stroke();

        ctx.strokeStyle = cBrassLight; // Yellow molten cores inside veins
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + 16, this.y + 38 + bob);
        ctx.quadraticCurveTo(this.x + 8, this.y + 48 + bob, this.x + 12, this.y + 66 + bob);
        ctx.moveTo(this.x + 80, this.y + 38 + bob);
        ctx.quadraticCurveTo(this.x + 88, this.y + 48 + bob, this.x + 84, this.y + 66 + bob);
        ctx.stroke();

        // ── 3. STONE GOLEM HEAD & JAGGED CROWN ──
        ctx.fillStyle = cBasaltDark;
        ctx.beginPath();
        ctx.arc(this.x + 48, this.y + 24 + bob, 20, 0, Math.PI * 2);
        ctx.fill();

        // Jagged basalt crown spikes on head [1]
        ctx.fillStyle = cBasalt;
        ctx.beginPath();
        ctx.moveTo(this.x + 36, this.y + 14 + bob);
        ctx.lineTo(this.x + 40, this.y + 4 + bob);
        ctx.lineTo(this.x + 44, this.y + 12 + bob);
        ctx.lineTo(this.x + 48, this.y + 1 + bob);  // center spike
        ctx.lineTo(this.x + 52, this.y + 12 + bob);
        ctx.lineTo(this.x + 56, this.y + 4 + bob);
        ctx.lineTo(this.x + 60, this.y + 14 + bob);
        ctx.fill();

        // Glowing fierce yellow/orange eyes [1]
        ctx.fillStyle = cLavaLight;
        ctx.beginPath();
        // Left slanted eye
        ctx.moveTo(this.x + 34, this.y + 20 + bob);
        ctx.lineTo(this.x + 44, this.y + 23 + bob);
        ctx.lineTo(this.x + 36, this.y + 26 + bob);
        ctx.fill();
        // Right slanted eye
        ctx.beginPath();
        ctx.moveTo(this.x + 62, this.y + 20 + bob);
        ctx.lineTo(this.x + 52, this.y + 23 + bob);
        ctx.lineTo(this.x + 60, this.y + 26 + bob);
        ctx.fill();

        // ── 4. MOLTEN CLAY CAULDRON (Cradled in hands) ──
        // Cauldron Body [1]
        ctx.fillStyle = cClayDark;
        ctx.beginPath();
        ctx.arc(this.x + 48, this.y + 66 + bob, 27, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cClay;
        ctx.beginPath();
        ctx.arc(this.x + 48, this.y + 66 + bob, 25, 0, Math.PI * 2);
        ctx.fill();

        // Cracked glowing veins on the pottery shell [1]
        ctx.strokeStyle = cLava;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x + 32, this.y + 54 + bob);
        ctx.lineTo(this.x + 36, this.y + 66 + bob);
        ctx.lineTo(this.x + 28, this.y + 74 + bob);
        ctx.stroke();

        // Cauldron rim & interior boiling lava surface [1]
        ctx.fillStyle = cClayDark;
        ctx.beginPath();
        ctx.ellipse(this.x + 48, this.y + 46 + bob, 21, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = cLavaLight; // Boiling magma liquid inside pot [1]
        ctx.beginPath();
        ctx.ellipse(this.x + 48, this.y + 46 + bob, 18, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Magma bubble sparkles
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 44 + Math.sin(t/150)*4, this.y + 44 + bob, 2, 2);
        ctx.fillRect(this.x + 52 + Math.cos(t/200)*3, this.y + 45 + bob, 2, 2);

        // Lower furnace hatch/sliding gate [1]
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 40, this.y + 72 + bob, 16, 16);
        ctx.fillStyle = cLava; // Glowing interior heating chamber [1]
        ctx.fillRect(this.x + 43, this.y + 75 + bob, 10, 13);

        // Open metal grate door hinging downwards [1]
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 38, this.y + 88 + bob, 20, 4);
        ctx.fillStyle = cBasalt;
        ctx.fillRect(this.x + 42, this.y + 90 + bob, 12, 2);

        // Heat shimmer rings
        ctx.save();
        ctx.strokeStyle = `rgba(255, 160, 20, ${0.22 + auraPulse * 0.15})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 2; i++) {
            const r = 46 + i * 13 + Math.sin(t / 260 + i) * 3;
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, r, r * 0.78, 0, 0, Math.PI * 2);
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
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.hp}/${this.maxHp}`, barX + barW / 2, barY - 2);
        ctx.textAlign = 'left';
    }
}