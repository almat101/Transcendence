import { Ball } from './ball.js';
import { Paddle } from './paddle.js';

export function gameLoop(canvas) {
  const ctx = canvas.getContext('2d');
  const ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 4, 3, canvas);
  const paddle1 = new Paddle(canvas, 10, 'w', 's');
  const paddle2 = new Paddle(canvas, canvas.width - 20, 'ArrowUp', 'ArrowDown');

  function update() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    // Request next frame
    requestAnimationFrame(update);
  }

  update();
}
