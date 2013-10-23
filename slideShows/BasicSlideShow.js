//has a dependency on SimpleGeometry, UnitAnimator
//currently configured to only handle square images (Instagram)
(function (window){

	//set up event dispatching?  EventDispatcher

	BasicSlideShow = function(x, y, width, height, context2d, images){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.background=new ChartBackground(x,y,width,height);
		this.context2d=context2d;
		if(images){
			this.setImages(images);
		}
		this.animator = new UnitAnimator();
		this.arrows = new ArrowButtons(this, 25, 35, 20);
		this.arrows.strokeStyle = SimpleGeometry.getRgbaStyleString(0,0,0,.8);
		this.arrows.fillStyle = SimpleGeometry.getRgbaStyleString(0xFF,0xFF,0xFF,.5);
		this.currentIndex = 0;
	};
	
	//subclass extends superclass
	BasicSlideShow.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	BasicSlideShow.prototype.constructor = SimpleGeometry.Rectangle;
	
	BasicSlideShow.NEXT_DIRECTION = -1;
	BasicSlideShow.PREV_DIRECTION = 1;
	
	BasicSlideShow.prototype.next = function(){
		//console.log("BasicSlideShow.next()");
		if(this.animator.isAnimating()){
			return;
		}
		if(this.hasNext()){
			this.slide(BasicSlideShow.NEXT_DIRECTION);
		}
	};
	BasicSlideShow.prototype.previous = function(){
		//console.log("BasicSlideShow.previous()");
		if(this.animator.isAnimating()){
			return;
		}
		if(this.hasPrevious()){
			this.slide(BasicSlideShow.PREV_DIRECTION);
		}
	};
	BasicSlideShow.prototype.hasNext = function(){
		return this.images && this.currentIndex < this.images.length-1;
	};
	BasicSlideShow.prototype.hasPrevious = function(){
		return this.images && this.currentIndex>0;
	};
	
	
	//values is a multi dimentional Array with values
	BasicSlideShow.prototype.setImages = function(images){
		this.images = images;
		var resizeCanvas = document.createElement('canvas');
		for(var i=0; i<this.images.length; i++){
			ImageEffects.resizeImageDestructive(this.images[i] , resizeCanvas, this.width , this.height);
		}
		this.currentIndex=0;
		this.skipToIndex(this.currentIndex);
	};

	BasicSlideShow.prototype.skipToIndex = function(index){
		//add a fail safe in case sliding is active
		this.context2d.drawImage(this.images[index],this.x,this.y, this.width, this.height);
		this.currentIndex=index;
		this.arrows.render(this.context2d, !this.hasPrevious(), !this.hasNext());
	};
	
	BasicSlideShow.prototype.slide = function(direction){
		this.slideDirection = direction;
		if(direction == BasicSlideShow.NEXT_DIRECTION){
			this.leftImage = this.images[this.currentIndex];
			this.rightImage = this.images[this.currentIndex+1];
		}else{
			this.leftImage = this.images[this.currentIndex-1];
			this.rightImage = this.images[this.currentIndex];
		}
		var _this=this;
		this.animator.reset(1000, 20, function(){_this.updateSlide()},function(){_this.slideComplete()});
		this.animator.start();
	};
	
	BasicSlideShow.prototype.updateSlide = function(){
		//console.log("BasicSlideShow.updateSlide()",this.animator.getAnimationPercent());
		//console.log("BasicSlideShow.updateSlide()",this.leftImage.width,this.leftImage.height);
		if(this.slideDirection == BasicSlideShow.NEXT_DIRECTION){
			this.updateSlideNext();
		}else{
			this.updateSlidePrevious();		
		}
	};
	BasicSlideShow.prototype.updateSlideNext = function(){
		//sx, sy start clipping at
		//swidth,sheight clipping width
		//x ,y where to place image on canvas
		//width, height optional
		//context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
		var imageX = this.leftImage.width * this.animator.getAnimationPercent();
		var rectX = this.width * this.animator.getAnimationPercent();
		if(rectX < this.width){
			this.context2d.drawImage(	this.leftImage,
								imageX, 0,
								this.leftImage.width - imageX, this.leftImage.height,
								this.x, this.y,
								this.width - rectX, this.height);
		}
		this.context2d.drawImage(	this.rightImage,
							0, 0,
							imageX, this.rightImage.height,
							this.getRight() - rectX,this.y,
							rectX, this.height);
	};
	
	BasicSlideShow.prototype.updateSlidePrevious = function(){
		var imageX = this.leftImage.width - this.leftImage.width * this.animator.getAnimationPercent();
		var rectX = this.width - this.width * this.animator.getAnimationPercent();
			this.context2d.drawImage(	this.leftImage,
								imageX, 0,
								this.leftImage.width - imageX, this.leftImage.height,
								this.x, this.y,
								this.width - rectX, this.height);
		if(rectX > 0){
			this.context2d.drawImage(	this.rightImage,
								0, 0,
								imageX, this.rightImage.height,
								this.getRight() - rectX,this.y,
								rectX, this.height);	
		}
	};
		
	BasicSlideShow.prototype.slideComplete = function(){
		//console.log("BasicSlideShow.slideComplete()");
		this.currentIndex -= this.slideDirection;
		this.arrows.render(this.context2d, !this.hasPrevious(), !this.hasNext());
	};

	window.BasicSlideShow=BasicSlideShow;
	
}(window));