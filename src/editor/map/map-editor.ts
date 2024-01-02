import { FederatedEventHandler, Graphics } from "pixi.js";
import "../../css/editor/map/map-editor.scss";
import { Tilemap } from "../../engine/world/tilemap";
import { Tileset } from "../../engine/world/tileset";
import { Scene } from "../../engine/application/scene";
import { saveAs } from "file-saver";
import $ from 'jquery';
import { MapEditorTile } from "./map-editor-tile";

class MapEditor {

	root : JQuery<HTMLElement>;

	currentTiles : Array<MapEditorTile> = [];

	tiles : Array<MapEditorTile> = [];

	layerInput : JQuery<HTMLElement>;

	currentScene : Scene;
	currentMap : Tilemap;
	tileOverGraphic : Graphics;
	
	mouseDown : boolean = false;
	selectingTiles : boolean = false;

	constructor() {

		this.root = $("<div>", { class: "map-editor-root"}).append("<h1>Map Editor</1>").appendTo("body");
		
		this.tileOverGraphic = new Graphics();
		this.tileOverGraphic.lineStyle(2, 0xFF0000);
		this.tileOverGraphic.drawRect(0,0, 32,32);
		this.tileOverGraphic.zIndex = 99;

		this.constructTilesets();

		this.layerInput = $("<input>", { type: "number", value: "0", id: "layer-input" })
		.on("keyup click", (e) => {
			var layer = parseInt($("#layer-input").val().toString());
			this.focusLayer(layer);
		}).appendTo(this.root);

		$("<button>").append("Export")
		.on("click", (e) => this.exportMap())
		.appendTo(this.root);

		$("body").on("mousedown", (e) => {
			if ((e.target as HTMLElement).className !== "map-editor-tile")
				return;
			if (!this.selectingTiles) {
				this.selectingTiles = true;
				for(var tile of this.currentTiles) {
					tile.element.removeAttr("selected");
				}
				this.currentTiles = [];
			}
		});

		$("body").on("mouseup", (e) => {
			this.selectingTiles = false
		});
	}

	private constructTilesets() {

		for(var key of Tileset.tilesets.keys()) {
			var split = key.split("/");
			var tileset = Tileset.get(key);

			// Create root element
			var element = $("<div>", { class: "map-editor-tileset" });

			// Create container for image and grid
			var tilesetGrid = $("<div>", { class: "map-editor-tileset-grid" }).appendTo(element);

			// Create image element to show tileset
			var img = $("<img>", { src: key, width: tileset.options.width, height: tileset.options.height }).appendTo(tilesetGrid);
			
			this.root.append(element);
			// Create a div for each tile in the tileset
			var xCount = tileset.options.width / tileset.options.tileWidth;
			var yCount = tileset.options.height / tileset.options.tileHeight;
			for(var y = 0; y < yCount; y++) {
				for(var x = 0; x < xCount; x++) {
					let id = y * xCount + x;
					var tile = new MapEditorTile(id, tileset.options.tileWidth, tileset.options.tileHeight, x, y, $(".map-editor-tileset-grid"), this);
					this.tiles.push(tile);
				}
			}
		}
	}

	focusLayer(layer : number) {
		
		for(let y = 0; y < this.currentMap.mapHeight; y++) {
			for(let x = 0; x < this.currentMap.mapWidth; x++) {
				var layerKeys = this.currentMap.gridData[x][y].layers.keys();
				for(var layerKey of layerKeys) {
					if (layerKey !== layer) {
						this.currentMap.gridData[x][y].layers.get(layerKey).sprite.tint = 0x555555;
					} else {
						this.currentMap.gridData[x][y].layers.get(layerKey).sprite.tint = 0xffffff;
					}
				}
			}
		}
	}
	
	addToBrush(element : MapEditorTile) {
		this.currentTiles.push(element);
		element.element.attr("selected", "true");
	}

	setMap(map : Tilemap) {
		this.currentMap = map;
		this.focusLayer(0);
	}

	setScene(scene : Scene) {
		this.currentScene = scene;
		scene.addChild(this.tileOverGraphic);
		scene.onmousedown = (e) => {
			this.mouseDown = true;
		}
		scene.onmouseup = (e) => {
			this.mouseDown = false;
			var worldPos = scene.screenToWorld(e.screen.x-16, e.screen.y-32);
			var gridPos = this.currentMap.worldToGrid(worldPos.x, worldPos.y);
			this.paint(gridPos.x, gridPos.y);
		}
		scene.onmousemove = (e) => {
			var worldPos = scene.screenToWorld(e.screen.x-16, e.screen.y-32);
			var gridPos = this.currentMap.worldToGrid(worldPos.x, worldPos.y);
			var _w = this.currentMap.gridToWorld(gridPos.x, gridPos.y);
			this.tileOverGraphic.x = _w.x;
			this.tileOverGraphic.y = _w.y;
			if (this.mouseDown) {
				this.paint(gridPos.x, gridPos.y);
			}
		}
	}

	paint(x : number, y : number) {
		var layer = parseInt($("#layer-input").val().toString());
		if (this.currentTiles.length > 0) {
			let firstTile = this.currentTiles[0];
			let firstx = firstTile.x;
			let firsty = firstTile.y;
			this.currentMap.setTile(x, y, Tileset.get("assets/images/tilesets/Tileset.png"), firstTile.id, layer);
			for(let i = 1; i < this.currentTiles.length; i++) {
				let tile = this.currentTiles[i];
				let thisx = tile.x;
				let thisy = tile.y;
				let deltaX = thisx - firstx;
				let deltaY = thisy - firsty;
				this.currentMap.setTile(x + deltaX, y + deltaY, Tileset.get("assets/images/tilesets/Tileset.png"), tile.id, layer);
			}
		}
	}

	exportMap() { 
		var exported = {
			"mapHeight": this.currentMap.mapHeight,
			"mapWidth": this.currentMap.mapWidth,
			"cellSize": this.currentMap.cellSize,
			"map": []
		};
		
		for(let y = 0; y < this.currentMap.mapHeight; y++) {
			for(let x = 0; x < this.currentMap.mapWidth; x++) {

				var gridCell = {
					x: x,
					y: y,
					collision: this.currentMap.gridData[x][y].collision,
					layers: {}
				}
				var saveTile = false;
				for(var layerKey of this.currentMap.gridData[x][y].layers.keys()) {
					var layer = {
						tileset: this.currentMap.gridData[x][y].layers.get(layerKey).tileset.options.texture,
						tileId: this.currentMap.gridData[x][y].layers.get(layerKey).tileId
					}
					gridCell.layers[layerKey] = layer;
					saveTile = true;
				}

				if (saveTile) {
					exported.map.push(gridCell);
				}
			}
		}
		var fileToSave = new Blob([JSON.stringify(exported, undefined, 2)], { type: 'application/json'});
		saveAs(fileToSave, "map.json");
		console.log(exported);
	}
}

export { MapEditor }