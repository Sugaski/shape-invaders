const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let bigBoss = null;
let moveStickActive = false;
let aimStickActive = false;

function resizeCanvas() {
    if (isMobile()) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    updateGameElementsSize();
}

function updateGameElementsSize() {
    const scaleFactor = isMobile() ? MOBILE_SCALE_FACTOR : 1;
    player.size = isMobile() ? 35 * scaleFactor : 30; // Update player size for both mobile and desktop
    player.speed = 300 * scaleFactor;
    if (isMobile()) {
        player.x = Math.min(Math.max(player.x, player.size / 2), canvas.width - player.size / 2);
        player.y = Math.min(Math.max(player.y, player.size / 2), canvas.height - player.size / 2);
    }
    
    enemies.forEach(enemy => {
        enemy.size *= scaleFactor;
    });
    
    stageOneBosses.forEach(boss => {
        boss.size *= scaleFactor;
    });
    
    if (bigBoss) {
        bigBoss.size *= scaleFactor;
        bigBoss.orbitRadius *= scaleFactor;
    }
    
    bullets.forEach(bullet => {
        bullet.size *= scaleFactor;
    });
    
    powerups.forEach(powerup => {
        powerup.size *= scaleFactor;
    });
}

function adjustGameElementsPositions() {
    player.x = Math.min(Math.max(player.x, player.size / 2), canvas.width - player.size / 2);
    player.y = Math.min(Math.max(player.y, player.size / 2), canvas.height - player.size / 2);

    enemies.forEach(enemy => {
        enemy.x = Math.min(Math.max(enemy.x, enemy.size / 2), canvas.width - enemy.size / 2);
        enemy.y = Math.min(Math.max(enemy.y, enemy.size / 2), canvas.height - enemy.size / 2);
    });

    stageOneBosses.forEach(boss => {
        boss.x = Math.min(Math.max(boss.x, boss.size / 2), canvas.width - boss.size / 2);
        boss.y = Math.min(Math.max(boss.y, boss.size / 2), canvas.height - boss.size / 2);
    });

    if (bigBoss) {
        bigBoss.x = Math.min(Math.max(bigBoss.x, bigBoss.size / 2), canvas.width - bigBoss.size / 2);
        bigBoss.y = Math.min(Math.max(bigBoss.y, bigBoss.size / 2), canvas.height - bigBoss.size / 2);
    }

    powerups.forEach(powerup => {
        powerup.x = Math.min(Math.max(powerup.x, powerup.size / 2), canvas.width - powerup.size / 2);
        powerup.y = Math.min(Math.max(powerup.y, powerup.size / 2), canvas.height - powerup.size / 2);
    });
}

window.addEventListener('resize', () => {
    resizeCanvas();
    if (isGameRunning) {
        adjustGameElementsPositions();
    }
});

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
} 

function handleMoveStickStart(e) {
    e.preventDefault();
    handleMoveStickMove(e);
}

function handleMoveStickMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const stick = document.getElementById('moveStick');
    const stickKnob = document.getElementById('moveStickKnob');
    const { angle, distance } = updateStickPosition(touch, stick, stickKnob);
    
    const maxSpeed = player.speed * MOBILE_SPEED_MULTIPLIER;
    const speed = (distance / (stick.offsetWidth / 2)) * maxSpeed;
    
    player.dx = Math.cos(angle) * speed;
    player.dy = Math.sin(angle) * speed;
}

function handleMoveStickEnd() {
    const stickKnob = document.getElementById('moveStickKnob');
    stickKnob.style.transform = 'translate(0, 0)';
    player.dx = 0;
    player.dy = 0;
}

function handleAimStickStart(e) {
    e.preventDefault();
    handleAimStickMove(e);
}

function handleAimStickMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const stick = document.getElementById('aimStick');
    const stickKnob = document.getElementById('aimStickKnob');
    const { angle } = updateStickPosition(touch, stick, stickKnob);
    
    player.angle = angle;
}

function handleAimStickEnd() {
    const stickKnob = document.getElementById('aimStickKnob');
    stickKnob.style.transform = 'translate(0, 0)';
}

function updateStickPosition(touch, stick, stickKnob) {
    const rect = stick.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    let deltaX = touch.clientX - rect.left - centerX;
    let deltaY = touch.clientY - rect.top - centerY;
    
    const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), centerX);
    const angle = Math.atan2(deltaY, deltaX);
    
    const knobX = Math.cos(angle) * distance;
    const knobY = Math.sin(angle) * distance;
    
    stickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
    return { angle, distance };
}

function updateMobileControlsColor() {
    if (isMobile()) {
        const textColor = ColorScheme.getTextColor();
        const backgroundColor = ColorScheme.getBackgroundColor();
        const moveStick = document.getElementById('moveStick');
        const aimStick = document.getElementById('aimStick');
        const moveStickKnob = document.getElementById('moveStickKnob');
        const aimStickKnob = document.getElementById('aimStickKnob');
        const mobileEscapeButton = document.getElementById('mobileEscapeButton');

        if (moveStick && aimStick && moveStickKnob && aimStickKnob && mobileEscapeButton) {
            moveStick.style.borderColor = textColor;
            aimStick.style.borderColor = textColor;
            moveStickKnob.style.backgroundColor = textColor;
            aimStickKnob.style.backgroundColor = textColor;
            mobileEscapeButton.style.borderColor = textColor;
            mobileEscapeButton.style.color = textColor;
            mobileEscapeButton.style.backgroundColor = backgroundColor;
        }
    }
}

function showMobileControls() {
    if (isMobile()) {
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.style.display = 'flex';
        }
    }
}

function hideMobileControls() {
    if (isMobile()) {
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.style.display = 'none';
        }
    }
}

function initMobileControls() {
    const mobileControls = document.getElementById('mobileControls');
    const moveStick = document.getElementById('moveStick');
    const aimStick = document.getElementById('aimStick');
    const mobileEscapeButton = document.getElementById('mobileEscapeButton');

    mobileControls.style.display = 'flex';

    moveStick.addEventListener('touchstart', (e) => handleStickStart(e, 'move'), { passive: false });
    moveStick.addEventListener('touchmove', (e) => handleStickMove(e, 'move'), { passive: false });
    moveStick.addEventListener('touchend', () => handleStickEnd('move'), { passive: false });

    aimStick.addEventListener('touchstart', (e) => handleStickStart(e, 'aim'), { passive: false });
    aimStick.addEventListener('touchmove', (e) => handleStickMove(e, 'aim'), { passive: false });
    aimStick.addEventListener('touchend', () => handleStickEnd('aim'), { passive: false });

    if (mobileEscapeButton) {
        mobileEscapeButton.addEventListener('touchstart', handleMobileEscape, { passive: false });
    }

    updateMobileControlsColor();
}

function handleStickStart(e, stickType) {
    e.preventDefault();
    if (stickType === 'move') {
        moveStickActive = true;
    } else if (stickType === 'aim') {
        aimStickActive = true;
    }
    handleStickMove(e, stickType);
}

function handleStickMove(e, stickType) {
    e.preventDefault();
    if ((stickType === 'move' && !moveStickActive) || (stickType === 'aim' && !aimStickActive)) return;

    const touch = e.touches[0];
    const stick = document.getElementById(`${stickType}Stick`);
    const knob = document.getElementById(`${stickType}StickKnob`);
    const { angle, distance } = updateStickPosition(touch, stick, knob);

    if (stickType === 'move') {
        const speed = distance / (stick.offsetWidth / 2) * player.speed;
        player.dx = Math.cos(angle) * speed;
        player.dy = Math.sin(angle) * speed;
    } else {
        player.angle = angle;
        player.isShooting = distance > 0;
    }
}

function handleStickEnd(stickType) {
    if (stickType === 'move') {
        moveStickActive = false;
        player.dx = 0;
        player.dy = 0;
    } else {
        aimStickActive = false;
        player.isShooting = false;
    }
    const knob = document.getElementById(`${stickType}StickKnob`);
    knob.style.transform = 'translate(0px, 0px)';
}

function handleMobileEscape(e) {
    e.preventDefault();
    if (isGameRunning) {
        togglePause();
    } else if (document.getElementById('settingsMenu').style.display === 'block') {
        hideSettings();
    }
}

