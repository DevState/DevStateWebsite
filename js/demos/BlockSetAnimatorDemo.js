/**
 * Created by sakri on 16-12-13.
 */


(function (window){

    var BlockSetAnimatorDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
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

}(window));