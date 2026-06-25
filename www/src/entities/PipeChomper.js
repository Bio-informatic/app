export class PipeChomper {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30; // Will be placed inside pipes
        this.height = 40;
        this.type = 'pipe_chomper';
        this.dead = false;

        this.baseY = y;
        this.timer = Math.random() * 2000;
        this.state = 'WAITING'; // WAITING, RISING, FALLING
        this.vy = 0;
    }

    update(deltaTime, level) {
        if (this.dead) return;

        if (this.state === 'WAITING') {
            this.timer += deltaTime;
            if (this.timer > 2000) {
                this.state = 'RISING';
                this.timer = 0;
                this.vy = -3;
            }
        } else if (this.state === 'RISING') {
            this.y += this.vy;
            if (this.y < this.baseY - 50) {
                this.state = 'FALLING';
                this.vy = 3;
            }
        } else if (this.state === 'FALLING') {
            this.y += this.vy;
            if (this.y >= this.baseY) {
                this.y = this.baseY;
                this.state = 'WAITING';
                this.vy = 0;
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#FF0055';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Jaws (open wide when rising)
        ctx.fillStyle = '#FFF';
        if (this.state === 'RISING') {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width/2, this.y + 10);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + 10);
            ctx.lineTo(this.x + this.width/2, this.y);
            ctx.lineTo(this.x + this.width, this.y + 10);
            ctx.fill();
        }

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 20, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 22, this.y + 20, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
