const { finduser } = require("../functions.js");
const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")

class UserID extends Command {
  constructor(client) {
    super(client, {
      name: "userid",
      aliases: ["id", "user.id"],
      description: "Get someones user ID.",
      usage: `b!userid <user>`,
      category: "Owner Commands",
      example: "b!userid TheNoob27#6815"
    })
  }
  
  async run(client, message, args, colors) {
 let messageID
  
  let user = finduser(message, args.join(" "))
 if (!isNaN(args[0]) && user == message.author) {
    try {
   messageID = await message.channel.fetchMessage(args[0])
    user = messageID.author 
    } catch(err) {
  user = message.author
}
 }
  let name = user.username
  return message.channel.send(`${name}'s ID: \`${user.id}\``)

  
}
}

module.exports = UserID