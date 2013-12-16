/**
 * Created by sakri on 16-12-13.
 */


(function (window){

    var ThumbnailCarouselDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
        this.customCaptureControls = true;
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

}(window));