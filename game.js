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
import { Knightkomba } from './src/entities/Knightkomba.js';
import { CrystalShard } from './src/entities/CrystalShard.js';
import { DragonglassDiamond } from './src/entities/DragonglassDiamond.js';
import { RipjawsItem } from './src/entities/RipjawsItem.js';
import { JellyfishGoomba } from './src/entities/JellyfishGoomba.js';
import { Octumba } from './src/entities/Octumba.js';
import { MucusProjectile } from './src/entities/MucusProjectile.js';
import { GreyMatterItem } from './src/entities/GreyMatterItem.js';
import { OmnitrixVirus } from './src/entities/OmnitrixVirus.js';
import { Vilgumbobo } from './src/entities/Vilgumbobo.js';
import { GhostfreakItem } from './src/entities/GhostfreakItem.js';
import { GhostGoomba } from './src/entities/GhostGoomba.js';
import { Freakosto } from './src/entities/Freakosto.js';

const sfx = new SoundManager();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let GAME_WIDTH = window.innerWidth;
let GAME_HEIGHT = window.innerHeight;
var level, mario;

function resizeCanvas() {
    GAME_WIDTH = window.innerWidth;
    GAME_HEIGHT = window.innerHeight;
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);



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
const omnitrixStatus = document.getElementById('omnitrix-status');
const btnRandomTransform = document.getElementById('btn-random-transform');
const btnBuyManual = document.getElementById('btn-buy-manual');
const btnOpenShop = document.getElementById('btn-open-shop');
const omnitrixControlsWrapper = document.getElementById('omnitrix-controls-wrapper');
const omnitrixShopScreen = document.getElementById('omnitrix-shop-screen');
const omnitrixShopMessage = document.getElementById('omnitrix-shop-message');
const btnShopJump = document.getElementById('btn-shop-jump');
const btnShopTime = document.getElementById('btn-shop-time');
const btnShopContinuousManual = document.getElementById('btn-shop-continuous-manual');
const btnCloseShop = document.getElementById('btn-close-shop');
const controlsModal = document.getElementById('controls-modal');
const btnStartGame = document.getElementById('btn-start-game');

// ─── Alien Roster Definition ─────────────────
const ALIENS = [
    { key: '1', name: 'Four Arms', icon: '💪', unlocked: false, lives: 25 },
    { key: '2', name: 'Heatblast', icon: '🔥', unlocked: false, lives: 25 },
    { key: '3', name: 'XLR8', icon: '⚡', unlocked: false, lives: 25 },
    { key: '4', name: 'Stinkfly', icon: '🪰', unlocked: false, lives: 25 },
    { key: '5', name: 'Upgrade', icon: '💻', unlocked: false, lives: 25 },
    { key: '6', name: 'Wild Mutt', icon: '🐺', unlocked: false, lives: 25 },
    { key: '7', name: 'Diamondhead', icon: '💎', unlocked: false, lives: 25 },
    { key: '8', name: 'Ripjaws', icon: '🦈', unlocked: false, lives: 25 },
    { key: '9', name: 'Grey Matter', icon: '🐸', unlocked: false, lives: 25 },
    { key: '10', name: 'Ghostfreak', icon: '👻', unlocked: false, lives: 25 },
];
let currentLevelIndex = 1;

function getDefaultBoxEnemyType(levelIndex) {
    if (levelIndex === 3) return 'lava_goomba';
    if (levelIndex === 4) return 'shield_drone';
    if (levelIndex === 5) return 'ooze_goomba';
    if (levelIndex === 5) return 'ooze_goomba';
    if (levelIndex === 6) return 'electromba';
    if (levelIndex === 8) return 'whitewalker_goomba';
    if (levelIndex === 9) return 'jellyfish_goomba';
    if (levelIndex === 10) return 'omnitrix_virus';
    if (levelIndex === 11) return 'ghost_goomba';
    return 'goomba';
}

function createEnemyByType(type, x, y, entitiesArray = null, fromBox = false) {
    if (type === 'lava_goomba') return new LavaGoomba(x, y);
    if (type === 'shield_drone') return new ShieldDrone(x, y);
    if (type === 'ooze_goomba') return new OozeGoomba(x, y);
    if (type === 'electromba') return new Electromba(x, y, entitiesArray);
    if (type === 'whitewalker_goomba') return new WhiteWalkerGoomba(x, y);
    if (type === 'jellyfish_goomba') return new JellyfishGoomba(x, y, fromBox);
    if (type === 'omnitrix_virus') return new OmnitrixVirus(x, y);
    if (type === 'ghost_goomba') return new GhostGoomba(x, y);
    return new Goomba(x, y);
}

let score = 0;
const manualUsesByLevel = {};
const continuousManualByLevel = {};
const MANUAL_UNLOCK_COST = 3000;
const SHOP_EXTRA_JUMP_COST = 200;
const SHOP_EXTRA_TIME_COST = 2000;
const SHOP_CONTINUOUS_MANUAL_COST = 25000;
const LEVEL_TIME_LIMIT_SECONDS = 180;
const SCORE_FOR_ENEMY_KILL = 100;
const SCORE_FOR_BOSS_KILL = 2000;
const SCORE_FOR_ITEM = 500;
const SCORE_FOR_LEVEL_CLEAR = 1000;
const SCORED_ENEMY_TYPES = new Set([
    'goomba', 'lava_goomba', 'shield_drone', 'ooze_goomba', 'electromba',
    'pipe_chomper', 'sludge_bat', 'whitewalker_goomba', 'jellyfish_goomba',
    'omnitrix_virus', 'ghost_goomba'
]);

function addScore(points) {
    score += points;
}

function getManualUsesForLevel(levelIndex) {
    return manualUsesByLevel[levelIndex] || 0;
}

function hasContinuousManualForLevel(levelIndex) {
    return !!continuousManualByLevel[levelIndex];
}

function hasManualControlForLevel(levelIndex) {
    return hasContinuousManualForLevel(levelIndex) || getManualUsesForLevel(levelIndex) > 0;
}

function addManualUseForLevel(levelIndex, amount = 1) {
    manualUsesByLevel[levelIndex] = getManualUsesForLevel(levelIndex) + amount;
}

function consumeManualUseForLevel(levelIndex) {
    if (hasContinuousManualForLevel(levelIndex)) return;
    const remaining = getManualUsesForLevel(levelIndex);
    if (remaining <= 0) return;
    const next = remaining - 1;
    if (next > 0) {
        manualUsesByLevel[levelIndex] = next;
    } else {
        delete manualUsesByLevel[levelIndex];
    }
}

function activateContinuousManualForLevel(levelIndex) {
    continuousManualByLevel[levelIndex] = true;
    delete manualUsesByLevel[levelIndex];
}

function getIntendedAlienIndex(levelIndex) {
    if (levelIndex < 2 || levelIndex > 11) return -1;
    return levelIndex - 2;
}

function getRandomAlienIndex() {
    const intendedIndex = getIntendedAlienIndex(currentLevelIndex);
    const previousUnlocked = [];
    for (let i = 0; i < ALIENS.length; i++) {
        if (i < intendedIndex && ALIENS[i].unlocked && ALIENS[i].lives > 0) {
            previousUnlocked.push(i);
        }
    }

    const intendedUsable = intendedIndex >= 0 &&
        ALIENS[intendedIndex] &&
        ALIENS[intendedIndex].unlocked &&
        ALIENS[intendedIndex].lives > 0;

    if (intendedUsable && Math.random() < 0.3) return intendedIndex;
    if (previousUnlocked.length > 0) return previousUnlocked[Math.floor(Math.random() * previousUnlocked.length)];
    if (intendedUsable) return intendedIndex;
    return -1;
}

function randomTransform() {
    if (isTransformationLocked()) return;
    const idx = getRandomAlienIndex();
    if (idx >= 0) activateAlien(idx, { manualSelection: false });
}

function setOmnitrixShopMessage(message, isError = false) {
    if (!omnitrixShopMessage) return;
    omnitrixShopMessage.textContent = message;
    omnitrixShopMessage.style.color = isError ? '#FF6666' : '#9BFFAA';
}

