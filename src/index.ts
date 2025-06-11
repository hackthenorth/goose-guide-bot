import { app } from "./app";
import "./commands/askCommand";
import "./commands/helpQnaCommand";
import "./events/messageHandler";
import "./events/actionHandler";
import askCommand from "./commands/askCommand";
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Q&A Chatbot Bolt app is running again!");
})();

askCommand(app);
