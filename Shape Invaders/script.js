const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const MAX_ENEMIES = 15;

//console.log("MAX_ENEMIES defined as:", MAX_ENEMIES);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log("Canvas resized to:", canvas.width, "x", canvas.height);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 40,
    speed: 5,
    dx: 0,
    dy: 0,
    angle: 0
};

let bullets = [];
let enemies = [];
let particles = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
let lives = 3;
let lastExtraLife = 0;
let playerInvulnerable = false;
let playerBlinkInterval;

let miniBosses = [];
let powerups = [];
let currentPowerup = null;
let powerupEndTime = 0;

const BIG_BOSS_SPAWN_INTERVAL = 5; 
const MINI_BOSS_SPAWN_INTERVAL = 10; // Spawn mini-boss every 500 points
const ENEMY_SPAWN_CHANCE = 0.02;
const POWERUP_DURATION = 15000; // 15 seconds
const POWERUP_FLASH_DURATION = 5000;


let projectilesDestroyed = 0;

let isGameRunning = false;
let animationFrameId = null;

let playerName = '';
let topPlayers = [];
let highScoreName = localStorage.getItem('highScoreName') || '';

let gameState = 'menu';
const menuScreen = document.getElementById('menuScreen');
const gameCanvas = document.getElementById('gameCanvas');

let isPaused = false;

