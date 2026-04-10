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

    /** Draw in thermal/infrared mode (Wild Mutt active) */
    drawThermal(ctx) {
        if (this.damageFlicker > 0 && Math.floor(performance.now() / 60) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        ctx.save();
        ctx.translate(cx, cy);

        // Heat glow aura
        const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 60);
        grad.addColorStop(0, 'rgba(255,80,0,0.45)');
        grad.addColorStop(0.5, 'rgba(255,30,0,0.2)');
        grad.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 60, 65, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body — hot orange/yellow core
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(-38, -30, 76, 60); // torso

        // Legs
        ctx.fillStyle = '#FF4400';
        ctx.fillRect(-35, 30, 25, 30);
        ctx.fillRect(10, 30, 25, 30);

        // Arms (massive)
        ctx.fillStyle = '#FF4400';
        ctx.fillRect(-55, -20, 20, 50); // left arm
        ctx.fillRect(35, -20, 20, 50);  // right arm
        // Knuckles
        ctx.fillStyle = '#FFAA00';
        ctx.fillRect(-55, 25, 20, 8);
        ctx.fillRect(35, 25, 20, 8);

        // Head
        ctx.fillStyle = '#FF8800';
        ctx.fillRect(-28, -65, 56, 42); // skull

        // Brow ridge
        ctx.fillStyle = '#FF3300';
        ctx.fillRect(-30, -65, 60, 12);

        // Eyes (brightest — hottest part)
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(-20, -58, 12, 10);
        ctx.fillRect(8, -58, 12, 10);
        // pupils
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-17, -55, 6, 6);
        ctx.fillRect(11, -55, 6, 6);

        // Angry mouth
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-18, -30, 36, 8);
        ctx.fillStyle = '#FFEE00';
        ctx.fillRect(-14, -30, 5, 6); // teeth
        ctx.fillRect(-4, -30, 5, 6);
        ctx.fillRect(6, -30, 5, 6);

        if (this.state === 'JUMPING') {
            // Extra glow when airborne
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.ellipse(0, 0, 50, 55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    /** Draw hidden/invisible in small Ben form */
    drawHidden(ctx) {
        // Draw a faint shimmer hint so the player knows SOMETHING is there
        const now = performance.now();
        const pulse = (Math.sin(now / 400) + 1) / 2;
        ctx.globalAlpha = 0.06 + pulse * 0.06;
        ctx.fillStyle = '#888888';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1.0;
    }

    draw(ctx, wildMuttActive) {
        if (this.dead) return;
        if (wildMuttActive) {
            this.drawThermal(ctx);
        } else {
            this.drawHidden(ctx);
        }
    }
}
