/**
 * Created by sakri on 16-12-13.
 */


(function (window){

    var TextEffectDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
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

}(window));