export class WhiteWalkerGoomba {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = -1;
        this.vy = 0;
        this.gravity = 0.5;
        this.type = 'whitewalker_goomba';
        this.dead = false;
        this.squished = false;
        this.squishTimer = 0;
    }

    update(deltaTime, level) {
        if (this.squished) {
            this.squishTimer += deltaTime;
            if (this.squishTimer > 500) {
                this.dead = true;
            }
            return;
        }

        this.vy += this.gravity;
        this.x += this.vx;

        // Collision X
        let cx = Math.floor((this.x + (this.vx > 0 ? this.width : 0)) / level.tileSize);
        let cy1 = Math.floor(this.y / level.tileSize);
        let cy2 = Math.floor((this.y + this.height - 1) / level.tileSize);

        if (level.tiles[cy1] && (level.tiles[cy1][cx] > 0 && level.tiles[cy1][cx] !== 5) || 
            (level.tiles[cy2] && level.tiles[cy2][cx] > 0 && level.tiles[cy2][cx] !== 5)) {
            this.vx *= -1;
            this.x += this.vx * 2;
        }

        // Collision Y
        this.y += this.vy;
        let groundY = Math.floor((this.y + this.height) / level.tileSize);
        let gx1 = Math.floor(this.x / level.tileSize);
        let gx2 = Math.floor((this.x + this.width - 1) / level.tileSize);

        if (level.tiles[groundY] && (level.tiles[groundY][gx1] > 0 && level.tiles[groundY][gx1] !== 5 || level.tiles[groundY][gx2] > 0 && level.tiles[groundY][gx2] !== 5)) {
            this.y = groundY * level.tileSize - this.height;
            this.vy = 0;
        }
    }

    draw(ctx) {
        if (this.squished) {
            ctx.fillStyle = '#A0C0E0';
            ctx.fillRect(this.x, this.y + 16, 32, 16);
            return;
        }
        
        ctx.fillStyle = '#D0F0FF'; // Frosty white/blue body
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Eyes (Glowing Blue)
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 10, 4, 0, Math.PI * 2);
        ctx.arc(this.x + 24, this.y + 10, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Ice crown/spikes
        ctx.fillStyle = '#A0D0FF';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 8, this.y - 8);
        ctx.lineTo(this.x + 16, this.y);
        ctx.lineTo(this.x + 24, this.y - 8);
        ctx.lineTo(this.x + 32, this.y);
        ctx.fill();
    }
}
