
//===============================::SUBSCRIBE::===========================

var mailNode;

function checkEmail( emailAddress ) {

  var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
  var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
  var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
  var sQuotedPair = '\\x5c[\\x00-\\x7f]';
  var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
  var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
  var sDomain_ref = sAtom;
  var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
  var sWord = '(' + sAtom + '|' + sQuotedString + ')';
  var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
  var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
  var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
  var sValidEmail = '^' + sAddrSpec + '$'; // as whole string

  var reValidEmail = new RegExp(sValidEmail);
  
  if (reValidEmail.test(emailAddress)) {
    return true;
  }
  return false;
}


function transfer() {
	var userMail = document.getElementById("mailField").value;
	if ( checkEmail( userMail ) ) {
		 var formData = new FormData();
		 formData.append( 'ml', document.getElementById("mailField").value );
		 var xhr = new XMLHttpRequest();
		 xhr.open('POST','./subscribe.php');
		 xhr.onload = function() {
			if( this.status == 200 ) {
			    mailNode.innerHTML = 'SUBSCRIBE & STAY INFORMED:&nbsp;<input type="text" name="eMail" id="mailField" /><a href="javascript:transfer();">&nbsp;Submit.</a>&nbsp;<font color="#FF0000">THANK YOU!</font> ';	
			}
		 }
		 xhr.send( formData );
	} else {
		alert( 'You must be kidding! \nThats not a valid mailaddress at all...\n;)' );
	}
}


//===============================::DEMOS / LIGHTBOX::===========================


var demos;
var currentDemo;
var currentDemoName;
var detailsDiv;
var demoRect;
var contentRect;

var lightBoxMaxWidth = 700;
var lightBoxMaxHeight = 400;
var lightBoxMinWidth = 400;
var lightBoxMinHeight = 400;

function resizeHandler(){
	forceHideDemo();
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
}

function lightBoxPreviousDemoClickHandler(){
	var index = demos.indexOf(currentDemoName);
	index = index > 0 ? index-1 : demos.length-1;
	tearDownDemo();
	setUpDemo(demos[index]);
	location.hash=demos[index];
}

function showDemo(demoName){
	var size = viewportSize();
	console.log(size.width);
	contentRect = new SimpleGeometry.Rectangle();
	demoRect = new SimpleGeometry.Rectangle(0,0,400,400);
	if(size.width < lightBoxMaxWidth || size.height < lightBoxMinHeight){
		//TODO : find a slightly better solution for this ;)
		alert("Sorry, your screen is too small :(");
		return;
	}
	if(size.width > lightBoxMaxWidth && size.height > lightBoxMaxHeight){
		contentRect.x = size.width/2 - lightBoxMaxWidth/2;
		contentRect.y = size.height/2 - lightBoxMaxHeight/2;
		contentRect.width = lightBoxMaxWidth;
		contentRect.height = lightBoxMaxHeight;
	}else{
		//scale down
		//decide whether to show title, description etc.
	}
	currentDemoName = demoName;
	lightBox.open(contentRect);
}

function setUpDemo(demoName){
	currentDemoName = demoName;
	currentDemo = new this[demoName+"Demo"](demoRect.x, demoRect.y, demoRect.width, demoRect.height, lightBox.contentDiv);
	currentDemo.run();
	var padding = 10;
	detailsDiv = document.createElement("div");
	detailsDiv.style.position = "absolute";
	detailsDiv.style.left = (padding+demoRect.width)+"px";
	detailsDiv.style.top = padding+"px";
	detailsDiv.style.width = (contentRect.width-demoRect.width-padding*2) + "px";
	detailsDiv.style.height = (contentRect.height-padding*2) + "px";
	detailsDiv.style.fontFamily = "Sans-serif";
	var detailsHtml = "<h2 class='demoTitle' >"+demoName+"</h2><p style='padding-top:20px'>"+currentDemo.toolTip+"</p>";
	detailsHtml +="<p style='padding-top:20px'><a href = 'javascript:void(0)' onclick = 'lightBoxPreviousDemoClickHandler()'>Previous</a>";
	detailsHtml +="<a href = 'javascript:void(0)' onclick = 'hideDemo()' style='padding-left:20px'>Close</a>";
	detailsHtml +="<a href = 'javascript:void(0)' onclick = 'lightBoxNextDemoClickHandler()' style='padding-left:20px'>Next</a></p>";
	detailsDiv.innerHTML = detailsHtml;
	lightBox.setContent(detailsDiv);
	if(location.hostname && location.hostname.toLowerCase().indexOf("devstate")>-1){
		ga("send", "event", "DemoView", demoName);
	}
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
	demos = new Array();
	var list = document.getElementById("demos");
	var anchors = list.getElementsByTagName("a");
	var images = list.getElementsByTagName("img");
	for(var i = 0 ; i < anchors.length; i++){
		anchors[i].onclick = demoLinkClickHandler;
		demos[i] = getDemoFromHash(anchors[i].hash);
		images[i].onmouseover = showGif;
		images[i].onmouseout = showPng;
	}
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
	setUpDemosMenu();
	lightBox = new DSLightBox(undefined, lightBoxOpenComplete, lightBoxBeginClose);
	if(!window.location.hash) {
		return;
	}
	var demoName = getDemoFromHash(window.location.hash);
	if(demos.indexOf(demoName)>-1){
		showDemo(demoName);
	}
	window.onscroll = function (oEvent) {
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