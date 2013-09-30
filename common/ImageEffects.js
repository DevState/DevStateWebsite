(function (window){


	ImageEffects = function(){}
	
	ImageEffects.createGrayscaleImageFrom = function(image, width, height){
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height; 
		context.drawImage(image, 0, 0, width, height); 
		var imgPixels = context.getImageData(0, 0, canvas.width, canvas.height);
		for(var y = 0; y < imgPixels.height; y++){
			for(var x = 0; x < imgPixels.width; x++){
				var i = (y * 4) * imgPixels.width + x * 4;
				var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
				imgPixels.data[i] = avg; 
				imgPixels.data[i + 1] = avg; 
				imgPixels.data[i + 2] = avg;
			}
		}
		context.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
		var copy = new Image();
		copy.src = canvas.toDataURL();
		delete context;
		delete canvas;
		return copy;
    }

	ImageEffects.createInverseImageFrom = function(image, width, height){
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height; 
		context.drawImage(image, 0, 0, width, height); 
		var pixels = context.getImageData(0, 0, canvas.width, canvas.height);
		var data = pixels.data;
        for(var i = 0; i < pixels.data.length; i += 4) {
          // red
          data[i] = 255 - data[i];
          // green
          data[i + 1] = 255 - data[i + 1];
          // blue
          data[i + 2] = 255 - data[i + 2];
        }
		context.putImageData(pixels, 0, 0, 0, 0, pixels.width, pixels.height);
		var copy = new Image();
		copy.src = canvas.toDataURL();
		delete context;
		delete canvas;
		return copy;
    }
	
	ImageEffects.createBrightImageFrom = function(image, width, height){
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height; 
		context.drawImage(image, 0, 0, width, height); 
		var pixels = context.getImageData(0, 0, canvas.width, canvas.height);
		var data = pixels.data;
        for(var i = 0; i < pixels.data.length; i += 4) {
          // red
          data[i] = data[i] + (255 - data[i])/1.3;
          // green
          data[i + 1] = data[i+1] + (255 - data[i+1])/1.3;
          // blue
          data[i + 2] = data[i+2] + (255 - data[i+2])/1.3;
        }
		context.putImageData(pixels, 0, 0, 0, 0, pixels.width, pixels.height);
		var copy = new Image();
		copy.src = canvas.toDataURL();
		delete context;
		delete canvas;
		return copy;
    }
	
	ImageEffects.createDarkImageFrom = function(image, width, height){
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height; 
		context.drawImage(image, 0, 0, width, height); 
		var pixels = context.getImageData(0, 0, canvas.width, canvas.height);
		var data = pixels.data;
        for(var i = 0; i < pixels.data.length; i += 4) {
          // red
          data[i] = data[i] * .3;
          // green
          data[i + 1] = data[i+1] * .3;
          // blue
          data[i + 2] = data[i+2] * .3;
        }
		context.putImageData(pixels, 0, 0, 0, 0, pixels.width, pixels.height);
		var copy = new Image();
		copy.src = canvas.toDataURL();
		delete context;
		delete canvas;
		return copy;
    }
	
	ImageEffects.createPsychadelicImageFrom = function(image, width, height){
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height; 
		context.drawImage(image, 0, 0, width, height); 
		var pixels = context.getImageData(0, 0, canvas.width, canvas.height);
		var data = pixels.data;
        for(var i = 0; i < pixels.data.length; i += 4) {
          // red
          data[i] = data[i] < 127 ? data[i] + (255 - data[i])/1.3 : data[i];
          // green
          data[i + 1] = data[i+1] < 127 ? data[i+1] + (255 - data[i+1])/1.3 : data[i+1];
          // blue
          data[i + 2] = data[i+2] < 127 ? data[i+2] + (255 - data[i+2])/1.3 : data[i+2];
        }
		context.putImageData(pixels, 0, 0, 0, 0, pixels.width, pixels.height);
		var copy = new Image();
		copy.src = canvas.toDataURL();
		delete context;
		delete canvas;
		return copy;
    }

	ImageEffects.effects = new Array(	ImageEffects.createGrayscaleImageFrom, ImageEffects.createInverseImageFrom, 
										ImageEffects.createBrightImageFrom, ImageEffects.createDarkImageFrom, ImageEffects.createPsychadelicImageFrom);
	
	ImageEffects.getRandomImageEffect = function(image, width, height){
		return ImageEffects.effects[Math.floor(Math.random()*ImageEffects.effects.length)];
	}
	
	ImageEffects.createRandomEffectImageFrom = function(image, width, height){
		var effect = ImageEffects.getRandomImageEffect();
		return effect(image, width, height);
	}
	
	//captureRect must contain the properties x, y, width, height
	ImageEffects.renderReflection = function(canvas, captureRect, space, r,b,g){
		if(!space){
			space = 5;
		}
		if(!r){
			r,g,b = "0xFF";
		}

		context = canvas.getContext("2d");
		//move and flip vertically
		context.translate(captureRect.x, captureRect.y + captureRect.height*2 + space);
		context.scale(1, -1);
		
		context.drawImage(	canvas, captureRect.x, captureRect.y, captureRect.width, captureRect.height, 
							0, 0, captureRect.width, captureRect.height);//img,sx,sy,swidth,sheight,x,y,width,height
		
		SimpleGeometry.setIdentityMatrixToContext(context);
		
		var gradient = context.createLinearGradient(captureRect.x, captureRect.y + captureRect.height + space, captureRect.x, captureRect.y + captureRect.height*1.5);
		gradient.addColorStop(0.1, "rgba(255,255,255,0)");
		gradient.addColorStop(0.5, "rgba(255,255,255,.7)");
		gradient.addColorStop(1, "rgb(255,255,255)");

		context.fillStyle = gradient;
		context.fillRect(captureRect.x, captureRect.y + captureRect.height + space, captureRect.width, captureRect.height);
			
    }
	
	ImageEffects.resizeImageDestructive = function(image, resizeCanvas, width, height){
		if(!resizeCanvas){
			resizeCanvas = document.createElement('canvas');
		}
		resizeCanvas.width = width;
		resizeCanvas.height = height;
		var context = resizeCanvas.getContext("2d");
		context.drawImage(image,0,0,width,height);
		image.src = resizeCanvas.toDataURL();
	}
	
	
	window.ImageEffects=ImageEffects;
	

}(window));


