export class Mario {
    constructor(x, y, input) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpForce = -12;
        this.gravity = 0.5;
        this.grounded = false;
        this.input = input;
        this.state = 'SMALL'; // SMALL, FOURARMS, HEATBLAST
        this.transforming = false;
        this.transformTimer = 0;
        this.victory = false;
        this.hasWatch = false;

        // Ground Pound (Four Arms)
        this.groundPounding = false;
        this.groundPoundLanded = false;
        this.groundPoundCooldown = 0;

        // Fireball (Heatblast)
        this.fireballPower = 0;       // Current rapid-press power level (1-5)
        this.fireballLastPress = 0;   // Timestamp of last F press
        this.fireballCooldown = 0;    // Timestamp of last fired
        this.facingRight = true;      // Direction for fireball

        // Lava resistance
        this.lavaTimer = 0;           // How long in lava (Heatblast gets 2s grace)

        // Alien countdown timer
        this.alienTimer = 0;              // Timestamp when transformation started
        this.alienTimerDuration = 15000;  // 15 seconds
        this.alienTimerRemaining = 0;     // Seconds left (for HUD display)

        // Double jump (5 per level)
        this.doubleJumpsRemaining = 5;
        this.canDoubleJump = false;       // true after first jump, false after landing or using
        this._jumpWasDown = false;        // edge-detection for key press

        // XLR8 Speed Dash
        this.dashActive = false;
        this.dashTimer = 0;
        this.dashDuration = 500;     // 0.5s burst
        this.dashCooldown = 0;
        this.dashCooldownMs = 2000;  // 2s cooldown
        this.dashTrail = [];         // Speed trail particles
        this.lavaDeath = false;

        // Stinkfly Stamina
        this.maxWingStamina = 6000; // 6 seconds
        this.wingStamina = this.maxWingStamina;

        // Level 6 Upgrade hacking
        this.upgradeShotCooldown = 0;
        this.upgradeElectricImmunity = false;

