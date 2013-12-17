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
/**
 * Created by sakri on 23-10-13.
 * Loads individual scripts and demo dependencies
 * keeps track of loads, does not load same script twice
 * Contains code for DSDemoResource
 */

(function (window){

    //this should be a singleton, everything can be static?
	var DemoNavigationModel = function(demosXML){
        this.parseDemosXML(demosXML);
    };

    //=============::PARSING::================

    //TODO: repetition from main.js move to some general Util class?
    DemoNavigationModel.prototype.getNodeValue = function(node, nodeName){
        return node.getElementsByTagName(nodeName)[0].childNodes[0].nodeValue;
    };


    DemoNavigationModel.prototype.createDemoResourceFromDemoXMLNode = function(demoNode){
        var name = demoNode.getAttribute("id");
        var shortName = getNodeValue(demoNode, "shortName");
        var toolTip = getNodeValue(demoNode, "toolTip");
        var toolTipShort = getNodeValue(demoNode, "toolTipShort");
        var thumb = getNodeValue(demoNode, "thumb");
        var dependencyNode = demoNode.getElementsByTagName("dependencies")[0];
        var paths = dependencyNode.getElementsByTagName("path");
        var dependencies = [];
        for(var i=0;i<paths.length;i++){
            //console.log(paths[i], paths[i].childNodes[0], paths[i].childNodes[0].nodeValue);
            dependencies[i] = paths[i].childNodes[0].nodeValue;
        }
        //console.log(dependencies);
        return new DSDemoResource (name, shortName, toolTip, toolTipShort, thumb, dependencies);
    };

    DemoNavigationModel.prototype.parseDemosXML = function(demosXML) {
        this.demos = [];
        this.navigationItems = [];//2 dimensional array, items can have subnavigations [ [demoA] , [demoB, demoC], [demoD] ]

        var menuItems = demosXML.getElementsByTagName("menuItem");

        var demo, menuItemNode, navigationItem, demoResource, subMenu, i, j, demos;
        for(i = 0 ; i < menuItems.length; i++){
            menuItemNode = menuItems[i];
            subMenu = [];
            demos = menuItemNode.getElementsByTagName("demo");
            for(j=0; j<demos.length; j++){
                demo = this.createDemoResourceFromDemoXMLNode(demos[j]);
                this.demos.push(demo);
                subMenu.push(demo);
            }
            this.navigationItems.push(subMenu);
        }
        console.log("DemoNavigationModel.prototype.parseDemosXML");
        console.log(this.demos.length);
        console.log(this.navigationItems.length);
        this.currentNavigationIndex  = 0;
        this.currentDemoResource = "";
    };

    //=============::NAVIGATION RELATED::================

    DemoNavigationModel.prototype.navigateToNext = function(){
        this.currentNavigationIndex = ++this.currentNavigationIndex % this.navigationItems.length;
        this.currentDemoResource = this.navigationItems[this.currentNavigationIndex][0];
        return this.currentDemoResource;
    };

    DemoNavigationModel.prototype.navigateToPrevious = function(){
        this.currentNavigationIndex = --this.currentNavigationIndex  >-1 ? this.currentNavigationIndex : this.navigationItems.length-1;
        this.currentDemoResource = this.navigationItems[this.currentNavigationIndex][0];
        return this.currentDemoResource;
    };

    DemoNavigationModel.prototype.navigateToDemoByName = function(demoName){
        var demo = this.getDemoResourceByName(demoName);
        if(!demo){
            return undefined;
        }
        for(var i=0;i<this.navigationItems.length;i++){
            if(this.navigationItems[i].indexOf(demo)>-1){
                this.currentNavigationIndex = i;
                this.currentDemoResource = demo;
                return this.currentDemoResource;
            }
        }
        return undefined;//failsafe, should never happen
    };

    DemoNavigationModel.prototype.getDemoResourceByName = function(demoName){
        for(var i=0;i<this.demos.length;i++){
            if(this.demos[i].name == demoName){
                return this.demos[i];
            }
        }
        return undefined;
    }

    DemoNavigationModel.prototype.getCurrentNavigationItem = function(){
        return this.navigationItems[this.currentNavigationIndex];
    }


	window.DemoNavigationModel = DemoNavigationModel;



    //====================:: Dev State Demo Resource ::==================================

    var DSDemoResource = function(name, shortName, toolTip, toolTipShort, thumb, dependencies){
        this.name = name;
        this.shortName = shortName;
        this.toolTip = toolTip;
        this.toolTipShort = toolTipShort;
        this.thumb = thumb;
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
(function (window){

	SimpleGeometry = function(){};

	SimpleGeometry.degreesToRadians = function(degrees){
		return degrees * (Math.PI/180);
	};

	SimpleGeometry.radiansToDegrees = function(radians){
		return radians * (180/Math.PI)
	};
	
	SimpleGeometry.PI2 = 2 * Math.PI;
	SimpleGeometry.PI_HALF = Math.PI/2;
	SimpleGeometry.PI_FOURTH = Math.PI/4;
	
	//return number between 1 and 0
	SimpleGeometry.normalize = function(value, minimum, maximum){
		return (value - minimum) / (maximum - minimum);
	};

	//map normalized number to values
	SimpleGeometry.interpolate = function(normValue, minimum, maximum){
		return minimum + (maximum - minimum) * normValue;
	};

	//map a value from one set to another
	SimpleGeometry.map = function(value, min1, max1, min2, max2){
		return SimpleGeometry.interpolate( SimpleGeometry.normalize(value, min1, max1), min2, max2);
	};

	SimpleGeometry.getRandomPositiveOrNegativeOne = function(){
		return Math.random() > .5 ? 1 : -1;
	};

	//constrain degrees between 0 and 360
	SimpleGeometry.constrainDegreeTo360 = function(degree){
		return (360+degree%360)%360;//hmmm... looks a bit weird?!
	};
	
	//constrain radians between 0 and 2PI
	SimpleGeometry.constrainRadianTo2PI = function(rad){
		return (SimpleGeometry.PI2+rad%SimpleGeometry.PI2)%SimpleGeometry.PI2;//equally so...
	};
	
	//constrains a number within a range
	SimpleGeometry.clamp = function(number, min, max){
		if(number<min){
			return min;
		}
		if(number>max){
			return max;
		}
		return number;
	};
	
	SimpleGeometry.getRandomFillStyleColor = function(alpha, maxColorValue){
		if(isNaN(maxColorValue)){
			maxColorValue = 255;
		}
		var c = [];
		for(var i=0; i<3; i++){
			c[i] = Math.floor(Math.random()*maxColorValue);
		}
		return SimpleGeometry.getRgbaStyleString(c[0], c[1], c[2], isNaN(alpha) ? 1 : SimpleGeometry.clamp(alpha,0,1));
	};
	
	SimpleGeometry.getRgbaStyleString = function(red, green, blue, alpha){
		return "rgba("+red+","+green+","+blue+","+alpha+")";
	};
	
	SimpleGeometry.setIdentityMatrixToContext = function(context){
		context.setTransform(1,0,0,1,0,0);
	};
	
	//==================================================
	//=====================::POINT::====================
	//==================================================

	SimpleGeometry.Point = function (x,y){
		this.x=isNaN(x) ? 0 : x;
		this.y=isNaN(y) ? 0 : y;
	};
		
	SimpleGeometry.Point.prototype.clone = function(){
		return new SimpleGeometry.Point(this.x,this.y);
	};
	
	SimpleGeometry.Point.prototype.equals = function(point){
		return this.x==point.x && this.y==point.y;
	};
	
	SimpleGeometry.Point.prototype.toString = function(){
		return "{x:"+this.x+" , y:"+this.y+"}";
	};
	
	SimpleGeometry.distanceBetweenTwoPoints = function( point1, point2 ){
		//console.log("Math.pow(point2.x - point1.x,2) : ",Math.pow(point2.x - point1.x,2));
		return Math.sqrt( Math.pow(point2.x - point1.x,2) + Math.pow(point2.y - point1.y,2) );
	};
	
	SimpleGeometry.angleBetweenTwoPoints = function(p1,p2){
		return Math.atan2(p1.y-p2.y, p1.x-p2.x);			
	};
	
	SimpleGeometry.mirrorPointInRectangle = function(point,rect){
		return new SimpleGeometry.Point(rect.width-point.x,rect.height-point.y);
	};
	
	SimpleGeometry.randomizePoint = function(point,randomValue){
		return new SimpleGeometry.Point(-randomValue+Math.random()*randomValue+point.x,-randomValue+Math.random()*randomValue+point.y);
	};

	
	//==================================================
	//=====================::TRIANGLE::====================
	//==================================================

	SimpleGeometry.Triangle = function (a,b,c){
		this.a = a ? a : new SimpleGeometry.Point(0,0);
		this.b = b ? b : new SimpleGeometry.Point(0,0);
		this.c = c ? c : new SimpleGeometry.Point(0,0);
	};
	
	SimpleGeometry.Triangle.prototype.equals = function(triangle){
		return this.a.equals(triangle.a) && this.b.equals(triangle.b) && this.c.equals(triangle.c);
	};
	
	SimpleGeometry.Triangle.prototype.clone = function(){
		return new SimpleGeometry.Triangle(new SimpleGeometry.Point(this.a.x,this.a.y),new SimpleGeometry.Point(this.b.x,this.b.y),new SimpleGeometry.Point(this.c.x,this.c.y));
	};

	SimpleGeometry.Triangle.prototype.getSmallestX = function(){
		return Math.min(this.a.x,this.b.x,this.c.x);
	};
	SimpleGeometry.Triangle.prototype.getSmallestY = function(){
		return Math.min(this.a.y,this.b.y,this.c.y);		
	};
	
	SimpleGeometry.Triangle.prototype.getBiggestX = function(){
		return Math.max(this.a.x,this.b.x,this.c.x);
	};
	SimpleGeometry.Triangle.prototype.getBiggestY = function(){
		return Math.max(this.a.y,this.b.y,this.c.y);
	};

	SimpleGeometry.Triangle.prototype.containsVertex = function(point){
		//console.log("SimpleGeometry.Triangle.containsVertex",this.toString(),point.toString());
		return (this.a.x==point.x && this.a.y==point.y) || (this.b.x==point.x && this.b.y==point.y) || (this.c.x==point.x && this.c.y==point.y);
	};
	
	SimpleGeometry.Triangle.prototype.toString = function(){
		return "toString() Triangle{a:"+this.a+" , b:"+this.b+" , c:"+this.c+"}";
	};
	
	SimpleGeometry.Triangle.prototype.containsVertex = function(point){
		return (this.a.x==point.x && this.a.y==point.y) || (this.b.x==point.x && this.b.y==point.y) || (this.c.x==point.x && this.c.y==point.y);
	};
	
	SimpleGeometry.Triangle.prototype.sharesEdge = function(triangle){
		//console.log("SimpleGeometry.Triangle.sharesEdge",this.toString(),triangle.toString());
		var sharedPoints=0;
		if(this.containsVertex(triangle.a)){
			sharedPoints++;
		}
		if(this.containsVertex(triangle.b)){
			sharedPoints++;
		}
		if(this.containsVertex(triangle.c)){
			sharedPoints++;
		}
		//console.log("sharesEdge()",sharedPoints);
		return sharedPoints==2;
	};
	
	//==================================================
	//===================::RECTANGLE::==================
	//==================================================

	//TODO : Extend point?
	SimpleGeometry.Rectangle = function (x,y,width,height){
		this.x=x;
		this.y=y;
		this.width=width;
		this.height=height;
	};
	
	SimpleGeometry.Rectangle.prototype.getRight = function(){
		return this.x+this.width;
	};
	
	SimpleGeometry.Rectangle.prototype.getBottom = function(){
		return this.y+this.height;
	};
	
	SimpleGeometry.Rectangle.prototype.containsPoint = function(point){
		return point.x>this.x && point.y>this.y && point.x<this.getRight() && point.y<this.getBottom();
	};
	//questionable... center should not be relative to canvas itself...
	SimpleGeometry.Rectangle.prototype.getCenter = function(){
		return new SimpleGeometry.Point(this.x+this.width/2,this.y+this.height/2);
	};
	
	SimpleGeometry.Rectangle.prototype.clone = function(){
		return new SimpleGeometry.Rectangle(this.x,this.y,this.width,this.height);
	};
	
	SimpleGeometry.Rectangle.prototype.toString = function(){
		return "Rectangle{x:"+this.x+" , y:"+this.y+" , width:"+this.width+" , height:"+this.height+"}";
    };

	window.SimpleGeometry=SimpleGeometry;
	
	//==================================================
	//=====================::CIRCLE::===================
	//==================================================

	SimpleGeometry.Circle = function (x,y,radius){
		this.radius=isNaN(radius) ? 10 : radius;
		SimpleGeometry.Point.call(this,x,y); //call super constructor.
	};
	
	//subclass extends superclass
	SimpleGeometry.Circle.prototype = Object.create(SimpleGeometry.Point.prototype);
	SimpleGeometry.Circle.prototype.constructor = SimpleGeometry.Point;
	
	SimpleGeometry.Circle.prototype.getRandomPointInCircle = function(){
		var radius = Math.random() * this.radius;
		var radian = Math.random() * SimpleGeometry.PI2;
		var x = this.x + Math.cos(radian) * radius;
		var y = this.y + Math.sin(radian) * radius;
		return new SimpleGeometry.Point(x, y);
	};
	
	SimpleGeometry.Circle.prototype.clone = function(){
		return new SimpleGeometry.Circle(this.x,this.y,this.radius);
	};
	
	
	//==================================================
	//=====================::TRANSFORM::===================
	//==================================================

	//(1,0,0,1,0,0);
	SimpleGeometry.Transform = function (scaleX, skewX, skewY, scaleY, tx, ty){
		this.update(isNaN(scaleX) ? 1 : scaleX, isNaN(skewX) ? 0 : skewX, isNaN(skewY) ? 0 : skewY,
					isNaN(scaleY) ? 1 : scaleY, isNaN( tx) ?  0 : tx, isNaN(ty) ? 0 : ty);
	};

	SimpleGeometry.Transform.prototype.update = function (scaleX, skewX, skewY, scaleY, tx, ty){
		this.scaleX = scaleX;
		this.skewX = skewX;
		this.skewY = skewY;
		this.scaleY = scaleY;
		this.tx = tx;
		this.ty = ty;	
	};
	
	SimpleGeometry.Transform.prototype.toString = function() {
		return "SimpleGeometry.Transform{scaleX:"+this.scaleX+" ,skewX:"+this.skewX+" ,skewY:"+this.skewY+" ,scaleY:"+this.scaleY+" ,tx:"+this.tx+" ,ty:"+this.ty+"}";
	};


    //==================================================
    //=====================::Point3d::====================
    //==================================================


    SimpleGeometry.Point2d = function (x, y, t){
        this.x = isNaN(x) ? 0 : x;
        this.y = isNaN(y) ? 0 : y;
        this.t = isNaN(t) ? 0 : t;
    };

    SimpleGeometry.Point2d.prototype.toString = function(){
        return "x: " + this.x + ", y: " + this.y + ", t: " + this.t;
    };


    SimpleGeometry.Point3d = function (x,y, z){
        this.x = isNaN(x) ? 0 : x;
        this.y = isNaN(y) ? 0 : y;
        this.z = isNaN(z) ? 0 : z;
    };

    SimpleGeometry.Point3d.prototype.clone = function(){
        return new SimpleGeometry.Point3d(this.x, this.y, this.z);
    };

    SimpleGeometry.Point3d.prototype.copyValuesTo = function(point3d){
        point3d.x = this.x;
        point3d.y = this.y;
        point3d.z = this.z;
    };

    SimpleGeometry.Point3d.prototype.updateValues = function(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    };

    SimpleGeometry.Point3d.prototype.equals = function(point){
        return this.x==point.x && this.y==point.y && this.z==point.z;
    };

    //TODO move this elsewhere, currently used in Test3d.html
    SimpleGeometry.Point3d.prototype.project = function(focalLength, projectionCenter){
        var t = focalLength / (focalLength+this.z);
        if (!projectionCenter){
            projectionCenter = new SimpleGeometry.Point(0, 0);
        }

        var xOffset = projectionCenter.x;
        var yOffset = projectionCenter.y;

        var x = this.x;
        var y = this.y;
        //var z = this.z;

        x -= xOffset;
        y -= yOffset;

        x = (x*t)+xOffset;
        y = (y*t)+yOffset;

        console.log("Point3d.project()", t, projectionCenter.toString(), xOffset, yOffset, x, y);

        return new SimpleGeometry.Point2d(x, y, t);
    };


    SimpleGeometry.Point3d.prototype.toString = function(){
        return "{x:"+this.x+" , y:"+this.y+" , z:"+this.z+"}";
    };

    window.SimpleGeometry=SimpleGeometry;

}(window));
/**
 * Created by sakri on 17-10-13.
 */

(function (window){

    DSColors = function(){};

    DSColors.GREEN = "#157b0f";
    DSColors.LIGHT_GREEN = "#77fd6f";
    DSColors.ORANGE = "#ff342e";
    DSColors.PINK_ORANGE = "#ff5b59";

    window.DSColors=DSColors;


}(window));


//=========================::UNIT ANIMATOR::===============================

//animates a number from 0-1 (with optional easing) for a given duration and a framerate
//this is used to animate or tweeen visuals which are set up using interpolation

(function (window){

	//constructor, duration and framerate must be in milliseconds
	UnitAnimator=function(duration,framerate,updateCallBack,completeCallBack){
		this.reset(duration,framerate,updateCallBack,completeCallBack);
	};

	//t is "time" this.millisecondsAnimated
	//b is the "beginning" value
	//c is "change" or the difference of end-start value
	//d is this.duration
	
	//classic Robert Penner easing functions
	//http://www.robertpenner.com/easing/
	
	
	UnitAnimator.easeLinear = function(t, b, c, d){
		return c * (t / d) + b;
	};
	
	//SINE
	UnitAnimator.easeInSine = function (t, b, c, d){
		return -c * Math.cos(t/d * SimpleGeometry.PI_HALF) + c + b;
	};
	UnitAnimator.easeOutSine = function (t, b, c, d){
		return c * Math.sin(t/d * SimpleGeometry.PI_HALF) + b;
	};
	UnitAnimator.easeInOutSine = function (t, b, c, d){
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	};
	
	
	//BOUNCE
	UnitAnimator.easeInBounce = function(t, b, c, d){
		return c - UnitAnimator.easeOutBounce (d-t, 0, c, d) + b;
	};
	UnitAnimator.easeOutBounce = function(t, b, c, d){
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	};
	UnitAnimator.easeInOutBounce = function (t, b, c, d){
		if (t < d/2){
			return UnitAnimator.easeInBounce (t*2, 0, c, d) * .5 + b;
		}
		return UnitAnimator.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
	};
	
	//ELASTIC
	UnitAnimator.easeInElastic = function(t, b, c, d, a, p){
		var s;
		if (t==0){
			return b; 
		}
		if ((t/=d)==1){
			return b+c;
		}
		if (!p){
			p=d*.3;
		}
		if (!a || a < Math.abs(c)) {
			a=c; s=p/4; 
		}else{
			s = p/SimpleGeometry.PI2 * Math.asin (c/a);
		}
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*SimpleGeometry.PI2/p )) + b;
	};
	UnitAnimator.easeOutElastic = function(t, b, c, d, a, p){
		var s;
		if (t==0){
			return b;
		}
		if ((t/=d)==1){
			return b+c;
		}
		if (!p){
			p=d*.3;
		}
		if (!a || a < Math.abs(c)) {
			a=c; s=p/4; 
		}else{
			s = p/SimpleGeometry.PI2 * Math.asin (c/a);
		}
		return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*SimpleGeometry.PI2/p ) + c + b);
	};
	UnitAnimator.easeInOutElastic = function(t, b, c, d, a, p){
		var s;
		if (t==0){
			return b;
		}
		if ((t/=d/2)==2){
			return b+c;
		}
		if (!p){
			p=d*(.3*1.5);
		}
		if (!a || a < Math.abs(c)) {
			a=c; s=p/4; 
		}else{
			s = p/SimpleGeometry.PI2 * Math.asin (c/a);
		}
		if (t < 1){
			return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*SimpleGeometry.PI2/p )) + b;
		}
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*SimpleGeometry.PI2/p )*.5 + c + b;
	};
	
	UnitAnimator.easingFunctions = [UnitAnimator.easeLinear,
                                    UnitAnimator.easeInSine, UnitAnimator.easeOutSine, UnitAnimator.easeInOutSine,
                                    UnitAnimator.easeInBounce, UnitAnimator.easeOutBounce, UnitAnimator.easeInOutBounce,
                                    UnitAnimator.easeInElastic, UnitAnimator.easeOutElastic, UnitAnimator.easeInOutElastic
                                    ];
	
	UnitAnimator.prototype.easingFunction = UnitAnimator.easeLinear;//default
	
	UnitAnimator.getRandomEasingFunction = function(){
		return UnitAnimator.easingFunctions[Math.floor( Math.random()*UnitAnimator.easingFunctions.length )];
	};
	
	UnitAnimator.prototype.setRandomEasingFunction = function(){
		this.easingFunction = UnitAnimator.getRandomEasingFunction();
	};
	
	UnitAnimator.prototype.setEasingFunction = function(easingFunction){
		if(UnitAnimator.easingFunctions.indexOf(easingFunction) > -1){
			this.easingFunction = easingFunction;
		}
	};
	
	//easing (t, b, c, d)
	//@t is the current time (or position) of the tween. This can be seconds or frames, steps, seconds, ms, whatever � as long as the unit is the same as is used for the total time [3].
	//@b is the beginning value of the property.
	//@c is the change between the beginning and destination value of the property.
	//@d is the total time of the tween.
	UnitAnimator.prototype.getAnimationPercent = function(){
		return this.easingFunction(SimpleGeometry.normalize(this.millisecondsAnimated,0,this.duration),0,1,1);
	};
	
	UnitAnimator.prototype.isAnimating = function(){
		return !isNaN(this.intervalId);
	};
	
	UnitAnimator.prototype.reset = function(duration,framerate,updateCallBack,completeCallBack){
		this.duration = duration;
		this.framerate = framerate;
		if(framerate > duration){
			//throw error?!
		}
		this.updateCallBack = updateCallBack;
		this.completeCallBack = completeCallBack;
		this.millisecondsAnimated = 0;//keeps track of how long the animation has been running
	};
	
	UnitAnimator.prototype.start = function(easingFunction){
		//console.log("UnitAnimator.start()");
		if(easingFunction){
			this.setEasingFunction(easingFunction);
		}
		var _this = this;
		this.intervalId = setInterval(function(){_this.update();}, this.framerate);//TODO : find easier to explain solution
	};
	
	UnitAnimator.prototype.pause = function(){
		if(!isNaN(this.intervalId)){
			clearInterval(this.intervalId);
		}
		delete this.intervalId;
	};

	//refactor, make private
	UnitAnimator.prototype.update = function(){
		//console.log("UnitAnimator.update()",this.getAnimationPercent());
		this.millisecondsAnimated += this.framerate;
		if(this.millisecondsAnimated >= this.duration){
			//console.log("UnitAnimator.update() animation complete");
			this.pause();
			this.millisecondsAnimated = this.duration;
			this.dispatchUpdate();
			this.dispatchComplete();
			return;
		}
		this.dispatchUpdate();
	};
	
	UnitAnimator.prototype.dispatchUpdate = function(){
		if(this.updateCallBack){
			//console.log("UnitAnimator.dispatchUpdate()",this.getAnimationPercent());
			this.updateCallBack();
		}
	};
	UnitAnimator.prototype.dispatchComplete = function(){
		if(this.completeCallBack){
			this.completeCallBack();
		}
	};
	
	window.UnitAnimator = UnitAnimator;
	
}(window));
//has a dependency on SimpleGeometry

