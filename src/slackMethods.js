import { WebClient } from "@slack/web-api";
import { DAILY_GRATIFICATIONS_LIMIT, LEDGER_NAME } from "./constans";
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
  const messages = await getMessagesFromLastDay();
  const todayGratificationsNumber = messages.filter((message) =>
    isUserOfId(event.user, message.text.split(" ")[0])
  ).length;

  if (todayGratificationsNumber >= DAILY_GRATIFICATIONS_LIMIT) {
    return;
  }

  await web.chat.postMessage({
    channel: LEDGER_NAME,
    text: gratificationMessage(event),
  });
}

export async function createLedgerIfDoesntExist() {
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

const USER_PATTERN = /(<@\w+>)/;

function isUser(userText) {
  return USER_PATTERN.test(userText);
}

function isUserOfId(id, idWithPrefixAndPostfix) {
  return `<@${id}>` === idWithPrefixAndPostfix;
}

function getUser(userText) {
  return USER_PATTERN.exec(userText);
}

function getCommand(event) {
  return event.text.split(" ")[1];
}

export async function botMentionCommand(event) {
  const command = getCommand(event);
  if (command === "rating") {
    await sendMessage(event.channel, await getRatingMessage());
    return;
  }

  if (isUser(command)) {
    await saveGratification(event);
  }
}

export async function directMessageCommand(event) {
  if (!(await isDirectMessageCommand(event.text))) {
    return;
  }

  const command = getCommand(event);

  if (isUser(command)) {
    await saveGratification(event);
  }
}

async function isDirectMessageCommand(command) {
  const bot = await web.auth.test();
  const botId = bot.user_id;
  return isUserOfId(botId, getUser(command)[0]);
}

async function getLedger() {
  const conversations = await web.conversations.list();
  return conversations.channels.find((el) => el.name === LEDGER_NAME);
}

export async function getMessagesFromMonth() {
  const ledger = await getLedger();
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const history = await web.conversations.history({
    channel: ledger.id,
    oldest: date.getTime() / 1000,
  });
  return history.messages;
}

export async function getMessagesFromLastDay() {
  const ledger = await getLedger();
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const history = await web.conversations.history({
    channel: ledger.id,
    oldest: date.getTime() / 1000,
  });
  return history.messages;
}

const isMessageATransaction = (message) => {
  const parts = message.text.split(" ");
  return isUser(parts[0]) && isUser(parts[1]);
};

async function getTransactions() {
  const messages = await getMessagesFromMonth();
  const transactions = messages.filter(isMessageATransaction);
  return transactions.reduce((prev, next) => {
    const receiver = next.text.split(" ")[1];
    prev[receiver] = prev[receiver] + 1 || 0;
    return prev;
  }, {});
}

async function getRatingMessage() {
  const transactions = await getTransactions();
  return Object.keys(transactions)
    .sort((a, b) => transactions[b] - transactions[a])
    .reduce((prev, next) => `${prev}${next}: ${transactions[next]} \n`, "");
}
