import { Application, Container, DisplayObject } from "pixi.js";
import { WorldObject } from "../world/world-object";
import { Game } from "./game";
import GameMath from "../math";
import DisplayComponent from "../components/graphics/display-component";

enum SceneFollowBehavior {
	FollowTarget = 0,
	FocusPoint,
	Free
}

type FocusPoint = {
	x : number, y: number
}

class Scene extends Container {
	objects : Array<WorldObject>;

	public followBehavior : SceneFollowBehavior = SceneFollowBehavior.FollowTarget;
	public followTarget : Container | null = null;
	public focusPoint : FocusPoint | null = null;
	public followSpeed : number = 0.2;

	constructor() {
		super();
		this.objects = [];		
		this.sortableChildren = true;
	}

	public startScene(stage : Container) {
		stage.addChild(this);
		Game.app.ticker.add(this.tick.bind(this));
		for(var obj of this.objects) {
			obj.start();
		}
	}
	public stopScene() {
		Game.app.ticker.remove(this.tick);
		this.removeChildren(0, this.children.length);
		let index = Game.app.stage.children.indexOf(this);
		Game.app.stage.removeChildAt(index);
		this.destroy();
	}
	
	private tick(delta : number) {
		if (!this.transform) return;
		switch(this.followBehavior) {
			case SceneFollowBehavior.FollowTarget:
				if (this.followTarget) {
					this.x = GameMath.lerp(this.x, -this.followTarget.x + Game.app.screen.width / 2, delta * this.followSpeed);
					this.y = GameMath.lerp(this.y, -this.followTarget.y + Game.app.screen.height / 2, delta * this.followSpeed);
				}
				break;
			case SceneFollowBehavior.FocusPoint:
				if (this.focusPoint) {
					this.x = GameMath.lerp(this.x, -this.focusPoint.x + Game.app.screen.width / 2, delta * this.followSpeed);
					this.y = GameMath.lerp(this.y, -this.focusPoint.y + Game.app.screen.height / 2, delta * this.followSpeed);
				}
				break;
			case SceneFollowBehavior.Free:
				break;
		}
	}
		
	public addObject(object : WorldObject) {
		this.objects.push(object);
		object.scene = this;
		this.addChild(object);
		object.onAddedToScene(this);
	}
	public removeObject(object : WorldObject) {
		this.removeChild(object);
		this.objects = this.objects.filter(o => o !== object);
	}
	public getObjectByName(name : String) : WorldObject | null {
		for(var obj of this.objects) {
			if (obj.name === name) {
				return obj;
			}
		}
		return null;
	}

	public screenToWorld(x : number, y : number) {
		return {
			x: x - this.x,
			y: y - this.y
		};
	}
}

export { Scene }