        // Wild Mutt punch
        this.punchActive = false;
        this.punchTimer = 0;
        this.punchCooldown = 0;
        this.punchRect = null; // {x,y,width,height} hit zone
    }

    transformToFourArms() {
        if (this.state === 'FOURARMS') return;
        this.state = 'FOURARMS';
        this.transforming = true;
        this.transformTimer = performance.now();
        this.alienTimer = performance.now();
        this.y -= 16;
        this.width = 48;
        this.height = 64;
    }

    transformToHeatblast() {
        if (this.state === 'HEATBLAST') return;
        this.state = 'HEATBLAST';
        this.transforming = true;
        this.transformTimer = performance.now();
        this.alienTimer = performance.now();
        // Heatblast is similar size to Four Arms
        if (this.height < 64) this.y -= (64 - this.height);
        this.width = 48;
        this.height = 64;
    }

    revertToSmall() {
        if (this.state === 'SMALL') return;
        this.state = 'SMALL';
        this.y += (this.height - 32);
        this.width = 32;
        this.height = 32;
        this.groundPounding = false;
        this.dashActive = false;
        this.punchActive = false;
        this.alienTimer = 0;
        this.alienTimerRemaining = 0;
        
        // Stinkfly stats
        this.wingStamina = 6000;
        this.maxWingStamina = 6000;
        this.upgradeElectricImmunity = false;
    }

    transformToXLR8() {
        if (this.state === 'XLR8') return;
        this.state = 'XLR8';
        this.transforming = true;
        this.transformTimer = performance.now();
        this.alienTimer = performance.now();
        if (this.height < 56) this.y -= (56 - this.height);
        this.width = 40;
        this.height = 56;
    }

    transformToStinkfly() {
        if (this.state === 'STINKFLY') return;
        this.state = 'STINKFLY';
        this.transforming = true;
        this.transformTimer = performance.now();
        this.alienTimer = performance.now();
        if (this.height < 50) this.y -= (50 - this.height);
        this.width = 45;
        this.height = 50;
        this.wingStamina = this.maxWingStamina;
    }

    transformToUpgrade() {
        if (this.state === 'UPGRADE') return;
        this.state = 'UPGRADE';
        this.transforming = true;
        this.transformTimer = performance.now();
        this.alienTimer = performance.now();
        if (this.height < 50) this.y -= (50 - this.height);
        this.width = 36;
        this.height = 50;
    }

    transformToWildMutt() {
        if (this.state === 'WILDMUTT') return;
        this.state = 'WILDMUTT';
        this.transforming = true;
        this.transformTimer = performance.now();
        this.alienTimer = performance.now();
        if (this.height < 48) this.y -= (48 - this.height);
        this.width = 52;
        this.height = 48;
    }

    update(deltaTime, level) {
        if (this.transforming) {
            if (performance.now() - this.transformTimer > 1000) {
                this.transforming = false;
            }
        }

        // Alien countdown timer — revert to SMALL after 15 seconds
        if (this.alienTimer > 0 && (this.state === 'FOURARMS' || this.state === 'HEATBLAST' || this.state === 'XLR8' || this.state === 'STINKFLY' || this.state === 'UPGRADE' || this.state === 'WILDMUTT')) {
            const elapsed = performance.now() - this.alienTimer;
            this.alienTimerRemaining = Math.max(0, Math.ceil((this.alienTimerDuration - elapsed) / 1000));
            if (elapsed >= this.alienTimerDuration) {
                this.revertToSmall();
            }
        }

        // Apply Gravity (Stinkfly flies naturally)
        if (this.state === 'STINKFLY') {
            this.vy = 0; // zero gravity base
        } else {
            this.vy += this.gravity;
        }

        // Horizontal Movement
        let moveSpeed = this.speed;
        if (this.state === 'XLR8') moveSpeed = this.speed * 2.5;
        if (this.dashActive) moveSpeed = this.speed * 4;
        if (this.state === 'STINKFLY') moveSpeed = this.speed * 1.5;

        if (this.input.isDown('ArrowRight')) {
            this.vx = moveSpeed;
            this.facingRight = true;
        } else if (this.input.isDown('ArrowLeft')) {
            this.vx = -moveSpeed;
            this.facingRight = false;
        } else {
            this.vx = 0;
        }

        // XLR8 Speed Dash update
        if (this.dashActive) {
            if (performance.now() - this.dashTimer > this.dashDuration) {
                this.dashActive = false;
            }
            // Speed trail
            this.dashTrail.push({ x: this.x, y: this.y, alpha: 1.0 });
            if (this.dashTrail.length > 8) this.dashTrail.shift();
        } else {
            // Fade trail
            for (let i = this.dashTrail.length - 1; i >= 0; i--) {
                this.dashTrail[i].alpha -= 0.1;
                if (this.dashTrail[i].alpha <= 0) this.dashTrail.splice(i, 1);
            }
        }

        // Move X
        this.x += this.vx;
        this.handleHorizontalCollisions(level);

        const jumpPressed = this.input.isDown('Space') || this.input.isDown('ArrowUp');
        const jumpJustPressed = jumpPressed && !this._jumpWasDown;
        this._jumpWasDown = jumpPressed;

        if (this.state === 'STINKFLY') {
            this.wingStamina = this.maxWingStamina; // no long drain since natural flight
            if (jumpPressed) {
                this.vy = -moveSpeed; // Fly up
                this._justJumped = true;
            } else if (this.input.isDown('ArrowDown')) {
                this.vy = moveSpeed; // Fly down
            }
        } else {
            if (jumpPressed && this.grounded) {
                // Upgrade has higher floaty jump
                this.vy = this.state === 'FOURARMS' ? -14 : (this.state === 'UPGRADE' ? -15 : -12);
                this.grounded = false;
                this.canDoubleJump = true;
                this._justJumped = true;
            } else if (jumpJustPressed && !this.grounded && this.canDoubleJump && this.doubleJumpsRemaining > 0) {
                // Double jump — higher boost
                this.vy = this.state === 'FOURARMS' ? -18 : (this.state === 'UPGRADE' ? -19 : -16);
                this.canDoubleJump = false;
                this.doubleJumpsRemaining--;
                this._justJumped = true;
            }
        }

        // Ground Pound (Four Arms only, triggered by game.js)
        if (this.groundPounding) {
            this.vx = 0;
            this.vy = 20;
        }

        // Move Y
        this.y += this.vy;
        this.handleVerticalCollisions(level);

        // Lava detection
        const ts = level.tileSize;
        const footY = Math.floor((this.y + this.height) / ts);
        const feetL = Math.floor(this.x / ts);
        const feetR = Math.floor((this.x + this.width - 1) / ts);
        let onLava = false;
        if (level.tiles[footY]) {
            if (level.tiles[footY][feetL] === 9 || level.tiles[footY][feetR] === 9) {
                onLava = true;
            }
        }
        // Also check body center
        const bodyY = Math.floor((this.y + this.height / 2) / ts);
        const bodyX = Math.floor((this.x + this.width / 2) / ts);
        if (level.tiles[bodyY] && level.tiles[bodyY][bodyX] === 9) {
            onLava = true;
        }

        if (onLava) {
            if (this.state === 'STINKFLY' && level.levelIndex === 5) {
                // Stinkfly is immune to poison
                this.lavaTimer = 0;
            } else if (this.state === 'HEATBLAST') {
                // Heatblast: slow sink, 2 second grace
                this.lavaTimer += deltaTime || 16;
                this.vy = Math.min(this.vy, 1); // slow sinking
                if (this.lavaTimer > 2000) {
                    this.lavaDeath = true; // game.js reads this
                }
            } else {
                // Instant death
                this.lavaDeath = true;
            }
        } else {
            this.lavaTimer = 0;
        }

        // Screen Boundaries
        if (this.x < 0) this.x = 0;
        if (this.y > 2000) this.y = 0;

        // Controlled Boss
        if (this.controllingBoss) {
            this.width = this.controllingBoss.width;
            this.height = this.controllingBoss.height;
            this.controllingBoss.x = this.x;
            this.controllingBoss.y = this.y;
            this.controllingBoss.vx = this.vx;
            this.viewYOffset = 40; // shift draw up or let the boss render
        } else {
            // Restore width if dropped?
        }
    }

    activateUpgradeElectricImmunity() {
        this.upgradeElectricImmunity = true;
    }

    hasUpgradeElectricImmunity(levelIndex = null) {
        return this.state === 'UPGRADE' &&
            levelIndex === 6 &&
            this.upgradeElectricImmunity;
    }

    // Non-solid tiles: 0 (air), 9 (lava), 10 (speed panel), 11 (electric fence)
    isSolid(tile) {
        return tile !== 0 && tile !== 9 && tile !== 10 && tile !== 11;
    }

    handleHorizontalCollisions(level) {
        const gridTop = Math.floor(this.y / level.tileSize);
        const gridBottom = Math.floor((this.y + this.height - 0.1) / level.tileSize);

        if (this.vx > 0) {
            const gridRight = Math.floor((this.x + this.width) / level.tileSize);
            if (level.tiles[gridTop] && this.isSolid(level.tiles[gridTop][gridRight]) ||
                level.tiles[gridBottom] && this.isSolid(level.tiles[gridBottom][gridRight])) {
                this.x = gridRight * level.tileSize - this.width;
                this.vx = 0;
            }
        } else if (this.vx < 0) {
            const gridLeft = Math.floor(this.x / level.tileSize);
            if (level.tiles[gridTop] && this.isSolid(level.tiles[gridTop][gridLeft]) ||
                level.tiles[gridBottom] && this.isSolid(level.tiles[gridBottom][gridLeft])) {
                this.x = (gridLeft + 1) * level.tileSize;
                this.vx = 0;
            }
        }
    }

    handleVerticalCollisions(level) {
        const gridLeft = Math.floor(this.x / level.tileSize);
        const gridRight = Math.floor((this.x + this.width - 0.1) / level.tileSize);

        if (this.vy > 0) {
            const gridBottom = Math.floor((this.y + this.height) / level.tileSize);
            let leftTile = level.tiles[gridBottom] ? level.tiles[gridBottom][gridLeft] : 0;
            let rightTile = level.tiles[gridBottom] ? level.tiles[gridBottom][gridRight] : 0;
            // Non-solid tiles can be passed through
            if (!this.isSolid(leftTile)) leftTile = 0;
            if (!this.isSolid(rightTile)) rightTile = 0;

            if (leftTile !== 0 || rightTile !== 0) {
                this.y = gridBottom * level.tileSize - this.height;
                this.vy = 0;
                this.grounded = true;
                this.canDoubleJump = false;

                if (this.groundPounding) {
                    this.groundPounding = false;
                    this.groundPoundLanded = true;
                    this.groundPoundCooldown = performance.now();
                }
            } else {
                this.grounded = false;
            }
        } else if (this.vy < 0) {
            const gridTop = Math.floor(this.y / level.tileSize);
            let hitTile = 0;
            if (level.tiles[gridTop]) {
                if (this.isSolid(level.tiles[gridTop][gridLeft])) hitTile = level.tiles[gridTop][gridLeft];
                else if (this.isSolid(level.tiles[gridTop][gridRight])) hitTile = level.tiles[gridTop][gridRight];
            }

            if (hitTile !== 0) {
                this.y = (gridTop + 1) * level.tileSize;
                this.vy = 0;

                if (hitTile === 3 && this.onBlockHit) {
                    const hitX = (level.tiles[gridTop][gridLeft] === 3) ? gridLeft : gridRight;
                    this.onBlockHit(3, hitX * level.tileSize, gridTop * level.tileSize);
                }
            }
            this.grounded = false;
        }
    }

    draw(ctx) {
        if (this.transforming) {
            for (let i = 0; i < 20; i++) {
                const rx = this.x + Math.random() * this.width;
                const ry = this.y + Math.random() * this.height;
                let colors;
                if (this.state === 'HEATBLAST') colors = ['#FF4400', '#FFCC00', '#8B0000', '#FFD700'];
                else if (this.state === 'XLR8') colors = ['#00FFFF', '#0A0A2E', '#000', '#00AAFF'];
                else colors = ['#C80000', '#FFF', '#000', '#00FF00'];
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                ctx.fillRect(rx, ry, 4, 4);
            }
            let strokeColor = '#C80000';
            if (this.state === 'HEATBLAST') strokeColor = '#FF4400';
            else if (this.state === 'XLR8') strokeColor = '#00FFFF';
            ctx.strokeStyle = strokeColor;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            return;
        }

        if (this.state === 'HEATBLAST') {
            this.drawHeatblast(ctx);
        } else if (this.state === 'FOURARMS') {
            this.drawFourArms(ctx);
        } else if (this.state === 'XLR8') {
            this.drawXLR8(ctx);
        } else if (this.state === 'STINKFLY') {
            this.drawStinkfly(ctx);
        } else if (this.state === 'UPGRADE') {
            this.drawUpgrade(ctx);
        } else if (this.state === 'WILDMUTT') {
            this.drawWildMutt(ctx);
        } else {
            this.drawMario(ctx);
        }
    }

    drawMario(ctx) {
        let shirtColor = '#ff0000';
        let overallsColor = '#0000ff';
        let hatColor = '#ff0000';

        if (this.hasWatch) {
            shirtColor = '#000000';
            overallsColor = '#004400';
            hatColor = '#39FF14';
        }

        ctx.fillStyle = shirtColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = overallsColor;
        ctx.fillRect(this.x + 4, this.y + 20, 24, 12);
        ctx.fillRect(this.x + 4, this.y + 14, 8, 10);
        ctx.fillRect(this.x + 20, this.y + 14, 8, 10);

        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(this.x + 6, this.y + 4, 20, 14);

        ctx.fillStyle = hatColor;
        ctx.fillRect(this.x, this.y, 32, 6);
        ctx.fillRect(this.x + 8, this.y - 2, 16, 4);

        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 20, this.y + 8, 4, 4);
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 18, this.y + 14, 10, 4);

        if (!this.grounded) {
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(this.x + 4, this.y + 24, 24, 8);
        }
    }

    drawFourArms(ctx) {
        const centerX = this.x + 24;
        const bottomY = this.y + 64;

        ctx.save();
        ctx.translate(centerX, bottomY);
        ctx.scale(2, 2);

        ctx.fillStyle = '#000000';
        ctx.fillRect(-5, -8, 10, 8);

        ctx.fillStyle = '#C80000';
        ctx.fillRect(-6, -22, 12, 14);

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(-6, -22); ctx.lineTo(6, -22); ctx.lineTo(0, -12);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.fillRect(-2, -22, 4, 14);

        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(0, -18, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#39FF14';
        ctx.beginPath(); ctx.moveTo(-2, -18); ctx.lineTo(2, -20); ctx.lineTo(2, -16); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-2, -18); ctx.lineTo(2, -16); ctx.lineTo(2, -20); ctx.fill();

        ctx.fillStyle = '#C80000';
        ctx.fillRect(-3, -27, 6, 5);
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(-2, -26, 1, 1); ctx.fillRect(1, -26, 1, 1);
        ctx.fillRect(-2, -24, 1, 1); ctx.fillRect(1, -24, 1, 1);

        let raiseHands = this.input.isDown('R');
        let armYOffset = 0;
        if (this.victory) { raiseHands = true; armYOffset = Math.sin(performance.now() / 150) * 3; }

        ctx.fillStyle = '#C80000';
        if (raiseHands) {
            const yBaseUpper = -28 + armYOffset; const yBaseLower = -16 + armYOffset;
            const yBaseGloves1 = -31 + armYOffset; const yBaseGloves2 = -19 + armYOffset;
            ctx.fillRect(-12, yBaseUpper, 4, 10); ctx.fillRect(8, yBaseUpper, 4, 10);
            ctx.fillRect(-12, yBaseLower, 4, 10); ctx.fillRect(8, yBaseLower, 4, 10);
            ctx.fillStyle = '#000';
            ctx.fillRect(-13, yBaseGloves1, 6, 3); ctx.fillRect(7, yBaseGloves1, 6, 3);
            ctx.fillRect(-13, yBaseGloves2, 6, 3); ctx.fillRect(7, yBaseGloves2, 6, 3);
        } else {
            ctx.fillRect(-10, -22, 4, 10); ctx.fillRect(6, -22, 4, 10);
            ctx.fillRect(-10, -10, 4, 10); ctx.fillRect(6, -10, 4, 10);
            ctx.fillStyle = '#000';
            ctx.fillRect(-11, -12, 6, 3); ctx.fillRect(5, -12, 6, 3);
            ctx.fillRect(-11, 0, 6, 3); ctx.fillRect(5, 0, 6, 3);
        }

        ctx.restore();
    }

    drawHeatblast(ctx) {
        const centerX = this.x + 24;
        const bottomY = this.y + 64;
        const now = performance.now();

        ctx.save();
        ctx.translate(centerX, bottomY);
        ctx.scale(2, 2);

        // Legs — dark maroon
        ctx.fillStyle = '#5C0000';
        ctx.fillRect(-5, -8, 10, 8);
        // Lava cracks on legs
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-3, -6); ctx.lineTo(0, -2); ctx.lineTo(3, -5);
        ctx.stroke();

        // Body — dark crimson with lava crack pattern
        ctx.fillStyle = '#7A0000';
        ctx.fillRect(-6, -22, 12, 14);

        // Lava crack lines on body
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-5, -20); ctx.lineTo(-2, -16); ctx.lineTo(2, -18);
        ctx.lineTo(5, -14); ctx.lineTo(3, -10);
        ctx.moveTo(-4, -12); ctx.lineTo(0, -9);
        ctx.stroke();

        // Omnitrix on chest
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(0, -16, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#39FF14';
        ctx.beginPath(); ctx.moveTo(-2, -16); ctx.lineTo(2, -18); ctx.lineTo(2, -14); ctx.fill();

        // Head — dark red
        ctx.fillStyle = '#7A0000';
        ctx.fillRect(-4, -28, 8, 6);
        // Lava crack on face
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-2, -27); ctx.lineTo(0, -24); ctx.lineTo(2, -26);
        ctx.stroke();

        // Eyes — white/yellow glow
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-3, -26, 2, 2);
        ctx.fillRect(1, -26, 2, 2);

        // Flame crown (animated)
        const flames = [
            { dx: -3, h: 6 + Math.sin(now / 100) * 2 },
            { dx: -1, h: 8 + Math.sin(now / 80 + 1) * 3 },
            { dx: 1,  h: 7 + Math.sin(now / 90 + 2) * 2 },
            { dx: 3,  h: 5 + Math.sin(now / 110 + 3) * 2 },
        ];
        for (const f of flames) {
            // Outer flame (orange)
            ctx.fillStyle = '#FF6600';
            ctx.fillRect(f.dx - 1, -28 - f.h, 2, f.h);
            // Inner flame (yellow)
            ctx.fillStyle = '#FFCC00';
            ctx.fillRect(f.dx, -28 - f.h + 2, 1, f.h - 3);
        }

        // Arms — two arms
        ctx.fillStyle = '#7A0000';
        ctx.fillRect(-10, -20, 4, 10);
        ctx.fillRect(6, -20, 4, 10);
        // Lava cracks on arms
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-9, -18); ctx.lineTo(-8, -13);
        ctx.moveTo(7, -17); ctx.lineTo(9, -12);
        ctx.stroke();

        // Hands — yellow/golden
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-11, -10, 5, 3);
        ctx.fillRect(6, -10, 5, 3);

        // Fire aura glow (subtle)
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#FF4400';
        ctx.beginPath();
        ctx.arc(0, -15, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        ctx.restore();
    }

    drawXLR8(ctx) {
        const centerX = this.x + 20;
        const bottomY = this.y + 56;
        const now = performance.now();

        // Draw speed trail afterimages
        for (const trail of this.dashTrail) {
            ctx.save();
            ctx.globalAlpha = trail.alpha * 0.35;
            ctx.translate(trail.x + 20, trail.y + 56);
            ctx.scale(2, 2);
            // Silhouette afterimage
            ctx.fillStyle = '#00CCCC';
            ctx.beginPath();
            ctx.ellipse(0, -14, 6, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.save();
        ctx.translate(centerX, bottomY);
        ctx.scale(2, 2);

        // === BALL WHEELS (feet) ===
        // Large distinct roller spheres
        ctx.fillStyle = '#666677';
        ctx.beginPath(); ctx.arc(-5, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(5, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111'; // Wheel hub/axle
        ctx.beginPath(); ctx.arc(-5, 0, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(5, 0, 1.5, 0, Math.PI * 2); ctx.fill();

        // === LEGS ===
        // Thin digitigrade legs
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#111116';
        ctx.beginPath();
        // Back leg
        ctx.moveTo(-5, 0); ctx.lineTo(-8, -6); ctx.lineTo(-4, -12);
        // Front leg
        ctx.moveTo(5, 0); ctx.lineTo(2, -6); ctx.lineTo(4, -12);
        ctx.stroke();

        // === TAIL ===
        // Thick at base, tapering out long and low
        ctx.fillStyle = '#111116';
        ctx.beginPath();
        ctx.moveTo(-6, -14);
        ctx.lineTo(-20, -18);
        ctx.lineTo(-22, -17);
        ctx.lineTo(-6, -10);
        ctx.closePath();
        ctx.fill();
        // Tail cyan stripes
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-16, -14); ctx.lineTo(-14, -16);
        ctx.moveTo(-10, -12); ctx.lineTo(-8, -14);
        ctx.stroke();

        // === BODY/TORSO ===
        // Sharp forward arched posture
        ctx.fillStyle = '#111116';
        ctx.beginPath();
        ctx.moveTo(-7, -13);
        ctx.lineTo(3, -11); // waist
        ctx.lineTo(8, -22); // chest jutting forward
        ctx.lineTo(-4, -22); // back
        ctx.closePath();
        ctx.fill();

        // Cyan torso stripes
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -13); ctx.lineTo(6, -16); // lower stripe
        ctx.moveTo(2, -16); ctx.lineTo(7, -19); // upper stripe
        ctx.stroke();

        // === OMNITRIX ===
        ctx.fillStyle = '#39FF14'; // Bright green
        ctx.beginPath();
        ctx.arc(4, -18, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.fillRect(3, -19, 2, 2);

        // === ARMS & CLAWS ===
        ctx.strokeStyle = '#111116';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Front arm reaching forward
        ctx.moveTo(6, -20); ctx.lineTo(12, -18); ctx.lineTo(16, -16);
        ctx.stroke();
        // Claws (Cyan/Silver)
        ctx.fillStyle = '#00E5FF';
        ctx.fillRect(16, -17, 3, 1);
        ctx.fillRect(15, -15, 3, 1);

        // === HEAD & HELMET ===
        // The most iconic part — cone shape sweeping back, visor covering face
        ctx.fillStyle = '#111116';
        ctx.beginPath();
        ctx.moveTo(1, -22); // neck base
        ctx.lineTo(10, -25); // forehead
        ctx.lineTo(-4, -32); // tip of helmet in back
        ctx.lineTo(-5, -28);
        ctx.lineTo(-12, -31); // lower spike
        ctx.lineTo(-6, -26); 
        ctx.lineTo(-4, -22); // back of neck
        ctx.closePath();
        ctx.fill();

        // White Face Plate (jaw area)
        ctx.fillStyle = '#DDDDDD';
        ctx.beginPath();
        ctx.moveTo(2, -22);
        ctx.lineTo(8, -25);
        ctx.lineTo(7, -21);
        ctx.lineTo(4, -20);
        ctx.closePath();
        ctx.fill();

        // Cyan Visor mask
        ctx.fillStyle = '#00E5FF';
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(10, -25);
        ctx.lineTo(9, -23);
        ctx.lineTo(1, -22);
        ctx.closePath();
        ctx.fill();

        // Eye glow
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(5, -24, 2, 1);

        // === SPEED EFFECTS ===
        if (this.dashActive) {
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 0.6;
            for (let i = 0; i < 6; i++) {
                const ly = -28 + i * 5;
                const lx = -14 - Math.random() * 10;
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(lx - 10, ly);
                ctx.stroke();
            }
            // Glow aura
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#00FFFF';
            ctx.beginPath();
            ctx.ellipse(1, -16, 10, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        } else if (this.vx !== 0) {
            // Subtle speed lines when running
            ctx.strokeStyle = 'rgba(0,255,255,0.2)';
            ctx.lineWidth = 0.4;
            for (let i = 0; i < 3; i++) {
                const ly = -22 + i * 6;
                ctx.beginPath();
                ctx.moveTo(-10, ly);
                ctx.lineTo(-14, ly);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    drawStinkfly(ctx) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const now = performance.now();

        ctx.save();
        ctx.translate(cx, cy);
        
        const facingFlip = this.facingRight ? 1 : -1;
        ctx.scale(facingFlip, 1);

        // Hover bobbing
        if (!this.grounded) {
            ctx.translate(0, Math.sin(now / 150) * 3);
        }

        // --- Blocky Stinkfly Design ---
        const bX = -this.width / 2;
        const bY = -this.height / 2;

        // Wings (behind body)
        ctx.fillStyle = 'rgba(200, 255, 200, 0.6)';
        const flapOffset = this.grounded ? 0 : Math.sin(now / 20) * 5;
        
        // Back Wing
        ctx.fillRect(bX - 15, bY + 5 - flapOffset, 30, 8);
        ctx.fillRect(bX - 25, bY + 8 - flapOffset, 10, 5);
        // Front Wing
        ctx.fillRect(bX - 10, bY + 15 + flapOffset/2, 25, 6);

        // Body (Dark greenish)
        ctx.fillStyle = '#115511';
        ctx.fillRect(bX + 5, bY + 10, 30, 25);
        ctx.fillRect(bX, bY + 15, 40, 15);
        
        // Stripes (White/Pale green)
        ctx.fillStyle = '#88FF88';
        ctx.fillRect(bX + 15, bY + 10, 4, 25);
        ctx.fillRect(bX + 25, bY + 12, 4, 18);

        // Tail
        ctx.fillStyle = '#0a220a';
        ctx.fillRect(bX - 15, bY + 20, 15, 8);
        ctx.fillRect(bX - 25, bY + 22, 10, 4);

        // Head (Black dome with orange eyes)
        ctx.fillStyle = '#000000';
        ctx.fillRect(bX + 30, bY + 5, 20, 15); // head box
        
        // Eye Stalks
        ctx.fillStyle = '#115511';
        ctx.fillRect(bX + 45, bY - 5, 4, 10);
        ctx.fillRect(bX + 38, bY + 0, 4, 5);
        
        // Eyes (Orange squares)
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(bX + 44, bY - 8, 6, 6);
        ctx.fillRect(bX + 37, bY - 3, 6, 6);
        
        // Pupils
        ctx.fillStyle = '#000';
        ctx.fillRect(bX + 46, bY - 6, 2, 4);
        ctx.fillRect(bX + 39, bY - 1, 2, 4);

        // Omnitrix symbol
        ctx.fillStyle = '#000';
        ctx.fillRect(bX + 15, bY + 18, 10, 10);
        ctx.fillStyle = '#39FF14';
        ctx.fillRect(bX + 17, bY + 20, 6, 6);
        ctx.fillStyle = '#000';
        ctx.fillRect(bX + 19, bY + 20, 2, 6); // simple hourglass shape impression

        // Legs (Spindly, bent)
        ctx.fillStyle = '#111';
        // Legs front
        ctx.fillRect(bX + 25, bY + 35, 4, 15);
        ctx.fillRect(bX + 27, bY + 45, 6, 4);
        // Legs back
        ctx.fillRect(bX + 10, bY + 35, 4, 15);
        ctx.fillRect(bX + 8, bY + 45, -6, 4);

        ctx.restore();
    }

    drawUpgrade(ctx) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height; // anchor at bottom
        const now = performance.now();
        const immune = this.upgradeElectricImmunity;
        const circuitColor = immune ? '#B6FFD1' : '#00FF44';

        // Jelly physics scale based on velocity
        let scaleX = 1.0;
        let scaleY = 1.0;
        if (!this.grounded) {
            scaleY = 1.0 + Math.abs(this.vy) * 0.03; // stretch vertical
            scaleX = 1.0 - Math.abs(this.vy) * 0.015; // squash horizontal
        } else if (this.vx !== 0) {
            scaleX = 1.0 + Math.abs(this.vx) * 0.05; // stretch horizontal
            scaleY = 1.0 - Math.abs(this.vx) * 0.02; // squash vertical
            // liquid wobble
            scaleY += Math.sin(now / 50) * 0.08;
            scaleX += Math.cos(now / 50) * 0.04;
        }

        ctx.save();
        ctx.translate(cx, cy);
        
        const facingFlip = this.facingRight ? 1 : -1;
        ctx.scale(facingFlip * scaleX, scaleY);
        ctx.translate(0, -this.height);

        // --- GLOW EFFECT ---
        ctx.shadowBlur = 10;
        ctx.shadowColor = circuitColor;

        // --- MAIN BODY (PITCH BLACK) ---
        ctx.fillStyle = '#111';
        ctx.beginPath();
        // Slime/gel shaped body (more liquid)
        ctx.moveTo(0, 0); // top head
        ctx.bezierCurveTo(-15, 0, -20, 10, -18, 25); // left shoulder
        ctx.bezierCurveTo(-20, 40, -18, 55, -12, 56); // left leg
        ctx.lineTo(12, 56); // feet base
        ctx.bezierCurveTo(18, 55, 20, 40, 18, 25); // right shoulder
        ctx.bezierCurveTo(20, 10, 15, 0, 0, 0); // head back
        ctx.fill();

        // --- WHITE INNER PART (Chest/Face) ---
        ctx.shadowBlur = 0; // No glow on white
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(0, 5); 
        ctx.bezierCurveTo(-8, 5, -12, 15, -10, 30); 
        ctx.bezierCurveTo(-12, 45, -5, 52, 0, 52); 
        ctx.bezierCurveTo(5, 52, 12, 45, 10, 30); 
        ctx.bezierCurveTo(8, 15, 8, 5, 0, 5); 
        ctx.fill();

        // --- CIRCUIT PATTERNS (Neon Green) ---
        ctx.strokeStyle = circuitColor;
        ctx.lineWidth = 1.5;
        const pulseAlpha = 0.5 + Math.sin(now / 200) * 0.3;
        ctx.globalAlpha = pulseAlpha;
        
        const drawCircuit = (sx, sy, dots) => {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            dots.forEach(d => ctx.lineTo(d.x, d.y));
            ctx.stroke();
            // Tiny glow tip
            const last = dots[dots.length-1];
            ctx.fillStyle = circuitColor;
            ctx.beginPath(); ctx.arc(last.x, last.y, 1.5, 0, Math.PI*2); ctx.fill();
        };

        // Left side circuits
        drawCircuit(-12, 15, [{x: -8, y: 18}, {x: -12, y: 25}, {x: -10, y: 35}]);
        drawCircuit(-14, 30, [{x: -16, y: 40}, {x: -13, y: 48}]);
        
        // Right side circuits
        drawCircuit(12, 15, [{x: 8, y: 18}, {x: 12, y: 25}, {x: 10, y: 35}]);
        drawCircuit(14, 30, [{x: 16, y: 40}, {x: 13, y: 48}]);
        
        ctx.globalAlpha = 1.0;

        // --- EYE (Glowing Green) ---
        ctx.shadowBlur = 15;
        ctx.shadowColor = circuitColor;
        ctx.strokeStyle = circuitColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 10, 5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(0, 10, 3, 0, Math.PI * 2);
        ctx.fill();

        // --- OMNITRIX (Chest) ---
        ctx.translate(0, 25);
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
        
        ctx.fillStyle = circuitColor;
        // Hourglass shape
        ctx.beginPath();
        ctx.moveTo(-3, -3); ctx.lineTo(3, 3);
        ctx.arc(0, 0, 4, Math.PI/4, (3*Math.PI)/4);
        ctx.lineTo(-3, 3); ctx.lineTo(3, -3);
        ctx.arc(0, 0, 4, (5*Math.PI)/4, (7*Math.PI)/4);
        ctx.fill();

        ctx.restore();
    }

    drawWildMutt(ctx) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const now = performance.now();
        const flip = this.facingRight ? 1 : -1;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(flip, 1);

        // Body (large quadruped — low to ground)
        // --- Body (Vibrant Orange Alien) ---
        ctx.fillStyle = '#FF8C00'; 
        // Main mass (hunched forward)
        ctx.beginPath();
        ctx.ellipse(0, 5, 28, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shaggy fur on back (darker orange/red)
        ctx.fillStyle = '#E65C00';
        ctx.beginPath();
        ctx.moveTo(-25, -5);
        ctx.lineTo(-10, -15);
        ctx.lineTo(10, -18);
        ctx.lineTo(25, -12);
        ctx.lineTo(15, 5);
        ctx.fill();

        // neck/chin fur (shaggy)
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(15, 10);
        ctx.lineTo(25, 15);
        ctx.lineTo(20, 25);
        ctx.lineTo(10, 28);
        ctx.lineTo(5, 25);
        ctx.fill();

        // --- Head (No eyes, just mouth and gills) ---
        // Gill slits (distinct feature on neck)
        ctx.strokeStyle = '#4A1A00';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(18 + i * 2, -2);
            ctx.lineTo(22 + i * 2, 8);
            ctx.stroke();
        }

        // Large mouth with fangs (lower part of face)
        ctx.fillStyle = '#1A0800';
        ctx.fillRect(25, 5, 14, 8);
        // Fangs (White)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(27, 5); ctx.lineTo(29, 12); ctx.lineTo(31, 5); ctx.fill(); 
        ctx.beginPath();
        ctx.moveTo(33, 5); ctx.lineTo(35, 12); ctx.lineTo(37, 5); ctx.fill();

        // --- Legs (Massive muscular front arms) ---
        // Back Leg
        ctx.fillStyle = '#D64500';
        ctx.fillRect(-22, 10, 10, 24);
        ctx.fillStyle = '#222';
        ctx.fillRect(-24, 34, 14, 4); // Back claws

        // Massive Front Arm
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(15, 15);
        ctx.lineTo(10, 35);
        ctx.lineTo(-5, 35);
        ctx.lineTo(-10, 15);
        ctx.fill();

        // Massive Front Paw/Claws
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.moveTo(15, 35);
        ctx.lineTo(22, 40);
        ctx.lineTo(5, 40);
        ctx.lineTo(-10, 35);
        ctx.fill();

        // --- Omnitrix (Shoulder/Bracer) ---
        ctx.fillStyle = '#333';
        ctx.fillRect(-12, -8, 16, 16); // Bracer
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-4, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00FF44';
        ctx.beginPath();
        ctx.moveTo(-4, -4); ctx.lineTo(0, 0); ctx.lineTo(-4, 0); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-4, 4); ctx.lineTo(-8, 0); ctx.lineTo(-4, 0); ctx.fill();

        // --- Punch animation ---
        if (this.punchActive) {
            const ext = Math.min(1, (now - this.punchTimer) / 150); // 0→1
            const punchX = 35 + ext * 25;
            ctx.fillStyle = '#FF8C00';
            ctx.beginPath();
            ctx.arc(punchX, 10, 14, 0, Math.PI*2);
            ctx.fill();
            // Claws extended
            ctx.fillStyle = '#222';
            ctx.fillRect(punchX + 5, 6, 14, 5);
            ctx.fillRect(punchX + 5, 11, 14, 5);
        }

        ctx.restore();

        // Update punch hit-rect
        if (this.punchActive) {
            const punchOffsetX = this.facingRight ? this.width + 5 : -55;
            this.punchRect = {
                x: this.x + punchOffsetX,
                y: this.y + 10,
                width: 50,
                height: 30
            };
        } else {
            this.punchRect = null;
        }
    }

    /** Returns active punch rect in world coords (for game.js collision), or null */
    getPunchRect() {
        return this.punchRect;
    }
}
