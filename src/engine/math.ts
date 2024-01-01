
export default class GameMath {
	public static lerp (start : number, end : number, amt : number) : number {
		return (1-amt)*start+amt*end
	}
	public static randomIntFromInterval(min : number, max : number) : number { // min and max included 
		return Math.floor(Math.random() * (max - min + 1) + min)
	}
}