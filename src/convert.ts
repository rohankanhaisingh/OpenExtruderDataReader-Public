import fs from "fs";
import path from "path";

import Collection from "@babahgee/collection";

interface TimelineData {
	[K: string]: string;
}

(function () {

	const args: string[] = process.argv;
	const fileName: string = args[2];

	if (!fs.existsSync(fileName)) return;

	const dataFile: string = fs.readFileSync(fileName, "utf-8");

	// Verdeel het bestand in regels.
	const allTextLines: string[] = dataFile.split("\n");
	const trimmedTextLines: Collection<string> = new Collection<string>();

	for (let line of allTextLines) {

		const trimmedLine: string = line.trim();

		if (trimmedLine.length !== 0)
			trimmedTextLines.Add(line);
	}

	const lastLine: string | null = trimmedTextLines.Last();

	if (lastLine === null) return;

	const words = lastLine.split(";");
	const timeline: Collection<TimelineData> = new Collection<TimelineData>();

	trimmedTextLines.ForEach(function (line: string, index: number) {

		if (index === trimmedTextLines.Length() - 1) return;

		// Verdeel de regel met text in woorden, gesplit door het puntkomma symbool.
		const lineData: string[] = line.split(";");

		const timelineData: TimelineData = {};

		for (let dataIndex: number = 0; dataIndex < lineData.length; dataIndex += 1) {

			const dataName: string = words[dataIndex];
			const dataValue: string = lineData[dataIndex];
			
			timelineData[dataName] = dataValue;
		}

		timeline.Add(timelineData);
	});

	const jsonTextData = JSON.stringify(timeline.ToArray());

	fs.writeFileSync(fileName + ".json", jsonTextData, "utf-8");
})();