function handleTouchStart(e, stickType) {
    e.preventDefault();
    const touch = e.touches[0];
    const stick = document.getElementById(`${stickType}Stick`);
    const rect = stick.getBoundingClientRect();

    if (stickType === 'move') {
        moveStickActive = true;
        moveStickStartX = touch.clientX - rect.left;
        moveStickStartY = touch.clientY - rect.top;
    } else {
        aimStickActive = true;
        aimStickStartX = touch.clientX - rect.left;
        aimStickStartY = touch.clientY - rect.top;
    }
}

function handleTouchMove(e, stickType) {
    e.preventDefault();
    if ((stickType === 'move' && !moveStickActive) || (stickType === 'aim' && !aimStickActive)) return;

    const touch = e.touches[0];
    const stick = document.getElementById(`${stickType}Stick`);
    const knob = document.getElementById(`${stickType}StickKnob`);
    const rect = stick.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;

    const stickRadius = stick.offsetWidth / 2;
    const distance = Math.min(stickRadius, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
    const angle = Math.atan2(deltaY, deltaX);

    const knobX = distance * Math.cos(angle);
    const knobY = distance * Math.sin(angle);

    knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

    if (stickType === 'move') {
        player.dx = (knobX / stickRadius) * player.speed;
        player.dy = (knobY / stickRadius) * player.speed;
    } else {
        player.angle = angle;
        player.isShooting = distance > 0;
    }
}

function handleTouchEnd(stickType) {
    const knob = document.getElementById(`${stickType}StickKnob`);
    knob.style.transform = 'translate(0px, 0px)';

    if (stickType === 'move') {
        moveStickActive = false;
        player.dx = 0;
        player.dy = 0;
    } else {
        aimStickActive = false;
        player.isShooting = false;
    }
}


const menuScreen = document.getElementById('menuScreen');
const gameCanvas = document.getElementById('gameCanvas');
const MOBILE_ENEMY_SPEED_MULTIPLIER = 0.4;
const MOBILE_STAGE_ONE_BOSS_SPEED_MULTIPLIER = 0.5;
const MOBILE_BIG_BOSS_PROJECTILE_SPEED_MULTIPLIER = 0.4;
const MOBILE_SPEED_MULTIPLIER = 1;
const MOBILE_SCALE_FACTOR = 0.8;
const BIG_BOSS_SPAWN_INTERVAL = 5; 
const STAGE_ONE_BOSS_SPAWN_INTERVAL = 500;
const INITIAL_ENEMY_SPAWN_CHANCE = 0.02;
const fireInterval = 225;
const POWERUP_DURATION = 15000;
const POWERUP_FLASH_DURATION = 5000;
const BARRIER_SPEED_MULTIPLIER = 3.0;
const MAX_ENEMIES = 15;
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: isMobile() ? 35 * MOBILE_SCALE_FACTOR : 30,
    speed: 300,
    dx: 0,
    dy: 0,
    angle: 0
};
const ColorScheme = {
    dark: {
        text: '#0f0',
        background: '#000',
        colors: ['#4FAF44', '#F6EB14', '#FF9526', '#EF4423', '#2A3492'],
        barrier: '#00FFFF'
    },
    light: {
        text: '#0d2140',
        background: '#FAF9F6',
        colors: ['#a0eba8', '#f53141', '#f2621f', '#FFC300', '#ae88e3'],
        barrier: '#FF00FF'
    },
    colorblind: {
        text: '#009e73',
        background: '#000',
        colors: ['#d55e00', '#cc79a7', '#0072b2', '#f0e442', '#009e73'],
        barrier: '#FFD700'
    },
    current: 'dark',
    getTextColor: function() {
        return this[this.current].text;
    },
    getBackgroundColor: function() {
        return this[this.current].background;
    },
    getRandomColor: function() {
        const currentColors = this[this.current].colors;
        return currentColors[Math.floor(Math.random() * currentColors.length)];
    },
    getPlayerColor: function() {  
        return this.getTextColor();
    },
    getBarrierColor: function() {
        return this[this.current].barrier;
    }
};

let currentEnemySpawnChance = INITIAL_ENEMY_SPAWN_CHANCE;
let lastMousePosition = { x: 0, y: 0 };
let aimAngle = 0;
let bullets = [];
let enemies = [];
let particles = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
let lives = 3;
let lastExtraLife = 0;
let playerInvulnerable = false;
let playerBlinkInterval;
let stageOneBosses = [];
let powerups = [];
let pausedPowerups = [];
let powerupsPausedTime = 0;
let currentPowerup = null;
let powerupEndTime = 0;
let projectilesDestroyed = 0;
let isGameRunning = false;
let animationFrameId = null;
let playerName = '';
let topPlayers = [];
let highScoreName = localStorage.getItem('highScoreName') || '';
let gameState = 'menu';
let isPaused = false;
let lastFireTime = 0;

function updateCustomCursor(position) {
    if (!isGameRunning || isPaused || isMobile()) return;

    ctx.save();
    
    // Outer glow
    ctx.beginPath();
    ctx.arc(position.x, position.y, 17, 0, Math.PI * 2);
    ctx.strokeStyle = ColorScheme.getTextColor();
    ctx.lineWidth = 1;
    ctx.shadowColor = ColorScheme.getTextColor();
    ctx.shadowBlur = 15;
    ctx.stroke();
    
    // Inner ring
    ctx.beginPath();
    ctx.arc(position.x, position.y, 15, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.stroke();
    
    ctx.restore();
}

function updatePlayerAngle(mouseX, mouseY) {
    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
}

function createModal(content, isExitModal = false) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = '50%';
    modal.style.top = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.padding = '20px';
    modal.style.borderRadius = '10px';
    modal.style.color = ColorScheme.getTextColor();
    modal.style.zIndex = '1000';
    modal.className = 'modal-content';
    
    applyColorModeToElement(modal);
    
    if (isExitModal) {
        modal.style.border = '4px solid ' + ColorScheme.getTextColor();
        modal.style.boxShadow = '0 0 10px ' + ColorScheme.getTextColor() + ', 0 0 20px ' + ColorScheme.getTextColor();
    } else {
        modal.style.border = '2px solid ' + ColorScheme.getTextColor();
    }
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
    return modal;
}

function applyColorModeToElement(element) {
    element.style.backgroundColor = ColorScheme.getBackgroundColor();
    element.style.color = ColorScheme.getTextColor();
}

function showMenu() {
    gameState = 'menu';
    menuScreen.style.display = 'block';
    gameCanvas.style.display = 'none';
    hideMobileControls();
    //console.log("Menu shown. isPaused:", isPaused);
}

function hideMenu() {
    menuScreen.style.display = 'none';
    gameCanvas.style.display = 'block';
    //console.log("Menu hidden. isPaused:", isPaused);
}

function startNewGame() {
    console.log("Starting new game...");
    resetPlayerPosition();
    showNamePrompt()
        .then(name => {
            if (name) {
                player.name = name;
                resetGame();
                resizeCanvas();
                startGame();
            } 
        })
}

function initializeMenu() {
    document.getElementById('newGame').addEventListener('click', startNewGame);

    document.getElementById('continue').addEventListener('click', () => {
        if (isGameRunning && isPaused) {
            resumeGame();
            if (isMobile()) {
                showMobileControls();
            }
        }
    });

    document.getElementById('highScores').addEventListener('click', () => {
        showHighScores();
    });

    document.getElementById('settings').addEventListener('click', () => {
        showSettings();
    });

    document.getElementById('exit').addEventListener('click', () => {
        showExitConfirmation();
    });
}

