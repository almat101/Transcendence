import { Ball } from './ball.js';
import { Paddle } from './paddle.js';

export function gameLoop(canvas) {
  const ctx = canvas.getContext('2d');
  const ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 4, 3, canvas);
  const paddle = new Paddle(canvas);

  function update() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw and move ball
    ball.draw();
    ball.move();

    // Draw paddle
    paddle.draw();

    // Check for paddle collision
    if (
      ball.y + ball.radius > canvas.height - paddle.height - 10 &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      ball.speedY = -ball.speedY;
    }

    // Request next frame
    requestAnimationFrame(update);
  }

  update();
}
