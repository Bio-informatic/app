export class Bomba {
    constructor(x, y, entities) {
        this.x = x;
        this.y = y;
        this.width = 160;
        this.height = 160;
        this.type = 'bomba';
        this.dead = false;
        this.hp = 2;
        this.maxHp = 2;
        
        this.hasShooter = true;
        this.windowOpen = false;
        
        this.bombs = [];
        this.bombTimer = 0;
        
        // Inner Goomba details
        this.goombaX = this.x + 60;
        this.goombaY = this.y + 100;
        this.goombaWidth = 40;
        this.goombaHeight = 40;
        this.goombaDead = false;
    }

    update(deltaTime, level, userX, userY) {
        if (this.dead) return;
        if (userX === undefined) return; // Skip generic entity loop
        
        if (this.hasShooter) {
            // Check distance
            const dist = Math.abs((this.x + this.width/2) - userX);
            if (dist < 400) {
                this.bombTimer += deltaTime;
                if (this.bombTimer > 3000) {
                    this.bombTimer = 0;
                    // Shoot bomb at user
                    let dx = userX - (this.x + this.width/2);
                    let dy = userY - (this.y + 20);
                    let len = Math.sqrt(dx*dx + dy*dy);
                    this.bombs.push({
                        x: this.x + this.width/2,
                        y: this.y + 20,
                        vx: (dx/len) * 3,
                        vy: (dy/len) * 3,
                        width: 20,
                        height: 20,
                        dead: false
                    });
                }
            }
        }
        
        // Update bombs
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            let b = this.bombs[i];
            b.x += b.vx;
            b.y += b.vy;
            // Homes lightly
            let dx = userX - b.x;
            let dy = userY - b.y;
            let len = Math.sqrt(dx*dx + dy*dy);
            b.vx += (dx/len) * 0.05;
            b.vy += (dy/len) * 0.05;
            
            // Limit speed
            let speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
            if (speed > 4) {
                b.vx = (b.vx/speed) * 4;
                b.vy = (b.vy/speed) * 4;
            }
            
            if (b.y > level.height || b.x < 0 || b.x > level.width) {
                b.dead = true;
            }
            if (b.dead) {
                this.bombs.splice(i, 1);
            }
        }
    }
    
    breakShooter() {
        this.hp = 1;
        this.hasShooter = false;
        this.windowOpen = true;
    }
    
    killGoomba() {
        this.hp = 0;
        this.goombaDead = true;
        this.dead = true;
    }

    takeDamage(amount) {
        if (this.hasShooter) {
            this.breakShooter();
        } else {
            this.killGoomba();
        }
    }

    draw(ctx) {
        if (!this.dead) {
            const t = performance.now();
            const hover = Math.sin(t / 260) * 2.5;
            const pulse = 0.65 + 0.35 * Math.sin(t / 180);
            const panelScan = (Math.sin(t / 320) + 1) * 0.5;

            // Draw Armor
            const armorGrad = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
            armorGrad.addColorStop(0, '#555');
            armorGrad.addColorStop(0.5, '#3b3b3b');
            armorGrad.addColorStop(1, '#2a2a2a');
            ctx.fillStyle = armorGrad;
            ctx.fillRect(this.x, this.y + hover, this.width, this.height);
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 4;
            ctx.strokeRect(this.x, this.y + hover, this.width, this.height);

            // Rivets / panel seams
            ctx.fillStyle = '#1d1d1d';
            for (let i = 0; i < 6; i++) {
                const rx = this.x + 16 + i * 24;
                ctx.fillRect(rx, this.y + hover + 10, 6, 6);
                ctx.fillRect(rx, this.y + hover + this.height - 16, 6, 6);
            }
            ctx.strokeStyle = '#2b2b2b';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x + 16, this.y + hover + 16, this.width - 32, this.height - 32);
            
            // Inner compartment
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 40, this.y + hover + 80, 80, 80);
            ctx.fillStyle = `rgba(0, 255, 220, ${0.1 + 0.2 * panelScan})`;
            ctx.fillRect(this.x + 44, this.y + hover + 84, 72, 72);
            
            if (!this.goombaDead) {
                // Draw tiny Goomba
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.goombaX, this.goombaY + hover, this.goombaWidth, this.goombaHeight);
                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(this.goombaX + 8, this.goombaY + hover + 10, 6, 12);
                ctx.fillRect(this.goombaX + 26, this.goombaY + hover + 10, 6, 12);
            }
            
            if (this.hasShooter) {
                // Draw Shooter
                const turretY = this.y - 30 + hover + Math.sin(t / 180) * 2;
                ctx.fillStyle = '#FF4400';
                ctx.fillRect(this.x + this.width/2 - 20, turretY, 40, 40);
                ctx.strokeStyle = '#FFBB00';
                ctx.strokeRect(this.x + this.width/2 - 20, turretY, 40, 40);
                ctx.fillStyle = `rgba(255, 200, 0, ${pulse})`;
                ctx.fillRect(this.x + this.width / 2 - 6, turretY + 8, 12, 24);
            }
            
            if (this.windowOpen) {
                // Draw open window indicator on side
                ctx.fillStyle = '#AADDFF';
                ctx.fillRect(this.x - 5, this.y + hover + 100, 10, 40);
            } else {
                ctx.fillStyle = '#222';
                ctx.fillRect(this.x - 5, this.y + hover + 100, 10, 40);
            }
        }
        
        for (const b of this.bombs) {
            const bt = performance.now() / 100;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(b.x + b.width/2, b.y + b.height/2, b.width/2, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = '#3a3a3a';
            ctx.stroke();
            ctx.fillStyle = `rgba(255, 40, 40, ${0.5 + 0.5 * Math.sin(bt + b.x * 0.05)})`;
            ctx.fillRect(b.x + b.width/2 - 2, b.y - 4, 4, 8);
        }
    }
}
