import { RTMClient } from '@slack/rtm-api';
import { WebClient } from '@slack/web-api';
import {COMMAND_IS_INCORRECT, SLACK_OAUTH_TOKEN} from "./constans";
import {isCommand, isCorrectCommand} from "./utils";

const rtm = new RTMClient(SLACK_OAUTH_TOKEN)
const web = new WebClient(SLACK_OAUTH_TOKEN)

rtm.start().catch(console.error)

rtm.on('ready', async () => {
    const channels = await web.conversations.list();
    console.log(channels);
    // await sendMessaage('general', 'Hello!');
})

rtm.on('slack_event', async (eventType, event) => {
    console.log(event);
    if (!event || event.type !== 'message' || event.subtype === 'bot_message' || !isCommand(event.text)) {
        return
    }

    if(!isCorrectCommand(event.text)) {
        await sendMessaage(event.channel, COMMAND_IS_INCORRECT)
        return
    }

    await sendMessaage(event.channel, event.text)
})

async function sendMessaage(channel, text) {
    await web.chat.postMessage({
        channel,
        text
    })
}
