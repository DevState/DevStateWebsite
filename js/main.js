
//===============================::DEMOS / LIGHTBOX::===========================

var classManager;
var demos;
var currentDemo;
var currentDemoName;
var detailsDiv;
var demoRect;
var contentRect;

function resizeHandler(){
	forceHideDemo();
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


function forceHideDemo(){
	if(lightBox.isOpen()){
		hideDemo(true);
	}
}

function lightBoxOverlayDivClick(){
	hideDemo();
}

function lightBoxNextDemoClickHandler(){
	var index = demos.indexOf(currentDemoName);
	index = index < demos.length-1 ? index+1 : 0;
	tearDownDemo();
	setUpDemo(demos[index]);
	location.hash=demos[index];
	if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
		ga("send", "event", "nextDemo");
	}
}

function lightBoxPreviousDemoClickHandler(){
	var index = demos.indexOf(currentDemoName);
	index = index > 0 ? index-1 : demos.length-1;
	tearDownDemo();
	setUpDemo(demos[index]);
	location.hash=demos[index];
	if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
		ga("send", "event", "previousDemo");
	}
}

function lightBoxResetDemoClickHandler(){
	tearDownDemo();
	setUpDemo(currentDemoName);
	if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
		ga("send", "event", "resetDemo", currentDemoName);
	}
}

function lightBoxSubMenuClickHandler(demoName){
    tearDownDemo();
    setUpDemo(demoName);
}

var lightBoxWidth = 700;
var lightBoxHeight = 400;
var lightBoxVerticalLayoutHeight = 600;
var demoSize = 400;

function showDemo(demoName){
	var size = viewportSize();
	contentRect = new SimpleGeometry.Rectangle();
	demoRect = new SimpleGeometry.Rectangle(0,0,demoSize,demoSize);
	if(size.width < lightBoxWidth && size.height < lightBoxWidth){
		//TODO : find a slightly better solution for this, maybe use
		alert("Sorry, your screen is too small to show this demo :(");
		return;
	}
	
	if(isHorizontalLayout()){
		//horizontal layout
		contentRect.x = size.width/2 - lightBoxWidth/2;
		contentRect.y = size.height/2 - lightBoxHeight/2;
		contentRect.width = lightBoxWidth;
		contentRect.height = lightBoxHeight;
	}else{
		//vertical layout
		contentRect.x = size.width/2 - lightBoxHeight/2;
		contentRect.y = size.height/2 - lightBoxWidth/2;
		contentRect.width = lightBoxHeight;
		contentRect.height = lightBoxVerticalLayoutHeight;
	}
	currentDemoName = demoName;
	lightBox.open(contentRect);
}

var currentDemoClass;

function setUpDemo(demoName){
	currentDemoName = demoName;
    currentDemoClass = this[(currentDemoName+"Demo")];
    classManager.loadDemo(currentDemoName, demoJSLoadHandler, demoJSLoadErrorHandler);
}

function demoJSLoadHandler(){
    currentDemo = new currentDemoClass(demoRect.x, demoRect.y, demoRect.width, demoRect.height, lightBox.contentDiv);
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
    var detailsHtml = "<h2 class='demoTitle' >"+currentDemoName+"</h2><p style='padding-top:20px'>"+currentDemo.toolTip+"</p>";
    if(currentDemo.subMenu.length>0){
        detailsHtml +="<p class='lightboxSubMenu' >";
        for(var i=0; i< currentDemo.subMenu.length; i++){
            detailsHtml +="<a href = 'javascript:void(0)' onclick = 'lightBoxSubMenuClickHandler(\""+currentDemo.subMenu[i]+"\")'>"+currentDemo.subMenu[i]+"</a>";
        }
        detailsHtml +="</p>";
    }
    detailsHtml +="<p class='lightboxControls' ><a href = 'javascript:void(0)' onclick = 'lightBoxPreviousDemoClickHandler(event)'>Previous</a>";
    detailsHtml +="<a href = 'javascript:void(0)' onclick = 'lightBoxResetDemoClickHandler()' style='padding-left:20px'>Reset</a>";
    detailsHtml +="<a href = 'javascript:void(0)' onclick = 'lightBoxNextDemoClickHandler()' style='padding-left:20px'>Next</a></p>";
    detailsDiv.innerHTML = detailsHtml;
    lightBox.setContent(detailsDiv);
    if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
        ga("send", "event", "DemoView", demoName);
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
	setUpDemo(currentDemoName);
}

function lightBoxBeginClose(){
	tearDownDemo();
	location.hash="";
}

function setUpDemosMenu(){
	demos = [];
    var demosHtml = "";
    var demo;
	for(var i = 0 ; i < classManager.demos.length; i++){
        demo = classManager.demos[i];
        if(!demo.includeInMenu){
            continue;
        }
        demos[i] = demo.name;
        demosHtml += '<div class="item">';
        demosHtml += '<a href="#'+demo.name+'" onclick = "demoLinkClickHandler(event)">';
        demosHtml += '<img src="'+demo.thumbnail+'" onmouseover="showGif(event)" onmouseout="showPng(event)">';
        demosHtml += '</a>';
        demosHtml += '</div>';
	}
    demosHtml += '<div class="clearfix"></div>';
    document.getElementById("demos").innerHTML = demosHtml;
}

function showGif(event){
	var path = event.target.src.split("/");
	var file = path[path.length-1].split(".png")[0];
	path[path.length-1] = file+".gif";
	event.target.src = path.join("/");
}

function showPng(event){
	var path = event.target.src.split("/");
	var file = path[path.length-1].split(".gif")[0];
	path[path.length-1] = file+".png";
	event.target.src = path.join("/");
}

function getDemoFromHash(hash){
	return hash.split("#")[1];
}

function demoLinkClickHandler(event){
	showDemo(getDemoFromHash(event.currentTarget.hash));
}

function init(){
	//console.log("init()");
    classManager = new DSClassManager();
	setUpDemosMenu();
	lightBox = new DSLightBox(undefined, lightBoxOpenComplete, lightBoxBeginClose);
	if(!window.location.hash) {
		return;
	}
	var demoName = getDemoFromHash(window.location.hash);
	if(demos.indexOf(demoName)>-1){
		showDemo(demoName);
	}
	window.onscroll = function () {
		forceHideDemo();
	}
}

var readyStateCheckInterval = setInterval( function() {
	if (document.readyState === "complete") {
		mailNode = document.getElementById( "subscriber" );
		init();
        clearInterval(readyStateCheckInterval);
    }
}, 10);