import type { Middleware } from "../decorators/on-text.decorator";
import type { DecoratorParameters } from "../decorators/types";

export type TextMatchType =
	| "equals"
	| "contains"
	| "startsWith"
	| "endsWith"
	| "regex";

export const textEventStore = new Map<
	string,
	Array<{
		method: Function;
		priority: number;
		parameters: { [key: string]: DecoratorParameters };
		matchType: TextMatchType;
		classRef: any;
		middleware?: Middleware[];
	}>
>();
