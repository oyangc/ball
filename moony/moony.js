var	ballx;//球的初始x坐标
var bally;//球的初始y坐标
var ballvx;//水平位移
var ballvy;//垂直位移
var ballRadius;//球半径
var rapid;//速度
var mass;//质量
var gameOver;
var interval;
var horvelocity;//水平速度
var verticalvel1;//起始时垂直速度   
var gravity = 0.3;//加速度
var verticalvel2 = verticalvel1+gravity;//结束时垂直速度
//这是模拟重力或任何其他常量加速度的一种标准做法
var context = document.getElementById('canvas').getContext('2d');
// Initialization................................................
var start = false;
var startX,startY;
var endX,endY;
var coefficient=0.2;//弹力系数
var readoutToast = document.getElementById("readoutToast");
function show(x, y) {
/**
	readoutToast.style.display = 'block';
	readoutToast.innerHTML = '(' + x + ', ' + y + ')<br/>';
*/	
}
// Functions.....................................................
window.addEventListener('load', function () {
initParam();
init();
}, false);
// Event handlers...............................................
context.canvas.onmousedown = function(e) {
	var location = windowToCanvas(context.canvas, e);
	startX=location.x;
	startY=location.y;
	//var point = new Pointer(startX, startY, context);
	//point.display();
	show(startX, startY);
	if(leftReverseBar.checkClick(startX, startY)) {
		translate = true;
	} else if(rightReverseBar.checkClick(startX, startY)) {
		translate2 = true;
	}
}
context.canvas.onmouseup = function(e) {
	var flag = mouseInSpring(e, startX, startY);
	if(typeof(flag)!=undefined && flag == true) {
		startBall();
	} else {
		if(translate || translate2) {
			initParam();
			init();
			initParam();
			setTimeout(init, 50);
		}
	}
}
function mouseInSpring(e, x, y) {
	//弹簧 spring(380,340) (400,445)
	if(x<380||y<340||x>400||y>445) {
		return false;
	} else {
		var location = windowToCanvas(context.canvas, e);
		endX=location.x;
		endY=location.y;
		var high = endY-y;
		if(endX<380||endY<340||endX>400||endY>445) {
			return false;
		} else if(high<=0) {
			return false;
		}
		verticalvel1 = ballvy = -high*coefficient;//起始速度=高*弹力系数
		return true;
	}	
}
function startBall() {	
	clearInterval(interval);  
	if(gameOver != undefined && gameOver) return;	
	init();
   	interval = setInterval(init, 50);//init
}
function endBall() {
	clearInterval(interval);  
	gameOver = true;
	initParam();
	init();
}
function init() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    //drawGrid('lightgray', 10, 10);
    drawBackground();
	drawBar1();
	drawBar2();
	drawBar3();
	buildComp(context);
	
	moveBall();
}
function initParam() {
	ballx = 389.5;//球的初始x坐标
	bally = 330;//球的初始y坐标
	ballvx = 0;//水平位移
	ballvy = -5;//垂直位移
	ballRadius = 9;
	gameOver = false;
	context.fillStyle = 'rgba(100, 140, 230, 0.5)';
	context.strokeStyle = context.fillStyle;//'rgba(20, 60, 150, 0.5)';
}
function drawBackground() {
context.save();
	var image = new Image();
   image.src="images/background.jpg";
   context.drawImage(image, 0, 0);
   context.restore();
}

var translate = false;
var translate2 = false;
var translate3 = false;
function drawBar1() {
   var image2 = new Image();
   if(translate) {
		image2.src="images/reversebar2-1.png";
		context.drawImage(image2, 16, 451);
		translate = false;
   } else {
		image2.src="images/reversebar2.png";
		context.drawImage(image2, 15, 451);
   }
   /**
	var image3 = new Image();
	image3.src="reversebar2-1.png";
	context.drawImage(image3, 15, 450);
   */
}
function drawBar2() {
   var image2 = new Image();
   if(translate2) {
		image2.src="images/reversebar3-1.png";
		context.drawImage(image2, 300, 452);
		translate2 = false;
   } else {
		image2.src="images/reversebar3.png";
		context.drawImage(image2, 312, 451);
   }
   /** 
	var image3 = new Image();
	image3.src="reversebar3-1.png";
	context.drawImage(image3, 300, 452);
	
	image2.addEventListener("mousemove", function(){
		console.log("点积");
	}, false);
  */
}
function drawBar3() {
   if(translate3) {
		var image2 = new Image();
		image2.src="images/qualitycontrol.png";
		context.drawImage(image2, 355, 200);
		translate3 = false;
   }
}

