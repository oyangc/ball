var game = new Game('ball', 'canvas'),
applyGravityAndFriction = false;
var backgroudImg = 'images/background.jpg';
var ballImg = 'images/ball.png';
var actorImg = 'images/actor.jpg';
var qualitycontrolImg = 'images/qualitycontrol1.png';
var leftFlipperImg = 'images/reversebar2.png';
var rightFlipperImg = 'images/reversebar3.png';
var devlop = false;//true dev  false
var update2 = true; //flipper size
// .............................................
var radius1;
var radius2;
var radius3;
var radius4;
var showBumper1;
var showBumper2;
var showBumper3;
var showBumper4;
var tmpvector = new Vector(0, 0);// per flame length x,y
var tmpdist;//flame distance
var locationx,locationy;
var startValue;
// Cursor readout.............................................
readoutToast = document.getElementById('readoutToast'),
// Flippers...................................................
LEFT_FLIPPER = 1,
RIGHT_FLIPPER = 2,
leftFlipperAngle = 0,
rightFlipperAngle = 0,
qualitycontrolAngle = 0,
qualitycontroltype = 0,
MAX_FLIPPER_ANGLE = Math.PI * 70 / 180,
MAX_FLIPPER2_ANGLE = Math.PI * 70 / 180,
FLIPPER_BOTTOM = 565,
FLIPPER_RISE_DURATION = 25,
FLIPPER_FALL_DURATION = 175,
FLIPPER2_RISE_DURATION = 50,
FLIPPER2_FALL_DURATION = 50,
FLIPPERRATIO = 3,
QUALITYCONTROLRATIO = 0.95,
leftFlipperRiseTimer = new AnimationTimer(FLIPPER_RISE_DURATION, AnimationTimer.makeEaseOut(3)),
leftFlipperFallTimer = new AnimationTimer(FLIPPER_FALL_DURATION, AnimationTimer.makeEaseIn(3)),
rightFlipperRiseTimer = new AnimationTimer(FLIPPER_RISE_DURATION, AnimationTimer.makeEaseOut(3)),
rightFlipperFallTimer = new AnimationTimer(FLIPPER_FALL_DURATION, AnimationTimer.makeEaseIn(3)),
qualitycontrolRiseTimer = new AnimationTimer(FLIPPER2_RISE_DURATION, AnimationTimer.makeEaseOut(3)),
qualitycontrolFallTimer = new AnimationTimer(FLIPPER2_FALL_DURATION, AnimationTimer.makeEaseIn(3)),
// Actuator...................................................
ACTUATOR_LEFT = 376,
ACTUATOR_RIGHT = 402,
ACTUATOR_TOP = 340,
ACTUATOR_PLATFORM_WIDTH = 20,
ACTUATOR_PLATFORM_HEIGHT = 20,
// Ball.......................................................
BALL_X=389.5,BALL_Y=330,BALL_RADIUS=9, 
BALL_LAUNCH_LEFT = BALL_X-BALL_RADIUS,
BALL_LAUNCH_TOP = BALL_Y-BALL_RADIUS,
MAX_BALL_VELOCITY = 400,
MAX_BALL_VELOCITY2 = 800,
MIN_BALL_VELOCITY = 3,
MIN_BALL_VELOCITY_OFF_FLIPPERS = 75,
GAME_HEIGHT_IN_METERS = 2,
LAUNCH_COEFFICIENT = 10,
GRAVITY = 9.8; // m/s/s
actorHeight = 0;
lastBallPosition = new Point(),
lastBallPositionTMP = new Point(),
ballOutOfPlay = false,
ballrunning = false,
alreadyapron = false,

locus = [new Point(BALL_X, BALL_Y)];
prepareForLaunch = function () {
  lastBallPosition.x = ballSprite.x = BALL_X;
  lastBallPosition.y = ballSprite.y = BALL_Y;
  ballSprite.radius = BALL_RADIUS;
  ballSprite.velocityX = 0;
  ballSprite.velocityY = 0;
  applyGravityAndFriction = false;
  launching = true;
  ballrunning = false;
  qualitycontroltype = 0;
},
applyFrictionAndGravity = function (time) {
  var lastElapsedTime = time / 1000,
  metersPerSecond = GRAVITY * lastElapsedTime * 0.1;
  if (Math.abs(ballSprite.velocityX) > MIN_BALL_VELOCITY) {
    ballSprite.velocityX *= Math.pow(0.5, lastElapsedTime);
  }
  if (Math.abs(ballSprite.velocityY) > MIN_BALL_VELOCITY) {
    ballSprite.velocityY *= Math.pow(0.5, lastElapsedTime);
  }
  ballSprite.velocityY += metersPerSecond * parseFloat(game.context.canvas.height / GAME_HEIGHT_IN_METERS);
},
ballMover = {
  execute: function (sprite, context, time) {
    if (!game.paused && !loading) {
      lastBallPositionTMP.x = lastBallPosition.x;
      lastBallPositionTMP.y = lastBallPosition.y;
      lastBallPosition.x = sprite.x;
      lastBallPosition.y = sprite.y;
      if (!launching && sprite.x-sprite.radius < ACTUATOR_LEFT && (sprite.y+sprite.radius > FLIPPER_BOTTOM || sprite.y-sprite.radius < 0)) {
        ballOutOfPlay = true;
	  }
	if(ballrunning) {
		  showAllBumper();
		  tmpvector.x = game.pixelsPerFrame(time, sprite.velocityX);
		  tmpvector.y = game.pixelsPerFrame(time, sprite.velocityY);
	  	//sprite.x += tmpvector.x;
		//sprite.y += tmpvector.y;
		  moveSprite(time, lastBallPositionTMP, sprite, tmpvector);
		  if(!(locus[locus.length-1].x==sprite.x && locus[locus.length-1].y==sprite.y)) {
			locus.push(new Point(sprite.x, sprite.y));
		    //console.log(sprite.x+","+ sprite.y+"|"+sprite.velocityX+","+sprite.velocityY);
		  } 
	  }
    }
  },
},

ballSprite = new Sprite("ball", new CirclePainter(BALL_X,BALL_Y,BALL_RADIUS), [ballMover]), 
//ballShape = new Circle(BALL_X,BALL_Y,BALL_RADIUS),
ballShape = new CircleSpriteShape(ballSprite, BALL_X, BALL_Y, BALL_RADIUS),

// Launching..................................................
launching = false,
// Loading....................................................
loading = false, // not yet, see the end of this file
loadingToast = document.getElementById('loadingToast'),
loadingToastTitle = document.getElementById('loadingToastTitle'),
loadMessage = document.getElementById('loadMessage'),
progressDiv = document.getElementById('progressDiv'),
progressbar = new COREHTML5.Progressbar(300, 23, 'rgba(0,0,0,0.5)', 100, 130, 250),
// NewGame......................................................
newGameButton = document.getElementById('newGameButton'),
// Paused.....................................................
pausedToast = document.getElementById('pausedToast'),
// Game Over..................................................
gameOverToast = document.getElementById('gameOverToast'),
gameOver = false,
// Collision Detection........................................
saveLocusShape = new Polygon(),


shapes = [
],
flipperCollisionDetected = false,
leftFlipperShape = new Polygon(),
leftFlipperBaselineShape = new Polygon(),
rightFlipperShape = new Polygon(),
rightFlipperBaselineShape = new Polygon(),
actuatorPlatformShape = new Polygon(),
leftBoundary = new Polygon(),
rightBoundary = new Polygon();

