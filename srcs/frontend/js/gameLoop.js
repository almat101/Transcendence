import { Ball } from './ball.js';
import { Paddle } from './paddle.js';

export function gameLoop(canvas, endGame) {
  const ctx = canvas.getContext('2d');
  const ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 4, 3, canvas);
  const paddle1 = new Paddle(canvas, 10, 'w', 's');
  const paddle2 = new Paddle(canvas, canvas.width - 20, 'ArrowUp', 'ArrowDown');

  let score1 = 0;
  let score2 = 0;

  const player1ScoreElement = document.getElementById('player1Score');
  const player2ScoreElement = document.getElementById('player2Score');

  function updateScores() {
    player1ScoreElement.textContent = `Player 1: ${score1}`;
    player2ScoreElement.textContent = `Player 2: ${score2}`;
  }

  function drawDottedLine() {
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash
  }

  function update() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dotted line
    drawDottedLine();

    // Draw and move ball
    ball.draw();
    ball.move();

    // Draw paddles
    paddle1.draw();
    paddle2.draw();

    // Check for paddle collisions
    if (
      (ball.x - ball.radius < paddle1.x + paddle1.width && ball.y > paddle1.y && ball.y < paddle1.y + paddle1.height) ||
      (ball.x + ball.radius > paddle2.x && ball.y > paddle2.y && ball.y < paddle2.y + paddle2.height)
    ) {
      ball.speedX = -ball.speedX;
    }

    // Check for scoring
    if (ball.x - ball.radius < 0) {
      score2++;
      ball.reset();
      updateScores();
      if (score2 >= 5) {
        endGame('Player 2');
        return;
      }
    } else if (ball.x + ball.radius > canvas.width) {
      score1++;
      ball.reset();
      updateScores();
      if (score1 >= 5) {
        endGame('Player 1');
        return;
      }
    }

    // Request next frame
    requestAnimationFrame(update);
  }

  update();
}
