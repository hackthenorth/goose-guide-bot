import {
  FileShareMessageEvent,
  GenericMessageEvent,
  ThreadBroadcastMessageEvent,
} from "@slack/bolt";

import { createAnnouncementRecord } from "../apis/airtable";
import { voiceflowAddAnnouncementKB } from "../apis/voiceflow";
import { MAINTAINER_PING } from "../config";
import { reactToMessage } from "../utils/reactions";
import { replyEphemeralChannel } from "../utils/responses";

export const handleAnnouncement = async (
  message:
    | GenericMessageEvent
    | FileShareMessageEvent
    | ThreadBroadcastMessageEvent,
  method: string
) => {
  if (message.text) {
    const reaction = reactToMessage(message, "robot_face");
    try {
      const { addResponse, tagSuccess } = await voiceflowAddAnnouncementKB(
        message.text
      );
      let status = "success";
      if (addResponse.status === 200 && tagSuccess) {
        await replyEphemeralChannel(
          message,
          `Added your message to the Q&A KB via ${method}. If this was an accident, please reach out to <${MAINTAINER_PING}>.`
        );
      } else if (addResponse.status === 200 && !tagSuccess) {
        status = "tag_failed";
        await replyEphemeralChannel(
          message,
          `:warning: Added your message to the Q&A KB via ${method}, but failed to save the tag so it won't be prioritized. If this was an accident, please reach out to <${MAINTAINER_PING}>.`
        );
      } else {
        status = "failed";
        await replyEphemeralChannel(
          message,
          `:octagonal_sign: Failed to add your message to the Q&A KB via ${method}. Please reach out to <${MAINTAINER_PING}>.`
        );
      }
      await createAnnouncementRecord({
        announcement_ts: message.ts,
        body: message.text,
        user_id: message.user,
        document_id: addResponse.data.data.documentID,
        status,
        method,
      });
    } catch (error) {
      await replyEphemeralChannel(
        message,
        `:octagonal_sign: Failed to add your message to the Q&A KB via ${method}. Please reach out to <${MAINTAINER_PING}>.`
      );
      console.error(error);
    }
    await reaction;
    await reactToMessage(message, "robot_face", "remove");
  } else {
    console.warn(
      `Announcement message that didn't have text for some reason.`,
      message
    );
  }
};
