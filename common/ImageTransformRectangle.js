(function (window){


	Simple3DCard = function(){};
	
	Simple3DCard = function(x, y, width, height, image){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.image = image;
	};
	
	//subclass extends superclass
	Simple3DCard.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	Simple3DCard.prototype.constructor = SimpleGeometry.Rectangle;
		
	Simple3DCard.prototype.loadImages = function(urls, completeCallback, updateCallback){
		this.urls = urls;
		this.completeCallback = completeCallback;
		this.updateCallback = updateCallback != undefined ? updateCallback : undefined;
		this.images = [];
		this.currentLoadIndex = 0;
		this.loadNextImage();
	};

	Simple3DCard.prototype.stop = function(){
		this.completeCallback = undefined;
		this.updateCallback = undefined;
		this.urls = [];
	};
	
	Simple3DCard.prototype.getProgressPercent = function(){
		return SimpleGeometry.normalize(this.currentLoadIndex, 0, this.urls.length);
	};
	
	Simple3DCard.prototype.getProgressString = function(){
		return this.currentLoadIndex+" / "+this.urls.length;
	};

	Simple3DCard.prototype.loadNextImage=function(){
		if(this.currentLoadIndex >= this.urls.length){
			//console.log("all images loaded");
			this.completeCallback();
			return;
		}
		//console.log("Simple3DCard.prototype.loadNextImage() : ",this.urls[this.currentLoadIndex]);
		var image = new Image();
		var _this = this;
		image.onload = function(){
			_this.imageLoadComplete();
		};

		var url = this.urls[this.currentLoadIndex];
		image.onerror = function(){
			alert("Simple3DCard ERROR : "+url+" could not be loaded.");
		};
		image.src = this.urls[this.currentLoadIndex];
		this.images.push(image);
		this.currentLoadIndex++;
	};
	
	Simple3DCard.prototype.imageLoadComplete = function(){
		//console.log("Simple3DCard.imageLoadComplete()");
		for(var i=0; i<this.images.length; i++){
			this.images[i].onload = undefined;
		}
		if(this.updateCallback != undefined){
			this.updateCallback();
		}
		this.loadNextImage();
	};

	window.Simple3DCard=Simple3DCard;
	
}(window));

