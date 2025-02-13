// File: onEventDecorator.ts
import type { BaileysEventMap } from "@whiskeysockets/baileys";
import { eventStore } from "../store/event-store";

export const OnEvent = (
	event: keyof BaileysEventMap,
	options: { priority?: number } = {}
) => {
	return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		const method = descriptor.value;

		const parameters: { [key: string]: "socket" | "baileys-context" } =
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