nonessential1 = new Polygon();
nonessential2 = new Polygon();
nonessential3 = new Polygon();
nonessential4 = new Polygon();

bouncingspring1 = new Polygon();
bouncingspring2 = new Polygon();
bouncingspring3 = new Polygon();
bouncingspring4 = new Polygon();

var directiontunnel1 = new Circle(144, 148, 13);
var directiontunnel10 = new Circle(102, 252, 13);
var directiontunnel2 = new Circle(250, 148, 13);
var directiontunnel20 = new Circle(291, 252, 13);
var directiontunnel3 = new Circle(122, 345, 9);
var directiontunnel30 = new Circle(161, 403, 9);
var directiontunnel4 = new Circle(264, 336, 9);
var directiontunnel40 = new Circle(224, 394, 9);

sponge = new Polygon();
qualitycontrol = new Polygon();

middlecenter = new Polygon();
ballLeftRect = new Polygon();
middlemiddle = new Polygon();
middlemiddle2 = new Polygon();
middlebottom1 = new Polygon();
middlebottom2 = new Polygon();
middlebottom3 = new Polygon();
middlebottom4 = new Polygon();
middlebottom5 = new Polygon();
middlebottom6 = new Polygon();
middlebottom7 = new Polygon();
middlebottom8 = new Polygon();

var irreversibletunnel1 = new Polygon();//new Circle(215, 436, 11);
var irreversibletunnel2 = new Polygon();//new Circle(177, 436, 11);
//
function pusharrays(obj, points) {
  for (var i = 0; i < points.length; i++) {
    obj.push(points[i]);
  }
}
pusharrays(saveLocusShape.points, [new Point(527, 551),new Point(527, 582),new Point(582, 582),new Point(582, 551)]);
// Start game.................................................
var vl3 = new Point(73, 503);
var vr3 = new Point(311, 500);
pusharrays(leftBoundary.points, [new Point(30, 154),new Point(30, 500),new Point(4, 500),new Point(4, 154)]);
pusharrays(rightBoundary.points, [new Point(428, 500), new Point(428, 154),new Point(402, 154),new Point(402, 500)]);
pusharrays(leftFlipperShape.points, [new Point(29, 450),new Point(73, 503),new Point(71, 506),new Point(29, 476)]);
pusharrays(rightFlipperShape.points, [new Point(360, 451),new Point(311, 500),new Point(313, 504),new Point(360, 476)]);
pusharrays(leftFlipperBaselineShape.points, [new Point(29, 450),new Point(73, 503),new Point(71, 506),new Point(29, 476)]);
pusharrays(rightFlipperBaselineShape.points, [new Point(360, 451),new Point(311, 500),new Point(313, 504),new Point(360, 476)]);
var c1 = new Circle(31, 176, 18);
var c2 = new Circle(31, 224, 18);
var c3 = new Circle(31, 273, 18);
var c4 = new Circle(369, 241, 8);
var c5 = new Circle(360, 270, 18);
pusharrays(irreversibletunnel2.points, [new Point(203, 439),new Point(218, 439),new Point(222, 429),new Point(205, 430)]);
pusharrays(irreversibletunnel1.points, [new Point(186, 439),new Point(171, 439),new Point(167, 429),new Point(184, 430)]);

pusharrays(nonessential1.points, [new Point(28, 359),new Point(38, 359),new Point(38, 314),new Point(28, 314)]);
pusharrays(nonessential2.points, [new Point(48, 127),new Point(82, 97),new Point(52, 62),new Point(17, 99)]);
pusharrays(nonessential3.points, [new Point(305, 87),new Point(344, 102),new Point(369, 62),new Point(331, 42),new Point(308, 75)]);
pusharrays(nonessential4.points, [new Point(352, 303),new Point(351, 348),new Point(360, 348),new Point(360, 303)]);

pusharrays(bouncingspring1.points, [new Point(31, 424),new Point(42, 424),new Point(42, 382),new Point(31, 382)]);
pusharrays(bouncingspring2.points, [new Point(105, 103),new Point(99, 83),new Point(152, 71),new Point(158, 88)]);
pusharrays(bouncingspring3.points, [new Point(237, 88),new Point(240, 69),new Point(293, 76),new Point(290, 94)]);
pusharrays(bouncingspring4.points, [new Point(350, 370),new Point(350, 412),new Point(361, 412),new Point(361, 370)]);

pusharrays(sponge.points, [new Point(165, 86),new Point(227, 86),new Point(227, 68),new Point(165, 68)]);
pusharrays(qualitycontrol.points, [new Point(390, 205),new Point(390, 208),new Point(373, 233),new Point(371, 233)]);
board1 = new Polygon();
board2 = new Polygon();
board3 = new Polygon();
board6 = new Polygon();
board7 = new Polygon();
board8 = new Polygon();
board9 = new Polygon();
pusharrays(board1.points, [new Point(29, 155),new Point(42, 121),new Point(16, 100),new Point(3, 145)]);
pusharrays(board2.points, [new Point(77, 90),new Point(41, 47),new Point(180, 23),new Point(165, 68)]);
pusharrays(board3.points, [new Point(225, 68),new Point(213, 26),new Point(332, 41),new Point(308, 79)]);
pusharrays(board6.points, [new Point(93, 524),new Point(89, 528),new Point(22, 481),new Point(25, 475)]);
//pusharrays(board7.points, [new Point(116, 523),new Point(120, 527),new Point(192, 484),new Point(188, 479)]);
//pusharrays(board8.points, [new Point(262, 523),new Point(257, 527),new Point(194, 481),new Point(199, 479)]);
pusharrays(board9.points, [new Point(286, 523),new Point(288, 530),new Point(367, 480),new Point(362, 477)]);

pusharrays(middlecenter.points, [new Point(172, 259),new Point(196, 231),new Point(219, 259),new Point(208, 270),new Point(183, 270)]);

//pusharrays(middlemiddle.points, [new Point(185, 270),new Point(191, 475),new Point(200, 475),new Point(205, 270)]);
pusharrays(middlemiddle.points, [new Point(183, 269), new Point(187, 288),new Point(205, 288),new Point(208, 269)]);
pusharrays(middlemiddle2.points, [new Point(187, 288),new Point(191, 475),new Point(200, 475),new Point(205, 288)]);

