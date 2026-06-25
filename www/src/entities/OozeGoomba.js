export class OozeGoomba {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = 'ooze_goomba';
        this.dead = false;
        
        this.vx = -1.5; // slow
        this.vy = 0;
        this.grounded = false;
    }

    update(deltaTime, level) {
        if (this.dead) return;

        this.jumpTimer = (this.jumpTimer || 0) + deltaTime;
        if (this.grounded && this.jumpTimer > 2000) {
            this.vy = -10; // jump upwards
            this.vx = (Math.random() < 0.5 ? -2 : 2); // move left or right while springing
            this.grounded = false;
            this.jumpTimer = 0;
        }

        this.vy += 0.5; // gravity
        
        // Only move horizontally if not grounded (hopping)
        if (!this.grounded) {
             this.x += this.vx;
        } else {
             this.vx *= 0.8; // friction
             this.x += this.vx;
        }
        this.y += this.vy;

        // Collision with map
        const ts = level.tileSize;
        const colL = Math.floor(this.x / ts);
        const colR = Math.floor((this.x + this.width) / ts);
        const row = Math.floor((this.y + this.height) / ts);
        
        if (level.tiles[row]) {
            const tL = level.tiles[row][colL];
            const tR = level.tiles[row][colR];
            if ((tL !== 0 && tL !== 9) || (tR !== 0 && tR !== 9)) { // treat lava(9) as empty for goomba
                this.y = row * ts - this.height;
                this.vy = 0;
                this.grounded = true;
            } else {
                this.grounded = false;
            }
        }
        
        // Wall bump
        const checkRow = Math.floor((this.y + this.height/2) / ts);
        if (this.vx > 0 && level.tiles[checkRow] && level.tiles[checkRow][colR] !== 0) {
            this.vx = -this.vx;
        } else if (this.vx < 0 && level.tiles[checkRow] && level.tiles[checkRow][colL] !== 0) {
            this.vx = -this.vx;
        }

        // Bounds
        if (this.y > level.height) {
            this.dead = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#113311'; // dark alien theme body
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#88FF00'; // alien bright green glow
        ctx.fillRect(this.x, this.y + 16, this.width, 16); // glowing bottom

        // 3 alien eyes
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.x + 4, this.y + 6, 6, 6);
        ctx.fillRect(this.x + 13, this.y + 4, 6, 6);
        ctx.fillRect(this.x + 22, this.y + 6, 6, 6);
        
        // pupils
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 6, this.y + 8, 2, 2);
        ctx.fillRect(this.x + 15, this.y + 6, 2, 2);
        ctx.fillRect(this.x + 24, this.y + 8, 2, 2);
    }
}
