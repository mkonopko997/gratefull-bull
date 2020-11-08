import { SLACK_OAUTH_TOKEN, PORT } from "./constans";
import { checkIfLedgerIsCreatedAndCreateIfNot } from "./slackMethods";
import { createEventAdapter } from "@slack/events-api";

const slackEvents = createEventAdapter(SLACK_OAUTH_TOKEN);

(async () => {
  try {
    const server = await slackEvents.start(PORT);
    console.log(`Listening for events on ${server.address().port}`);
    await checkIfLedgerIsCreatedAndCreateIfNot();
  } catch (e) {
    console.log(e);
  }
})();

slackEvents.on("app_mention", (event) => {
  console.log(event);
});

slackEvents.on("channel_created", (event) => {
  console.log(event);
});
