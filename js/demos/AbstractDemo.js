(function (window){

	//================::ABSTRACT DEMO::===================

	var AbstractDemo = function(x, y, width, height, demoContainer){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.demoContainer = demoContainer;
		this.customCaptureControls = false;
		this.captureFrameRate = 300; //frames for generated gifs are captured at this rate
		this.gifPlaybackFrameRate = 100;//generated gifs play at this speed
        if(!demoContainer){
            console.log("AbstractDemo constructor, no demo container, cannot setUpDemo()");
            return;
        }
		this.setUpDemo();
	};
	
	//subclass extends superclass
	AbstractDemo.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	AbstractDemo.prototype.constructor = SimpleGeometry.Rectangle;

	//subclasses override this incase of custom set ups (additional canvas etc.)
	AbstractDemo.prototype.preSetUp = function(){};

	//subclasses override this incase of custom set ups
	AbstractDemo.prototype.setUpDemo = function(){
		this.preSetUp();
		this.animator = new UnitAnimator();
		this.animator.setEasingFunction(UnitAnimator.easeOutSine);
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.width; 
		this.canvas.height = this.height;
		this.context2d = this.canvas.getContext("2d");
		this.appendCanvas(this.canvas);
	};
	
	AbstractDemo.prototype.appendCanvas = function(canvas) {
		canvas.style.position = "absolute";
		canvas.style.left = "0px";
		canvas.style.top = "0px";
		this.demoContainer.appendChild(canvas);
	};
	
	AbstractDemo.prototype.getGlobalDemoPosition = function () {
        var point = new SimpleGeometry.Point(0, 0);
        var element = this.canvas;
        while (element) {
            if (element.style && element.style.left && element.style.top) {
                point.x += parseInt(element.style.left.split("px")[0]);
                point.y += parseInt(element.style.top.split("px")[0]);
            }
            element = element.parentNode;
        }
        return point;
    };
	
	//override in demos where multiple canvases are used, return canvases in correct stack z-sort order
	AbstractDemo.prototype.getCaptureCanvases = function(){
		return [this.canvas];
	};
	
	AbstractDemo.prototype.run = function(){
		this.clear();	
	};
	
	AbstractDemo.prototype.clear = function(){
		this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
	};
	
	AbstractDemo.prototype.loadImagesWithImageStore = function(urls){
		this.imageStore = new ImageStore();
		var _this = this;
		this.imageStore.loadImages(urls, function(){_this.imageStoreLoadComplete();} , function(){_this.imageStoreLoadProgress();});
		this.spinner = new SimpleLoaderGraphic(this.width / 2, this.height / 2, 25, function(){_this.updateSpinner();});
		this.spinner.play();		
	};
	
	AbstractDemo.prototype.imageStoreLoadProgress = function (){
		//console.log("AbstractDemo.imageStoreLoadProgress ",this.imageStore.getProgressString() );
		this.spinner.loadingText = "Loading images "+this.imageStore.getProgressString();
	};
	
	AbstractDemo.prototype.updateSpinner = function(){
		this.clear();
		this.spinner.render(this.context2d);
	};
		
	AbstractDemo.prototype.imageStoreLoadComplete = function(){
		//console.log("AbstractDemo.imageStoreLoadComplete()");
		this.clear();
		this.spinner.pause();
		delete this.spinner;
		this.useLoadedImageStoreImages();
	};
	
	AbstractDemo.prototype.useLoadedImageStoreImages = function(){
		console.log("AbstractDemo.useLoadedImageStoreImages(), this must be overridden in subclasses");
	};
	
	//delete any instances, remove any listeners / callbacks
	AbstractDemo.prototype.tearDown = function(){
		//console.log("AbstractDemo.teardown()");
		if(this.animator){
			this.animator.pause();
			delete this.animator;
		}
		if(this.imageStore){
			this.imageStore.stop();
			delete this.imageStore;
		}
		if(this.spinner){
			this.spinner.pause();
			delete this.spinner;
		}
		this.demoContainer.removeChild(this.canvas);
		delete this.context2d;
		delete this.canvas;
		this.customTearDown();
	};
	
	AbstractDemo.prototype.customTearDown = function(){
		//console.log("AbstractDemo.customTearDown()");
	};
	
	AbstractDemo.prototype.startCustomCaptureAnimation = function(){
		console.log("AbstractDemo.prototype.startCustomCaptureAnimation() must be overriden by subclasses");
	};
	
	AbstractDemo.prototype.animationComplete = function(){
		if(this.captureCompleteCallBack){
			this.captureCompleteCallBack();
		}
	};

	window.AbstractDemo = AbstractDemo;
	
}(window));