import makeWASocket, {
	DisconnectReason,
	fetchLatestBaileysVersion,
	useMultiFileAuthState,
} from "baileys";
import path from "path";
import { BaileysDecorator } from "../src";

BaileysDecorator.loadDecorators([
	path.resolve(import.meta.dir, "./**/*.event.ts"),
	path.resolve(import.meta.dir, "./**/*.handler.ts"),
]);

const startSock = async () => {
	const { state, saveCreds } = await useMultiFileAuthState("baileys_auth_info");
	// fetch latest version of WA Web
	const { version, isLatest } = await fetchLatestBaileysVersion();
	console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
	const socket = await makeWASocket({
		version,
		printQRInTerminal: true,
		auth: {
			creds: state.creds,
			/** caching makes the store faster to send/recv messages */
			keys: state.keys,
		},
	});

	BaileysDecorator.bind(socket);

	socket.ev.on("creds.update", saveCreds);

	socket.ev.on("connection.update", async (update) => {
		if (update.connection == "close") {
			const error = update.lastDisconnect?.error as any;
			if (error?.output?.statusCode !== DisconnectReason.loggedOut) {
				startSock();
			}
		}
	});
};

startSock();
