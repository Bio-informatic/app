import { MucusProjectile } from './MucusProjectile.js';

export class GreatOctopus {
    constructor(x, y, entitiesArray) {
        this.x = x;
        this.y = y;
        this.width = 150;
        this.height = 150;
        this.type = 'great_octopus';
        this.dead = false;
        this.entities = entitiesArray;
        
        this.soundDamage = 0; // accumulated damage from sound waves
        this.maxSoundDamage = 10000; // 10 seconds of continuous sound
        
        this.timer = 0;
        this.shootCooldown = 2000;
    }

    update(deltaTime, level, playerX, playerY) {
        if (this.dead) return;
        this.timer += deltaTime;
        
        // Sound damage decays slowly if Ripjaws stops screaming
        if (this.soundDamage > 0) {
            this.soundDamage -= deltaTime * 0.5; // decays somewhat slowly
        }

        // Check if dead
        if (this.soundDamage >= this.maxSoundDamage) {
            this.dead = true;
            return;
        }

        this.shootCooldown -= deltaTime;
        // Shoot mucus
        if (this.shootCooldown <= 0) {
            this.shootCooldown = 1500 + Math.random() * 1000;
            if (this.entities) {
                // Shoot from mouth
                this.entities.push(new MucusProjectile(this.x + 75, this.y + 75, playerX, playerY));
            }
        }
    }

    draw(ctx) {
        if (this.dead) return;

        const cx = this.x + 75;
        const cy = this.y + 75;

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

        // Head/Mantle
        ctx.fillStyle = '#801A1A';
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
