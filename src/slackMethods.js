import { WebClient } from "@slack/web-api";
import { LEDGER_NAME } from "./constans";
import { SLACK_OAUTH_TOKEN } from "./slackToken";

const web = new WebClient(SLACK_OAUTH_TOKEN);

export async function sendMessage(channel, text) {
  await web.chat.postMessage({
    channel,
    text,
  });
}

function getActualMentionMessage(event) {
  const messageParts = event.text.split(" ");
  messageParts.shift();
  return messageParts.join(" ");
}

function gratificationMessage(event) {
  const userThatSentGratification = `<@${event.user}>`;
  return `${userThatSentGratification} ${getActualMentionMessage(event)}`;
}

export async function saveGratification(event) {
  await web.chat.postMessage({
    channel: LEDGER_NAME,
    text: gratificationMessage(event),
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

async function isLedgerCreated() {
  const res = await web.conversations.list();
  return res.channels.some((el) => el.name === LEDGER_NAME);
}

function isUser(userText) {
  return /(<@\w+>)/.test(userText);
}

function getCommand(event) {
  return event.text.split(" ")[1];
}

export async function channelCommand(event) {
  const command = getCommand(event);
  if (command === "rating") {
    await sendMessage(event.channel, "RATING");
    await getMessages(5);
    return;
  }

  if (isUser(command)) {
    await saveGratification(event);
  }
}

export async function directMessageCommand(event) {
  console.log("directmessage");
  console.log(event);
  const res = await web.conversations.list({ types: "im" });
  // const res = await web.conversations.members({ channel: event.channel });
  console.log(res);
}

export async function getReceiver(event) {
  console.log("directmessage");
  console.log(event);
  const res = await web.conversations.list({ types: "im" });
  // const res = await web.conversations.members({ channel: event.channel });
  console.log(res);
}

export async function getMessages(daysToNow) {
  const messages = await web.conversations.history({ channel: LEDGER_NAME });
  console.log(messages);
}