function showExitConfirmation() {
    const content = `
        <h2 style="color: ${ColorScheme.getTextColor()}; margin-bottom: 20px;">Exit Game</h2>
        <p style="color: ${ColorScheme.getTextColor()}; margin-bottom: 20px;">Are you sure you want to exit?</p>
        <button id="confirmExit">Yes</button>
        <button id="cancelExit">No</button>
    `;
    
    const modal = createModal(content, true);
    
    document.getElementById('confirmExit').addEventListener('click', () => {
        window.close();
    });
    
    document.getElementById('cancelExit').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

function showNamePrompt() {
    return new Promise((resolve, reject) => {
        const content = `
            <h2 style="color: ${ColorScheme.getTextColor()}; margin-bottom: 20px;">Enter Your Name</h2>
            <input type="text" id="nameInput" style="width: 200px; margin: 20px auto; maxlength: 20;">
            <p id="nameError" style="color: red; display: none;">Invalid name. Use only letters, numbers, and spaces.</p>
            <button id="submitName">Submit</button>
        `;
        const modal = createModal(content);
        
        const nameInput = document.getElementById('nameInput');
        const submitName = document.getElementById('submitName');
        const nameError = document.getElementById('nameError');
        
        // Apply color scheme to input and button
        applyColorModeToElement(nameInput);
        applyColorModeToElement(submitName);
        
        // Additional styles for input
        nameInput.style.padding = '10px';
        nameInput.style.border = `2px solid ${ColorScheme.getTextColor()}`;
        nameInput.style.borderRadius = '5px';
        nameInput.style.outline = 'none';
        nameInput.style.backgroundColor = ColorScheme.getBackgroundColor();
        nameInput.style.color = ColorScheme.getTextColor();
        
        // Additional styles for button
        submitName.style.padding = '10px 20px';
        submitName.style.border = `2px solid ${ColorScheme.getTextColor()}`;
        submitName.style.borderRadius = '5px';
        submitName.style.cursor = 'pointer';
        submitName.style.backgroundColor = ColorScheme.getBackgroundColor();
        submitName.style.color = ColorScheme.getTextColor();
        
        function validateAndSubmitName() {
            const name = nameInput.value.trim();
            const isValid = /^[A-Za-z0-9 ]+$/.test(name);
            
            if (isValid && name.length > 0) {
                document.body.removeChild(modal);
                resolve(name);
            } else {
                nameError.style.display = 'block';
            }
        }
        
        function handleEscape() {
            document.body.removeChild(modal);
            resolve(null);
        }
        
        nameInput.addEventListener('input', () => {
            nameError.style.display = 'none';
        });
        
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                validateAndSubmitName();
            } else if (e.key === ' ') {
                e.stopPropagation();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                handleEscape();
            }
        });
        
        submitName.addEventListener('click', validateAndSubmitName);
        
        modal.addEventListener('click', (e) => {
            if (e.target !== nameInput) {
                e.preventDefault();
                nameInput.focus();
            }
        });
        
        setTimeout(() => {
            nameInput.focus();
        }, 100);
    });
}

