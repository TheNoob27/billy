const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")

class command extends Command {
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
    
  }
}

module.exports = command