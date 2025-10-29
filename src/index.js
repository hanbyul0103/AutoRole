import {
    Client,
    GatewayIntentBits
} from "discord.js";

//env설정
import dotenv from "dotenv";
dotenv.config();

// 외부 함수
import * as eventHandler from "./utils/eventHandler.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

eventHandler.loadEvents(client);

client.login(process.env.TOKEN);