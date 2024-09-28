export let aimAngle = 0;
export let bullets = [];
export let enemies = [];
export let particles = [];
export let score = 0;
export let highScore = parseInt(localStorage.getItem('highScore')) || 0;
export let lives = 3;
export let lastTime = 0;
export let lastExtraLife = 0;
export let playerInvulnerable = false;
export let playerBlinkInterval;
export let stageOneBosses = [];
export let powerups = [];
export let currentPowerup = null;
export let powerupEndTime = 0;
export let projectilesDestroyed = 0;
export let isGameRunning = false;
export let animationFrameId = null;
export let playerName = '';
export let topPlayers = [];
export let highScoreName = localStorage.getItem('highScoreName') || '';
export let gameState = 'menu';
export let isPaused = false;
export let pausedPowerups = [];
export let powerupsPausedTime = 0;
export let lastMousePosition = { x: 0, y: 0 };
export let currentEnemySpawnChance = INITIAL_ENEMY_SPAWN_CHANCE;
export let lastFireTime = 0;

export const fireInterval = 200;
export const keys = {};
export const menuScreen = document.getElementById('menuScreen');
export const gameCanvas = document.getElementById('gameCanvas');
export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');
export const BIG_BOSS_SPAWN_INTERVAL = 5; 
export const STAGE_ONE_BOSS_SPAWN_INTERVAL = 500;
export const INITIAL_ENEMY_SPAWN_CHANCE = 0.02;
export const POWERUP_DURATION = 20000; // 20 seconds
export const POWERUP_FLASH_DURATION = 5000;
export const MAX_ENEMIES = 15;
export const MOBILE_SPEED_MULTIPLIER = .5;

export const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 35,
    speed: 200,
    dx: 0,
    dy: 0,
    angle: 0
};

export const ColorScheme = {
    dark: {
        text: '#0f0',
        background: '#000',
        colors: ['#4FAF44', '#F6EB14', '#FF9526', '#EF4423', '#2A3492']
    },
    light: {
        text: '#0d2140',
        background: '#FAF9F6',
        colors: ['#a0eba8', '#f53141', '#f2621f', '#FFC300', '#ae88e3']
    },
    colorblind: {
        text: '#009e73',
        background: '#000',
        colors: ['#d55e00', '#cc79a7', '#0072b2', '#f0e442', '#009e73']
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
    }
};

