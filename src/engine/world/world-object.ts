import { Assets, Container, DisplayObject, Graphics, IDestroyOptions, Point, Sprite, SpriteSource } from 'pixi.js'
import { Scene } from '../application/scene';
import WorldObjectComponent from '../components/world-object-component';
import { Game } from '../application/game';
import CollisionComponent from '../components/collision/collision-component';
import axios from 'axios';
import AnimationComponent from '../components/graphics/animation-component';
import SpriteDisplayComponent from '../components/graphics/sprite-display-component';

function instanceOf<T, C extends new (...args: any[]) => any>(value: T, clss: C): boolean {
	return value instanceof clss;
  }

/*
  Lifecycle:
  	- constructor
	- onAddedToScene
	- start
	- tick
	- onRemovedFromScene
*/
interface TickCallback {
	(delta): void;
}
interface VoidCallback {
	() : void;
}

class WorldObject extends Container {
	scene : Scene;
	collision : CollisionComponent;
	components : Array<WorldObjectComponent> = new Array<WorldObjectComponent>();

	sortZ : boolean = true;

	onTick : TickCallback;
	onStart : VoidCallback;

	constructor(name : string) {
		super();
		this.name = name;
		this.collision = new CollisionComponent("collision");
		this.collision.bounds.width = 10;
		this.collision.bounds.height = 10;
		this.sortableChildren = true;
		this.addComponent(this.collision);
		Game.app.ticker.add(this.tick, this);
	}
	public addComponent(component : WorldObjectComponent) {
		if (!component) return;
		component.parent = this;
		this.components.push(component);
		component.dispatch("addedToObject", {});
		return this;
	}
	public getComponent<Type extends WorldObjectComponent>(name : string) : Type {
		for(var comp of this.components) {
			if (comp.name === name) return (comp as Type);
		}
		return null;
	}
	public getComponents<Type extends WorldObjectComponent>(type : string) : Array<Type> {
		var retVal = [];
		for(var comp of this.components) {
			if (comp.type === type) retVal.push(comp as Type);
		}
		return retVal;
	}
	public onAddedToScene(scene : Scene) {
		this.scene = scene;
		for(var component of this.components) {
			component.dispatch("addedToScene", { scene: this.scene });
		}
	}
	public start() {
		if (this.onStart) {
			this.onStart();
		}
	}
	protected tick(delta) {
		if (this.sortZ) {
			this.zIndex = 999 + this.y;
		}

		for(var component of this.components) {
			component.dispatch("tick", { delta: delta });
		}
		if (this.onTick)
		{
			this.onTick(delta);
		}
	}

	destroy(options?: boolean | IDestroyOptions): void {
		Game.app.ticker.remove(this.tick, this);
		this.scene.removeObject(this);		
		super.destroy(options);
	}

	public move(amount : { x: number, y: number }) {
		this.x += amount.x;
		this.y += amount.y;
	}

	public distanceTo(position : {x: number, y: number}) : number {
		var delta = {
			x: Math.pow(position.x-this.x, 2),
			y: Math.pow(position.y-this.y, 2)
		}

		return Math.sqrt(delta.x + delta.y);

	}

	public async fromJson(jsonUrl : string) {
		await axios.get(jsonUrl).then(async (resp)=>{
			var data = resp.data;
			this.name = data.name;
			var display = new SpriteDisplayComponent("display");
			this.addComponent(display);
			if (data.display.animations.length) {
				var animationComponent = new AnimationComponent("animation-component", data.display.textureOptions);
				for(var anim of data.display.animations) {
					animationComponent.setupAnimation(anim.name, anim.startX, anim.startY, anim.frameCount);
				}
				this.addComponent(animationComponent);
				await animationComponent.initialize();
			}
			this.collision.bounds.x = data.collision.x;
			this.collision.bounds.y = data.collision.y;
			this.collision.bounds.width = data.collision.width;
			this.collision.bounds.height = data.collision.height;
		}).catch((err)=>console.error(err))
	}

	public static async fromJson(jsonUrl : string) : Promise<WorldObject> {
		var obj : WorldObject;
		await axios.get(jsonUrl).then(async (resp)=>{
			var data = resp.data;
			obj = new WorldObject(data.name);
			var display = new SpriteDisplayComponent("display");
			obj.addComponent(display);
			if (data.display.animations.length) {
				var animationComponent = new AnimationComponent("animation-component", data.display.textureOptions);
				for(var anim of data.display.animations) {
					animationComponent.setupAnimation(anim.name, anim.startX, anim.startY, anim.frameCount);
				}
				obj.addComponent(animationComponent);
				await animationComponent.initialize();
			}
			obj.collision.bounds.x = data.collision.x;
			obj.collision.bounds.y = data.collision.y;
			obj.collision.bounds.width = data.collision.width;
			obj.collision.bounds.height = data.collision.height;
		}).catch((err)=>console.error(err))
		
		return obj;
	}
}

export { WorldObject }