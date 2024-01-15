import * as PIXI from 'pixi.js';

// Definition of the spaceship object
export default class Player extends PIXI.Graphics {
  constructor(app) {
    super();
    this.beginFill(0x00FF00); 
    this.drawPolygon([-10, 15, 0, -15, 10, 15, 0, 7]);
    this.endFill();
    this.x = app.screen.width / 2;
    this.y = app.screen.height / 2;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
  }
}