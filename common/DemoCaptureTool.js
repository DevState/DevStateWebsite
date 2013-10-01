(function (window){


	DemoCaptureTool = function(captureFrameRate, duration, canvases, outputImage){
		this.captureFrameRate = captureFrameRate;
		this.duration = duration;
		this.canvases = canvases;
		this.outputImage = outputImage;
		
		this.captureCanvas = document.createElement('canvas');
		this.captureCanvas.width = canvases[0].width;
		this.captureCanvas.height = canvases[0].height;
		this.captureContext = this.captureCanvas.getContext("2d");
	}
		
	DemoCaptureTool.prototype.start = function(){
		this.numCaptures = 0;
		var _this = this;
		this.intervalId = setInterval(function(){_this.capture();}, this.captureFrameRate);
		
		this.gifEncoder = new GIFEncoder();
		this.gifEncoder.setRepeat(0); //auto-loop
		this.gifEncoder.setDelay(40);
		this.gifEncoder.start();
	}
	
	DemoCaptureTool.prototype.stop = function(){
		clearInterval(this.intervalId);
		//console.log("DemoCaptureTool.stop()");
		this.gifEncoder.finish();
		this.outputImage.src = 'data:image/gif;base64,'+encode64(this.gifEncoder.stream().getData());
	}
	
	DemoCaptureTool.prototype.capture = function(){
		this.captureContext.fillStyle="#FFFFFF";
		this.captureContext.fillRect(0,0,this.captureCanvas.width,this.captureCanvas.height);
		var context, canvas;
		for(var i=0; i<this.canvases.length; i++){
			canvas = this.canvases[i];
			this.captureContext.drawImage(canvas, 0, 0);
		}
		//var image = this.captureCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); //http://stackoverflow.com/questions/10673122/how-to-save-canvas-as-an-image-with-canvas-todataurl
		this.gifEncoder.addFrame(this.captureContext);
		this.numCaptures++;
		if(this.numCaptures*this.captureFrameRate >= this.duration){
			clearInterval(this.intervalId);
			//console.log("DemoCaptureTool.capture(), complete");
			this.gifEncoder.finish();
			this.outputImage.src = 'data:image/gif;base64,'+encode64(this.gifEncoder.stream().getData());
			//var image = new Image();
			//window.location.href = image; // it will save locally
		}
	}
	
	
	DemoCaptureTool.capturePng = function(canvases, outputImage, bgColor){
		if(bgColor == undefined){
			bgColor = "#FFFFFF";
		}
		var captureCanvas = document.createElement('canvas');
		captureCanvas.width = canvases[0].width;
		captureCanvas.height = canvases[0].height;
		captureContext = captureCanvas.getContext("2d");	
		
		captureContext.fillStyle=bgColor;
		captureContext.fillRect(0,0,captureCanvas.width,captureCanvas.height);			

		for(var i=0; i<canvases.length; i++){
			canvas = canvases[i];
			//context = canvas.getContext("2d");
			captureContext.drawImage(canvas, 0, 0);
		}

		outputImage.src = captureCanvas.toDataURL("image/png");
		
	}

	window.DemoCaptureTool=DemoCaptureTool;
	
}(window));


