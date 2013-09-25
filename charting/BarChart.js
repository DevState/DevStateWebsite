//has a dependency on SimpleGeometry
(function (window){

	//set up event dispatching?  EventDispatcher

	BarChart=function(x,y,width,height,barWidth){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.background=new ChartBackground(x,y,width,height);
		if(!isNaN(barWidth)){
			this.barWidth=barWidth;
		}
	}
	
	//subclass extends superclass
	BarChart.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	BarChart.prototype.constructor = SimpleGeometry.Rectangle;
	
	//values is an Array of numbers greater than 0
	//max must be bigger than or equal to biggest number in values
	BarChart.prototype.setValues=function(values, max){
		this.values=values;
		this.max=max;
	}
	
	BarChart.prototype.setRandomValues=function(){
		var values = new Array();
		var total = 4 + Math.floor(Math.random()*4);//between 4 and 8
		while(total > 0){
			values.push(10 + Math.floor(Math.random()*90));
			total--;
		}
		this.setValues(values,100);
	}
	
	//colors must be an array in the format ["#FF00FF","#FF00CC"...]
	BarChart.prototype.setBarColors=function(colors){
		this.colors=colors;	
	}
	BarChart.prototype.setRandomColors=function(){
		this.colors = new Array();
		while(this.colors.length != this.values.length){
			this.colors.push(SimpleGeometry.getRandomFillStyleColor());
		}
	}
	
	//shared with other components, inherit?
	BarChart.prototype.setBgColors=function(bgColor,bgStrokeColor){
		this.background.setBgColors(bgColor,bgStrokeColor);
	}
	BarChart.prototype.setNumberOfBackgroundLines=function(lines){
		this.background.numberOfBackgroundLines = lines;
	}
	
	//move, Line Chart uses the same, maybe move to ChartBackground? Rename ChartBackground to ChartUtil?
	BarChart.prototype.calculateYPosition=function(value,animationPercent){
		return SimpleGeometry.interpolate( SimpleGeometry.normalize(value, 0, this.max) * animationPercent, this.getBottom(), this.y)
	}
	BarChart.prototype.renderPoint=new SimpleGeometry.Point();//TODO make static

	BarChart.prototype.render=function(context,animationPercent){
		if(!this.values){
			this.setRandomValues();
		}
		if(!this.colors){
			this.setRandomColors();
		}
		if(isNaN(animationPercent)){
			animationPercent = 1;
		}
		this.background.render(context, 0, this.max);
		if(!this.barWidth){
			this.barWidth = (this.width/2)/this.values.length;
		}
		this.barSpacer = (this.width - this.barWidth * this.values.length) / (this.values.length+1);//TODO : add comment, move to a method?
		//render bars
		
		context.strokeStyle = "#FFFFFF";
		for (var i = 0; i < this.values.length; i++) {
			context.fillStyle = this.colors[i];
			this.renderPoint.x = this.x + this.barSpacer + (this.barSpacer * i) + (this.barWidth * i);			
			this.renderPoint.y = this.calculateYPosition(this.values[i], animationPercent);
			context.fillRect(this.renderPoint.x, this.renderPoint.y, this.barWidth, this.y+this.height-this.renderPoint.y);
			context.strokeRect(this.renderPoint.x, this.renderPoint.y, this.barWidth, this.y+this.height-this.renderPoint.y);
		}
	}

	window.BarChart=BarChart;
	
}(window));