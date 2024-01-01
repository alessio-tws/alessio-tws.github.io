import * as PIXI from "pixi.js";
import { WorldObject } from "./engine/world/world-object";
import { Game } from "./engine/application/game";
import { Scene } from "./engine/application/scene";
import { DynamicObject } from "./engine/world/dynamic-object";
import { StaticObject } from "./engine/world/static-object";
import { Tileset } from "./engine/world/tileset";
import { Tilemap } from "./engine/world/tilemap";
import GameMath from "./engine/math";
import { MapEditor } from "./editor/map-editor";

let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
	type = "canvas";
}

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

Game.initialize(window.innerWidth, window.innerHeight,0x000000);

let scene = new Scene();

Game.loadScene(scene);

const textureOptions = {
	texture: "assets/images/characters/minis_char1_1.png",
	width: 192, height: 128,
	frameWidth: 16, frameHeight: 16,
	format: "RGBA8888",
	scale: 0.5,
	animationSpeed: 0.12
}

const animated = new DynamicObject("test", textureOptions);
animated.setupAnimation("front", 0, 0, 3);
animated.setupAnimation("left", 0, 1, 3);
animated.setupAnimation("right", 0, 2, 3);
animated.setupAnimation("back", 0, 3, 3);
await animated.initialize();
animated.play();

scene.followSpeed = 0.05;
scene.onKeyDown.push((e) => {
	if (e.code === "KeyG") {
		scene.focusPoint = { x: 100, y: 20 };
		scene.followBehavior = 1;
	} else if (e.code === "KeyF") {
		scene.followTarget = animated;
		scene.followBehavior = 0;
	}
});

scene.followTarget = animated;
var speed = 2;
Game.app.ticker.add((delta) => {
	
	var moving = false;
	var gridCoord = tilemap.worldToGrid(animated.getDisplayObject().x, animated.getDisplayObject().y);
	
	var oldPos = { x: animated.getDisplayObject().x, y: animated.getDisplayObject().y };

	if (scene.isKeyDown("KeyS")) {
		animated.setAnimation("front");
		animated.play();
		animated.getDisplayObject().y += speed * delta;
		moving = true;
	} else if (scene.isKeyDown("KeyW")) {
		animated.setAnimation("back");
		animated.play();
		animated.getDisplayObject().y -= speed * delta;
		moving = true;
	} 
	if (scene.isKeyDown("KeyA")) {
		animated.setAnimation("left");
		animated.play();
		animated.getDisplayObject().x -= speed * delta;
		moving = true;
	} else if (scene.isKeyDown("KeyD")) {
		animated.setAnimation("right");
		animated.play();
		animated.getDisplayObject().x += speed * delta;
		moving = true;
	} 
	if (!moving) {
		animated.stop();
	} else {
		var newGridCoord = tilemap.worldToGrid(animated.getDisplayObject().x, animated.getDisplayObject().y);
		if (!tilemap.isWalkable(newGridCoord.x, newGridCoord.y))
		{
			animated.getDisplayObject().x = oldPos.x;
			animated.getDisplayObject().y = oldPos.y;	
		}
		console.log(gridCoord, animated.getDisplayObject().position);
	}
})

var ts = await Tileset.load({
	texture: "assets/images/tilesets/Tileset.png",
	width: 128,
	height: 240,
	tileHeight: 16,
	tileWidth: 16,
	scale: 0.5,
	format: "RGBA8888"
})

var tilemap = new Tilemap();
tilemap.initialize(30,30, 32);
tilemap.fill(ts, 9);
tilemap.setTile(0, 0, ts, 0);
tilemap.setTile(0, 29, ts, 16);
tilemap.setTile(29, 0, ts, 2);
tilemap.setTile(29, 29, ts, 18);

for(let x = 1; x < 29; x++) {
	tilemap.setTile(x, 0, ts, 1);
	tilemap.setTile(x, 29, ts, 17);
}

for(let y = 1; y < 29; y++) {
	tilemap.setTile(0, y, ts, 8);
	tilemap.setTile(29, y, ts, 10);
}

scene.addChild(tilemap);
scene.addObject(animated);

//tilemap.fromJson("assets/maps/test-map.json");

var mapEditor = new MapEditor();
mapEditor.setMap(tilemap);
mapEditor.setScene(scene);