function updateShopButtons() {
    if (!btnShopJump || !btnShopTime || !btnShopContinuousManual) return;
    const continuousManual = hasContinuousManualForLevel(currentLevelIndex);
    const transformLocked = isTransformationLocked();

    btnShopJump.textContent = `+1 Jump (${SHOP_EXTRA_JUMP_COST})`;
    btnShopTime.textContent = `+1 Min Time (${SHOP_EXTRA_TIME_COST})`;
    btnShopContinuousManual.textContent = continuousManual
        ? 'Manual∞ Active'
        : `Continuous Manual (${SHOP_CONTINUOUS_MANUAL_COST})`;

    btnShopJump.disabled = score < SHOP_EXTRA_JUMP_COST;
    btnShopTime.disabled = score < SHOP_EXTRA_TIME_COST;
    btnShopContinuousManual.disabled = continuousManual || score < SHOP_CONTINUOUS_MANUAL_COST;
}

function updateOmnitrixControls() {
    if (!omnitrixStatus || !btnBuyManual || !btnRandomTransform || !btnOpenShop) return;
    const manualUses = getManualUsesForLevel(currentLevelIndex);
    const continuousManual = hasContinuousManualForLevel(currentLevelIndex);
    const transformLocked = isTransformationLocked();

    if (transformLocked) {
        omnitrixStatus.textContent = 'Transformation locked until timer ends';
    } else if (continuousManual) {
        omnitrixStatus.textContent = `Manual∞ | Score ${score}`;
        btnBuyManual.textContent = 'Manual∞ Active';
        btnBuyManual.disabled = true;
    } else if (manualUses > 0) {
        omnitrixStatus.textContent = `Manual x${manualUses} | Score ${score}`;
        btnBuyManual.textContent = `+1 Manual (${MANUAL_UNLOCK_COST})`;
        btnBuyManual.disabled = score < MANUAL_UNLOCK_COST;
    } else {
        omnitrixStatus.textContent = `Random Mode | Score ${score}`;
        btnBuyManual.textContent = `1 Manual (${MANUAL_UNLOCK_COST})`;
        btnBuyManual.disabled = score < MANUAL_UNLOCK_COST;
    }

    btnBuyManual.style.display = 'block';
    btnRandomTransform.style.display = 'block';
    btnOpenShop.style.display = 'block';
    btnRandomTransform.disabled = transformLocked;
    updateShopButtons();
}

// ─── Build the alien grid HTML ────────────────
let alienIcons = {};

function generateAlienIcons() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 150;
    tempCanvas.height = 150;
    const tctx = tempCanvas.getContext('2d');

    const dummyMario = new Mario(0, 0, { isDown: () => false });
    
    const states = [
        { name: 'FOURARMS', key: '1' },
        { name: 'HEATBLAST', key: '2' },
        { name: 'XLR8', key: '3' },
        { name: 'STINKFLY', key: '4' },
        { name: 'UPGRADE', key: '5' },
        { name: 'WILDMUTT', key: '6' },
        { name: 'DIAMONDHEAD', key: '7' },
        { name: 'RIPJAWS', key: '8' },
        { name: 'GREYMATTER', key: '9' },
        { name: 'GHOSTFREAK', key: '10' }
    ];

    states.forEach(s => {
        tctx.clearRect(0, 0, 150, 150);
        dummyMario.state = s.name;
        dummyMario.grounded = true;
        dummyMario.vx = 0;
        dummyMario.vy = 0;
        
        if (s.name === 'FOURARMS' || s.name === 'HEATBLAST') {
            dummyMario.width = 48; dummyMario.height = 64;
        } else if (s.name === 'XLR8') {
            dummyMario.width = 40; dummyMario.height = 56;
        } else if (s.name === 'STINKFLY') {
            dummyMario.width = 45; dummyMario.height = 50;
        } else if (s.name === 'UPGRADE') {
            dummyMario.width = 36; dummyMario.height = 50;
        } else if (s.name === 'WILDMUTT') {
            dummyMario.width = 52; dummyMario.height = 48;
        } else if (s.name === 'DIAMONDHEAD') {
            dummyMario.width = 44; dummyMario.height = 60;
        } else if (s.name === 'RIPJAWS') {
            dummyMario.width = 40; dummyMario.height = 55;
        } else if (s.name === 'GREYMATTER') {
            dummyMario.width = 16; dummyMario.height = 24;
        } else if (s.name === 'GHOSTFREAK') {
            dummyMario.width = 40; dummyMario.height = 50;
        }

        dummyMario.x = 75 - dummyMario.width / 2;
        dummyMario.y = 75 - dummyMario.height / 2;
        dummyMario.facingRight = true;
        dummyMario.transforming = false;
        
        try {
            dummyMario.draw(tctx);
            alienIcons[s.name] = tempCanvas.toDataURL();
        } catch (e) {
            console.error("Failed to draw alien icon for " + s.name, e);
        }
    });
}

function renderAlienGrid() {
    if (Object.keys(alienIcons).length === 0) {
        generateAlienIcons();
    }

    alienGrid.innerHTML = '';
    const manualUnlocked = hasManualControlForLevel(currentLevelIndex);
    const transformLocked = isTransformationLocked();
    const radius = 210; 
    const centerX = 270; 
    const centerY = 270;

    ALIENS.forEach((alien, i) => {
        const slot = document.createElement('div');
        const isUnlocked = !!alien.unlocked; // Direct check
        const isUsable = isUnlocked && alien.lives > 0 && manualUnlocked && !transformLocked;
        
        slot.className = 'alien-slot ' + (isUnlocked ? 'unlocked' : 'locked');
        
        const angle = (i * (360 / ALIENS.length) - 90) * (Math.PI / 180);
        const x = centerX + radius * Math.cos(angle) - 45; 
        const y = centerY + radius * Math.sin(angle) - 45;
        
        slot.style.left = `${x}px`;
        slot.style.top = `${y}px`;

        const livesDisplay = isUnlocked ? `<span class="slot-lives">♥${alien.lives}</span>` : '';
        const stateName = alien.name.toUpperCase().replace(' ', '');
        const iconUrl = alienIcons[stateName];

        slot.innerHTML = `
            <div class="alien-slot-inner">
                <span class="slot-key">${alien.key}</span>
                <div class="slot-icon">
                    ${isUnlocked && iconUrl ? `<img src="${iconUrl}" alt="${alien.name}">` : `<span style="font-size:32px; color:#39FF1433">?</span>`}
                </div>
                <span class="slot-name">${isUnlocked ? alien.name : 'REDACTED'}</span>
                ${livesDisplay}
            </div>
        `;
        if (isUsable) {
            slot.title = `TRANSFORM: ${alien.key} • ${alien.name} (${alien.lives} left)`;
            slot.onclick = () => activateAlien(i, { manualSelection: true });
        } else if (transformLocked) {
            slot.title = 'Locked: wait for current transformation timer to finish.';
        }

        alienGrid.appendChild(slot);
    });
    
    updateOmnitrixControls();
}
renderAlienGrid();

// ─── Omnitrix Panel State ─────────────────────
let omnitrixPanelOpen = false;
let omnitrixShopOpen = false;
let lastOmnitrixLockedState = false;

function isTransformationLocked() {
    if (!mario) return false;
    const alienCountdownRunning = mario.state !== 'SMALL' && mario.alienTimer > 0;
    return !!(mario.transforming || alienCountdownRunning);
}

function showOmnitrixAlienScreen() {
    omnitrixShopOpen = false;
    if (alienGrid) alienGrid.style.display = 'block';
    if (omnitrixControlsWrapper) omnitrixControlsWrapper.style.display = 'flex';
    if (omnitrixShopScreen) omnitrixShopScreen.style.display = 'none';
}

function openOmnitrixShop() {
    if (!omnitrixShopScreen) return;
    omnitrixShopOpen = true;
    if (alienGrid) alienGrid.style.display = 'none';
    if (omnitrixControlsWrapper) omnitrixControlsWrapper.style.display = 'none';
    omnitrixShopScreen.style.display = 'flex';
    setOmnitrixShopMessage('Spend score to boost this level.');
    updateShopButtons();
}

function closeOmnitrixShop() {
    showOmnitrixAlienScreen();
}

function openOmnitrixPanel() {
    if (!mario.hasWatch) return;
    showOmnitrixAlienScreen();
    omnitrixPanelOpen = true;
    omnitrixPanel.classList.toggle('locked', isTransformationLocked());
    omnitrixPanel.style.display = 'flex';
    if (alienGrid) alienGrid.classList.add('rotating-clockwise');
    renderAlienGrid();
    sfx.omnitrixOpen();
}

