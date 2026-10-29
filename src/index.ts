import { Client, Guild } from "discord.js"
import * as fs from "fs";
import { config } from "dotenv"
import { CommandRegistry } from "./commands.js";
config({
    quiet: true
})

const CONFIG_PATH = "./config.json"
let botConfig: { whitelistedGuilds: string[]; }

if(fs.existsSync(CONFIG_PATH)) {
    botConfig = JSON.parse(fs.readFileSync("./config.json", "utf-8").toString());

    if(!botConfig.whitelistedGuilds || !Array.isArray(botConfig.whitelistedGuilds)) {
        throw new Error("Invalid config.")
    }
} else {
    throw new Error("No config.")
}

var CURRENT_TARGET: Guild | undefined;

CommandRegistry.registerCommand({
    name: "target",
    description: "targets a server",
    run: (message, guild)=>{
        const fetched = client.guilds.fetch(guild);

        if(fetched) {

        } else {

        }
    }
})

const client = new Client({
    intents: [
        "GuildBans",
        "Guilds",
        "GuildMembers",
        "GuildMessages",
        "GuildMessageReactions",
        "MessageContent"
    ]
})

client.on("clientReady", async()=>{
    client.user?.setStatus("invisible")
})

client.on("messageCreate", async(message)=>{
    if(message.author.id == client.user?.id) return;
    if(botConfig.whitelistedGuilds.includes(message.guildId ?? `user-${message.author.id}`)) {
        const args = message.content.split(" ");
        const cmd = args.shift();

        if(!cmd) {
            message.reply("invalid command.");
            return;
        }

        const command = CommandRegistry.getCommand(cmd);

        if(command) {
            const commandResult = await command.run(message, ...args);
            if(commandResult) message.reply(commandResult);
        } else {
            message.reply(`command "${cmd}" not found.`)
        }
    }
})

client.login(process.env.TOKEN)