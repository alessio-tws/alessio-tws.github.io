import { Container, Graphics, Sprite } from "pixi.js";
import Tetramino from "./tetramino";
import { Game } from "../../engine/application/game";
import { Scene } from "../../engine/application/scene";

export default class TetrisGrid extends Container {
	grid : Sprite[][] = [];
	gridWidth : number;
	gridHeight : number;
	size : number = 16;
	erasing : boolean = false;
	score : number = 0;

	constructor(width : number, height : number) {
		super();
		this.gridWidth = width;
		this.gridHeight = height;

		for(let y = 0; y < this.gridHeight; y++) {
			this.grid[y] = [];
			for(let x = 0; x < this.gridWidth; x++) {
				this.grid[y][x] = null;
			}
		}
		var gfx = new Graphics();
		gfx.lineStyle(2, 0xff0000);
		gfx.drawRect(0, 0, width * this.size, height * this.size);
		this.addChild(gfx);
	}

	public canBePlaced(tetramino : number[][], position : {x: number, y: number}) : boolean {
		var body = tetramino;
		var pos = {
			x: Math.floor(position.x / this.size),
			y: Math.floor(position.y / this.size)
		}

		if (pos.y >= this.gridHeight || pos.x >= this.gridWidth || pos.x < 0) {
			return false;
		}

		for(let y = 0; y < body.length; y++) {
			for(let x = 0; x < body[y].length; x++) {
				var actualPos = { x: pos.x + x, y: pos.y + y }
				if (body[y][x] === 1) {
					if (actualPos.y >= this.gridHeight || actualPos.x >= this.gridWidth || actualPos.x < 0) {
						return false;
					}
					if (this.grid[actualPos.x][actualPos.y]) 
						return false;
				}
			}
		}
		return true;
	}
	private async eraseLines(sprites : Sprite[], lastCompletedY : number, completedLines : number) {
		this.erasing = true;
		for(let i = 0; i < 11; i++) {
			for(var sprite of sprites) {
				sprite.visible = !sprite.visible;
			}
			await Game.delay(100);
		}
		this.score += completedLines;
		var newGrid = [...this.grid]

		for(let _y = lastCompletedY; _y >= 0; _y--) {
			if (_y === this.gridHeight-1)
				continue;
			for(let x = 0; x < this.gridWidth; x++) {
				if (this.grid[x][_y]) {
					this.grid[x][_y].y += 16 * completedLines;
					newGrid[x][_y+completedLines] = this.grid[x][_y];
					newGrid[x][_y] = null;
				}
			}
		}
		this.grid = [...newGrid];
		this.erasing = false;
		this.evaluateGrid();
	}
	private evaluateGrid() {
		var completedLines = 0;
		let lastCompletedY = 0;
		var sprites = [];
		for(let y = this.gridHeight-1; y >= 0; y--) {
			var lineComplete = true;
			for(let x = 0; x < this.gridWidth; x++) {
				if (!this.grid[x][y])
				{
					lineComplete = false; 
					break;
				}
			}
			if (lineComplete) {
				completedLines++;
				lastCompletedY = y;
				for(let x = 0; x < this.gridWidth; x++) {
					sprites.push(this.grid[x][y]);
					this.grid[x][y] = null;
				}
			}
			if (completedLines >= 4) {
				break;
			}
		}
		if (sprites.length > 0) {
			this.eraseLines(sprites, lastCompletedY, completedLines);
		}
	}

	public place(tetramino : Tetramino) {
		var body = tetramino.currentStructure;
		var pos = {
			x: Math.floor(tetramino.x / this.size),
			y: Math.floor(tetramino.y / this.size)
		}
		for(let y = 0; y < body.length; y++) {
			for(let x = 0; x < body[y].length; x++) {
				var actualPos = { x: pos.x + x, y: pos.y + y }
				if (body[y][x] === 1)
				{					
					this.grid[actualPos.x][actualPos.y] = tetramino.body[y][x];
					this.addChild(tetramino.body[y][x]);
					tetramino.body[y][x].x = actualPos.x * this.size;
					tetramino.body[y][x].y = actualPos.y * this.size;
				}
			}
		}
		
		this.evaluateGrid();
	}
}