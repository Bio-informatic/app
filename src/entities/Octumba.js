import { MucusProjectile } from './MucusProjectile.js';

export class Octumba {
    constructor(x, y, entitiesArray) {
        this.x = x;
        this.y = y;
        this.width = 150;
        this.height = 150;
        this.type = 'octumba';
        this.dead = false;
        this.entities = entitiesArray;
        
        this.soundDamage = 0; // accumulated damage from sound waves
        this.maxSoundDamage = 10000; // 10 seconds of continuous sound
        this.hp = 10000;
        this.maxHp = 10000;
        
        this.timer = 0;
        this.shootCooldown = 2000;
        this.vx = 0;
        this.vy = 0;
    }

    update(deltaTime, level, playerX, playerY) {
        if (this.dead) return;
        this.timer += deltaTime;
        
        // Sound damage decays slowly if Ripjaws stops screaming
        if (this.soundDamage > 0) {
            this.soundDamage -= deltaTime * 0.5; // decays somewhat slowly
        }
        this.hp = this.maxSoundDamage - this.soundDamage;

        // Check if dead
        if (this.soundDamage >= this.maxSoundDamage) {
            this.dead = true;
            return;
        }

        const dist = Math.hypot(this.x + 75 - playerX, this.y + 75 - playerY);
        const playerInSea = level && level.waterStartX !== undefined && playerX >= level.waterStartX;
        if (playerInSea) {
            const targetX = playerX - this.width / 2;
            const targetY = playerY - this.height / 2;
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const chaseDistance = Math.max(1, Math.hypot(dx, dy));
            const speed = dist < 900 ? 0.105 : 0.055;
            this.vx += (dx / chaseDistance) * speed * deltaTime;
            this.vy += (dy / chaseDistance) * speed * deltaTime;
            const maxSpeed = 2.4;
            const velocityLength = Math.max(1, Math.hypot(this.vx, this.vy));
            if (velocityLength > maxSpeed) {
                this.vx = (this.vx / velocityLength) * maxSpeed;
                this.vy = (this.vy / velocityLength) * maxSpeed;
            }
            this.x += this.vx;
            this.y += this.vy;
            this.x = Math.max(level.waterStartX + 20, Math.min(level.width - this.width - 40, this.x));
            this.y = Math.max(30, Math.min(level.height - this.height - 45, this.y));
        } else {
            this.vx *= 0.92;
            this.vy *= 0.92;
        }

        this.shootCooldown -= deltaTime;
        // Shoot mucus only when player is nearby (within 800px)
        if (this.shootCooldown <= 0 && dist < 800) {
            this.shootCooldown = 1500 + Math.random() * 1000;
            if (this.entities) {
                // Shoot from mouth
                this.entities.push(new MucusProjectile(this.x + 75, this.y + 75, playerX, playerY));
            }
        }
    }

    takeDamage(amount) {
        this.soundDamage += (amount || 1) * 500; // projectiles help sound damage
        this.hp = this.maxSoundDamage - this.soundDamage;
        if (this.soundDamage >= this.maxSoundDamage) this.dead = true;
    }

    draw(ctx) {
        if (this.dead) return;

        const cx = this.x + 75;
        const cy = this.y + 75;
        const pulse = 0.6 + 0.4 * Math.sin(this.timer / 190);

        // Draw tentacles
        ctx.strokeStyle = '#601010'; // dark red
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.sin(this.timer/500)*0.2;
            const len = 100 + Math.sin(this.timer/300 + i)*20;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            
            // Tentacle bezier
            const cp1x = cx + Math.cos(angle) * len * 0.5;
            const cp1y = cy + Math.sin(angle) * len * 0.5 + Math.sin(this.timer/200)*20;
            const ex = cx + Math.cos(angle) * len;
            const ey = cy + Math.sin(angle) * len;
            
            ctx.quadraticCurveTo(cp1x, cp1y, ex, ey);
            ctx.stroke();
        }

        // Abyss aura
        const aura = ctx.createRadialGradient(cx, cy, 20, cx, cy, 130);
        aura.addColorStop(0, `rgba(120, 20, 20, ${0.2 + pulse * 0.15})`);
        aura.addColorStop(1, 'rgba(20, 0, 0, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(cx, cy, 130, 0, Math.PI * 2);
        ctx.fill();

        // Head/Mantle
        const mantle = ctx.createLinearGradient(cx, cy - 70, cx, cy + 30);
        mantle.addColorStop(0, '#A02020');
        mantle.addColorStop(1, '#5A1010');
        ctx.fillStyle = mantle;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20, 60, 50, 0, 0, Math.PI*2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFD700'; // ugly yellow eyes
        ctx.beginPath();
        ctx.ellipse(cx - 20, cy - 10, 8, 4, Math.PI/8, 0, Math.PI*2);
        ctx.ellipse(cx + 20, cy - 10, 8, 4, -Math.PI/8, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(cx - 22, cy - 11, 4, 2);
        ctx.fillRect(cx + 18, cy - 11, 4, 2);

        // Mouth (where mucus shoots from)
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx, cy + 15, 10 + Math.sin(this.timer/200)*5, 0, Math.PI*2);
        ctx.fill();

        // Sound Damage Bar
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x, this.y - 30, this.width, 10);
        ctx.fillStyle = '#00FFFF'; // Sound frequency color
        ctx.fillRect(this.x, this.y - 30, this.width * (this.soundDamage / this.maxSoundDamage), 10);
    }
}
