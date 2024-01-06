import { Tileset } from "../world/tileset";

export default class ResourceManager {
	public static async loadTilesets() {
		var ts = await Tileset.load({
			texture: "assets/images/tilesets/Tileset.png",
			width: 128,
			height: 240,
			tileHeight: 16,
			tileWidth: 16,
			scale: "0.5",
			format: "RGBA8888"
		})
		
		var ts2 = await Tileset.load({
			texture: "assets/images/tilesets/Decorations.png",
			width: 256,
			height: 256,
			tileHeight: 16,
			tileWidth: 16,
			scale: "0.5",
			format: "RGBA8888"
		});
	}
}