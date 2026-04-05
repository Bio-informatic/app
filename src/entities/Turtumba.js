export class Turtumba {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 48;
        this.vx = -1;
        this.vy = 0;
        this.gravity = 0.5;
        this.dead = false;
        this.type = 'turtumba';
        this.shieldActive = true;  // Like shield drone — only XLR8 dash kills
        this.hp = 3;               // Takes 3 dashes to kill
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

        // Horizontal collisions — bounce
        const gridY = Math.floor((this.y + 24) / level.tileSize);
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

        ctx.save();
        ctx.translate(cx, cy);

        // === TURTLE SHELL (main body) ===
        // Outer shell — dark green dome
        ctx.fillStyle = isFlashing ? '#FFFFFF' : '#1A5C1A';
        ctx.beginPath();
        ctx.ellipse(0, 2, 22, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        // Shell pattern — hexagonal segments
        ctx.strokeStyle = '#0A3A0A';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 2, 22, 18, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Shell segments
        ctx.beginPath();
        ctx.moveTo(-16, 2); ctx.lineTo(16, 2);
        ctx.moveTo(-12, -8); ctx.lineTo(12, -8);
        ctx.moveTo(-14, 12); ctx.lineTo(14, 12);
        ctx.moveTo(-8, -8); ctx.lineTo(-14, 12);
        ctx.moveTo(8, -8); ctx.lineTo(14, 12);
        ctx.moveTo(0, -16); ctx.lineTo(-8, -8);
        ctx.moveTo(0, -16); ctx.lineTo(8, -8);
        ctx.stroke();

        // Inner shell detail — lighter green
        ctx.fillStyle = '#2A8A2A';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // === SLOW AURA — pulsing green rings ===
        const pulse = Math.sin(now / 300) * 0.3 + 0.5;
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        for (let r = 0; r < 3; r++) {
            const radius = 28 + r * 8 + Math.sin(now / 500 + r) * 4;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

        // === HEAD — poking out from shell ===
        ctx.fillStyle = isFlashing ? '#FFFFFF' : '#3AAA3A';
        // Neck
        ctx.fillRect(18, -4, 8, 8);
        // Head
        ctx.beginPath();
        ctx.ellipse(28, 0, 6, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eye
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(30, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(30, -2, 1, 0, Math.PI * 2);
        ctx.fill();

        // === LEGS — stubby and slow ===
        ctx.fillStyle = isFlashing ? '#FFFFFF' : '#3AAA3A';
        // Front legs
        ctx.fillRect(10, 16, 5, 6);
        ctx.fillRect(-6, 16, 5, 6);
        // Back legs
        ctx.fillRect(-16, 14, 5, 6);

        // === CLOCK SYMBOL on shell — represents time slowing ===
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        // Clock hands
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        const handAngle = (now / 1000) % (Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(handAngle) * 3, Math.sin(handAngle) * 3);
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(handAngle * 0.3) * 2, Math.sin(handAngle * 0.3) * 2);
        ctx.stroke();

        // === HP BAR above ===
        const barW = 30;
        const barH = 4;
        const barX = -barW / 2;
        const barY = -24;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);
        const hpRatio = this.hp / this.maxHp;
        ctx.fillStyle = `rgb(${Math.floor(255 * (1 - hpRatio))}, ${Math.floor(255 * hpRatio)}, 0)`;
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(barX, barY, barW, barH);

        ctx.restore();
    }
}
