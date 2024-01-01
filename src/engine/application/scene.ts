import { Application, Container, DisplayObject } from "pixi.js";
import { WorldObject } from "../world/world-object";
import { StaticObject } from "../world/static-object";
import { DynamicObject } from "../world/dynamic-object";
import { Game } from "./game";
import GameMath from "../math";

enum SceneFollowBehavior {
	FollowTarget = 0,
	FocusPoint,
	Free
}

type FocusPoint = {
	x : number, y: number
}

class Scene extends Container {
	private objects : Array<WorldObject>;
	private keyStates : Map<string, boolean> = new Map<string, boolean>();
	public onKeyDown : Array<(e : KeyboardEvent) => void> = [];
	public onKeyUp : Array<(e : KeyboardEvent) => void> = [];

	public followBehavior : SceneFollowBehavior = SceneFollowBehavior.FollowTarget;
	public followTarget : WorldObject | null = null;
	public focusPoint : FocusPoint | null = null;
	public followSpeed : number = 0.2;

	constructor() {
		super();
		this.objects = [];
		document.addEventListener("keydown", this._onKeyDown.bind(this));
		document.addEventListener("keyup", this._onKeyUp.bind(this));
		this.sortableChildren = true;
	}

	public startScene(stage : Container) {
		stage.addChild(this);
		Game.app.ticker.add(this.tick.bind(this));
	}
	public stopScene() {

	}
	
	private tick(delta : number) {
		
		switch(this.followBehavior) {
			case SceneFollowBehavior.FollowTarget:
				if (this.followTarget && this.followTarget.getDisplayObject()) {
					this.x = GameMath.lerp(this.x, -this.followTarget.getDisplayObject().x + Game.app.screen.width / 2, delta * this.followSpeed);
					this.y = GameMath.lerp(this.y, -this.followTarget.getDisplayObject().y + Game.app.screen.height / 2, delta * this.followSpeed);
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

	public isKeyDown(keyCode : string) : boolean {
		return this.keyStates.has(keyCode) ? this.keyStates.get(keyCode) : false;
	}
	private _onKeyDown(e : KeyboardEvent) : void {
		if (!this.keyStates.has(e.code)) {
			this.keyStates.set(e.code, false);
		}

		if (!this.keyStates.get(e.code)) {
			for(var cb of this.onKeyDown) {
				cb(e);
			}
		}
		this.keyStates.set(e.code, true);
	}
	private _onKeyUp(e : KeyboardEvent) : void { 
		this.keyStates.set(e.code, false);
		for(var cb of this.onKeyUp) {
			cb(e);
		}
	}	

	public addObject(object : WorldObject) {
		this.objects.push(object);
		object.scene = this;
		object.onAddedToScene();
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