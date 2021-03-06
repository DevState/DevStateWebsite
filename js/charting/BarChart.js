//has a dependency on SimpleGeometry
(function (window){

	BarChart = function(x, y, width, height, barWidth){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		if(!isNaN(barWidth)){
			this.barWidth=barWidth;
		}
		this.renderPoint=new SimpleGeometry.Point();//Use one instance, instead of a local variable in method. TODO make static
		this.extrudeWidth = 6;
        //this.lightColor = DSColors.LIGHT_GREEN;
        //this.darkColor = DSColors.GREEN;

        this.lightColor = DSColors.PINK_ORANGE;
        this.darkColor = DSColors.ORANGE;
	};
	
	//subclass extends superclass
	BarChart.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	BarChart.prototype.constructor = SimpleGeometry.Rectangle;
	
	//values is an Array of numbers greater than 0
	//max must be bigger than or equal to biggest number in values
	BarChart.prototype.setValues = function(values, max){
		this.values=values;
		this.max=max;
	};
	
	BarChart.prototype.setRandomValues = function(){
		var values = [];
		var total = 3 + Math.floor(Math.random()*3);//between 4 and 8
		while(total > 0){
			values.push(10 + Math.floor(Math.random()*90));
			total--;
		}
		this.setValues(values,100);
	};
	
	//colors must be an array in the format ["#FF00FF","#FF00CC"...]
	BarChart.prototype.setBarColors = function (colors) {
        this.colors = colors;
    };
	BarChart.prototype.setRandomColors = function(){
		this.colors = [];
		while(this.colors.length != this.values.length){
			this.colors.push(SimpleGeometry.getRandomFillStyleColor());
		}
	};
	
	//move, Line Chart uses the same, maybe move to ChartBackground? Rename ChartBackground to ChartUtil?
	BarChart.prototype.calculateYPosition = function(value,animationPercent){
		return SimpleGeometry.interpolate( SimpleGeometry.normalize(value, 0, this.max) * animationPercent, this.getBottom(), this.y)
	};
	
	BarChart.prototype.render = function(context,animationPercent){
		if(!this.values){
			this.setRandomValues();
		}
		if(!this.colors){
			this.setRandomColors();
		}
		if(isNaN(animationPercent)){
			animationPercent = 1;
		}
		if(!this.barWidth){
			this.barWidth = (this.width/2)/this.values.length;
		}
		this.barSpacer = (this.width - this.barWidth * this.values.length) / (this.values.length+1);//TODO : add comment, move to a method?
		//render bars
		var gradient;
		context.strokeStyle = "#FFFFFF";
		for (var i = 0; i < this.values.length; i++) {
			//context.fillStyle = this.colors[i];
			context.fillStyle = this.lightColor;
			this.renderPoint.x = this.x + this.barSpacer + (this.barSpacer * i) + (this.barWidth * i);
			this.renderPoint.y = this.calculateYPosition(this.values[i], animationPercent);
			
			//draw top extrusion
			context.beginPath();
			context.moveTo(this.renderPoint.x, this.renderPoint.y);
			context.lineTo(this.renderPoint.x+this.extrudeWidth, this.renderPoint.y-this.extrudeWidth);
			context.lineTo(this.renderPoint.x+this.extrudeWidth+this.barWidth, this.renderPoint.y-this.extrudeWidth);
			context.lineTo(this.renderPoint.x+this.barWidth, this.renderPoint.y);
			context.lineTo(this.renderPoint.x, this.renderPoint.y);
			context.closePath();

			context.fill();
			context.stroke();
			
			//draw side extrusion
			context.beginPath();
			context.moveTo(this.renderPoint.x+this.barWidth, this.renderPoint.y);
			context.lineTo(this.renderPoint.x+this.extrudeWidth+this.barWidth, this.renderPoint.y-this.extrudeWidth);
			context.lineTo(this.renderPoint.x+this.extrudeWidth+this.barWidth, this.y+this.height-this.extrudeWidth);
			context.lineTo(this.renderPoint.x+this.barWidth, this.y+this.height);
			context.lineTo(this.renderPoint.x+this.barWidth, this.renderPoint.y);
			context.closePath();
            context.fill();
            context.stroke();

            gradient = context.createLinearGradient(0, this.renderPoint.y, 0, this.y+this.height);// linear gradient from start to end of line
            gradient.addColorStop(0, this.lightColor);
            gradient.addColorStop(1, this.darkColor);

            context.fillStyle = gradient;

			//draw bar
			context.fillRect(this.renderPoint.x, this.renderPoint.y, this.barWidth, this.y+this.height-this.renderPoint.y);
			context.strokeRect(this.renderPoint.x, this.renderPoint.y, this.barWidth, this.y+this.height-this.renderPoint.y);
		}
	};

	window.BarChart=BarChart;
	
}(window));