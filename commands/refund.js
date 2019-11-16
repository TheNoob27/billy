const db = require('quick.db')
const Discord = require('discord.js')

module.exports.run = async (client, message, args, colors) => {
let refund = {
  username: "",
  date: "",
  item: "",
  how: "",
  additional: ""
}

function username() {
  let embed = new Discord.RichEmbed()
  .setTitle("New Refund Request")
  .setColor(colors.help)
  .setDescription("Your refund request will be sent, but first supply some information. \n**What is the username of the account that lost the item?**")
  message.author.send()
}

}
module.exports.help = {
  name: "refund",
  aliases: [],
  description: "Submit a refund request.",
  usage: `b!refund`,
  category: "Info"
}