import * as PIXI from 'pixi.js';

// Class to generate asteroids
export default class Asteroid extends PIXI.Graphics {
  constructor(size, app) {
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