function showHighScores() {
    let content = '<h2 style="color: ' + ColorScheme.getTextColor() + '; margin-bottom: 20px;">Top Players</h2>';
    content += '<ul style="list-style-type: none; padding: 0; text-align: center;">';
    topPlayers.forEach((player, index) => {
        content += `<li style="margin-bottom: 10px; color: ${ColorScheme.getTextColor()};">${index + 1}. ${player.name}: ${player.score}</li>`;
    });
    content += '</ul><button id="closeHighScores">Close</button>';
    
    const modal = createModal(content);
    
    document.getElementById('closeHighScores').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

function showSettings() {
    if (isGameRunning) {
        isPaused = true;
    }
    document.getElementById('settingsMenu').style.display = 'block';
    document.getElementById('menuScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'none';
    hideMobileControls();
}

function hideSettings() {
    const settingsMenu = document.getElementById('settingsMenu');
    if (settingsMenu) {
        settingsMenu.style.display = 'none';
    }
}

function resumeGame() {
    console.log("Resuming game...");
    isPaused = false;
    hideMenu();
    hideSettings();
    if (isMobile()) {
        showMobileControls();
    }
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    console.log("Game resumed. isPaused:", isPaused);
}

function applyColorMode(mode) {
    document.body.classList.remove('light-mode', 'colorblind-mode');
    if (mode === 'light') {
        document.body.classList.add('light-mode');
    } else if (mode === 'colorblind') {
        document.body.classList.add('colorblind-mode');
    }
    ColorScheme.current = mode;
    console.log('Current mode set to:', ColorScheme.current);
    
    updateColors();
    updateRadioButtonStyles();
    updateMobileControlsColor();
    
    const modals = document.querySelectorAll('.modal-content');
    modals.forEach(modal => {
        applyColorModeToElement(modal);
        const input = modal.querySelector('input');
        const button = modal.querySelector('button');
        if (input) applyColorModeToElement(input);
        if (button) applyColorModeToElement(button);
    });
}

function updateColors() {
    canvas.style.backgroundColor = ColorScheme.getBackgroundColor();
    ctx.fillStyle = ColorScheme.getTextColor();
    enemies.forEach(enemy => {
        if (!enemy.color) {
            enemy.color = ColorScheme.getRandomColor();
        }
    });
    
    stageOneBosses.forEach(boss => {
        if (!boss.color) {
            boss.color = ColorScheme.getRandomColor();
        }
    });
    
    if (typeof bigBoss !== 'undefined' && bigBoss !== null && !bigBoss.color) {
        bigBoss.color = ColorScheme.getRandomColor();
    }
    
    powerups.forEach(powerup => {
        if (!powerup.color) {
            powerup.color = getPowerupColor(powerup.type);
        }
    });
    
    particles.forEach(particle => {
        if (!particle.color && !particle.fixedColor) {
            particle.color = ColorScheme.getRandomColor();
        }
    });
}

function updateRadioButtonStyles() {
    const radioButtons = document.querySelectorAll('#settingsMenu input[type="radio"]');
    const textColor = ColorScheme.getTextColor();
    
    radioButtons.forEach(radio => {
        radio.style.accentColor = textColor;
        
        // Create a style for the custom radio button
        const style = document.createElement('style');
        style.textContent = `
            #${radio.id}:checked::before {
                background-color: ${textColor};
            }
        `;
        document.head.appendChild(style);
    });
}

function loadSettings() {
    const savedMode = localStorage.getItem('colorMode') || 'dark';
    ColorScheme.current = savedMode;
    applyColorMode(savedMode);
}

document.getElementById('confirmSettings').addEventListener('click', () => {
    const selectedMode = document.querySelector('input[name="colorMode"]:checked').value;
    localStorage.setItem('colorMode', selectedMode);
    applyColorMode(selectedMode);
    
    if (isGameRunning) {
        resumeGame();
    } else {
        hideSettings();
        showMenu();
    }
});

document.getElementById('darkMode').addEventListener('change', () => {
    applyColorMode('dark');
});

document.getElementById('lightMode').addEventListener('change', () => {
    applyColorMode('light');
});

document.getElementById('colorblindMode').addEventListener('change', function() {
    applyColorMode('colorblind');
});

window.addEventListener('load', () => {
    if (isMobile()) {
        initMobileControls();
    }
    initializeMenu();
    loadSettings();
    showMenu();
    initializeTopPlayers();
    updateRadioButtonStyles();
});

function resetGame() {
    //console.log("Resetting game...");
    resetPlayerPosition();
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.angle = 0;
    player.dx = 0;
    player.dy = 0;
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    lives = 3;
    lastExtraLife = 0;
    stageOneBosses = [];
    powerups = [];
    currentPowerup = null;
    powerupEndTime = 0;
    bigBoss = null;
    stageOneBossesDefeated = 0;
    projectilesDestroyed = 0;
    stageOneBossesDestroyed = 0;
    bigBossesDestroyed = 0;
    lastFireTime = 0;
    currentEnemySpawnChance = INITIAL_ENEMY_SPAWN_CHANCE;
}

function gameOver() {
    if (!isGameRunning) return;
    console.log("Game Over function called");
    isGameRunning = false;
    isPaused = true;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    updateHighScore();
    updateTopPlayers();
    
    bigBoss = null;
    bigBossProjectiles = [];
    stageOneBossesDefeated = 0;
    
    showGameOverScreen();
}

function updateContinueButton() {
    const continueButton = document.getElementById('continue');
    continueButton.disabled = !(isGameRunning && isPaused);
}

function spawnStageOneBoss() {
    const spawnInterval = isMobile() ? 250 : STAGE_ONE_BOSS_SPAWN_INTERVAL;
    
    if (!bigBoss && score > 0 && score % spawnInterval === 0 && stageOneBosses.length === 0) {
        let x, y;
        
        const side = Math.floor(Math.random() * 4);
        
        switch(side) {
            case 0: // Top
                x = Math.random() * canvas.width;
                y = -30; // Slightly off-screen
                break;
            case 1: // Right
                x = canvas.width + 30; // Slightly off-screen
                y = Math.random() * canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * canvas.width;
                y = canvas.height + 30; // Slightly off-screen
                break;
            case 3: // Left
                x = -30; // Slightly off-screen
                y = Math.random() * canvas.height;
                break;
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const angle = Math.atan2(centerY - y, centerX - x);
        const speed = isMobile() ? 
            (2 + Math.random() * 2) * MOBILE_STAGE_ONE_BOSS_SPEED_MULTIPLIER : 
            2 + Math.random() * 2;

        const baseSize = 60;
        const size = isMobile() ? baseSize * MOBILE_SCALE_FACTOR : baseSize;
        stageOneBosses.push({
            x: x,
            y: y,
            size: size,
            health: 3,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            color: ColorScheme.getRandomColor()
        });
        //console.log("Stage-one boss spawned. Total mini-bosses:", stageOneBosses.length);
    }
}

function checkBigBossSpawn() {
    if (!bigBoss && stageOneBossesDefeated >= 3) {
        spawnBigBoss();
    }
}

function drawStageOneBosses() {
    stageOneBosses.forEach(boss => {
        ctx.shadowBlur = 20;
        ctx.shadowColor = boss.color;
        
        ctx.fillStyle = boss.color;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? boss.size / 2 : boss.size / 4;
            const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
            const x = boss.x + radius * Math.cos(angle);
            const y = boss.y + radius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = ColorScheme.getTextColor();
        ctx.fillRect(boss.x - boss.size / 2, boss.y - boss.size / 2 - 10, (boss.size * boss.health) / 3, 5);
    });
}

function moveStageOneBosses() {
    stageOneBosses.forEach(boss => {
        boss.x += boss.dx;
        boss.y += boss.dy;
        
        if ((boss.x <= boss.size / 2 && boss.dx < 0) || (boss.x >= canvas.width - boss.size / 2 && boss.dx > 0)) {
            boss.dx *= -1;
        }
        if ((boss.y <= boss.size / 2 && boss.dy < 0) || (boss.y >= canvas.height - boss.size / 2 && boss.dy > 0)) {
            boss.dy *= -1;
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        boss.dx += (centerX - boss.x) * 0.0001;
        boss.dy += (centerY - boss.y) * 0.0001;

        const maxSpeed = 5;
        const speed = Math.sqrt(boss.dx * boss.dx + boss.dy * boss.dy);
        if (speed > maxSpeed) {
            boss.dx = (boss.dx / speed) * maxSpeed;
            boss.dy = (boss.dy / speed) * maxSpeed;
        }
    });
}

function checkStageOneBossCollisions() {
    for (let i = stageOneBosses.length - 1; i >= 0; i--) {
        const boss = stageOneBosses[i];
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            const dx = boss.x - bullet.x;
            const dy = boss.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < boss.size / 2 + 3) {
                createExplosion(bullet.x, bullet.y);
                bullets.splice(j, 1);
                boss.health--;
                //console.log("Mini-boss hit. Remaining health:", boss.health);
                if (boss.health <= 0) {
                    createExplosion(boss.x, boss.y);
                    destroyStageOneBoss(i);
                    score += 50;
                    spawnPowerup(boss.x, boss.y);
                    //console.log("Stage-one boss destroyed. Total destroyed:", stageOneBossesDestroyed);
                }
                break;
            }
        }
    }
}

function destroyStageOneBoss(index) {
    stageOneBosses.splice(index, 1);
    stageOneBossesDestroyed++;
    stageOneBossesDefeated++;
    score += 50;
    currentEnemySpawnChance *= 1.2;
    currentEnemySpawnChance = Math.min(currentEnemySpawnChance, 0.1);
}

function spawnPowerup(x, y) {
    const powerupType = Math.floor(Math.random() * 4) + 1;
    powerups.push({
        x,
        y,
        type: powerupType,
        spawnTime: Date.now(),
        color: getPowerupColor(powerupType)
    });
}

function drawPowerups() {
    const currentTime = Date.now();
    powerups.forEach(powerup => {
        const elapsedTime = currentTime - powerup.spawnTime;
        const remainingTime = POWERUP_DURATION - elapsedTime;

        if (remainingTime > POWERUP_FLASH_DURATION || Math.floor(elapsedTime / 100) % 2 === 0) {
            ctx.save();
            
            // Create pulsing effect
            const pulseScale = 1 + 0.2 * Math.sin(elapsedTime / 200); // Pulsing between 0.8 and 1.2 size

            // Draw outer glow
            const gradient = ctx.createRadialGradient(powerup.x, powerup.y, 5 * pulseScale, powerup.x, powerup.y, 30 * pulseScale);
            gradient.addColorStop(0, powerup.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.beginPath();
            ctx.arc(powerup.x, powerup.y, 30 * pulseScale, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw inner powerup
            ctx.beginPath();
            ctx.arc(powerup.x, powerup.y, 10 * pulseScale, 0, Math.PI * 2);
            ctx.fillStyle = powerup.color;
            ctx.fill();

            // Draw a border
            ctx.strokeStyle = ColorScheme.getTextColor();
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }
    });
}

function updatePowerups() {
    if (!bigBoss) {
        const currentTime = Date.now();
        powerups = powerups.filter(powerup => {
            return currentTime - powerup.spawnTime < POWERUP_DURATION;
        });
    }
}

function getPowerupColor(type) {
    return ColorScheme.getRandomColor();
}

function checkPowerupCollisions() {
    if (!bigBoss) {
        powerups.forEach((powerup, index) => {
            const dx = player.x - powerup.x;
            const dy = player.y - powerup.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < player.size / 2 + 10) {
                activatePowerup(powerup.type);
                powerups.splice(index, 1);
            }
        });
    }
}

function activatePowerup(type) {
    if (!bigBoss) {
        // Deactivate current powerup if any
        if (currentPowerup) {
            deactivatePowerup(currentPowerup);
        }
        currentPowerup = type;
        powerupEndTime = Date.now() + POWERUP_DURATION;
        if (type === 4) {
            player.hasBarrier = true;
        }
        //console.log(`Powerup ${type} activated`);
    } else {
        //console.log("Powerup not activated due to active big boss");
    }
}

function deactivatePowerup(type) {
    if (type === 4) {
        player.hasBarrier = false;
    }
    currentPowerup = null;
    powerupEndTime = 0;
}

function updatePowerup() {
    if (bigBoss) {
        if (currentPowerup) {
            pausePowerup();
        }
    } else if (currentPowerup) {
        const currentTime = Date.now();
        if (currentTime > powerupEndTime) {
            deactivatePowerup(currentPowerup);
        }
    }
}

function pausePowerup() {
    if (currentPowerup) {
        pausedPowerup = {
            type: currentPowerup,
            remainingTime: powerupEndTime - Date.now()
        };
        deactivatePowerup(currentPowerup);
    }
}

function resumePowerup() {
    if (pausedPowerup) {
        activatePowerup(pausedPowerup.type);
        powerupEndTime = Date.now() + pausedPowerup.remainingTime;
        pausedPowerup = null;
    }
}

function chainReaction(x, y) {
    const radius = 100;
    enemies.forEach((enemy, index) => {
        const dx = enemy.x - x;
        const dy = enemy.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < radius) {
            createExplosion(enemy.x, enemy.y);
            enemies.splice(index, 1);
            score += 10;
            updateHighScore();
            checkExtraLife();
            chainReaction(enemy.x, enemy.y);
        }
    });

    stageOneBosses.forEach((boss, index) => {
        const dx = boss.x - x;
        const dy = boss.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < radius) {
            createExplosion(boss.x, boss.y);
            destroyStageOneBoss(index);
            chainReaction(boss.x, boss.y);
        }
    });
}

function fireBullet() {
    const angle = player.angle;
    const speed = 10;
    const tipX = player.x + Math.cos(angle) * (player.size / 2);
    const tipY = player.y + Math.sin(angle) * (player.size / 2);

    let bulletProps = {
        x: tipX,
        y: tipY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        isPowerup: true
    };

    switch (currentPowerup) {
        case 1: // Spread shot
            for (let i = -1; i <= 1; i++) {
                const spreadAngle = angle + i * 0.2;
                bullets.push({
                    ...bulletProps,
                    dx: Math.cos(spreadAngle) * speed,
                    dy: Math.sin(spreadAngle) * speed
                });
            }
            break;
        case 2: // Laser
            bullets.push({
                ...bulletProps,
                isLaser: true,
                length: Math.max(canvas.width, canvas.height) * 2,
                creationTime: Date.now(),
                duration: 3000
            });
            break;
        case 3: // Homing missiles
            bullets.push({
                ...bulletProps,
                isHoning: true
            });
            break;
        case 4: // Barrier
            break;
        default:
            bullets.push({
                ...bulletProps,
                isPowerup: false
            });
    }
}

function updateHoningMissiles() {
    bullets.forEach(bullet => {
        if (bullet.isHoning) {
            const closestEnemy = findClosestEnemy(bullet);
            if (closestEnemy) {
                const angle = Math.atan2(closestEnemy.y - bullet.y, closestEnemy.x - bullet.x);
                bullet.dx = Math.cos(angle) * 10;
                bullet.dy = Math.sin(angle) * 10;
            }
        }
    });
}

function findClosestEnemy(bullet) {
    let closestEnemy = null;
    let closestDistance = Infinity;
    
    const allEnemies = enemies.concat(stageOneBosses);
    if (bigBoss) {
        allEnemies.push(bigBoss);
    }
    
    for (let i = 0; i < allEnemies.length; i++) {
        const enemy = allEnemies[i];
        const dx = enemy.x - bullet.x;
        const dy = enemy.y - bullet.y;
        const distance = dx * dx + dy * dy;
        if (distance < closestDistance) {
            closestDistance = distance;
            closestEnemy = enemy;
        }
    }
    
    return closestEnemy;
}

function drawBullets() {
    const currentTime = Date.now();
    bullets.forEach(bullet => {
        if (bullet.isLaser) {
            const elapsedTime = currentTime - bullet.creationTime;
            const opacity = 1 - (elapsedTime / bullet.duration);
            ctx.strokeStyle = `rgba(255, 0, 0, ${opacity})`; 
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(bullet.x, bullet.y);
            const endX = bullet.x + bullet.dx * bullet.length;
            const endY = bullet.y + bullet.dy * bullet.length;
            ctx.lineTo(endX, endY);
            ctx.stroke();

            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = `rgba(255, 0, 0, ${opacity * 0.5})`;
            ctx.lineWidth = 12;
            ctx.stroke();
        } else if (bullet.isHoning) {
            ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
                ctx.fill();

                
                ctx.shadowColor = '#ff0000';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, 7, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0; 
        } else {
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.beginPath();
    ctx.moveTo(player.size / 2, 0);
    ctx.lineTo(-player.size / 2, -player.size / 2);
    ctx.lineTo(-player.size / 2, player.size / 2);
    ctx.closePath();
    ctx.fillStyle = ColorScheme.getPlayerColor();
    ctx.fill();

    ctx.strokeStyle = ColorScheme.getTextColor();
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    if (player.hasBarrier && !bigBoss) {
        const currentTime = Date.now();
        const timeLeft = powerupEndTime - currentTime;
        
        if (timeLeft <= POWERUP_FLASH_DURATION) {
            // Flash the barrier
            if (Math.floor(timeLeft / 100) % 2 === 0) {
                drawBarrier();
            }
        } else {
            drawBarrier();
        }
    }

    ctx.shadowBlur = 30;
    ctx.shadowColor = ColorScheme.getTextColor();
}

function drawBarrier() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size * 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = ColorScheme.getBarrierColor();
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawPolygon(x, y, radius, sides, color) {
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        drawPolygon(enemy.x, enemy.y, enemy.size / 2, enemy.sides, enemy.color);
    });
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color || ColorScheme.getTextColor();
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawScore() {
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60);
    ctx.fillText(`Lives: ${lives}`, 10, 90);
}

function drawTopPlayersList() {
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.textAlign = 'right';
    ctx.fillText('Top Players:', canvas.width - 10, 30);
    ctx.font = "12px 'Press Start 2P'";
    for (let i = 0; i < 5; i++) {
        const player = topPlayers[i] || { name: '---', score: 0 };
        ctx.fillText(`${i + 1}. ${player.name}: ${player.score}`, canvas.width - 10, 60 + i * 25);
    }
}

function drawPlayerRank() {
    const playerRank = getPlayerRank();
    if (playerRank > 0 && playerRank <= 5) {
        ctx.font = "36px 'Press Start 2P'";
        ctx.fillStyle = ColorScheme.getTextColor();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const paddingTop = 60;
        const paddingRight = 60;

        const x = canvas.width - paddingRight;
        const y = paddingTop;

        ctx.fillText(`#${playerRank}`, x, y);
    }
}

function getPlayerRank() {
    const playerScore = score;
    const playerName = player.name;
    const allPlayers = [...topPlayers, { name: playerName, score: playerScore }];
    allPlayers.sort((a, b) => b.score - a.score);
    const rank = allPlayers.findIndex(p => p.name === playerName && p.score === playerScore) + 1;
    return rank;
}

function updateTopPlayers() {
    if (!player.name) {
        return;
    }

    const newScore = { name: player.name, score: score };
    const existingPlayerIndex = topPlayers.findIndex(p => p.name === player.name);

    if (existingPlayerIndex !== -1) {
        if (score > topPlayers[existingPlayerIndex].score) {
            topPlayers[existingPlayerIndex].score = score;
        }
    } else {
        topPlayers.push(newScore);
    }

    topPlayers.sort((a, b) => b.score - a.score);
    topPlayers = topPlayers.slice(0, 5);

    localStorage.setItem('topPlayers', JSON.stringify(topPlayers));
}

function drawBossCounters() {
    ctx.font = '12px "Press Start 2P"';
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.textAlign = 'right';
    
    const bottomPadding = isMobile() ? 100 : 10;
    const rightPadding = 10;
    
    if (isMobile()) {
        ctx.font = '10px "Press Start 2P"';
    }
    
    const lineHeight = isMobile() ? 20 : 25; 
    
    ctx.fillText(`Stage 1 Bosses: ${stageOneBossesDestroyed}`, 
        canvas.width - rightPadding, 
        canvas.height - bottomPadding - lineHeight);
    
    ctx.fillText(`Stage 2 Bosses: ${bigBossesDestroyed}`, 
        canvas.width - rightPadding, 
        canvas.height - bottomPadding);
}

let lastTime = 0;

function movePlayer(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    const speedMultiplier = (player.hasBarrier && !bigBoss) ? BARRIER_SPEED_MULTIPLIER : 1;

    if (isMobile()) {
        player.x += player.dx * deltaTime * speedMultiplier;
        player.y += player.dy * deltaTime * speedMultiplier;
    } else {
        if (keys.ArrowLeft || keys.a) player.dx = -player.speed * speedMultiplier;
        else if (keys.ArrowRight || keys.d) player.dx = player.speed * speedMultiplier;
        else player.dx = 0;

        if (keys.ArrowUp || keys.w) player.dy = -player.speed * speedMultiplier;
        else if (keys.ArrowDown || keys.s) player.dy = player.speed * speedMultiplier;
        else player.dy = 0;

        player.x += player.dx * deltaTime;
        player.y += player.dy * deltaTime;
    }

    player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
    player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));
}

