(function (window){

    //this should be a singleton, everything can be static?
	var DSClassManager = function(demosXML){
        this.loadedScripts=[];
        this.demosXML = demosXML;
        this.setDemoResources();
    };

    //TODO: repetition from main.js move to some general Util class?
    DSClassManager.prototype.getNodeValue = function(node, nodeName){
        return node.getElementsByTagName(nodeName)[0].childNodes[0].nodeValue;
    }


    DSClassManager.prototype.createDemoResourceFromDemoNode = function(demoNode){
        var name = this.getNodeValue(demoNode, "id");
        var thumb = this.getNodeValue(demoNode, "thumb")+".png";//REMOVE png reference
        var dependencyNode = demoNode.getElementsByTagName("dependencies")[0];
        var paths = dependencyNode.getElementsByTagName("path");
        var dependencies = [];
        for(var i=0;i<paths.length;i++){
            //console.log(paths[i], paths[i].childNodes[0], paths[i].childNodes[0].nodeValue);
            dependencies[i] = paths[i].childNodes[0].nodeValue;
        }
        //console.log(dependencies);
        return new DSDemoResource (name, thumb, dependencies);
    }

    //TODO consider moving elsewhere. Some central repository of demos is needed
    DSClassManager.prototype.setDemoResources = function() {
        this.demos = [];
        this.navigationItems = [];

        var menuItems = this.demosXML.getElementsByTagName( "menuItem");

        var demo, menuItem, navigationItem, demoResource, subMenu, i, j, demos;
        for(i = 0 ; i < menuItems.length; i++){
            menuItem = menuItems[i];
            subMenu = [];
            demos = menuItem.getElementsByTagName("demo");
            for(j=0; j<demos.length; j++){
                demo = this.createDemoResourceFromDemoNode(demos[j]);
                this.demos.push(demo);
                subMenu.push(demo.name);
                console.log("setDemoResources", demo.name);
            }
            if(subMenu.length>1){
                this.navigationItems.push(new DSDemoNavigationItem(subMenu[0], subMenu.concat()));
            }else{
                this.navigationItems.push(new DSDemoNavigationItem(demo.name));
            }
        }
        //console.log("DSClassManager.setDemoResources()", this.demos.length, this.navigationItems.length);

        /*
        this.demos.push(new DSDemoResource ("PieChart", "pieChart.png", ["common/ImageEffects", "charting/PieChart"]) );
        this.navigationItems.push(new DSDemoNavigationItem("PieChart", ["PieChart", "DonutChart"]));

        this.demos.push(new DSDemoResource ("DonutChart", "donutChart.png", ["charting/PieChart"]) );
        this.demos.push(new DSDemoResource ("BarChart", "barChart.png", ["charting/ChartBackground","charting/BarChart"]) );

        this.navigationItems.push(new DSDemoNavigationItem("BarChart", ["BarChart", "LineChart"]));
        this.demos.push(new DSDemoResource ("LineChart", "lineChart.png", ["charting/ChartBackground","charting/LineChart"]) );
        //this.navigationItems.push(new DSDemoNavigationItem("LineChart"));

        this.demos.push(new DSDemoResource ("Isometry", "isometry.png", ["common/Isometric"]) );
        this.navigationItems.push(new DSDemoNavigationItem("Isometry"));

        this.demos.push(new DSDemoResource ("BasicSlideShow", "basicSlideShow.png",
            ["common/ImageEffects", "common/ArrowButtons" , "slideShows/BasicSlideShow"]) );
        this.navigationItems.push(new DSDemoNavigationItem("BasicSlideShow"));

        this.demos.push(new DSDemoResource ("ImageFader", "imageFader.png",
            ["common/ImageEffects", "slideShows/ImageEffectFader" ]) );
        this.navigationItems.push(new DSDemoNavigationItem("ImageFader"));

        this.demos.push(new DSDemoResource ("BlockSetAnimator", "blockSetAnimator.png", ["common/BlockSetAnimator"]) );
        this.navigationItems.push(new DSDemoNavigationItem("BlockSetAnimator"));

        this.demos.push(new DSDemoResource ("TextEffect", "textEffect.png", ["textEffects/TextChopper", "common/BlockSetAnimator"]) );
        this.navigationItems.push(new DSDemoNavigationItem("TextEffect"));

        this.demos.push(new DSDemoResource ("ThumbnailCarousel", "thumbCarousel.png", ["common/ArrowButtons" ,"menus/ThumbnailCarousel"]) );
        this.navigationItems.push(new DSDemoNavigationItem("ThumbnailCarousel"));

        this.demos.push(new DSDemoResource ("SimpleCoverFlow", "coverFlow.png",
            ["common/ArrowButtons","common/TransformRectangle", "menus/SimpleCoverFlow"]) );
        this.navigationItems.push(new DSDemoNavigationItem("SimpleCoverFlow"));

        this.demos.push(new DSDemoResource ("Wanderer", "wanderer.png", ["common/Wanderer"]) );
        this.navigationItems.push(new DSDemoNavigationItem("Wanderer"));

            */
        this.currentDemoName = "";
    };

    DSClassManager.prototype.getNextDemoName = function(){
        for(var i=0;i<this.navigationItems.length;i++){
            if(this.currentDemoName==this.navigationItems[i].demoName || this.navigationItems[i].subMenu.indexOf(this.currentDemoName)>-1){
                if(i<this.navigationItems.length-1){
                    return this.navigationItems[i+1].demoName;
                }
            }
        }
        return this.navigationItems[0].demoName;//meh
    };

    DSClassManager.prototype.getPreviousDemoName = function(){
        for(var i=0;i<this.navigationItems.length;i++){
            if(this.currentDemoName==this.navigationItems[i].demoName || this.navigationItems[i].subMenu.indexOf(this.currentDemoName)>-1){
                if(i>0){
                    return this.navigationItems[i-1].demoName;
                }
            }
        }
        return this.navigationItems[this.navigationItems.length-1].demoName;//meh
    };


    DSClassManager.prototype.getNavigationItemForDemoName = function(demoName){
        var item;
        for(var i=0;i<this.navigationItems.length;i++){
            item = this.navigationItems[i];
            if(item.demoName == demoName){
                return item;
            }
        }
        return undefined;
    };

    DSClassManager.prototype.getSubmenuForDemoName = function(demoName){
        //console.log("DSClassManager.getSubmenuForDemoName()", demoName);
        var item = this.getNavigationItemForDemoName(demoName);
        if(item){
            return item.subMenu;
        }
        return [];
    };

    DSClassManager.prototype.getDemoResourceByName = function( name ) {
        for(var i=0;i<this.demos.length;i++){
            if(this.demos[i].name==name){
                return this.demos[i];
            }
        }
        return null;
    };
    DSClassManager.prototype.getDemoResourceForNavigationItem = function(item){
        for(var i=0;i<this.demos.length;i++){
            if(this.demos[i].name == item.demoName){
                return this.demos[i];
            }
        }
        return undefined;//meh
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

    DSClassManager.prototype.loadDemo = function( name, callBack, errorCallBack ) {
        //console.log("DSClassManager.loadDemo()", name);
        this.currentLoadDemoResource = this.getDemoResourceByName(name);
        this.currentDemoName = name;
        this.loadDemoCallback = callBack;
        this.loadDemoErrorCallBack = errorCallBack;
        if(!this.currentLoadDemoResource){
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
        for(var i=0;i<this.currentLoadDemoResource.dependencies.length;i++){
            if(!this.scriptIsLoaded(this.currentLoadDemoResource.dependencies[i])){
                var _this = this;
                this.loadScript(this.currentLoadDemoResource.dependencies[i], function(){_this.loadNextDemoResourceJSFile()} , function(){_this.loadNextDemoResourceJSFileError()});
                return;
            }
        }
        this.loadDemoCallback();
        this.loadDemoCallback = null;
        this.loadDemoErrorCallBack = null;
        this.currentLoadDemoResource = null;
    };


	window.DSClassManager = DSClassManager;

    //====================:: Dev State Demo Resource ::==================================

    var DSDemoResource = function(name, thumbnail, dependencies){
        this.name = name;
        this.thumbnail = "assets/demoThumbnails/"+thumbnail;
        this.rawThumbnail = thumbnail;
        this.setDependencies(dependencies);
    };

    //use minified files on live server, locally load normal source files
    DSDemoResource.prototype.setDependencies = function(dependencies){
        this.dependencies = [];
        this.rawDependencies = [];
        var jsExtension = (location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1) ? ".min.js" : ".js";
        for(var i=0;i<dependencies.length;i++){
            this.dependencies.push(dependencies[i]+jsExtension);
            this.rawDependencies.push(dependencies[i]);
        }
    };

    window.DSDemoResource = DSDemoResource;

    //====================:: Dev State Demos Navigation Item ::==================================

     var DSDemoNavigationItem = function(demoName, subMenu){
        this.demoName = demoName;
        this.subMenu = subMenu == undefined ? [] : subMenu;
    };

    window.DSDemoResource = DSDemoResource;
}(window));