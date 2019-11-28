const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors) => {
const inventory = client.fob.fetch(message.author.id + ".inventory")

let embed = new Discord.RichEmbed()
.setTitle("Inventory")
.setColor(colors.color)
.addField("Sword", inventory.sword || "None")
.addField("Axes", inventory.axes ? inventory.axes.join("\n") : "None")
.addField("Gold", inventory.gold || 0)
.addField("Gems", "Check your gems with b!gems.")

return message.author.send(embed)
}
module.exports.help = {
  name: "inventory",
  aliases: ["inv"],
  description: "Shows your inventory.",
  usage: `b!inventory`,
  category: "FOB"
}