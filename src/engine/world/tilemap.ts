import { Container, FederatedPointerEvent, Graphics, LineStyle, Sprite } from "pixi.js";
import { Tileset } from "./tileset";
import axios from "axios";

enum GridCellCollisionType {
	None = 0,
	Block
}

type GridCell = {
	x : number,
	y : number,
	tileset : Tileset | null,
	tileId : number,
	sprite : Sprite,
	collision : GridCellCollisionType
}

class Tilemap extends Container {
	mapWidth : number = 50;
	mapHeight : number = 50;
	cellSize : number = 16;

	gridData : GridCell[][] = [[]];

	constructor() {
		super();
	}

	public fromJson(jsonUrl : string) {
		axios.get(jsonUrl)
			.then((resp) => {
				let map = resp.data;
				this.initialize(map.mapHeight, map.mapHeight, map.cellSize);
				for(var tile of map.map) {
					var tileset = Tileset.get(tile.tileset);
					if (tileset) {
						this.setTile(tile.x, tile.y, tileset, tile.tileId);
					}
				}
			}).catch( (err) => {
				console.error(err);
			})
	}

	public initialize(mapHeight : number, mapWidth : number, cellSize : number) {
		
		this.clear();

		this.mapHeight = mapHeight;
		this.mapWidth = mapWidth;
		this.cellSize = cellSize;
		this.gridData = new Array(this.mapHeight).fill({}).map(() => new Array(this.mapWidth).fill({}));
		for(let y = 0; y < this.mapHeight; y++) {
			for (let x = 0; x < this.mapWidth; x++) {
				this.gridData[x][y] = {
					x : x,
					y: y,
					tileset: null,
					tileId: 0,
					sprite: null,
					collision: GridCellCollisionType.Block
				}
			}
		}
		this.sortableChildren = true;
	}

	public clear() {
		for(let y = 0; y < this.mapHeight; y++) {
			for(let x = 0; x < this.mapWidth; x++) {
				if (y >= this.gridData.length || x >= this.gridData[y].length) 
					continue;
				if (this.gridData[x][y].sprite) {
					this.removeChild(this.gridData[x][y].sprite);
					this.gridData[x][y].sprite.destroy();
				}
			}
		}
	}

	public setTile(x : number, y : number, tileset : Tileset, tileId : number, collision : GridCellCollisionType = GridCellCollisionType.None) {
		if (x >= this.mapWidth || y >= this.mapHeight || x < 0 || y < 0) {
			console.error("Out of bounds tile requested", x, y);
			return;
		}

		if (this.gridData[x][y].sprite) {
			this.removeChild(this.gridData[x][y].sprite);
		}

		this.gridData[x][y].sprite = Sprite.from(tileset.getTile(tileId));
		this.gridData[x][y].sprite.zIndex = 0;
		this.addChild(this.gridData[x][y].sprite);
		this.gridData[x][y].sprite.x = x * this.cellSize;
		this.gridData[x][y].sprite.y = y * this.cellSize;

		this.gridData[x][y].tileId = tileId;
		this.gridData[x][y].tileset = tileset;
		this.gridData[x][y].collision = collision;
		this.gridData[x][y].sprite.eventMode = "dynamic";
	}

	public fill(tileset : Tileset, tileId : number) {
		for(let y = 0; y < this.mapHeight; y++) {
			for(let x = 0; x < this.mapWidth; x++) {
				this.setTile(x,y,tileset,tileId);
			}
		}
	}

	public isWalkable(x : number, y : number) : boolean {
		if (x >= this.mapWidth || y >= this.mapHeight || x < 0 || y < 0) {
			return false;
		}

		return this.gridData[x][y].collision !== GridCellCollisionType.Block;
	}

	public gridToWorld(x : number, y : number) {
		return {
			x: x * this.cellSize,
			y: y * this.cellSize
		}
	}

	public worldToGrid(x : number, y : number) {
		return {
			x: Math.round(x / this.cellSize),
			y: Math.ceil(y / this.cellSize)
		}
	}
}

export { Tilemap }