function closeOmnitrixPanel() {
    showOmnitrixAlienScreen();
    omnitrixPanelOpen = false;
    if (alienGrid) alienGrid.classList.remove('rotating-clockwise');
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

btnStartGame.addEventListener('click', () => {
    controlsModal.style.display = 'none';
    gameState = 'PLAYING';
    sfx.collectItem(); // Small feedback sound
});

// ─── Alien Activation ────────────────────────
function activateAlien(index, options = {}) {
    const { manualSelection = false } = options;
    const alien = ALIENS[index];
    if (isTransformationLocked()) return;
    if (!alien.unlocked || alien.lives <= 0) return;
    if (manualSelection && !hasManualControlForLevel(currentLevelIndex)) return;

    if (manualSelection) {
        consumeManualUseForLevel(currentLevelIndex);
    }

    // Decrement lives
    alien.lives--;
    if (alien.lives <= 0) {
        alien.unlocked = false;
    }

    closeOmnitrixPanel();
    alien.introMessage = null;
    renderAlienGrid();

    sfx.transform();
    screenShake = 15;
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
    } else if (alien.name === 'Ripjaws') {
        mario.transformToRipjaws();
    } else if (alien.name === 'Grey Matter') {
        mario.transformToGreyMatter();
    } else if (alien.name === 'Ghostfreak') {
        mario.transformToGhostfreak();
    }
}

btnRandomTransform.addEventListener('click', () => {
    randomTransform();
});

btnBuyManual.addEventListener('click', () => {
    if (hasContinuousManualForLevel(currentLevelIndex)) return;
    if (score < MANUAL_UNLOCK_COST) return;
    score -= MANUAL_UNLOCK_COST;
    addManualUseForLevel(currentLevelIndex, 1);
    renderAlienGrid();
});

btnOpenShop.addEventListener('click', () => {
    openOmnitrixShop();
});

btnCloseShop.addEventListener('click', () => {
    closeOmnitrixShop();
});

btnShopJump.addEventListener('click', () => {
    if (score < SHOP_EXTRA_JUMP_COST) {
        setOmnitrixShopMessage('Not enough score for extra jump.', true);
        return;
    }
    score -= SHOP_EXTRA_JUMP_COST;
    mario.doubleJumpsRemaining += 1;
    setOmnitrixShopMessage('Purchased: +1 extra jump.');
    updateOmnitrixControls();
});

btnShopTime.addEventListener('click', () => {
    if (score < SHOP_EXTRA_TIME_COST) {
        setOmnitrixShopMessage('Not enough score for extra time.', true);
        return;
    }
    score -= SHOP_EXTRA_TIME_COST;
    levelTimeRemaining += 60;
    setOmnitrixShopMessage('Purchased: +1 minute level time.');
    updateOmnitrixControls();
});

btnShopContinuousManual.addEventListener('click', () => {
    if (hasContinuousManualForLevel(currentLevelIndex)) {
        setOmnitrixShopMessage('Continuous manual is already active.');
        return;
    }
    if (score < SHOP_CONTINUOUS_MANUAL_COST) {
        setOmnitrixShopMessage('Not enough score for continuous manual.', true);
        return;
    }
    score -= SHOP_CONTINUOUS_MANUAL_COST;
    activateContinuousManualForLevel(currentLevelIndex);
    setOmnitrixShopMessage('Purchased: continuous manual active this level.');
    renderAlienGrid();
});

// ─── Core state ──────────────────────────────
const input = new Input();
let lastTime = 0;
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

// ─── Level Timer Logic ───
let levelTimeRemaining = LEVEL_TIME_LIMIT_SECONDS; // 3 minutes
let levelStartScore = 0;      // Backup to reset score for that level
let levelRestartFlashActive = false;
let levelRestartFlashTimer = 0;

// Knightkomba boss reference
let knightkomba = null;
let knightkombaDefeated = false;

// Octumba boss reference (Level 9)
let octumba = null;
let octumbaDefeated = false;

// Vilgumbobo boss reference (Level 10)
let vilgumbobo = null;
export let vilgumboboDefeated = false; // exported for Level_v2.js palette swap

// Freakosto boss reference (Level 11)
let freakosto = null;
let freakostoDefeated = false;

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
                else if (currentLevelIndex === 9) ItemClass = RipjawsItem;
                else if (currentLevelIndex === 10) ItemClass = GreyMatterItem;
                else if (currentLevelIndex === 11) ItemClass = GhostfreakItem;
            }

            if (ItemClass) {
                entities.push(new ItemClass(bx, by - 32));
            } else {
                entities.push(createEnemyByType(getDefaultBoxEnemyType(currentLevelIndex), bx, by - 32, entities, true));
            }
        }
    };
}

function loadLevel(index, carryOverState = null) {
    currentLevelIndex = index;
    level = new Level(index);
    
    // Timer Init
    levelTimeRemaining = LEVEL_TIME_LIMIT_SECONDS;
    levelStartScore = score;
    levelRestartFlashActive = false;

    const startY = (level.rows - 7) * level.tileSize;
    mario = new Mario(100, startY, input);

    if (carryOverState && carryOverState.hasWatch) {
        mario.hasWatch = true;
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
    gorillombaDefeated = false;
    knightkomba = null;
    knightkombaDefeated = false;
    octumba = null;
    octumbaDefeated = false;
    vilgumbobo = null;
    vilgumboboDefeated = false;
    freakosto = null;
    freakostoDefeated = false;

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
        } else if (entityData.type === 'knightkomba') {
            knightkomba = new Knightkomba(entityData.x, entityData.y, entities);
            entities.push(knightkomba);
        } else if (entityData.type === 'dragonglass_diamond') {
            entities.push(new DragonglassDiamond(entityData.x, entityData.y, entities));
        } else if (entityData.type === 'whitewalker_goomba') {
            entities.push(new WhiteWalkerGoomba(entityData.x, entityData.y));
        } else if (entityData.type === 'ripjaws_item') {
            entities.push(new RipjawsItem(entityData.x, entityData.y));
        } else if (entityData.type === 'octumba') {
            octumba = new Octumba(entityData.x, entityData.y, entities);
            entities.push(octumba);
        } else if (entityData.type === 'jellyfish_goomba') {
            entities.push(new JellyfishGoomba(entityData.x, entityData.y));
        } else if (entityData.type === 'grey_matter_item') {
            entities.push(new GreyMatterItem(entityData.x, entityData.y));
        } else if (entityData.type === 'omnitrix_virus') {
            entities.push(new OmnitrixVirus(entityData.x, entityData.y));
        } else if (entityData.type === 'vilgumbobo') {
            vilgumbobo = new Vilgumbobo(entityData.x, entityData.y, entities);
            entities.push(vilgumbobo);
        } else if (entityData.type === 'freakosto') {
            freakosto = new Freakosto(entityData.x, entityData.y, entities);
            entities.push(freakosto);
        } else if (entityData.type === 'ghost_goomba') {
            entities.push(new GhostGoomba(entityData.x, entityData.y));
        } else if (entityData.type === 'ghostfreak_item') {
            entities.push(new GhostfreakItem(entityData.x, entityData.y));
        }
    });


    levelTitleTimer = performance.now();
    
    // If first time starting or warped, maybe show controls? 
    // For now, only show controls on the very first start (Level 1)
    if (index === 1 && !mario.hasWatch) {
        controlsModal.style.display = 'flex';
        gameState = 'PAUSED';
    } else {
        gameState = 'PLAYING';
    }

    modal.style.display = 'none';
    closeOmnitrixPanel();
    canvas.classList.toggle('level2-theme', index === 2);
    canvas.classList.toggle('level3-theme', index === 3);
    canvas.classList.toggle('level4-theme', index === 4);
    canvas.classList.toggle('level5-theme', index === 5);
    canvas.classList.toggle('level6-theme', index === 6);
    canvas.classList.toggle('level7-theme', index === 7);
    canvas.classList.toggle('level8-theme', index === 8);
    canvas.classList.toggle('level9-theme', index === 9);
    canvas.classList.toggle('level10-theme', index === 10);
    canvas.classList.toggle('level11-theme', index === 11);
    canvas.classList.remove('fixed');

    // Sound: start level music
    bossEntrancePlayed = false;
    lastAlienState = 'SMALL';
    sfx.startMusic(index);
}

loadLevel(1);

// ─── Modal Buttons ────────────────────────────
btnNext.addEventListener('click', () => {
    loadLevel(currentLevelIndex + 1, { hasWatch: mario.hasWatch });
});

