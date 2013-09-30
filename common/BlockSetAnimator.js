//has a dependency on SimpleGeometry, extends SimpleGeometry.Point
//=========================::BLOCK SET ANIMATOR::===============================

(function (window){
	
	//width and height are used for sizing/scaling to fit.
	BlockSetAnimator=function(x, y, width, height){
		SimpleGeometry.Point.call(this,x,y); //call super constructor.
		this.easingFunction = UnitAnimator.easeOutSine;
		this.animator = new UnitAnimator(1000,20);
		this.animator.easingFunction = UnitAnimator.easeLinear;
	}
	
	//subclass extends superclass
	BlockSetAnimator.prototype = Object.create(SimpleGeometry.Point.prototype);
	BlockSetAnimator.prototype.constructor = SimpleGeometry.Point;
		
	BlockSetAnimator.prototype.frameRate = 20;
	BlockSetAnimator.prototype.margin = 0;
	//include possiblitity for alignement (centered by default)
	//also set widths and heights

	BlockSetAnimator.prototype.intervalId ;//make private

	BlockSetAnimator.prototype.setEasingFunction = function(easingFunction){
		this.easingFunction = easingFunction;
	}
	
	//Image or Canvas items, or sprite sheet?!
	BlockSetAnimator.prototype.setImages = function(images){
		this.blocks = new Array();
		var blockX = this.x;
		for(var i=0; i<images.length; i++){
			this.blocks[i] = new AnimationBlock(blockX, this.y, images[i]);
			blockX += this.blocks[i].width;
		}
	}
	
	BlockSetAnimator.prototype.isAnimating = function(){
		return this.animator && this.animator.isAnimating();
	}
	
	//BlockSetAnimator.prototype.setAnimation = function(transformFrom, transformTo, alphaFrom, alphaTo){
	BlockSetAnimator.prototype.setAnimation = function(blockTransformFrom, blockTransformTo){
		this.transformFrom = blockTransformFrom;
		this.transformTo = blockTransformTo;
	}
	
	//duration is for the entire animation, delay is the amount of delay between the start of individual block animations
	//both numbers are expressed in milliseconds
	BlockSetAnimator.prototype.start = function(duration, delay, completeCallBack, updateCallBack){
		//console.log("BlockSetAnimator.start()", duration, delay, this.blocks.length);
		if(!this.blocks || this.blocks.length==0){
			console.log("BlockSetAnimator.start() ERROR : no blocks have been set");
			return;
		}
		this.millisecondsAnimated = 0;
		this.duration = duration;
		this.blockAnimationDuration = this.duration - delay * (this.blocks.length-1);
		//console.log(this.duration, blockAnimationDuration);
		this.completeCallBack = completeCallBack ? completeCallBack : undefined;
		this.updateCallBack = updateCallBack ? updateCallBack : undefined;
		for(var i=0; i<this.blocks.length; i++){
			this.blocks[i].animationBeginsAt = delay * i;
			this.blocks[i].animationEndsAt = delay * i + this.blockAnimationDuration;
			this.blocks[i].copyTransformValues(this.transformFrom);
			//console.log("block : ",this.blocks[i].animationBeginsAt, this.blocks[i].animationEndsAt);
		}
		var _this = this;
		this.animator.reset(duration, this.frameRate, function(){_this.update()}, function(){_this.complete()});
		this.animator.start();
	}
	
	//only one animator
	//"main" animator has a linear ease
	//the allocated time is chopped up into "segments" for each AnimationBlock
	//the segment is then normalized, and this normal is used for the easing function
	
	BlockSetAnimator.prototype.pause = function(){
		//console.log("BlockSetAnimator.prototype.pause()");
		//clearInterval(this.intervalId);
	}
	
	BlockSetAnimator.prototype.resume = function(){
		//console.log("BlockSetAnimator.prototype.resume()");
	}
	
	BlockSetAnimator.prototype.reset= function(){
		//console.log("BlockSetAnimator.prototype.reset()");
	}

	BlockSetAnimator.prototype.reverse = function(){
		//console.log("BlockSetAnimator.prototype.reverse()");
	}
	
	BlockSetAnimator.prototype.update = function(){
		//console.log("BlockSetAnimator.update()",this.millisecondsAnimated);
		this.millisecondsAnimated += this.frameRate;
		this.dispatchUpdate();
	}
	
	//easing (t, b, c, d)
	//@t is the current time (or position) of the tween.
	//@b is the beginning value of the property.
	//@c is the change between the beginning and destination value of the property.
	//@d is the total time of the tween.
	BlockSetAnimator.prototype.setBlockTransform = function(block, index){			
		var normal = SimpleGeometry.normalize(this.millisecondsAnimated, block.animationBeginsAt, block.animationEndsAt);
		block.transform.rotation = 	this.easingFunction(normal, this.transformFrom.rotation, this.transformTo.rotation-this.transformFrom.rotation, 1);
		block.transform.scale = 	this.easingFunction(normal, this.transformFrom.scale, this.transformTo.scale-this.transformFrom.scale, 1);
		block.transform.alpha = 	this.easingFunction(normal, this.transformFrom.alpha, this.transformTo.alpha-this.transformFrom.alpha, 1);
		block.transform.x = 		this.easingFunction(normal, this.transformFrom.x, this.transformTo.x - this.transformFrom.x, 1);
		block.transform.y = 		this.easingFunction(normal, this.transformFrom.y, this.transformTo.y - this.transformFrom.y, 1);
	}
		
	BlockSetAnimator.prototype.render = function(context){
		//console.log("render()");
		var block;
		SimpleGeometry.setIdentityMatrixToContext(context);
		for(var i=0; i<this.blocks.length; i++){
			block = this.blocks[i];
			if(this.millisecondsAnimated <= block.animationBeginsAt){
				block.copyTransformValues(this.transformFrom);
			}else if(this.millisecondsAnimated >= block.animationEndsAt){
				block.copyTransformValues(this.transformTo);
			}else{
				this.setBlockTransform(block, i);
			}
			context.translate(block.x + block.transform.x -block.getTranslateX(), block.y + block.transform.y - block.getTranslateY());
			context.rotate(block.transform.rotation);
			context.scale(block.transform.scale, block.transform.scale);
			context.globalAlpha = block.transform.alpha;
			context.drawImage(block.image,block.getTranslateX(),block.getTranslateY());
			SimpleGeometry.setIdentityMatrixToContext(context);
		}
		context.globalAlpha = 1;
	}

	BlockSetAnimator.prototype.dispatchUpdate = function(){
		if(this.updateCallBack){
			this.updateCallBack();
		}
	}

	BlockSetAnimator.prototype.complete = function(){
		this.dispatchComplete();
	}
	
	BlockSetAnimator.prototype.dispatchComplete = function(){
		if(this.completeCallBack){
			this.completeCallBack();
		}
	}	
	
	window.BlockSetAnimator = BlockSetAnimator;
	
	
	
	//=========================::ANIMATION BLOCK::===============================
	
	AnimationBlock = function(x,y,image){
		SimpleGeometry.Rectangle.call(this, x, y, image.width, image.height); //call super constructor.
		this.image = image;
		this.transform = new SimpleGeometry.Transform();
		this.skipRender = true;
	}
	
	//subclass extends superclass
	AnimationBlock.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	AnimationBlock.prototype.constructor = SimpleGeometry.Rectangle;
	
	AnimationBlock.prototype.animationBeginsAt;
	AnimationBlock.prototype.animationEndsAt;
	
	AnimationBlock.prototype.copyTransformValues = function(transform){
		this.transform.scale = transform.scale;
		this.transform.rotation = transform.rotation;
		this.transform.x = transform.x;
		this.transform.y = transform.y;
		this.transform.alpha = transform.alpha;
		this.transform.horizontalAlign = transform.horizontalAlign;
		this.transform.verticalAlign = transform.verticalAlign;
	}
	
	AnimationBlock.prototype.getTranslateX = function(){
		switch(this.transform.horizontalAlign){
			case 1:
				return -this.width / 2;
			case 2:
				return -this.width;
		}
		return 0; 
	}
	AnimationBlock.prototype.getTranslateY = function(){
		switch(this.transform.verticalAlign){
			case 1:
				return  -this.height / 2;
			case 2:
				return -this.height;
		}
		return 0; 
	}
	
	window.AnimationBlock = AnimationBlock;
	
	
	//=========================::ANIMATION BLOCK TRANFORM::===============================
	
	AnimationBlockTransform = function(x, y, scale, rotation, alpha, horizontalAlign, verticalAlign){
		this.x = isNaN(x) ? 0 : x;
		this.y = isNaN(y) ? 0 : y;
		this.scale = isNaN(scale) ? 1 : scale;
		this.rotation = isNaN(rotation) ? 0 : rotation;
		this.alpha = isNaN(alpha) ? 1 : alpha;
		//0 = left, 1 = center, 2 = right
		this.horizontalAlign = isNaN(horizontalAlign) && horizontalAlign<3 ? 0 : horizontalAlign;
		//0 = top, 1 = center, 2 = bottom
		this.verticalAlign = isNaN(verticalAlign) && verticalAlign<3 ? 0 : verticalAlign;
	}
	window.AnimationBlockTransform = AnimationBlockTransform;
	
}(window));