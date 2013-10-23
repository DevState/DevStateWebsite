(function (window){


	DSLightBox = function(beginOpenCallback, openCompleteCallback, beginCloseCallback, closeCompleteCallback){
		this.beginOpenCallback = beginOpenCallback;
		this.openCompleteCallback = openCompleteCallback;
		this.beginCloseCallback = beginCloseCallback;
		this.closeCompleteCallback = closeCompleteCallback;
		
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
	};
	
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
		this.contentDiv.appendChild(content);
	};
	DSLightBox.prototype.removeContent = function(content){
		this.contentDiv.removeChild(content);
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
		
		var _this = this;
		this.animator.reset(1000,20,function(){_this.fadeIn()} , function(){_this.openComplete()});
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
	
	DSLightBox.prototype.close = function(event){
        this.fadeOutBeginRect = this.contentRect.clone();
        this.fadeOutTargetRect = new SimpleGeometry.Rectangle(event.pageX-25, event.pageY-25, 50, 50);
		this.closeButton.style.display = this.borderDiv.style.display = "none";
		var _this = this;
		this.animator.reset(1000,20,function(){_this.fadeOut()} , function(){_this.closeComplete()});
		this.animator.start();
		if(this.beginCloseCallback != undefined){
			this.beginCloseCallback();
		}
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


