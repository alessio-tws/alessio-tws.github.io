import { DisplayObject, Sprite, SpriteSource } from "pixi.js";
import { WorldObject } from "./world-object";

class StaticObject extends WorldObject {

	sprite : Sprite;

	constructor(name : String, texture : SpriteSource) {
		super(name);
		this.sprite = Sprite.from(texture);
	}

	public onAddedToScene(): void {
		this.scene.addChild(this.sprite);	
	}

	public getDisplayObject(): DisplayObject {
		return this.sprite;
	}
}

export { StaticObject }