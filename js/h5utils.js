

////////////////////////////////////////////////////////////////////////////////
// general screen functions
////////////////////////////////////////////////////////////////////////////////

/* check viewport (browser inner rect/screen) resolution */
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


////////////////////////////////////////////////////////////////////////////////
// function functions
////////////////////////////////////////////////////////////////////////////////

/* check if function exists */
 function funcExists( funcName ) {

	if( typeof funcName == 'function' ) {
		
		 return true;
		
	}
	
	return false;
	
 }
 

////////////////////////////////////////////////////////////////////////////////
// loaders
////////////////////////////////////////////////////////////////////////////////

/* (re)load scripts dynamically */
function loadScript( url, callback ) {

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}


function loadChainedScript( url, callback, cnt ) {

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback(cnt);
            }
        };
    } else {  //Others
        script.onload = function(){
            callback(cnt);
        };
    }

    script.src = url;
	
	var parent = document.getElementsByTagName('head').item(0) || document.documentElement;
	parent.appendChild(script);
    
}


////////////////////////////////////////////////////////////////////////////////
// div/node/dom.element functions
////////////////////////////////////////////////////////////////////////////////


/* get element by id */
function id( el ) {

	return document.getElementById(el);

}


/* get style of current element */
function getStyle( el,styleProp ) {
	
    var x = document.getElementById(el);

    if (window.getComputedStyle)
    {
        var y = document.defaultView.getComputedStyle(x,null).getPropertyValue(styleProp); 
    }  
    else if (x.currentStyle)
    {
        var y = x.currentStyle[styleProp];
    }                     

    return y;
}


/* define a random color */
function get_random_color() {

    var letters = '0123456789ABCDEF'.split('');
    var color   = '#';
	
    for ( var i = 0; i < 6; i++ ) {
	
        color += letters[ Math.round( Math.random() * 15 ) ];
		
    }
	
    return color;
	
}
