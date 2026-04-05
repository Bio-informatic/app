export class LaserTurret {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0;
        this.dead = false;
        this.type = 'laser_turret';
        this.firingCycle = 3000;    // ms per full cycle
        this.laserOnDuration = 1500; // ms laser is ON
        this.laserRange = 320;       // pixels the laser reaches
        this.facingLeft = true;      // direction the laser fires
    }

    update(deltaTime, level) {
        // Stationary — no movement needed
    }

    isLaserOn() {
        const phase = performance.now() % this.firingCycle;
        return phase < this.laserOnDuration;
    }

    getLaserRect() {
        if (!this.isLaserOn()) return null;
        if (this.facingLeft) {
            return {
                x: this.x - this.laserRange,
                y: this.y + 12,
                width: this.laserRange,
                height: 8
            };
        } else {
            return {
                x: this.x + this.width,
                y: this.y + 12,
                width: this.laserRange,
                height: 8
            };
        }
    }

    draw(ctx) {
        if (this.dead) return;

        const now = performance.now();
        const laserOn = this.isLaserOn();

        // Turret body — dark box with red accent
        ctx.fillStyle = '#1A1A2E';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#333355';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Red indicator light
        ctx.fillStyle = laserOn ? '#FF0000' : '#440000';
        ctx.beginPath();
        ctx.arc(this.x + 16, this.y + 8, 4, 0, Math.PI * 2);
        ctx.fill();
        if (laserOn) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(this.x + 16, this.y + 8, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        // Barrel
        const barrelY = this.y + 12;
        if (this.facingLeft) {
            ctx.fillStyle = '#333355';
            ctx.fillRect(this.x - 8, barrelY, 10, 8);
        } else {
            ctx.fillStyle = '#333355';
            ctx.fillRect(this.x + this.width - 2, barrelY, 10, 8);
        }

        // Laser beam
        if (laserOn) {
            const rect = this.getLaserRect();
            if (rect) {
                // Outer beam glow
                ctx.globalAlpha = 0.2;
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(rect.x, rect.y - 4, rect.width, rect.height + 8);

                // Core beam
                ctx.globalAlpha = 0.7 + Math.sin(now / 50) * 0.2;
                ctx.fillStyle = '#FF2200';
                ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

                // Inner bright core
                ctx.globalAlpha = 0.9;
                ctx.fillStyle = '#FF8866';
                ctx.fillRect(rect.x, rect.y + 2, rect.width, 4);

                ctx.globalAlpha = 1.0;
            }
        }
    }
}
