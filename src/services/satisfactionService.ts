import { BlockAction } from "@slack/bolt";

import { app } from "../app";
import { updateConversationSatisfaction } from "../apis/airtable";
import { FAILED_ANSWER_PING } from "../config";
import { updateSatisfactionButtons } from "../utils/buttons";
import {
  replyEphemeralThreadManual,
  postMonitoringMessage,
} from "../utils/responses";

export const handleSatisfactionButton = async (body: BlockAction) => {
  const action = body.actions[0];
  const action_id = action.action_id;

  const payload = (action as any)?.value;
  const [questionUser, airtableRecordID] = payload.split("|");

  const channel = body.channel?.id;
  const buttonMessageTs = body.message?.ts;
  const threadTs = body.message?.thread_ts;

  if (questionUser === body.user.id) {
    if (channel && buttonMessageTs) {
      const convo_fields = await updateConversationSatisfaction(
        airtableRecordID,
        action_id
      );
      if (action_id === "satisfaction_yes") {
        await updateSatisfactionButtons(
          channel,
          buttonMessageTs,
          ":partying_face: Glad to hear the automated answer was helpful! Thanks for your feedback, and enjoy the event!"
        );
      } else if (action_id === "satisfaction_no") {
        await updateSatisfactionButtons(
          channel,
          buttonMessageTs,
          ":thumbsup: Okay, good to hear that you're all right. If you have any more questions, please don't hestitate to ask."
        );
      } else if (action_id === "satisfaction_help_me") {
        await updateSatisfactionButtons(
          channel,
          buttonMessageTs,
          "Got it, thanks for your feedback. An organizer will come help you soon."
        );
        const originalQuestionLink = (
          await app.client.chat.getPermalink({
            channel: channel,
            message_ts: threadTs,
          })
        )?.permalink;
        await postMonitoringMessage(
          `:question: <${questionUser}> still wants help after automated response. Find it <${originalQuestionLink}|here> <${FAILED_ANSWER_PING}>\n\nQuestion:\`${convo_fields?.question}\`\n\nAnswer:\`\`\`${convo_fields?.answer}\`\`\``
        );
      } else {
        await updateSatisfactionButtons(
          channel,
          buttonMessageTs,
          `Thanks. ${action_id}`
        );
      }
    }
  } else {
    if (channel && buttonMessageTs) {
      await replyEphemeralThreadManual(
        channel,
        threadTs,
        "Only the original owner can give this answer",
        body.user.id
      );
    }
  }
};
