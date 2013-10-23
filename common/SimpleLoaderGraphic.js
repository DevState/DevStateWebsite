//has a dependency on SimpleGeometry

(function (window){
	
	//arcLength must be between 0 and Math.PI * 2
	SimpleLoaderGraphic = function(x, y, radius, updateHandler, arcLength){
		SimpleGeometry.Circle.call(this, x, y, radius); //call super constructor.
		this.updateHandler = updateHandler;
		this.arcLength = isNaN(arcLength) ? Math.PI*.8 : arcLength;
		this.loadingTextFillStyle = "#CCCCCC";
		this.loadingText = "";
		this.lineWidth = 14;//stroke width of spinner in pixels
		this.frameRate = 25;
		this.velocity = .1;//expressed as a radian
		this.intervalId = -1;
		this.linearGradientStart = new SimpleGeometry.Point();
		this.linearGradientEnd = new SimpleGeometry.Point();
	};
	
	//subclass extends superclass
	SimpleLoaderGraphic.prototype = Object.create(SimpleGeometry.Circle.prototype);
	SimpleLoaderGraphic.prototype.constructor = SimpleGeometry.Circle;
	
	SimpleLoaderGraphic.prototype.startStrokeGradientColor = SimpleGeometry.getRgbaStyleString(0xCC, 0xCC, 0xCC, 0);
	//front gradient color of spinner, red, green and blue values from 0-255, alpha from 0-1
	SimpleLoaderGraphic.prototype.setStrokeStartColor = function(red, green, blue, alpha){
		this.startStrokeGradientColor = SimpleGeometry.getRgbaStyleString(red, green, blue, alpha);
	};
	
	SimpleLoaderGraphic.prototype.endStrokeGradientColor = SimpleGeometry.getRgbaStyleString(0xCC, 0xCC, 0xCC, 1);
	//front gradient color of spinner, red, green and blue values from 0-255, alpha from 0-1
	SimpleLoaderGraphic.prototype.setEndStartColor = function(red, green, blue, alpha){
		this.endStrokeGradientColor = SimpleGeometry.getRgbaStyleString(red, green, blue, alpha);
	};
	
	SimpleLoaderGraphic.prototype.play = function(){
		this.radian = 0;
		var _this = this;
		this.intervalId = setInterval(function(){_this.rotate();},this.frameRate);
	};
	
	//TODO : rename to stop
	SimpleLoaderGraphic.prototype.pause = function(){
		if(!isNaN(this.intervalId)){
			clearInterval(this.intervalId);
		}
		this.updateHandler = undefined;
		delete this.intervalId;
	};
	
	SimpleLoaderGraphic.prototype.rotate = function(){
		this.radian += this.velocity;
		this.radian = SimpleGeometry.constrainRadianTo2PI(this.radian);
		if(this.updateHandler){
			this.updateHandler();
		}
	};
	
	SimpleLoaderGraphic.prototype.render = function(context){
		//render spinner
		context.beginPath();
		this.linearGradientStart.x = this.x + Math.cos(this.radian) * (this.radius + 10);
		this.linearGradientStart.y = this.y + Math.sin(this.radian) * (this.radius + 10);
		this.linearGradientEnd.x = this.x + Math.cos(this.radian + this.arcLength) * (this.radius + 10);
		this.linearGradientEnd.y = this.y + Math.sin(this.radian + this.arcLength) * (this.radius + 10);

		var gradient = context.createLinearGradient(this.linearGradientStart.x, this.linearGradientStart.y, this.linearGradientEnd.x, this.linearGradientEnd.y);// linear gradient from start to end of line
		gradient.addColorStop(0, this.startStrokeGradientColor);
		gradient.addColorStop(1, this.endStrokeGradientColor);
		context.strokeStyle = gradient;
		
		context.lineWidth = this.lineWidth;
		context.lineCap = "round";

		context.arc(this.x, this.y, this.radius, this.radian, this.radian + this.arcLength);//x, y, radius, from, to

		context.stroke();
		context.closePath();
		
		//render text
		if(this.loadingText==""){
			return;
		}
		
		context.textBaseline = "top";
		context.fillStyle = this.loadingTextFillStyle;
		context.font = "30px 'sf_collegiate_solidregular'";
		var metrics = context.measureText(this.loadingText);
		context.fillText (this.loadingText, this.x - metrics.width/2, this.y+this.radius+this.lineWidth);
		
	};

	window.SimpleLoaderGraphic=SimpleLoaderGraphic;
	
}(window));


