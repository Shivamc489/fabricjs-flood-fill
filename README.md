# fabricjs-flood-fill

## Overview
`fabricjs-flood-fill` is a module that provides flood fill functionality for the Fabric.js canvas library. It allows you to fill a contiguous area of pixels with a specified color, similar to the paint bucket tool in image editing software.

## Motivation
This module was modified from its original implementation to improve performance. The previous implementation was very slow, especially for large images or complex fill areas. The new implementation uses a more efficient algorithm to speed up the flood fill process.
Original Implementation can be found at -> [JSFiddle](https://jsfiddle.net/av01d/dfvp9j2u/)

## Installation
To use `fabricjs-flood-fill`, simply include the `flood_fill.js` script in your project.

## Usage

### Importing the Module
```typescript
import { fill, toggleFloodFill } from './flood_fill.js';
```

### Initializing Flood Fill
To initialize the flood fill functionality, call the `fill` function with your Fabric.js canvas instance, the fill color, and the tolerance level.

```typescript
const canvas = new fabric.Canvas('c');
const fillColor = '#ff0000'; // Red color
const tolerance = 2;

fill(canvas, fillColor, tolerance);
```

### Enabling/Disabling Flood Fill
To enable or disable the flood fill functionality, use the `toggleFloodFill` function.

```typescript
// Enable flood fill
toggleFloodFill(true);

// Disable flood fill
toggleFloodFill(false);
```

## Example
Here's a complete example of how to use the flood fill functionality with Fabric.js:

```typescript
import { fill, toggleFloodFill } from './flood_fill.js';

// Create a Fabric.js canvas
const canvas = new fabric.Canvas('c');

// Set the fill color and tolerance
const fillColor = '#ff0000'; // Red color
const tolerance = 2;

// Initialize flood fill
fill(canvas, fillColor, tolerance);

// Enable flood fill
toggleFloodFill(true);

// Add some objects to the canvas
const rect = new fabric.Rect({
  left: 100,
  top: 100,
  fill: 'blue',
  width: 200,
  height: 200,
});

canvas.add(rect);
```

## Author
- Original Author: Arjan Haverkamp (@av01d)
- Modified by: Shivam Chauhan (@shivamc489)

This was all possible thanks to original implementation of Arjan Haverkamp.
You can check him out at -> [GitHub](https://github.com/av01d)