pusharrays(middlebottom1.points, [new Point(117, 515),new Point(117, 528),new Point(195, 525),new Point(195, 475),new Point(170, 476)]);
pusharrays(middlebottom2.points, [new Point(262, 515),new Point(261, 528),new Point(195, 525),new Point(195, 475),new Point(221, 476)]);
pusharrays(middlebottom3.points, [new Point(171, 475),new Point(160, 436),new Point(195, 452),new Point(195, 475)]);
pusharrays(middlebottom4.points, [new Point(220, 475),new Point(231, 436),new Point(195, 452),new Point(195, 475)]);
/**
pusharrays(middlemiddle.points, [new Point(183, 269), new Point(187, 288),new Point(205, 288),new Point(208, 269)]);
pusharrays(middlemiddle2.points, [new Point(187, 288),new Point(191, 475),new Point(200, 475),new Point(205, 288)]);
pusharrays(middlebottom1.points, [new Point(117, 515),new Point(120, 520),new Point(191, 475),new Point(159, 486)]);
pusharrays(middlebottom2.points, [new Point(159, 486),new Point(169, 474),new Point(191, 475)]);
pusharrays(middlebottom3.points, [new Point(169, 474),new Point(169, 461),new Point(191, 475)]);
pusharrays(middlebottom4.points, [new Point(160, 436),new Point(169, 461),new Point(191, 475),new Point(191, 442)]);
pusharrays(middlebottom5.points, [new Point(261, 515),new Point(259, 520),new Point(200, 475),new Point(229, 486)]);
pusharrays(middlebottom6.points, [new Point(221, 473),new Point(229, 486),new Point(200, 475)]);
pusharrays(middlebottom7.points, [new Point(221, 461),new Point(221, 473),new Point(200, 475)]);
pusharrays(middlebottom8.points, [new Point(231, 437),new Point(221, 461),new Point(200, 475),new Point(200, 442)]);
*/
pusharrays(ballLeftRect.points, [new Point(362, 500),new Point(361, 243),new Point(376, 243),new Point(376, 500)]);

apron = new Polygon();
apron1 = new Polygon();
pusharrays(apron.points, [new Point(400, 153.6),new Point(345, 101),new Point(378, 51),new Point(442, 152)]);
pusharrays(apron1.points, [new Point(380, 134),new Point(344, 119),new Point(380, 72)]);

line_qualitycontrol = new Line(new Point(369,237), new Point(386, 210));

pusharrays(shapes, [
qualitycontrol, apron, rightFlipperShape, leftFlipperShape, 
//apron1, 
directiontunnel1, directiontunnel2, directiontunnel3, directiontunnel4, irreversibletunnel1, irreversibletunnel2, 
middlecenter, middlemiddle, middlemiddle2, 
middlebottom1, middlebottom2, middlebottom3, middlebottom4,
middlebottom5, middlebottom6, middlebottom7, middlebottom8,
sponge, ballLeftRect,
nonessential1, nonessential2, nonessential3, nonessential4, 
bouncingspring1, bouncingspring2, bouncingspring3, bouncingspring4, 
board1, board2, board3, board6, board9, 
//board7, board8, 
c1, c2, c3, c4, c5, ballShape, leftBoundary, rightBoundary
]);

// Pause and Auto-pause.......................................
togglePaused = function () {
  game.togglePaused();
  pausedToast.style.display = game.paused ? 'inline' : 'none';
};
pausedToast.onclick = function (e) {
  pausedToast.style.display = 'none';
  togglePaused();
};
// New game ..................................................
newGameButton.onclick = function (e) {
  gameOverToast.style.display = 'none';
  startNewGame();
};
function startNewGame() {
  readoutToast.style.display = 'block';
  gameOver = false;
  loading = false;
  ballSprite.visible = true;
};
// Collision Detection........................................
function drawCollisionShapes() {
  var centroid;
  shapes.forEach(function (shape) {
    shape.stroke(game.contextbg);
    game.contextbg.beginPath();
    centroid = shape.centroid();
    game.contextbg.arc(centroid.x, centroid.y, 1, 0, Math.PI * 2, false);
    game.contextbg.stroke();
  });
  //drawCollisionLines();
}
function drawCollisionLines() {
  var centroid;
  lines.forEach(function (line) {
    line.stroke(game.context);
	game.context.strokeStyle = 'blue';
    game.context.beginPath();
    game.context.moveTo(line.p1.x, line.p1.y);
	game.context.lineTo(line.p2.x, line.p2.y);
    game.context.stroke();
  });
}
function clampBallVelocity() {
	
	if (ballSprite.velocityX > MAX_BALL_VELOCITY) {
		ballSprite.velocityX = MAX_BALL_VELOCITY;
	} else if (ballSprite.velocityX < -MAX_BALL_VELOCITY) {
		ballSprite.velocityX = -MAX_BALL_VELOCITY;
	}
	if (ballSprite.velocityY > MAX_BALL_VELOCITY) {
		ballSprite.velocityY = MAX_BALL_VELOCITY;
	} else if (ballSprite.velocityY < -MAX_BALL_VELOCITY) {
		ballSprite.velocityY = -MAX_BALL_VELOCITY;
	}
	
};
function clampBallVelocity2() {
	
	if (ballSprite.velocityX > MAX_BALL_VELOCITY2) {
		ballSprite.velocityX *=1/2;
	} else if (ballSprite.velocityX < -MAX_BALL_VELOCITY2) {
		ballSprite.velocityX *=1/2;
	}
	if (ballSprite.velocityY > MAX_BALL_VELOCITY2) {
		ballSprite.velocityY *=1/2;
	} else if (ballSprite.velocityY < -MAX_BALL_VELOCITY2) {
		ballSprite.velocityY *=1/2;
	}
	
};
function separate(shape, mtv) {
   var dx, dy, velocityMagnitude, point;
   if (mtv.axis === undefined) {
      point = new Point();
      velocityMagnitude = Math.sqrt(Math.pow(ballSprite.velocityX, 2) + 
									Math.pow(ballSprite.velocityY, 2));
      point.x = ballSprite.velocityX / velocityMagnitude;
      point.y = ballSprite.velocityY / velocityMagnitude;
      mtv.axis = new Vector(point);
   }   
     /**
     var theta = mtv.axis.x === 0 ? Math.PI / 2 : Math.atan(mtv.axis.y / mtv.axis.x);
  dy = mtv.overlap * Math.sin(theta);
  dx = mtv.overlap * Math.cos(theta);
  */
   dy = mtv.axis.y * mtv.overlap;
   dx = mtv.axis.x * mtv.overlap;

if(shape==c1||shape==c2||shape==c3||shape==c4||shape==c5) {
   if ((dx < 0 && ballSprite.velocityX < 0) || (dx > 0 && ballSprite.velocityX > 0)) {
      dx = -dx;
   }

   if ((dy < 0 && ballSprite.velocityY < 0) || (dy > 0 && ballSprite.velocityY > 0)) {
      dy = -dy;
   }
}
  ballSprite.x += dx;
  ballSprite.y += dy;
}
function checkMTVAxisDirection(mtv, shape) {
  if (mtv.axis === undefined)
	return;
  var centroid1,  centroid2,  centroidVector,  centroidUnitVector;
  centroid1 = new Vector(ballShape.centroid());
  centroid2 = new Vector(shape.centroid()),
  centroidVector = centroid2.subtract(centroid1),
  centroidUnitVector = (new Vector(centroidVector)).normalize();

  if (centroidUnitVector.dotProduct(mtv.axis) > 0) {
    mtv.axis.x = - mtv.axis.x;
    mtv.axis.y = - mtv.axis.y;
  }
};
function checkFutureBall(line, ballLine) {
	return intersectFutureBall(line.p1.x, line.p1.y, line.p2.x, line.p2.y, 
							ballLine.p1.x, ballLine.p1.y, ballSprite.radius);
}
function intersectFutureBall(sx,sy,fx,fy,cx,cy,radius) {
	var dx = fx-sx;
	var dy = fy-sy;
	var t = 0.0-((sx-cx)*dx+(sy-cy)*dy)/((dx*dx)+(dy*dy));
	if(t<0.0) {
		t=0.0;
	} else if(t>1.0) {
		t=1.0;
	}
	dx = (sx+t*(fx-sx))-cx;
	dy = (sy+t*(fy-sy))-cy;
	var vdx = sx+t*(fx-sx); //碰撞点
	var vdy = sy+t*(fy-sy); //碰撞点
	var rt = (dx*dx)+(dy*dy);//distance squared
	if(rt < radius*radius) {
		return {x:vdx, y:vdy};
	}
	return false;
}

