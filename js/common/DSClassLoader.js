/**
 * Created by sakri on 17-12-13.
 * Loads individual scripts and demo dependencies
 * keeps track of loads, does not load same script twice
 */
(function (window){

    //this should be a singleton, everything can be static?
    var DSClassLoader = function(){
        this.loadedScripts=[];
    };

    DSClassLoader.prototype.scriptIsLoaded = function( url ) {
        return this.loadedScripts.indexOf(url) > -1;
    };

    DSClassLoader.prototype.loadScript = function( url, callBack, errorCallBack ) {
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
                console.log("DSClassLoader.loadScript ERROR");
                errorCallBack();
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
        this.loadedScripts.push(url);
    };

    DSClassLoader.prototype.loadDemo = function( demoResource, callBack, errorCallBack, updateCallBack ) {
        //console.log("DSClassLoader.loadCurrentDemo()", name);
        this.currentLoadDemoResource = demoResource;
        this.loadDemoCallback = callBack;
        this.loadDemoErrorCallBack = errorCallBack;
        this.updateCallBack = updateCallBack;
        if(!this.currentLoadDemoResource){
            console.log("DSClassLoader.loadDemo() Error, no demo found");
            errorCallBack();
            return;
        }
        this.currentLoadIndex = 0;
        this.loadNextDemoResourceJSFile();
    };

    DSClassLoader.prototype.loadNextDemoResourceJSFileError = function() {
        //console.log("DSClassLoader.loadNextDemoResourceJSFileError()");
        this.loadDemoErrorCallBack();
    };

    DSClassLoader.prototype.loadNextDemoResourceJSFile = function() {
        if(this.updateCallBack){
            this.updateCallBack("loading js : "+this.currentLoadIndex+" / "+this.currentLoadDemoResource.dependencies.length);
        }
        var i, scope, path;
        for(var i=0;i<this.currentLoadDemoResource.dependencies.length;i++){
            path = this.currentLoadDemoResource.dependencies[i];
            if(!this.scriptIsLoaded(path)){
                scope = this;
                this.loadScript(path, function(){scope.loadNextDemoResourceJSFile()} , function(){scope.loadNextDemoResourceJSFileError()});
                this.currentLoadIndex++;
                return;
            }
        }
        this.loadDemoCallback();
        this.loadDemoCallback = null;
        this.updateCallBack = null;
        this.loadDemoErrorCallBack = null;
        this.currentLoadDemoResource = null;
    };

    window.DSClassLoader = DSClassLoader;

}(window));