var Pointer = function(x, y, context) {
	this.x=x;
	this.y=y;
	this.context = context;
	this.display = function() {
		/**
		this.context.save();
		this.context.beginPath();
		this.context.fillStyle='rgb(255,0,0)';
		this.context.arc(this.x,this.y, 1, 0, Math.PI*2, true);
		this.context.fillText("("+this.x+","+this.y+")", 10, 10, true);
		this.context.fill();
		this.context.closePath();
		this.context.restore();
		*/
		this.context.save();
		this.context.beginPath();
		this.context.fillStyle='rgb(255,0,0)';
		this.context.strokeStyle='rgb(0,0,0)';
		this.context.arc(this.x,this.y, 3, 0, Math.PI*2, true);
		this.context.stroke();
		this.context.closePath();
		this.context.strokeStyle='rgb(255,0,0)';
		this.context.font="14px";
		this.context.strokeText("("+this.x+","+this.y+")",this.x+10,this.y+10);
		drawLine1(this.x, 0, this.x, this.y);
		drawLine1(0, this.y, this.x, this.y);
		this.context.restore();
	}
}

//31,177      49,176  radius=18
var component = function(context) {
	this.context = context;
	this.drawCircle = function(x, y, radius) {
		this.context.save();
		this.context.beginPath();
		this.context.strokeStyle='rgb(255,0,0)';
		this.context.arc(x,y, radius, 1/2*Math.PI, 3/2*Math.PI, true);
		this.context.stroke();
		//this.context.closePath();
		this.context.restore();
	}
	this.drawCircle = function(circle) {
		this.context.save();
		this.context.beginPath();
		this.context.strokeStyle='rgb(255,0,0)';
		if(typeof(circle.direction)=="undefined") {
			this.context.arc(circle.x, circle.y, circle.radius, 0, 2*Math.PI, true);
		} else if(circle.direction==1) {
			this.context.arc(circle.x, circle.y, circle.radius, 1/2*Math.PI, 3/2*Math.PI, false);
		} else if(circle.direction==2) {
			this.context.arc(circle.x, circle.y, circle.radius, 1/2*Math.PI, 3/2*Math.PI, true);
		}
		this.context.stroke();
		//this.context.closePath();
		this.context.restore();
	}
	this.drawRect = function(x, y, width, height, angle, rotate) {
		this.context.save();
		this.context.beginPath();
		this.context.strokeStyle='rgb(255,0,0)';
		if(rotate) {
			this.context.translate(x, y);
			this.context.rotate(angle);
			this.context.translate(-x, -y);
		}
		this.context.strokeRect(x, y, width, height);
		//this.context.closePath();
		this.context.restore();
	}
	this.drawLine = function(x, y, x1, y1, x2, y2, x3, y3) {
		this.context.save();
		this.context.beginPath();
		this.context.strokeStyle='rgb(255,0,0)';
		this.context.moveTo(x,y);
		this.context.lineTo(x1,y1);
		if(x2 != undefined && y2 != undefined) {
			this.context.lineTo(x2,y2);
			if(x3 != undefined && y3 != undefined) {
				this.context.lineTo(x3,y3);
			}
		}
		this.context.stroke();
		//this.context.closePath();
		this.context.restore();
	}
	this.drawLine = function(line) {
		this.context.save();
		this.context.beginPath();
		this.context.strokeStyle='rgb(255,0,0)';
		this.context.moveTo(line.x,line.y);
		this.context.lineTo(line.x1,line.y1);
		this.context.stroke();
		//this.context.closePath();
		this.context.restore();
	}
	this.display = function() {		
		
		for(var i=0, circle; circle=circles[i++];) {
			this.drawCircle(circle);
		}
		for(var i=0, circle; circle=endcircles[i++];) {
			this.drawCircle(circle);
		}
		for(var i=0, line; line=lines[i++];) {
			this.drawLine(line);
		}
		for(var i=0, sofa; sofa=sofas[i++];) {
			this.drawCircle(sofa);
		}
	}
} 
var lines = [];
var circles = [];
var endcircles = [];
var sofas = [];
var sponge;//海绵
function buildComp(context) {
	lines.push(new Line(400, 210, 400, 150));
	lines.push(new Line(400, 150, 380, 134));
	lines.push(new Line(380, 134, 344, 119));
	lines.push(new Line(344, 119, 344, 101));
	lines.push(new Line(344, 101, 305, 86));
	lines.push(new Line(305, 86, 292, 86));
	lines.push(new Line(292, 86, 291, 96));
	lines.push(new Line(291, 96, 235, 88));
	lines.push(new Line(235, 88, 158, 89));
	lines.push(new Line(158, 89, 105, 103));
	lines.push(new Line(105, 103,99, 82));
	lines.push(new Line(99, 82, 79, 92));
	lines.push(new Line(79, 92, 82, 96));
	lines.push(new Line(82, 96, 48, 127));
	lines.push(new Line(48, 127, 44, 122));
	lines.push(new Line(44, 122, 31, 146));
	lines.push(new Line(31, 146, 31, 158));
	circles.push(new Circle(31, 176, 18, 2));
	lines.push(new Line(31, 194, 31, 206));
	circles.push(new Circle(31, 224, 18, 2));
	lines.push(new Line(31, 242, 31, 255));
	circles.push(new Circle(31, 273, 18, 2));
	lines.push(new Line(31, 291, 31, 313));
	lines.push(new Line(31, 313, 40, 313));
	lines.push(new Line(40, 313, 40, 360));
	lines.push(new Line(40, 360, 31, 360));
	lines.push(new Line(31, 360, 31, 381));
	lines.push(new Line(31, 381, 42, 381));
	lines.push(new Line(42, 381, 42, 425));
	lines.push(new Line(42, 425, 31, 425));
	lines.push(new Line(31, 425, 31, 453));

	
	
	//斗
	lines.push(new Line(117, 514, 166, 479));
	lines.push(new Line(166, 479, 168, 461));
	lines.push(new Line(168, 461, 160, 434));

	//虫洞
	sofas.push(new Sofa(144, 159, 14, 103, 262, 14));	
	//sofas.push(new Circle(103, 262, 16));
	
	sofas.push(new Sofa(250, 164, 14, 291, 266, 14));
	//sofas.push(new Circle(291, 266, 16));
	
	//虫洞
	sofas.push(new Sofa(122, 345, 9, 161, 403, 9));	
	//sofas.push(new Circle(161, 403, 9));
	
	sofas.push(new Sofa(264, 336, 9, 224, 394, 9));
	//sofas.push(new Circle(224, 394, 9));
	
	//斗
	lines.push(new Line(263, 516, 224, 479));
	lines.push(new Line(224, 479, 222, 461));
	lines.push(new Line(222, 461, 232, 434));
	
	//中间柱子
	lines.push(new Line(190, 434, 185, 282));
	lines.push(new Line(185, 282, 173, 258));
	lines.push(new Line(173, 258, 195, 230));
	//lines.push(new Line(176, 264, 196, 239));//
	
	lines.push(new Line(201, 434, 206, 282));
	lines.push(new Line(206, 282, 218, 258));
	lines.push(new Line(218, 258, 195, 230));
	//lines.push(new Line(194, 238, 215, 262));//
	
	lines.push(new Line(360, 287, 360, 301));
	lines.push(new Line(360, 301, 350, 301));
	lines.push(new Line(350, 301, 350, 350));
	lines.push(new Line(350, 350, 360, 350));
	lines.push(new Line(360, 350, 360, 369));
	lines.push(new Line(360, 369, 349, 369));
	lines.push(new Line(349, 369, 349, 413));
	lines.push(new Line(349, 413, 360, 413));
	lines.push(new Line(360, 413, 360, 453));
	circles.push(new Circle(360, 270, 18, 1));
	lines.push(new Line(360, 238, 360, 251));
	circles.push(new Circle(370, 240, 8));
	
	endcircles.push(new Circle(216, 435, 14));
	endcircles.push(new Circle(174, 435, 14));
	/** */
	lines.push(new Line(370, 237, 386, 211));

	
	//活动板
	lines.push(new Line(31, 452, 77, 505));
	//lines.push(new Line(31, 476, 74, 510));
	
	lines.push(new Line(360, 451, 312, 499));
	//lines.push(new Line(360, 476, 317, 503));
	
	//补充空白线
	lines.push(new Line(360, 237, 360, 451));
	lines.push(new Line(31, 452, 31, 146));
	lines.push(new Line(44, 121, 78, 92));
	/**
	var comp = new component(context);
	comp.display();
	*/
}