function moveBullets() {
    const currentTime = Date.now();
    bullets = bullets.filter(bullet => {
        if (bullet.isLaser) {
            return currentTime - bullet.creationTime < bullet.duration;
        } else {
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;
            return bullet.x > 0 && bullet.x < canvas.width && 
                   bullet.y > 0 && bullet.y < canvas.height;
        }
    });
}

function moveEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;
        
        if (enemy.x <= enemy.size / 2 || enemy.x >= canvas.width - enemy.size / 2) {
            enemy.dx *= -1;
        }
        if (enemy.y <= enemy.size / 2 || enemy.y >= canvas.height - enemy.size / 2) {
            enemy.dy *= -1;
        }
    });
}

function moveParticles() {
    particles.forEach(particle => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.life -= 0.02;
        
        if (particle.explosionRadius) {
            destroyNearbyEnemies(particle.x, particle.y, particle.explosionRadius * particle.life);
        }
    });
    particles = particles.filter(particle => particle.life > 0);
}

function spawnEnemy() {
    if (enemies.length >= MAX_ENEMIES) {
        return;
    }

    if (!bigBoss && Math.random() < currentEnemySpawnChance) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        const baseSize = isMobile() ? 25 : 20; 
        const size = isMobile() ? baseSize * MOBILE_SCALE_FACTOR : baseSize;
        enemies.push({
            x: x,
            y: y,
            size: size,
            sides: Math.floor(Math.random() * 3) + 3,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            color: ColorScheme.getRandomColor()
        });
    }
}

function spawnEnemies(count) {
    const spawnCount = Math.min(count, MAX_ENEMIES - enemies.length);
    //console.log(`Spawning ${spawnCount} enemies`);
    for (let i = 0; i < spawnCount; i++) {
        spawnEnemy();
    }
}

