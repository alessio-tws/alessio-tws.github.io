import * as PIXI from "pixi.js";
import { Game } from "../../engine/application/game";
import { Scene } from "../../engine/application/scene";
import Tetramino from "./tetramino";
import * as TetraminoPiece from "./resources/tetraminos-def";
import InputManager from "../../engine/application/input-manager";
import TetrisGrid from "./grid";

var scene : Scene;

var tetraminos = [
	TetraminoPiece.BLOCK,
	TetraminoPiece.I,
	TetraminoPiece.J,
	TetraminoPiece.L,
	TetraminoPiece.S,
	TetraminoPiece.T,
	TetraminoPiece.Z
]

var currentTetramino : Tetramino;
var nextTetramino : Tetramino;
var grid : TetrisGrid;
var score : PIXI.Text;
var gameover : boolean = false;
var gameoverText : PIXI.Text;

async function startup() {
	var height = 25;
	var width = 10;
	grid = new TetrisGrid(width, height);
	scene = new Scene();
	scene.addChild(grid);
	currentTetramino = randomTetramino();
	currentTetramino.x = (width/2)*16;
	currentTetramino.y = 0;

	nextTetramino = randomTetramino();
	nextTetramino.x = -60;
	nextTetramino.y = 0;

	scene.addObject(nextTetramino);
	scene.addObject(currentTetramino);
	scene.x = Game.app.screen.width / 2 - ((width*16)/2);
	scene.y = Game.app.screen.height / 2 - ((height*16)/2);
	score = new PIXI.Text("Score:", { fontSize: 18, fill: 0xffffff});
	score.x = (width*16)+16;
	score.y = 0;
	scene.addChild(score);
	Game.loadScene(scene);
	Game.app.ticker.add(tick);
	InputManager.initialize();
}

function randomTetramino() {
	return new Tetramino(tetraminos[Math.floor(Math.random()*tetraminos.length)]);
}

var timer = 0;
function tick(delta) {
	if (!currentTetramino || gameover) return;
	score.text = `Score: ${grid.score}`;
	timer += delta;
	var pos = {
		x: Math.floor(currentTetramino.x / grid.size),
		y: Math.floor(currentTetramino.y / grid.size)
	}
	var waitTime = 10 - (grid.score % 3);
	waitTime = InputManager.isKeyDown("KeyS") ? waitTime * 0.5 : waitTime;
	if (timer > waitTime && !grid.erasing)
	{
		timer = 0;
		var nextPos = { x: currentTetramino.x, y: currentTetramino.y + 16};
		if (!grid.canBePlaced(currentTetramino.currentStructure, nextPos))
		{
			grid.place(currentTetramino);
			currentTetramino.falling = false;
		} else {
			currentTetramino.y += 16;
		}
	}

	if (!currentTetramino.falling) {
		currentTetramino.destroy({children:true, texture:true, baseTexture:true});
		currentTetramino = nextTetramino;
		currentTetramino.x = 32;
		currentTetramino.y = 0;
		if (!grid.canBePlaced(currentTetramino.currentStructure, {x: currentTetramino.x, y: currentTetramino.y})) {
			// Gameover
			gameover = true;
			gameOver();
			return;
		}
		scene.addObject(currentTetramino);
		nextTetramino = randomTetramino();
		nextTetramino.x = -60;
		nextTetramino.y = 0;
		scene.addObject(nextTetramino);
	}

	if (InputManager.isKeyPressed("KeyG")) {
		if (currentTetramino.canRotate(grid)) {
			currentTetramino.rotate();
		}
	}
	if (InputManager.isKeyPressed("KeyD")) {
		var pos = {x: currentTetramino.x + 16, y: currentTetramino.y }
		if (grid.canBePlaced(currentTetramino.currentStructure, pos))
			currentTetramino.x += 16;
	} else if (InputManager.isKeyPressed("KeyA")) {
		var pos = {x: currentTetramino.x - 16, y: currentTetramino.y }
		if (grid.canBePlaced(currentTetramino.currentStructure, pos))
			currentTetramino.x -= 16;
	}
}

async function gameOver() {
	scene.removeObject(currentTetramino);
	scene.removeObject(nextTetramino);
	for(let y = grid.gridHeight-1; y >= 0; y--) {
		for(let x = 0; x < grid.gridWidth; x++) {
			if (!grid.grid[x][y]) {
				grid.grid[x][y] = PIXI.Sprite.from("assets/images/tetris/block.png");
				grid.grid[x][y].x = x * 16;
				grid.grid[x][y].y = y * 16;
				grid.addChild(grid.grid[x][y]);
				await Game.delay(10);
			}
		}
	}

	gameoverText = new PIXI.Text("Game Over", { fontSize: 24, fill: 0xff0000});
	gameoverText.x = (Game.app.screen.width / 2) - (gameoverText.getBounds().width/2);
	gameoverText.y = (Game.app.screen.height / 2) - (gameoverText.getBounds().height/2);
	Game.app.stage.addChild(gameoverText);
	Game.app.ticker.add(waitRestart, window, PIXI.UPDATE_PRIORITY.NORMAL);
}

async function waitRestart(delta) {
	if (InputManager.isKeyPressed("KeyG")) {
		Game.app.stage.removeChild(gameoverText);
		for(let y = grid.gridHeight-1; y >= 0; y--) {
			for(let x = 0; x < grid.gridWidth; x++) {
				if (grid.grid[x][y]) {
					grid.removeChild(grid.grid[x][y]);
					grid.grid[x][y] = null;
					await Game.delay(10);
				}
			}
		}
		Game.app.stage.removeChild(gameoverText);
		Game.app.ticker.remove(waitRestart, window);
		grid.score = 0;
		gameover = false;
		currentTetramino = randomTetramino();
		currentTetramino.x = 5*16;
		currentTetramino.y = 0;

		nextTetramino = randomTetramino();
		nextTetramino.x = -60;
		nextTetramino.y = 0;

		scene.addObject(nextTetramino);
		scene.addObject(currentTetramino);
	}
}

export { startup }