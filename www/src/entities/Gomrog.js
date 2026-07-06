export class Gomrog {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 140;  // OPTIMIZATION: Scaled up to be a truly massive, solid design
        this.height = 100;
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
        this.attackInterval = 3000;
        
        this.tongueLength = 0;
        this.maxTongueLength = 300;
        this.tongueYOffset = 0; // aim angle
        this.mouthOffsetX = -70; // Aligned to the larger snout left boundary
        this.mouthOffsetY = 0;
        
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
            
            // Continuous Tracking of the player's Y position while extending [1]
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
        const now = performance.now();
        const breathe = Math.sin(now / 240) * 2.5;
        const glowPulse = 0.4 + 0.6 * Math.sin(now / 310);

        // Palette definitions based on reference concept [1]
        const cSkin = '#717C50';        // Muddy olive / khaki green skin
        const cBelly = '#C5C79E';       // Pale grey-cream underbelly and throat
        const cShadow = '#3F4726';      // Dark swamp green under-shadow
        const cMud = '#524025';         // Mud brown texture patch layer
        const cMoss = '#2B3D14';        // Mossy hanging vines
        const cGlow = '#CCFF00';        // Glowing organic neon pustules
        const cTongue = '#E7628C';      // Tongue pink base
        const cTongueDark = '#B93C64';  // Tongue segmented shadow pink

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const mouthX = this.mouthOffsetX;
        const mouthY = this.mouthOffsetY;

        ctx.save();
        ctx.translate(0, breathe);
        
        // ── 1. ANCIENT FLOATING BRICK BASE (Mossy stone) ──
        ctx.fillStyle = '#4B5320'; 
        ctx.fillRect(this.x - 40, this.y + this.height - 10, this.width + 80, 25);
        ctx.fillStyle = '#2C3A20';
        for (let i = 0; i < this.width + 80; i += 25) {
            ctx.strokeRect(this.x - 40 + i, this.y + this.height - 10, 25, 25);
            // Craggy cracks
            if (i % 2 === 0) {
                ctx.fillRect(this.x - 30 + i, this.y + this.height - 10, 4, 15);
            }
        }

        ctx.translate(cx, cy);
        
        // ── 2. SEGMENTED PINK TONGUE (Whip variation) [1] ──
        if (this.tongueLength > 0) {
            ctx.save();
            ctx.strokeStyle = cTongue;
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(mouthX, mouthY + 8);
            ctx.lineTo(mouthX - this.tongueLength, mouthY + this.tongueYOffset + 10);
            ctx.stroke();

            // Render Segmented muscular bands [1]
            ctx.strokeStyle = cTongueDark;
            ctx.lineWidth = 2.2;
            const segments = Math.floor(this.tongueLength / 25);
            for (let i = 1; i <= segments; i++) {
                const ratio = i / (segments + 1);
                const tx = mouthX - this.tongueLength * ratio;
                const ty = (mouthY + 8) + (this.tongueYOffset + 2) * ratio;
                ctx.beginPath();
                ctx.moveTo(tx, ty - 6);
                ctx.lineTo(tx, ty + 6);
                ctx.stroke();
            }

            // Heavy clubbed pink tip [1]
            ctx.fillStyle = cTongue;
            ctx.beginPath();
            ctx.ellipse(mouthX - this.tongueLength, mouthY + this.tongueYOffset + 10, 16, 13, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // ── 3. ANCIENT FROG LEG STRUCTURES & MASSIVE THIGHS ──
        ctx.fillStyle = cShadow;
        // Back folding leg (Thigh curve) [1]
        ctx.beginPath();
        ctx.ellipse(35, 25, 30, 20, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cSkin;
        ctx.beginPath();
        ctx.ellipse(32, 23, 26, 17, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Front arm (Stout supporting limb) [1]
        ctx.fillStyle = cShadow;
        ctx.fillRect(-35, 20, 18, 25);
        ctx.fillStyle = cSkin;
        ctx.fillRect(-33, 20, 14, 22);

        // ── 4. HEAVY CRAGGY TOAD BODY ──
        ctx.fillStyle = cShadow;
        ctx.beginPath();
        // Heavy hunchback torso silhouette [1]
        ctx.moveTo(-60, 20); // mouth base
        ctx.quadraticCurveTo(-65, -15, -45, -25); // head crown
        ctx.lineTo(-25, -28); // forehead
        ctx.quadraticCurveTo(10, -38, 55, 5); // sloping spine [1]
        ctx.lineTo(65, 35); // rear
        ctx.lineTo(40, 42); 
        ctx.lineTo(-40, 42); 
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = cSkin;
        ctx.beginPath();
        ctx.moveTo(-58, 18);
        ctx.quadraticCurveTo(-62, -13, -44, -23);
        ctx.lineTo(-25, -26);
        ctx.quadraticCurveTo(8, -35, 52, 4);
        ctx.lineTo(62, 33);
        ctx.lineTo(38, 40);
        ctx.lineTo(-38, 40);
        ctx.closePath();
        ctx.fill();

        // ── 5. MUD PATTERNS LAYER ──
        ctx.fillStyle = cMud;
        ctx.beginPath();
        ctx.arc(38, 16, 10, 0, Math.PI * 2);
        ctx.arc(46, 6, 6, 0, Math.PI * 2);
        ctx.arc(-18, 26, 8, 0, Math.PI * 2);
        ctx.fill();

        // ── 6. MASSIVE THROAT / UNDERBELLY ──
        ctx.fillStyle = cBelly;
        ctx.beginPath();
        ctx.moveTo(-58, 10);
        ctx.quadraticCurveTo(-48, -4, -33, -4); // throat base [1]
        ctx.quadraticCurveTo(5, 5, 20, 38); // massive rounded belly [1]
        ctx.lineTo(-25, 40);
        ctx.lineTo(-56, 18);
        ctx.closePath();
        ctx.fill();

        // ── 7. GLOWING ORGANIC hexagonal PUSTULES (Back) ──
        // Pulsing yellow-green biological dome growths [1]
        ctx.save();
        ctx.fillStyle = cGlow;
        ctx.shadowBlur = 12 * glowPulse;
        ctx.shadowColor = cGlow;
        
        const backPustules = [
            { x: -10, y: -25, r: 8 },
            { x: 5, y: -22, r: 10 },
            { x: 20, y: -14, r: 9 },
            { x: 32, y: -4, r: 7 }
        ];
        backPustules.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y + breathe * 0.4, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // ── 8. HANGING MOSSY VINES LAYER ──
        // Dark green foliage hanging over shoulders [1]
        ctx.fillStyle = cMoss;
        ctx.fillRect(-15, -18, 5, 14);
        ctx.fillRect(-5, -14, 6, 22);
        ctx.fillRect(8, -10, 4, 18);
        ctx.fillRect(18, -4, 5, 12);

        // ── 9. THE MOUTH & SLANTED EYE ──
        if (this.tongueLength > 0) {
            // Mouth drops open wide during attack [1]
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(-54, 8, 16, 12, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Closed heavy scowling mouth slit [1]
            ctx.fillStyle = cShadow;
            ctx.fillRect(-62, 5, 34, 4);
        }

        // Slanted yellow biological eye [1]
        ctx.fillStyle = cBelly; // pale iris
        ctx.beginPath();
        ctx.ellipse(-42, -20, 5, 3.5, -Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cShadow; // horizontal slit pupil
        ctx.fillRect(-46, -21, 8, 2);

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