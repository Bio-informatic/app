import { WhiteWalkerGoomba } from './WhiteWalkerGoomba.js';

export class NightKing {
    constructor(x, y, entitiesArray) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 128;
        this.vx = 0;
        this.vy = 0;
        this.hp = 1; // Only dies to Dragonglass
        this.type = 'night_king';
        this.dead = false;
        this.timer = 0;
        this.entities = entitiesArray;
        
        this.attackCooldown = 0;
        this.summonCooldown = 15000; // 15 seconds
        this.summonGlowTimer = 0;
        this.state = 'IDLE'; // IDLE, ATTACK
    }

    update(deltaTime, level, targetX, targetY) {
        if (this.dead) return;
        
        this.timer += deltaTime;
        this.attackCooldown -= deltaTime;
        this.summonCooldown -= deltaTime;
        
        if (this.summonGlowTimer > 0) {
            this.summonGlowTimer -= deltaTime;
        }

        // Pass glow state to level for global rendering
        if (level) {
            level.winterGlowTimer = this.summonGlowTimer;
        }

        // Summon 10 White Walker Goombas every 15 seconds across the whole level
        if (this.summonCooldown <= 0) {
            this.summonCooldown = 15000;
            this.summonGlowTimer = 3000; // Eyes glow for 3 seconds
            
            if (this.entities && level) {
                for (let i = 0; i < 10; i++) {
                    const spawnX = Math.random() * level.width; // Anywhere across the level
                    const spawnY = -50 - (Math.random() * 200); // Fall from high up in the sky
                    this.entities.push(new WhiteWalkerGoomba(spawnX, spawnY));
                }
            }
        }
        
        // Simple AI: stay near his spot, throw ice spears occasionally
        const dist = Math.abs(targetX - (this.x + this.width/2));
        
        if (dist < 400 && this.attackCooldown <= 0) {
            this.state = 'ATTACK';
            this.attackCooldown = 2000 + Math.random() * 1000;
            this.throwSpear(targetX > this.x ? 1 : -1);
        } else if (this.attackCooldown > 0) {
            this.state = 'IDLE';
        }
    }
    
    throwSpear(dir) {
        // We'll create a simple ice spear entity by adding it to the main array
        // It's similar to a crystal shard or fireball
        if(this.entities) {
            this.entities.push({
                x: this.x + (dir > 0 ? this.width : 0),
                y: this.y + 40,
                width: 32,
                height: 8,
                vx: 6 * dir,
                vy: 0,
                type: 'ice_spear',
                dead: false,
                update: function(dt, level) {
                    this.x += this.vx;
                    if(this.x < 0 || this.x > level.width) this.dead = true;
                },
                draw: function(ctx) {
                    ctx.fillStyle = '#00FFFF';
                    ctx.beginPath();
                    if(this.vx > 0) {
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(this.x + this.width, this.y + this.height/2);
                        ctx.lineTo(this.x, this.y + this.height);
                    } else {
                        ctx.moveTo(this.x + this.width, this.y);
                        ctx.lineTo(this.x, this.y + this.height/2);
                        ctx.lineTo(this.x + this.width, this.y + this.height);
                    }
                    ctx.fill();
                }
            });
        }
    }

    takeDamage(damage) {
        // Immune to normal damage! Handled externally if dragonglass is used.
    }

    draw(ctx) {
        // Icy skin
        ctx.fillStyle = '#6BA1B8';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Armor (dark grey/blueish)
        ctx.fillStyle = '#2A3F4C';
        ctx.fillRect(this.x - 5, this.y + 25, this.width + 10, 65);

        // Scale texture on armor
        ctx.fillStyle = '#1B2C36';
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                ctx.fillRect(this.x + 2 + col * 10, this.y + 30 + row * 10, 8, 8);
            }
        }

        // Chest Emblem (Brooch)
        ctx.fillStyle = '#A0BCC8';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 25);
        ctx.lineTo(this.x + this.width / 2 + 10, this.y + 40);
        ctx.lineTo(this.x + this.width / 2, this.y + 55);
        ctx.lineTo(this.x + this.width / 2 - 10, this.y + 40);
        ctx.fill();

        // Leather belt/wraps
        ctx.fillStyle = '#15212A';
        ctx.fillRect(this.x - 5, this.y + 75, this.width + 10, 15);

        // Skirt/lower armor
        ctx.fillStyle = '#213340';
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y + 90);
        ctx.lineTo(this.x + this.width + 5, this.y + 90);
        ctx.lineTo(this.x + this.width + 15, this.y + this.height);
        ctx.lineTo(this.x - 15, this.y + this.height);
        ctx.fill();

        // Facial features
        ctx.fillStyle = '#3A6A80';
        // Nose and cheekbones
        ctx.fillRect(this.x + 28, this.y + 15, 8, 12);
        ctx.fillRect(this.x + 10, this.y + 18, 10, 2);
        ctx.fillRect(this.x + 44, this.y + 18, 10, 2);
        
        // Eyes (glowing blue)
        if (this.summonGlowTimer > 0) {
            ctx.fillStyle = '#FFFFFF'; // Bright white core when summoning
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 25 + Math.sin(this.timer / 50) * 15;
            // Draw a huge blue beam coming out of his eyes
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.moveTo(this.x + 20, this.y + 12);
            ctx.lineTo(this.x - 200, this.y - 300);
            ctx.lineTo(this.x + 200, this.y - 300);
            ctx.fill();
            
            ctx.fillStyle = '#FFFFFF';
        } else {
            ctx.fillStyle = '#00FFFF';
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 10;
        }
        
        ctx.beginPath();
        ctx.ellipse(this.x + 20, this.y + 12, 5, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(this.x + 44, this.y + 12, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
        
        // Ice Crown (horns)
        ctx.fillStyle = '#9ACBE0';
        for (let i = 0; i < 7; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + 2 + i * 10, this.y);
            ctx.lineTo(this.x + 5 + i * 10, this.y - 12 - (i === 3 ? 6 : (i === 2 || i === 4 ? 3 : 0))); // Taller in middle
            ctx.lineTo(this.x + 8 + i * 10, this.y);
            ctx.fill();
        }
    }
}
