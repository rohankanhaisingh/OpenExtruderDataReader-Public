import { UniqueID } from "../functions/uid";

export class InbuiltFunction {
	public id: string = UniqueID(18).id;
	public timestamp: number = Date.now();

	public Execute() { };
}