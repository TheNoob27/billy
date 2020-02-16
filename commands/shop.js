const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")

class Shop extends Command {
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
    let canBuy = (fn) => typeof fn == "number" ? inventory.gold < fn ? " 🔒" : "" : !fn(inventory) ? " 🔒" : ""
    
    let embed = new RichEmbed()
    .setTitle("Shop")
    .setColor(colors.help);
    [
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
        "\nDamage: 8 \nGold: 30"
      },
      {
        title: "Armour",
        description: "**__Eternal Inferno__**" + canBuy(inv => inv.gold >= 17000 && inv.gems.mithril > 0) + 
        "\nExtra Health: 200 \nGold: 17,000 \nGems: Mithril" + 
        
        "\n\n**__Frost Guard Armour__**" + canBuy(inv => inv.gold >= 14000 && ["reddiamond", "alexandrite"].every(g => inv.gems[g] > 0)) + 
        "\nExtra Health: 190 \nGold: 14,000 \nGems: Red Diamond, Alexandrite"+
        
        "\n\n**__Emperor Armour__**" + canBuy(10000) +
        "\nExtra Health: 170 \nGold: 10,000" +
        
        "\n\n**__Redcliff Elite Armour__**" + canBuy(5500) +
        "\nExtra Health: 160 \nGold: 5,500" + 
        
        "\n\n**__Knight Armour__**" + canBuy(1500) +
        "\nExtra Health: 110 \nGold: 1,500" +
        
        "\n\n**__Chain Armour__**" + canBuy(250) +
        "\nExtra Health: 50 \n Gold: 250"
      }
    ].map(f => embed.addField(f.title, f.description, true))
    
    return message.channel.send(embed)
  }
}

module.exports = Shop