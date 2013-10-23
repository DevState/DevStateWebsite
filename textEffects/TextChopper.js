(function (window){


	TextChopper=function(){};
		
	TextChopper.prototype.createImagesFromString = function(string, size, color, color2){
		var characters = string.split("");		
		var images = [];
        var canvas, context, image, metrics, i,character;
		canvas = document.createElement("canvas");

		for(i=0; i<characters.length; i++){
			character = characters[i];
			
			context = canvas.getContext("2d");
			//context.font = size+"px 'ArchivoBlack'";
			context.font = size+"px 'sf_collegiate_solidregular'";
			//context.font = size+"px 'Arial'";

			metrics = context.measureText(character);
			canvas.width = metrics.width;
			canvas.height = size;//hardcoded, TODO : use getFirstNonTransparentPixel for dynamic sizing

			context = canvas.getContext("2d");
			//context.font = size+"px 'ArchivoBlack'";
			context.font = size+"px 'sf_collegiate_solidregular'";
            //context.font = size+"px 'Arial'";

			image = new Image();
			image.width = canvas.width;
			image.height = canvas.height;

			var gradient = context.createLinearGradient(0, 0, 0, canvas.height);// linear gradient from start to end of line
			gradient.addColorStop(0, color);
			gradient.addColorStop(1, color2);
			
			context.shadowColor = color;
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur    = 10;
			
			context.fillStyle = gradient;
			context.fillText (character,0, size-10);

			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur    = 0;
						
			context.strokeStyle = color2;
			context.strokeText(character,0, size-10);
			
			image.src = canvas.toDataURL();
			images[i] = image;
		}
        delete canvas;
		return images;
	};
	
	TextChopper.getFirstNonTransparentPixelYTopDown=function(context){
		return point;
	};
	TextChopper.getFirstNonTransparentPixelYBottomUp=function(context){
		return point;
	};
	
	window.TextChopper=TextChopper;
	
}(window));



