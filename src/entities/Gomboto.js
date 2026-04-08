import { Electromba } from './Electromba.js';

export class Gomboto {
    constructor(x, y, entitiesArray) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 80;
        this.hp = 10;
        this.type = 'gomboto';
        this.dead = false;
        this.absorbed = false;
        
        this.entities = entitiesArray;
        this.lastAttack = performance.now();
        this.vx = -1;
    }

    takeDamage(amount = 1) {
        if (this.absorbed) return;
        this.hp -= amount;
        if (this.hp <= 0) {
            // Drop flag or just let Upgrade ride to flag? The instruction says 'must use him to finish the level as upgrade himselfe cannot finish the level whith his gelly body.'
            // So we don't kill him, maybe he just dies and then cannot be used?
            // Actually, we could just say if HP drops to 0, he becomes uncontrollable.
            this.dead = true;
        }
    }

    update(deltaTime, level) {
        if (this.absorbed) {
            // While controlled, Mario's code in game.js handles checking the finish flag!
            return;
        }

        this.vy = (this.vy || 0) + 0.5;
        this.y += this.vy;
        let footY = Math.floor((this.y + this.height) / level.tileSize);
        let footX = Math.floor((this.x + this.width / 2) / level.tileSize);
        if (level.tiles[footY] && level.tiles[footY][footX]) {
            this.y = footY * level.tileSize - this.height;
            this.vy = 0;
        }
        
        this.x += this.vx;
        const bossZoneX = level.cols - 40;
        if (this.x < bossZoneX * level.tileSize || this.x > (level.cols - 5) * level.tileSize) {
             this.vx *= -1;
        }

        const now = performance.now();
        if (now - this.lastAttack > 3000) {
            this.lastAttack = now;
            if (this.entities && this.onBabySpawn) {
                this.onBabySpawn();
                const spawnX = this.vx > 0 ? this.x + this.width : this.x - 32;
                this.entities.push(new Electromba(spawnX, this.y + 40));
            }
        }
    }

    draw(ctx) {
        // Theme Colors
        const baseColor = this.absorbed ? '#080808' : '#111';
        const accentColor = this.absorbed ? '#00FF44' : '#00FFCC';
        const eyeColor = this.absorbed ? '#00FF44' : '#FF0000';

        ctx.save();
        if (this.absorbed) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00FF44';
        }

        // --- Main Body ---
        ctx.fillStyle = baseColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // --- Eye / Center Core ---
        ctx.fillStyle = eyeColor;
        ctx.fillRect(this.x + 20, this.y + 20, 40, 10);

        // --- Antennas ---
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y);
        ctx.lineTo(this.x + 10, this.y - 20);
        ctx.moveTo(this.x + 60, this.y);
        ctx.lineTo(this.x + 70, this.y - 20);
        ctx.stroke();

        // --- UI / State Info ---
        if (!this.absorbed) {
            // Health Bar
            ctx.fillStyle = '#F00';
            ctx.fillRect(this.x, this.y - 15, this.width * (this.hp / 10), 5);
        } else {
            // Hacking text and circuit-like glow
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#00FF44';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('HACKED // UPGRADED', this.x, this.y - 10);
            
            // Draw some "circuits" on the boss body
            ctx.strokeStyle = 'rgba(0, 255, 68, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x + 5, this.y + 10); ctx.lineTo(this.x + 15, this.y + 10); ctx.lineTo(this.x + 15, this.y + 25);
            ctx.moveTo(this.x + 75, this.y + 70); ctx.lineTo(this.x + 65, this.y + 70); ctx.lineTo(this.x + 65, this.y + 55);
            ctx.stroke();
        }
        ctx.restore();
    }
}
