//has a dependency on SimpleGeometry

(function (window){

	//set up event dispatching?  EventDispatcher

	PieChart = function(x, y, width, height, margin){
		this.margin = isNaN(margin) ? 20 : margin;
		SimpleGeometry.Rectangle.call(this, x, y, width, height); //call super constructor.
		this.center = this.getCenter();
		this.radius = this.width < this.height ? (this.width/2 - this.margin*2) : (this.height/2 - this.margin*2);
	};
	
	//subclass extends superclass
	PieChart.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	PieChart.prototype.constructor = SimpleGeometry.Rectangle;
	
	PieChart.prototype.setValues = function(values){
		this.values=values;
		this.total=0;
		for(var i=0; i<this.values.length; i++){
			this.total+=this.values[i];
		}
	};
	
	PieChart.prototype.setRandomValues = function(){
		var total = 1 + Math.floor(Math.random()*5);//between 1 and 6
		var values = [];
		var value;
		var pool = 100;
		while(total>0){
			value=Math.round(Math.random()*(pool/2));
			values.push(value);
			pool-=value;
			total--;
		}
		values.push(pool);
		this.setValues(values);	
	};
	
	//colors must be an array in the format ["#FF00FF","#FF00CC"...]
	PieChart.prototype.setColors = function(colors){
		this.colors = colors;	
	};

	PieChart.prototype.setRandomColors = function(){
		this.colors = [];
		while(this.colors.length != this.values.length){
			this.colors.push(SimpleGeometry.getRandomFillStyleColor());
		}
	};

	PieChart.prototype.render = function(context,animationPercent){
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
		var startRadian,endRadian,gradient;
		context.translate(this.center.x, this.center.y);
		context.rotate(-Math.PI/2);
		for(var i=0; i<this.values.length; i++){
			value = this.values[i]*animationPercent;
			context.beginPath();
			context.moveTo(0,0);
			context.fillStyle = this.colors[i];
			startRadian = SimpleGeometry.map(startValue,0,this.total,0,SimpleGeometry.PI2);
			endRadian = SimpleGeometry.map(startValue+value,0,this.total,0,SimpleGeometry.PI2);

			//console.log("\t",startRadian,endRadian);
			context.arc(0, 0, this.radius, startRadian, endRadian);//x, y, this.radius, from, to
			context.lineTo(0,0);
			context.fill();
			context.closePath();

            gradient = context.createRadialGradient( 0, 0, this.radius*.85, 0, 0, this.radius-1);
            gradient.addColorStop(0, SimpleGeometry.getRgbaStyleString(0,0,0,0));
            gradient.addColorStop(1, SimpleGeometry.getRgbaStyleString(0,0,0,.3));

            context.fillStyle = gradient;
            context.beginPath();
            context.moveTo(0,0);
            context.arc(0, 0, this.radius, startRadian, endRadian);
            context.lineTo(0,0);
            context.fill();
            context.closePath();

			startValue += value;
		}
		SimpleGeometry.setIdentityMatrixToContext(context);
	};

	window.PieChart=PieChart;
	
}(window));

(function (window){

	DonutChart = function(x, y, width, height, margin, holePercent){
		//console.log("DonutChart constructor called");
		if( !isNaN( holePercent ) ){
			this.holePercent = holePercent;
		}
		PieChart.call(this, x, y, width, height, margin); //call super constructor.
	};
	
	//subclass extends superclass
	DonutChart.prototype = Object.create(PieChart.prototype);
	DonutChart.prototype.constructor = PieChart;

	DonutChart.prototype.holePercent = .3;
	
	// Override the instance method
/*	DonutChart.prototype.render = function(context,animationPercent){
		PieChart.prototype.render.call(this,context,animationPercent);
		context.fillStyle = "#FFFFFF";
		context.beginPath();
		context.arc(this.center.x, this.center.y, this.radius*this.holePercent, 0, SimpleGeometry.PI2);//x, y, this.radius, from, to
		context.fill();
		context.closePath();
	};*/

    DonutChart.prototype.render = function(context,animationPercent){
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
        var startRadian,endRadian,gradient;
        context.translate(this.center.x, this.center.y);
        context.rotate(-Math.PI/2);
        for(var i=0; i<this.values.length; i++){
            value = this.values[i]*animationPercent;
            context.beginPath();
            context.moveTo(0,0);
            context.fillStyle = this.colors[i];
            startRadian = SimpleGeometry.map(startValue,0,this.total,0,SimpleGeometry.PI2);
            endRadian = SimpleGeometry.map(startValue+value,0,this.total,0,SimpleGeometry.PI2);

            //console.log("\t",startRadian,endRadian);
            context.arc(0, 0, this.radius, startRadian, endRadian);//x, y, this.radius, from, to
            context.lineTo(0,0);
            context.fill();
            context.closePath();

            gradient = context.createRadialGradient( 0, 0, this.radius*.85, 0, 0, this.radius-1);
            gradient.addColorStop(0, SimpleGeometry.getRgbaStyleString(0,0,0,0));
            gradient.addColorStop(1, SimpleGeometry.getRgbaStyleString(0,0,0,.3));

            context.fillStyle = gradient;
            context.beginPath();
            context.moveTo(0,0);
            context.arc(0, 0, this.radius, startRadian, endRadian);
            context.lineTo(0,0);
            context.fill();
            context.closePath();

            gradient = context.createRadialGradient( 0, 0, this.radius*this.holePercent, 0, 0, this.radius*this.holePercent + this.radius *.85);
            gradient.addColorStop(0, SimpleGeometry.getRgbaStyleString(0,0,0,.5));
            gradient.addColorStop(1, SimpleGeometry.getRgbaStyleString(0,0,0,0));

            context.fillStyle = gradient;
            context.beginPath();
            context.moveTo(0,0);
            context.arc(0, 0, this.radius, startRadian, endRadian);
            context.lineTo(0,0);
            context.fill();
            context.closePath();

            startValue += value;
        }

        context.beginPath();
        context.fillStyle = "#FFFFFF";
        context.arc(0, 0, this.radius*this.holePercent, 0, SimpleGeometry.PI2);//x, y, this.radius, from, to
        context.fill();
        context.closePath();

        SimpleGeometry.setIdentityMatrixToContext(context);
    };

	window.DonutChart=DonutChart;

}(window));