(function (window){
	
	//arcLength must be between 0 and Math.PI * 2
	SimpleLoaderGraphic = function(x, y, radius, updateHandler, arcLength){
		SimpleGeometry.Circle.call(this, x, y, radius); //call super constructor.
		this.updateHandler = updateHandler;
		this.arcLength = isNaN(arcLength) ? Math.PI*.8 : arcLength;
		this.loadingTextFillStyle = "#CCCCCC";
		this.loadingText = "";
		this.lineWidth = 14;//stroke width of spinner in pixels
		this.frameRate = 25;
		this.velocity = .1;//expressed as a radian
		this.intervalId = -1;
		this.linearGradientStart = new SimpleGeometry.Point();
		this.linearGradientEnd = new SimpleGeometry.Point();
	};
	
	//subclass extends superclass
	SimpleLoaderGraphic.prototype = Object.create(SimpleGeometry.Circle.prototype);
	SimpleLoaderGraphic.prototype.constructor = SimpleGeometry.Circle;
	
	SimpleLoaderGraphic.prototype.startStrokeGradientColor = SimpleGeometry.getRgbaStyleString(0xCC, 0xCC, 0xCC, 0);
	//front gradient color of spinner, red, green and blue values from 0-255, alpha from 0-1
	SimpleLoaderGraphic.prototype.setStrokeStartColor = function(red, green, blue, alpha){
		this.startStrokeGradientColor = SimpleGeometry.getRgbaStyleString(red, green, blue, alpha);
	};
	
	SimpleLoaderGraphic.prototype.endStrokeGradientColor = SimpleGeometry.getRgbaStyleString(0xCC, 0xCC, 0xCC, 1);
	//front gradient color of spinner, red, green and blue values from 0-255, alpha from 0-1
	SimpleLoaderGraphic.prototype.setEndStartColor = function(red, green, blue, alpha){
		this.endStrokeGradientColor = SimpleGeometry.getRgbaStyleString(red, green, blue, alpha);
	};
	
	SimpleLoaderGraphic.prototype.play = function(){
		this.radian = 0;
		var _this = this;
		this.intervalId = setInterval(function(){_this.rotate();},this.frameRate);
	};
	
	//TODO : rename to stop
	SimpleLoaderGraphic.prototype.pause = function(){
		if(!isNaN(this.intervalId)){
			clearInterval(this.intervalId);
		}
		this.updateHandler = undefined;
		delete this.intervalId;
	};
	
	SimpleLoaderGraphic.prototype.rotate = function(){
		this.radian += this.velocity;
		this.radian = SimpleGeometry.constrainRadianTo2PI(this.radian);
		if(this.updateHandler){
			this.updateHandler();
		}
	};
	
	SimpleLoaderGraphic.prototype.render = function(context){
		//render spinner
		context.beginPath();
		this.linearGradientStart.x = this.x + Math.cos(this.radian) * (this.radius + 10);
		this.linearGradientStart.y = this.y + Math.sin(this.radian) * (this.radius + 10);
		this.linearGradientEnd.x = this.x + Math.cos(this.radian + this.arcLength) * (this.radius + 10);
		this.linearGradientEnd.y = this.y + Math.sin(this.radian + this.arcLength) * (this.radius + 10);

		var gradient = context.createLinearGradient(this.linearGradientStart.x, this.linearGradientStart.y, this.linearGradientEnd.x, this.linearGradientEnd.y);// linear gradient from start to end of line
		gradient.addColorStop(0, this.startStrokeGradientColor);
		gradient.addColorStop(1, this.endStrokeGradientColor);
		context.strokeStyle = gradient;
		
		context.lineWidth = this.lineWidth;
		context.lineCap = "round";

		context.arc(this.x, this.y, this.radius, this.radian, this.radian + this.arcLength);//x, y, radius, from, to

		context.stroke();
		context.closePath();
		
		//render text
		if(this.loadingText==""){
			return;
		}
		
		context.textBaseline = "top";
		context.fillStyle = this.loadingTextFillStyle;
		context.font = "30px 'sf_collegiate_solidregular'";
		var metrics = context.measureText(this.loadingText);
		context.fillText (this.loadingText, this.x - metrics.width/2, this.y+this.radius+this.lineWidth);
		
	};

	window.SimpleLoaderGraphic=SimpleLoaderGraphic;
	
}(window));



