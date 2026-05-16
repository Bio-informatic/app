export class EvilGhostfreak {
    constructor(x, y, entitiesArray) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 96;
        this.type = 'evil_ghostfreak';
        this.dead = false;
        this.entities = entitiesArray;
        this.health = 100;
        this.speed = 2;
        this.floatPhase = 0;
        this.target = null;
        this.acquired = false;
        this.invulnerableTimer = 0;
        this.hitsTaken = 0;
    }

    update(deltaTime, level, marioX, marioY) {
        if (this.dead) return;
        if (this.acquired) {
            this.vx = 0;
            this.vy = 0;
            return;
        }

        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer--;
            this.vx *= 0.95;
            this.vy *= 0.95;
        } else {
            // Roam and look for Ben 10
            const dx = marioX - (this.x + this.width / 2);
            const dy = marioY - (this.y + this.height / 2);
            const dist = Math.hypot(dx, dy);

            // Always roam the whole level looking for Ben 10
            if (dist > 5) {
                this.vx = (dx / dist) * this.speed;
                this.vy = (dy / dist) * this.speed;
            } else {
                this.vx = 0;
                this.vy = 0;
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        this.floatPhase += 0.05;
        this.y += Math.sin(this.floatPhase) * 2;
    }

    draw(ctx) {
        if (this.invulnerableTimer > 0 && Math.floor(performance.now() / 100) % 2 === 0) return;
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        if (this.vx > 0) ctx.scale(-1, 1);

        const floatOffset = Math.sin(this.floatPhase * 2) * 4;
        ctx.translate(0, floatOffset);

        if (this.acquired) {
            // Violent shaking
            ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
            
            // Dark possession aura
            const pulse = Math.abs(Math.sin(performance.now() / 100)) * 15;
            ctx.beginPath();
            ctx.arc(0, 0, 70 + pulse, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
            ctx.fill();
        } else {
            // Power ready aura (Red/Purple)
            const pulse = Math.abs(Math.sin(performance.now() / 150)) * 12;
            const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 60 + pulse);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.5)'); // Red core
            gradient.addColorStop(0.5, 'rgba(128, 0, 128, 0.3)'); // Purple mid
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)'); // Fades out
            
            ctx.beginPath();
            ctx.arc(0, 0, 60 + pulse, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Lightning tendrils
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            for(let i=0; i<4; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                const angle = (performance.now() / 80) + (i * Math.PI / 2);
                ctx.lineTo(Math.cos(angle) * (50 + pulse), Math.sin(angle) * (50 + pulse));
                ctx.stroke();
            }
        }

        const purple = '#9585a6';
        const darkGrey = '#111111';
        const skullGrey = '#d3d3d3';
        
        const tailWag = Math.sin(performance.now() / 150) * 10;

        // Tail (Black and white stripes)
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-10, 30);
        ctx.bezierCurveTo(-30 + tailWag, 80, 50 + tailWag, 100, 40 + tailWag, 50); // curling tail
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Back Spikes
        ctx.fillStyle = '#b0b0b0';
        ctx.beginPath();
        ctx.moveTo(15, -25); ctx.lineTo(30, -30); ctx.lineTo(20, -15);
        ctx.moveTo(20, -10); ctx.lineTo(35, -10); ctx.lineTo(25, -2);
        ctx.moveTo(25, 5); ctx.lineTo(40, 10); ctx.lineTo(25, 12);
        ctx.fill();

        // Main Body (Purplish grey)
        ctx.fillStyle = purple;
        ctx.beginPath();
        ctx.moveTo(-5, -40);
        ctx.quadraticCurveTo(20, -45, 25, -20); // back
        ctx.quadraticCurveTo(30, 20, 15, 30); // lower back
        ctx.quadraticCurveTo(-15, 45, -20, 20); // bottom front
        ctx.quadraticCurveTo(-15, -10, -5, -40); // chest
        ctx.fill();
        
        // Skull mask (Chest / shoulder)
        ctx.fillStyle = skullGrey;
        ctx.beginPath();
        ctx.arc(-8, -25, 12, 0, Math.PI * 2);
        ctx.fill();
        // Mask horn
        ctx.beginPath();
        ctx.moveTo(-18, -20); ctx.lineTo(-25, -35); ctx.lineTo(-12, -32); ctx.fill();

        // Inverted Green Eye on mask
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-10, -25, 5, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.acquired) {
            // Bleeding red possessed eye
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(-10, -25, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Possession energy lines running through the mask
            ctx.strokeStyle = '#800080';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-10, -25); ctx.lineTo(5, -15);
            ctx.moveTo(-10, -25); ctx.lineTo(-25, -5);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#4CAF50'; // Green
            ctx.beginPath();
            ctx.arc(-10, -25, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // True Head (Top protruding)
        ctx.fillStyle = skullGrey;
        ctx.beginPath();
        ctx.moveTo(-5, -35);
        ctx.lineTo(-15, -60); // jaw up
        ctx.lineTo(0, -65); // top head
        ctx.lineTo(5, -40); // neck back
        ctx.fill();
        
        // Mouth open
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(-8, -55, 4, 8, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        // Teeth
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-10, -60, 2, 3);
        ctx.fillRect(-6, -52, 2, 3);

        // Omnitrix symbol
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(5, -5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.moveTo(1, -9); ctx.lineTo(9, -9); ctx.lineTo(5, -5); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(1, -1); ctx.lineTo(9, -1); ctx.lineTo(5, -5); ctx.fill();

        // Black lines connecting to Omnitrix
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-2, -25); ctx.lineTo(4, -11);
        ctx.moveTo(25, -20); ctx.lineTo(10, -7);
        ctx.moveTo(-15, 20); ctx.lineTo(3, -1);
        ctx.stroke();

        // Arms and Claws
        // Left Arm (Back)
        ctx.strokeStyle = purple;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(20, -20);
        ctx.lineTo(40, 10); // elbow
        ctx.lineTo(25, 30); // wrist
        ctx.stroke();
        
        // Left Claws
        ctx.fillStyle = darkGrey;
        ctx.beginPath();
        ctx.moveTo(25, 30); ctx.lineTo(30, 50); ctx.lineTo(22, 35); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(25, 30); ctx.lineTo(15, 55); ctx.lineTo(18, 35); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(25, 30); ctx.lineTo(5, 45); ctx.lineTo(15, 30); ctx.fill();

        // Right Arm (Front)
        ctx.strokeStyle = purple;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(-5, -10);
        ctx.lineTo(-30, 0); // elbow
        ctx.lineTo(-45, -5); // wrist
        ctx.stroke();
        
        // Right Claws
        ctx.fillStyle = darkGrey;
        ctx.beginPath();
        ctx.moveTo(-45, -5); ctx.lineTo(-65, -10); ctx.lineTo(-50, -2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-45, -5); ctx.lineTo(-60, 15); ctx.lineTo(-45, 5); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-45, -5); ctx.lineTo(-50, 25); ctx.lineTo(-40, 5); ctx.fill();

        ctx.restore();
    }
}
