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
	
	
	ImageEffects.renderReflectionImage = function(image, targetCanvas, width, height, r,b,g){
		if(!r){
			r,g,b = "0xFF";
		}
		
		image.width = targetCanvas.width;
		image.height = targetCanvas.height;
		image.src = targetCanvas.toDataURL();

		/*
		var gradient = context.createLinearGradient(0, 0, 0, height);// linear gradient from start to end of line
		gradient.addColorStop(0, SimpleGeometry.getRgbaStyleString(r,g,b,1));
		gradient.addColorStop(1, SimpleGeometry.getRgbaStyleString(r,g,b,0));
		context.fillRect(0,0,width,height);
		context.fillStyle = gradient;
		*/
		
		// reflect image
		var context = targetCanvas.getContext("2d");
		context.translate(0, height);
		context.scale(1, -1);
		context.drawImage(image, 0, 0, 200, 100);

		// add gradient
		var grad = context.createLinearGradient(0, 0, 0, targetCanvas.height);
		grad.addColorStop(0.3, 'rgb(255,255,255)');
		grad.addColorStop(0.7, 'rgba(255,255,255,0)');

		context.fillStyle = grad;
		context.translate(0,0);
		context.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
		
    }
	
	
	window.ImageEffects=ImageEffects;
	

}(window));


