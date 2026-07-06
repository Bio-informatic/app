export class Gorillomba {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 90;
        this.type = 'gorillomba';
        this.dead = false;

        this.hp = 15;
        this.maxHp = 15;

        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.6;
        this.grounded = false;

        this.baseX = x;

        this.state = 'IDLE'; // IDLE, CHARGING, JUMPING, LANDING
        this.stateTimer = 0;

        // Jump/charge logic
        this.jumpCooldown = 0;
        this.jumpInterval = 2500; // jumps every 2.5 seconds
        this.charging = false;
        this.chargeTimer = 0;
        this.chargeDir = 1;

        this.damageFlicker = 0;
        this.falling = false;

        // Hit flag for melee
        this.recentlyHit = false;
        this.hitCooldown = 0;
    }

    update(deltaTime, level, playerX, playerY) {
        if (this.dead) return;

        if (this.falling) {
            this.vy += 1;
            this.y += this.vy;
            if (this.y > level.height + 200) this.dead = true;
            return;
        }

        this.damageFlicker = Math.max(0, this.damageFlicker - deltaTime);
        this.hitCooldown = Math.max(0, this.hitCooldown - deltaTime);
        this.stateTimer += deltaTime;

        // Apply gravity
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Horizontal collisions
        const ts = level.tileSize;
        const gY = Math.floor((this.y + this.height / 2) / ts);
        const gL = Math.floor(this.x / ts);
        const gR = Math.floor((this.x + this.width) / ts);
        if (gR >= level.cols || (level.tiles[gY] && level.tiles[gY][gR] && level.tiles[gY][gR] !== 0 && level.tiles[gY][gR] !== 9)) {
            this.vx = -Math.abs(this.vx) * 0.5;
            this.x += this.vx;
        } else if (gL < 0 || (level.tiles[gY] && level.tiles[gY][gL] && level.tiles[gY][gL] !== 0 && level.tiles[gY][gL] !== 9)) {
            this.vx = Math.abs(this.vx) * 0.5;
            this.x += this.vx;
        }

        // Vertical collisions
        this.grounded = false;
        const botY = Math.floor((this.y + this.height) / ts);
        const midX1 = Math.floor(this.x / ts);
        const midX2 = Math.floor((this.x + this.width - 1) / ts);
        if (botY < level.rows && level.tiles[botY]) {
            const t1 = level.tiles[botY][midX1];
            const t2 = level.tiles[botY][midX2];
            if ((t1 && t1 !== 0 && t1 !== 9) || (t2 && t2 !== 0 && t2 !== 9)) {
                if (this.vy > 0) {
                    this.y = botY * ts - this.height;
                    this.vy = 0;
                    this.grounded = true;
                }
            }
        }

        // AI state machine
        if (this.state === 'IDLE') {
            this.vx *= 0.8;
            this.jumpCooldown += deltaTime;
            if (this.jumpCooldown > this.jumpInterval) {
                this.jumpCooldown = 0;
                this._triggerJump(playerX, playerY);
            }
        } else if (this.state === 'JUMPING') {
            if (this.grounded && this.stateTimer > 500) {
                this.state = 'LANDING';
                this.stateTimer = 0;
                this.vx = 0;
            }
        } else if (this.state === 'LANDING') {
            this.vx *= 0.7;
            if (this.stateTimer > 600) {
                this.state = 'IDLE';
                this.stateTimer = 0;
            }
        }
    }

    _triggerJump(playerX, playerY) {
        // Jump unpredictably toward player with some randomness
        const dx = playerX - this.x;
        const randomOffset = (Math.random() - 0.5) * 300;
        const jumpVX = (dx + randomOffset) / 30;
        this.vx = Math.max(-12, Math.min(12, jumpVX));
        this.vy = -16 - Math.random() * 4; // tall unpredictable jump
        this.grounded = false;
        this.state = 'JUMPING';
        this.stateTimer = 0;
    }

    takeDamage() {
        if (this.falling || this.hitCooldown > 0) return false;
        this.hp -= 1;
        this.damageFlicker = 300;
        this.hitCooldown = 500; // prevent spam hits
        if (this.hp <= 0) {
            this.falling = true;
            this.vy = -8;
            this.vx = (Math.random() - 0.5) * 10;
        }
        return true;
    }

    /** Returns true if `rect` overlaps with Gorillomba's body — for punch impact zone */
    isHitBy(rect) {
        return !(rect.x + rect.width < this.x ||
                 rect.x > this.x + this.width ||
                 rect.y + rect.height < this.y ||
                 rect.y > this.y + this.height);
    }

    /** Draw in Revealed State (Wild Mutt active - high-fidelity concept) [3] */
    drawRevealed(ctx) {
        const now = performance.now();
        ctx.save();
        if (this.damageFlicker > 0 && Math.floor(now / 60) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const walkCycle = (this.vx !== 0) ? Math.sin(now / 110) * 5 : 0;
        const breathe = Math.sin(now / 200) * 2;

        // Custom Primate-Beast Color Palette [3]
        const cFur = '#D95B14';         // Orange fur base [3]
        const cFurLight = '#F27224';    // Orange highlights [3]
        const cFurDark = '#A63A05';     // Orange shadows [3]
        const cSkin = '#505256';        // Slate grey plate skin [3]
        const cSkinDark = '#35373A';    // Slate shadow grey [3]
        const cVein = '#00FF44';        // Glowing neon green energy veins [3]
        const cClaw = '#A5A6A8';        // Metallic silver-grey claws [3]

        ctx.translate(cx, cy + breathe);

        // Orient the beast towards the direction it is moving/facing
        const facingRight = this.vx > 0;
        if (!facingRight) {
            ctx.scale(-1, 1);
        }

        // ── 1. LEGS (STOUT PRIMATE PILLARS) ──
        ctx.fillStyle = cFurDark;
        ctx.fillRect(-28, 15 - walkCycle, 18, 30); // Left leg
        ctx.fillRect(10, 15 + walkCycle, 18, 30);  // Right leg
        // Feet claws [3]
        ctx.fillStyle = cSkinDark;
        ctx.fillRect(-32, 40 - walkCycle, 20, 6);
        ctx.fillRect(10, 40 + walkCycle, 20, 6);
        ctx.fillStyle = cClaw;
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(-30 + i * 6, 43 - walkCycle, 4, 3);
            ctx.fillRect(12 + i * 6, 43 + walkCycle, 4, 3);
        }

        // ── 2. BULK ORANGE FUR TORSO ──
        ctx.fillStyle = cFurDark;
        ctx.beginPath();
        ctx.ellipse(0, 0, 36, 32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cFur;
        ctx.beginPath();
        ctx.ellipse(0, 0, 33, 29, 0, 0, Math.PI * 2);
        ctx.fill();

        // ── 3. DETAILED SLATE-GREY PECTORAL MUSCLE PLATES ──
        ctx.fillStyle = cSkinDark;
        ctx.beginPath();
        ctx.ellipse(-11, -2, 13, 15, 0, 0, Math.PI * 2); // Left pec [3]
        ctx.ellipse(11, -2, 13, 15, 0, 0, Math.PI * 2);  // Right pec [3]
        ctx.fill();
        ctx.fillStyle = cSkin;
        ctx.beginPath();
        ctx.ellipse(-10, -2, 11, 13, 0, 0, Math.PI * 2);
        ctx.ellipse(10, -2, 11, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // ── 4. GIANT PRIMATE ARMS (CLAWED) ──
        // Left arm
        ctx.fillStyle = cFurDark;
        ctx.fillRect(-45, -20 + walkCycle, 18, 55);
        ctx.fillStyle = cFur;
        ctx.fillRect(-43, -20 + walkCycle, 14, 50);
        // Left huge slate-grey hand [3]
        ctx.fillStyle = cSkinDark;
        ctx.fillRect(-48, 25 + walkCycle, 22, 12);
        ctx.fillStyle = cClaw; // Claws [3]
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(-47 + i * 7, 34 + walkCycle, 5, 5);
        }

        // Right arm
        ctx.fillStyle = cFurDark;
        ctx.fillRect(27, -20 - walkCycle, 18, 55);
        ctx.fillStyle = cFur;
        ctx.fillRect(29, -20 - walkCycle, 14, 50);
        // Right huge hand [3]
        ctx.fillStyle = cSkinDark;
        ctx.fillRect(26, 25 - walkCycle, 22, 12);
        ctx.fillStyle = cClaw; // Claws [3]
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(28 + i * 7, 34 - walkCycle, 5, 5);
        }

        // ── 5. VIBRANT GLOWING NEON GREEN ENERGY VEINS ──
        // Branching green energy traces running down both massive arms [3]
        ctx.strokeStyle = cVein;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = cVein;
        ctx.shadowBlur = 10;
        
        // Left arm veins
        ctx.beginPath();
        ctx.moveTo(-33, -15 + walkCycle);
        ctx.lineTo(-39, 5 + walkCycle);
        ctx.lineTo(-43, 20 + walkCycle);
        ctx.moveTo(-39, 5 + walkCycle);
        ctx.lineTo(-47, 12 + walkCycle);
        ctx.stroke();

        // Right arm veins
        ctx.beginPath();
        ctx.moveTo(33, -15 - walkCycle);
        ctx.lineTo(39, 5 - walkCycle);
        ctx.lineTo(43, 20 - walkCycle);
        ctx.moveTo(39, 5 - walkCycle);
        ctx.lineTo(47, 12 - walkCycle);
        ctx.stroke();
        
        ctx.shadowBlur = 0; // Reset shadow

        // Vein bright core lines
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(-33, -15 + walkCycle); ctx.lineTo(-39, 5 + walkCycle); ctx.lineTo(-43, 20 + walkCycle);
        ctx.moveTo(33, -15 - walkCycle); ctx.lineTo(39, 5 - walkCycle); ctx.lineTo(43, 20 - walkCycle);
        ctx.stroke();

        // ── 6. HEAD (ORANGE HOOD & slate-GREY FACEPLATE) ──
        // Fur dome [3]
        ctx.fillStyle = cFurDark;
        ctx.beginPath();
        ctx.arc(0, -32, 22, Math.PI, 0);
        ctx.lineTo(21, -24);
        ctx.lineTo(-21, -24);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = cFur;
        ctx.beginPath();
        ctx.arc(0, -32, 19, Math.PI, 0);
        ctx.lineTo(18, -24);
        ctx.lineTo(-18, -24);
        ctx.closePath();
        ctx.fill();

        // Slate-grey primate facial shield [3]
        ctx.fillStyle = cSkin;
        ctx.beginPath();
        ctx.ellipse(0, -28, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cSkinDark; // muzzle jaw
        ctx.fillRect(-7, -24, 14, 8);

        // FOUR GLOWING YELLOW BIOLOGICAL EYES (Stacked symmetrically in two pairs!) [3]
        ctx.fillStyle = '#FFFF00';
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 5;
        // Left eye stack
        ctx.fillRect(-6, -32, 2.5, 2.5);
        ctx.fillRect(-6, -28, 2.5, 2.5);
        // Right eye stack
        ctx.fillRect(4, -32, 2.5, 2.5);
        ctx.fillRect(4, -28, 2.5, 2.5);
        ctx.shadowBlur = 0; // Reset

        // ── 7. JUMPING HEIGHT EXTRA AURA GLOW ──
        if (this.state === 'JUMPING') {
            ctx.globalAlpha = 0.22;
            ctx.fillStyle = cVein;
            ctx.beginPath();
            ctx.ellipse(0, 0, 48, 52, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    /** Draw hidden/invisible in small Ben form (VBA - Cloaked State) [3] */
    drawHidden(ctx) {
        const now = performance.now();
        const pulse = (Math.sin(now / 350) + 1) / 2;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const breathe = Math.sin(now / 200) * 2;

        ctx.save();
        ctx.translate(0, breathe);

        // Damage flicker visual indicator
        if (this.damageFlicker > 0 && Math.floor(now / 50) % 2 === 0) {
            ctx.globalAlpha = 0.2;
        } else {
            ctx.globalAlpha = 0.08 + pulse * 0.07;
        }

        // Draw a faint glowing grey-white silhouette [3]
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        // Head / shoulders hunch
        ctx.ellipse(cx, cy - 10, 24, 28, 0, 0, Math.PI * 2);
        // Torso
        ctx.ellipse(cx, cy + 10, 32, 26, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shimmering white glow outline [3]
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 + pulse * 0.45})`;
        ctx.lineWidth = 2.2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFFFFF';
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset

        // FOUR GLOWING YELLOW EYES (The only visible cue!) [3]
        ctx.fillStyle = '#FFDD00';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FFDD00';
        // Left pair (stacked) [3]
        ctx.fillRect(cx - 8, cy - 22, 2.5, 2.5);
        ctx.fillRect(cx - 8, cy - 18, 2.5, 2.5);
        // Right pair (stacked) [3]
        ctx.fillRect(cx + 6, cy - 22, 2.5, 2.5);
        ctx.fillRect(cx + 6, cy - 18, 2.5, 2.5);
        
        // camo nodes glowing across body [3]
        ctx.fillRect(cx - 16, cy + 4, 1.8, 1.8);
        ctx.fillRect(cx + 14, cy - 2, 1.8, 1.8);
        ctx.fillRect(cx, cy + 12, 1.8, 1.8);
        
        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    draw(ctx, wildMuttActive) {
        if (this.dead) return;
        if (wildMuttActive) {
            this.drawRevealed(ctx); // Replaced drawThermal with detailed Concept Art Revealed State! [3]
        } else {
            this.drawHidden(ctx);
        }
    }
}