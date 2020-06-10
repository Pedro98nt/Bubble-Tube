let maxSpeed = 0.1;
let gravity = -0.005;
let balls = [];
let ballIndex = 0;
let maxBalls = 250;
let maxRadius = 25;
let tube;

function setup() {
	noCursor();

	createCanvas(windowWidth, windowHeight);
	balls.length = 0;
	tube = new Tube(windowHeight, 300);

	setInterval(() => {
		if (balls.length < maxBalls) {
			let width = windowWidth / 2;
			balls.push(
				new Ball(
					random(tube.leftBound, tube.rightBound),
					tube.base,
					random(3, 8),
					ballIndex,
					balls
				)
			);
			ballIndex++;
		}
	}, 250);

	noStroke();
}

function draw() {
	background(64, 64, 64);

	tube.display();

	balls.forEach((ball) => {
		ball.collide();
		ball.move();
		ball.display();
	});
}

function windowResized() {
	waitress = millis() + 2000;
	if (fullscreen()) {
		resizeCanvas(displayWidth, displayHeight);
	} else {
		resizeCanvas(windowWidth, windowHeight);
	}

	showing = true;
	setup();
	background(64, 64, 64);
}

class Tube {
	constructor(height, width) {
		this.buffer = 30;
		this.height = height;
		this.width = width;
		this.x = windowWidth / 2 - this.width / 2;
		this.y = windowHeight / 2 - this.height / 2;
		this.base = this.y + this.height - this.buffer;
		this.top = this.y - this.buffer;
		this.leftBound = this.x + this.buffer;
		this.rightBound = this.x + this.width - this.buffer;
	}

	display() {
		noStroke();

		fill(color(128, 128, 128));
		rect(this.x - 5, this.y, this.width + 10, this.height);

		fill(color(0, 0, 64));
		rect(this.x, this.y, this.width, this.height);
	}
}

class Ball {
	constructor(xPos, yPos, radius, index, balls) {
		this.x = xPos;
		this.y = yPos;
		this.vx = 0;
		this.vy = 0;
		this.radius = radius;
		this.id = index;
		this.decreasingTarget;
	}

	joinBubbles(b) {
		if (!this.decreasingTarget && !b.decreasingTarget) {
			if (this.radius > b.radius) {
				b.decreasingTarget = this;
			} else {
				this.decreasingTarget = b;
			}

			let total = this.radius + b.radius;

			let bubbleMadness = setInterval(() => {
				if (b.decreasingTarget) {
					if (this.radius < total) {
						this.radius += 1;
					} else {
						bubbleMadness = null;
						_.remove(balls, (x) => x.id === b.id);
					}

					if (b.radius > 0) {
						b.radius -= 1;
					}
				} else {
					if (b.radius < total) {
						b.radius += 1;
					} else {
						bubbleMadness = null;
						_.remove(balls, (x) => x.id === this.id);
					}

					if (this.radius > 0) {
						this.radius -= 1;
					}
				}
			}, 100);
		}
	}

	collide() {
		_.forEach(balls, (b) => {
			if (b && b.id != this.id) {
				let dx = b.x - this.x;
				let dy = b.y - this.y;
				let distance = sqrt(dx * dx + dy * dy);
				let minDist = b.radius + this.radius;

				if (distance < minDist) {
					if (this.radius < maxRadius && b.radius < maxRadius) {
						this.joinBubbles(b);
					}
				}

				this.speedCheck(this);
				this.speedCheck(b);
			}
		});
	}

	speedCheck(b) {
		let currentMaxSpeed = maxSpeed * b.radius;

		if (abs(b.vy) >= currentMaxSpeed) {
			b.vy = -currentMaxSpeed;
		}
	}

	move() {
		this.vy += gravity;

		this.speedCheck(this);

		if (!this.decreasingTarget) {
			//move
			this.x += this.vx;
			this.y += this.vy;

			if (this.x + this.radius < tube.leftBound) {
				this.x = tube.leftBound - this.radius * 2;
			}

			if (this.x - this.radius > tube.rightBound) {
				this.x = tube.rightBound + this.radius * 2;
			}

			if (this.y < tube.top) {
				_.remove(balls, (x) => x.id === this.id);
			}

			if (this.y - this.radius > tube.base) {
				this.y = tube.base - this.radius * 2;
			}
		} else {
			let dx = this.decreasingTarget.x - this.x;
			let dy = this.decreasingTarget.y - this.y;
			let distance = sqrt(dx * dx + dy * dy);

			let angle = atan2(dy, dx);
			let targetX = this.x + cos(angle);
			let targetY = this.y + sin(angle);
			let ax = targetX - this.decreasingTarget.x;
			let ay = targetY - this.decreasingTarget.y;
			this.vx += ax;
			this.vy += ay;
		}
	}

	display() {
		stroke(256, 256, 256, 128);
		strokeWeight(2);
		fill(color(0, 0, 192, 128));
		ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
	}
}