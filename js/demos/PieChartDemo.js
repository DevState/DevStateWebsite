/**
 * Created by sakri on 16-12-13.
 * includes Donut Chart below
 */

(function (window){

    var PieChartDemo = function(x, y, width, height, demoContainer){
        AbstractDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
        this.gifPlaybackFrameRate = 200;
    };

    //subclass extends superclass
    PieChartDemo.prototype = Object.create(AbstractDemo.prototype);
    PieChartDemo.prototype.constructor = AbstractDemo;

    PieChartDemo.prototype.createPieChart = function(){
        this.showReflection = true;
        var pie = new PieChart(this.x, this.y, this.width, this.height*.7, 10);
        pie.colors = [DSColors.GREEN, DSColors.LIGHT_GREEN , DSColors.ORANGE, DSColors.PINK_ORANGE , "#3db5d2", "#d1eff9" ];
        this.reflectionCaptureRect = new SimpleGeometry.Rectangle(pie.center.x-pie.radius, pie.center.y-pie.radius, pie.radius*2, pie.radius*2);
        return pie;
    };

    PieChartDemo.prototype.run = function(){
        this.pieChart = this.createPieChart();
        var _this = this;
        this.canvas.addEventListener("click", function(event){_this.canvasClickHandler(event)}, false);//"mousedown"
        this.pieChartOpen = true;
        this.animator = new UnitAnimator(1000, 20, function() {_this.updatePieChart()}, function() {_this.animationComplete()});
        this.animator.start();
    };

    PieChartDemo.prototype.updatePieChart = function(){
        this.renderPieChart(this.animator.getAnimationPercent());
    };
    PieChartDemo.prototype.updatePieChartReverse = function(){
        this.renderPieChart(1-this.animator.getAnimationPercent());
    };

    PieChartDemo.prototype.renderPieChart = function(animationPercent){
        this.clear();
        this.pieChart.render(this.context2d, animationPercent);
        if(!this.showReflection){
            return;
        }
        ImageEffects.renderReflection(this.canvas, this.reflectionCaptureRect);
    };

    PieChartDemo.prototype.canvasClickHandler = function(){
        if(this.animator.isAnimating()){
            return;
        }
        var _this = this;
        var callback = this.pieChartOpen ? function(){_this.updatePieChartReverse();} : function(){_this.updatePieChart();};
        this.animator.reset(1000,20,callback );
        this.animator.start();
        this.pieChartOpen =!this.pieChartOpen;
    };

    PieChartDemo.prototype.customTearDown = function(){
        delete this.pieChart;
    };

    window.PieChartDemo = PieChartDemo;







    //================::DONUT CHART::===================

    var DonutChartDemo = function(x, y, width, height, demoContainer){
        PieChartDemo.call(this, x, y, width, height, demoContainer); //call super constructor.
    };

    //subclass extends superclass
    DonutChartDemo.prototype = Object.create(PieChartDemo.prototype);
    DonutChartDemo.prototype.constructor = PieChartDemo;

    DonutChartDemo.prototype.createPieChart = function(){
        this.showReflection = false;
        //console.log("DonutChartDemo.prototype.createPieChart()");
        var donut = new DonutChart(this.x,this.y,this.width,this.height);
        donut.colors = [DSColors.GREEN, DSColors.LIGHT_GREEN , DSColors.ORANGE, DSColors.PINK_ORANGE , "#3db5d2", "#d1eff9" ];
        return donut;
        //return new DonutChart(this.x+35,this.y+30,this.width/2-60,this.height/2-60,.3);
    };

    window.DonutChartDemo = DonutChartDemo;

}(window));