import { gameLoop } from './gameLoop.js';
import { showMenu } from './menu.js';
import { showWinningScreen } from './winningScreen.js';

const canvas = document.getElementById('gameCanvas');
const scores = document.getElementById('scores');

function startGame() {
  scores.style.display = 'block';
  canvas.style.display = 'block';
  gameLoop(canvas, endGame);
}

function endGame(winner) {
  canvas.style.display = 'none';
  scores.style.display = 'none';
  showWinningScreen(winner, restartGame);
}

function restartGame() {
  showMenu(startGame);
}

document.addEventListener('DOMContentLoaded', () => {
  showMenu(startGame);
});
