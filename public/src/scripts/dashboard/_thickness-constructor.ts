import Collection from "@babahgee/collection";

import { ExtruderData } from "../typings";
import { WidgetAnimator, createDashboardWidget, createWidgetContainer, createWidgetContainerTitle } from "./_dashboard-widget";
import { convertValuesToNumbers, filterCsvValues } from "./_utilities";
import { GetAverageArrayValue, WaitFor } from "../libs/Stinky2D-master";

export async function constructThicknessComponents(csvData: Collection<ExtruderData>, parent: HTMLDivElement) {

	// Maak een vier-laagse grid element waar widgets in worden weergegeven.
	const widgetContainer = createWidgetContainer(4, "dashboard-thickness-container"),
		widgetTitle = createWidgetContainerTitle("Gemiddelde dikte-metingen.");

	parent.appendChild(widgetTitle);
	parent.appendChild(widgetContainer);

	const animatorValues: WidgetAnimator = {
		from: 0,
		to: 0,
		animationKey: "easeOutExpo",
		duration: 1000,
		valueFixing: 1
	}

	// De keys worden alvast gedefineerd, met de behorende vertalingen.
	const csvFilterKeys: (keyof ExtruderData)[] = ["Thickness left", "Thickness middle left", "Thickness middle right", "Thickness right"],
		keysTranslations: string[] = ["Gemiddelde dikte links", "Gemiddelde dikte midden-links", "Gemiddelde dikte midden-rechts", "Gemiddelde dikte rechts"];


	for (let i = 0; i < csvFilterKeys.length; i++) {

		const key = csvFilterKeys[i];

		const csvValues = filterCsvValues(csvData, key),
			convertedValues = convertValuesToNumbers(csvValues),
			translation = keysTranslations[i];

		const averageValue: number = GetAverageArrayValue(convertedValues.ToArray()),
			maximumValue: number = Math.max(...convertedValues.ToArray()),
			minimumValue: number = Math.min(...convertedValues.ToArray());

		widgetContainer.appendChild(createDashboardWidget(translation, "icon-color-ruler-big", averageValue.toFixed(2), "Normaal", [
			{
				header: "Minimum dikte.",
				value: minimumValue.toFixed(1)
			},
			{
				header: "Maximum dikte.",
				value: maximumValue.toFixed(1)
			},
			{
				header: "Gemiddelde dikte.",
				value: averageValue.toFixed(2)
			},
		], { ...animatorValues, to: averageValue }));

		await WaitFor(100);
	}
}