function createExplosion(x, y, color = '#fff', size = 2) {
    const explosionColor = ColorScheme.current === 'light' ? '#000' : color;
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        particles.push({
            x: x,
            y: y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            size: size + Math.random() * 3,
            life: 1,
            color: explosionColor,
            fixedColor: true
        });
    }
}

function createPlayerExplosion() {
    for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 5;
        let color;
        if (ColorScheme.current === 'light') {
            color = `hsl(${Math.random() * 360}, 100%, 25%)`;
        } else {
            color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        }
        particles.push({
            x: player.x,
            y: player.y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 3,
            color: color,
            life: 1
        });
    }
}

function checkCollisions() {
    try {
        const currentTime = Date.now();
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (!enemy) continue; // Ensure enemy is defined
            
            for (let j = bullets.length - 1; j >= 0; j--) {
                const bullet = bullets[j];
                if (!bullet) continue; // Ensure bullet is defined
                
                if (bullet.isLaser) {
                    if (currentTime - bullet.creationTime < bullet.duration) {
                        const endX = bullet.x + bullet.dx * bullet.length;
                        const endY = bullet.y + bullet.dy * bullet.length;
                        
                        if (lineCircleIntersection(bullet.x, bullet.y, endX, endY, enemy.x, enemy.y, enemy.size / 2)) {
                            createExplosion(enemy.x, enemy.y);
                            enemies.splice(i, 1);
                            score += 10;
                            updateHighScore();
                            checkExtraLife();
                            break;
                        }
                    }
                } else {
                    // Regular bullet collision detection
                    const dx = enemy.x - bullet.x;
                    const dy = enemy.y - bullet.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < enemy.size / 2 + 3) {
                        createExplosion(enemy.x, enemy.y);
                        enemies.splice(i, 1);
                        bullets.splice(j, 1);
                        score += 10;
                        updateHighScore();
                        checkExtraLife();
                        break;
                    }
                }
            }
        }

        // Check collisions with stage-one bosses
        for (let i = stageOneBosses.length - 1; i >= 0; i--) {
            const stageOneBoss = stageOneBosses[i];
            if (!stageOneBoss) continue;
            
            const playerDx = stageOneBoss.x - player.x;
            const playerDy = stageOneBoss.y - player.y;
            const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
            
            if (player.hasBarrier) {
                const barrierRadius = player.size * 1.5;
                if (playerDistance < barrierRadius + stageOneBoss.size / 2) {
                    createExplosion(stageOneBoss.x, stageOneBoss.y);
                    destroyStageOneBoss(i);
                    chainReaction(stageOneBoss.x, stageOneBoss.y);
                }
            } else if (playerDistance < stageOneBoss.size / 2 + player.size / 2) {
                loseLife();
            }
        }
    } catch (error) {
        console.error("Error in checkCollisions:", error);
        console.log("Current game state:", { enemies, bullets });
    }

    if (bigBoss) {
        // Check collisions between bullets and big boss projectiles
        const currentTime = Date.now();
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = bigBoss.projectiles.length - 1; j >= 0; j--) {
                const bullet = bullets[i];
                const proj = bigBoss.projectiles[j];
                const dx = bullet.x - proj.x;
                const dy = bullet.y - proj.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < proj.size / 2 + 3) {
                    if (currentTime - proj.spawnTime > proj.invulnerableTime) {
                        createExplosion(bullet.x, bullet.y);
                        bullets.splice(i, 1);
                        proj.health--;

                        if (proj.health <= 0) {
                            createGoldenExplosion(proj.x, proj.y);
                            bigBoss.projectiles.splice(j, 1);
                            bigBoss.health--;
                            //console.log("Big boss hit! Remaining health:", bigBoss.health);
                            
                            if (bigBoss.health <= 0) {
                                bigBoss.defeated = true;
                                bigBoss.shakeTime = 300;
                                //console.log("Big boss defeated!");
                            }
                        }
                    }
                    break;
                }
            }
        }

        // Check collisions between player and big boss projectiles
        for (let i = bigBoss.projectiles.length - 1; i >= 0; i--) {
            const proj = bigBoss.projectiles[i];
            const dx = player.x - proj.x;
            const dy = player.y - proj.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < player.size / 2 + proj.size / 2) {
                createGoldenExplosion(proj.x, proj.y);
                bigBoss.projectiles.splice(i, 1);
                loseLife();
                if (lives <= 0) {
                    gameOver();
                }
            }
        }
    }

   // Check collisions between player and enemies
   for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (player.hasBarrier) {
        const barrierRadius = player.size * 1.5;
        if (distance < barrierRadius + enemy.size / 2) {
            createExplosion(enemy.x, enemy.y);
            enemies.splice(i, 1);
            score += 10;
            updateHighScore();
            checkExtraLife();
            chainReaction(enemy.x, enemy.y);
        }
    } else if (distance < player.size / 2 + enemy.size / 2) {
        loseLife();
        createExplosion(enemy.x, enemy.y);
        enemies.splice(i, 1);
        if (lives <= 0) return;
    }
}


    // Check collision between player and big boss
    if (bigBoss && !bigBoss.defeated) {
        const dx = player.x - bigBoss.x;
        const dy = player.y - bigBoss.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.size / 2 + bigBoss.size / 2) {
            loseLife();
            if (lives <= 0) return;
        }

        // Check collisions between player and big boss projectiles
        for (let i = bigBoss.projectiles.length - 1; i >= 0; i--) {
            const proj = bigBoss.projectiles[i];
            const dx = player.x - proj.x;
            const dy = player.y - proj.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < player.size / 2 + proj.size / 2) {
                loseLife();
                createExplosion(proj.x, proj.y);
                bigBoss.projectiles.splice(i, 1);
                if (lives <= 0) return;
            }
        }
    }
}

function lineCircleIntersection(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const a = dx * dx + dy * dy;
    const b = 2 * (dx * (x1 - cx) + dy * (y1 - cy));
    const c = cx * cx + cy * cy + x1 * x1 + y1 * y1 - 2 * (cx * x1 + cy * y1) - r * r;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
        return false;
    }

    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    return (0 <= t1 && t1 <= 1) || (0 <= t2 && t2 <= 1);
}

function loseLife() {
    lives--;
    createPlayerExplosion();
    if (lives <= 0) {
        gameOver();
    } else {
        playerInvulnerable = true;
        setTimeout(() => {
            playerInvulnerable = false;
        }, 2000);
        resetPlayerPosition();
    }
}

function resetPlayerPosition() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.dx = 0;
    player.dy = 0;
    player.angle = 0;
}

function updateTopPlayers() {
    if (!player.name) {
        return;
    }

    const newScore = { name: player.name, score: score };
    const existingPlayerIndex = topPlayers.findIndex(p => p.name === player.name);

    if (existingPlayerIndex !== -1) {
        if (score > topPlayers[existingPlayerIndex].score) {
            topPlayers[existingPlayerIndex].score = score;
        }
    } else {
        topPlayers.push(newScore);
    }

    topPlayers.sort((a, b) => b.score - a.score);
    topPlayers = topPlayers.slice(0, 5);

    localStorage.setItem('topPlayers', JSON.stringify(topPlayers));
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        //console.log("New high score:", highScore);
    }
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        showMenu();
    } else {
        resumeGame();
    }
    updateContinueButton();
}

function checkExtraLife() {
    if (score - lastExtraLife >= 1000) {
        lives++;
        lastExtraLife = score;
    }
}

