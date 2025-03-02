import { Ball } from './ball.js';
import { Paddle } from './paddle.js';

export function gameLoop(canvas, endGameCallback, player1Name = 'Player 1', player2Name = 'Player 2', isCpu = false) {
	const ctx = canvas.getContext('2d');
	const ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 4, 3, canvas);
	const paddle1 = new Paddle(canvas, 10, 'w', 's');
	const paddle2 = new Paddle(canvas, canvas.width - 20, 'ArrowUp', 'ArrowDown');

	let score1 = 0;
	let score2 = 0;

	const player1ScoreElement = document.getElementById('player1Score');
	const player2ScoreElement = document.getElementById('player2Score');
	player1ScoreElement.textContent = `${player1Name}: 0`;
	player2ScoreElement.textContent = `${player2Name}: 0`;

	function updateScores() {
		player1ScoreElement.textContent = `${player1Name}: ${score1}`;
		player2ScoreElement.textContent = `${player2Name}: ${score2}`;
	}
	updateScores();

	let keys = {};
	window.addEventListener('keydown', (e) => { keys[e.key] = true; });
	window.addEventListener('keyup', (e) => { keys[e.key] = false; });

	function drawDottedLine() {
		ctx.setLineDash([5, 15]);
		ctx.beginPath();
		ctx.moveTo(canvas.width / 2, 0);
		ctx.lineTo(canvas.width / 2, canvas.height);
		ctx.strokeStyle = 'white';
		ctx.stroke();
		ctx.setLineDash([]);
	}

	function update() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawDottedLine();
		ball.draw();
		ball.move();

		// Update left paddle (player-controlled using keys)
		paddle1.update(keys);

		// Update right paddle: if CPU mode, follow the ball; otherwise, use keys
		//here is the bheaviour of the cpu
		//we need to change it and it doens't need to be A* algorithm
		if (isCpu) {
			const paddleCenter = paddle2.y + paddle2.height / 2;
			if (ball.y > paddleCenter && paddle2.y < canvas.height - paddle2.height) {
				paddle2.y += paddle2.speed;
			} else if (ball.y < paddleCenter && paddle2.y > 0) {
				paddle2.y -= paddle2.speed;
			}
		} else {
			paddle2.update(keys);
		}

		paddle1.draw();
		paddle2.draw();

		// Collision and scoring logic
		if (
			(ball.x - ball.radius < paddle1.x + paddle1.width &&
			 ball.y > paddle1.y &&
			 ball.y < paddle1.y + paddle1.height) ||
			(ball.x + ball.radius > paddle2.x &&
			 ball.y > paddle2.y &&
			 ball.y < paddle2.y + paddle2.height)
		) {
			ball.speedX = -ball.speedX;
			ball.increaseSpeed();
		}
		if (ball.x - ball.radius < 0) {
			score2++;
			ball.reset();
			updateScores();
			if (score2 >= 5) {
				endGameCallback(player2Name);
				return;
			}
		} else if (ball.x + ball.radius > canvas.width) {
			score1++;
			ball.reset();
			updateScores();
			if (score1 >= 5) {
				endGameCallback(player1Name);
				return;
			}
		}
		requestAnimationFrame(update);
	}
	update();
}
