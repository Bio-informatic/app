export class Level {
    constructor(levelIndex) {
        console.log("Level_v2 created, index:", levelIndex);
        this.tileSize = 32;
        this.tiles = [];
        this.entities = [];
        this.levelIndex = levelIndex;
        this.unstableTiles = [];

        let map = [];

        // LEVEL GENERATION
        if (levelIndex >= 1 && levelIndex <= 9) {
            const ROWS = 24;
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
                            map[py][curX + px] = levelIndex === 6 ? eBlockChar : brickChar;
                        }
                    }
                }

                // Brick Rule 2: Floating bricks, 1 to 3 blocks above ground OR ground bricks
                let floatingY = -1;
                if (hasFloatingBricks) {
                    const space = Math.floor(Math.random() * 3) + 1;
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
                        if (levelIndex === 9) goombaType = 'jellyfish_goomba';
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
            }

            // ── Level 8 Boss Arena (Night King) ───────────────────
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
                // Place Night King
                this.entities.push({
                    x: (bossZoneStart + 25) * TS,
                    y: (GROUND_Y - 4) * TS,
                    type: 'night_king'
                });
                
                this.entities.push({
                    x: (bossZoneStart + 10) * TS,
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
                    x: (COLS - 15) * TS,
                    y: (ROWS - 8) * TS,
                    type: 'great_octopus'
                });
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
                else if (char === 'E' && levelIndex !== 6) this.tiles[y][x] = 11; // Electric fence
                // In Level 6, E is electronic block
                else if (char === 'E' && levelIndex === 6) this.tiles[y][x] = 13;
                else if (char === 'W') this.tiles[y][x] = 12; // Wire hole
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
        if (this.levelIndex === 8) {
            return {
                sky:            '#0A1A2A',   // Deep icy night sky
                ground:         '#E0F0FF',   // Snow
                groundStroke:   '#A0C0E0',
                brick:          '#80D0FF',   // Ice blocks
                brickStroke:    '#0080FF',
                mystery:        '#00FFFF',   // Cyan crystal box
                pipe:           '#004080',
                unstable:       '#B0E0FF',
                unstableStroke: '#60A0FF',
                cloud:          'rgba(200, 240, 255, 0.15)', // Frost fog
            };
        }
        if (this.levelIndex === 7) {
            return {
                sky:            '#1A3A0A',   // deep jungle green sky
                ground:         '#2E5A0E',
                groundStroke:   '#1A3A08',
                brick:          '#3D6B1A',
                brickStroke:    '#2A4D10',
                mystery:        '#AAFF44',
                pipe:           '#1A4A05',
                unstable:       '#5A7A20',
                unstableStroke: '#3A5A10',
                cloud:          'rgba(100, 200, 50, 0.12)',
            };
        }
        if (this.levelIndex === 6) {
            return {
                sky:            '#0A0A0C',
                ground:         '#1A1A24',
                groundStroke:   '#111118',
                brick:          '#2A2A35',
                brickStroke:    '#111122',
                mystery:        '#00FFCC',
                pipe:           '#151520',
                unstable:       '#1F6FEB',
                unstableStroke: '#388BFD',
                cloud:          'rgba(0, 255, 150, 0.05)'
            };
        }
        if (this.levelIndex === 5) {
            return {
                sky:            '#0A1A0A',
                ground:         '#1A331A',
                groundStroke:   '#081908',
                brick:          '#224422',
                brickStroke:    '#112211',
                mystery:        '#00FF88',
                pipe:           '#003300',
                unstable:       '#335533',
                unstableStroke: '#1A2A1A',
                cloud:          'rgba(50, 200, 50, 0.1)',
            };
        }
        if (this.levelIndex === 4) {
            return {
                sky:            '#050520',
                ground:         '#1A1A2E',
                groundStroke:   '#0A0A1E',
                brick:          '#3A3A5A',
                brickStroke:    '#22224A',
                mystery:        '#00FFFF',
                pipe:           '#1A1A3E',
                unstable:       '#2A2A4A',
                unstableStroke: '#1A1A3A',
                cloud:          'rgba(0, 255, 255, 0.08)',
                speedPanel:     '#00AAAA',
                efence:         '#FFFF00',
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
                sky:            '#1a0505',
                ground:         '#5C1A1A',
                groundStroke:   '#3A0E0E',
                brick:          '#8B2500',
                brickStroke:    '#5C1A00',
                mystery:        '#FFD700',
                pipe:           '#4A0000',
                unstable:       '#8B5C00',
                unstableStroke: '#5C3D00',
                cloud:          'rgba(200, 50, 50, 0.20)',
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
    draw(ctx) {
        const t = this.getTheme();
        const ts = this.tileSize;
        const now = performance.now();

        // Sky
        ctx.fillStyle = t.sky;
        ctx.fillRect(0, -1000, this.width, this.height + 2000);

        // Level 9: deep sea background on the second half
        if (this.levelIndex === 9 && this.waterStartX) {
            const seaGrad = ctx.createLinearGradient(this.waterStartX, -200, this.waterStartX, this.height);
            seaGrad.addColorStop(0, '#07243F');
            seaGrad.addColorStop(0.45, '#04182D');
            seaGrad.addColorStop(1, '#010814');
            ctx.fillStyle = seaGrad;
            ctx.fillRect(this.waterStartX, -1000, this.width - this.waterStartX, this.height + 2000);
        }

        // Level 3: lava glow from below
        if (this.levelIndex === 3) {
            const grad = ctx.createLinearGradient(0, this.height - 200, 0, this.height);
            grad.addColorStop(0, 'rgba(255, 40, 0, 0)');
            grad.addColorStop(1, 'rgba(255, 60, 0, 0.3)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, this.height - 200, this.width, 200);

            // Floating ember particles
            ctx.fillStyle = '#FF6600';
            for (let i = 0; i < 40; i++) {
                const ex = (i * 173 + now / 20) % this.width;
                const ey = this.height - 100 - ((now / 15 + i * 97) % (this.height - 150));
                const sz = 2 + Math.sin(now / 300 + i) * 1;
                ctx.globalAlpha = 0.3 + Math.sin(now / 400 + i * 2) * 0.2;
                ctx.fillRect(ex, ey, sz, sz);
            }
            ctx.globalAlpha = 1.0;
        }

        // Clouds
        if (this.levelIndex === 4) {
            // Digital grid lines
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.04)';
            ctx.lineWidth = 1;
            for (let gx = 0; gx < this.width; gx += 128) {
                ctx.beginPath();
                ctx.moveTo(gx, 0);
                ctx.lineTo(gx, this.height);
                ctx.stroke();
            }
            for (let gy = 0; gy < this.height; gy += 128) {
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(this.width, gy);
                ctx.stroke();
            }
            // Holographic cyan streaks
            ctx.fillStyle = t.cloud;
            for (let i = 0; i < 20; i++) {
                const cx = i * 400 + 60;
                ctx.fillRect(cx, 30 + Math.sin(i * 0.5) * 15, 120, 3);
                ctx.fillRect(cx + 30, 20 + Math.sin(i * 0.5) * 15, 60, 2);
            }
        } else if (this.levelIndex === 5) {
            // Heavy Poison Smog for Sewers
            ctx.fillStyle = t.cloud;
            for (let i = 0; i < 40; i++) {
                const cx = (i * 150 + now / 15) % (this.width + 200) - 100;
                // Layer 1: High Smog
                ctx.fillRect(cx, 20 + Math.sin(i) * 30, 200, 40);
                ctx.fillRect(cx + 30, 50 + Math.sin(i*2) * 20, 150, 30);
                // Layer 2: Low-hanging fog over the map
                ctx.fillRect((cx * 1.5) % this.width, this.height - 250 + Math.sin(i*3) * 50, 300, 50);
            }
        } else if (this.levelIndex === 6) {
            // Destroyed World: Straight broken background wires + Sparks
            const now = performance.now();
            ctx.lineWidth = 4;
            
            for (let i = 0; i < 40; i++) {
                const startX = (i * 150) % this.width;
                const wireLength = 300 + Math.sin(i * 1.5) * 150; // static relative length
                
                let currentY = 0;
                let segIdx = 0;
                while (currentY < wireLength) {
                    const segmentLength = 20 + (Math.sin(i * 3 + segIdx) + 1) * 20; // 20 to 60
                    const gap = 10 + (Math.cos(i + segIdx * 2) + 1) * 8; // 10 to 26
                    
                    ctx.strokeStyle = '#22222E'; // dark inert wire
                    ctx.beginPath();
                    ctx.moveTo(startX, currentY);
                    ctx.lineTo(startX, Math.min(wireLength, currentY + segmentLength));
                    ctx.stroke();
                    
                    // Electric shock spanning the gap
                    if (currentY + segmentLength < wireLength) {
                        if ((now + i * 379 + segIdx * 123) % 2000 < 150) {
                            ctx.strokeStyle = '#00FFCC';
                            ctx.lineWidth = 2 + Math.random() * 2;
                            ctx.beginPath();
                            ctx.moveTo(startX, currentY + segmentLength);
                            const jx = (Math.random() - 0.5) * 25; // spark jitter
                            ctx.quadraticCurveTo(startX + jx, currentY + segmentLength + gap / 2, startX, currentY + segmentLength + gap);
                            ctx.stroke();
                            ctx.lineWidth = 4; // Reset to wire thickness
                        }
                    }
                    
                    currentY += segmentLength + gap;
                    segIdx++;
                }
            }
        } else if (this.levelIndex === 7) {
            // Jungle canopy — animated leaf shapes moving slowly
            ctx.fillStyle = t.cloud;
            for (let i = 0; i < 30; i++) {
                const cx = (i * 200 + now / 25) % (this.width + 200) - 100;
                const cy = 30 + Math.sin(i * 1.3) * 20;
                ctx.fillRect(cx, cy, 80, 30);
                ctx.fillRect(cx + 20, cy - 14, 40, 20);
                ctx.fillRect(cx - 20, cy + 20, 50, 18);
            }
        } else if (this.levelIndex === 8) {
            // Winter is here — falling snow and frost fog
            ctx.fillStyle = t.cloud;
            for (let i = 0; i < 40; i++) {
                // Thick bottom fog
                const cx = (i * 150 + now / 20) % (this.width + 200) - 100;
                ctx.fillRect(cx, this.height - 200 + Math.sin(i) * 30, 200, 50);
                
                // Falling snow
                const sx = (i * 273 + now / 30) % this.width;
                const sy = ((i * 100) + now / (15 + i % 5)) % this.height;
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = 0.5 + Math.random() * 0.5;
                ctx.beginPath();
                ctx.arc(sx, sy, 2 + (i % 3), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;
            
            // Night King global summon effect
            if (this.winterGlowTimer > 0) {
                const ratio = Math.min(1, this.winterGlowTimer / 1000);
                
                // Flash the screen blue/cyan
                ctx.fillStyle = `rgba(0, 200, 255, ${0.4 * ratio})`;
                ctx.fillRect(0, 0, this.width, this.height);
                
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
            ctx.arc(300, 150, 60, 0, Math.PI * 2);
            ctx.fill();

            for (let i = 0; i < 5; i++) {
                const px = i * 800 + 100;
                // Only draw if pyramid is on the land side
                if (px + 500 < this.waterStartX) {
                    // Left side of pyramid
                    ctx.fillStyle = '#D2B48C';
                    ctx.beginPath();
                    ctx.moveTo(px, this.height);
                    ctx.lineTo(px + 250, 250);
                    ctx.lineTo(px + 500, this.height);
                    ctx.fill();
                    
                    // Right shaded side
                    ctx.fillStyle = '#C2B280';
                    ctx.beginPath();
                    ctx.moveTo(px + 250, 250);
                    ctx.lineTo(px + 500, this.height);
                    ctx.lineTo(px + 250, this.height);
                    ctx.fill();
                }
            }
            
            // Standard clouds - only on land side
            ctx.fillStyle = t.cloud;
            for (let i = 0; i < 20; i++) {
                const cx = i * 350 + 60;
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

                ctx.fillStyle = 'rgba(180, 230, 255, 0.12)';
                for (let i = 0; i < 90; i++) {
                    const px = this.waterStartX + ((i * 173 + now / 18) % seaWidth);
                    const py = ((i * 97 + now / 28) % (this.height + 300)) - 120;
                    const r = 1 + (i % 3);
                    ctx.beginPath();
                    ctx.arc(px, py, r, 0, Math.PI * 2);
                    ctx.fill();
                }
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
            // Smoke clouds for hell
            ctx.fillStyle = t.cloud;
            for (let i = 0; i < 25; i++) {
                const cx = i * 280 + 40;
                ctx.fillRect(cx, 40 + Math.sin(i) * 20, 80, 12);
                ctx.fillRect(cx + 20, 28 + Math.sin(i) * 20, 40, 12);
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
                        ctx.fillStyle = t.ground;
                        ctx.fillRect(px, py, ts, ts);
                        ctx.strokeStyle = t.groundStroke;
                        ctx.lineWidth = 1;
                        ctx.strokeRect(px, py, ts, ts);
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
                        ctx.fillStyle = this.levelIndex === 2 ? '#7A1111' : '#00AA00';
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
                        ctx.fillStyle = '#050510';
                        ctx.fillRect(px, py, ts, ts);
                        ctx.strokeStyle = '#00FFCC';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(px + 4, py + ts); ctx.lineTo(px + 10, py + ts*0.2); ctx.lineTo(px + 16, py + ts);
                        ctx.stroke();
                        ctx.strokeStyle = '#A0A0FF';
                        ctx.beginPath();
                        ctx.moveTo(px + 16, py + ts); ctx.lineTo(px + 22, py + ts*0.1); ctx.lineTo(px + 28, py + ts);
                        ctx.stroke();
                        // Occasional sparks
                        if (Math.random() > 0.95) {
                            ctx.fillStyle = '#FFFFFF';
                            ctx.fillRect(px + Math.random() * ts, py + Math.random() * ts, 2, 2);
                        }
                        break;
                    }

                    case 13: { // Electronic Block (Level 6)
                        ctx.fillStyle = '#1A1A24';
                        ctx.fillRect(px, py, ts, ts);
                        ctx.strokeStyle = '#00FFCC';
                        ctx.beginPath();
                        ctx.moveTo(px, py+ts/2); ctx.lineTo(px+ts, py+ts/2);
                        ctx.moveTo(px+ts/2, py); ctx.lineTo(px+ts/2, py+ts);
                        ctx.stroke();
                        ctx.strokeRect(px, py, ts, ts);
                        ctx.fillStyle = '#00FFCC';
                        ctx.fillRect(px + 14, py + 14, 4, 4);
                        if (Math.random() > 0.99) {
                            ctx.fillStyle = '#FFFFFF';
                            ctx.fillRect(px + ts/2 - 2, py + ts/2 - 2, 4, 4);
                        }
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
            ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
            for (let i = 0; i < 50; i++) {
                const bx = this.waterStartX + ((i * 153 + now/20) % (this.width - this.waterStartX));
                const by = (this.height + 500) - ((i * 77 + now/30) % (this.height + 1000));
                ctx.beginPath();
                ctx.arc(bx, by + Math.sin(now/500 + i)*10, 2 + (i%3), 0, Math.PI*2);
                ctx.fill();
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
