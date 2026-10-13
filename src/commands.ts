import { Message } from "discord.js"

export class CommandRegistry {
    public readonly static prefix: string = "!";
    private static commands: Command[] = [];

    static registerCommand(command: Command) {
        this.commands.push(command);
    }

    static getCommand(commandName: string) {
        const command = this.commands.find((cmd) => cmd.name === commandName);

        if(!command) {
            throw new Error("No command");
        }

        return command
    }

    static unregisterCommand(commandName: string) {
        const commandIndex = this.commands.findIndex((command) => command.name === commandName);

        if(commandIndex < 0) {
            throw new Error("No command");
        }

        this.commands.splice(commandIndex, 1);
    }

    static setPrefix(value: string) {
        if (typeof value === "string" && value.trim() !== "") {
            this.prefix = value
        } else {
            throw new SyntaxError("Value must be a non-empty string");
        }
    }
}

export class Command {
    constructor(
        public name: string,
        public description: string,
        public run: (...args: string[])=>{}
    ) {}
}