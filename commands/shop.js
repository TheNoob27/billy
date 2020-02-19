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
    if (!inventory.sword) inventory.sword = {}
    if (!inventory.armour) inventory.armour = {}
    let canBuy = (fn, item) => inventory.sword.name == item || inventory.armour.name == item ? " ✅" : typeof fn == "number" ? inventory.gold < fn ? " 🔒" : "" : !fn(inventory) ? " 🔒" : ""
    
    let embed = new RichEmbed()
    .setTitle("Shop")
    .setColor(colors.help);
    [
      {
        title: "Swords",
        "description": "**__Heavens Edge__**"+ canBuy(inv => inv.gold >= 100000 && ["mithril", "demonite", "furystone", "spiritshard", "dragonbone"].every(g => inv.gems[g] > 0), "Heavens Edge") +
        "\nDamage: 30 \nGold: 100,000 \nGems: All \nBonus: Smites the enemy, dealing an additional 25 damage." +
        
        "\n\n**__Pure Energy__**" + canBuy(inv => inv.gold >= 15000 && inv.gems.demonite > 0, "Pure Energy") +
        "\nDamage: 24 \nGold: 15,000 \nGems: Demonite" + 
        
        "\n\n**__Ice Blade__**" + canBuy(600, "Ice Blade") +
        "\nDamage: 15 \nGold: 600" + 
        
        "\n\n**__Power Katana__**" + canBuy(325, "Power Katana") +
        "\nDamage: 13 \nGold: 325" +
        
        "\n\n**__Fine Steel Sword__**" + canBuy(125, "Fine Steel Sword") +
        "\nDamage: 11 \nGold: 125" + 
        
        "\n\n**__Sharp Iron Sword__**" + canBuy(30, "Sharp Iron Sword") + 
        "\nDamage: 8 \nGold: 30"
      },
      {
        title: "Armour",
        description: "**__Eternal Inferno__**" + canBuy(inv => inv.gold >= 17000 && inv.gems.mithril > 0, "Eternal Inferno") + 
        "\nExtra Health: 200 \nGold: 17,000 \nGems: Mithril \nBonus: Reflects 15% of the enemy's damage back to them." + 
        
        "\n\n**__Frost Guard Armour__**" + canBuy(inv => inv.gold >= 14000 && ["reddiamond", "alexandrite"].every(g => inv.gems[g] > 0), "Frost Guard Armour") + 
        "\nExtra Health: 190 \nGold: 14,000 \nGems: Red Diamond, Alexandrite"+
        
        "\n\n**__Emperor Armour__**" + canBuy(10000, "Emperor Armour") +
        "\nExtra Health: 170 \nGold: 10,000" +
        
        "\n\n**__Redcliff Elite Armour__**" + canBuy(5500, "Redcliff Elite Armour") +
        "\nExtra Health: 160 \nGold: 5,500" + 
        
        "\n\n**__Knight Armour__**" + canBuy(1500, "Knight Armour") +
        "\nExtra Health: 110 \nGold: 1,500" +
        
        "\n\n**__Chain Armour__**" + canBuy(250, "Chain Armour") +
        "\nExtra Health: 50 \nGold: 250"
      },
      {
        title: "Bows",
        description: "**__Legendary Bow__**" + canBuy(inv => inv.gold >= 15000 && inv.gems.dragonbone > 0, "Legendary Bow") +
        "\nDamage: 30 \nGold: 15,000 \nGems: Dragon Bone \nNote: doesnt fly lol" +
        
        "\n\n**__Enchanted Crossbow__**" + canBuy(1250, "Enchanted Crossbow") + 
        "\nDamage: 15 \nGold: 1,250" + 
        
        "\n\n**__Long Bow__**" + canBuy(375, "Long Bow") + 
        "\nDamage: 10 \nGold: 325"
      }
    ].map(f => embed.addField(f.title, f.description, true))
    
    return message.channel.send(embed)
  }
}

module.exports = Shop