function moveBall() {
	moveBallAndCheck();
	if(!gameOver) {
		drawBall();
	}
}
function moveBallAndCheck() {	
	collid();
}
//碰撞检测，并确定x,y位移量
function collid() {
	var tw, th;
	ballvy = ballvy+gravity;
	var tx=ballx+ballvx;
	var ty=bally+ballvy;
	if(ballx==389.5 && bally >= 330 && ballvy > 0) {
		endBall();
		return;
	}
	//过了边界就结束
	if(bally-ballRadius < 0 || ballx-ballRadius < 0 || 
		ballx+ballRadius > 408 || bally+ballRadius > 518
		//ballx+ballRadius > canvas.width || bally+ballRadius > canvas.height
		) {
		endBall();
		return;
	}
	//console.log("ballvx="+ballvx+",ballvy="+ballvy);
	var flag = false;//没有相交
	for(var i=0, line; line=lines[i++];) {
		tw = line.x-line.x1;
		th = line.y-line.y1;
		if((tw==0&&ballvx==0)||(th==0&&ballvy==0)) {
			continue;
		}
		var ipoint = intersectionPoint(line, ballx, bally, tx, ty);
		if(intersectionPointInLine(ipoint, ballx, bally, tx, ty)) {
			if(intersect(line.x,line.y,line.x1,line.y1,ipoint.x,ipoint.y,ballRadius)) {
				flag = true;
				break;
			}
		}
	}
	if(!flag) {
		for(var i=0, circle; circle=circles[i++];) {
			if(collidCircle(circle.x, circle.y, circle.radius,tx,ty,ballRadius)) {			
				flag = true;
				break;
			}
		}
	}
	if(!flag) {
		for(var i=0, circle; circle=endcircles[i++];) {
			if(collidCircle(circle.x, circle.y, circle.radius,tx,ty,ballRadius, true)) {			
				flag = true;
				break;
			}
		}
	}
	if(!flag) {
		for(var i=0, sofa; sofa=sofas[i++];) {
			if(crossSofa(sofa,tx,ty,ballRadius)) {
				flag = true;
				break;
			}
		}
	}
	if(!flag) {
		ballx = tx;
		bally = ty;
	}
}
function intersectionPoint(line, ballx, bally, tx, ty) {
	var line1 = new Line2(new Point(line.x,line.y), new Point(line.x1,line.y1));
	var line2 = new Line2(new Point(ballx,bally), new Point(tx,ty));
	return line1.intersectionPoint(line2);
}
function intersectionPointInLine(ipoint, ballx, bally, tx, ty) {
	var vx = ballvx<0?(-1*ballRadius):ballRadius;
	var vy = ballvy<0?(-1*ballRadius):ballRadius;
	if(ipoint.x < ballx && ipoint.x < tx+vx) {
		return false;
	} else if(ipoint.x > ballx && ipoint.x > tx+vx) {
		return false;
	} else if(ipoint.y < bally && ipoint.y < ty+vy) {
		return false;
	} else if(ipoint.y > bally && ipoint.y > ty+vy) {
		return false;
	}
	return true;
}

drawLine1 = function(x,y,x1,y1) {
	context.save();
	context.beginPath();
	context.strokeStyle='rgb(255,0,0)';
	context.lineWidth=2;
	context.moveTo(x,y);
	context.lineTo(x1,y1);
	context.stroke();
	//context.closePath();
	context.restore();
}