(function (window){


	ImageStore = function(){};
		
	ImageStore.prototype.loadImages = function(urls, completeCallback, updateCallback){
		this.urls = urls;
		this.completeCallback = completeCallback;
		this.updateCallback = updateCallback != undefined ? updateCallback : undefined;
		this.images = [];
		this.currentLoadIndex = 0;
		this.loadNextImage();
	};

	ImageStore.prototype.stop = function(){
		this.completeCallback = undefined;
		this.updateCallback = undefined;
		this.urls = [];
	};
	
	ImageStore.prototype.getProgressPercent = function(){
		return SimpleGeometry.normalize(this.currentLoadIndex, 0, this.urls.length);
	};
	
	ImageStore.prototype.getProgressString = function(){
		return this.currentLoadIndex+" / "+this.urls.length;
	};

	ImageStore.prototype.loadNextImage = function(){
		if(this.currentLoadIndex >= this.urls.length){
			//console.log("all images loaded");
			this.completeCallback();
			return;
		}
		//console.log("ImageStore.prototype.loadNextImage() : ",this.urls[this.currentLoadIndex]);
		var image = new Image();
		var _this = this;
		image.onload = function(){
			_this.imageLoadComplete();
		};

		var url = this.urls[this.currentLoadIndex];
		image.onerror = function(){
			alert("ImageStore ERROR : "+url+" could not be loaded.");
		};
		image.src = this.urls[this.currentLoadIndex];
		this.images.push(image);
		this.currentLoadIndex++;
	};
	
	ImageStore.prototype.imageLoadComplete = function(){
		//console.log("ImageStore.imageLoadComplete()");
		for(var i=0; i<this.images.length; i++){
			this.images[i].onload = undefined;
		}
		if(this.updateCallback != undefined){
			this.updateCallback();
		}
		this.loadNextImage();
	};

	window.ImageStore=ImageStore;
	
}(window));
(function (window){


	DSLightBox = function(beginOpenCallback, openCompleteCallback, beginCloseCallback, closeCompleteCallback, isMobile){
		this.beginOpenCallback = beginOpenCallback;
		this.openCompleteCallback = openCompleteCallback;
		this.beginCloseCallback = beginCloseCallback;
		this.closeCompleteCallback = closeCompleteCallback;
        this.isMobile = isMobile;
        //console.log("DSLightBoxConstructor : ",this.isMobile);
		
		this.contentDiv = document.createElement("div");
		this.overlayDiv = document.createElement("div");
		this.borderDiv = document.createElement("div");
		document.body.appendChild(this.contentDiv);
		document.body.appendChild(this.overlayDiv);
		document.body.appendChild(this.borderDiv);
		
		this.borderDiv.style.position =this.overlayDiv.style.position = this.contentDiv.style.position = "absolute";
		this.borderDiv.style.display =this.overlayDiv.style.display = this.contentDiv.style.display = "none";
		
		this.overlayDiv.style.backgroundColor = "black";
		this.overlayDiv.style.zIndex = 1000;
		var _this = this;
		this.overlayDiv.addEventListener("click",function(event){ _this.lightBoxOverlayDivClickHandler(event)}, false);
		
		this.borderDiv.style.backgroundColor = DSColors.GREEN;
		this.borderDiv.style.zIndex = 1001;
		
		this.contentDiv.style.backgroundColor = "white";
		this.contentDiv.style.zIndex = 1002;
		
		//close button
		this.closeButton = document.createElement("img");
		document.body.appendChild(this.closeButton);
        this.closeButtonOutHandler();
		this.closeButton.style.position = "absolute";
		this.closeButton.style.display = "none";
		this.closeButton.addEventListener('click', function(event){_this.lightBoxOverlayDivClickHandler(event)});
        this.closeButton.addEventListener("mouseover", function(){ _this.closeButtonOverHandler()});
        this.closeButton.addEventListener("mouseout", function(){ _this.closeButtonOutHandler()});
		this.closeButton.style.zIndex = 1003;
		this.overlayDiv.style.cursor = this.closeButton.style.cursor = "pointer";
		
		this.animator = new UnitAnimator();
		this.animator.setEasingFunction(UnitAnimator.easeOutSine);

		this.backgroundOpacity = .8;
		this.borderThickness = 4;

        //progress label
        this.progressLabel = document.createElement("p");
        this.progressLabel.className = "progressLabel";
        this.progressLabel.innerHTML = "HI!";
        this.progressLabel.style.display = "none";
	};

    DSLightBox.prototype.showLoadProgress = function(){
        this.progressLabel.style.display = "block";
    }

    DSLightBox.prototype.updateProgress = function(string){
        console.log("DSLightBox.udpdteProgress() : "+string);
        this.progressLabel.innerHTML = string;
    }

    DSLightBox.prototype.hideLoadProgress = function(){
        this.progressLabel.style.display = "none";
    }
	
	DSLightBox.prototype.lightBoxOverlayDivClickHandler = function (event){
		this.close(event);
	};
    DSLightBox.prototype.closeButtonOverHandler = function (){
        this.closeButton.src = "assets/closeButtonOver.png";
	};
    DSLightBox.prototype.closeButtonOutHandler = function (){
        this.closeButton.src = "assets/closeButton.png";
	};
	
	DSLightBox.prototype.setContent = function(content){
        if(content){
            this.contentDiv.appendChild(content);
        }
	};

    //TODO: this is a temporary hack to support small screen sizes, in which case content is not added using setContent
	DSLightBox.prototype.removeContent = function(content){
        try{
            this.contentDiv.removeChild(content);
        }catch(error){
            //nope
        }

	};
	
	DSLightBox.prototype.isOpen = function(){
		return this.contentDiv.style.display=="block"
	};
	
	DSLightBox.prototype.open = function(contentRect){
		this.contentRect = contentRect;
		
		var doc = document.documentElement, body = document.body;
		var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
		
		this.overlayDiv.style.left = "0px";
		this.overlayDiv.style.top = top + "px";
		this.overlayDiv.style.width = "100%";
		this.overlayDiv.style.height = "100%";
		
		this.borderDiv.style.left = (contentRect.x-this.borderThickness) + "px";
		this.borderDiv.style.top = top + (contentRect.y-this.borderThickness) + "px";
		this.borderDiv.style.width = (contentRect.width+this.borderThickness*2) + "px";
		this.borderDiv.style.height = (contentRect.height+this.borderThickness*2) + "px";
		
		this.contentDiv.style.left = contentRect.x + "px";
		this.contentDiv.style.top = top + contentRect.y + "px";
		this.contentDiv.style.width = contentRect.width + "px";
		this.contentDiv.style.height = contentRect.height + "px";

		this.borderDiv.style.opacity = this.contentDiv.style.opacity = this.overlayDiv.style.opacity = 0;		
		this.borderDiv.style.display = this.overlayDiv.style.display = this.contentDiv.style.display = "block";
		
		this.closeButton.style.left = (this.contentRect.getRight() - this.closeButton.width/2) + "px";
		this.closeButton.style.top = (top + this.contentRect.getBottom() - this.closeButton.height/2) + "px";

        this.progressLabel.style.top = this.contentRect.height/2;

        var _this = this;
        if(this.isMobile){
            this.animator.reset(90,30,function(){_this.fadeIn()} , function(){_this.openComplete()});
        }else{
            this.animator.reset(500,20,function(){_this.fadeIn()} , function(){_this.openComplete()});
        }
		this.animator.start();
        if(this.beginOpenCallback != undefined){
            this.beginOpenCallback();
        }
	};
	
	DSLightBox.prototype.fadeIn = function(){
		this.overlayDiv.style.opacity = this.animator.getAnimationPercent()*this.backgroundOpacity;
		this.contentDiv.style.opacity = this.animator.getAnimationPercent();
		this.borderDiv.style.opacity = this.animator.getAnimationPercent();
	};

    DSLightBox.prototype.openComplete = function(){
        //console.log("DSLightBox.openComplete()");
        if(this.animator && this.animator.isAnimating()){
            this.animator.pause();
        }
        this.overlayDiv.style.opacity = this.backgroundOpacity;
        if(this.openCompleteCallback != undefined){
            this.openCompleteCallback();
        }
        this.closeButton.style.display = "block";
    };



	
	DSLightBox.prototype.close = function(event){
        if(this.animator.isAnimating()){
            return;
        }
        this.fadeOutBeginRect = this.contentRect.clone();
        this.fadeOutTargetRect = new SimpleGeometry.Rectangle(event.pageX-25, event.pageY-25, 50, 50);
		this.closeButton.style.display = this.borderDiv.style.display = "none";
        if(this.isMobile){
            this.forceClose();
            return;
        }
		var _this = this;
		this.animator.reset(500,20,function(){_this.fadeOut()} , function(){_this.closeComplete()});
		this.animator.start();
		if(this.beginCloseCallback != undefined){
			this.beginCloseCallback();
		}
	};

    DSLightBox.prototype.fadeOut = function(){
        this.overlayDiv.style.opacity = (1-this.animator.getAnimationPercent())*this.backgroundOpacity;
        this.contentDiv.style.opacity = 1-this.animator.getAnimationPercent();

        this.contentRect.width = SimpleGeometry.interpolate(this.animator.getAnimationPercent(), this.fadeOutBeginRect.width, this.fadeOutTargetRect.width );
        this.contentRect.height = SimpleGeometry.interpolate(this.animator.getAnimationPercent(), this.fadeOutBeginRect.height, this.fadeOutTargetRect.height );
        this.contentRect.x = SimpleGeometry.interpolate(this.animator.getAnimationPercent(), this.fadeOutBeginRect.x, this.fadeOutTargetRect.x );
        this.contentRect.y = SimpleGeometry.interpolate(this.animator.getAnimationPercent(), this.fadeOutBeginRect.y, this.fadeOutTargetRect.y );
        this.contentDiv.style.left = Math.round(this.contentRect.x)+"px";
        this.contentDiv.style.top = Math.round(this.contentRect.y)+"px";
        this.contentDiv.style.width = Math.round(this.contentRect.width)+"px";
        this.contentDiv.style.height = Math.round(this.contentRect.height)+"px";
    };

	DSLightBox.prototype.closeComplete = function(){
		//console.log("DSLightBox.closeComplete()");
		this.closeButton.style.display = this.borderDiv.style.display = this.overlayDiv.style.display = this.contentDiv.style.display = "none";
		if(this.closeCompleteCallback != undefined){
			this.closeCompleteCallback();
		}
	};
	
	//on resize, no animation
	DSLightBox.prototype.forceClose = function(){
		if(this.beginCloseCallback != undefined){
			this.beginCloseCallback();
		}
		this.animator.pause();
		this.closeComplete();
	};

	window.DSLightBox=DSLightBox;
	
}(window));



