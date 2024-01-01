import { Assets, Container, DisplayObject, Sprite, SpriteSource } from 'pixi.js'
import { Scene } from '../application/scene';

class WorldObject {
	name : String;
	scene : Scene;
	constructor(name : String) {
		this.name = name;
	}

	public onAddedToScene() {}

	public getDisplayObject() : DisplayObject {
		return null;
	}
}

export { WorldObject }