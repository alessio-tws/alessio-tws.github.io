import WorldObjectComponent from "../world-object-component";

export default class MovementComponent extends WorldObjectComponent {

	speed = {
		x: 0,
		y: 0
	}

	constructor(name : string) {
		super(name);
		this._type = "movement-component";
		this.on("tick", this.tick.bind(this));
	}

	private tick(params) {
		var delta = params.delta;
		if (this.parent) {
			this.parent.x += this.speed.x * delta;
			this.parent.y += this.speed.y * delta;
		}
	}
}