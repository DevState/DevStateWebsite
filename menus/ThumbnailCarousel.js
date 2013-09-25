//has a dependency on SimpleGeometry, UnitAnimator
//currently configured to only handle square images (Instagram)
(function (window){

	//constructor
	ThumbnailCarousel = function(x,y,width,height,context2d,images){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.context2d = context2d;
		if(images){
			this.setImages(images);
		}
		this.animator = new UnitAnimator();
	}
	
	//subclass extends superclass
	ThumbnailCarousel.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	ThumbnailCarousel.prototype.constructor = SimpleGeometry.Rectangle;
	
	//properties
	ThumbnailCarousel.prototype.fullThumbSize;
	ThumbnailCarousel.prototype.radius;
	ThumbnailCarousel.prototype.currentIndex = 0;
	ThumbnailCarousel.prototype.hotSpot = new SimpleGeometry.Rectangle();
	
	ThumbnailCarousel.prototype.items;
	ThumbnailCarousel.prototype.anchorItem;
	ThumbnailCarousel.prototype.anchorItemTargetRadian;
	ThumbnailCarousel.prototype.anchorItemRadian;
	ThumbnailCarousel.prototype.animator = new UnitAnimator();
		
	ThumbnailCarousel.prototype.next = function(){
		if(this.animator.isAnimating()){
			return;
		}
		//console.log("ThumbnailCarousel.next this.currentIndex",this.currentIndex);
		this.slide(1);
	}
	ThumbnailCarousel.prototype.previous = function(){
		if(this.animator.isAnimating()){
			return;
		}
		//console.log("ThumbnailCarousel.previous this.currentIndex",this.currentIndex);
		this.slide(-1);
	}
	
	ThumbnailCarousel.prototype.getCurrentImage = function(){
		//console.log("ThumbnailCarousel.getCurrentImage()", this.currentIndex);
		for(i=0; i<this.items.length; i++){
			if(this.items[i].itemId == (this.currentIndex== 0 ? 0 : (this.images.length - this.currentIndex)) ){
				return this.items[i].image;
			}
		}
	}
	
	//values is a multi dimentional Array with values
	//assumes all thumbnails are the same size
	ThumbnailCarousel.prototype.setImages = function(images){
		this.images = images;
		this.setFullThumbSize(images[0]);
		this.radius = this.width / 2 - this.fullThumbSize.width;
		this.segmentRadian = SimpleGeometry.PI2 / this.images.length;
		this.currentIndex = 0;
		this.firstRender();
	}
	
	ThumbnailCarousel.prototype.setFullThumbSize = function(image){
		this.fullThumbSize = new SimpleGeometry.Rectangle();
		if(this.height < image.height){
			this.fullThumbSize.height = this.height;
			this.fullThumbSize.width = (image.height / this.height) * image.width;
		}else{
			this.fullThumbSize.height = image.height;
			this.fullThumbSize.width = image.width;
		}
	}
	
	ThumbnailCarousel.itemsScaleSort = function(a,b){
		return parseFloat(a.scale) - parseFloat(b.scale);
	}
	
	ThumbnailCarousel.prototype.firstRender = function(){
		this.items = new Array();
		var radian = Math.PI / 2;
		var center = this.getCenter();
		var rectangle, scale;
		for(var i=0; i<this.images.length; i++){
			rectangle=new SimpleGeometry.Rectangle();
			rectangle.x = center.x + Math.cos(radian) * this.radius;
			rectangle.y = center.y ;
			scale = SimpleGeometry.map(Math.max(center.x, rectangle.x) - Math.min(center.x, rectangle.x), 0 , this.radius, 1, .5);
			rectangle.width = scale * this.images[i].width;
			rectangle.height = scale * this.images[i].height;

			this.items[i] = new ThumbnailCarouselItem(i,this.images[i], scale, SimpleGeometry.constrainRadianTo2PI(radian), rectangle);
			radian += this.segmentRadian;
		}
		this.anchorItem = this.items[0];//only this one is animated, all other items "follow" this ones position 
		//this.hotSpot = new SimpleGeometry.Rectangle(this.x + this.anchorItem.rectangle.x, this.y + this.anchorItem.rectangle.y,  this.anchorItem.rectangle.width, this.anchorItem.rectangle.height);
		this.hotSpot = new SimpleGeometry.Rectangle(this.anchorItem.rectangle.x - this.anchorItem.rectangle.width/2, 
													this.anchorItem.rectangle.y - this.anchorItem.rectangle.height/2,  
													this.anchorItem.rectangle.width, 
													this.anchorItem.rectangle.height);
		this.drawThumbnails();
	}
	
	ThumbnailCarousel.prototype.outlineColor = "#FFFFFF";
	ThumbnailCarousel.prototype.shadowColor = "#000000";
	ThumbnailCarousel.prototype.outlineThickness = 4;
	
	ThumbnailCarousel.prototype.drawThumbnails = function(){
		//this.context2d.fillStyle="#FFFFFF";
		this.context2d.clearRect(this.x,this.y,this.width,this.height);
		this.items.sort(ThumbnailCarousel.itemsScaleSort);
		
		//draw outlines
		
		this.context2d.fillStyle = this.outlineColor;
		for(var i=0; i<this.items.length; i++){
			item = this.items[i];
			if(SimpleGeometry.constrainRadianTo2PI(item.radian) <= Math.PI){
				this.context2d.fillRect(	item.rectangle.x-item.rectangle.width/2 - this.outlineThickness, 
											item.rectangle.y-item.rectangle.height/2 - this.outlineThickness, 
											item.rectangle.width + this.outlineThickness*2+2,
											item.rectangle.height + this.outlineThickness*2+2 );// +2 to make room for the thumb drop shadows
			}
		}
		//this.context2d.clearRect(this.x,this.y+this.height/2,this.width, this.height/2);
		//draw thumbs
		this.context2d.shadowColor = this.shadowColor;
		this.context2d.shadowBlur = 3;
		this.context2d.shadowOffsetX = 2;
		this.context2d.shadowOffsetY = 2;
		for(i=0; i<this.items.length; i++){
			item = this.items[i];
			if(SimpleGeometry.constrainRadianTo2PI(item.radian) <= Math.PI){
				this.context2d.drawImage(	item.image, item.rectangle.x-item.rectangle.width/2, 
											item.rectangle.y-item.rectangle.height/2, item.rectangle.width, item.rectangle.height);
			}
		}
		this.context2d.shadowOffsetX = 0;
		this.context2d.shadowOffsetY = 0;
		this.context2d.shadowBlur = 0;
		this.drawArrows();
	}
			
	ThumbnailCarousel.prototype.updateCurrentIndex = function(direction){
		this.currentIndex += direction;
		this.currentIndex = this.currentIndex >= this.images.length ? 0 :  this.currentIndex;
		this.currentIndex = this.currentIndex < 0 ? this.images.length-1 : this.currentIndex;
	}
	
	ThumbnailCarousel.prototype.slide=function(direction){
		this.anchorItemRadian = Math.PI / 2 + this.currentIndex * this.segmentRadian;
		this.updateCurrentIndex(direction);
		this.anchorItemTargetRadian = Math.PI / 2 + this.currentIndex * this.segmentRadian;
		//fix jump
		if(Math.abs(this.anchorItemTargetRadian - this.anchorItemRadian) > Math.PI){
			if(this.anchorItemTargetRadian > this.anchorItemRadian){
				this.anchorItemTargetRadian -=  SimpleGeometry.PI2;
			}else{
				this.anchorItemTargetRadian += SimpleGeometry.PI2 
			}
		}
		var _this=this;
		this.animator.reset(500, 20, function(){_this.rotate()},function(){_this.rotateComplete()});
		this.animator.start();
	}
	
	ThumbnailCarousel.prototype.rotate=function(){
		var radian = this.anchorItemRadian + (this.anchorItemTargetRadian - this.anchorItemRadian) * this.animator.getAnimationPercent();
		var center = this.getCenter();
		var item;
		for(var i=0; i<this.items.length; i++){
			item = this.items[i];
			item.radian = radian + (item.itemId * this.segmentRadian) ;
			item.rectangle.x = center.x + Math.cos(item.radian) * this.radius;
			item.scale = SimpleGeometry.map(Math.max(center.x, item.rectangle.x) - Math.min(center.x, item.rectangle.x), 0 , this.radius, 1, .5);
			item.rectangle.width = item.scale * item.image.width;
			item.rectangle.height = item.scale * item.image.height;
		}
		this.drawThumbnails();
	}
		
	ThumbnailCarousel.prototype.rotateComplete=function(){
		//console.log("ThumbnailCarousel.slideComplete()");
	}

	
	//duplicated in BasicSlideShow, move to a util
	ThumbnailCarousel.prototype.drawArrows = function(){
		this.context2d.beginPath();
		this.context2d.lineWidth = 5;
		this.context2d.strokeStyle = SimpleGeometry.getRgbaStyleString(0xFF,0xFF,0xFF,1);
		this.context2d.fillStyle = SimpleGeometry.getRgbaStyleString(0,0,0,1);
		this.context2d.lineCap = "butt"; //"square";//

		var arrowHeight = 18;
		var arrowWidth = 10;
		var margin = 52;
		
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
	
	window.ThumbnailCarousel = ThumbnailCarousel;
	
	//===============::THUMBNAIL CAROUSEL ITEM::==============
	
	ThumbnailCarouselItem = function(id, image, scale, radian, rectangle){
		this.itemId = id;
		this.image = image;
		this.scale = scale;
		this.radian = radian;
		this.rectangle = rectangle;
	}
	//properties
	ThumbnailCarouselItem.prototype.image;
	ThumbnailCarouselItem.prototype.scale = 1;
	ThumbnailCarouselItem.prototype.radian = 0;
	ThumbnailCarouselItem.prototype.rectangle = new SimpleGeometry.Rectangle();
	
	window.ThumbnailCarouselItem = ThumbnailCarouselItem;
	
}(window));