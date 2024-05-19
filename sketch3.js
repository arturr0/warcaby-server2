let pawn;
let targetPos;

function Pawn(x, y, r) {
  this.pos = createVector(x, y);
  this.r = r;
  this.speed = 10;

  this.update = function() {
    if (targetPos) {
      let vel = targetPos.copy().sub(this.pos);
      
      if (vel.mag() > this.speed) { // Move only if the distance is greater than the speed
        vel.setMag(this.speed);
        this.pos.add(vel);
      } else {
        this.pos = targetPos; // Snap to the target position to avoid small vibrations
        targetPos = null; // Reset target position once reached
      }
    }
  }

  this.show = function() {
    fill(255);
    circle(this.pos.x, this.pos.y, this.r * 2);
  }
}

function setup() {
  let canvas = createCanvas(500, 500);
  canvas.parent('sketch-holder');
  pawn = new Pawn(20, 20, 20);
  targetPos = createVector(pawn.pos.x, pawn.pos.y);
}

function draw() {
  background(0);
  pawn.update();
  pawn.show();
}

function mouseClicked() {
  targetPos = createVector(mouseX, mouseY);
}
