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
    destroyStageOneBoss,
    drawBigBoss,
    moveBigBoss,
    checkBigBossSpawn,
    resetAfterBigBoss
} from './JS/enemies.js';

// Import functions from mobile.js
import {
    isMobile,
    resizeCanvasForMobile,
    createMobileControls,
    setupMobileControls,
    updateMobileControlsColor
} from './JS/mobile.js';

// Import functions from globals.js
import {
    updateColors,
    fireInterval,
    updatePlayerAngle,
    movePlayer,
    moveBullets,
    lastMousePosition,
    checkCollisions,
    checkPowerupCollisions,
    updatePowerup,
    updatePowerups,
    updateHoningMissiles,
    fireBullet,
    drawPlayer,
    drawBullets,
    drawPowerups,
    drawParticles,
    drawScore,
    drawLives,
    drawTopPlayers,
    drawBossCounters,
    createGoldenExplosion,
    updateTopPlayers,
    updateCustomCursor,
    canvas,
    ctx,
    bigBoss,
    score,
    lives,
    ColorScheme,
    player,
    enemies,
    stageOneBosses,
    bigBossesDestroyed,
    isGameRunning,
    isPaused,
    lastFireTime,
} from './JS/globals.js';

export function gameLoop(currentTime) {
    if (!isGameRunning || isPaused) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        return;
    }

    if (!isPaused) {
        updateColors();
        updatePlayerAngle(lastMousePosition.x, lastMousePosition.y);
        try {
            ctx.fillStyle = ColorScheme.getBackgroundColor();
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            updateCustomCursor(lastMousePosition);    

            // Wrap each operation in a try-catch block to identify the problematic line
            try {
                if (typeof movePlayer === 'function') movePlayer(currentTime);
            } catch (error) {
                console.error("Error in movePlayer:", error);
            }

            try {
                if (typeof moveBullets === 'function') moveBullets();
            } catch (error) {
                console.error("Error in moveBullets:", error);
            }

            try {
                if (typeof moveEnemies === 'function') moveEnemies();
            } catch (error) {
                console.error("Error in moveEnemies:", error);
            }

            if (typeof moveStageOneBosses === 'function') moveStageOneBosses();
            if (typeof moveParticles === 'function') moveParticles();
            if (typeof moveBigBoss === 'function') moveBigBoss();
                
            //console.log("Spawning entities");
            if (typeof spawnEnemy === 'function') spawnEnemy();
            if (typeof spawnStageOneBoss === 'function') spawnStageOneBoss();
                
            //console.log("Checking collisions");
            if (typeof checkCollisions === 'function') checkCollisions();
            if (typeof checkStageOneBossCollisions === 'function') checkStageOneBossCollisions();
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
            drawPlayer();
            drawEnemies();
            drawBullets();
            drawStageOneBosses();
            if (bigBoss) {
                drawBigBoss();  // This will also draw the big boss projectiles
            }
            drawPowerups();
            drawParticles();
            drawScore();
            drawLives();
            if (typeof drawTopPlayers === 'function') drawTopPlayers();
            drawBossCounters();
            if (typeof checkBigBossSpawn === 'function') checkBigBossSpawn();

            if (bigBoss) {
                //console.log("Updating big boss");
                try {
                    moveBigBoss();
                    drawBigBoss();
                } catch (error) {
                    console.error("Error in bigBoss operations:", error);
                }

                if (bigBoss.health <= 0 && !bigBoss.defeated) {
                    bigBoss.defeated = true;
                    bigBoss.shakeTime = 300;
                    //console.log("Big boss defeated, starting shake animation");
                }

                if (bigBoss.defeated) {
                    try {
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
                            bigBossesDestroyed++; // This line (167) is likely causing the error
                            updateTopPlayers();
                            bigBoss = null;
                            resetAfterBigBoss();
                            //console.log("Big boss exploded and removed. Total big bosses destroyed:", bigBossesDestroyed);
                        }
                    } catch (error) {
                        console.error("Error in bigBoss defeat handling:", error);
                    }
                }
            }

            try {
                if (score > 0 && score % 10 === 0) {
                    updateTopPlayers();
                }
                updateTopPlayers();    
                drawTopPlayers();
            } catch (error) {
                console.error("Error in updateTopPlayers or drawTopPlayers:", error);
            }

        } catch (error) {
            console.error("Detailed error in game loop:", error);
            console.error("Error stack:", error.stack);
            isGameRunning = false;
        }
    } else {
        //console.log("Game is paused, skipping game logic");
    }

    //console.log("Requesting next animation frame");
    animationFrameId = requestAnimationFrame(gameLoop);
}