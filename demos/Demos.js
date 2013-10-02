(function (window){

	//================::ABSTRACT DEMO::===================

	//constructor
	AbstractDemo = function(x, y, width, height, document){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.document = document;
		this.customCaptureControls = false;
		this.captureFrameRate = 300; //frames for generated gifs are captured at this rate
		this.gifPlaybackFrameRate = 100;//generated gifs play at this speed
		this.setUpDemo();
	}
	
	//subclass extends superclass
	AbstractDemo.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	AbstractDemo.prototype.constructor = SimpleGeometry.Rectangle;

	AbstractDemo.prototype.toolTip = "";	

	//subclasses override this incase of custom set ups (additional canvas etc.)
	AbstractDemo.prototype.preSetUp = function(){}

	//subclasses override this incase of custom set ups
	AbstractDemo.prototype.setUpDemo = function(){
		this.preSetUp();
		this.animator = new UnitAnimator();
		this.animator.setEasingFunction(UnitAnimator.easeOutSine);
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.width; 
		this.canvas.height = this.height;
		this.context2d = this.canvas.getContext("2d");
		this.canvas.style.position = "absolute";
		this.document.body.appendChild(this.canvas);//later on this should be a div, the created canvas should adopt the sizes of the div
	}
	
	//override in demos where multiple canvases are used, return canvases in correct stack z-sort order
	AbstractDemo.prototype.getCaptureCanvases = function(){
		return [this.canvas];
	}
	
	AbstractDemo.prototype.run = function(){
		this.clear();	
	}
	
	AbstractDemo.prototype.clear = function(){
		this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	
	AbstractDemo.prototype.loadImagesWithImageStore = function(urls){
		this.imageStore = new ImageStore();
		var _this = this;
		this.imageStore.loadImages(urls, function(event){_this.imageStoreLoadComplete();} , function(event){_this.imageStoreLoadProgress();});
		this.spinner = new SimpleLoaderGraphic(this.width / 2, this.height / 2, 25, function(event){_this.updateSpinner();});
		this.spinner.play();		
	}
	
	AbstractDemo.prototype.imageStoreLoadProgress = function (){
		//console.log("AbstractDemo.imageStoreLoadProgress ",this.imageStore.getProgressString() );
		this.spinner.loadingText = "Loading images "+this.imageStore.getProgressString();
	}
	
	AbstractDemo.prototype.updateSpinner = function(){
		this.clear();
		this.spinner.render(this.context2d);
	}
		
	AbstractDemo.prototype.imageStoreLoadComplete = function(){
		//console.log("AbstractDemo.imageStoreLoadComplete()");
		this.clear();
		this.spinner.pause();
		delete this.spinner;
		this.useLoadedImageStoreImages();
	}
	
	AbstractDemo.prototype.useLoadedImageStoreImages = function(){
		console.log("AbstractDemo.useLoadedImageStoreImages(), this must be overridden in subclasses");
	}
	
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
		this.document.body.removeChild(this.canvas);
		delete this.context2d;
		delete this.canvas;
		this.customTearDown();		
		this.document = undefined;
	}
	
	AbstractDemo.prototype.customTearDown = function(){
		//console.log("AbstractDemo.customTearDown()");
	}
	
	AbstractDemo.prototype.startCustomCaptureAnimation = function(){
		console.log("AbstractDemo.prototype.startCustomCaptureAnimation() must be overriden by subclasses");
	}
	
	AbstractDemo.prototype.animationComplete = function(){
		if(this.captureCompleteCallBack){
			this.captureCompleteCallBack();
		}
	}
	
	window.AbstractDemo = AbstractDemo;
	
	
	//============================================
	//================::DEMOS::===================
	//============================================
	
	
	
	

	//================::PIE CHART::===================
	
	PieChartDemo = function(x, y, width, height, document){
		AbstractDemo.call(this, x, y, width, height, document); //call super constructor.
		this.toolTip = "Click link to create random data, click pie chart to open/close";
		this.gifPlaybackFrameRate = 200;
	}
	
	//subclass extends superclass
	PieChartDemo.prototype = Object.create(AbstractDemo.prototype);
	PieChartDemo.prototype.constructor = AbstractDemo;
	
	PieChartDemo.prototype.createPieChart = function(){
		this.showReflection = true;
		var pie = new PieChart(this.x, this.y, this.width, this.height*.6, 10);
		this.reflectionCaptureRect = new SimpleGeometry.Rectangle(pie.center.x-pie.radius, pie.center.y-pie.radius, pie.radius*2, pie.radius*2);
		return pie;
	}
	
	PieChartDemo.prototype.run = function(){
		this.pieChart = this.createPieChart();
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		this.pieChartOpen = true;
		this.animator = new UnitAnimator(1000, 20, function() {_this.updatePieChart()}, function() {_this.animationComplete()});
		this.animator.start();
	}
	
	PieChartDemo.prototype.updatePieChart = function(){
		this.renderPieChart(this.animator.getAnimationPercent());
	}
	PieChartDemo.prototype.updatePieChartReverse = function(){
		this.renderPieChart(1-this.animator.getAnimationPercent());
	}
	
	PieChartDemo.prototype.renderPieChart = function(animationPercent){
		this.clear();
		this.pieChart.render(this.context2d, animationPercent);
		if(!this.showReflection){
			return;
		}
		ImageEffects.renderReflection(this.canvas, this.reflectionCaptureRect);
	}
		
	PieChartDemo.prototype.canvasClickHandler = function(event){
		if(this.animator.isAnimating()){
			return;
		}
		var _this = this;
		var callback = this.pieChartOpen ? function(event){_this.updatePieChartReverse();} : function(event){_this.updatePieChart();}
		this.animator.reset(1000,20,callback );
		this.animator.start();
		this.pieChartOpen =!this.pieChartOpen;
	}
	
	PieChartDemo.prototype.customTearDown = function(){
		delete this.pieChart;
	}
	
	window.PieChartDemo = PieChartDemo;
	
	
	
	
	

	
	//================::DONUT CHART::===================
	
	DonutChartDemo = function(x, y, width, height, document){
		PieChartDemo.call(this, x, y, width, height, document); //call super constructor.
		this.toolTip = "Click link to create random data, click donut chart to open/close";
	}
	
	//subclass extends superclass
	DonutChartDemo.prototype = Object.create(PieChartDemo.prototype);
	DonutChartDemo.prototype.constructor = PieChartDemo;
	
	DonutChartDemo.prototype.createPieChart = function(){
		this.showReflection = false;
		//console.log("DonutChartDemo.prototype.createPieChart()");
		return new DonutChart(this.x,this.y,this.width,this.height);
		//return new DonutChart(this.x+35,this.y+30,this.width/2-60,this.height/2-60,.3);
	}
	
	window.DonutChartDemo = DonutChartDemo;



	

	
	
	//================::LINE CHART::===================
	
	LineChartDemo = function(x, y, width, height, document){
		AbstractDemo.call(this, x, y, width, height, document); //call super constructor.
		this.toolTip = "Click link to create random data, click line chart to open/close";
		this.gifPlaybackFrameRate = 200;
	}
	
	//subclass extends superclass
	LineChartDemo.prototype = Object.create(AbstractDemo.prototype);
	LineChartDemo.prototype.constructor = AbstractDemo;
	
	LineChartDemo.prototype.run = function(){
		this.lineChart = new LineChart(this.x, this.y, this.width, this.height);
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		this.lineChartOpen = true;
		this.animator=new UnitAnimator(1000,20,function() {_this.updateLineChart()}, function() {_this.animationComplete()});
		this.animator.start();
	}	
	
	LineChartDemo.prototype.updateLineChart = function(){
		this.clear();
		this.lineChart.render(this.context2d, this.animator.getAnimationPercent());
	}
	LineChartDemo.prototype.updateLineChartReverse = function(){
		this.clear();
		this.lineChart.render(this.context2d, 1-this.animator.getAnimationPercent());
	}
	
	LineChartDemo.prototype.canvasClickHandler = function(event){
		if(this.animator.isAnimating()){
			return;
		}
		var _this = this;
		this.animator.reset(1000,20,this.lineChartOpen ? function(event){_this.updateLineChartReverse();} : function(event){_this.updateLineChart();} );
		this.animator.start();
		this.lineChartOpen =! this.lineChartOpen;
	}
	
	LineChartDemo.prototype.customTearDown = function(){
		delete this.lineChartOpen;
	}
	
	window.LineChartDemo = LineChartDemo;
	
	
	
	
	
	
	//================::BAR CHART::===================
	
	BarChartDemo = function(x, y, width, height, document){
		AbstractDemo.call(this, x, y, width, height, document); //call super constructor.
		this.toolTip = "Click link to create random data, click bar chart to open/close";
		this.gifPlaybackFrameRate = 200;
	}
	
	//subclass extends superclass
	BarChartDemo.prototype = Object.create(AbstractDemo.prototype);
	BarChartDemo.prototype.constructor = AbstractDemo;
	
	BarChartDemo.prototype.preSetUp = function(){
		this.backGroundCanvas = this.document.createElement('canvas');
		//console.log("BarChartDemo.preSetUp() ",this.backGroundCanvas);
		this.backGroundCanvas.width = this.width; 
		this.backGroundCanvas.height = this.height;
		this.backGroundCanvasContext2d = this.backGroundCanvas.getContext("2d");
		this.backGroundCanvas.style.position = "absolute";
		this.document.body.appendChild(this.backGroundCanvas);//later on this should be a div, the created canvas should adopt the sizes of the div	
	}
	BarChartDemo.prototype.getCaptureCanvases = function(){
		return [this.backGroundCanvas, this.canvas];
	}
	
	BarChartDemo.prototype.run = function(){
		var extrude = 12;
		this.barChart = new BarChart(this.x + 10, this.y+extrude, this.width-extrude, this.height-extrude);
		this.barChart.extrudeWidth = extrude;
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		this.barChartOpen = true;
		this.animator = new UnitAnimator(1500,20,function() {_this.updateBarChart()}, function() {_this.animationComplete()});
		//this.animator.start(UnitAnimator.getRandomEasingFunction());
		this.animator.start(UnitAnimator.easeOutSine);
	}

	BarChartDemo.prototype.createBackground = function(){
		this.background = new ChartBackground(this.x, this.y, this.width, this.height);
		this.background.renderFalse3d = true;
		this.background.false3DExtrusion = this.barChart.extrudeWidth;
		this.background.legendMargin = this.barChart.extrudeWidth + 3;
		this.background.render(this.backGroundCanvasContext2d, 0, this.barChart.max);
	}
	
	BarChartDemo.prototype.updateBarChart = function(){
		this.clear();
		this.barChart.render(this.context2d, this.animator.getAnimationPercent());
		//TODO : move this somewhere smarter
		if(!this.background){
			this.createBackground();
		}
	}
	BarChartDemo.prototype.updateBarChartReverse = function(){
		this.clear();
		this.barChart.render(this.context2d, 1 - this.animator.getAnimationPercent());
	}
	
	BarChartDemo.prototype.canvasClickHandler = function(event){
		if(this.animator.isAnimating()){
			return;
		}
		var _this = this;
		this.animator.reset(1500,20,this.barChartOpen ? function(event){_this.updateBarChartReverse();} : function(event){_this.updateBarChart();} );
		this.animator.start(this.barChartOpen ? UnitAnimator.easeInSine : UnitAnimator.easeOutSine);
		this.barChartOpen =! this.barChartOpen;
	}
	
	BarChartDemo.prototype.customTearDown = function(){
		delete this.barChart;
		this.document.body.removeChild(this.backGroundCanvas);
		delete this.backGroundCanvasContext2d;
		delete this.backGroundCanvas;
	}
	
	window.BarChartDemo = BarChartDemo;
	
	
	
	
	
	
	//================::BASIC SLIDESHOW::===================

	BasicSlideShowDemo = function(x, y, width, height, document){
		AbstractDemo.call(this, x, y, width, height, document); //call super constructor.
		this.toolTip = "Click left or right arrows to slide to next/previous image";
		this.customCaptureControls = true;
	}
	
	//subclass extends superclass
	BasicSlideShowDemo.prototype = Object.create(AbstractDemo.prototype);
	BasicSlideShowDemo.prototype.constructor = AbstractDemo;
	
	BasicSlideShowDemo.prototype.run = function(){
		//this.basicSlideShow = new BasicSlideShow(10, 10, this.width-10, this.height-10, this.context2d);
		this.basicSlideShow = new BasicSlideShow(this.x, this.y, this.width, this.height, this.context2d);
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		var urls=new Array(
			"assets/instagramPhotos/paperWeight.jpg",
			"assets/instagramPhotos/peacock.jpg",
			"assets/instagramPhotos/rufus.jpg",
			"assets/instagramPhotos/sakBeer.jpg",
			"assets/instagramPhotos/SakEU.jpg",
			"assets/instagramPhotos/sakirisChips.jpg",
			"assets/instagramPhotos/silverTower.jpg",
			"assets/instagramPhotos/oneWay.jpg",
			"assets/instagramPhotos/botaniqueLady.jpg",
			"assets/instagramPhotos/snowBallLantern.jpg",
			"assets/instagramPhotos/springSnow.jpg",
			"assets/instagramPhotos/Keon0FucksGiven.jpg",
			"assets/instagramPhotos/sunny.jpg");

		this.loadImagesWithImageStore(urls);
	}
		
	BasicSlideShowDemo.prototype.useLoadedImageStoreImages = function(){
		//console.log("BasicSlideShowDemo.useLoadedImageStoreImages()");
		this.basicSlideShow.setImages(this.imageStore.images);
	}
	
	BasicSlideShowDemo.prototype.canvasClickHandler = function(event){
		var x=event.pageX - this.canvas.offsetLeft;
		var y=event.pageY - this.canvas.offsetTop;
		var point=new SimpleGeometry.Point(x,y)
		if(this.basicSlideShow.containsPoint(point)){
			if(point.x > this.basicSlideShow.x + this.basicSlideShow.width/2){
				this.basicSlideShow.next();
			}else{
				this.basicSlideShow.previous();
			}
		}
	}
	
	BasicSlideShowDemo.prototype.startCustomCaptureAnimation = function(){
		this.basicSlideShow.next();
	}
	
	BasicSlideShowDemo.prototype.customTearDown = function(){
		delete this.basicSlideShow;
	}
	
	window.BasicSlideShowDemo = BasicSlideShowDemo;






	
	//================::THUMBNAIL CAROUSEL::===================

	ThumbnailCarouselDemo = function(x, y, width, height, document){
		AbstractDemo.call(this, x, y, width, height, document); //call super constructor.
		this.toolTip = "Click arrows to rotate carousel, click active thumb to load photo";
		this.customCaptureControls = true;
	}
	
	//subclass extends superclass
	ThumbnailCarouselDemo.prototype = Object.create(AbstractDemo.prototype);
	ThumbnailCarouselDemo.prototype.constructor = AbstractDemo;
		
	ThumbnailCarouselDemo.prototype.run = function(){
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		var urls=new Array(
			"assets/instagramThumbs/paperWeight.jpg",
			"assets/instagramThumbs/peacock.jpg",
			"assets/instagramThumbs/rufus.jpg",
			"assets/instagramThumbs/sakBeer.jpg",
			"assets/instagramThumbs/SakEU.jpg",
			"assets/instagramThumbs/sakirisChips.jpg",
			"assets/instagramThumbs/silverTower.jpg",
			"assets/instagramThumbs/oneWay.jpg",
			"assets/instagramThumbs/botaniqueLady.jpg",
			"assets/instagramThumbs/snowBallLantern.jpg",
			"assets/instagramThumbs/springSnow.jpg",
			"assets/instagramThumbs/Keon0FucksGiven.jpg",
			"assets/instagramThumbs/sunny.jpg");

		this.loadImagesWithImageStore(urls);
	}
	
	ThumbnailCarouselDemo.prototype.useLoadedImageStoreImages = function(){
		//console.log("ThumbnailCarouselDemo.useLoadedImageStoreImages()");
		this.thumbnailCarousel = new ThumbnailCarousel(	this.x, this.y + this.height/2 - this.imageStore.images[0].height/2, 
														this.width, this.imageStore.images[0].height+10, this.context2d);
		this.thumbnailCarousel.setImages(this.imageStore.images);
	}
	
	ThumbnailCarouselDemo.prototype.canvasClickHandler = function(event){
		var x = event.pageX - this.canvas.offsetLeft;
		var y = event.pageY - this.canvas.offsetTop;
		var point = new SimpleGeometry.Point(x,y);
		if(this.thumbnailCarousel.hotSpot.containsPoint(point)){
			var image = this.thumbnailCarousel.getCurrentImage();
			var source = image.src.split("/");
			console.log(source[source.length-1]);
			return;
		}
		if(this.thumbnailCarousel.containsPoint(point)){
			if(point.x > this.thumbnailCarousel.x + this.thumbnailCarousel.width/2){
				this.thumbnailCarousel.next();
			}else{
				this.thumbnailCarousel.previous();
			}
		}
	}
	
	ThumbnailCarouselDemo.prototype.startCustomCaptureAnimation = function(){
		this.thumbnailCarousel.next();
	}
	
	ThumbnailCarouselDemo.prototype.customTearDown = function(){
		delete this.thumbnailCarousel;
	}
	
	window.ThumbnailCarouselDemo = ThumbnailCarouselDemo;
	
	
	
	
	
	
	//================::IMAGE FADER::===================	
	
	ImageFaderDemo = function(x, y, width, height, document){
		AbstractDemo.call(this, x, y, width, height, document); //call super constructor.
		this.toolTip = "Click image to fade effect random image";
		this.customCaptureControls = true;
	}
	//subclass extends superclass
	ImageFaderDemo.prototype = Object.create(AbstractDemo.prototype);
	ImageFaderDemo.prototype.constructor = AbstractDemo;	
	
	ImageFaderDemo.prototype.run = function(){
		this.urls=new Array(
			"assets/instagramPhotos/paperWeight.jpg",
			"assets/instagramPhotos/peacock.jpg",
			"assets/instagramPhotos/rufus.jpg",
			"assets/instagramPhotos/sakBeer.jpg",
			"assets/instagramPhotos/SakEU.jpg",
			"assets/instagramPhotos/sakirisChips.jpg",
			"assets/instagramPhotos/silverTower.jpg",
			"assets/instagramPhotos/oneWay.jpg",
			"assets/instagramPhotos/botaniqueLady.jpg",
			"assets/instagramPhotos/snowBallLantern.jpg",
			"assets/instagramPhotos/springSnow.jpg",
			"assets/instagramPhotos/Keon0FucksGiven.jpg",
			"assets/instagramPhotos/sunny.jpg");
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		this.ImageEffectFader = new ImageEffectFader(this.x, this.y, this.width, this.height, this.context2d);
		this.showRandomImage();
	}

	ImageFaderDemo.prototype.showRandomImage = function(){
		this.ImageEffectFader.setImage( this.urls[Math.floor(Math.random()*this.urls.length)] );	
	}
	
	ImageFaderDemo.prototype.canvasClickHandler = function(event){
		this.showRandomImage();
	}
	
	ImageFaderDemo.prototype.startCustomCaptureAnimation = function(){
		this.showRandomImage();
	}
	
	ImageFaderDemo.prototype.customTearDown = function(){
		delete this.ImageEffectFader;
	}
	
	window.ImageFaderDemo = ImageFaderDemo;
	
	
	
	
	//================::WANDERER::===================
	
	WandererDemo = function(x, y, width, height, document){
		AbstractDemo.call(this, x, y, width, height, document); //call super constructor.
		this.toolTip = "The two colors are complementary";
		this.customCaptureControls = true;
	}
	
	//subclass extends superclass
	WandererDemo.prototype = Object.create(AbstractDemo.prototype);
	WandererDemo.prototype.constructor = AbstractDemo;
	
	WandererDemo.prototype.run = function(){
		this.loadImagesWithImageStore(["assets/colorWheel.jpg"]);
	}
		
	WandererDemo.prototype.useLoadedImageStoreImages = function(){
		//console.log("WandererDemo.useLoadedImageStoreImages()");
		
		this.colorWheelCanvas = this.document.createElement('canvas');
		this.colorWheelCanvas.width  = this.imageStore.images[0].width;
		this.colorWheelCanvas.height = this.imageStore.images[0].height;
		this.colorWheelContext = this.colorWheelCanvas.getContext("2d");
		this.colorWheelContext.drawImage(this.imageStore.images[0],0,0);
		
		this.context2d.fillStyle = "#000000";
		this.context2d.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		var _this = this;

		//TODO : Move to abstract demo
		this.wanderer = new Wanderer(new SimpleGeometry.Circle(	this.x + this.canvas.width/2, 
																this.y + this.canvas.height/2, 
																Math.min(this.canvas.width, this.canvas.height) / 2 - 80) );
		this.wanderer.start();
		
		this.colorWanderer = new Wanderer(new SimpleGeometry.Circle(252,255,200));
		this.colorWanderer.start(function(event){_this.wandererUpdateHandler(event)});

		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"

	}
	
	WandererDemo.prototype.wandererUpdateHandler = function(){
		//console.log("wandererUpdateHandler()");
		this.context2d.fillStyle = SimpleGeometry.getRgbaStyleString(0 , 0 , 0, .05);
		this.context2d.fillRect(0,0, this.canvas.width, this.canvas.height);
		
		var color = this.colorWheelContext.getImageData(this.colorWanderer.x, this.colorWanderer.y, 1, 1).data;				
		this.context2d.beginPath();
		this.context2d.fillStyle = SimpleGeometry.getRgbaStyleString(color[0] , color[1] , color[2], 1);
		this.context2d.arc(this.wanderer.x, this.wanderer.y, this.wanderer.radius/2, 0, SimpleGeometry.PI2);
		this.context2d.fill();
		this.context2d.closePath();
		
		var opposingPoint = this.colorWanderer.getOpposingPoint();
		color = this.colorWheelContext.getImageData(opposingPoint.x, opposingPoint.y, 1, 1).data;				
		this.context2d.beginPath();
		this.context2d.fillStyle = SimpleGeometry.getRgbaStyleString(color[0] , color[1] , color[2], 1);
		opposingPoint = this.wanderer.getOpposingPoint();
		this.context2d.arc(opposingPoint.x, opposingPoint.y, this.wanderer.radius/2, 0, SimpleGeometry.PI2);
		this.context2d.fill();
		this.context2d.closePath();
	}
	
	WandererDemo.prototype.canvasClickHandler = function(event){
		//console.log("canvasClickHandlerWanderer()");
		this.wanderer.pause();
		this.colorWanderer.pause();
	}
	
	WandererDemo.prototype.customTearDown = function(){
		//console.log("WandererDemo.teardown()");
		this.colorWanderer.pause();
		delete this.colorWanderer;
		this.wanderer.pause();
		delete this.wanderer;
	}
	
	window.WandererDemo = WandererDemo;
	
	
	
	
	
	
	//================::BLOCK SET ANIMATOR::===================

	BlockSetAnimatorDemo = function(x, y, width, height, document){
		AbstractDemo.call(this, x, y, width, height, document); //call super constructor.
		this.toolTip = "Click on canvas for a new random animation";
	}
	
	//subclass extends superclass
	BlockSetAnimatorDemo.prototype = Object.create(AbstractDemo.prototype);
	BlockSetAnimatorDemo.prototype.constructor = AbstractDemo;
	
	BlockSetAnimatorDemo.prototype.run = function(){
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		var urls=new Array(
			"assets/instagramThumbs/paperWeight.jpg",
			"assets/instagramThumbs/sakBeer.jpg",
			"assets/instagramThumbs/SakEU.jpg",
			"assets/instagramThumbs/sakirisChips.jpg");

		this.loadImagesWithImageStore(urls);
	}
		
	BlockSetAnimatorDemo.prototype.useLoadedImageStoreImages = function(){
		//console.log("BlockSetAnimatorDemo.useLoadedImageStoreImages()",this.imageStore.images.length);
		this.intro = true;
		this.blockSetAnimator = new BlockSetAnimator(this.x, this.y+this.height/2 - this.imageStore.images[0].height/2, this.width, this.height);
		this.blockSetAnimator.setImages(this.imageStore.images);
		BlockSetAnimatorDemo.runRandomAnimation(this);
	}
	
	BlockSetAnimatorDemo.prototype.canvasClickHandler = function(event){
		if(this.blockSetAnimator.isAnimating()){
			return;
		}
		BlockSetAnimatorDemo.runRandomAnimation(this);
	}
	
	BlockSetAnimatorDemo.getIntroEasingFunction = function(){
		var easing = new Array(		UnitAnimator.easeLinear, 
									UnitAnimator.easeOutSine,
									UnitAnimator.easeOutBounce,
									UnitAnimator.easeOutElastic
								);
		return easing[Math.floor( Math.random()*easing.length )];
	}
	
	BlockSetAnimatorDemo.getEndtroEasingFunction = function(){
		var easing = new Array(		UnitAnimator.easeLinear, 
									UnitAnimator.easeInSine,
									UnitAnimator.easeInBounce,
									UnitAnimator.easeInElastic
								);
		return easing[Math.floor( Math.random()*easing.length )];	
	}
	
	//used for both image blocks and text effect demo  TODO : clean this up, too many conditionals
	BlockSetAnimatorDemo.runRandomAnimation = function(demo){
		//console.log("BlockSetAnimatorDemo.runRandomAnimation()");
		var easingFunction = demo.intro ? BlockSetAnimatorDemo.getIntroEasingFunction() : BlockSetAnimatorDemo.getEndtroEasingFunction();
		var rotation;
		var minTranform;
		var maxTranform;
		if( easingFunction==UnitAnimator.easeLinear || easingFunction==UnitAnimator.easeOutSine || UnitAnimator.easeInSine){
			rotation  = -Math.PI*3 + Math.random() * Math.PI*6;
			minTranform = -200;
			maxTranform = 400;
		}else{
			rotation  = -Math.PI*1.5 + Math.random() * Math.PI*3;
			minTranform = -100;
			maxTranform = 200;
		}
		var scale = Math.random() * 3;
		var hAlign = Math.floor(Math.random()*3);
		var vAlign = Math.floor(Math.random()*3);
		var transformA = new AnimationBlockTransform(minTranform + Math.random()*maxTranform, minTranform + Math.random()*maxTranform, scale, rotation, 0, hAlign, vAlign );
		var transformB = new AnimationBlockTransform(0, 0, 1, 0, 1, hAlign, vAlign);
		if(demo.intro){
			demo.blockSetAnimator.setAnimation(transformA, transformB);
		}else{
			demo.blockSetAnimator.setAnimation(transformB, transformA);
		}
		demo.blockSetAnimator.setEasingFunction(easingFunction);
		demo.blockSetAnimator.start (2000, 250, function(){demo.blockSetAnimationComplete()} , function(){demo.animationUpdate()});
		demo.intro = !demo.intro;
	}
	
	BlockSetAnimatorDemo.prototype.animationUpdate = function(){
		this.clear();
		this.blockSetAnimator.render(this.context2d);
	}
	
	BlockSetAnimatorDemo.prototype.blockSetAnimationComplete = function(){
		//console.log("BlockSetAnimatorDemo.blockSetAnimationComplete()");
		this.animationComplete();
	}
	
	BlockSetAnimatorDemo.prototype.customTearDown = function(){
		delete this.thumbnailCarousel;
	}
	
	window.BlockSetAnimatorDemo = BlockSetAnimatorDemo;
	
	
	
	
	
	
	//================::TEXT EFFECT::===================

	TextEffectDemo = function(x, y, width, height, document){
		AbstractDemo.call(this, x, y, width, height, document); //call super constructor.
		this.toolTip = "Click on canvas for a new random animation";
	}
	
	//subclass extends superclass
	TextEffectDemo.prototype = Object.create(AbstractDemo.prototype);
	TextEffectDemo.prototype.constructor = AbstractDemo;
	
	TextEffectDemo.prototype.run = function(){
		this.intro = true;
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		var textChopper = new TextChopper();
		var images = textChopper.createImagesFromString(this.document,"CANVAS",80, "#AAAAFF", "#000044");
		this.blockSetAnimator = new BlockSetAnimator( this.x , this.y + this.height/2 - images[0].height/2, this.width, this.height);
		this.blockSetAnimator.setImages(images);
		BlockSetAnimatorDemo.runRandomAnimation(this);
	}
	
	TextEffectDemo.prototype.canvasClickHandler = function(event){
		if(this.blockSetAnimator.isAnimating()){
			return;
		}
		BlockSetAnimatorDemo.runRandomAnimation(this);
	}
	
	TextEffectDemo.prototype.animationUpdate = function(){
		this.clear();
		this.blockSetAnimator.render(this.context2d);
	}
	
	TextEffectDemo.prototype.blockSetAnimationComplete = function(){
		//console.log("TextEffectDemo.blockSetAnimationComplete()");
		this.animationComplete();
	}
	
	TextEffectDemo.prototype.customTearDown = function(){
		delete this.thumbnailCarousel;
	}
	
	window.TextEffectDemo = TextEffectDemo;
	
}(window));