
//===============================::GENERAL METHODS::===========================

//TODO : move to DSUtils.js

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
    var demoName = classManager.getNextDemoName();
	setUpDemo(demoName);
	location.hash = demoName;
	if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
		ga("send", "event", "nextDemo");
	}
}

function lightBoxPreviousDemoClickHandler(){
	tearDownDemo();
    var demoName = classManager.getPreviousDemoName();
	setUpDemo(demoName);
	location.hash = demoName;
	if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
		ga("send", "event", "previousDemo");
	}
}

function lightBoxResetDemoClickHandler(){
	tearDownDemo();
	setUpDemo(classManager.currentDemoName);
	if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
		ga("send", "event", "resetDemo", classManager.currentDemoName);
	}
}

function lightBoxSubMenuClickHandler(demoName){
    tearDownDemo();
    setUpDemo(demoName);
}

//TODO : these should be renamed to lighbox proportions or so (lightBoxLongSide, lightBoxShortSide)
var lightBoxLongSide = 700;
var lightBoxShortSide = 400;
var lightBoxVerticalLayoutHeight = 600;

//TODO: this is a temporary solution to support devices.  Some hardcoded features (text sizes etc.) need to be made dynamic for the lightbox size to be dynamic
var smallDemoSize = 300;
var largeDemoSize = 400;

var mainScope = this;
var demosXML;
var classManager;
var currentDemo;
var lastClickedDemoName;//this isn't the greatest, try to remove or find a more elegant solution
var detailsDiv;
var demoRect;
var contentRect;


function showDemo(){
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
    /*
    console.log("showDemo()", demoName);
    console.log("size : ", size.width, size.height);
    console.log(contentRect.toString());*/

    if(size.width < contentRect.width || size.height < contentRect.height){
        //TODO : find a slightly better solution for this, maybe use
        alert("Sorry, your screen or resolution is too small("+size.width+"x"+size.height+") to show this demo");
        if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
            ga("send", "event", "screenTooSmall", size.width+"x"+size.height);
        }
        return;
    }

	lightBox.open(contentRect);
}

function setUpDemo(demoName){
    classManager.loadDemo(demoName, demoJSLoadHandler, demoJSLoadErrorHandler, demoJSLoadUpdateHandler);
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
    currentDemo = new mainScope[(classManager.currentDemoName+"Demo")](demoRect.x, demoRect.y, demoRect.width, demoRect.height, lightBox.contentDiv);
    //var demoNode = demosXML.getElementById(classManager.currentDemoName); //wtf, Firefox doesn't support getElementById on xml documents?!
    var demoResource = classManager.getDemoResourceByName(classManager.currentDemoName);
    //console.log("demoJSLoadHandler", demoNode, classManager.currentDemoName);
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
    var detailsHtml = "<h2 class='"+getDemoBoxTitleStyle()+"' >"+getLightBoxDemoTitle(demoResource)+"</h2><p style='padding-top:20px'>"+getDemoToolTip(demoResource)+"</p>";
    var subMenu = classManager.getSubmenuForDemoName(classManager.currentDemoName);
    if(subMenu.length > 0){
        detailsHtml +="<p class='lightboxSubMenu' >";
        for(var i=0; i< subMenu.length; i++){
            detailsHtml +="<a href = 'javascript:void(0)' onclick = 'lightBoxSubMenuClickHandler(\""+subMenu[i]+"\")'>"+subMenu[i]+"</a>";
        }
        detailsHtml +="</p>";
    }
    detailsHtml +="<p class='lightboxControls' ><a href = 'javascript:void(0)' onclick = 'lightBoxPreviousDemoClickHandler(event)'>Previous</a>";
    detailsHtml +="<a href = 'javascript:void(0)' onclick = 'lightBoxResetDemoClickHandler()' style='padding-left:20px'>"+getResetString()+"</a>";
    detailsHtml +="<a href = 'javascript:void(0)' onclick = 'lightBoxNextDemoClickHandler()' style='padding-left:20px'>Next</a></p>";
    detailsDiv.innerHTML = detailsHtml;
    lightBox.setContent(smallSize() ? undefined : detailsDiv);
    if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
        ga("send", "event", "DemoView", classManager.currentDemoName);
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
	setUpDemo(lastClickedDemoName);
}

function lightBoxBeginClose(){
	tearDownDemo();
	location.hash="";
}


function demoLinkClickHandler(event){
    lastClickedDemoName = getDemoFromHash(event.currentTarget.hash);
    showDemo(lastClickedDemoName);
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

function getDemoFromHash(hash){
	return hash.split("#")[1];
}


function buildDemosMenu(){
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


function init(){
	//console.log("init()");
    var demosXMLSource = document.getElementById("demosMenuXML").textContent;
    var parser = new DOMParser();
    demosXML = parser.parseFromString(demosXMLSource, "application/xml");

    classManager = new DSClassManager(demosXML);

    buildDemosMenu();
	lightBox = new DSLightBox(undefined, lightBoxOpenComplete, lightBoxBeginClose, undefined, isMobile());
    window.onscroll = function () {
        forceHideDemo();
    }

	if(!window.location.hash) {
		return;
	}
	var demoName = getDemoFromHash(window.location.hash);
	if(classManager.getDemoResourceByName(demoName)){
        lastClickedDemoName = demoName;
		showDemo(demoName);
	}
}

var readyStateCheckInterval = setInterval( function() {
	if (document.readyState === "complete") {
		//mailNode = document.getElementById( "subscriber" );
        clearInterval(readyStateCheckInterval);
		init();
    }
}, 10);