function bounce(mtv, shape, bounceCoefficient) {
  var velocityVector = new Vector(new Point(ballSprite.velocityX, ballSprite.velocityY)),
  velocityUnitVector = velocityVector.normalize(),
  velocityVectorMagnitude = velocityVector.getMagnitude(),
  reflectAxis,  point;
  checkMTVAxisDirection(mtv, shape);
  if (!loading && !game.paused) {
    if (mtv.axis !== undefined) {
		reflectAxis = mtv.axis.perpendicular();
    } else {
		var v2 = new Vector(new Point(shape.x-ballSprite.x, shape.y-ballSprite.y)),
		vunit2 = v2.normalize();
        reflectAxis = new Vector(new Point(-vunit2.y, vunit2.x));
	}
	
	 point = velocityUnitVector.reflect(reflectAxis);
	 separate(shape, mtv);
    if (shape === leftFlipperShape || shape === rightFlipperShape) {
		if (velocityVectorMagnitude < MIN_BALL_VELOCITY_OFF_FLIPPERS)
			velocityVectorMagnitude = MIN_BALL_VELOCITY_OFF_FLIPPERS;
    }
    ballSprite.velocityX = point.x * velocityVectorMagnitude * bounceCoefficient;
    ballSprite.velocityY = point.y * velocityVectorMagnitude * bounceCoefficient;
	//console.log("-----------------------------"+ballSprite.velocityX+","+ballSprite.velocityY);
	clampBallVelocity();
	if(shape==apron && !alreadyapron) {//ballSprite.velocityX < 0 && ballSprite.velocityY>0 && startValue > 150
		ballSprite.velocityY=-ballSprite.velocityY*4;
		pusharrays(shapes, [apron1]);
		alreadyapron = true;
	}
  }
}
function collisionDetected(mtv) {
  return mtv.axis !== undefined || mtv.overlap !== 0;
};
function centreDist(ballShapeCentroid, shapeCentroid) {
  return distance(new Vector(ballShapeCentroid).subtract(new Vector(shapeCentroid)));
}
function distance(displacement) {
  return Math.sqrt(displacement.x*displacement.x+displacement.y*displacement.y);
}
function processCircle(sx,sy,sradius,cx,cy,radius) {
	if(sy == cy) {//1如果圆心y坐标相同，就直接反方向运行
		ballvx = -ballvx;
		return true;
	}
	//改变方向
	//原点直线方程式
	var k = (-sy+cy)/(sx-cx);
	var m = -cy-k*cx;
	//新点直线方程式
	var k1=-1/k;
	var m1 = -bally-k1*ballx;
	
	var a = (m-m1)/(k1-k);//(a,b)对称中点坐标
	var b = a*k+m;
	a = Math.round(a);//四舍五入整数
	b = Math.round(b);
	//对称点坐标		
	ballx = 2*a-ballx;
	bally = -(2*b+bally);
	
	ballvx = ballx-cx;
	ballvy = (bally-cy);
}
function processLine(sx,sy,fx,fy,cx,cy,radius) {
	if(sx == fx) {//是直板 y = m
		bally = 2*cy-bally;
	} else if(sy==fy) {//是横板 x = m
		ballx = 2*cy-ballx;
	} else {
		//原点直线方程式
		var k = (-sy+fy)/(sx-fx);
		var m = -bally-k*ballx;
		//新点直线方程式
		var k1=-1/k;
		var m1 = -vdy-k1*vdx;
		
		var a = (m-m1)/(k1-k);//(a,b)对称中点坐标
		var b = a*k+m;
		a = Math.round(a);//四舍五入整数
		b = Math.round(b);
		
		//对称点坐标		
		ballx = 2*a-ballx;
		bally = -(2*b+bally);
	}
	ballvx = ballx-cx;
	ballvy = bally-cy;
}
function detectCollisions() {
  var mtv,  shape,  displacement,  position,  lastPosition;
  if (!launching && !loading && !game.paused) {
  		ballShape.x=ballSprite.x;
		ballShape.y=ballSprite.y;
		/**
    position = new Vector(new Point(ballShape.x, ballShape.y));
    lastPosition = new Vector(new Point(lastBallPosition.x, lastBallPosition.y));
    displacement = position.subtract(lastPosition);
	*/
    for (var i = 0; i < shapes.length; ++i) {
      shape = shapes[i];
      if (shape !== ballShape) {
        mtv = ballShape.collidesWith(shape, displacement);
        if (collisionDetected(mtv)) {
          if (shape === rightFlipperShape) {
            if (rightFlipperAngle === 0) {
              bounce(mtv, shape, 1 + rightFlipperAngle);
              return true;
            }
          } else if (shape === leftFlipperShape) {
            if (leftFlipperAngle === 0) {
              bounce(mtv, shape, 1 + leftFlipperAngle);
              return true;
            }
          } else if (shape === qualitycontrol) {	
		  //console.log(ballSprite.x+","+ballSprite.y+"   -----  "+ballSprite.velocityX+","+ballSprite.velocityY);	
		    if(ballSprite.x == 389.5  && ballSprite.y > 168 
				&& ballSprite.velocityX===0 && ballSprite.velocityY<0) {
					qualitycontrolRiseTimer.start();
					qualitycontrolAngle = 0;	
					ballSprite.velocityY *= QUALITYCONTROLRATIO;
					return false;
			} else {
				 bounce(mtv, shape, 0.96);
				 return true;
			}			
            
          } else if (shape === actuatorPlatformShape) {
            bounce(mtv, shape, 0.2);
            return true;
          } else if (shape === directiontunnel1) {
			radius1 = directiontunnel1.radius;
			showBumper1 = true;
            ballSprite.x = directiontunnel10.x;
            ballSprite.y = directiontunnel10.y;
            return false;
          } else if (shape === directiontunnel2) {
		  radius2 = directiontunnel2.radius;
			showBumper2 = true;
            ballSprite.x = directiontunnel20.x;
            ballSprite.y = directiontunnel20.y;
            return false;
          } else if (shape === directiontunnel3) {
		  radius3 = directiontunnel3.radius;
			showBumper3 = true;
            ballSprite.x = directiontunnel30.x;
            ballSprite.y = directiontunnel30.y;
            return false;
          } else if (shape === directiontunnel4) {
		  radius4 = directiontunnel4.radius;
			showBumper4 = true;
            ballSprite.x = directiontunnel40.x;
            ballSprite.y = directiontunnel40.y;
            return false;
          } else if (shape === irreversibletunnel1 || shape === irreversibletunnel2) {
		    /***/
			over(shape === irreversibletunnel1);
            return true;
          /***/} else if(shape==c1||shape==c2||shape==c3||shape==c4||shape==c5) {
		  
            bounce(mtv, shape, 1.02);
			return true;
          } else if(shape==middlecenter||shape==middlemiddle||shape==middlemiddle2) {
            bounce(mtv, shape, 1.02);
			return true;
          } else if(shape==middlebottom1||shape==middlebottom2||shape==middlebottom3||shape==middlebottom4) {
            bounce(mtv, shape, 1.02);
			return true;
		  } else if(shape==apron) {
            bounce(mtv, shape, 1);
			return true;
          } else if(shape==sponge) {
            bounce(mtv, shape, 0.5);
			return true;
          } else if(shape==bouncingspring1||shape==bouncingspring2||shape==bouncingspring3||shape==bouncingspring4) {
            bounce(mtv, shape, 1.3);
			return true;
          } else {
            bounce(mtv, shape, 0.96);
            return true;
          }
        }
      }
    }
	/***/
    flipperCollisionDetected = false;
    detectFlipperCollision(LEFT_FLIPPER);
    detectFlipperCollision(RIGHT_FLIPPER);	
    return flipperCollisionDetected;
  }
  return false;
}
/**测试碰撞检测
var line = new Polygon();
pusharrays(line.points, [
new Point(360, 134),new Point(402, 150),new Point(413, 129)]);
var timeout = setTimeout(function(){
mtv = ballShape.collidesWith(line, new Point(0, 10));

//mtv = ballShape.collidesWith(new Circle(390, 350, 20), new Point(0, 10));
//cd = collisionDetected(mtv);
}, 1000);
*/
function test() {
/**
drawBall(game.context, 318,481, 9);
ballSprite.velocityX = -1;
ballSprite.velocityY = 78;
ballShape.x=318;
ballShape.y=481;
shape=rightFlipperShape;//middlecenter//rightFlipperShape//middlebottom1

mtv = ballShape.collidesWith(shape);
console.log(collisionDetected(mtv));
bounce(mtv, shape, 0.96);
*/
}
/**
var bbox1 = new Polygon();
var bbox2 = new Polygon();
pusharrays(bbox1.points, [new Point(25, 450),new Point(88, 450),new Point(88, 505),new Point(25, 505)]);
pusharrays(bbox2.points, [new Point(300, 450),new Point(365, 450),new Point(365, 505),new Point(300, 505)]);
//pusharrays(shapes, [bbox1, bbox2]);
*/
var BBOX_TOP=450,BBOX_BOTTON=505,BBOX1_LEFT=25,BBOX1_RIGHT=88,BBOX2_LEFT=300,BBOX2_RIGHT=365;
var LEFT_FLIPPER_ROTATION_POINT = new Point(25, 463),RIGHT_FLIPPER_ROTATION_POINT = new Point(365, 463);

