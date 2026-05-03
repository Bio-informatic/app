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
        this.state = 'SMALL'; // SMALL, FOURARMS, HEATBLAST, DIAMONDHEAD
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

        // Ripjaws sound wave
        this.soundWaveActive = false;
    }

    transformToRipjaws() {
        if (this.state === 'RIPJAWS') return;
        this.state = 'RIPJAWS';
        this.transforming = true;
        this.transformTimer = performance.now();
        this.alienTimer = performance.now();
        if (this.height < 55) this.y -= (55 - this.height);
        this.width = 40;
        this.height = 55;
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

    transformToDiamondhead() {
        if (this.state === 'DIAMONDHEAD') return;
        this.state = 'DIAMONDHEAD';
        this.transforming = true;
        this.transformTimer = performance.now();
        this.alienTimer = performance.now();
        if (this.height < 60) this.y -= (60 - this.height);
        this.width = 44;
        this.height = 60;
    }

    update(deltaTime, level) {
        if (this.transforming) {
            if (performance.now() - this.transformTimer > 1000) {
                this.transforming = false;
            }
        }

        // Alien countdown timer — revert to SMALL after 15 seconds
        if (this.alienTimer > 0 && (this.state === 'FOURARMS' || this.state === 'HEATBLAST' || this.state === 'XLR8' || this.state === 'STINKFLY' || this.state === 'UPGRADE' || this.state === 'WILDMUTT' || this.state === 'DIAMONDHEAD' || this.state === 'RIPJAWS')) {
            const elapsed = performance.now() - this.alienTimer;
            this.alienTimerRemaining = Math.max(0, Math.ceil((this.alienTimerDuration - elapsed) / 1000));
            if (elapsed >= this.alienTimerDuration) {
                this.revertToSmall();
            }
        }

        let inWater = level.waterStartX !== undefined && this.x > level.waterStartX;
        let activeGravity = inWater ? 0.2 : this.gravity;

        // Apply Gravity (Stinkfly flies naturally)
        if (this.state === 'STINKFLY') {
            this.vy = 0; // zero gravity base
        } else {
            this.vy += activeGravity;
            if (inWater && this.state === 'RIPJAWS' && this.input.isDown('ArrowUp')) {
                this.vy -= 0.6; // Swim up faster
            }
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

        // --- Ripjaws logic ---
        if (this.state === 'RIPJAWS') {
            if (this.input.isDown('f')) {
                this.soundWaveActive = true;
            } else {
                this.soundWaveActive = false;
            }
        } else {
            this.soundWaveActive = false;
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
        } else if (this.state === 'DIAMONDHEAD') {
            this.drawDiamondhead(ctx);
        } else if (this.state === 'RIPJAWS') {
            this.drawRipjaws(ctx);
        } else {
            this.drawMario(ctx);
        }
    }

    drawDiamondhead(ctx) {
        const centerX = this.x + 22;
        const bottomY = this.y + 60;

        ctx.save();
        ctx.translate(centerX, bottomY);
        ctx.scale(2, 2);

        // Body
        ctx.fillStyle = '#00AAAA'; // Dark cyan/teal body
        ctx.fillRect(-6, -20, 12, 12);
        
        // Crystalline shards on back/shoulders
        ctx.fillStyle = '#A0E6FF';
        ctx.beginPath();
        ctx.moveTo(-6, -20); ctx.lineTo(-10, -28); ctx.lineTo(-2, -20);
        ctx.moveTo(6, -20); ctx.lineTo(10, -28); ctx.lineTo(2, -20);
        ctx.fill();

        // Chest/Omnitrix
        ctx.fillStyle = '#000000';
        ctx.fillRect(-4, -18, 8, 8);
        ctx.fillStyle = '#39FF14';
        ctx.beginPath(); ctx.arc(0, -14, 2, 0, Math.PI * 2); ctx.fill();

        // Head
        ctx.fillStyle = '#00FFFF'; // Bright cyan crystal head
        ctx.beginPath();
        ctx.moveTo(-4, -20);
        ctx.lineTo(-2, -26);
        ctx.lineTo(2, -26);
        ctx.lineTo(4, -20);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(-2, -24, 1, 1);
        ctx.fillRect(1, -24, 1, 1);

        // Legs
        ctx.fillStyle = '#008888';
        ctx.fillRect(-5, -8, 4, 8);
        ctx.fillRect(1, -8, 4, 8);

        // Arms (thick crystal arms)
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(-12, -20, 6, 12);
        ctx.fillRect(6, -20, 6, 12);

        // Draw Dragonglass if equipped
        if (this.hasDragonglass) {
            ctx.fillStyle = '#1A1A1A'; // Obsidian / black
            ctx.beginPath();
            if (this.facingRight) {
                // Right hand
                ctx.moveTo(9, -8); // Hand pos
                ctx.lineTo(25, -20); // Tip
                ctx.lineTo(12, -4);
            } else {
                // Left hand
                ctx.moveTo(-9, -8);
                ctx.lineTo(-25, -20);
                ctx.lineTo(-12, -4);
            }
            ctx.fill();
        }

        ctx.restore();
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
        // We draw in a local coordinate system then translate to world.
        // LOCAL SPACE: beast is drawn around origin (0,0) = bottom-centre of body hump.
        // Scale is 2px per "unit" so the beast is large and visible.
        // Total footprint: ~110px wide, ~80px tall — bigger than the 52x48 hitbox (that's fine).

        const now = performance.now();
        const dir = this.facingRight ? 1 : -1;

        // World anchor: feet touch the ground at (this.x + this.width/2, this.y + this.height)
        const wx = this.x + this.width / 2;
        const wy = this.y + this.height;

        // Running/bounce animation
        let bounce = 0;
        let runPhase = 0;
        if (!this.grounded) {
            bounce = -8;
        } else if (Math.abs(this.vx) > 0.5) {
            runPhase = now / 85;
            bounce = Math.sin(runPhase) * 4;
        }

        const BASE  = '#E8820C'; // bright orange
        const DARK  = '#9C4F00'; // deep shadow orange
        const MID   = '#C46000'; // mid-shadow
        const CLAW  = '#3A3820'; // charcoal claws
        const BLACK = '#080808';

        ctx.save();
        ctx.translate(wx, wy);
        ctx.scale(dir, 1); // flip for facing direction — all local coords assume facing right

        const b = bounce; // shorthand

        // ══════════════════════════════════════════════════════
        // DRAW ORDER (back to front):
        // tail → back legs → body → fur lines → front legs → neck/head → face → omnitrix
        // ══════════════════════════════════════════════════════

        // ── 1. TAIL (thin, curled upward at rear) ─────────────
        ctx.fillStyle = DARK;
        ctx.beginPath();
        ctx.moveTo(-44, -8 + b);
        ctx.bezierCurveTo(-60, -14 + b, -65, -36 + b, -52, -46 + b);
        ctx.bezierCurveTo(-46, -52 + b, -38, -44 + b, -42, -36 + b);
        ctx.bezierCurveTo(-44, -28 + b, -50, -22 + b, -44, -14 + b);
        ctx.fill();

        // ── 2. BACK LEFT LEG (fully visible, bent like a spring) ─────
        // Thigh — angled back and down
        ctx.fillStyle = DARK;
        ctx.beginPath();
        ctx.moveTo(-34, -16 + b);
        ctx.quadraticCurveTo(-50, -8 + b, -46, 0);
        ctx.lineTo(-34, 0);
        ctx.quadraticCurveTo(-24, -6 + b, -28, -18 + b);
        ctx.fill();
        // paw
        ctx.fillStyle = MID;
        ctx.beginPath();
        ctx.ellipse(-40, 0, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // 4 claws
        ctx.fillStyle = CLAW;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(-49 + i * 6, 0);
            ctx.lineTo(-51 + i * 6, 9);
            ctx.lineTo(-45 + i * 6, 9);
            ctx.fill();
        }

        // ── 3. BACK RIGHT LEG (slightly behind, lighter) ─────
        ctx.fillStyle = MID;
        ctx.beginPath();
        ctx.moveTo(-22, -14 + b);
        ctx.quadraticCurveTo(-36, -4 + b, -32, 0);
        ctx.lineTo(-22, 0);
        ctx.quadraticCurveTo(-14, -4 + b, -18, -16 + b);
        ctx.fill();
        ctx.fillStyle = MID;
        ctx.beginPath();
        ctx.ellipse(-27, 0, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = CLAW;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-33 + i * 6, 0);
            ctx.lineTo(-35 + i * 6, 7);
            ctx.lineTo(-29 + i * 6, 7);
            ctx.fill();
        }

        // ── 4. MAIN BODY ──────────────────────────────────────
        // Key to NOT looking like a turtle: body is LONG horizontally (-44 to +20)
        // and the dorsal ridge is TALL and centered, not a symmetric dome.
        ctx.fillStyle = BASE;
        ctx.beginPath();
        // Start at rear hip
        ctx.moveTo(-44, -10 + b);
        // Spine ridge climbs steeply to peaked apex over shoulder blades
        ctx.bezierCurveTo(
            -44, -58 + b,   // rear spine going very high
             -4, -70 + b,   // apex of the arch (tilted forward)
             18, -44 + b    // front shoulder, lower
        );
        // Front shoulder slope down to belly
        ctx.bezierCurveTo(28, -24 + b,  22, 0 + b,  10, 2 + b);
        // Belly back to rear
        ctx.bezierCurveTo(-8, 6 + b,  -36, 4 + b,  -44, -10 + b);
        ctx.fill();

        // Belly shading (slightly darker to give depth)
        ctx.fillStyle = MID;
        ctx.beginPath();
        ctx.moveTo(-40, -6 + b);
        ctx.bezierCurveTo(-38, 4 + b, -8, 8 + b, 10, 2 + b);
        ctx.bezierCurveTo(22, -4 + b, 20, -14 + b, 14, -18 + b);
        ctx.bezierCurveTo(0, -8 + b, -20, -4 + b, -40, -6 + b);
        ctx.fill();

        // ── 5. FUR / MUSCLE SCRATCH LINES ────────────────────
        ctx.strokeStyle = DARK;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Shoulder blade slashes (right side of body, near front)
        ctx.moveTo(10, -50 + b);  ctx.lineTo(18, -38 + b);
        ctx.moveTo( 6, -54 + b);  ctx.lineTo(14, -42 + b);
        ctx.moveTo( 2, -58 + b);  ctx.lineTo(10, -46 + b);
        // Mid-back slashes
        ctx.moveTo(-14, -62 + b); ctx.lineTo(-6, -50 + b);
        ctx.moveTo(-18, -58 + b); ctx.lineTo(-10, -48 + b);
        // Lower rib/belly
        ctx.moveTo(-32, -14 + b); ctx.lineTo(-24, -6 + b);
        ctx.moveTo(-28, -10 + b); ctx.lineTo(-20, -4 + b);
        ctx.stroke();

        // ── 6. FRONT RIGHT ARM (behind — slightly darker) ────
        // Long, lean reaching arm planted on ground far forward
        ctx.fillStyle = MID;
        ctx.beginPath();
        ctx.moveTo(14, -30 + b);
        ctx.quadraticCurveTo(24, -16 + b, 42, -12);
        ctx.lineTo(50, -4);
        ctx.lineTo(36, -4);
        ctx.quadraticCurveTo(18, -8 + b, 8, -22 + b);
        ctx.fill();
        // paw
        ctx.fillStyle = MID;
        ctx.beginPath();
        ctx.ellipse(44, -4, 9, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // 4 claws
        ctx.fillStyle = CLAW;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(37 + i * 6, -4);
            ctx.lineTo(36 + i * 6, 6);
            ctx.lineTo(41 + i * 6, 6);
            ctx.fill();
        }

        // ── 7. NECK ───────────────────────────────────────────
        // Neck thrusts forward and downward from front of body
        ctx.fillStyle = BASE;
        ctx.beginPath();
        ctx.moveTo(16, -44 + b);
        ctx.quadraticCurveTo(30, -40 + b, 38, -30 + b);
        ctx.quadraticCurveTo(44, -20 + b, 40, -10 + b);
        ctx.quadraticCurveTo(28, -6 + b, 18, -12 + b);
        ctx.quadraticCurveTo(10, -22 + b, 16, -44 + b);
        ctx.fill();

        // Neck gill slits (diagonal slashes)
        ctx.strokeStyle = DARK;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(20, -38 + b); ctx.lineTo(28, -26 + b);
        ctx.moveTo(24, -34 + b); ctx.lineTo(32, -22 + b);
        ctx.moveTo(28, -30 + b); ctx.lineTo(36, -20 + b);
        ctx.stroke();

        // ── 8. HEAD / SNOUT (long, thrust forward and slightly down) ─
        // Upper snout
        ctx.fillStyle = BASE;
        ctx.beginPath();
        ctx.moveTo(26, -34 + b);  // base of forehead
        ctx.bezierCurveTo(36, -36 + b, 56, -32 + b, 64, -24 + b); // top lip line
        ctx.lineTo(64, -18 + b);   // front of face
        ctx.bezierCurveTo(56, -16 + b, 36, -16 + b, 26, -20 + b); // under snout
        ctx.closePath();
        ctx.fill();

        // Lower jaw (slightly darker)
        ctx.fillStyle = MID;
        ctx.beginPath();
        ctx.moveTo(26, -20 + b);
        ctx.bezierCurveTo(36, -20 + b, 56, -20 + b, 64, -18 + b);
        ctx.bezierCurveTo(62, -10 + b, 44, -8 + b, 28, -10 + b);
        ctx.closePath();
        ctx.fill();

        // ── 9. MOUTH SLIT (the single most important feature) ─
        ctx.fillStyle = BLACK;
        ctx.beginPath();
        ctx.moveTo(28, -22 + b);
        ctx.bezierCurveTo(44, -19 + b, 58, -19 + b, 64, -22 + b);
        ctx.bezierCurveTo(58, -16 + b, 44, -16 + b, 28, -18 + b);
        ctx.fill();

        // White teeth on UPPER jaw edge
        ctx.fillStyle = '#DDDDB8';
        const ty = -22 + b; // top of mouth
        // 4 triangular teeth pointing downward
        const teeth = [32, 40, 48, 56];
        teeth.forEach(tx => {
            ctx.beginPath();
            ctx.moveTo(tx - 3, ty);
            ctx.lineTo(tx, ty + 8);
            ctx.lineTo(tx + 3, ty);
            ctx.fill();
        });

        // ── 10. FRONT-LEFT ARM (closest, brightest — dominant arm) ──
        ctx.fillStyle = BASE;
        ctx.beginPath();
        ctx.moveTo(16, -34 + b);
        ctx.quadraticCurveTo(30, -22 + b, 52, -14);
        ctx.lineTo(62, -6);
        ctx.lineTo(46, -6);
        ctx.quadraticCurveTo(26, -10 + b, 12, -24 + b);
        ctx.fill();
        // paw
        ctx.fillStyle = BASE;
        ctx.beginPath();
        ctx.ellipse(54, -5, 11, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // 4 long claws
        ctx.fillStyle = CLAW;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(45 + i * 7, -5);
            ctx.lineTo(44 + i * 7, 7);
            ctx.lineTo(50 + i * 7, 7);
            ctx.fill();
        }

        // ── 11. OMNITRIX (green hourglass on collar/neck-base) ───────
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(20, -28 + b, 7, 9, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(20, -29 + b, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#39FF14';
        ctx.beginPath();
        ctx.moveTo(17, -33 + b); ctx.lineTo(23, -28 + b); ctx.lineTo(17, -28 + b); ctx.lineTo(23, -33 + b);
        ctx.fill();

        // ── 12. PUNCH SWIPE EFFECT ────────────────────────────────────
        if (this.punchActive) {
            const ext = Math.min(1, (now - this.punchTimer) / 150);
            const sweep = ext * 28;
            ctx.fillStyle = 'rgba(232, 130, 12, 0.45)';
            ctx.beginPath();
            ctx.ellipse(70 + sweep, -5, 22 + sweep, 13, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // ── Punch hit-rect ─────────────────────────────────────────────
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

    drawRipjaws(ctx) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height; // anchor bottom
        const flip = this.facingRight ? 1 : -1;
        const now = performance.now();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(flip, 1);
        ctx.translate(0, -this.height);

        const skinColor = '#8FBC8F'; // Pale grey-green
        const suitColor = '#111';
        const finColor = '#6B8E23';

        // Dorsal Fin
        ctx.fillStyle = finColor;
        ctx.beginPath();
        ctx.moveTo(-10, 10);
        ctx.lineTo(-20, 30);
        ctx.lineTo(-5, 40);
        ctx.fill();

        // Legs
        ctx.fillStyle = skinColor;
        ctx.fillRect(-10, 40, 6, 15);
        ctx.fillRect(4, 40, 6, 15);
        // Feet claws
        ctx.fillStyle = '#222';
        ctx.beginPath(); ctx.moveTo(-10, 55); ctx.lineTo(-15, 60); ctx.lineTo(-4, 55); ctx.fill();
        ctx.beginPath(); ctx.moveTo(4, 55); ctx.lineTo(-1, 60); ctx.lineTo(10, 55); ctx.fill();

        // Body (Black suit)
        ctx.fillStyle = suitColor;
        ctx.beginPath();
        ctx.moveTo(-12, 15);
        ctx.lineTo(12, 15);
        ctx.lineTo(8, 45);
        ctx.lineTo(-8, 45);
        ctx.fill();

        // Omnitrix Belt
        ctx.fillStyle = '#FFF';
        ctx.fillRect(-8, 30, 16, 4);
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(0, 32, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#39FF14';
        ctx.beginPath(); ctx.moveTo(-3,30); ctx.lineTo(3,34); ctx.lineTo(-3,34); ctx.lineTo(3,30); ctx.fill();

        // Arms
        ctx.fillStyle = skinColor;
        ctx.fillRect(8, 15, 6, 15); // right arm
        ctx.fillRect(-14, 15, 6, 15); // left arm
        // Gloves/Claws
        ctx.fillStyle = suitColor;
        ctx.fillRect(8, 30, 6, 10);
        ctx.fillRect(-14, 30, 6, 10);
        ctx.fillStyle = skinColor;
        ctx.beginPath(); ctx.moveTo(11, 40); ctx.lineTo(14, 48); ctx.lineTo(8, 40); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-11, 40); ctx.lineTo(-8, 48); ctx.lineTo(-14, 40); ctx.fill();

        // Head
        ctx.fillStyle = skinColor;
        // Massive jaw shape protruding forward
        ctx.beginPath();
        ctx.moveTo(-10, 15);
        ctx.lineTo(-5, -5);
        ctx.lineTo(15, -2);
        ctx.lineTo(25, 5); // snout tip
        ctx.lineTo(20, 15);
        ctx.lineTo(5, 18);
        ctx.fill();

        // Angler light
        ctx.strokeStyle = finColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-2, -5);
        ctx.quadraticCurveTo(5, -15, 18, -10);
        ctx.stroke();
        // Light bulb
        ctx.fillStyle = '#FFFFCC';
        ctx.shadowColor = '#FFFFCC';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(18, -10, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eye
        ctx.fillStyle = '#39FF14'; // Green glowing eye
        ctx.beginPath();
        ctx.arc(8, 4, 2.5, 0, Math.PI*2);
        ctx.fill();

        // Mouth & Teeth
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(8, 12);
        ctx.lineTo(24, 8);
        ctx.lineTo(15, 15);
        ctx.fill();

        ctx.fillStyle = '#FFF'; // Sharp teeth
        ctx.beginPath(); ctx.moveTo(10, 12); ctx.lineTo(12, 16); ctx.lineTo(14, 12); ctx.fill();
        ctx.beginPath(); ctx.moveTo(16, 10); ctx.lineTo(18, 14); ctx.lineTo(20, 10); ctx.fill();
        ctx.beginPath(); ctx.moveTo(20, 8);  ctx.lineTo(22, 12); ctx.lineTo(24, 8);  ctx.fill();

        // Sound Waves Animation
        if (this.soundWaveActive) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            const t = (now % 500) / 500;
            for (let i = 0; i < 3; i++) {
                const r = (t + i/3) * 50;
                ctx.beginPath();
                ctx.arc(24, 10, r, -Math.PI/4, Math.PI/4);
                ctx.stroke();
            }
        }

        ctx.restore();
    }
}


