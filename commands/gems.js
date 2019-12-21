const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")

class Gems extends Command {
  constructor(client) {
    super(client, {
      name: "gems",
      aliases: ["gem"],
      description: "Shows your list of gems.",
      usage: `b!gems`,
      category: "FOB"
    })
  }
  
  async run(client, message, args, colors) {

  let inv = client.fob.fetch(`${message.author.id}.inventory.gems`)
  let gems = ""
  let gemlist = [
      "Mithril",
      "Demonite",
      "Fury Stone",
      "Spirit Shard",
      "Dragon Bone",
      "Red Diamond",
      "Grandidierite",
      "Poudretteite",
      "Benitoite",
      "Tanzanite",
      "Alexandrite",
      "Diamond",
      "Sapphire",
      "Ruby",
      "Lapis Lazuli",
      "Topaz",
      "Garnet",
      "Aquamarine",
      "Spinel",
      "Amber",
      "Titanite",
      "Tourmaline",
      "Kunzite",
      "Amethyst",
      "Citrine",
      "Peridot",
      "Iolite",
      "Onyx",
      "Turquoise",
      "Malachite",
      "Feldspar",
      "Jade",
      "Nephrite",
      "Olivine",
      "Copal"
  ]
  let total = 0
  
  if (inv) {
  for (var i in gemlist) {
    let code = gemlist[i].replace(/ /g, "").toLowerCase()
    if (inv[code]) {
      gems += "**"+gemlist[i] +"**: " +inv[code] + "\n"
      total += inv[code]
    }
  }
  }
  
  let embed = new RichEmbed()
  .setColor(colors.color)
  .setTitle("Gems")
  .setDescription(gems)
  .setFooter("Total Gem Count: " + total)
  
  return message.author.send(embed)
}
}