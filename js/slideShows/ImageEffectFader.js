//has a dependency on SimpleGeometry, UnitAnimator
//currently configured to only handle square images (Instagram)
(function (window){

	//set up event dispatching?  EventDispatcher

	ImageEffectFader = function(x,y,width,height,context2d){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.context2d=context2d;
		this.animator = new UnitAnimator();
	};
	
	//subclass extends superclass
	ImageEffectFader.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	ImageEffectFader.prototype.constructor = SimpleGeometry.Rectangle;

	ImageEffectFader.easingFunctions = [UnitAnimator.easeInSine, UnitAnimator.easeInOutSine, UnitAnimator.easeOutBounce, UnitAnimator.easeInBounce];
	
	ImageEffectFader.getRandomEasingFunction = function(){
		return ImageEffectFader.easingFunctions[Math.floor(Math.random()*ImageEffectFader.easingFunctions.length)];
	};
	
	//values is a multi dimentional Array with values
	ImageEffectFader.prototype.setImage = function(url, effect){
		//console.log("ImageEffectFader.setImage()", url);
		if(this.animator.isAnimating()){
			return;
		}
		if(this.image){
			this.previousImage = this.image;
		}
		this.image = new Image();
		this.image.width = this.width;
		this.image.height = this.height;
		this.image.src = url;
		var _this = this;
		this.spinner = new SimpleLoaderGraphic(this.width / 2, this.height / 2, 25, function(){_this.updateSpinner();});
		this.spinner.play();
		this.image.onload = function(){
			_this.showImage();
		}
	};
		
	ImageEffectFader.prototype.updateSpinner = function(){
		this.context2d.clearRect(0, 0, this.width, this.height);
		if(this.previousImage){
			this.context2d.drawImage( this.previousImage, 0, 0, this.width, this.height);
		}
		this.spinner.render(this.context2d);
	};
	
	ImageEffectFader.prototype.showImage = function(direction){
		if(this.spinner){
			this.spinner.pause();
			delete this.spinner;
			//this.context2d.clearRect(0, 0, this.width, this.height);
		}
		
		if(this.previousImage){
			this.startFadeOut();
			return;
		}
		var _this=this;
		this.fadeImage = ImageEffects.createRandomEffectImageFrom(this.image, this.width, this.height);
		this.animator.easingFunction = UnitAnimator.easeInSine;
		this.animator.reset(500, 20, function(){_this.fadeIn()},function(){_this.fadeInComplete()});
		this.animator.start();
	};
	
	ImageEffectFader.prototype.fadeIn = function(){
		this.context2d.drawImage( this.fadeImage, 0, 0, this.width, this.height);
		this.context2d.fillStyle = SimpleGeometry.getRgbaStyleString(0xFF, 0xFF, 0xFF, 1-this.animator.getAnimationPercent());
		this.context2d.fillRect(0, 0, this.width, this.height);
	};
	
	ImageEffectFader.prototype.fadeInComplete = function(){
		var _this=this;
		this.animator.easingFunction = ImageEffectFader.getRandomEasingFunction();
		this.animator.reset(1500, 20, function(){_this.updateEffect()},function(){_this.effectComplete()});
		this.animator.start();
	};
	
	ImageEffectFader.prototype.startFadeOut = function(){
		var _this=this;
		this.animator.easingFunction = UnitAnimator.easeInSine;
		this.animator.reset(500, 20, function(){_this.fadeOut()},function(){_this.fadeOutComplete()});
		this.animator.start();
	};
	ImageEffectFader.prototype.fadeOut = function(){
		this.context2d.drawImage( this.previousImage, 0, 0, this.width, this.height);
		this.context2d.fillStyle = SimpleGeometry.getRgbaStyleString(0xFF, 0xFF, 0xFF, this.animator.getAnimationPercent());
		this.context2d.fillRect(0, 0, this.width, this.height);
	};
	
	ImageEffectFader.prototype.fadeOutComplete = function(){
		delete this.previousImage;
		this.showImage();
	};
	
	ImageEffectFader.prototype.updateEffect = function(){
		this.context2d.drawImage( this.image, 0, 0, this.width, this.height);
		this.context2d.globalAlpha = 1 - this.animator.getAnimationPercent();
		this.context2d.drawImage( this.fadeImage, 0, 0, this.width, this.height );
		this.context2d.globalAlpha = 1;
	};
			
	ImageEffectFader.prototype.effectComplete = function(){
		this.context2d.drawImage( this.image, 0, 0, this.width, this.height);
		//console.log("ImageEffectFader.slideComplete()");
	};
	
	window.ImageEffectFader=ImageEffectFader;
	
}(window));