/**
 * Created by sakri on 16-12-13.
 */



(function (window){

    var ImageFaderDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
        this.customCaptureControls = true;
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

}(window));