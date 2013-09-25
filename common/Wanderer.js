//has a dependency on SimpleGeometry, extends SimpleGeometry.Point
//=========================::WANDERER::===============================

//

(function (window){

	//Wndering is animated within this circle
	Wanderer=function(circle){
		this.circle = circle;
		SimpleGeometry.Point.call(this,0,0); //call super constructor.
	}
	
	//subclass extends superclass
	Wanderer.prototype = Object.create(SimpleGeometry.Point.prototype);
	Wanderer.prototype.constructor = SimpleGeometry.Point;
	
	Wanderer.prototype.minVelocity = .01;
	Wanderer.prototype.maxVelocity = .06;
	Wanderer.prototype.minDuration = 500;
	Wanderer.prototype.maxDuration = 2000;
	Wanderer.prototype.duration = 1000;
	Wanderer.prototype.currentDuration = 0;
	Wanderer.prototype.velocity = .04;//make private
	Wanderer.prototype.frameRate = 20;
	Wanderer.prototype.targetVelocity;//make private
	Wanderer.prototype.radius = 0;//make private
	Wanderer.prototype.targetRadius;//make private
	Wanderer.prototype.radian;//make private
	Wanderer.prototype.intervalId ;//make private
	Wanderer.prototype.callBack;
	Wanderer.prototype.circle;
	
	Wanderer.prototype.start=function(updateCallBack){
		this.updateCallBack = updateCallBack;
		this.radian = isNaN(this.startRadian) ? Math.random() * SimpleGeometry.PI2 : this.startRadian; 
		this.radius = Math.random() * this.circle.radius;
		this.setNextTarget();
	}
	
	Wanderer.prototype.pause = function(){
		//console.log("Wanderer.prototype.pause()");
		clearInterval(this.intervalId);
	}

	Wanderer.prototype.radiusIncrement;
	Wanderer.prototype.velocityIncrement;
	
	//refactor, make private
	Wanderer.prototype.setNextTarget=function(){
		if(!isNaN(this.intervalId)){
			clearInterval(this.intervalId);
		}
		this.currentDuration = 0;
		this.targetRadius = Math.random()*this.circle.radius;
		this.targetVelocity = (this.minVelocity+Math.random() * (this.maxVelocity-this.minVelocity)) * SimpleGeometry.getRandomPositiveOrNegativeOne();
		this.duration = this.minDuration + Math.random() * (this.maxDuration-this.minDuration);
		
		this.radiusIncrement = (this.targetRadius - this.radius) / (this.duration/this.frameRate);
		this.velocityIncrement = (this.targetVelocity - this.velocity) / (this.duration/this.frameRate);
		
		var _this = this;
		this.intervalId = setInterval(function(){_this.update();}, this.frameRate);//TODO : find easier to explain solution
	}
	
	//refactor, make private
	Wanderer.prototype.update=function(){
		//this.velocity += (this.targetVelocity - this.velocity) / 30;
		this.velocity += this.velocityIncrement;
		this.radian =  SimpleGeometry.constrainRadianTo2PI( this.radian + this.velocity );
		
		//this.radius += (this.targetRadius - this.radius) / 40;
		this.radius += this.radiusIncrement;
		this.currentDuration += this.frameRate;
		this.x = this.circle.x + Math.cos(this.radian) * this.radius;
		this.y = this.circle.y + Math.sin(this.radian) * this.radius;
		
		//console.log("Wanderer.update()", this.x , this.y , this.velocity, this.radian, this.radius, this.currentDuration);
		
		if(this.currentDuration >= this.duration){
			this.setNextTarget();
		}
		this.dispatchUpdate();
	}
	
	Wanderer.prototype.dispatchUpdate=function(){
		if(this.updateCallBack){
			this.updateCallBack();
		}
	}
	
	Wanderer.prototype.opposingPoint = new SimpleGeometry.Point();
	
	Wanderer.prototype.getOpposingPoint=function(){
		var opposingRadian = SimpleGeometry.constrainRadianTo2PI( this.radian + Math.PI );
		this.opposingPoint.x = this.circle.x + Math.cos(opposingRadian) * this.radius;
		this.opposingPoint.y = this.circle.y + Math.sin(opposingRadian) * this.radius;
		return this.opposingPoint;
	}	
	
	window.Wanderer = Wanderer;
	
}(window));