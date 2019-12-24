const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")
const { finduser } = require("../functions.js")
class Trade extends Command {
  constructor(client) {
    super(client, {
      name: "trade",
      aliases: [],
      description: "Start a trade with someone.",
      usage: "b!trade (start/with) (user if with)",
      category: "FOB",
      cooldown: 60000
    })
  }
  
  async run(client, message, args, colors) {
    if (!args[0]) return message.channel.send("Please inpu someone you would like to trade with.")
    
    const user = finduser(message, args.join(" "), true)
    
    if (!user) return message.channel.send("Couldn't find that user.")
    
    
    
  }
}

module.exports = Trade