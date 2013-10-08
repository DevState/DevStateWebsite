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
	}
	
	//subclass extends superclass
	SimpleCoverFlow.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	SimpleCoverFlow.prototype.constructor = SimpleGeometry.Rectangle;
	
	//properties
	SimpleCoverFlow.prototype.margin = 40;
	SimpleCoverFlow.prototype.unfocusedItemWidthPercent = .5;
	SimpleCoverFlow.prototype.currentIndex = 0;
	
	SimpleCoverFlow.prototype.cards;
		
	SimpleCoverFlow.prototype.next = function(){
		if(!this.hasNext() || this.animator.isAnimating()){
			return;
		}
		//console.log("SimpleCoverFlow.next this.currentIndex",this.currentIndex);
		this.slideDirection = 1;
		this.slide();
	}
	SimpleCoverFlow.prototype.previous = function(){
		if(!this.hasPrevious() || this.animator.isAnimating()){
			return;
		}
		//console.log("SimpleCoverFlow.previous this.currentIndex",this.currentIndex);
		this.slideDirection = -1;
		this.slide();
	}
	
	//repetition with Basic slide show
	SimpleCoverFlow.prototype.hasNext=function(){
		return this.images && this.currentIndex < this.images.length-1;
	}
	SimpleCoverFlow.prototype.hasPrevious=function(){
		return this.images && this.currentIndex>0;
	}
	
	SimpleCoverFlow.prototype.getCurrentImage = function(){
		//console.log("SimpleCoverFlow.getCurrentImage()", this.currentIndex);
		return this.images[this.currentIndex];
	}
	
	//values is a multi dimentional Array with values
	//assumes all thumbnails are the same size
	SimpleCoverFlow.prototype.setImages = function(images){
		this.images = images;
		this.setCardTargets(images[0]);
		this.cards = new Array();
		this.currentIndex = Math.floor(this.images.length/2);
		for(var i=0; i<this.targetTransformRectangles.length; i++){
			this.cards[i] = this.targetTransformRectangles[i].clone();
		}
		this.renderCurrentIndex();
	}
	
	SimpleCoverFlow.prototype.setCardTargets = function(image){
		this.targetTransformRectangles = new Array();
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
	}
	
	SimpleCoverFlow.prototype.renderCurrentIndex = function(){
		//console.log("SimpleCoverFlow.renderCurrentIndex()", this.currentIndex);
		this.context2d.clearRect(this.x,this.y,this.width,this.height);
		for(i=0; i<this.numSideCards; i++){
			this.cards[i].render(this.context2d, this.images[this.currentIndex - this.numSideCards + i]);
			this.cards[this.cards.length - i -1].render(this.context2d, this.images[this.currentIndex - this.numSideCards + this.cards.length - i- 1]);
		}
		this.cards[i].render(this.context2d, this.images[this.currentIndex - this.numSideCards + i]);
		this.drawArrows();
	}
	
	SimpleCoverFlow.prototype.updateAnimationTransformRectangle = function(target, current, percent){
		this.animationTransformRectangle.topLeft.x  =  current.topLeft.x + (target.topLeft.x-current.topLeft.x)*percent;
		this.animationTransformRectangle.topLeft.y  =  current.topLeft.y + (target.topLeft.y-current.topLeft.y)*percent;
		this.animationTransformRectangle.topRight.x  =  current.topRight.x + (target.topRight.x-current.topRight.x)*percent;
		this.animationTransformRectangle.topRight.y  =  current.topRight.y + (target.topRight.y-current.topRight.y)*percent;
		this.animationTransformRectangle.bottomRight.x  =  current.bottomRight.x + (target.bottomRight.x-current.bottomRight.x)*percent;
		this.animationTransformRectangle.bottomRight.y  =  current.bottomRight.y + (target.bottomRight.y-current.bottomRight.y)*percent;
		this.animationTransformRectangle.bottomLeft.x  =  current.bottomLeft.x + (target.bottomLeft.x-current.bottomLeft.x)*percent;
		this.animationTransformRectangle.bottomLeft.y  =  current.bottomLeft.y + (target.bottomLeft.y-current.bottomLeft.y)*percent;
	}
	
	SimpleCoverFlow.prototype.slideLeft = function(){
		this.context2d.clearRect(this.x,this.y,this.width,this.height);
		//this.cards.sort(SimpleCoverFlow.cardsWidthSort);
		var card;
		for(i=1; i<this.cards.length; i++){
			card = this.cards[i];
			this.updateAnimationTransformRectangle(this.targetTransformRectangles[i-1], this.targetTransformRectangles[i], this.animator.getAnimationPercent()); 
			card.updatePointsToTransformRectangle(this.animationTransformRectangle);
			//card.render(this.context2d, this.images[this.currentIndex - this.numSideCards + i]);
		}
		this.renderCurrentIndex();
		this.drawArrows();
	}
	
	SimpleCoverFlow.prototype.slideRight = function(){
		this.context2d.clearRect(this.x,this.y,this.width,this.height);
		//this.cards.sort(SimpleCoverFlow.cardsWidthSort);
		var card;
		for(i=0; i<this.cards.length-1; i++){
			card = this.cards[i];
			this.updateAnimationTransformRectangle(this.targetTransformRectangles[i+1], this.targetTransformRectangles[i], this.animator.getAnimationPercent());
			card.updatePointsToTransformRectangle(this.animationTransformRectangle);
			//card.render(this.context2d, this.images[this.currentIndex - this.numSideCards + i]);
		}
		this.renderCurrentIndex();
		this.drawArrows();
	}
	
	SimpleCoverFlow.prototype.slide=function(){
		//console.log("SimpleCoverFlow.slide() index : ",this.currentIndex);
		var _this=this;
		this.animator.reset(300, 20, function(){_this.slideDirection == 1 ? _this.slideLeft() : _this.slideRight() },function(){_this.slideComplete()});
		this.animator.start();
	}
		
	SimpleCoverFlow.prototype.slideComplete=function(){
		this.currentIndex += this.slideDirection;
		//console.log("SimpleCoverFlow.slideComplete()");
		for(var i=0; i<this.targetTransformRectangles.length; i++){
			this.cards[i].updatePointsToTransformRectangle(this.targetTransformRectangles[i]);
		}
		this.renderCurrentIndex();
	}

	
	//duplicated in BasicSlideShow, move to a util
	SimpleCoverFlow.prototype.drawArrows = function(){
		this.context2d.beginPath();
		this.context2d.lineWidth = 5;
		this.context2d.strokeStyle = SimpleGeometry.getRgbaStyleString(0xFF,0xFF,0xFF,1);
		this.context2d.fillStyle = SimpleGeometry.getRgbaStyleString(0,0,0,1);
		this.context2d.lineCap = "butt"; //"square";//

		var arrowHeight = 18;
		var arrowWidth = 10;
		var margin = 5;
		
		//left arrow graphic
		this.context2d.moveTo(this.x + arrowWidth + margin, this.y + this.height/2 );
		this.context2d.lineTo(this.x + arrowWidth + margin, this.y + this.height/2 - arrowHeight /2);
		this.context2d.lineTo(this.x + arrowWidth + margin, this.y + this.height/2 + arrowHeight /2);
		this.context2d.lineTo(this.x + margin, this.y + this.height/2 );
		this.context2d.lineTo(this.x + arrowWidth + margin, this.y + this.height/2 - arrowHeight /2);
		this.context2d.lineTo(this.x + arrowWidth + margin, this.y + this.height/2 );		
		
		//right arrow graphic
		this.context2d.moveTo(this.getRight() - arrowWidth - margin, this.y + this.height/2 );
		this.context2d.lineTo(this.getRight() - arrowWidth - margin, this.y + this.height/2 - arrowHeight /2);
		this.context2d.lineTo(this.getRight() - arrowWidth - margin, this.y + this.height/2 + arrowHeight /2);
		this.context2d.lineTo(this.getRight() - margin, this.y + this.height/2 );
		this.context2d.lineTo(this.getRight() - arrowWidth - margin, this.y + this.height/2 - arrowHeight /2);	
		this.context2d.lineTo(this.getRight() - arrowWidth - margin, this.y + this.height/2 );		
		this.context2d.stroke();
		this.context2d.fill();
		this.context2d.closePath();
		
		this.context2d.lineWidth = 0;
	}
	
	window.SimpleCoverFlow = SimpleCoverFlow;
	
}(window));



	/*
	SimpleCoverFlow.prototype.setCardTargets = function(image){
	
		var openCardRect = new SimpleGeometry.Rectangle();
		openCardRect.height = image.height;
		openCardRect.width = image.width;
		openCardRect.x = this.width/2-openCardRect.width/2;
		
		var leftCard = new SimpleGeometry.Rectangle();
		var rightCard = new SimpleGeometry.Rectangle();
		leftCard.y = rightCard.y = openCardRect.y = this.y + this.height/2-openCardRect.height/2;
		
		rightCard.width = leftCard.width = openCardRect.width * this.unfocusedItemWidthPercent;
		rightCard.height = leftCard.height = openCardRect.height;
		leftCard.x = openCardRect.x - leftCard.width;
		rightCard.x = openCardRect.getRight; 
		 
		this.numSideCards = Math.floor((openCardRect.x-this.x) / leftCard.width);
		
		this.targetTransformRectangles = new Array();
		//LEFT SIDE
		var fakePerspectiveOffset = openCardRect.height/5;
		for(var i=0; i< this.numSideCards; i++){
			this.targetTransformRectangles[i] = new TransformRectangle(	new SimpleGeometry.Point(this.x + leftCard.width*i, leftCard.y), 
																		new SimpleGeometry.Point(this.x + leftCard.width*(i+1), leftCard.y+fakePerspectiveOffset), 
																		new SimpleGeometry.Point(this.x + leftCard.width*(i+1), leftCard.getBottom()-fakePerspectiveOffset), 
																		new SimpleGeometry.Point(this.x + leftCard.width*i, leftCard.getBottom()) );
		}
		//MIDDLE
		this.targetTransformRectangles.push(new TransformRectangle(	new SimpleGeometry.Point(openCardRect.x, openCardRect.y), 
																		new SimpleGeometry.Point(openCardRect.getRight(), openCardRect.y), 
																		new SimpleGeometry.Point(openCardRect.getRight(), openCardRect.getBottom()), 
																		new SimpleGeometry.Point(openCardRect.x, openCardRect.getBottom() ) )
																	);
		//RIGHT SIDE
		for(i=0; i< this.numSideCards; i++){
			this.targetTransformRectangles[this.targetTransformRectangles.length] = new TransformRectangle(	new SimpleGeometry.Point(openCardRect.getRight() + rightCard.width*i, rightCard.y+fakePerspectiveOffset), 
																											new SimpleGeometry.Point(openCardRect.getRight() + rightCard.width*(i+1), rightCard.y), 
																											new SimpleGeometry.Point(openCardRect.getRight() + rightCard.width*(i+1), rightCard.getBottom()), 
																											new SimpleGeometry.Point(openCardRect.getRight() + rightCard.width*i, rightCard.getBottom()-fakePerspectiveOffset) );
		}
	}
	*/