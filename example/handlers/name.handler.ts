import { isJidGroup, type WAMessage } from "baileys";
import { Context, OnText, Socket } from "../../src";
import { createGuard } from "../../src/support";
import type { SocketClient } from "../../src/types";

const privateChatOnly = createGuard((socket, message) => {
	return !isJidGroup(message.key.remoteJid!);
});

export class NameHandler {
	@OnText("/name", {
		matchType: "startsWith",
		guard: [privateChatOnly],
	})
	async execute(@Socket socket: SocketClient, @Context message: WAMessage) {
		const name = (
			message.message?.extendedTextMessage?.text ||
			message.message?.conversation ||
			""
		).replace(/^\/name\s*/, "");

		await socket.replyWithQuote({
			text: `Hello ${name}!`,
		});
	}
}
