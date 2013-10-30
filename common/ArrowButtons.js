(function (window){


	//container is a rectangle
	ArrowButtons = function(container, arrowWidth, arrowHeight, margin){
		SimpleGeometry.Rectangle.call(this,container.x, container.y, container.width, container.height); //call super constructor.
		this.arrowWidth = isNaN(arrowWidth) ? 10 : arrowWidth;
		this.arrowHeight = isNaN(arrowHeight) ? 18 : arrowHeight;
		this.margin = isNaN(margin) ? 5 : margin;
		this.lineWidth = 5;
		this.strokeStyle = SimpleGeometry.getRgbaStyleString(0xFF,0xFF,0xFF,1);
		this.fillStyle = SimpleGeometry.getRgbaStyleString(0,0,0,1);
	};
	
	//subclass extends superclass
	ArrowButtons.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	ArrowButtons.prototype.constructor = SimpleGeometry.Rectangle;
		
	ArrowButtons.prototype.render = function(context2d, hideLeft, hideRight){
		context2d.beginPath();
		context2d.lineWidth = this.lineWidth;
		context2d.strokeStyle = this.strokeStyle;
		context2d.fillStyle = this.fillStyle;
		context2d.lineCap = "butt"; //"square";//
		
		if(!hideLeft){
			//left arrow graphic
			context2d.moveTo(this.x + this.arrowWidth + this.margin, this.y + this.height/2 );
			context2d.lineTo(this.x + this.arrowWidth + this.margin, this.y + this.height/2 - this.arrowHeight /2);
			context2d.lineTo(this.x + this.arrowWidth + this.margin, this.y + this.height/2 + this.arrowHeight /2);
			context2d.lineTo(this.x + this.margin, this.y + this.height/2 );
			context2d.lineTo(this.x + this.arrowWidth + this.margin, this.y + this.height/2 - this.arrowHeight /2);
			context2d.lineTo(this.x + this.arrowWidth + this.margin, this.y + this.height/2 );
		}
		
		if(!hideRight){
			//right arrow graphic
			context2d.moveTo(this.getRight() - this.arrowWidth - this.margin, this.y + this.height/2 );
			context2d.lineTo(this.getRight() - this.arrowWidth - this.margin, this.y + this.height/2 - this.arrowHeight /2);
			context2d.lineTo(this.getRight() - this.arrowWidth - this.margin, this.y + this.height/2 + this.arrowHeight /2);
			context2d.lineTo(this.getRight() - this.margin, this.y + this.height/2 );
			context2d.lineTo(this.getRight() - this.arrowWidth - this.margin, this.y + this.height/2 - this.arrowHeight /2);	
			context2d.lineTo(this.getRight() - this.arrowWidth - this.margin, this.y + this.height/2 );
		}
		context2d.stroke();
		context2d.fill();
		context2d.closePath();
		
		context2d.lineWidth = 0;
	};

	window.ArrowButtons = ArrowButtons;
	
}(window));


