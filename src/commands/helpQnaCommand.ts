import { app } from "../app";
import { QUESTIONS_CHANNEL } from "../config";

const HELP_MESSAGE = `Hey there :wave:!
Q&A Chatbot is a project made in collaboration between Hack the North and <https://www.voiceflow.com/|Voiceflow> to help answer your questions about the event quickly and accurately.
For any question you ask in <#${QUESTIONS_CHANNEL}> the bot will try to answer automatically based off it's knoledge base, the real-time Hack the North schedule, announcements, maps and more.
You can also ask questions in direct messages to the bot (which you can open with /ask) if you want to ask privately.
It only answers your question in one-shot, so if you need more help or clarification, just ask again in a new message, not in the thread.
If you're not satisfied with the answer, you can give feedback and an organizer will reach out to help you.
Your questions and the bot's answers will be logged for quality.`;

app.command("/help-qna", async ({ command, ack }) => {
  await ack();

  try {
    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: HELP_MESSAGE,
    });
  } catch (error) {
    console.error(
      "Tried to answer help-qna but failed, maybe didn't have permissions to answer in channel.",
      error
    );
    try {
      await app.client.chat.postMessage({
        channel: command.user_id,
        text: HELP_MESSAGE,
        unfurl_links: false,
        unfurl_media: false,
      });
    } catch (error) {
      console.error("Tried to answer help-qna in DMs but also failed.", error);
    }
  }
});
