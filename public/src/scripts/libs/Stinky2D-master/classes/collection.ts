import { UniqueID } from "../functions/uid";
import { CollectionElementTypes } from "../typings";

export class Collection<T = any> {

	private elements: T[] = [];

	public maxSize: null | number = null;

	public id: string = UniqueID(18).id;
	public timestamp: number = Date.now();

	/**
	 * Creates a new collection, allowing you to manipulate elements in an advanced way.
	 * It represents a strongly typed array of object that can be accessed by several methods.
	 * 
	 * This class is highly inspired by the List<T> class written in C#.
	 */
	constructor(elements?: T[]) {

		if (elements) this.elements = elements;
	}

	get Count() {
		return this.elements.length;
	}

	get Elements() {
		return this.elements;
	}

	get FirstElement(): T | undefined {
		return this.elements[0];
	}

	/**
	 * Adds an element to the list of strongly typed objects.
	 * 
	 * This method cannot add multiple elements at once using an array.
	 * Instead, use the 'AddUsingArray' method.
	 * @param element
	 */
	public Add(element: T): Collection<T> {

		if (this.maxSize === null) {

			this.elements.push(element);
			return this;
		} 

		const currentElementsLength: number = this.elements.length;

		if (currentElementsLength > this.maxSize - 1)
			throw new Error(`Cannot add object to strongly typed list, since it exceeded the maximum size of entries which is set to ${this.maxSize}.`);

		this.elements.push(element);

		return this;
	}

	public AddRepeat(object: T, amount: number): Collection<T> {

		if (this.maxSize === null) {

			for (let i = 0; i < amount; i++)
				this.elements.push(object);

			return this;
		}

		const currentElementsLength: number = this.elements.length;

		if (currentElementsLength + amount > this.maxSize - 1)
			throw new Error(`Cannot add object to strongly typed list, since it exceeded the maximum size of entries which is set to ${this.maxSize}.`);

		for (let i = 0; i < amount; i++)
			this.elements.push(object);


		return this;
	}

	public AddUsingArray(arr: T[]): Collection<T> {

		if (this.maxSize === null) {

			for (let i = 0; i < arr.length; i++)
				this.elements.push(arr[i]);

			return this;
		}

		const currentElementsLength: number = this.elements.length;

		if (currentElementsLength + arr.length > this.maxSize - 1)
			throw new Error(`Cannot add object to strongly typed list, since it exceeded the maximum size of entries which is set to ${this.maxSize}.`);

		for (let i = 0; i < arr.length; i++)
			this.elements.push(arr[i]);

		return this;
	}

	public GetElement(index: number): T {

		return this.elements[index];
	}

	public Clear(): Collection<T> {

		this.elements = [];

		return this;
	}

	public Has(object: T): boolean {

		let isEqual = false;

		for (let element of this.elements) 
			if (element === object)
				isEqual = true;

		return isEqual;
	}

	public ToArray(): T[] {
		return this.elements;
	}

	public ForEach(callback: (element: T, index: number) => void) {

		const elements: T[] = this.elements;

		for (let i = 0; i < elements.length; i++) {

			const element: T = elements[i];

			callback(element, i);
		}
	}

	public Delete(object: T): T[] | boolean {

		const elements: T[] = this.elements;

		for (let i = 0; i < elements.length; i++) {

			const element: T = elements[i];

			if (element === object) {

				const removeElement: T[] = this.elements.splice(i, 1);

				return removeElement;
			}
		}

		return false;
	}

	public First(): T | null {

		const elements: T[] = this.elements;

		if (typeof elements[0] === "undefined") return null;

		return elements[0];
	}

	public Last(): T | null {

		const elements: T[] = this.elements;

		if (typeof elements[elements.length - 1] === "undefined") return null;

		return elements[elements.length - 1];
	}

	public Reverse(): T[] {
		return this.elements.reverse();
	}

	public SaveReverse(): T[] {

		this.elements = this.elements.reverse();

		return this.elements;
	}

	public FilterStringElements(): string[] {

		const results: string[] = [];
		const elements = this.elements;

		for (let element of elements) {

			if (typeof element === "string") results.push(element);
		}

		return results;
	}

	public FilterNumberElements(): number[] {

		const results: number[] = [];
		const elements = this.elements;

		for (let element of elements) {

			if (typeof element === "number") results.push(element);
		}

		return results;
	}

	public FilterBooleanElements(): boolean[] {

		const results: boolean[] = [];
		const elements = this.elements;

		for (let element of elements) {

			if (typeof element === "boolean") results.push(element);
		}

		return results;
	}

	public FilterFunctionElements(): Function[] {

		const results: Function[] = [];
		const elements = this.elements;

		for (let element of elements) {

			if (typeof element === "function") results.push(element);
		}

		return results;
	}

	public Range(min: number, max: number): T[] {

		const elements: T[] = this.elements;
		const results: T[] = [];

		for (let i = min; i < max; i++) {

			const element: T = elements[i];

			if (typeof element !== "undefined") results.push(element);
		}

		return results;
	}

	public DeleteLast(): T | null {

		const removedElement: T | undefined = this.elements.pop();

		if (typeof removedElement === "undefined") return null;

		return removedElement;
	}

	public ReplaceElement(index: number, object: T): T {

		this.elements[index] = object;

		return object;
	}

	public CloneCollection(): Collection<T> {

		return new Collection<T>(this.elements);
	}

	public MergeCollectionElements(collection: Collection<T>): Collection<T> {

		for (let collectionElements of collection.elements) {

			this.elements.push(collectionElements);
		}

		return this;
	}

	public Shuffle(): T[] {

		const elements: T[] = [ ...this.elements];

		let currentIndex = elements.length, randomIndex;

		while (currentIndex != 0) {

			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			[elements[currentIndex], elements[randomIndex]] = [elements[randomIndex], elements[currentIndex]];
		}

		return elements;
	}

	public SaveShuffle(): T[] {

		const entries: T[] = this.elements;

		let currentIndex = entries.length, randomIndex;

		while (currentIndex != 0) {

			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			[entries[currentIndex], entries[randomIndex]] = [entries[randomIndex], entries[currentIndex]];
		}

		return entries;
	}

	public AllElements(): T[] {
		return this.elements;
	}

	public Length(): number {
		return this.elements.length;
	}

	public GetElementTypes(): CollectionElementTypes[] {

		const types: CollectionElementTypes[] = [];
		const elements: T[] = this.elements;

		for (let element of elements) {

			const elementType: CollectionElementTypes = typeof element;

			if (!types.includes(elementType))
				types.push(elementType);
		}

		return types;
	}
}