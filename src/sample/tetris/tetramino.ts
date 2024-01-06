import { Sprite } from "pixi.js";
import { WorldObject } from "../../engine/world/world-object";
import { Scene } from "../../engine/application/scene";
import { Game } from "../../engine/application/game";
import InputManager from "../../engine/application/input-manager";
import TetrisGrid from "./grid";

var s = [
	[
		[ 1, 1, 1 ],
		[ 0, 1, 0 ],
		[ 0, 0, 0]
	],
	[
		[ 1, 0, 0 ],
		[ 1, 1, 0 ],
		[ 1, 0, 0], 
	],
	[
		[ 0, 0, 0 ],
		[ 0, 1, 0 ],
		[ 1, 1, 1 ]
	],
	[
		[ 0, 0, 1 ],
		[ 0, 1, 1 ],
		[ 0, 0, 1 ]
	]
]
export default class Tetramino extends WorldObject {

	static BLOCK_SIZE : number = 16;

	currentRotation : number = 0;
	bodyStruct : number[][][];
	body : Sprite[][] = [[]];
	falling : boolean = true;

	timer : number = 0;
	
	public get currentStructure() {
		return this.bodyStruct[this.currentRotation];
	}

	constructor( body : number[][][] ) {
		super("tetramino");
		this.collision.bounds.width = 0;
		this.collision.bounds.height = 0;
		this.bodyStruct = body;
	}
	private rebuild() {		
		for(let y = 0; y < this.body.length; y++) {
			if (this.body[y]) {
				for(let x = 0; x < this.body[y].length; x++) {
					if (this.body[y][x])
					{
						this.removeChild(this.body[y][x]);
					}
				}
			}
		}
		for(let y = 0; y < this.bodyStruct[this.currentRotation].length; y++) {
			if (!this.body[y]) {
				this.body[y] = [];
			}
			for(let x = 0; x < this.bodyStruct[this.currentRotation][y].length; x++) {
				
				if (this.bodyStruct[this.currentRotation][y][x] === 1) {
					this.body[y][x] = Sprite.from("assets/images/tetris/block.png");
					this.addChild(this.body[y][x]);
					this.body[y][x].x = x * Tetramino.BLOCK_SIZE;
					this.body[y][x].y = y * Tetramino.BLOCK_SIZE;
				}
			}
		}
	}
	public onAddedToScene(scene: Scene): void {
		this.rebuild();
	}

	public canRotate(grid : TetrisGrid) {
		var nextRot = this.currentRotation+1;
		if (nextRot >= this.bodyStruct.length)
			nextRot = 0;
		var rot = this.bodyStruct[nextRot];
		return grid.canBePlaced(rot, {x: this.x, y: this.y});
	}

	public rotate() {
		this.currentRotation++;
		if (this.currentRotation >= this.bodyStruct.length)
			this.currentRotation = 0;
		this.rebuild();
	}

	protected tick(delta: any): void {
		super.tick(delta);
		/*this.timer += delta;
		if (this.timer > 2) {
			this.timer = 0;
			if (this.y < Game.app.screen.height-32)
				this.y += 10;
			else
			{
				this.falling = false;
				this.y = Game.app.screen.height - 32;
			}
		}*/
	}
}