(function (window){

	//================::ABSTRACT DEMO::===================

	var AbstractDemo = function(x, y, width, height, demoContainer){
		SimpleGeometry.Rectangle.call(this,x,y,width,height); //call super constructor.
		this.demoContainer = demoContainer;
		this.customCaptureControls = false;
		this.captureFrameRate = 300; //frames for generated gifs are captured at this rate
		this.gifPlaybackFrameRate = 100;//generated gifs play at this speed
        if(!demoContainer){
            console.log("AbstractDemo constructor, no demo container, cannot setUpDemo()");
            return;
        }
		this.setUpDemo();
	};
	
	//subclass extends superclass
	AbstractDemo.prototype = Object.create(SimpleGeometry.Rectangle.prototype);
	AbstractDemo.prototype.constructor = SimpleGeometry.Rectangle;

	//subclasses override this incase of custom set ups (additional canvas etc.)
	AbstractDemo.prototype.preSetUp = function(){};

	//subclasses override this incase of custom set ups
	AbstractDemo.prototype.setUpDemo = function(){
		this.preSetUp();
		this.animator = new UnitAnimator();
		this.animator.setEasingFunction(UnitAnimator.easeOutSine);
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.width; 
		this.canvas.height = this.height;
		this.context2d = this.canvas.getContext("2d");
		this.appendCanvas(this.canvas);
	};
	
	AbstractDemo.prototype.appendCanvas = function(canvas) {
		canvas.style.position = "absolute";
		canvas.style.left = "0px";
		canvas.style.top = "0px";
		this.demoContainer.appendChild(canvas);
	};
	
	AbstractDemo.prototype.getGlobalDemoPosition = function () {
        var point = new SimpleGeometry.Point(0, 0);
        var element = this.canvas;
        while (element) {
            if (element.style && element.style.left && element.style.top) {
                point.x += parseInt(element.style.left.split("px")[0]);
                point.y += parseInt(element.style.top.split("px")[0]);
            }
            element = element.parentNode;
        }
        return point;
    };
	
	//override in demos where multiple canvases are used, return canvases in correct stack z-sort order
	AbstractDemo.prototype.getCaptureCanvases = function(){
		return [this.canvas];
	};
	
	AbstractDemo.prototype.run = function(){
		this.clear();	
	};
	
	AbstractDemo.prototype.clear = function(){
		this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
	};
	
	AbstractDemo.prototype.loadImagesWithImageStore = function(urls){
		this.imageStore = new ImageStore();
		var _this = this;
		this.imageStore.loadImages(urls, function(){_this.imageStoreLoadComplete();} , function(){_this.imageStoreLoadProgress();});
		this.spinner = new SimpleLoaderGraphic(this.width / 2, this.height / 2, 25, function(){_this.updateSpinner();});
		this.spinner.play();		
	};
	
	AbstractDemo.prototype.imageStoreLoadProgress = function (){
		//console.log("AbstractDemo.imageStoreLoadProgress ",this.imageStore.getProgressString() );
		this.spinner.loadingText = "Loading images "+this.imageStore.getProgressString();
	};
	
	AbstractDemo.prototype.updateSpinner = function(){
		this.clear();
		this.spinner.render(this.context2d);
	};
		
	AbstractDemo.prototype.imageStoreLoadComplete = function(){
		//console.log("AbstractDemo.imageStoreLoadComplete()");
		this.clear();
		this.spinner.pause();
		delete this.spinner;
		this.useLoadedImageStoreImages();
	};
	
	AbstractDemo.prototype.useLoadedImageStoreImages = function(){
		console.log("AbstractDemo.useLoadedImageStoreImages(), this must be overridden in subclasses");
	};
	
	//delete any instances, remove any listeners / callbacks
	AbstractDemo.prototype.tearDown = function(){
		//console.log("AbstractDemo.teardown()");
		if(this.animator){
			this.animator.pause();
			delete this.animator;
		}
		if(this.imageStore){
			this.imageStore.stop();
			delete this.imageStore;
		}
		if(this.spinner){
			this.spinner.pause();
			delete this.spinner;
		}
		this.demoContainer.removeChild(this.canvas);
		delete this.context2d;
		delete this.canvas;
		this.customTearDown();
	};
	
	AbstractDemo.prototype.customTearDown = function(){
		//console.log("AbstractDemo.customTearDown()");
	};
	
	AbstractDemo.prototype.startCustomCaptureAnimation = function(){
		console.log("AbstractDemo.prototype.startCustomCaptureAnimation() must be overriden by subclasses");
	};
	
	AbstractDemo.prototype.animationComplete = function(){
		if(this.captureCompleteCallBack){
			this.captureCompleteCallBack();
		}
	};

	window.AbstractDemo = AbstractDemo;
	
}(window));

