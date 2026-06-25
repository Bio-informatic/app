export class Level {
    constructor(levelIndex) {
        console.log("Level_v2 created, index:", levelIndex);
        this.tileSize = 32;
        this.tiles = [];
        this.entities = [];
        this.levelIndex = levelIndex;
        this.unstableTiles = [];
        this.omnitrixFixed = false;

        let map = [];

        // LEVEL GENERATION
        if (levelIndex >= 1 && levelIndex <= 11) {
            const ROWS = 20;
            const COLS = levelIndex >= 5 ? 200 : (levelIndex === 4 ? 250 : (levelIndex === 3 ? 200 : 150));
            const TS = this.tileSize;
            const skyChar = '.';
            const groundChar = '1';
            const brickChar = '2';
            const mysteryChar = '3';
            const finishChar = 'F';
            const unstableChar = 'U';
            const lavaChar = 'L';
            const wireChar = 'W'; // tile 12
            const eBlockChar = 'E'; // tile 13
            const treeBrickChar = 'T'; // tile 14

            const MAX_GAP_TILES = 5;
            const GROUND_Y = ROWS - 6;

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

            // 3. Finish flag at far right (Level 1 only if no boss)
            const finishX = COLS - 1;
            if (levelIndex === 1) {
                for (let y = 4; y < ROWS; y++) {
                    map[y][finishX] = finishChar;
                }
            }

            let curX = 12;
            let mysteryCount = 0;
            const targetMysteryCount = levelIndex === 1 ? 7 : (levelIndex === 4 ? 5 : (levelIndex === 3 ? 10 : 15));

            // Level 2: Boss arena at the end (last 30 columns)
            // Level 3: Boss arena at the end (last 20 columns)
            // Level 4: Turtumba slow zone at the end (last 52 columns)
            let bossZoneStart = COLS;
            if (levelIndex === 2) bossZoneStart = COLS - 30;
            else if (levelIndex === 3) bossZoneStart = COLS - 22;
            else if (levelIndex === 4) bossZoneStart = COLS - 52;
            else if (levelIndex === 5) bossZoneStart = COLS - 40;
            else if (levelIndex === 6) bossZoneStart = COLS - 40;
            else if (levelIndex === 7) bossZoneStart = COLS - 45;
            else if (levelIndex === 8) bossZoneStart = COLS - 50;
            else if (levelIndex === 9) bossZoneStart = COLS - 40;
            else if (levelIndex === 10) bossZoneStart = COLS - 50;
            else if (levelIndex === 11) bossZoneStart = COLS - 50;

            // Store slow zone bounds for game.js
            this.slowZoneStart = levelIndex === 4 ? bossZoneStart * TS : -1;

            while (curX < bossZoneStart - 10) {
                const roll = Math.random();

                // Pits — Level 2: unstable/gap, Level 3: LAVA
                if (roll < 0.25 && levelIndex >= 2) {
                    const gapWidth = Math.floor(Math.random() * (MAX_GAP_TILES - 2)) + 2;
                    for (let y = GROUND_Y; y < ROWS; y++) {
                        for (let gx = 0; gx < gapWidth; gx++) {
                            if (curX + gx < bossZoneStart - 3) {
                                if (levelIndex === 6) {
                                    map[y][curX + gx] = wireChar;
                                } else if (levelIndex === 5) {
                                    map[y][curX + gx] = lavaChar; // Represents slime!
                                } else if (levelIndex === 3) {
                                    map[y][curX + gx] = lavaChar;
                                } else {
                                    map[y][curX + gx] = (Math.random() > 0.5) ? unstableChar : skyChar;
                                }
                            }
                        }
                    }
                    curX += gapWidth + 2;
                    continue;
                }

                // ── Generate Bricks ─────────────────────────
                let width = Math.floor(Math.random() * 4) + 3;
                if (curX + width >= bossZoneStart - 3) width = bossZoneStart - 3 - curX;
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
                    const height = Math.floor(Math.random() * 3) + 1;
                    baseTopY = GROUND_Y - height;
                    for (let px = 0; px < width; px++) {
                        for (let py = baseTopY; py < GROUND_Y; py++) {
                            if (levelIndex === 10) {
                                map[py][curX + px] = 'E';
                            } else {
                                map[py][curX + px] = levelIndex === 6 ? eBlockChar : brickChar;
                            }
                        }
                    }
                }

                // Brick Rule 2: Floating bricks, 1 to 3 blocks above ground OR ground bricks
                let floatingY = -1;
                if (hasFloatingBricks) {
                    // Enforce a minimum vertical gap of 2 blocks between structures
                    // Previously allowed 1-3; now 2-3 blocks high gap
                    const space = Math.floor(Math.random() * 2) + 2;
                    floatingY = baseTopY - space - 1;
                    if (floatingY > 1) {
                        for (let px = 0; px < width; px++) {
                            map[floatingY][curX + px] = levelIndex === 6 ? eBlockChar : brickChar;
                        }
                        if (mysteryCount < targetMysteryCount && Math.random() < 0.4) {
                            const mbX = Math.floor(Math.random() * width);
                            map[floatingY][curX + mbX] = mysteryChar;
                            mysteryCount++;
                        }
                    }
                }

                // Floating mystery boxes above structures
                const highestY = hasFloatingBricks && floatingY > 0 ? floatingY : baseTopY;
                if (mysteryCount < targetMysteryCount && Math.random() < 0.4) {
                    const hoverSpace = Math.floor(Math.random() * 2) + 2;
                    const boxY = highestY - hoverSpace;
                    const mbX = Math.floor(Math.random() * width);
                    if (boxY > 1 && map[boxY][curX + mbX] === skyChar) {
                        map[boxY][curX + mbX] = mysteryChar;
                        mysteryCount++;
                    }
                }

                // Enemy placement
                if (Math.random() > 0.6) {
                    const goombaY = hasGroundBricks ? baseTopY - 1 : GROUND_Y - 1;
                    if (goombaY > 2 && map[goombaY][curX] === skyChar) {
                        let goombaType = 'goomba';
                        if (levelIndex === 11) goombaType = 'ghost_goomba';
                        else if (levelIndex === 10) goombaType = 'omnitrix_virus';
                        else if (levelIndex === 9) goombaType = 'jellyfish_goomba';
                        else if (levelIndex === 8) goombaType = 'whitewalker_goomba';
                        else if (levelIndex === 7) goombaType = 'goomba'; // vanishing goombas — managed in draw
                        else if (levelIndex === 6) goombaType = 'electromba';
                        else if (levelIndex === 5) goombaType = 'ooze_goomba';
                        else if (levelIndex === 3) goombaType = 'lava_goomba';
                        else if (levelIndex === 4) goombaType = 'shield_drone';

                        this.entities.push({
                            x: (curX + Math.floor(width / 2)) * TS,
                            y: (goombaY) * TS,
                            type: goombaType
                        });
                    }
                }

                curX += width + Math.floor(Math.random() * 3) + 2;
            }

            // Guaranteed mystery boxes
            for (let attempts = 0; attempts < 100 && mysteryCount < targetMysteryCount; attempts++) {
                const rx = Math.floor(Math.random() * (bossZoneStart - 40)) + 15;
                const space = Math.floor(Math.random() * 3) + 2;
                const boxY = GROUND_Y - space - 1;
                if (boxY > 1 && map[boxY][rx] === skyChar) {
                    const hasSupport = Math.random() > 0.5;
                    if (hasSupport) {
                        map[boxY][rx] = levelIndex === 6 ? eBlockChar : brickChar;
                        if (boxY - 3 > 1) map[boxY - 3][rx] = mysteryChar;
                    } else {
                        map[boxY][rx] = mysteryChar;
                    }
                    mysteryCount++;
                }
            }


            // ── Level 2 Boss Arena ──────────────────────────────────
            if (levelIndex === 2) {
                // Clear boss zone ground (flat, solid)
                for (let y = GROUND_Y; y < ROWS; y++) {
                    for (let x = bossZoneStart; x < COLS; x++) {
                        map[y][x] = groundChar;
                    }
                }
                // Walls on left & right of arena
                for (let y = GROUND_Y - 6; y < GROUND_Y; y++) {
                    map[y][bossZoneStart] = brickChar; // left wall
                    map[y][COLS - 1] = brickChar;      // right wall
                }
                // Place boss marker
                this.entities.push({
                    x: (bossZoneStart + 15) * TS,
                    y: (GROUND_Y - 5) * TS,
                    type: 'bomba'
                });
            }

            // ── Level 3 Boss Arena ──────────────────────────────────
            if (levelIndex === 3) {
                // Clear boss zone ground (flat, solid)
                for (let y = GROUND_Y; y < ROWS; y++) {
                    for (let x = bossZoneStart; x < COLS; x++) {
                        map[y][x] = groundChar;
                    }
                }
                // Walls on left & right of arena
                for (let y = GROUND_Y - 6; y < GROUND_Y; y++) {
                    map[y][bossZoneStart] = brickChar; // left wall
                    map[y][COLS - 1] = brickChar;      // right wall
                }
                // Place boss marker (handled by game.js)
                this.entities.push({
                    x: (bossZoneStart + 10) * TS,
                    y: (GROUND_Y - 3) * TS,
                    type: 'goombaba'
                });
            }

            // ── Level 4: Speed Panels & Electric Fences & Laser Turrets ────
            if (levelIndex === 4) {
                const speedPanelChar = 'S';
                const efenceChar = 'E';

                // Place speed boost panels on ground randomly (avoid boss zone)
                for (let i = 0; i < 15; i++) {
                    const sx = Math.floor(Math.random() * (bossZoneStart - 40)) + 20;
                    const panelW = Math.floor(Math.random() * 4) + 3;
                    for (let px = 0; px < panelW; px++) {
                        if (sx + px < bossZoneStart - 5 && map[GROUND_Y - 1][sx + px] === skyChar) {
                            map[GROUND_Y - 1][sx + px] = speedPanelChar;
                        }
                    }
                }

                // Place electric fences (avoid boss zone)
                for (let i = 0; i < 10; i++) {
                    const fx = Math.floor(Math.random() * (bossZoneStart - 40)) + 25;
                    if (map[GROUND_Y - 1][fx] === skyChar) {
                        for (let fy = GROUND_Y - 3; fy < GROUND_Y; fy++) {
                            map[fy][fx] = efenceChar;
                        }
                    }
                }

                // Place laser turrets on some brick walls
                let turretCount = 0;
                for (let y = 2; y < GROUND_Y - 1 && turretCount < 6; y++) {
                    for (let x = 15; x < bossZoneStart - 10 && turretCount < 6; x++) {
                        if (map[y][x] === brickChar && map[y][x + 1] === skyChar && Math.random() < 0.03) {
                            this.entities.push({
                                x: (x + 1) * TS,
                                y: y * TS,
                                type: 'laser_turret',
                                facingLeft: false
                            });
                            turretCount++;
                        }
                    }
                }

                // ── Turtumba Boss Arena (last 50 blocks) ──────
                // Clear the arena — flat ground
                for (let y = GROUND_Y; y < ROWS; y++) {
                    for (let x = bossZoneStart; x < COLS; x++) {
                        map[y][x] = groundChar;
                    }
                }
                // Clear sky above arena
                for (let y = 0; y < GROUND_Y; y++) {
                    for (let x = bossZoneStart; x < COLS; x++) {
                        map[y][x] = skyChar;
                    }
                }
                // Walls on sides of arena
                for (let y = GROUND_Y - 6; y < GROUND_Y; y++) {
                    map[y][bossZoneStart] = brickChar;
                    map[y][COLS - 1] = brickChar;
                }
                // Place Turtumba boss in center of arena
                this.entities.push({
                    x: (bossZoneStart + 25) * TS,
                    y: (GROUND_Y - 2) * TS,
                    type: 'turtumba'
                });
            }

            // ── Level 5 Boss Arena ──────────────────────────────────
            if (levelIndex === 5) {
                const minTopY = 1;
                const maxTopY = GROUND_Y - 5;
                const skyStartX = 18;
                const skyEndX = bossZoneStart - 18;
                const verticalBands = 5;
                const bandStep = Math.max(2, Math.floor((maxTopY - minTopY) / (verticalBands - 1)));

                for (let band = 0; band < verticalBands; band++) {
                    const baseTopY = Math.min(maxTopY, minTopY + band * bandStep);
                    const xOffset = (band % 2) * 3;

                    for (let columnX = skyStartX + xOffset; columnX < skyEndX; columnX += 9) {
                        if (Math.random() < 0.2) continue;

                        const brickHeight = Math.floor(Math.random() * 4) + 1;
                        const jitter = Math.floor(Math.random() * 3) - 1;
                        const topY = Math.max(minTopY, Math.min(maxTopY, baseTopY + jitter));

                        for (let py = 0; py < brickHeight; py++) {
                            const y = topY + py;
                            if (y < GROUND_Y - 2 && map[y][columnX] === skyChar) {
                                map[y][columnX] = brickChar;
                            }
                        }
                    }
                }

                // Large poison pond
                for (let y = GROUND_Y; y < ROWS; y++) {
                    for (let x = bossZoneStart; x < COLS; x++) {
                        map[y][x] = lavaChar; // poison slime
                    }
                }
                
                // Walls on sides of arena
                for (let y = GROUND_Y - 6; y < GROUND_Y; y++) {
                    map[y][bossZoneStart] = brickChar;
                    map[y][COLS - 1] = brickChar;
                }

                // Place Gomrog boss marker (floating brick logic handled in Gomrog.js)
                this.entities.push({
                    x: (bossZoneStart + 20) * TS,
                    y: (GROUND_Y - 3) * TS,
                    type: 'gomrog'
                });
            }

            // ── Level 6 Boss Arena ──────────────────────────────────
            if (levelIndex === 6) {
                for (let y = GROUND_Y; y < ROWS; y++) {
                    for (let x = bossZoneStart; x < COLS; x++) {
                        map[y][x] = groundChar;
                    }
                }
                for (let y = GROUND_Y - 6; y < GROUND_Y; y++) {
                    map[y][bossZoneStart] = eBlockChar;
                    map[y][COLS - 1] = eBlockChar;
                }
                this.entities.push({
                    x: (bossZoneStart + 20) * TS,
                    y: (GROUND_Y - 3) * TS,
                    type: 'gomboto'
                });
            }

            // ── Level 7 Boss Arena ─────────────────────────────────
            if (levelIndex === 7) {
                // Jungle clearing — flat, wide solid ground
                for (let y = GROUND_Y; y < ROWS; y++) {
                    for (let x = bossZoneStart; x < COLS; x++) {
                        map[y][x] = groundChar;
                    }
                }
                // Clear sky above arena
                for (let y = 0; y < GROUND_Y; y++) {
                    for (let x = bossZoneStart; x < COLS; x++) {
                        map[y][x] = skyChar;
                    }
                }
                // Some tree-platform bricks on the sides
                for (let y = GROUND_Y - 5; y < GROUND_Y - 2; y++) {
                    map[y][bossZoneStart] = brickChar;
                    map[y][COLS - 1] = brickChar;
                }
                // Floating bricks as jungle vines/branches
                for (let i = 0; i < 4; i++) {
                    const bx = bossZoneStart + 5 + i * 9;
                    const by = GROUND_Y - 7 - (i % 2) * 3;
                    if (by > 1) {
                        map[by][bx] = brickChar;
                        map[by][bx + 1] = brickChar;
                        map[by][bx + 2] = brickChar;
                    }
                }
                // Gorillomba boss marker (center of arena)
                this.entities.push({
                    x: (bossZoneStart + 22) * TS,
                    y: (GROUND_Y - 3) * TS,
                    type: 'gorillomba'
                });
                this.entities.push({
                    x: (bossZoneStart - 8) * TS,
                    y: (GROUND_Y - 4) * TS,
                    type: 'wild_mutt_item'
                });

                for (let x = 24; x < bossZoneStart - 12; x += 18) {
                    const trunkHeight = 3 + (x % 3);
                    const topY = GROUND_Y - trunkHeight;
                    for (let y = topY; y < GROUND_Y; y++) {
                        if (map[y][x] === skyChar) map[y][x] = treeBrickChar;
                    }
                    for (let lx = -2; lx <= 2; lx++) {
                        if (map[topY - 1] && map[topY - 1][x + lx] === skyChar) map[topY - 1][x + lx] = treeBrickChar;
                    }
                    for (let lx = -1; lx <= 1; lx++) {
                        if (map[topY - 2] && map[topY - 2][x + lx] === skyChar) map[topY - 2][x + lx] = treeBrickChar;
                    }
                }
            }

            // ── Level 8 Boss Arena (Knightkomba) ───────────────────
            if (levelIndex === 8) {
                // Flat snowy ground
                for (let y = GROUND_Y; y < ROWS; y++) {
                    for (let x = bossZoneStart; x < COLS; x++) {
                        map[y][x] = groundChar;
                    }
                }
                // Ice pillars
                for (let y = GROUND_Y - 5; y < GROUND_Y; y++) {
                    map[y][bossZoneStart] = brickChar;
                    map[y][COLS - 1] = brickChar;
                }
                // Place Knightkomba
                this.entities.push({
                    x: (bossZoneStart + 25) * TS,
                    y: (GROUND_Y - 4) * TS,
                    type: 'knightkomba'
                });
                
                this.entities.push({
                    x: (bossZoneStart + 40) * TS,
                    y: (GROUND_Y - 3) * TS,
                    type: 'dragonglass_diamond'
                });
            }

            // ── Level 9 (Ripjaws) ──────────────────────────────────
            if (levelIndex === 9) {
                const midX = Math.floor(COLS / 2);
                this.waterStartX = midX * TS;

                // Overwrite second half to be a deep water trench
                for (let y = 0; y < ROWS; y++) {
                    for (let x = midX; x < COLS; x++) {
                        // Clear obstacles
                        map[y][x] = skyChar;
                    }
                }
                
                // Deep ground
                for (let y = ROWS - 2; y < ROWS; y++) {
                    for (let x = midX; x < COLS; x++) {
                        map[y][x] = groundChar;
                    }
                }

                // Drop down wall
                for (let y = GROUND_Y; y < ROWS; y++) {
                    map[y][midX] = brickChar;
                }

                // Jellyfish goombas in water
                for (let x = midX + 10; x < COLS - 20; x += 15) {
                    this.entities.push({
                        x: x * TS,
                        y: (ROWS - 6 - Math.random()*5) * TS,
                        type: 'jellyfish_goomba'
                    });
                }

                // The Boss
                this.entities.push({
                    x: bossZoneStart * TS,
                    y: (GROUND_Y - 6) * TS,
                    type: 'octumba'
                });
            }

            // ── Level 10 Boss Arena (Vilgax Spider & Grey Matter Item) ──────
            if (levelIndex === 10) {
                for (let y = GROUND_Y; y < ROWS; y++) {
                    for (let x = bossZoneStart; x < COLS; x++) {
                        map[y][x] = groundChar;
                    }
                }
                for (let y = GROUND_Y - 6; y < GROUND_Y; y++) {
                    map[y][bossZoneStart] = 'E'; // EBlock wall
                    map[y][COLS - 1] = 'E';
                }
                
                // Spawn Vilgumbobo
                this.entities.push({
                    x: (bossZoneStart + 15) * TS,
                    y: (GROUND_Y - 5) * TS,
                    type: 'vilgumbobo'
                });
            }

            // ── Level 11 Boss Arena (Evil Ghostfreak) ───────────────────────
            if (levelIndex === 11) {
                for (let y = GROUND_Y; y < ROWS; y++) {
                    for (let x = bossZoneStart; x < COLS; x++) {
                        map[y][x] = groundChar;
                    }
                }
                for (let y = GROUND_Y - 6; y < GROUND_Y; y++) {
                    map[y][bossZoneStart] = brickChar;
                    map[y][COLS - 1] = brickChar;
                }
                
                // Tall walls in level 11
                for (let x = 30; x < bossZoneStart - 10; x += 15) {
                    const wallHeight = Math.floor(Math.random() * 4) + 5; // 5 to 8 blocks high
                    for (let y = GROUND_Y - wallHeight; y < GROUND_Y; y++) {
                        map[y][x] = brickChar;
                        map[y][x+1] = brickChar;
                    }
                }

                // Spawn Evil Ghostfreak
                this.entities.push({
                    x: (bossZoneStart + 25) * TS,
                    y: (GROUND_Y - 4) * TS,
                    type: 'freakosto'
                });
            }

            // ── Cleanup Pass: Un-attach Mystery Boxes ───────────────────────
            for (let y = 1; y < ROWS - 1; y++) {
                for (let x = 1; x < COLS - 1; x++) {
                    if (map[y][x] === mysteryChar) {
                        const badBlocks = ['2', '4', 'E', treeBrickChar, mysteryChar];
                        let fail = false;
                        // Avoid bricks top/bottom
                        if (badBlocks.includes(map[y - 1][x])) fail = true;
                        if (badBlocks.includes(map[y + 1][x])) fail = true;
                        // Avoid mystery boxes left/right
                        if (map[y][x - 1] === mysteryChar) fail = true;
                        if (map[y][x + 1] === mysteryChar) fail = true;

                        if (fail) {
                            map[y][x] = skyChar; // Remove invalid box
                        }
                    }
                }
            }

            // Convert to strings
            for (let y = 0; y < ROWS; y++) {
                map[y] = map[y].join('');
            }
        }

        this.rows = map.length;
        this.cols = map[0].length;
        this.width = this.cols * this.tileSize;
        this.height = this.rows * this.tileSize;

        // Pre-compute finish columns for flag-pole drawing
        this.finishCols = new Map();

        for (let y = 0; y < this.rows; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.cols; x++) {
                const char = map[y][x];
                if      (char === '1') this.tiles[y][x] = 1;
                else if (char === '2') this.tiles[y][x] = 2;
                else if (char === '3') this.tiles[y][x] = 3;
                else if (char === '4') this.tiles[y][x] = 4;
                else if (char === 'U') this.tiles[y][x] = 7;
                else if (char === 'L') this.tiles[y][x] = 9;  // Lava
                else if (char === 'S') this.tiles[y][x] = 10; // Speed panel
                else if (char === 'E' && levelIndex !== 6 && levelIndex !== 10) this.tiles[y][x] = 11; // Electric fence
                // In Level 6 & 10, E is electronic block
                else if (char === 'E' && (levelIndex === 6 || levelIndex === 10)) this.tiles[y][x] = 13;
                else if (char === 'W') this.tiles[y][x] = 12; // Wire hole
                else if (char === 'T') this.tiles[y][x] = 14; // Tree brick
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
        
        // Level 2 special: Heatblast unlock
        if (this.levelIndex === 2) {
            this.entities.push({ x: 300, y: 150, type: 'heatblast_item' });
        }
        
        // Level 3 special: XLR8 unlock
        if (this.levelIndex === 3) {
            this.entities.push({ x: 300, y: 150, type: 'xlr8_item' });
        }
    }


    // ── Theme palettes ─────────────────────────────────────────────
    getTheme() {
        if (this.levelIndex === 11) {
            return {
                sky:            '#0B1520',   // Dark blue night
                ground:         '#2A2520',   // Muddy dark ground
                groundStroke:   '#1A1510',
                brick:          '#3A3228',   // Old wooden plank
                brickStroke:    '#1E1A14',
                mystery:        '#7788AA',   // Ghostly blue box
                pipe:           '#1A1A22',
                unstable:       '#2E2820',
                unstableStroke: '#504838',
                cloud:          'rgba(100, 130, 170, 0.08)' // Blue moonlit fog
            };
        }
        if (this.levelIndex === 10) {
            if (this.omnitrixFixed) {
                // Fixed: Omnitrix Green circuit
                return {
                    sky:            '#0A120A',
                    ground:         '#1A2A1A',
                    groundStroke:   '#00FF44',
                    brick:          '#1E2E1E',
                    brickStroke:    '#00FF44',
                    mystery:        '#00FF00',
                    pipe:           '#0A1A0A',
                    unstable:       '#2A3A2A',
                    unstableStroke: '#00CC33',
                    cloud:          'rgba(0, 255, 68, 0.06)'
                };
            } else {
                // Broken: Dark PCB with red/orange glowing traces
                return {
                    sky:            '#0C0E12',   // Dark metallic gray
                    ground:         '#1A1C22',   // Dark circuit board
                    groundStroke:   '#FF2200',   // Red trace
                    brick:          '#22252C',   // Dark chip color
                    brickStroke:    '#FF4400',   // Orange glow outline
                    mystery:        '#FF6600',   // Orange warning
                    pipe:           '#0A0C10',
                    unstable:       '#2A2D35',
                    unstableStroke: '#FF3300',
                    cloud:          'rgba(255, 60, 0, 0.05)'
                };
            }
        }
        if (this.levelIndex === 8) {
            return {
                sky:            '#180B2B',   // Deep purple cavern
                ground:         '#3A205A',   // Purple crystal floor
                groundStroke:   '#25123E',
                brick:          '#00D4FF',   // Glowing cyan crystal
                brickStroke:    '#0088CC',
                mystery:        '#FF3399',   // Pink crystal box
                pipe:           '#4B2875',
                unstable:       '#7B2CD4',   // Violet crystal
                unstableStroke: '#48148A',
                cloud:          'rgba(255, 180, 100, 0.1)', // Warm fog
            };
        }
        if (this.levelIndex === 7) {
            return {
                sky:            '#3DB2FF',   // bright blue sky
                ground:         '#76C239',   // bright green grass
                groundStroke:   '#4A8A1E',
                brick:          '#8DB600',   // weed-like brick color
                brickStroke:    '#558000',
                mystery:        '#FFD700',
                pipe:           '#3B8E23',
                unstable:       '#A4DE02',
                unstableStroke: '#76B001',
                cloud:          'rgba(255, 255, 255, 0.9)', // puffy white clouds
            };
        }
        if (this.levelIndex === 6) {
            return {
                sky:            '#D3D9CF',   // Hazy bright sky
                ground:         '#8C7255',   // Sandy/muddy ground
                groundStroke:   '#5E4A35',
                brick:          '#7F8A80',   // Scrap metal/junk brick
                brickStroke:    '#4A554A',
                mystery:        '#FFCC00',   // Warning yellow
                pipe:           '#505050',
                unstable:       '#B89F70',   // Rusted junk
                unstableStroke: '#7A623F',
                cloud:          'rgba(255, 255, 230, 0.4)' // dusty clouds
            };
        }
        if (this.levelIndex === 5) {
            return {
                sky:            '#050a05',
                ground:         '#182018',
                groundStroke:   '#0f150f',
                brick:          '#2a3a2a',
                brickStroke:    '#1a2a1a',
                mystery:        '#aaff00',
                pipe:           '#152515',
                unstable:       '#3a4a3a',
                unstableStroke: '#2a3a2a',
                cloud:          'rgba(170, 255, 0, 0.15)',
            };
        }
        if (this.levelIndex === 4) {
            return {
                sky:            '#0a0033',
                ground:         '#221144',
                groundStroke:   '#110022',
                brick:          '#5522aa',
                brickStroke:    '#331166',
                mystery:        '#00eeff',
                pipe:           '#331188',
                unstable:       '#441177',
                unstableStroke: '#220044',
                cloud:          'rgba(150, 50, 200, 0.4)',
                speedPanel:     '#00eeff',
                efence:         '#00ffff',
            };
        }
        if (this.levelIndex === 3) {
            return {
                sky:            '#0A0000',
                ground:         '#1A1A1A',
                groundStroke:   '#0A0A0A',
                brick:          '#3A2A2A',
                brickStroke:    '#1A0A0A',
                mystery:        '#FF6600',
                pipe:           '#4A0000',
                unstable:       '#555',
                unstableStroke: '#333',
                lava:           '#FF4400',
                lavaGlow:       '#FFAA00',
                cloud:          'rgba(200, 30, 0, 0.12)',
            };
        }
        if (this.levelIndex === 2) {
            return {
                sky:            '#0b0a1a',
                ground:         '#1a1428',
                groundStroke:   '#0d0a18',
                brick:          '#2a1f3a',
                brickStroke:    '#150e22',
                mystery:        '#c8a2ff',
                pipe:           '#1a0e2a',
                unstable:       '#3a2850',
                unstableStroke: '#221640',
                cloud:          'rgba(80, 50, 120, 0.18)',
            };
        }
        if (this.levelIndex === 9) {
            return {
                sky:            '#FFDAB9',   // Peach bright desert sky
                ground:         '#EDC9AF',   // Desert sand
                groundStroke:   '#C2B280',
                brick:          '#DAA520',   // Golden sand brick
                brickStroke:    '#B8860B',
                mystery:        '#F4A460',
                pipe:           '#8B4513',
                unstable:       '#D2B48C',
                unstableStroke: '#A0522D',
                cloud:          'rgba(255, 228, 181, 0.6)' // Sand dust
            };
        }
        // Level 1 – classic Mario
        return {
            sky:          '#5C94FC',
            ground:       '#8B4513',
            groundStroke: '#5C2D0A',
            brick:        '#C84010',
            brickStroke:  '#7A2800',
            mystery:      '#F8A800',
            pipe:         '#008000',
            cloud:        'rgba(255,255,255,0.85)',
        };
    }

    // ── Draw ────────────────────────────────────────────────────────
    draw(ctx, mario = null, camX = 0) {
        const t = this.getTheme();
        const ts = this.tileSize;
        const now = performance.now();

        // Sky
        if (this.levelIndex === 3) {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
            skyGrad.addColorStop(0, '#0a000d');
            skyGrad.addColorStop(0.4, '#1b020c');
            skyGrad.addColorStop(0.7, '#3c0512');
            skyGrad.addColorStop(0.9, '#600711');
            skyGrad.addColorStop(1.0, '#901212');
            ctx.fillStyle = skyGrad;
        } else if (this.levelIndex === 2) {
            const skyGrad = ctx.createLinearGradient(0, -200, 0, this.height);
            skyGrad.addColorStop(0, '#05040f');     // Almost black top
            skyGrad.addColorStop(0.3, '#0e0a22');   // Deep indigo
            skyGrad.addColorStop(0.6, '#1a1235');   // Dark purple
            skyGrad.addColorStop(0.85, '#1f1540');  // Muted violet
            skyGrad.addColorStop(1.0, '#140e28');   // Dark base
            ctx.fillStyle = skyGrad;
        } else if (this.levelIndex === 4) {
            const skyGrad = ctx.createLinearGradient(0, -200, 0, this.height);
            skyGrad.addColorStop(0, '#0a0033'); // Deep starry blue
            skyGrad.addColorStop(0.4, '#220066'); // Rich purple
            skyGrad.addColorStop(0.8, '#4411aa'); // Bright purple glow near horizon
            skyGrad.addColorStop(1.0, '#110033'); // Dark ground base
            ctx.fillStyle = skyGrad;
        } else if (this.levelIndex === 5) {
            const skyGrad = ctx.createLinearGradient(0, -200, 0, this.height);
            skyGrad.addColorStop(0, '#050a05'); // Pitch black cavern roof
            skyGrad.addColorStop(0.5, '#0a1a0a'); // Dark green mid
            skyGrad.addColorStop(0.8, '#153315'); // Glowing toxic base
            skyGrad.addColorStop(1.0, '#0a1a0a');
            ctx.fillStyle = skyGrad;
        } else if (this.levelIndex === 7) {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
            skyGrad.addColorStop(0, '#2AB1FC'); // Top sky blue
            skyGrad.addColorStop(0.6, '#86D4FF'); // Lighter near horizon
            skyGrad.addColorStop(1.0, '#DDF3FF'); // Almost white horizon
            ctx.fillStyle = skyGrad;
        } else if (this.levelIndex === 6) {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
            skyGrad.addColorStop(0, '#7EA6B8'); // Dusty blue
            skyGrad.addColorStop(0.6, '#C4C9B8'); // Hazy clouds
            skyGrad.addColorStop(1.0, '#D9CDA4'); // Sand dust at horizon
            ctx.fillStyle = skyGrad;
        } else if (this.levelIndex === 8) {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
            skyGrad.addColorStop(0, '#100522'); // Dark roof
            skyGrad.addColorStop(0.6, '#31104A'); // Ambient purple
            skyGrad.addColorStop(1.0, '#4B2875'); // Warm ground bounce
            ctx.fillStyle = skyGrad;
        } else if (this.levelIndex === 10) {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
            if (this.omnitrixFixed) {
                skyGrad.addColorStop(0, '#040A04');
                skyGrad.addColorStop(0.5, '#0A1A0A');
                skyGrad.addColorStop(1.0, '#0C1F0C');
            } else {
                skyGrad.addColorStop(0, '#08090C'); // Very dark steel
                skyGrad.addColorStop(0.5, '#0E1015'); // Deep charcoal
                skyGrad.addColorStop(1.0, '#141720'); // Slight warm base
            }
            ctx.fillStyle = skyGrad;
        } else if (this.levelIndex === 11) {
            const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
            skyGrad.addColorStop(0, '#080E18'); // Deep night
            skyGrad.addColorStop(0.4, '#0F1A2A'); // Dark blue
            skyGrad.addColorStop(0.8, '#1A2535'); // Slightly lighter near horizon
            skyGrad.addColorStop(1.0, '#151C25'); // Dark ground base
            ctx.fillStyle = skyGrad;
        } else {
            ctx.fillStyle = t.sky;
        }
        ctx.fillRect(0, -1000, this.width, this.height + 2000);

        // Level 9: deep sea background on the second half
        if (this.levelIndex === 4) {
            const seamY = this.height - 118;
            const seamBand = ctx.createLinearGradient(0, seamY - 80, 0, this.height);
            seamBand.addColorStop(0, 'rgba(50, 18, 90, 0)');
            seamBand.addColorStop(1, 'rgba(35, 10, 72, 0.55)');
            ctx.fillStyle = seamBand;
            ctx.fillRect(0, seamY - 80, this.width, this.height - (seamY - 80));
            ctx.fillStyle = 'rgba(120, 80, 200, 0.18)';
            for (let i = 0; i < 10; i++) {
                const px = (i * 260 + now / 16) % (this.width + 200) - 100;
                ctx.beginPath();
                ctx.ellipse(px, seamY + Math.sin(now / 700 + i) * 8, 90, 18, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.levelIndex === 6) {
            const seamY = this.height - 110;
            const seamBand = ctx.createLinearGradient(0, seamY - 90, 0, this.height);
            seamBand.addColorStop(0, 'rgba(120, 90, 50, 0)');
            seamBand.addColorStop(1, 'rgba(95, 70, 45, 0.55)');
            ctx.fillStyle = seamBand;
            ctx.fillRect(0, seamY - 90, this.width, this.height - (seamY - 90));
            ctx.fillStyle = 'rgba(180, 145, 90, 0.16)';
            for (let i = 0; i < 8; i++) {
                const px = (i * 280 + now / 20) % (this.width + 240) - 120;
                ctx.beginPath();
                ctx.ellipse(px, seamY + 8 + Math.sin(now / 800 + i) * 6, 110, 20, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.levelIndex === 7) {
            const seamY = this.height - 124;
            const seamBand = ctx.createLinearGradient(0, seamY - 90, 0, this.height);
            seamBand.addColorStop(0, 'rgba(30, 120, 80, 0)');
            seamBand.addColorStop(1, 'rgba(28, 110, 72, 0.45)');
            ctx.fillStyle = seamBand;
            ctx.fillRect(0, seamY - 90, this.width, this.height - (seamY - 90));
            ctx.fillStyle = 'rgba(160, 230, 255, 0.18)';
            for (let i = 0; i < 10; i++) {
                const px = (i * 220 + now / 18) % (this.width + 180) - 90;
                ctx.beginPath();
                ctx.ellipse(px, seamY + Math.sin(now / 650 + i) * 5, 100, 16, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.levelIndex === 8) {
            const seamY = this.height - 116;
            const seamBand = ctx.createLinearGradient(0, seamY - 80, 0, this.height);
            seamBand.addColorStop(0, 'rgba(90, 35, 140, 0)');
            seamBand.addColorStop(1, 'rgba(60, 20, 100, 0.5)');
            ctx.fillStyle = seamBand;
            ctx.fillRect(0, seamY - 80, this.width, this.height - (seamY - 80));
            ctx.fillStyle = 'rgba(120, 255, 255, 0.12)';
            for (let i = 0; i < 9; i++) {
                const px = (i * 250 + now / 17) % (this.width + 200) - 100;
                ctx.beginPath();
                ctx.ellipse(px, seamY + Math.sin(now / 500 + i) * 6, 80, 18, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.levelIndex === 11) {
            const seamY = this.height - 120;
            const seamBand = ctx.createLinearGradient(0, seamY - 90, 0, this.height);
            seamBand.addColorStop(0, 'rgba(20, 28, 38, 0)');
            seamBand.addColorStop(1, 'rgba(8, 12, 18, 0.58)');
            ctx.fillStyle = seamBand;
            ctx.fillRect(0, seamY - 90, this.width, this.height - (seamY - 90));
            ctx.fillStyle = 'rgba(170, 190, 220, 0.10)';
            for (let i = 0; i < 8; i++) {
                const px = (i * 260 + now / 21) % (this.width + 180) - 90;
                ctx.beginPath();
                ctx.ellipse(px, seamY + Math.sin(now / 850 + i) * 7, 95, 20, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (this.levelIndex === 9 && this.waterStartX) {
            const seaGrad = ctx.createLinearGradient(this.waterStartX, -200, this.waterStartX, this.height);
            seaGrad.addColorStop(0, '#07243F');
            seaGrad.addColorStop(0.45, '#04182D');
            seaGrad.addColorStop(1, '#010814');
            ctx.fillStyle = seaGrad;
            ctx.fillRect(this.waterStartX, -1000, this.width - this.waterStartX, this.height + 2000);
        }

        // Level 3: lava glow from below and volcanic landscape
        if (this.levelIndex === 3) {
            // Distant volcanoes with parallax (moving slower than foreground)
            const numVolcanoes = 15;
            for (let i = 0; i < numVolcanoes; i++) {
                // Determine base world X coordinate
                const worldX = i * 450 + 120;
                // Parallax shift: scroll at 60% of camera speed (looks like 40% speed relative to foreground)
                const drawX = worldX + camX * 0.6;
                
                // Deterministic width/height based on index
                const w = 180 + (i % 4) * 50 + (i % 3) * 20;
                const h = 130 + (i % 3) * 40 + (i % 2) * 30;
                const baseLine = 452; // slightly below ground Y (448)
                const craterW = w * 0.16;
                const craterY = baseLine - h;
                
                // Draw volcano body
                const volGrad = ctx.createLinearGradient(drawX - w/2, craterY, drawX + w/2, baseLine);
                volGrad.addColorStop(0, '#2d1820'); // Dark rocky purple-grey
                volGrad.addColorStop(0.35, '#1e0e14');
                volGrad.addColorStop(0.7, '#14070d');
                volGrad.addColorStop(1, '#0c0208');
                ctx.fillStyle = volGrad;
                
                ctx.beginPath();
                ctx.moveTo(drawX - w/2, baseLine);
                ctx.lineTo(drawX - craterW/2, craterY);
                ctx.lineTo(drawX + craterW/2, craterY);
                ctx.lineTo(drawX + w/2, baseLine);
                ctx.closePath();
                ctx.fill();

                // Draw glowing lava cracks down the slopes
                ctx.strokeStyle = '#ff3300';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                // Left crack
                ctx.moveTo(drawX - craterW/4, craterY + 5);
                ctx.lineTo(drawX - w*0.12, craterY + h*0.3);
                ctx.lineTo(drawX - w*0.08, craterY + h*0.5);
                ctx.lineTo(drawX - w*0.2, baseLine - 10);
                // Right crack
                ctx.moveTo(drawX + craterW/5, craterY + 4);
                ctx.lineTo(drawX + w*0.1, craterY + h*0.4);
                ctx.lineTo(drawX + w*0.18, craterY + h*0.7);
                ctx.lineTo(drawX + w*0.25, baseLine - 5);
                ctx.stroke();

                // Glow on the cracks
                ctx.strokeStyle = 'rgba(255, 100, 0, 0.4)';
                ctx.lineWidth = 3.5;
                ctx.stroke();

                // Draw glowing lava inside the crater
                ctx.fillStyle = '#ffea00';
                ctx.beginPath();
                ctx.ellipse(drawX, craterY, craterW/2, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Volcano eruption geysers (every 3rd volcano)
                if (i % 3 === 0) {
                    const eruptHeight = 35 + Math.sin(now / 160 + i) * 15 + Math.random() * 4;
                    
                    // Geyser glow
                    const geyserGlow = ctx.createRadialGradient(drawX, craterY - eruptHeight/2, 4, drawX, craterY - eruptHeight/2, eruptHeight * 1.2);
                    geyserGlow.addColorStop(0, 'rgba(255, 120, 0, 0.45)');
                    geyserGlow.addColorStop(1, 'rgba(255, 40, 0, 0)');
                    ctx.fillStyle = geyserGlow;
                    ctx.beginPath();
                    ctx.arc(drawX, craterY - eruptHeight/2, eruptHeight * 1.2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Erupting jets
                    ctx.strokeStyle = '#ffea00';
                    ctx.lineWidth = 2.5 + Math.sin(now / 40) * 0.5;
                    ctx.lineCap = 'round';
                    for (let j = -2; j <= 2; j++) {
                        if (j === 0) continue;
                        ctx.beginPath();
                        ctx.moveTo(drawX, craterY);
                        const targetX = drawX + j * (14 + Math.sin(now/180 + i*3.5)*6);
                        const targetY = craterY - eruptHeight * (0.85 + Math.abs(j)*0.08);
                        const controlX = drawX + j * 4;
                        const controlY = craterY - eruptHeight * 1.15;
                        ctx.quadraticCurveTo(controlX, controlY, targetX, targetY);
                        ctx.stroke();
                    }
                    
                    // Volcanic particles flying up and down (parabolic physics)
                    ctx.fillStyle = '#ffaa00';
                    for (let d = 0; d < 5; d++) {
                        const tOffset = (now / 7 + d * 140) % 550;
                        const progress = tOffset / 550;
                        const angle = -Math.PI/2 + (d - 2) * 0.3;
                        const speed = 60 + (d % 2) * 18;
                        const startVx = Math.cos(angle) * speed;
                        const startVy = Math.sin(angle) * speed;
                        
                        const px = drawX + startVx * progress;
                        const py = craterY + startVy * progress + 0.5 * 110 * progress * progress;
                        
                        ctx.beginPath();
                        ctx.arc(px, py, 1.5 + (d % 2), 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            // Foreground lava glow (base bottom glow)
            const grad = ctx.createLinearGradient(0, this.height - 200, 0, this.height);
            grad.addColorStop(0, 'rgba(255, 40, 0, 0)');
            grad.addColorStop(1, 'rgba(255, 60, 0, 0.35)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, this.height - 200, this.width, 200);

            // Floating ember particles rising all the way to the top
            for (let i = 0; i < 58; i++) {
                const ex = (i * 173 + now / 20) % this.width;
                const ey = this.height + 80 - ((now / 12 + i * 97) % (this.height + 180));
                const pulse = 0.5 + Math.sin(now / 180 + i * 1.7) * 0.5;
                const sz = 2.5 + pulse * 3;
                ctx.globalAlpha = 0.28 + pulse * 0.45;
                ctx.fillStyle = '#FFB000';
                ctx.beginPath();
                ctx.arc(ex, ey, sz, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 0.12 + pulse * 0.2;
                ctx.fillStyle = '#FF3300';
                ctx.beginPath();
                ctx.arc(ex, ey, sz * 2.4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;
        }

        // Clouds
        if (this.levelIndex === 4) {
            // Stars
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 60; i++) {
                const sx = ((i * 321 + now / 80) % this.width);
                const sy = (i * 87) % (this.height - 150);
                const size = 1 + (i % 2);
                ctx.globalAlpha = 0.5 + Math.sin(now / 300 + i) * 0.5;
                ctx.beginPath();
                ctx.arc(sx, sy, size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            // Giant cracked moon (parallax)
            const moonX = camX * 0.15 + 400;
            const moonY = this.height - 350;
            ctx.fillStyle = '#b366ff'; // Purple moon
            ctx.beginPath();
            ctx.arc(moonX, moonY, 180, 0, Math.PI * 2);
            ctx.fill();
            // Cyan glowing craters/cracks
            ctx.fillStyle = '#00eeff';
            ctx.beginPath();
            ctx.arc(moonX - 40, moonY - 30, 25, 0, Math.PI * 2);
            ctx.arc(moonX + 70, moonY + 40, 35, 0, Math.PI * 2);
            ctx.arc(moonX + 20, moonY - 70, 15, 0, Math.PI * 2);
            ctx.fill();

            // Distant purple organic spires
            ctx.fillStyle = '#331166';
            for (let i = 0; i < 20; i++) {
                const spX = (i * 250 + 100) + camX * 0.3;
                const spH = 120 + (i % 4) * 60;
                const spBaseY = this.height - 52;
                ctx.beginPath();
                ctx.moveTo(spX - 50, spBaseY);
                ctx.quadraticCurveTo(spX - 15, spBaseY - spH / 2, spX, spBaseY - spH);
                ctx.quadraticCurveTo(spX + 15, spBaseY - spH / 2, spX + 50, spBaseY);
                ctx.fill();

                // Cyan crystal glowing parts on spires
                ctx.fillStyle = '#00ffff';
                ctx.globalAlpha = 0.8 + Math.sin(now / 200 + i) * 0.2;
                ctx.beginPath();
                ctx.ellipse(spX, spBaseY - spH + 30, 6, 12, 0, 0, Math.PI * 2);
                ctx.ellipse(spX - 15, spBaseY - spH / 2, 4, 10, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            const seamGlow = ctx.createLinearGradient(0, this.height - 220, 0, this.height);
            seamGlow.addColorStop(0, 'rgba(80, 20, 120, 0)');
            seamGlow.addColorStop(1, 'rgba(40, 10, 80, 0.45)');
            ctx.fillStyle = seamGlow;
            ctx.fillRect(0, this.height - 220, this.width, 220);

            // Magenta floating clouds
            ctx.fillStyle = t.cloud;
            for (let i = 0; i < 15; i++) {
                const cx = ((i * 350 + 60 + now / 40) % (this.width + 400)) - 200;
                const cy = 50 + (i % 3) * 60 + Math.sin(now / 1000 + i) * 20;
                ctx.beginPath();
                ctx.ellipse(cx, cy, 100 + (i % 2) * 40, 35, 0, 0, Math.PI * 2);
                ctx.ellipse(cx + 70, cy - 15, 80, 45, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.levelIndex === 5) {
            // Cavern stalactites (parallax)
            ctx.fillStyle = '#0a140a';
            for (let i = 0; i < 25; i++) {
                const sx = (i * 180 + 50) + camX * 0.2;
                const sh = 100 + (i % 5) * 60;
                ctx.beginPath();
                ctx.moveTo(sx - 40, -100);
                ctx.quadraticCurveTo(sx, sh, sx + 40, -100);
                ctx.fill();
            }

            // Glowing toxic waterfalls in background
            const toxicGrad = ctx.createLinearGradient(0, 0, 0, this.height);
            toxicGrad.addColorStop(0, 'rgba(100, 255, 0, 0.6)');
            toxicGrad.addColorStop(1, 'rgba(50, 150, 0, 0.1)');
            ctx.fillStyle = toxicGrad;
            for (let i = 0; i < 8; i++) {
                const wx = ((i * 450 + 120 + now / 30) % (this.width + 200)) - 100;
                ctx.beginPath();
                ctx.moveTo(wx - 20, -50);
                ctx.lineTo(wx + 20, -50);
                ctx.quadraticCurveTo(wx + 10, this.height / 2, wx + 30, this.height);
                ctx.lineTo(wx - 30, this.height);
                ctx.quadraticCurveTo(wx - 10, this.height / 2, wx - 20, -50);
                ctx.fill();
            }

            // Floating glowing spores
            ctx.fillStyle = '#aaff00';
            for (let i = 0; i < 50; i++) {
                const px = ((i * 273 + now / 25) % this.width);
                const py = ((i * 117 - now / 35) % (this.height + 200)) - 50;
                const size = 1.5 + Math.sin(now / 200 + i) * 1.5;
                ctx.globalAlpha = 0.4 + Math.sin(now / 150 + i) * 0.4;
                ctx.beginPath();
                ctx.arc(px, py, Math.max(0.1, size), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            // Toxic fog at bottom
            ctx.fillStyle = t.cloud;
            for (let i = 0; i < 20; i++) {
                const cx = (i * 200 + now / 15) % (this.width + 200) - 100;
                const cy = this.height - 150 + Math.sin(now / 800 + i) * 40;
                ctx.beginPath();
                ctx.ellipse(cx, cy, 150, 60, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.levelIndex === 6) {
            // Distant junk mountains
            ctx.fillStyle = '#818B8A';
            for (let i = 0; i < 18; i++) {
                const mx = (i * 400 + 50) + camX * 0.1;
                const mh = 200 + (i % 4) * 80;
                const mountainBaseY = this.height - 36;
                ctx.beginPath();
                ctx.moveTo(mx - 150, mountainBaseY);
                ctx.lineTo(mx, mountainBaseY - mh);
                ctx.lineTo(mx + 100, mountainBaseY - mh * 0.7);
                ctx.lineTo(mx + 200, mountainBaseY);
                ctx.fill();
            }

            // Yellow Cranes / Excavators in background
            ctx.fillStyle = '#D9A426';
            ctx.strokeStyle = '#2A2A2A';
            ctx.lineWidth = 4;
            for (let i = 0; i < 6; i++) {
                const cx = (i * 700 + 300) + camX * 0.2;
                const craneBaseY = this.height - 78;
                // Crane base
                ctx.fillRect(cx - 30, craneBaseY - 120, 100, 120);
                // Crane arm
                ctx.beginPath();
                ctx.moveTo(cx + 20, craneBaseY - 80);
                ctx.lineTo(cx + 150, craneBaseY - 250 + Math.sin(now/1000 + i)*20);
                ctx.stroke();
                // Hanging claw
                ctx.beginPath();
                ctx.moveTo(cx + 150, craneBaseY - 250 + Math.sin(now/1000 + i)*20);
                ctx.lineTo(cx + 150, craneBaseY - 180 + Math.sin(now/1000 + i)*20);
                ctx.stroke();
            }

            const seamGlow = ctx.createLinearGradient(0, this.height - 200, 0, this.height);
            seamGlow.addColorStop(0, 'rgba(120, 90, 50, 0)');
            seamGlow.addColorStop(1, 'rgba(90, 60, 30, 0.4)');
            ctx.fillStyle = seamGlow;
            ctx.fillRect(0, this.height - 200, this.width, 200);

            // Foreground scrap piles
            ctx.fillStyle = '#5C5449';
            for (let i = 0; i < 25; i++) {
                const px = (i * 200) + camX * 0.4;
                const ph = 80 + (i % 3) * 50;
                ctx.beginPath();
                ctx.ellipse(px, this.height, 120, ph, 0, Math.PI, 0);
                ctx.fill();
            }

            // Dusty atmosphere/clouds
            ctx.fillStyle = t.cloud;
            for (let i = 0; i < 12; i++) {
                const cx = (i * 400 + now / 60) % (this.width + 400) - 200;
                const cy = this.height - 250 + Math.sin(now / 2000 + i) * 30;
                ctx.beginPath();
                ctx.ellipse(cx, cy, 250, 80, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.levelIndex === 7) {
            // Mountains
            ctx.fillStyle = '#8EB8CC';
            for (let i = 0; i < 15; i++) {
                const mx = (i * 350 + 100) + camX * 0.15;
                const mh = 250 + (i % 3) * 100;
                const ridgeBaseY = this.height - 56;
                ctx.beginPath();
                ctx.moveTo(mx - 150, ridgeBaseY);
                ctx.lineTo(mx, ridgeBaseY - mh);
                ctx.lineTo(mx + 150, ridgeBaseY);
                ctx.fill();
                
                // Mountain shading
                ctx.fillStyle = '#6D9BB2';
                ctx.beginPath();
                ctx.moveTo(mx, ridgeBaseY - mh);
                ctx.lineTo(mx + 150, ridgeBaseY);
                ctx.lineTo(mx, ridgeBaseY);
                ctx.fill();
                ctx.fillStyle = '#8EB8CC';
            }

            // Distant Hills
            ctx.fillStyle = '#5A9E30';
            for (let i = 0; i < 20; i++) {
                const hx = (i * 250) + camX * 0.3;
                const hh = 120 + (i % 4) * 40;
                const hillBaseY = this.height - 48;
                ctx.beginPath();
                ctx.ellipse(hx, hillBaseY, 200, hh, 0, Math.PI, 0);
                ctx.fill();
            }

            // Blue River across the background
            ctx.fillStyle = '#2288CC';
            ctx.fillRect(camX, this.height - 96, this.width, 96);
            ctx.fillStyle = '#44AAEE';
            for (let i = 0; i < 15; i++) {
                ctx.fillRect(camX + (i * 120 + now / 20) % this.width, this.height - 74 + Math.sin(i) * 20, 80, 5);
            }

            const seamGlow = ctx.createLinearGradient(0, this.height - 180, 0, this.height);
            seamGlow.addColorStop(0, 'rgba(30, 120, 220, 0)');
            seamGlow.addColorStop(1, 'rgba(15, 70, 130, 0.35)');
            ctx.fillStyle = seamGlow;
            ctx.fillRect(0, this.height - 180, this.width, 180);

            // Puffy White Clouds
            ctx.fillStyle = t.cloud;
            for (let i = 0; i < 15; i++) {
                const cx = (i * 300 + now / 40) % (this.width + 300) - 150;
                const cy = 60 + Math.sin(now / 1500 + i) * 20 + (i % 3) * 30;
                ctx.beginPath();
                ctx.arc(cx, cy, 40, 0, Math.PI * 2);
                ctx.arc(cx + 35, cy - 20, 50, 0, Math.PI * 2);
                ctx.arc(cx + 70, cy, 40, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.levelIndex === 8) {
            // Crystal Cavern Background
            // Background stalagmites (purple)
            ctx.fillStyle = '#291040';
            for (let i = 0; i < 20; i++) {
                const mx = (i * 200 + 50) + camX * 0.15;
                const mh = 150 + (i % 4) * 100;
                const caveBaseY = this.height - 38;
                ctx.beginPath();
                ctx.moveTo(mx - 80, caveBaseY);
                ctx.lineTo(mx, caveBaseY - mh);
                ctx.lineTo(mx + 80, caveBaseY);
                ctx.fill();
            }

            // Warm glowing light rays from the right
            ctx.fillStyle = 'rgba(255, 200, 100, 0.08)';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(this.width + camX * 0.1, -100 + i * 50);
                ctx.lineTo(this.width - 600 + camX * 0.3 - i*100, this.height);
                ctx.lineTo(this.width + 100 + camX * 0.3, this.height);
                ctx.fill();
            }

            // Glowing cyan giant crystals (foreground)
            ctx.fillStyle = 'rgba(0, 200, 255, 0.4)';
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2;
            for (let i = 0; i < 15; i++) {
                const cx = (i * 350 + 150) + camX * 0.3;
                const ch = 200 + (i % 3) * 120;
                const crystalBaseY = this.height - 44;
                ctx.beginPath();
                ctx.moveTo(cx - 40, crystalBaseY);
                ctx.lineTo(cx, crystalBaseY - ch);
                ctx.lineTo(cx + 40, crystalBaseY);
                ctx.fill();
                ctx.stroke();

                // Crystal highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.moveTo(cx, crystalBaseY - ch);
                ctx.lineTo(cx + 20, crystalBaseY);
                ctx.lineTo(cx, crystalBaseY);
                ctx.fill();
            }

            // Glowing pink/purple giant crystals (scattered)
            ctx.fillStyle = 'rgba(200, 50, 255, 0.3)';
            ctx.strokeStyle = '#FF33FF';
            for (let i = 0; i < 12; i++) {
                const cx = (i * 450 + 50) + camX * 0.4;
                const ch = 100 + (i % 4) * 80;
                const crystalBaseY = this.height - 36;
                ctx.beginPath();
                ctx.moveTo(cx - 30, crystalBaseY);
                ctx.lineTo(cx + 20, crystalBaseY - ch);
                ctx.lineTo(cx + 60, crystalBaseY);
                ctx.fill();
                ctx.stroke();
            }

            // Ceiling stalactites
            ctx.fillStyle = '#1A0A2A';
            for (let i = 0; i < 25; i++) {
                const tx = (i * 180 + 30) + camX * 0.2;
                const th = 80 + (i % 5) * 60;
                ctx.beginPath();
                ctx.moveTo(tx - 40, -100);
                ctx.lineTo(tx, th - 100);
                ctx.lineTo(tx + 40, -100);
                ctx.fill();
            }
            
            // Knightkomba global summon effect
            if (this.winterGlowTimer > 0) {
                const ratio = Math.min(1, this.winterGlowTimer / 1000);
                
                // Flash the screen blue/cyan
                ctx.fillStyle = `rgba(0, 200, 255, ${0.4 * ratio})`;
                ctx.fillRect(0, -1000, this.width, this.height + 2000);
                
                // Extra thick white smoke across the sky
                ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * ratio})`;
                for (let i = 0; i < 30; i++) {
                    // Spread smoke out and let it drift
                    const cx = ((i * 300 + now / 2) % (this.width + 400)) - 200;
                    const cy = Math.sin(i + now/400) * 150 + 150;
                    ctx.beginPath();
                    ctx.arc(cx, cy, 150 + Math.random() * 50, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        } else if (this.levelIndex === 9) {
            // Desert Pyramids & Sun
            ctx.fillStyle = '#FF8C00'; // Sun
            ctx.beginPath();
            const sunX = this.waterStartX
                ? Math.min(this.waterStartX - 100, Math.max(180, camX + 300))
                : camX + 300;
            ctx.arc(sunX, 72, 54, 0, Math.PI * 2);
            ctx.fill();

            const desertGroundY = (this.rows - 6) * this.tileSize;
            for (let i = 0; i < 8; i++) {
                const pyramidWidth = 260 + (i % 4) * 85 + (i % 2) * 40;
                const pyramidHeight = 120 + (i % 5) * 32;
                const px = i * 455 + 90 + (i % 2) * 75;
                const baseY = desertGroundY;
                const apexX = px + pyramidWidth * 0.5;
                const apexY = baseY - pyramidHeight;
                // Only draw if pyramid is on the land side
                if (px + pyramidWidth < this.waterStartX) {
                    // Left side of pyramid
                    ctx.fillStyle = '#D2B48C';
                    ctx.beginPath();
                    ctx.moveTo(px, baseY);
                    ctx.lineTo(apexX, apexY);
                    ctx.lineTo(px + pyramidWidth, baseY);
                    ctx.fill();
                    
                    // Right shaded side
                    ctx.fillStyle = '#C2B280';
                    ctx.beginPath();
                    ctx.moveTo(apexX, apexY);
                    ctx.lineTo(px + pyramidWidth, baseY);
                    ctx.lineTo(apexX, baseY);
                    ctx.fill();
                }
            }
            
            // Standard clouds - only on land side
            ctx.fillStyle = t.cloud;
            for (let i = 0; i < 20; i++) {
                const cx = ((i * 350 + 60 + now / 80) % Math.max(1, this.waterStartX + 360)) - 180;
                if (cx < this.waterStartX) {
                    ctx.fillRect(cx, 70, 64, 16);
                    ctx.fillRect(cx + 16, 54, 32, 16);
                    ctx.fillRect(cx + 8, 86, 48, 16);
                }
            }

            if (this.waterStartX) {
                const seaWidth = this.width - this.waterStartX;

                const haze = ctx.createLinearGradient(this.waterStartX, 0, this.waterStartX, this.height);
                haze.addColorStop(0, 'rgba(20, 120, 170, 0.12)');
                haze.addColorStop(0.55, 'rgba(8, 55, 100, 0.16)');
                haze.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
                ctx.fillStyle = haze;
                ctx.fillRect(this.waterStartX, -100, seaWidth, this.height + 200);

                for (let i = 0; i < 6; i++) {
                    const ridgeX = this.waterStartX + 140 + i * 310;
                    const ridgeH = 70 + (i % 3) * 40;
                    ctx.fillStyle = `rgba(10, 28, 45, ${0.35 + (i % 2) * 0.1})`;
                    ctx.beginPath();
                    ctx.moveTo(ridgeX - 90, this.height);
                    ctx.quadraticCurveTo(ridgeX, this.height - ridgeH, ridgeX + 90, this.height);
                    ctx.fill();
                }

                ctx.strokeStyle = 'rgba(18, 60, 55, 0.45)';
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                for (let i = 0; i < 18; i++) {
                    const sx = this.waterStartX + 60 + i * 120;
                    const baseY = this.height - 64;
                    const sway = Math.sin(now / 800 + i * 0.9) * 18;
                    ctx.beginPath();
                    ctx.moveTo(sx, baseY);
                    ctx.quadraticCurveTo(sx + sway, baseY - 45, sx + sway * 0.5, baseY - 95 - (i % 4) * 12);
                    ctx.stroke();
                }

                ctx.fillStyle = 'rgba(190, 245, 255, 0.28)';
                for (let i = 0; i < 90; i++) {
                    const px = this.waterStartX + ((i * 173 + now / 18) % seaWidth);
                    const py = ((i * 97 + now / 28) % (this.height + 300)) - 120;
                    const r = 2 + (i % 4);
                    ctx.beginPath();
                    ctx.arc(px, py, r, 0, Math.PI * 2);
                    ctx.fill();
                }

                for (let i = 0; i < 20; i++) {
                    const fishX = this.waterStartX + ((i * 260 - now / (18 + i % 5)) % seaWidth + seaWidth) % seaWidth;
                    const fishY = 100 + (i * 83) % (this.height - 210) + Math.sin(now / 650 + i) * 18;
                    const dir = i % 2 === 0 ? 1 : -1;
                    ctx.fillStyle = i % 3 === 0 ? 'rgba(255, 180, 80, 0.62)' : 'rgba(80, 220, 255, 0.58)';
                    ctx.beginPath();
                    ctx.ellipse(fishX, fishY, 13, 6, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(fishX - dir * 13, fishY);
                    ctx.lineTo(fishX - dir * 24, fishY - 7);
                    ctx.lineTo(fishX - dir * 24, fishY + 7);
                    ctx.fill();
                }
            }
        } else if (this.levelIndex === 2) {
            // ── Spooky forest background ──────────────────────
            const groundY = (this.rows - 6) * ts;

            // Large glowing moon (parallax — moves at 20% cam speed)
            const moonX = 600 + camX * 0.2;
            const moonY = 55;
            const moonR = 42;
            // Outer glow
            const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.3, moonX, moonY, moonR * 3.5);
            moonGlow.addColorStop(0, 'rgba(200, 190, 255, 0.25)');
            moonGlow.addColorStop(0.4, 'rgba(120, 100, 180, 0.08)');
            moonGlow.addColorStop(1, 'rgba(60, 40, 100, 0)');
            ctx.fillStyle = moonGlow;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonR * 3.5, 0, Math.PI * 2);
            ctx.fill();
            // Moon disc
            ctx.fillStyle = '#d8d0f0';
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
            ctx.fill();
            // Moon craters
            ctx.fillStyle = 'rgba(160, 140, 200, 0.35)';
            ctx.beginPath();
            ctx.arc(moonX - 12, moonY - 8, 8, 0, Math.PI * 2);
            ctx.arc(moonX + 14, moonY + 5, 6, 0, Math.PI * 2);
            ctx.arc(moonX + 4, moonY + 16, 5, 0, Math.PI * 2);
            ctx.arc(moonX - 8, moonY + 10, 4, 0, Math.PI * 2);
            ctx.fill();

            // Dead trees (parallax at 50% cam speed)
            const treeSeeds = [0, 380, 710, 1150, 1520, 1900, 2350, 2750, 3100, 3500, 3900, 4350, 4700];
            for (let i = 0; i < treeSeeds.length; i++) {
                const worldX = treeSeeds[i] + 60;
                const drawX = worldX + camX * 0.5;
                const trunkH = 100 + (i % 4) * 30 + (i % 3) * 15;
                const trunkW = 8 + (i % 3) * 3;
                const baseY = groundY + 4;

                // Trunk
                ctx.strokeStyle = '#1a1230';
                ctx.lineWidth = trunkW;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(drawX, baseY);
                ctx.lineTo(drawX + (i % 2 ? 5 : -5), baseY - trunkH);
                ctx.stroke();

                // Branches
                ctx.lineWidth = trunkW * 0.4;
                const topX = drawX + (i % 2 ? 5 : -5);
                const topY = baseY - trunkH;
                // Left branch
                ctx.beginPath();
                ctx.moveTo(topX, topY + trunkH * 0.3);
                ctx.quadraticCurveTo(topX - 30 - (i % 3) * 10, topY + trunkH * 0.1, topX - 45 - (i % 2) * 15, topY + trunkH * 0.15);
                ctx.stroke();
                // Right branch
                ctx.beginPath();
                ctx.moveTo(topX, topY + trunkH * 0.2);
                ctx.quadraticCurveTo(topX + 25 + (i % 3) * 8, topY - 10, topX + 40 + (i % 2) * 12, topY + trunkH * 0.05);
                ctx.stroke();
                // Top fork
                ctx.lineWidth = trunkW * 0.3;
                ctx.beginPath();
                ctx.moveTo(topX, topY);
                ctx.lineTo(topX - 12 - (i % 3) * 5, topY - 20 - (i % 2) * 10);
                ctx.moveTo(topX, topY);
                ctx.lineTo(topX + 10 + (i % 2) * 8, topY - 18 - (i % 3) * 8);
                ctx.stroke();
            }

            // Animated bats flying across the sky
            for (let i = 0; i < 12; i++) {
                const batSpeed = 40 + (i % 4) * 12;
                const bx = (i * 520 + now / batSpeed) % (this.width + 400) - 200;
                const by = 40 + (i % 5) * 35 + Math.sin(now / 600 + i * 2.3) * 18;
                const wingFlap = Math.sin(now / 80 + i * 1.7);
                const batSize = 5 + (i % 3) * 2;

                ctx.fillStyle = '#0a0818';
                // Body
                ctx.beginPath();
                ctx.ellipse(bx, by, batSize * 0.6, batSize * 0.35, 0, 0, Math.PI * 2);
                ctx.fill();
                // Left wing
                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.quadraticCurveTo(bx - batSize, by - batSize * wingFlap * 0.8, bx - batSize * 1.8, by + batSize * wingFlap * 0.3);
                ctx.quadraticCurveTo(bx - batSize * 0.8, by + batSize * 0.2, bx, by);
                ctx.fill();
                // Right wing
                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.quadraticCurveTo(bx + batSize, by - batSize * wingFlap * 0.8, bx + batSize * 1.8, by + batSize * wingFlap * 0.3);
                ctx.quadraticCurveTo(bx + batSize * 0.8, by + batSize * 0.2, bx, by);
                ctx.fill();
            }

            // Creeping ground fog
            ctx.fillStyle = 'rgba(60, 45, 90, 0.14)';
            for (let i = 0; i < 30; i++) {
                const fx = (i * 230 + now / 55) % (this.width + 300) - 150;
                const fy = groundY - 25 + Math.sin(now / 2200 + i * 1.1) * 12;
                const fr = 60 + (i % 4) * 20;
                ctx.beginPath();
                ctx.arc(fx, fy, fr, 0, Math.PI * 2);
                ctx.fill();
            }

            // High mist wisps
            ctx.fillStyle = 'rgba(80, 60, 130, 0.1)';
            for (let i = 0; i < 15; i++) {
                const mx = (i * 400 + now / 90) % (this.width + 350) - 175;
                const my = 80 + Math.sin(now / 2800 + i) * 30;
                const mr = 45 + (i % 3) * 18;
                ctx.beginPath();
                ctx.arc(mx, my, mr, 0, Math.PI * 2);
                ctx.arc(mx + mr * 0.4, my - mr * 0.15, mr * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.levelIndex === 10) {
            // PCB / Motherboard Background
            const traceColor = this.omnitrixFixed ? '#00FF44' : '#FF2200';
            const traceGlow = this.omnitrixFixed ? 'rgba(0, 255, 68, 0.15)' : 'rgba(255, 34, 0, 0.15)';
            const chipColor = this.omnitrixFixed ? '#0A1A0A' : '#1A1C22';
            const chipBorder = this.omnitrixFixed ? '#00AA22' : '#444855';

            // Horizontal circuit traces
            ctx.strokeStyle = traceColor;
            ctx.lineWidth = 2;
            for (let i = 0; i < 30; i++) {
                const ty = (i * 60 + 20);
                const startX = (i * 137 + 50) % 400;
                ctx.beginPath();
                ctx.moveTo(startX + camX * 0.2, ty);
                ctx.lineTo(startX + 200 + (i % 4) * 80 + camX * 0.2, ty);
                ctx.lineTo(startX + 220 + (i % 4) * 80 + camX * 0.2, ty + 20);
                ctx.lineTo(startX + 400 + (i % 3) * 100 + camX * 0.2, ty + 20);
                ctx.stroke();
            }

            // Vertical circuit traces
            for (let i = 0; i < 20; i++) {
                const tx = (i * 120 + 30) + camX * 0.15;
                ctx.beginPath();
                ctx.moveTo(tx, (i * 47) % this.height);
                ctx.lineTo(tx, (i * 47) % this.height + 100 + (i % 3) * 60);
                ctx.stroke();
            }

            // IC Chips (dark rectangles with borders)
            ctx.fillStyle = chipColor;
            ctx.strokeStyle = chipBorder;
            ctx.lineWidth = 1;
            for (let i = 0; i < 12; i++) {
                const cx = (i * 350 + 80) + camX * 0.25;
                const cy = 50 + (i % 5) * 100;
                const cw = 60 + (i % 3) * 40;
                const ch = 40 + (i % 2) * 30;
                ctx.fillRect(cx, cy, cw, ch);
                ctx.strokeRect(cx, cy, cw, ch);
                // Chip pins
                ctx.strokeStyle = traceColor;
                for (let p = 0; p < 4; p++) {
                    ctx.beginPath();
                    ctx.moveTo(cx + 10 + p * 15, cy);
                    ctx.lineTo(cx + 10 + p * 15, cy - 8);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(cx + 10 + p * 15, cy + ch);
                    ctx.lineTo(cx + 10 + p * 15, cy + ch + 8);
                    ctx.stroke();
                }
                ctx.strokeStyle = chipBorder;
            }

            // Glowing solder points
            ctx.fillStyle = traceColor;
            for (let i = 0; i < 40; i++) {
                const sx = (i * 193 + 20) + camX * 0.3;
                const sy = (i * 97 + 40) % this.height;
                ctx.beginPath();
                ctx.arc(sx, sy, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            // Ambient glow haze
            ctx.fillStyle = traceGlow;
            for (let i = 0; i < 8; i++) {
                const gx = (i * 500 + now / 80) % (this.width + 400) - 200;
                const gy = this.height - 150 + Math.sin(now / 2000 + i) * 40;
                ctx.beginPath();
                ctx.ellipse(gx, gy, 250, 80, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.levelIndex === 11) {
            // Haunted Village Background
            // Full moon
            const moonX = 300 + camX * 0.05;
            const moonY = 80;
            ctx.fillStyle = '#E8E8F0';
            ctx.beginPath();
            ctx.arc(moonX, moonY, 45, 0, Math.PI * 2);
            ctx.fill();
            // Moon glow
            ctx.fillStyle = 'rgba(180, 200, 230, 0.08)';
            ctx.beginPath();
            ctx.arc(moonX, moonY, 120, 0, Math.PI * 2);
            ctx.fill();
            // Moon craters
            ctx.fillStyle = 'rgba(180, 190, 210, 0.4)';
            ctx.beginPath();
            ctx.arc(moonX - 10, moonY - 8, 7, 0, Math.PI * 2);
            ctx.arc(moonX + 12, moonY + 5, 5, 0, Math.PI * 2);
            ctx.arc(moonX + 3, moonY + 14, 4, 0, Math.PI * 2);
            ctx.fill();

            // Distant dark building silhouettes
            ctx.fillStyle = '#0C1218';
            for (let i = 0; i < 10; i++) {
                const bx = (i * 450 + 100) + camX * 0.15;
                const bw = 80 + (i % 3) * 60;
                const bh = 120 + (i % 4) * 80;
                const houseBaseY = this.height - 44;
                ctx.fillRect(bx, houseBaseY - bh, bw, bh);
                // Roof
                ctx.beginPath();
                ctx.moveTo(bx - 10, houseBaseY - bh);
                ctx.lineTo(bx + bw / 2, houseBaseY - bh - 40 - (i % 3) * 20);
                ctx.lineTo(bx + bw + 10, houseBaseY - bh);
                ctx.fill();
                // Window glow
                ctx.fillStyle = 'rgba(255, 200, 100, 0.15)';
                ctx.fillRect(bx + 15, houseBaseY - bh + 20, 12, 15);
                ctx.fillRect(bx + bw - 25, houseBaseY - bh + 20, 12, 15);
                ctx.fillStyle = '#0C1218';
            }

            // Closer buildings (mid-ground)
            ctx.fillStyle = '#111820';
            for (let i = 0; i < 8; i++) {
                const bx = (i * 550 + 250) + camX * 0.3;
                const bw = 100 + (i % 3) * 50;
                const bh = 150 + (i % 3) * 60;
                const midBaseY = this.height - 28;
                ctx.fillRect(bx, midBaseY - bh, bw, bh);
                // Timber frame lines
                ctx.strokeStyle = '#1A222E';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(bx, midBaseY - bh + bh * 0.4);
                ctx.lineTo(bx + bw, midBaseY - bh + bh * 0.4);
                ctx.moveTo(bx + bw / 2, midBaseY - bh);
                ctx.lineTo(bx + bw / 2, midBaseY);
                ctx.stroke();
                // Peaked roof
                ctx.fillStyle = '#0E151D';
                ctx.beginPath();
                ctx.moveTo(bx - 15, midBaseY - bh);
                ctx.lineTo(bx + bw / 2, midBaseY - bh - 50);
                ctx.lineTo(bx + bw + 15, midBaseY - bh);
                ctx.fill();
                ctx.fillStyle = '#111820';
            }

            // Dead trees
            ctx.strokeStyle = '#0A0E14';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            for (let i = 0; i < 12; i++) {
                const tx = (i * 380 + 80) + camX * 0.4;
                const th = 100 + (i % 4) * 40;
                const treeBaseY = this.height - 16;
                ctx.beginPath();
                ctx.moveTo(tx, treeBaseY);
                ctx.lineTo(tx + (i % 2 ? 4 : -4), treeBaseY - th);
                ctx.stroke();
                // Branches
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(tx, treeBaseY - th * 0.6);
                ctx.lineTo(tx - 25 - (i % 3) * 10, treeBaseY - th * 0.75);
                ctx.moveTo(tx, treeBaseY - th * 0.4);
                ctx.lineTo(tx + 20 + (i % 2) * 15, treeBaseY - th * 0.55);
                ctx.stroke();
                ctx.lineWidth = 6;
            }

            const seamGlow = ctx.createLinearGradient(0, this.height - 180, 0, this.height);
            seamGlow.addColorStop(0, 'rgba(20, 30, 40, 0)');
            seamGlow.addColorStop(1, 'rgba(12, 18, 26, 0.5)');
            ctx.fillStyle = seamGlow;
            ctx.fillRect(0, this.height - 180, this.width, 180);

            // Ground fog
            ctx.fillStyle = 'rgba(80, 110, 150, 0.1)';
            for (let i = 0; i < 20; i++) {
                const fx = (i * 250 + now / 50) % (this.width + 300) - 150;
                const fy = this.height - 60 + Math.sin(now / 2000 + i) * 20;
                ctx.beginPath();
                ctx.ellipse(fx, fy, 200, 50, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.levelIndex !== 3 && this.levelIndex !== 6) {
            ctx.fillStyle = t.cloud;
            for (let i = 0; i < 20; i++) {
                const cx = i * 350 + 60;
                ctx.fillRect(cx, 70, 64, 16);
                ctx.fillRect(cx + 16, 54, 32, 16);
                ctx.fillRect(cx + 8, 86, 48, 16);
            }
        } else if (this.levelIndex === 3) {
            // Dark volcanic smoke clouds drifting across the sky
            ctx.fillStyle = 'rgba(25, 12, 22, 0.45)'; // dark purple smoke
            for (let i = 0; i < 20; i++) {
                const cx = (i * 320 + now / 70) % (this.width + 300) - 150;
                const cy = 60 + Math.sin(now / 1800 + i) * 25;
                const r = 50 + (i % 3) * 15;
                
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.arc(cx - r * 0.5, cy + r * 0.1, r * 0.7, 0, Math.PI * 2);
                ctx.arc(cx + r * 0.5, cy + r * 0.1, r * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
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
                        if (this.levelIndex === 2) {
                            // Spooky forest ground with dirt gradient
                            const gGrad = ctx.createLinearGradient(px, py, px, py + ts);
                            gGrad.addColorStop(0, '#1e1530');
                            gGrad.addColorStop(1, '#120c20');
                            ctx.fillStyle = gGrad;
                            ctx.fillRect(px, py, ts, ts);
                            ctx.strokeStyle = '#0d0a18';
                            ctx.lineWidth = 1;
                            ctx.strokeRect(px, py, ts, ts);
                            // Top edge grass tufts on topmost ground row
                            if (y > 0 && this.tiles[y - 1] && this.tiles[y - 1][x] === 0) {
                                ctx.fillStyle = 'rgba(30, 80, 45, 0.55)';
                                ctx.fillRect(px, py, ts, 3);
                                // Small grass blades
                                ctx.strokeStyle = 'rgba(35, 90, 50, 0.4)';
                                ctx.lineWidth = 1;
                                ctx.beginPath();
                                for (let g = 0; g < 4; g++) {
                                    const gx = px + 4 + g * 7;
                                    ctx.moveTo(gx, py);
                                    ctx.lineTo(gx + (g % 2 ? 2 : -2), py - 4 - (g % 3) * 2);
                                }
                                ctx.stroke();
                            }
                        } else {
                            ctx.fillStyle = t.ground;
                            ctx.fillRect(px, py, ts, ts);
                            ctx.strokeStyle = t.groundStroke;
                            ctx.lineWidth = 1;
                            ctx.strokeRect(px, py, ts, ts);
                        }
                        break;

                    case 2: // Brick
                        ctx.fillStyle = t.brick;
                        ctx.fillRect(px, py, ts, ts);
                        ctx.strokeStyle = t.brickStroke;
                        ctx.lineWidth = 1;
                        ctx.strokeRect(px, py, ts, ts);
                        ctx.strokeStyle = t.brickStroke;
                        ctx.beginPath();
                        ctx.moveTo(px, py + ts / 2); ctx.lineTo(px + ts, py + ts / 2);
                        ctx.moveTo(px + ts / 2, py); ctx.lineTo(px + ts / 2, py + ts / 2);
                        ctx.moveTo(px, py + ts / 2); ctx.lineTo(px, py + ts);
                        ctx.stroke();
                        // Level 3: lava glow on bricks
                        if (this.levelIndex === 3) {
                            ctx.strokeStyle = 'rgba(255,100,0,0.3)';
                            ctx.beginPath();
                            ctx.moveTo(px + 4, py + 10);
                            ctx.lineTo(px + 20, py + 22);
                            ctx.stroke();
                        }
                        // Level 2: mossy cracks on bricks
                        if (this.levelIndex === 2) {
                            // Diagonal crack
                            ctx.strokeStyle = 'rgba(100, 80, 160, 0.25)';
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(px + 3, py + 6);
                            ctx.lineTo(px + 14, py + 18);
                            ctx.lineTo(px + 22, py + 14);
                            ctx.stroke();
                            // Tiny moss patch
                            if ((x + y) % 3 === 0) {
                                ctx.fillStyle = 'rgba(40, 100, 50, 0.3)';
                                ctx.fillRect(px + 1, py, ts - 2, 3);
                            }
                        }
                        // Level 8: Crystal Bricks
                        if (this.levelIndex === 8) {
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                            ctx.beginPath();
                            ctx.moveTo(px + 4, py + 4);
                            ctx.lineTo(px + 14, py + 14);
                            ctx.lineTo(px + 4, py + 22);
                            ctx.fill();
                            ctx.strokeStyle = '#FFFFFF';
                            ctx.strokeRect(px + 2, py + 2, ts - 4, ts - 4);
                        }
                        // Level 10: PCB Bricks
                        if (this.levelIndex === 10) {
                            const tc = this.omnitrixFixed ? '#00FF44' : '#FF4400';
                            ctx.strokeStyle = tc;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(px + 4, py + ts/2);
                            ctx.lineTo(px + ts/2, py + ts/2);
                            ctx.lineTo(px + ts/2, py + 4);
                            ctx.stroke();
                            ctx.fillStyle = tc;
                            ctx.fillRect(px + ts/2 - 2, py + 2, 4, 4);
                            ctx.fillRect(px + 2, py + ts/2 - 2, 4, 4);
                        }
                        // Level 11: Old wooden plank bricks
                        if (this.levelIndex === 11) {
                            ctx.strokeStyle = 'rgba(60, 50, 35, 0.5)';
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(px + 3, py + 5); ctx.lineTo(px + ts - 3, py + 6);
                            ctx.moveTo(px + 2, py + 14); ctx.lineTo(px + ts - 2, py + 15);
                            ctx.moveTo(px + 4, py + 22); ctx.lineTo(px + ts - 4, py + 23);
                            ctx.stroke();
                            // Nail heads
                            ctx.fillStyle = '#555555';
                            ctx.fillRect(px + 6, py + 8, 3, 3);
                            ctx.fillRect(px + ts - 10, py + 18, 3, 3);
                        }
                        break;

                    case 3: // Mystery box
                        ctx.fillStyle = t.mystery;
                        ctx.fillRect(px, py, ts, ts);
                        ctx.strokeStyle = '#7A5C00';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(px + 1, py + 1, ts - 2, ts - 2);
                        ctx.lineWidth = 1;
                        ctx.fillStyle = 'rgba(255,255,200,0.6)';
                        ctx.fillRect(px + 4, py + 4, 6, 2);
                        ctx.fillRect(px + 4, py + 6, 2, 4);
                        ctx.fillStyle = 'rgba(200,130,0,0.35)';
                        ctx.fillRect(px + 14, py + 12, 4, 4);
                        ctx.fillRect(px + 20, py + 18, 4, 4);
                        break;

                    case 8: // Used mystery box
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
                        ctx.fillStyle = this.levelIndex === 2 ? '#4a2870' : '#00AA00';
                        ctx.fillRect(px + 2, py, 4, ts);
                        ctx.strokeStyle = '#000';
                        ctx.strokeRect(px, py, ts, ts);
                        break;

                    case 5: // Finish
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

                    case 9: { // Lava tile (Poison for Level 5)
                        const now = performance.now();
                        const isPoison = (this.levelIndex === 5);
                        
                        // Base lava color
                        ctx.fillStyle = isPoison ? '#114411' : '#CC2200';
                        ctx.fillRect(px, py, ts, ts);
                        
                        // Animated surface bubbles
                        const bub1 = Math.sin(now / 300 + x * 0.7) * 0.3 + 0.5;
                        const bub2 = Math.sin(now / 200 + x * 1.3 + y) * 0.3 + 0.5;
                        ctx.fillStyle = isPoison ? `rgba(60, 200, 20, ${bub1})` : `rgba(255, 160, 0, ${bub1})`;
                        ctx.fillRect(px + 4, py + 4 + Math.sin(now / 400 + x) * 3, 10, 8);
                        ctx.fillStyle = isPoison ? `rgba(150, 255, 50, ${bub2})` : `rgba(255, 220, 50, ${bub2})`;
                        ctx.fillRect(px + 18, py + 8 + Math.sin(now / 350 + x * 2) * 4, 8, 6);
                        
                        // Glow on top edge
                        if (y > 0 && this.tiles[y - 1] && this.tiles[y - 1][x] === 0) {
                            ctx.fillStyle = isPoison ? 'rgba(80, 255, 20, 0.4)' : 'rgba(255, 100, 0, 0.4)';
                            ctx.fillRect(px, py - 4, ts, 6);
                            
                            // Poison Smoke rising
                            if (isPoison && x % 2 === 0) {
                                ctx.fillStyle = `rgba(100, 255, 50, ${0.1 + Math.sin(now/500 + x) * 0.1})`;
                                const sx = px + (Math.sin(now/1000 + x) * 5) + ts/2;
                                const sy = py - 10 - ((now/50 + x*10) % 20);
                                ctx.beginPath();
                                ctx.arc(sx, sy, 4 + Math.sin(now/200)*2, 0, Math.PI*2);
                                ctx.fill();
                            }
                        }
                        break;
                    }

                    case 10: { // Speed boost panel
                        const now = performance.now();
                        ctx.fillStyle = '#0A0A2E';
                        ctx.fillRect(px, py, ts, ts);
                        // Animated teal strips
                        ctx.fillStyle = '#00AAAA';
                        ctx.fillRect(px, py + 8, ts, 4);
                        ctx.fillRect(px, py + 20, ts, 4);
                        // Flowing light effect
                        const flowX = (now / 5 + x * 20) % ts;
                        ctx.fillStyle = '#00FFFF';
                        ctx.fillRect(px + flowX, py + 8, 8, 4);
                        ctx.fillRect(px + ((flowX + 16) % ts), py + 20, 8, 4);
                        // Arrow chevrons
                        ctx.strokeStyle = '#00FFFF';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(px + 8, py + 14);
                        ctx.lineTo(px + 16, py + 10);
                        ctx.lineTo(px + 24, py + 14);
                        ctx.stroke();
                        break;
                    }

                    case 11: { // Electric fence
                        const now = performance.now();
                        const cycle = now % 4000;
                        const fenceOn = cycle < 2000; // 2s on, 2s off
                        // Post
                        ctx.fillStyle = '#2A2A4A';
                        ctx.fillRect(px + 12, py, 8, ts);
                        if (fenceOn) {
                            // Crackling electric barrier
                            ctx.globalAlpha = 0.6 + Math.sin(now / 30) * 0.3;
                            ctx.fillStyle = '#FFFF00';
                            ctx.fillRect(px + 4, py, 24, ts);
                            ctx.fillStyle = '#00FFFF';
                            ctx.fillRect(px + 8, py + 2, 16, ts - 4);
                            // Sparks
                            for (let s = 0; s < 3; s++) {
                                const sx = px + 8 + Math.random() * 16;
                                const sy = py + Math.random() * ts;
                                ctx.fillStyle = '#FFFFFF';
                                ctx.fillRect(sx, sy, 2, 2);
                            }
                            ctx.globalAlpha = 1.0;
                        } else {
                            // Dim post only
                            ctx.fillStyle = '#1A1A3A';
                            ctx.fillRect(px + 14, py + 2, 4, ts - 4);
                        }
                        break;
                    }

                    case 12: { // Wire hole (Level 6)
                        const now = performance.now();
                        ctx.fillStyle = '#261C14'; // Dark oil/mud
                        ctx.fillRect(px, py, ts, ts);
                        ctx.strokeStyle = '#D9A426'; // Yellow warning wire
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(px, py + ts*0.8);
                        ctx.quadraticCurveTo(px + ts/2, py + ts*0.4, px + ts, py + ts*0.9);
                        ctx.stroke();
                        ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
                        if (Math.random() > 0.9) {
                            ctx.fillRect(px + Math.random() * ts, py + Math.random() * ts, 3, 3);
                        }
                        break;
                    }

                    case 13: { // Electronic Block (Level 6 & 10)
                        if (this.levelIndex === 6) {
                            // Junkyard Block
                            ctx.fillStyle = '#5A4A3A';
                            ctx.fillRect(px, py, ts, ts);
                            ctx.strokeStyle = '#D9A426'; // Yellow stripe
                            ctx.lineWidth = 4;
                            ctx.beginPath();
                            ctx.moveTo(px, py+ts/2); ctx.lineTo(px+ts, py+ts/2);
                            ctx.stroke();
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = '#2A1F18';
                            ctx.strokeRect(px, py, ts, ts);
                            // Rusty spots
                            ctx.fillStyle = '#8B4513';
                            ctx.fillRect(px + 4, py + 4, 6, 4);
                            ctx.fillRect(px + ts - 8, py + ts - 8, 4, 6);
                        } else {
                            const isRed = this.levelIndex === 10 && !this.omnitrixFixed;
                            const isGreen = this.levelIndex === 10 && this.omnitrixFixed;
                            const activeColor = isRed ? '#F00' : (isGreen ? '#0F0' : '#00FFCC');

                            ctx.fillStyle = isRed ? '#2A0505' : (isGreen ? '#052A05' : '#1A1A24');
                            ctx.fillRect(px, py, ts, ts);
                            ctx.strokeStyle = activeColor;
                            ctx.beginPath();
                            ctx.moveTo(px, py+ts/2); ctx.lineTo(px+ts, py+ts/2);
                            ctx.moveTo(px+ts/2, py); ctx.lineTo(px+ts/2, py+ts);
                            ctx.stroke();
                            ctx.strokeRect(px, py, ts, ts);
                            ctx.fillStyle = activeColor;
                            ctx.fillRect(px + 14, py + 14, 4, 4);
                            if (Math.random() > 0.99) {
                                ctx.fillStyle = '#FFFFFF';
                                ctx.fillRect(px + ts/2 - 2, py + ts/2 - 2, 4, 4);
                            }
                        }
                        break;
                    }

                    case 14: { // Block of leaves
                        ctx.fillStyle = '#4CA62B'; // Base leaf green
                        ctx.fillRect(px, py, ts, ts);
                        
                        // Leafy highlights
                        ctx.fillStyle = '#65C23D'; 
                        ctx.beginPath();
                        ctx.arc(px + 8, py + 8, 6, 0, Math.PI * 2);
                        ctx.arc(px + 22, py + 12, 8, 0, Math.PI * 2);
                        ctx.arc(px + 16, py + 24, 7, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Leafy shadows
                        ctx.fillStyle = '#317A16'; 
                        ctx.beginPath();
                        ctx.arc(px + 24, py + 24, 6, 0, Math.PI * 2);
                        ctx.arc(px + 8, py + 22, 5, 0, Math.PI * 2);
                        ctx.arc(px + 14, py + 6, 4, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.strokeStyle = '#23570F'; // Dark border
                        ctx.strokeRect(px, py, ts, ts);
                        break;
                    }
                }
            }
        }

        // ── Level 9 Water Overlay ──────────────────────────────────
        if (this.levelIndex === 9 && this.waterStartX) {
            ctx.fillStyle = 'rgba(0, 60, 110, 0.2)';
            ctx.fillRect(this.waterStartX, -1000, this.width - this.waterStartX, this.height + 2000);

            // Light Rays
            ctx.save();
            ctx.globalAlpha = 0.05;
            ctx.fillStyle = '#FFFFFF';
            const now = performance.now();
            for (let i = 0; i < 6; i++) {
                const rx = this.waterStartX + 100 + i * 400 + Math.sin(now / 2500 + i) * 80;
                ctx.beginPath();
                ctx.moveTo(rx, -1000);
                ctx.lineTo(rx + 120, -1000);
                ctx.lineTo(rx + 40, this.height + 1000);
                ctx.lineTo(rx - 80, this.height + 1000);
                ctx.fill();
            }
            ctx.restore();
            
            // Bubbles
            ctx.fillStyle = 'rgba(210, 250, 255, 0.42)';
            for (let i = 0; i < 75; i++) {
                const bx = this.waterStartX + ((i * 153 + now/20) % (this.width - this.waterStartX));
                const by = (this.height + 500) - ((i * 77 + now/30) % (this.height + 1000));
                ctx.beginPath();
                ctx.arc(bx, by + Math.sin(now/500 + i)*10, 3 + (i%4), 0, Math.PI*2);
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
                ctx.stroke();
            }

            ctx.strokeStyle = 'rgba(35, 155, 70, 0.55)';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            for (let i = 0; i < 26; i++) {
                const sx = this.waterStartX + 45 + i * 135;
                const baseY = this.height - 32;
                const sway = Math.sin(now / 700 + i) * 20;
                ctx.beginPath();
                ctx.moveTo(sx, baseY);
                ctx.quadraticCurveTo(sx + sway, baseY - 58, sx + sway * 0.4, baseY - 124);
                ctx.stroke();
            }
        }

        // ── Flag Pole + Kurdistan Flag (post-pass) ──────────────────
        this.finishCols.forEach(({ topRow, bottomRow }, col) => {
            const poleX = col * ts + ts / 2;
            const poleTop = topRow * ts;
            const poleBot = (bottomRow + 1) * ts;

            ctx.fillStyle = '#7A5C00';
            ctx.fillRect(poleX - 3, poleTop, 6, poleBot - poleTop);

            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(poleX, poleTop + 6, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#7A5C00';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Kurdistan Flag (LEFT of pole)
            const FW = 80;
            const FH = 48;
            const fx = poleX - 6 - FW;
            const fy = poleTop + 2;
            const SH = FH / 3;

            const PSIZE = 8;
            const stripeColors = ['#D8232A', '#FFFFFF', '#007A3D'];
            for (let si = 0; si < 3; si++) {
                ctx.fillStyle = stripeColors[si];
                for (let bx = 0; bx < FW; bx += PSIZE) {
                    const bw = Math.min(PSIZE, FW - bx);
                    ctx.fillRect(fx + bx, fy + si * SH, bw, SH);
                }
            }

            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 2;
            ctx.strokeRect(fx, fy, FW, FH);
            ctx.lineWidth = 1;

            // Pixelated Sun
            const sunX = fx + FW / 2;
            const sunY = fy + FH / 2;
            const INNER_R = 7;
            const OUTER_R = 13;
            const RAY_COUNT = 21;

            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            for (let i = 0; i < RAY_COUNT; i++) {
                const angle = (i * 2 * Math.PI / RAY_COUNT) - Math.PI / 2;
                const x1 = sunX + Math.cos(angle) * (INNER_R + 1);
                const y1 = sunY + Math.sin(angle) * (INNER_R + 1);
                const x2 = sunX + Math.cos(angle) * OUTER_R;
                const y2 = sunY + Math.sin(angle) * OUTER_R;
                ctx.beginPath();
                ctx.moveTo(Math.round(x1 / 2) * 2, Math.round(y1 / 2) * 2);
                ctx.lineTo(Math.round(x2 / 2) * 2, Math.round(y2 / 2) * 2);
                ctx.stroke();
            }

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

    /**
     * Draws a full-screen Thermal / Infrared vision overlay.
     * Call AFTER all game entities are drawn, BEFORE UI.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} screenW
     * @param {number} screenH
     */
    drawThermalOverlay(ctx, screenW, screenH) {
        ctx.save();

        // Lighter tint — brighter centre, softer vignette edge
        const tint = ctx.createRadialGradient(
            screenW / 2, screenH / 2, screenH * 0.1,
            screenW / 2, screenH / 2, screenH * 0.75
        );
        tint.addColorStop(0, 'rgba(0,30,0,0.15)');   // near-transparent at centre
        tint.addColorStop(1, 'rgba(0,10,0,0.50)');   // soft dark-green vignette at edges
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, screenW, screenH);

        // Subtle green colour-cast so world still feels infrared
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#00FF44';
        ctx.fillRect(0, 0, screenW, screenH);
        ctx.globalAlpha = 1.0;

        // Very subtle scanlines (half as strong as before)
        ctx.globalAlpha = 0.04;
        ctx.fillStyle = '#000000';
        for (let sy = 0; sy < screenH; sy += 4) {
            ctx.fillRect(0, sy, screenW, 2);
        }
        ctx.globalAlpha = 1.0;

        // HUD hint
        ctx.fillStyle = 'rgba(0,255,100,0.6)';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('[ THERMAL VISION ACTIVE ]', screenW / 2 - 90, 22);

        ctx.restore();
    }

    drawLevel9WaterDarkness(ctx, mario) {
        if (this.levelIndex !== 9 || !this.waterStartX) return;

        const overlayTop = -1000;
        const overlayHeight = this.height + 2000;
        const overlayWidth = this.width - this.waterStartX;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 8, 20, 0.38)';
        ctx.fillRect(this.waterStartX, overlayTop, overlayWidth, overlayHeight);

        if (mario && mario.state === 'RIPJAWS' && mario.inWater) {
            const light = mario.getRipjawsLightPosition();
            const visibilityMask = ctx.createRadialGradient(light.x, light.y, 20, light.x, light.y, 420);
            visibilityMask.addColorStop(0, 'rgba(0, 8, 20, 0)');
            visibilityMask.addColorStop(0.2, 'rgba(0, 8, 20, 0.015)');
            visibilityMask.addColorStop(0.45, 'rgba(0, 8, 20, 0.05)');
            visibilityMask.addColorStop(0.75, 'rgba(0, 8, 20, 0.16)');
            visibilityMask.addColorStop(1, 'rgba(0, 8, 20, 0.42)');
            ctx.fillStyle = visibilityMask;
            ctx.fillRect(this.waterStartX, overlayTop, overlayWidth, overlayHeight);

            const frontBiasX = light.x + (mario.facingRight ? 120 : -120);
            const coneMask = ctx.createRadialGradient(frontBiasX, light.y + 10, 16, frontBiasX, light.y + 10, 320);
            coneMask.addColorStop(0, 'rgba(0, 8, 20, 0.01)');
            coneMask.addColorStop(0.45, 'rgba(0, 8, 20, 0.045)');
            coneMask.addColorStop(1, 'rgba(0, 8, 20, 0.16)');
            ctx.fillStyle = coneMask;
            ctx.fillRect(this.waterStartX, overlayTop, overlayWidth, overlayHeight);

            ctx.globalCompositeOperation = 'screen';
            const glow = ctx.createRadialGradient(light.x, light.y, 6, light.x, light.y, 240);
            glow.addColorStop(0, 'rgba(255, 255, 220, 0.4)');
            glow.addColorStop(0.35, 'rgba(140, 220, 255, 0.2)');
            glow.addColorStop(1, 'rgba(140, 220, 255, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(this.waterStartX, overlayTop, overlayWidth, overlayHeight);
        }
        else {
            const darkSea = ctx.createLinearGradient(this.waterStartX, 0, this.waterStartX, this.height);
            darkSea.addColorStop(0, 'rgba(0, 8, 20, 0.22)');
            darkSea.addColorStop(0.5, 'rgba(0, 8, 20, 0.34)');
            darkSea.addColorStop(1, 'rgba(0, 8, 20, 0.5)');
            ctx.fillStyle = darkSea;
            ctx.fillRect(this.waterStartX, overlayTop, overlayWidth, overlayHeight);
        }

        ctx.restore();
    }

}
