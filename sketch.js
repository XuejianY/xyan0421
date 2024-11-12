let img;
let numSegments = 70; // Controls the number of segments
let segmentSize = []; // Stores the current size of each dot
let targetSegmentSize = []; // Stores the target size of each dot
let segmentPositions = []; // Stores the position of each dot
let segmentSizeOriginal; // Stores the original size of the dots
const easing = 0.05; // Easing coefficient

let ripples = []; // Stores all Ripple objects

function preload() {
  img = loadImage('assets/Claude_Monet,_Saint-Georges_majeur_au_crépuscule.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Calculate segmentSizeOriginal
  let scaleFactor = min(width / img.width, height / img.height);
  let displayWidth = img.width * scaleFactor;
  let displayHeight = img.height * scaleFactor;
  segmentSizeOriginal = min(displayWidth / numSegments, displayHeight / numSegments);

  // Initialize the size, target size, and position of each dot
  let index = 0;
  for (let y = 0; y < numSegments; y++) {
    for (let x = 0; x < numSegments; x++) {
      // Initialize size
      let initialSize = random(5, segmentSizeOriginal);
      segmentSize[index] = initialSize;
      targetSegmentSize[index] = random(5, segmentSizeOriginal);

      // Calculate the position of each dot
      let segXPos = x * segmentSizeOriginal;
      let segYPos = y * segmentSizeOriginal;
      let posX = (width - displayWidth) / 2 + segXPos + segmentSizeOriginal / 2;
      let posY = (height - displayHeight) / 2 + segYPos + segmentSizeOriginal / 2;
      segmentPositions[index] = createVector(posX, posY);

      index++;
    }
  }

  // Use setInterval to automatically generate ripples at intervals
  setInterval(() => {
    // Generate ripples at a random position
    let randomX = random(width);
    let randomY = random(height);
    let newRipple = new Ripple(randomX, randomY);
    ripples.push(newRipple);
  }, 2000); // Generates a ripple every 2 seconds
}

function draw() {
  background(255);

  let index = 0; // Used to iterate through the dot array

  // Update each Ripple's radius and lifespan
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    // Remove the Ripple if it has expired
    if (ripples[i].isFinished) {
      ripples.splice(i, 1);
    }
  }

  for (let y = 0; y < numSegments; y++) {
    for (let x = 0; x < numSegments; x++) {
      // Get the position of each dot
      let pos = segmentPositions[index];

      // Get the color of each dot
      let scaleFactor = min(width / img.width, height / img.height);
      let originalX = ((pos.x - (width - img.width * scaleFactor) / 2) / scaleFactor) - segmentSizeOriginal / (2 * scaleFactor);
      let originalY = ((pos.y - (height - img.height * scaleFactor) / 2) / scaleFactor) - segmentSizeOriginal / (2 * scaleFactor);
      let segmentColour = img.get(originalX, originalY);

      // Check if each dot is affected by any Ripple
      for (let ripple of ripples) {
        let d = dist(pos.x, pos.y, ripple.x, ripple.y);
        // If the dot is within the range of the Ripple, change its target size
        if (abs(d - ripple.radius) < segmentSizeOriginal) {
          targetSegmentSize[index] = segmentSizeOriginal * 1.5; // Scale to 1.5 times the original size
        }
      }

      // Update the size of each dot using an easing function
      segmentSize[index] = lerp(segmentSize[index], targetSegmentSize[index], easing);

      // When easing is close to the target value, reset to a random target size
      if (abs(segmentSize[index] - targetSegmentSize[index]) < 0.1) {
        targetSegmentSize[index] = random(5, segmentSizeOriginal);
      }

      // Save the current drawing state
      push();
      // Move to the position of the dot
      translate(pos.x, pos.y);
      // Rotate the dot
      rotate(frameCount * 0.01 + (x + y));
      // Scale the dot, ensuring uniform scaling in the x and y directions
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

function mousePressed() {
  // Create a new Ripple at the mouse click position
  let newRipple = new Ripple(mouseX, mouseY);
  ripples.push(newRipple);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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
    // If the radius exceeds the maximum, mark as finished
    if (this.radius > this.maxRadius) {
      this.isFinished = true;
    }
  }
}
