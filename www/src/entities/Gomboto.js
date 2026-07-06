import { Electromba } from './Electromba.js';

export class Gomboto {
    constructor(x, y, entitiesArray) {
        this.x = x;
        this.y = y;
        this.width = 96;   // OPTIMIZATION: Scaled up to make Gomboto a giant central computing core
        this.height = 96;
        this.hp = 10;
        this.type = 'gomboto';
        this.dead = false;
        this.absorbed = false;
        this.hacked = false;
        this.claimReady = false;
        
        this.entities = entitiesArray;
        this.lastAttack = performance.now();
        this.vx = -1;
    }

    isHacked() {
        return this.hacked;
    }

    takeDamage(amount = 1) {
        if (this.absorbed) return;
        this.hp -= amount;
        if (this.hp <= 0) {
            this.dead = true;
        }
    }

    update(deltaTime, level) {
        if (this.absorbed || this.claimReady) {
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
                this.entities.push(new Electromba(spawnX, this.y + 40, this.entities));
            }
        }
    }

    draw(ctx) {
        // Theme Colors
        const hacked = this.absorbed || this.isHacked();
        const baseColor = hacked ? '#1E1A1A' : '#3E3535';     // dark steel / rusty base
        const accentColor = hacked ? '#00FF66' : '#FF3A3A';    // cyan-green vs warning-red seams
        const eyeColor = hacked ? '#00FF66' : '#FF3A3A';       // screen primary color
        
        const now = performance.now();
        const hover = Math.sin(now / 200) * 2.2;
        const scan = (Math.sin(now / 260) + 1) * 0.5;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.save();
        ctx.translate(0, hover);

        // Cybernetic outer aura glow when hacked
        if (hacked) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00FF44';
        }

        ctx.save();
        ctx.translate(cx, cy);

        // ── 1. MAIN METALLIC MAINframe SPHERE ──
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.fill();

        // Mechanical plates subdivision seams
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-42, 0); ctx.lineTo(42, 0);
        ctx.moveTo(0, -42); ctx.lineTo(0, 42);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.stroke();

        // Exposed motherboard panels
        ctx.fillStyle = '#0F170F';
        ctx.fillRect(-30, -30, 14, 10);
        ctx.fillRect(16, 20, 14, 10);
        ctx.fillStyle = '#18B22A'; // bright circuit board green
        ctx.fillRect(-28, -28, 10, 6);
        ctx.fillRect(18, 22, 10, 6);

        // ── 2. UPGRADE'S TECHNOPATHIC LIQUID GEL OVERLAY (Only if hacked) ──
        if (hacked) {
            ctx.shadowBlur = 0; // Disable shadow briefly for gel drawing
            ctx.fillStyle = '#00FF44';
            ctx.beginPath();
            ctx.moveTo(0, -42);
            ctx.bezierCurveTo(24, -42, 42, -22, 42, 0);
            ctx.bezierCurveTo(42, 22, 24, 42, 0, 42);
            ctx.bezierCurveTo(15, 20, 5, 0, 0, -42); // organic wave interior boundary
            ctx.closePath();
            ctx.fill();

            // Organic circuit lines running inside the upgrade gel
            ctx.strokeStyle = '#052A05';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(10, -20); ctx.bezierCurveTo(25, -25, 20, -5, 30, -2);
            ctx.moveTo(15, 15); ctx.bezierCurveTo(28, 5, 22, 25, 32, 22);
            ctx.stroke();
        }

        // ── 3. CENTRAL CRT MONITOR / SCREEN ──
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1A1822';
        ctx.fillRect(-24, -20, 48, 40);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(-24, -20, 48, 40);

        if (!hacked) {
            // Normal State: Angry red error screen
            ctx.fillStyle = '#3A0204';
            ctx.fillRect(-22, -18, 44, 36);

            // Red angry pixelated eyes & eyebrows
            ctx.strokeStyle = '#FF3333';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(-12, -8); ctx.lineTo(-4, -5);
            ctx.moveTo(12, -8); ctx.lineTo(4, -5);
            ctx.moveTo(-10, 10); ctx.quadraticCurveTo(0, 4, 10, 10);
            ctx.stroke();
            ctx.fillStyle = '#FF3333';
            ctx.fillRect(-10, -3, 4, 4);
            ctx.fillRect(6, -3, 4, 4);

            // Blinking binary background noise
            ctx.fillStyle = 'rgba(255, 51, 51, 0.4)';
            ctx.font = '6px monospace';
            ctx.fillText('01101', -20, -10);
            ctx.fillText('10101', 10, 8);

            // Red warning text
            ctx.fillStyle = '#FF3333';
            ctx.font = 'bold 5.5px ui-monospace, monospace';
            ctx.fillText('CORE ERROR 404', -20, 15);
        } else {
            // Hacked State: Happy green system clear screen
            ctx.fillStyle = '#001A05';
            ctx.fillRect(-22, -18, 44, 36);

            // Green smiling face :)
            ctx.strokeStyle = '#39FF14';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(-10, 5); ctx.quadraticCurveTo(0, 12, 10, 5);
            ctx.stroke();
            ctx.fillStyle = '#39FF14';
            ctx.beginPath();
            ctx.arc(-8, -4, 2.2, 0, Math.PI * 2);
            ctx.arc(8, -4, 2.2, 0, Math.PI * 2);
            ctx.fill();

            // Falling matrix code
            ctx.fillStyle = 'rgba(57, 255, 20, 0.4)';
            ctx.font = '6px monospace';
            ctx.fillText('11010', -20, -10);
            ctx.fillText('00110', 10, -2);

            // Core hacked stable message
            ctx.fillStyle = '#39FF14';
            ctx.font = 'bold 4.5px ui-monospace, monospace';
            ctx.fillText('CORE HACKED - STABLE', -21, 15);
        }

        // ── 4. FOUR ORBITING MECHANICAL EYEBOTS (SECURITY DRONES) ──
        const droneCount = 4;
        const orbitRadius = 64 + Math.sin(now / 150) * 3;
        for (let i = 0; i < droneCount; i++) {
            const angle = (now / 1200) + (i * Math.PI * 2 / droneCount);
            const dx = Math.cos(angle) * orbitRadius;
            const dy = Math.sin(angle) * orbitRadius;
            
            ctx.save();
            ctx.translate(dx, dy);
            
            // Eyebot body
            ctx.fillStyle = baseColor;
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Central glowing lens (hacked/cyan vs warning/red)
            ctx.fillStyle = eyeColor;
            ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
            
            // Mini robotic leg appendages
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(-8, 0); ctx.lineTo(-12, 5);
            ctx.moveTo(8, 0); ctx.lineTo(12, 5);
            ctx.moveTo(0, 8); ctx.lineTo(0, 11);
            ctx.stroke();
            
            ctx.restore();
        }

        ctx.restore();

        // ── 5. STATE UI OVERLAYS (Always un-flipped) ──
        if (this.claimReady && !this.absorbed) {
            ctx.fillStyle = '#B6FFD1';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('PRESS F TO ACQUIRE', this.x + this.width / 2, this.y - 24);
            ctx.textAlign = 'left';
        }
        
        ctx.restore();
    }
}