var ReverseBar = function(line1, line2) {
	this.line1 = line1;//
	this.line2 = line2;

	this.checkClick = function(x, y) {
		var k1 = (this.line1.y1-this.line1.y)/(this.line1.x-this.line1.x1);
		var m1 = -this.line1.y-k1*this.line1.x;
		var k2 = (this.line2.y1-this.line2.y)/(this.line2.x-this.line2.x1);
		var m2 = -this.line2.y-k2*this.line2.x;
		//console.log("k1="+k1+",m1="+m1+",k2="+k2+",m2="+m2);
		var x1 = (-y-m1)/k1;
		var x2 = (-y-m2)/k2;
		var y1 = -(k1*x+m1);
		var y2 = -(k2*x+m2);
		var minx = Math.min(x1, x2);
		var maxx = Math.max(x1, x2);
		var miny = Math.min(y1, y2);
		var maxy = Math.max(y1, y2);
		//return (-(k1*x+m1)<=y && -(k2*x+m2)>=y && (-y-m1)/k1<=x && (-y-m2)/k2>=x );
		return (miny<=y && maxy>=y && minx<=x && maxx>=x );
	}
}

// Points........................................................

var Point = function (x, y) {
   this.x = x;
   this.y = y;
};
Point.prototype = {
   rotate: function (rotationPoint, angle) {
      var tx, ty, rx, ry;   
      tx = this.x - rotationPoint.x; // tx = translated X
      ty = this.y - rotationPoint.y; // ty = translated Y
      rx = tx * Math.cos(-angle) - // rx = rotated X
           ty * Math.sin(-angle);
      ry = tx * Math.sin(-angle) + // ry = rotated Y
           ty * Math.cos(-angle);
      return new Point(rx + rotationPoint.x, ry + rotationPoint.y); 
   }
};

