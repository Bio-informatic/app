import { Goomba } from './src/entities/Goomba.js';
import { Mario } from './src/entities/Mario_v2.js';
import { Level } from './src/level/Level_v2.js';
import { Input } from './src/core/Input.js';
import { FourArmsItem } from './src/entities/FourArmsItem.js';
import { OmnitrixItem } from './src/entities/OmnitrixItem.js';
import { HeatblastItem } from './src/entities/HeatblastItem.js';
import { Fireball } from './src/entities/Fireball.js';
import { LavaGoomba } from './src/entities/LavaGoomba.js';
import { Goombaba } from './src/entities/Goombaba.js';

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
const ALIENS = [
    { key: '0', name: 'Four Arms', icon: '💪', unlocked: false },
    { key: '1', name: 'Heatblast', icon: '🔥', unlocked: false },
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

function showOmnitrixIntro() {
    omnitrixIntro.style.display = 'flex';
    gameState = 'PAUSED';
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
    alien.introMessage = null;
    renderAlienGrid();

    if (alien.name === 'Four Arms') {
        mario.transformToFourArms();
    } else if (alien.name === 'Heatblast') {
        mario.transformToHeatblast();
    }
}

// ─── Core state ──────────────────────────────
const input = new Input();
let lastTime = 0;
let currentLevelIndex = 1;
let level, mario;
const entities = [];
let gameState = 'PLAYING';

// Ground Pound shockwave effect
const shockwaves = [];
let screenShake = 0;

let specialBoxPos = null;
let levelTitleTimer = 0;

// Goombaba boss reference
let goombaba = null;
let bossDefeated = false;

function assignBlockHit() {
    mario.onBlockHit = (tileType, bx, by) => {
        if (tileType === 3) {
            const gx = Math.round(bx / level.tileSize);
            const gy = Math.round(by / level.tileSize);

            if (level.tiles[gy] && level.tiles[gy][gx] === 3) {
                level.tiles[gy][gx] = 8;
            }

            let ItemClass;
            if (specialBoxPos && gx === specialBoxPos.x && gy === specialBoxPos.y) {
                if (currentLevelIndex === 1) ItemClass = OmnitrixItem;
                else if (currentLevelIndex === 2) ItemClass = FourArmsItem;
                else if (currentLevelIndex === 3) ItemClass = HeatblastItem;
            }

            if (ItemClass) {
                entities.push(new ItemClass(bx, by - 32));
            } else {
                // Non-special box: spawn LavaGoomba in level 3, regular Goomba otherwise
                if (currentLevelIndex === 3) {
                    entities.push(new LavaGoomba(bx, by - 32));
                } else {
                    entities.push(new Goomba(bx, by - 32));
                }
            }
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
        } else if (carryOverState.alienState === 'HEATBLAST') {
            mario.transformToHeatblast();
        }
    }

    // Pick ONE random box for the special item
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
    goombaba = null;
    bossDefeated = false;

    level.entities.forEach(entityData => {
        if (entityData.type === 'goomba') {
            entities.push(new Goomba(entityData.x, entityData.y));
        } else if (entityData.type === 'lava_goomba') {
            entities.push(new LavaGoomba(entityData.x, entityData.y));
        } else if (entityData.type === 'goombaba') {
            goombaba = new Goombaba(entityData.x, entityData.y, entities);
            entities.push(goombaba);
        }
    });

    levelTitleTimer = performance.now();
    gameState = 'PLAYING';
    modal.style.display = 'none';
    closeOmnitrixPanel();
    canvas.classList.toggle('level2-theme', index === 2);
    canvas.classList.toggle('level3-theme', index === 3);
}

loadLevel(1);

// ─── Modal Buttons ────────────────────────────
btnNext.addEventListener('click', () => {
    loadLevel(currentLevelIndex + 1, { hasWatch: mario.hasWatch, alienState: mario.state });
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

    // F key — context-dependent:
    //   FOURARMS: Ground Pound
    //   HEATBLAST: Shoot Fireball (rapid press = bigger fire)
    if (e.code === 'KeyF' && mario && gameState === 'PLAYING') {
        if (mario.state === 'FOURARMS' && !mario.groundPounding) {
            // Ground Pound
            const now = performance.now();
            const cooldownMs = 1500;
            if (now - mario.groundPoundCooldown > cooldownMs) {
                if (mario.grounded) {
                    mario.vy = -10;
                    mario.grounded = false;
                    setTimeout(() => {
                        if (mario && mario.state === 'FOURARMS' && !mario.groundPounding) {
                            mario.groundPounding = true;
                        }
                    }, 200);
                } else {
                    mario.groundPounding = true;
                }
                console.log('GROUND POUND TRIGGERED!');
            }
        } else if (mario.state === 'HEATBLAST') {
            // Fireball — rapid press increases power
            const now = performance.now();
            const rapidWindow = 500; // 500ms window to press again for power up
            const cooldownMs = 300;  // minimum time between actual shots

            if (now - mario.fireballLastPress < rapidWindow) {
                mario.fireballPower = Math.min(mario.fireballPower + 1, 5);
            } else {
                mario.fireballPower = 1;
            }
            mario.fireballLastPress = now;

            // Actually fire if off cooldown
            if (now - mario.fireballCooldown > cooldownMs) {
                mario.fireballCooldown = now;
                const dir = mario.facingRight ? 1 : -1;
                const fx = mario.x + (mario.facingRight ? mario.width : 0);
                const fy = mario.y + mario.height / 2 - 6;
                entities.push(new Fireball(fx, fy, dir, mario.fireballPower));
                console.log(`FIREBALL! Power: ${mario.fireballPower}`);
            }
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

            // ── Lava Death ──────────────────────
            if (mario.lavaDeath) {
                mario.lavaDeath = false;
                if (mario.state === 'HEATBLAST') {
                    // Heatblast downgrades on lava timeout
                    mario.state = 'SMALL';
                    mario.width = 32;
                    mario.height = 32;
                    mario.vy = -10;
                    mario.lavaTimer = 0;
                } else {
                    gameState = 'GAMEOVER';
                }
            }

            // ── Win Detection ─────────────────
            const gridY = Math.floor((mario.y + mario.height / 2) / level.tileSize);
            const gridX = Math.floor((mario.x + mario.width / 2) / level.tileSize);
            const gridRight = Math.floor((mario.x + mario.width + 1) / level.tileSize);

            if ((level.tiles[gridY] && level.tiles[gridY][gridX] === 5) ||
                (level.tiles[gridY] && level.tiles[gridY][gridRight] === 5)) {

                if (currentLevelIndex === 1) {
                    showLevelModal('LEVEL 1 COMPLETE!', 'You are the chosen guard for the universe.', true);
                } else if (currentLevelIndex === 2) {
                    showLevelModal('LEVEL 2 COMPLETE!', 'Four Arms has proven his strength!', true);
                } else if (currentLevelIndex === 3) {
                    mario.victory = true;
                    showLevelModal('LEVEL 3 COMPLETE!', 'You escaped HELL! The universe is safe… for now.', false);
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
                        if (!level.unstableTiles.find(u => u.x === fx && u.y === footY)) {
                            level.unstableTiles.push({ x: fx, y: footY, timer: performance.now() });
                        }
                    }
                }
            }
            const now = performance.now();
            for (let i = level.unstableTiles.length - 1; i >= 0; i--) {
                const ut = level.unstableTiles[i];
                if (now - ut.timer > 500) {
                    level.tiles[ut.y][ut.x] = 0;
                    level.unstableTiles.splice(i, 1);
                }
            }

            // ── Entities ──────────────────────
            entities.forEach(entity => {
                entity.update(deltaTime, level);
                if (entity.dead) return;

                // ── Fireball hits enemies ─────
                if (entity.type === 'fireball') {
                    entities.forEach(target => {
                        if (target.dead || target === entity) return;
                        if (target.type === 'fireball') return; // fireballs don't collide

                        if (checkEntityCollision(entity, target)) {
                            if (target.type === 'goombaba') {
                                target.takeDamage(entity.damage);
                                entity.dead = true;
                                screenShake = Math.min(entity.power * 2, 10);
                            } else if (target.type === 'goomba') {
                                target.dead = true;
                                entity.dead = true;
                            }
                        }
                    });
                    return; // Don't check mario collision for fireballs
                }

                if (checkEntityCollision(mario, entity)) {
                    if (entity.type === 'heatblast_item') {
                        entity.dead = true;
                        ALIENS[1].unlocked = true;
                        ALIENS[1].introMessage = 'I am Heatblast! Press F to shoot fireballs! Keep pressing for MORE POWER! 🔥';
                        renderAlienGrid();
                        openOmnitrixPanel();

                    } else if (entity.type === 'fourarms_item') {
                        entity.dead = true;
                        ALIENS[0].unlocked = true;
                        ALIENS[0].introMessage = 'My name is Four Arms. If you need me, press "0".';
                        renderAlienGrid();
                        openOmnitrixPanel();

                    } else if (entity.type === 'omnitrix_item') {
                        entity.dead = true;
                        mario.hasWatch = true;
                        showOmnitrixIntro();

                    } else if (entity.type === 'goomba') {
                        if (mario.vy > 0 && mario.y + mario.height < entity.y + entity.height / 2 + 10) {
                            entity.dead = true;
                            mario.vy = -8;
                        } else {
                            if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST') {
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

                    } else if (entity.type === 'goombaba') {
                        // Touching Goombaba = damage (bounce back)
                        if (mario.vy > 0 && mario.y + mario.height < entity.y + 20) {
                            // Stomp does 1 damage
                            entity.takeDamage(1);
                            mario.vy = -12;
                        } else {
                            if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST') {
                                mario.state = 'SMALL';
                                mario.width = 32;
                                mario.height = 32;
                                mario.y += 32;
                                mario.vy = -8;
                            } else {
                                gameState = 'GAMEOVER';
                            }
                        }
                    }
                }
            });

            // Remove dead entities
            for (let i = entities.length - 1; i >= 0; i--) {
                if (entities[i].dead) {
                    // Check if Goombaba died
                    if (entities[i] === goombaba) {
                        bossDefeated = true;
                        goombaba = null;
                        screenShake = 20;
                        console.log('GOOMBABA DEFEATED!');
                    }
                    entities.splice(i, 1);
                }
            }

            // ── Ground Pound Impact ───────────
            if (mario.groundPoundLanded) {
                mario.groundPoundLanded = false;
                screenShake = 12;

                const cx = mario.x + mario.width / 2;
                const cy = mario.y + mario.height;
                shockwaves.push({ x: cx, y: cy, radius: 10, maxRadius: 160, alpha: 1.0 });

                const KILL_RADIUS = 160;
                entities.forEach(entity => {
                    if (entity.dead) return;
                    if (entity.type === 'goomba') {
                        const ex = entity.x + entity.width / 2;
                        const ey = entity.y + entity.height / 2;
                        const dist = Math.sqrt((cx - ex) ** 2 + (cy - ey) ** 2);
                        if (dist < KILL_RADIUS) entity.dead = true;
                    } else if (entity.type === 'goombaba') {
                        const ex = entity.x + entity.width / 2;
                        const ey = entity.y + entity.height / 2;
                        const dist = Math.sqrt((cx - ex) ** 2 + (cy - ey) ** 2);
                        if (dist < KILL_RADIUS) entity.takeDamage(5);
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
            ctx.strokeStyle = `rgba(255, 200, 50, ${sw.alpha * 0.6})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius * 0.6, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.lineWidth = 1;

        // Ground pound indicator
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
                'Welcome to HELL 🔥',
            ];
            const subtitle = titles[currentLevelIndex] || `Level ${currentLevelIndex}`;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = currentLevelIndex === 3 ? 'rgba(80,0,0,0.75)' : 'rgba(0,0,0,0.65)';
            ctx.fillRect(GAME_WIDTH / 2 - 230, GAME_HEIGHT / 3 - 38, 460, 80);
            ctx.fillStyle = currentLevelIndex === 3 ? '#FF4400' : '#FFD700';
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
        ctx.fillRect(8, 8, 340, 32);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        const hudWatch = mario.hasWatch ? ' ⌚[C]' : '';
        let hudAlien = '';
        if (mario.state === 'FOURARMS') hudAlien = ' 💪';
        else if (mario.state === 'HEATBLAST') hudAlien = ' 🔥';
        const gpReady = mario.state === 'FOURARMS' && (performance.now() - mario.groundPoundCooldown > 1500);
        let hudAction = '';
        if (mario.state === 'FOURARMS') hudAction = gpReady ? ' [F]🥊' : ' [F]⏳';
        else if (mario.state === 'HEATBLAST') hudAction = ` [F]🔥×${mario.fireballPower}`;
        ctx.fillText(`Level ${currentLevelIndex}${hudWatch}${hudAlien}${hudAction}`, 18, 30);

        // ── Boss HP Bar (screen-space) ────────
        if (goombaba && !goombaba.dead && currentLevelIndex === 3) {
            const barW = 300;
            const barH = 16;
            const barX = GAME_WIDTH / 2 - barW / 2;
            const barY = 50;
            const hpRatio = goombaba.hp / goombaba.maxHp;

            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(barX - 4, barY - 4, barW + 8, barH + 24);

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            const r = Math.floor(255 * (1 - hpRatio));
            const g = Math.floor(255 * hpRatio);
            ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
            ctx.fillRect(barX, barY, barW * hpRatio, barH);
            ctx.strokeStyle = '#FF6600';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barW, barH);
            ctx.lineWidth = 1;

            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`GOOMBABA — ${goombaba.hp}/${goombaba.maxHp}`, GAME_WIDTH / 2, barY + barH + 14);
            ctx.textAlign = 'left';
        }

        // Boss defeated message
        if (bossDefeated && currentLevelIndex === 3) {
            ctx.fillStyle = '#FF6600';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GOOMBABA DEFEATED! → REACH THE EXIT!', GAME_WIDTH / 2, 80);
            ctx.textAlign = 'left';
        }

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