export function resizeCanvas() {
    if (isMobile()) {
        resizeCanvasForMobile();
    } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    console.log("Canvas resized to:", canvas.width, "x", canvas.height);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

export function updateCustomCursor(position) {
    if (!isGameRunning || isPaused) return;

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
    ctx.shadowBlur = 10;
    ctx.stroke();
    
    ctx.restore();
}

export function updatePlayerAngle(mouseX, mouseY) {
    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
}

export function createModal(content, isExitModal = false) {
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

export function applyColorModeToElement(element) {
    element.style.backgroundColor = ColorScheme.getBackgroundColor();
    element.style.color = ColorScheme.getTextColor();
}

export function showMenu() {
    gameState = 'menu';
    menuScreen.style.display = 'block';
    gameCanvas.style.display = 'none';
    //console.log("Menu shown. isPaused:", isPaused);
}

export function hideMenu() {
    menuScreen.style.display = 'none';
    gameCanvas.style.display = 'block';
    //console.log("Menu hidden. isPaused:", isPaused);
}

export function initializeMenu() {
    document.getElementById('newGame').addEventListener('click', startNewGame);

    document.getElementById('continue').addEventListener('click', () => {
        if (isGameRunning && isPaused) {
            resumeGame();
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

export function showExitConfirmation() {
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

export function showNamePrompt() {
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

export function showHighScores() {
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

export function showSettings() {
    if (isGameRunning) {
        isPaused = true;
    }
    document.getElementById('settingsMenu').style.display = 'block';
    document.getElementById('menuScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'none';
}

export function closeSettings() {
    document.getElementById('settingsMenu').style.display = 'none';
    if (isGameRunning) {
        resumeGame();
    } else {
        showMenu();
    }
}

export function resumeGame() {
    //console.log("Resuming game...");
    isPaused = false;
    hideMenu();
    hideSettings();
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    //console.log("Game resumed. isPaused:", isPaused);
}

export function hideSettings() {
    document.getElementById('settingsMenu').style.display = 'none';
}

export function applyColorMode(mode) {
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

export function updateColors() {
    // Update background color
    canvas.style.backgroundColor = ColorScheme.getBackgroundColor();
    
    // Update text color
    ctx.fillStyle = ColorScheme.getTextColor();
    
    // Only update colors for elements without a color assigned
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

export function updateRadioButtonStyles() {
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

export function loadSettings() {
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
    //console.log("Window load event triggered");
    initializeMenu();
    loadSettings();
    showMenu();
    initializeTopPlayers();
    updateRadioButtonStyles();
});

export function startGame() {
    console.log("Starting game...");
    showNamePrompt()
        .then(name => {
            if (name) {
                player.name = name;
                resetGame();
                startGame();
            } else {
                showMenu();
            }
        })
        .catch(error => {
            console.error("Error starting new game:", error);
            showMenu();
        });
    hideMenu();
    resetGame();
    isGameRunning = true;
    isPaused = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    if (isMobile()) {
        createMobileControls();
        setupMobileControls();
        resizeCanvasForMobile();
        
        // Adjust the position of mobile controls
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.style.position = 'fixed';
            mobileControls.style.bottom = '0';
            mobileControls.style.left = '0';
            mobileControls.style.width = '100%';
            mobileControls.style.height = '34vh';
        }
    }
    loadSettings(); // Move this after creating mobile controls
    animationFrameId = requestAnimationFrame(gameLoop);
}

export function resetGame() {
    //console.log("Resetting game...");
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

export function gameOver() {
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

export function handleGameOverKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent any default space key behavior
        window.removeEventListener('keydown', handleGameOverKeyPress);
        startNewGame();
    }
}

export function updateContinueButton() {
    const continueButton = document.getElementById('continue');
    continueButton.disabled = !(isGameRunning && isPaused);
}

export function spawnPowerup(x, y) {
    const powerupType = Math.floor(Math.random() * 3) + 1;
    powerups.push({
        x,
        y,
        type: powerupType,
        spawnTime: Date.now(),
        color: getPowerupColor(powerupType)
    });
}

export function drawPowerups() {
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

            // Add a white border
            ctx.strokeStyle = ColorScheme.getTextColor();
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }
    });
}

export function updatePowerups() {
    if (!bigBoss) {
        const currentTime = Date.now();
        powerups = powerups.filter(powerup => {
            return currentTime - powerup.spawnTime < POWERUP_DURATION;
        });
    }
}

export function getPowerupColor(type) {
    return ColorScheme.getRandomColor();
}

export function checkPowerupCollisions() {
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

export function activatePowerup(type) {
    currentPowerup = type;
    powerupEndTime = Date.now() + POWERUP_DURATION;
    if (type === 3) {
        //console.log("Honing Missiles powerup activated");
    }
}

export function updatePowerup() {
    if (!bigBoss && currentPowerup && Date.now() > powerupEndTime) {
        currentPowerup = null;
    }
}

export function fireBullet() {
    const angle = player.angle;
    const speed = 10;
    const tipX = player.x + Math.cos(angle) * (player.size / 2);
    const tipY = player.y + Math.sin(angle) * (player.size / 2);
    
    if (currentPowerup === 1) {
        for (let i = -1; i <= 1; i++) {
            const spreadAngle = angle + i * 0.2;
            bullets.push({
                x: tipX,
                y: tipY,
                dx: Math.cos(spreadAngle) * speed,
                dy: Math.sin(spreadAngle) * speed
            });
        }
    } else if (currentPowerup === 2) {
        bullets.push({
            x: tipX,
            y: tipY,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            isLaser: true,
            length: Math.max(canvas.width, canvas.height) * 2,
            creationTime: Date.now(),
            duration: 3000 // 3 seconds in milliseconds
        });
    } else if (currentPowerup === 3) {
        bullets.push({
            x: tipX,
            y: tipY,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            isHoning: true
        });
    } else {
        bullets.push({
            x: tipX,
            y: tipY,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed
        });
    }
}

export function updateHoningMissiles() {
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

export function findClosestEnemy(bullet) {
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

export function drawBullets() {
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

            // Add a glow effect
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = `rgba(255, 0, 0, ${opacity * 0.5})`;
            ctx.lineWidth = 12;
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow blur
        } else if (bullet.isHoning) {
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

export function drawPlayer() {
    if (!playerInvulnerable || Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);

        ctx.shadowBlur = 20;
        ctx.shadowColor = ColorScheme.getTextColor();
        
        ctx.fillStyle = ColorScheme.getTextColor();
        ctx.beginPath();
        ctx.moveTo(player.size / 2, 0);  // Tip of the triangle
        ctx.lineTo(-player.size / 2, -player.size / 2);
        ctx.lineTo(-player.size / 2, player.size / 2);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        
        ctx.restore();
    }
}

export function drawParticles() {
    particles.forEach(particle => {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color || ColorScheme.getTextColor();
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

export function drawLives() {
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.textAlign = "left";
    ctx.fillText(`Lives: ${lives}`, 10, 90);
}

export function drawScore() {
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60);
}

export function drawTopPlayers() {
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.textAlign = 'right';
    ctx.fillText('Top Players:', canvas.width - 10, 30);
    ctx.font = "12px 'Press Start 2P'";
    for (let i = 0; i < 5; i++) {
        const player = topPlayers[i] || { name: '---', score: 0 };
        ctx.fillText(`${i + 1}. ${player.name}: ${player.score}`, canvas.width - 10, 60 + i * 25);
    }
    //console.log("Drawing top players:", topPlayers); // For debugging
}

export function drawBossCounters() {
    ctx.font = '12px "Press Start 2P"';
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.textAlign = 'right';
    
    const bottomPadding = 10;
    const rightPadding = 10;
    
    ctx.fillText(`Stage 1 Bosses: ${stageOneBossesDestroyed}`, 
        canvas.width - rightPadding, 
        canvas.height - bottomPadding - 20);
    
    ctx.fillText(`Stage 2 Bosses: ${bigBossesDestroyed}`, 
        canvas.width - rightPadding, 
        canvas.height - bottomPadding);
}

export function movePlayer(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    player.x += player.dx * deltaTime;
    player.y += player.dy * deltaTime;
    player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
    player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));

    console.log('Player position updated:', { 
        x: player.x, 
        y: player.y, 
        dx: player.dx, 
        dy: player.dy,
        angle: player.angle // Log the angle to verify it's not changing
    });
}

export function moveBullets() {
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

export function moveParticles() {
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

export function createExplosion(x, y, color = '#fff', size = 2) {
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

export function createPlayerExplosion() {
    for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 5;
        let color;
        if (ColorScheme.current === 'light') {
            color = `hsl(${Math.random() * 360}, 100%, 25%)`; // Darker colors for light mode
        } else {
            color = `hsl(${Math.random() * 360}, 100%, 50%)`; // Original bright colors
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

export function checkCollisions() {
    try {
        const currentTime = Date.now();
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            for (let j = bullets.length - 1; j >= 0; j--) {
                const bullet = bullets[j];
                if (bullet.isLaser) {
                    // Only process laser if it's still active
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
            if (!playerInvulnerable) {
                const playerDx = stageOneBoss.x - player.x;
                const playerDy = stageOneBoss.y - player.y;
                const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
                if (playerDistance < stageOneBoss.size / 2 + player.size / 2) {
                    loseLife();
                }
            }
        }
    } catch (error) {
        console.error("Error in checkCollisions:", error);
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
                    // Only damage the projectile if it's not invulnerable
                    if (currentTime - proj.spawnTime > proj.invulnerableTime) {
                        createExplosion(bullet.x, bullet.y);
                        bullets.splice(i, 1);
                        proj.health--;

                        if (proj.health <= 0) {
                            createGoldenExplosion(proj.x, proj.y);
                            bigBoss.projectiles.splice(j, 1);
                            
                            // Damage the big boss
                            bigBoss.health--;
                            //console.log("Big boss hit! Remaining health:", bigBoss.health);
                            
                            if (bigBoss.health <= 0) {
                                bigBoss.defeated = true;
                                bigBoss.shakeTime = 300; // 5 seconds at 60 FPS
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

        if (distance < player.size / 2 + enemy.size / 2) {
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

export function lineCircleIntersection(x1, y1, x2, y2, cx, cy, r) {
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

export function loseLife() {
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

export function resetPlayerPosition() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.dx = 0;
    player.dy = 0;
}

export function updateTopPlayers() {
    if (!player.name) {
        return;
    }

    const newScore = { name: player.name, score: score };
    const existingPlayerIndex = topPlayers.findIndex(p => p.name === player.name);

    if (existingPlayerIndex !== -1) {
        // Update existing player's score if the new score is higher
        if (score > topPlayers[existingPlayerIndex].score) {
            topPlayers[existingPlayerIndex].score = score;
        }
    } else {
        // Add new player
        topPlayers.push(newScore);
    }

    // Sort and keep top 5
    topPlayers.sort((a, b) => b.score - a.score);
    topPlayers = topPlayers.slice(0, 5);

    localStorage.setItem('topPlayers', JSON.stringify(topPlayers));
}

export function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        //console.log("New high score:", highScore);
    }
}

export function togglePause() {
    isPaused = !isPaused;
    //console.log("Game paused state toggled. isPaused:", isPaused);
    if (isPaused) {
        showMenu();
    } else {
        resumeGame();
    }
    updateContinueButton();
}

export function startGameLoop() {
    //console.log("Starting game loop...");
    isGameRunning = true;
    isPaused = false;
    lastFireTime = 0;
    //console.log("Game started. isPaused:", isPaused);
    gameLoop();
    updateContinueButton();
}

export function checkExtraLife() {
    if (score - lastExtraLife >= 1000) {
        lives++;
        lastExtraLife = score;
    }
}

window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true; // Convert to lowercase
    updatePlayerVelocity();
    
    if (e.key === 'Escape') {
        if (isGameRunning) {
            togglePause();
        } else if (document.getElementById('settingsMenu').style.display === 'block') {
            closeSettings();
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

export function updatePlayerVelocity() {
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

export function updatePlayerAngle(mouseX, mouseY) {
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

export function pausePowerups() {
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


export function clearFieldPowerups() {
    //console.log("Clearing field powerups");
    powerups = [];
}


export function resumePowerups() {
    //console.log("Resuming powerups");
    const pauseDuration = Date.now() - powerupsPausedTime;
    if (pausedPowerups.length > 0) {
        const powerup = pausedPowerups.pop();
        currentPowerup = powerup.type;
        powerupEndTime = Date.now() + powerup.remainingTime;
    }
    // Adjust remaining time for powerups on the field
    powerups.forEach(powerup => {
        powerup.spawnTime += pauseDuration;
    });
}

export function getRandomNeonColor() {
    const neonColors = ['#FF00FF', '#00FFFF', '#FF00FF', '#FFFF00', '#00FF00'];
    return neonColors[Math.floor(Math.random() * neonColors.length)];
}

export function gameOver() {
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
}

export function showGameOverScreen() {
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
        // Mobile version
        ctx.font = '24px "Press Start 2P", cursive';
        ctx.fillText('GAME OVER', canvas.width / 2, centerY - 60);
        
        ctx.font = '16px "Press Start 2P", cursive';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, centerY - 20);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, centerY + 20);
        
        ctx.font = '12px "Press Start 2P", cursive';
        ctx.fillText('Tap to continue', canvas.width / 2, centerY + 60);
    } else {
        // Desktop version (unchanged)
        ctx.font = '48px "Press Start 2P", cursive';
        ctx.fillText('GAME OVER', canvas.width / 2, centerY - 40);
        
        ctx.font = '24px "Press Start 2P", cursive';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, centerY + 20);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, centerY + 60);
        
        ctx.fillText('Press SPACE to continue', canvas.width / 2, centerY + 120);
    }
    
    ctx.shadowBlur = 0;
    
    if (isMobile()) {
        canvas.addEventListener('touchstart', handleGameOverTouch);
    } else {
        window.addEventListener('keydown', handleGameOverKeyPress);
    }
}

export function handleGameOverTouch(e) {
    e.preventDefault();
    canvas.removeEventListener('touchstart', handleGameOverTouch);
    startNewGame();
}

export function handleGameOverKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        window.removeEventListener('keydown', handleGameOverKeyPress);
        startNewGame();
    }
}

export function handleGameOverKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault(); 
        window.removeEventListener('keydown', handleGameOverKeyPress);
        startNewGame();
    }
}

export function startNewGame() {
    console.log("Starting new game...");
    showNamePrompt()
        .then(name => {
            if (name) {
                player.name = name;
                resetGame();
                startGame();
            } else {
                showMenu();
            }
        })
        .catch(error => {
            console.error("Error starting new game:", error);
            showMenu();
        });
}

export function resetGame() {
    console.log("Resetting game...");
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

export function drawTopPlayers() {
    if (isMobile()) {
        drawPlayerRank();
    } else {
        drawFullTopPlayersList();
    }
}

export function drawPlayerRank() {
    const playerRank = getPlayerRank();
    if (playerRank > 0) {
        ctx.font = "16px 'Press Start 2P'";
        ctx.fillStyle = ColorScheme.getTextColor();
        ctx.textAlign = 'right';
        ctx.fillText(`#${playerRank}`, canvas.width - 10, 30);
    }
}

export function drawFullTopPlayersList() {
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

export function getPlayerRank() {
    const playerScore = score;
    const playerName = player.name;
    
    // Create a copy of topPlayers and add the current player
    const allPlayers = [...topPlayers, { name: playerName, score: playerScore }];
    
    // Sort all players by score in descending order
    allPlayers.sort((a, b) => b.score - a.score);
    
    // Find the rank of the current player
    const rank = allPlayers.findIndex(p => p.name === playerName && p.score === playerScore) + 1;
    
    return rank <= 5 ? rank : 0; // Return 0 if not in top 5
}

export function initializeTopPlayers() {
    topPlayers = JSON.parse(localStorage.getItem('topPlayers')) || [];
    //console.log("Initialized top players:", topPlayers);
}

initializeTopPlayers();