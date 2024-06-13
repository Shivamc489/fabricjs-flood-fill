/*
 * FloodFill for fabric.js
 * @author Arjan Haverkamp @av01d
 * @date October 2018
 * @modified by: Shivam Chauhan @shivamc489
 * @date June 2024
 */

var FloodFill = {
  withinTolerance: function (array1, offset, array2, tolerance) {
    var length = array2.length;
    for (var i = 0; i < length; i++) {
      if (Math.abs(array1[offset + i] - array2[i]) > tolerance) {
        return false;
      }
    }
    return true;
  },

  // The actual flood fill implementation
  fill: function (
    imageData,
    getPointOffsetFn,
    point,
    color,
    target,
    tolerance,
    width,
    height
  ) {
    var directions = [
        [1, 0],
        [0, 1],
        [0, -1],
        [-1, 0],
      ],
      points = [{ x: point.x, y: point.y }],
      queue = [],
      seen = new Set(),
      offset = getPointOffsetFn(point.x, point.y),
      key = `${point.x},${point.y}`,
      minX = width,
      minY = height,
      maxX = 0,
      maxY = 0;

    queue.push(offset);
    seen.add(key);

    var x, y, x2, y2, key, i;
    while (queue.length > 0) {
      offset = queue.shift();
      x = (offset / 4) % width;
      y = Math.floor(offset / (4 * width));

      if (!FloodFill.withinTolerance(imageData, offset, target, tolerance)) {
        continue;
      }

      for (i = 0; i < 4; i++) {
        imageData[offset + i] = color[i];
      }

      // Update the bounding box of the filled area
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;

      for (i = 0; i < directions.length; i++) {
        x2 = x + directions[i][0];
        y2 = y + directions[i][1];
        key = `${x2},${y2}`;

        if (x2 >= 0 && y2 >= 0 && x2 < width && y2 < height && !seen.has(key)) {
          queue.push(getPointOffsetFn(x2, y2));
          seen.add(key);
        }
      }
    }

    return { minX, minY, maxX, maxY };
  },
};

var fcanvas;
var fillColor = "#f00";
var fillTolerance = 2;

export function fill(canvas, color, tolerance) {
  fcanvas = canvas;
  fillColor = color;
  fillTolerance = tolerance;
}

function hexToRgb(hex, opacity) {
  opacity = Math.round(opacity * 255) || 255;
  hex = hex.replace("#", "");
  var rgb = [],
    re = new RegExp("(.{" + hex.length / 3 + "})", "g");
  hex.match(re).map(function (l) {
    rgb.push(parseInt(hex.length % 2 ? l + l : l, 16));
  });
  return rgb.concat(opacity);
}

export function toggleFloodFill(enable) {
  if (!enable) {
    fcanvas.off("mouse:down");
    fcanvas.selection = true;
    fcanvas.forEachObject(function (object) {
      object.selectable = true;
    });
    return;
  }

  fcanvas.discardActiveObject().renderAll(); // Hide object handles!
  fcanvas.selection = false;
  fcanvas.forEachObject(function (object) {
    object.selectable = false;
  });

  fcanvas.on({
    "mouse:down": function (e) {
      var mouse = fcanvas.getPointer(e.e),
        mouseX = Math.round(mouse.x * 2),
        mouseY = Math.round(mouse.y * 2),
        canvas = fcanvas.lowerCanvasEl,
        context = canvas.getContext("2d"),
        parsedColor = hexToRgb(fillColor),
        imageData = context.getImageData(0, 0, canvas.width, canvas.height),
        getPointOffset = function (x, y) {
          return 4 * (y * imageData.width + x);
        },
        targetOffset = getPointOffset(mouseX, mouseY),
        target = imageData.data.slice(targetOffset, targetOffset + 4);

      if (FloodFill.withinTolerance(target, 0, parsedColor, fillTolerance)) {
        // Trying to fill something which is (essentially) the fill color
        console.log("Ignore... same color");
        return;
      }

      // Perform flood fill
      var bounds = FloodFill.fill(
        imageData.data,
        getPointOffset,
        { x: mouseX, y: mouseY },
        parsedColor,
        target,
        fillTolerance,
        imageData.width,
        imageData.height
      );

      // Create a new canvas to extract the filled region
      var filledWidth = bounds.maxX - bounds.minX + 1;
      var filledHeight = bounds.maxY - bounds.minY + 1;

      var tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = filledWidth;
      tmpCanvas.height = filledHeight;
      var tmpCtx = tmpCanvas.getContext("2d");

      var filledImageData = tmpCtx.createImageData(filledWidth, filledHeight);

      for (var y = bounds.minY; y <= bounds.maxY; y++) {
        for (var x = bounds.minX; x <= bounds.maxX; x++) {
          var srcOffset = getPointOffset(x, y);
          var dstOffset = 4 * ((y - bounds.minY) * filledWidth + (x - bounds.minX));
          if (FloodFill.withinTolerance(imageData.data, srcOffset, parsedColor, fillTolerance)) {
            for (var i = 0; i < 4; i++) {
              filledImageData.data[dstOffset + i] = imageData.data[srcOffset + i];
            }
          } else {
            // Make sure the pixel is transparent if it's not within the filled region
            filledImageData.data[dstOffset + 3] = 0;
          }
        }
      }
      tmpCtx.putImageData(filledImageData, 0, 0);

      var newImage = new fabric.Image(tmpCanvas, {
        left: bounds.minX,
        top: bounds.minY,
        selectable: true,
      });

      fcanvas.add(newImage);
      fcanvas.renderAll();
    },
  });
}
