			var connection = new WebSocket('ws://192.168.1.239/socket/');
			//var connection = new WebSocket('ws://cwicsite.com:8888/socket/');
			//var connection = new WebSocket('ws://192.168.43.86:8888/socket/');
			connection.onopen = function () {  
				sendData('status','Connected');
			};
			
			connection.onerror = function (error) {
				console.log('WebSocket Error ', error);
			};
			
			connection.onmessage = function (e) {
				console.log('Server: ', e.data);
							
				//document.getElementById("status").innerHTML = e.data;
				
				//JsonObject& root = jsonBuffer.parseObject(e.data);
				//if (!root.success()) {
				//	Serial.println("parseObject() failed");
				//	return;
				//}	
				// const char* lightState = root["light"];
				// const char* soundState = root["sound"];
				
				var obj = JSON.parse(e.data);
				console.log("Status: " + obj.status);
				console.log("Light: " + obj.light);
				console.log("Sound: " + obj.sound);
				console.log("Color: " + obj.color);
				console.log("Brightness: " + obj.brightness);
				console.log("Volume: " + obj.volume);
				console.log("Scene: " + obj.scene);
				
				if (obj.status == "refresh") {
					location.reload();
				}
				//document.getElementById("status").innerHTML = e.data;
				
				
				//if (e.data != "none" && e.data != "Connected") {
					//console.log(document.getElementById(e.data).innerHTML);
					var elems = document.querySelectorAll(".selected");
					[].forEach.call(elems, function(el) {
						el.classList.remove("selected");
					});
					
					addClass(document.getElementById(obj.light), "selected");
					addClass(document.getElementById(obj.sound), "selected");
					document.getElementById("colorpicker").value = obj.color;
					setRanges(obj.color);
					document.getElementById("brightness").value = obj.brightness;
					document.getElementById("volume").value = obj.volume;
					
				//}
				returnclick();
			};
			
			function sendData(cmd_val, val_val) {
				
				stopclick();
				
				var msg = {
					cmd: cmd_val,
					val: val_val,
				};
				connection.send(JSON.stringify(msg));
			}
			
			function sendBrightness() {
				stopclick();
				var b = document.getElementById('brightness').value;
								
				var bv = '!'+b;
				console.log('Bightness: ' + b);
				connection.send(bv);
			}
			
			function sendVolume() {
				stopclick();
				var b = document.getElementById('volume').value;
								
				var bv = '^'+b;
				console.log('Bightness: ' + b);
				connection.send(bv);
			}
			
			function sendRGB() {
				stopclick();
				var r = parseInt(document.getElementById('r').value).toString(16);
				var g = parseInt(document.getElementById('g').value).toString(16);
				var b = parseInt(document.getElementById('b').value).toString(16);
				
				if(r.length < 2) { r = '0' + r; }
				if(g.length < 2) { g = '0' + g; }
				if(b.length < 2) { b = '0' + b; }
				
				var rgb = '#'+r+g+b;
				
				console.log('Send RGB: ' + rgb);
				//connection.send(document.getElementById("colorpicker").value);
				sendData('rgb',document.getElementById("colorpicker").value);
				document.getElementById("clabel").style.color = invertColor(rgb);
				document.getElementById("colorhold").style.backgroundColor = rgb;	
			}
			
			
			
			function setRGB() {
				var r = parseInt(document.getElementById('r').value).toString(16);
				var g = parseInt(document.getElementById('g').value).toString(16);
				var b = parseInt(document.getElementById('b').value).toString(16);
				
				if(r.length < 2) { r = '0' + r; }
				if(g.length < 2) { g = '0' + g; }
				if(b.length < 2) { b = '0' + b; }
				
				var rgb = '#'+r+g+b;
				
				console.log('Set RGB: ' + rgb);
				//document.getElementById("rgbSample").style.backgroundColor = rgb;
				document.getElementById("colorpicker").value = rgb;		
				document.getElementById("clabel").style.color = invertColor(rgb);
				document.getElementById("colorhold").style.backgroundColor = rgb;			

			}
			
			function setRanges(hex) {
				var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

				var r = parseInt(rgb[1], 16);
				var g = parseInt(rgb[2], 16);
				var b = parseInt(rgb[3], 16);
				
				document.getElementById("r").value = r;
				document.getElementById("g").value = g;
				document.getElementById("b").value = b;
				
				console.log('Ranges RGB: ' + rgb);
				document.getElementById("clabel").style.color = invertColor(hex);
				document.getElementById("colorhold").style.backgroundColor = hex;					
				//connection.send(document.getElementById("colorpicker").value);
			}
			
			var y = [];
			
			function stopclick() {
				document.getElementById("shader").style.display = "block";
				var x = document.getElementsByClassName("links");
				var i;
				for (i = 0; i < x.length; i++) {
					y[i] = x[i].href;
					x[i].href = "javascript:void(0);";
					addClass(x[i], "blocked");
				}
			}
			
			function returnclick() {
				var x = document.getElementsByClassName("links");
				var i;
				for (i = 0; i < x.length; i++) {
					x[i].href = y[i];
					removeClass(x[i], "blocked");
					document.getElementById("shader").style.display = "none";
				}
			}
			
			function hasClass(el, className) {
			  if (el.classList)
				return el.classList.contains(className);
			  else
				return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
			}

			function addClass(el, className) {
			  if (el.classList)
				el.classList.add(className);
			  else if (!hasClass(el, className)) el.className += " " + className;
			}

			function removeClass(el, className) {
			  if (el.classList)
				el.classList.remove(className);
			  else if (hasClass(el, className)) {
				var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
				el.className=el.className.replace(reg, ' ');
			  }
			} 
			
			function link(state, value) {
				stopclick();
				//document.getElementById("status").innerHTML = status;
				
				document.getElementById("shader").style.display = "block";
				if (state == "rgb") {
					
					state = document.getElementById("colorpicker").value;
				}
				
				sendData(state,value);
			}
			
			var aTags = document.getElementsByClassName("links");
			for (var i=0;i<aTags.length;i++){
				aTags.addEventListener("click", function(){
					//stopclick();
					//document.getElementById("demo").innerHTML = "Hello World";
				});
			}
			
			function invertColor(hex) {
				bw = true
				if (hex.indexOf('#') === 0) {
					hex = hex.slice(1);
				}
				// convert 3-digit hex to 6-digits.
				if (hex.length === 3) {
					hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
				}
				if (hex.length !== 6) {
					throw new Error('Invalid HEX color.');
				}
				var r = parseInt(hex.slice(0, 2), 16),
					g = parseInt(hex.slice(2, 4), 16),
					b = parseInt(hex.slice(4, 6), 16);
				if (bw) {
					// http://stackoverflow.com/a/3943023/112731
					return (r * 0.299 + g * 0.587 + b * 0.114) > 186
						? '#000000'
						: '#FFFFFF';
				}
				// invert color components
				r = (255 - r).toString(16);
				g = (255 - g).toString(16);
				b = (255 - b).toString(16);
				// pad each with zeros and return
				return "#" + padZero(r) + padZero(g) + padZero(b);
			}

			function padZero(str, len) {
				len = len || 2;
				var zeros = new Array(len).join('0');
				return (zeros + str).slice(-len);
			}
			
			function showUpload() {
				document.getElementById("uploader").style.display = "block";
			}
			
			function hideUpload() {
				document.getElementById("uploader").style.display = "none";
			}
			
			function delAudio(cmd,val,name) {
				if (confirm('Are you sure you want to delete this: ' + name)) {
					sendData(cmd,val);				
				}
			}