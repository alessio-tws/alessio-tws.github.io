import { MapEditor } from "./map-editor";
import $ from "jquery";

class MapEditorTile {

	element : JQuery<HTMLElement>;
	private _x : number;
	private _y : number;
	private _id : number;
	private _mapEditor : MapEditor;

	public get x() : number {
		return this.element ? parseInt(this.element.attr("x")) : 0;
	}
	public get y() : number {
		return this.element ? parseInt(this.element.attr("y")) : 0;
	}
	public get id() : number {
		return this.element ? parseInt(this.element.attr("id")) : -1;
	}

	constructor(id : number, tileWidth : number, tileHeight : number, x : number, y : number, parent : JQuery<HTMLElement>, mapEditor : MapEditor) {

		this._mapEditor = mapEditor;
		this.element = $("<div>", {
			class: "map-editor-tile",
			width: `${tileWidth-2}px`,
			height: `${tileHeight-2}px`
		}).css({
			top: `${y * tileHeight}px`,
			left: `${x * tileWidth}px`
		})
		.attr("x", x.toString())
		.attr("y", y.toString())
		.attr("id", id.toString())
		.on("click", this.onclick.bind(this))
		.on("mousemove", this.onmouseenter.bind(this))
		.on("mouseenter", this.onmouseenter.bind(this))
		.appendTo(parent);
	}

	private onclick(e) {
		let element = e.target;
		if (!this._mapEditor.currentTiles.find( (e) => e === this)) {
			this._mapEditor.addToBrush(this);
		}
	}
	private onmouseenter(e) {
		if (this._mapEditor.selectingTiles) {
			let element = e.target as HTMLDivElement;
			if (!this._mapEditor.currentTiles.find( (e) => e === this)) {
				this._mapEditor.addToBrush(this);
			}
		}
	}
}

export { MapEditorTile }