//碰撞检测，穿越虫洞
function crossSofa(sofa,cx,cy,radius) {
	var sx = sofa.x;
	var sy=sofa.y;
	var sradius=sofa.radius;
	//2 圆心距小于等于两点坐标之和
	var ds = Math.sqrt((sy-cy)*(sy-cy)+(sx-cx)*(sx-cx));
	if(ds <= sradius+radius) {
		ballx = sofa.dx;
		bally = sofa.dy;
		return true;
	}
	return false;
}
//碰撞检测，圆相碰                            isend表示是结束圈
function collidCircle(sx,sy,sradius,cx,cy,radius, isend) {
	// 圆心距小于等于两点坐标之和
	var ds = Math.sqrt((sy-cy)*(sy-cy)+(sx-cx)*(sx-cx));
	if(ds <= sradius+radius) {
		if(isend) {
			endBall();
			return true;
		}
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
		return true;
	}
	return false;
}
//碰撞检测，判断是否相交
//参数化线段x=sx+t*(fx-sx);  y=sy+t*(fy-sy);
function intersect(sx,sy,fx,fy,cx,cy,radius) {
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
	var vdx = parseInt(sx+t*(fx-sx)); //碰撞点
	var vdy = parseInt(sy+t*(fy-sy)); //碰撞点
	var rt = (dx*dx)+(dy*dy);//distance squared
	
	if(rt < (radius*radius)) {	
		if(sx==370 && sy==237 && fx==386 && fy==211
			&& ballx > fx && ballx > fy) {//quality control 挡板
			translate3 = true;
			return false;
		}
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

		/**
		drawLine1(sx,sy,fx,fy);
		drawLine1(cx,cy,ballx,bally);
		drawBall();
		*/
		return true;
	}	
	return false;//true intersect
}

function drawBall() {
	context.save();

	context.fillStyle = 'rgba(0, 0, 0, 1)';
	context.strokeStyle = 'rgba(0, 0, 0, 1)';
	context.shadowColor = 'rgba(0, 0, 0, 1)';
	//context.shadowBlur = 2;
	context.beginPath();
	context.arc(ballx, bally, ballRadius, 0, Math.PI*2, false); //
	//context.arc(ballx, bally, ballRadius-2, 0, Math.PI*2, true); // 
	//context.fill();
	context.stroke();

	context.restore();
}

// ---------------------other---------------------
function drawShadow() {
	context.save();
	context.beginPath();
	context.strokeStyle="rgb(255,0,0)";
	context.lineWidth="3";
	context.moveTo(ballx - ballvx, bally - ballvy);
	context.lineTo(ballx, bally);
	context.stroke();
	context.restore();
}
//网格
function drawGrid(color, stepx, stepy) {
   context.save()

   context.strokeStyle = color;
   context.fillStyle = '#ffffff';
   context.lineWidth = 0.5;
   context.fillRect(0, 0, context.canvas.width, context.canvas.height);

   for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
     context.beginPath();
     context.moveTo(i, 0);
     context.lineTo(i, context.canvas.height);
     context.stroke();
   }

   for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
     context.beginPath();
     context.moveTo(0, i);
     context.lineTo(context.canvas.width, i);
     context.stroke();
   }

   context.restore();
}
function drawBall1() {
	context.save();

   context.globalCompositeOperation = "source-over";
   context.beginPath();
   context.arc(ballx, bally, ballRadius, 0, Math.PI*2, false);
   context.fillStyle = 'orange';
   context.stroke();
   context.fill();

   context.restore();
}

function drawTwoArcs() {
	context.save();
	
   context.shadowColor = 'rgba(0, 0, 0, 0.8)';
   context.shadowOffsetX = 12;
   context.shadowOffsetY = 12;
   context.shadowBlur = 15;
   
   context.beginPath();
   context.arc(500, 400, 60, 0, Math.PI*2, false); // outer: CW
   context.arc(500, 400, 30, 0, Math.PI*2, true); // innner

   context.fill();
   context.shadowColor = undefined;
   context.shadowOffsetX = 0;
   context.shadowOffsetY = 0;
   context.stroke();
   
   context.restore();
}
function windowToCanvas(canvas, e) {
  var x = e.x || e.clientX,
  y = e.y || e.clientY,
  bbox = canvas.getBoundingClientRect();
  return {
    x: x - bbox.left * (canvas.width / bbox.width),
    y: y - bbox.top * (canvas.height / bbox.height)
  };
}