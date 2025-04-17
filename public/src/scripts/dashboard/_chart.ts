import { Chart } from "chart.js/auto";
import Collection from "@babahgee/collection";
import Print from "print-js";
import { GetAverageArrayValue, UniqueID } from "../libs/Stinky2D-master";

import { createWidgetContainer, createWidgetContainerTitle } from "./_dashboard-widget";
import { convertValuesToNumbers, createButton, extractKeysFromData, filterCsvValues, filterDataBasedOnTime } from "./_utilities";
import { loadedExtruderDataFile } from "./entry";

import { ExtruderData } from "../typings";

let renderingContext2d: CanvasRenderingContext2D | null = null;
let renderingCanvas: HTMLCanvasElement | null = null;
let activeChart: Chart;

function filterTimestamps(data: Collection<ExtruderData>): string[] {

    const labels: string[] = [];

    for (let _data of data.ToArray()) 
        labels.push(_data["Time"]);

    return labels;
}

function updateChartData(dataKeysElement: HTMLSelectElement, timeRangeElement: HTMLSelectElement, startingInputElement: HTMLInputElement, data: Collection<ExtruderData>): Collection<ExtruderData> {

    const key = dataKeysElement.value as keyof ExtruderData,
        range: number = parseFloat(timeRangeElement.value),
        startingFrom: string = startingInputElement.value;

    const correctedTimeRange = (1000 * 60) * range;

    const dataToPlace: Collection<ExtruderData> = filterDataBasedOnTime(data, startingFrom, correctedTimeRange);

    displayChart(new Collection<ExtruderData>(dataToPlace.SaveReverse()), key);

    return dataToPlace;
}

function preRenderChartImage() {

    if (renderingContext2d === null || renderingCanvas === null) return;

    const tempCanvas: HTMLCanvasElement = document.createElement("canvas"),
        tempCtx: CanvasRenderingContext2D | null = tempCanvas.getContext("2d");

    if (tempCtx === null) return;

    tempCanvas.width = renderingCanvas.width;
    tempCanvas.height = renderingCanvas.height;

    tempCtx.fillStyle = "#49668b";
    tempCtx.roundRect(0, 0, tempCanvas.width, tempCanvas.height, 5);
    tempCtx.fill();

    tempCtx.drawImage(renderingCanvas, 40, 40, renderingCanvas.width - 70, renderingCanvas.height - 70);

    const canvasData = tempCanvas.toDataURL("image/png");

    return canvasData;
}

function saveChartAsImage() {

    const canvasData = preRenderChartImage();

    if (!canvasData) return alert("Kan afbeelding niet genereren wegens een onbekende fout.");

    const anchor = document.createElement("a");

    anchor.href = canvasData;
    anchor.download = "Extruder Grafiek -" + Date.now();

    document.body.appendChild(anchor);

    anchor.click();
    anchor.remove();
}

function printChart() {

    const canvasData = preRenderChartImage();

    if (!canvasData) return alert("Kan afbeelding niet printen wegens een onbekende fout.");

    Print({
        printable: canvasData,
        header: "Open Extruder Data Reader"
    });
}

