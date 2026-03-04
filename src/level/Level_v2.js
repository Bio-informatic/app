export class Level {
    constructor(levelIndex) {
        console.log("Creation of Level_v2 with index:", levelIndex);
        this.tileSize = 32;
        this.tiles = [];
        this.entities = [];
        this.levelIndex = levelIndex;
        this.unstableTiles = []; // tracks {x, y, timer} for crumbling tiles

        let map = [];

        if (levelIndex === 1) {
            // Level 1: The Beginning (Short, Tutorial-like)
            // Ends with finding the Watch (Tile 3) and then the exit.
            // Legend: 1=Ground, 2=Brick, 3=Mystery(Watch), 4=Pipe, 5=Finish
            // 6 = Message Trigger (Chosen Guard)
            map = [
                "................................................................................",
                "................................................................................",
                "................................................................................",
                "................................................................................",
                "................................................................................",
                "................................................................................",
                "..........................................3.....................................",
                "...............................................................................F",
                "........................................22222..................................F",
                "...............................................................................F",
                "...................222.........................................................F",
                "...............................................................................F",
                "11111111111111111111111111111111111111111111111111111111111111111111111111111111",
                "11111111111111111111111111111111111111111111111111111111111111111111111111111111",
                "11111111111111111111111111111111111111111111111111111111111111111111111111111111"
            ];
            // Height is shorter? Just keep 600px height standard.
        } else {
            // Build map with padEnd to guarantee all rows are exactly 100 chars.
            // Tile legend: 1=Ground, 2=Brick, 3=Mystery, F=Finish(last col), G=Goomba
            // Layout (15 rows total):
            //   Rows 0-7  : sky
            //   Row 8     : mystery boxes (3) aligned above platforms
            //   Rows 9-10 : empty gap (2 tiles between mystery and platform)
            //   Row 11    : brick platforms (2) + Goombas (G)
            //   Rows 12-14: ground (1) with 2 gaps each
            const W = 99; // content width (last char = F)
            const sky = () => '.'.repeat(W) + 'F';
            const row8 = '.........3.............................3.............................3.............................';
            const row11 = '.........22222...G.................22222...G.................22222...G.......................';
            const row12 = '111111111.....11111111111111111111.....11111111111111111111.....111111111111111111111111111111';

            map = [
                sky(),      // 0
                sky(),      // 1
                sky(),      // 2
                sky(),      // 3
                sky(),      // 4
                sky(),      // 5
                sky(),      // 6
                sky(),      // 7
                row8.padEnd(W, '.') + 'F',   // 8 ← mystery boxes
                sky(),      // 9  ← gap
                sky(),      // 10 ← gap
                row11.padEnd(W, '.') + 'F',  // 11 ← platforms + Goombas
                row12.padEnd(W, '1') + 'F',  // 12 ← ground
                row12.padEnd(W, '1') + 'F',  // 13
                row12.padEnd(W, '1') + 'F',  // 14
            ];
        }

        this.rows = map.length;
        this.cols = map[0].length;
        this.width = this.cols * this.tileSize;
        this.height = this.rows * this.tileSize;

        for (let y = 0; y < this.rows; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.cols; x++) {
                const char = map[y][x];
                if (char === '1') this.tiles[y][x] = 1;
                else if (char === '2') this.tiles[y][x] = 2;
                else if (char === '3') this.tiles[y][x] = 3;
                else if (char === '4') this.tiles[y][x] = 4;
                else if (char === 'U') this.tiles[y][x] = 7; // Unstable ground
                else if (char === 'F') this.tiles[y][x] = 5; // Finish
                else {
                    this.tiles[y][x] = 0;
                    if (char === 'G') {
                        this.entities.push({ x: x * this.tileSize, y: y * this.tileSize, type: 'goomba' });
                    }
                }
            }
        }
    }

    // Color palettes per level
    getTheme() {
        if (this.levelIndex === 2) {
            // Four Arms Theme: dark crimson sky, deep red/maroon blocks
            return {
                ground: '#5C1A1A',    // Dark maroon
                groundStroke: '#3A0E0E',
                brick: '#8B2500',     // Deep red-orange
                brickStroke: '#5C1A00',
                mystery: '#FFD700',
                pipe: '#4A0000',      // Dark blood red pipe
                finish: '#FF3333',    // Red finish
                unstable: '#8B5C00',  // Cracked amber
                unstableStroke: '#5C3D00',
                cloud: 'rgba(200, 50, 50, 0.25)', // Faint red clouds
                cloudHighlight: 'rgba(255, 80, 80, 0.15)',
            };
        }
        // Level 1: Classic Mario
        return {
            ground: '#8B4513',
            groundStroke: '#5C2D0A',
            brick: '#CD853F',
            brickStroke: '#8B5E3C',
            mystery: '#FFD700',
            pipe: '#008000',
            finish: '#00FF00',
            cloud: 'rgba(255, 255, 255, 0.6)',
            cloudHighlight: 'rgba(255, 255, 255, 0.4)',
        };
    }

    draw(ctx) {
        const t = this.getTheme();

        // Draw Clouds
        ctx.fillStyle = t.cloud;
        for (let i = 0; i < 20; i++) {
            ctx.fillRect(i * 300, 100, 100, 40);
            ctx.fillRect(i * 300 + 40, 80, 60, 40);
            ctx.fillRect(i * 300 + 20, 120, 80, 20);
        }

        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[y].length; x++) {
                const tile = this.tiles[y][x];
                if (tile === 0) continue;

                const px = x * this.tileSize;
                const py = y * this.tileSize;

                if (tile === 1) {
                    ctx.fillStyle = t.ground;
                    ctx.fillRect(px, py, this.tileSize, this.tileSize);
                    ctx.strokeStyle = t.groundStroke;
                    ctx.strokeRect(px, py, this.tileSize, this.tileSize);
                } else if (tile === 2) {
                    ctx.fillStyle = t.brick;
                    ctx.fillRect(px, py, this.tileSize, this.tileSize);
                    ctx.strokeStyle = t.brickStroke;
                    ctx.strokeRect(px, py, this.tileSize, this.tileSize);
                    // Brick pattern lines
                    ctx.strokeRect(px, py, this.tileSize / 2, this.tileSize / 2);
                } else if (tile === 3) {
                    ctx.fillStyle = t.mystery;
                    ctx.fillRect(px, py, this.tileSize, this.tileSize);
                    ctx.strokeStyle = '#B8860B';
                    ctx.strokeRect(px, py, this.tileSize, this.tileSize);
                    ctx.fillStyle = 'black';
                    ctx.font = 'bold 20px sans-serif';
                    ctx.fillText('?', px + 10, py + 25);
                } else if (tile === 4) {
                    ctx.fillStyle = t.pipe;
                    ctx.fillRect(px, py, this.tileSize, this.tileSize);
                    // Pipe highlight
                    ctx.fillStyle = this.levelIndex === 2 ? '#7A1111' : '#00AA00';
                    ctx.fillRect(px + 2, py, 4, this.tileSize);
                    ctx.strokeStyle = '#000';
                    ctx.strokeRect(px, py, this.tileSize, this.tileSize);
                } else if (tile === 5) {
                    ctx.fillStyle = t.finish;
                    ctx.fillRect(px, py, this.tileSize, this.tileSize);
                    ctx.strokeStyle = '#000';
                    ctx.strokeRect(px, py, this.tileSize, this.tileSize);
                } else if (tile === 7) {
                    // Unstable tile — amber with cracks, shakes when about to crumble
                    const shaking = this.unstableTiles.find(u => u.x === x && u.y === y);
                    let ox = 0, oy = 0;
                    if (shaking) {
                        ox = (Math.random() - 0.5) * 4;
                        oy = (Math.random() - 0.5) * 2;
                    }
                    ctx.fillStyle = t.unstable || '#8B5C00';
                    ctx.fillRect(px + ox, py + oy, this.tileSize, this.tileSize);
                    ctx.strokeStyle = t.unstableStroke || '#5C3D00';
                    ctx.strokeRect(px + ox, py + oy, this.tileSize, this.tileSize);
                    // Crack lines
                    ctx.strokeStyle = '#3A2200';
                    ctx.beginPath();
                    ctx.moveTo(px + ox + 6, py + oy + 4);
                    ctx.lineTo(px + ox + 16, py + oy + 16);
                    ctx.lineTo(px + ox + 26, py + oy + 10);
                    ctx.moveTo(px + ox + 10, py + oy + 20);
                    ctx.lineTo(px + ox + 22, py + oy + 28);
                    ctx.stroke();
                }
            }
        }
    }
}
