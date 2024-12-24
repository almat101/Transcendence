export class Paddle {
	constructor(canvas, x, upKey, downKey) {
	  this.width = 10;
	  this.height = 100;
	  this.x = x;
	  this.y = (canvas.height - this.height) / 2;
	  this.speed = 20;
	  this.canvas = canvas;
	  this.context = canvas.getContext('2d');
	  this.upKey = upKey;
	  this.downKey = downKey;

	  // Listen for keyboard input
	  document.addEventListener('keydown', (event) => {
		if (event.key === this.upKey && this.y > 0) {
		  this.y -= this.speed;
		} else if (event.key === this.downKey && this.y < canvas.height - this.height) {
		  this.y += this.speed;
		}
	  });
	}

	draw() {
	  // Create a gradient for the paddle
	  const gradient = this.context.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
	  gradient.addColorStop(0, '#ff00ff'); // Start color
	  gradient.addColorStop(1, '#00ffff'); // End color

	  this.context.fillStyle = gradient;
	  this.context.fillRect(this.x, this.y, this.width, this.height);
	}
  }
