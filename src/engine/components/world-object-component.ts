import { WorldObject } from "../world/world-object";

interface ComponentCallback {
	(params): void;
}

export default class WorldObjectComponent {
	name : string;
	parent : WorldObject;
	protected _type : string;

	events : Map<string, Array<ComponentCallback>> = new Map<string, Array<ComponentCallback>>()

	constructor(name : string) {
		this.name = name;
	}

	public on(event : string, callback : ComponentCallback) {
		if (!this.events.has(event)) {
			this.events.set(event, []);
		}
		this.events.get(event).push(callback);
	}

	public dispatch(eventId : string, params) {
		if (this.events.has(eventId)) { 
			for(var cb of this.events.get(eventId)) {
				cb(params);
			}
		}
	}

	public get type() : string { return this._type }
}