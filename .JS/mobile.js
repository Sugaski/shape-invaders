function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function resizeCanvasForMobile() {
    if (isMobile()) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.66; // 66% of screen height
        // Adjust game elements based on new canvas size if needed
    }
}

function createMobileControls() {
    const mobileControls = document.createElement('div');
    mobileControls.id = 'mobileControls';
    document.body.appendChild(mobileControls);

    const moveStick = document.createElement('div');
    moveStick.id = 'moveStick';
    mobileControls.appendChild(moveStick);

    const moveStickKnob = document.createElement('div');
    moveStickKnob.id = 'moveStickKnob';
    moveStick.appendChild(moveStickKnob);

    updateMobileControlsColor();
}

function setupMobileControls() {
    const moveStick = document.getElementById('moveStick');

    moveStick.addEventListener('touchstart', handleMoveStickTouch);
    moveStick.addEventListener('touchmove', handleMoveStickMove);
    moveStick.addEventListener('touchend', handleMoveStickRelease);
}

function handleMoveStickTouch(e) {
    e.preventDefault();
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
    player.angle = angle; // Update the angle for mobile mode

    console.log('Joystick update:', { 
        angle, 
        distance, 
        speed, 
        dx: player.dx, 
        dy: player.dy,
        playerAngle: player.angle
    });
}

function handleMoveStickRelease() {
    const stickKnob = document.getElementById('moveStickKnob');
    stickKnob.style.transform = 'translate(0, 0)';
    player.dx = 0;
    player.dy = 0;
    console.log('Joystick released, player velocity reset');
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

function updatePlayerMovement() {
    const moveStick = document.getElementById('moveStick');
    const moveStickKnob = document.getElementById('moveStickKnob');
    const { angle, distance } = updateStickPosition(event.touches[0], moveStick, moveStickKnob);
    
    const speed = (distance / (moveStick.offsetWidth / 2)) * player.speed;
    player.dx = Math.cos(angle) * speed;
    player.dy = Math.sin(angle) * speed;
}

function updatePlayerAim() {
    const aimStick = document.getElementById('aimStick');
    const aimStickKnob = document.getElementById('aimStickKnob');
    const { angle } = updateStickPosition(event.touches[0], aimStick, aimStickKnob);
    
    player.angle = angle;
}

function updateMobileControlsColor() {
    if (isMobile()) {
        const textColor = ColorScheme.getTextColor();
        const backgroundColor = ColorScheme.getBackgroundColor();
        const moveStick = document.getElementById('moveStick');
        const aimStick = document.getElementById('aimStick');
        const moveStickKnob = document.getElementById('moveStickKnob');
        const aimStickKnob = document.getElementById('aimStickKnob');

        if (moveStick && aimStick && moveStickKnob && aimStickKnob) {
            moveStick.style.borderColor = textColor;
            aimStick.style.borderColor = textColor;
            moveStickKnob.style.backgroundColor = textColor;
            aimStickKnob.style.backgroundColor = textColor;

            document.body.style.backgroundColor = backgroundColor;
        }
    }
}