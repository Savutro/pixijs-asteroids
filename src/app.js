import * as PIXI from 'pixi.js';
import Asteroid from './asteroid.js';
import Pellet from './pellet.js';
import Player from "./player.js";

// Set field size
const gameSize = 600; 

// Create / Define app
const app = new PIXI.Application({
  width: gameSize,
  height: gameSize,
  backgroundColor: 0x000000,
});

app.view.style.position = 'absolute';
app.view.style.left = `${(window.innerWidth - gameSize) / 2}px`;
app.view.style.top = `${(window.innerHeight - gameSize) / 2}px`;

document.body.appendChild(app.view);

const player = new Player(app);
app.stage.addChild(player);

// Set points
let points = 0;
const pointsText = new PIXI.Text('Points: 0', { fill: 0xFF0000, fontSize: 20 }); 
pointsText.position.set(gameSize - 150, 20);

// Set life
let lives = 3; 
const lifeText = new PIXI.Text(`Lives: ${lives}`, { fill: 0xFF0000, fontSize: 20 });
lifeText.position.set(gameSize - 150, 50);

// Array for pellets and their speed
const pellets = [];
const pelletSpeed = 5;

// Asteroid array
const asteroids = [];

// Overheat mechanic
const maxPellets = 3; 
let coolDown = false;

// Generate asteroids
for (let i = 0; i < 5; i++) {
  const asteroid = new Asteroid(50, app); // @param Size of polygon
  app.stage.addChild(asteroid);
  asteroids.push(asteroid);
}

// Add stats to screen
app.stage.addChild(pointsText, lifeText);

// Main game loop
app.ticker.add((delta) => {
  const keys = {};
  window.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (e.code === "Space") {
    shoot();
  }
  });
  window.addEventListener("keyup", (e) => (keys[e.code] = false));

  // Update player movement
  if (keys["KeyW"]) {
    const acceleration = 0.1;
    player.vx += Math.sin(player.rotation) * acceleration;
    player.vy -= Math.cos(player.rotation) * acceleration;
  }
  if (keys["KeyA"]) {
    player.rotation -= 0.05;
  }
  if (keys["KeyD"]) {
    player.rotation += 0.05;
  }

  // Values to make throttle feel "spacey"
  player.vx *= 0.98;
  player.vy *= 0.98;

  // Update player location
  player.x += player.vx;
  player.y += player.vy;

  // Update pellet location
  for (const pellet of pellets) {
    pellet.x += pellet.vx;
    pellet.y += pellet.vy;

    // Game boundary for pellets
    if (
      pellet.x < 0 ||
      pellet.x > app.screen.width ||
      pellet.y < 0 ||
      pellet.y > app.screen.height
    ) {
      app.stage.removeChild(pellet);
      pellets.splice(pellets.indexOf(pellet), 1);
    }
  }

  // Update asteroid location
  for (const asteroid of asteroids) {
    asteroid.x += asteroid.vx;
    asteroid.y += asteroid.vy;

    // Game boundary for asteroids
    if (asteroid.x > app.screen.width) {
      asteroid.x = 0;
    } else if (asteroid.x < 0) {
      asteroid.x = app.screen.width;
    }
    if (asteroid.y > app.screen.height) {
      asteroid.y = 0;
    } else if (asteroid.y < 0) {
      asteroid.y = app.screen.height;
    }
  }

  // Game boundary => Player leaves screen on the left side => Pops out from the right side of the screen
  if (player.x > app.screen.width) {
    player.x = 0;
  } else if (player.x < 0) {
    player.x = app.screen.width;
  }
  if (player.y > app.screen.height) {
    player.y = 0;
  } else if (player.y < 0) {
    player.y = app.screen.height;
  }

  // Check collisions with asteroids
  for (const asteroid of asteroids) {
    // Player --- Asteroid
    if (checkCollision(player, asteroid)) {
      // Reduce lives
      lives--;
      lifeText.text = `Lives: ${lives}`;

      // Reset player to center of screen
      player.x = app.screen.width / 2;
      player.y = app.screen.height / 2;

      // Game over condition
      if (lives <= 0) {
          showDialog('Game Over! /n Reload the page?', () => location.reload());
      }

      // Remove asteroid
      app.stage.removeChild(asteroid);
      asteroids.splice(asteroids.indexOf(asteroid), 1);
    }

    for (const pellet of pellets){
      if (checkCollision(pellet, asteroid)) {
        // Remove pellet
        app.stage.removeChild(pellet);
        pellets.splice(pellets.indexOf(pellet), 1);
  
        // Break asteroid or remove it if too small
        if (asteroid.size > 10) {
          breakDownAsteroid(asteroid);
        } else {
          app.stage.removeChild(asteroid);
          asteroids.splice(asteroids.indexOf(asteroid), 1);
        }
        break; 
      }
    }
  }
  if (asteroids.length === 0) {
    showDialog('Congratulations! You Win! /n Reload the page?', () => location.reload());
  }
});

function shoot() {
  if (pellets.length < maxPellets && !coolDown) {
    const pellet = new Pellet();
    pellet.x = player.x;
    pellet.y = player.y;
    pellet.vx = Math.sin(player.rotation) * pelletSpeed;
    pellet.vy = -Math.cos(player.rotation) * pelletSpeed;
    app.stage.addChild(pellet);
    pellets.push(pellet);

    // Update overheat
    coolDown = true;
    setTimeout(() => (coolDown = false), 500); // 1000 milliseconds coolDown
  }
}

// Collision detection
function checkCollision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Breakdown of asteroids
function breakDownAsteroid(asteroid) {
  const newSize = asteroid.size / 2;
  const newAsteroid1 = new Asteroid(newSize);
  const newAsteroid2 = new Asteroid(newSize);
  newAsteroid1.x = asteroid.x;
  newAsteroid1.y = asteroid.y;
  newAsteroid2.x = asteroid.x;
  newAsteroid2.y = asteroid.y;
  app.stage.addChild(newAsteroid1);
  app.stage.addChild(newAsteroid2);
  asteroids.push(newAsteroid1, newAsteroid2);
  app.stage.removeChild(asteroid);
  asteroids.splice(asteroids.indexOf(asteroid), 1);

  // Increase points upon destruction
  points += 10;
  pointsText.text = `Points: ${points}`;
}
