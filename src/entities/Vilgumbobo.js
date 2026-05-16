import { OmnitrixVirus } from './OmnitrixVirus.js';

export class Vilgumbobo {
    constructor(x, y, entities) {
        this.x = x;
        this.y = y;
        this.width = 160;
        this.height = 140;
        this.type = 'vilgumbobo';
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

    takeDamage(amount) {
        this.hp -= (amount || 1);
        if (this.hp <= 0) this.dead = true;
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

        // Authentic Physical Vilgax Head & Shoulders attached to the Spider Torso
        const hY = cy - 40 + (this.stunned ? 20 : Math.sin(now / 300) * 3); // Bob slightly with breathing, drop if stunned
        
        // Massive Dark Red Armored Collar (Neck Base)
        ctx.fillStyle = '#401010'; // Dark brown/red
        ctx.beginPath();
        ctx.ellipse(cx, hY + 15, 30, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#601515'; // Darker red details
        ctx.fillRect(cx - 20, hY + 10, 40, 15);
        ctx.strokeRect(cx - 20, hY + 10, 40, 15);

        // Alien Skin/Head Base
        ctx.fillStyle = '#8A9A8A'; // Pale sickly green/grey skin
        ctx.beginPath();
        ctx.moveTo(cx - 15, hY + 10);
        ctx.quadraticCurveTo(cx - 20, hY - 30, cx, hY - 35); // Left dome
        ctx.quadraticCurveTo(cx + 20, hY - 30, cx + 15, hY + 10); // Right dome
        ctx.fill();
        ctx.stroke();

        // Dark shadowing on the cranial ridges
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(cx - 10, hY - 20);
        ctx.lineTo(cx + 10, hY - 20);
        ctx.lineTo(cx + 5, hY - 35);
        ctx.lineTo(cx - 5, hY - 35);
        ctx.fill();

        // Eyes (Fierce, glowing orange-red slits wrapped in black sockets)
        ctx.fillStyle = '#000'; // Black eye bed
        ctx.beginPath();
        ctx.ellipse(cx - 10, hY - 15, 6, 3, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 10, hY - 15, 6, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FF3300'; // Glowing red pupil
        ctx.beginPath();
        ctx.ellipse(cx - 10, hY - 15, 3, 1.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 10, hY - 15, 3, 1.5, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Iconic Front Tentacles covering the mouth/lower face
        // 4 distinct pale green tentacles
        ctx.fillStyle = '#8A9A8A';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        
        const tentacleSway = this.stunned ? 0 : Math.sin(now / 200) * 2;
        const drawTentacle = (x, y, length, curve) => {
            ctx.beginPath();
            ctx.moveTo(x - 3, y);
            ctx.quadraticCurveTo(x + curve + tentacleSway, y + length/2, x - 1, y + length);
            ctx.quadraticCurveTo(x + curve + tentacleSway + 2, y + length/2, x + 3, y);
            ctx.fill();
            ctx.stroke();
        };

        // Outer Left
        drawTentacle(cx - 12, hY - 5, 25, -6);
        // Inner Left
        drawTentacle(cx - 4, hY - 5, 32, -2);
        // Inner Right
        drawTentacle(cx + 4, hY - 5, 32, 2);
        // Outer Right
        drawTentacle(cx + 12, hY - 5, 25, 6);

        // Breathing tube/respirator gear going into the sides of the mask
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#333';
        ctx.beginPath(); ctx.moveTo(cx - 20, hY + 15); ctx.quadraticCurveTo(cx - 30, hY, cx - 25, hY - 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 20, hY + 15); ctx.quadraticCurveTo(cx + 30, hY, cx + 25, hY - 5); ctx.stroke();

        // HP Bar
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y - 30, this.width, 10);
        ctx.fillStyle = '#F00';
        ctx.fillRect(this.x, this.y - 30, this.width * (this.hp / 100), 10);

        ctx.restore();
    }
}
