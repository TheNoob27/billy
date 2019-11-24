const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors) => {

  let link = args[0]
  if (!link) return message.channel.send("Please provide a Field Of Battle private server link.")
  if (!link.startsWith("https://www.roblox.com/games/147536429/FIELD-of-BATTLE?privateServerLinkCode=")) return message.channel.send("That was not a valid private server link.")
  
  
}
module.exports.help = {
  name: "post",
  aliases: ["postlink", "postfarm"],
  description: "Post a demon farm link.",
  usage: `b!post <link>`,
  category: "FOB"
}