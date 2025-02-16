import type { WAMessage } from "baileys";
import { Context, OnText, Socket } from "../../src";
import type { SocketClient } from "../../src/types";

export class NameHandler {
	@OnText("/name", { matchType: "startsWith" })
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
