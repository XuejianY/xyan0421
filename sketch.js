let img;
let numSegments = 80; // Dot density
let segmentSize = []; // Stores the current size of each dot
let segmentPositions = []; // Stores the position of each dot
let segmentSizeOriginal; // Original size of the dots, equal in width and height
const easing = 0.1; // Easing coefficient

let ripples = []; // Stores all Ripple objects

// Initial wave parameters
let waveFrequency = 0.1; // Wave frequency
let waveSpeed = 0.05;    // Wave speed
let waveAmplitude;       // Wave amplitude, calculated in initializeSegments

// Define minimum and maximum sizes of the dots
let maxSize;
let minSize;

function preload() {
  img = loadImage('assets/Claude_Monet,_Saint-Georges_majeur_au_crépuscule.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Initialize dot sizes and positions
  initializeSegments();

  // Periodically change wave parameters using setInterval
  setInterval(changeWaveParameters, 5000); // Change wave parameters every 5 seconds
}

function draw() {
  background(255);

  let index = 0; // Used to iterate through the dot array

  // Update each Ripple's radius and lifespan
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    // Remove Ripple if it has expired
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

  // Calculate dot width and height
  let segmentWidth = displayWidth / numSegments;
  let segmentHeight = displayHeight / numSegments;

  // Use the smaller value as the original dot size to ensure circular dots
  segmentSizeOriginal = min(segmentWidth, segmentHeight);

  // Define minimum and maximum sizes of the dots
  maxSize = segmentSizeOriginal;
  minSize = maxSize * 0.7;

  // Calculate wave amplitude based on size
  waveAmplitude = (maxSize - minSize) / maxSize;

  for (let y = 0; y < numSegments; y++) {
    for (let x = 0; x < numSegments; x++) {
      let pos = segmentPositions[index];

      // Get the color of each dot
      let originalX = (pos.x - offsetX) / scaleFactor;
      let originalY = (pos.y - offsetY) / scaleFactor;
      let segmentColour = img.get(originalX, originalY);

      let targetSize;

      // Calculate the target size with the default wave effect, ranging between minSize and maxSize
      let phase = (x + y) * waveFrequency + frameCount * waveSpeed;
      let sizeVariation = (sin(phase) + 1) / 2; // Maps sin(phase) to [0, 1]
      targetSize = minSize + sizeVariation * (maxSize - minSize);

      // Check if each dot is affected by any Ripple
      for (let ripple of ripples) {
        let d = dist(pos.x, pos.y, ripple.x, ripple.y);
        // If the dot is within the Ripple's range, change its target size
        if (abs(d - ripple.radius) < maxSize) {
          targetSize = maxSize; // Set to maximum size, but not exceeding maxSize
        }
      }

      // Update the size of each dot using an easing function
      segmentSize[index] = lerp(segmentSize[index], targetSize, easing);

      // Save the current drawing state
      push();
      // Move to the dot's position
      translate(pos.x, pos.y);
      // Rotate the dot
      rotate(frameCount * 0.01 + (x + y));
      // Scale the dot
      let scaleSize = segmentSize[index] / segmentSizeOriginal;
      scale(scaleSize);

      // Draw the circular dot with the same width and height
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

  // Calculate offset to center the image
  let offsetX = (width - displayWidth) / 2;
  let offsetY = (height - displayHeight) / 2;

  // Calculate dot width and height
  let segmentWidth = displayWidth / numSegments;
  let segmentHeight = displayHeight / numSegments;

  // Use the smaller value as the original dot size to ensure circular dots
  segmentSizeOriginal = min(segmentWidth, segmentHeight);

  // Define minimum and maximum sizes of the dots
  maxSize = segmentSizeOriginal;
  minSize = maxSize * 0.7;

  // Calculate wave amplitude based on size
  waveAmplitude = (maxSize - minSize) / maxSize;

  // Initialize the size and position of each dot
  let index = 0;
  for (let y = 0; y < numSegments; y++) {
    for (let x = 0; x < numSegments; x++) {
      // Initialize size to maximum size
      segmentSize[index] = maxSize;

      // Calculate the position of each dot
      let posX = offsetX + x * segmentWidth + segmentWidth / 2;
      let posY = offsetY + y * segmentHeight + segmentHeight / 2;
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
  initializeSegments(); // Recalculate dot positions and sizes
}

function changeWaveParameters() {
  // Randomly change wave frequency and speed
  waveFrequency = random(0.05, 0.15);
  waveSpeed = random(0.02, 0.08);
  // Wave amplitude is calculated in initializeSegments, no need to change it here
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