function detectFlipperCollision(flipper) {
  var  v1,v2, v3,l1,  l2,  surface,  ip,  bbox = {  },  riseTimer, inarea;
  bbox.top = BBOX_TOP;
  bbox.bottom = BBOX_BOTTON;
  if (flipper === LEFT_FLIPPER) {
    v1 = new Vector(leftFlipperBaselineShape.points[0].rotate(LEFT_FLIPPER_ROTATION_POINT, leftFlipperAngle));
    v2 = new Vector(leftFlipperBaselineShape.points[1].rotate(LEFT_FLIPPER_ROTATION_POINT, leftFlipperAngle));
    
	bbox.left = BBOX1_LEFT;
    bbox.right = BBOX1_RIGHT;
    riseTimer = leftFlipperRiseTimer;
	inarea = (ballSprite.y + ballSprite.radius > bbox.top )
			&& (ballSprite.x - ballSprite.radius < bbox.right);
  } else if (flipper === RIGHT_FLIPPER) {
    v1 = new Vector(rightFlipperBaselineShape.points[0].rotate(RIGHT_FLIPPER_ROTATION_POINT, -rightFlipperAngle));
    v2 = new Vector(rightFlipperBaselineShape.points[1].rotate(RIGHT_FLIPPER_ROTATION_POINT, -rightFlipperAngle));
    bbox.left = BBOX2_LEFT;
    bbox.right = BBOX2_RIGHT;
    riseTimer = rightFlipperRiseTimer;
	inarea = (ballSprite.y + ballSprite.radius > bbox.top )
			&& (ballSprite.x + ballSprite.radius > bbox.left);
  }
  //inarea = ballSprite.y + ballSprite.radius > bbox.top && ballSprite.x - ballSprite.radius < bbox.right;
  if (!flipperCollisionDetected && riseTimer.isRunning() && inarea) {
  if(bbox.left==BBOX1_LEFT && v2.y < 478) {
	v2.x = 86;
	v2.y = 478;
  } else if(bbox.left==BBOX2_LEFT && v2.y < 478) {
	v2.x = 301;
	v2.y = 478;
  }
  //console.log("v1=("+v1.x+","+v1.y+"),v2=("+v2.x+","+v2.y+")");
	surface = v2.subtract(v1);
    l1 = new Line(new Point(ballSprite.x, ballSprite.y), lastBallPosition),
	l2 = new Line(new Point(v2.x, v2.y), new Point(v1.x, v1.y)),
    ip = l1.intersectionPoint(l2);
    if (ip.x > bbox.left && ip.x < bbox.right) {
      reflectVelocityAroundVector(surface.perpendicular());
      ballSprite.velocityX = ballSprite.velocityX * FLIPPERRATIO;
      ballSprite.velocityY = ballSprite.velocityY * FLIPPERRATIO;
      if (ballSprite.velocityY > 0)
		ballSprite.velocityY = - ballSprite.velocityY;
      if (flipper === LEFT_FLIPPER && ballSprite.velocityX < 0)
		ballSprite.velocityX = - ballSprite.velocityX;
      else if (flipper === RIGHT_FLIPPER && ballSprite.velocityX > 0)
		ballSprite.velocityX = - ballSprite.velocityX;
	
	/**
		if(ballSprite.velocityY==0&&ballSprite.velocityX!=0) {
			ballSprite.velocityY=-Math.abs(ballSprite.velocityX);
		} else if(ballSprite.velocityY<0&&ballSprite.velocityX!=0) {
			if(Math.abs(ballSprite.velocityY/ballSprite.velocityX)<1) {
				var tmp=ballSprite.velocityY;
				ballSprite.velocityY=-Math.abs(ballSprite.velocityX);
				if(ballSprite.velocityX<0)
					ballSprite.velocityX=ballSprite.velocityY;
				else if(ballSprite.velocityX>0){
					ballSprite.velocityX=-ballSprite.velocityY;
				}
			}
		}
		
		clampBallVelocity2();
		*/
    }
  }
}
function reflectVelocityAroundVector(v) {
  var velocityVector = new Vector(new Point(ballSprite.velocityX, ballSprite.velocityY)),
  velocityUnitVector = velocityVector.normalize(),
  velocityVectorMagnitude = velocityVector.getMagnitude(),
  point = velocityUnitVector.reflect(v);

   //console.log("point=("+point.x+","+point.y+")");
  ballSprite.velocityX = point.x * velocityVectorMagnitude;
  ballSprite.velocityY = point.y * velocityVectorMagnitude;
}

