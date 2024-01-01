import { FederatedEventHandler, Graphics } from "pixi.js";
import "../css/editor/map-editor.scss";
import { Tilemap } from "../engine/world/tilemap";
import { Tileset } from "../engine/world/tileset";
import { Scene } from "../engine/application/scene";

class MapEditor {

	root : HTMLDivElement;

	currentTile : HTMLDivElement;
	tiles : Array<HTMLDivElement> = [];

	currentScene : Scene;
	currentMap : Tilemap;
	tileOverGraphic : Graphics;

	constructor() {
		this.root = document.createElement("div");
		this.root.innerHTML = "<h1>Map Editor</h1>";
		this.root.className = "map-editor-root";
		document.body.appendChild(this.root);
		this.tileOverGraphic = new Graphics();
		this.tileOverGraphic.lineStyle(2, 0xFF0000);
		this.tileOverGraphic.drawRect(0,0, 32,32);
		for(var key of Tileset.tilesets.keys()) {
			var split = key.split("/");
			var element = document.createElement("div");
			var tileset = Tileset.get(key);
			element.className = "map-editor-tileset";
			element.innerHTML += `<img src=${key} width=${tileset.options.width} height=${tileset.options.height} ><br />`;
			var xCount = tileset.options.width / tileset.options.tileWidth;
			var yCount = tileset.options.height / tileset.options.tileHeight;
			for(var y = 0; y < yCount; y++) {
				for(var x = 0; x < xCount; x++) {
					var tile = document.createElement("div");
					tile.className = "map-editor-tile";
					tile.style.width = `${tileset.options.tileWidth-2}px`;
					tile.style.height = `${tileset.options.tileHeight-2}px`;
					tile.style.top = `${y * tileset.options.tileHeight}px`;
					tile.style.left = `${x * tileset.options.tileWidth}px`;
					tile.setAttribute("x", x.toString());
					tile.setAttribute("y", y.toString());
					tile.setAttribute("id", (y * xCount + x).toString());
					element.appendChild(tile);
					this.tiles.push(element);
					tile.onclick = (e) => {
						let element = e.target as HTMLDivElement;
						this.setCurrentTile(element);
					}
				}
			}
			this.root.appendChild(element);
			this.setCurrentTile(this.tiles[0]);
		}
	}

	setCurrentTile(tile : HTMLDivElement) {
		if (this.currentTile) {
			this.currentTile.removeAttribute("selected");
		}
		this.currentTile = tile;
		tile.setAttribute("selected", "true");
	}

	setMap(map : Tilemap) {
		this.currentMap = map;
		map.addChild(this.tileOverGraphic);
	}
	setScene(scene : Scene) {
		this.currentScene = scene;
		scene.onclick = (e) => {
			var worldPos = scene.screenToWorld(e.screen.x-16, e.screen.y-32);
			var gridPos = this.currentMap.worldToGrid(worldPos.x, worldPos.y);
			this.currentMap.setTile(gridPos.x, gridPos.y, Tileset.get("assets/images/tilesets/Tileset.png"), parseInt(this.currentTile.getAttribute("id")), 1);
		};
		scene.onmousemove = (e) => {
			var worldPos = scene.screenToWorld(e.screen.x-16, e.screen.y-32);
			var gridPos = this.currentMap.worldToGrid(worldPos.x, worldPos.y);
			var _w = this.currentMap.gridToWorld(gridPos.x, gridPos.y);
			this.tileOverGraphic.x = _w.x;
			this.tileOverGraphic.y = _w.y;
		}
	}
}

export { MapEditor }