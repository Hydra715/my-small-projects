'use strict';

/*
1. Определение модели данных
2. Отрисуем персонажа
3. Отрисуем врагов
4. Отрисуем выстрелы
5. Добавим персонажа управления 
6. Добавим логику наступления противника
7. Добавим логику устранения противников
8. Добавим логику получения повреждения 
*/

const gameSize = 640;
const playerSize = 32;
const enemySize = 24;
const playerSpeed = 200;
const enemySpeed = 150;
const bulletSpeed = 1000;

const game = {
  player: {
    pos: {
      x: gameSize / 2,
      y: gameSize / 2,
    },
    dir: 0,
    health: 100,
  },
  cursor: {
    pos: {
      x: 0,
      y: 0,
    },
    show: false,
  },
  enemies: [],
  bullets: [],
}

const $screen = document.getElementById('screen');
const ctx = $screen.getContext('2d'); //2d контекст canvas

function deg2rad(deg) {
  return deg / 180 * Math.PI //пересчёт deg в rad
}

function drawPlayer() {
  const { pos: { x, y }, dir } = game.player;
  const radius = playerSize / 2;

  ctx.save(); //сохраняем контекст где он сейчас находится

  ctx.translate(x, y); //переносим игрока в другую позицию(стартовую точку контекста)

  ctx.rotate(-89.5)
  ctx.rotate(deg2rad(dir))
  
  ctx.fillStyle = "#172"
  ctx.beginPath(); //начинаем линию
  ctx.arc(0, 0, radius, 0, Math.PI * 2, true ) //рисуем окружность
  ctx.closePath
  ctx.fill(); //заливаем окружность 
    
  ctx.fillStyle= '#333';
  ctx.fillRect(-2, 4, 4, radius)

  ctx.restore(); //перенос положения контекста обратно в пресейв (0,0)
}

function drawBullet(bullet) {
  const { pos: { x, y}, dir, prevPos} = bullet;

  ctx.save();

  ctx.translate(x, y); 
  ctx.rotate(-89.5)
  ctx.rotate(deg2rad(dir))

  ctx.fillStyle = '#000'
  ctx.fillRect(-1.5, -1, 3, 5);

  ctx.restore();

  ctx.strokeStyle = '#F44'
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(prevPos.x, prevPos.y);
  ctx.lineTo(x, y);
  ctx.stroke();
}

function render() {
  //ctx.clearRect(0, 0, gameSize, gameSize);
  ctx.fillStyle = '#999';
  ctx.fillRect(0, 0, gameSize, gameSize);

  game.bullets.forEach((drawBullet))
  drawPlayer();
  
}

function angle({x : x1, y : y1}, {x : x2, y : y2}) { //угол между курсором и игроком
  const dy = y2 - y1;
  const dx = x2 - x1;
  let theta = Math.atan2(dy, dx);
  theta *= 180 / Math.PI
  return theta
}

function movePlayer(delta) {
  const speed = 1000 / playerSpeed;
  const distance = delta / speed;
  const theta = Math.atan2(moveDirection.y, moveDirection.x) * 180 / Math.PI

  if (moveDirection.y !== 0 || moveDirection.x !== 0) {
    game.player.pos.x += Math.cos(theta * Math.PI / 180) * distance
    game.player.pos.y += Math.sin(theta * Math.PI / 180) * distance
  } 
}

function moveBullet(delta) {
  const speed = 1000 / bulletSpeed;
  const distance = delta / speed;

  game.bullets.forEach((bullet) => {
    const theta = bullet.dir;

    bullet.prevPos = {...bullet.pos}
    bullet.pos.x += Math.cos(theta * Math.PI / 180) * distance
    bullet.pos.y += Math.sin(theta * Math.PI / 180) * distance

    if ((bullet.prevPos.x < 0 || bullet.prevPos.x > gameSize) ||
      (bullet.prevPos.y < 0 || bullet.prevPos.y > gameSize)) {
      const index = game.bullets.indexOf(bullet);
      game.bullets.splice(index, 1)
    }
})  
}


let lastTime = 0;
function loop(execTime) { // работа всей игры
  const deltaTime = execTime - lastTime
  lastTime = execTime;

  game.player.dir = angle(game.player.pos, game.cursor.pos);

  movePlayer(deltaTime)
  moveBullet(deltaTime)
  
  render()

  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop); // ИНИЦИАЛИЗАЦИЯ, ПЕРВЫЙ ЛУП

function normalizeCoord(val) {
  const relCoord = Math.ceil(val / screenData.size * gameSize)
  return relCoord > 0 && gameSize < relCoord ? gameSize : relCoord || 0;
}

function mouseMove(event) {
  const { clientX, clientY } = event;

  game.cursor.pos.x = normalizeCoord(clientX - screenData.x);
  game.cursor.pos.y = normalizeCoord(clientY - screenData.y);
}

$screen.addEventListener('mousemove', mouseMove)

function createBullet(pos, dir) { //создать пулю
  const bullet = {
    dir,
    pos,
    prevPos: {...pos}
  }
  game.bullets.push(bullet);
}

function playerShoot() { //декоратор для массива пулек
  createBullet({...game.player.pos}, game.player.dir)
}

$screen.addEventListener('click', playerShoot);

function getScreenData() { //для правильного определения положения canvas на экране
  const {
    height: size,
    y,
    x
  } = $screen.getBoundingClientRect();

  return {
    size, y, x
  }
}

let screenData = getScreenData();

window.addEventListener('resize', () => {
  let screenData = getScreenData();
})

const keyPressed = new Map(); //MAP доступных кнопок для нажатия
const listenedKeys = ['w', 'a', 's', 'd', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']

let moveDirection = {
  x: 0, y:0,
}

function changeDirection() { //для диагонального перемещения
  let x = 0;
  let y = 0;

  if (keyPressed.has('w') || keyPressed.has('ArrowUp')) y = -1;
  if (keyPressed.has('s') || keyPressed.has('ArrowDown')) y += 1
  if (keyPressed.has('d') || keyPressed.has('ArrowRight')) x = 1
  if (keyPressed.has('a') || keyPressed.has('ArrowLeft')) x -= 1

  moveDirection = { x, y };

}

window.addEventListener('keydown', (e) => {
  if (listenedKeys.includes(e.key) && !keyPressed.has(e.key)) {
    keyPressed.set(e.key)
    changeDirection();
  }
})

window.addEventListener('keyup', (e) => {
  if (listenedKeys.includes(e.key)) {
    keyPressed.delete(e.key)
    changeDirection();
  }
})

window.addEventListener('blur', () => {
  keyPressed.clear();
  changeDirection();
})