var Line = function(x, y, x1, y1) {
	this.x = x;
	this.y = y;
	this.x1 = x1;
	this.y1 = y1;
}
// Lines.........................................................
var Line2 = function(p1, p2) {
   this.p1 = p1;  // point 1
   this.p2 = p2;  // point 2
}
Line2.prototype.intersectionPoint = function (line) {
   var m1, m2, b1, b2, ip = new Point();
   if (this.p1.x === this.p2.x) {
      m2 = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);
      b2 = line.p1.y - m2 * line.p1.x;
      ip.x = this.p1.x;
      ip.y = m2 * ip.x + b2;
   } else if(line.p1.x === line.p2.x) {
      m1 = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
      b1 = this.p1.y - m1 * this.p1.x;
      ip.x = line.p1.x;
      ip.y = m1 * ip.x + b1;
   } else {
     m1 = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
      m2 = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);
      b1 = this.p1.y - m1 * this.p1.x;
      b2 = line.p1.y - m2 * line.p1.x;
      ip.x = (b2 - b1) / (m1 - m2);
      ip.y = m1 * ip.x + b1;
   }
   return ip;
};
/**
var line1 = new Line2(new Point(238,205), new Point(145,295));
var line2 = new Line2(new Point(116,311), new Point(255,302));
var p1 = line1.intersectionPoint(line2);
show(p1.x, p1.y);
*/
//left 1, right 2, all 无参数
var Circle = function(x, y, radius, direction) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.direction = direction;
}
//虫洞  和另一对应口
var Sofa = function(x, y, radius, dx, dy, dradius) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.dx = dx;
	this.dy = dy;
	this.dradius = dradius;
}
//弹簧 spring(380,340) (400,445)

//alert(Math.atan(th/tw)*180/Math.PI);

var leftReverseBar = new ReverseBar(new Line(31, 452, 77, 505),new Line(31, 476, 74, 510));
var rightReverseBar = new ReverseBar(new Line(360, 451, 312, 499),new Line(360, 476, 317, 503));