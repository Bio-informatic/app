export class Gomrog {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 80;
        this.type = 'gomrog';
        this.dead = false;

        this.hp = 10;
        this.maxHp = 10;
        
        // Starts on a floating brick
        this.baseX = x;
        this.baseY = y;
        
        this.time = 0;
        this.state = 'WAITING'; // WAITING, TONGUE_ATTACK, RETRACTING
        this.stateTimer = 0;
        this.attackCooldown = 0;
        this.attackInterval = 8000;
        
        this.tongueLength = 0;
        this.maxTongueLength = 300;
        this.tongueYOffset = 0; // aim angle
        this.mouthOffsetX = -54;
        this.mouthOffsetY = -4;
        
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
            this.attackCooldown += deltaTime;
            if (this.attackCooldown >= this.attackInterval) {
                this.state = 'TONGUE_ATTACK';
                this.stateTimer = 0;
                this.attackCooldown = 0;
                const mouthY = this.y + this.height / 2 + this.mouthOffsetY;
                this.tongueYOffset = userY - mouthY;
            }
        } else if (this.state === 'TONGUE_ATTACK') {
            this.tongueLength += 15;
            
            // Continuous Tracking of the player's Y position while extending
            const mouthY = this.y + this.height / 2 + this.mouthOffsetY;
            const targetYOffset = userY - mouthY;
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
        const mouthX = this.mouthOffsetX;
        const mouthY = this.mouthOffsetY;

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
        
        // --- 2. Ancient Frog Tongue ---
        if (this.tongueLength > 0) {
            ctx.strokeStyle = '#E7628C';
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(mouthX, mouthY + 8);
            ctx.lineTo(mouthX - this.tongueLength, mouthY + this.tongueYOffset + 10);
            ctx.stroke();

            ctx.strokeStyle = '#B93C64';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(mouthX - 4, mouthY + 11);
            ctx.lineTo(mouthX - this.tongueLength, mouthY + this.tongueYOffset + 12);
            ctx.stroke();

            ctx.fillStyle = '#FF8CAF';
            ctx.beginPath();
            ctx.ellipse(mouthX - this.tongueLength, mouthY + this.tongueYOffset + 10, 14, 11, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- 3. Ancient Frog Boss Body ---
        ctx.fillStyle = '#233B18';
        ctx.fillRect(-78, 10, 30, 28);
        ctx.fillRect(50, 14, 26, 24);
        ctx.fillRect(-70, 26, 18, 18);
        ctx.fillRect(52, 28, 18, 18);

        ctx.fillStyle = '#2F5A24';
        ctx.beginPath();
        ctx.ellipse(2, 2, 68, 44, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6D7B50';
        ctx.fillRect(-34, -40, 18, 16);
        ctx.fillRect(-6, -48, 24, 18);
        ctx.fillRect(28, -38, 16, 14);
        ctx.fillStyle = '#3A472E';
        ctx.fillRect(-29, -34, 6, 10);
        ctx.fillRect(2, -43, 10, 13);

        ctx.fillStyle = '#B8C48D';
        ctx.beginPath();
        ctx.ellipse(8, 18, 44, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1D3214';
        ctx.beginPath();
        ctx.ellipse(-46, -6, 24, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00E0B0';
        ctx.fillRect(-22, 2, 18, 4);
        ctx.fillRect(-15, -4, 4, 16);
        ctx.fillRect(18, -10, 6, 18);
        ctx.fillRect(14, -2, 14, 4);
        ctx.fillRect(4, -39, 4, 9);
        ctx.fillRect(-50, -16, 6, 6);
        ctx.fillRect(34, -4, 8, 8);

        // Mouth Drop (Open wide if tongue out)
        if (this.tongueLength > 0) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(-48, 8, 22, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#E7628C';
            ctx.fillRect(-58, 6, 16, 6);
        } else {
            ctx.fillStyle = '#000';
            ctx.fillRect(-66, 6, 34, 4);
        }

        ctx.fillStyle = '#A7D646';
        ctx.beginPath();
        ctx.ellipse(-48, -26, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(-50, -35, 4, 18);
        ctx.fillRect(-54, -27, 12, 3);

        ctx.restore();
        ctx.globalAlpha = 1.0;
    }

    getTongueRect() {
        if (this.tongueLength > 0) {
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            return {
                x: cx + this.mouthOffsetX - this.tongueLength - 18,
                y: cy + this.mouthOffsetY + this.tongueYOffset - 8,
                width: 36,
                height: 36
            };
        }
        return null;
    }
}
