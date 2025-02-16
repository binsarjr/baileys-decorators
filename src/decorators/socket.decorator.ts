import "reflect-metadata";
import { DecoratorParameters } from "./types";

export function Socket(
	target: any,
	propertyKey: string,
	parameterIndex: number
) {
	const existingParameters: {
		[key: number]: DecoratorParameters;
	} = Reflect.getMetadata("parameters", target, propertyKey) || {};

	existingParameters[parameterIndex] = DecoratorParameters.Socket;

	Reflect.defineMetadata("parameters", existingParameters, target, propertyKey);
}
