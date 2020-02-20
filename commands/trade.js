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
    
    message.channel.send(user.toString(), 
      new RichEmbed()
      .setTitle("New Trade")
      .setColor(colors.color)
      .setDescription("Do you accept **" + message.author.tag + "**'s trade request?")
    ).then(msg => {
    let filter = (r, u) => u.id == user.id && ["✅", "❌"].includes(r.emoji.name)
    let collector = msg.createReactionCollector(filter, {time: 600000})
    
    collector.once("collect", r => {
      if (r.emoji == "✅") {
        collector.stop("accepted")
      } else {
        collector.stop()
      }
    })
    
    collector.once("end", (_, reason) => {
      if (reason == "accepted") {
        let trade = new Trade(message.author, user)
        trading(trade)
      }
      return message.reply("They did not accept your request.")
    })
    })
    
    function trading(trade) {
      let embed = new RichEmbed() 
      .setTitle("Trade")
      .setDescription("React with ➕ to add 500 gold and ➖ to remove 500 gold. \nReact with 💎 to add a gem and ☄️ to remove a gem.\nReact with 🗑 to clear all your items. \nReact with ✅ to accept and ❌ to cancel.")
      .addField(message.author.username + "'s Items", "​" + trade.items[1].map(i => "**" + i.name + "**: " + i.amount).join("\n"))
      .addField(user.username + "'s Items", "​" + trade.items[2].map(i => "**" + i.name + "**: " + i.amount).join("\n"))
      .setColor(colors.color)
      
      message.channel.send(embed).then(async msg => {
        let opts = ["➕", "➖", "💎", "☄️", "🗑", "✅", "❌"]
        for (let i of opts) {
          await msg.react(i)
        }
      })
    }
  }
}

module.exports = TradeCMD