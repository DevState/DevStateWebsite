/**
 * Created by sakri on 16-12-13.
 */

(function (window){

    var IsometryDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
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