var stepx,stepy;
function moveSprite(time, lastBallPosition, sprite, tmpvector) {
/**
if(sprite.x == BALL_X  && sprite.y > 168 && sprite.velocityX==0 && sprite.velocityY<0
&& sprite.y + tmpvector.y > 160) {
//console.log(sprite.x+","+sprite.y+"      "+tmpvector.y);
	sprite.x += tmpvector.x;
	sprite.y += tmpvector.y;
	return;
}*/
  tmpdist = distance(tmpvector);  
  var nextlength = sprite.radius;//运动距离大于此距离时，就精细判断
  if(tmpdist <= nextlength) {
	sprite.x += tmpvector.x;
	sprite.y += tmpvector.y;
  } else {
	  stepx = nextlength*tmpvector.x/tmpdist;
	  stepy = nextlength*tmpvector.y/tmpdist;
	  var vx = tmpvector.x, vy=tmpvector.y;
	  var len = parseInt(tmpdist/(nextlength));
		var collisionOccurred;
		for(var i = 0; i < len; i++) {
			tmpvector.x-=stepx;
			tmpvector.y-=stepy;
			sprite.x+=stepx;
			sprite.y+=stepy;
			//game.paintSprites(time);
			collisionOccurred = detectCollisions();
			if(collisionOccurred) {
				break;
			}
		}
		if(!collisionOccurred && (tmpvector.x != 0 || tmpvector.y != 0)) {		
			sprite.x+=tmpvector.x;
			sprite.y+=tmpvector.y;
			//game.paintSprites(time);
			collisionOccurred = detectCollisions();
		}
		if (!collisionOccurred && applyGravityAndFriction) {
			applyFrictionAndGravity(parseFloat(time - game.lastTime)); // modifies ball velocity
		}
  }
}
function over(left) {
	//gameOver = true;
	addLRCount(left);
	updateCount();
	game.paused = true;
	setTimeout(function(){
		game.paused = false;
		ballOutOfPlay = false;
		prepareForLaunch();
	}, 200);      
};
game.startAnimate = function (time) {
  var collisionOccurred;
  if (loading || game.paused || launching)
  return;
  if (ballOutOfPlay || (ballSprite.x>ACTUATOR_LEFT && ballSprite.x<ACTUATOR_RIGHT&& ballSprite.y >= 330 && ballSprite.velocityY > 0)) {
    var left = ballSprite.x < 194;
	over(left);
    return;
  }
  adjustRightFlipperCollisionPolygon();
  adjustLeftFlipperCollisionPolygon();
  collisionOccurred = detectCollisions();
  if (!collisionOccurred && applyGravityAndFriction) {
    applyFrictionAndGravity(parseFloat(time - game.lastTime)); // modifies ball velocity
  }
};
game.paintBg = function() {
  game.contextbg.drawImage(game.getImage(backgroudImg), 0, 0);
  
  game.contextbg.lineWidth = 1;
  game.contextbg.strokeStyle = 'rgb(100,100,100)';
  game.contextbg.font="20px Georgia";
  game.contextbg.fillText("locus", 527, 570);
  game.contextbg.strokeRect(527, 551, 50, 25);
  game.contextbg.fillText("left:", 480, 510);
  game.contextbg.fillText("right:", 480, 540);
  game.contextbg.fillText("0", 530, 510);
  game.contextbg.fillText("0", 530, 540);
  
  setLeftCount(0);
  setRightCount(0);
  
  if(devlop) {
	drawCollisionShapes();
  }
}
function updateCount() {
  game.contextbg.clearRect(530, 490, 40, 60);
  game.contextbg.fillText(getLeftCount(), 530, 510);
  game.contextbg.fillText(getRightCount(), 530, 540);
}
//game.clearScreen = function(){};
game.paintUnderSprites = function () {
  if (loading)
  return;
  updateLeftFlipper();
  updateRightFlipper();
  updatequalitycontrol();
  game.context.drawImage(game.getImage(actorImg), 373, 347,34,actorHeight>0?actorHeight:0);
  if(devlop && ballrunning)
	drawLine(ballSprite.x, ballSprite.y, lastBallPosition.x, lastBallPosition.y);
  paintLeftFlipper();
  paintRightFlipper();
  paintqualitycontrol();
};

function adjustLeftFlipperCollisionPolygon() {
  if (leftFlipperRiseTimer.isRunning() || leftFlipperFallTimer.isRunning()) {
    for (var i = 0; i < leftFlipperShape.points.length; ++i) {
	if(update2 && i==2) 
		break;
      var rp = leftFlipperBaselineShape.points[i].rotate(LEFT_FLIPPER_ROTATION_POINT, leftFlipperAngle);
      leftFlipperShape.points[i].x = rp.x;
      leftFlipperShape.points[i].y = rp.y;
    }
  }
}
function adjustRightFlipperCollisionPolygon() {
  if (rightFlipperRiseTimer.isRunning() || rightFlipperFallTimer.isRunning()) {
    for (var i = 0; i < rightFlipperShape.points.length; ++i) {
		if(update2 && i==2) 
		break;
      var rp = rightFlipperBaselineShape.points[i].rotate(RIGHT_FLIPPER_ROTATION_POINT, - rightFlipperAngle);
      rightFlipperShape.points[i].x = rp.x;
      rightFlipperShape.points[i].y = rp.y;
    }
  }
}
function resetLeftFlipperCollisionPolygon() {
  for (var i = 0; i < leftFlipperShape.points.length; ++i) {
  	if(update2 && i==2) 
		break;
    var point = leftFlipperBaselineShape.points[i];
    leftFlipperShape.points[i].x = leftFlipperBaselineShape.points[i].x;
    leftFlipperShape.points[i].y = leftFlipperBaselineShape.points[i].y;
  }
}
function resetRightFlipperCollisionPolygon() {
  for (var i = 0; i < rightFlipperShape.points.length; ++i) {
  	if(update2 && i==2) 
		break;
    var point = rightFlipperBaselineShape.points[i];
    rightFlipperShape.points[i].x = rightFlipperBaselineShape.points[i].x;
    rightFlipperShape.points[i].y = rightFlipperBaselineShape.points[i].y;
  }
}

