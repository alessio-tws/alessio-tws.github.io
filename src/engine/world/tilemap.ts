import { Container, FederatedPointerEvent, Graphics, LineStyle, Sprite } from "pixi.js";
import { Tileset } from "./tileset";
import axios from "axios";

enum GridCellCollisionType {
	None = 0,
	Block
}

type GridCellLayer = {
	sprite? : Sprite,
	tileset? : Tileset,
	tileId? : number
}

type GridCell = {
	x : number,
	y : number,
	layers? : Map<number, GridCellLayer>,
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

	public async fromJson(jsonUrl : string) {
		await axios.get(jsonUrl)
			.then((resp) => {
				let map = resp.data;
				this.initialize(map.mapHeight, map.mapHeight, map.cellSize);
				for(var tile of map.map) {
					var layers = tile.layers;
					var keys = Object.keys(layers);
					for(var layer of keys) {
						let layerNum = parseInt(layer);
						var tileset = Tileset.get(layers[layer].tileset);
						if (tileset) {
							this.setTile(tile.x, tile.y, tileset, layers[layer].tileId, layerNum);
						}
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
					layers: new Map<number, GridCellLayer>(),
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
				for(var layer of this.gridData[x][y].layers.keys()) {
					if (this.gridData[x][y].layers.get(layer).sprite)
					{
						this.removeChild(this.gridData[x][y].layers.get(layer).sprite);
						this.gridData[x][y].layers.get(layer).sprite.destroy();
					}
				}
			}
		}
	}

	public setTile(x : number, y : number, tileset : Tileset, tileId : number, layer : number = 0, collision : GridCellCollisionType = GridCellCollisionType.None) {
		if (x >= this.mapWidth || y >= this.mapHeight || x < 0 || y < 0) {
			console.error("Out of bounds tile requested", x, y);
			return;
		}
		if (!this.gridData[x][y].layers.has(layer)) {
			this.gridData[x][y].layers.set(layer, {});
		}
		var layerData = this.gridData[x][y].layers.get(layer);

		if (layerData.sprite) {
			layerData.sprite.destroy();
		}

		var sprite = Sprite.from(tileset.getTile(tileId));
		sprite.zIndex = layer;
		sprite.eventMode = "dynamic";
		sprite.x = x * this.cellSize;
		sprite.y = y * this.cellSize;
		this.addChild(sprite);

		layerData.tileId = tileId;
		layerData.tileset = tileset;
		layerData.sprite = sprite;
		this.gridData[x][y].collision = collision;
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