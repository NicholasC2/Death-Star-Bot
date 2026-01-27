import { Message } from "discord.js"

let commands = []
let prefix = "!"

class Command {
    /**
     * @param {String} name
     * @param {Function} callback
     */
    constructor(name, description, callback) {
        this.name = name
        this.description = description
        this.callback = callback
    }
}

/**
 * @returns {String} the command prefix
 */
export function getPrefix() {
    return prefix
}

/**
 * @param {String} value
 */
export function setPrefix(value) {
    if (typeof value === "string" && value.trim() !== "") {
        prefix = value
    } else {
        throw new SyntaxError("value must be a non-empty string")
    }
}

/**
 * @param {String} name
 * @param {String} description
 * @param {(message: Message, ...args: string[]) => void} callback
 */
export function createCommand(name, description, callback) {
    if (typeof name !== "string" || name.trim() === "") {
        throw new SyntaxError("name must be a non-empty string")
    }
    if (typeof description !== "string" || description.trim() === "") {
        throw new SyntaxError("description must be a non-empty string")
    }
    if (typeof callback !== "function") {
        throw new SyntaxError("callback must be a function")
    }

    commands.push(new Command(name, description, callback))
}

/**
 * @param {Message} message
 */
export async function runCommand(message) {
    const input = message.content
    if (!input.startsWith(prefix)) return false

    const parts = input.slice(prefix.length).trim().split(/\s+/)
    const cmdName = parts.shift()
    const args = parts

    const command = commands.find(c => c.name === cmdName)
    if (!command) return false

    return await command.callback(message, ...args)
}

/**
 * @returns {Command[]}
 */
export function getCommands() {
    return commands;
}