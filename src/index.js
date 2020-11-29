import { PORT } from "./constans";
import { checkIfLedgerIsCreatedAndCreateIfNot, command } from "./slackMethods";
import { createEventAdapter } from "@slack/events-api";
import { SLACK_OAUTH_TOKEN } from "./slackToken";

const slackEvents = createEventAdapter(SLACK_OAUTH_TOKEN);

(async () => {
  try {
    await slackEvents.start(PORT);
    await checkIfLedgerIsCreatedAndCreateIfNot();
  } catch (e) {
    console.log(e);
  }
})();

slackEvents.on("app_mention", async (event) => {
  await command(event);
  console.log(event);
});
