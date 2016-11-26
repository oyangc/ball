

var lastKeyListenerTime = 0;  // For throttling arrow keys
game.addKeyListener({
        key: 'k',
        listener: function () {
            //if ( !launching && !gameOver) {
                rightFlipperRiseTimer.start();
                rightFlipperAngle = 0;
                //game.playSound('flipper');
            //}
        }
    });
game.addKeyListener({
        key: 'd',
        listener: function () {
            //if ( !launching && !gameOver) {
                leftFlipperRiseTimer.start();
                leftFlipperAngle = 0;
                //game.playSound('flipper');
            //}
        }
    });
game.addKeyListener({
        key: 'p',
        listener: function () {
            //togglePaused();
			//if ( !launching && !gameOver) {
                qualitycontrolRiseTimer.start();
				qualitycontrolAngle = 0;
                //game.playSound('flipper');
            //}
        }
    });
game.addKeyListener({
        key: 'up arrow',
        listener: function () {
            var now;

            if (!launching || launchStep === 1)
                return;

            now = +new Date();
            if (now - lastKeyListenerTime > 80) { // throttle
                lastKeyListenerTime = now;
                launchStep--;
                actuatorSprite.painter.image = launchImages[launchStep-1];
                ballSprite.top = BALL_LAUNCH_TOP + (launchStep-1) * 9;
                adjustActuatorPlatformShape();
            }
        }
    });
game.addKeyListener({
        key: 'down arrow',
        listener: function () {
            var now;

            if (!launching || launchStep === LAUNCH_STEPS)
                return;

            now = +new Date();
            if (now - lastKeyListenerTime > 80) { // throttle
                lastKeyListenerTime = now;
                launchStep++;
                actuatorSprite.painter.image = launchImages[launchStep-1];
                ballSprite.top = BALL_LAUNCH_TOP + (launchStep-1) * 9;
                adjustActuatorPlatformShape();
            }
        }
    });
game.addKeyListener({
        key: 'right arrow',
        listener: function () {
            var now = +new Date();
            if (now - lastKeyListenerTime > 200) { // throttle
                lastKeyListenerTime = now;
            }
        }
    });
game.addKeyListener({
        key: 'left arrow',
        listener: function () {
            var now = +new Date();
            if (now - lastKeyListenerTime > 200) { // throttle
                lastKeyListenerTime = now;
            }
        }
    });

