
		var compressImage = function(input, outputEle) {
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext("2d");
		var image = document.createElement("img");
		var degrees = 0;
			var file = input.files[0];
			var reader = new FileReader();
			reader.onloadend = function() {

				var tempImg = new Image();
				tempImg.src = reader.result;
				tempImg.onload = function() {

					var MAX_WIDTH = 400;
					var MAX_HEIGHT = 300;
					var tempW = tempImg.width;
					var tempH = tempImg.height;
					if (tempW > tempH) {
						if (tempW > MAX_WIDTH) {
							tempH *= MAX_WIDTH / tempW;
							tempW = MAX_WIDTH;
						}
					} else {
						if (tempH > MAX_HEIGHT) {
							tempW *= MAX_HEIGHT / tempH;
							tempH = MAX_HEIGHT;
						}
					}
					canvas.width = tempW;
					canvas.height = tempH;
					
					ctx.drawImage(this, 0, 0, tempW, tempH);
					
					var dataURL = canvas.toDataURL("image/jpeg");
					document.getElementById(outputEle).value=dataURL
				}

			}

			reader.readAsDataURL(file);
		}