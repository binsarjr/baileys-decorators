import type { proto, WAMessage, WAProto } from "baileys";
import type { SocketClient } from "./types";

export const getMessageCaption = (message: proto.IMessage) => {
	if (!message) return "";

	const type = getContentType(message)!;
	const msg =
		type == "viewOnceMessage"
			? message[type]!.message![getContentType(message[type]!.message!)!]
			: message[type];

	return (
		message?.conversation ||
		(msg as proto.Message.IVideoMessage)?.caption ||
		(msg as proto.Message.IExtendedTextMessage)?.text ||
		message.ephemeralMessage?.message?.extendedTextMessage?.text ||
		message.extendedTextMessage?.text ||
		(type == "viewOnceMessage" &&
			(msg as proto.Message.IVideoMessage)?.caption) ||
		""
	);
};
export const getContentType = (content: WAProto.IMessage | undefined) => {
	if (content) {
		const keys = Object.keys(content);
		const key = keys.find(
			(k) =>
				(k === "conversation" || k.includes("Message")) &&
				k !== "senderKeyDistributionMessage"
		);
		return key as keyof typeof content;
	}
};

export const createGuard = (
	callback: (socket: SocketClient, msg: WAMessage) => Promise<boolean> | boolean
) => {
	return callback;
};
