import { DisplayObject } from "pixi.js";
import WorldObjectComponent from "../world-object-component";

export default class DisplayComponent extends WorldObjectComponent {
	private _x : number;
	private _y : number;

	constructor(name : string) {
		super(name);
	}
	public get x() {
		return this.getDisplayObject() ? this.getDisplayObject().x : 0;
	}
	public get y() {
		return this.getDisplayObject() ? this.getDisplayObject().y : 0;
	}
	public set x(x : number) {
		if (this.getDisplayObject()) {
			this.getDisplayObject().x = x;
		}
	}
	public set y(y : number) {
		if (this.getDisplayObject()) {
			this.getDisplayObject().y = y;
		}
	}
	public getDisplayObject() : DisplayObject {
		return null;
	}
}