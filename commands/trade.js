const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")
const { finduser } = require("../functions.js")
const Trade = require("../classes/Trade.js")

class TradeCMD extends Command {
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
    
    message.channel.send(
      new RichEmbed()
      .setTitle("New Trade")
      .setColor(colors.color)
      .setDescription("Do you accept **" + message.author.tag + "**'s trade request?")
    ).then(msg => {
    let filter = (r, u) => u.id == user.id && ["✅", "❌"].includes(r.emoji.name)
    let collector = msg.createReactionCollector(filter, {time: 600000})
    let accepted = false
    collector.once("collect", r => {
      if (r.emoji == "✅") {
        accepted = true
        collector.stop()
      } else {
        collector.stop()
      }
    })
    
    collector.once("end", () => {
      if (accepted) {
        let trade = new Trade(message.author, user)
        
      }
      return message.reply("They did not accept your request.")
    })
    })
  }
}

module.exports = TradeCMD