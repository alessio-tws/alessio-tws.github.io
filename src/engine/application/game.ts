import { Application } from "pixi.js";
import { Scene } from "./scene";

class Game {
	static app : Application;

	static width : number;
	static height : number;

	static currentScene : Scene;

	static initialize(width : number, height : number, background : number) {
		Game.width = width;
		Game.height = height;

		Game.app = new Application(
			{
				view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
				resolution: window.devicePixelRatio || 1,
				autoDensity: true,
				backgroundColor: background,
				width: width,
				height: height
			}
		);
		//Game.app.view.style.imageRendering = 'pixelated'
		
		Game.app.ticker.add(Game.update);

		window.addEventListener("resize", Game.resize);
		Game.resize();
	}

	static loadScene(scene : Scene) {
		if (this.currentScene) {
			this.currentScene.stopScene();
		}
		this.currentScene = null;
		if (scene) {
			this.currentScene = scene;
			this.currentScene.startScene(Game.app.stage);
		}
	}

	static async nextFrame() {
		return new Promise( resolve => {
			Game.app.ticker.addOnce(() => resolve(0));
		});
	}
	static async delay(delay : number) {
		return new Promise( resolve => {
			setTimeout(resolve, delay);
		})
	}

	static resize() {
		  // current screen size
		  const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		  const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  
		  // uniform scale for our game
		  const scale = Math.min(screenWidth / Game.width, screenHeight / Game.height);
  
		  // the "uniformly englarged" size for our game
		  const enlargedWidth = Math.floor(scale * Game.width);
		  const enlargedHeight = Math.floor(scale * Game.height);
  
		  // margins for centering our game
		  const horizontalMargin = (screenWidth - enlargedWidth) / 2;
		  const verticalMargin = (screenHeight - enlargedHeight) / 2;
  
		  // now we use css trickery to set the sizes and margins
		  Game.app.view.style.width = `${enlargedWidth}px`;
		  Game.app.view.style.height = `${enlargedHeight}px`;
		  //Game.app.view.style.marginLeft = Game.app.view.style.marginRight = `${horizontalMargin}px`;
		  //Game.app.view.style.marginTop = Game.app.view.style.marginBottom = `${verticalMargin}px`;
	}
	static update() {}
}

export { Game }