function saveChartDataAsText(data: Collection<ExtruderData>) {

    const currentDate = new Date(),
        currentHour = currentDate.getHours(),
        currentMinute = currentDate.getMinutes(),
        currentSecond = currentDate.getSeconds(),
        currentDateNumber = currentDate.getDate(),
        currentMonthNumber = currentDate.getMonth(),
        currentYear = currentDate.getFullYear(),
        currentDateFormat = `${currentDateNumber}-${currentMonthNumber + 1}-${currentYear} ${currentHour}:${currentMinute}:${currentSecond}`;

    const firstDataElement = data.First(),
        lastDataElement = data.Last();

    const chartId: string = crypto.randomUUID(),
        fileId: string = UniqueID(32).id;

    if (firstDataElement === null || lastDataElement === null) return;

    let outputText = `
Open Extruder Data Reader.
Automatisch gegenereerd bestand.

Bestandsopmaak versie: 19-03-2024

=================== INFO ===================

Bestandsnaam: ${loadedExtruderDataFile}
Grafiek ID: ${chartId}
Bestands ID: ${fileId}
Datum: ${currentDateFormat}
Aantal elementen: ${data.Count}
Tijdsbereik: van ${firstDataElement.Time} t/m ${lastDataElement.Time}

=============== BEREKINGEN =================

`;

    const extruderDataValues: {[K: string]: number[]} = {};

    data.ForEach(function (extruderData: ExtruderData) {

        for (let key in extruderData) {

            if (typeof extruderDataValues[key] === "undefined") extruderDataValues[key] = [];

            const dataItem = extruderData[key as unknown as keyof ExtruderData];

            const parsedNumber = parseFloat(dataItem.toString());

            if (!isNaN(parsedNumber))
                extruderDataValues[key].push(parsedNumber);
        }
    });

    for (let key in extruderDataValues) {

        const item = extruderDataValues[key];

        const averageValue = GetAverageArrayValue(item),
            minimumValue = Math.min(...item),
            maximumValue = Math.max(...item);


        let subjectText = `
- ${key} (${item.length} waardes)
        Gemiddelde waarde: ${isNaN(averageValue) ? "Onbekend" : averageValue}
        Minimum waarde: ${isNaN(minimumValue) ? "Onbekend" : minimumValue}
        Maximum waarde: ${isNaN(maximumValue) ? "Onbekend" : maximumValue}\n
        `;

        outputText += subjectText;
    }

    const anchor = document.createElement("a");
    const file = new Blob([outputText], { type: "text/plain" });

    anchor.href = URL.createObjectURL(file);
    anchor.download = `Extruder Data Gegevens - ${chartId}.txt`;
    anchor.click();

    URL.revokeObjectURL(anchor.href);
}

export function constructChartDomElements(parent: HTMLDivElement) {

    const widgetContainerTitle = createWidgetContainerTitle("Grafiek data gebaseerd op gegevens vanuit " + loadedExtruderDataFile),
        widgetContainer = createWidgetContainer(0, "dashboard-chart-container");

    parent.appendChild(widgetContainerTitle);
    parent.appendChild(widgetContainer);

    const canvas: HTMLCanvasElement = document.createElement("canvas"),
        ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

    if (ctx === null) return;

    renderingContext2d = ctx;
    renderingCanvas = canvas;

    widgetContainer.appendChild(canvas);

    canvas.width = widgetContainer.clientWidth;
    canvas.height = 420;

    return ctx;
}

