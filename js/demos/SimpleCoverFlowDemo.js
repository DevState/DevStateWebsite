/**
 * Created by sakri on 16-12-13.
 */


(function (window){

    var SimpleCoverFlowDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
        this.customCaptureControls = true;
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

}(window));