const ColorScheme = {
    dark: {
        text: '#0f0',
        background: '#000',
        colors: ['#4FAF44', '#F6EB14', '#FF9526', '#EF4423', '#2A3492']
    },
    light: {
        text: '#000',
        background: '#fff',
        colors: ['#0a0', '#00a', '#a00', '#0aa']
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
    //console.log("Menu shown. isPaused:", isPaused);
}

function hideMenu() {
    menuScreen.style.display = 'none';
    gameCanvas.style.display = 'block';
    //console.log("Menu hidden. isPaused:", isPaused);
}

function initializeMenu() {
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
            <h2>Enter Your Name</h2>
            <input type="text" id="nameInput" style="width: 200px; margin: 20px auto;" maxlength="20">
            <p id="nameError" style="color: red; display: none;">Invalid name. Use only letters, numbers, and spaces.</p>
            <button id="submitName">Submit</button>
        `;
        const modal = createModal(content);
        
        const nameInput = document.getElementById('nameInput');
        const submitName = document.getElementById('submitName');
        const nameError = document.getElementById('nameError');
        
        function validateAndSubmitName() {
            const name = nameInput.value.trim();
            //console.log("Validating name:", name);
            const isValid = /^[A-Za-z0-9 ]+$/.test(name);
            
            if (isValid && name.length > 0) {
                //console.log("Name is valid:", name);
                document.body.removeChild(modal);
                resolve(name);
            } else {
                //console.log("Name is invalid");
                nameError.style.display = 'block';
            }
        }
        
        function handleEscape() {
            //console.log("Escape pressed, rejecting");
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
}

function closeSettings() {
    document.getElementById('settingsMenu').style.display = 'none';
    if (isGameRunning) {
        resumeGame();
    } else {
        showMenu();
    }
}

function resumeGame() {
    //console.log("Resuming game...");
    isPaused = false;
    hideMenu();
    hideSettings();
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    //console.log("Game resumed. isPaused:", isPaused);
}

function hideSettings() {
    document.getElementById('settingsMenu').style.display = 'none';
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
    
    // Regenerate colors for existing enemies
    enemies.forEach(enemy => {
        enemy.color = ColorScheme.getRandomColor();
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
    //console.log("Window load event triggered");
    initializeMenu();
    loadSettings();
    showMenu();
    initializeTopPlayers();
});

function startNewGame() {
    //console.log("Starting new game...");
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

function startGame() {
    //console.log("Starting game...");
    loadSettings();
    hideMenu();
    resetGame();
    isGameRunning = true;
    isPaused = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(gameLoop);
}

function resetGame() {
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
    miniBosses = [];
    powerups = [];
    currentPowerup = null;
    powerupEndTime = 0;
    bigBoss = null;
    miniBossesDefeated = 0;
    projectilesDestroyed = 0;
    miniBossesDestroyed = 0;
    bigBossesDestroyed = 0;
    lastFireTime = 0;
}

function gameOver() {
    //console.log("Game Over function called");
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
    miniBossesDefeated = 0;
    
    showGameOverScreen();
}

function showGameOverScreen() {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (ColorScheme.current === 'dark' || ColorScheme.current === 'colorblind') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '48px "Press Start 2P", cursive';
    
    const centerY = canvas.height / 2;
    
    // Add neon glow effect
    ctx.shadowColor = ColorScheme.getTextColor();
    ctx.shadowBlur = 10;
    
    // Draw "GAME OVER"
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.fillText('GAME OVER', canvas.width / 2, centerY - 40);
    
    // Set the font for "Press SPACE to continue"
    ctx.font = '24px "Press Start 2P", cursive';
    
    // Draw "Press SPACE to continue"
    ctx.fillText('Press SPACE to continue', canvas.width / 2, centerY + 40);
    
    // Reset shadow blur
    ctx.shadowBlur = 0;
    
    // Add event listener for space key
    window.addEventListener('keydown', handleGameOverKeyPress);
}

function handleGameOverKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent any default space key behavior
        window.removeEventListener('keydown', handleGameOverKeyPress);
        startNewGame();
    }
}

function updateContinueButton() {
    const continueButton = document.getElementById('continue');
    continueButton.disabled = !(isGameRunning && isPaused);
}

function spawnMiniBoss() {
    if (!bigBoss && score > 0 && score % MINI_BOSS_SPAWN_INTERVAL === 0 && miniBosses.length === 0) {
        let x, y;
        
        // Determine which side of the screen to spawn on
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

        // Calculate initial velocity towards the center of the screen
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const angle = Math.atan2(centerY - y, centerX - x);
        const speed = 2 + Math.random() * 2; // Random speed between 2 and 4

        miniBosses.push({
            x: x,
            y: y,
            size: 60,
            health: 3,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            color: ColorScheme.getRandomColor()
        });
        //console.log("Mini-boss spawned. Total mini-bosses:", miniBosses.length);
    }
}

function drawMiniBosses() {
    miniBosses.forEach(boss => {
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

        ctx.shadowBlur = 0;

        ctx.fillStyle = ColorScheme.getTextColor();
        ctx.fillRect(boss.x - boss.size / 2, boss.y - boss.size / 2 - 10, (boss.size * boss.health) / 3, 5);
    });
}

function moveMiniBosses() {
    miniBosses.forEach(boss => {
        boss.x += boss.dx;
        boss.y += boss.dy;
        
        // Bounce off screen edges, but allow entering from off-screen
        if ((boss.x <= boss.size / 2 && boss.dx < 0) || (boss.x >= canvas.width - boss.size / 2 && boss.dx > 0)) {
            boss.dx *= -1;
        }
        if ((boss.y <= boss.size / 2 && boss.dy < 0) || (boss.y >= canvas.height - boss.size / 2 && boss.dy > 0)) {
            boss.dy *= -1;
        }

        // Optional: Gradually move towards the center of the screen
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        boss.dx += (centerX - boss.x) * 0.0001;
        boss.dy += (centerY - boss.y) * 0.0001;

        // Limit maximum speed
        const maxSpeed = 5;
        const speed = Math.sqrt(boss.dx * boss.dx + boss.dy * boss.dy);
        if (speed > maxSpeed) {
            boss.dx = (boss.dx / speed) * maxSpeed;
            boss.dy = (boss.dy / speed) * maxSpeed;
        }
    });
}

function checkMiniBossCollisions() {
    for (let i = miniBosses.length - 1; i >= 0; i--) {
        const boss = miniBosses[i];
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
                    destroyMiniBoss(i);
                    score += 50;
                    spawnPowerup(boss.x, boss.y);
                    //console.log("Mini-boss destroyed. Total destroyed:", miniBossesDestroyed);
                }
                break;
            }
        }
    }
}

function destroyMiniBoss(index) {
    miniBosses.splice(index, 1);
    miniBossesDestroyed++;
    miniBossesDefeated++; // Add this line
    score += 50;
    //console.log("Mini-boss destroyed. Total destroyed:", miniBossesDestroyed);
    //console.log("Mini-bosses defeated:", miniBossesDefeated); // Add this line
}

function spawnPowerup(x, y) {
    const powerupType = Math.floor(Math.random() * 3) + 1;
    powerups.push({
        x,
        y,
        type: powerupType,
        spawnTime: Date.now()
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
            gradient.addColorStop(0, getPowerupColor(powerup.type));
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.beginPath();
            ctx.arc(powerup.x, powerup.y, 30 * pulseScale, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw inner powerup
            ctx.beginPath();
            ctx.arc(powerup.x, powerup.y, 10 * pulseScale, 0, Math.PI * 2);
            ctx.fillStyle = getPowerupColor(powerup.type);
            ctx.fill();

            // Add a white border
            ctx.strokeStyle = ColorScheme.getTextColor();
            ctx.lineWidth = 2;
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
    switch (type) {
        case 1: return '#ff00ff'; // Bright magenta
        case 2: return '#00ffff'; // Bright cyan
        case 3: return '#ffff00'; // Bright yellow
    }
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
    currentPowerup = type;
    powerupEndTime = Date.now() + POWERUP_DURATION;
    if (type === 3) {
        //console.log("Honing Missiles powerup activated");
    }
}

function updatePowerup() {
    if (!bigBoss && currentPowerup && Date.now() > powerupEndTime) {
        currentPowerup = null;
    }
}

function fireBullet() {
    const angle = player.angle - Math.PI / 2;
    const speed = 10;
    
    if (currentPowerup === 1) {
        for (let i = -1; i <= 1; i++) {
            const spreadAngle = angle + i * 0.2;
            bullets.push({
                x: player.x,
                y: player.y,
                dx: Math.cos(spreadAngle) * speed,
                dy: Math.sin(spreadAngle) * speed
            });
        }
    } else if (currentPowerup === 2) {
        bullets.push({
            x: player.x,
            y: player.y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            isLaser: true,
            length: Math.max(canvas.width, canvas.height) * 2,
            creationTime: Date.now(),
            duration: 3000 // 3 seconds in milliseconds
        });
    } else if (currentPowerup === 3) {
        bullets.push({
            x: player.x,
            y: player.y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            isHoning: true
        });
    } else {
        bullets.push({
            x: player.x,
            y: player.y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed
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
    
    const allEnemies = enemies.concat(miniBosses);
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

function drawPlayer() {
    if (!playerInvulnerable || Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);

        ctx.shadowBlur = 20;
        ctx.shadowColor = ColorScheme.getTextColor();
        
        ctx.fillStyle = ColorScheme.getTextColor();
        ctx.beginPath();
        ctx.moveTo(0, -player.size / 2);
        ctx.lineTo(-player.size / 2, player.size / 2);
        ctx.lineTo(player.size / 2, player.size / 2);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        
        ctx.restore();
    }
}

function drawPolygon(x, y, radius, sides, color) {
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

function drawLives() {
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.textAlign = "left";
    ctx.fillText(`Lives: ${lives}`, 10, 90);
}

function drawScore() {
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60);
}

function drawTopPlayers() {
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

function drawBossCounters() {
    ctx.font = '12px "Press Start 2P"';
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.textAlign = 'right';
    
    const bottomPadding = 10;
    const rightPadding = 10;
    
    ctx.fillText(`Stage 1 Bosses: ${miniBossesDestroyed}`, 
        canvas.width - rightPadding, 
        canvas.height - bottomPadding - 20);
    
    ctx.fillText(`Stage 2 Bosses: ${bigBossesDestroyed}`, 
        canvas.width - rightPadding, 
        canvas.height - bottomPadding);
}

function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;
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
    //console.log("Current enemy count:", enemies.length);
    if (enemies.length >= MAX_ENEMIES) {
        //console.log("Maximum enemies reached, not spawning new enemy");
        return; // Don't spawn if we've reached the maximum
    }

    if (!bigBoss && Math.random() < ENEMY_SPAWN_CHANCE) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        const colors = ['#0f0', '#ff0', '#f0f', '#0ff'];
        enemies.push({
            x: x,
            y: y,
            size: 20,
            sides: Math.floor(Math.random() * 3) + 3,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            color: colors[Math.floor(Math.random() * colors.length)]
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
            color: explosionColor
        });
    }
}

function createPlayerExplosion() {
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

function checkCollisions() {
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

        // Check collisions with mini-bosses
        for (let i = miniBosses.length - 1; i >= 0; i--) {
            const miniBoss = miniBosses[i];
            if (!playerInvulnerable) {
                const playerDx = miniBoss.x - player.x;
                const playerDy = miniBoss.y - player.y;
                const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
                if (playerDistance < miniBoss.size / 2 + player.size / 2) {
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
                            createNeonPurpleExplosion(proj.x, proj.y);
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
                createNeonPurpleExplosion(proj.x, proj.y);
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

// Add this helper function for line-circle intersection
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
}

function updateTopPlayers() {
    //console.log("Updating top players. Current score:", score, "Player name:", player.name);
    if (!player.name) {
        //console.log("Player name is undefined, skipping update");
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
    //console.log("Updated top players:", topPlayers);
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
    //console.log("Game paused state toggled. isPaused:", isPaused);
    if (isPaused) {
        showMenu();
    } else {
        resumeGame();
    }
    updateContinueButton();
}

function startGameLoop() {
    //console.log("Starting game loop...");
    isGameRunning = true;
    isPaused = false;
    lastFireTime = 0;
    //console.log("Game started. isPaused:", isPaused);
    gameLoop();
    updateContinueButton();
}

function checkExtraLife() {
    if (score - lastExtraLife >= 1000) {
        lives++;
        lastExtraLife = score;
    }
}

let lastFireTime = 0;
const fireInterval = 200;

function gameLoop(currentTime) {
    if (!isGameRunning || isPaused) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        return;
    }

    //console.log("Game loop iteration started");
    if (!isPaused) {
        //console.log("Game is not paused, executing game logic");
        try {
            //console.log("Clearing canvas");
            ctx.fillStyle = ColorScheme.getBackgroundColor();
            ctx.fillRect(0, 0, canvas.width, canvas.height);
                
            //console.log("Moving game objects");
            if (typeof movePlayer === 'function') movePlayer();
            if (typeof moveBullets === 'function') moveBullets();
            if (typeof moveEnemies === 'function') moveEnemies();
            if (typeof moveMiniBosses === 'function') moveMiniBosses();
            if (typeof moveParticles === 'function') moveParticles();
            if (typeof moveBigBoss === 'function') moveBigBoss();
            if (typeof moveBigBossProjectiles === 'function') moveBigBossProjectiles();
                
            //console.log("Spawning entities");
            if (typeof spawnEnemy === 'function') spawnEnemy();
            if (typeof spawnMiniBoss === 'function') spawnMiniBoss();
                
            //console.log("Checking collisions");
            if (typeof checkCollisions === 'function') checkCollisions();
            if (typeof checkMiniBossCollisions === 'function') checkMiniBossCollisions();
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
            if (typeof drawMiniBosses === 'function') drawMiniBosses();
            if (typeof drawBigBoss === 'function') drawBigBoss();
            if (typeof drawBigBossProjectiles === 'function') drawBigBossProjectiles();
            if (typeof drawPowerups === 'function') drawPowerups();
            if (typeof drawParticles === 'function') drawParticles();
            drawScore();
            drawLives();
            if (typeof drawTopPlayers === 'function') drawTopPlayers();
            drawBossCounters();

            //console.log("Current miniBossesDefeated:", miniBossesDefeated);
            //console.log("Big boss exists:", !!bigBoss);
            //console.log("Current score:", score);

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

function checkBigBossSpawn() {
    //console.log("Checking big boss spawn conditions:");
    //console.log("miniBossesDefeated:", miniBossesDefeated);
    //console.log("bigBoss exists:", !!bigBoss);
    if (!bigBoss && miniBossesDefeated >= 4) {
        //console.log("Conditions met for big boss spawn");
        spawnBigBoss();
    } else {
        //console.log("Conditions not met for big boss spawn");
    }
}

const keys = {};

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

function updatePlayerVelocity() {
    player.dx = (keys['arrowright'] || keys['d'] ? player.speed : 0) - (keys['arrowleft'] || keys['a'] ? player.speed : 0);
    player.dy = (keys['arrowdown'] || keys['s'] ? player.speed : 0) - (keys['arrowup'] || keys['w'] ? player.speed : 0);
}

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    player.angle = Math.atan2(mouseY - player.y, mouseX - player.x) + Math.PI / 2;
});

window.addEventListener('error', function(e) {
    console.error("Global error:", e.error);
    console.error("Error message:", e.message);
    console.error("Error filename:", e.filename);
    console.error("Error line number:", e.lineno);
    console.error("Error column number:", e.colno);
    console.error("Error details:", e);
    alert("An error occurred. Please check the console for details.");
});

//console.log("Script loaded. BIG_BOSS_SPAWN_INTERVAL:", BIG_BOSS_SPAWN_INTERVAL);

// Add these global variables if they're not already present
let pausedPowerups = [];
let powerupsPausedTime = 0;

// Define the pausePowerups function
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
    // Adjust remaining time for powerups on the field
    powerups.forEach(powerup => {
        powerup.spawnTime += pauseDuration;
    });
}

function spawnBigBoss() {
    //console.log("spawnBigBoss function called. miniBossesDefeated:", miniBossesDefeated);
    if (!bigBoss && miniBossesDefeated >= 5) {
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
            color: '#FFD700',
            shakeTime: 0,
            launchCooldown: 300,
            defeated: false,
            projectiles: []
        };
        //console.log("Big boss spawned:", bigBoss);
        
        // Clear all enemies and mini-bosses
        enemies = [];
        miniBosses = [];
        
        // Pause active powerups and clear field powerups
        pausePowerups();
        clearFieldPowerups();
    } else {
        //console.log("Not spawning big boss. Current conditions: bigBoss exists:", !!bigBoss, "miniBossesDefeated:", miniBossesDefeated);
    }
}


function moveBigBoss() {
    if (bigBoss && !bigBoss.defeated) {
        bigBoss.orbitAngle += bigBoss.orbitSpeed;
        bigBoss.x = player.x + Math.cos(bigBoss.orbitAngle) * bigBoss.orbitRadius;
        bigBoss.y = player.y + Math.sin(bigBoss.orbitAngle) * bigBoss.orbitRadius;
        bigBoss.angle += bigBoss.rotationSpeed;

        // Launch projectiles only if not defeated
        if (bigBoss.launchCooldown <= 0) {
            launchBigBossProjectile();
            bigBoss.launchCooldown = 300;
        } else {
            bigBoss.launchCooldown--;
        }
    }

    // Move projectiles regardless of boss state
    if (bigBoss) {
        const currentTime = Date.now();
        bigBoss.projectiles.forEach(proj => {
            const angle = Math.atan2(player.y - proj.y, player.x - proj.x);
            proj.x += Math.cos(angle) * proj.speed;
            proj.y += Math.sin(angle) * proj.speed;
            proj.angle = angle;

            // Update invulnerability
            if (currentTime - proj.spawnTime > proj.invulnerableTime) {
                proj.invulnerable = false;
            }
        });
    }
}

function launchBigBossProjectile() {
    const angle = Math.atan2(player.y - bigBoss.y, player.x - bigBoss.x);
    bigBoss.projectiles.push({
        x: bigBoss.x,
        y: bigBoss.y,
        size: 30,
        angle: angle,
        speed: 2, // Increased speed from 1 to 2
        health: 5,
        color: getRandomNeonColor(),
        invulnerableTime: 5000, // 5 seconds of invulnerability
        spawnTime: Date.now() // Record spawn time
    });
}

function getRandomNeonColor() {
    const neonColors = ['#FF00FF', '#00FFFF', '#FF00FF', '#FFFF00', '#00FF00'];
    return neonColors[Math.floor(Math.random() * neonColors.length)];
}


function drawBigBoss() {
    if (bigBoss) {
        ctx.save();
        ctx.translate(bigBoss.x, bigBoss.y);
        ctx.rotate(bigBoss.angle);

        // Draw the golden glow
        ctx.shadowColor = 'gold';
        ctx.shadowBlur = 30;

        // Draw the star
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

        // Draw health bar only if not defeated
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

        // Draw projectiles
        const currentTime = Date.now();
        bigBoss.projectiles.forEach(proj => {
            ctx.save();
            ctx.translate(proj.x, proj.y);
            ctx.rotate(proj.angle);

            // Change color based on invulnerability
            if (currentTime - proj.spawnTime <= proj.invulnerableTime) {
                ctx.strokeStyle = ColorScheme.getTextColor(); // White, semi-transparent for invulnerable state
            } else {
                ctx.strokeStyle = proj.color;
            }

            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, -proj.size / 2);
            ctx.lineTo(-proj.size / 2, proj.size / 2);
            ctx.lineTo(proj.size / 2, proj.size / 2);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        });
    }
}

function createNeonPurpleExplosion(x, y) {
    const explosionColor = ColorScheme.current === 'light' ? 'rgba(128, 0, 128, 0.8)' : 'rgba(255, 0, 255, 0.8)';
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 5 + 2,
            color: explosionColor,
            speedX: Math.random() * 8 - 4,
            speedY: Math.random() * 8 - 4,
            life: 60
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
}

function showGameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (ColorScheme.current === 'dark' || ColorScheme.current === 'colorblind') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '48px "Press Start 2P", cursive';
    
    const centerY = canvas.height / 2;
    
    ctx.shadowColor = ColorScheme.getTextColor();
    ctx.shadowBlur = 10;
    
    ctx.fillStyle = ColorScheme.getTextColor();
    ctx.fillText('GAME OVER', canvas.width / 2, centerY - 40);
    
    ctx.font = '24px "Press Start 2P", cursive';
    
    ctx.fillText('Press SPACE to continue', canvas.width / 2, centerY + 40);
    
    ctx.shadowBlur = 0;
    
    window.addEventListener('keydown', handleGameOverKeyPress);
}

function handleGameOverKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault(); 
        window.removeEventListener('keydown', handleGameOverKeyPress);
        startNewGame();
    }
}

function startNewGame() {
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

function resetGame() {
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
    miniBosses = [];
    powerups = [];
    currentPowerup = null;
    powerupEndTime = 0;
    bigBoss = null;
    miniBossesDefeated = 0;
    projectilesDestroyed = 0;
    miniBossesDestroyed = 0;
    bigBossesDestroyed = 0;
    lastFireTime = 0;
}

function resetAfterBigBoss() {
    //console.log("Resetting game state after big boss defeat");
    miniBossesDefeated = 0;
    resumePowerups();
    spawnEnemies(15);
    spawnMiniBoss(); 
}

function spawnEnemies(count) {
    const spawnCount = Math.min(count, MAX_ENEMIES - enemies.length);
    //console.log(`Spawning ${spawnCount} enemies`);
    for (let i = 0; i < spawnCount; i++) {
        spawnEnemy();
    }
}

function drawTopPlayers() {
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

function initializeTopPlayers() {
    topPlayers = JSON.parse(localStorage.getItem('topPlayers')) || [];
    //console.log("Initialized top players:", topPlayers);
}

initializeTopPlayers();