//===============================::GENERAL METHODS::===========================

//TODO : move to DSUtils.js

//==============::GA::====================================
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-44531934-1', 'devstate.net');

if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
    ga('send', 'pageview');
}
//==============::GA::====================================

function resizeHandler(){
	forceHideDemo();
    lightBox.isMobile = isMobile();
}

function viewportSize() {
    var e = window, a = 'inner';
    if ( !( 'innerWidth' in window ) ) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}

function isHorizontalLayout(){
    var size = viewportSize();
    return size.width > size.height;
}

//http://stackoverflow.com/questions/1005153/auto-detect-mobile-browser-via-user-agent
//not 100% sure this will work...
function isMobile() {
    //console.log("BCHWMemoryGame.isMobile()", navigator.appVersion );
    var size = viewportSize();
    return navigator.appVersion.toLowerCase().indexOf("mobile") > -1 || Math.min(size.width, size.height)<400;//TODO: 400 is arbitrary number...
}

function getNodeValue(node, nodeName){
    var child = node.getElementsByTagName(nodeName)[0];
    if(!child){
        return "";
    }
    if(!child || !child.childNodes || ! child.childNodes[0] || !child.childNodes[0].nodeValue){
        return "";
    }
    return child.childNodes[0].nodeValue;
}

//===============================::DEMOS / LIGHTBOX::===========================

