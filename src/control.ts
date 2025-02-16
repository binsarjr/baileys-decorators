import type { BaileysEventMap } from "@whiskeysockets/baileys";
import type { WAMessage, WASocket } from "baileys";
import { DecoratorParameters } from "./decorators/types";
import { eventStore } from "./store/event-store";
import { textEventStore } from "./store/text-event-store";
import { getMessageCaption } from "./support";
import type { SocketClient } from "./types";

const injectFunctionMessage = (
	socket: SocketClient,
	message: WAMessage | undefined
) => {
	if (!message) {
		socket.reply = async (content, options) => {
			throw new Error("This Method only work with OnText Decorator");
		};

		socket.replyWithQuote = async (content, options) => {
			throw new Error("This Method only work with OnText Decorator");
		};

		socket.replyWithQuoteInPrivate = async (content, options) => {
			throw new Error("This Method only work with OnText Decorator");
		};
		socket.react = async (emoji) => {
			throw new Error("This Method only work with OnText Decorator");
		};

		socket.reactToDone = async () => {
			throw new Error("This Method only work with OnText Decorator");
		};
		socket.reactToProcessing = async () => {
			throw new Error("This Method only work with OnText Decorator");
		};
		socket.reactToFailed = async () => {
			throw new Error("This Method only work with OnText Decorator");
		};

		return socket;
	}

	const react = (emoji: string) => {
		return socket.sendMessage(message?.key?.remoteJid!, {
			react: {
				key: message?.key!,
				text: emoji,
			},
		});
	};

	return {
		...socket,

		react,

		reactToProcessing: () => react("⏳"),
		resetReact: () => react(""),
		reactToDone: () => react("✅"),
		reactToFailed: () => react("❌"),

		reply: async (content, options) => {
			const jid = message?.key?.remoteJid!;
			if (options?.typing) {
				await socket.presenceSubscribe(jid);
				await new Promise((resolve) => setTimeout(resolve, 500));

				await socket.sendPresenceUpdate("composing", jid);
				await new Promise((resolve) => setTimeout(resolve, 1_500));
			}

			const msg = await socket.sendMessage(jid, content, options);

			if (options?.typing) {
				await socket.sendPresenceUpdate("paused", jid);
			}

			return msg;
		},

		replyWithQuote: async (content, options) => {
			const jid = message?.key?.remoteJid!;
			if (options?.typing) {
				await socket.presenceSubscribe(jid);
				await new Promise((resolve) => setTimeout(resolve, 500));

				await socket.sendPresenceUpdate("composing", jid);
				await new Promise((resolve) => setTimeout(resolve, 1_500));
			}

			const msg = await socket.sendMessage(jid, content, {
				...options,
				quoted: message,
			});
			if (options?.typing) {
				await socket.sendPresenceUpdate("paused", jid);
			}

			return msg;
		},

		replyWithQuoteInPrivate: async (content, options) => {
			const jid = message?.key?.participant || message?.key?.remoteJid!;

			if (options?.typing) {
				await socket.presenceSubscribe(jid);
				await new Promise((resolve) => setTimeout(resolve, 500));

				await socket.sendPresenceUpdate("composing", jid);
				await new Promise((resolve) => setTimeout(resolve, 1_500));
			}

			const msg = await socket.sendMessage(jid, content, {
				...options,
				quoted: message,
			});
			if (options?.typing) {
				await socket.sendPresenceUpdate("paused", jid);
			}

			return msg;
		},
	} as SocketClient;
};

export class BaileysDecorator {
	/**
	 * Memuat dekorator dari path yang diberikan dengan pola file yang bisa dikustomisasi.
	 */
	static async loadDecorators(
		patterns: string[] = [],
		loader: (files: Record<string, any>) => void = (files) => {
			console.log(`✅ Loaded ${Object.keys(files).length} decorators`);
		}
	) {
		let allDecorators: Record<string, any> = {};

		for (const pattern of patterns) {
			const glob = new Bun.Glob(pattern);

			for await (const filepath of glob.scan()) {
				const module = await import(filepath);
				Object.assign(allDecorators, module);
			}
		}

		loader(allDecorators);
	}

	static bind(socket: WASocket) {
		socket.ev.process(async (events) => {
			for (const event of Object.keys(events)) {
				const eventData = events[event as keyof BaileysEventMap];

				// on-event
				for (const { method, parameters, classRef: target } of eventStore.get(
					event as keyof BaileysEventMap
				) || []) {
					const args: { [key: string]: any } = {};
					const instance = new target();

					for (const [parameterName, decoratorType] of Object.entries(
						parameters
					)) {
						if (decoratorType == DecoratorParameters.Socket.toString()) {
							const socketArgs = injectFunctionMessage(
								socket as unknown as SocketClient,
								undefined
							);
							args[parameterName] = socketArgs;
						} else if (
							decoratorType === DecoratorParameters.Context.toString()
						) {
							args[parameterName] = eventData;
						}
					}

					try {
						await method.bind(instance)(...Object.values(args));
					} catch (error) {
						console.error(error);
					}
				}
			}

			if (events["messages.upsert"]) {
				for (const message of events["messages.upsert"].messages) {
					let text = getMessageCaption(message?.message!).toLowerCase();

					// on-text
					for (const [key, handlers] of textEventStore.entries()) {
						for (const {
							matchType,
							method,
							parameters,
							classRef: target,
						} of handlers) {
							let isMatch = false;
							const instance = new target();

							switch (matchType) {
								case "equals":
									isMatch = text === key.toLowerCase();
									break;
								case "contains":
									isMatch = text.includes(key.toLowerCase());
									break;
								case "startsWith":
									isMatch = text.startsWith(key.toLowerCase());
									break;
								case "endsWith":
									isMatch = text.endsWith(key.toLowerCase());
									break;
								case "regex":
									isMatch = new RegExp(key, "i").test(text);
									break;
							}

							if (isMatch) {
								const args: any[] = [];

								Object.entries(parameters).forEach(([paramName, paramType]) => {
									if (paramType === DecoratorParameters.Socket.toString()) {
										const socketArgs = injectFunctionMessage(
											socket as unknown as SocketClient,
											message
										);

										args.push(socketArgs);
									}
									if (paramType === DecoratorParameters.Context.toString())
										args.push(message);
								});

								try {
									await method.bind(instance)(...args);
								} catch (error) {
									console.error(error);
								}
							}
						}
					}
				}
			}
		});
	}
}
