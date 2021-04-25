const discordUtil = require("discord.js").Util
const Embed = require("./Embed")

class Util {
  constructor(client) {
    /** @type {import("./Client")} */
    this.client = client

    this.items = {
      0: "ALL",
      1: "SWORDS",
      2: "ARMOUR",
      3: "BOWS",
      4: "ARMOUR",
      5: "SPELLS",
      ALL: 0,
      SWORDS: 1,
      ARMOUR: 2,
      BOWS: 3,
      AXES: 4,
      SPELLS: 5,
    }
  }

  resolveGem(input = "") {
    input = input.toLowerCase()

    const gem = {
      name: null,
      code: undefined,
      isLegendary: false,
      sell: 0
    }

    const { gems } = this.client.config
    for (const i in gems) {
      if (gems[i].toLowerCase() === input) gem.name = gems[i]
      else if (gems[i].split(" ")[0].toLowerCase() === input) gem.name = gems[i]
      else if (gems[i].replace(" ", "").toLowerCase() === input) gem.name = gems[i]
      else continue
      break
    }

    if (!gem.name) {
      switch (input) {
        case "mith": gem.name = "Mithril"; break
        case "demo": gem.name = "Demonite"; break
        case "grand": gem.name = "Grandidierite"; break
        case "poud": gem.name = "Poudretteite"; break
        case "ben": case "beni": gem.name = "Benitoite"; break
        case "tanz": gem.name = "Tanzanite"; break
        case "aqua": gem.name = "Aquamarine"; break
        case "lolite": gem.name = "Iolite"; break
        default: return null
      }
    }

    // aquamarine, iolite, spiritShard, furyStone, demonite etc
    gem.code = gem.name.toLowerCase().replace(/ \w/, w => w.slice(1).toUpperCase())

    if (["Mithril", "Demonite", "Fury Stone", "Spirit Shard", "Dragon Bone"].includes(gem.name)) gem.isLegendary = true

    const sell = n => gem.sell = n
    switch (gem.name) {
      case "Mithril": sell(2800); break
      case "Demonite": sell(2400); break
      case "Fury Stone":
      case "Spirit Shard": sell(1600); break
      case "Dragon Bone": sell(1200); break
      case "Red Diamond": sell(825); break
      case "Grandidierite": sell(200); break
      case "Poudretteite": sell(100); break
      case "Benitoite": sell(75); break
      case "Tanzanite": sell(50); break
      case "Alexandrite": sell(43); break
      case "Diamond": sell(38); break
      case "Sapphire": sell(32); break
      case "Emerald": sell(29); break
      case "Ruby": sell(26); break
      case "Lapis Lazuli": sell(23); break
      case "Topaz": sell(20); break
      case "Garnet": sell(17); break
      case "Aquamarine": sell(14); break
      case "Spinel": sell(12); break
      case "Amber": sell(11); break
      case "Titanite": sell(10); break
      case "Tourmaline": sell(9); break
      case "Kunzite": sell(8); break
      case "Amethyst": sell(7); break
      case "Citrine": sell(6); break
      case "Peridot": sell(5); break
      case "Iolite":
      case "Onyx": sell(4); break
      case "Turquoise":
      case "Malachite": sell(3); break
      case "Feldspar":
      case "Jade": sell(2); break
      case "Nephrite":
      case "Olivine":
      case "Copal": sell(1); break
    }

    return gem
  }

