import { DisplayObject, Sprite, SpriteSource } from "pixi.js";
import DisplayComponent from "./display-component";

export default class SpriteDisplayComponent extends DisplayComponent {
	sprite : Sprite;

	constructor(name : string) {
		super(name);
		this._type = "sprite";
		this.on("addedToObject", this.onAddedToObject.bind(this));
	}

	protected onAddedToObject(params) {
		if (this.sprite)
			this.parent.addChild(this.sprite);
	}

	public getDisplayObject(): DisplayObject {
		return this.sprite;
	}

	public static fromTexture(name : string, texture : SpriteSource) : SpriteDisplayComponent {
		var newComp = new SpriteDisplayComponent(name);
		newComp.sprite = Sprite.from(texture);
		return newComp;
	}
}