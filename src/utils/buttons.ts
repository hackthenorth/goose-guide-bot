import {
  GenericMessageEvent,
  FileShareMessageEvent,
  ThreadBroadcastMessageEvent,
} from "@slack/bolt";

import { app } from "../app";

export const replySatisfactionButtons = async (
  message:
    | GenericMessageEvent
    | FileShareMessageEvent
    | ThreadBroadcastMessageEvent,
  payload: string,
) => {
  try {
    await app.client.chat.postMessage({
      channel: message.channel,
      thread_ts: message.thread_ts || message.ts,
      text: "Did this answer your question?",
      unfurl_links: false,
      unfurl_media: false,
      blocks: [
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Did that answer your question? This helps us improve the bot.",
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Yes :star-struck:",
              },
              style: "primary",
              action_id: "satisfaction_yes",
              value: payload,
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "No, but I'm ok :thumbsup:",
              },
              action_id: "satisfaction_no",
              value: payload,
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "No, but I still need help :grey_question:",
              },
              style: "danger",
              action_id: "satisfaction_help_me",
              value: payload,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Powered by <https://www.voiceflow.com/|Voiceflow> :zap:",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "_Q&A Chatbot can make mistakes. Check important info with organizers._",
          },
        },
      ],
    });
  } catch (error) {
    console.error(
      `Failed to reply to thread ${message.ts} in ${message.channel} with satisfaction buttons`,
      error,
    );
  }
};

export const updateSatisfactionButtons = async (
  channel: string,
  ts: string,
  text: string,
) => {
  try {
    await app.client.chat.update({
      channel: channel,
      ts: ts,
      text: text,
      unfurl_links: false,
      unfurl_media: false,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: text,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Powered by <https://www.voiceflow.com/|Voiceflow> :zap:",
          },
        },
      ],
    });
  } catch (error) {
    console.error(
      `Failed to update satisfaction buttons ${ts} in ${channel} with text ${text}`,
      error,
    );
  }
};