leftFlipperShape.centroid = function () {
  return new Point(30, 463);
};
rightFlipperShape.centroid = function () {
  return new Point(365, 463);
};
function paintLeftFlipper() {
  if (leftFlipperRiseTimer.isRunning() || leftFlipperFallTimer.isRunning()) {
    game.context.save();
    game.context.translate(25, 463);
    game.context.rotate( - leftFlipperAngle);
    game.context.drawImage(game.getImage(leftFlipperImg), - 9, - 11);
    game.context.restore();
  } else {
    game.context.drawImage(game.getImage(leftFlipperImg), 16, 452);    
  }
}
function paintRightFlipper() {
  if (rightFlipperRiseTimer.isRunning() || rightFlipperFallTimer.isRunning()) {
    game.context.save();
    game.context.translate(365, 463);
    game.context.rotate(rightFlipperAngle);
    game.context.drawImage(game.getImage(rightFlipperImg), - 55, - 11);
    game.context.restore();
  } else {
    game.context.drawImage(game.getImage(rightFlipperImg), 310, 452);
  }
}
function paintqualitycontrol() {
    /**
	game.context.save();
    game.context.translate(369, 236);
    game.context.rotate(-Math.PI/3);
    game.context.drawImage(game.getImage(qualitycontrolImg), -5, - 29);
    game.context.restore();
	*/
  if (qualitycontrolRiseTimer.isRunning() || qualitycontrolFallTimer.isRunning()) {
    game.context.save();
    game.context.translate(369, 236);
    game.context.rotate(-qualitycontrolAngle);
    game.context.drawImage(game.getImage(qualitycontrolImg), -5, - 29);
    game.context.restore();
  } else {
    game.context.drawImage(game.getImage(qualitycontrolImg), 366, 206);
  }
}
function updateLeftFlipper() {
  if (leftFlipperRiseTimer.isRunning()) { // Flipper is rising
    if (leftFlipperRiseTimer.isOver()) { // Finished rising
      leftFlipperRiseTimer.stop(); // Stop rise timer
	  flipperCollisionDetected = false; // reset
      leftFlipperFallTimer.start();
      leftFlipperAngle = MAX_FLIPPER_ANGLE;
    } else { // Flipper is still rising
      leftFlipperAngle = MAX_FLIPPER_ANGLE / FLIPPER_RISE_DURATION * leftFlipperRiseTimer.getElapsedTime();
    }
  } else if (leftFlipperFallTimer.isRunning()) { // Left flipper is falling
    leftFlipperAngle = MAX_FLIPPER_ANGLE - MAX_FLIPPER_ANGLE / FLIPPER_FALL_DURATION * leftFlipperFallTimer.getElapsedTime();
    if (leftFlipperFallTimer.isOver()) { // Finished falling
      leftFlipperFallTimer.stop(); // Stop fall timer
      leftFlipperAngle = 0; // Set flipper angle
      resetLeftFlipperCollisionPolygon(); // Reset collision polygon
    }
  }
}
function updateRightFlipper() {
  if (rightFlipperRiseTimer.isRunning()) {
    if (rightFlipperRiseTimer.isOver()) {
      rightFlipperRiseTimer.stop();
      flipperCollisionDetected = false; // reset
      rightFlipperFallTimer.start();
      rightFlipperAngle = MAX_FLIPPER_ANGLE;
    } else {
      rightFlipperAngle = MAX_FLIPPER_ANGLE / FLIPPER_RISE_DURATION * rightFlipperRiseTimer.getElapsedTime();
    }
  } else if (rightFlipperFallTimer.isRunning()) {
    rightFlipperAngle = MAX_FLIPPER_ANGLE - MAX_FLIPPER_ANGLE / FLIPPER_FALL_DURATION * rightFlipperFallTimer.getElapsedTime();
    if (rightFlipperFallTimer.isOver()) {
      rightFlipperFallTimer.stop();
      rightFlipperAngle = 0;
      resetRightFlipperCollisionPolygon();
    }
  }
}
function updatequalitycontrol() {
  if (qualitycontrolRiseTimer.isRunning()) {
    if (qualitycontrolRiseTimer.isOver()) {
      qualitycontrolRiseTimer.stop();
      flipperCollisionDetected = false; // reset
      qualitycontrolFallTimer.start();
      qualitycontrolAngle = MAX_FLIPPER2_ANGLE;
    } else {
      qualitycontrolAngle = MAX_FLIPPER2_ANGLE / FLIPPER2_RISE_DURATION * qualitycontrolRiseTimer.getElapsedTime();
    }
  } else if (qualitycontrolFallTimer.isRunning()) {
    qualitycontrolAngle = MAX_FLIPPER2_ANGLE - MAX_FLIPPER2_ANGLE / FLIPPER2_FALL_DURATION * qualitycontrolFallTimer.getElapsedTime();
    if (qualitycontrolFallTimer.isOver()) {
      qualitycontrolFallTimer.stop();
      qualitycontrolAngle = 0;
      resetRightFlipperCollisionPolygon();
    }
  }
}
// Load game..................................................

loading = true;
progressDiv.style.display = 'block';
progressDiv.appendChild(progressbar.domElement);


ballSprite.x = BALL_X;
ballSprite.y = BALL_Y;
ballSprite.radius = BALL_RADIUS;
ballSprite.velocityX = 0;
ballSprite.velocityY = 0;
ballSprite.visible = true;
game.addSprite(ballSprite);

function windowToCanvas(e) {
  var x = e.x || e.clientX,
  y = e.y || e.clientY,
  bbox = game.context.canvas.getBoundingClientRect();
  return {
    x: x - bbox.left * (game.context.canvas.width / bbox.width),
    y: y - bbox.top * (game.context.canvas.height / bbox.height)
  };
}
function drawHorizontalLine(y) {
  game.context.moveTo(0, y + 0.5);
  game.context.lineTo(game.context.canvas.width, y + 0.5);
  game.context.stroke();
}
function drawVerticalLine(x) {
  game.context.moveTo(x + 0.5, 0);
  game.context.lineTo(x + 0.5, game.context.canvas.height);
  game.context.stroke();
}
function drawLine(x, y, x1, y1) {
game.context.save();
game.context.beginPath();
game.context.lineWidth=3;
  game.context.moveTo(x, y);
  game.context.lineTo(x1, y1);
  game.context.stroke();
  game.context.closePath();
  game.context.restore();
}
function createDomePolygons(centerX, centerY, radius, sides) {
  var polygon,
  polygons = [
  ],
  startTheta = 0,
  endTheta,
  midPointTheta,
  thetaDelta = Math.PI / sides,
  midPointRadius = radius * 1.5;
  for (var i = 0; i < sides; ++i) {
    polygon = new Polygon();
    endTheta = startTheta + thetaDelta;
    midPointTheta = startTheta + (endTheta - startTheta) / 2;
    polygon.points.push(new Point(centerX + radius * Math.cos(startTheta), centerY - radius * Math.sin(startTheta)));
    polygon.points.push(new Point(centerX + midPointRadius * Math.cos(midPointTheta), centerY - midPointRadius * Math.sin(midPointTheta)));
    polygon.points.push(new Point(centerX + radius * Math.cos(endTheta), centerY - radius * Math.sin(endTheta)));
    polygon.points.push(new Point(centerX + radius * Math.cos(startTheta), centerY - radius * Math.sin(startTheta)));
    polygons.push(polygon);
    startTheta += thetaDelta;
  }
  return polygons;
}
/**
var domePolygons = createDomePolygons(210, 280, 240, 15);
domePolygons.forEach(function (polygon) {
  shapes.push(polygon);
});
*/


