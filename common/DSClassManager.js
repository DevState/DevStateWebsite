(function (window){

    //this should be a singleton, everything can be static?
	DSClassManager = function(){
        this.loadedScripts=[];
         this.setDemoResources();
    };

    //TODO consider moving elsewhere. Some central repository of demos is needed
    DSClassManager.prototype.setDemoResources = function() {
        this.demos = [];
        this.demos.push(new DSDemoResource ("PieChart", "pieChart.png", ["common/ImageEffects", "charting/PieChart"]) );
        //this.demos.push(new DSDemoResource (DonutChart, "donutChart.png", ["charting/PieChart"]) );//TODO : combine with pie chart in light box
        this.demos.push(new DSDemoResource ("BarChart", "barChart.png", ["charting/ChartBackground","charting/BarChart"]) );
        this.demos.push(new DSDemoResource ("LineChart", "lineChart.png", ["charting/ChartBackground","charting/LineChart"]) );
        this.demos.push(new DSDemoResource ("BasicSlideShow", "basicSlideShow.png",
            ["common/ImageEffects", "common/ArrowButtons" , "slideShows/BasicSlideShow"]) );
        this.demos.push(new DSDemoResource ("ImageFader", "imageFader.png",
            ["common/ImageEffects", "slideShows/ImageEffectFader" ]) );
        this.demos.push(new DSDemoResource ("BlockSetAnimator", "blockSetAnimator.png", ["common/BlockSetAnimator"] ) );
        this.demos.push(new DSDemoResource ("TextEffect", "textEffect.png", ["textEffects/TextChopper", "common/BlockSetAnimator"] ) );
        this.demos.push(new DSDemoResource ("ThumbnailCarousel", "thumbCarousel.png", ["common/ArrowButtons" ,"menus/ThumbnailCarousel"]) );
        this.demos.push(new DSDemoResource ("SimpleCoverFlow", "coverFlow.png",
            ["common/ArrowButtons","common/TransformRectangle", "menus/SimpleCoverFlow"]) );
        this.demos.push(new DSDemoResource ("Wanderer", "wanderer.png", ["common/Wanderer"]) );
    };

    DSClassManager.prototype.scriptIsLoaded = function( url ) {
        return this.loadedScripts.indexOf(url) > -1;
    };


    DSClassManager.prototype.loadScript = function( url, callBack, errorCallBack ) {
        if(this.scriptIsLoaded(url)){
            setTimeout(callBack,200);
            return;
        }
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (script.readyState){  //IE
            script.onreadystatechange = function(){
                //TODO add 404 or error?
                if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                    script.onreadystatechange = null;
                    callBack();
                }
            };
        } else {  //Others
            script.onload = function(){
                callBack();
            };
            script.onerror = function(){
                console.log("DSClassManager.loadScript ERROR");
                errorCallBack();
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
        this.loadedScripts.push(url);
    };

    DSClassManager.prototype.getDemoResourceByName = function( name ) {
        for(var i=0;i<this.demos.length;i++){
            if(this.demos[i].name==name){
                return this.demos[i];
            }
        }
        return null;
    };

    DSClassManager.prototype.loadDemo = function( name, callBack, errorCallBack ) {
        this.currentLoadDemo = this.getDemoResourceByName(name);
        this.loadDemoCallback = callBack;
        this.loadDemoErrorCallBack = errorCallBack;
        if(!this.currentLoadDemo){
            console.log("DSClassManager.loadDemo() Error, no demo found");
            errorCallBack();
            return;
        }
        this.loadNextDemoResourceJSFile();
    };

    DSClassManager.prototype.loadNextDemoResourceJSFileError = function() {
        console.log("DSClassManager.loadNextDemoResourceJSFileError()");
        this.loadDemoErrorCallBack();
    };

    DSClassManager.prototype.loadNextDemoResourceJSFile = function() {
        for(var i=0;i<this.currentLoadDemo.dependencies.length;i++){
            if(!this.scriptIsLoaded(this.currentLoadDemo.dependencies[i])){
                var _this = this;
                this.loadScript(this.currentLoadDemo.dependencies[i], function(){_this.loadNextDemoResourceJSFile()} , function(){_this.loadNextDemoResourceJSFileError()});
                return;
            }
        }
        this.loadDemoCallback();
        this.loadDemoCallback = null;
        this.loadDemoErrorCallBack = null;
        this.currentLoadDemo = null;
    };


	window.DSClassManager = DSClassManager;

    //====================:: Dev State Demo Resource ::==================================

    DSDemoResource = function(name, thumbnail, dependencies){
        this.name = name;
        this.thumbnail = "assets/demoThumbnails/"+thumbnail;
        this.setDependencies(dependencies);
    };

    //use minified files on live server, locally load normal source files
    DSDemoResource.prototype.setDependencies = function(dependencies){
        this.dependencies = [];
        var jsExtension = (location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1) ? ".min.js" : ".js";
        for(var i=0;i<dependencies.length;i++){
            this.dependencies.push(dependencies[i]+jsExtension);
        }
    };

    window.DSDemoResource = DSDemoResource;
	
}(window));