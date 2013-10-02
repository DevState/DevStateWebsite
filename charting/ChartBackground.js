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
	ChartBackground.prototype.false3DColor = "#AAAADD";
	ChartBackground.prototype.false3DExtrusion = 0;
	ChartBackground.prototype.legendMargin = 10;
	
	ChartBackground.prototype.setBgColors = function(bgColor,bgStrokeColor){
		this.bgColor = bgColor;
		this.bgStrokeColor = bgStrokeColor;
	}
	

	//this lacks a "legend" the bgLines could have a number next to them?!
	ChartBackground.prototype.render=function(context, min, max){
		//color background
		
		var gradient = context.createLinearGradient(0, 0, 0, this.height);// linear gradient from start to end of line
		gradient.addColorStop(0, this.bgColorTop);
		gradient.addColorStop(1, this.bgColorBottom);
		

		
		if(this.false3DExtrusion > 0){
			//bg
			context.beginPath();
			context.fillStyle = gradient;
			context.moveTo(this.false3DExtrusion, 0);
			context.lineTo(this.width, 0);
			context.lineTo(this.width, this.height-this.false3DExtrusion);
			context.lineTo(this.width-this.false3DExtrusion, this.height);
			context.lineTo(0, this.height);
			context.lineTo(0, this.false3DExtrusion);
			context.lineTo(this.false3DExtrusion, 0);
			context.fill();
			context.closePath();
		
			context.fillStyle = this.false3DColor;
		
			//left side extrusion
			context.beginPath();
			context.moveTo(this.false3DExtrusion, 0);
			context.lineTo(this.false3DExtrusion, this.height);
			context.lineTo(0, this.height);
			context.lineTo(0, this.false3DExtrusion);
			context.lineTo(this.false3DExtrusion, 0);
			context.fill();
			context.closePath();
						
			//bottom extrusion
			context.beginPath();
			context.moveTo(0, this.height-this.false3DExtrusion);
			context.lineTo(this.width, this.height-this.false3DExtrusion);
			context.lineTo(this.width-this.false3DExtrusion, this.height);
			context.lineTo(0, this.height);
			context.lineTo(0, this.height-this.false3DExtrusion);
			context.fill();
			context.closePath();
		}else{
			context.fillStyle = gradient;
			context.fillRect(this.x, this.y, this.width, this.height);		
		}
		
		//draw background lines
		context.strokeStyle = this.bgStrokeColor;
		context.lineWidth=1;
		context.textBaseline = "bottom";
		var gap = (this.height-this.false3DExtrusion)/(this.numberOfBackgroundLines+1);
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
			
			context.shadowColor = SimpleGeometry.getRgbaStyleString(0x00,0x00,0x00,.4);
			context.shadowOffsetX = 1;
			context.shadowOffsetY = 1;
			context.shadowBlur    = 2;
			context.fillText (Math.round(legend), this.x+this.legendMargin , this.y+roundedYPos);
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur    = 0;
			
			legend-=legendIncrement;
		}
		context.fillText (Math.round(legend), this.x+this.legendMargin , this.y+roundedYPos+gap);
		legend-=legendIncrement;
	}
	
	window.ChartBackground=ChartBackground;
	
}(window));


