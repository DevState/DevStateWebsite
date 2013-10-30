(function (window){

	SimpleGeometry = function(){};

	SimpleGeometry.degreesToRadians = function(degrees){
		return degrees * (Math.PI/180);
	};

	SimpleGeometry.radiansToDegrees = function(radians){
		return radians * (180/Math.PI)
	};
	
	SimpleGeometry.PI2 = 2 * Math.PI;
	SimpleGeometry.PI_HALF = Math.PI/2;
	SimpleGeometry.PI_FOURTH = Math.PI/4;
	
	//return number between 1 and 0
	SimpleGeometry.normalize = function(value, minimum, maximum){
		return (value - minimum) / (maximum - minimum);
	};

	//map normalized number to values
	SimpleGeometry.interpolate = function(normValue, minimum, maximum){
		return minimum + (maximum - minimum) * normValue;
	};

	//map a value from one set to another
	SimpleGeometry.map = function(value, min1, max1, min2, max2){
		return SimpleGeometry.interpolate( SimpleGeometry.normalize(value, min1, max1), min2, max2);
	};

	SimpleGeometry.getRandomPositiveOrNegativeOne = function(){
		return Math.random() > .5 ? 1 : -1;
	};

	//constrain degrees between 0 and 360
	SimpleGeometry.constrainDegreeTo360 = function(degree){
		return (360+degree%360)%360;//hmmm... looks a bit weird?!
	};
	
	//constrain radians between 0 and 2PI
	SimpleGeometry.constrainRadianTo2PI = function(rad){
		return (SimpleGeometry.PI2+rad%SimpleGeometry.PI2)%SimpleGeometry.PI2;//equally so...
	};
	
	//constrains a number within a range
	SimpleGeometry.clamp = function(number, min, max){
		if(number<min){
			return min;
		}
		if(number>max){
			return max;
		}
		return number;
	};
	
	SimpleGeometry.getRandomFillStyleColor = function(alpha, maxColorValue){
		if(isNaN(maxColorValue)){
			maxColorValue = 255;
		}
		var c = [];
		for(var i=0; i<3; i++){
			c[i] = Math.floor(Math.random()*maxColorValue);
		}
		return SimpleGeometry.getRgbaStyleString(c[0], c[1], c[2], isNaN(alpha) ? 1 : SimpleGeometry.clamp(alpha,0,1));
	};
	
	SimpleGeometry.getRgbaStyleString = function(red, green, blue, alpha){
		return "rgba("+red+","+green+","+blue+","+alpha+")";
	};
	
	SimpleGeometry.setIdentityMatrixToContext = function(context){
		context.setTransform(1,0,0,1,0,0);
	};
	
	//==================================================
	//=====================::POINT::====================
	//==================================================

	SimpleGeometry.Point = function (x,y){
		this.x=isNaN(x) ? 0 : x;
		this.y=isNaN(y) ? 0 : y;
	};
		
	SimpleGeometry.Point.prototype.clone = function(){
		return new SimpleGeometry.Point(this.x,this.y);
	};
	
	SimpleGeometry.Point.prototype.equals = function(point){
		return this.x==point.x && this.y==point.y;
	};
	
	SimpleGeometry.Point.prototype.toString = function(){
		return "{x:"+this.x+" , y:"+this.y+"}";
	};
	
	SimpleGeometry.distanceBetweenTwoPoints = function( point1, point2 ){
		//console.log("Math.pow(point2.x - point1.x,2) : ",Math.pow(point2.x - point1.x,2));
		return Math.sqrt( Math.pow(point2.x - point1.x,2) + Math.pow(point2.y - point1.y,2) );
	};
	
	SimpleGeometry.angleBetweenTwoPoints = function(p1,p2){
		return Math.atan2(p1.y-p2.y, p1.x-p2.x);			
	};
	
	SimpleGeometry.mirrorPointInRectangle = function(point,rect){
		return new SimpleGeometry.Point(rect.width-point.x,rect.height-point.y);
	};
	
	SimpleGeometry.randomizePoint = function(point,randomValue){
		return new SimpleGeometry.Point(-randomValue+Math.random()*randomValue+point.x,-randomValue+Math.random()*randomValue+point.y);
	};

	
	//==================================================
	//=====================::TRIANGLE::====================
	//==================================================

	SimpleGeometry.Triangle = function (a,b,c){
		this.a = a ? a : new SimpleGeometry.Point(0,0);
		this.b = b ? b : new SimpleGeometry.Point(0,0);
		this.c = c ? c : new SimpleGeometry.Point(0,0);
	};
	
	SimpleGeometry.Triangle.prototype.equals = function(triangle){
		return this.a.equals(triangle.a) && this.b.equals(triangle.b) && this.c.equals(triangle.c);
	};
	
	SimpleGeometry.Triangle.prototype.clone = function(){
		return new SimpleGeometry.Triangle(new SimpleGeometry.Point(this.a.x,this.a.y),new SimpleGeometry.Point(this.b.x,this.b.y),new SimpleGeometry.Point(this.c.x,this.c.y));
	};

	SimpleGeometry.Triangle.prototype.getSmallestX = function(){
		return Math.min(this.a.x,this.b.x,this.c.x);
	};
	SimpleGeometry.Triangle.prototype.getSmallestY = function(){
		return Math.min(this.a.y,this.b.y,this.c.y);		
	};
	
	SimpleGeometry.Triangle.prototype.getBiggestX = function(){
		return Math.max(this.a.x,this.b.x,this.c.x);
	};
	SimpleGeometry.Triangle.prototype.getBiggestY = function(){
		return Math.max(this.a.y,this.b.y,this.c.y);
	};

	SimpleGeometry.Triangle.prototype.containsVertex = function(point){
		//console.log("SimpleGeometry.Triangle.containsVertex",this.toString(),point.toString());
		return (this.a.x==point.x && this.a.y==point.y) || (this.b.x==point.x && this.b.y==point.y) || (this.c.x==point.x && this.c.y==point.y);
	};
	
	SimpleGeometry.Triangle.prototype.toString = function(){
		return "toString() Triangle{a:"+this.a+" , b:"+this.b+" , c:"+this.c+"}";
	};
	
	SimpleGeometry.Triangle.prototype.containsVertex = function(point){
		return (this.a.x==point.x && this.a.y==point.y) || (this.b.x==point.x && this.b.y==point.y) || (this.c.x==point.x && this.c.y==point.y);
	};
	
	SimpleGeometry.Triangle.prototype.sharesEdge = function(triangle){
		//console.log("SimpleGeometry.Triangle.sharesEdge",this.toString(),triangle.toString());
		var sharedPoints=0;
		if(this.containsVertex(triangle.a)){
			sharedPoints++;
		}
		if(this.containsVertex(triangle.b)){
			sharedPoints++;
		}
		if(this.containsVertex(triangle.c)){
			sharedPoints++;
		}
		//console.log("sharesEdge()",sharedPoints);
		return sharedPoints==2;
	};
	
	//==================================================
	//===================::RECTANGLE::==================
	//==================================================

	//TODO : Extend point?
	SimpleGeometry.Rectangle = function (x,y,width,height){
		this.x=x;
		this.y=y;
		this.width=width;
		this.height=height;
	};
	
	SimpleGeometry.Rectangle.prototype.getRight = function(){
		return this.x+this.width;
	};
	
	SimpleGeometry.Rectangle.prototype.getBottom = function(){
		return this.y+this.height;
	};
	
	SimpleGeometry.Rectangle.prototype.containsPoint = function(point){
		return point.x>this.x && point.y>this.y && point.x<this.getRight() && point.y<this.getBottom();
	};
	//questionable... center should not be relative to canvas itself...
	SimpleGeometry.Rectangle.prototype.getCenter = function(){
		return new SimpleGeometry.Point(this.x+this.width/2,this.y+this.height/2);
	};
	
	SimpleGeometry.Rectangle.prototype.clone = function(){
		return new SimpleGeometry.Rectangle(this.x,this.y,this.width,this.height);
	};
	
	SimpleGeometry.Rectangle.prototype.toString = function(){
		return "Rectangle{x:"+this.x+" , y:"+this.y+" , width:"+this.width+" , height:"+this.height+"}";
    };

	window.SimpleGeometry=SimpleGeometry;
	
	//==================================================
	//=====================::CIRCLE::===================
	//==================================================

	SimpleGeometry.Circle = function (x,y,radius){
		this.radius=isNaN(radius) ? 10 : radius;
		SimpleGeometry.Point.call(this,x,y); //call super constructor.
	};
	
	//subclass extends superclass
	SimpleGeometry.Circle.prototype = Object.create(SimpleGeometry.Point.prototype);
	SimpleGeometry.Circle.prototype.constructor = SimpleGeometry.Point;
	
	SimpleGeometry.Circle.prototype.getRandomPointInCircle = function(){
		var radius = Math.random() * this.radius;
		var radian = Math.random() * SimpleGeometry.PI2;
		var x = this.x + Math.cos(radian) * radius;
		var y = this.y + Math.sin(radian) * radius;
		return new SimpleGeometry.Point(x, y);
	};
	
	SimpleGeometry.Circle.prototype.clone = function(){
		return new SimpleGeometry.Circle(this.x,this.y,this.radius);
	};
	
	
	//==================================================
	//=====================::TRANSFORM::===================
	//==================================================

	//(1,0,0,1,0,0);
	SimpleGeometry.Transform = function (scaleX, skewX, skewY, scaleY, tx, ty){
		this.update(isNaN(scaleX) ? 1 : scaleX, isNaN(skewX) ? 0 : skewX, isNaN(skewY) ? 0 : skewY,
					isNaN(scaleY) ? 1 : scaleY, isNaN( tx) ?  0 : tx, isNaN(ty) ? 0 : ty);
	};

	SimpleGeometry.Transform.prototype.update = function (scaleX, skewX, skewY, scaleY, tx, ty){
		this.scaleX = scaleX;
		this.skewX = skewX;
		this.skewY = skewY;
		this.scaleY = scaleY;
		this.tx = tx;
		this.ty = ty;	
	};
	
	SimpleGeometry.Transform.prototype.toString = function() {
		return "SimpleGeometry.Transform{scaleX:"+this.scaleX+" ,skewX:"+this.skewX+" ,skewY:"+this.skewY+" ,scaleY:"+this.scaleY+" ,tx:"+this.tx+" ,ty:"+this.ty+"}";
	};


    //==================================================
    //=====================::Point3d::====================
    //==================================================


    SimpleGeometry.Point2d = function (x, y, t){
        this.x = isNaN(x) ? 0 : x;
        this.y = isNaN(y) ? 0 : y;
        this.t = isNaN(t) ? 0 : t;
    };

    SimpleGeometry.Point2d.prototype.toString = function(){
        return "x: " + this.x + ", y: " + this.y + ", t: " + this.t;
    };


    SimpleGeometry.Point3d = function (x,y, z){
        this.x = isNaN(x) ? 0 : x;
        this.y = isNaN(y) ? 0 : y;
        this.z = isNaN(z) ? 0 : z;
    };

    SimpleGeometry.Point3d.prototype.clone = function(){
        return new SimpleGeometry.Point3d(this.x, this.y, this.z);
    };

    SimpleGeometry.Point3d.prototype.copyValuesTo = function(point3d){
        point3d.x = this.x;
        point3d.y = this.y;
        point3d.z = this.z;
    };

    SimpleGeometry.Point3d.prototype.equals = function(point){
        return this.x==point.x && this.y==point.y && this.z==point.z;
    };

    //TODO move this elsewhere, currently used in Test3d.html
    SimpleGeometry.Point3d.prototype.project = function(focalLength, projectionCenter){
        var t = focalLength / (focalLength+this.z);
        if (!projectionCenter){
            projectionCenter = new SimpleGeometry.Point(0, 0);
        }

        var xOffset = projectionCenter.x;
        var yOffset = projectionCenter.y;

        var x = this.x;
        var y = this.y;
        //var z = this.z;

        x -= xOffset;
        y -= yOffset;

        x = (x*t)+xOffset;
        y = (y*t)+yOffset;

        console.log("Point3d.project()", t, projectionCenter.toString(), xOffset, yOffset, x, y);

        return new SimpleGeometry.Point2d(x, y, t);
    };


    SimpleGeometry.Point3d.prototype.toString = function(){
        return "{x:"+this.x+" , y:"+this.y+" , z:"+this.z+"}";
    };

    window.SimpleGeometry=SimpleGeometry;

}(window));