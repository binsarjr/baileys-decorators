import type {
	AnyMessageContent,
	MiscMessageGenerationOptions,
	WAProto,
	WASocket,
} from "baileys";

export type SocketClient = WASocket & {
	/**
	 * Reply to a message
	 *
	 */
	reply: (
		content: AnyMessageContent,
		options?: MiscMessageGenerationOptions & Partial<{ typing: boolean }>
	) => Promise<WAProto.WebMessageInfo | undefined>;

	/**
	 * Reply to a message with a quoted message
	 */
	replyWithQuote: (
		content: AnyMessageContent,
		options?: MiscMessageGenerationOptions & Partial<{ typing: boolean }>
	) => Promise<WAProto.WebMessageInfo | undefined>;

	replyWithQuoteInPrivate: (
		content: AnyMessageContent,
		options?: MiscMessageGenerationOptions & Partial<{ typing: boolean }>
	) => Promise<WAProto.WebMessageInfo | undefined>;

	react: (emoji: string) => Promise<WAProto.WebMessageInfo | undefined>;
	reactToProcessing: () => Promise<WAProto.WebMessageInfo | undefined>;
	resetReact: () => Promise<WAProto.WebMessageInfo | undefined>;
	reactToDone: () => Promise<WAProto.WebMessageInfo | undefined>;
	reactToFailed: () => Promise<WAProto.WebMessageInfo | undefined>;
	reactToInvalid: () => Promise<WAProto.WebMessageInfo | undefined>;
};
