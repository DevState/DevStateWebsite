/**
 * Created by sakri on 16-12-13.
 */

(function (window){

    var BarChartDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
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

}(window));