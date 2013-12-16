/**
 * Created by sakri on 16-12-13.
 */

(function (window){

    var BasicSlideShowDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
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

}(window));