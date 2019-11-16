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
  let dm
  try {
    dm = message.author.createDM
    message.author.send(embed)   
  } catch(err) {
    return message.channel.send("Sorry, I could not send you a DM, and no refund request could be made.")
  }
  let filter = m => m.author.id == message.author.id
  let collector = dm.createMessageCollector(filter, {time: 60000})
  let stopped = true
  
  
}

}
module.exports.help = {
  name: "refund",
  aliases: [],
  description: "Submit a refund request.",
  usage: `b!refund`,
  category: "Info"
}