function gameLoop(currentTime) {
    if (!isGameRunning || isPaused) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        return;
    }

    if (isMobile()) {
        const aimStick = document.getElementById('aimStick');
        const aimStickKnob = document.getElementById('aimStickKnob');
        if (aimStickActive) {
            const rect = aimStick.getBoundingClientRect();
            const knobRect = aimStickKnob.getBoundingClientRect();
            
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const knobCenterX = knobRect.left + knobRect.width / 2;
            const knobCenterY = knobRect.top + knobRect.height / 2;
            
            const deltaX = knobCenterX - centerX;
            const deltaY = knobCenterY - centerY;
            
            if (deltaX !== 0 || deltaY !== 0) {
                player.angle = Math.atan2(deltaY, deltaX);
            }
        }
    } 

    if (!isPaused) {
        updateColors();
        updatePlayerAngle(lastMousePosition.x, lastMousePosition.y);
        //console.log("Game is not paused, executing game logic");
        try {
            //console.log("Clearing canvas");
            ctx.fillStyle = ColorScheme.getBackgroundColor();
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            updateCustomCursor(lastMousePosition);    
            //console.log("Moving game objects");
            if (typeof movePlayer === 'function') movePlayer(currentTime);
            if (typeof moveBullets === 'function') moveBullets();
            if (typeof moveEnemies === 'function') moveEnemies();
            if (typeof moveStageOneBosses === 'function') moveStageOneBosses();
            if (typeof moveParticles === 'function') moveParticles();
            if (typeof moveBigBoss === 'function') moveBigBoss();
            if (typeof moveBigBossProjectiles === 'function') moveBigBossProjectiles();
                
            //console.log("Spawning entities");
            if (typeof spawnEnemy === 'function') spawnEnemy();
            if (typeof spawnStageOneBoss === 'function') spawnStageOneBoss();
                
            //console.log("Checking collisions");
            if (typeof checkCollisions === 'function') checkCollisions();
            if (typeof checkStageOneBossCollisions === 'function') checkStageOneBossCollisions();
            if (typeof checkBigBossProjectileCollisions === 'function') checkBigBossProjectileCollisions();
            if (typeof checkBigBossCollisions === 'function') checkBigBossCollisions();
            if (typeof checkPowerupCollisions === 'function') checkPowerupCollisions();
                
            //console.log("Updating game state");
            if (typeof updatePowerup === 'function') updatePowerup();
            if (typeof updatePowerups === 'function') updatePowerups();
            if (typeof updateHoningMissiles === 'function') updateHoningMissiles();

            if (currentTime - lastFireTime > fireInterval) {
                if (typeof fireBullet === 'function') fireBullet();
                lastFireTime = currentTime;
            }

            //console.log("Drawing game objects");
            if (typeof drawPlayer === 'function') drawPlayer();
            if (typeof drawBullets === 'function') drawBullets();
            if (typeof drawEnemies === 'function') drawEnemies();
            if (typeof drawStageOneBosses === 'function') drawStageOneBosses();
            if (typeof drawBigBoss === 'function') drawBigBoss();
            if (typeof drawBigBossProjectiles === 'function') drawBigBossProjectiles();
            if (typeof drawPowerups === 'function') drawPowerups();
            if (typeof drawParticles === 'function') drawParticles();
            if (typeof drawTopPlayers === 'function') drawTopPlayers();
            drawBossCounters();
            drawScore()
            checkBigBossSpawn();

            if (bigBoss) {
                //console.log("Updating big boss");
                moveBigBoss();
                drawBigBoss();

                if (bigBoss.health <= 0 && !bigBoss.defeated) {
                    bigBoss.defeated = true;
                    bigBoss.shakeTime = 300; // 5 seconds at 60 FPS
                    //console.log("Big boss defeated, starting shake animation");
                }

                if (bigBoss.defeated) {
                    if (bigBoss.shakeTime > 0) {
                        bigBoss.shakeTime--;
                        // Add shaking effect
                        ctx.save();
                        ctx.translate(Math.random() * 10 - 5, Math.random() * 10 - 5);
                        drawBigBoss();
                        ctx.restore();
                    } else {
                        createGoldenExplosion(bigBoss.x, bigBoss.y);
                        lives += 3;
                        score += 3000;
                        bigBossesDestroyed++; // Add this line to increment the counter
                        updateTopPlayers();
                        bigBoss = null;
                        resetAfterBigBoss();
                        //console.log("Big boss exploded and removed. Total big bosses destroyed:", bigBossesDestroyed);
                    }
                }
            }

            // Update top players if score has changed
            if (score > 0 && score % 10 === 0) {
                updateTopPlayers();
            }

            // Draw top players list or player rank based on device
            if (isMobile()) {
                drawPlayerRank();
            } else {
                drawTopPlayersList();
            }

            updateTopPlayers();    
            drawTopPlayers();

        } catch (error) {
            console.error("Error in game loop:", error);
            isGameRunning = false;
        }
    } else {
        //console.log("Game is paused, skipping game logic");
    }

    //console.log("Requesting next animation frame");
    animationFrameId = requestAnimationFrame(gameLoop);
}

const keys = {};

window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true; // Convert to lowercase
    updatePlayerVelocity();
    
    if (e.key === 'Escape') {
        if (isGameRunning) {
            togglePause();
        } else if (document.getElementById('settingsMenu').style.display === 'block') {
            hideSettings();
        }
    }
    
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }

    if (e.key === ' ' && !isGameRunning) {
        resetGame();
        startGame();
    }
});

window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false; // Convert to lowercase
    updatePlayerVelocity();
});

function updatePlayerVelocity() {
    const speedMultiplier = isMobile() ? MOBILE_SPEED_MULTIPLIER : 1;
    player.dx = ((keys['arrowright'] || keys['d'] ? 1 : 0) - (keys['arrowleft'] || keys['a'] ? 1 : 0)) * player.speed * speedMultiplier;
    player.dy = ((keys['arrowdown'] || keys['s'] ? 1 : 0) - (keys['arrowup'] || keys['w'] ? 1 : 0)) * player.speed * speedMultiplier;
}

canvas.addEventListener('mousemove', (e) => {
    if (!isMobile()) {
        const rect = canvas.getBoundingClientRect();
        lastMousePosition.x = e.clientX - rect.left;
        lastMousePosition.y = e.clientY - rect.top;
        updatePlayerAngle(lastMousePosition.x, lastMousePosition.y);
    }
});

function updatePlayerAngle(mouseX, mouseY) {
    if (!isMobile()) {
        player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    }
}

window.addEventListener('error', function(e) {
    console.error("Global error:", e.error);
    console.error("Error message:", e.message);
    console.error("Error filename:", e.filename);
    console.error("Error line number:", e.lineno);
    console.error("Error column number:", e.colno);
    console.error("Error details:", e);
    alert("An error occurred. Please check the console for details.");
});

function pausePowerups() {
    //console.log("Pausing powerups");
    if (currentPowerup) {
        pausedPowerups.push({
            type: currentPowerup,
            remainingTime: powerupEndTime - Date.now()
        });
        currentPowerup = null;
        powerupEndTime = 0;
    }
    powerupsPausedTime = Date.now();
}


function clearFieldPowerups() {
    //console.log("Clearing field powerups");
    powerups = [];
}


function resumePowerups() {
    //console.log("Resuming powerups");
    const pauseDuration = Date.now() - powerupsPausedTime;
    if (pausedPowerups.length > 0) {
        const powerup = pausedPowerups.pop();
        currentPowerup = powerup.type;
        powerupEndTime = Date.now() + powerup.remainingTime;
    }

    powerups.forEach(powerup => {
        powerup.spawnTime += pauseDuration;
    });
}

function spawnBigBoss() {
    //console.log("spawnBigBoss function called. stageOneBossesDefeated:", stageOneBossesDefeated);
    if (!bigBoss && stageOneBossesDefeated >= 5) {
        const baseSize = 200;
        const size = isMobile() ? baseSize * MOBILE_SCALE_FACTOR : baseSize;
        bigBoss = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: 200,
            health: 5,
            maxHealth: 5,
            angle: 0,
            rotationSpeed: 0.01,
            orbitRadius: 360,
            orbitAngle: 0,
            orbitSpeed: 0.005,
            color: ColorScheme.getRandomColor(),
            shakeTime: 0,
            launchCooldown: 300,
            defeated: false,
            projectiles: []
        };
        //console.log("Big boss spawned:", bigBoss);
        
    enemies = [];
    stageOneBosses = [];
    pausePowerups();
    clearFieldPowerups();
}


function moveBigBoss() {
    if (bigBoss && !bigBoss.defeated) {
        bigBoss.orbitAngle += bigBoss.orbitSpeed;
        bigBoss.x = player.x + Math.cos(bigBoss.orbitAngle) * bigBoss.orbitRadius;
        bigBoss.y = player.y + Math.sin(bigBoss.orbitAngle) * bigBoss.orbitRadius;
        bigBoss.angle += bigBoss.rotationSpeed;

        if (bigBoss.launchCooldown <= 0) {
            launchBigBossProjectile();
            bigBoss.launchCooldown = 300;
        } else {
            bigBoss.launchCooldown--;
        }

        if (bigBoss.health <= 0) {
            bigBoss.defeated = true;
            bigBoss.shakeTime = 300;
            bigBoss.projectiles = [];
            //console.log("Big boss defeated, projectiles cleared");
        }
    }

    if (bigBoss && !bigBoss.defeated) {
        const currentTime = Date.now();
        bigBoss.projectiles.forEach(proj => {
            const angle = Math.atan2(player.y - proj.y, player.x - proj.x);
            proj.x += Math.cos(angle) * proj.speed;
            proj.y += Math.sin(angle) * proj.speed;
            proj.angle = angle;

            if (currentTime - proj.spawnTime > proj.invulnerableTime) {
                proj.invulnerable = false;
            }
        });
    }
}

