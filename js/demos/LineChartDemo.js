/**
 * Created by sakri on 16-12-13.
 */

(function (window){

    var LineChartDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
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

}(window));