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
        this.state = 'SMALL'; // SMALL, FOURARMS
        this.transforming = false;
        this.transformTimer = 0;
        this.victory = false;
        this.hasWatch = false; // Level 1 state

        // Ground Pound
        this.groundPounding = false;
        this.groundPoundLanded = false; // set true on impact, game.js reads & clears it
        this.groundPoundCooldown = 0;   // timestamp when last used
    }

    transformToFourArms() {
        if (this.state === 'FOURARMS') return;
        this.state = 'FOURARMS';
        this.transforming = true;
        this.transformTimer = performance.now();
        // Pause physics for a moment? Or just visual?
        // Let's just do visual effect while playing.

        // Increase Size
        this.y -= 16; // Grow up
        this.width = 48; // Wider
        this.height = 64; // Taller
    }

    update(deltaTime, level) {
        if (this.transforming) {
            if (performance.now() - this.transformTimer > 1000) {
                this.transforming = false;
            }
        }

        // Apply Gravity
        this.vy += this.gravity;

        // Horizontal Movement
        if (this.input.isDown('ArrowRight')) {
            this.vx = this.speed;
        } else if (this.input.isDown('ArrowLeft')) {
            this.vx = -this.speed;
        } else {
            this.vx = 0;
        }

        // Move X
        this.x += this.vx;
        this.handleHorizontalCollisions(level);

        // Jump
        if ((this.input.isDown('Space') || this.input.isDown('ArrowUp')) && this.grounded) {
            this.vy = this.state === 'FOURARMS' ? -14 : -12;
            this.grounded = false;
        }

        // Ground Pound is triggered by game.js keydown listener (sets this.groundPounding = true)
        // If ground pounding, lock horizontal movement and slam down fast
        if (this.groundPounding) {
            this.vx = 0;
            this.vy = 20; // FAST slam down
        }

        // Move Y
        this.y += this.vy;
        this.handleVerticalCollisions(level);

        // Screen Boundaries
        if (this.x < 0) this.x = 0;
        // Note: actual fall-off detection is handled in game.js
        // Just clamp to avoid huge numbers if not caught yet
        if (this.y > 2000) this.y = 0;
    }

    handleHorizontalCollisions(level) {
        const gridTop = Math.floor(this.y / level.tileSize);
        const gridBottom = Math.floor((this.y + this.height - 0.1) / level.tileSize);

        if (this.vx > 0) {
            const gridRight = Math.floor((this.x + this.width) / level.tileSize);
            if (level.tiles[gridTop] && level.tiles[gridTop][gridRight] !== 0 ||
                level.tiles[gridBottom] && level.tiles[gridBottom][gridRight] !== 0) {
                this.x = gridRight * level.tileSize - this.width;
                this.vx = 0;
            }
        } else if (this.vx < 0) {
            const gridLeft = Math.floor(this.x / level.tileSize);
            if (level.tiles[gridTop] && level.tiles[gridTop][gridLeft] !== 0 ||
                level.tiles[gridBottom] && level.tiles[gridBottom][gridLeft] !== 0) {
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
            if (level.tiles[gridBottom] && (level.tiles[gridBottom][gridLeft] !== 0 || level.tiles[gridBottom][gridRight] !== 0)) {
                this.y = gridBottom * level.tileSize - this.height;
                this.vy = 0;
                this.grounded = true;

                // Ground pound impact!
                if (this.groundPounding) {
                    this.groundPounding = false;
                    this.groundPoundLanded = true; // game.js reads & clears this
                    this.groundPoundCooldown = performance.now();
                }
            } else {
                this.grounded = false;
            }
        } else if (this.vy < 0) {
            const gridTop = Math.floor(this.y / level.tileSize);
            let hitTile = 0;
            if (level.tiles[gridTop]) {
                if (level.tiles[gridTop][gridLeft] !== 0) hitTile = level.tiles[gridTop][gridLeft];
                else if (level.tiles[gridTop][gridRight] !== 0) hitTile = level.tiles[gridTop][gridRight];
            }

            if (hitTile !== 0) {
                this.y = (gridTop + 1) * level.tileSize;
                this.vy = 0;

                // Check for mystery block
                if (hitTile === 3 && this.onBlockHit) {
                    // Determine which column was actually hit
                    const hitX = (level.tiles[gridTop][gridLeft] === 3) ? gridLeft : gridRight;
                    this.onBlockHit(3, hitX * level.tileSize, gridTop * level.tileSize);
                }
            }
            this.grounded = false;
        }
    }

    draw(ctx) {
        if (this.transforming) {
            // Pixel Rearrangement Effect
            // Draw random red/white/black pixels forming the shape as a placeholder
            for (let i = 0; i < 20; i++) {
                const rx = this.x + Math.random() * this.width;
                const ry = this.y + Math.random() * this.height;
                const colors = ['#C80000', '#FFF', '#000', '#00FF00'];
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                ctx.fillRect(rx, ry, 4, 4);
            }
            // Draw outline mainly
            ctx.strokeStyle = '#C80000';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            return;
        }

        if (this.state === 'FOURARMS') {
            this.drawFourArms(ctx);
        } else {
            this.drawMario(ctx);
        }
    }

    drawMario(ctx) {
        // Colors
        let shirtColor = '#ff0000'; // Red
        let overallsColor = '#0000ff'; // Blue
        let hatColor = '#ff0000'; // Red

        if (this.hasWatch) {
            // Ben 10 Theme: Black/Green/White
            shirtColor = '#FFFFFF'; // White Shirt? Or Black? 
            // "Take the watch's color theme" -> Black/Green
            shirtColor = '#000000';
            overallsColor = '#004400'; // Dark Green
            hatColor = '#39FF14'; // Neon Green
        }

        // Body/Shirt
        ctx.fillStyle = shirtColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Overalls
        ctx.fillStyle = overallsColor;
        ctx.fillRect(this.x + 4, this.y + 20, 24, 12);
        ctx.fillRect(this.x + 4, this.y + 14, 8, 10);
        ctx.fillRect(this.x + 20, this.y + 14, 8, 10);

        // Face
        ctx.fillStyle = '#ffcc99'; // Skin tone
        ctx.fillRect(this.x + 6, this.y + 4, 20, 14);

        // Hat
        ctx.fillStyle = hatColor;
        ctx.fillRect(this.x, this.y, 32, 6);
        ctx.fillRect(this.x + 8, this.y - 2, 16, 4); // Brim

        // Eyes
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 20, this.y + 8, 4, 4);

        // Moustache
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 18, this.y + 14, 10, 4);

        // Jumping pose?
        if (!this.grounded) {
            // Just a simple visual change
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(this.x + 4, this.y + 24, 24, 8); // Legs up
        }
    }

    drawFourArms(ctx) {
        // Align drawing to BOTTOM-CENTER of the entity hitbox to fix "inside box" visual issue.
        // Entity: x, y is Top-Left. Width 48, Height 64.
        const centerX = this.x + 24;
        const bottomY = this.y + 64;

        ctx.save();
        ctx.translate(centerX, bottomY);
        ctx.scale(2, 2); // Scale 2x

        // Drawing relative to feet at (0,0). Y goes UP as negative.

        // Legs/Pants (Black)
        // Rect -5, -8 to 5, 0 (8px tall)
        ctx.fillStyle = '#000000';
        ctx.fillRect(-5, -8, 10, 8);

        // Body (Red)
        // From -8 (waist) up.
        // Body -10 to -24? (14 tall)
        ctx.fillStyle = '#C80000';
        ctx.fillRect(-6, -22, 12, 14);

        // White Shirt (V shape)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(-6, -22);
        ctx.lineTo(6, -22);
        ctx.lineTo(0, -12); // V point
        ctx.fill();

        // Black Stripe
        ctx.fillStyle = '#000000';
        ctx.fillRect(-2, -22, 4, 14);

        // Omnitrix
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, -18, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#39FF14';
        ctx.beginPath();
        ctx.moveTo(-2, -18);
        ctx.lineTo(2, -20);
        ctx.lineTo(2, -16);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-2, -18);
        ctx.lineTo(2, -16);
        ctx.lineTo(2, -20);
        ctx.fill();

        // Head (Red)
        // Above body (-22)
        ctx.fillStyle = '#C80000';
        ctx.fillRect(-3, -27, 6, 5);
        // Eyes
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(-2, -26, 1, 1);
        ctx.fillRect(1, -26, 1, 1);
        ctx.fillRect(-2, -24, 1, 1);
        ctx.fillRect(1, -24, 1, 1);

        // Arms
        let raiseHands = this.input.isDown('R');
        let armYOffset = 0;

        if (this.victory) {
            raiseHands = true;
            // Animate up and down (Sine wave)
            armYOffset = Math.sin(performance.now() / 150) * 3;
        }

        ctx.fillStyle = '#C80000';

        if (raiseHands) {
            // Raised Arms
            // Apply offset
            const yBaseUpper = -28 + armYOffset;
            const yBaseLower = -16 + armYOffset;
            const yBaseGloves1 = -31 + armYOffset;
            const yBaseGloves2 = -19 + armYOffset;

            // Upper Arms (Upwards)
            ctx.fillRect(-12, yBaseUpper, 4, 10); // Left Upper
            ctx.fillRect(8, yBaseUpper, 4, 10);  // Right Upper
            // Lower Arms (Upwards)
            ctx.fillRect(-12, yBaseLower, 4, 10); // Left Lower
            ctx.fillRect(8, yBaseLower, 4, 10);  // Right Lower

            // Gloves (Up)
            ctx.fillStyle = '#000';
            ctx.fillRect(-13, yBaseGloves1, 6, 3);
            ctx.fillRect(7, yBaseGloves1, 6, 3);
            ctx.fillRect(-13, yBaseGloves2, 6, 3);
            ctx.fillRect(7, yBaseGloves2, 6, 3);

        } else {
            // Normal Arms
            // Upper
            ctx.fillRect(-10, -22, 4, 10);
            ctx.fillRect(6, -22, 4, 10);
            // Lower
            ctx.fillRect(-10, -10, 4, 10);
            ctx.fillRect(6, -10, 4, 10);
            // Gloves
            ctx.fillStyle = '#000';
            ctx.fillRect(-11, -12, 6, 3); // Hands
            ctx.fillRect(5, -12, 6, 3);
            ctx.fillRect(-11, 0, 6, 3);
            ctx.fillRect(5, 0, 6, 3);
        }

        ctx.restore();

    }
}
