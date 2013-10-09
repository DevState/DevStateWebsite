(function (window){

	
	//topRight, topLeft, bottomRight, bottomLeft must be Points
	TransformRectangle  =  function(topLeft, topRight, bottomRight, bottomLeft){
		
		this.topLeft  =  new SimpleGeometry.Point();
		this.topRight  =  new SimpleGeometry.Point();
		this.bottomRight  =  new SimpleGeometry.Point();
		this.bottomLeft  =  new SimpleGeometry.Point();
		if(topLeft){
			this.updatePoints(topLeft, topRight, bottomRight, bottomLeft);
		}
		this.triangleA  =  new SimpleGeometry.Triangle(this.topLeft, this.topRight, this.bottomLeft);
		this.triangleB  =  new SimpleGeometry.Triangle(this.bottomRight, this.bottomLeft, this.topRight);
		this.transform = new SimpleGeometry.Transform();
		this.imageTriangle = new SimpleGeometry.Triangle();
		//console.log(this.topLeft.toString(),this.topRight.toString(), this.bottomRight.toString(), this.bottomLeft.toString() );
	}

	TransformRectangle.prototype.updatePoints =  function(topLeft, topRight, bottomRight, bottomLeft){
		this.topLeft.x  =  topLeft.x;
		this.topLeft.y  =  topLeft.y;
		this.topRight.x  =  topRight.x;
		this.topRight.y  =  topRight.y;
		this.bottomRight.x  =  bottomRight.x;
		this.bottomRight.y  =  bottomRight.y;
		this.bottomLeft.x  =  bottomLeft.x;
		this.bottomLeft.y  =  bottomLeft.y;
	}
	
	TransformRectangle.prototype.updatePointsToTransformRectangle =  function(rect){
		this.updatePoints(rect.topLeft, rect.topRight, rect.bottomRight, rect.bottomLeft);
	}
	
	TransformRectangle.prototype.clone = function(){
		return new TransformRectangle(	new SimpleGeometry.Point(this.topLeft.x,this.topLeft.y),
										new SimpleGeometry.Point(this.topRight.x,this.topRight.y),
										new SimpleGeometry.Point(this.bottomRight.x,this.bottomRight.y),
										new SimpleGeometry.Point(this.bottomLeft.x,this.bottomLeft.y)
										);
	}

	TransformRectangle.prototype.render  =  function(context2d, image){
		if(image){
			this.renderImage(context2d, image);
		}
		//this.renderOutline(context2d);
		
	}
	
	TransformRectangle.prototype.renderImage  =  function(context2d, image){
		SimpleGeometry.setIdentityMatrixToContext(context2d);
		context2d.fillStyle  =  context2d.createPattern(image,'no-repeat');
		
		//TOP TRIANGLE
		this.imageTriangle.a.x = this.imageTriangle.a.y = this.imageTriangle.b.y = this.imageTriangle.c.x = 0;
		this.imageTriangle.b.x = image.width;
		this.imageTriangle.c.y = image.height;

		this.updateTriangleTransform(this.imageTriangle, this.triangleA );
		this.transform.tx = this.triangleA.a.x;
		this.transform.ty = this.triangleA.a.y;
		context2d.setTransform(	this.transform.scaleX, this.transform.skewX, this.transform.skewY, 
								this.transform.scaleY, this.transform.tx, this.transform.ty);
		//console.log(this.transform.toString());
		context2d.beginPath();
		context2d.moveTo(0,0);
		context2d.lineTo(image.width, 0);
		context2d.lineTo(0,image.height);
		context2d.moveTo(0,0);
		context2d.fill();
		context2d.closePath();
		SimpleGeometry.setIdentityMatrixToContext(context2d);

		//BOTTOM TRIANGLE
		this.imageTriangle.b.x = this.imageTriangle.c.y = 0;
		this.imageTriangle.a.x = this.imageTriangle.c.x = image.width;
		this.imageTriangle.a.y = image.height;
		this.imageTriangle.b.y = image.height;
		
		this.updateTriangleTransform(this.imageTriangle, this.triangleB);
		this.transform.ty = this.triangleA.a.y + (this.triangleA.b.y-this.triangleA.a.y)*2;
		context2d.setTransform(	this.transform.scaleX, this.transform.skewX, this.transform.skewY,
								this.transform.scaleY, this.transform.tx, this.transform.ty);
		//console.log(this.transform.toString());
		context2d.beginPath();	
		context2d.moveTo(image.width, image.height);
		context2d.lineTo(0, image.height);
		context2d.lineTo(0, image.height-1);
		context2d.lineTo(image.width-1, 0);
		context2d.lineTo(image.width, 0);
		context2d.lineTo(image.width, image.height);
		context2d.fill();
		context2d.closePath();
		
		SimpleGeometry.setIdentityMatrixToContext(context2d);
	}
	
	TransformRectangle.prototype.updateTriangleTransform = function (sourceTriangle,transformedTriangle){
		
		var xAngle = SimpleGeometry.angleBetweenTwoPoints( transformedTriangle.b,transformedTriangle.a );
		var yAngle = SimpleGeometry.angleBetweenTwoPoints( transformedTriangle.c,transformedTriangle.a );
		
		var transformedWidth = SimpleGeometry.distanceBetweenTwoPoints(transformedTriangle.a,transformedTriangle.b);
		var transformedHeight = SimpleGeometry.distanceBetweenTwoPoints( transformedTriangle.a,transformedTriangle.c );

		var xScale = transformedWidth/(sourceTriangle.b.x-sourceTriangle.a.x);
		var yScale = transformedHeight/(sourceTriangle.c.y-sourceTriangle.a.y);
	
		this.transform.scaleX = Math.cos(xAngle)*xScale;
		this.transform.scaleY = Math.sin(yAngle)*yScale;
		
		this.transform.skewX = Math.sin(xAngle)*xScale;
		this.transform.skewY = Math.cos(yAngle)*yScale;
	}
	
	TransformRectangle.prototype.renderOutline  =  function(context2d){
		context2d.strokeStyle  =  "#FF0000";
		context2d.lineWidth  =  1;
		context2d.beginPath();
		context2d.moveTo(this.triangleA.a.x,this.triangleA.a.y);
		context2d.lineTo(this.triangleA.b.x,this.triangleA.b.y);
		context2d.lineTo(this.triangleA.c.x,this.triangleA.c.y);
		context2d.lineTo(this.triangleA.a.x,this.triangleA.a.y);		
		context2d.stroke();
		context2d.closePath();
		
		context2d.beginPath();
		context2d.moveTo(this.triangleB.a.x,this.triangleB.a.y);
		context2d.lineTo(this.triangleB.b.x,this.triangleB.b.y);
		context2d.lineTo(this.triangleB.c.x,this.triangleB.c.y);
		context2d.lineTo(this.triangleB.a.x,this.triangleB.a.y);
		context2d.stroke();
		context2d.closePath();
	}
	
	window.TransformRectangle  =  TransformRectangle;
	
}(window));