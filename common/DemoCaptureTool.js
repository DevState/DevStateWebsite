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
		console.log(this.gifEncoder.start());
		
	}
	
	DemoCaptureTool.prototype.capture = function(){
		this.captureContext.fillStyle="#FFFFFF";
		this.captureContext.fillRect(0,0,this.captureCanvas.width,this.captureCanvas.height);
		var context, canvas;
		for(var i=0; i<this.canvases.length; i++){
			canvas = this.canvases[i];
			//context = canvas.getContext("2d");
			this.captureContext.drawImage(canvas, 0, 0);
		}
		//var image = this.captureCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); //http://stackoverflow.com/questions/10673122/how-to-save-canvas-as-an-image-with-canvas-todataurl
		console.log(this.gifEncoder.addFrame(this.captureContext));
		this.numCaptures++;
		if(this.numCaptures*this.captureFrameRate >= this.duration){
			clearInterval(this.intervalId);
			console.log("DemoCaptureTool.capture(), complete");
			this.gifEncoder.finish();
			//var image = new Image();
			this.outputImage.src = 'data:image/gif;base64,'+encode64(this.gifEncoder.stream().getData());
			//document.getElementById('image').src = 
			//window.location.href = image; // it will save locally
		}
	}

	window.DemoCaptureTool=DemoCaptureTool;
	
}(window));


