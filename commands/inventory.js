const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors) => {
const inventory = client.fob.fetch(message.author.id + ".inventory")


}
module.exports.help = {
  name: "inventory",
  aliases: ["inv"],
  description: "Shows your inventory.",
  usage: `b!inventory`,
  category: "FOB"
}