import { GeneratedUniqueIDObject } from "../typings";


/**
 * Generates an unique ID, with the given length.
 * The generated ID includes normal and capital letters and numbers, it does not include symbols.
 * 
 * @param len Specifies the length of the generated ID. No length will result an ID with the length of 12.
 */
export function UniqueID(len: number = 12): GeneratedUniqueIDObject {

    let chars: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let generatedID: string = "";

    for (let i = 0; i < len; i++)
        generatedID += chars.charAt(Math.floor(Math.random() * chars.length));

    return {
        id: generatedID,
        timestamp: Date.now(),
        length: generatedID.length
	}
}