  resolveItem(input = "", type = 0) {
    if (!input) return null
    input = input.toLowerCase()

    const list = this.client.config.items
    const items =
      type === this.items.ALL ? Object.values(list).flat() :
      type === this.items.SWORDS ? list.swords :
      type === this.items.ARMOUR ? list.armour :
      type === this.items.BOWS ? list.bows :
      type === this.items.AXES ? list.axes :
      list.spells
    const item = {
      /** @type {string} */
      name: null,
      /** @type {string} */
      description: null,
      cost: 0,
      // sell: 0, 30% of original price
      gemsNeeded: [],
      value: 0,
      /** @type {string} */
      bonus: null
    }

    for (const i in items) {
      if (items[i].toLowerCase() === input) item.name = items[i]
      else if (items[i].split(" ")[0].toLowerCase() === input.split(" ")[0]) item.name = items[i]
      else continue
      break
    }

    if (!item.name) {
      switch (input.replace("'", "")) {
        case "heavens": case "heavens edge": item.name = "Heavens Edge"; break
        case "katana": item.name = "Power Katana"; break
        case "fine steel": case "steel": item.name = "Fine Steel Sword"; break
        case "iron": case "sharp iron": item.name = "Sharp Iron Sword"; break;
        case "inferno": item.name = "Eternal Inferno"; break
        case "frost guard": item.name = "Frost Guard Armour"; break
        case "emperors armour": case "emperors": item.name = "Emperor Armour"; break
        case "crossbow": item.name = "Enchanted Crossbow"; break
        case "rusty": item.name = "Rusty Iron Sword"; break
        default: return null
      }
    }

    switch(item.name) {
      case "Heavens Edge":
        item.cost = 100000
        item.value = 55
        item.gemsNeeded = ["mithril", "demonite", "furyStone", "spiritShard", "dragonBone"]
        item.bonus = "Smites enemies, dealing extra damage."
        break
      case "Pure Energy":
        item.cost = 15000
        item.value = 24
        item.gemsNeeded = ["demonite"]
        break
      case "Ice Blade":
        item.cost = 600
        item.value = 15
        break
      case "Power Katana":
        item.cost = 325
        item.value = 13
        break
      case "Fine Steel Sword":
        item.cost = 125
        item.value = 11
        break
      case "Sharp Iron Sword":
        item.cost = 30
        item.value = 8
        break
      case "Eternal Inferno":
        item.cost = 17000
        item.value = 200
        item.gemsNeeded = ["mithril"]
        item.bonus = "Reflects 15% of enemies' damage back to them."
        break
      case "Frost Guard Armour":
        item.cost = 14000
        item.value = 190
        item.gemsNeeded = ["redDiamond", "alexandrite"]
        break
      case "Emperor Armour":
        item.cost = 10000
        item.value = 170
        break
      case "Redcliff Elite Armour":
        item.cost = 5500
        item.value = 160
        break
      case "Knight Armour":
        item.cost = 1500
        item.value = 110
        break
      case "Chain Armour":
        item.cost = 250
        item.value = 50
        break
      case "Legendary Bow":
        item.cost = 15000
        item.value = 30
        item.gemsNeeded = ["dragonBone"]
        break
      case "Enchanted Crossbow":
        item.cost = 1250
        item.value = 15
        break
      case "Long Bow":
        item.cost = 325
        item.value = 10
        break
      case "Greater Fireball":
        item.cost = 15000
        item.value = 43
        item.gemsNeeded = ["spiritShard"]
        item.description = "Sends a powerfull fireball that sets enemies on fire."
        break
      case "Lifesteal":
        item.cost = 8000
        item.value = 75
        item.description = "Steal some of your enemy's HP and add some to yours."
        break
      case "Fireball":
        item.cost = 5500
        item.value = 34
        break
      case "Blink":
        item.cost = 4500
        item.description = "Teleport away from the enemy, causing them to lose you as a target."
        break
      case "Heal":
        item.cost = 2500
        item.description = "Heal the weakest member of your team."
        break
      case "Magic Missile":
        item.cost = 350
        item.value = 32
        break
      case "Venomancer":
        item.cost = 100000
        item.value = 20
        item.bonus = "Poisons the enemies, dealing extra damage."
        item.gemsNeeded = ["mithril", "demonite", "furyStone", "spiritShard", "dragonBone"]
        break
      case "Flaming Fury":
        item.cost = 15000
        item.value = 16
        item.bonus = "Sets enemies on fire, dealing extra damage."
        item.gemsNeeded = ["furyStone"]
        break
      case "Battle Cleaver":
        item.cost = 3500
        item.value = 15
        break
      case "Axe of Skirmishing":
        item.cost = 1000
        item.value = 10
        break
    }
    return item
  }

  generateGem(legendaries = false, { legendsOnly = false, equalChance = false, rares: rareGems = true } = {}) {
    const { gems } = this.client.config
    if (equalChance) return this.resolveGem(gems.random())

    const legends = gems.slice(0, 5),
      rares = gems.slice(5, 9),
      uncommon = gems.slice(9, 14),
      common = gems.slice(14)

    if (legendsOnly) return this.resolveGem(legends.random())

    const chance = Math.random()
    
    let gem
    if (legendaries) {
      if (chance > 0.95) gem = legends.random() // 5% chance
      else if (chance > 0.85) gem = rares.random() // 10% chance
      else if (chance > 0.5) gem = uncommon.random() // 35% chance
      else gem = common.random() // 50% chance
    } else if (rareGems) {
      if (chance > 0.85) gem = rares.random() // 15% chance
      else if (chance > 0.5) gem = uncommon.random() // 35% chance
      else gem = common.random() // 50% chance
    } else {
      if (chance > 0.6) gem = uncommon.random()
      else gem = common.random()
    }
    return this.resolveGem(gem)
  }

  addXP(user, add, channel) {
    if (typeof user === "string") user = this.client.users.cache.get(user)
    if (!user || !channel) return
    const level = this.client.db.get(`${user.id}.level.level`)
    const xp = this.client.db.add(`${user.id}.level.xp`, add)
    const check = n => {
      if (!n) return false
      if (xp > n) {
        this.client.db.add(`${user.id}.level.level`, level ? 1 : 2)
        if (level === 49) {
          const bal = this.client.db.add(`${user.id}.inventory.gold`, 100000)
          channel.send(
            new Embed()
              .setTitle("🎉 **Level 50!**🎉")
              .setDescription(
                "You've reached level 50!! " +
                "Here is 100k gold, to thank you for the amount of effort you put into this bot to reach level 50. "+
                "The amount of XP you've worked to earn. On a Discord bot that might not be used in a few years, but you still cared. "+
                "TheNoob27 and I want to thank you for playing this and enjoying it."
              )
              .addField("New Balance", bal.toLocaleString())
              .setTimestamp()
              .setFooter(`Congratulations, ${user.username}!`, user.displayAvatarURL({ format: "png", dynamic: true }))
          )
        }
        else
          channel.send(
            new Embed()
              .setTitle("🎉 You levelled up! 🎉")
              .setDescription(`You have levelled up! You are now level **${(level || 1) + 1}**!`)
              .setColor(this.client.colors.color)
              .setTimestamp()
              .setFooter(user.username, user.displayAvatarURL({ dynamic: true, format: "png" }))
          )
      } else return false
      return true
    }

    return check(this.client.config.xpNeeded[level || 1])
  }

  get discordUtil() {
    return discordUtil
  }
}

module.exports = Util