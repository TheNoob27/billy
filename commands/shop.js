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
    if (!inventory.gems) inventory.gems = {}
    let canBuy = (fn) => typeof fn == "number" ? inventory.gold >= fn ? " 🔒" : "" : fn(inventory) ? " 🔒" : ""
    
    let pages = [
      {
        title: "Swords",
        "description": "**__Heavens Edge__**"+ canBuy(inv => inv.gold >= 100000 && ["mithril", "demonite", "furystone", "spiritshard", "dragonbone"].every(g => inv.gems[g] > 0)) +
        "\nDamage: 60 \nGold: 100,000 \nGems: All" +
        
        "\n\n**__Pure Energy__**" + canBuy(inv => inv.gold >= 15000 && inv.gems.demonite > 0) +
        "\nDamage: 24 \nGold: 15,000 \nGems: Demonite" + 
        
        "\n\n**__Ice Blade__**" + canBuy(600) +
        "\nDamage: 15 \nGold: 600" + 
        
        "\n\n**__Power Katana__**" + canBuy(325) +
        "\nDamage: 13 \nGold: 325" +
        
        "\n\n**__Fine Steel Sword__**" + canBuy(125) +
        "\nDamage: 11 \nGold: 125" + 
        
        "\n\n**__Sharp Iron Sword__**" + canBuy(30) + 
        "\nDamage: "
      }
    ]
  }
}

module.exports