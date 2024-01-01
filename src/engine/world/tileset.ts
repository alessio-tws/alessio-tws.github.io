import { BaseTexture, ISpritesheetData, Spritesheet, Texture } from "pixi.js";

type TilesetOptions = {
	texture : string,
	height : number,
	width : number,
	tileWidth : number,
	tileHeight : number,
	scale : string,
	format : string
}

class Tileset {

	public static tilesets : Map<string, Tileset> = new Map<string, Tileset>();

	public static get(tileset : string) : Tileset {
		if (Tileset.tilesets.has(tileset)) {
			return Tileset.tilesets.get(tileset);
		}
		return null;
	}

	public static async load(options : TilesetOptions) : Promise<Tileset> {
		var tileset = new Tileset(options);
		Tileset.tilesets.set(options.texture, tileset);
		await tileset.initialize();
		return tileset;
	}

	options : TilesetOptions;
	atlasData : ISpritesheetData;
	spritesheet : Spritesheet;

	constructor(options : TilesetOptions) {
		this.options = options;
		this.atlasData = {
			meta: {
				image: options.texture,
				format: options.format,
				size: { w: options.width, h: options.height },
				scale: options.scale
			},
			frames: {}
		}

		var xCount = options.width / options.tileWidth;
		var yCount = options.height / options.tileHeight;
		var count = 0;
		for (var y = 0; y < yCount; y++) {	
			for (var x = 0; x < xCount; x++) {
				var retVal = {
					frame: { x: (this.options.tileWidth * x), y: (this.options.tileHeight * y), w: this.options.tileWidth, h: this.options.tileHeight },
					sourceSize: { w: this.options.tileWidth, h: this.options.tileHeight },
					spriteSourceSize: { x: 0, y: 0, w: this.options.tileWidth, h: this.options.tileHeight }
				}
				this.atlasData.frames[`tile_${count++}`] = retVal;
			}
		}
	}

	public async initialize() {
		this.spritesheet = new Spritesheet(BaseTexture.from(this.atlasData.meta.image), this.atlasData);
		await this.spritesheet.parse();
	}

	public getTile(tileId : number) : Texture {
		return this.spritesheet.textures[`tile_${tileId}`];
	}
}

export { Tileset }