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