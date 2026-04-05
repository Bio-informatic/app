export class Level {
    constructor(levelIndex) {
        console.log("Level_v2 created, index:", levelIndex);
        this.tileSize = 32;
        this.tiles = [];
        this.entities = [];
        this.levelIndex = levelIndex;
        this.unstableTiles = [];

        let map = [];

        if (levelIndex === 1 || levelIndex === 2) {
            // ── Mechanics-driven Procedural Map Generation ────────────────
            const ROWS = 24;
            const COLS = 150;
            const TS = this.tileSize;
            const skyChar = '.';
            const groundChar = '1';
            const brickChar = '2';
            const mysteryChar = '3';
            const finishChar = 'F';
            const unstableChar = 'U';

            const MAX_GAP_TILES = 5;
            const GROUND_Y = ROWS - 3; // Surface of the ground is row 21

            // 1. Initialize empty map
            for (let y = 0; y < ROWS; y++) {
                map[y] = skyChar.repeat(COLS).split('');
            }

            // 2. Place continuous ground
            for (let y = GROUND_Y; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    map[y][x] = groundChar;
                }
            }

            // 3. Finish flag at far right
            const finishX = COLS - 1;
            for (let y = 4; y < ROWS; y++) {
                map[y][finishX] = finishChar;
            }

            let curX = 12; // Start placing obstacles here
            let mysteryCount = 0;
            const targetMysteryCount = levelIndex === 1 ? 7 : 15;

            while (curX < COLS - 25) {
                const roll = Math.random();
                
                // Level 2 Pits & Unstable Ground
                if (roll < 0.25 && levelIndex === 2) {
                    const gapWidth = Math.floor(Math.random() * (MAX_GAP_TILES - 2)) + 2;
                    for (let y = GROUND_Y; y < ROWS; y++) {
                        for (let gx = 0; gx < gapWidth; gx++) {
                            if (curX + gx < finishX - 3) {
                                map[y][curX + gx] = (Math.random() > 0.5) ? unstableChar : skyChar;
                            }
                        }
                    }
                    curX += gapWidth + 2;
                    continue; // Leave the pit open, move on to next section
                }
                
                // ── Generate Bricks ─────────────────────────
                let width = Math.floor(Math.random() * 4) + 3; // 3 to 6 wide
                if (curX + width >= finishX - 3) width = finishX - 3 - curX;
                if (width < 1) break;

                let hasGroundBricks = Math.random() < 0.5;
                let hasFloatingBricks = Math.random() < 0.5;
                if (!hasGroundBricks && !hasFloatingBricks) {
                    if (Math.random() < 0.5) hasGroundBricks = true;
                    else hasFloatingBricks = true;
                }

                let baseTopY = GROUND_Y;
                
                // Brick Rule 1: Attached to ground, 1 to 3 blocks high
                if (hasGroundBricks) {
                    const height = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 blocks tall
                    baseTopY = GROUND_Y - height;
                    
                    for (let px = 0; px < width; px++) {
                        for (let py = baseTopY; py < GROUND_Y; py++) {
                            map[py][curX + px] = brickChar;
                        }
                    }
                }
                
                // Brick Rule 2: Floating bricks, 1 to 3 blocks above ground OR above ground bricks
                let floatingY = -1;
                if (hasFloatingBricks) {
                    const space = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 blocks of clearance
                    floatingY = baseTopY - space - 1; 
                    
                    if (floatingY > 1) { // Bounds check
                        for (let px = 0; px < width; px++) {
                            map[floatingY][curX + px] = brickChar;
                        }
                        
                        // Insert mystery boxes directly in the floating platform sometimes
                        if (mysteryCount < targetMysteryCount && Math.random() < 0.4) {
                            const mbX = Math.floor(Math.random() * width);
                            map[floatingY][curX + mbX] = mysteryChar;
                            mysteryCount++;
                        }
                    }
                }

                // Place floating mystery boxes high above the structures
                const highestY = hasFloatingBricks ? floatingY : baseTopY;
                if (mysteryCount < targetMysteryCount && Math.random() < 0.4) {
                    const hoverSpace = Math.floor(Math.random() * 2) + 2; // 2 or 3 empty tiles above
                    const boxY = highestY - hoverSpace;
                    const mbX = Math.floor(Math.random() * width);
                    
                    if (boxY > 1 && map[boxY][curX + mbX] === skyChar) {
                        map[boxY][curX + mbX] = mysteryChar;
                        mysteryCount++;
                    }
                }
                
                // Maybe a Goomba
                if (Math.random() > 0.6) {
                    // Goomba on the lowest solid level to easily get in Mario's way
                    const goombaY = hasGroundBricks ? baseTopY - 1 : GROUND_Y - 1;
                    if (goombaY > 1) {
                        this.entities.push({ x: (curX + 1) * TS, y: goombaY * TS, type: 'goomba' });
                    }
                }
                
                curX += width + Math.floor(Math.random() * 3) + 2; // Advance cursor
            }

            // 4. Guaranteed Mystery Boxes
            for (let attempts = 0; attempts < 100 && mysteryCount < targetMysteryCount; attempts++) {
                const rx = Math.floor(Math.random() * (COLS - 40)) + 15;
                const space = Math.floor(Math.random() * 3) + 2; 
                const boxY = GROUND_Y - space - 1; 
                
                if (boxY > 1 && map[boxY][rx] === skyChar) {
                    // To make it punchable, also add a quick 1-thick brick float if it's too high?
                    // According to rule 2, we can just sprinkle independent floating brick here
                    const hasSupport = Math.random() > 0.5;
                    if (hasSupport) {
                        map[boxY][rx] = brickChar; // Re-roll random empty spot into brick
                        map[boxY - 3][rx] = mysteryChar; // Box 3 tiles above it
                    } else {
                        map[boxY][rx] = mysteryChar;
                    }
                    mysteryCount++;
                }
            }

            // 5. Convert map from 2D array of chars back to strings
            for (let y = 0; y < ROWS; y++) {
                map[y] = map[y].join('');
            }
        }

        this.rows = map.length;
        this.cols = map[0].length;
        this.width = this.cols * this.tileSize;
        this.height = this.rows * this.tileSize;

        // Pre-compute finish columns for flag-pole drawing
        this.finishCols = new Map(); // col → {topRow, bottomRow}

        for (let y = 0; y < this.rows; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.cols; x++) {
                const char = map[y][x];
                if (char === '1') this.tiles[y][x] = 1;
                else if (char === '2') this.tiles[y][x] = 2;
                else if (char === '3') this.tiles[y][x] = 3;
                else if (char === '4') this.tiles[y][x] = 4;
                else if (char === 'U') this.tiles[y][x] = 7;
                else if (char === 'F') {
                    this.tiles[y][x] = 5;
                    if (!this.finishCols.has(x)) {
                        this.finishCols.set(x, { topRow: y, bottomRow: y });
                    } else {
                        this.finishCols.get(x).bottomRow = y;
                    }
                } else {
                    this.tiles[y][x] = 0;
                    if (char === 'G') {
                        this.entities.push({ x: x * this.tileSize, y: y * this.tileSize, type: 'goomba' });
                    }
                }
            }
        }
    }

    // ── Theme palettes ─────────────────────────────────────────────
    getTheme() {
        if (this.levelIndex === 2) {
            return {
                sky: '#1a0505',
                ground: '#5C1A1A',
                groundStroke: '#3A0E0E',
                brick: '#8B2500',
                brickStroke: '#5C1A00',
                mystery: '#FFD700',
                pipe: '#4A0000',
                unstable: '#8B5C00',
                unstableStroke: '#5C3D00',
                cloud: 'rgba(200, 50, 50, 0.20)',
            };
        }
        // Level 1 – classic Mario
        return {
            sky: '#5C94FC',   // Mario NES sky blue
            ground: '#8B4513',
            groundStroke: '#5C2D0A',
            brick: '#C84010',   // classic NES brick red-orange
            brickStroke: '#7A2800',
            mystery: '#F8A800',   // classic gold
            pipe: '#008000',
            cloud: 'rgba(255,255,255,0.85)',
        };
    }

    // ── Draw ────────────────────────────────────────────────────────
    draw(ctx) {
        const t = this.getTheme();
        const ts = this.tileSize;

        // Sky background (covers entire level width)
        ctx.fillStyle = t.sky;
        ctx.fillRect(0, 0, this.width, this.height);

        // Classic puffy clouds (pixel-block style)
        ctx.fillStyle = t.cloud;
        for (let i = 0; i < 20; i++) {
            const cx = i * 350 + 60;
            ctx.fillRect(cx, 70, 64, 16);
            ctx.fillRect(cx + 16, 54, 32, 16);
            ctx.fillRect(cx + 8, 86, 48, 16);
        }

        // ── Tiles ──
        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[y].length; x++) {
                const tile = this.tiles[y][x];
                if (tile === 0) continue;

                const px = x * ts;
                const py = y * ts;

                switch (tile) {
                    case 1: // Ground
                        ctx.fillStyle = t.ground;
                        ctx.fillRect(px, py, ts, ts);
                        ctx.strokeStyle = t.groundStroke;
                        ctx.lineWidth = 1;
                        ctx.strokeRect(px, py, ts, ts);
                        break;

                    case 2: // Brick — classic NES style with stagger lines
                        ctx.fillStyle = t.brick;
                        ctx.fillRect(px, py, ts, ts);
                        ctx.strokeStyle = t.brickStroke;
                        ctx.lineWidth = 1;
                        ctx.strokeRect(px, py, ts, ts);
                        // Mortar lines
                        ctx.strokeStyle = t.brickStroke;
                        ctx.beginPath();
                        ctx.moveTo(px, py + ts / 2); ctx.lineTo(px + ts, py + ts / 2); // horizontal
                        ctx.moveTo(px + ts / 2, py); ctx.lineTo(px + ts / 2, py + ts / 2); // vert top
                        ctx.moveTo(px, py + ts / 2); ctx.lineTo(px, py + ts);              // vert bot left
                        ctx.stroke();
                        break;

                    case 3: // Mystery box — gold, NO label (all identical)
                        // Outer fill
                        ctx.fillStyle = t.mystery;
                        ctx.fillRect(px, py, ts, ts);
                        // Dark border
                        ctx.strokeStyle = '#7A5C00';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(px + 1, py + 1, ts - 2, ts - 2);
                        ctx.lineWidth = 1;
                        // Pixel shine top-left
                        ctx.fillStyle = 'rgba(255,255,200,0.6)';
                        ctx.fillRect(px + 4, py + 4, 6, 2);
                        ctx.fillRect(px + 4, py + 6, 2, 4);
                        // Pixel dot pattern (subtle)
                        ctx.fillStyle = 'rgba(200,130,0,0.35)';
                        ctx.fillRect(px + 14, py + 12, 4, 4);
                        ctx.fillRect(px + 20, py + 18, 4, 4);
                        break;

                    case 8: // Used mystery box — depressed gray
                        ctx.fillStyle = '#606060';
                        ctx.fillRect(px, py, ts, ts);
                        ctx.strokeStyle = '#303030';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(px, py, ts, ts);
                        ctx.strokeRect(px + 3, py + 3, ts - 6, ts - 6);
                        break;

                    case 4: // Pipe
                        ctx.fillStyle = t.pipe;
                        ctx.fillRect(px, py, ts, ts);
                        ctx.fillStyle = this.levelIndex === 2 ? '#7A1111' : '#00AA00';
                        ctx.fillRect(px + 2, py, 4, ts);
                        ctx.strokeStyle = '#000';
                        ctx.strokeRect(px, py, ts, ts);
                        break;

                    case 5: // Finish — thin pole section (flag in post-pass)
                        ctx.fillStyle = 'rgba(100,80,0,0.15)';
                        ctx.fillRect(px, py, ts, ts);
                        ctx.fillStyle = '#7A5C00';
                        ctx.fillRect(px + ts / 2 - 3, py, 6, ts);
                        break;

                    case 7: { // Unstable tile
                        const shaking = this.unstableTiles.find(u => u.x === x && u.y === y);
                        const ox = shaking ? (Math.random() - 0.5) * 4 : 0;
                        const oy = shaking ? (Math.random() - 0.5) * 2 : 0;
                        ctx.fillStyle = t.unstable || '#8B5C00';
                        ctx.fillRect(px + ox, py + oy, ts, ts);
                        ctx.strokeStyle = t.unstableStroke || '#5C3D00';
                        ctx.strokeRect(px + ox, py + oy, ts, ts);
                        ctx.strokeStyle = '#3A2200';
                        ctx.beginPath();
                        ctx.moveTo(px + ox + 6, py + oy + 4);
                        ctx.lineTo(px + ox + 16, py + oy + 16);
                        ctx.lineTo(px + ox + 26, py + oy + 10);
                        ctx.moveTo(px + ox + 10, py + oy + 20);
                        ctx.lineTo(px + ox + 22, py + oy + 28);
                        ctx.stroke();
                        break;
                    }
                }
            }
        }

        // ── Flag Pole + Kurdistan Flag (post-pass) ──────────────────
        this.finishCols.forEach(({ topRow, bottomRow }, col) => {
            const poleX = col * ts + ts / 2;              // centre of finish column
            const poleTop = topRow * ts;
            const poleBot = (bottomRow + 1) * ts;

            // Pole
            ctx.fillStyle = '#7A5C00';
            ctx.fillRect(poleX - 3, poleTop, 6, poleBot - poleTop);

            // Ball on top
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(poleX, poleTop + 6, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#7A5C00';
            ctx.lineWidth = 1;
            ctx.stroke();

            // ── Kurdistan Flag (LEFT of pole, fully in view) ──────────
            // 80 × 48 px block-art flag
            const FW = 80;  // flag width
            const FH = 48;  // flag height
            const fx = poleX - 6 - FW;   // right edge = 6px left of pole
            const fy = poleTop + 2;       // top of flag

            const SH = FH / 3;  // stripe height = 16 px

            // ── Stripes (pixel blocks, 8px wide columns) ──
            // Draw stripes using 8×8 pixel blocks for a pixelated look
            const PSIZE = 8;
            const stripeColors = ['#D8232A', '#FFFFFF', '#007A3D'];
            for (let si = 0; si < 3; si++) {
                ctx.fillStyle = stripeColors[si];
                for (let bx = 0; bx < FW; bx += PSIZE) {
                    const bw = Math.min(PSIZE, FW - bx);
                    ctx.fillRect(fx + bx, fy + si * SH, bw, SH);
                }
            }

            // Flag border
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 2;
            ctx.strokeRect(fx, fy, FW, FH);
            ctx.lineWidth = 1;

            // ── Pixelated Sun (centre of white stripe) ────────────────
            const sunX = fx + FW / 2;
            const sunY = fy + FH / 2;
            const INNER_R = 7;
            const OUTER_R = 13;
            const RAY_COUNT = 21;

            // Rays first — drawn as thick pixel lines
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            for (let i = 0; i < RAY_COUNT; i++) {
                const angle = (i * 2 * Math.PI / RAY_COUNT) - Math.PI / 2;
                const x1 = sunX + Math.cos(angle) * (INNER_R + 1);
                const y1 = sunY + Math.sin(angle) * (INNER_R + 1);
                const x2 = sunX + Math.cos(angle) * OUTER_R;
                const y2 = sunY + Math.sin(angle) * OUTER_R;
                // Pixel-snap to nearest 2px grid
                ctx.beginPath();
                ctx.moveTo(Math.round(x1 / 2) * 2, Math.round(y1 / 2) * 2);
                ctx.lineTo(Math.round(x2 / 2) * 2, Math.round(y2 / 2) * 2);
                ctx.stroke();
            }

            // Sun circle (filled, pixelated by using fillRect blocks)
            ctx.fillStyle = '#FFD700';
            for (let dy = -INNER_R; dy <= INNER_R; dy += 2) {
                for (let dx = -INNER_R; dx <= INNER_R; dx += 2) {
                    if (dx * dx + dy * dy <= INNER_R * INNER_R) {
                        ctx.fillRect(sunX + dx, sunY + dy, 2, 2);
                    }
                }
            }
        });
    }
}
