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
    
    
    let canBuy = item => inventory.gold >= item.cost && item.gemsneeded.every(g => inventory.gems[g] > 0) && (inventory.sword.name !== item.name && inventory.armour.name !== item.name)
    let reason = item => 
    inventory.gold < item.cost ? "You do not have enough gold to purchase this item. You need " + (item.cost - inventory.gold).toLocaleString() + " more gold." :
    item.gemsneeded.every(g => inventory.gems[g] <= 0) ? "You do not have the required gems to purchase this item. Gems required: "+item.gemsneeded.map(g => "**" + client.resolveGem(g).name + "**, ").join("") :
    "You already own this item."
    
    let item = client.resolveItem(args[0])
    if (!item) return message.channel.send("Sorry, I couldn't find the item you were looking for.")
    
    if (canBuy(item)) {
      client.fob.subtract(message.author.id + ".inventory.gold", item.cost)
      let embed = new RichEmbed()
      .setTitle("Purchase Successful")
      .setDescription("Successfully bought **" + item.name + "** for " + item.cost.toLocaleString() + " gold!")
      .setColor(colors.color)
    } else {
      let why = reason(item)
    }
  }
}

module.exports = Buy