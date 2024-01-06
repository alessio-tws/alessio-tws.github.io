import { UPDATE_PRIORITY } from "pixi.js";
import { Game } from "./game";

enum KeyState { 
	Up = 0,
	PressedThisFrame,
	Down
}

export default class InputManager {
	private static keyStates : Map<string, KeyState> = new Map<string, KeyState>();
	public static onKeyDown : Array<(e : KeyboardEvent) => void> = [];
	public static onKeyUp : Array<(e : KeyboardEvent) => void> = [];

	public static initialize() {
		document.addEventListener("keydown", this._onKeyDown.bind(this));
		document.addEventListener("keyup", this._onKeyUp.bind(this));
		Game.app.ticker.add(this.tick, this, UPDATE_PRIORITY.LOW);
	}

	public static isKeyDown(keyCode : string) : boolean {
		return InputManager.keyStates.has(keyCode) ? this.keyStates.get(keyCode) === KeyState.Down || this.keyStates.get(keyCode) === KeyState.PressedThisFrame : false;
	}
	public static isKeyPressed(keyCode : string) : boolean {
		return InputManager.keyStates.has(keyCode) ? this.keyStates.get(keyCode) === KeyState.PressedThisFrame : false;
	}
	private static _onKeyDown(e : KeyboardEvent) : void {
		if (!this.keyStates.has(e.code)) {
			this.keyStates.set(e.code, KeyState.Up);
		}

		if (!this.keyStates.get(e.code)) {
			for(var cb of this.onKeyDown) {
				cb(e);
			}
		}
		this.keyStates.set(e.code, (this.keyStates.get(e.code) === KeyState.Up) ? KeyState.PressedThisFrame : KeyState.Down);
	}
	private static _onKeyUp(e : KeyboardEvent) : void { 
		this.keyStates.set(e.code, KeyState.Up);
		for(var cb of this.onKeyUp) {
			cb(e);
		}
	}	

	private static tick(delta) {
		for(var key of InputManager.keyStates.keys()) {
			if (InputManager.keyStates.get(key) === KeyState.PressedThisFrame)
			{
				InputManager.keyStates.set(key, KeyState.Down);
			}
		}
	}
}