function launchBigBossProjectile() {
    const angle = Math.atan2(player.y - bigBoss.y, player.x - bigBoss.x);
    const baseSize = 30;
    const size = isMobile() ? baseSize * MOBILE_SCALE_FACTOR : baseSize;
    bigBoss.projectiles.push({
        x: bigBoss.x,
        y: bigBoss.y,
        size: size,
        angle: angle,
        speed: 1.5,
        health: 5,
        color: ColorScheme.getRandomColor(),
        invulnerableTime: 3000,
        spawnTime: Date.now()
    });
}

function drawBigBoss() {
    if (bigBoss) {
        ctx.save();
        ctx.translate(bigBoss.x, bigBoss.y);
        ctx.rotate(bigBoss.angle);

        ctx.shadowColor = 'gold';
        ctx.shadowBlur = 30;

        ctx.fillStyle = bigBoss.defeated ? `rgba(255, 215, 0, ${bigBoss.shakeTime / 300})` : 'gold';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
            const outerX = Math.cos(angle) * bigBoss.size / 2;
            const outerY = Math.sin(angle) * bigBoss.size / 2;
            ctx.lineTo(outerX, outerY);

            const innerAngle = angle + Math.PI / 5;
            const innerX = Math.cos(innerAngle) * bigBoss.size / 4;
            const innerY = Math.sin(innerAngle) * bigBoss.size / 4;
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        if (!bigBoss.defeated) {
            const healthBarWidth = bigBoss.size * 1.5;
            const healthBarHeight = 10;
            const healthPercentage = bigBoss.health / bigBoss.maxHealth;
            
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(bigBoss.x - healthBarWidth / 2, bigBoss.y - bigBoss.size / 2 - 20, healthBarWidth, healthBarHeight);
            
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.fillRect(bigBoss.x - healthBarWidth / 2, bigBoss.y - bigBoss.size / 2 - 20, healthBarWidth * healthPercentage, healthBarHeight);
            
            ctx.strokeStyle = ColorScheme.getTextColor();
            ctx.lineWidth = 2;
            ctx.strokeRect(bigBoss.x - healthBarWidth / 2, bigBoss.y - bigBoss.size / 2 - 20, healthBarWidth, healthBarHeight);
        }

        const currentTime = Date.now();
        bigBoss.projectiles.forEach(proj => {
            ctx.save();
            ctx.translate(proj.x, proj.y);
            ctx.rotate(proj.angle);

            // Change color based on invulnerability
            if (currentTime - proj.spawnTime <= proj.invulnerableTime) {
                ctx.strokeStyle = ColorScheme.getTextColor();
            } else {
                ctx.strokeStyle = proj.color;
            }

            ctx.lineWidth = 4;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
                const outerX = Math.cos(angle) * proj.size / 2;
                const outerY = Math.sin(angle) * proj.size / 2;
                ctx.lineTo(outerX, outerY);

                const innerAngle = angle + Math.PI / 5;
                const innerX = Math.cos(innerAngle) * proj.size / 4;
                const innerY = Math.sin(innerAngle) * proj.size / 4;
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        });
    }
}

function createGoldenExplosion(x, y) {
    const baseColor = ColorScheme.current === 'light' ? '128, 100, 0' : '255, 215, 0';
    for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 5;
        const size = 2 + Math.random() * 4;
        particles.push({
            x: x,
            y: y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            size: size,
            color: `rgba(${baseColor}, ${Math.random() * 0.5 + 0.5})`,
            life: 120 + Math.random() * 60
        });
    }
}

function gameOver() {
    console.log("Game Over function called");
    isGameRunning = false;
    isPaused = true;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    updateHighScore();
    updateTopPlayers();
    showGameOverScreen();
    hideMobileControls();
}

function showGameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (ColorScheme.current === 'dark' || ColorScheme.current === 'colorblind') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const centerY = canvas.height / 2;
    
    ctx.shadowColor = ColorScheme.getTextColor();
    ctx.shadowBlur = 10;
    
    ctx.fillStyle = ColorScheme.getTextColor();

    if (isMobile()) {
        ctx.font = '24px "Press Start 2P", cursive';
        ctx.fillText('GAME OVER', canvas.width / 2, centerY - 60);
        
        ctx.font = '16px "Press Start 2P", cursive';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, centerY - 20);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, centerY + 20);
        
        ctx.font = '12px "Press Start 2P", cursive';
        ctx.fillText('Tap to continue', canvas.width / 2, centerY + 60);
    } else {
        ctx.font = '48px "Press Start 2P", cursive';
        ctx.fillText('GAME OVER', canvas.width / 2, centerY - 40);
        
        ctx.font = '24px "Press Start 2P", cursive';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, centerY + 20);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, centerY + 60);
        
        ctx.fillText('Press SPACE to continue', canvas.width / 2, centerY + 120);
    }
    
    if (isMobile()) {
        canvas.addEventListener('touchstart', handleGameOverTouch);
    } else {
        window.addEventListener('keydown', handleGameOverKeyPress);
    }
}

function handleGameOverTouch(e) {
    e.preventDefault();
    canvas.removeEventListener('touchstart', handleGameOverTouch);
    startNewGame();
}

function handleGameOverKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        window.removeEventListener('keydown', handleGameOverKeyPress);
        startNewGame();
    }
}

function startGame() {
    console.log("Starting game...");
    hideMenu();
    resetGame();
    resizeCanvas();
    resetPlayerPosition();
    isGameRunning = true;
    isPaused = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    if (isMobile()) {
        initMobileControls();
    }
    loadSettings();
    updateMobileControlsColor();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function resetGame() {
    console.log("Resetting game...");
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.angle = 0;
    player.dx = 0;
    player.dy = 0;
    player.hasBarrier = false;
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    lives = 3;
    lastExtraLife = 0;
    stageOneBosses = [];
    powerups = [];
    currentPowerup = null;
    powerupEndTime = 0;
    bigBoss = null;
    stageOneBossesDefeated = 0;
    projectilesDestroyed = 0;
    stageOneBossesDestroyed = 0;
    bigBossesDestroyed = 0;
    lastFireTime = 0;
    currentEnemySpawnChance = INITIAL_ENEMY_SPAWN_CHANCE;
}

function resetAfterBigBoss() {
    //console.log("Resetting game state after big boss defeat");
    stageOneBossesDefeated = 0;
    currentEnemySpawnChance = INITIAL_ENEMY_SPAWN_CHANCE;
    resumePowerups();
    spawnEnemies(15);
    spawnStageOneBoss(); 
}

function drawPlayerRank() {
    const playerRank = getPlayerRank();
    if (playerRank > 0 && playerRank <= 5) {
        ctx.font = "36px 'Press Start 2P'";
        ctx.fillStyle = ColorScheme.getTextColor();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const paddingTop = 60;
        const paddingRight = 60;

        const x = canvas.width - paddingRight;
        const y = paddingTop;

        ctx.fillText(`#${playerRank}`, x, y);
    }
}

function drawTopPlayersList() {
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.textAlign = 'right';
    ctx.fillText('Top Players:', canvas.width - 10, 30);
    ctx.font = "12px 'Press Start 2P'";
    for (let i = 0; i < 5; i++) {
        const player = topPlayers[i] || { name: '---', score: 0 };
        ctx.fillText(`${i + 1}. ${player.name}: ${player.score}`, canvas.width - 10, 60 + i * 25);
    }
}

function getPlayerRank() {
    const playerScore = score;
    const playerName = player.name;
    const allPlayers = [...topPlayers, { name: playerName, score: playerScore }];
    allPlayers.sort((a, b) => b.score - a.score);
    const rank = allPlayers.findIndex(p => p.name === playerName && p.score === playerScore) + 1;
    return rank;
}

function drawTopPlayers() {
    if (isMobile()) {
        drawPlayerRank();
    } else {
        drawTopPlayersList();
    }
}

}