const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")

class Play extends Command {
  constructor(client) {
    super(client, {
      name: "shop",
      aliases: ["market", "items"],
      description: "View the shop, where all items will be available. Buy an item with b!buy <item>",
      usage: `b!shop`,
      category: "FOB"
    })
  }
  
  async run(client, message, args, colors) {
    let inventory = client.fob.get(message.author.id + ".inventory")
    let canBuy = (fn) => fn(inventory) ? "🔒" : ""
    
    let pages = [
      {
        title: "Swords",
        "description": "**_Heavens Edge__*"
      }
    ]
  }
}