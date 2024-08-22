import {
  GenericMessageEvent,
  FileShareMessageEvent,
  ThreadBroadcastMessageEvent,
  MessageAttachment,
} from "@slack/bolt";

import { app } from "../app";
import {
  voiceflowInteract,
  voiceflowSaveTranscript,
  makeTranscriptUrl,
} from "../apis/voiceflow";
import { createConversationRecord } from "../apis/airtable";
import { isInteger } from "../utils/misc";
import { reactToMessage } from "../utils/reactions";
import {
  replyThread,
  postMonitoringMessage,
  postMaintainerNotification,
} from "../utils/responses";
import { replySatisfactionButtons } from "../utils/buttons";

import { EMERGENCY_PING, FAILED_ANSWER_PING } from "../config";

export const handleUserQuestion = async (
  message:
    | GenericMessageEvent
    | FileShareMessageEvent
    | ThreadBroadcastMessageEvent
) => {
  const userID = `${message.user}-${message.ts}`;

  const reaction = reactToMessage(message, "robot_face");

  console.log(`Question from ${userID}.`);

  try {
    const timeAsked = parseFloat(message.ts);
    const questionMessageLink = await app.client.chat.getPermalink({
      channel: message.channel,
      message_ts: message.ts,
    });
    const vfLaunch = await voiceflowInteract(userID, { type: "launch" });
    const vfReply = await voiceflowInteract(userID, {
      type: "text",
      payload: message.text,
    });
    const transcriptReply = voiceflowSaveTranscript(userID);

    let outputText = "";
    let attachments: MessageAttachment[] = [];

    let end_type = "";
    let end_reason = "";
    let answer_score = "";

    for (const trace of vfReply) {
      if (trace.type === "text") {
        outputText += trace.payload.message + "\n\n";
      } else if (
        trace.type === "visual" &&
        trace.payload.visualType === "image"
      ) {
        attachments.push({
          fallback: "Q&A Chatbot sent an image",
          image_url: trace.payload.image,
          thumb_url: trace.payload.image,
        });
      } else if (trace.type.includes("answer_")) {
        end_type = trace.type;
        end_reason = trace.payload.reason;
        answer_score = trace.payload.score || null;
      } else if (trace.type === "path" || trace.type === "end") {
        // do nothing
      } else {
        console.log("Unhandled trace type", trace);
      }
    }

    // remove the last two newlines
    outputText = outputText.trimEnd();

    if (outputText || attachments.length > 0) {
      await replyThread(message, outputText, attachments);
    }
    const timeAnswered = new Date().getTime() / 1000;

    const transcriptUrl = makeTranscriptUrl((await transcriptReply).data._id);
    const locationmessage =
      message.channel[0] === "D"
        ? "in a DM"
        : `in <#${message.channel}>, see thread <${questionMessageLink.permalink}|here>`;
    const coreMonitoringMessage = `<@${message.user}> asked \`${message.text}\` ${locationmessage}. Voiceflow debug <${transcriptUrl}|transcript>. End type: \`${end_type}\`. End reason: \`${end_reason}\` Answer score \`${answer_score}\``; // todo: add better conditions for if the permalink fetch doesnt work well

    if (end_type === "answer_emergency") {
      await postMonitoringMessage(
        `:rotating_light: :rotating_light: Emergency question detected from <@${message.user}>. ${coreMonitoringMessage} <${EMERGENCY_PING}> :rotating_light: :rotating_light:`
      );
    } else if (end_type === "answer_fail") {
      await postMonitoringMessage(
        `:warning: Question failed to be answered automatically. ${coreMonitoringMessage} <${FAILED_ANSWER_PING}>`
      );
    } else if (end_type === "answer_success") {
      if (
        answer_score === null ||
        !isInteger(answer_score) ||
        parseInt(answer_score) <= 2
      ) {
        await postMonitoringMessage(
          `:large_blue_square: *Low confidence answer* ${coreMonitoringMessage} <${FAILED_ANSWER_PING}>`
        );
      } else {
        await postMonitoringMessage(
          `:white_check_mark: ${coreMonitoringMessage}`
        );
      }
    } else {
      await postMonitoringMessage(`:thinking_face: ${coreMonitoringMessage}`);
    }

    const conversationRecordID = await createConversationRecord({
      convo_id: userID,
      question: message.text,
      answer: outputText,
      user_id: message.user,
      end_type,
      end_reason,
      answer_score,
      time_asked: timeAsked,
      time_answered: timeAnswered,
      slack_permalink: questionMessageLink.permalink ?? "No link",
      vf_transcript: transcriptUrl,
      channel: message.channel,
    }).catch(async () => {
      await postMaintainerNotification(
        `Failed to save conversation record for <@${message.user}>. Likely a problem with airtable, could be running out of rows (max 1000 on free plan), in which case you should download the data and clear it`
      );
      return "";
    });
    const buttonPayload = `${message.user}|${conversationRecordID}`;

    await replySatisfactionButtons(message, buttonPayload);
  } catch (error) {
    await replyThread(
      message,
      "We weren't able to respond to your question. An organizer will help you shortly."
    );
    await postMonitoringMessage(
      `:interrobang: Code error to question from <@${message.user}>: ${message.text}`
    );
  }
  await reaction;
  await reactToMessage(message, "robot_face", "remove");
};
