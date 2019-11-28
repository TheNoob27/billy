const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors) => {

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
  if (inv) {
  for (var i in gemlist) {
    let code = gemlist[i].replace(/ /g, "").toLowerCase()
    if (inv[code]) gems += gemlist[i] +": " +inv[code]
  }
  }
}
module.exports.help = {
  name: "gems",
  aliases: ["gem"],
  description: "Shows your list of gems.",
  usage: `b!gems`,
  category: "FOB"
}