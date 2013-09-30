(function (window){


	ImageStore = function(){}
	
	ImageStore.COMPLETE="complete";
	
	ImageStore.prototype.images=new Array();
	ImageStore.prototype.currentLoadIndex = 0;
	ImageStore.prototype.completeCallback;//this is a temporary hack, figure out how to work with events in JS and remove
	ImageStore.prototype.updateCallback;//this is a temporary hack, figure out how to work with events in JS and remove
		
	ImageStore.prototype.loadImages = function(urls, completeCallback, updateCallback){
		this.urls = urls;
		this.completeCallback = completeCallback;
		this.updateCallback = updateCallback != undefined ? updateCallback : undefined;
		this.images = new Array();
		this.currentLoadIndex = 0;
		this.loadNextImage();
	}

	ImageStore.prototype.stop = function(){
		this.completeCallback = undefined;
		this.updateCallback = undefined;
		this.urls = new Array();
	}
	
	ImageStore.prototype.getProgressPercent = function(){
		return SimpleGeometry.normalize(this.currentLoadIndex, 0, this.urls.length);
	}
	
	ImageStore.prototype.getProgressString = function(){
		return this.currentLoadIndex+" / "+this.urls.length;
	}

	ImageStore.prototype.loadNextImage=function(){
		if(this.currentLoadIndex >= this.urls.length){
			//console.log("all images loaded");
			this.completeCallback();
			return;
		}
		//console.log("ImageStore.prototype.loadNextImage() : ",this.urls[this.currentLoadIndex]);
		var image = new Image();
		var _this = this;
		image.onload = function(){
			_this.imageLoadComplete();
		};

		var url = this.urls[this.currentLoadIndex]
		image.onerror = function(){
			alert("ImageStore ERROR : "+url+" could not be loaded.");
		}
		image.src = this.urls[this.currentLoadIndex];
		this.images.push(image);
		this.currentLoadIndex++;
	}
	
	ImageStore.prototype.imageLoadComplete = function(){
		//console.log("ImageStore.imageLoadComplete()");
		for(var i=0; i<this.images.length; i++){
			this.images[i].onload = undefined;
		}
		if(this.updateCallback != undefined){
			this.updateCallback();
		}
		this.loadNextImage();
	}
	

	window.ImageStore=ImageStore;
	
}(window));


