const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")

class command extends Command {
  constructor(client) {
    super(client, {
      name: "post",
  aliases: ["postlink", "postfarm"],
  description: "Post a demon farm link.",
  usage: `b!post <link> (custom message)`,
  category: "FOB"
    })
  }
  
  async run(client, message, args, colors) {

  let link = args[0]
  if (!link) return message.channel.send("Please provide a Field of Battle private server link.")
  if (!link.startsWith("https://www.roblox.com/games/147536429/FIELD-of-BATTLE?privateServerLinkCode=")) return message.channel.send("That was not a valid Field of Battle private server link.")
  
  let custom = args.slice(1).join(" ")
  
  let embed = new RichEmbed()
  .setColor(colors.color)
  .setTitle("Demon Farm")
  .setAuthor(message.author.tag, message.author.displayAvatarURL)
  .setDescription(custom ? custom : "**"+ message.author.tag+ "** is hosting a Demon Farm! Click [here]("+link+") to join!")
  .addField("Link", link)
  
 return client.channels.get("648072216444928010").send("<@&648123633658626087>", embed)
  
}
}