btnRestart.addEventListener('click', () => {
    deathPenalty();
    loadLevel(currentLevelIndex, { hasWatch: mario.hasWatch });
});

function deathPenalty() {
    // 1. Lock and reset the specific alien for this level so they must look for the item again
    if (currentLevelIndex === 1) {
        mario.hasWatch = false;
    } else if (currentLevelIndex >= 2) {
        const alienIndex = currentLevelIndex - 2;
        if (ALIENS[alienIndex]) {
            ALIENS[alienIndex].unlocked = false;
            ALIENS[alienIndex].lives = 25; // Reset lives for this alien
            ALIENS[alienIndex].introMessage = null;
        }
    }

    // 2. Each OTHER unlocked alien loses 1 life; lock if lives reach 0
    ALIENS.forEach((alien, idx) => {
        if (currentLevelIndex >= 2 && idx === currentLevelIndex - 2) {
            // Already handled specifically
            return;
        }
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
    addScore(SCORE_FOR_LEVEL_CLEAR);
    modalTitle.textContent = title;
    modalMessage.textContent = `${message} (+${SCORE_FOR_LEVEL_CLEAR} score)`;
    btnNext.style.display = showNext ? 'block' : 'none';
    modal.style.display = 'flex';
}

function handleCKeyPress() {
    if (mario && mario.hasWatch && gameState !== 'PAUSED') {
        omnitrixPanelOpen ? closeOmnitrixPanel() : openOmnitrixPanel();
    }
}

function handleFKeyPress() {
    if (mario && gameState === 'PLAYING') {
        // Vilgumbobo final hits execution check
        if (typeof vilgumbobo !== 'undefined' && vilgumbobo && vilgumbobo.stunned && !vilgumbobo.dead) {
            const dist = Math.hypot((mario.x + mario.width / 2) - (vilgumbobo.x + vilgumbobo.width / 2),
                (mario.y + mario.height / 2) - (vilgumbobo.y + vilgumbobo.height / 2));
            if (dist < 300) {
                vilgumbobo.finalHits++;
                sfx.bossHit();
                screenShake = 15;
                return;
            }
        }

        if (mario.state === 'HEATBLAST') {
            // Fireball — rapid press increases power
            const now = performance.now();
            const rapidWindow = 500;
            const cooldownMs = 300;

            if (now - mario.fireballLastPress < rapidWindow) {
                mario.fireballPower = Math.min(mario.fireballPower + 1, 5);
            } else {
                mario.fireballPower = 1;
            }
            mario.fireballLastPress = now;

            if (now - mario.fireballCooldown > cooldownMs) {
                mario.fireballCooldown = now;
                const dir = mario.facingRight ? 1 : -1;
                const fx = mario.x + (mario.facingRight ? mario.width : 0);
                const fy = mario.y + mario.height / 2 - 6;
                entities.push(new Fireball(fx, fy, dir, mario.fireballPower));
                sfx.fireball(mario.fireballPower);
            }
        } else if (mario.state === 'XLR8') {
            const now = performance.now();
            if (now - mario.dashCooldown > mario.dashCooldownMs && !mario.dashActive) {
                mario.dashActive = true;
                mario.dashTimer = now;
                mario.dashCooldown = now;
            }
        } else if (mario.state === 'STINKFLY') {
            const now = performance.now();
            if (!mario.slimeCooldown || now - mario.slimeCooldown > 400) {
                mario.slimeCooldown = now;
                const fx = mario.x + mario.width / 2 - 8;
                const fy = mario.y + mario.height;
                entities.push(new Slimeball(fx, fy, mario.facingRight));
                sfx.stomp();
                mario.vy = Math.min(0, mario.vy - 3);
            }
        } else if (mario.state === 'WILDMUTT') {
            const now = performance.now();
            if (!mario.pounceCooldown || now - mario.pounceCooldown > 800) {
                mario.pounceCooldown = now;
                mario.pounceActive = true;
                mario.pounceStartTime = now;
                mario.vy = -12; // Pounce jump height
                mario.vx = mario.facingRight ? 16 : -16; // Pounce distance
                mario.grounded = false;
                sfx.stomp(); // Pounce sound
            }
        } else if (mario.state === 'DIAMONDHEAD') {
            const now = performance.now();
            if (!mario.crystalCooldown || now - mario.crystalCooldown > 400) {
                mario.crystalCooldown = now;
                const fx = mario.x + (mario.facingRight ? mario.width : 0);
                const fy = mario.y + mario.height / 2;
                entities.push(new CrystalShard(fx, fy, mario.facingRight ? 1 : -1, 1));
                sfx.stomp();
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

            entities.forEach(target => {
                if (target.dead || target.absorbed) return;
                const dist = Math.abs((mario.x + mario.width / 2) - (target.x + target.width / 2));
                const distY = Math.abs((mario.y + mario.height / 2) - (target.y + target.height / 2));
                if (dist < 60 && distY < 60) {
                    if (target.type === 'electromba') {
                        if (currentLevelIndex !== 6 || (target.isHacked && target.isHacked())) {
                            target.absorbed = true;
                            target.type = 'goomba';
                            sfx.stomp();
                        }
                    } else if (target.type === 'gomboto') {
                        if (currentLevelIndex !== 6 || target.claimReady) {
                            target.absorbed = true;
                            mario.controllingBoss = target;
                            mario.y = target.y - mario.height;
                            const flagX = level.cols - 2;
                            for (let fy = 4; fy < level.rows; fy++) {
                                level.tiles[fy][flagX] = 5;
                            }
                            level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                            sfx.bossHit();
                        }
                    }
                }
            });

            const mCX = Math.floor((mario.x + mario.width / 2) / level.tileSize);
            const mCY = Math.floor((mario.y + mario.height / 2) / level.tileSize);
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const tx = mCX + dx;
                    const ty = mCY + dy;
                    if (level.tiles[ty] && level.tiles[ty][tx]) {
                        if (level.tiles[ty][tx] === 12) {
                            level.tiles[ty][tx] = 1;
                            sfx.stomp();
                        } else if (level.tiles[ty][tx] === 13) {
                            level.tiles[ty][tx] = 2;
                            sfx.stomp();
                        }
                    }
                }
            }
        }
    }
}

// ─── Input: C key, F key & 1–0 keys (one-shot keydown) ─────────
window.addEventListener('keydown', (e) => {
    // Toggle Omnitrix panel with C
    if (e.code === 'KeyC') {
        handleCKeyPress();
        e.preventDefault();
    }

    // M key — toggle mute
    if (e.code === 'KeyM') {
        const muted = sfx.toggleMute();
        console.log(muted ? '🔇 Sound MUTED' : '🔊 Sound ON');
    }

    // F key — context-dependent:
    if (e.code === 'KeyF') {
        if (e.repeat) return; // Prevent performance issues from key repeat
        handleFKeyPress();
        e.preventDefault();
    }

    // Prevent default scrolling for arrow keys, space, and W/S
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
    }

    // Number keys 1–0 transform when panel is open
    if (omnitrixPanelOpen) {
        if (omnitrixShopOpen) return;
        if (!hasManualControlForLevel(currentLevelIndex)) return;
        let idx = -1;
        if (e.key >= '1' && e.key <= '9') {
            idx = parseInt(e.key, 10) - 1;
        } else if (e.key === '0') {
            idx = 9;
        }
        if (idx >= 0 && idx < ALIENS.length) {
            activateAlien(idx, { manualSelection: true });
        }
    }
});

// ─── Mouse Input Mappings ─────────────────────
window.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left click
        handleFKeyPress();
    } else if (e.button === 2) { // Right click
        handleCKeyPress();
    }
});

