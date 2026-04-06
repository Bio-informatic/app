export class Gomrog {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 80;
        this.type = 'gomrog';
        this.dead = false;

        this.hp = 15;
        this.maxHp = 15;
        
        // Starts on a floating brick
        this.baseX = x;
        this.baseY = y;
        
        this.time = 0;
        this.state = 'WAITING'; // WAITING, TONGUE_ATTACK, RETRACTING
        this.stateTimer = 0;
        
        this.tongueLength = 0;
        this.maxTongueLength = 300;
        this.tongueYOffset = 0; // aim angle
        
        this.damageFlicker = 0;
        this.falling = false; // When defeated
    }

    update(deltaTime, level, userX, userY) {
        if (this.dead) return;
        
        if (this.falling) {
            this.y += 5; // fall into poison
            if (this.y > level.height + 100) this.dead = true;
            return;
        }

        this.damageFlicker = Math.max(0, this.damageFlicker - deltaTime);
        this.time += deltaTime;

        // Float left and right (the brick moves)
        this.x = this.baseX + Math.sin(this.time / 1000) * 100;

        if (this.state === 'WAITING') {
            this.stateTimer += deltaTime;
            if (this.stateTimer > 5000) { // Every 5 seconds
                this.state = 'TONGUE_ATTACK';
                this.stateTimer = 0;
                this.tongueYOffset = userY - (this.y + 40); // Initial aim
            }
        } else if (this.state === 'TONGUE_ATTACK') {
            this.tongueLength += 15;
            
            // Continuous Tracking of the player's Y position while extending
            const targetYOffset = userY - (this.y + 40);
            this.tongueYOffset += (targetYOffset - this.tongueYOffset) * 0.1;

            if (this.tongueLength > this.maxTongueLength) {
                this.state = 'RETRACTING';
            }
        } else if (this.state === 'RETRACTING') {
            this.tongueLength -= 15;
            if (this.tongueLength <= 0) {
                this.tongueLength = 0;
                this.state = 'WAITING';
                this.stateTimer = 0;
            }
        }
    }

    takeDamage() {
        if (this.falling) return;
        this.hp -= 1;
        this.damageFlicker = 200;
        if (this.hp <= 0) {
            this.falling = true;
            // retract tongue instantly
            this.tongueLength = 0;
            this.state = 'WAITING';
        }
    }

    draw(ctx) {
        if (this.damageFlicker > 0 && Math.floor(performance.now() / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.save();
        
        // --- 1. Ancient floating brick base ---
        ctx.fillStyle = '#4B5320'; // Mossy ancient stone
        ctx.fillRect(this.x - 30, this.y + this.height - 10, this.width + 60, 25);
        ctx.fillStyle = '#2C3A20';
        for(let i=0; i<this.width+60; i+=25) {
            ctx.strokeRect(this.x - 30 + i, this.y + this.height - 10, 25, 25);
            // cracks
            if (i % 2 === 0) {
                ctx.fillRect(this.x - 20 + i, this.y + this.height - 10, 4, 15);
            }
        }

        ctx.translate(cx, cy);
        
        // --- 2. Tracking Tongue ---
        if (this.tongueLength > 0) {
            // Draw a thick, segmented pink tongue
            ctx.fillStyle = '#FF3388';
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-this.tongueLength, this.tongueYOffset - 4); 
            ctx.lineTo(-this.tongueLength, this.tongueYOffset + 14); 
            ctx.lineTo(-10, 15);
            ctx.fill();
            
            ctx.fillStyle = '#AA1155'; // shading
            ctx.beginPath();
            ctx.moveTo(-10, 8);
            ctx.lineTo(-this.tongueLength, this.tongueYOffset + 10);
            ctx.lineTo(-this.tongueLength, this.tongueYOffset + 14);
            ctx.lineTo(-10, 15);
            ctx.fill();

            // Tongue tip bulb
            ctx.fillStyle = '#FF0055';
            ctx.beginPath();
            ctx.arc(-this.tongueLength, this.tongueYOffset + 5, 18, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#FFAADD';
            ctx.fillRect(-this.tongueLength - 5, this.tongueYOffset - 5, 8, 8);
        }

        // --- 3. Ancient Frog Boss Body ---
        
        // Massive back legs
        ctx.fillStyle = '#1A3311'; // darkest moss green
        ctx.fillRect(-70, -10, 35, 45); // back thigh
        ctx.fillRect(50, 15, 25, 20);   // front thigh

        // Main body (squat and enormous)
        ctx.fillStyle = '#224C11'; 
        ctx.fillRect(-60, -30, 120, 70); 

        // Underbelly
        ctx.fillStyle = '#336622';
        ctx.fillRect(-50, 10, 100, 30);
        
        // Ancient Stone Ruins embedded in his back
        ctx.fillStyle = '#556655'; // Grey stone color
        ctx.fillRect(-45, -45, 15, 20); // pillar 1
        ctx.fillRect(0, -50, 20, 25);   // pillar 2
        ctx.fillRect(35, -40, 15, 15);  // rubble
        ctx.fillStyle = '#334433';
        ctx.fillRect(-40, -40, 5, 15);
        ctx.fillRect(5, -45, 10, 20);

        // Glowing Ancient Runes on body and ruins
        ctx.fillStyle = '#00FFDD'; 
        // rune 1
        ctx.fillRect(-40, 20, 15, 4);
        ctx.fillRect(-35, 15, 5, 14);
        // rune 2
        ctx.fillRect(20, -10, 8, 15);
        ctx.fillRect(16, -2, 16, 4);
        // rune 3 (on pillar 2)
        ctx.fillRect(8, -40, 4, 10);

        // Head and Face
        ctx.fillStyle = '#1A3F11';
        ctx.fillRect(-65, -45, 30, 40); // slope head
        
        // Mouth Drop (Open wide if tongue out)
        if (this.tongueLength > 0) {
            ctx.fillStyle = '#000';
            ctx.fillRect(-65, -10, 35, 25); // gaping black maw
            ctx.fillStyle = '#FF3388'; // tongue root
            ctx.fillRect(-60, 0, 20, 10); 
            // Fangs
            ctx.fillStyle = '#DDDDDD';
            ctx.fillRect(-60, -10, 4, 8);
            ctx.fillRect(-40, -10, 4, 8);
        } else {
            // Closed mouth line
            ctx.fillStyle = '#000';
            ctx.fillRect(-65, 0, 40, 4);
            // Tusk sticking out
            ctx.fillStyle = '#AAAAAA';
            ctx.fillRect(-55, 4, 6, 8);
        }

        // Eyes (Giant ancient staring eyes)
        ctx.fillStyle = '#0F0'; // toxic green glow matching runes? user asked for yellow previously, but teal/green is more poison-y
        ctx.fillRect(-60, -40, 15, 15);
        ctx.fillStyle = '#000';
        ctx.fillRect(-55, -40, 5, 15); // horizontal slit pupil or vertical? typical frog is horizontally slotted
        ctx.fillRect(-60, -35, 15, 5); 

        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    getTongueRect() {
        if (this.tongueLength > 0) {
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            return {
                x: cx - this.tongueLength - 18,
                y: cy + this.tongueYOffset - 10,
                width: 36,
                height: 36
            };
        }
        return null;
    }
}
