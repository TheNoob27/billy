const { RichEmbed } = require("discord.js")
const Command = require("../classes/Command.js")

class Inventory extends Command {
  constructor(client) {
    super(client, {
      name: "",
      aliases: [],
      description: "",
      usage: "",
      category: ""
    })
  }
  
  async run(client, message, args, colors) {
const inventory = client.fob.fetch(message.author.id + ".inventory")

let embed = new RichEmbed()
.setTitle("Inventory")
.setColor(colors.color)
.addField("Sword", inventory.sword ? inventory.sword.sword : "None", true)
.addField("Axes", inventory.axes ? inventory.axes.join("\n") : "None", true)
.addField("Gold", inventory.gold || 0)
.addField("Gems", "Check your gems with b!gems.")

return message.author.send(embed)
}
}
module.exports.help = {
  name: "inventory",
  aliases: ["inv"],
  description: "Shows your inventory.",
  usage: `b!inventory`,
  category: "FOB"
}