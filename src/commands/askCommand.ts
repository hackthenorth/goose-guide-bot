import { App, LogLevel } from '@slack/bolt';
import axios from 'axios';

export default (app: App) => {
  app.command('/ask', async ({ command, ack, respond }) => {
    await ack();
    const question = command.text.trim();
    if (!question) {
      return await respond('Please ask something like `/ask What time is the closing ceremony?`');
    }

    await respond(`Looking into that... one sec.`);
    try {
      const vfRes = await axios.post(
        process.env.VOICEFLOW_API!,
        { query: question },
        { headers: { Authorization: process.env.VOICEFLOW_KEY! } }
      );
      const answer = vfRes.data?.response || "I'm not sure—could you rephrase?";
      await respond(answer);
    } catch (e) {
      console.error('Error in /ask:', e);
      await respond("Sorry, something went wrong! Try again in a bit.");
    }
  });
};

