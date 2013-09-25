//has a dependency on SimpleGeometry

(function (window){

	//set up event dispatching?  EventDispatcher

	PieChart=function(x,y,width,height){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
	}
	
	//subclass extends superclass
	PieChart.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	PieChart.prototype.constructor = SimpleGeometry.Rectangle;

	PieChart.prototype.margin=0;//used to calculate the radius
	
	PieChart.prototype.setValues=function(values){
		this.values=values;
		this.total=0;
		for(var i=0; i<this.values.length; i++){
			this.total+=this.values[i];
		}
	}
	
	PieChart.prototype.setRandomValues=function(){
		var total=1+Math.floor(Math.random()*5);//between 1 and 6
		values=new Array();
		var value;
		var pool=100;
		while(total>0){
			value=Math.round(Math.random()*(pool/2));
			values.push(value);
			pool-=value;
			total--;
		}
		values.push(pool);
		this.setValues(values);	
	}
	
	//colors must be an array in the format ["#FF00FF","#FF00CC"...]
	PieChart.prototype.setColors=function(colors){
		this.colors=colors;	
	}

	PieChart.prototype.setRandomColors=function(){
		this.colors = new Array();
		while(this.colors.length != this.values.length){
			this.colors.push(SimpleGeometry.getRandomFillStyleColor());
		}
	}

	PieChart.prototype.render=function(context,animationPercent){
		if(!this.values){
			this.setRandomValues();
		}
		if(!this.colors){
			this.setRandomColors();
		}
		if(isNaN(animationPercent)){
			animationPercent=1;
		}
		//console.log("PieChart.render",this.values.toString(),this.colors.toString());
		var startValue = 0;
		var value;
		var startRadian,endRadian;
		var center = this.getCenter();
		var radius = this.width < this.height ? (this.width/2 + this.margin*2) : (this.height/2 + this.margin*2);
		context.translate(center.x, center.y);
		context.rotate(-Math.PI/2);
		for(var i=0; i<this.values.length; i++){
			value = this.values[i]*animationPercent;
			context.beginPath();
			//context.moveTo(center.x,center.y);
			context.moveTo(0,0);
			//context.strokeStyle =
			context.fillStyle = this.colors[i];
			//startRadian = SimpleGeometry.constrainRadianTo2PI(SimpleGeometry.map(startValue,0,this.total,0,SimpleGeometry.PI2));
			//endRadian = SimpleGeometry.constrainRadianTo2PI(SimpleGeometry.map(startValue+value,0,this.total,0,SimpleGeometry.PI2));
			startRadian = SimpleGeometry.map(startValue,0,this.total,0,SimpleGeometry.PI2);
			endRadian = SimpleGeometry.map(startValue+value,0,this.total,0,SimpleGeometry.PI2);

			//console.log("\t",startRadian,endRadian);
			//context.arc(center.x, center.y, radius, startRadian, endRadian);//x, y, radius, from, to
			context.arc(0, 0, radius, startRadian, endRadian);//x, y, radius, from, to
			//context.lineTo(center.x,center.y);
			context.lineTo(0,0);
			context.fill();
			context.closePath();
			startValue+=value;
		}
		SimpleGeometry.setIdentityMatrixToContext(context);
	}

	window.PieChart=PieChart;
	
}(window));

(function (window){

	DonutChart=function(x,y,width,height,holePercent){
		this.holePercent=holePercent;
		PieChart.call(this,x,y,width,height); //call super constructor.
	}
	
	//subclass extends superclass
	DonutChart.prototype = Object.create(PieChart.prototype);
	DonutChart.prototype.constructor = PieChart;


	// Override the instance method
	DonutChart.prototype.render=function(context,animationPercent){
		PieChart.prototype.render.call(this,context,animationPercent);
		context.fillStyle = "#FFFFFF";
		context.beginPath();
		var center = this.getCenter();
		var radius = this.width < this.height ? (this.width/2 + this.margin*2) : (this.height/2 + this.margin*2);
		context.arc(center.x, center.y, radius*this.holePercent, 0, SimpleGeometry.PI2);//x, y, radius, from, to
		context.fill();
		context.closePath();
	}

	window.DonutChart=DonutChart;

}(window));


