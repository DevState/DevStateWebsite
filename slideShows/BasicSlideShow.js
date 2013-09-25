//has a dependency on SimpleGeometry, UnitAnimator
//currently configured to only handle square images (Instagram)
(function (window){

	//set up event dispatching?  EventDispatcher

	BasicSlideShow=function(x,y,width,height,context2d,images){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.background=new ChartBackground(x,y,width,height);
		this.context2d=context2d;
		if(images){
			this.setImages(images);
		}
		this.animator = new UnitAnimator();
	}
	
	//subclass extends superclass
	BasicSlideShow.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	BasicSlideShow.prototype.constructor = SimpleGeometry.Rectangle;
	
	BasicSlideShow.prototype.currentIndex = 0;
	
	BasicSlideShow.NEXT_DIRECTION = -1;
	BasicSlideShow.PREV_DIRECTION = 1;
	
	BasicSlideShow.prototype.next=function(){
		//console.log("BasicSlideShow.next()");
		if(this.animator.isAnimating()){
			return;
		}
		if(this.hasNext()){
			this.slide(BasicSlideShow.NEXT_DIRECTION);
		}
	}
	BasicSlideShow.prototype.previous=function(){
		//console.log("BasicSlideShow.previous()");
		if(this.animator.isAnimating()){
			return;
		}
		if(this.hasPrevious()){
			this.slide(BasicSlideShow.PREV_DIRECTION);
		}
	}
	BasicSlideShow.prototype.hasNext=function(){
		return this.images && this.currentIndex < this.images.length-1;
	}
	BasicSlideShow.prototype.hasPrevious=function(){
		return this.images && this.currentIndex>0;
	}
	
	
	//values is a multi dimentional Array with values
	BasicSlideShow.prototype.setImages=function(images){
		this.images = images;
		this.currentIndex=0;
		this.skipToIndex(this.currentIndex);
	}

	BasicSlideShow.prototype.skipToIndex=function(index){
		//add some fail safes in case sliding is active
		this.context2d.drawImage(this.images[index],this.x,this.y,this.width,this.height);
		this.currentIndex=index;
		this.drawArrows();
	}
	
	BasicSlideShow.prototype.leftImage;
	BasicSlideShow.prototype.rightImage;
	
	BasicSlideShow.prototype.slide=function(direction){
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
	}
	
	BasicSlideShow.prototype.updateSlide=function(){
		//console.log("BasicSlideShow.updateSlide()",this.animator.getAnimationPercent());
		//console.log("BasicSlideShow.updateSlide()",this.leftImage.width,this.leftImage.height);
		if(this.slideDirection == BasicSlideShow.NEXT_DIRECTION){
			this.updateSlideNext();
		}else{
			this.updateSlidePrevious();		
		}
	}
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
	}
	
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
	}
	
	//duplicated in ThumbnailCarousel, move to a util
	BasicSlideShow.prototype.drawArrows = function(){
		this.context2d.beginPath();
		this.context2d.lineWidth = 5;
		this.context2d.strokeStyle = SimpleGeometry.getRgbaStyleString(0,0,0,.8);
		this.context2d.fillStyle = SimpleGeometry.getRgbaStyleString(0xFF,0xFF,0xFF,.5);
		this.context2d.lineCap = "butt"; //"square";//

		var arrowHeight = 35;
		var arrowWidth = 25;
		var margin = 20;
		var y = this.y + this.height/2;
		
		if(this.hasPrevious()){
			//left arrow graphic
			this.context2d.moveTo(this.x + arrowWidth + margin, y );
			this.context2d.lineTo(this.x + arrowWidth + margin, y - arrowHeight /2);
			this.context2d.lineTo(this.x + arrowWidth + margin, y + arrowHeight /2);
			this.context2d.lineTo(this.x + margin, y );
			this.context2d.lineTo(this.x + arrowWidth + margin, y - arrowHeight /2);
			this.context2d.lineTo(this.x + arrowWidth + margin, y );
		}
		
		if(this.hasNext()){
			//right arrow graphic
			this.context2d.moveTo(this.getRight() - arrowWidth - margin, y );
			this.context2d.lineTo(this.getRight() - arrowWidth - margin, y - arrowHeight /2);
			this.context2d.lineTo(this.getRight() - arrowWidth - margin, y + arrowHeight /2);
			this.context2d.lineTo(this.getRight() - margin, y );
			this.context2d.lineTo(this.getRight() - arrowWidth - margin, y - arrowHeight /2);	
			this.context2d.lineTo(this.getRight() - arrowWidth - margin, y );
		}
		this.context2d.stroke();
		this.context2d.fill();
		this.context2d.closePath();
	}
		
	BasicSlideShow.prototype.slideComplete = function(){
		//console.log("BasicSlideShow.slideComplete()");
		this.currentIndex -= this.slideDirection;
		this.drawArrows();
	}

	window.BasicSlideShow=BasicSlideShow;
	
}(window));