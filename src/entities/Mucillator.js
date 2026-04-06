export class Mucillator {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 120;
        this.height = 120;
        this.type = 'mucillator';
        this.dead = false;

        this.hp = 4;
        this.maxHp = 4;

        this.state = 'SWEEPING'; // SWEEPING, INHALING, STUNNED
        this.stateTimer = 0;
        
        this.mouthOpen = false;
        this.projectiles = []; // trash waves
        
        this.damageFlicker = 0;
    }

    update(deltaTime, level, userX) {
        if (this.dead) return;
        if (userX === undefined) return;
        
        this.damageFlicker = Math.max(0, this.damageFlicker - deltaTime);

        if (this.state === 'SWEEPING') {
            this.stateTimer += deltaTime;
            if (this.stateTimer > 4000) {
                // switch to inhale
                this.state = 'INHALING';
                this.stateTimer = 0;
                this.mouthOpen = true;
            } else if (this.stateTimer % 1000 < deltaTime) {
                // Shoot trash wave
                this.projectiles.push({
                    x: this.x,
                    y: this.y + 40 + Math.random() * 40,
                    vx: -4,
                    vy: 0,
                    width: 24,
                    height: 24,
                    dead: false
                });
            }
        } else if (this.state === 'INHALING') {
            this.stateTimer += deltaTime;
            // 3 seconds window to shoot slime into mouth
            if (this.stateTimer > 3000) {
                this.state = 'SWEEPING';
                this.stateTimer = 0;
                this.mouthOpen = false;
            }
        } else if (this.state === 'STUNNED') {
            this.stateTimer += deltaTime;
            if (this.stateTimer > 2000) {
                this.state = 'SWEEPING';
                this.stateTimer = 0;
                this.mouthOpen = false;
            }
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            p.x += p.vx;
            p.vy += 0.1; // slight gravity
            p.y += p.vy;
            
            // bounce gently around bottom of arena
            if (p.y > level.height - 100) {
                p.vy = -3;
            }
            
            if (p.x < 0 || p.x > level.width) {
                p.dead = true;
            }
            if (p.dead) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    takeDamage() {
        if (this.state !== 'INHALING') return; // only vulnerable when inhaling
        this.hp -= 1;
        this.damageFlicker = 300;
        this.state = 'STUNNED';
        this.stateTimer = 0;
        this.mouthOpen = false;
        if (this.hp <= 0) {
            this.dead = true;
        }
    }

    draw(ctx) {
        if (this.damageFlicker > 0 && Math.floor(performance.now() / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const cx = this.x + this.width/2;
        const cy = this.y + this.height;

        ctx.save();
        ctx.translate(cx, cy);

        // Body - blob
        ctx.fillStyle = '#33AA33';
        ctx.beginPath();
        const wobble = Math.sin(performance.now()/200)*10;
        ctx.ellipse(0, -60 + wobble/2, 60 + wobble, 60 - wobble, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#115511';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#FFEE00';
        ctx.beginPath(); ctx.arc(-20, -80, 8, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(20, -80, 8, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(-20, -80, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(20, -80, 2, 0, Math.PI*2); ctx.fill();

        // Mouth / Core
        if (this.mouthOpen) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(0, -30, 25, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Inhale vortex lines
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                const r = 30 + (performance.now()/10 + i * 20) % 30;
                ctx.arc(0, -30, r, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-20, -30);
            ctx.lineTo(20, -30);
            ctx.stroke();
        }

        ctx.restore();
        ctx.globalAlpha = 1.0;
        
        // Trash projectiles
        for (const p of this.projectiles) {
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.ellipse(p.x + p.width/2, p.y + p.height/2, p.width/2, p.height/2, performance.now()/100, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#778899';
            ctx.fillRect(p.x + 4, p.y + 4, 8, 8); // trash bits
            ctx.strokeStyle = '#000';
            ctx.strokeRect(p.x + 4, p.y + 4, 8, 8);
        }
    }
}
