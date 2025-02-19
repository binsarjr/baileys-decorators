import { Socket, type SocketClient } from "../../src";
import { OnStartup } from "../../src/decorators/on-startup.decorator";

export default class {
	@OnStartup()
	async onStartup(@Socket socket: SocketClient) {
		await socket.sendMessage(socket.user?.id!, { text: "Started!" });
	}
}
