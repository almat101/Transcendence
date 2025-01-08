import { gameLoop} from './gameLoop.js'
import { showMenu } from './menu.js';
import { showWinningScreen } from './winningScreen.js'

export function initializeGame() {
  const canvas = document.getElementById('gameCanvas');
  const scores = document.getElementById('scores');
  const player1ScoreElement = document.getElementById('player1Score');
  const player2ScoreElement = document.getElementById('player2Score');

  function startGame() {
    console.log('Starting game!');
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
    player1ScoreElement.textContent = 'Player 1: 0';
    player2ScoreElement.textContent = 'Player 2: 0';
    showMenu(startGame);
  }

  showMenu(startGame);
}