// Prevent context menu on right click to avoid browser default overlay
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// ─── Main Game Loop ───────────────────────────
function gameLoop(timestamp) {
    try {
        let deltaTime = Math.min(timestamp - lastTime, 50);
        if (mario.transforming) deltaTime *= 0.3; // Cinematic slow-mo during transformation
        lastTime = timestamp;

        // --- Level Timer Logic ---
        if (gameState === 'PLAYING' && !levelRestartFlashActive) {
            levelTimeRemaining -= deltaTime / 1000;
            if (levelTimeRemaining <= 0) {
                levelTimeRemaining = 0;
                levelRestartFlashActive = true;
                levelRestartFlashTimer = performance.now();
                sfx.stopMusic();
                // Play a failure sound if available, else death
                if (sfx.death) sfx.death(); 
            }
        }
        
        // Handle Auto-Restart after 2s of red flash
        if (levelRestartFlashActive && performance.now() - levelRestartFlashTimer > 2000) {
            score = levelStartScore;
            loadLevel(currentLevelIndex, { hasWatch: mario.hasWatch });
        }

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
                bomba.update(deltaTime, level, mario.x + mario.width / 2, mario.y + mario.height / 2);
            }
            if (gomrog && !gomrog.dead) {
                gomrog.update(deltaTime, level, mario.x, mario.y);
            }
            if (gorillomba && !gorillomba.dead) {
                gorillomba.update(deltaTime, level, mario.x + mario.width / 2, mario.y + mario.height / 2);
            }
            if (knightkomba && !knightkomba.dead) {
                knightkomba.update(deltaTime, level, mario.x + mario.width / 2, mario.y + mario.height / 2);
            }
            if (freakosto && !freakosto.dead) {
                freakosto.update(deltaTime, level, mario.x, mario.y);
            }
            if (octumba && !octumba.dead) {
                octumba.update(deltaTime, level, mario.x, mario.y);
            }
            mario.update(deltaTime, level);
            const currentOmnitrixLockState = isTransformationLocked();
            if (currentOmnitrixLockState !== lastOmnitrixLockedState) {
                lastOmnitrixLockedState = currentOmnitrixLockState;
                if (omnitrixPanelOpen) {
                    omnitrixPanel.classList.toggle('locked', currentOmnitrixLockState);
                    renderAlienGrid();
                }
            }

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
                    showLevelModal('LEVEL 8 COMPLETE!', 'Winter is over! Knightkomba is shattered!', true);
                } else if (currentLevelIndex === 9) {
                    mario.victory = true;
                    sfx.levelComplete();
                    sfx.stopMusic();
                    showLevelModal('LEVEL 9 COMPLETE!', 'The Great Octopus is defeated! Ripjaws rules the sea!', true);
                } else if (currentLevelIndex === 10) {
                    mario.victory = true;
                    sfx.levelComplete();
                    sfx.stopMusic();
                    showLevelModal('LEVEL 10 COMPLETE!', 'Vilgax Spider defeated! The Omnitrix is repaired!', true);
                } else if (currentLevelIndex === 11) {
                    mario.victory = true;
                    sfx.levelComplete();
                    sfx.stopMusic();
                    showLevelModal('LEVEL 11 COMPLETE!', 'Evil Ghostfreak is gone! You have mastered the Omnitrix!', false);
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
                } else if (entity.type === 'octumba') {
                    entity.update(deltaTime, level, mario.x, mario.y);
                    if (mario.state === 'RIPJAWS' && mario.soundWaveActive) {
                        const dist = Math.hypot(mario.x - (entity.x + 75), mario.y - (entity.y + 75));
                        if (dist < 600) { // Wide range
                            entity.takeDamage(deltaTime * 0.005); // Faster damage
                        }
                    }
                    if (entity.dead && !entity.flagSpawned) {
                        entity.flagSpawned = true;
                        const flagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][flagX] = 5;
                        }
                        level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                        sfx.bossDefeated();
                    }
                } else {
                    entity.update(deltaTime, level);
                    if (isGoombaType(entity.type) && !entity.dead) {
                        if (mario.state === 'RIPJAWS' && mario.soundWaveActive) {
                            const dist = Math.hypot(mario.x + mario.width/2 - (entity.x + entity.width/2), mario.y + mario.height/2 - (entity.y + entity.height/2));
                            if (dist < 200) { // wide sonar range
                                entity.dead = true;
                                sfx.stomp();
                            }
                        }
                    }
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
                        if (target.type === 'fireball') return; 

                        if (checkEntityCollision(entity, target)) {
                            // Any target with takeDamage or specific bosses
                            if (target.takeDamage) {
                                target.takeDamage(entity.damage || 1);
                                entity.dead = true;
                                sfx.bossHit();
                                screenShake = Math.min((entity.power || 1) * 2, 10);
                            } else if (isGoombaType(target.type)) {
                                target.dead = true;
                                entity.dead = true;
                                sfx.fireballHit();
                            } else if (target.type === 'octumba' || target.type === 'freakosto' || target.type === 'vilgumbobo' || target.type === 'knightkomba' || target.type === 'gorillomba') {
                                // For bosses without direct takeDamage or special ones
                                if (target.hp !== undefined) {
                                    target.hp -= (entity.damage || 1);
                                    if (target.hp <= 0) target.dead = true;
                                    entity.dead = true;
                                    sfx.bossHit();
                                } else if (target.hitsTaken !== undefined) {
                                    // Hits-based bosses like Freakosto
                                    target.hitsTaken += 0.5; // fireball is half a hit
                                    if (target.hitsTaken >= 10) target.dead = true;
                                    entity.dead = true;
                                    sfx.bossHit();
                                }
                            }
                        }
                    });
                    return; 
                } else if (entity.type === 'crystal_shard') {
                    entities.forEach(target => {
                        if (target.dead || target === entity) return;
                        if (target.type === 'fireball' || target.type === 'slimeball' || target.type === 'crystal_shard' || target.type === 'ice_spear') return;

                        if (checkEntityCollision(entity, target)) {
                            if (target.takeDamage) {
                                target.takeDamage(1);
                                entity.dead = true;
                                sfx.bossHit();
                            } else if (isGoombaType(target.type)) {
                                target.dead = true;
                                entity.dead = true;
                                sfx.stomp();
                            } else if (target.type === 'dragonglass_diamond') {
                                target.takeDamage();
                                entity.dead = true;
                                sfx.bossHit();
                            }
                        }
                    });
                    return;
                } else if (entity.type === 'slimeball') {
                    entities.forEach(target => {
                        if (target.dead || target === entity) return;
                        if (target.type === 'fireball' || target.type === 'slimeball') return;

                        if (checkEntityCollision(entity, target)) {
                            if (target.type === 'gomrog') {
                                const tRect = target.getTongueRect();
                                if (tRect && checkEntityCollision(entity, tRect) && target.tongueLength > 0) {
                                    entity.dead = true; // Tongue blocks the shot
                                } else {
                                    target.takeDamage();
                                    entity.dead = true;
                                    sfx.bossHit();
                                }
                            } else if (entity.source === 'upgrade' && (target.type === 'electromba' || target.type === 'gomboto')) {
                                target.hacked = true;
                                mario.activateUpgradeElectricImmunity();
                                entity.dead = true;
                                sfx.bossHit();
                            } else if (target.takeDamage) {
                                target.takeDamage(1);
                                entity.dead = true;
                                sfx.bossHit();
                            } else if (isGoombaType(target.type)) {
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
                        addScore(SCORE_FOR_ITEM);
                        ALIENS[1].unlocked = true;
                        ALIENS[1].introMessage = 'I am Heatblast! Press F to shoot fireballs! Keep pressing for MORE POWER! 🔥';
                        sfx.collectItem();
                        renderAlienGrid();

                    } else if (entity.type === 'fourarms_item') {
                        entity.dead = true;
                        addScore(SCORE_FOR_ITEM);
                        ALIENS[0].unlocked = true;
                        ALIENS[0].introMessage = 'My name is Four Arms. If you need me, press "1".';
                        sfx.collectItem();
                        renderAlienGrid();

                    } else if (entity.type === 'omnitrix_item') {
                        entity.dead = true;
                        addScore(SCORE_FOR_ITEM);
                        mario.hasWatch = true;
                        sfx.watchAcquired();
                        showOmnitrixIntro();

                    } else if (entity.type === 'goomba') {
                        if (mario.dashActive) {
                            entity.dead = true;
                            sfx.stomp();
                            screenShake = 4;
                        } else if (mario.pounceActive) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                            mario.pounceActive = false;
                        } else if (mario.state === 'GHOSTFREAK' && mario.ghostfreakAcquireReady) {
                            entity.dead = true;
                            sfx.bossHit();
                        } else if (mario.vy > 0 && mario.y + mario.height < entity.y + entity.height / 2 + 10) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                        } else {
                            if (mario.state !== 'SMALL') {
                                mario.revertToSmall();
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
                        addScore(SCORE_FOR_ITEM);
                        ALIENS[2].unlocked = true;
                        ALIENS[2].introMessage = 'I am XLR8! Super speed! Press F for Speed Dash — nothing can stop me! ⚡';
                        sfx.collectItem();
                        renderAlienGrid();

                    } else if (entity.type === 'stinkfly_item') {
                        entity.dead = true;
                        addScore(SCORE_FOR_ITEM);
                        ALIENS[3].unlocked = true;
                        ALIENS[3].introMessage = 'I am Stinkfly! Press and hold [Up] to hover! Press [F] to spit toxic slime! 🪰';
                        sfx.collectItem();
                        renderAlienGrid();

                    } else if (entity.type === 'upgrade_item') {
                        entity.dead = true;
                        addScore(SCORE_FOR_ITEM);
                        ALIENS[4].unlocked = true;
                        ALIENS[4].introMessage = 'I am Upgrade! Press [F] near machines to merge and hack them! 💻';
                        sfx.collectItem();
                        renderAlienGrid();

                    } else if (entity.type === 'diamondhead_item') {
                        entity.dead = true;
                        addScore(SCORE_FOR_ITEM);
                        ALIENS[6].unlocked = true;
                        ALIENS[6].introMessage = 'I am Diamondhead! Press F to shoot crystal shards! 💎';
                        mario.transformToDiamondhead();
                        sfx.collectItem();
                        renderAlienGrid();
                    } else if (entity.type === 'dragonglass_item') {
                        entity.dead = true;
                        addScore(SCORE_FOR_ITEM);
                        mario.hasDragonglass = true;
                        sfx.collectItem();
                        // Flash screen
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
                    } else if (entity.type === 'ooze_goomba') {
                        // Level 5 Enemies
                        if (mario.dashActive) {
                            entity.dead = true;
                            sfx.stomp();
                            screenShake = 4;
                        } else if (mario.pounceActive) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                            mario.pounceActive = false;
                        } else if (mario.state === 'GHOSTFREAK' && mario.ghostfreakAcquireReady) {
                            entity.dead = true;
                            sfx.bossHit();
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
                    } else if (entity.type === 'electromba') {
                        // Level 6 Enemies
                        if (mario.dashActive) {
                            entity.dead = true;
                            sfx.stomp();
                            screenShake = 4;
                        } else if (mario.pounceActive) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                            mario.pounceActive = false;
                        } else if (mario.state === 'GHOSTFREAK' && mario.ghostfreakAcquireReady) {
                            entity.dead = true;
                            sfx.bossHit();
                        } else if (mario.vy > 0 && mario.y + mario.height < entity.y + entity.height / 2 + 10) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                        } else if (mario.hasUpgradeElectricImmunity(currentLevelIndex) && entity.isHacked && entity.isHacked()) {
                            // Upgrade can safely phase through hacked electric enemies while immune
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
                                if (mario.x < entity.x + entity.width / 2) {
                                    mario.x = entity.x - mario.width;
                                } else {
                                    mario.x = entity.x + entity.width;
                                }
                                mario.vx = 0;
                            }
                        }
                    } else if (entity.type === 'wild_mutt_item') {
                        entity.dead = true;
                        addScore(SCORE_FOR_ITEM);
                        ALIENS[5].unlocked = true;
                        ALIENS[5].introMessage = 'I am Wild Mutt! My senses are sharp! Press F to POUNCE and see HIDDEN ENEMIES! 🐺';
                        mario.transformToWildMutt();
                        sfx.collectItem();
                        renderAlienGrid();

                    } else if (entity.type === 'gorillomba') {
                        if (mario.pounceActive) {
                            if (entity.takeDamage()) {
                                sfx.bossHit();
                                screenShake = 15;
                                mario.vy = -10;
                                mario.pounceActive = false;
                            }
                        } else if (mario.state !== 'WILDMUTT') {
                            if (mario.state !== 'SMALL') {
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
                    } else if (entity.type === 'knightkomba') {
                        // Contact with Knightkomba
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
                        if (mario.dashActive) {
                            entity.dead = true;
                            sfx.stomp();
                            screenShake = 4;
                        } else if (mario.pounceActive) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                            mario.pounceActive = false;
                        } else if (mario.state === 'GHOSTFREAK' && mario.ghostfreakAcquireReady) {
                            entity.dead = true;
                            sfx.bossHit();
                        } else if (mario.state === 'DIAMONDHEAD') {
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
                        if (mario.dashActive) {
                            entity.dead = true;
                            sfx.stomp();
                            screenShake = 4;
                        } else if (mario.pounceActive) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                            mario.pounceActive = false;
                        } else if (mario.state === 'GHOSTFREAK' && mario.ghostfreakAcquireReady) {
                            entity.dead = true;
                            sfx.bossHit();
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
                    } else if (entity.type === 'ripjaws_item') {
                        entity.dead = true;
                        addScore(SCORE_FOR_ITEM);
                        ALIENS[7].unlocked = true;
                        ALIENS[7].introMessage = 'I am Ripjaws! I am the master of the sea! Press F to emit SONAR WAVES! 🦈';
                        mario.transformToRipjaws();
                        sfx.collectItem();
                        renderAlienGrid();
                    } else if (entity.type === 'jellyfish_goomba') {
                        if (mario.dashActive) {
                            entity.dead = true;
                            sfx.stomp();
                            screenShake = 4;
                        } else if (mario.pounceActive) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                            mario.pounceActive = false;
                        } else if (mario.state === 'GHOSTFREAK' && mario.ghostfreakAcquireReady) {
                            entity.dead = true;
                            sfx.bossHit();
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
                    } else if (entity.type === 'mucus_projectile') {
                        sfx.death();
                        sfx.stopMusic();
                        gameState = 'GAMEOVER';
                    } else if (entity.type === 'octumba') {
                        if (mario.vy > 0 && mario.y + mario.height < entity.y + 40) {
                            mario.y = entity.y - mario.height;
                            mario.vy = 0;
                            mario.grounded = true;
                        } else {
                            if (mario.state !== 'SMALL') {
                                mario.revertToSmall();
                                mario.vy = -8;
                                mario.vx = -5;
                            } else {
                                sfx.death();
                                sfx.stopMusic();
                                gameState = 'GAMEOVER';
                            }
                        }
                    } else if (entity.type === 'grey_matter_item') {
                        entity.dead = true;
                        addScore(SCORE_FOR_ITEM);
                        ALIENS[8].unlocked = true;
                        ALIENS[8].introMessage = 'I am Grey Matter! Small but highly intelligent! Hold F for 2 seconds to reprogram nearby viruses! 🐸';
                        mario.transformToGreyMatter();
                        sfx.collectItem();
                        renderAlienGrid();
                    } else if (entity.type === 'omnitrix_virus' && !entity.fixed) {
                        // Contact with unfixed viruses is always harmful now, you must use Hacking Wave!
                        if (mario.state !== 'SMALL') {
                            mario.revertToSmall();
                            mario.vy = -5;
                            mario.vx = (mario.x < entity.x) ? -5 : 5;
                        } else {
                            sfx.death();
                            sfx.stopMusic();
                            gameState = 'GAMEOVER';
                        }
                    } else if (entity.type === 'vilgumbobo') {
                        if (vilgumbobo.stunned) {
                            // Safe to approach!
                        } else {
                            if (mario.vy > 0 && mario.y + mario.height < entity.y + 40) {
                                mario.y = entity.y - mario.height;
                                mario.vy = 0;
                                mario.grounded = true;
                            } else {
                                if (mario.state !== 'SMALL') {
                                    mario.revertToSmall();
                                    mario.vy = -8;
                                    mario.vx = -5;
                                } else {
                                    sfx.death();
                                    sfx.stopMusic();
                                    gameState = 'GAMEOVER';
                                }
                            }
                        }
                    } else if (entity.type === 'ghostfreak_item') {
                        entity.dead = true;
                        addScore(SCORE_FOR_ITEM);
                        ALIENS[9].unlocked = true;
                        ALIENS[9].introMessage = 'I am Ghostfreak! Hold F to pass through walls, and hold F for 5 seconds to acquire enemy bodies! 👻';
                        mario.transformToGhostfreak();
                        sfx.collectItem();
                        renderAlienGrid();
                    } else if (entity.type === 'ghost_goomba') {
                        if (entity.acquired) return; // skip if already acquired
                        if (mario.dashActive) {
                            entity.dead = true;
                            sfx.stomp();
                            screenShake = 4;
                        } else if (mario.pounceActive) {
                            entity.dead = true;
                            sfx.stomp();
                            mario.vy = -8;
                            mario.pounceActive = false;
                        } else if (mario.state === 'GHOSTFREAK' && mario.ghostfreakAcquireReady) {
                            entity.acquired = true;
                            sfx.bossHit();
                            setTimeout(() => { entity.dead = true; }, 1000);
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
                    } else if (entity.type === 'freakosto') {
                        if (entity.acquired) return; // skip if already acquired
                        if (entity.invulnerableTimer > 0) return; // skip if invulnerable

                        if (mario.state === 'GHOSTFREAK' && mario.ghostfreakAcquireReady) {
                            entity.hitsTaken = (entity.hitsTaken || 0) + 1;
                            sfx.bossHit();
                            screenShake = 20;

                            if (entity.hitsTaken >= 10) {
                                entity.acquired = true;
                                screenShake = 40;
                                setTimeout(() => { entity.dead = true; }, 1500);
                            } else {
                                // Knockback boss
                                entity.vx = (entity.x > mario.x) ? 5 : -5;
                                entity.vy = -3;
                                entity.invulnerableTimer = 60; // frames
                                mario.ghostfreakFTimer = 0; // reset Mario's charge so he has to charge again
                            }
                        } else {
                            // Boss hits Mario!
                            if (mario.invulnerableTimer > 0) return;
                            if (mario.state === 'GHOSTFREAK') {
                                mario.bossHitsTaken = (mario.bossHitsTaken || 0) + 1;
                                sfx.bump();
                                screenShake = 20;
                                if (mario.bossHitsTaken >= 10) {
                                    sfx.death();
                                    sfx.stopMusic();
                                    gameState = 'GAMEOVER';
                                } else {
                                    // Knockback Mario
                                    mario.vy = -5;
                                    mario.vx = (mario.x < entity.x) ? -5 : 5;
                                    mario.invulnerableTimer = 60;
                                }
                            } else {
                                if (mario.state !== 'SMALL') {
                                    mario.revertToSmall();
                                    mario.vy = -8;
                                    mario.vx = -5;
                                } else {
                                    sfx.death();
                                    sfx.stopMusic();
                                    gameState = 'GAMEOVER';
                                }
                            }
                        }
                    }
                }
            });

            // ── Grey Matter Hacking Wave ───────────────────────────────
            if (mario.state === 'GREYMATTER' && mario.hackingWaveTriggered) {
                mario.hackingWaveTriggered = false;
                screenShake = 15;
                sfx.stomp(); // Reuse stomp sound for wave

                // Reprogram all unfixed viruses and destroy any Goombas within a large radius
                entities.forEach(entity => {
                    if (entity.type === 'omnitrix_virus' && !entity.fixed) {
                        const dist = Math.hypot(mario.x - entity.x, mario.y - entity.y);
                        if (dist < 400) {
                            entity.fixed = true;
                            entity.followTarget = vilgumbobo;
                        }
                    } else if (isGoombaType(entity.type) && !entity.dead) {
                        const dist = Math.hypot(mario.x + mario.width/2 - (entity.x + entity.width/2), mario.y + mario.height/2 - (entity.y + entity.height/2));
                        if (dist < 400) {
                            entity.dead = true;
                            sfx.stomp();
                        }
                    }
                });
            }

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
                        addScore(SCORE_FOR_BOSS_KILL);
                        bossDefeated = true;
                        goombaba = null;
                        screenShake = 20;
                        sfx.bossDefeated();
                        console.log('GOOMBABA DEFEATED!');

                        // Spawn flag for Level 3
                        const flagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][flagX] = 5;
                        }
                        level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    // Check if Turtumba died
                    if (entities[i] === turtumba) {
                        addScore(SCORE_FOR_BOSS_KILL);
                        turtumbaDefeated = true;
                        turtumba = null;
                        screenShake = 25;
                        sfx.bossDefeated();
                        console.log('TURTUMBA DEFEATED!');
                        const flagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][flagX] = 5;
                        }
                        level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    if (entities[i] === bomba && bomba.dead) {
                        addScore(SCORE_FOR_BOSS_KILL);
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
                        addScore(SCORE_FOR_BOSS_KILL);
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
                    if (entities[i] === gomboto && gomboto.dead) {
                        addScore(SCORE_FOR_BOSS_KILL);
                        gombotoDefeated = true;
                        gomboto = null;
                        console.log('GOMBOTO DEFEATED!');
                        screenShake = 30;
                        sfx.bossDefeated();
                        const flagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][flagX] = 5;
                        }
                        level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    if (entities[i] === gorillomba && gorillomba.dead) {
                        addScore(SCORE_FOR_BOSS_KILL);
                        gorillombaDefeated = true;
                        gorillomba = null;
                        console.log('GORILLOMBA DEFEATED!');
                        screenShake = 30;
                        sfx.bossDefeated();
                        const gFlagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][gFlagX] = 5;
                        }
                        level.finishCols.set(gFlagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    if (entities[i] === knightkomba && knightkomba.dead) {
                        addScore(SCORE_FOR_BOSS_KILL);
                        knightkombaDefeated = true;
                        knightkomba = null;
                        console.log('KNIGHTKOMBA DEFEATED!');
                        screenShake = 30;
                        sfx.bossDefeated();
                        const flagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][flagX] = 5;
                        }
                        level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    if (entities[i] === vilgumbobo && vilgumbobo.dead) {
                        addScore(SCORE_FOR_BOSS_KILL);
                        vilgumboboDefeated = true;
                        vilgumbobo = null;
                        level.omnitrixFixed = true;
                        canvas.classList.add('fixed');
                        console.log('VILGUMBOBO DEFEATED!');
                        screenShake = 30;
                        sfx.bossDefeated();
                        const flagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][flagX] = 5;
                        }
                        level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    if (entities[i] === freakosto && freakosto.dead) {
                        addScore(SCORE_FOR_BOSS_KILL);
                        freakostoDefeated = true;
                        freakosto = null;
                        console.log('FREAKOSTO DEFEATED!');
                        screenShake = 30;
                        sfx.bossDefeated();
                        const flagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][flagX] = 5;
                        }
                        level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    if (entities[i] === octumba && octumba.dead) {
                        addScore(SCORE_FOR_BOSS_KILL);
                        octumbaDefeated = true;
                        octumba = null;
                        console.log('OCTUMBA DEFEATED!');
                        screenShake = 30;
                        sfx.bossDefeated();
                        const flagX = level.cols - 2;
                        for (let fy = 4; fy < level.rows; fy++) {
                            level.tiles[fy][flagX] = 5;
                        }
                        level.finishCols.set(flagX, { topRow: 4, bottomRow: level.rows - 1 });
                    }
                    if (SCORED_ENEMY_TYPES.has(entities[i].type)) {
                        addScore(SCORE_FOR_ENEMY_KILL);
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
                    if (isGoombaType(entity.type)) {
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
                        const sx = entity.x + entity.width / 2;
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
        if (currentLevelIndex === 9) {
            level.drawLevel9WaterDarkness(ctx, mario);
        }

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
            ctx.arc(mario.x + mario.width / 2, mario.y + mario.height / 2, 30 + Math.sin(performance.now() / 50) * 5, 0, Math.PI * 2 * mario.gpChargePercent);
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
                'Find the Mystery!',
                'Raise your arms 👐',
                'Welcome to HELL 🔥',
                'LIGHT SPEED! ⚡',
                'The Toxic Sewers 🪰',
                'Welcome to the Damaged World 💻',
                'The Hidden Senses Jungle 🐺',
                'Winter is Here! ❄️',
                'Sea in Desert 🏖️',
                'Inside the Omnitrix ⌚',
                'The Last Battle 💀'
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
            else if (currentLevelIndex === 8) { titleBg = 'rgba(0,10,40,0.80)'; titleColor = '#88CCFF'; }
            else if (currentLevelIndex === 9) { titleBg = 'rgba(0,20,50,0.80)'; titleColor = '#0088FF'; }
            else if (currentLevelIndex === 10) { titleBg = 'rgba(10,25,10,0.80)'; titleColor = '#55FF55'; }
            else if (currentLevelIndex === 11) { titleBg = 'rgba(20,0,30,0.85)'; titleColor = '#AA00FF'; }
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
        ctx.fillRect(8, 8, 520, 32);
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
        let controlMode = 'RANDOM';
        if (hasContinuousManualForLevel(currentLevelIndex)) {
            controlMode = 'MANUAL∞';
        } else {
            const manualUses = getManualUsesForLevel(currentLevelIndex);
            if (manualUses > 0) controlMode = `MANUAL x${manualUses}`;
        }
        ctx.fillText(`Level ${currentLevelIndex}${hudWatch}${hudAlien}${hudAction}${hudDoubleJump} | Score ${score} | ${controlMode}`, 18, 30);

        // ── Alien Countdown Timer HUD ───────── (HIDDEN)
        /*
        if (mario.alienTimer > 0 && mario.state !== 'SMALL') {
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
        */

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
        let bossData = null;
        if (currentLevelIndex === 2 && bomba && !bomba.dead) bossData = { entity: bomba, name: 'BOMBA', color: '#FFDD88', bg: 'rgba(50,30,0,0.7)' };
        else if (currentLevelIndex === 3 && goombaba && !goombaba.dead) bossData = { entity: goombaba, name: 'GOOMBABA', color: '#FFD700', bg: 'rgba(0,0,0,0.6)' };
        else if (currentLevelIndex === 4 && turtumba && !turtumba.dead) bossData = { entity: turtumba, name: 'TURTUMBA', color: '#00FF66', bg: 'rgba(0,20,0,0.7)' };
        else if (currentLevelIndex === 5 && gomrog && !gomrog.dead) bossData = { entity: gomrog, name: 'GOMROG', color: '#00FF66', bg: 'rgba(0,40,0,0.7)' };
        else if (currentLevelIndex === 6 && gomboto && !gomboto.dead) bossData = { entity: gomboto, name: 'GOMBOTO', color: '#00FFCC', bg: 'rgba(0,40,40,0.7)' };
        else if (currentLevelIndex === 7 && gorillomba && !gorillomba.dead) bossData = { entity: gorillomba, name: 'GORILLOMBA', color: '#AAFF44', bg: 'rgba(20,10,0,0.7)' };
        else if (currentLevelIndex === 8 && knightkomba && !knightkomba.dead) bossData = { entity: knightkomba, name: 'KNIGHTKOMBA', color: '#FFFFFF', bg: 'rgba(0,10,20,0.7)' };
        else if (currentLevelIndex === 9 && octumba && !octumba.dead) bossData = { entity: octumba, name: 'OCTUMBA', color: '#0088FF', bg: 'rgba(0,10,40,0.7)' };
        else if (currentLevelIndex === 10 && vilgumbobo && !vilgumbobo.dead) bossData = { entity: vilgumbobo, name: 'VILGUMBOBO', color: '#55FF55', bg: 'rgba(10,25,10,0.8)' };
        else if (currentLevelIndex === 11 && freakosto && !freakosto.dead) bossData = { entity: freakosto, name: 'FREAKOSTO', color: '#AA00FF', bg: 'rgba(20,0,30,0.8)' };

        if (bossData) {
            // Distance check — only show if Ben 10 is close (800px threshold)
            const dist = Math.hypot(mario.x - bossData.entity.x, mario.y - bossData.entity.y);
            if (dist < 800) {
                const barW = 300;
                const barH = 16;
                const barX = GAME_WIDTH / 2 - barW / 2;
                const barY = 50;
                let hpRatio = 1;
                
                if (bossData.entity.maxHp) hpRatio = bossData.entity.hp / bossData.entity.maxHp;
                else if (bossData.entity.hitsTaken !== undefined) hpRatio = (10 - bossData.entity.hitsTaken) / 10;
                else if (currentLevelIndex === 8) hpRatio = 1;

                ctx.fillStyle = bossData.bg;
                ctx.fillRect(barX - 4, barY - 4, barW + 8, barH + 24);

                ctx.fillStyle = '#333';
                ctx.fillRect(barX, barY, barW, barH);
                
                const r = Math.floor(255 * (1 - hpRatio));
                const g = Math.floor(255 * hpRatio);
                ctx.fillStyle = (currentLevelIndex === 8 || currentLevelIndex === 11) ? bossData.color : `rgb(${r}, ${g}, 0)`;
                ctx.fillRect(barX, barY, barW * Math.max(0, hpRatio), barH);
                
                ctx.strokeStyle = bossData.color;
                ctx.lineWidth = 2;
                ctx.strokeRect(barX, barY, barW, barH);
                ctx.lineWidth = 1;

                ctx.fillStyle = bossData.color;
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(bossData.name, GAME_WIDTH / 2, barY + barH + 14);
                ctx.textAlign = 'left';
            }
        }

        // Defeated messages
        let defeatedMsg = null;
        if (bombaDefeated && currentLevelIndex === 2) defeatedMsg = { text: 'BOMBA DEFEATED! → REACH THE EXIT!', color: '#FFDD88' };
        else if (bossDefeated && currentLevelIndex === 3) defeatedMsg = { text: 'GOOMBABA DEFEATED! → REACH THE EXIT!', color: '#FF6600' };
        else if (turtumbaDefeated && currentLevelIndex === 4) defeatedMsg = { text: 'TURTUMBA DEFEATED! → REACH THE FLAG!', color: '#00FF66' };
        else if (gomrogDefeated && currentLevelIndex === 5) defeatedMsg = { text: 'GOMROG DEFEATED! → REACH THE EXIT!', color: '#00FF66' };
        else if (gombotoDefeated && currentLevelIndex === 6) defeatedMsg = { text: 'GOMBOTO DEFEATED! → REACH THE FLAG!', color: '#00FFCC' };
        else if (gorillombaDefeated && currentLevelIndex === 7) defeatedMsg = { text: 'GORILLOMBA DEFEATED! → REACH THE EXIT!', color: '#AAFF44' };
        else if (knightkombaDefeated && currentLevelIndex === 8) defeatedMsg = { text: 'KNIGHTKOMBA SHATTERED! → REACH THE FLAG!', color: '#00FFFF' };
        else if (octumbaDefeated && currentLevelIndex === 9) defeatedMsg = { text: 'OCTUMBA DEFEATED! → REACH THE EXIT!', color: '#0088FF' };
        else if (vilgumboboDefeated && currentLevelIndex === 10) defeatedMsg = { text: 'VILGUMBOBO DEFEATED! → REACH THE FLAG!', color: '#55FF55' };
        else if (freakostoDefeated && currentLevelIndex === 11) defeatedMsg = { text: 'FREAKOSTO DEFEATED! → YOU WON!', color: '#AA00FF' };

        if (defeatedMsg) {
            ctx.fillStyle = defeatedMsg.color;
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(defeatedMsg.text, GAME_WIDTH / 2, 80);
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

        // --- Level Timer HUD (Bar) ---
        if (gameState === 'PLAYING' || levelRestartFlashActive) {
            ctx.save();
            ctx.resetTransform();
            
            const barW = 180;
            const barH = 10;
            const barX = 18;
            const barY = 56; // Beneath the main top-left HUD (32 + 24)

            // Bar Background Sheet
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(barX - 10, barY - 18, barW + 20, barH + 28);

            // Label
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('MISSION TIME', barX, barY - 5);
            
            // Bar Track
            ctx.fillStyle = '#222';
            ctx.fillRect(barX, barY, barW, barH);
            
            // Bar Progress
            const ratio = Math.min(1, Math.max(0, levelTimeRemaining) / LEVEL_TIME_LIMIT_SECONDS);
            const isCritical = levelTimeRemaining < 60;
            
            if (isCritical) {
                const pulse = 0.5 + Math.abs(Math.sin(performance.now() / 150)) * 0.5;
                ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
            } else {
                ctx.fillStyle = '#00FF44'; // Neon Green
            }
            
            ctx.fillRect(barX, barY, barW * ratio, barH);
            
            // Border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barW, barH);

            // --- Level Timeout Flash ---
            if (levelRestartFlashActive) {
                const pulse = Math.abs(Math.sin((performance.now() - levelRestartFlashTimer) / 150));
                ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.5})`;
                ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 50px sans-serif';
                ctx.textAlign = 'center';
                ctx.shadowBlur = 20;
                ctx.fillText('LEVEL TIME EXCEEDED!', GAME_WIDTH / 2, GAME_HEIGHT / 2);
                ctx.font = '24px sans-serif';
                ctx.fillText('Restarting Level & Resetting Local Score...', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
            }
            ctx.restore();
        }
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

function isGoombaType(type) {
    return ['goomba', 'lava_goomba', 'ooze_goomba', 'electromba', 'whitewalker_goomba', 'jellyfish_goomba', 'ghost_goomba'].includes(type);
}

// Start!
requestAnimationFrame(gameLoop);

// ── TEMPORARY DEV TOOLS ──────────────────
window.devWarp = function (levelNum) {
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