function forceHideDemo(){
	if(!lightBox==undefined && lightBox.isOpen()){
		hideDemo(true);
	}
}

function lightBoxOverlayDivClick(){
	hideDemo();
}

function lightBoxNextDemoClickHandler(){
	tearDownDemo();
    demoNavigationModel.navigateToNext();
	loadCurrentDemo();
	location.hash = demoNavigationModel.currentDemoResource.name;
	if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
		ga("send", "event", "nextDemo");
	}
}

function lightBoxPreviousDemoClickHandler(){
	tearDownDemo();
    demoNavigationModel.navigateToPrevious();
	loadCurrentDemo();
	location.hash = demoNavigationModel.currentDemoResource.name;
	if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
		ga("send", "event", "previousDemo");
	}
}

function lightBoxResetDemoClickHandler(){
	tearDownDemo();
	loadCurrentDemo();
	if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
		ga("send", "event", "resetDemo", demoNavigationModel.currentDemoResource.name);
	}
}

function lightBoxSubMenuClickHandler(demoName){
    tearDownDemo();
    demoNavigationModel.navigateToDemoByName(demoName);
    loadCurrentDemo();
}

//TODO : these should be renamed to lighbox proportions or so (lightBoxLongSide, lightBoxShortSide)
var lightBoxLongSide = 700;
var lightBoxShortSide = 400;
var lightBoxVerticalLayoutHeight = 600;

