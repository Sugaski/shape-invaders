// Import functions from enemies.js
import {
    spawnEnemy,
    moveEnemies,
    spawnEnemies,
    drawEnemies,
    drawPolygon,
    drawStageOneBosses,
    moveStageOneBosses,
    checkStageOneBossCollisions,
    spawnStageOneBoss,
    destroyStageOneBoss
} from './.JS/enemies.js';

// Import functions from mobile.js
import {
    isMobile,
    resizeCanvasForMobile,
    createMobileControls,
    setupMobileControls,
    updateMobileControlsColor
} from './.JS/mobile.js';

// Import functions from globals.js
import {
    updateColors,
    updatePlayerAngle,
    movePlayer,
    moveBullets,
    moveParticles,
    moveBigBoss,
    moveBigBossProjectiles,
    checkCollisions,
    checkBigBossProjectileCollisions,
    checkBigBossCollisions,
    checkPowerupCollisions,
    updatePowerup,
    updatePowerups,
    updateHoningMissiles,
    fireBullet,
    drawPlayer,
    drawBullets,
    drawBigBoss,
    drawBigBossProjectiles,
    drawPowerups,
    drawParticles,
    drawScore,
    drawLives,
    drawTopPlayers,
    drawBossCounters,
    checkBigBossSpawn,
    createGoldenExplosion,
    resetAfterBigBoss,
    updateTopPlayers,
    loseLife,
    gameOver
} from './.JS/globals.js';

function gameLoop(currentTime) {
    if (!isGameRunning || isPaused) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        return;
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
            drawScore();
            drawLives();
            if (typeof drawTopPlayers === 'function') drawTopPlayers();
            drawBossCounters();
            checkBigBossSpawn();

            if (bigBoss) {
                //console.log("Updating big boss");
                moveBigBoss();
                drawBigBoss();

                if (bigBoss.health <= 0 && !bigBoss.defeated) {
                    bigBoss.defeated = true;
                    bigBoss.shakeTime = 300;
                    //console.log("Big boss defeated, starting shake animation");
                }

                if (bigBoss.defeated) {
                    if (bigBoss.shakeTime > 0) {
                        bigBoss.shakeTime--;
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

            if (score > 0 && score % 10 === 0) {
                updateTopPlayers();
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