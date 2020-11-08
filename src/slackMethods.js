import { WebClient } from "@slack/web-api";
import { LEDGER_NAME, SLACK_OAUTH_TOKEN } from "./constans";

const web = new WebClient(SLACK_OAUTH_TOKEN);

export async function sendMessage(channel, text) {
  await web.chat.postMessage({
    channel,
    text,
  });
}

const gratificationMessage = (text) => {
  text = text.split(" ");
  text.shift();
  return text.join(" ");
};

export async function saveGratification(event) {
  await web.chat.postMessage({
    channel: LEDGER_NAME,
    text: gratificationMessage(event.text),
  });
}

export async function checkIfLedgerIsCreatedAndCreateIfNot() {
  if (await isLedgerCreated()) {
    return;
  }
  await web.conversations.create({
    name: LEDGER_NAME,
  });
}

export async function isLedgerCreated() {
  const res = await web.conversations.list();
  return res.channels.some((el) => el.name === LEDGER_NAME);
}
