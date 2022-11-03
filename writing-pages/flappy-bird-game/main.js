'use strict';

const gameSize = 200;
const birdSize = 18;
const pipeWidth = 24;
const gapSize = 72;
const moveSpeed = 50;
const gravityForce = 400;
const lives = 3;
const saveZone = 15;
const maxPipesOnScreen = Math.ceil((gameSize + gapSize) / (gapSize + pipeWidth)) * 2;

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

function getRandom(max) {
  return Math.floor(Math.random() * max);
}

let hit = 0;
let run = false;
let score = 0;

const bird = {
  pos: getPos(50, 100),
  acc: 0,
  img: new Image(),
}

function getPos(x, y){
  return {
    x: x,
    y: gameSize - y,
  }
}

function circleRectColliding(circle, rect) {
  const distX = Math.abs(circle.x - rect.x - rect.w / 2);
  const distY = Math.abs(circle.y - rect.y - rect.h / 2);

  if (distX > (rect.w / 2 + circle.r)) { return false; }
  if (distY > (rect.h / 2 + circle.r)) { return false; }

  if (distX <= (rect.w / 2)) { return true; } 
  if (distY <= (rect.h / 2)) { return true; }

  const dx = distX - rect.w / 2;
  const dy = distY - rect.h / 2;

  return (dx * dx + dy * dy <= (circle.r * circle.r));
}

function easeOutQuad(t) {
  if (t > 0) return t*(2-t);
  return t;
}

function drawBird({x, y}, degress) {
  const radius = birdSize / 2;

  ctx.save();

  ctx.translate(x, y);
  ctx.translate(radius, -radius);
  ctx.rotate(degress * Math.PI / 180 )

  ctx.drawImage(bird.img, -radius, -radius);
  // ctx.fillStyle = 'blue';
  // ctx.fillRect(-radius, -radius, birdSize, birdSize);

  // ctx.fillStyle = 'yellow';
  // ctx.beginPath();
  // ctx.arc(0, 0, radius, 0, Math.PI * 2, true);
  // ctx.closePath();
  // ctx.fill();

  // ctx.fillStyle = "red"
  // ctx.fillRect(0, - 1, radius, 2);

  ctx.restore();
}



function drawPipe({ x, y} , height, hit) {
  ctx.fillStyle = hit ? 'red' : "green";
  ctx.fillRect(x, y - height, pipeWidth, height)
}

const pipes = [];

function pairGen() {
  const availableHeight = gameSize - gapSize - (saveZone * 2)

  const pairWhole = getRandom(availableHeight);

  pipes.push({
    pos: getPos((gameSize ), 0),
    height: pairWhole + saveZone,
    hit: false,
    score: false,
  })
   pipes.push({
    pos: getPos((gameSize ), pairWhole + gapSize + saveZone),
    height: gameSize - (pairWhole + gapSize) - saveZone,
    hit: false,
    score: false,
  })
}

pairGen();

function render(){
  ctx.clearRect(0, 0, gameSize, gameSize);


  pipes.forEach(({pos, height, hit}) => {
    drawPipe(pos,height,hit)
  })
  
  drawBird(bird.pos, easeOutQuad(bird.acc) * 90) ;

    ctx.fillStyle = 'white';
  ctx.font = '13px monospace';
  ctx.fillText(`lives: ${lives - hit}`, 10, 20);
  ctx.fillText(`score: ${score / 2}`, 10, 30);
}



function gravity(delta) {
  const speed = 1000 / gravityForce;
  
  bird.acc += delta / 1000;
  if (bird.acc > 1) bird.acc = 1;
  
  bird.pos.y += (delta / speed ) * easeOutQuad(bird.acc)

  if (bird.pos.y > gameSize) bird.pos.y = gameSize
}

function move(delta) {
  const speed = 1000/ moveSpeed;
  const shift = (delta / speed);

  pipes.forEach(({ pos }) => {
    pos.x -= shift; 
  })
  return shift
}

function hitReg() {
  const radius = birdSize / 2;
  const circle = {
    x: bird.pos.x + radius,
    y: gameSize - bird.pos.y + radius,
    r: radius,
  }

  pipes.forEach((pipe) => {
    const rect = {
      x: pipe.pos.x,
      y: gameSize - pipe.pos.y,
      w: pipeWidth,
      h: pipe.height
    }
    if (pipe.hit === false && circleRectColliding(circle, rect)) {
      pipe.hit = true;
      hit += 1
    }
  })
}

function regScore() {
  pipes.forEach((pipe) => {
    const behind = bird.pos.x > (pipe.pos.x + pipeWidth)
    if (behind && pipe.score === false) {
      pipe.score = true;
      score += 1;
    }
  })
}


let lastTime = 0;
let distance = 0;

function loop(execTime){
  const delta = execTime - lastTime;
  lastTime = execTime;

  if (run) {
    gravity(delta);

  if (hit < lives) distance += move(delta);
  
  //move(delta);
  if (distance > (gapSize + pipeWidth)) {
    pairGen();
    distance = 0;
  }

  if (pipes.length > maxPipesOnScreen) {
    pipes.splice(0, 2)
  }
  hitReg();
  regScore();
  render();
  }
  
  
  window.requestAnimationFrame(loop)
}

function init(){
  run = false;
  hit = 0;
  score = 0;
  pipes.splice(0, pipes.length);
  bird.acc = 0;
  bird.pos = getPos(50, 100);
  render();
}



bird.img.addEventListener('load', () => {
  init();
  loop(0);
})
bird.img.src = './bird.png'

window.addEventListener('keydown', () => {
  if (run === false) run = true
  if (hit < lives) bird.acc = -0.35
  else init();
})
