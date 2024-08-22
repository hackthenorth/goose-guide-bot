import {
  GenericMessageEvent,
  FileShareMessageEvent,
  ThreadBroadcastMessageEvent,
} from "@slack/bolt";

import { app } from "../app";

export const reactToMessage = async (
  message:
    | GenericMessageEvent
    | FileShareMessageEvent
    | ThreadBroadcastMessageEvent,
  reaction: string,
  operation = "add"
) => {
  try {
    if (operation === "add") {
      await app.client.reactions.add({
        name: reaction,
        channel: message.channel,
        timestamp: message.ts,
      });
    } else if (operation === "remove") {
      await app.client.reactions.remove({
        name: reaction,
        channel: message.channel,
        timestamp: message.ts,
      });
    } else {
      console.error(`Invalid operation ${operation} for reactToMessage`);
      return;
    }
  } catch (error) {
    console.error(
      `Failed to add reaction ${reaction} to message ${message.ts}`
    );
  }
};
