const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors) => {
  let level = client.fob.fetch(`${message.author.id}.level`)
  if (!level) {
    client.fob.set(`${message.author.id}.level.level`, 1)
    level = {
      level: 1,
      xp: 0
    }
    
  }
  
let levels = [
  0,
  10,
  25,
  50,
  125,
  200,
  266,
  330,
  457,
  525,
  608,
  860,
  1080,
  1648,
  4069,
  7025,
  10607,
  13796,
  17693,
  20175,
  22650,
  30869,
  57920,
  80916,
  108203,
  127349,
  151089,
  199999,
  261869,
  308108,
  376190,
  418301,
  425639,
  430615,
  571820,
  658442,
  811739,
  1009108,
  1231376,
  1522833,
  1860284,
  2274907,
  2913905,
  3618307,
  4141599,
  4816390,
  6352997,
  8247291,
  9311344,
  13096582
]

let current = level.level
let pastxp = levels[current - 1]
let required = levels[current]

let embed = new Discord.RichEmbed()
.setColor(colors.color)
.setTitle("Level Stats")
.addField("Level", current)
.addField("Total XP", level.xp)
.addField("Progress", `${level.xp - pastxp}/${required - pastxp}`)

return message.author.send(embed)
}
module.exports.help = {
  name: "level",
  aliases: ["lvl"],
  description: "Shows your level",
  usage: `b!level`,
  category: "FOB"
}