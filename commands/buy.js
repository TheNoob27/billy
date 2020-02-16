const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")

class Buy extends Command {
  constructor(client) {
    super(client, {
      name: "buy",
      aliases: ["purchase", "b", "get"],
      description: "Buy an sword or armour.",
      usage: `b!buy <item>`,
      category: "FOB"
    })
  }
  
  async run(client, message, args, colors) {
    if (!args[0]) return client.commands.get("shop").run(client, message, args, colors)
    let inventory = inventory = client.fob.get(message.author.id + ".inventory")
    if (!inventory.gems) inventory.gems = {}
    if (!inventory.armour) inventory.armour = {}
    if (!inventory.sword) inventory.sword = {}
    if (!inventory.gold) inventory.gold = 0
    
    
    let canBuy = item => inventory.gold > item.cost && item.gemsneeded.every(g => inventory.gems[g] > 0) && (inventory.sword.name !== item.name && inventory.armour.name !== item.name)
    let reason = item => 
    inventory.gold > item.cost ? "You do not have enough gold to purchase this item. You currently have " + inventory.gold.toLocaleString() + "." :
    item.gemsneeded.every(g => inventory.gems[g] > 0) ? "You do not have the required gems to purchase this item. Gems needed: "+item.gemsneeded.map(g => ) (inventory.sword.name !== item.name && inventory.armour.name !== item.name)
    
  }
}

module.exports = Buy