export function constructChartControlButtons(csvData: Collection<ExtruderData>, parent: HTMLDivElement) {

    const widgetContainer = createWidgetContainer(0, "dashboard-chart-controls-container");
    widgetContainer.classList.add("dashboard-chart-controls-container");
    parent.appendChild(widgetContainer);

    const dataKeys = extractKeysFromData(csvData);

    // Vanaf hier begint het bouwen van alle belangrijke elementen.
    const dataTypeSelectElement = document.createElement("select");

    dataKeys.ForEach(function (key: keyof ExtruderData) {

        const optionElement = document.createElement("option");
        optionElement.value = key;
        optionElement.innerText = key;

        return dataTypeSelectElement.appendChild(optionElement);
    });

    const timeRangeSelectElement = document.createElement("select");

    timeRangeSelectElement.innerHTML += "<option value='1'>1 minuut</option>";
    timeRangeSelectElement.innerHTML += "<option value='2'>2 minuten</option>";
    timeRangeSelectElement.innerHTML += "<option value='5'>5 minuten</option>";
    timeRangeSelectElement.innerHTML += "<option value='10'>10 minuten</option>";
    timeRangeSelectElement.innerHTML += "<option value='15'>15 minuten</option>";
    timeRangeSelectElement.innerHTML += "<option value='20'>20 minuten</option>";
    timeRangeSelectElement.innerHTML += "<option value='25'>25 minuten</option>";
    timeRangeSelectElement.innerHTML += "<option value='30'>30 minuten</option>";
    timeRangeSelectElement.innerHTML += "<option value='60'>1 uur</option>";
    timeRangeSelectElement.innerHTML += "<option value='120'>2 uren</option>";
    timeRangeSelectElement.innerHTML += "<option value='180'>3 uren</option>";
    timeRangeSelectElement.innerHTML += "<option value='240'>4 uren</option>";
    timeRangeSelectElement.innerHTML += "<option value='300'>5 uren</option>";
    
    const saveButton = createButton("/static/icons/icon-color-save.png", "Opslaan"),
        printButton = createButton("/static/icons/icon-color-print.png", "Afdrukken"),
        saveAsTextButton = createButton("/static/icons/icon-color-file.png", "Opslaan als tekst-bestand");

    const labelElement = document.createElement("span");
    labelElement.innerText = "onder";

    const startingTimeRangeInput = document.createElement("input");
    startingTimeRangeInput.type = "text";
    startingTimeRangeInput.value = (csvData.First() as ExtruderData)?.Time;

    dataTypeSelectElement.addEventListener("change", function (ev: Event) {
        updateChartData(dataTypeSelectElement, timeRangeSelectElement, startingTimeRangeInput, csvData);
    });

    timeRangeSelectElement.addEventListener("change", function (ev: Event) {
        updateChartData(dataTypeSelectElement, timeRangeSelectElement, startingTimeRangeInput, csvData);
    });

    startingTimeRangeInput.addEventListener("change", function (ev: Event) {
        updateChartData(dataTypeSelectElement, timeRangeSelectElement, startingTimeRangeInput, csvData);
    });

    saveAsTextButton.addEventListener("click", function (ev: Event) {

        const updatedChartData: Collection<ExtruderData> = updateChartData(dataTypeSelectElement, timeRangeSelectElement, startingTimeRangeInput, csvData);

        saveChartDataAsText(updatedChartData);
    });

    saveButton.addEventListener("click", saveChartAsImage);
    printButton.addEventListener("click", printChart)

    widgetContainer.appendChild(dataTypeSelectElement);
    widgetContainer.appendChild(timeRangeSelectElement);
    widgetContainer.appendChild(labelElement);
    widgetContainer.appendChild(startingTimeRangeInput);
    widgetContainer.appendChild(saveButton);
    widgetContainer.appendChild(printButton);
    widgetContainer.appendChild(saveAsTextButton);
}

export function putChartData(labels: string[], dataSets: number[], dataLabel: string) {

    if (renderingContext2d === null) return;

    if (activeChart) activeChart.destroy();

    const chart = new Chart(renderingContext2d, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: dataLabel,
                    data: dataSets,
                    borderWidth: 2,
                    backgroundColor: "rgba(255, 255, 255, .1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 0,
                    pointStyle: "none",
                    borderColor: "#c8defa",
                    fill: true,
                    tension: .3,
                    capBezierPoints: true
                },
                {
                    label: `Gemiddelde (${GetAverageArrayValue(dataSets).toFixed(2)})`,
                    data: new Collection<number>().AddRepeat(GetAverageArrayValue(dataSets), dataSets.length).ToArray(),
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, .5)",
                    pointStyle: "none",
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: `Minimum (${Math.min(...dataSets).toFixed(2)})`,
                    data: new Collection<number>().AddRepeat(Math.min(...dataSets), dataSets.length).ToArray(),
                    borderWidth: 1,
                    borderColor: "#ed3e3e",
                    pointStyle: "none",
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: `Maximum (${Math.max(...dataSets).toFixed(2)})`,
                    data: new Collection<number>().AddRepeat(Math.max(...dataSets), dataSets.length).ToArray(),
                    borderWidth: 1,
                    pointStyle: "none",
                    pointRadius: 0,
                    borderColor: "#61ed3e",
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {

                }
            }
        }
    });

    activeChart = chart;
}

export function displayChart(data: Collection<ExtruderData>, extruderDataKey: keyof ExtruderData) {

    const filterData = filterCsvValues(data, extruderDataKey);

    const timestampLabels: string[] = filterTimestamps(data),
        dataSets: number[] = convertValuesToNumbers(filterData).ToArray();

    Chart.defaults.color = "#fff";

    putChartData(timestampLabels, dataSets, extruderDataKey);
}