import { Goomba } from './src/entities/Goomba.js';
import { Mario } from './src/entities/Mario_v2.js';
import { Level } from './src/level/Level_v2.js';
import { Input } from './src/core/Input.js';
import { FourArmsItem } from './src/entities/FourArmsItem.js';
import { OmnitrixItem } from './src/entities/OmnitrixItem.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = 1024;
const GAME_HEIGHT = 768;

// ─── UI Elements ─────────────────────────────
const modal = document.getElementById('level-complete-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const btnNext = document.getElementById('btn-next-level');
const btnRestart = document.getElementById('btn-restart');

const omnitrixIntro = document.getElementById('omnitrix-intro');
const btnOmnitrixOk = document.getElementById('btn-omnitrix-ok');
const omnitrixPanel = document.getElementById('omnitrix-panel');
const alienGrid = document.getElementById('alien-grid');

// ─── Alien Roster Definition ─────────────────
// 10 slots (keys 0–9). Add more here as levels unlock them.
const ALIENS = [
    { key: '0', name: 'Four Arms', icon: '💪', unlocked: false },
    { key: '1', name: '???', icon: '👾', unlocked: false },
    { key: '2', name: '???', icon: '👾', unlocked: false },
    { key: '3', name: '???', icon: '👾', unlocked: false },
    { key: '4', name: '???', icon: '👾', unlocked: false },
    { key: '5', name: '???', icon: '👾', unlocked: false },
    { key: '6', name: '???', icon: '👾', unlocked: false },
    { key: '7', name: '???', icon: '👾', unlocked: false },
    { key: '8', name: '???', icon: '👾', unlocked: false },
    { key: '9', name: '???', icon: '👾', unlocked: false },
];

// ─── Build the alien grid HTML ────────────────
function renderAlienGrid() {
    alienGrid.innerHTML = '';
    let introMsg = '';
    ALIENS.forEach((alien, i) => {
        const slot = document.createElement('div');
        slot.className = 'alien-slot ' + (alien.unlocked ? 'unlocked' : 'locked');
        slot.innerHTML = `
            <span class="slot-key">[${alien.key}]</span>
            <span class="slot-icon">${alien.icon}</span>
            <span class="slot-name">${alien.unlocked ? alien.name : '???'}</span>
        `;
        if (alien.unlocked) {
            slot.title = `Press ${alien.key} to transform into ${alien.name}`;
            slot.addEventListener('click', () => activateAlien(i));
            if (alien.introMessage) introMsg = alien.introMessage;
        }
        alienGrid.appendChild(slot);
    });
    // Show intro message if any alien was just unlocked
    const hintBar = document.getElementById('panel-hint-bar');
    if (introMsg) {
        hintBar.innerHTML = `<span style="color:#FFD700;font-size:12px;">${introMsg}</span><br><br>Press <b>0–9</b> to transform • <b>C</b> to close`;
    } else {
        hintBar.innerHTML = `Press <b>0–9</b> to transform • <b>C</b> to close`;
    }
}
renderAlienGrid();

// ─── Omnitrix Panel State ─────────────────────
let omnitrixPanelOpen = false;

function openOmnitrixPanel() {
    if (!mario.hasWatch) return;
    omnitrixPanelOpen = true;
    omnitrixPanel.style.display = 'flex';
}

function closeOmnitrixPanel() {
    omnitrixPanelOpen = false;
    omnitrixPanel.style.display = 'none';
}

// Show intro popup (called once when watch is collected)
function showOmnitrixIntro() {
    omnitrixIntro.style.display = 'flex';
    gameState = 'PAUSED'; // Freeze the game while popup shows
}

btnOmnitrixOk.addEventListener('click', () => {
    omnitrixIntro.style.display = 'none';
    gameState = 'PLAYING';
});

// ─── Alien Activation ────────────────────────
function activateAlien(index) {
    const alien = ALIENS[index];
    if (!alien.unlocked) return;

    closeOmnitrixPanel();

    // Clear intro message after first use
    alien.introMessage = null;
    renderAlienGrid();

    if (alien.name === 'Four Arms') {
        mario.transformToFourArms();
    }
    // Future aliens: add more cases here
}

// ─── Core state ──────────────────────────────
const input = new Input();
let lastTime = 0;
let currentLevelIndex = 1;
let level, mario;
const entities = [];
let gameState = 'PLAYING';

// Ground Pound shockwave effect
const shockwaves = []; // {x, y, radius, maxRadius, alpha}
let screenShake = 0;

let specialBoxPos = null;   // {x, y} column/row of the one box with the upgrade
let levelTitleTimer = 0;     // timestamp when current level loaded (for title fade)

function assignBlockHit() {
    mario.onBlockHit = (tileType, bx, by) => {
        if (tileType === 3) {
            const gx = Math.round(bx / level.tileSize);
            const gy = Math.round(by / level.tileSize);

            if (level.tiles[gy] && level.tiles[gy][gx] === 3) {
                level.tiles[gy][gx] = 8; // Change to used box
            }

            // Decide item
            let ItemClass = Goomba;
            if (specialBoxPos && gx === specialBoxPos.x && gy === specialBoxPos.y) {
                if (currentLevelIndex == 1) ItemClass = OmnitrixItem;
                else if (currentLevelIndex == 2) ItemClass = FourArmsItem;
            }

            entities.push(new ItemClass(bx, by - 32));
        }
    };
}

function loadLevel(index, carryOverState = null) {
    currentLevelIndex = index;
    level = new Level(index);

    const startY = (level.rows - 4) * level.tileSize;
    mario = new Mario(100, startY, input);

    if (carryOverState && carryOverState.hasWatch) {
        mario.hasWatch = true;
        if (carryOverState.alienState === 'FOURARMS') {
            mario.transformToFourArms();
        }
    }

    // ── Pick ONE random box per level to have the special item ──
    specialBoxPos = null;
    const allBoxes = [];
    for (let y = 0; y < level.rows; y++) {
        for (let x = 0; x < level.cols; x++) {
            if (level.tiles[y][x] === 3) allBoxes.push({ x, y });
        }
    }
    if (allBoxes.length > 0) {
        specialBoxPos = allBoxes[Math.floor(Math.random() * allBoxes.length)];
        console.log(`Special item for Level ${index} hidden at:`, specialBoxPos);
    }

    assignBlockHit();
    entities.length = 0;
    level.entities.forEach(entityData => {
        if (entityData.type === 'goomba') {
            entities.push(new Goomba(entityData.x, entityData.y));
        }
    });

    levelTitleTimer = performance.now(); // start title fade
    gameState = 'PLAYING';
    modal.style.display = 'none';
    closeOmnitrixPanel();
    canvas.classList.toggle('level2-theme', index === 2);
}

loadLevel(1);

// ─── Modal Buttons ────────────────────────────
btnNext.addEventListener('click', () => {
    loadLevel(currentLevelIndex + 1, { hasWatch: mario.hasWatch });
});

btnRestart.addEventListener('click', () => {
    loadLevel(currentLevelIndex, { hasWatch: mario.hasWatch, alienState: mario.state });
});

function showLevelModal(title, message, showNext) {
    gameState = 'WON';
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    btnNext.style.display = showNext ? 'block' : 'none';
    modal.style.display = 'flex';
}

// ─── Input: C key, F key & 0–9 keys (one-shot keydown) ─────────
window.addEventListener('keydown', (e) => {
    // Toggle Omnitrix panel with C
    if (e.code === 'KeyC' && mario && mario.hasWatch && gameState !== 'PAUSED') {
        omnitrixPanelOpen ? closeOmnitrixPanel() : openOmnitrixPanel();
        e.preventDefault();
    }
    // Ground Pound with F — works in FOURARMS state, from air OR ground
    if (e.code === 'KeyF' && mario && mario.state === 'FOURARMS' && gameState === 'PLAYING' && !mario.groundPounding) {
        const now = performance.now();
        const cooldownMs = 1500; // 1.5 seconds
        if (now - mario.groundPoundCooldown > cooldownMs) {
            if (mario.grounded) {
                // On ground: hop up first, then slam
                mario.vy = -10;
                mario.grounded = false;
                setTimeout(() => {
                    if (mario && mario.state === 'FOURARMS' && !mario.groundPounding) {
                        mario.groundPounding = true;
                    }
                }, 200); // slam after 200ms of hop
            } else {
                // Already in air: slam immediately
                mario.groundPounding = true;
            }
            console.log('GROUND POUND TRIGGERED! grounded=', mario.grounded);
        } else {
            console.log('Ground pound on cooldown:', Math.round(cooldownMs - (now - mario.groundPoundCooldown)), 'ms left');
        }
    }
    // Number keys 0–9 transform when panel is open
    if (omnitrixPanelOpen) {
        const idx = parseInt(e.key);
        if (!isNaN(idx) && idx >= 0 && idx <= 9) {
            activateAlien(idx);
        }
    }
});

// ─── Main Game Loop ───────────────────────────
function gameLoop(timestamp) {
    try {
        const deltaTime = Math.min(timestamp - lastTime, 50);
        lastTime = timestamp;

        // W toggle and number keys are handled by the keydown listener above

        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        ctx.save();
        let camX = mario.x - GAME_WIDTH / 2;
        camX = Math.max(0, Math.min(camX, level.width - GAME_WIDTH));

        // Screen shake offset
        let shakeX = 0, shakeY = 0;
        if (screenShake > 0) {
            shakeX = (Math.random() - 0.5) * screenShake;
            shakeY = (Math.random() - 0.5) * screenShake;
            screenShake -= 0.5;
        }
        ctx.translate(-camX + shakeX, shakeY);

        if (gameState === 'PLAYING') {
            mario.update(deltaTime, level);

            // ── Win Detection ─────────────────
            const gridY = Math.floor((mario.y + mario.height / 2) / level.tileSize);
            const gridX = Math.floor((mario.x + mario.width / 2) / level.tileSize);
            const gridRight = Math.floor((mario.x + mario.width + 1) / level.tileSize);

            if ((level.tiles[gridY] && level.tiles[gridY][gridX] === 5) ||
                (level.tiles[gridY] && level.tiles[gridY][gridRight] === 5)) {

                if (currentLevelIndex === 1) {
                    showLevelModal('LEVEL 1 COMPLETE!', 'You are the chosen guard for the universe.', true);
                } else {
                    mario.victory = true;
                    showLevelModal('YOU WIN!', 'The universe is safe… for now.', false);
                }
            }

            // ── Unstable Ground Crumble ───────
            if (mario.grounded) {
                const footY = Math.floor((mario.y + mario.height) / level.tileSize);
                const footL = Math.floor(mario.x / level.tileSize);
                const footR = Math.floor((mario.x + mario.width - 1) / level.tileSize);
                for (const fx of [footL, footR]) {
                    if (level.tiles[footY] && level.tiles[footY][fx] === 7) {
                        // Check if already tracked
                        if (!level.unstableTiles.find(u => u.x === fx && u.y === footY)) {
                            level.unstableTiles.push({ x: fx, y: footY, timer: performance.now() });
                        }
                    }
                }
            }
            // Process crumbling tiles
            const now = performance.now();
            for (let i = level.unstableTiles.length - 1; i >= 0; i--) {
                const ut = level.unstableTiles[i];
                if (now - ut.timer > 500) { // 0.5 second delay
                    level.tiles[ut.y][ut.x] = 0; // Remove tile!
                    level.unstableTiles.splice(i, 1);
                }
            }

            // ── Entities ──────────────────────
            entities.forEach(entity => {
                entity.update(deltaTime, level);
                if (entity.dead) return;

                if (checkEntityCollision(mario, entity)) {
                    if (entity.type === 'fourarms_item') {
                        entity.dead = true;
                        // Don't transform directly! Unlock in watch and show panel with message.
                        ALIENS[0].unlocked = true;
                        ALIENS[0].introMessage = 'My name is Four Arms. If you need me, press "0".';
                        renderAlienGrid();
                        // Show the Omnitrix panel with the alien's intro
                        openOmnitrixPanel();

                    } else if (entity.type === 'omnitrix_item') {
                        entity.dead = true;
                        mario.hasWatch = true;
                        showOmnitrixIntro(); // show the popup!

                    } else if (entity.type === 'goomba') {
                        if (mario.vy > 0 && mario.y + mario.height < entity.y + entity.height / 2 + 10) {
                            entity.dead = true;
                            mario.vy = -8;
                        } else {
                            if (mario.state === 'FOURARMS') {
                                mario.state = 'SMALL';
                                mario.width = 32;
                                mario.height = 32;
                                mario.y += 32;
                                mario.vy = -5;
                                entity.dead = true;
                            } else {
                                gameState = 'GAMEOVER';
                            }
                        }
                    }
                }
            });

            // Remove dead entities
            for (let i = entities.length - 1; i >= 0; i--) {
                if (entities[i].dead) entities.splice(i, 1);
            }

            // ── Ground Pound Impact ───────────
            if (mario.groundPoundLanded) {
                mario.groundPoundLanded = false;
                screenShake = 12; // frames of shake

                // Create shockwave visual
                const cx = mario.x + mario.width / 2;
                const cy = mario.y + mario.height;
                shockwaves.push({ x: cx, y: cy, radius: 10, maxRadius: 160, alpha: 1.0 });

                // Kill enemies within radius
                const KILL_RADIUS = 160;
                entities.forEach(entity => {
                    if (entity.dead || entity.type !== 'goomba') return;
                    const ex = entity.x + entity.width / 2;
                    const ey = entity.y + entity.height / 2;
                    const dist = Math.sqrt((cx - ex) ** 2 + (cy - ey) ** 2);
                    if (dist < KILL_RADIUS) {
                        entity.dead = true;
                    }
                });
            }

            if (mario.y > GAME_HEIGHT + 100) {
                gameState = 'GAMEOVER';
            }

        } else if (gameState === 'GAMEOVER') {
            if (input.isDown('Space')) {
                loadLevel(currentLevelIndex, { hasWatch: mario.hasWatch, alienState: mario.state });
            }
        }

        // ── Draw ──────────────────────────────
        level.draw(ctx);
        entities.forEach(entity => entity.draw(ctx));
        mario.draw(ctx);

        // ── Draw Shockwaves ───────────────────
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            const sw = shockwaves[i];
            sw.radius += 6;
            sw.alpha -= 0.03;
            if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
                shockwaves.splice(i, 1);
                continue;
            }
            ctx.strokeStyle = `rgba(255, 80, 0, ${sw.alpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
            // Inner ring
            ctx.strokeStyle = `rgba(255, 200, 50, ${sw.alpha * 0.6})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius * 0.6, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.lineWidth = 1; // reset

        // Draw ground pound indicator when slamming
        if (mario.groundPounding) {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(mario.x + mario.width / 2, mario.y + mario.height, 20, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // ── Level Title Fade ──────────────────────────────────────
        const titleAge = performance.now() - levelTitleTimer;
        const titleDur = 3500;
        if (titleAge < titleDur) {
            const alpha = titleAge < titleDur - 600
                ? Math.min(1, titleAge / 400)
                : (titleDur - titleAge) / 600;
            const titles = [
                '',
                'Find the Mystery Watch!',
                'The Four Arms Level',
            ];
            const subtitle = titles[currentLevelIndex] || `Level ${currentLevelIndex}`;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.fillRect(GAME_WIDTH / 2 - 230, GAME_HEIGHT / 3 - 38, 460, 80);
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`LEVEL ${currentLevelIndex}`, GAME_WIDTH / 2, GAME_HEIGHT / 3 - 10);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 26px sans-serif';
            ctx.fillText(subtitle, GAME_WIDTH / 2, GAME_HEIGHT / 3 + 24);
            ctx.textAlign = 'left';
            ctx.restore();
        }

        // ── HUD ───────────────────────────────
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(8, 8, 280, 32);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        const hudWatch = mario.hasWatch ? ' ⌚[C]' : '';
        const hudAlien = mario.state === 'FOURARMS' ? ' 💪' : '';
        const gpReady = mario.state === 'FOURARMS' && (performance.now() - mario.groundPoundCooldown > 3000);
        const hudGP = mario.state === 'FOURARMS' ? (gpReady ? ' [F]🥊' : ' [F]⏳') : '';
        ctx.fillText(`Level ${currentLevelIndex}${hudWatch}${hudAlien}${hudGP}`, 18, 30);

        // ── GAME OVER ─────────────────────────
        if (gameState === 'GAMEOVER') {
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            ctx.fillStyle = '#FF4444';
            ctx.font = 'bold 60px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2);
            ctx.fillStyle = 'white';
            ctx.font = '22px sans-serif';
            ctx.fillText('Press Space to Restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
        }

        requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error(e);
        ctx.resetTransform();
        ctx.fillStyle = 'red';
        ctx.font = '20px monospace';
        ctx.fillText('Error: ' + e.message, 50, 50);
        ctx.fillText('Check console for details', 50, 80);
    }
}

function checkEntityCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Start!
requestAnimationFrame(gameLoop);
