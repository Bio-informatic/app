export class Turtumba {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 96;   // OPTIMIZATION: Scaled up to make this an epic boss fight
        this.height = 64;  // Fits perfectly in the level's Ground floor
        this.vx = -1;      // Slow heavy march
        this.vy = 0;
        this.gravity = 0.5;
        this.dead = false;
        this.type = 'turtumba';
        this.shieldActive = true;  // Only XLR8 speed dash can crack the armor [3]
        this.hp = 3;               // Requires 3 strategic speed collisions to defeat [3]
        this.maxHp = 3;
        this.hitFlash = 0;
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hitFlash = performance.now();
        if (this.hp <= 0) {
            this.dead = true;
        }
    }

    update(deltaTime, level) {
        if (this.dead) return;

        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Horizontal collisions — bounce off level boundaries & solid blocks
        const gridY = Math.floor((this.y + this.height / 2) / level.tileSize);
        if (this.vx > 0) {
            const gridRight = Math.floor((this.x + this.width) / level.tileSize);
            if (gridRight >= level.cols || (level.tiles[gridY] && level.tiles[gridY][gridRight] !== 0)) {
                this.vx = -Math.abs(this.vx);
            }
        } else if (this.vx < 0) {
            const gridLeft = Math.floor(this.x / level.tileSize);
            if (gridLeft < 0 || (level.tiles[gridY] && level.tiles[gridY][gridLeft] !== 0)) {
                this.vx = Math.abs(this.vx);
            }
        }

        // Vertical collisions
        if (this.vy > 0) {
            const gridBottomY = Math.floor((this.y + this.height) / level.tileSize);
            const gx1 = Math.floor(this.x / level.tileSize);
            const gx2 = Math.floor((this.x + this.width - 0.1) / level.tileSize);
            if (level.tiles[gridBottomY] && (level.tiles[gridBottomY][gx1] !== 0 || level.tiles[gridBottomY][gx2] !== 0)) {
                this.y = gridBottomY * level.tileSize - this.height;
                this.vy = 0;
            }
        }
    }

    draw(ctx) {
        if (this.dead) return;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const now = performance.now();
        const isFlashing = now - this.hitFlash < 300;

        // Custom Cyber-Turtle Color Palette [3]
        const cShell = '#301B40';       // Dark metallic purple base
        const cShellDark = '#170924';   // Deep shadow violet
        const cMetal = '#403855';       // Cybernetic purple-steel joint base
        const cMetalLight = '#635782';  // Highlight steel plate
        const cMetalDark = '#211B2B';   // FIXED: Added missing dark metallic steel color [3]
        const cGem = '#00FF66';         // Glowing emerald / neon green
        const cGemLight = '#DFFFEE';    // Crystal white-green reflection
        const cGemDark = '#009933';     // Deep shadow green

        ctx.save();

        // ── 1. SLOW FIELD CYBERNETIC SHIELD (Aura Bubble) ──
        const shieldPulse = Math.sin(now / 200) * 3;
        ctx.save();
        ctx.globalAlpha = 0.06 + Math.sin(now / 300) * 0.02;
        ctx.fillStyle = cGem;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, this.width * 0.70 + shieldPulse, this.height * 0.85 + shieldPulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Pulsing Neon-Green Outer Boundary
        ctx.save();
        ctx.globalAlpha = 0.5 + Math.sin(now / 150) * 0.15;
        ctx.strokeStyle = cGem;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 2, this.width * 0.70 + shieldPulse, this.height * 0.85 + shieldPulse, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // ── 2. FLOATING RETRO DIGITAL CLOCK DIALS INSIDE AURA ──
        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = cGem;
        ctx.lineWidth = 1.2;
        // Draw 5 glowing clock spheres floating within the slow field bubble
        const clockSymbols = [
            { x: -50, y: -25, r: 5, tH: 0.2 },
            { x: -35, y: -45, r: 4, tH: 0.6 },
            { x: 0, y: -52, r: 6, tH: 1.0 },
            { x: 35, y: -45, r: 4, tH: 1.4 },
            { x: 50, y: -15, r: 5, tH: 1.8 }
        ];
        for (const clock of clockSymbols) {
            const pulseSize = Math.sin(now / 400 + clock.x) * 0.5;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(clock.x, clock.y, clock.r + pulseSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw glowing ticking hands inside clock dials
            ctx.strokeStyle = cGemLight;
            ctx.lineWidth = 1;
            const handAngle = (now / 500 * clock.tH) % (Math.PI * 2);
            ctx.beginPath();
            ctx.moveTo(clock.x, clock.y);
            ctx.lineTo(clock.x + Math.cos(handAngle) * (clock.r - 2), clock.y + Math.sin(handAngle) * (clock.r - 2));
            ctx.stroke();
        }
        ctx.restore();

        // ── 3. INDIVIDUAL BUTTON DIRECTIONAL FLIPPING ──
        ctx.translate(cx, cy);
        const facingRight = this.vx > 0;
        if (!facingRight) {
            ctx.scale(-1, 1); // Auto-orient the sprite toward its walking direction
        }

        const walkCycle = (this.vx !== 0) ? Math.sin(now / 150) * 3 : 0;
        const headBob = Math.sin(now / 220) * 1.5;

        // Damage flash color overwrite
        if (isFlashing) {
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#FFFFFF';
        }

        // ── 4. STUBBY ROBOTIC LIMBS ──
        if (!isFlashing) ctx.fillStyle = cMetal;
        // Back Foot (Far Left background)
        ctx.fillRect(-38, 12 - walkCycle, 12, 18);
        ctx.fillStyle = cMetalDark; // Gray steel claws
        ctx.fillRect(-40, 26 - walkCycle, 3, 4);
        ctx.fillRect(-35, 26 - walkCycle, 3, 4);

        // Front Foot (Far Right foreground)
        if (!isFlashing) ctx.fillStyle = cMetal;
        ctx.fillRect(16, 12 + walkCycle, 14, 18);
        ctx.fillStyle = cMetalDark; // Claws
        ctx.fillRect(24, 26 + walkCycle, 4, 4);
        ctx.fillRect(18, 26 + walkCycle, 4, 4);

        // Armored Knee pads
        if (!isFlashing) ctx.fillStyle = cMetalLight;
        ctx.fillRect(-34, 10 - walkCycle, 6, 6);
        ctx.fillRect(18, 10 + walkCycle, 8, 6);

        // ── 5. SEGMENTED CYBERNETIC NECK & HEAD ──
        // Segmented hydraulic neck plates [3]
        if (!isFlashing) ctx.fillStyle = cMetalDark;
        ctx.fillRect(22, -10 + headBob, 10, 14);
        ctx.fillRect(26, -6 + headBob, 8, 8);

        // Cybernetic Steel Head [3]
        if (!isFlashing) ctx.fillStyle = cMetal;
        ctx.beginPath();
        ctx.moveTo(30, -18 + headBob);
        ctx.lineTo(44, -18 + headBob);
        ctx.lineTo(46, -12 + headBob);
        ctx.lineTo(44, -2 + headBob);
        ctx.lineTo(30, -2 + headBob);
        ctx.closePath();
        ctx.fill();

        // Head plate riveted visor details
        if (!isFlashing) ctx.fillStyle = cMetalLight;
        ctx.fillRect(34, -16 + headBob, 8, 4);

        // Glowing rectangular emerald visor eyes [3]
        ctx.fillStyle = cGem;
        ctx.shadowColor = cGem;
        ctx.shadowBlur = 6;
        ctx.fillRect(38, -10 + headBob, 5, 4);
        ctx.shadowBlur = 0; // Reset

        // ── 6. VIBRANT CYBER-SHELL WITH INTEGRATED CIRCUITS & EMERALDS ──
        // Base heavy violet armor dome [3]
        if (!isFlashing) ctx.fillStyle = cShell;
        ctx.beginPath();
        ctx.ellipse(-10, -2, 38, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner dark purple shadow plates [3]
        if (!isFlashing) ctx.fillStyle = cShellDark;
        ctx.beginPath();
        ctx.ellipse(-8, -1, 33, 23, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing green electronic circuit trace lines [3]
        ctx.strokeStyle = cGem;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-32, -4);
        ctx.lineTo(-24, -12);
        ctx.lineTo(-6, -12);
        ctx.lineTo(-6, 2);
        // Secondary trace branch
        ctx.moveTo(-24, -12);
        ctx.lineTo(-24, 2);
        ctx.stroke();

        // Glowing circuit terminal nodes (glowing green points) [3]
        ctx.fillStyle = cGem;
        ctx.beginPath();
        ctx.arc(-24, 2, 2.5, 0, Math.PI * 2);
        ctx.arc(-6, 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Glowing mechanical gear/cogwheels on the shell [3]
        const drawGear = (gx, gy) => {
            ctx.strokeStyle = cGem;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(gx - 6, gy); ctx.lineTo(gx + 6, gy);
            ctx.moveTo(gx, gy - 6); ctx.lineTo(gx, gy + 6);
            ctx.stroke();

            ctx.fillStyle = cShellDark; // hollow center
            ctx.beginPath(); ctx.arc(gx, gy, 2.5, 0, Math.PI * 2); ctx.fill();
        };
        drawGear(10, -10); // Lower gear
        drawGear(6, -22);  // Upper gear

        // Embedded Emerald Gemstones along the shell top ridge [3]
        const drawFacetedGem = (gx, gy, gw, gh) => {
            ctx.fillStyle = cGemDark;
            ctx.fillRect(gx - gw / 2, gy - gh / 2, gw, gh);
            ctx.fillStyle = cGem;
            ctx.fillRect(gx - gw / 2 + 1, gy - gh / 2 + 1, gw - 2, gh - 2);
            ctx.fillStyle = cGemLight;
            ctx.fillRect(gx - gw / 2 + 1, gy - gh / 2 + 1, 2, 2); // faceted glare
        };
        drawFacetedGem(-20, -26, 12, 6); // Left crystal
        drawFacetedGem(0, -30, 14, 7);   // Center crystal
        drawFacetedGem(20, -24, 10, 5);  // Right crystal

        // Crystalline base rim plates framing the lower edge of shell [3]
        for (let i = 0; i < 5; i++) {
            const gemX = -36 + i * 16;
            const gemY = 16 - Math.abs(Math.sin(i)) * 3;
            drawFacetedGem(gemX, gemY, 12, 5);
        }

        // Tail [3]
        if (!isFlashing) ctx.fillStyle = cMetalDark;
        ctx.beginPath();
        ctx.moveTo(-44, 2);
        ctx.lineTo(-52, 6);
        ctx.lineTo(-44, 12);
        ctx.closePath();
        ctx.fill();

        // ── 7. HEALTH BAR RENDER (Always un-flipped) ──
        ctx.restore(); // Exit the horizontal flipping matrix for the HP UI

        ctx.save();
        const barW = 46;
        const barH = 5;
        const barX = this.x + this.width / 2 - barW / 2;
        const barY = this.y - 14;
        
        ctx.fillStyle = '#222';
        ctx.fillRect(barX, barY, barW, barH);
        
        const hpRatio = this.hp / this.maxHp;
        const r = Math.floor(255 * (1 - hpRatio));
        const g = Math.floor(255 * hpRatio);
        ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        
        ctx.strokeStyle = cGem;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);
        ctx.restore();
    }
}