import { Goomba } from './src/entities/Goomba.js';
import { Mario } from './src/entities/Mario_v2.js';
import { Level } from './src/level/Level_v2.js';
import { Input } from './src/core/Input.js';
import { FourArmsItem } from './src/entities/FourArmsItem.js';
import { OmnitrixItem } from './src/entities/OmnitrixItem.js';
import { HeatblastItem } from './src/entities/HeatblastItem.js';
import { XLR8Item } from './src/entities/XLR8Item.js';
import { Fireball } from './src/entities/Fireball.js';
import { LavaGoomba } from './src/entities/LavaGoomba.js';
import { Goombaba } from './src/entities/Goombaba.js';
import { ShieldDrone } from './src/entities/ShieldDrone.js';
import { LaserTurret } from './src/entities/LaserTurret.js';
import { Turtumba } from './src/entities/Turtumba.js';
import { Bomba } from './src/entities/Bomba.js';
import { Gomrog } from './src/entities/Gomrog.js';
import { PipeChomper } from './src/entities/PipeChomper.js';
import { OozeGoomba } from './src/entities/OozeGoomba.js';
import { SludgeBat } from './src/entities/SludgeBat.js';
import { Slimeball } from './src/entities/Slimeball.js';
import { StinkflyItem } from './src/entities/StinkflyItem.js';
import { SoundManager } from './src/core/SoundManager.js';
import { UpgradeItem } from './src/entities/UpgradeItem.js';
import { Electromba } from './src/entities/Electromba.js';
import { Gomboto } from './src/entities/Gomboto.js';
import { Gorillomba } from './src/entities/Gorillomba.js';
import { WildMuttItem } from './src/entities/WildMuttItem.js';
import { DiamondheadItem } from './src/entities/DiamondheadItem.js';
import { DragonglassItem } from './src/entities/DragonglassItem.js';
import { WhiteWalkerGoomba } from './src/entities/WhiteWalkerGoomba.js';
import { NightKing } from './src/entities/NightKing.js';
import { CrystalShard } from './src/entities/CrystalShard.js';
import { DragonglassDiamond } from './src/entities/DragonglassDiamond.js';
const sfx = new SoundManager();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let GAME_WIDTH = window.innerWidth;
let GAME_HEIGHT = window.innerHeight;

function resizeCanvas() {
    GAME_WIDTH = window.innerWidth;
    GAME_HEIGHT = window.innerHeight;
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─── Audio Sliders ─────────────────────────
document.getElementById('bgm-volume').addEventListener('input', (e) => {
    sfx.setMusicVolume(parseFloat(e.target.value));
});
document.getElementById('sfx-volume').addEventListener('input', (e) => {
    sfx.setSfxVolume(parseFloat(e.target.value));
});

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
    { key: '1', name: 'Four Arms', icon: '💪', unlocked: false, lives: 25 },
    { key: '2', name: 'Heatblast', icon: '🔥', unlocked: false, lives: 25 },
    { key: '3', name: 'XLR8', icon: '⚡', unlocked: false, lives: 25 },
    { key: '4', name: 'Stinkfly', icon: '🪰', unlocked: false, lives: 25 },
    { key: '5', name: 'Upgrade', icon: '💻', unlocked: false, lives: 25 },
    { key: '6', name: 'Wild Mutt', icon: '🐺', unlocked: false, lives: 25 },
    { key: '7', name: 'Diamondhead', icon: '💎', unlocked: false, lives: 25 },
    { key: '8', name: '???', icon: '👾', unlocked: false, lives: 25 },
    { key: '9', name: '???', icon: '👾', unlocked: false, lives: 25 },
    { key: '10', name: '???', icon: '👾', unlocked: false, lives: 25 },
];

function getDefaultBoxEnemyType(levelIndex) {
    if (levelIndex === 3) return 'lava_goomba';
    if (levelIndex === 4) return 'shield_drone';
    if (levelIndex === 5) return 'ooze_goomba';
    if (levelIndex === 5) return 'ooze_goomba';
    if (levelIndex === 6) return 'electromba';
    if (levelIndex === 8) return 'whitewalker_goomba';
    return 'goomba';
}

function createEnemyByType(type, x, y, entitiesArray = null) {
    if (type === 'lava_goomba') return new LavaGoomba(x, y);
    if (type === 'shield_drone') return new ShieldDrone(x, y);
    if (type === 'ooze_goomba') return new OozeGoomba(x, y);
    if (type === 'electromba') return new Electromba(x, y, entitiesArray);
    if (type === 'whitewalker_goomba') return new WhiteWalkerGoomba(x, y);
    return new Goomba(x, y);
}

// ─── Build the alien grid HTML ────────────────
function renderAlienGrid() {
    alienGrid.innerHTML = '';
    let introMsg = '';
    ALIENS.forEach((alien, i) => {
        const slot = document.createElement('div');
        const isUsable = alien.unlocked && alien.lives > 0;
        slot.className = 'alien-slot ' + (isUsable ? 'unlocked' : 'locked');
        const livesDisplay = alien.unlocked ? `<span class="slot-lives">♥${alien.lives}</span>` : '';
        slot.innerHTML = `
            <span class="slot-key">[${alien.key}]</span>
            <span class="slot-icon">${alien.icon}</span>
            <span class="slot-name">${alien.unlocked ? alien.name : '???'}</span>
            ${livesDisplay}
        `;
        if (isUsable) {
            slot.title = `Press ${alien.key} to transform into ${alien.name} (${alien.lives} uses left)`;
            slot.addEventListener('click', () => activateAlien(i));
            if (alien.introMessage) introMsg = alien.introMessage;
        }
        alienGrid.appendChild(slot);
    });
    const hintBar = document.getElementById('panel-hint-bar');
    if (introMsg) {
        hintBar.innerHTML = `<span style="color:#FFD700;font-size:12px;">${introMsg}</span><br><br>Press <b>1–0</b> to transform • <b>C</b> to close`;
    } else {
        hintBar.innerHTML = `Press <b>1–0</b> to transform • <b>C</b> to close`;
    }
}
renderAlienGrid();

// ─── Omnitrix Panel State ─────────────────────
let omnitrixPanelOpen = false;

function openOmnitrixPanel() {
    if (!mario.hasWatch) return;
    omnitrixPanelOpen = true;
    omnitrixPanel.style.display = 'flex';
    sfx.omnitrixOpen();
}

