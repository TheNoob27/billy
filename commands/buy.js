const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")

class Buy extends Command {
  constructor(client) {
    super(client, {
      name: "",
      aliases: [],
      description: "",
      usage: `b!`,
      category: ""
    })
  }
  
  async run(client, message, args, colors) {
    if (!args[0]) return client.commands.get("shop").run(client, message, args, colors)
    
    let canBuy = ""
  }
}

module.exports = Buy