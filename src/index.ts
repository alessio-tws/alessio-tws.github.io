import * as PIXI from 'pixi.js'
import * as Tetris from "./sample/tetris/main";
import { Game } from './engine/application/game';

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
Game.initialize(window.innerWidth, window.innerHeight,0x000000);

Tetris.startup();
