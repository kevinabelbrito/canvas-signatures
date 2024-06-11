'use strict';

/*
* This method returns the relative offset x/y for a mouse cursor position in an element such as canvas
* @param {object} e  - the event object</param>
* @param {string} id - the id of the element in which the mouse is positioned
*/
function getMouseOffset(e, id) {
  var xpos, ypos;
  if (typeof e.offsetX === 'undefined') {
    // ff hack
    xpos = e.pageX - $('#' + id).offset().left; //dans ce cas, jQuery nécessaire pour l'appel d'offset
    ypos = e.pageY - $('#' + id).offset().top;
  } else {
    xpos = e.offsetX;
    ypos = e.offsetY;
  }
  return { x: xpos, y: ypos };
}

/**
* Extends Canvas element to use it as a paint element
*/
var extendCanvas = function extendCanvas(canvas) {
  if (typeof canvas === 'string') {
    canvas = document.getElementById(canvas);
  }
  try {
    (function () {

      /**
              * This method remove the event by default, to load them only when clicking in the canvas
              */
      var px = 0, py = 0;
      var remove_event_listeners = function remove_event_listeners() {
        canvas.removeEventListener('mousemove', on_mousemove, false);
        canvas.removeEventListener('mouseup', on_mouseup, false);
        canvas.removeEventListener('touchmove', on_touchmove, false);
        canvas.removeEventListener('touchend', on_touchend, false);
        document.body.removeEventListener('mouseup', on_mouseup, false);
        document.body.removeEventListener('touchend', on_touchend, false);
      };

      function ongoingTouchIndexById(idToFind) {
        for (var i=0; i<ongoingTouches.length; i++) {
          var id = ongoingTouches[i].identifier;
          
          if (id == idToFind) {
            return i;
          }
        }
        return -1;    // not found
      }

      //Event when touch the screen
      var on_touchstar = function on_touchstar(e) {
        if (!canvas.isLocked) {
          e.preventDefault();
          e.stopPropagation();

          canvas.hasDrawn = false;
          //we activate the mouse and touch events
          canvas.addEventListener('touchend', on_touchend, false);
          canvas.addEventListener('touchmove', on_touchmove, false);
          document.body.addEventListener('touchend', on_touchend, false);

          var touches = e.changedTouches;
            
          for (var i=0; i<touches.length; i++) {
            //ongoingTouches.push(touches[i]);
            px = touches[i].pageX - canvas.offsetLeft;
            py = touches[i].pageY - canvas.offsetTop;
            canvas.ctx.beginPath();
            canvas.pixels.push('moveStart');
            canvas.ctx.moveTo(px, py);
            canvas.pixels.push(px, py);
            canvas.xyLast.x = px;
            canvas.xyLast.y = py;
            //canvas.ctx.fillRect(touches[i].pageX-2, touches[i].pageY-2, 2, 2);
          }
          console.log("Tocando la pantalla");
        }
      }

      //Event when the mouse is clicked

      var on_mousedown = function on_mousedown(e) {
        if (!canvas.isLocked) {
          e.preventDefault();
          e.stopPropagation();

          canvas.hasDrawn = false;
          //we activate the mouse and touch events
          canvas.addEventListener('mouseup', on_mouseup, false);
          canvas.addEventListener('mousemove', on_mousemove, false);
          document.body.addEventListener('mouseup', on_mouseup, false);

          var xy = canvas.getCursorCoords(e);
          canvas.ctx.beginPath();
          canvas.pixels.push('moveStart');
          canvas.ctx.moveTo(xy.x, xy.y);
          canvas.pixels.push(xy.x, xy.y);
          canvas.xyLast = xy;
          console.log("Haciendo click");
        }
      };

      //Event when touch is moving

      var on_touchmove = function on_touchmove(e, finish) {
        if (!canvas.isLocked) {
          e.preventDefault();
          e.stopPropagation();

          var touches = e.changedTouches;

          canvas.hasDrawn = true;
          for (var i=0; i<touches.length; i++) {
            /*var idx = ongoingTouchIndexById(touches[i].identifier);
            canvas.ctx.beginPath();
            canvas.ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            canvas.ctx.lineTo(touches[i].pageX, touches[i].pageY);
            canvas.ctx.closePath();
            canvas.ctx.stroke();
            ongoingTouches.splice(idx, 1, touches[i]);  // swap in the new touch record*/
            px = touches[i].pageX - canvas.offsetLeft;
            py = touches[i].pageY - canvas.offsetTop;
            var xyAdd = {
              x: (canvas.xyLast.x + px) / 2,
              y: (canvas.xyLast.y + py) / 2
            };
            if (canvas.calculate) {
              var xLast = (canvas.xyAddLast.x + canvas.xyLast.x + xyAdd.x) / 3;
              var yLast = (canvas.xyAddLast.y + canvas.xyLast.y + xyAdd.y) / 3;
              canvas.pixels.push(xLast, yLast);
            } else {
              canvas.calculate = true;
            }
            canvas.ctx.quadraticCurveTo(canvas.xyLast.x, canvas.xyLast.y, xyAdd.x, xyAdd.y);
            canvas.pixels.push(xyAdd.x, xyAdd.y);
            canvas.ctx.stroke();
            canvas.ctx.beginPath();
            canvas.ctx.moveTo(xyAdd.x, xyAdd.y);
            canvas.xyAddLast = xyAdd;
            canvas.xyLast.x = px;
            canvas.xyLast.y = py;
          }
          console.log("trazando con los dedos");
        }
      };

      //Event when the mouse is moving.

      var on_mousemove = function on_mousemove(e, finish) {
        if (!canvas.isLocked) {
          e.preventDefault();
          e.stopPropagation();

          canvas.hasDrawn = true;
          var xy = canvas.getCursorCoords(e);
          var xyAdd = {
            x: (canvas.xyLast.x + xy.x) / 2,
            y: (canvas.xyLast.y + xy.y) / 2
          };
          if (canvas.calculate) {
            var xLast = (canvas.xyAddLast.x + canvas.xyLast.x + xyAdd.x) / 3;
            var yLast = (canvas.xyAddLast.y + canvas.xyLast.y + xyAdd.y) / 3;
            canvas.pixels.push(xLast, yLast);
          } else {
            canvas.calculate = true;
          }
          canvas.ctx.quadraticCurveTo(canvas.xyLast.x, canvas.xyLast.y, xyAdd.x, xyAdd.y);
          canvas.pixels.push(xyAdd.x, xyAdd.y);
          canvas.ctx.stroke();
          canvas.ctx.beginPath();
          canvas.ctx.moveTo(xyAdd.x, xyAdd.y);
          canvas.xyAddLast = xyAdd;
          canvas.xyLast = xy;
          console.log("moviendo el mouse");
        }
      };

      //Event when end touch the screen

      var on_touchend = function on_touchend(e) {
        if (!canvas.isLocked) {
          if (!canvas.hasDrawn) {
            //If there was no move, draw a single point
            var touches = e.changedTouches;          
            for (var i=0; i<touches.length; i++) {
            //ongoingTouches.push(touches[i]);
              px = touches[i].pageX - canvas.offsetLeft;
              py = touches[i].pageY - canvas.offsetTop;
              canvas.ctx.rect(px, py, 1, 1);
            }
          }
          /*
      
          for (var i=0; i<touches.length; i++) {
            ongoingTouches.splice(i, 1);  // remove it; we're done
          }*/
          remove_event_listeners();
          canvas.disableSave = false;
          canvas.ctx.stroke();
          canvas.pixels.push('e');
          canvas.calculate = false;
          canvas.isModified(true);
          canvas.hasDrawn = false;
          console.log("dejando de tocar");
        }
      };

      //Event when the click is released

      var on_mouseup = function on_mouseup(e) {
        if (!canvas.isLocked) {
          if (!canvas.hasDrawn) {
            //If there was no move, draw a single point           
            var pos = canvas.getCursorCoords(e);
            canvas.ctx.rect(pos.x, pos.y, 1, 1);
          }
          remove_event_listeners();
          canvas.disableSave = false;
          canvas.ctx.stroke();
          canvas.pixels.push('e');
          canvas.calculate = false;
          canvas.isModified(true);
          canvas.hasDrawn = false;
          console.log("soltando el click");
        }
      };

      canvas.ctx = canvas.getContext('2d');
      canvas.ctx.strokeStyle = "black";
      canvas.ctx.lineWidth = 2;
      canvas.lineJoin = "round";
      canvas.ctx.scale(1, 1);
      canvas.isLocked = false;
      canvas.hasDrawn = false;

      canvas.disableSave = true;
      canvas.pixels = [];
      canvas.cpixels = [];
      canvas.xyLast = {};
      canvas.xyAddLast = {};
      canvas.calculate = false;

      //start drawing a stroke from a position
      canvas.draw = function (x, y) {
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
      };
      //Get the mouse position in the canvas
      canvas.getCursorCoords = function (e) {
        return getMouseOffset(e, this.id);
      };
      //Clear the content of the canvas element
      canvas.clear = function () {
        if (!this.isLocked) {
          this.ctx.clearRect(0, 0, this.width, this.height);
          this.emptyRelatedField();
          this.isModified(false);
        }
      };
      //Lock the canvas element
      canvas.lock = function (shouldLock) {
        this.isLocked = shouldLock;
        if (shouldLock) {
          $(this).addClass('disabled');
        } else {
          $(this).removeClass('disabled');
        }
      };
      canvas.isModified = function (wasModified) {
        if (wasModified) {
          this.fillRelatedField();
          $(this).addClass('modified');
        } else {
          this.emptyRelatedField();
          $(this).removeClass('modified');
        }
      };
      //Empty the field that contains the base64 string
      canvas.emptyRelatedField = function () {
        var relatedField = document.getElementById('data-' + this.id);
        if (relatedField) {
          relatedField.value = "";
        }
      };
      //Fill the filed that contains the base64 string
      canvas.fillRelatedField = function () {
        document.getElementById('data-' + this.id).value = this.toDataURL();
      };
      //Load a passed image
      canvas.loadImage = function (base64Img) {
        //if (!canvas.isLocked) {
        var image = new Image();
        var thisCanvas = this;
        if (base64Img.indexOf("data:image/png;base64,") === -1) {
          base64Img = "data:image/png;base64," + base64Img;
        }
        image.src = base64Img;
        image.onload = function () {
          var offset = { x: 0, y: 0 };
          //center the image in the canvas
          try {
            offset.x = thisCanvas.width / 2 - image.width / 2;
            offset.y = thisCanvas.height / 2 - image.height / 2;
            if (offset.x < 0 || offset.y < 0) {
              throw {
                name: "Painting error",
                message: "Image has a negativ offset.",
                toString: function toString() {
                  return this.name + ": " + this.message;
                }
              };
            }
          } catch (err) {
            offset = { x: 0, y: 0 };
          }
          thisCanvas.ctx.drawImage(image, offset.x, offset.y);
        };
      };;;;;
      //We activate only the click or touch event.
      // ReSharper disable once Html.EventNotResolved correspond à un événement de toucher sur écran tactile
      var ongoingTouches = new Array;
      canvas.addEventListener('touchstart', on_touchstar, false);
      canvas.addEventListener('mousedown', on_mousedown, false);
    })();
  } catch (err) {
    //If someting went wrong, notify the user.
    console.error("Canvas not initialized. Painting is not activated.");
  }

  return canvas;
};


function initCanvas(canvasId, buttonId) {
  const clearButton = document.getElementById(buttonId);
  const myC = extendCanvas(canvasId);
  clearButton.addEventListener('click', function (e) {
    e.preventDefault();
    myC.clear();
    myC.emptyRelatedField();
  }, false);
}

initCanvas('paint', 'clear');
initCanvas('paint2', 'clear2');
initCanvas('paint3', 'clear3');