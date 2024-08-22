import {
  GenericMessageEvent,
  FileShareMessageEvent,
  ThreadBroadcastMessageEvent,
  MessageAttachment,
} from "@slack/bolt";

import { app } from "../app";
import { MONITORING_CHANNEL, MAINTAINER_PING } from "../config";

export const replyThread = async (
  message:
    | GenericMessageEvent
    | FileShareMessageEvent
    | ThreadBroadcastMessageEvent,
  text: string,
  attachements?: MessageAttachment[]
) => {
  try {
    await app.client.chat.postMessage({
      channel: message.channel,
      thread_ts: message.thread_ts || message.ts,
      text: text,
      attachments: attachements,
    });
  } catch (error) {
    console.error(
      `Failed to reply to thread ${message.ts} in ${message.channel} with text ${text} and ${attachements?.length} attachements`,
      error
    );
  }
};

export const replyEphemeralThread = async (
  message:
    | GenericMessageEvent
    | FileShareMessageEvent
    | ThreadBroadcastMessageEvent,
  text: string
) => {
  try {
    await app.client.chat.postEphemeral({
      channel: message.channel,
      user: message.user,
      thread_ts: message.thread_ts || message.ts,
      text: text,
    });
  } catch (error) {
    console.error(
      `Failed to reply to thread emphemeral ${message.ts} in ${message.channel} with text ${text}`,
      error
    );
  }
};

export const replyEphemeralThreadManual = async (
  channel: string,
  thread_ts: string,
  text: string,
  user: string
) => {
  try {
    await app.client.chat.postEphemeral({
      channel: channel,
      user: user,
      thread_ts: thread_ts,
      text: text,
    });
  } catch (error) {
    console.error(
      `Failed to reply to thread emphemeral manual ${thread_ts} in ${channel} with text ${text}`,
      error
    );
  }
};

export const replyEphemeralChannel = async (
  message:
    | GenericMessageEvent
    | FileShareMessageEvent
    | ThreadBroadcastMessageEvent,
  text: string
) => {
  try {
    await app.client.chat.postEphemeral({
      channel: message.channel,
      user: message.user,
      text: text,
    });
  } catch (error) {
    console.error(
      `Failed to reply to emphemeral ${message.ts} in ${message.channel} with text ${text}`,
      error
    );
  }
};

export const postMonitoringMessage = async (text: string) => {
  try {
    await app.client.chat.postMessage({
      channel: MONITORING_CHANNEL,
      text: text,
      unfurl_links: false,
      unfurl_media: false,
    });
  } catch (error) {
    console.error(`Failed to post monitoring message ${text}`, error);
  }
};

export const postMaintainerNotification = async (text: string) => {
  try {
    await app.client.chat.postMessage({
      channel: MONITORING_CHANNEL,
      text: `<${MAINTAINER_PING}> ${text}`,
      unfurl_links: false,
      unfurl_media: false,
    });
  } catch (error) {
    console.error(`Failed to post maintainer notification ${text}`, error);
  }
};
