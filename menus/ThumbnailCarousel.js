//has a dependency on SimpleGeometry, UnitAnimator
//currently configured to only handle square images (Instagram)
(function (window){

	//constructor
	ThumbnailCarousel = function(x,y,width,height,context2d,images){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.context2d = context2d;
		//this.outlineColor = "#FFFFFF"; //if this is set, an outline is drawn
		//this.shadowColor = "#000000"; //if this is set, the thumbnails have shadows
		this.outlineThickness = 4;
		this.animator = new UnitAnimator();
		this.arrows = new ArrowButtons(this);
		this.hotSpot = new SimpleGeometry.Rectangle();
		if(images){
			this.setImages(images);
		}
	};
	
	//subclass extends superclass
	ThumbnailCarousel.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	ThumbnailCarousel.prototype.constructor = SimpleGeometry.Rectangle;
			
	ThumbnailCarousel.prototype.next = function(){
		if(this.animator.isAnimating()){
			return;
		}
		//console.log("ThumbnailCarousel.next this.currentIndex",this.currentIndex);
		this.slide(1);
	};
	ThumbnailCarousel.prototype.previous = function(){
		if(this.animator.isAnimating()){
			return;
		}
		//console.log("ThumbnailCarousel.previous this.currentIndex",this.currentIndex);
		this.slide(-1);
	};
	
	ThumbnailCarousel.prototype.getCurrentImage = function(){
		//console.log("ThumbnailCarousel.getCurrentImage()", this.currentIndex);
		for(var i=0; i<this.items.length; i++){
			if(this.items[i].itemId == (this.currentIndex== 0 ? 0 : (this.images.length - this.currentIndex)) ){
				return this.items[i].image;
			}
		}
        return null;
	};
	
	//values is a multi dimentional Array with values, assumes all thumbnails are the same size
	ThumbnailCarousel.prototype.setImages = function(images){
		this.images = images;
		this.radius = this.width / 2 - images[0].width/2;
		this.segmentRadian = SimpleGeometry.PI2 / this.images.length;
		this.currentIndex = 0;
		this.setUpCarousel();
		this.renderThumbnails();
	};
	
	ThumbnailCarousel.prototype.setUpCarousel = function(){
		this.items = [];
		var radian = Math.PI / 2;
		var center = this.getCenter();
		var carouselBounds, scale;
		for(var i=0; i<this.images.length; i++){
			carouselBounds=new SimpleGeometry.Rectangle();
			carouselBounds.x = center.x + Math.cos(radian) * this.radius;
			carouselBounds.y = center.y ;
			scale = SimpleGeometry.map(Math.max(center.x, carouselBounds.x) - Math.min(center.x, carouselBounds.x), 0 , this.radius, 1, .5);
			carouselBounds.width = scale * this.images[i].width;
			carouselBounds.height = scale * this.images[i].height;

			this.items[i] = new ThumbnailCarouselItem(i,this.images[i], scale, SimpleGeometry.constrainRadianTo2PI(radian), carouselBounds);
			radian += this.segmentRadian;
		}
		this.anchorItem = this.items[0];//only this one is animated, all other items "follow" this ones position 
		this.hotSpot = new SimpleGeometry.Rectangle(this.anchorItem.rectangle.x - this.anchorItem.rectangle.width/2, 
													this.anchorItem.rectangle.y - this.anchorItem.rectangle.height/2,  
													this.anchorItem.rectangle.width, 
													this.anchorItem.rectangle.height);
	};

	ThumbnailCarousel.itemsScaleSort = function(a,b){
		return parseFloat(a.scale) - parseFloat(b.scale);
	};

	ThumbnailCarousel.prototype.renderThumbnailOutlines = function(){
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
	};
	
	ThumbnailCarousel.prototype.renderThumbnails = function(){
		//this.context2d.fillStyle="#FFFFFF";
		this.context2d.clearRect(this.x,this.y,this.width,this.height);
		this.items.sort(ThumbnailCarousel.itemsScaleSort);
		
		if(this.outlineColor){
			this.renderThumbnailOutlines();
		}
		
		if(this.shadowColor){
			this.context2d.shadowColor = this.shadowColor;
			this.context2d.shadowBlur = 3;
			this.context2d.shadowOffsetX = 2;
			this.context2d.shadowOffsetY = 2;		
		}
		for(var i=0; i<this.items.length; i++){
			item = this.items[i];
			if(SimpleGeometry.constrainRadianTo2PI(item.radian) <= Math.PI){
				this.context2d.drawImage(	item.image, item.rectangle.x-item.rectangle.width/2, 
											item.rectangle.y-item.rectangle.height/2, item.rectangle.width, item.rectangle.height);
			}
		}
		this.context2d.shadowOffsetX = 0;
		this.context2d.shadowOffsetY = 0;
		this.context2d.shadowBlur = 0;
		this.arrows.render(this.context2d);
	};
			
	ThumbnailCarousel.prototype.updateCurrentIndex = function(direction){
		this.currentIndex += direction;
		this.currentIndex = this.currentIndex >= this.images.length ? 0 :  this.currentIndex;
		this.currentIndex = this.currentIndex < 0 ? this.images.length-1 : this.currentIndex;
	};
	
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
		this.animator.reset(500, 20, function(){_this.rotate()});
		this.animator.start();
	};
	
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
		this.renderThumbnails();
	};

	window.ThumbnailCarousel = ThumbnailCarousel;
	
	//===============::THUMBNAIL CAROUSEL ITEM::==============
	
	ThumbnailCarouselItem = function(id, image, scale, radian, rectangle){
		this.itemId = id;
		this.image = image;
		this.scale = isNaN(scale) ? 1 : scale;
		this.radian = isNaN(radian) ? 0 : radian;
		this.rectangle = rectangle ? rectangle : new SimpleGeometry.Rectangle();
	};
	
	window.ThumbnailCarouselItem = ThumbnailCarouselItem;
	
}(window));