//TODO: this is a temporary solution to support devices.  Some hardcoded features (text sizes etc.) need to be made dynamic for the lightbox size to be dynamic
var smallDemoSize = 300;
var largeDemoSize = 400;

var mainScope = this;
var classLoader;
var demoNavigationModel;

var detailsDiv;
var demoRect;
var contentRect;


function openDemoLightBox(){
	var size = viewportSize();
	contentRect = new SimpleGeometry.Rectangle();
    if(size.width>largeDemoSize && size.height>largeDemoSize){
        demoRect = new SimpleGeometry.Rectangle(0,0,largeDemoSize,largeDemoSize);
    }else{
        demoRect = new SimpleGeometry.Rectangle(0,0,smallDemoSize,smallDemoSize);
    }

    var lightBoxScale = demoRect.width/lightBoxShortSide;
	if(isHorizontalLayout()){
		//horizontal layout
        contentRect.width = lightBoxLongSide*lightBoxScale;
        contentRect.height = lightBoxShortSide*lightBoxScale;
        //show only demo on smaller screens
        if(size.width<contentRect.width){
            contentRect.width = smallDemoSize;
        }
	}else{
		//vertical layout
        contentRect.width = lightBoxShortSide*lightBoxScale;
        contentRect.height = lightBoxVerticalLayoutHeight*lightBoxScale;
        //show only demo on smaller screens
        if(size.height<contentRect.height){
            contentRect.height = smallDemoSize;
        }
	}

    contentRect.x = size.width/2 - contentRect.width/2;
    contentRect.y = size.height/2 - contentRect.height/2;

    if(size.width < contentRect.width || size.height < contentRect.height){
        //TODO : find a better solution for this
        alert("Sorry, your screen or resolution is too small("+size.width+"x"+size.height+") to show this demo");
        if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
            ga("send", "event", "screenTooSmall", size.width+"x"+size.height);
        }
        return;
    }

	lightBox.open(contentRect);
}

function loadCurrentDemo(){
    classLoader.loadDemo(demoNavigationModel.currentDemoResource, demoJSLoadHandler, demoJSLoadErrorHandler, demoJSLoadUpdateHandler);
    lightBox.showLoadProgress();
}

function demoJSLoadUpdateHandler(string){
    lightBox.updateProgress(string);
}

function getDemoToolTip(demoResource){
    //console.log("getDemoToolTip(demoResource)", demoResource.toolTip));
    return contentRect.width < largeDemoSize ? "" : demoResource.toolTip;
}

