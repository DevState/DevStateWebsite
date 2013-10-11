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
		this.overlayDiv.addEventListener("click",function(){ _this.lightBoxOverlayDivClickHandler()}, false);
		
		this.borderDiv.style.backgroundColor = "#CCCCCC";
		this.borderDiv.style.zIndex = 1001;
		
		this.contentDiv.style.backgroundColor = "white";
		this.contentDiv.style.zIndex = 1002;
		
		this.animator = new UnitAnimator();
		this.animator.setEasingFunction(UnitAnimator.easeOutSine);

		this.backgroundOpacity = .8;
		this.borderThickness = 10;
	}
	
	DSLightBox.prototype.lightBoxOverlayDivClickHandler = function (){
		this.close();
	}
	
	DSLightBox.prototype.setContent = function(content){
		this.contentDiv.appendChild(content);
	}
	DSLightBox.prototype.removeContent = function(content){
		this.contentDiv.removeChild(content);
	}
	
	DSLightBox.prototype.isOpen = function(){
		return this.contentDiv.style.display=="block"
	}
	
	DSLightBox.prototype.open = function(screenRect, contentRect){
		this.overlayDiv.style.left = "0px";
		this.overlayDiv.style.top = "0px";
		this.overlayDiv.style.width = screenRect.width+"px";
		this.overlayDiv.style.height = screenRect.height+"px";
		
		this.borderDiv.style.left = (contentRect.x-this.borderThickness) + "px";
		this.borderDiv.style.top = (contentRect.y-this.borderThickness) + "px";
		this.borderDiv.style.width = (contentRect.width+this.borderThickness*2) + "px";
		this.borderDiv.style.height = (contentRect.height+this.borderThickness*2) + "px";
		
		this.contentDiv.style.left = contentRect.x+"px";
		this.contentDiv.style.top = contentRect.y+"px";
		this.contentDiv.style.width = contentRect.width+"px";
		this.contentDiv.style.height = contentRect.height+"px";
		
		this.borderDiv.style.display = this.overlayDiv.style.display = this.contentDiv.style.display = "block";
		this.overlayDiv.style.opacity = 0;
		this.contentDiv.style.opacity = 0;
		var _this = this;
		this.animator.reset(1000,20,function(){_this.fadeIn()} , function(){_this.openComplete()});
		this.animator.start();
		if(this.beginOpenCallback != undefined){
			this.beginOpenCallback();
		}
	}
	
	DSLightBox.prototype.fadeIn = function(){
		this.overlayDiv.style.opacity = this.animator.getAnimationPercent()*this.backgroundOpacity;
		this.contentDiv.style.opacity = this.animator.getAnimationPercent();
		this.borderDiv.style.opacity = this.animator.getAnimationPercent();
	}
	
	DSLightBox.prototype.fadeOut = function(){
		this.overlayDiv.style.opacity = (1-this.animator.getAnimationPercent())*this.backgroundOpacity;
		this.borderDiv.style.opacity = 1-this.animator.getAnimationPercent();
	}
	
	DSLightBox.prototype.close = function(){
		var _this = this;
		this.animator.reset(1000,20,function(){_this.fadeOut()} , function(){_this.closeComplete()});
		this.animator.start();
		if(this.beginCloseCallback != undefined){
			this.beginCloseCallback();
		}
	}
	
	DSLightBox.prototype.openComplete = function(){
		//console.log("DSLightBox.openComplete()");
		this.overlayDiv.style.opacity = this.backgroundOpacity;
		if(this.openCompleteCallback != undefined){
			this.openCompleteCallback();
		}
	}
	
	DSLightBox.prototype.closeComplete = function(){
		//console.log("DSLightBox.closeComplete()");
		this.borderDiv.style.display = this.overlayDiv.style.display = this.contentDiv.style.display = "none";
		if(this.closeCompleteCallback != undefined){
			this.closeCompleteCallback();
		}
	}
	
	//on resize, no animation
	DSLightBox.prototype.forceClose = function(){
		if(this.beginCloseCallback != undefined){
			this.beginCloseCallback();
		}
		this.animator.pause();
		this.closeComplete();
	}

	window.DSLightBox=DSLightBox;
	
}(window));

