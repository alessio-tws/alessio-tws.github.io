import { AnimatedSprite, BaseTexture, ISpritesheetData, Sprite, Spritesheet } from "pixi.js";
import WorldObjectComponent from "../world-object-component";
import StaticDisplayComponent from "./sprite-display-component";

type SpritesheetOptions = {
	texture : string,
	width : number,
	height: number,
	frameWidth : number,
	frameHeight : number,
	format : string,
	scale : string,
	animationSpeed : number
}

export default class AnimationComponent extends WorldObjectComponent {
	currentSprite : AnimatedSprite;
	sprites : Map<String, AnimatedSprite> = new Map<String, AnimatedSprite>();
	atlasData : ISpritesheetData;
	spritesheet : Spritesheet;
	spritesheetOptions : SpritesheetOptions;

	target : Sprite;

	constructor(name : string, textureOptions : SpritesheetOptions) {
		super(name);
		this.spritesheetOptions = textureOptions;
		this.atlasData = {
			meta: {
				image: textureOptions.texture,
				format: textureOptions.format,
				size: { w: textureOptions.width, h: textureOptions.height },
				scale: textureOptions.scale
			},
			frames: {},
			animations: {}
		}
		this._type = "animation-component";
		this.on("addedToObject", this.onAddedToObject.bind(this));
		//this.on("tick", this.tick.bind(this));
	}
	public async initialize() {
		this.spritesheet = new Spritesheet(BaseTexture.from(this.atlasData.meta.image), this.atlasData);
		await this.spritesheet.parse();
		let keys = Object.keys(this.atlasData.animations);
		for(var animation of keys) {
			var sprite = new AnimatedSprite(this.spritesheet.animations[`${animation}`]);
			sprite.animationSpeed = this.spritesheetOptions.animationSpeed;
			sprite.visible = false;
			sprite.anchor.x = 0;
			sprite.anchor.y = 0;
			sprite.pivot.x = 0;
			sprite.pivot.y = 0;
			this.sprites.set(animation,sprite);
			if (this.parent) {
				this.parent.addChild(sprite);
			}
		}
		this.sprites.get(keys[0]).visible = true;
		this.currentSprite = this.sprites.get(keys[0]);
		this.setAnimation(keys[0]);
	}
	private onAddedToObject(params) {
		var display = this.parent.getComponent<StaticDisplayComponent>("display");
		if (display) {
			this.target = display.sprite;
		}
	}
	public setAnimation(name : String) {
		var display = this.parent.getComponent<StaticDisplayComponent>("display");
		if (!display)
			return;
		if (this.sprites.has(name)) {
			var oldSprite : AnimatedSprite;
			if (this.currentSprite)
			{
				oldSprite = this.currentSprite;
				this.currentSprite.visible = false;
			}
			this.currentSprite = this.sprites.get(name);
			this.currentSprite.visible = true;
			display.sprite = this.currentSprite;
		}
	}
	public play() {
		if (this.currentSprite) {
			this.currentSprite.play();
		}
	}
	public stop() {
		if (this.currentSprite) {
			this.currentSprite.stop();
		}
	}
	public isPlaying() : boolean {
		if (this.currentSprite) {
			return this.currentSprite.playing;
		}
		return false;
	}
	public setupAnimation(name : String, startX : number, startY : number, frameCount : number, direction : number = 0) {
		this.atlasData.animations[`${name}`] = [];
		for(let i = startX; i < startX+frameCount; i++) {
			var frame = this.getFrame(i, startY);
			this.atlasData.frames[`${name}_${i-startX}`] = frame;
			this.atlasData.animations[`${name}`].push(`${name}_${i-startX}`);
		}
	}
	private getFrame(x : number, y : number) {
		var retVal = {
			frame: { x: (this.spritesheetOptions.frameWidth * x), y: (this.spritesheetOptions.frameHeight * y), w: this.spritesheetOptions.frameWidth, h: this.spritesheetOptions.frameHeight },
			sourceSize: { w: this.spritesheetOptions.frameWidth, h: this.spritesheetOptions.frameHeight },
			spriteSourceSize: { x: 0, y: 0, w: this.spritesheetOptions.frameWidth, h: this.spritesheetOptions.frameHeight }
		}
		return retVal;
	}
}