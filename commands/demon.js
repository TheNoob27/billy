const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors, prefix, game) => {
if (!game && message.author.id != client.owner) return
  
  
}
module.exports.help = {
  name: "demon",
  aliases: [],
  description: "Summons the demon, can only be summoned after the play command.",
  usage: `b!demon`,
  category: "Secret"
}