// Spielfeldgrösse setzen
const gameSize = 600; 

// Spiel aufsetzen
const app = new PIXI.Application({
  width: gameSize,
  height: gameSize,
  backgroundColor: 0x000000,
});

app.view.style.position = 'absolute';
app.view.style.left = `${(window.innerWidth - gameSize) / 2}px`;
app.view.style.top = `${(window.innerHeight - gameSize) / 2}px`;

document.body.appendChild(app.view);

// Punkte
let points = 0;
const pointsText = new PIXI.Text('Points: 0', { fill: 0xFF0000, fontSize: 20 }); 
pointsText.position.set(gameSize - 150, 20);

// Leben
let lives = 3; 
const lifeText = new PIXI.Text(`Lives: ${lives}`, { fill: 0xFF0000, fontSize: 20 });
lifeText.position.set(gameSize - 150, 50);

// Spaceship erstellen und Element hinzufügen
const player = new PIXI.Graphics();
player.beginFill(0x00FF00); 
player.drawPolygon([-10, 15, 0, -15, 10, 15, 0, 7]);
player.endFill();
player.x = app.screen.width / 2;
player.y = app.screen.height / 2;
player.vx = 0;
player.vy = 0;
player.rotation = 0;
app.stage.addChild(player);

// Klasse um Schüsse zu generieren
class Pellet extends PIXI.Graphics {
  constructor() {
    super();
    this.beginFill(0xFFFFFF);
    this.drawCircle(0, 0, 5);
    this.endFill();
    this.vx = 0;
    this.vy = 0;
  }
}

// Klasse um Asteroiden zu generieren
class Asteroid extends PIXI.Graphics {
  constructor(size) {
    super();
    this.size = size;
    this.beginFill(0xFFFFFF);
    this.drawPolygon(this.generateRandomPolygon());
    this.endFill();
    this.x = Math.random() * app.screen.width;
    this.y = Math.random() * app.screen.height;
    this.vx = Math.random() * 2 - 1;
    this.vy = Math.random() * 2 - 1;
  }

  generateRandomPolygon() {
    const sides = 8; 
    const radius = this.size; 

    const polygon = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * (Math.PI * 2);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      polygon.push(x, y);
    }
    return polygon;
  }
}

// Tastatureingabe abfangen => Drücken der LEER-Taste
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  // Schiesse wenn Taste gedrückt.
  if (e.code === "Space") {
    shoot();
  }
});
window.addEventListener("keyup", (e) => (keys[e.code] = false));

// Schuss-Array und Schussgeschwindigkeit
const pellets = [];
const pelletSpeed = 5;

// Asteroiden-Array
const asteroids = [];

// Überhitzungssystem
const maxPellets = 3; // Maximalanzahl gleichzeitiger Schüsse
let cooldown = false;

// Schiessfunktion
function shoot() {
  if (pellets.length < maxPellets && !cooldown) {
    const pellet = new Pellet();
    pellet.x = player.x;
    pellet.y = player.y;
    pellet.vx = Math.sin(player.rotation) * pelletSpeed;
    pellet.vy = -Math.cos(player.rotation) * pelletSpeed;
    app.stage.addChild(pellet);
    pellets.push(pellet);

    // Cooldown setzen / Schusslimiter
    cooldown = true;
    setTimeout(() => (cooldown = false), 500); // 1000 milliseconds cooldown
  }
}

// Asteroiden generieren
for (let i = 0; i < 5; i++) {
  const asteroid = new Asteroid(50); // Grösse angeben TODO: relative Angabe implementieren.
  app.stage.addChild(asteroid);
  asteroids.push(asteroid);
}

// Dialoge generieren
function showDialog(message, callback) {
  const dialog = document.createElement('div');
  dialog.style.position = 'absolute';
  dialog.style.top = '50%';
  dialog.style.left = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
  dialog.style.padding = '20px';
  dialog.style.background = '#ffffff';
  dialog.style.border = '2px solid #000000';
  dialog.style.textAlign = 'center';
  dialog.textContent = message;

  const reloadButton = document.createElement('button');
  reloadButton.textContent = 'Reload Page';
  reloadButton.addEventListener('click', callback);

  dialog.appendChild(reloadButton);
  document.body.appendChild(dialog);
}

// Stats Texte dem Canvas hinzufügen
app.stage.addChild(pointsText, lifeText);

// Game loop
app.ticker.add((delta) => {
  // Spielerbewegung aktualisieren
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

  // "Reibung" um Steuerung "spacy" zu gestalten.
  player.vx *= 0.98;
  player.vy *= 0.98;

  // Spielerstandort neu festlegen
  player.x += player.vx;
  player.y += player.vy;

  // Asteroids Spielgrenze für den Spieler => Wenn man links über die Grenze geht kommt man rechts wieder raus.
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

  // Schussbewegung aktualisieren
  for (const pellet of pellets) {
    pellet.x += pellet.vx;
    pellet.y += pellet.vy;

    // Kollisionen mit Asteroiden abfragen
    for (const asteroid of asteroids) {
      if (checkCollision(player, asteroid)) {
        // Leben abziehen
        lives--;
        lifeText.text = `Lives: ${lives}`;

        // Spielerposition zurücksetzen bei Treffer
        player.x = app.screen.width / 2;
        player.y = app.screen.height / 2;

        // Gameover Kondition
        if (lives <= 0) {
            // Dialog wenn man verliert
            showDialog('Game Over! Reload the page?', () => location.reload());
        }

        // Asteroid entfernen
        app.stage.removeChild(asteroid);
        asteroids.splice(asteroids.indexOf(asteroid), 1);
      }

      if (checkCollision(pellet, asteroid)) {
        // Schüsse entfernen
        app.stage.removeChild(pellet);
        pellets.splice(pellets.indexOf(pellet), 1);

        // Asteroiden spalten oder löschen
        if (asteroid.size > 10) {
          breakDownAsteroid(asteroid);
        } else {
          app.stage.removeChild(asteroid);
          asteroids.splice(asteroids.indexOf(asteroid), 1);
        }

        break; // Loop abbrechen, da jeder Schuss nur einen "Layer" eines Asteroiden treffen kann.
      }
    }

    // Entfernen von Schüssen wenn sie über die Spielgrenze gehen.
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

  // Asteroidenbewegung aktualisieren.
  for (const asteroid of asteroids) {
    asteroid.x += asteroid.vx;
    asteroid.y += asteroid.vy;

    // Spielgrenze für die Asteroiden (gleich wie beim Spieler)
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

  if (asteroids.length === 0) {
    // Dialog nach dem Sieg
    showDialog('Congratulations! You Win! Reload the page?', () => location.reload());
  }
});

// Kollisionsdetektor
function checkCollision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Herunterbrechen von einem Asteroiden in zwei kleinere.
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

  // Punktzahl erhöhen
  points += 10;
  pointsText.text = `Points: ${points}`;
}