function getLightBoxDemoTitle(demoResource){
    //console.log("getLightBoxDemoTitle(demoResource)", demoResource.shortName, demoResource.name);
    return (demoRect.width<largeDemoSize && demoResource.shortName!="") ? demoResource.shortName : demoResource.name;
}

//TODO : merge with getLightBoxDemoTitle
function getDemoBoxTitleStyle(){
    return isHorizontalLayout() ? "demoTitle" : "demoTitleThin";
}

function getResetString(){
    //return contentRect.width < largeDemoSize ? demo.toolTipShort : demo.toolTip;
    return contentRect.height < largeDemoSize ? "F5" : "Reset";
}

function smallSize(){
    return contentRect.width==smallDemoSize && contentRect.height==smallDemoSize;
}

function demoJSLoadHandler(){
    lightBox.hideLoadProgress();
    currentDemo = new mainScope[(demoNavigationModel.currentDemoResource.name+"Demo")](demoRect.x, demoRect.y, demoRect.width, demoRect.height, lightBox.contentDiv);
    //var demoNode = demosXML.getElementById(demoNavigationModel.currentDemoResource); //wtf, Firefox doesn't support getElementById on xml documents?!
    //console.log("demoJSLoadHandler", demoNode, demoNavigationModel.currentDemoResource);
    currentDemo.run();
    var padding = 10;
    detailsDiv = document.createElement("div");
    detailsDiv.style.position = "absolute";
    if(isHorizontalLayout()){
        detailsDiv.style.left = (padding+demoRect.width)+"px";
        detailsDiv.style.top = padding+"px";
        detailsDiv.style.width = (contentRect.width-demoRect.width-padding*2) + "px";
        detailsDiv.style.height = (contentRect.height-padding*2) + "px";
    }else{
        detailsDiv.style.left = padding+"px";
        detailsDiv.style.top = (padding+demoRect.height)+"px";
        detailsDiv.style.width = (contentRect.width-padding*2) + "px";
        detailsDiv.style.height = (contentRect.height-demoRect.height-padding*2) + "px";
    }
    detailsDiv.style.fontFamily = "Sans-serif";
    var detailsHtml = "<h2 class='"+getDemoBoxTitleStyle()+"' >"+getLightBoxDemoTitle(demoNavigationModel.currentDemoResource)+"</h2>";
    detailsHtml += "<p style='padding-top:20px'>"+getDemoToolTip(demoNavigationModel.currentDemoResource)+"</p>";
    var subMenu = demoNavigationModel.getCurrentNavigationItem();
    if(subMenu.length > 1){
        detailsHtml +="<p class='lightboxSubMenu' >";
        for(var i=0; i< subMenu.length; i++){
            detailsHtml +="<a href = 'javascript:void(0)' onclick = 'lightBoxSubMenuClickHandler(\""+subMenu[i].name+"\")'>"+subMenu[i].name+"</a>";
        }
        detailsHtml +="</p>";
    }
    detailsHtml +="<p class='lightboxControls' ><a href = 'javascript:void(0)' onclick = 'lightBoxPreviousDemoClickHandler(event)'>Previous</a>";
    detailsHtml +="<a href = 'javascript:void(0)' onclick = 'lightBoxResetDemoClickHandler()' style='padding-left:20px'>"+getResetString()+"</a>";
    detailsHtml +="<a href = 'javascript:void(0)' onclick = 'lightBoxNextDemoClickHandler()' style='padding-left:20px'>Next</a></p>";
    detailsDiv.innerHTML = detailsHtml;
    lightBox.setContent(smallSize() ? undefined : detailsDiv);
    if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
        ga("send", "event", "DemoView", demoNavigationModel.currentDemoResource);
    }
}

function demoJSLoadErrorHandler(){
    console.log("demoJSLoadErrorHandler()");
}

function tearDownDemo(){
	if(currentDemo){
		currentDemo.tearDown();
	}
	if(detailsDiv){
		lightBox.removeContent(detailsDiv);
	}
}

function hideDemo(forceClose){
	if(forceClose){
		lightBox.forceClose();
	}else{
		lightBox.close();
	}
}

function lightBoxOpenComplete(){
	loadCurrentDemo(demoNavigationModel.currentDemoResource);
}

function lightBoxBeginClose(){
	tearDownDemo();
	location.hash="";
}



//========================:: DEMOS MENU RELATED ::==============================

function demoLinkClickHandler(event){
    var demoName = getDemoNameFromHash(event.currentTarget.hash);
    demoNavigationModel.navigateToDemoByName(demoName);
    openDemoLightBox();
}

//TODO : these two seem a bit risky...
function showGif(event){
    if(isMobile()){
        return;
    }
	var path = event.target.src.split("/");
	var file = path[path.length-1].split(".png")[0];
	path[path.length-1] = file+".gif";
	event.target.src = path.join("/");
}

function showPng(event){
    if(isMobile()){
        return;
    }
	var path = event.target.src.split("/");
	var file = path[path.length-1].split(".gif")[0];
	path[path.length-1] = file+".png";
	event.target.src = path.join("/");
}

function getDemoNameFromHash(hash){
	return hash.split("#")[1];
}


function buildDemosMenu(demosXML){
    var menuItems = demosXML.getElementsByTagName( "menuItem");
    var demosHtml = "";
    var demo;
    for(var i = 0 ; i < menuItems.length; i++){
        demo = menuItems[i].getElementsByTagName("demo")[0];
        demosHtml += '<div class="item">';
        demosHtml += '<a href="#'+demo.getAttribute("id")+'" onclick = "demoLinkClickHandler(event)">';
        demosHtml += '<img src="assets/demoThumbnails/'+getNodeValue(demo,"thumb")+'.png" onmouseover="showGif(event)" onmouseout="showPng(event)">';
        demosHtml += '</a>';
        demosHtml += '</div>';
    }
    demosHtml += '<div class="clearfix"></div>';
    document.getElementById("demos").innerHTML = demosHtml;
}


//========================:: STARTUP ::==============================

function init(){
	//console.log("init()");
    var demosXMLSource = document.getElementById("demosMenuXML").textContent;
    var parser = new DOMParser();
    var demosXML = parser.parseFromString(demosXMLSource, "application/xml");

    var menuItems = demosXML.getElementsByTagName("menuItemNode");

    demoNavigationModel = new DemoNavigationModel(demosXML);
    classLoader = new DSClassLoader();

    buildDemosMenu(demosXML);
	lightBox = new DSLightBox(undefined, lightBoxOpenComplete, lightBoxBeginClose, undefined, isMobile());

    window.onscroll = function () {
        forceHideDemo();
    }

	if(!window.location.hash) {
		return;
	}
	var demoName = getDemoNameFromHash(window.location.hash);
	if(demoNavigationModel.getDemoResourceByName(demoName)){
        lastClickedDemoName = demoName;
		openDemoLightBox(demoName);
	}
}

var readyStateCheckInterval = setInterval( function() {
	if (document.readyState === "complete") {
		//mailNode = document.getElementById( "subscriber" );
        clearInterval(readyStateCheckInterval);
		init();
    }
}, 10);