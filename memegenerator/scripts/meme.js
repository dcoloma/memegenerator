/*
Meme.js
=======

Use one function to generate a meme.

You can call it all with strings:

     Meme('dog.jpg', 'canvasID', 'Buy pizza, 'Pay in snakes');

Or with a selected canvas element:

     var canvas = document.getElementById('canvasID');
     Meme('wolf.jpg', canvas, 'The time is now', 'to take what\'s yours');

Or with a jQuery/Zepto selection:

     Meme('spidey.jpg', $('#canvasID'), 'Did someone say', 'Spiderman JS?');

You can also pass in an image:

     var img = new Image();
     img.src = 'insanity.jpg';
     var can = document.getElementById('canvasID');
     Meme(img, can, 'you ignore my calls', 'I ignore your screams of mercy');

********************************************************************************

Copyright (c) 2012 BuddyMeme

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

window.Meme = function(image, canvas, top, bottom, filter) {

	console.log("--->> Meme Constructor " + image)

	/*
	Default top and bottom
	*/

	top = top || '';
	bottom = bottom || '';
	filter = filter || '';

	/*
	Deal with the canvas
	*/

	// If it's nothing, set it to a dummy value to trigger error
	if (!canvas)
		canvas = 0;

	// If it's a string, conver it
	if (canvas.toUpperCase)
		canvas = document.getElementById(canvas);


	// Throw error
	if (!(canvas instanceof HTMLCanvasElement))
		throw new Error('No canvas selected');

	// Get context
	var context = canvas.getContext('2d');
	context.fillStyle = 'white';
	context.strokeStyle = 'black';
	context.lineWidth = 2;
	var fontSize = (canvas.height / 12);
	context.font = fontSize + 'px Coda Caption';
	context.textAlign = 'center';

	/*
	Deal with the image
	*/

	// If there's no image, set it to a dummy value to trigger an error
	if (!image)
		image = 0;

	// Convert it from a string
	if (image.toUpperCase) {
		var src = image;
		image = new Image();
		image.src = src;
	}

	// Set the proper width and height of the canvas
	var setCanvasDimensions = function(w, h) {
		canvas.width = w;
		canvas.height = h;
	};
	//setCanvasDimensions(image.width, image.height);	

	/*
	Draw a centered meme string
	*/

	var drawText = function(text, topOrBottom, y) {

		// Variable setup
		topOrBottom = topOrBottom || 'top';
		var fontSize = (canvas.height / 12);
		var x = canvas.width / 2;
		if (typeof y === 'undefined') {
			y = fontSize;
			if (topOrBottom === 'bottom')
				y = canvas.height - 10;
		}

		// Should we split it into multiple lines?
		if (context.measureText(text).width > (canvas.width * 1.1)) {

			// Split word by word
			var words = text.toString().split(' ');
			var wordsLength = words.length;

			// Start with the entire string, removing one word at a time. If
			// that removal lets us make a line, place the line and recurse with
			// the rest. Removes words from the back if placing at the top;
			// removes words at the front if placing at the bottom.
			if (topOrBottom === 'top') {
				var i = wordsLength;
				while (i --) {
					var justThis = words.slice(0, i).join(' ');
					if (context.measureText(justThis).width < (canvas.width * 1.0)) {
						drawText(justThis, topOrBottom, y);
						drawText(words.slice(i, wordsLength).join(' '), topOrBottom, y + fontSize);
						return;
					}
				}
			}
			else if (topOrBottom === 'bottom') {
				for (var i = 0; i < wordsLength; i ++) {
					var justThis = words.slice(i, wordsLength).join(' ');
					if (context.measureText(justThis).width < (canvas.width * 1.0)) {
						drawText(justThis, topOrBottom, y);
						drawText(words.slice(0, i).join(' '), topOrBottom, y - fontSize);
						return;
					}
				}
			}

		}
		// Draw!
		context.fillText(text, x, y, canvas.width * .9);
		context.strokeText(text, x, y, canvas.width * .9);
	};

	/*
	Do everything else after image loads
	*/

	image.onload = function() {

		// Draw the image
		console.log("---> meme.js image loaded " + image.src + " width " + canvas.width + " height " + canvas.height)
		console.log("image "+ image.width + " , " + image.height)
		context.drawImage(image, 0, 0, canvas.width, canvas.height);

        switch (filter)
        {
          case "filterGS":
            var imageData = context.getImageData(0,0, canvas.width, canvas.height);
            for (var i = 0; i < imageData.data.length; i+=4) {
              var luma = Math.floor(imageData.data[i] * 0.3 +
                imageData.data[i+1] * 0.59 +
                imageData.data[i+2] * 0.11);
                imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = luma;
                imageData.data[i+3] = 255;
            }
            context.putImageData(imageData, 0, 0);
            break;
          case "filterThreshold":
            var imageData = context.getImageData(0,0, canvas.width, canvas.height);
            for (var i=0; i<imageData.data.length; i+=4) {
              var r = imageData.data[i];
              var g = imageData.data[i+1];
              var b = imageData.data[i+2];
              var v = (0.2126*r + 0.7152*g + 0.0722*b >= 128) ? 255 : 0;
              imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = v
            }
            context.putImageData(imageData, 0, 0);
            break;
          case "filterBrightness":
            var adjustment = 40;
            var imageData = context.getImageData(0,0, canvas.width, canvas.height);
            for (var i=0; i<imageData.data.length; i+=4) {
              imageData.data[i] += adjustment;
              imageData.data[i+1] += adjustment;
              imageData.data[i+2] += adjustment;
            }
            context.putImageData(imageData, 0, 0);
            break;
          default:
            break;
        }

		// Draw text!
		drawText(top, 'top');
		drawText(bottom, 'bottom');

	};
};

