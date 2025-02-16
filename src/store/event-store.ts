import type { DecoratorParameters } from "../decorators/types";

export const eventStore = new Map<
	string,
	Array<{
		method: Function;
		priority: number;
		parameters: { [key: string]: DecoratorParameters };
		classRef: any;
	}>
>();
