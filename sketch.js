let img;
let numSegments = 50;
let numSegmentsX;
let numSegmentsY;
let segmentSize = []; // Stores the current size of each dot
let segmentPositions = []; // Stores the position of each dot
let segmentSizeOriginal; // Original size of the dots
const easing = 0.1;

let ripples = []; // Stores all Ripple objects

// Initial wave parameters
let waveFrequency = 0.1;
let waveSpeed = 0.05;
let waveAmplitude;

// Define minimum and maximum sizes of the dots
let maxSize;
let minSize;

function preload() {
  img = loadImage('assets/Claude_Monet,_Saint-Georges_majeur_au_crépuscule.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Initialize the size and position of dots
  initializeSegments();

  // Change wave parameters every 5 seconds
  setInterval(changeWaveParameters, 5000);
}

function draw() {
  background(255);

  let index = 0; // Used to iterate through the dot array

  // Update each Ripple's radius and lifespan，remove the Ripple if it has expired
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    if (ripples[i].isFinished) {
      ripples.splice(i, 1);
    }
  }

  // Calculate scaleFactor and display dimensions
  let scaleFactor = min(width / img.width, height / img.height);
  let displayWidth = img.width * scaleFactor;
  let displayHeight = img.height * scaleFactor;
  let offsetX = (width - displayWidth) / 2;
  let offsetY = (height - displayHeight) / 2;

  // Use consistent spacing
  let segmentSpacing = segmentSizeOriginal;

  for (let y = 0; y < numSegmentsY; y++) {
    for (let x = 0; x < numSegmentsX; x++) {
      let pos = segmentPositions[index];

      // Get the color of each dot
      let originalX = (pos.x - offsetX) / scaleFactor;
      let originalY = (pos.y - offsetY) / scaleFactor;
      let segmentColour = img.get(originalX, originalY);

      let targetSize;

      // Calculate the target size with the default wave effect
      let phase = (x + y) * waveFrequency + frameCount * waveSpeed;
      let sizeVariation = (sin(phase) + 1) / 2; // Maps sin(phase) to [0, 1]
      targetSize = minSize + sizeVariation * (maxSize - minSize);

      // Check if each dot is affected by any Ripple
      for (let ripple of ripples) {
        let d = dist(pos.x, pos.y, ripple.x, ripple.y);
        // If the dot is within the Ripple's range, change its target size
        if (abs(d - ripple.radius) < maxSize) {
          targetSize = maxSize;
        }
      }

      // Update the size of each dot using an easing function
      segmentSize[index] = lerp(segmentSize[index], targetSize, easing);

      // Save the current drawing state
      push();
      // Move
      translate(pos.x, pos.y);
      // Rotate
      rotate(frameCount * 0.01 + (x + y));
      // Scale
      let scaleSize = segmentSize[index] / segmentSizeOriginal;
      scale(scaleSize);

      // Draw the circular dot
      fill(segmentColour);
      ellipseMode(CENTER);
      ellipse(0, 0, segmentSizeOriginal, segmentSizeOriginal);
      // Restore the previous drawing state
      pop();

      index++;
    }
  }
}

function initializeSegments() {
  // Clear arrays
  segmentSize = [];
  segmentPositions = [];

  // Calculate scaleFactor and display dimensions
  let scaleFactor = min(width / img.width, height / img.height);
  let displayWidth = img.width * scaleFactor;
  let displayHeight = img.height * scaleFactor;

  //center the image
  let offsetX = (width - displayWidth) / 2;
  let offsetY = (height - displayHeight) / 2;

  // Calculate uniform spacing
  let segmentSpacing = min(displayWidth, displayHeight) / numSegments;

  // Calculate the number of dots in x and y directions
  numSegmentsX = floor(displayWidth / segmentSpacing);
  numSegmentsY = floor(displayHeight / segmentSpacing);

  // Calculate spacing to ensure consistent spacing in x and y directions
  segmentSpacing = min(displayWidth / numSegmentsX, displayHeight / numSegmentsY);

  // Update the original size of dots
  segmentSizeOriginal = segmentSpacing;

  // Define minimum and maximum sizes of the dots
  maxSize = segmentSizeOriginal;
  minSize = maxSize * 0.7;

  // Calculate wave amplitude based on size
  waveAmplitude = (maxSize - minSize) / maxSize;

  // Initialize the size and position of each dot
  let index = 0;
  for (let y = 0; y < numSegmentsY; y++) {
    for (let x = 0; x < numSegmentsX; x++) {
      // Initialize size to maximum size
      segmentSize[index] = maxSize;

      // Calculate the position of each dot
      let posX = offsetX + x * segmentSpacing + segmentSpacing / 2;
      let posY = offsetY + y * segmentSpacing + segmentSpacing / 2;
      segmentPositions[index] = createVector(posX, posY);

      index++;
    }
  }
}

function mousePressed() {
  // Create a new Ripple at the mouse click position
  let newRipple = new Ripple(mouseX, mouseY);
  ripples.push(newRipple);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeSegments();
}

function changeWaveParameters() {
  // Randomly change wave frequency and speed
  waveFrequency = random(0.05, 0.15);
  waveSpeed = random(0.02, 0.08);
}

// Ripple class to manage ripple effects
class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0; // Current radius of the ripple
    this.speed = 5;  // Speed of ripple expansion
    this.maxRadius = max(width, height); // Maximum radius of the ripple
    this.isFinished = false; // Indicates if the ripple is finished
    // Use setTimeout to control the lifespan of the ripple
    setTimeout(() => {
      this.isFinished = true;
    }, 5000); // Ripple lasts for 5 seconds
  }

  update() {
    this.radius += this.speed;
    // Mark as finished if the radius exceeds the maximum value
    if (this.radius > this.maxRadius) {
      this.isFinished = true;
    }
  }
}
