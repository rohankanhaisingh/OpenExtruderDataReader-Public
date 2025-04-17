import { AnimateInteger, EasingName, UniqueID } from "../libs/Stinky2D-master";

export interface WidgetTableData {
    header: string;
    value: string;
}

export interface WidgetAnimator {
    from: number;
    to: number;
    duration: number;
    animationKey: EasingName;
    stringAttachments?: string;
    valueFixing?: number;
}

export function createWidgetContainer(amountOfColumns: number, containerId?: string) {
    const container = document.createElement("div");
    container.className = "dashboard-widget-container";
    container.id = containerId ? containerId : UniqueID(18).id;
    container.style.gridTemplateColumns = `repeat(${amountOfColumns}, 1fr)`;

    return container;
}

export function createWidgetContainerTitle(title: string, titleId?: string) {
    const headerElement = document.createElement("h4");
    headerElement.className = "dashboard-container-title";
    headerElement.id = titleId ? titleId : UniqueID(18).id;
    headerElement.innerText = title;

    return headerElement;
}

/**
 * Functie waarmee je een HTML widget element kunt maken.
 * @param widgetName Naam van de widget, bijvoorbeeld 'algemene temperatuur'.
 * @param widgetIconSource Naam van het gewenste icoon, bijvoorbeeld 'icon-color-temperature-big'. Icoon moet bestaan binnen applicatie.
 * @param widgetValue Waarde van de widget. Dit wordt in het groot weergegeven.
 * @param widgetValueDescription Omschrijving van widget waarde. Bijvoorbeeld 'normaal' of 'hoog'.
 * @param widgetTableData Widget tabel data.
 * @returns
 */
export function createDashboardWidget(widgetName: string, widgetIconSource: string, widgetValue: string, widgetValueDescription: string, widgetTableData: WidgetTableData[], animator?: WidgetAnimator): HTMLDivElement {
    const widgetElement = document.createElement("div");
    widgetElement.className = "dashboard-simple-widget";
    widgetElement.id = UniqueID(18).id;

    const widgetValueId: string = "dashboard-simple-width-span-" + UniqueID(18).id;

    widgetElement.innerHTML = `
		<div class="dashboard-simple-widget__layer-1">
            <span>${widgetName}</span>
            <span>Op basis van geimporteerde data.</span>
        </div>
        <div class="dashboard-simple-widget__layer-2">
            <img src="/static/icons/${widgetIconSource}.png" alt="${widgetName}" />
            <div class="dashboard-simple-widget__layer-2__text">
                <span id="${widgetValueId}">${widgetValue}</span>
                <span>${widgetValueDescription}</span>
            </div>
        </div>
        <div class="dashboard-simple-widget__layer-3">
            <table></table>
        </div>
	`;

    const widgetValueSpan = widgetElement.querySelector("#" + widgetValueId) as HTMLSpanElement;

    if (animator) {
        AnimateInteger(animator.from, animator.to, animator.animationKey, animator.duration, function (value: number) {
            widgetValueSpan.innerHTML = value.toFixed(animator.valueFixing ? animator.valueFixing : 0) + (animator.stringAttachments ? animator.stringAttachments : "");
        });
    }

    const widgetTableElement = widgetElement.querySelector<HTMLTableElement>("table");

    if (widgetTableElement === null) return widgetElement;

    const titleTableRow = document.createElement("tr"),
        valueTableRow = document.createElement("tr");

    for (let data of widgetTableData) {
        const tableHeaderElement = document.createElement("th"),
            tableDataElement = document.createElement("td");
        
        tableHeaderElement.innerHTML = data.header;
        tableDataElement.innerHTML = data.value;

        titleTableRow.appendChild(tableHeaderElement);
        valueTableRow.appendChild(tableDataElement);
    }

    widgetTableElement.appendChild(titleTableRow);
    widgetTableElement.appendChild(valueTableRow);

    return widgetElement;
}
