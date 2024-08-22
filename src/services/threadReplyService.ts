import {
  GenericMessageEvent,
  FileShareMessageEvent,
  ThreadBroadcastMessageEvent,
} from "@slack/bolt";

import { replyEphemeralThread } from "../utils/responses";

export const handleUserThreadReply = async (
  message:
    | GenericMessageEvent
    | FileShareMessageEvent
    | ThreadBroadcastMessageEvent
) => {
  await replyEphemeralThread(
    message,
    "To ask a question, ask in the main channel, not in a thread."
  );
};
