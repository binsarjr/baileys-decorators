import "reflect-metadata";
import { textEventStore, type TextMatchType } from "../store/text-event-store";

export interface OnTextOptions {
	matchType?: TextMatchType;
	priority?: number;
}

export const OnText = (
	text: string | RegExp | (string | RegExp)[],
	options: OnTextOptions = { priority: 0 }
) => {
	return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		const method = descriptor.value;
		const existingParameters: { [key: string]: "socket" | "baileys-context" } =
			Reflect.getMetadata("parameters", target, propertyKey) || {};
		const parameterNames =
			Reflect.getMetadata("design:paramtypes", target, propertyKey)?.map(
				(t: any, index: number) => `param${index}`
			) || [];

		const dynamicParameters: { [key: string]: "socket" | "baileys-context" } =
			{};
		Object.entries(existingParameters).forEach(([key, value], index) => {
			dynamicParameters[parameterNames[index] || key] = value;
		});

		const texts = Array.isArray(text) ? text : [text];

		texts.forEach((entry) => {
			if (typeof entry !== "string" && !(entry instanceof RegExp)) {
				throw new Error(
					"OnText decorator requires a string, RegExp, or an array of these types."
				);
			}

			const isRegex = entry instanceof RegExp;
			const textKey = isRegex ? entry.source : entry;
			const matchType: TextMatchType = isRegex
				? "regex"
				: options.matchType || "equals";

			if (!textEventStore.has(textKey)) {
				textEventStore.set(textKey, []);
			}

			textEventStore.get(textKey)?.push({
				method,
				priority: options.priority || 0,
				parameters: dynamicParameters,
				matchType,
				classRef: target.constructor,
			});

			textEventStore.set(
				textKey,
				textEventStore.get(textKey)!.sort((a, b) => b.priority - a.priority)
			);
		});
	};
};
