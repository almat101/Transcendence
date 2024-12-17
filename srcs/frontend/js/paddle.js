export class Paddle {
	constructor(canvas) {
	  this.width = 100;
	  this.height = 10;
	  this.x = (canvas.width - this.width) / 2;
	  this.speed = 20;
	  this.canvas = canvas;
	  this.context = canvas.getContext('2d');

	  // Listen for keyboard input
	  document.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowLeft' && this.x > 0) {
		  this.x -= this.speed;
		} else if (event.key === 'ArrowRight' && this.x < canvas.width - this.width) {
		  this.x += this.speed;
		}
	  });
	}

	draw() {
	  this.context.fillStyle = 'red';
	  this.context.fillRect(this.x, this.canvas.height - this.height - 10, this.width, this.height);
	}
  }
