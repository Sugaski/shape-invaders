import { enemies, MAX_ENEMIES, canvas, ColorScheme, bigBoss, currentEnemySpawnChance, stageOneBosses, score, } from './globals.js';

//--------------------------------------- Enemies Logic ----------------------------------------

export function spawnEnemies(count) {
    const spawnCount = Math.min(count, MAX_ENEMIES - enemies.length);
    //console.log(`Spawning ${spawnCount} enemies`);
    for (let i = 0; i < spawnCount; i++) {
        spawnEnemy();
    }
}

export function spawnEnemy() {
    //console.log("Current enemy count:", enemies.length);
    if (enemies.length >= MAX_ENEMIES) {
        //console.log("Maximum enemies reached, not spawning new enemy");
        return; // Don't spawn if we've reached the maximum
    }

    if (!bigBoss && Math.random() < currentEnemySpawnChance) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        enemies.push({
            x: x,
            y: y,
            size: 25,
            sides: Math.floor(Math.random() * 3) + 3,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            color: ColorScheme.getRandomColor()
        });
    }
}

export function moveEnemies() {
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

export function drawEnemies() {
    enemies.forEach(enemy => {
        drawPolygon(enemy.x, enemy.y, enemy.size / 2, enemy.sides, enemy.color);
    });
}

export function drawPolygon(x, y, radius, sides, color) {
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

//------------------------------------ Stage One Boss Logic ------------------------------------

export function drawStageOneBosses() {
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

        ctx.shadowBlur = 0;

        ctx.fillStyle = ColorScheme.getTextColor();
        ctx.fillRect(boss.x - boss.size / 2, boss.y - boss.size / 2 - 10, (boss.size * boss.health) / 3, 5);
    });
}

export function moveStageOneBosses() {
    stageOneBosses.forEach(boss => {
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

export function checkStageOneBossCollisions() {
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

export function spawnStageOneBoss() {
    if (!bigBoss && score > 0 && score % STAGE_ONE_BOSS_SPAWN_INTERVAL === 0 && stageOneBosses.length === 0) {
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

        stageOneBosses.push({
            x: x,
            y: y,
            size: 60,
            health: 3,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            color: ColorScheme.getRandomColor()
        });
        //console.log("Stage-one boss spawned. Total mini-bosses:", stageOneBosses.length);
    }
}

export function destroyStageOneBoss(index) {
    stageOneBosses.splice(index, 1);
    stageOneBossesDestroyed++;
    stageOneBossesDefeated++;
    score += 50;
    
    // Increase spawn rate
    currentEnemySpawnChance *= 1.2; // Increase by 20% each time
    currentEnemySpawnChance = Math.min(currentEnemySpawnChance, 0.1); // Cap at 10% chance per frame
    
    //console.log("Stage-one boss destroyed. Total destroyed:", stageOneBossesDestroyed);
    //console.log("Stage-one bosses defeated:", stageOneBossesDefeated);
    //console.log("New enemy spawn chance:", currentEnemySpawnChance);
    
    // When incrementing stageOneBossesDefeated
    setStageOneBossesDefeated(stageOneBossesDefeated + 1);
}

//------------------------------------ Stage Two Boss Logic ------------------------------------

export function checkBigBossSpawn() {
    if (!bigBoss && stageOneBossesDefeated >= 3) {
        spawnBigBoss();
    }
}

export function drawBigBoss() {
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

export function moveBigBoss() {
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

        // Check if big boss health has reached 0
        if (bigBoss.health <= 0) {
            bigBoss.defeated = true;
            bigBoss.shakeTime = 300; // 5 seconds at 60 FPS
            bigBoss.projectiles = []; // Clear all projectiles
            //console.log("Big boss defeated, projectiles cleared");
        }
    }

    // Move projectiles only if big boss is not defeated
    if (bigBoss && !bigBoss.defeated) {
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

export function spawnBigBoss() {
    //console.log("spawnBigBoss function called. stageOneBossesDefeated:", stageOneBossesDefeated);
    if (!bigBoss && stageOneBossesDefeated >= 5) {
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
        
        // Clear all enemies and stage-one bosses
    enemies = [];
    stageOneBosses = [];
        
        // Pause active powerups and clear field powerups
        pausePowerups();
        clearFieldPowerups();
    } else {
        //console.log("Not spawning big boss. Current conditions: bigBoss exists:", !!bigBoss, "stageOneBossesDefeated:", stageOneBossesDefeated);
    }
}

export function launchBigBossProjectile() {
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

export function resetAfterBigBoss() {
    //console.log("Resetting game state after big boss defeat");
    stageOneBossesDefeated = 0;
    currentEnemySpawnChance = INITIAL_ENEMY_SPAWN_CHANCE;
    resumePowerups();
    spawnEnemies(15);
    spawnStageOneBoss(); 
}