game.queueImage(rightFlipperImg);
game.queueImage(leftFlipperImg);
game.queueImage(backgroudImg);
game.queueImage(actorImg);
game.queueImage(qualitycontrolImg);
var interval = setInterval(function (e) {
  var percentComplete = game.loadImages();
  progressbar.draw(percentComplete);
  if (percentComplete >= 100) {
    clearInterval(interval);
    progressDiv.style.display = 'none';
    loadingToast.style.display = 'none';
	readoutToast.style.display = 'block';
    launching = true;
    loading = false;
    //game.playSound('jingle');
	game.paintBg();
    game.start();
	
	test();
  }
}, 16);
startActor = false;
game.context.canvas.onmousedown = function (e) {
  var location = windowToCanvas(e);
  startX = location.x;
  startY = location.y;
  startActor=true;
  //locationx = location.x;
  //locationy = location.y;
}
function getCookie(name)//取cookies函数     
{  
   var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));  
   //if(arr != null) return unescape(arr[2]); return null;  
   if(arr != null) return parseInt(arr[2]); return 0;  
}
function setCookie(c_name,value,expiredays)
{
	//var exdate=new Date();
	//exdate.setDate(exdate.getDate()+expiredays);
	//document.cookie=c_name+ "=" +escape(value)+((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
	document.cookie=c_name+ "=" +value;
}
function checkSupportCookie() {
	var cookieenable = window.navigator.cookieEnabled;
	if(cookieenable) {
		setCookie('cookie_test','1');  
		var cookie_test = getCookie('cookie_test');  
		if( '1' != cookie_test) {  
			return false;
		} else {  
			return true;
		}  
	} else {
		return false;
	}
}
var cookieenable = checkSupportCookie();
function setLeftCount(val) {
	if(cookieenable)
		setCookie("leftCount", val);
	else
		localStorage.setItem("leftCount", val);
}
function setRightCount(val) {
	if(cookieenable)
		setCookie("rightCount", val);
	else
		localStorage.setItem("rightCount", val);
}
function getLocalStorageItem(name) {
	return parseInt(localStorage.getItem(name));
}
function getLeftCount() {
	if(cookieenable)
		return getCookie("leftCount");
	else
		return getLocalStorageItem("leftCount");
}
function getRightCount() {
	if(cookieenable)
		return getCookie("rightCount");
	else
		return getLocalStorageItem("rightCount");
}
function addLRCount(isleft) {
	if(isleft)
		setLeftCount(getLeftCount()+1);
	else
		setRightCount(getRightCount()+1);
}
function clearLocalStorage() {
	if(window.confirm("Clear leftCount and rightCount ?")){
		setLeftCount(0);
		setRightCount(0);
	}
}

function show(x, y) {
if(devlop) 
		readoutToast.innerHTML = '(' + x + ', ' + y + ')';
	/*if(devlop) 
		readoutToast.innerHTML = '(' + x + ', ' + y + ')<br/>' + 'Left Count(' + getLeftCount() + ')<br/>'+ 'Right Count(' + getRightCount() + ')<br/>';
	else 
		readoutToast.innerHTML = 'Left Count(' + getLeftCount() + ')<br/>'+ 'Right Count(' + getRightCount() + ')<br/>';
	*/
}
function drawLocus(locus) {
	game.context.save();
	game.context.beginPath();
	//game.context.lineWidth=3;
  game.context.moveTo(locus[0].x, locus[0].y);
  if(locus.length > 1) {
	  for(var i = 1; i < locus.length;i++) {
		game.context.lineTo(locus[i].x, locus[i].y);
	  }
  }
  game.context.stroke();
  game.context.closePath();
  game.context.restore();
}
function saveLocus(){
	game.stop = true;
	if(locus.length > 0) {
		drawLocus(locus);
	}
	//alert(locus.length);
}
game.contextbg.canvas.onmousemove = function(e) {
	var location = windowToCanvas(e);
	show(location.x.toFixed(0), location.y.toFixed(0));
}
game.context.canvas.onmousemove = function(e) {
	var location = windowToCanvas(e);
	show(location.x.toFixed(0), location.y.toFixed(0));
	
	  var high = mouseInSpring(e, startX, startY);
  if (high > 0 && startActor) {
	actorHeight = location.y - startY;
	} else {
	actorHeight=0;
	}
}
var startX,startY;
game.context.canvas.onmouseup = function (e) {
startActor=false;
actorHeight=0;
  var high = mouseInSpring(e, startX, startY);
  if (high > 0) {
    startBall(high*2);
  }
}
game.addKeyListener({
	key: 'space',
	listener: function () {
		//togglePaused();
		var run = parseInt(Math.random()*50)+50;
		//run=59;
		console.log(run);
		actorHeight = run *(400-343)/50;
		setTimeout(function(){
			actorHeight = 0;
		}, 100);
		startBall(run*2);
	}
});
function mouseInSpring(e, x, y) {
  //弹簧 spring(380,340) (400,445)
  if (x < 380 || y < 340 || x > 400 || y > 445) {
    return 0;
  } else {
    var location = windowToCanvas(e);
    endX = location.x;
    endY = location.y;
    var high = endY - y;
    if (endX < 380 || endY < 340 || endX > 400 || endY > 445) {
      return 0;
    } else if (high <= 0) {
      return 0;
    }
    return high;
  }
}
function startBall(high) {
	startValue = high;
	console.log("-------"+high);
	//changeReflectBoard(high > 150);
	game.start();
	alreadyapron = false;
  if (!launching && ballSprite.x-ballSprite.radius === BALL_LAUNCH_LEFT && ballSprite.velocityY === 0) {
    launching = true;
    ballSprite.velocityY = 0;
    applyGravityAndFriction = false;
  }
  if (launching) {
    ballSprite.velocityY = - high * LAUNCH_COEFFICIENT;
    launching = false;
	ballrunning = true;
    locus = [new Point(BALL_X, BALL_Y)];
    
	setTimeout(function(){
	applyGravityAndFriction = true;
	}, 100);
  }
}
game.context.canvas.onclick = function(e) {
	var loc = windowToCanvas(e);
	if(leftFlipperShape.isPointInPath(game.context, loc.x, loc.y)) {
	    leftFlipperRiseTimer.start();
		leftFlipperAngle = 0;
		//game.playSound('flipper');
	} else if(rightFlipperShape.isPointInPath(game.context, loc.x, loc.y)) {
		rightFlipperRiseTimer.start();
		rightFlipperAngle = 0;
		//game.playSound('flipper');
	}
};
game.contextbg.canvas.onclick = function(e) {
	var loc = windowToCanvas(e);
	if(saveLocusShape.isPointInPath(game.contextbg, loc.x, loc.y)) {
		saveLocus();
	}
};
function showAllBumper() {
	if(showBumper1) {
		showBumper1 = showBumper(directiontunnel1.x, directiontunnel1.y, directiontunnel1.radius, radius1--);
		showBumper(directiontunnel10.x, directiontunnel10.y, directiontunnel10.radius, radius1--);
	}
	if(showBumper2){
		showBumper2 = showBumper(directiontunnel2.x, directiontunnel2.y, directiontunnel2.radius, radius2--);
		showBumper(directiontunnel20.x, directiontunnel20.y, directiontunnel20.radius, radius2--);
	}	
	if(showBumper3){
		showBumper3 = showBumper(directiontunnel3.x, directiontunnel3.y, directiontunnel3.radius, radius3--);
		showBumper(directiontunnel30.x, directiontunnel30.y, directiontunnel30.radius, radius3--);
	}	
	if(showBumper4){
		showBumper4 = showBumper(directiontunnel4.x, directiontunnel4.y, directiontunnel4.radius, radius4--);
		showBumper(directiontunnel40.x, directiontunnel40.y, directiontunnel40.radius, radius4--);
	}
}
function showBumper(x, y, radius, changeradius) {
	if(changeradius <= 0) {
		return false;
	}
	changeradius-=1;
	drawBall(game.context, x, y, radius, changeradius);
	return true;
}
function drawBall(context, x, y, radius, radius1) {
	context.save();

	context.fillStyle = 'rgba(0, 0, 0, 1)';
	context.strokeStyle = 'rgba(0, 0, 0, 1)';
	context.shadowColor = 'rgba(0, 0, 0, 1)';
	//context.shadowBlur = 2;
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI*2, false); //
	context.arc(x, y, radius1, 0, Math.PI*2, true); // 
	context.fill();
	context.stroke();

	context.restore();
}
