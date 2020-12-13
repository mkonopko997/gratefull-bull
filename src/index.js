import { PORT } from "./constans";
import {
  botMentionCommand,
  createLedgerIfDoesntExist,
  directMessageCommand,
} from "./slackMethods";
import { createEventAdapter } from "@slack/events-api";
import { SLACK_OAUTH_TOKEN } from "./slackToken";

const slackEvents = createEventAdapter(SLACK_OAUTH_TOKEN);

(async () => {
  try {
    await slackEvents.start(PORT);
    console.log("started");
    await createLedgerIfDoesntExist();
  } catch (e) {
    console.log(e);
  }
})();

slackEvents.on("app_mention", async (event) => {
  console.log("app_mention");
  await botMentionCommand(event);
});

slackEvents.on("message", async (event) => {
  console.log("direct message");
  await directMessageCommand(event);
});
