import "../../styles/components/_side-menu";
import "../../styles/components/_navbar";
import "../../styles/components/_footer";
import "../../styles/components/_button";

import "../../styles/utilities/_root";
import "../../styles/utilities/_default-styles";
import "../../styles/utilities/_accents";

import "../../styles/pages/dashboard/style";

import Collection from "@babahgee/collection";
import { UniqueID } from "../libs/Stinky2D-master/index";

import { ExtruderData } from "../typings";

import { constructTemperatureComponents } from "./_temperature-constructor";
import { constructThicknessComponents } from "./_thickness-constructor";
import { filterDataBasedOnTime } from "./_utilities";
import { constructChartControlButtons, constructChartDomElements, displayChart } from "./_chart";

const uploadFileButton = document.querySelector<HTMLButtonElement>("#dashboard-button-upload-file"),
	downloadAsJsonButton = document.querySelector<HTMLButtonElement>("#dashboard-button-download-as-json");

export let hasAlreadyImportedFile: boolean = false;
export let loadedExtruderDataFile: string = "";

function convertCsvToJson(fileContent: string): Collection<ExtruderData> | null {

	const lines: string[] = fileContent.split("\n"),
		checkedLines: Collection<string> = new Collection<string>();

	// Verwijder lege tekstregels.
	for (let i = 0; i < lines.length; i++) {
		let textLine: string = lines[i],
			trimmedTextLine: string = textLine.trim();

		// Verwijder alle onnodige karakters van de tekstregel.
		trimmedTextLine = trimmedTextLine.replace("\r", "");

		// Zodra de lengte van de regel gelijk staat aan 0, verwijder het dan uit
		// het array met tekstregels.
		if (trimmedTextLine.length !== 0)
			checkedLines.Add(trimmedTextLine);
	}

	// Laaste regel moet de naam van elk kolom bevatten.
	const lastTextLine: string | null = checkedLines.Last();

	if (lastTextLine === null) return null;

	const columnNames = lastTextLine.split(";") as (keyof ExtruderData)[];
	const parsedData = new Collection<ExtruderData>();

	// Verwijder laatste tekstregel.
	checkedLines.DeleteLast();

	checkedLines.ForEach(function (line: string) {

		const lineData: {[K: string]: string | number} = {};
	
		// Scheidt de tekstregel tussen het puntkomma symbool.
		const splittedLineData: string[] = line.split(";");

		for (let i = 0; i < splittedLineData.length; i++) {
			const dataKey: string = columnNames[i],
				dataValue: string = splittedLineData[i];

			if (dataKey !== "")
				lineData[dataKey] = dataValue;
		}

		const casting = lineData as unknown as ExtruderData;

		parsedData.Add(casting);
	});

	return parsedData;
}

function initializeDashboard(data: Collection<ExtruderData>) {

	deleteDashboardContent();

	const dataToPlace: Collection<ExtruderData> = filterDataBasedOnTime(data, (data.First() as ExtruderData).Time, (1000 * 60) * 1);
	dataToPlace.SaveReverse();

	const dashboardContainer = document.createElement("div");
	dashboardContainer.className = "constructed-dashboard-container";
	dashboardContainer.id = UniqueID(18).id;

	constructChartDomElements(dashboardContainer);
	displayChart(dataToPlace, "Setting temperature zone 1");

	constructChartControlButtons(data, dashboardContainer);
	constructTemperatureComponents(data, dashboardContainer);
	constructThicknessComponents(data, dashboardContainer);

	const contentParent = document.querySelector(".app-content-spacer");

	contentParent?.appendChild(dashboardContainer);
}

function deleteDashboardContent() {

	const contentParent = document.querySelector(".app-content-spacer");

	if (contentParent === null) return;

	const constructedContainers = contentParent.querySelectorAll(".constructed-dashboard-container");

	for (let container of constructedContainers)
		contentParent.removeChild(container);
}

// Functie dat de upload-knop functionaliteit geeft.
function handleFileUploading() {

	const dummyInput = document.createElement("input");
	dummyInput.type = "file";
	dummyInput.role = "input";
	dummyInput.accept = ".csv";
	dummyInput.id = UniqueID(18).id;

	dummyInput.click();

	dummyInput.addEventListener("change", function (event: Event) {

		const inputElement = event.target as HTMLInputElement;

		// Eigenschap 'files' moet bestaan in type HTMLInputElement.
		if (inputElement.files === null || inputElement.files.length === 0) return;

		const file: File = inputElement.files[0];
		const reader: FileReader = new FileReader();

		// Zorg ervoor dat het een .csv bestand is.
		if (!file.name.endsWith(".csv")) return alert("Kan het opgegeven bestand niet lezen, aangezien het geen .csv bestand is.");

		reader.addEventListener("load", function (ev: ProgressEvent<FileReader>) {
			if (reader.result === null) return;

			const csvData = convertCsvToJson(reader.result.toString());

			if (csvData === null) return;

			loadedExtruderDataFile = file.name;

			initializeDashboard(csvData);
		});

		reader.readAsText(file);
	});

	hasAlreadyImportedFile = true;
}

window.addEventListener("DOMContentLoaded", function (event) {
	uploadFileButton?.addEventListener("click", handleFileUploading);
});