function closeOmnitrixPanel() {
    omnitrixPanelOpen = false;
    omnitrixPanel.style.display = 'none';
    sfx.omnitrixClose();
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
    if (!alien.unlocked || alien.lives <= 0) return;

    // Decrement lives
    alien.lives--;
    if (alien.lives <= 0) {
        alien.unlocked = false;
    }

    closeOmnitrixPanel();
    alien.introMessage = null;
    renderAlienGrid();

    sfx.transform();
    if (alien.name === 'Four Arms') {
        mario.transformToFourArms();
    } else if (alien.name === 'Heatblast') {
        mario.transformToHeatblast();
    } else if (alien.name === 'XLR8') {
        mario.transformToXLR8();
    } else if (alien.name === 'Stinkfly') {
        mario.transformToStinkfly();
    } else if (alien.name === 'Upgrade') {
        mario.transformToUpgrade();
    } else if (alien.name === 'Wild Mutt') {
        mario.transformToWildMutt();
    } else if (alien.name === 'Diamondhead') {
        mario.transformToDiamondhead();
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

// Sound: boss entrance tracking
let bossEntrancePlayed = false;
let lastLavaSizzle = 0;

// Sound: alien timeout tracking
let lastAlienState = 'SMALL';

// Goombaba boss reference
let goombaba = null;
let bossDefeated = false;

// Turtumba boss reference
let turtumba = null;
let turtumbaDefeated = false;

// Bomba boss reference
let bomba = null;
let bombaDefeated = false;

// Gomrog boss reference
let gomrog = null;
let gomrogDefeated = false;

// Gomboto boss reference
let gomboto = null;
let gombotoDefeated = false;

// Gorillomba boss reference
let gorillomba = null;
let gorillombaDefeated = false;

// Night King boss reference
let nightKing = null;
let nightKingDefeated = false;

function assignBlockHit() {
    mario.onBlockHit = (tileType, bx, by) => {
        if (tileType === 3) {
            const gx = Math.round(bx / level.tileSize);
            const gy = Math.round(by / level.tileSize);

            if (level.tiles[gy] && level.tiles[gy][gx] === 3) {
                level.tiles[gy][gx] = 8;
                sfx.hitBox();
            }

            let ItemClass;
            if (specialBoxPos && gx === specialBoxPos.x && gy === specialBoxPos.y) {
                if (currentLevelIndex === 1) ItemClass = OmnitrixItem;
                else if (currentLevelIndex === 2) ItemClass = FourArmsItem;
                else if (currentLevelIndex === 3) ItemClass = HeatblastItem;
                else if (currentLevelIndex === 4) ItemClass = XLR8Item;
                else if (currentLevelIndex === 5) ItemClass = StinkflyItem;
                else if (currentLevelIndex === 6) ItemClass = UpgradeItem;
                else if (currentLevelIndex === 8) ItemClass = DiamondheadItem;
            }

            if (ItemClass) {
                entities.push(new ItemClass(bx, by - 32));
            } else {
                entities.push(createEnemyByType(getDefaultBoxEnemyType(currentLevelIndex), bx, by - 32, entities));
            }
        }
    };
}

function loadLevel(index, carryOverState = null) {
    currentLevelIndex = index;
    level = new Level(index);

    const startY = (level.rows - 7) * level.tileSize;
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
    turtumba = null;
    turtumbaDefeated = false;
    bomba = null;
    bombaDefeated = false;
    gomrog = null;
    gomrogDefeated = false;
    gomboto = null;
    gombotoDefeated = false;
    gorillomba = null;
    gorillombaDefeated = false;
    nightKing = null;
    nightKingDefeated = false;

    level.entities.forEach(entityData => {
        if (entityData.type === 'goomba') {
            entities.push(new Goomba(entityData.x, entityData.y));
        } else if (entityData.type === 'lava_goomba') {
            entities.push(new LavaGoomba(entityData.x, entityData.y));
        } else if (entityData.type === 'goombaba') {
            goombaba = new Goombaba(entityData.x, entityData.y, entities);
            goombaba.onBabySpawn = () => sfx.bossSpawn();
            entities.push(goombaba);
        } else if (entityData.type === 'shield_drone') {
            entities.push(new ShieldDrone(entityData.x, entityData.y));
        } else if (entityData.type === 'laser_turret') {
            const turret = new LaserTurret(entityData.x, entityData.y);
            if (entityData.facingLeft !== undefined) turret.facingLeft = entityData.facingLeft;
            entities.push(turret);
        } else if (entityData.type === 'turtumba') {
            turtumba = new Turtumba(entityData.x, entityData.y);
            entities.push(turtumba);
        } else if (entityData.type === 'bomba') {
            bomba = new Bomba(entityData.x, entityData.y, entities);
            entities.push(bomba);
        } else if (entityData.type === 'gomrog') {
            gomrog = new Gomrog(entityData.x, entityData.y);
            entities.push(gomrog);
        } else if (entityData.type === 'ooze_goomba') {
            entities.push(new OozeGoomba(entityData.x, entityData.y));
        } else if (entityData.type === 'stinkfly_item') {
            entities.push(new StinkflyItem(entityData.x, entityData.y));
        } else if (entityData.type === 'electromba') {
            entities.push(new Electromba(entityData.x, entityData.y, entities));
        } else if (entityData.type === 'upgrade_item') {
            entities.push(new UpgradeItem(entityData.x, entityData.y));
        } else if (entityData.type === 'gomboto') {
            gomboto = new Gomboto(entityData.x, entityData.y, entities);
            gomboto.onBabySpawn = () => sfx.bossSpawn();
            entities.push(gomboto);
        } else if (entityData.type === 'gorillomba') {
            gorillomba = new Gorillomba(entityData.x, entityData.y);
            entities.push(gorillomba);
        } else if (entityData.type === 'wild_mutt_item') {
            entities.push(new WildMuttItem(entityData.x, entityData.y));
        } else if (entityData.type === 'night_king') {
            nightKing = new NightKing(entityData.x, entityData.y, entities);
            entities.push(nightKing);
        } else if (entityData.type === 'dragonglass_diamond') {
            entities.push(new DragonglassDiamond(entityData.x, entityData.y, entities));
        } else if (entityData.type === 'whitewalker_goomba') {
            entities.push(new WhiteWalkerGoomba(entityData.x, entityData.y));
        }
    });

    levelTitleTimer = performance.now();
    gameState = 'PLAYING';
    modal.style.display = 'none';
    closeOmnitrixPanel();
    canvas.classList.toggle('level2-theme', index === 2);
    canvas.classList.toggle('level3-theme', index === 3);
    canvas.classList.toggle('level4-theme', index === 4);
    canvas.classList.toggle('level5-theme', index === 5);
    canvas.classList.toggle('level6-theme', index === 6);
    canvas.classList.toggle('level7-theme', index === 7);
    canvas.classList.toggle('level8-theme', index === 8);

    // Sound: start level music
    bossEntrancePlayed = false;
    lastAlienState = 'SMALL';
    sfx.startMusic(index);
}

loadLevel(1);

// ─── Modal Buttons ────────────────────────────
btnNext.addEventListener('click', () => {
    loadLevel(currentLevelIndex + 1, { hasWatch: mario.hasWatch, alienState: mario.state });
});

btnRestart.addEventListener('click', () => {
    deathPenalty();
    loadLevel(currentLevelIndex, { hasWatch: mario.hasWatch });
});

function deathPenalty() {
    // Each unlocked alien loses 1 life; lock if lives reach 0
    ALIENS.forEach(alien => {
        if (alien.unlocked) {
            alien.lives--;
            if (alien.lives <= 0) {
                alien.unlocked = false;
            }
        }
        alien.introMessage = null;
    });
    renderAlienGrid();
}

function showLevelModal(title, message, showNext) {
    gameState = 'WON';
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    btnNext.style.display = showNext ? 'block' : 'none';
    modal.style.display = 'flex';
}

// ─── Input: C key, F key & 1–0 keys (one-shot keydown) ─────────
window.addEventListener('keydown', (e) => {
    // Toggle Omnitrix panel with C
    if (e.code === 'KeyC' && mario && mario.hasWatch && gameState !== 'PAUSED') {
        omnitrixPanelOpen ? closeOmnitrixPanel() : openOmnitrixPanel();
        e.preventDefault();
    }

    // M key — toggle mute
    if (e.code === 'KeyM') {
        const muted = sfx.toggleMute();
        console.log(muted ? '🔇 Sound MUTED' : '🔊 Sound ON');
    }

    // F key — context-dependent:
    //   FOURARMS: Ground Pound
    //   HEATBLAST: Shoot Fireball (rapid press = bigger fire)
    if (e.code === 'KeyF' && mario && gameState === 'PLAYING') {
        if (mario.state === 'HEATBLAST') {
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
                sfx.fireball(mario.fireballPower);
                console.log(`FIREBALL! Power: ${mario.fireballPower}`);
            }
        } else if (mario.state === 'XLR8') {
            // Speed Dash
            const now = performance.now();
            if (now - mario.dashCooldown > mario.dashCooldownMs && !mario.dashActive) {
                mario.dashActive = true;
                mario.dashTimer = now;
                mario.dashCooldown = now;
                console.log('XLR8 SPEED DASH!');
            }
        } else if (mario.state === 'STINKFLY') {
            // Slime Spit
            const now = performance.now();
            if (!mario.slimeCooldown || now - mario.slimeCooldown > 400) {
                mario.slimeCooldown = now;
                const fx = mario.x + mario.width / 2 - 8;
                const fy = mario.y + mario.height;
                entities.push(new Slimeball(fx, fy, mario.facingRight));
                sfx.stomp(); // Plop sound
                mario.vy = Math.min(0, mario.vy - 3); // recoil
            }
        } else if (mario.state === 'WILDMUTT') {
            // Punch attack
            const now = performance.now();
            if (!mario.punchCooldown || now - mario.punchCooldown > 500) {
                mario.punchCooldown = now;
                mario.punchActive = true;
                mario.punchTimer = now;
                sfx.stomp();
                // Auto-deactivate after 200ms
                setTimeout(() => { mario.punchActive = false; }, 200);
            }
        } else if (mario.state === 'DIAMONDHEAD') {
            // Shoot crystal shards
            const now = performance.now();
            if (!mario.crystalCooldown || now - mario.crystalCooldown > 400) {
                mario.crystalCooldown = now;
                const fx = mario.x + (mario.facingRight ? mario.width : 0);
                const fy = mario.y + mario.height / 2;
                entities.push(new CrystalShard(fx, fy, mario.facingRight ? 1 : -1, 1));
                sfx.stomp(); // Plop sound
            }
        } else if (mario.state === 'UPGRADE') {
            const now = performance.now();
            if (currentLevelIndex === 6 && now - mario.upgradeShotCooldown > 350) {
                mario.upgradeShotCooldown = now;
                const fx = mario.facingRight ? mario.x + mario.width - 8 : mario.x - 8;
                const fy = mario.y + mario.height / 2;
                entities.push(new Slimeball(fx, fy, mario.facingRight, { source: 'upgrade' }));
                sfx.stomp();
            }

            // Technopathic Absorb (Nearby objects/enemies)
            entities.forEach(target => {
                if (target.dead || target.absorbed) return;
                const dist = Math.abs((mario.x + mario.width/2) - (target.x + target.width/2));
                const distY = Math.abs((mario.y + mario.height/2) - (target.y + target.height/2));
                if (dist < 60 && distY < 60) {
                    if (target.type === 'electromba') {
                        if (currentLevelIndex !== 6 || (target.isHacked && target.isHacked())) {
                            target.absorbed = true;
                            target.type = 'goomba'; // behaves like normal goomba
                            sfx.stomp();
                        }
                    } else if (target.type === 'gomboto') {
                        if (currentLevelIndex !== 6 || target.claimReady) {
                            target.absorbed = true;
                            mario.controllingBoss = target; // Boss control mode
                            mario.y = target.y - mario.height; // pop him up slightly
                            
                            // Place finish flag!
                            const flagX = level.cols - 2;
                            for (let fy = 4; fy < level.rows; fy++) {
                                level.tiles[fy][flagX] = 5;
                            }
                            // Ensure Kurdistan flag draws by populating finishCols
                            level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                            sfx.bossHit();
                        }
                    }
                }
            });

            // Check grid blocks
            const mCX = Math.floor((mario.x + mario.width/2) / level.tileSize);
            const mCY = Math.floor((mario.y + mario.height/2) / level.tileSize);
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const tx = mCX + dx;
                    const ty = mCY + dy;
                    if (level.tiles[ty] && level.tiles[ty][tx]) {
                        if (level.tiles[ty][tx] === 12) { // wire hole -> normal ground
                            level.tiles[ty][tx] = 1;
                            sfx.stomp();
                        } else if (level.tiles[ty][tx] === 13) { // electronic block -> normal brick
                            level.tiles[ty][tx] = 2;
                            sfx.stomp();
                        }
                    }
                }
            }
        }
    }

    // Number keys 1–0 transform when panel is open
    if (omnitrixPanelOpen) {
        let idx = -1;
        if (e.key >= '1' && e.key <= '9') {
            idx = parseInt(e.key, 10) - 1;
        } else if (e.key === '0') {
            idx = 9;
        }
        if (idx >= 0 && idx < ALIENS.length) {
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

        // Vertical camera: anchor ground to bottom of viewport
        let camY = level.height - GAME_HEIGHT;

        // Screen shake offset
        let shakeX = 0, shakeY = 0;
        if (screenShake > 0) {
            shakeX = (Math.random() - 0.5) * screenShake;
            shakeY = (Math.random() - 0.5) * screenShake;
            screenShake -= 0.5;
        }
        ctx.translate(-camX + shakeX, -camY + shakeY);

        if (gameState === 'PLAYING') {
            if (bomba && !bomba.dead) {
                bomba.update(deltaTime, level, mario.x + mario.width/2, mario.y + mario.height/2);
            }
            if (gomrog && !gomrog.dead) {
                gomrog.update(deltaTime, level, mario.x, mario.y);
            }
            if (gorillomba && !gorillomba.dead) {
                gorillomba.update(deltaTime, level, mario.x + mario.width / 2, mario.y + mario.height / 2);
            }
            if (nightKing && !nightKing.dead) {
                nightKing.update(deltaTime, level, mario.x + mario.width / 2, mario.y + mario.height / 2);
            }
            mario.update(deltaTime, level);

            // ── FourArms Ground Pound Charging ────
            if (mario.state === 'FOURARMS') {
                const fDown = input.isDown('F');
                const now = performance.now();
                if (fDown && !mario.groundPounding) {
                    if (!mario._gpCharging) {
                        mario._gpCharging = true;
                        mario._gpChargeStart = now;
                    }
                    mario.gpChargePercent = Math.min((now - mario._gpChargeStart) / 5000, 1.0);
                } else if (!fDown && mario._gpCharging) {
                    mario._gpCharging = false;
                    const cooldownMs = 1500;
                    if (now - mario.groundPoundCooldown > cooldownMs || !mario.groundPoundCooldown) {
                        mario.gpMultiplier = 1 + mario.gpChargePercent * 2;
                        mario.gpChargePercent = 0;

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
                        console.log(`GROUND POUND TRIGGERED! x${mario.gpMultiplier}`);
                        sfx.groundPound();
                    } else {
                        mario.gpChargePercent = 0;
                    }
                }
            } else {
                mario._gpCharging = false;
                mario.gpChargePercent = 0;
            }

            // ── Sound: Jump detection ──────────
            if (mario.vy < -2 && !mario.grounded && mario._justJumped) {
                sfx.jump();
                mario._justJumped = false;
            }

            // ── Sound: Alien timer timeout ────
            if (lastAlienState !== 'SMALL' && mario.state === 'SMALL' && mario.alienTimer === 0) {
                sfx.omnitrixTimeout();
            }
            lastAlienState = mario.state;

            // ── Sound: Lava sizzle ────────────
            if (mario.lavaTimer > 0 && performance.now() - lastLavaSizzle > 400) {
                sfx.lavaSizzle();
                lastLavaSizzle = performance.now();
            }

            // ── Slow Zone check (Turtumba’s turtle effect) ─────
            let inSlowZone = false;
            if (currentLevelIndex === 4 && level.slowZoneStart > 0 && turtumba && !turtumba.dead) {
                if (mario.x >= level.slowZoneStart) {
                    inSlowZone = true;
                    // XLR8 is immune to slow effect
                    if (mario.state !== 'XLR8') {
                        // Reverse 90% of the horizontal movement (10x slow)
                        mario.x -= mario.vx * 0.9;
                        // Slow vertical too
                        mario.vy = Math.max(-2, Math.min(mario.vy, 2));
                    }
                }
            }

            // ── Lava Death ──────────────────────
            if (mario.lavaDeath) {
                mario.lavaDeath = false;
                if (mario.state === 'HEATBLAST') {
                    mario.state = 'SMALL';
                    mario.width = 32;
                    mario.height = 32;
                    mario.vy = -10;
                    mario.lavaTimer = 0;
                } else {
                    sfx.death();
                    sfx.stopMusic();
                    gameState = 'GAMEOVER';
                }
            }

            // ── Win Detection ─────────────────
            const gridY = Math.floor((mario.y + mario.height / 2) / level.tileSize);
            const gridX = Math.floor((mario.x + mario.width / 2) / level.tileSize);
            const gridRight = Math.floor((mario.x + mario.width + 1) / level.tileSize);

            if ((level.tiles[gridY] && level.tiles[gridY][gridX] === 5) ||
                (level.tiles[gridY] && level.tiles[gridY][gridRight] === 5)) {

                if (currentLevelIndex === 6 && (mario.state !== 'UPGRADE' || !mario.controllingBoss)) {
                    // Level 6 requires Upgrade to be riding Gomboto to win
                } else if (currentLevelIndex === 1) {
                    sfx.levelComplete();
                    sfx.stopMusic();
                    showLevelModal('LEVEL 1 COMPLETE!', 'You are the chosen guard for the universe.', true);
                } else if (currentLevelIndex === 2) {
                    sfx.levelComplete();
                    sfx.stopMusic();
                    showLevelModal('LEVEL 2 COMPLETE!', 'Four Arms has proven his strength!', true);
                } else if (currentLevelIndex === 3) {
                    sfx.levelComplete();
                    sfx.stopMusic();
                    showLevelModal('LEVEL 3 COMPLETE!', 'You escaped HELL! The flames are behind you.', true);
                } else if (currentLevelIndex === 4) {
                    sfx.levelComplete();
                    sfx.stopMusic();
                    showLevelModal('LEVEL 4 COMPLETE!', 'XLR8 got you through! Next stop: The Sewers.', true);
                } else if (currentLevelIndex === 5) {
                    sfx.levelComplete();
                    sfx.stopMusic();
                    showLevelModal('LEVEL 5 COMPLETE!', 'Stinkfly prevailed! Next stop: The Destroyed World.', true);
                } else if (currentLevelIndex === 6) {
                    sfx.levelComplete();
                    sfx.stopMusic();
                    showLevelModal('LEVEL 6 COMPLETE!', 'Upgrade merged and saved the system! The Jungle calls...', true);
                } else if (currentLevelIndex === 7) {
                    mario.victory = true;
                    sfx.levelComplete();
                    sfx.stopMusic();
                    showLevelModal('LEVEL 7 COMPLETE!', 'Wild Mutt\s senses never lied! Gorillomba is defeated!', true);
                } else if (currentLevelIndex === 8) {
                    mario.victory = true;
                    sfx.levelComplete();
                    sfx.stopMusic();
                    showLevelModal('LEVEL 8 COMPLETE!', 'Winter is over! The Night King is shattered!', true);
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
                if (entity.type === 'gomrog') {
                    // Gomrog updated earlier but we do it here if needed, or skip it
                    // To avoid double updates, let's just skip it here
                } else if (entity.type === 'bomba') {
                    // skipped to avoid double update
                } else if (entity.type === 'gorillomba') {
                    // skipped to avoid double update
                } else {
                    entity.update(deltaTime, level);
                }
                if (entity.type === 'slimeball' &&
                    entity.source === 'upgrade' &&
                    entity.dead &&
                    (entity.impactTile === 11 || entity.impactTile === 12 || entity.impactTile === 13)) {
                    mario.activateUpgradeElectricImmunity();
                }
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
                                sfx.bossHit();
                            } else if (target.type === 'goomba') {
                                target.dead = true;
                                entity.dead = true;
                                sfx.fireballHit();
                            }
                        }
                    });
                    return; // Don't check mario collision for fireballs
                } else if (entity.type === 'crystal_shard') {
                    entities.forEach(target => {
                        if (target.dead || target === entity) return;
                        if (target.type === 'fireball' || target.type === 'slimeball' || target.type === 'crystal_shard' || target.type === 'ice_spear') return;

                        if (checkEntityCollision(entity, target)) {
                            if (target.type === 'dragonglass_diamond') {
                                target.takeDamage();
                                entity.dead = true;
                                sfx.bossHit();
                            } else if (target.type === 'whitewalker_goomba') {
                                target.dead = true;
                                entity.dead = true;
                                sfx.stomp();
                            }
                            // Does not damage Night King
                        }
                    });
                    return;
                } else if (entity.type === 'slimeball') {
                    entities.forEach(target => {
                        if (target.dead || target === entity) return;
                        if (target.type === 'fireball' || target.type === 'slimeball') return;
                        
                        if (target.type === 'gomrog') {
                            const tRect = target.getTongueRect();
                            if (tRect && checkEntityCollision(entity, tRect) && target.tongueLength > 0) {
                                entity.dead = true; // Tongue blocks the shot
                            } else if (checkEntityCollision(entity, target)) {
                                target.takeDamage();
                                entity.dead = true;
                                sfx.bossHit();
                            }
                        } else if (checkEntityCollision(entity, target)) {
                            if (entity.source === 'upgrade' && (target.type === 'electromba' || target.type === 'gomboto')) {
                                target.hacked = true;
                                mario.activateUpgradeElectricImmunity();
                                entity.dead = true;
                                sfx.bossHit();
                                return;
                            }
                            if (target.type === 'ooze_goomba' || target.type === 'goomba') {
                                target.dead = true;
                                entity.dead = true;
                                sfx.stomp();
                            }
                        }
                    });
                    return;
                }

                if (checkEntityCollision(mario, entity)) {
                    if (entity.type === 'heatblast_item') {
                        entity.dead = true;
                        ALIENS[1].unlocked = true;
                        ALIENS[1].introMessage = 'I am Heatblast! Press F to shoot fireballs! Keep pressing for MORE POWER! 🔥';
                        sfx.collectItem();
                        renderAlienGrid();
                        openOmnitrixPanel();

                    } else if (entity.type === 'fourarms_item') {
                        entity.dead = true;
                        ALIENS[0].unlocked = true;
                        ALIENS[0].introMessage = 'My name is Four Arms. If you need me, press "1".';
                        sfx.collectItem();
                        renderAlienGrid();
                        openOmnitrixPanel();

                    } else if (entity.type === 'omnitrix_item') {
                        entity.dead = true;
                        mario.hasWatch = true;
                        sfx.watchAcquired();
                        showOmnitrixIntro();

                    } else if (entity.type === 'goomba') {
                        if (mario.vy > 0 && mario.y + mario.height < entity.y + entity.height / 2 + 10) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                        } else {
                            if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8' || mario.state === 'STINKFLY') {
                                mario.state = 'SMALL';
                                mario.width = 32;
                                mario.height = 32;
                                mario.y += 32;
                                mario.vy = -5;
                                entity.dead = true;
                            } else {
                                sfx.death();
                                sfx.stopMusic();
                                gameState = 'GAMEOVER';
                            }
                        }

                    } else if (entity.type === 'goombaba') {
                        // Touching Goombaba = damage (bounce back)
                        if (mario.vy > 0 && mario.y + mario.height < entity.y + 20) {
                            entity.takeDamage(1);
                            sfx.bossHit();
                            mario.vy = -12;
                        } else {
                            if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8') {
                                mario.state = 'SMALL';
                                mario.width = 32;
                                mario.height = 32;
                                mario.y += 32;
                                mario.vy = -8;
                            } else {
                                sfx.death();
                                sfx.stopMusic();
                                gameState = 'GAMEOVER';
                            }
                        }

                    } else if (entity.type === 'shield_drone') {
                        // Shield Drone — only XLR8 dash can kill through shield
                        if (mario.dashActive) {
                            entity.dead = true;
                            screenShake = 6;
                        } else if (mario.vy > 0 && mario.y + mario.height < entity.y + entity.height / 2 + 10 && !entity.shieldActive) {
                            // Can stomp if shield somehow down
                            entity.dead = true;
                            mario.vy = -8;
                        } else {
                            // Shield blocks — bounce back and take damage
                            if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8') {
                                mario.revertToSmall();
                                mario.vy = -5;
                            } else {
                                gameState = 'GAMEOVER';
                            }
                        }

                    } else if (entity.type === 'xlr8_item') {
                        entity.dead = true;
                        ALIENS[2].unlocked = true;
                        ALIENS[2].introMessage = 'I am XLR8! Super speed! Press F for Speed Dash — nothing can stop me! ⚡';
                        sfx.collectItem();
                        renderAlienGrid();
                        openOmnitrixPanel();

                    } else if (entity.type === 'stinkfly_item') {
                        entity.dead = true;
                        ALIENS[3].unlocked = true;
                        ALIENS[3].introMessage = 'I am Stinkfly! Press and hold [Up] to hover! Press [F] to spit toxic slime! 🪰';
                        sfx.collectItem();
                        renderAlienGrid();
                        openOmnitrixPanel();

                    } else if (entity.type === 'upgrade_item') {
                        entity.dead = true;
                        ALIENS[4].unlocked = true;
                        ALIENS[4].introMessage = 'I am Upgrade! Press [F] near machines to merge and hack them! 💻';
                        sfx.collectItem();
                        renderAlienGrid();
                        openOmnitrixPanel();

                    } else if (entity.type === 'diamondhead_item') {
                        entity.dead = true;
                        ALIENS[6].unlocked = true;
                        ALIENS[6].introMessage = 'I am Diamondhead! Press F to shoot crystal shards! 💎';
                        mario.transformToDiamondhead();
                        sfx.collectItem();
                        renderAlienGrid();
                        openOmnitrixPanel();
                    } else if (entity.type === 'dragonglass_item') {
                        entity.dead = true;
                        mario.hasDragonglass = true;
                        sfx.collectItem();
                        // Flash screen
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
                    } else if (entity.type === 'ooze_goomba') {
                        // Level 5 Enemies
                        if (mario.vy > 0 && mario.y + mario.height < entity.y + entity.height / 2 + 10) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                        } else {
                            if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8' || mario.state === 'STINKFLY') {
                                mario.revertToSmall();
                                mario.vy = -5;
                            } else {
                                sfx.death();
                                sfx.stopMusic();
                                gameState = 'GAMEOVER';
                            }
                        }
                    } else if (entity.type === 'electromba') {
                        // Level 6 Enemies
                        if (mario.vy > 0 && mario.y + mario.height < entity.y + entity.height / 2 + 10) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                        } else if (mario.hasUpgradeElectricImmunity(currentLevelIndex) && entity.isHacked && entity.isHacked()) {
                            // Upgrade can safely phase through hacked electric enemies while immune
                        } else {
                            if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8' || mario.state === 'STINKFLY' || mario.state === 'UPGRADE') {
                                mario.revertToSmall();
                                mario.vy = -5;
                            } else {
                                sfx.death();
                                sfx.stopMusic();
                                gameState = 'GAMEOVER';
                            }
                        }
                    } else if (entity.type === 'gomboto') {
                        if (mario.vy > 0 && mario.y + mario.height < entity.y + 24) {
                            entity.claimReady = true;
                            entity.hacked = true;
                            mario.vy = -10;
                            sfx.bossHit();
                        } else if (!(mario.hasUpgradeElectricImmunity(currentLevelIndex) && entity.isHacked && entity.isHacked())) {
                            if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8' || mario.state === 'STINKFLY' || mario.state === 'UPGRADE') {
                                mario.revertToSmall();
                                mario.vy = -5;
                            } else {
                                sfx.death();
                                sfx.stopMusic();
                                gameState = 'GAMEOVER';
                            }
                        }
                    } else if (entity.type === 'turtumba') {
                        // Turtumba — only XLR8 dash can damage
                        if (mario.dashActive) {
                            entity.takeDamage(1);
                            mario.vy = -8;
                            screenShake = 8;
                        } else {
                            // Touching without dash = damage
                            if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8') {
                                mario.revertToSmall();
                                mario.vy = -5;
                            } else {
                                gameState = 'GAMEOVER';
                            }
                        }
                    } else if (entity.type === 'bomba') {
                        if (entity.windowOpen && !entity.goombaDead && mario.state === 'SMALL') {
                            // Small Ben can pass through and hit Goomba
                            const gx = entity.goombaX;
                            const gy = entity.goombaY;
                            const gw = entity.goombaWidth;
                            const gh = entity.goombaHeight;
                            if (mario.x < gx + gw && mario.x + mario.width > gx &&
                                mario.y < gy + gh && mario.y + mario.height > gy) {
                                entity.killGoomba();
                                sfx.bossDefeated();
                                screenShake = 30;
                                mario.vy = -12;
                            }
                        } else {
                            // Act as solid armor for everyone else, or if window closed
                            if (mario.vy > 0 && mario.y + mario.height < entity.y + 40) {
                                mario.y = entity.y - mario.height;
                                mario.vy = 0;
                                mario.grounded = true;
                            } else {
                                // Push horizontally out
                                if (mario.x < entity.x + entity.width/2) {
                                    mario.x = entity.x - mario.width;
                                } else {
                                    mario.x = entity.x + entity.width;
                                }
                                mario.vx = 0;
                            }
                        }
                    } else if (entity.type === 'wild_mutt_item') {
                        entity.dead = true;
                        ALIENS[5].unlocked = true;
                        ALIENS[5].introMessage = 'I am Wild Mutt! My senses are sharp! Press F to PUNCH and see HIDDEN ENEMIES! 🐺';
                        mario.transformToWildMutt();
                        sfx.collectItem();
                        renderAlienGrid();
                        openOmnitrixPanel();

                    } else if (entity.type === 'gorillomba') {
                        // Contact with Gorillomba — only Wild Mutt is safe
                        if (mario.state !== 'WILDMUTT') {
                            if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8' || mario.state === 'STINKFLY' || mario.state === 'UPGRADE') {
                                mario.revertToSmall();
                                mario.vy = -8;
                            } else {
                                sfx.death();
                                sfx.stopMusic();
                                gameState = 'GAMEOVER';
                            }
                        }

                    } else if (entity.type === 'ice_spear') {
                        if (checkEntityCollision(mario, entity)) {
                            if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8' || mario.state === 'STINKFLY' || mario.state === 'UPGRADE' || mario.state === 'WILDMUTT' || mario.state === 'DIAMONDHEAD') {
                                mario.revertToSmall();
                                mario.vy = -5;
                                entity.dead = true;
                            } else {
                                sfx.death();
                                sfx.stopMusic();
                                gameState = 'GAMEOVER';
                            }
                        }
                    } else if (entity.type === 'night_king') {
                        // Contact with Night King
                        if (mario.hasDragonglass && mario.state === 'DIAMONDHEAD') {
                            entity.dead = true;
                            mario.hasDragonglass = false; // consumed
                            sfx.bossHit();
                            screenShake = 20;
                            mario.vy = -10;
                        } else {
                            if (mario.vy > 0 && mario.y + mario.height < entity.y + 40) {
                                mario.y = entity.y - mario.height;
                                mario.vy = 0;
                                mario.grounded = true;
                            } else {
                                if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8' || mario.state === 'STINKFLY' || mario.state === 'UPGRADE' || mario.state === 'WILDMUTT' || mario.state === 'DIAMONDHEAD') {
                                    mario.revertToSmall();
                                    mario.vy = -8;
                                } else {
                                    sfx.death();
                                    sfx.stopMusic();
                                    gameState = 'GAMEOVER';
                                }
                            }
                        }
                    } else if (entity.type === 'whitewalker_goomba') {
                        if (mario.state === 'DIAMONDHEAD') {
                            // Immune! Shatter them on contact
                            entity.dead = true;
                            sfx.stomp();
                        } else if (mario.vy > 0 && mario.y + mario.height < entity.y + entity.height / 2 + 10) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                        } else {
                            if (mario.state !== 'SMALL') {
                                mario.revertToSmall();
                                mario.vy = -5;
                            } else {
                                sfx.death();
                                sfx.stopMusic();
                                gameState = 'GAMEOVER';
                            }
                        }
                    } else if (entity.type === 'goomba' && currentLevelIndex === 7) {
                        // Level 7 goombas: Always active, but invisible unless Wild Mutt
                        if (mario.vy > 0 && mario.y + mario.height < entity.y + entity.height / 2 + 10) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                        } else {
                            if (mario.state !== 'SMALL') {
                                mario.revertToSmall();
                                mario.vy = -5;
                            } else {
                                sfx.death();
                                sfx.stopMusic();
                                gameState = 'GAMEOVER';
                            }
                        }
                    }
                }
            });

            // ── Wild Mutt Punch Gorillomba ─────────────────────────
            if (mario.state === 'WILDMUTT' && mario.punchActive && gorillomba && !gorillomba.dead) {
                const pr = mario.getPunchRect();
                if (pr && gorillomba.isHitBy(pr)) {
                    const hit = gorillomba.takeDamage();
                    if (hit) {
                        screenShake = 8;
                        sfx.bossHit();
                    }
                }
            }

            // Bomba bomb tracking collisions
            if (bomba && !bomba.dead) {
                for (const b of bomba.bombs) {
                    if (!b.dead && checkEntityCollision(mario, b)) {
                        if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8') {
                            mario.revertToSmall();
                            mario.vy = -5;
                            b.dead = true;
                        } else {
                            gameState = 'GAMEOVER';
                        }
                    }
                }
            }

            // Gomrog tongue collisions
            if (gomrog && !gomrog.dead && gomrog.tongueLength > 0) {
                const rect = gomrog.getTongueRect();
                if (rect && checkEntityCollision(mario, rect)) {
                    if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8' || mario.state === 'STINKFLY') {
                        mario.revertToSmall();
                        mario.vy = -5;
                        mario.vx = -10; // push left
                    } else {
                        gameState = 'GAMEOVER';
                    }
                }
            }

            // Remove dead entities
            for (let i = entities.length - 1; i >= 0; i--) {
                if (entities[i].dead) {
                    // Check if Goombaba died
                    if (entities[i] === goombaba) {
                        bossDefeated = true;
                        goombaba = null;
                        screenShake = 20;
                        sfx.bossDefeated();
                        console.log('GOOMBABA DEFEATED!');
                    }
                    // Check if Turtumba died — place finish flag
                    if (entities[i] === turtumba) {
                        turtumbaDefeated = true;
                        turtumba = null;
                        screenShake = 25;
                        sfx.bossDefeated();
                        console.log('TURTUMBA DEFEATED!');
                        // Place finish flag at the right edge of the arena
                        const flagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][flagX] = 5;
                        }
                        // Also set the finishCols for Level draw
                        level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    if (entities[i] === bomba && bomba.dead) {
                        bombaDefeated = true;
                        bomba = null;
                        console.log('BOMBA DEFEATED!');
                        const flagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][flagX] = 5;
                        }
                        level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    if (entities[i] === gomrog && gomrog.dead) {
                        gomrogDefeated = true;
                        gomrog = null;
                        console.log('GOMROG DEFEATED!');
                        screenShake = 30;
                        sfx.bossDefeated();
                        const flagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][flagX] = 5;
                        }
                        level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    if (entities[i] === gorillomba && gorillomba.dead) {
                        gorillombaDefeated = true;
                        gorillomba = null;
                        console.log('GORILLOMBA DEFEATED!');
                        screenShake = 30;
                        sfx.bossDefeated();
                        // Finish flag already placed in map — just ensure finishCols is set
                        const gFlagX = level.cols - 2;
                        level.finishCols.set(gFlagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    if (entities[i] === nightKing && nightKing.dead) {
                        nightKingDefeated = true;
                        nightKing = null;
                        console.log('NIGHT KING DEFEATED!');
                        screenShake = 30;
                        sfx.bossDefeated();
                        // Draw Kurdistan Flag!
                        const flagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][flagX] = 5;
                        }
                        level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    entities.splice(i, 1);
                }
            }

            // ── Ground Pound Impact ───────────
            if (mario.groundPoundLanded) {
                mario.groundPoundLanded = false;
                
                const mult = mario.gpMultiplier || 1;
                screenShake = 12 * Math.max(1, mult * 0.8);

                const cx = mario.x + mario.width / 2;
                const cy = mario.y + mario.height;
                const KILL_RADIUS = 160 * mult;
                shockwaves.push({ x: cx, y: cy, radius: 10, maxRadius: KILL_RADIUS, alpha: 1.0 });

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
                        if (dist < KILL_RADIUS) entity.takeDamage(5 * mult);
                    } else if (entity.type === 'bomba' && entity.hasShooter) {
                        const sx = entity.x + entity.width/2;
                        const sy = entity.y - 10;
                        const dist = Math.sqrt((cx - sx) ** 2 + (cy - sy) ** 2);
                        if (dist < KILL_RADIUS && mult >= 2.9) {
                            entity.breakShooter();
                            sfx.stomp(); // breaking sound
                            screenShake = 20;
                        }
                    }
                });
            }

            if (mario.y > level.height + 100) {
                sfx.death();
                sfx.stopMusic();
                gameState = 'GAMEOVER';
            }

            // ── Sound: Boss entrance trigger ──────
            if (!bossEntrancePlayed) {
                if (currentLevelIndex === 2 && bomba && !bomba.dead) {
                    const dist = Math.abs(mario.x - bomba.x);
                    if (dist < 500) {
                        sfx.bossEntrance('BOMBA');
                        sfx.bossVoiceLine('BOMBA');
                        bossEntrancePlayed = true;
                    }
                } else if (currentLevelIndex === 3 && goombaba && !goombaba.dead) {
                    const dist = Math.abs(mario.x - goombaba.x);
                    if (dist < 500) {
                        sfx.bossEntrance('GOOMBABA');
                        sfx.bossVoiceLine('GOOMBABA');
                        bossEntrancePlayed = true;
                    }
                } else if (currentLevelIndex === 4 && turtumba && !turtumba.dead) {
                    const dist = Math.abs(mario.x - turtumba.x);
                    if (dist < 500) {
                        sfx.bossEntrance('TURTUMBA');
                        sfx.bossVoiceLine('TURTUMBA');
                        bossEntrancePlayed = true;
                    }
                } else if (currentLevelIndex === 5 && gomrog && !gomrog.dead) {
                    const dist = Math.abs(mario.x - gomrog.x);
                    if (dist < 500) {
                        sfx.bossEntrance('GOOMBABA'); // reuse goombaba theme for now
                        sfx.bossVoiceLine('GOMROG');
                        bossEntrancePlayed = true;
                    }
                } else if (currentLevelIndex === 6 && gomboto && !gomboto.dead) {
                    const dist = Math.abs(mario.x - gomboto.x);
                    if (dist < 500) {
                        sfx.bossEntrance('BOMBA'); 
                        sfx.bossVoiceLine('GOMBOTO');
                        bossEntrancePlayed = true;
                    }
                }
            }

            // ── Laser Turret beam collision ───────
            if (!mario.dashActive) {
                entities.forEach(entity => {
                    if (entity.dead || entity.type !== 'laser_turret') return;
                    const beam = entity.getLaserRect();
                    if (beam && checkEntityCollision(mario, beam)) {
                        if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8') {
                            mario.revertToSmall();
                            mario.vy = -5;
                        } else {
                            gameState = 'GAMEOVER';
                        }
                    }
                });
            }

            // ── Speed Panel & Electric Fence tile checks ────
            if (mario.grounded) {
                const footY = Math.floor((mario.y + mario.height) / level.tileSize);
                const footX = Math.floor((mario.x + mario.width / 2) / level.tileSize);
                // Speed panel — tile right above ground where mario stands
                const standY = Math.floor((mario.y + mario.height - 1) / level.tileSize);
                if (level.tiles[standY] && level.tiles[standY][footX] === 10) {
                    // Temporary speed boost
                    mario.vx *= 1.5;
                }
            }
            // Electric fence & Electric blocks full bounds check
            {
                const topY = Math.floor(mario.y / level.tileSize);
                const footY = Math.floor((mario.y + mario.height) / level.tileSize); // +1px for floor touch
                const leftX = Math.floor(mario.x / level.tileSize);
                const rightX = Math.floor((mario.x + mario.width - 0.1) / level.tileSize);
                
                let touchingFence = false;
                let touchingWire = false;
                let touchingElecBlock = false;
                
                for (let yy = topY; yy <= footY; yy++) {
                    for (let xx = leftX; xx <= rightX; xx++) {
                        if (level.tiles[yy]) {
                            const tile = level.tiles[yy][xx];
                            if (tile === 11) touchingFence = true;
                            if (tile === 12) touchingWire = true;
                            if (tile === 13) touchingElecBlock = true;
                        }
                    }
                }
                
                if (touchingFence) {
                    const fenceOn = (performance.now() % 4000) < 2000;
                    if (fenceOn && !mario.dashActive && !mario.hasUpgradeElectricImmunity(currentLevelIndex)) {
                        if (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8' || mario.state === 'STINKFLY') {
                            mario.revertToSmall();
                            mario.vy = -5;
                        } else {
                            gameState = 'GAMEOVER';
                        }
                    }
                }
                
                if (touchingWire && !mario.hasUpgradeElectricImmunity(currentLevelIndex)) {
                    if (gameState !== 'GAMEOVER') {
                        sfx.death();
                        sfx.stopMusic();
                        gameState = 'GAMEOVER';
                    }
                }
            }

        } else if (gameState === 'GAMEOVER') {
            if (input.isDown('Space')) {
                deathPenalty();
                loadLevel(currentLevelIndex, { hasWatch: mario.hasWatch });
            }
        }

        // ── Draw ──────────────────────────────
        level.draw(ctx);

        entities.forEach(entity => {
            if (entity.type === 'gorillomba' && !entity.dead) {
                const wildMuttActive = mario.state === 'WILDMUTT';
                entity.draw(ctx, wildMuttActive);
            } else if (entity.type === 'goomba' && currentLevelIndex === 7) {
                if (mario.state === 'WILDMUTT') {
                    // Wild Mutt can see them perfectly
                    entity.draw(ctx);
                } else {
                    // Invisible to everyone else (just a faint shimmer)
                    const now = performance.now();
                    const pulse = (Math.sin(now / 400) + 1) / 2;
                    ctx.globalAlpha = 0.05 + pulse * 0.05;
                    entity.draw(ctx);
                    ctx.globalAlpha = 1.0;
                }
            } else {
                entity.draw(ctx);
            }
        });
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
            ctx.arc(mario.x + mario.width / 2, mario.y + mario.height, 20 * (mario.gpMultiplier || 1), 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Charging ground pound indicator
        if (mario.state === 'FOURARMS' && mario._gpCharging && mario.gpChargePercent > 0) {
            ctx.strokeStyle = `rgba(255, ${255 - mario.gpChargePercent * 255}, 0, 0.8)`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(mario.x + mario.width / 2, mario.y + mario.height / 2, 30 + Math.sin(performance.now()/50)*5, 0, Math.PI * 2 * mario.gpChargePercent);
            ctx.stroke();
        }

        // ── Turtumba Slow Zone green overlay (world-space) ────
        if (currentLevelIndex === 4 && level.slowZoneStart > 0 && turtumba && !turtumba.dead) {
            const now = performance.now();
            const pulse = 0.08 + Math.sin(now / 800) * 0.04;
            ctx.fillStyle = `rgba(0, 255, 0, ${pulse})`;
            ctx.fillRect(level.slowZoneStart, 0, level.width - level.slowZoneStart, level.height);
            // Slow zone border line
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(level.slowZoneStart, 0);
            ctx.lineTo(level.slowZoneStart, level.height);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
        }

        ctx.restore();

        // ── Level 7 Thermal Vision Overlay (screen-space) ────────
        if (currentLevelIndex === 7 && mario.state === 'WILDMUTT') {
            level.drawThermalOverlay(ctx, GAME_WIDTH, GAME_HEIGHT);
        }

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
                'XLR8 — LIGHT SPEED! ⚡',
                'The Toxic Sewers 🪰',
                'Welcome to the Damaged World 💻',
                'The Hidden Senses Jungle 🐺'
            ];
            const subtitle = titles[currentLevelIndex] || `Level ${currentLevelIndex}`;
            ctx.save();
            ctx.globalAlpha = alpha;
            let titleBg = 'rgba(0,0,0,0.65)';
            let titleColor = '#FFD700';
            if (currentLevelIndex === 3) { titleBg = 'rgba(80,0,0,0.75)'; titleColor = '#FF4400'; }
            else if (currentLevelIndex === 4) { titleBg = 'rgba(0,5,32,0.80)'; titleColor = '#00FFFF'; }
            else if (currentLevelIndex === 5) { titleBg = 'rgba(20,40,20,0.80)'; titleColor = '#88FF00'; }
            else if (currentLevelIndex === 6) { titleBg = 'rgba(10,10,12,0.85)'; titleColor = '#00FFCC'; }
            else if (currentLevelIndex === 7) { titleBg = 'rgba(5,20,5,0.85)'; titleColor = '#AAFF44'; }
            ctx.fillStyle = titleBg;
            ctx.fillRect(GAME_WIDTH / 2 - 230, GAME_HEIGHT / 3 - 38, 460, 80);
            ctx.fillStyle = titleColor;
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
        else if (mario.state === 'XLR8') hudAlien = ' ⚡';
        else if (mario.state === 'STINKFLY') hudAlien = ' 🪰';
        const gpReady = mario.state === 'FOURARMS' && (performance.now() - mario.groundPoundCooldown > 1500);
        const dashReady = mario.state === 'XLR8' && (performance.now() - mario.dashCooldown > mario.dashCooldownMs);
        let hudAction = '';
        if (mario.state === 'FOURARMS') {
            if (mario._gpCharging) {
                const pct = Math.floor(mario.gpChargePercent * 100);
                hudAction = ` [F] CHARGING ${pct}%`;
            } else {
                hudAction = gpReady ? ' [F]🥊 (Hold to Charge)' : ' [F]⏳';
            }
        }
        else if (mario.state === 'HEATBLAST') hudAction = ` [F]🔥×${mario.fireballPower}`;
        else if (mario.state === 'XLR8') hudAction = dashReady ? ' [F]⚡DASH' : (mario.dashActive ? ' ⚡DASHING!' : ' [F]⏳');
        else if (mario.state === 'STINKFLY') hudAction = ' [F]💧Slime | [Up]Hover';
        const hudDoubleJump = mario.doubleJumpsRemaining > 0 ? ` ⬆⬆×${mario.doubleJumpsRemaining}` : '';
        ctx.fillText(`Level ${currentLevelIndex}${hudWatch}${hudAlien}${hudAction}${hudDoubleJump}`, 18, 30);

        // ── Alien Countdown Timer HUD ─────────
        if (mario.alienTimer > 0 && (mario.state === 'FOURARMS' || mario.state === 'HEATBLAST' || mario.state === 'XLR8' || mario.state === 'STINKFLY' || mario.state === 'UPGRADE' || mario.state === 'WILDMUTT')) {
            const timerBarW = 160;
            const timerBarH = 10;
            const timerX = 8;
            const timerY = 46;
            const ratio = mario.alienTimerRemaining / (mario.alienTimerDuration / 1000);

            // Background
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(timerX, timerY, timerBarW + 50, timerBarH + 8);

            // Bar track
            ctx.fillStyle = '#333';
            ctx.fillRect(timerX + 4, timerY + 4, timerBarW, timerBarH);

            // Colored bar (green → yellow → red)
            const r = Math.floor(255 * (1 - ratio));
            const g = Math.floor(255 * ratio);
            ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
            ctx.fillRect(timerX + 4, timerY + 4, timerBarW * ratio, timerBarH);

            // Border
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 1;
            ctx.strokeRect(timerX + 4, timerY + 4, timerBarW, timerBarH);

            // Text
            ctx.fillStyle = mario.alienTimerRemaining <= 3 ? '#FF4444' : '#FFD700';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(`🔄 ${mario.alienTimerRemaining}s`, timerX + timerBarW + 10, timerY + 13);
        }

        // ── Stinkfly Wing Stamina HUD ─────────
        if (mario.state === 'STINKFLY') {
            const staminaBarW = 160;
            const staminaBarH = 6;
            const sx = 8;
            const sy = 65; // just below the alien timer
            const sRatio = mario.wingStamina / mario.maxWingStamina;

            // Background
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(sx, sy, staminaBarW + 50, staminaBarH + 8);

            // Bar track
            ctx.fillStyle = '#333';
            ctx.fillRect(sx + 4, sy + 4, staminaBarW, staminaBarH);

            // Colored bar (cyan -> blue)
            ctx.fillStyle = '#00FFCC';
            ctx.fillRect(sx + 4, sy + 4, staminaBarW * Math.max(0, sRatio), staminaBarH);

            // Border
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 1;
            ctx.strokeRect(sx + 4, sy + 4, staminaBarW, staminaBarH);

            // Text
            ctx.fillStyle = '#00FFCC';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(`WING`, sx + staminaBarW + 10, sy + 11);
        }

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

        // ── Turtumba HP Bar (screen-space) ────────
        if (turtumba && !turtumba.dead && currentLevelIndex === 4) {
            const barW = 300;
            const barH = 16;
            const barX = GAME_WIDTH / 2 - barW / 2;
            const barY = 50;
            const hpRatio = turtumba.hp / turtumba.maxHp;

            ctx.fillStyle = 'rgba(0,20,0,0.7)';
            ctx.fillRect(barX - 4, barY - 4, barW + 8, barH + 24);

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            const r = Math.floor(255 * (1 - hpRatio));
            const g = Math.floor(255 * hpRatio);
            ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
            ctx.fillRect(barX, barY, barW * hpRatio, barH);
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barW, barH);
            ctx.lineWidth = 1;

            ctx.fillStyle = '#00FF66';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`🐢 TURTUMBA — ${turtumba.hp}/${turtumba.maxHp}`, GAME_WIDTH / 2, barY + barH + 14);
            ctx.textAlign = 'left';
        }

        // Turtumba defeated message
        if (turtumbaDefeated && currentLevelIndex === 4) {
            ctx.fillStyle = '#00FF66';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('TURTUMBA DEFEATED! → REACH THE FLAG!', GAME_WIDTH / 2, 80);
            ctx.textAlign = 'left';
        }

        // ── Bomba UI HUD (screen-space) ────────
        if (bomba && !bomba.dead && currentLevelIndex === 2) {
            const barW = 300;
            const barH = 16;
            const barX = GAME_WIDTH / 2 - barW / 2;
            const barY = 50;

            ctx.fillStyle = '#FFDD88';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            if (bomba.windowOpen) {
                ctx.fillText(`💣 BOMBA — SHOOTER DESTROYED! TRANSFORM TO SMALL BEN TO ENTER THE WINDOW!`, GAME_WIDTH / 2, barY + barH + 14);
            } else {
                ctx.fillText(`💣 BOMBA — Use FULLY CHARGED Four Arms Ground Pound on the Shooter!`, GAME_WIDTH / 2, barY + barH + 14);
            }
            ctx.textAlign = 'left';
        }

        // Bomba defeated message
        if (bombaDefeated && currentLevelIndex === 2) {
            ctx.fillStyle = '#FFDD88';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('BOMBA DEFEATED! → REACH THE EXIT!', GAME_WIDTH / 2, 80);
            ctx.textAlign = 'left';
        }

        // ── Gomrog UI HUD (screen-space) ────────
        if (gomrog && !gomrog.dead && currentLevelIndex === 5) {
            const barW = 300;
            const barH = 16;
            const barX = GAME_WIDTH / 2 - barW / 2;
            const barY = 50;
            const hpRatio = gomrog.hp / gomrog.maxHp;

            ctx.fillStyle = 'rgba(0,40,0,0.7)';
            ctx.fillRect(barX - 4, barY - 4, barW + 8, barH + 24);

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            const r = Math.floor(255 * (1 - hpRatio));
            const g = Math.floor(255 * hpRatio);
            ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
            ctx.fillRect(barX, barY, barW * hpRatio, barH);
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barW, barH);
            ctx.lineWidth = 1;

            ctx.fillStyle = '#00FF66';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            if (gomrog.state === 'TONGUE_ATTACK') {
                ctx.fillText(`🐸 GOMROG — AVOID HIS TONGUE AND SHOOT GOMROG! ${gomrog.hp}/${gomrog.maxHp}`, GAME_WIDTH / 2, barY + barH + 14);
            } else {
                ctx.fillText(`🐸 GOMROG — HIT HIS BODY 10 TIMES TO DROP HIM IN THE POND! ${gomrog.hp}/${gomrog.maxHp}`, GAME_WIDTH / 2, barY + barH + 14);
            }
            ctx.textAlign = 'left';
        }

        // Gomrog defeated message
        if (gomrogDefeated && currentLevelIndex === 5) {
            ctx.fillStyle = '#00FF66';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GOMROG DEFEATED! → REACH THE EXIT!', GAME_WIDTH / 2, 80);
            ctx.textAlign = 'left';
        }

        // ── Gorillomba UI HUD (screen-space) ────────
        if (gorillomba && !gorillomba.dead && currentLevelIndex === 7) {
            const barW = 300;
            const barH = 16;
            const barX = GAME_WIDTH / 2 - barW / 2;
            const barY = 50;
            const hpRatio = gorillomba.hp / gorillomba.maxHp;

            ctx.fillStyle = 'rgba(20,10,0,0.7)';
            ctx.fillRect(barX - 4, barY - 4, barW + 8, barH + 24);

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            const r = Math.floor(255 * (1 - hpRatio));
            const g = Math.floor(255 * hpRatio);
            ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
            ctx.fillRect(barX, barY, barW * hpRatio, barH);
            ctx.strokeStyle = '#AAFF44';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barW, barH);
            ctx.lineWidth = 1;

            ctx.fillStyle = '#AAFF44';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            if (mario.state !== 'WILDMUTT') {
                ctx.fillText(`🦍 GORILLOMBA — YOU MUST BE WILD MUTT TO SEE AND HIT HIM! ???/???`, GAME_WIDTH / 2, barY + barH + 14);
            } else {
                ctx.fillText(`🦍 GORILLOMBA — PUNCH HIS CHEST TO DEFEAT HIM! ${gorillomba.hp}/${gorillomba.maxHp}`, GAME_WIDTH / 2, barY + barH + 14);
            }
            ctx.textAlign = 'left';
        }

        // Gorillomba defeated message
        if (gorillombaDefeated && currentLevelIndex === 7) {
            ctx.fillStyle = '#AAFF44';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GORILLOMBA DEFEATED! → REACH THE EXIT!', GAME_WIDTH / 2, 80);
            ctx.textAlign = 'left';
        }

        // ── Night King UI HUD (screen-space) ────────
        if (nightKing && !nightKing.dead && currentLevelIndex === 8) {
            const barW = 300;
            const barH = 16;
            const barX = GAME_WIDTH / 2 - barW / 2;
            const barY = 50;
            const hpRatio = 1;

            ctx.fillStyle = 'rgba(0,10,20,0.7)';
            ctx.fillRect(barX - 4, barY - 4, barW + 8, barH + 24);

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = `#00FFFF`;
            ctx.fillRect(barX, barY, barW * hpRatio, barH);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barW, barH);
            ctx.lineWidth = 1;

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            if (mario.hasDragonglass) {
                if (mario.state === 'DIAMONDHEAD') {
                    ctx.fillText(`❄️ NIGHT KING — TOUCH HIM TO SHATTER HIM!`, GAME_WIDTH / 2, barY + barH + 14);
                } else {
                    ctx.fillText(`❄️ NIGHT KING — ONLY DIAMONDHEAD CAN WIELD THE DRAGONGLASS!`, GAME_WIDTH / 2, barY + barH + 14);
                }
            } else {
                ctx.fillText(`❄️ NIGHT KING — IMMUNE TO EVERYTHING! FIND DRAGONGLASS!`, GAME_WIDTH / 2, barY + barH + 14);
            }
            ctx.textAlign = 'left';
        }

        // Night King defeated message
        if (nightKingDefeated && currentLevelIndex === 8) {
            ctx.fillStyle = '#00FFFF';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('NIGHT KING SHATTERED! → REACH THE FLAG!', GAME_WIDTH / 2, 80);
            ctx.textAlign = 'left';
        }

        // Slow zone warning
        if (currentLevelIndex === 4 && level.slowZoneStart > 0 && turtumba && !turtumba.dead) {
            if (mario.x >= level.slowZoneStart && mario.state !== 'XLR8') {
                ctx.fillStyle = '#00FF00';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⚠️ SLOW ZONE — Transform to XLR8 to move freely!', GAME_WIDTH / 2, 110);
                ctx.textAlign = 'left';
            }
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

// ── TEMPORARY DEV TOOLS ──────────────────
window.devWarp = function(levelNum) {
    console.log('[DEV] Warping to Level ' + levelNum);
    
    // Give all unlocks up to the current level
    mario.hasWatch = true;
    for (let i = 0; i < levelNum - 1; i++) {
        if (ALIENS[i]) ALIENS[i].unlocked = true;
    }
    
    // Hide UI panels if any
    document.getElementById('level-complete-modal').style.display = 'none';
    document.getElementById('omnitrix-intro').style.display = 'none';
    closeOmnitrixPanel();
    
    // Reset state & load level
    sfx.stopMusic();
    gameState = 'PLAYING';
    currentLevelIndex = levelNum;
    loadLevel(currentLevelIndex, { hasWatch: true });
};
