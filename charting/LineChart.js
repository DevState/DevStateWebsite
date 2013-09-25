//has a dependency on SimpleGeometry

(function (window){

	//set up event dispatching?  EventDispatcher

	LineChart=function(x,y,width,height){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.background=new ChartBackground(x,y,width,height);
	}
	
	//subclass extends superclass
	LineChart.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	LineChart.prototype.constructor = SimpleGeometry.Rectangle;
	
	LineChart.prototype.showDots=true;
	
	//values is a multi dimentional Array with values ranging from 0-100
	LineChart.prototype.setValues=function(values){
		this.min=0;
		this.max=100;
		this.values=values;
		var value;
		var longestArray = 0;
		for(var i=0; i<this.values.length; i++){
			for(var j=0;j<this.values[i].length;j++){
				if(this.values[i].length > longestArray){
					longestArray=this.values[i].length;
				}
			}
		}
		
		//either use min, or just stop rendering points if they don't exist?
		for(i=0;i<this.values.length; i++){
			while(this.values[i].length < longestArray){
				this.values[i].push(this.min);
			}
		}
		//console.log("LineChart.setValues() lines : ",this.values.length," min:",this.min," max:",this.max);
	}
	
	LineChart.prototype.setRandomValues=function(){
		var values = new Array();
		var lines = 1 + Math.floor(Math.random()*3);//between 1 and 4
		var points = 10 + Math.floor(Math.random()*30);//between 10 and 40
		var line,pointValue;
		while(lines>0){
			line = new Array();
			pointValue = Math.floor(Math.random()*100);
			for(var i=0;i<points;i++){
				line[i] = pointValue;
				pointValue += Math.floor(-3+Math.random()*6);
				pointValue = Math.max(pointValue, 0);//don't go below 0 (why?)
			}
			values.push(line);
			//console.log("LineChart.setRandomValues() line : "+line.toString());
			lines--;
		}
		this.setValues(values);	
	}
	
	//colors must be an array in the format ["#FF00FF","#FF00CC"...]
	LineChart.prototype.setLineColors=function(colors){
		this.colors=colors;	
	}
	LineChart.prototype.setRandomColors=function(){
		this.colors = new Array();
		while(this.colors.length != this.values.length){
			this.colors.push(SimpleGeometry.getRandomFillStyleColor(1,123));
		}
		//console.log("LineChart.setRandomColors",this.colors);
	}
	
	//shared with other components, inherit?
	LineChart.prototype.setBgColors=function(bgColor,bgStrokeColor){
		this.background.setBgColors(bgColor,bgStrokeColor);
	}
	LineChart.prototype.setNumberOfBackgroundLines=function(lines){
		this.background.numberOfBackgroundLines = lines;
	}
	
	LineChart.prototype.render=function(context,animationPercent){
		//console.log("LineChart.render()");
		if(!this.values){
			this.setRandomValues();
		}
		if(!this.colors){
			this.setRandomColors();
		}
		if(isNaN(animationPercent)){
			animationPercent = 1;
		}
		this.background.render(context, this.min, this.max);
		this.pointSpacer = (this.width-this.margin*2)/(this.values[0].length-1);
		for (var i = 0; i < this.values.length; i++) {
			this.renderLine(context,this.values[i],this.colors[i],animationPercent);
		}
	}
	
	LineChart.prototype.calculateYPosition=function(value,animationPercent){
		return SimpleGeometry.interpolate( SimpleGeometry.normalize(value, this.min, this.max) * animationPercent, this.getBottom(), this.y)
	}
	LineChart.prototype.renderPoint=new SimpleGeometry.Point();//TODO make static
	
	LineChart.prototype.margin = 30;
	
	LineChart.prototype.renderLine=function(context, line, color, animationPercent){
		if(animationPercent==0){
			return;
		}
		context.beginPath();
		context.strokeStyle = color;
		context.lineWidth = 1;
		context.moveTo(this.x + this.margin, this.calculateYPosition(line[0],animationPercent));
		//render lines
		for (var i = 1; i < line.length; i++) {
			this.renderPoint.x = this.x + this.margin + (this.pointSpacer * i);			
			this.renderPoint.y = this.calculateYPosition(line[i],animationPercent);
			context.lineTo(this.renderPoint.x, this.renderPoint.y);
		}
		
		context.stroke();
		context.closePath();
	
		if(animationPercent!=1 || !this.showDots){
			return;
		}
		
		//render dots
		context.fillStyle = color;
		for (var i = 0; i < line.length; i++) {
			context.beginPath();
			this.renderPoint.x = this.x + this.margin + (this.pointSpacer * i);			
			this.renderPoint.y = this.calculateYPosition(line[i],animationPercent);
			context.arc(this.renderPoint.x, this.renderPoint.y, 2, 0, SimpleGeometry.PI2);
			context.fill();
			context.closePath();
		}
	}
	
	/*
	LineChart.prototype.mouseMoveHandler=function(event){
		if(_animating || !_isOver){
			return;
		}
		_toolTip.visible=true;
		_positionOffset=Math.round((mouseX/_previousWidth)*this.valuesLengthMinus1);
		if(_previousPositionOffset!=_positionOffset){
			_toolTip.x= _positionOffset*(width/this.valuesLengthMinus1);
			_toolTip.y= calculateYPosition(this.values[_positionOffset])-_menuTipHalfHeight;
			_toolTip.updateToolTip(_happyNumberFormatter.format(this.values[_positionOffset]),mouseX<_halfWidth);
			_previousPositionOffset= _positionOffset;
		}
	}*/

	window.LineChart=LineChart;
	
}(window));


