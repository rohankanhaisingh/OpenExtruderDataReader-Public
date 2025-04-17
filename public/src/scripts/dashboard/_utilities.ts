import Collection from "@babahgee/collection";

import { ExtruderData } from "../typings";

export function filterCsvValues(csvData: Collection<ExtruderData>, key: keyof ExtruderData): Collection<string | number> {

	const values: Collection<string | number> = new Collection<string | number>();

	csvData.ForEach(function (data: ExtruderData) {
		values.Add(data[key]);
	});

	return values;
}

export function convertValuesToNumbers(data: Collection<any>): Collection<number> {

	const values = new Collection<number>();

	data.ForEach(function (data: any) {
		const convertedValue = parseFloat(data);

		if (!isNaN(convertedValue))
			values.Add(convertedValue);
	});

	return values;
}

export function extractKeysFromData(data: Collection<ExtruderData>) {

	const keys = new Collection<keyof ExtruderData>(),
		keysBlacklist: Collection<keyof ExtruderData> = new Collection<keyof ExtruderData>(["Time", "TrolleyStart", "TrolleyStop", "TrolleyClassification"]);

	data.ForEach(function (extruderData: ExtruderData) {
		for (let key in extruderData) {
			const keyCasting = key as keyof ExtruderData,
				item = extruderData[keyCasting],
				isNumber = parseFloat(item.toString());

			if (!isNaN(isNumber))
				if (!keys.Has(keyCasting) && !keysBlacklist.Has(keyCasting))
					keys.Add(keyCasting);
		}
	});

	return keys;
}

export function createButton(iconSource: string, text: string) {

	const button = document.createElement("button");
	button.innerHTML += `<img src="${iconSource}" alt="Verwijder grafiek-data" />`;
	button.innerHTML += `<span>${text}</span>`;

	return button;
}

export function filterDataBasedOnTime(csvData: Collection<ExtruderData>, startingFrom: string, milliseconds: number) {

	const firstData: ExtruderData | null = csvData.First(),
		filteredData: Collection<ExtruderData> = new Collection<ExtruderData>();

	if (firstData === null) return filteredData;

	const startTime = new Date("0001-01-01T" + startingFrom);

	console.log(startTime);

	csvData.ForEach(function (data: ExtruderData, index: number) {

		const dataTime = new Date("0001-01-01T" + data.Time);
	
		const startTimestamp = startTime.getTime(),
			dataTimestamp = dataTime.getTime();

		if (dataTimestamp > startTimestamp - milliseconds && dataTimestamp <= startTimestamp) 
			filteredData.Add(data);
	});

	return filteredData;
} 