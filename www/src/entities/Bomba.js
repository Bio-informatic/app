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
        
        // Inner Goomba details (hitbox bounds matched to the new pilot compartment)
        this.goombaWidth = 40;
        this.goombaHeight = 35;
        this.goombaX = this.x + 60;
        this.goombaY = this.y + 65;
        this.goombaDead = false;

        // Pathing and orientation states [2]
        this.facingRight = true;
        this.vx = 0;
    }

    update(deltaTime, level, userX, userY) {
        if (this.dead) return;
        if (userX === undefined) return; // Skip generic entity loop
        
        const t = performance.now();
        const hover = Math.sin(t / 260) * 2.5;

        // Keep the Goomba hitbox synchronized with the animated physical chest compartment [2]
        this.goombaX = this.x + 60;
        this.goombaY = this.y + 65 + hover;

        // ── 1. ROBOTIC WALKING & COLLISION PATHING ──
        let targetVx = 0;
        const dist = Math.abs((this.x + this.width/2) - userX);
        
        if (dist < 450) { // Player is in the boss zone [1]
            let dir = (userX < this.x + this.width/2) ? -1 : 1;
            this.facingRight = (dir === 1);
            targetVx = dir * 0.7; // Slow, heavy robotic stomp speed [1, 2]
        }

        this.vx = targetVx;
        let nextX = this.x + this.vx;

        // Simple tile-collision check to prevent Bomba from walking through arena walls [2]
        let ts = level.tileSize;
        let sideColX = (this.vx > 0) ? (nextX + this.width - 24) : (nextX + 24);
        let gridX = Math.floor(sideColX / ts);
        let ySamples = [this.y + 40, this.y + 80, this.y + 120];
        let hitWall = false;

        for (let i = 0; i < ySamples.length; i++) {
            let gy = Math.floor(ySamples[i] / ts);
            if (level.tiles[gy] && level.tiles[gy][gridX] !== 0 && level.tiles[gy][gridX] !== 9 && level.tiles[gy][gridX] !== 10 && level.tiles[gy][gridX] !== 11) {
                hitWall = true;
                break;
            }
        }

        if (!hitWall) {
            this.x = nextX;
        } else {
            this.vx = 0; // Stop walking if hitting a wall [2]
        }

        // ── 2. BOMB LAUNCHING ──
        if (this.hasShooter) {
            if (dist < 400) {
                this.bombTimer += deltaTime;
                if (this.bombTimer > 3000) {
                    this.bombTimer = 0;
                    
                    // Shoot bomb at user [1]
                    let dx = userX - (this.x + this.width/2);
                    let dy = userY - (this.y + 10);
                    let len = Math.sqrt(dx*dx + dy*dy);

                    // Project the muzzle position dynamically based on direction [2]
                    const muzzleX = this.facingRight ? (this.x + 99) : (this.x + 61);
                    const muzzleY = this.y + hover - 46;

                    this.bombs.push({
                        x: muzzleX,
                        y: muzzleY,
                        vx: (dx/len) * 3,
                        vy: (dy/len) * 3,
                        width: 20,
                        height: 20,
                        dead: false
                    });
                }
            }
        }
        
        // Update bombs [1]
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            let b = this.bombs[i];
            b.x += b.vx;
            b.y += b.vy;
            // Homes lightly [1]
            let dx = userX - b.x;
            let dy = userY - b.y;
            let len = Math.sqrt(dx*dx + dy*dy);
            b.vx += (dx/len) * 0.05;
            b.vy += (dy/len) * 0.05;
            
            // Limit speed [1]
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
        if (this.dead) return;

        const t = performance.now();
        const hover = Math.sin(t / 260) * 2.5;
        const pulse = 0.65 + 0.35 * Math.sin(t / 180);

        // Heavy alternating leg bobbing cycle when walking [2]
        const walkCycle = (this.vx !== 0) ? Math.sin(t / 100) * 6 : 0;

        // Core Steampunk Color Palettes [2]
        const cBrass = '#D9A426';       // Gold / Brass base
        const cBrassLight = '#F2C84B';  // Highlight brass
        const cBrassDark = '#8C6510';   // Shadow brass
        const cRust = '#993D26';        // Rust-Red base
        const cRustLight = '#B5563D';   // Highlight red
        const cRustDark = '#662414';    // Shadow red
        const cIron = '#4C4F54';        // Dark iron base
        const cIronLight = '#6A6D72';   // Highlight steel
        const cIronDark = '#2A2D30';    // Shadow steel

        ctx.save();

        // ── DYNAMIC HORIZONTAL FLIPPING (Faces the Player) ──
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        if (!this.facingRight) {
            ctx.scale(-1, 1); // Flips all drawing coordinates horizontally [2]
        }
        ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

        // ── 1. ACTIVE STEAM PARTICLES (CHIMNEY & VENTS) ──
        for (let s = 0; s < 3; s++) {
            const sT = (t / 12 + s * 100) % 50;
            const sx = this.x + 55 - sT * 0.4;
            const sy = this.y + 12 + hover - sT;
            const sa = 1 - (sT / 50);
            ctx.fillStyle = `rgba(215, 205, 195, ${sa * 0.45})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 5 + sT * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }

        // ── 2. BACK CHIMNEY & EXHAUSTS ──
        ctx.fillStyle = cIronDark;
        ctx.fillRect(this.x + 52, this.y + 12 + hover, 8, 20); // main stack
        ctx.fillStyle = cIron;
        ctx.fillRect(this.x + 48, this.y + 10 + hover, 16, 4);  // stack rim

        // ── 3. SHINY SHOULDER JOINT GLOBES & BACKPLATES ──
        ctx.fillStyle = cBrassDark;
        ctx.beginPath(); ctx.arc(this.x + 36, this.y + 55 + hover, 24, 0, Math.PI * 2); ctx.fill(); // Left
        ctx.beginPath(); ctx.arc(this.x + 124, this.y + 55 + hover, 24, 0, Math.PI * 2); ctx.fill(); // Right
        ctx.fillStyle = cBrass;
        ctx.beginPath(); ctx.arc(this.x + 36, this.y + 55 + hover, 20, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(this.x + 124, this.y + 55 + hover, 20, 0, Math.PI * 2); ctx.fill();

        // Shoulder exhaust vents
        ctx.fillStyle = cIronDark;
        ctx.fillRect(this.x + 28, this.y + 32 + hover, 16, 6);
        ctx.fillRect(this.x + 116, this.y + 32 + hover, 16, 6);
        ctx.fillStyle = `rgba(255, 180, 0, ${pulse})`; // Glowing orange vents
        ctx.fillRect(this.x + 32, this.y + 34 + hover, 8, 3);
        ctx.fillRect(this.x + 120, this.y + 34 + hover, 8, 3);

        // ── 4. LEGS, JOINT GEARS & BOOTS ──
        // Thigh joints (Dark cylindrical steel)
        ctx.fillStyle = cIronDark;
        ctx.fillRect(this.x + 46, this.y + 115 + hover + walkCycle * 0.4, 14, 18);
        ctx.fillRect(this.x + 100, this.y + 115 + hover - walkCycle * 0.4, 14, 18);

        // Golden Shin Guards / Greaves (Alternates Y offset during walking!) [2]
        ctx.fillStyle = cBrassDark;
        ctx.fillRect(this.x + 36, this.y + 130 + hover + walkCycle, 24, 22);
        ctx.fillRect(this.x + 100, this.y + 130 + hover - walkCycle, 24, 22);
        ctx.fillStyle = cBrass;
        ctx.fillRect(this.x + 38, this.y + 130 + hover + walkCycle, 20, 20);
        ctx.fillRect(this.x + 102, this.y + 130 + hover - walkCycle, 20, 20);

        // Heavy red boots (with steel toe cap)
        ctx.fillStyle = cRustDark;
        ctx.fillRect(this.x + 32, this.y + 150 + hover + walkCycle, 32, 10);
        ctx.fillRect(this.x + 96, this.y + 150 + hover - walkCycle, 32, 10);
        ctx.fillStyle = cRust;
        ctx.fillRect(this.x + 34, this.y + 150 + hover + walkCycle, 28, 8);
        ctx.fillRect(this.x + 98, this.y + 150 + hover - walkCycle, 28, 8);
        ctx.fillStyle = cIron; // Steel toe caps
        ctx.fillRect(this.x + 32, this.y + 155 + hover + walkCycle, 10, 5);
        ctx.fillRect(this.x + 118, this.y + 155 + hover - walkCycle, 10, 5);

        // ── 5. LEFT ARM: HEAVY MECHANICAL FIST ──
        ctx.fillStyle = cRustDark;
        ctx.fillRect(this.x + 16, this.y + 68 + hover, 16, 12); // bicep
        ctx.fillStyle = cIron;
        ctx.fillRect(this.x + 8, this.y + 78 + hover, 20, 16);  // forearm
        
        // Fist glowing charge panel indicators
        ctx.fillStyle = `rgba(255, 140, 0, ${pulse})`;
        ctx.fillRect(this.x + 12, this.y + 81 + hover, 12, 3);
        ctx.fillRect(this.x + 12, this.y + 87 + hover, 12, 3);

        // Golden knuckled fist
        ctx.fillStyle = cBrassDark;
        ctx.fillRect(this.x + 4, this.y + 94 + hover, 24, 22);
        ctx.fillStyle = cBrass;
        ctx.fillRect(this.x + 6, this.y + 94 + hover, 20, 18);

        // ── 6. RIGHT ARM: BLASTER BARREL ──
        ctx.fillStyle = cRustDark;
        ctx.fillRect(this.x + 128, this.y + 68 + hover, 16, 12); // bicep
        ctx.fillStyle = cIron;
        ctx.fillRect(this.x + 128, this.y + 78 + hover, 24, 26);  // heavy cannon cylinder
        ctx.fillStyle = cIronDark;
        ctx.fillRect(this.x + 132, this.y + 104 + hover, 16, 8);  // barrel tip

        // ── 7. MAIN ROUNDED CYBER TORSO (RUST RED) ──
        ctx.fillStyle = cRustDark;
        ctx.beginPath();
        ctx.arc(this.x + 80, this.y + 80 + hover, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = cRust;
        ctx.beginPath();
        ctx.arc(this.x + 80, this.y + 80 + hover, 45, 0, Math.PI * 2);
        ctx.fill();

        // Torso Rivets / Steampunk studs
        ctx.fillStyle = cBrassLight;
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI / 3) + Math.PI * 0.15;
            const rx = this.x + 80 + Math.cos(angle) * 38;
            const ry = this.y + 80 + hover + Math.sin(angle) * 38;
            ctx.beginPath(); ctx.arc(rx, ry, 3, 0, Math.PI * 2); ctx.fill();
        }

        // ── 8. CENTRAL PILOT COMPARTMENT (HATCH DOORS) ──
        // Access hatch frame (Brass/Gold)
        ctx.fillStyle = cBrassDark;
        ctx.fillRect(this.x + 52, this.y + 52 + hover, 56, 56);
        ctx.fillStyle = cBrass;
        ctx.fillRect(this.x + 55, this.y + 55 + hover, 50, 50);

        // "PILOT" Header Label above the bay
        ctx.fillStyle = cBrassDark;
        ctx.font = 'bold 9px ui-monospace, monospace';
        ctx.fillText('PILOT', this.x + 65, this.y + 50 + hover);

        // Inner dark cockpit bay
        ctx.fillStyle = cIronDark;
        ctx.fillRect(this.x + 59, this.y + 59 + hover, 42, 42);

        if (!this.goombaDead && this.windowOpen) {
            const gX = this.x + 80;
            const gY = this.y + 82 + hover;
            
            // UNIQUE PILOT GOOMBA: Leather Pilot Cap and Cyber-Goggles [2]
            ctx.fillStyle = '#5C2C16'; // Cap Base
            ctx.beginPath();
            ctx.arc(gX, gY - 2, 17, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(gX - 17, gY - 4, 4, 10); // Cap earflaps
            ctx.fillRect(gX + 13, gY - 4, 4, 10);

            ctx.fillStyle = '#D2B48C'; // Goomba Face tan underside
            ctx.beginPath();
            ctx.ellipse(gX, gY + 4, 13, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Steampunk Circular Brass Goggle Frames [2]
            ctx.strokeStyle = cBrass;
            ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(gX - 7, gY - 2, 5, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(gX + 7, gY - 2, 5, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(gX - 2, gY - 2); ctx.lineTo(gX + 2, gY - 2); ctx.stroke(); // Bridge

            // Glowing green lenses (Omnitrix infection/hack themed!) [2]
            ctx.fillStyle = '#39FF14'; 
            ctx.shadowColor = '#39FF14';
            ctx.shadowBlur = 6;
            ctx.beginPath(); ctx.arc(gX - 7, gY - 2, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(gX + 7, gY - 2, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0; // Reset glow

            // Sparkle reflection overlay on lenses
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(gX - 8.5, gY - 4, 1.5, 1.5);
            ctx.fillRect(gX + 5.5, gY - 4, 1.5, 1.5);

            // Snarling fangs
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.moveTo(gX - 5, gY + 8); ctx.lineTo(gX - 3, gY + 4); ctx.lineTo(gX - 1, gY + 8);
            ctx.moveTo(gX + 5, gY + 8); ctx.lineTo(gX + 3, gY + 4); ctx.lineTo(gX + 1, gY + 8);
            ctx.fill();

            // Dual control joysticks
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#222';
            ctx.beginPath();
            ctx.moveTo(gX - 11, gY + 12); ctx.lineTo(gX - 14, gY + 6);
            ctx.moveTo(gX + 11, gY + 12); ctx.lineTo(gX + 14, gY + 6);
            ctx.stroke();
            ctx.fillStyle = '#FF3A3A'; // Glowing joystick heads
            ctx.beginPath();
            ctx.arc(gX - 14, gY + 6, 2.5, 0, Math.PI * 2);
            ctx.arc(gX + 14, gY + 6, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Access hatch door behavior (Hinges downward when open)
        if (this.windowOpen) {
            ctx.fillStyle = cBrassDark;
            ctx.fillRect(this.x + 55, this.y + 104 + hover, 50, 6);
            ctx.fillStyle = cBrass;
            ctx.fillRect(this.x + 57, this.y + 104 + hover, 46, 3);
        } else {
            // Closed door plate protecting the pilot compartment
            ctx.fillStyle = cBrassDark;
            ctx.fillRect(this.x + 59, this.y + 59 + hover, 42, 42);
            ctx.fillStyle = cBrass;
            ctx.fillRect(this.x + 61, this.y + 61 + hover, 38, 38);
        }

        // ── 9. TOP SHOOTER: HEAVY ROTATING HOWITZER CANNON ──
        if (this.hasShooter) {
            const turretY = this.y - 12 + hover + Math.sin(t / 180) * 1.5;
            const tx = this.x + 80;

            // Heavy mounting brackets (Dark iron) [2]
            ctx.fillStyle = cIronDark;
            ctx.fillRect(tx - 24, turretY + 14, 48, 14); // wide base plate
            ctx.fillStyle = cIron;
            ctx.fillRect(tx - 18, turretY + 6, 8, 10);  // left support bracket
            ctx.fillRect(tx + 10, turretY + 6, 8, 10);  // right support bracket

            // Brass Pivot Cog / Hinge Joint [2]
            ctx.fillStyle = cBrassDark;
            ctx.beginPath(); ctx.arc(tx, turretY + 12, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = cBrass;
            ctx.beginPath(); ctx.arc(tx, turretY + 12, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = cIronDark;
            ctx.beginPath(); ctx.arc(tx, turretY + 12, 3, 0, Math.PI * 2); ctx.fill();

            // Structurally Tilting Cannon Barrel Assembly (-22.5 Degrees) [2]
            ctx.save();
            ctx.translate(tx, turretY + 12);
            ctx.rotate(-Math.PI / 8); 

            // Red-brown heavy breech chamber [2]
            ctx.fillStyle = cRustDark;
            ctx.fillRect(-12, -26, 24, 26);
            ctx.fillStyle = cRust;
            ctx.fillRect(-10, -26, 20, 24);

            // Grey steel main barrel pipe [2]
            ctx.fillStyle = cIron;
            ctx.fillRect(-12, -42, 24, 16);
            ctx.fillStyle = cIronLight;
            ctx.fillRect(-10, -42, 4, 16); // reflection shine highlight

            // Flared golden safety muzzle ring [2]
            ctx.fillStyle = '#F2C84B'; // yellow safety color [2]
            ctx.fillRect(-14, -50, 28, 8);

            // Hazard stripes (Black diagonal bands) [2]
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(-12, -44); ctx.lineTo(-7, -50);
            ctx.moveTo(-4, -44); ctx.lineTo(1, -50);
            ctx.moveTo(4, -44); ctx.lineTo(9, -50);
            ctx.stroke();

            // Muzzle mouth opening
            ctx.fillStyle = cIronDark;
            ctx.fillRect(-9, -51, 18, 2);

            // Energy buildup charging glow (Simulates heat rising inside the launcher) [2]
            const fireBuildGlow = Math.min(1.0, (this.bombTimer / 3000));
            if (this.bombTimer > 1500) {
                ctx.fillStyle = `rgba(255, 120, 0, ${fireBuildGlow * pulse})`;
                ctx.fillRect(-7, -51, 14, 2);
            }

            ctx.restore();
        }

        ctx.restore();

        // ── 10. BOMBS (Only drawn here if they aren't shot yet, active bombs drawn relative to world) ──
        for (const b of this.bombs) {
            const bt = performance.now() / 100;
            ctx.fillStyle = cIronDark;
            ctx.beginPath();
            ctx.arc(b.x + b.width/2, b.y + b.height/2, b.width/2, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = cIronLight;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Flashing safety fuse warning beacon
            ctx.fillStyle = `rgba(255, 40, 40, ${0.5 + 0.5 * Math.sin(bt + b.x * 0.05)})`;
            ctx.fillRect(b.x + b.width/2 - 2, b.y - 4, 4, 8);
        }
    }
}