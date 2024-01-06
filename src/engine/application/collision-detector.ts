import { Graphics, Rectangle } from "pixi.js";
import { WorldObject } from "../world/world-object";
import { Game } from "./game";
import { Scene } from "./scene";
import '@pixi/math-extras';

type Collision = {
	x?: number,
	collider1: WorldObject,
	collider2: WorldObject,
	intersection : Rectangle
}

class Quadrant {
	region: Rectangle;
	objects: Array<WorldObject> = [];
	pendingInsertion: Array<WorldObject> = [];

	childNodes: Array<Quadrant> = [];

	maxLifeSpan: number = 8;
	currentLife: number = -1;

	parent: Quadrant;

	constructor(region : Rectangle, objects : Array<WorldObject>) {
		this.region = region;
		this.objects = [...objects];
		this.currentLife = -1;
	}

	private containsRect(r1 : Rectangle, r2 :Rectangle) : boolean {
		return r2.right < r1.right && r2.left > r1.left && r2.top > r1.top && r2.bottom < r1.bottom;
	}

	public BuildTree() {
		
		if (this.objects.length <= 1)
			return;
		if (this.region.width < 1)
			return;

		var half = this.region.width / 2;
		var center = { x: this.region.x + half, y: this.region.y + half };

		var quadrants = new Array<Rectangle>();

		quadrants[0] = new Rectangle(this.region.x, this.region.y, half, half);
		quadrants[1] = new Rectangle(this.region.x + half, this.region.y, half, half);
		quadrants[2] = new Rectangle(this.region.x, this.region.y + half, half, half);
		quadrants[3] = new Rectangle(this.region.x + half, this.region.y+half, half, half);

		var quadList : Array<Array<WorldObject>> = [];
		var delist : Array<WorldObject> = [];

		for(var object of this.objects) {
			for(let i = 0; i < 4; i++) {
				if (!quadList[i]) { quadList[i] = []}
				var rect = new Rectangle(object.collision.bounds.x + object.x, object.collision.bounds.y + object.y, object.collision.bounds.width, object.collision.bounds.height);
				if (this.containsRect(quadrants[i], rect)) { //object.collision.bounds.x + object.x, object.collision.bounds.y + object.y)) {
					quadList[i].push(object);
					delist.push(object);
					break;
				}
			}
		}

		for(var obj of delist) {
			let index = this.objects.indexOf(obj);
			this.objects.splice(index, 1);
		}

		for(let i = 0; i < 4; i++) {
			if (quadList[i] && quadList[i].length != 0) {
				this.childNodes[i] = this.createNode(quadrants[i], quadList[i]);
				if (this.childNodes[i])
					this.childNodes[i].BuildTree();
			}
		}
	}

	createNode(region : Rectangle, objects : WorldObject[]) : Quadrant {
		if (!objects || objects.length <= 0) return null;
		var quad = new Quadrant(region, objects);
		quad.parent = this;
		return quad;
	}

	colors = [
		0xffffff,
		0xff00ff,
		0x00ff00,
		0x0000ff
	]

	getRectangles(gfx : Graphics, level : number = 0) {
		var retVal = [];
		if (level >= this.colors.length) level = 0;

		if(level >= this.colors.length) level = 0;
		gfx.lineStyle(1, 0xffffff);
		retVal.push(
			gfx.drawRect(this.region.x, this.region.y, this.region.width, this.region.height)
		);

		/*for(var o of this.objects) {
			ar line = new Graphics();
			line.x = this.region.x + this.region.width / 2;
			line.y = this.region.y + this.region.height / 2;
			line.lineStyle(1, 0xff0000);
			line.lineTo(o.collision.x - line.x, o.collision.y-line.y);
			gfx.addChild(line);
		}*/

		for(var quad of this.childNodes) {
			if (quad) {
				retVal = [...retVal, quad.getRectangles(gfx, level + 1)];
			}
			
		}
		return retVal;
	}

	getCollisions(collisions : Array<Collision> = []) : Array<Collision> {
		var retVal = [...collisions];
		for(var obj of this.objects) {
			for(var obj2 of this.objects) {
				var collision = this.checkCollision(obj, obj2);
				if (collision) {
					if (!retVal.find(r => (r.collider1 === obj && r.collider2 === obj2) || (r.collider2 === obj && r.collider1 === obj2))) {
						retVal.push(collision);
					}
				}
			}
		}
		if (this.parent) {
			for(var obj of this.parent.objects) {
				for(var obj2 of this.objects) {
					var collision = this.checkCollision(obj, obj2);
					if (collision) {
						if (!retVal.find(r => (r.collider1 === obj && r.collider2 === obj2) || (r.collider2 === obj && r.collider1 === obj2))) {
							retVal.push(collision);
						}
					}
				}
			}
			if (this.parent.parent) {
				for(var obj of this.parent.parent.objects) {
					for(var obj2 of this.objects) {
						var collision = this.checkCollision(obj, obj2);
						if (collision) {
							if (!retVal.find(r => (r.collider1 === obj && r.collider2 === obj2) || (r.collider2 === obj && r.collider1 === obj2))) {
								retVal.push(collision);
							}
						}
					}
				}
			}
		}
		for(var node of this.childNodes) {
			if (node) {
				retVal = retVal.concat(node.getCollisions(collisions));
			}
		}
		return retVal;
	}

	checkCollision(obj : WorldObject, obj2 : WorldObject) : Collision | null {

		if (obj === obj2) return null;
		
		var r1 = new Rectangle(obj.collision.bounds.x + obj.x, obj.collision.bounds.y + obj.y, obj.collision.bounds.width, obj.collision.bounds.height);
		var r2 = new Rectangle(obj2.collision.bounds.x + obj2.x, obj2.collision.bounds.y + obj2.y, obj2.collision.bounds.width, obj2.collision.bounds.height);
		var inters = r1.intersection(r2);
		inters.x -= obj.x;
		inters.y -= obj.y;

		if (r1.intersects(r2)) {
			return {
				collider1: obj,
				collider2: obj2,
				intersection: inters
			};
		}
		return null;
	}
	
}

export default class CollisionDetector {
	root : Quadrant;
	private scene : Scene;
	collisions : Array<Collision> = [];

	constructor(scene : Scene) {
		this.scene = scene;
		Game.app.ticker.add(this.tick, this);
	}
	
	private tick(delta) {
		this.root = new Quadrant(new Rectangle(0, 0, 800, 800), this.scene.objects);
		this.root.BuildTree();
		var oldCollisions = [...this.collisions];
		this.collisions = this.root.getCollisions();

		for(var collision of oldCollisions) {
			if (!this.collisions.find((c) => (c.collider1 === collision.collider1 && c.collider2 === collision.collider2) || (c.collider2 === collision.collider1 && c.collider1 === collision.collider2))) {
				collision.collider1.collision.dispatch("collisionEnded", collision);
				collision.collider2.collision.dispatch("collisionEnded", collision);
			}
		}

		for(var collision of this.collisions) {
			collision.collider1.collision.dispatch("collisionDetected", collision);
			collision.collider2.collision.dispatch("collisionDetected", collision);
		}
	}
}

export { Collision }