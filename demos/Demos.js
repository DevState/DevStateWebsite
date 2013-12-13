(function (window){

	//================::ABSTRACT DEMO::===================

	//constructor
	AbstractDemo = function(x, y, width, height, demoContainer){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.demoContainer = demoContainer;
		this.customCaptureControls = false;
		this.captureFrameRate = 300; //frames for generated gifs are captured at this rate
		this.gifPlaybackFrameRate = 100;//generated gifs play at this speed
		this.toolTip = "";
		this.toolTipShort = "";
        this.shortDemoName = "";
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
		//this.fillStyle="#000000"
		//this.context2d.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
	
	
	//============================================
	//================::DEMOS::===================
	//============================================
	
	
	
	

	//================::PIE CHART::===================
	
	PieChartDemo = function(x, y, width, height, demoContainer){
		AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
		this.toolTip = "Standard pie chart with a reflection. Click the pie chart to open and close. Press reset for new data.";
		this.toolTipShort = "Click the pie chart to open and close. Press reset for new data.";
		this.gifPlaybackFrameRate = 200;
	};
	
	//subclass extends superclass
	PieChartDemo.prototype = Object.create(AbstractDemo.prototype);
	PieChartDemo.prototype.constructor = AbstractDemo;
	
	PieChartDemo.prototype.createPieChart = function(){
		this.showReflection = true;
		var pie = new PieChart(this.x, this.y, this.width, this.height*.7, 10);
        pie.colors = [DSColors.GREEN, DSColors.LIGHT_GREEN , DSColors.ORANGE, DSColors.PINK_ORANGE , "#3db5d2", "#d1eff9" ];
		this.reflectionCaptureRect = new SimpleGeometry.Rectangle(pie.center.x-pie.radius, pie.center.y-pie.radius, pie.radius*2, pie.radius*2);
		return pie;
	};
	
	PieChartDemo.prototype.run = function(){
		this.pieChart = this.createPieChart();
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		this.pieChartOpen = true;
		this.animator = new UnitAnimator(1000, 20, function() {_this.updatePieChart()}, function() {_this.animationComplete()});
		this.animator.start();
	};
	
	PieChartDemo.prototype.updatePieChart = function(){
		this.renderPieChart(this.animator.getAnimationPercent());
	};
	PieChartDemo.prototype.updatePieChartReverse = function(){
		this.renderPieChart(1-this.animator.getAnimationPercent());
	};
	
	PieChartDemo.prototype.renderPieChart = function(animationPercent){
		this.clear();
		this.pieChart.render(this.context2d, animationPercent);
		if(!this.showReflection){
			return;
		}
		ImageEffects.renderReflection(this.canvas, this.reflectionCaptureRect);
	};
		
	PieChartDemo.prototype.canvasClickHandler = function(){
		if(this.animator.isAnimating()){
			return;
		}
		var _this = this;
		var callback = this.pieChartOpen ? function(){_this.updatePieChartReverse();} : function(){_this.updatePieChart();};
		this.animator.reset(1000,20,callback );
		this.animator.start();
		this.pieChartOpen =!this.pieChartOpen;
	};
	
	PieChartDemo.prototype.customTearDown = function(){
		delete this.pieChart;
	};
	
	window.PieChartDemo = PieChartDemo;
	
	
	
	
	

	
	//================::DONUT CHART::===================
	
	DonutChartDemo = function(x, y, width, height, demoContainer){
		PieChartDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
		this.toolTip = "Click the donut chart to run open and close animations. Press reset for new data.";
        this.toolTipShort = "Click donut to open/close, press reset for new data.";
        this.shortDemoName = "Donut";
	};
	
	//subclass extends superclass
	DonutChartDemo.prototype = Object.create(PieChartDemo.prototype);
	DonutChartDemo.prototype.constructor = PieChartDemo;
	
	DonutChartDemo.prototype.createPieChart = function(){
		this.showReflection = false;
		//console.log("DonutChartDemo.prototype.createPieChart()");
        var donut = new DonutChart(this.x,this.y,this.width,this.height);
        donut.colors = [DSColors.GREEN, DSColors.LIGHT_GREEN , DSColors.ORANGE, DSColors.PINK_ORANGE , "#3db5d2", "#d1eff9" ];
		return donut;
		//return new DonutChart(this.x+35,this.y+30,this.width/2-60,this.height/2-60,.3);
	};
	
	window.DonutChartDemo = DonutChartDemo;



	

	
	
	//================::LINE CHART::===================
	
	LineChartDemo = function(x, y, width, height, demoContainer){
		AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
		this.toolTip = "Click the line chart to run open and close animations. Press reset for new data.";
		this.gifPlaybackFrameRate = 200;
	};
	
	//subclass extends superclass
	LineChartDemo.prototype = Object.create(AbstractDemo.prototype);
	LineChartDemo.prototype.constructor = AbstractDemo;
	
	LineChartDemo.prototype.preSetUp = function(){
		this.backGroundCanvas = document.createElement('canvas');
		//console.log("LineChartDemo.preSetUp() ",this.backGroundCanvas);
		this.backGroundCanvas.width = this.width; 
		this.backGroundCanvas.height = this.height;
		this.backGroundCanvasContext2d = this.backGroundCanvas.getContext("2d");
		this.appendCanvas(this.backGroundCanvas);
	};
	LineChartDemo.prototype.getCaptureCanvases = function(){
		return [this.backGroundCanvas, this.canvas];
	};
	
	LineChartDemo.prototype.run = function(){
		this.lineChart = new LineChart(this.x + 10, this.y, this.width, this.height);
        this.lineChart.colors = [DSColors.GREEN, DSColors.LIGHT_GREEN , DSColors.ORANGE, DSColors.PINK_ORANGE , "#3db5d2", "#d1eff9" ];
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		this.lineChartOpen = true;
		this.animator=new UnitAnimator(1000,20,function() {_this.updateLineChart()}, function() {_this.animationComplete()});
		this.animator.start();
	};
	
	LineChartDemo.prototype.createBackground = function(){
		this.background = new ChartBackground(this.x, this.y, this.width, this.height);
		this.background.legendMargin = 10;
		this.background.render(this.backGroundCanvasContext2d, 0, this.lineChart.max);
	};

	LineChartDemo.prototype.updateLineChart = function(){
		this.clear();
		this.lineChart.render(this.context2d, this.animator.getAnimationPercent());
		if(!this.background){
			this.createBackground();
		}
	};
	LineChartDemo.prototype.updateLineChartReverse = function(){
		this.clear();
		this.lineChart.render(this.context2d, 1-this.animator.getAnimationPercent());
	};
	
	LineChartDemo.prototype.canvasClickHandler = function(){
		if(this.animator.isAnimating()){
			return;
		}
		var _this = this;
		this.animator.reset(1000,20,this.lineChartOpen ? function(){_this.updateLineChartReverse();} : function(){_this.updateLineChart();} );
		this.animator.start();
		this.lineChartOpen =! this.lineChartOpen;
	};
	
	LineChartDemo.prototype.customTearDown = function(){
		delete this.lineChart;
		this.demoContainer.removeChild(this.backGroundCanvas);
		delete this.backGroundCanvasContext2d;
		delete this.backGroundCanvas;
	};
	
	window.LineChartDemo = LineChartDemo;
	
	
	
	
	
	
	//================::BAR CHART::===================
	
	BarChartDemo = function(x, y, width, height, demoContainer){
		AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
		this.toolTip = "Bar chart with fake 3d. Click the bar chart to run open and close animations. Press reset for new data.";
        this.toolTipShort = "Click the bar chart to open/close, press reset for new data.";
		this.gifPlaybackFrameRate = 200;
	};
	
	//subclass extends superclass
	BarChartDemo.prototype = Object.create(AbstractDemo.prototype);
	BarChartDemo.prototype.constructor = AbstractDemo;
	
	BarChartDemo.prototype.preSetUp = function(){
		this.backGroundCanvas = document.createElement('canvas');
		//console.log("BarChartDemo.preSetUp() ",this.backGroundCanvas);
		this.backGroundCanvas.width = this.width; 
		this.backGroundCanvas.height = this.height;
		this.backGroundCanvasContext2d = this.backGroundCanvas.getContext("2d");
		this.appendCanvas(this.backGroundCanvas);
	};
	BarChartDemo.prototype.getCaptureCanvases = function(){
		return [this.backGroundCanvas, this.canvas];
	};
	
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
	};

	BarChartDemo.prototype.createBackground = function(){
		this.background = new ChartBackground(this.x, this.y, this.width, this.height);
		this.background.false3DExtrusion = this.barChart.extrudeWidth;
		this.background.legendMargin = this.barChart.extrudeWidth + 3;
		this.background.render(this.backGroundCanvasContext2d, 0, this.barChart.max);
	};
	
	BarChartDemo.prototype.updateBarChart = function(){
		this.clear();
		this.barChart.render(this.context2d, this.animator.getAnimationPercent());
		//TODO : move this somewhere smarter
		if(!this.background){
			this.createBackground();
		}
	};
	BarChartDemo.prototype.updateBarChartReverse = function(){
		this.clear();
		this.barChart.render(this.context2d, 1 - this.animator.getAnimationPercent());
	};
	
	BarChartDemo.prototype.canvasClickHandler = function(){
		if(this.animator.isAnimating()){
			return;
		}
		var _this = this;
		this.animator.reset(1500,20,this.barChartOpen ? function(){_this.updateBarChartReverse();} : function(){_this.updateBarChart();} );
		this.animator.start(this.barChartOpen ? UnitAnimator.easeInSine : UnitAnimator.easeOutSine);
		this.barChartOpen =! this.barChartOpen;
	};
	
	BarChartDemo.prototype.customTearDown = function(){
		delete this.barChart;
		this.demoContainer.removeChild(this.backGroundCanvas);
		delete this.backGroundCanvasContext2d;
		delete this.backGroundCanvas;
	};
	
	window.BarChartDemo = BarChartDemo;
	
	
	
	
	
	
	//================::BASIC SLIDESHOW::===================

	BasicSlideShowDemo = function(x, y, width, height, demoContainer){
		AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
		this.toolTip = "Click the left or right arrows to slide to next or previous image.";
		this.customCaptureControls = true;
        this.shortDemoName = "SlideShow";
	};
	
	//subclass extends superclass
	BasicSlideShowDemo.prototype = Object.create(AbstractDemo.prototype);
	BasicSlideShowDemo.prototype.constructor = AbstractDemo;
	
	BasicSlideShowDemo.prototype.run = function(){
		//this.basicSlideShow = new BasicSlideShow(10, 10, this.width-10, this.height-10, this.context2d);
		this.basicSlideShow = new BasicSlideShow(this.x, this.y, this.width, this.height, this.context2d);
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
        var urls=[
            "assets/demoImages/surf4.jpg",
            "assets/demoImages/skate4.jpg",
            "assets/demoImages/skate3.jpg",
            "assets/demoImages/snowboard2.jpg",
            "assets/demoImages/snowboard3.jpg",
            "assets/demoImages/surf3.jpg"
            ];

		this.loadImagesWithImageStore(urls);
	};
		
	BasicSlideShowDemo.prototype.useLoadedImageStoreImages = function(){
		//console.log("BasicSlideShowDemo.useLoadedImageStoreImages()");
		this.basicSlideShow.setImages(this.imageStore.images);
	};
	
	BasicSlideShowDemo.prototype.canvasClickHandler = function(event){
		var x=event.pageX - this.canvas.offsetLeft;
		var y=event.pageY - this.canvas.offsetTop;
		var globalPostion = this.getGlobalDemoPosition();
		var point = new SimpleGeometry.Point(x-globalPostion.x,y-globalPostion.y);
		if(this.basicSlideShow.containsPoint(point)){
			if(point.x > this.basicSlideShow.x + this.basicSlideShow.width/2){
				this.basicSlideShow.next();
			}else{
				this.basicSlideShow.previous();
			}
		}
	};
	
	BasicSlideShowDemo.prototype.startCustomCaptureAnimation = function(){
		this.basicSlideShow.next();
	};
	
	BasicSlideShowDemo.prototype.customTearDown = function(){
		delete this.basicSlideShow;
	};
	
	window.BasicSlideShowDemo = BasicSlideShowDemo;






    //================::IMAGE FADER::===================

    ImageFaderDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
        this.toolTip = "Click an image to see a fade effect from one random image to another.";
        this.customCaptureControls = true;
        this.shortDemoName = "Fader";
    };
    //subclass extends superclass
    ImageFaderDemo.prototype = Object.create(AbstractDemo.prototype);
    ImageFaderDemo.prototype.constructor = AbstractDemo;

    ImageFaderDemo.prototype.run = function(){
        this.urls=[
            "assets/demoImages/snowboard3.jpg",
            "assets/demoImages/skate3.jpg",
            "assets/demoImages/skate1.jpg",
            "assets/demoImages/snowboard2.jpg",
            "assets/demoImages/surf3.jpg",
            "assets/demoImages/surf4.jpg"];
        var _this = this;
        this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
        this.ImageEffectFader = new ImageEffectFader(this.x, this.y, this.width, this.height, this.context2d);
        this.showRandomImage();
    };

    ImageFaderDemo.prototype.showRandomImage = function(){
        this.ImageEffectFader.setImage( this.urls[Math.floor(Math.random()*this.urls.length)] );
    };

    ImageFaderDemo.prototype.canvasClickHandler = function(){
        this.showRandomImage();
    };

    ImageFaderDemo.prototype.startCustomCaptureAnimation = function(){
        this.showRandomImage();
    };

    ImageFaderDemo.prototype.customTearDown = function(){
        delete this.ImageEffectFader;
    };

    window.ImageFaderDemo = ImageFaderDemo;





	
	//================::THUMBNAIL CAROUSEL::===================

	ThumbnailCarouselDemo = function(x, y, width, height, demoContainer){
		AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
		this.toolTip = "Click the arrows to rotate the carousel.";
		this.customCaptureControls = true;
        this.shortDemoName = "Carousel";
	};
	
	//subclass extends superclass
	ThumbnailCarouselDemo.prototype = Object.create(AbstractDemo.prototype);
	ThumbnailCarouselDemo.prototype.constructor = AbstractDemo;
		
	ThumbnailCarouselDemo.prototype.run = function(){
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		var urls=[
			"assets/demoImageThumbnails/skate1.jpg",
			"assets/demoImageThumbnails/skate2.jpg",
			"assets/demoImageThumbnails/skate3.jpg",
			"assets/demoImageThumbnails/skate4.jpg",
			"assets/demoImageThumbnails/skate5.jpg",
			"assets/demoImageThumbnails/snowboard1.jpg",
			"assets/demoImageThumbnails/snowboard2.jpg",
			"assets/demoImageThumbnails/snowboard3.jpg",
			"assets/demoImageThumbnails/snowboard4.jpg",
			"assets/demoImageThumbnails/surf1.jpg",
			"assets/demoImageThumbnails/surf2.jpg",
			"assets/demoImageThumbnails/surf3.jpg",
			"assets/demoImageThumbnails/surf4.jpg"];

		this.loadImagesWithImageStore(urls);
	};
	
	ThumbnailCarouselDemo.prototype.useLoadedImageStoreImages = function(){
		//console.log("ThumbnailCarouselDemo.useLoadedImageStoreImages()");
		this.thumbnailCarousel = new ThumbnailCarousel(	this.x, this.y + this.height/2 - this.imageStore.images[0].height/2, 
														this.width, this.imageStore.images[0].height+10, this.context2d);
        //this.thumbnailCarousel.outlineColor = DSColors.ORANGE;
		this.thumbnailCarousel.setImages(this.imageStore.images);
	};
	
	ThumbnailCarouselDemo.prototype.canvasClickHandler = function(event){
		var x = event.pageX - this.canvas.offsetLeft;
		var y = event.pageY - this.canvas.offsetTop;
		var globalPostion = this.getGlobalDemoPosition();
		var point=new SimpleGeometry.Point(x-globalPostion.x,y-globalPostion.y);
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
	};
	
	ThumbnailCarouselDemo.prototype.startCustomCaptureAnimation = function(){
		this.thumbnailCarousel.next();
	};
	
	ThumbnailCarouselDemo.prototype.customTearDown = function(){
		delete this.thumbnailCarousel;
	};
	
	window.ThumbnailCarouselDemo = ThumbnailCarouselDemo;
	
	
	
	
	
	
	//================::SIMPLE COVER FLOW::===================

	SimpleCoverFlowDemo = function(x, y, width, height, demoContainer){
		AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
		this.toolTip = "Click the arrows to slide the cover flow.  Unfortunately this demo renders poorly on some devices.";
        this.toolTipShort = "Click arrows to slide (renders poorly on some devices).";
		this.customCaptureControls = true;
        this.shortDemoName = "Coverflow";
	};
	
	//subclass extends superclass
	SimpleCoverFlowDemo.prototype = Object.create(AbstractDemo.prototype);
	SimpleCoverFlowDemo.prototype.constructor = AbstractDemo;
		
	SimpleCoverFlowDemo.prototype.run = function(){
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
		var urls = [
            "assets/demoImageThumbnails/skate1.jpg",
            "assets/demoImageThumbnails/skate2.jpg",
            "assets/demoImageThumbnails/skate3.jpg",
            "assets/demoImageThumbnails/skate4.jpg",
            "assets/demoImageThumbnails/skate5.jpg",
            "assets/demoImageThumbnails/snowboard1.jpg",
            "assets/demoImageThumbnails/snowboard2.jpg",
            "assets/demoImageThumbnails/snowboard3.jpg",
            "assets/demoImageThumbnails/snowboard4.jpg",
            "assets/demoImageThumbnails/surf1.jpg",
            "assets/demoImageThumbnails/surf2.jpg",
            "assets/demoImageThumbnails/surf3.jpg",
            "assets/demoImageThumbnails/surf4.jpg"];

		this.loadImagesWithImageStore(urls);
	};
	
	SimpleCoverFlowDemo.prototype.useLoadedImageStoreImages = function(){
		//console.log("SimpleCoverFlowDemo.useLoadedImageStoreImages()");
		this.coverFlow = new SimpleCoverFlow(	this.x, this.y + this.height/2 - this.imageStore.images[0].height/2, 
														this.width, this.imageStore.images[0].height+10, this.context2d);
		this.coverFlow.setImages(this.imageStore.images);
	};
	
	SimpleCoverFlowDemo.prototype.canvasClickHandler = function(event){
		var x = event.pageX - this.canvas.offsetLeft;
		var y = event.pageY - this.canvas.offsetTop;
		var globalPostion = this.getGlobalDemoPosition();
		var point=new SimpleGeometry.Point(x-globalPostion.x,y-globalPostion.y);
		/*
		if(this.coverFlow.hotSpot.containsPoint(point)){
			var image = this.coverFlow.getCurrentImage();
			var source = image.src.split("/");
			console.log(source[source.length-1]);
			return;
		}*/
		if(this.coverFlow.containsPoint(point)){
			if(point.x > this.coverFlow.x + this.coverFlow.width/2){
				this.coverFlow.next();
			}else{
				this.coverFlow.previous();
			}
		}
	};
	
	SimpleCoverFlowDemo.prototype.startCustomCaptureAnimation = function(){
		this.coverFlow.next();
	};
	
	SimpleCoverFlowDemo.prototype.customTearDown = function(){
		delete this.coverFlow;
	};
	
	window.SimpleCoverFlowDemo = SimpleCoverFlowDemo;

	
	
	
	
	//================::WANDERER::===================
	
	WandererDemo = function(x, y, width, height, demoContainer){
		AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
		this.toolTip = "Animation with random wandering movement and smoothly transitioning random colors. The two colors are complementary.";
		this.customCaptureControls = true;
	};
	
	//subclass extends superclass
	WandererDemo.prototype = Object.create(AbstractDemo.prototype);
	WandererDemo.prototype.constructor = AbstractDemo;

    WandererDemo.prototype.preSetUp = function(){
        this.backGroundCanvas = document.createElement('canvas');
        //console.log("BarChartDemo.preSetUp() ",this.backGroundCanvas);
        this.backGroundCanvas.width = this.width;
        this.backGroundCanvas.height = this.height;
        this.backGroundCanvasContext2d = this.backGroundCanvas.getContext("2d");
        this.backGroundCanvasContext2d.fillStyle = "#00000";
        this.backGroundCanvasContext2d.fillRect(0, 0, this.width, this.height);
        this.appendCanvas(this.backGroundCanvas);
    };
    WandererDemo.prototype.getCaptureCanvases = function(){
        return [this.backGroundCanvas, this.canvas];
    };

	WandererDemo.prototype.run = function(){
		this.loadImagesWithImageStore(["assets/colorWheel.jpg"]);
	};
		
	WandererDemo.prototype.useLoadedImageStoreImages = function(){
		//console.log("WandererDemo.useLoadedImageStoreImages()");
		
		this.colorWheelCanvas = document.createElement('canvas');
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

	};
	
	WandererDemo.prototype.wandererUpdateHandler = function(){
		//console.log("wandererUpdateHandler()");

		this.context2d.fillStyle = SimpleGeometry.getRgbaStyleString(0 , 0 , 0, .05);;//SimpleGeometry.getRgbaStyleString(7 , 46 , 77, .05);
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
	};
	
	/*WandererDemo.prototype.canvasClickHandler = function(event){
		//console.log("canvasClickHandlerWanderer()");
		this.wanderer.pause();
		this.colorWanderer.pause();
	};*/
	
	WandererDemo.prototype.customTearDown = function(){
		//console.log("WandererDemo.teardown()");
		this.colorWanderer.pause();
		delete this.colorWanderer;
		this.wanderer.pause();
		delete this.wanderer;
        this.demoContainer.removeChild(this.backGroundCanvas);
        delete this.backGroundCanvasContext2d;
        delete this.backGroundCanvas;
	};
	
	window.WandererDemo = WandererDemo;
	
	
	
	
	
	
	//================::BLOCK SET ANIMATOR::===================

	BlockSetAnimatorDemo = function(x, y, width, height, demoContainer){
		AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
		this.toolTip = "Click the images or reset for a new random animation.";
        this.shortDemoName = "Blocks";
	};
	
	//subclass extends superclass
	BlockSetAnimatorDemo.prototype = Object.create(AbstractDemo.prototype);
	BlockSetAnimatorDemo.prototype.constructor = AbstractDemo;
	
	BlockSetAnimatorDemo.prototype.run = function(){
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
        //TODO : Find a better solution for this
        if(this.height<400){
            var urls = [
                "assets/demoImageThumbnails/skate3_75x75.jpg",
                "assets/demoImageThumbnails/snowboard3_75x75.jpg",
                "assets/demoImageThumbnails/surf3_75x75.jpg",
                "assets/demoImageThumbnails/surf4_75x75.jpg"];
        }else{
            var urls = [
                "assets/demoImageThumbnails/skate3.jpg",
                "assets/demoImageThumbnails/snowboard3.jpg",
                "assets/demoImageThumbnails/surf3.jpg",
                "assets/demoImageThumbnails/surf4.jpg"];
        }

		this.loadImagesWithImageStore(urls);
	};
		
	BlockSetAnimatorDemo.prototype.useLoadedImageStoreImages = function(){
		//console.log("BlockSetAnimatorDemo.useLoadedImageStoreImages()",this.imageStore.images.length);
		this.intro = true;
		this.blockSetAnimator = new BlockSetAnimator(this.x, this.y+this.height/2 - this.imageStore.images[0].height/2, this.width, this.height);
		this.blockSetAnimator.setImages(this.imageStore.images);
		BlockSetAnimatorDemo.runRandomAnimation(this);
	};
	
	BlockSetAnimatorDemo.prototype.canvasClickHandler = function(){
		if(this.blockSetAnimator.isAnimating()){
			return;
		}
		BlockSetAnimatorDemo.runRandomAnimation(this);
	};
	
	BlockSetAnimatorDemo.getIntroEasingFunction = function(){
		var easing = [UnitAnimator.easeLinear,
									UnitAnimator.easeOutSine,
									UnitAnimator.easeOutBounce,
									UnitAnimator.easeOutElastic];
		return easing[Math.floor( Math.random()*easing.length )];
	};
	
	BlockSetAnimatorDemo.getEndtroEasingFunction = function(){
		var easing = [UnitAnimator.easeLinear,
									UnitAnimator.easeInSine,
									UnitAnimator.easeInBounce,
									UnitAnimator.easeInElastic];
		return easing[Math.floor( Math.random()*easing.length )];	
	};
	
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
	};
	
	BlockSetAnimatorDemo.prototype.animationUpdate = function(){
		this.clear();
		this.blockSetAnimator.render(this.context2d);
	};
	
	BlockSetAnimatorDemo.prototype.blockSetAnimationComplete = function(){
		//console.log("BlockSetAnimatorDemo.blockSetAnimationComplete()");
		this.animationComplete();
	};
	
	BlockSetAnimatorDemo.prototype.customTearDown = function(){
		delete this.blockSetAnimator;
	};
	
	window.BlockSetAnimatorDemo = BlockSetAnimatorDemo;
	
	
	
	
	
	
	//================::TEXT EFFECT::===================

	TextEffectDemo = function(x, y, width, height, demoContainer){
		AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
		this.toolTip = "Click the text or reset for a new random animation.";
        this.gifPlaybackFrameRate = 100;
        this.captureFrameRate = 400;
	};
	
	//subclass extends superclass
	TextEffectDemo.prototype = Object.create(AbstractDemo.prototype);
	TextEffectDemo.prototype.constructor = AbstractDemo;
	
	TextEffectDemo.prototype.run = function(){
		this.intro = true;
		var _this = this;
		this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
        var chopper = new TextChopper();
		//var images = chopper.createImagesFromString("DEVSTATE",100, "#77fd6f", "#157b0f");
        //TODO : hardcoded font size numbers. This needs to be fixed!
		var images = chopper.createImagesFromString("DEVSTATE",this.height<400 ? 74 : 100, DSColors.LIGHT_GREEN, DSColors.GREEN);
		this.blockSetAnimator = new BlockSetAnimator( this.x+8 , this.y + this.height/2 - images[0].height/2, this.width, this.height);
		this.blockSetAnimator.setImages(images);
		BlockSetAnimatorDemo.runRandomAnimation(this);
	};
	
	TextEffectDemo.prototype.canvasClickHandler = function(){
		if(this.blockSetAnimator.isAnimating()){
			return;
		}
		BlockSetAnimatorDemo.runRandomAnimation(this);
	};
	
	TextEffectDemo.prototype.animationUpdate = function(){
		this.clear();
		this.blockSetAnimator.render(this.context2d);
	};
	
	TextEffectDemo.prototype.blockSetAnimationComplete = function(){
		//console.log("TextEffectDemo.blockSetAnimationComplete()");
		this.animationComplete();
	};
	
	TextEffectDemo.prototype.customTearDown = function(){
		delete this.blockSetAnimator;
	};
	
	window.TextEffectDemo = TextEffectDemo;








    //================::ISOMETRY::===================

    var IsometryDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
        this.toolTip = "Isometric projection of the Devstate logo in a gentle breeze.";
        this.gifPlaybackFrameRate = 100;
        this.captureFrameRate = 400;
    };

    //subclass extends superclass
    IsometryDemo.prototype = Object.create(AbstractDemo.prototype);
    IsometryDemo.prototype.constructor = AbstractDemo;

    IsometryDemo.prototype.run = function(){
        this.loadImagesWithImageStore(["assets/tinyLogo.png"]);
    };

    IsometryDemo.prototype.useLoadedImageStoreImages = function(){

        var image = this.imageStore.images[0];

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0 );
        var imagePixels = context.getImageData(0, 0, image.width, image.height);

        this.space = new IsometricSpaceLeft(this.width, this.height, 200, 140, 200);

        this.squares = [];
        var square, n;
        for(var i=0;i<10;i++){
            for(var j=0;j<10;j++){
                square = new IsometricSquare(this.context2d, this.space, i *.1, 0,.9-j *.1, .1, Math.random(), .1);
                n = (i * 4) * imagePixels.width + j * 4;
                square.setLeftPlaneStyle(DSColors.GREEN, 1, "000000", 1, 1);
                square.setRightPlaneStyle(DSColors.GREEN, 1, "000000", 1, 1);
                square.setTopPlaneStyle(imagePixels.data[n] > 0 ? DSColors.LIGHT_GREEN : DSColors.ORANGE, 1, "000000", 1, 1);
                this.squares.push(square);
            }
        }

        this.animator = new UnitAnimator();
        this.radian = 0;
        this.reStartWave();
    };

    IsometryDemo.prototype.animationComplete = function(){
        if(this.captureCompleteCallBack){
            this.captureCompleteCallBack();
        }
        this.reStartWave();
    };

    IsometryDemo.prototype.reStartWave = function(){
        var _this = this;
        this.animator.reset(1000+Math.random()*1000, 20, function() {_this.animationUpdate()}, function() {_this.animationComplete()});
        this.animator.start();
    }

    IsometryDemo.prototype.animationUpdate = function(){
        this.clear();
        this.radian = SimpleGeometry.PI2 * this.animator.getAnimationPercent();
        var step = SimpleGeometry.PI2/10;
        var cos, sin;
        for(var i=0;i<10;i++){
            for(var j=0;j<10;j++){
               square = this.squares[i*10+j];
               //square.setHeight((1+Math.cos(this.radian+i*step))/2);
               cos = .25+(1+Math.cos(this.radian+i*step))/6 ;
               sin = .25+(1+Math.sin(this.radian+j*step))/6 ;
               square.setHeight((cos+sin)/2);
               square.render();
            }
        }

    };

    IsometryDemo.prototype.customTearDown = function(){
        delete this.blockSetAnimator;
    };

    window.IsometryDemo = IsometryDemo;
	
}(window));