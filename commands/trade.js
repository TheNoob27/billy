const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")

class Trade extends Command {
  constructor(client) {
    super(client, {
      name: "trade",
      aliases: [],
      description: "Start a trade with someone.",
      usage: "b!trade <user>",
      category: "FOB",
      cooldown: 60000
    })
  }
  
  async run(client, message, args, colors) {
  }
}