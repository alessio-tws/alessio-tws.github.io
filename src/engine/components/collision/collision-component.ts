import { Graphics, Rectangle } from "pixi.js";
import WorldObjectComponent from "../world-object-component";
import { Collision } from "../../application/collision-detector";

enum CollisionResponse {
	None = 0,
	BlockAll
}

type CollisionBound = {
	x?: number,
	y?: number,
	width?: number,
	height?: number
}

export default class CollisionComponent extends WorldObjectComponent {
	bounds : CollisionBound = {};
	collisionResponse : CollisionResponse = CollisionResponse.None;
	private boundsGraphic : Graphics;
	private boundsColor = 0xffffff;
	colliding : boolean = false;
	lastCollision : Collision;
	_rect : Rectangle;

	public get rect() {
		if (!this._rect) {
		}
		this._rect = new Rectangle(this.x, this.y, this.bounds.width, this.bounds.height);
		
		return this._rect;
	}

	public set showBounds(show : boolean) {
		if (this.boundsGraphic)
		{
			this.boundsGraphic.visible = show;
		}
	}
	public get x() : number {
		return this.parent.x + this.bounds.x;
	}
	public get y() : number {
		return this.parent.y + this.bounds.y;
	}
	constructor(name : string) {
		super(name);
		this._type = "collision-component";
		this.on('tick', this.tick.bind(this));
		this.on('addedToObject', this.onAddedToObject.bind(this));
		this.on('collisionDetected', this.onCollisionDetected.bind(this));
		this.on('collisionEnded', this.onCollisionExit.bind(this));
	}

	private onCollisionDetected(collision) {
		if (!this.colliding) {
			this.onCollisionEnter(collision);
		}
		if (collision.collider1 === this.parent) {
			this.boundsGraphic.lineStyle(1, 0x00ff00);
			this.boundsGraphic.drawRect(collision.intersection.x, collision.intersection.y, collision.intersection.width, collision.intersection.height);
		}
		this.lastCollision = collision;
		this.colliding = true;
	}

	private onCollisionEnter(collision) {
		this.boundsColor = 0xff0000;
	}
	private onCollisionExit(collision) {
		this.boundsColor = 0xffffff;
		this.colliding = false;
	}

	private onAddedToObject(params) {
		this.boundsGraphic = new Graphics();
		this.boundsGraphic.lineStyle({
			width: 2
		});
		this.parent.addChild(this.boundsGraphic);
		this.showBounds = true;	
	}

	private tick(params) {
		var delta = params.delta;
		if (this.boundsGraphic.visible)
		{
			this.boundsGraphic.geometry.clear();
			this.boundsGraphic.lineStyle(1, this.boundsColor);			
			this.boundsGraphic.drawRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
			this.boundsGraphic.zIndex = this.parent.zIndex + 10;
		}
	}
}