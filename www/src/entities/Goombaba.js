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
            
            // OPTIMIZATION: Spawns the baby LavaGoomba directly from the lower cauldron furnace hatch [1]
            const baby = new LavaGoomba(
                this.x + 60 - 16, // Centered perfectly on the updated cauldron opening [1, 3]
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

        // ── 1. DORSAL BACK ROCK SPIKES (Top-Left) ──
        ctx.fillStyle = cBasaltDark;
        ctx.strokeStyle = cBasalt;
        ctx.lineWidth = 1;
        // Spike 1 (Higher left) [3]
        ctx.beginPath();
        ctx.moveTo(this.x + 30, this.y + 24 + bob);
        ctx.lineTo(this.x + 36, this.y + 6 + bob);
        ctx.lineTo(this.x + 48, this.y + 16 + bob);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Spike 2 (Lower right) [3]
        ctx.beginPath();
        ctx.moveTo(this.x + 42, this.y + 20 + bob);
        ctx.lineTo(this.x + 48, this.y + 10 + bob);
        ctx.lineTo(this.x + 58, this.y + 18 + bob);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        // ── 2. HUNCHBACK SHOULDERS & BACK (BASALT) ──
        ctx.fillStyle = cBasaltDark;
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y + 40 + bob);
        ctx.lineTo(this.x + 12, this.y + 50 + bob);
        ctx.lineTo(this.x + 16, this.y + 70 + bob);
        ctx.lineTo(this.x + 32, this.y + 80 + bob);
        ctx.lineTo(this.x + 44, this.y + 60 + bob);
        ctx.lineTo(this.x + 36, this.y + 36 + bob);
        ctx.closePath();
        ctx.fill();

        // ── 3. STONE GOLEM HEAD, COLLAR, JAW & CROWN ──
        ctx.fillStyle = cBasaltDark;
        ctx.beginPath();
        ctx.arc(this.x + 56, this.y + 24 + bob, 15, 0, Math.PI * 2);
        ctx.fill();

        // Jagged basalt crown spikes on head [1]
        ctx.fillStyle = cBasalt;
        ctx.beginPath();
        ctx.moveTo(this.x + 44, this.y + 14 + bob);
        ctx.lineTo(this.x + 48, this.y + 4 + bob);
        ctx.lineTo(this.x + 52, this.y + 12 + bob);
        ctx.lineTo(this.x + 56, this.y + 1 + bob);  // center spike
        ctx.lineTo(this.x + 60, this.y + 12 + bob);
        ctx.lineTo(this.x + 64, this.y + 4 + bob);
        ctx.lineTo(this.x + 68, this.y + 14 + bob);
        ctx.fill();

        // Heavy stone rocky jaw collar framing the lower head [3]
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 44, this.y + 30 + bob, 24, 8);
        ctx.fillStyle = cBasalt;
        ctx.fillRect(this.x + 46, this.y + 32 + bob, 20, 4);

        // Glowing slanted volcanic yellow eyes [1, 3]
        ctx.fillStyle = cLavaLight;
        ctx.beginPath();
        // Left eye
        ctx.moveTo(this.x + 48, this.y + 19 + bob);
        ctx.lineTo(this.x + 54, this.y + 21 + bob);
        ctx.lineTo(this.x + 49, this.y + 24 + bob);
        ctx.fill();
        // Right eye
        ctx.beginPath();
        ctx.moveTo(this.x + 64, this.y + 19 + bob);
        ctx.lineTo(this.x + 58, this.y + 21 + bob);
        ctx.lineTo(this.x + 63, this.y + 24 + bob);
        ctx.fill();

        // ── 4. LEFT ARM (SCREEN LEFT) - THE MASSIVE DOMINANT ARM ──
        // Drawn as huge craggy basalt rock segments with seams [3]
        ctx.fillStyle = cBasalt;
        ctx.beginPath();
        ctx.moveTo(this.x + 14, this.y + 40 + bob);
        ctx.lineTo(this.x + 38, this.y + 40 + bob);
        ctx.lineTo(this.x + 32, this.y + 60 + bob);
        ctx.lineTo(this.x + 8, this.y + 60 + bob);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = cBasaltDark; // Forearm
        ctx.fillRect(this.x + 8, this.y + 60 + bob, 24, 25);
        ctx.fillStyle = cBasalt; // Highlights on plates
        ctx.fillRect(this.x + 10,  this.y + 62 + bob, 20, 21);

        // Black outline seams separating the massive rock segments [3]
        ctx.strokeStyle = cBasaltDark;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + 8, this.y + 60 + bob, 24, 25);

        // Craggy fingers clutching the left side of the Cauldron [3]
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 28, this.y + 70 + bob, 6, 12);
        ctx.fillRect(this.x + 26, this.y + 76 + bob, 6, 10);

        // Active glowing orange lava veins cascading down the arm [1]
        ctx.strokeStyle = cLava;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(this.x + 30, this.y + 36 + bob);
        ctx.quadraticCurveTo(this.x + 16, this.y + 48 + bob, this.x + 22, this.y + 70 + bob);
        ctx.stroke();

        ctx.strokeStyle = cLavaLight; // Core bright center of vein
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + 28, this.y + 38 + bob);
        ctx.quadraticCurveTo(this.x + 16, this.y + 48 + bob, this.x + 22, this.y + 68 + bob);
        ctx.stroke();

        // ── 5. STUBBY COLUMN LEGS & FEET ──
        // Left Leg [3]
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 28, this.y + 80 + bob, 14, 12);
        ctx.fillStyle = cBasalt;
        ctx.fillRect(this.x + 24, this.y + 90 + bob, 20, 6);
        // Right Leg [3]
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 64, this.y + 80 + bob, 14, 12);
        ctx.fillStyle = cBasalt;
        ctx.fillRect(this.x + 60, this.y + 90 + bob, 20, 6);

        // ── 6. MOLTEN CLAY CAULDRON (Cradled in front) ──
        // Cauldron Body [1]
        ctx.fillStyle = cClayDark;
        ctx.beginPath();
        ctx.arc(this.x + 60, this.y + 68 + bob, 23, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cClay;
        ctx.beginPath();
        ctx.arc(this.x + 60, this.y + 68 + bob, 21, 0, Math.PI * 2);
        ctx.fill();

        // Cracked glowing veins on the pottery shell [1]
        ctx.strokeStyle = cLava;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x + 48, this.y + 58 + bob);
        ctx.lineTo(this.x + 52, this.y + 68 + bob);
        ctx.lineTo(this.x + 46, this.y + 74 + bob);
        ctx.stroke();

        // Cauldron rim & interior boiling lava surface [1]
        ctx.fillStyle = cClayDark;
        ctx.beginPath();
        ctx.ellipse(this.x + 60, this.y + 48 + bob, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = cLavaLight; // Boiling magma liquid inside pot [1]
        ctx.beginPath();
        ctx.ellipse(this.x + 60, this.y + 48 + bob, 15, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Magma bubble sparkles
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 56 + Math.sin(t/150)*4, this.y + 46 + bob, 2, 2);
        ctx.fillRect(this.x + 64 + Math.cos(t/200)*3, this.y + 47 + bob, 2, 2);

        // Lower furnace hatch/sliding gate [1]
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 52, this.y + 74 + bob, 16, 14);
        ctx.fillStyle = cLava; // Glowing interior heating chamber [1]
        ctx.fillRect(this.x + 55, this.y + 77 + bob, 10, 11);

        // Open metal grate door hinging downwards [1]
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 50, this.y + 88 + bob, 20, 4);
        ctx.fillStyle = cBasalt;
        ctx.fillRect(this.x + 54, this.y + 90 + bob, 12, 2);

        // ── 7. RIGHT ARM (SCREEN RIGHT) - SMALL SUPPORT ARM ──
        // Sits on right, clutching cauldron [3]
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 74, this.y + 54 + bob, 14, 24);
        ctx.fillStyle = cBasalt;
        ctx.fillRect(this.x + 76, this.y + 56 + bob, 10, 20);
        
        // Basalt claws hugging right side of pot [3]
        ctx.fillStyle = cBasaltDark;
        ctx.fillRect(this.x + 72, this.y + 64 + bob, 6, 12);

        // ── 8. HEAT SHIMMER ATMOSPHERE ──
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

        // ── 9. HEALTH BAR ──
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