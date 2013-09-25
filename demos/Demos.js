(function (window){

	//================::ABSTRACT DEMO::===================

	//constructor
	AbstractDemo = function(x, y, width, height, document){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.document = document;
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
	
	window.AbstractDemo = AbstractDemo;
	
	
	//============================================
	//================::DEMOS::===================
	//============================================
	
	
	
	

	//================::PIE CHART::===================
	
	PieChartDemo = function(x, y, width, height, document){
		AbstractDemo.call(this,0, 0, 400, 400, document); //call super constructor.
		this.toolTip = "Click link to create random data, click pie chart to open/close";
	}
	
	//subclass extends superclass
	PieChartDemo.prototype = Object.create(AbstractDemo.prototype);
	PieChartDemo.prototype.constructor = AbstractDemo;
	
	PieChartDemo.prototype.createPieChart = function(){
		this.showReflection = true;
		return new PieChart(this.x+30,this.y+30,this.width/2-60,this.height/2-60);
	}
	
	PieChartDemo.prototype.run = function(){
		this.pieChart = this.createPieChart()
		this.reflection = new Image();
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		this.pieChartOpen=true;
		this.animator=new UnitAnimator(1000,20,function() {_this.updatePieChart()} , function(event){_this.updatePieChartComplete(1);});
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
		this.pieChart.render(this.context2d,animationPercent);
		if(!this.showReflection){
			return;
		}
		ImageEffects.renderReflectionImage(this.reflection, this.canvas, this.width,this.height);
		this.context2d.drawImage(this.reflection,0,-57);	
	}
	
	PieChartDemo.prototype.updatePieChartComplete = function(animationPercent){
		var _this = this;
		setTimeout(function(){_this.renderPieChart(animationPercent)},50);
	}
	
	PieChartDemo.prototype.canvasClickHandler = function(event){
		if(this.animator.isAnimating()){
			return;
		}
		var _this = this;
		var callback = this.pieChartOpen ? function(event){_this.updatePieChartReverse();} : function(event){_this.updatePieChart();}
		var callbackComplete = this.pieChartOpen ? function(event){_this.updatePieChartComplete(0);} : function(event){_this.updatePieChartComplete(1);}
		this.animator.reset(1000,20,callback, callbackComplete );
		this.animator.start();
		this.pieChartOpen=!this.pieChartOpen;
	}
	
	
	
	PieChartDemo.prototype.customTearDown = function(){
		delete this.pieChart;
		delete this.reflection;
	}
	
	window.PieChartDemo = PieChartDemo;
	
	
	
	
	

	
	//================::DONUT CHART::===================
	
	DonutChartDemo = function(x, y, width, height, document){
		PieChartDemo.call(this,0, 0, 400, 400, document); //call super constructor.
		this.toolTip = "Click link to create random data, click donut chart to open/close";
	}
	
	//subclass extends superclass
	DonutChartDemo.prototype = Object.create(PieChartDemo.prototype);
	DonutChartDemo.prototype.constructor = PieChartDemo;
	
	DonutChartDemo.prototype.createPieChart = function(){
		//console.log("DonutChartDemo.prototype.createPieChart()");
		return new DonutChart(this.x+30,this.y+30,this.width-60,this.height-60,.3);
		//return new DonutChart(this.x+35,this.y+30,this.width/2-60,this.height/2-60,.3);
		this.showReflection = false;
	}
	
	window.DonutChartDemo = DonutChartDemo;



	

	
	
	//================::LINE CHART::===================
	
	LineChartDemo = function(x, y, width, height, document){
		AbstractDemo.call(this,0, 0, 600, 300, document); //call super constructor.
		this.toolTip = "Click link to create random data, click line chart to open/close";
	}
	
	//subclass extends superclass
	LineChartDemo.prototype = Object.create(AbstractDemo.prototype);
	LineChartDemo.prototype.constructor = AbstractDemo;
	
	LineChartDemo.prototype.run = function(){
		this.lineChart = new LineChart(10, 10, this.width-10, this.height-10);
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		this.lineChartOpen = true;
		this.animator=new UnitAnimator(1000,20,function() {_this.updateLineChart()});
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
		AbstractDemo.call(this,0, 0, 600, 300, document); //call super constructor.
		this.toolTip = "Click link to create random data, click bar chart to open/close";
	}
	
	//subclass extends superclass
	BarChartDemo.prototype = Object.create(AbstractDemo.prototype);
	BarChartDemo.prototype.constructor = AbstractDemo;
	
	BarChartDemo.prototype.run = function(){
		this.barChart = new BarChart(10, 10, this.width-10, this.height-10);
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		this.barChartOpen = true;
		this.animator = new UnitAnimator(1500,20,function() {_this.updateBarChart()});
		this.animator.start(UnitAnimator.getRandomEasingFunction());
	}

	BarChartDemo.prototype.updateBarChart = function(){
		this.clear();
		this.barChart.render(this.context2d, this.animator.getAnimationPercent());
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
		this.animator.start(UnitAnimator.getRandomEasingFunction());
		this.barChartOpen =! this.barChartOpen;
	}
	
	BarChartDemo.prototype.customTearDown = function(){
		delete this.barChart;
	}
	
	window.BarChartDemo = BarChartDemo;
	
	
	
	
	
	
	//================::BASIC SLIDESHOW::===================

	BasicSlideShowDemo = function(x, y, width, height, document){
		AbstractDemo.call(this,0, 0, 400, 400, document); //call super constructor.
		this.toolTip = "Click left or right arrows to slide to next/previous image";
	}
	
	//subclass extends superclass
	BasicSlideShowDemo.prototype = Object.create(AbstractDemo.prototype);
	BasicSlideShowDemo.prototype.constructor = AbstractDemo;
	
	BasicSlideShowDemo.prototype.run = function(){
		this.basicSlideShow = new BasicSlideShow(10, 10, this.width-10, this.height-10, this.context2d);
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
	
	BasicSlideShowDemo.prototype.customTearDown = function(){
		delete this.basicSlideShow;
	}
	
	window.BasicSlideShowDemo = BasicSlideShowDemo;






	
	//================::THUMBNAIL CAROUSEL::===================

	ThumbnailCarouselDemo = function(x, y, width, height, document){
		AbstractDemo.call(this,0, 0, 450, 450, document); //call super constructor.
		this.toolTip = "Click arrows to rotate carousel, click active thumb to load photo";
	}
	
	//subclass extends superclass
	ThumbnailCarouselDemo.prototype = Object.create(AbstractDemo.prototype);
	ThumbnailCarouselDemo.prototype.constructor = AbstractDemo;
	
	ThumbnailCarouselDemo.prototype.preSetUp = function(){
		this.imageCanvas = document.createElement('canvas');
		this.imageCanvas.width = this.width; 
		this.imageCanvas.height = this.height;
		this.imageCanvasContext = this.imageCanvas.getContext("2d");
		this.imageCanvas.style.position = "absolute";
		this.document.body.appendChild(this.imageCanvas);
	}
	
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
		this.thumbnailCarousel = new ThumbnailCarousel(	0, this.height - this.imageStore.images[0].height-35, 
														this.width, this.imageStore.images[0].height+10, this.context2d);
		this.thumbnailCarousel.setImages(this.imageStore.images);
		
		this.ImageEffectFader = new ImageEffectFader(0, 0, this.width, this.height, this.imageCanvasContext);
		
		var source = this.imageStore.images[0].src.split("/");
		this.ImageEffectFader.setImage( "assets/instagramPhotos/"+source[source.length-1] );
	}
	
	ThumbnailCarouselDemo.prototype.canvasClickHandler = function(event){
		var x = event.pageX - this.canvas.offsetLeft;
		var y = event.pageY - this.canvas.offsetTop;
		var point = new SimpleGeometry.Point(x,y);
		if(this.thumbnailCarousel.hotSpot.containsPoint(point)){
			var image = this.thumbnailCarousel.getCurrentImage();
			var source = image.src.split("/");
			//console.log(source[source.length-1]);
			this.ImageEffectFader.setImage( "assets/instagramPhotos/"+source[source.length-1] );
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
	
	ThumbnailCarouselDemo.prototype.customTearDown = function(){
		delete this.thumbnailCarousel;
		this.document.body.removeChild(this.imageCanvas);
		delete this.imageCanvasContext;
		delete this.imageCanvas;
	}
	
	window.ThumbnailCarouselDemo = ThumbnailCarouselDemo;
	
	
	
	
	
	
	
	//================::WANDERER::===================
	
	WandererDemo = function(x, y, width, height, document){
		AbstractDemo.call(this,0, 0, 450, 400, document); //call super constructor.
		this.toolTip = "The two colors are complementary";
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
		this.wanderer = new Wanderer(new SimpleGeometry.Circle(this.canvas.width/2, this.canvas.height/2, Math.min(this.canvas.width, this.canvas.height) / 2 - 80) );
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
		AbstractDemo.call(this,0, 0, 600, 400, document); //call super constructor.
		this.toolTip = "Click on canvas for a new random animation";
	}
	
	//subclass extends superclass
	BlockSetAnimatorDemo.prototype = Object.create(AbstractDemo.prototype);
	BlockSetAnimatorDemo.prototype.constructor = AbstractDemo;
	
	BlockSetAnimatorDemo.prototype.run = function(){
		this.intro = true;
		this.blockSetAnimator = new BlockSetAnimator(50,this.canvas.height/2);
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		var urls=new Array(
			"assets/instagramThumbs/paperWeight.jpg",
			"assets/instagramThumbs/rufus.jpg",
			"assets/instagramThumbs/sakBeer.jpg",
			"assets/instagramThumbs/SakEU.jpg",
			"assets/instagramThumbs/sakirisChips.jpg");

		this.loadImagesWithImageStore(urls);
	}
		
	BlockSetAnimatorDemo.prototype.useLoadedImageStoreImages = function(){
		//console.log("BlockSetAnimatorDemo.useLoadedImageStoreImages()",this.imageStore.images.length);
		this.blockSetAnimator.setImages(this.imageStore.images);
		this.runRandomAnimation();
	}
	
	BlockSetAnimatorDemo.prototype.canvasClickHandler = function(event){
		if(this.blockSetAnimator.isAnimating()){
			return;
		}
		this.runRandomAnimation();
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
	
	BlockSetAnimatorDemo.prototype.runRandomAnimation = function(event){
		//console.log("BlockSetAnimatorDemo.runRandomAnimation()");
		var rotation = -Math.PI*3 + Math.random() * Math.PI*6;
		var scale = Math.random() * 3;
		var hAlign = Math.floor(Math.random()*3);
		var vAlign = Math.floor(Math.random()*3);
		var transformA = new AnimationBlockTransform(-200 + Math.random()*400, -200 + Math.random()*400, scale, rotation, 0, hAlign, vAlign );
		var transformB = new AnimationBlockTransform(0, 0, 1, 0, 1, hAlign, vAlign);
		if(this.intro){
			this.blockSetAnimator.setAnimation(transformA, transformB);
			this.blockSetAnimator.setEasingFunction(BlockSetAnimatorDemo.getIntroEasingFunction());
		}else{
			this.blockSetAnimator.setAnimation(transformB, transformA);
			this.blockSetAnimator.setEasingFunction(BlockSetAnimatorDemo.getEndtroEasingFunction());
		}
		var _this = this;
		this.blockSetAnimator.start (2000, 250, function(){_this.animationComplete()} , function(){_this.animationUpdate()});
		this.intro = !this.intro;
	}
	
	BlockSetAnimatorDemo.prototype.animationUpdate = function(){
		this.clear();
		this.blockSetAnimator.render(this.context2d);
	}
	
	BlockSetAnimatorDemo.prototype.animationComplete = function(){
		//console.log("BlockSetAnimatorDemo.animationComplete()");
	}
	
	BlockSetAnimatorDemo.prototype.customTearDown = function(){
		delete this.thumbnailCarousel;
	}
	
	window.BlockSetAnimatorDemo = BlockSetAnimatorDemo;
	
	
	
	
	
	
	//================::TEXT EFFECT::===================

	TextEffectDemo = function(x, y, width, height, document){
		AbstractDemo.call(this,0, 0, 600, 400, document); //call super constructor.
		this.toolTip = "Click on canvas for a new random animation";
	}
	
	//subclass extends superclass
	TextEffectDemo.prototype = Object.create(AbstractDemo.prototype);
	TextEffectDemo.prototype.constructor = AbstractDemo;
	
	TextEffectDemo.prototype.run = function(){
		this.intro = true;
		this.blockSetAnimator = new BlockSetAnimator(50,this.canvas.height/2);
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		var textChopper = new TextChopper();
		var images = textChopper.createImagesFromString(this.document,"CANVAS",80, "#AAAAFF", "#000044");
		this.blockSetAnimator.setImages(images);
		this.runRandomAnimation();
	}
	
	TextEffectDemo.prototype.canvasClickHandler = function(event){
		if(this.blockSetAnimator.isAnimating()){
			return;
		}
		this.runRandomAnimation();
	}
	
	TextEffectDemo.prototype.runRandomAnimation = function(event){
		//console.log("TextEffectDemo.runRandomAnimation()");
		var rotation = -Math.PI*4 + Math.random() * Math.PI*8;
		var scale = Math.random() * 3;
		var hAlign = Math.floor(Math.random()*3);
		var vAlign = Math.floor(Math.random()*3);
		var transformA = new AnimationBlockTransform(-200 + Math.random()*400, -200 + Math.random()*400, scale, rotation, 0, hAlign, vAlign );
		var transformB = new AnimationBlockTransform(0, 0, 1, 0, 1, hAlign, vAlign);
		if(this.intro){
			this.blockSetAnimator.setAnimation(transformA, transformB);
			this.blockSetAnimator.setEasingFunction(BlockSetAnimatorDemo.getIntroEasingFunction());
		}else{
			this.blockSetAnimator.setAnimation(transformB, transformA);
			this.blockSetAnimator.setEasingFunction(BlockSetAnimatorDemo.getEndtroEasingFunction());
		}
		this.blockSetAnimator.setEasingFunction(UnitAnimator.getRandomEasingFunction());
		var _this = this;
		this.blockSetAnimator.start (2000, 250, function(){_this.animationComplete()} , function(){_this.animationUpdate()});
		this.intro = !this.intro;
	}
	
	TextEffectDemo.prototype.animationUpdate = function(){
		this.clear();
		this.blockSetAnimator.render(this.context2d);
	}
	
	TextEffectDemo.prototype.animationComplete = function(){
		//console.log("TextEffectDemo.animationComplete()");
	}
	
	TextEffectDemo.prototype.customTearDown = function(){
		delete this.thumbnailCarousel;
	}
	
	window.TextEffectDemo = TextEffectDemo;
	
}(window));