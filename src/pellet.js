import * as PIXI from 'pixi.js';

// Class to generate pellets
export default class Pellet extends PIXI.Graphics {
  constructor() {
    super();
    this.beginFill(0xFFFFFF);
    this.drawCircle(0, 0, 5);
    this.endFill();
    this.vx = 0;
    this.vy = 0;
  }
}