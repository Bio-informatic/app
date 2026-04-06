export class Bomba {
    constructor(x, y, entities) {
        this.x = x;
        this.y = y;
        this.width = 160;
        this.height = 160;
        this.type = 'bomba';
        this.dead = false;
        this.hp = 1;
        this.maxHp = 1;
        
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
                if (this.bombTimer > 5000) {
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
        this.hasShooter = false;
        this.windowOpen = true;
    }
    
    killGoomba() {
        this.goombaDead = true;
        this.dead = true;
    }

    draw(ctx) {
        if (!this.dead) {
            // Draw Armor
            ctx.fillStyle = '#444';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 4;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Inner compartment
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 40, this.y + 80, 80, 80);
            
            if (!this.goombaDead) {
                // Draw tiny Goomba
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.goombaX, this.goombaY, this.goombaWidth, this.goombaHeight);
                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(this.goombaX + 8, this.goombaY + 10, 6, 12);
                ctx.fillRect(this.goombaX + 26, this.goombaY + 10, 6, 12);
            }
            
            if (this.hasShooter) {
                // Draw Shooter
                ctx.fillStyle = '#FF4400';
                ctx.fillRect(this.x + this.width/2 - 20, this.y - 30, 40, 40);
                ctx.strokeStyle = '#FFBB00';
                ctx.strokeRect(this.x + this.width/2 - 20, this.y - 30, 40, 40);
            }
            
            if (this.windowOpen) {
                // Draw open window indicator on side
                ctx.fillStyle = '#AADDFF';
                ctx.fillRect(this.x - 5, this.y + 100, 10, 40);
            } else {
                ctx.fillStyle = '#222';
                ctx.fillRect(this.x - 5, this.y + 100, 10, 40);
            }
        }
        
        for (const b of this.bombs) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(b.x + b.width/2, b.y + b.height/2, b.width/2, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#F00';
            ctx.fillRect(b.x + b.width/2 - 2, b.y - 4, 4, 8);
        }
    }
}
