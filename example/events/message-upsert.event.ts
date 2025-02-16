import type { BaileysEventMap } from "baileys";
import { Context, OnEvent } from "../../src";

export class MessageUpsertEvent {
	@OnEvent("messages.upsert")
	async execute(@Context upsert: BaileysEventMap["messages.upsert"]) {
		console.log(upsert, "from baileys-decorators");
	}
}
