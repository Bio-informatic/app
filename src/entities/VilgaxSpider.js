import { OmnitrixVirus } from './OmnitrixVirus.js';

export class VilgaxSpider {
    constructor(x, y, entities) {
        this.x = x;
        this.y = y;
        this.width = 160;
        this.height = 140;
        this.type = 'vilgax_spider';
        this.dead = false;
        this.hp = 100; // Not hurt by players, only viruses
        
        this.entities = entities;
        this.fixedVirusesCount = 0; // Number of viruses reprogrammed by player touching boss
        this.virusesNeeded = 6;     // Needs 6 fixed viruses to overload
        
        this.state = 'IDLE'; // IDLE, ATTACK
        this.attackTimer = 0;
        this.spawnTimer = 0;
        
        this.legPhase = 0;
        
        // Spawn initial waves (5 viruses)
        for (let i = 0; i < 5; i++) {
            this.spawnVirus();
        }
        this.stunned = false;
        this.finalHits = 0;
    }

    spawnVirus() {
        const v = new OmnitrixVirus(this.x + this.width / 2 - 16, this.y + this.height - 32);
        v.vy = -6; // Pop them out
        v.vx = (Math.random() - 0.5) * 8;
        this.entities.push(v);
    }

    takeDamage(amount) {
        // Invulnerable to normal damage; see game.js F key handler for final hits
    }

    virusAttack() {
        this.fixedVirusesCount++;
    }

    update(deltaTime, level) {
        if (this.dead) return;
        const now = performance.now();

        if (!this.stunned) {
            this.legPhase += 0.05;
            for (let i = 0; i < this.entities.length; i++) {
                const e = this.entities[i];
                if (e.type === 'omnitrix_virus') {
                    if (e.fixed && e.followTarget === this) {
                        const cx = this.x + this.width / 2;
                        const ecx = e.x + e.width / 2;
                        if (Math.abs(cx - ecx) < 40) {
                            this.virusAttack();
                            e.dead = true; // Consumed
                        }
                    }
                }
            }

            // Defeat condition: He spawned 5 viruses. When he receives 5 hits, he is stunned.
            if (this.fixedVirusesCount >= 5) {
                this.hp = 10; // Decrease life by 90%
                this.stunned = true;
            } else {
                // Visual HP bar goes down slightly as he gets hit
                this.hp = Math.max(10, 100 - (this.fixedVirusesCount * 18)); // Goes from 100 to 10
            }
        } else {
            // Stunned State
            // The F key listener in game.js will increment this.finalHits
            if (this.finalHits >= 3) {
                this.hp = 0;
                this.dead = true;
            }
        }
    }

    getHitbox() {
        return {
            x: this.x + 20,
            y: this.y + 40,
            width: this.width - 40,
            height: this.height - 40
        };
    }

    draw(ctx) {
        if (this.dead) return;
        const now = performance.now();
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.save();
        
        // Damage glitch effect
        if (this.hp < 100 && !this.stunned) {
            if (Math.random() < (1 - this.hp/100)*0.5) ctx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10);
        } else if (this.stunned) {
            ctx.translate((Math.random()-0.5)*15, Math.abs(Math.random()) * 5); // Collapse and shake
        }

        // Draw 6 Spider Legs (mech)
        ctx.strokeStyle = this.stunned ? '#111' : '#300';
        ctx.lineWidth = 8;
        ctx.lineJoin = 'round';
        for (let i = 0; i < 6; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const yOff = Math.floor(i / 2) * 20;
            const lx = cx;
            const ly = cy + yOff;
            
            const kneeX = cx + 60 * side + (this.stunned ? 0 : Math.sin(this.legPhase + i) * 10 * side);
            const kneeY = cy - 40 + (this.stunned ? 40 : Math.cos(this.legPhase + i) * 20);
            
            const footX = cx + 90 * side + (this.stunned ? 0 : Math.cos(this.legPhase + i * 2) * 15 * side);
            const footY = this.y + this.height;

            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(kneeX, kneeY);
            ctx.lineTo(footX, footY);
            ctx.stroke();
            
            // Red glowing joints
            ctx.fillStyle = '#F00';
            ctx.beginPath(); ctx.arc(kneeX, kneeY, 6, 0, Math.PI * 2); ctx.fill();
        }

        // Giant Cyber Torso
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#F00';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Floating Vilgax Hologram Head
        const hY = this.y + 10 + Math.sin(now / 300) * 10;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Blood red hologram
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 40, hY - 30);
        ctx.lineTo(cx + 40, hY - 30);
        ctx.fill();

        // Face details
        ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
        // Head shape
        ctx.fillRect(cx - 20, hY - 40, 40, 40);
        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.fillRect(cx - 15, hY - 30, 10, 6);
        ctx.fillRect(cx + 5, hY - 30, 10, 6);
        // Squid tentacles
        ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
        ctx.fillRect(cx - 15, hY, 8, 20);
        ctx.fillRect(cx - 4, hY, 8, 25);
        ctx.fillRect(cx + 7, hY, 8, 20);

        // HP Bar
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y - 30, this.width, 10);
        ctx.fillStyle = '#F00';
        ctx.fillRect(this.x, this.y - 30, this.width * (this.hp / 100), 10);

        ctx.restore();
    }
}
