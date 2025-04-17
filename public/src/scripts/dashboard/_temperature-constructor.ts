import Collection from "@babahgee/collection";
import { GetAverageArrayValue, WaitFor } from "../libs/Stinky2D-master";

import { WidgetAnimator, createDashboardWidget, createWidgetContainer, createWidgetContainerTitle } from "./_dashboard-widget";
import { ExtruderData } from "../typings";
import { convertValuesToNumbers, filterCsvValues } from "./_utilities";

export async function constructTemperatureComponents(csvData: Collection<ExtruderData>, parent: HTMLDivElement) {

	// De keys worden alvast gedefineerd, met de behorende vertalingen.
	const csvFilterKeys: (keyof ExtruderData)[] = ["Extruder housing temperature", "Actual PE temperature", "Ambient temperature"],
		keysTranslations: string[] = ["Gemiddelde behuising temperatuur.", "Gemiddelde PE temperatuur.", "Gemiddelde omgeving temperatuur."];

	// Maak een drie-laagse grid element waar widgets in worden weergegeven.
	const widgetContainer = createWidgetContainer(csvFilterKeys.length, "dashboard-temperature-container"),
		widgetTitle = createWidgetContainerTitle("Gemiddelde temperatuur.");

	parent.appendChild(widgetTitle);
	parent.appendChild(widgetContainer);

	const animatorValues: WidgetAnimator = {
		from: 0,
		to: 0,
		animationKey: "easeOutExpo",
		duration: 1000,
		stringAttachments: " c&deg;",
		valueFixing: 1
	}

	for (let i = 0; i < csvFilterKeys.length; i++) {

		const key = csvFilterKeys[i];

		const csvValues = filterCsvValues(csvData, key),
			convertedValues = convertValuesToNumbers(csvValues),
			translation = keysTranslations[i];

		const averageValue: number = GetAverageArrayValue(convertedValues.ToArray()),
			maximumValue: number = Math.max(...convertedValues.ToArray()),
			minimumValue: number = Math.min(...convertedValues.ToArray());

		widgetContainer.appendChild(createDashboardWidget(translation, "icon-color-temperature-big", averageValue.toFixed(2), "Normaal", [
			{
				header: "Minimum temp.",
				value: maximumValue.toFixed(1)
			},
			{
				header: "Maximum temp.",
				value: minimumValue.toFixed(1)
			},
			{
				header: "Gemiddelde temp.",
				value: averageValue.toFixed(2)
			},
		], { ...animatorValues, to: averageValue }));

		await WaitFor(100);
	}
}