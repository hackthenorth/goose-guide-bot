import { app } from "../app";
import { QUESTIONS_CHANNEL } from "../config";

app.command("/ask", async ({ command, ack }) => {
  await ack();

  try {
    await app.client.chat.postMessage({
      channel: command.user_id,
      text: `Hi! Feel free to ask me any questions privately in this DM or publically in <#${QUESTIONS_CHANNEL}>. Your questions will be logged for quality.
I'm here to help! What would you like to know?`,
    });
  } catch (error) {
    console.error(
      "Tried to answer /ask but failed, maybe didn't have permissions to answer in channel.",
      error
    );
  }
});
