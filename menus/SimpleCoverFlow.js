//has a dependency on SimpleGeometry, UnitAnimator
//currently configured to only handle square images (Instagram)
(function (window){

	//constructor
	SimpleCoverFlow = function(x, y, width, height, context2d){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.vanishingPoint = this.getCenter();
		this.context2d = context2d;
		this.animator = new UnitAnimator();
		this.animationTransformRectangle = new TransformRectangle();
		this.arrows = new ArrowButtons(this);
		this.margin = 40;
		this.unfocusedItemWidthPercent = .5;
		this.currentIndex = 0;
	};
	
	//subclass extends superclass
	SimpleCoverFlow.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	SimpleCoverFlow.prototype.constructor = SimpleGeometry.Rectangle;
		
	SimpleCoverFlow.prototype.next = function(){
		if(!this.hasNext() || this.animator.isAnimating()){
			return;
		}
		//console.log("SimpleCoverFlow.next this.currentIndex",this.currentIndex);
		this.slideDirection = 1;
		this.slide();
	};
	SimpleCoverFlow.prototype.previous = function(){
		if(!this.hasPrevious() || this.animator.isAnimating()){
			return;
		}
		//console.log("SimpleCoverFlow.previous this.currentIndex",this.currentIndex);
		this.slideDirection = -1;
		this.slide();
	};
	
	//repetition with Basic slide show
	SimpleCoverFlow.prototype.hasNext=function(){
		return this.images && this.currentIndex < this.images.length-1;
	};
	SimpleCoverFlow.prototype.hasPrevious=function(){
		return this.images && this.currentIndex>0;
	};
	
	SimpleCoverFlow.prototype.getCurrentImage = function(){
		//console.log("SimpleCoverFlow.getCurrentImage()", this.currentIndex);
		return this.images[this.currentIndex];
	};
	
	//values is a multi dimentional Array with values
	//assumes all thumbnails are the same size
	SimpleCoverFlow.prototype.setImages = function(images){
		this.images = images;
		this.setCardTargets(images[0]);
		this.cards = [];
		this.currentIndex = Math.floor(this.images.length/2);
		for(var i=0; i<this.targetTransformRectangles.length; i++){
			this.cards[i] = this.targetTransformRectangles[i].clone();
		}
		this.renderCurrentIndex();
	};
	
	SimpleCoverFlow.prototype.setCardTargets = function(image){
		this.targetTransformRectangles = [];
		var cardRect = new SimpleGeometry.Rectangle(	this.vanishingPoint.x-image.width/2, 
														this.vanishingPoint.y-image.height/2,
														image.width, image.height);//centered
		//MIDDLE
		this.targetTransformRectangles[0] = new TransformRectangle(	new SimpleGeometry.Point(cardRect.x, cardRect.y), 
																	new SimpleGeometry.Point(cardRect.getRight(), cardRect.y), 
																	new SimpleGeometry.Point(cardRect.getRight(), cardRect.getBottom()), 
																	new SimpleGeometry.Point(cardRect.x, cardRect.getBottom() ) );
		var fakePerspectiveOffset = cardRect.height/6;
		var widthDiminish = .6;//make a param
		var left, right;
		this.numSideCards = 0;
		while(cardRect.getRight() < this.width-this.margin){
			cardRect.x += cardRect.width;
			cardRect.width *= widthDiminish;
			fakePerspectiveOffset -= 3;
			right = new TransformRectangle(	new SimpleGeometry.Point(cardRect.x, cardRect.y + fakePerspectiveOffset), 
											new SimpleGeometry.Point(cardRect.getRight(), cardRect.y), 
											new SimpleGeometry.Point(cardRect.getRight(), cardRect.getBottom()), 
											new SimpleGeometry.Point(cardRect.x, cardRect.getBottom() - fakePerspectiveOffset )
											);
			this.targetTransformRectangles.push(right);
			left = new TransformRectangle(	new SimpleGeometry.Point(this.width - cardRect.getRight(), cardRect.y), 
											new SimpleGeometry.Point(this.width - cardRect.x, cardRect.y+fakePerspectiveOffset), 
											new SimpleGeometry.Point(this.width - cardRect.x, cardRect.getBottom()-fakePerspectiveOffset), 
											new SimpleGeometry.Point(this.width - cardRect.getRight(), cardRect.getBottom()) 
											);
			this.targetTransformRectangles.unshift(left);			
			this.numSideCards++;		
		}
	};
	
	SimpleCoverFlow.prototype.renderCurrentIndex = function(){
		//console.log("SimpleCoverFlow.renderCurrentIndex()", this.currentIndex);
		this.context2d.clearRect(this.x,this.y,this.width,this.height);
		for(var i=0; i<this.numSideCards; i++){
			this.cards[i].render(this.context2d, this.images[this.currentIndex - this.numSideCards + i]);
			this.cards[this.cards.length - i -1].render(this.context2d, this.images[this.currentIndex - this.numSideCards + this.cards.length - i- 1]);
		}
		this.cards[i].render(this.context2d, this.images[this.currentIndex - this.numSideCards + i]);
		this.arrows.render(this.context2d);
	};
	
	SimpleCoverFlow.prototype.updateAnimationTransformRectangle = function(target, current, percent){
		this.animationTransformRectangle.topLeft.x  =  current.topLeft.x + (target.topLeft.x-current.topLeft.x)*percent;
		this.animationTransformRectangle.topLeft.y  =  current.topLeft.y + (target.topLeft.y-current.topLeft.y)*percent;
		this.animationTransformRectangle.topRight.x  =  current.topRight.x + (target.topRight.x-current.topRight.x)*percent;
		this.animationTransformRectangle.topRight.y  =  current.topRight.y + (target.topRight.y-current.topRight.y)*percent;
		this.animationTransformRectangle.bottomRight.x  =  current.bottomRight.x + (target.bottomRight.x-current.bottomRight.x)*percent;
		this.animationTransformRectangle.bottomRight.y  =  current.bottomRight.y + (target.bottomRight.y-current.bottomRight.y)*percent;
		this.animationTransformRectangle.bottomLeft.x  =  current.bottomLeft.x + (target.bottomLeft.x-current.bottomLeft.x)*percent;
		this.animationTransformRectangle.bottomLeft.y  =  current.bottomLeft.y + (target.bottomLeft.y-current.bottomLeft.y)*percent;
	};
	
	SimpleCoverFlow.prototype.slideLeft = function(){
		this.context2d.clearRect(this.x,this.y,this.width,this.height);
		//this.cards.sort(SimpleCoverFlow.cardsWidthSort);
		var card;
		for(var i=1; i<this.cards.length; i++){
			card = this.cards[i];
			this.updateAnimationTransformRectangle(this.targetTransformRectangles[i-1], this.targetTransformRectangles[i], this.animator.getAnimationPercent()); 
			card.updatePointsToTransformRectangle(this.animationTransformRectangle);
			//card.render(this.context2d, this.images[this.currentIndex - this.numSideCards + i]);
		}
		this.renderCurrentIndex();
	};
	
	SimpleCoverFlow.prototype.slideRight = function(){
		this.context2d.clearRect(this.x,this.y,this.width,this.height);
		//this.cards.sort(SimpleCoverFlow.cardsWidthSort);
		var card;
		for(var i=0; i<this.cards.length-1; i++){
			card = this.cards[i];
			this.updateAnimationTransformRectangle(this.targetTransformRectangles[i+1], this.targetTransformRectangles[i], this.animator.getAnimationPercent());
			card.updatePointsToTransformRectangle(this.animationTransformRectangle);
			//card.render(this.context2d, this.images[this.currentIndex - this.numSideCards + i]);
		}
		this.renderCurrentIndex();
	};
	
	SimpleCoverFlow.prototype.slide=function(){
		//console.log("SimpleCoverFlow.slide() index : ",this.currentIndex);
		var _this=this;
		this.animator.reset(300, 20, function(){_this.slideDirection == 1 ? _this.slideLeft() : _this.slideRight() },function(){_this.slideComplete()});
		this.animator.start();
	};
		
	SimpleCoverFlow.prototype.slideComplete=function(){
		this.currentIndex += this.slideDirection;
		//console.log("SimpleCoverFlow.slideComplete()");
		for(var i=0; i<this.targetTransformRectangles.length; i++){
			this.cards[i].updatePointsToTransformRectangle(this.targetTransformRectangles[i]);
		}
		this.renderCurrentIndex();
	};
	
	window.SimpleCoverFlow = SimpleCoverFlow;
	
}(window));