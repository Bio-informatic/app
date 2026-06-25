export class DragonglassDiamond {
    constructor(x, y, entitiesArray) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 96;
        this.hp = 10;
        this.maxHp = 10;
        this.type = 'dragonglass_diamond';
        this.dead = false;
        this.entities = entitiesArray;
        
        // Jiggle effect when hit
        this.shakeTimer = 0;
    }

    update(deltaTime, level) {
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
        }
    }
    
    takeDamage() {
        if (this.dead) return;
        this.hp--;
        this.shakeTimer = 200; // 200ms of shake
        if (this.hp <= 0) {
            this.dead = true;
            // Spawn dragonglass item exactly where it stood
            import('./DragonglassItem.js').then(module => {
                const Item = module.DragonglassItem;
                if (this.entities) {
                    this.entities.push(new Item(this.x + this.width/2 - 16, this.y + this.height - 32));
                }
            });
        }
    }

    draw(ctx) {
        let drawX = this.x;
        let drawY = this.y;
        
        // Shake effect
        if (this.shakeTimer > 0) {
            drawX += (Math.random() - 0.5) * 8;
            drawY += (Math.random() - 0.5) * 8;
        }
        
        // Draw Large Diamond
        ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(drawX + this.width / 2, drawY); // Top tip
        ctx.lineTo(drawX + this.width, drawY + this.height / 3); // Right wide
        ctx.lineTo(drawX + this.width / 2, drawY + this.height); // Bottom tip
        ctx.lineTo(drawX, drawY + this.height / 3); // Left wide
        ctx.fill();
        
        // Core (Dragonglass inside)
        ctx.fillStyle = '#1A1A1A'; // Obsidian black
        ctx.beginPath();
        ctx.moveTo(drawX + this.width / 2, drawY + this.height / 3);
        ctx.lineTo(drawX + this.width / 2 + 10, drawY + this.height / 2);
        ctx.lineTo(drawX + this.width / 2, drawY + this.height * 0.7);
        ctx.lineTo(drawX + this.width / 2 - 10, drawY + this.height / 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(drawX + this.width / 2, drawY);
        ctx.lineTo(drawX + this.width / 2 + 10, drawY + this.height / 3);
        ctx.lineTo(drawX + this.width / 2, drawY + this.height / 3 + 10);
        ctx.fill();
        
        // HP bar above it
        const barW = 40;
        const barH = 6;
        const bx = drawX + this.width/2 - barW/2;
        const by = drawY - 15;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(bx, by, barW, barH);
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(bx, by, barW * (this.hp / this.maxHp), barH);
    }
}
