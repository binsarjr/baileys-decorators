import { OnText, Socket } from "../../src";
import type { SocketClient } from "../../src/types";

export class PingHandler {
	@OnText("/ping")
	async execute(@Socket socket: SocketClient) {
		await socket.reply({
			text: "pong!!!",
		});
	}
}
