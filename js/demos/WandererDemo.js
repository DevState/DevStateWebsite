/**
 * Created by sakri on 16-12-13.
 */

(function (window){

    var WandererDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
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

}(window));
