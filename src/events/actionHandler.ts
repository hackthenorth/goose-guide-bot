import { app } from "../app";
import { handleSatisfactionButton } from "../services/satisfactionService";

app.action(
  { action_id: /^satisfaction_(yes|no|help_me)$/ },
  async ({ body, ack }) => {
    await ack();
    try {
      if (body.type === "block_actions") {
        await handleSatisfactionButton(body);
      }
    } catch (error) {
      console.log(error);
    }
  }
);
