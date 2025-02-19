// File: onEventDecorator.ts
import { eventStore } from "../store/event-store";
import type { DecoratorParameters } from "./types";

export const EventOnStartup = "on-baileys:startup";

export const OnStartup = (options: { priority?: number } = {}) => {
	return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		const method = descriptor.value;
		const event = EventOnStartup;

		const parameters: { [key: string]: DecoratorParameters } =
			Reflect.getMetadata("parameters", target, propertyKey) || {};

		if (!eventStore.has(event)) {
			eventStore.set(event, []);
		}

		eventStore.get(event)?.push({
			method,
			priority: options.priority || 0,
			parameters,
			classRef: target.constructor,
		});

		eventStore.get(event)?.sort((a, b) => b.priority - a.priority);
	};
};
