import * as PIXI from "pixi.js";
import { Game } from "../../engine/application/game";
import CollisionDetector from "../../engine/application/collision-detector";
import { Scene } from "../../engine/application/scene";
import ResourceManager from "../../engine/resources/resource-manager";
import { Tilemap } from "../../engine/world/tilemap";
import InputManager from "../../engine/application/input-manager";
import { WorldObject } from "../../engine/world/world-object";
import AnimationComponent from "../../engine/components/graphics/animation-component";

var collisionDetector : CollisionDetector;
var scene : Scene;

namespace Test {
export class Character extends WorldObject {
	speed : number = 1;
	controlled : boolean = false;
	movement : PIXI.Point = new PIXI.Point(0,0);

	protected tick(delta) {
		super.tick(delta);
		if (this.controlled) {
			this.movement = new PIXI.Point(
				(InputManager.isKeyDown("KeyA") ? -this.speed : (InputManager.isKeyDown("KeyD") ? this.speed : 0)),
				(InputManager.isKeyDown("KeyW") ? -this.speed : (InputManager.isKeyDown("KeyS") ? this.speed : 0))
			)
			this.movement = this.movement.multiplyScalar(delta);
		}
		var animation = this.getComponent<AnimationComponent>("animation-component");
		if (animation) {
			var anim = null;
			if (this.movement.x > 0) anim = "right";
			else if (this.movement.x < 0) anim = "left";
			else if (this.movement.y > 0) anim = "front";
			else if (this.movement.y < 0) anim = "back";

			if (anim) {
				animation.setAnimation(anim);
				animation.play();
			} else {
				animation.stop();
			}
		}
		this.move(this.movement);
	}

}
}

async function loadPlayer() {
	var player = new Test.Character("player");
	await player.fromJson("assets/objects/characters/test-char.json");
	player.controlled = true;
	return player;
}
async function loadNpc() {
	var player = new Test.Character("npc");
	await player.fromJson("assets/objects/characters/test-char-2.json");
	return player;
}

async function startup() {
	PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
	Game.initialize(window.innerWidth, window.innerHeight,0x000000);

	scene = new Scene();

	collisionDetector = new CollisionDetector(scene);
	await ResourceManager.loadTilesets();
	InputManager.initialize();

	var tilemap = new Tilemap();
	await tilemap.fromJson("assets/maps/map2.json");
	scene.addChild(tilemap);
	
	var	player = await loadPlayer();
	scene.addObject(player);

	var npc = await loadNpc();
	var thinkTime = 0;
	npc.onTick = (delta) => {
		var dist = npc.distanceTo({ x: player.x, y: player.y});
		if (dist < 100) {
			var dir = player.position.subtract(npc.position);
			dir = dir.normalize();
			dir = dir.multiplyScalar(0.5 * delta);
			npc.movement = dir;
			return;
		}
		thinkTime += delta;
		if (thinkTime > 10) {
			if (npc.movement.x !== 0 || npc.movement.y !== 0) {
				npc.movement.x = npc.movement.y = 0;
			} else {
				npc.movement.x = Math.random() > 0.5 ? ( Math.random() > 0.5 ? -npc.speed : npc.speed ) : 0;
				npc.movement.y = Math.random() > 0.5 ? ( Math.random() > 0.5 ? -npc.speed : npc.speed ) : 0;
				npc.movement.x *= delta;
				npc.movement.y *= delta;
			}
			thinkTime = 0;
		}
	}
	npc.x = 150;
	npc.y = 100;

	var t = new (<any>Test)["Character"]("test");
	t.fromJson("assets/objects/characters/test-char-2.json");
	t.x = 200;
	t.y = 50;
	scene.addObject(t);
	scene.addObject(npc);
	scene.followTarget = player;

	Game.loadScene(scene);
}

export { startup }
