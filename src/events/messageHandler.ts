import { app } from "../app";
import { handleUserQuestion } from "../services/questionService";
import { handleUserThreadReply } from "../services/threadReplyService";
import { handleAnnouncement } from "../services/announcementService";
import {
  QUESTIONS_CHANNEL,
  ANNOUNCEMENTS_CHANNEL,
  INSERT_KB_CHANNEL,
} from "../config";

app.message("", async ({ message }) => {
  try {
    if (
      (message.subtype === undefined ||
        message.subtype === "file_share" ||
        message.subtype === "thread_broadcast") &&
      (message as any).bot_id === undefined &&
      message.text
    ) {
      const isQuestion =
        message.channel === QUESTIONS_CHANNEL || message.channel_type === "im";
      const isThread = (message as any).thread_ts !== undefined;
      const isAnnouncement = message.channel === ANNOUNCEMENTS_CHANNEL;
      const isKBInsert = message.channel === INSERT_KB_CHANNEL;

      if (isQuestion && isThread) {
        await handleUserThreadReply(message);
      } else if (isQuestion) {
        if (!message.text.toLowerCase().includes("[no ai]")) {
          await handleUserQuestion(message);
        }
      } else if (isAnnouncement && !isThread) {
        await handleAnnouncement(message, "announcement");
      } else if (isKBInsert && !isThread) {
        await handleAnnouncement(message, "manual_insert");
      }
    }
  } catch (error) {
    console.error("Error handling message", error);
  }
});
