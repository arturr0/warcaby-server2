var socket = io.connect('http://localhost:3000');

let Board = [];

function Area(rectCenter, rectCenterY, row, column, isBlack, free) {
  this.rectCenter = rectCenter;
  this.rectCenterY = rectCenterY;
  this.row = row;
  this.column = column;
  this.isBlack = isBlack;
  this.free = free;
}

let areaCenter = 60;
let row = 0;
let column = 0;

let targetPos;
let movingPawn = null;
let pawnCompletedMove = false;

let Pawns = [];

function Pawn(rectCenter, rectCenterY, row, column, isRed, queen) {
  this.rectCenter = rectCenter;
  this.rectCenterY = rectCenterY;
  this.row = row;
  this.column = column;
  this.isRed = isRed;
  this.queen = queen;
  this.pos = createVector(rectCenter, rectCenterY);
  this.targetPos = null;
  this.update = function() {
    if (this.targetPos) {
      let vel = this.targetPos.copy().sub(this.pos);
      if (vel.mag() > 1) {
        vel.setMag(1);
        this.pos.add(vel);
      } else {
        this.pos = this.targetPos;
        this.targetPos = null;
        this.rectCenter = this.pos.x;
        this.rectCenterY = this.pos.y;
        pawnCompletedMove = true; // Mark the move as completed
      }
    }
  };

  this.show = function() {
    fill(this.isRed ? 'red' : 'green');
    circle(this.pos.x, this.pos.y, 50);
  };
}

let X;
let Y;
let pawnSelected = false;
let pawnPlayed = 0;

socket.on('animate', function(data) {
  let newPos = createVector(data.x, data.y);
  let targetPawn = Pawns.find(pawn => pawn.rectCenter === data.oldX && pawn.rectCenterY === data.oldY);
  if (targetPawn) {
    targetPawn.targetPos = newPos;
    movingPawn = targetPawn;
  }
});

function setup() {
  const myCanvas = createCanvas(544, 544);
  myCanvas.parent('game');
  rectMode(CENTER);
  background(220);

  let isBlack = true;

  for (let i = 0; i < 8; i++) {
    row++;
    column = 0;
    isBlack = !isBlack;

    for (let j = 0; j < 8; j++) {
      let rectCenter = column * 68 + 34;
      column++;
      let area = new Area(rectCenter, row * 68 - 34, row, column, isBlack, true);
      Board.push(area);
      
      isBlack = !isBlack;
    }
  }

  for (let j = 0; j < Board.length; j++) {
    if (Board[j].isBlack && Board[j].row < 4) {
      Board[j].free = false;
      let pawn = new Pawn(Board[j].rectCenter, Board[j].row * 68 - 34, Board[j].row, Board[j].column, true, false);
      Pawns.push(pawn);
    } else if (Board[j].isBlack && Board[j].row > 5) {
      Board[j].free = false;
      let pawn = new Pawn(Board[j].rectCenter, Board[j].row * 68 - 34, Board[j].row, Board[j].column, false, false);
      Pawns.push(pawn);
    }
  }
}

function draw() {
  background(220);

  for (let i = 0; i < Board.length; i++) {
    let color = Board[i].isBlack ? 0 : 255;
    fill(color);
    rect(Board[i].rectCenter, Board[i].rectCenterY, 68, 68);
  }

  for (let i = 0; i < Pawns.length; i++) {
    if (Pawns[i] !== movingPawn) {
      Pawns[i].show();
    }
  }

  if (movingPawn) {
    movingPawn.update();
    movingPawn.show();
  }

  if (pawnCompletedMove) {
    movingPawn = null; // Reset movingPawn after completing the move
    pawnCompletedMove = false;
  }
}

function mouseClicked() {
  X = mouseX;
  Y = mouseY;

  if (pawnSelected) {
    targetPos = createVector(X, Y);
    let movingPawnOldPos = { x: Pawns[pawnPlayed].rectCenter, y: Pawns[pawnPlayed].rectCenterY };
    Pawns[pawnPlayed].targetPos = targetPos;
    movingPawn = Pawns[pawnPlayed];
    pawnSelected = false;
    socket.emit('move', { x: targetPos.x, y: targetPos.y, oldX: movingPawnOldPos.x, oldY: movingPawnOldPos.y }); // Send the move to the server
  } else {
    for (let i = 0; i < Pawns.length; i++) {
      let p = Pawns[i];
      if (X > p.rectCenter - 34 && X < p.rectCenter + 34 &&
          Y > p.rectCenterY - 34 && Y < p.rectCenterY + 34) {
        pawnSelected = true;
        pawnPlayed = i;
        break;
      }
    }
  }
}
