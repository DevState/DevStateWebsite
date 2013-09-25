//has a dependency on SimpleGeometry

(function (window){

	//set up event dispatching?  EventDispatcher

	ChartBackground=function(x,y,width,height){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
	}
	
	//subclass extends superclass
	ChartBackground.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	ChartBackground.prototype.constructor = SimpleGeometry.Rectangle;

	ChartBackground.prototype.numberOfBackgroundLines = 9;
	
	ChartBackground.prototype.bgColorTop = "#EFEFFF";
	ChartBackground.prototype.bgColorBottom = "#BBBBFF";
	ChartBackground.prototype.bgStrokeColor = "#9999FF";//TODO rename to bgStrokeStyle, include a stroke thickness?
	ChartBackground.prototype.setBgColors = function(bgColor,bgStrokeColor){
		this.bgColor = bgColor;
		this.bgStrokeColor = bgStrokeColor;
	}
	

	//this lacks a "legend" the bgLines could have a number next to them?!
	ChartBackground.prototype.render=function(context, min, max){
		//color background
		context.beginPath();
		
		var gradient = context.createLinearGradient(0, 0, 0, this.height);// linear gradient from start to end of line
		gradient.addColorStop(0, this.bgColorTop);
		gradient.addColorStop(1, this.bgColorBottom);

		
		context.fillStyle = gradient;
		context.fillRect(this.x, this.y, this.width, this.height);
		context.closePath();
		
		//draw background lines
		context.strokeStyle = this.bgStrokeColor;
		context.lineWidth=1;
		context.textBaseline = "bottom";
		var gap = this.height/(this.numberOfBackgroundLines+1);
		var yPos=gap;
		var roundedYPos;
		var legendIncrement = (max-min)/(this.numberOfBackgroundLines+1);
		var legend = max-legendIncrement;
		context.fillStyle = "#FFFFFF";
		context.font = "bold 16px sans-serif";
		for(var i=0;i<this.numberOfBackgroundLines;i++){
			context.beginPath();
			roundedYPos=Math.round(yPos);
			context.moveTo(this.x,this.y+roundedYPos);
			context.lineTo(this.x+this.width,this.y+roundedYPos);
			context.stroke();
			context.closePath();
			yPos+=gap;
			context.fillText (Math.round(legend), this.x+4 , this.y+roundedYPos);
			legend-=legendIncrement;
		}
		context.fillText (Math.round(legend), this.x+4 , this.y+roundedYPos+gap);
		legend-=legendIncrement;
	}
	
	window.ChartBackground=ChartBackground;
	
}(window));


